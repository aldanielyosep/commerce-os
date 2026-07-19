module Api
  module V1
    class UserCompanyAssignmentsController < BaseController
      ORDERABLE_FIELDS = {
        "id" => :id,
        "role_in_company" => :role_in_company,
        "created_at" => :created_at
      }.freeze

      before_action :authorize_company_assignment_access!
      before_action :set_user
      before_action :set_company_assignment, only: :destroy

      def index
        pagy_record, assignments = paginate_collection(apply_order(@user.company_assignments.kept.includes(:company)))
        render_success(CompanyAssignmentBlueprint.render_as_hash(assignments), meta: pagination_meta(pagy_record))
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
        Array(raw_ids).map(&:to_i).reject(&:zero?).uniq
      end

      def upsert_assignments!(company_ids:, role_in_company:)
        created_count = 0
        updated_count = 0
        existing_by_company = @user.company_assignments.kept.where(company_id: company_ids).index_by(&:company_id)

        ActiveRecord::Base.transaction do
          company_ids.each do |company_id|
            created, updated = upsert_single_assignment!(
              existing_by_company: existing_by_company,
              company_id: company_id,
              role_in_company: role_in_company
            )
            if created
              created_count += 1
            elsif updated
              updated_count += 1
            end
          end
        end

        assignment_summary(created_count: created_count, updated_count: updated_count)
      end

      def upsert_single_assignment!(existing_by_company:, company_id:, role_in_company:)
        assignment = existing_by_company[company_id] || @user.company_assignments.new(company_id: company_id)
        assignment.role_in_company = role_in_company

        if assignment.new_record?
          assignment.save!
          return [true, false]
        end

        if assignment.changed?
          assignment.save!
          return [false, true]
        end

        [false, false]
      end

      def assignment_summary(created_count:, updated_count:)
        {
          user_id: @user.id,
          created_count: created_count,
          updated_count: updated_count,
          total_assigned_companies: @user.company_assignments.kept.count
        }
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(params.fetch(:order_by, "id"), ORDERABLE_FIELDS.fetch("id"))
        order_direction = normalized_order_direction(params[:order_dir])

        scope.order(order_column => order_direction, id: :asc)
      end
    end
  end
end
