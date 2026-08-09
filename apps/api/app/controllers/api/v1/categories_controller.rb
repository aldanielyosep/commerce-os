module Api
  module V1
    class CategoriesController < BaseController
      ORDERABLE_FIELDS = {
        "name" => :name,
        "created_at" => :created_at
      }.freeze

      before_action :set_category, only: %i[show update destroy]

      def index
        authorize Category

        pagy_record, categories = paginate_collection(filtered_categories)
        render_success(CategoryBlueprint.render_as_hash(categories), meta: pagination_meta(pagy_record))
      end

      def show
        authorize @category

        render_success(CategoryBlueprint.render_as_hash(@category))
      end

      def create
        authorize Category

        category = Category.new(category_params)
        if category.save
          render_success(CategoryBlueprint.render_as_hash(category), status: :created)
        else
          render_error("Unable to save category", errors: category.errors.full_messages)
        end
      end

      def update
        authorize @category

        if @category.update(category_params)
          render_success(CategoryBlueprint.render_as_hash(@category))
        else
          render_error("Unable to update category", errors: @category.errors.full_messages)
        end
      end

      def destroy
        authorize @category

        @category.discard!
        render_success({ id: @category.id, discarded: true })
      end

      private

      def set_category
        @category = scoped_records(Category.kept).find(params.expect(:id))
      end

      def category_params
        attrs = params.expect(category: %i[department_id product_department_id name])
        attrs[:product_department_id] = attrs.delete(:department_id) if attrs.key?(:department_id)

        attrs
      end

      def filtered_categories
        scope = scoped_records(Category.kept)
        scope = filter_by_department(scope)
        scope = filter_by_query(scope)
        apply_order(scope)
      end

      def filter_by_department(scope)
        department_id = params.fetch(:department_id, nil)
        return scope if department_id.blank?

        scope.where(product_department_id: department_id)
      end

      def filter_by_query(scope)
        query_term = params.fetch(:q, nil)
        return scope if query_term.blank?

        query = "%#{query_term.strip}%"
        scope.where("categories.name ILIKE :query", query: query)
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(params.fetch(:order_by, "name"), ORDERABLE_FIELDS.fetch("name"))
        order_direction = normalized_order_direction(params[:order_dir])

        scope.order(order_column => order_direction, id: :asc)
      end
    end
  end
end
