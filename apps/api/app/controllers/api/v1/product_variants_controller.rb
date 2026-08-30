module Api
  module V1
    class ProductVariantsController < BaseController
      before_action :set_product
      before_action :set_variant, only: %i[show update destroy price stock]

      def index
        authorize ProductVariant

        pagy_record, variants = paginate_collection(filtered_variants)
        render_success(ProductVariantBlueprint.render_as_hash(variants), meta: pagination_meta(pagy_record))
      end

      def show
        authorize @variant
        render_success(ProductVariantBlueprint.render_as_hash(@variant))
      end

      def create
        variant = @product.product_variants.new(variant_params)
        variant.company_id = @product.company_id
        authorize variant

        duplicate_error = duplicate_combination_error(variant, params.dig(:variant, :attributes))
        return render_error("Validation failed", errors: [duplicate_error], status: :unprocessable_content) if duplicate_error

        if variant.save
          upsert_attributes!(variant)
          render_success(ProductVariantBlueprint.render_as_hash(variant), status: :created)
        else
          render_error("Unable to save variant", errors: variant.errors.full_messages)
        end
      end

      def update
        authorize @variant

        duplicate_error = duplicate_combination_error(@variant, params.dig(:variant, :attributes), allow_self: true)
        return render_error("Validation failed", errors: [duplicate_error], status: :unprocessable_content) if duplicate_error

        if @variant.update(variant_params.except(:company_id, :product_id, :sku, :barcode))
          upsert_attributes!(@variant)
          render_success(ProductVariantBlueprint.render_as_hash(@variant))
        else
          render_error("Unable to update variant", errors: @variant.errors.full_messages)
        end
      end

      def destroy
        authorize @variant

        @variant.transaction do
          @variant.update!(status: :archived)
          @variant.discard!
        end

        render_success({ id: @variant.id, discarded: true })
      end

      def price
        authorize @variant

        payload = params.require(:price)
        new_price = payload[:value].to_d

        @variant.transaction do
          @variant.update!(current_price: new_price)
          @variant.variant_price_histories.create!(
            price: new_price,
            effective_from: payload[:effective_from].to_time,
            reason: payload[:reason].presence,
            changed_by_id: current_user&.id
          )
        end

        render_success(ProductVariantBlueprint.render_as_hash(@variant))
      end

      def stock
        authorize @variant

        payload = params.require(:stock)
        delta = payload[:delta].to_i
        previous_stock = @variant.current_stock.to_i
        new_stock = previous_stock + delta

        @variant.transaction do
          @variant.update!(current_stock: new_stock)
          @variant.variant_stock_ledgers.create!(
            delta: delta,
            event_type: payload[:event_type].to_s,
            reason: payload[:reason].presence,
            previous_stock: previous_stock,
            new_stock: new_stock
          )
        end

        render_success(ProductVariantBlueprint.render_as_hash(@variant))
      end

      private

      def set_product
        @product = Product.kept.find(params.expect(:product_id))
      end

      def set_variant
        @variant = @product.product_variants.find(params.expect(:id))
      end

      def filtered_variants
        scope = scoped_records(@product.product_variants.kept)
        scope = filter_by_query(scope)
        apply_order(scope)
      end

      def filter_by_query(scope)
        query_term = params.fetch(:q, nil)
        return scope if query_term.blank?

        query = "%#{query_term.strip}%"
        scope.left_joins(:product_variant_attributes)
             .where(
               "product_variants.sku ILIKE :query OR product_variants.barcode ILIKE :query OR product_variant_attributes.value ILIKE :query",
               query: query
             )
             .distinct
      end

      def apply_order(scope)
        order_by = params.fetch(:order_by, "created_at")
        order_dir = normalized_order_direction(params[:order_dir])

        scope.order(Arel.sql("#{order_by} #{order_dir}"))
      end

      def upsert_attributes!(variant)
        return unless params.dig(:variant, :attributes).present?

        variant.product_variant_attributes.delete_all

        params[:variant][:attributes].each do |attribute_payload|
          name = attribute_payload[:name].to_s.strip
          value = attribute_payload[:value].to_s.strip
          next if name.blank? || value.blank?

          variant.product_variant_attributes.create!(name: name, value: value)
        end
      end

      def duplicate_combination_error(variant, attributes, allow_self: false)
        return nil if attributes.blank?

        candidate = attributes.filter_map do |attribute_payload|
          name = attribute_payload[:name].to_s.strip
          value = attribute_payload[:value].to_s.strip
          next if name.blank? || value.blank?

          [ name.downcase, value.downcase ]
        end.sort

        return nil if candidate.empty?

        scope = variant.product.product_variants
        scope = scope.where.not(id: variant.id) unless allow_self

        scope.each do |existing_variant|
          existing_values = existing_variant.product_variant_attributes.map do |attribute|
            [ attribute.name.downcase, attribute.value.downcase ]
          end.sort

          return "variant combination already exists for this product" if candidate == existing_values
        end

        nil
      end

      def variant_params
        params.expect(variant: [
                        :sku,
                        :barcode,
                        :status,
                        :current_price,
                        :current_stock,
                        :company_id,
                        { attributes: [ :name, :value ] }
                      ])
      end
    end
  end
end
