module Api
  module V1
    class ProductTypesController < BaseController
      ORDERABLE_FIELDS = {
        "name" => :name,
        "created_at" => :created_at
      }.freeze

      before_action :set_product_type, only: %i[show update destroy]

      def index
        authorize ProductType

        pagy_record, product_types = paginate_collection(filtered_product_types)
        render_success(ProductTypeBlueprint.render_as_hash(product_types), meta: pagination_meta(pagy_record))
      end

      def show
        authorize @product_type

        render_success(ProductTypeBlueprint.render_as_hash(@product_type))
      end

      def create
        authorize ProductType

        product_type = ProductType.new(product_type_params)
        if product_type.save
          render_success(ProductTypeBlueprint.render_as_hash(product_type), status: :created)
        else
          render_error("Unable to save product type", errors: product_type.errors.full_messages)
        end
      end

      def update
        authorize @product_type

        if @product_type.update(product_type_params)
          render_success(ProductTypeBlueprint.render_as_hash(@product_type))
        else
          render_error("Unable to update product type", errors: @product_type.errors.full_messages)
        end
      end

      def destroy
        authorize @product_type

        @product_type.discard!
        render_success({ id: @product_type.id, discarded: true })
      end

      private

      def set_product_type
        @product_type = scoped_records(ProductType.kept).find(params.expect(:id))
      end

      def product_type_params
        params.expect(product_type: %i[sub_category_id name])
      end

      def filtered_product_types
        scope = scoped_records(ProductType.kept)
        scope = filter_by_sub_category(scope)
        scope = filter_by_query(scope)
        apply_order(scope)
      end

      def filter_by_sub_category(scope)
        sub_category_id = params.fetch(:sub_category_id, nil)
        return scope if sub_category_id.blank?

        scope.where(sub_category_id: sub_category_id)
      end

      def filter_by_query(scope)
        query_term = params.fetch(:q, nil)
        return scope if query_term.blank?

        query = "%#{query_term.strip}%"
        scope.where("product_types.name ILIKE :query", query: query)
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(params.fetch(:order_by, "name"), ORDERABLE_FIELDS.fetch("name"))
        order_direction = normalized_order_direction(params[:order_dir])

        scope.order(order_column => order_direction, id: :asc)
      end
    end
  end
end
