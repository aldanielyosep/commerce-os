module Api
  module V1
    class EmployeeDepartmentsController < BaseController
      before_action :set_employee
      before_action :set_employee_department, only: :destroy

      def index
        authorize EmployeeDepartment

        pagy_record, assignments = paginate_collection(
          @employee.employee_departments.kept.includes(:department).order(assigned_date: :desc)
        )
        render_success(EmployeeDepartmentBlueprint.render_as_hash(assignments), meta: pagination_meta(pagy_record))
      end

      def create
        authorize EmployeeDepartment

        assignment = @employee.employee_departments.new(employee_department_params)
        assignment.department = Department.kept.find(employee_department_params[:department_id])

        if assignment.save
          render_success(EmployeeDepartmentBlueprint.render_as_hash(assignment), status: :created)
        else
          render_error("Unable to assign department", errors: assignment.errors.full_messages)
        end
      end

      def destroy
        authorize @employee_department

        @employee_department.discard!
        render_success({ id: @employee_department.id, discarded: true })
      end

      private

      def set_employee
        @employee = Employee.kept.find(params.expect(:employee_id))
      end

      def set_employee_department
        @employee_department = @employee.employee_departments.kept.find(params.expect(:id))
      end

      def employee_department_params
        params.expect(employee_department: %i[department_id assigned_date])
      end
    end
  end
end
