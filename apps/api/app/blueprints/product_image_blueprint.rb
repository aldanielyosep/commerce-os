class ProductImageBlueprint < Blueprinter::Base
  identifier :id

  fields :product_id,
         :alt_text,
         :is_cover,
         :position,
         :created_at,
         :updated_at

  field :image_url do |product_image|
    next nil unless product_image.image.attached?

    Rails.application.routes.url_helpers.rails_blob_path(product_image.image, only_path: true)
  end
end
