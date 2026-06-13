class EmployeeDocument < ApplicationRecord
  include Discard::Model

  has_one_attached :file

  ALLOWED_CONTENT_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ].freeze

  enum :document_type,
       {
         national_id: 0,
         passport: 1,
         driver_license: 2,
         tax_id: 3,
         employment_contract: 4,
         education_certificate: 5,
         other: 6
       }

  belongs_to :employee
  belongs_to :uploaded_by, class_name: "User"

  validates :document_type, presence: true
  validate :file_attached
  validate :file_content_type
  validate :file_size_within_limit

  audited

  private

  def file_attached
    errors.add(:file, "must be attached") unless file.attached?
  end

  def file_content_type
    return unless file.attached?

    errors.add(:file, "must be a PDF, JPG, PNG, or DOCX") unless ALLOWED_CONTENT_TYPES.include?(file.blob.content_type)
  end

  def file_size_within_limit
    return unless file.attached?

    errors.add(:file, "must be smaller than 20 MB") if file.blob.byte_size > 20.megabytes
  end
end
