class EmployeeDepartmentBlueprint < Blueprinter::Base
  identifier :id

  fields :assigned_date, :created_at, :updated_at

  association :department, blueprint: DepartmentBlueprint
end
