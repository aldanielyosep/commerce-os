module Api
  module V1
    class ProductImagesController < BaseController
      ORDERABLE_FIELDS = {
        "position" => :position,
        "created_at" => :created_at
      }.freeze

      before_action :set_product
      before_action :set_product_image, only: %i[update destroy]

      def index
        authorize @product, :show?

        pagy_record, images = paginate_collection(
          apply_order(@product.product_images.kept.includes(image_attachment: :blob))
        )
        render_success(ProductImageBlueprint.render_as_hash(images), meta: pagination_meta(pagy_record))
      end

      def create
        authorize @product, :update?

        image = @product.product_images.new(product_image_attributes)

        blob = attach_image_blob(image)

        if image.save
          render_success(ProductImageBlueprint.render_as_hash(image), status: :created)
        else
          blob&.purge_later
          render_error("Validation failed", errors: image.errors.full_messages)
        end
      end

      def update
        authorize @product, :update?

        if @product_image.update(product_image_attributes)
          render_success(ProductImageBlueprint.render_as_hash(@product_image))
        else
          render_error("Validation failed", errors: @product_image.errors.full_messages)
        end
      end

      def destroy
        authorize @product, :update?

        @product_image.discard!
        render_success({ id: @product_image.id, discarded: true })
      end

      private

      def set_product
        @product = Product.kept.find(params.expect(:product_id))
      end

      def set_product_image
        @product_image = @product.product_images.kept.find(params.expect(:id))
      end

      def product_image_attributes
        if params[:product_image].present?
          return params.expect(product_image: %i[alt_text is_cover position]).to_h
        end

        ActionController::Parameters.new(
          alt_text: params[:alt_text],
          is_cover: params[:is_cover],
          position: params[:position]
        ).permit(:alt_text, :is_cover, :position).to_h
      end

      def product_image_file
        if params[:product_image].present?
          file = params.expect(product_image: %i[image]).fetch(:image, nil)
          return file if file.present?
        end

        file = params[:image]
        return file if file.present?

        raise ActionController::ParameterMissing, :image
      end

      def attach_image_blob(image)
        uploaded = product_image_file

        blob = ActiveStorage::Blob.create_and_upload!(
          io: uploaded,
          filename: uploaded.original_filename,
          content_type: uploaded.content_type,
          key: storage_key_for(image, uploaded.original_filename)
        )

        image.image.attach(blob)
        blob
      end

      def storage_key_for(image, original_filename)
        extension = File.extname(original_filename.to_s).downcase
        extension = ".bin" if extension.blank?

        path_prefix = ENV.fetch("AWS_PATH", "").strip.gsub(%r{\A/+|/+$}, "")

        segments = []
        segments << path_prefix unless path_prefix.empty?
        segments << "products"
        segments << image.product.company_id.to_s
        segments << image.product.product_code
        segments << "img_#{SecureRandom.hex(6)}#{extension}"
        segments.join("/")
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(params.fetch(:order_by, "position"), ORDERABLE_FIELDS.fetch("position"))
        order_direction = normalized_order_direction(params[:order_dir])

        scope.order(order_column => order_direction, id: :asc)
      end
    end
  end
end
