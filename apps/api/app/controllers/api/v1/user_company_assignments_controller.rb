module Api
  module V1
    class UserCompanyAssignmentsController < BaseController
      before_action :authorize_company_assignment_access!
      before_action :set_user
      before_action :set_company_assignment, only: :destroy

      def index
        assignments = @user.company_assignments.kept.includes(:company).order(:id)
        render_success(CompanyAssignmentBlueprint.render_as_hash(assignments))
      end

      def create
        assignment = @user.company_assignments.new(company_assignment_params)

        if assignment.save
          render_success(CompanyAssignmentBlueprint.render_as_hash(assignment), status: :created)
        else
          render_error("Unable to assign company", errors: assignment.errors.full_messages)
        end
      end

      def bulk_upsert
        payload = bulk_upsert_params
        company_ids = normalize_company_ids(payload[:company_ids])

        if company_ids.empty?
          return render_error("Unable to assign company", errors: ["company_ids must contain at least one id"])
        end

        companies = Company.kept.where(id: company_ids).index_by(&:id)
        missing_ids = company_ids - companies.keys
        if missing_ids.any?
          return render_error("Unable to assign company", errors: ["Unknown company ids: #{missing_ids.join(', ')}"])
        end

        summary = upsert_assignments!(company_ids: company_ids, role_in_company: payload[:role_in_company])
        render_success(summary)
      rescue ActiveRecord::RecordInvalid => e
        render_error("Unable to assign company", errors: e.record.errors.full_messages)
      end

      def destroy
        @company_assignment.discard!
        render_success({ id: @company_assignment.id, discarded: true })
      end

      private

      def authorize_company_assignment_access!
        authorize CompanyAssignment, "#{action_name}?"
      end

      def set_user
        @user = User.find(params.expect(:user_id))
      end

      def set_company_assignment
        @company_assignment = @user.company_assignments.kept.find(params.expect(:id))
      end

      def company_assignment_params
        params.expect(company_assignment: %i[company_id role_in_company])
      end

      def bulk_upsert_params
        params.expect(company_assignment: [ :role_in_company, { company_ids: [] } ])
      end

      def normalize_company_ids(raw_ids)
        Array(raw_ids).map { |id| id.to_i }.reject(&:zero?).uniq
      end

      def upsert_assignments!(company_ids:, role_in_company:)
        created_count = 0
        updated_count = 0

        ActiveRecord::Base.transaction do
          existing_by_company = @user.company_assignments.kept.where(company_id: company_ids).index_by(&:company_id)

          company_ids.each do |company_id|
            assignment = existing_by_company[company_id] || @user.company_assignments.new(company_id: company_id)

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

        {
          user_id: @user.id,
          created_count: created_count,
          updated_count: updated_count,
          total_assigned_companies: @user.company_assignments.kept.count
        }
      end
    end
  end
end