class SubCategoryBlueprint < Blueprinter::Base
  identifier :id

  fields :category_id, :name, :created_at, :updated_at
end
