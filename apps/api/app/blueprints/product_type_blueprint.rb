class ProductTypeBlueprint < Blueprinter::Base
  identifier :id

  fields :sub_category_id, :name, :created_at, :updated_at
end
