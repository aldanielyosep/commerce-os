module CompanyScopeTasks
  module_function

  def parse_ids(key)
    ENV.fetch(key, "").split(",").map(&:strip).reject(&:empty?).map(&:to_i).reject(&:zero?)
  end

  def validate_inputs!(user_ids, company_ids)
    abort "Set USER_IDS or use ALL_ADMINS=true" if user_ids.empty? && ENV["ALL_ADMINS"] != "true"
    abort "Set COMPANY_IDS with at least one company id" if company_ids.empty?
  end

  def target_users(user_ids)
    return User.admin if ENV["ALL_ADMINS"] == "true"

    User.where(id: user_ids)
  end

  def validate_companies!(company_ids)
    companies = Company.kept.where(id: company_ids)
    missing_company_ids = company_ids - companies.pluck(:id)
    abort "Unknown COMPANY_IDS: #{missing_company_ids.join(', ')}" if missing_company_ids.any?
  end

  def backfill!(users:, company_ids:, role_in_company:)
    created_count = 0
    updated_count = 0

    ActiveRecord::Base.transaction do
      users.find_each do |user|
        created, updated = backfill_user_assignments!(
          user: user,
          company_ids: company_ids,
          role_in_company: role_in_company
        )
        created_count += created
        updated_count += updated
      end
    end

    [created_count, updated_count]
  end

  def backfill_user_assignments!(user:, company_ids:, role_in_company:)
    created_count = 0
    updated_count = 0
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

    [created_count, updated_count]
  end
end

namespace :company_scope do
  desc "Backfill company assignments for admin users"
  task backfill_assignments: :environment do
    user_ids = CompanyScopeTasks.parse_ids("USER_IDS")
    company_ids = CompanyScopeTasks.parse_ids("COMPANY_IDS")
    role_in_company = ENV.fetch("ROLE_IN_COMPANY", nil)

    CompanyScopeTasks.validate_inputs!(user_ids, company_ids)
    users = CompanyScopeTasks.target_users(user_ids)
    CompanyScopeTasks.validate_companies!(company_ids)

    created_count, updated_count = CompanyScopeTasks.backfill!(
      users: users,
      company_ids: company_ids,
      role_in_company: role_in_company
    )

    puts "Backfill complete: users=#{users.count} created=#{created_count} updated=#{updated_count}"
  end
end
