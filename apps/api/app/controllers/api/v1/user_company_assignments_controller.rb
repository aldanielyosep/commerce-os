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

      def destroy
        @company_assignment.discard!
        render_success({ id: @company_assignment.id, discarded: true })
      end

      private

      def authorize_company_assignment_access!
        authorize CompanyAssignment
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
    end
  end
end