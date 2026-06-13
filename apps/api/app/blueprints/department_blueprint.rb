class DepartmentBlueprint < Blueprinter::Base
  identifier :id

  fields :code, :name, :created_at, :updated_at
end
