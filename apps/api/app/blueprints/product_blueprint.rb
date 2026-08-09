class ProductBlueprint < Blueprinter::Base
  identifier :id

  fields :company_id,
         :product_code,
         :slug,
         :product_name,
         :department_id,
         :category_id,
         :sub_category_id,
         :product_type_id,
         :short_description,
         :description_richtext,
         :description_html,
         :description_text,
         :status,
         :created_at,
         :updated_at

  field :images_count do |product|
    product.product_images.kept.count
  end
end
