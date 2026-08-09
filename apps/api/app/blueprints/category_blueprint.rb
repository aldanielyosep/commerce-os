class CategoryBlueprint < Blueprinter::Base
  identifier :id

  field :department_id, &:product_department_id

  fields :product_department_id, :name, :created_at, :updated_at
end
