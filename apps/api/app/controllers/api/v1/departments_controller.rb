module Api
  module V1
    class DepartmentsController < BaseController
      before_action :set_department, only: %i[show update destroy]

      def index
        authorize Department

        pagy_record, departments = paginate_collection(scoped_records(Department.kept).order(:name))
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
    end
  end
end
