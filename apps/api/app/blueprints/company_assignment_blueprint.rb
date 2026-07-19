class CompanyAssignmentBlueprint < Blueprinter::Base
  identifier :id

  fields :user_id,
         :company_id,
         :role_in_company,
         :created_at,
         :updated_at

  field :company do |assignment|
    {
      id: assignment.company.id,
      code: assignment.company.code,
      name: assignment.company.name
    }
  end
end