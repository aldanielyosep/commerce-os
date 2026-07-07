class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :email,
         :username,
         :role,
         :status,
         :employee_id,
         :reset_password_sent_at,
         :created_at,
         :updated_at
end
