module Api
  module V1
    class EmployeesController < BaseController
      ORDERABLE_FIELDS = {
        "employee_id" => "employees.employee_id",
        "full_name" => "employees.full_name",
        "email" => "employees.email",
        "status" => "employees.status",
        "city" => "employees.city",
        "join_date" => "employees.join_date"
      }.freeze

      before_action :set_employee, only: %i[show update destroy terminate]

      def index
        authorize Employee

        pagy_record, employees = paginate_collection(filtered_employees)
        render_success(EmployeeBlueprint.render_as_hash(employees), meta: pagination_meta(pagy_record))
      end

      def show
        authorize @employee

        render_success(EmployeeBlueprint.render_as_hash(@employee))
      end

      def create
        authorize Employee

        employee = Employee.new(employee_params)

        if employee.save
          render_success(EmployeeBlueprint.render_as_hash(employee), status: :created)
        else
          render_error("Unable to save employee", errors: employee.errors.full_messages)
        end
      end

      def update
        authorize @employee

        if @employee.update(employee_params)
          render_success(EmployeeBlueprint.render_as_hash(@employee))
        else
          render_error("Unable to update employee", errors: @employee.errors.full_messages)
        end
      end

      def destroy
        authorize @employee

        @employee.discard!
        render_success({ id: @employee.id, discarded: true })
      end

      def terminate
        authorize @employee, :terminate?

        if @employee.update(status: :terminated, termination_date: Date.current)
          render_success(EmployeeBlueprint.render_as_hash(@employee))
        else
          render_error("Unable to terminate employee", errors: @employee.errors.full_messages)
        end
      end

      private

      def set_employee
        @employee = scoped_records(Employee.kept).find(params.expect(:id))
      end

      def filtered_employees
        scope = scoped_records(Employee.kept.includes(:departments))

        scope = filter_by_status(scope)
        scope = filter_by_department(scope)
        scope = filter_by_query(scope)
        apply_order(scope.distinct)
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(params.fetch(:order_by, "full_name"), ORDERABLE_FIELDS.fetch("full_name"))
        order_direction = normalized_order_direction(params[:order_dir])

        scope.order(Arel.sql("#{order_column} #{order_direction}, employees.id asc"))
      end

      def filter_by_status(scope)
        status = params.fetch(:status, nil)
        return scope unless status.present? && Employee.statuses.key?(status)

        scope.where(status: Employee.statuses.fetch(status))
      end

      def filter_by_department(scope)
        department_id = params.fetch(:department_id, nil)
        return scope if department_id.blank?

        scope.joins(:employee_departments).where(
          employee_departments: {
            department_id: department_id
          }
        )
      end

      def filter_by_query(scope)
        query_term = params.fetch(:q, nil)
        return scope if query_term.blank?

        query = "%#{query_term.strip}%"
        scope.where(
          "employees.employee_id ILIKE :query OR employees.full_name ILIKE :query OR employees.email ILIKE :query",
          query: query
        )
      end

      def employee_params
        params.expect(
          employee: %i[
            full_name
            gender
            birth_date
            join_date
            identity_number
            phone_number
            email
            address
            city
            postal_code
          ]
        )
      end
    end
  end
end
