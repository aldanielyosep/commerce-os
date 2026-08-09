module Api
  module V1
    class SubCategoriesController < BaseController
      ORDERABLE_FIELDS = {
        "name" => :name,
        "created_at" => :created_at
      }.freeze

      before_action :set_sub_category, only: %i[show update destroy]

      def index
        authorize SubCategory

        pagy_record, sub_categories = paginate_collection(filtered_sub_categories)
        render_success(SubCategoryBlueprint.render_as_hash(sub_categories), meta: pagination_meta(pagy_record))
      end

      def show
        authorize @sub_category

        render_success(SubCategoryBlueprint.render_as_hash(@sub_category))
      end

      def create
        authorize SubCategory

        sub_category = SubCategory.new(sub_category_params)
        if sub_category.save
          render_success(SubCategoryBlueprint.render_as_hash(sub_category), status: :created)
        else
          render_error("Unable to save sub category", errors: sub_category.errors.full_messages)
        end
      end

      def update
        authorize @sub_category

        if @sub_category.update(sub_category_params)
          render_success(SubCategoryBlueprint.render_as_hash(@sub_category))
        else
          render_error("Unable to update sub category", errors: @sub_category.errors.full_messages)
        end
      end

      def destroy
        authorize @sub_category

        @sub_category.discard!
        render_success({ id: @sub_category.id, discarded: true })
      end

      private

      def set_sub_category
        @sub_category = scoped_records(SubCategory.kept).find(params.expect(:id))
      end

      def sub_category_params
        params.expect(sub_category: %i[category_id name])
      end

      def filtered_sub_categories
        scope = scoped_records(SubCategory.kept)
        scope = filter_by_category(scope)
        scope = filter_by_query(scope)
        apply_order(scope)
      end

      def filter_by_category(scope)
        category_id = params.fetch(:category_id, nil)
        return scope if category_id.blank?

        scope.where(category_id: category_id)
      end

      def filter_by_query(scope)
        query_term = params.fetch(:q, nil)
        return scope if query_term.blank?

        query = "%#{query_term.strip}%"
        scope.where("sub_categories.name ILIKE :query", query: query)
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(params.fetch(:order_by, "name"), ORDERABLE_FIELDS.fetch("name"))
        order_direction = normalized_order_direction(params[:order_dir])

        scope.order(order_column => order_direction, id: :asc)
      end
    end
  end
end
