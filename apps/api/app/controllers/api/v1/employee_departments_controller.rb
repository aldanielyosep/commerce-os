module Api
  module V1
    class EmployeeDepartmentsController < BaseController
      ORDERABLE_FIELDS = {
        "assigned_date" => :assigned_date,
        "created_at" => :created_at
      }.freeze

      before_action :set_employee
      before_action :set_employee_department, only: :destroy

      def index
        authorize EmployeeDepartment

        pagy_record, assignments = paginate_collection(
          apply_order(@employee.employee_departments.kept.includes(:department))
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

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(
          params.fetch(:order_by, "assigned_date"),
          ORDERABLE_FIELDS.fetch("assigned_date")
        )
        order_direction = params.key?(:order_dir) ? normalized_order_direction(params[:order_dir]) : :desc

        scope.order(order_column => order_direction, id: :asc)
      end
    end
  end
end
