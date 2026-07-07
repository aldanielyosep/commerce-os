class EmployeeDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :document_type,
         :expiry_date,
         :notes,
         :created_at,
         :updated_at

  field :uploaded_by_id

  field :filename do |record|
    record.file.filename.to_s if record.file.attached?
  end

  field :content_type do |record|
    record.file.content_type if record.file.attached?
  end

  field :byte_size do |record|
    record.file.byte_size if record.file.attached?
  end
end
