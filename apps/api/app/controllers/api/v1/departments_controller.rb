module Api
  module V1
    class DepartmentsController < BaseController
      ORDERABLE_FIELDS = {
        "code" => "departments.code",
        "name" => "departments.name",
        "created_at" => "departments.created_at"
      }.freeze

      before_action :set_department, only: %i[show update destroy]

      def index
        authorize Department

        pagy_record, departments = paginate_collection(filtered_departments)
        render_success(DepartmentBlueprint.render_as_hash(departments), meta: pagination_meta(pagy_record))
      end

      def show
        authorize @department

        render_success(DepartmentBlueprint.render_as_hash(@department))
      end

      def create
        authorize Department

        department = Department.new(department_params)

        if department.save
          render_success(DepartmentBlueprint.render_as_hash(department), status: :created)
        else
          render_error("Unable to save department", errors: department.errors.full_messages)
        end
      end

      def update
        authorize @department

        if @department.update(department_params)
          render_success(DepartmentBlueprint.render_as_hash(@department))
        else
          render_error("Unable to update department", errors: @department.errors.full_messages)
        end
      end

      def destroy
        authorize @department

        @department.discard!
        render_success({ id: @department.id, discarded: true })
      end

      private

      def set_department
        @department = scoped_records(Department.kept).find(params.expect(:id))
      end

      def department_params
        params.expect(department: %i[code name])
      end

      def filtered_departments
        scope = scoped_records(Department.kept)
        scope = filter_by_query(scope)
        apply_order(scope)
      end

      def filter_by_query(scope)
        query_term = params.fetch(:q, nil)
        return scope if query_term.blank?

        query = "%#{query_term.strip}%"
        scope.where("departments.code ILIKE :query OR departments.name ILIKE :query", query: query)
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(params.fetch(:order_by, "name"), ORDERABLE_FIELDS.fetch("name"))
        order_direction = normalized_order_direction(params[:order_dir])

        scope.order(Arel.sql("#{order_column} #{order_direction}, departments.id asc"))
      end
    end
  end
end
