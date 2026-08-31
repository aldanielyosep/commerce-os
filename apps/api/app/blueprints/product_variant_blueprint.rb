class ProductVariantBlueprint < Blueprinter::Base
  identifier :id

  fields :product_id,
         :company_id,
         :sku,
         :barcode,
         :status,
         :current_price,
         :current_stock,
         :created_at,
         :updated_at

  field :attributes do |variant|
    variant.product_variant_attributes.order(:id).map do |attribute|
      { name: attribute.name, value: attribute.value }
    end
  end
end
