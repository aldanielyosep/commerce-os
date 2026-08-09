module Api
  module V1
    class ProductDepartmentsController < BaseController
      ORDERABLE_FIELDS = {
        "code" => :code,
        "name" => :name,
        "created_at" => :created_at
      }.freeze

      before_action :set_product_department, only: %i[show update destroy]

      def index
        authorize ProductDepartment

        pagy_record, product_departments = paginate_collection(filtered_product_departments)
        render_success(ProductDepartmentBlueprint.render_as_hash(product_departments),
                       meta: pagination_meta(pagy_record))
      end

      def show
        authorize @product_department

        render_success(ProductDepartmentBlueprint.render_as_hash(@product_department))
      end

      def create
        authorize ProductDepartment

        product_department = ProductDepartment.new(product_department_params)

        if product_department.save
          render_success(ProductDepartmentBlueprint.render_as_hash(product_department), status: :created)
        else
          render_error("Unable to save product department", errors: product_department.errors.full_messages)
        end
      end

      def update
        authorize @product_department

        if @product_department.update(product_department_params)
          render_success(ProductDepartmentBlueprint.render_as_hash(@product_department))
        else
          render_error("Unable to update product department", errors: @product_department.errors.full_messages)
        end
      end

      def destroy
        authorize @product_department

        @product_department.discard!
        render_success({ id: @product_department.id, discarded: true })
      end

      private

      def set_product_department
        @product_department = scoped_records(ProductDepartment.kept).find(params.expect(:id))
      end

      def product_department_params
        params.expect(product_department: %i[code name])
      end

      def filtered_product_departments
        scope = scoped_records(ProductDepartment.kept)
        scope = filter_by_query(scope)
        apply_order(scope)
      end

      def filter_by_query(scope)
        query_term = params.fetch(:q, nil)
        return scope if query_term.blank?

        query = "%#{query_term.strip}%"
        scope.where("product_departments.code ILIKE :query OR product_departments.name ILIKE :query", query: query)
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(params.fetch(:order_by, "name"), ORDERABLE_FIELDS.fetch("name"))
        order_direction = normalized_order_direction(params[:order_dir])

        scope.order(order_column => order_direction, id: :asc)
      end
    end
  end
end
