module Api
  module V1
    class ProductsController < BaseController
      ORDERABLE_FIELDS = {
        "created_at" => :created_at,
        "product_name" => :product_name,
        "product_code" => :product_code,
        "status" => :status
      }.freeze

      before_action :set_product, only: %i[show update destroy activate deactivate]
      before_action :set_product_with_discarded, only: %i[restore]

      def index
        authorize Product

        pagy_record, products = paginate_collection(filtered_products)
        render_success(ProductBlueprint.render_as_hash(products), meta: pagination_meta(pagy_record))
      end

      def show
        authorize @product

        render_success(ProductBlueprint.render_as_hash(@product))
      end

      def create
        product = Product.new(product_params)
        authorize product

        if product_code_override_payload?
          return render_error(
            "Validation failed",
            errors: [ "product_code is system-generated and cannot be changed" ]
          )
        end

        if product.save
          render_success(ProductBlueprint.render_as_hash(product), status: :created)
        else
          render_error("Unable to save product", errors: product.errors.full_messages)
        end
      end

      def update
        authorize @product

        if product_code_override_payload?
          return render_error(
            "Validation failed",
            errors: [ "product_code is system-generated and cannot be changed" ]
          )
        end

        if @product.update(product_params.except(:company_id))
          render_success(ProductBlueprint.render_as_hash(@product))
        else
          render_error("Unable to update product", errors: @product.errors.full_messages)
        end
      end

      def destroy
        authorize @product

        @product.transaction do
          @product.update!(status: :archived)
          @product.discard!
        end

        render_success({ id: @product.id, discarded: true })
      end

      def restore
        authorize @product, :restore?

        @product.transaction do
          @product.undiscard
          @product.update!(status: :draft)
        end

        render_success(ProductBlueprint.render_as_hash(@product))
      end

      def activate
        authorize @product, :activate?

        if @product.activate!
          render_success(ProductBlueprint.render_as_hash(@product))
        else
          render_error("Unable to activate product", errors: @product.errors.full_messages)
        end
      end

      def deactivate
        authorize @product, :deactivate?

        if @product.deactivate!
          render_success(ProductBlueprint.render_as_hash(@product))
        else
          render_error("Unable to deactivate product", errors: @product.errors.full_messages)
        end
      end

      private

      def set_product
        @product = Product.kept.includes(:product_images).find(params.expect(:id))
      end

      def set_product_with_discarded
        @product = Product.with_discarded.includes(:product_images).find(params.expect(:id))
      end

      def filtered_products
        scope = scoped_records(Product.kept.includes(:product_images))
        scope = filter_by_status(scope)
        scope = filter_by_query(scope)
        apply_order(scope)
      end

      def filter_by_status(scope)
        status = params.fetch(:status, nil)
        return scope unless status.present? && Product.statuses.key?(status)

        scope.where(status: Product.statuses.fetch(status))
      end

      def filter_by_query(scope)
        query_term = params.fetch(:q, nil)
        return scope if query_term.blank?

        query = "%#{query_term.strip}%"
        scope.where(
          "products.product_code ILIKE :query OR products.product_name ILIKE :query",
          query: query
        )
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(
          params.fetch(:order_by, "created_at"),
          ORDERABLE_FIELDS.fetch("created_at")
        )
        order_direction = normalized_order_direction(params[:order_dir])

        scope.order(order_column => order_direction, id: :asc)
      end

      def product_params
        params.expect(
          product: %i[
            company_id
            product_code
            product_name
            department_id
            category_id
            sub_category_id
            product_type_id
            short_description
            status
          ] + [ :description_richtext ]
        )
      end

      def product_code_override_payload?
        product_params.key?(:product_code)
      rescue ActionController::ParameterMissing
        false
      end
    end
  end
end
