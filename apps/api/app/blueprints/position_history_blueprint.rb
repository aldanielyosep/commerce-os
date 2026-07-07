class PositionHistoryBlueprint < Blueprinter::Base
  identifier :id

  fields :position,
         :effective_date,
         :notes,
         :created_at,
         :updated_at

  association :department, blueprint: DepartmentBlueprint
end
