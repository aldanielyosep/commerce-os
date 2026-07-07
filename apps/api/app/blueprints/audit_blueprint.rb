class AuditBlueprint < Blueprinter::Base
  identifier :id

  fields :action,
         :auditable_type,
         :auditable_id,
         :associated_type,
         :associated_id,
         :user_id,
         :user_type,
         :username,
         :version,
         :request_uuid,
         :remote_address,
         :comment,
         :audited_changes,
         :created_at
end
