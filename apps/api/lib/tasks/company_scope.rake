namespace :company_scope do
  desc "Backfill company assignments for admin users"
  task backfill_assignments: :environment do
    user_ids = ENV.fetch("USER_IDS", "").split(",").map(&:strip).reject(&:empty?).map(&:to_i).reject(&:zero?)
    company_ids = ENV.fetch("COMPANY_IDS", "").split(",").map(&:strip).reject(&:empty?).map(&:to_i).reject(&:zero?)
    role_in_company = ENV["ROLE_IN_COMPANY"]

    if user_ids.empty? && ENV["ALL_ADMINS"] != "true"
      abort "Set USER_IDS or use ALL_ADMINS=true"
    end

    if company_ids.empty?
      abort "Set COMPANY_IDS with at least one company id"
    end

    users = if ENV["ALL_ADMINS"] == "true"
      User.admin
    else
      User.where(id: user_ids)
    end

    companies = Company.kept.where(id: company_ids)
    missing_company_ids = company_ids - companies.pluck(:id)
    abort "Unknown COMPANY_IDS: #{missing_company_ids.join(', ')}" if missing_company_ids.any?

    created_count = 0
    updated_count = 0

    ActiveRecord::Base.transaction do
      users.find_each do |user|
        existing_by_company = user.company_assignments.kept.where(company_id: company_ids).index_by(&:company_id)

        company_ids.each do |company_id|
          assignment = existing_by_company[company_id] || user.company_assignments.new(company_id: company_id)
          assignment.role_in_company = role_in_company

          if assignment.new_record?
            assignment.save!
            created_count += 1
          elsif assignment.changed?
            assignment.save!
            updated_count += 1
          end
        end
      end
    end

    puts "Backfill complete: users=#{users.count} created=#{created_count} updated=#{updated_count}"
  end
end