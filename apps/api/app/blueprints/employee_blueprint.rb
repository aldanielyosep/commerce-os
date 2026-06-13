class EmployeeBlueprint < Blueprinter::Base
  identifier :id

  fields :employee_id,
         :full_name,
         :gender,
         :birth_date,
         :join_date,
         :status,
         :identity_number,
         :phone_number,
         :email,
         :address,
         :city,
         :postal_code,
         :termination_date,
         :created_at,
         :updated_at

  association :departments, blueprint: DepartmentBlueprint
end
