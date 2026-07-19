class EmployeeDocument < ApplicationRecord
  include Discard::Model
  include HumanAttribution

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
         profile_photo: 6,
         other: 99
       }

  belongs_to :employee
  belongs_to :uploaded_by, class_name: "User", inverse_of: :uploaded_documents

  validates :document_type, presence: true
  validates :file_sequence,
            numericality: { only_integer: true, greater_than: 0 },
            allow_nil: true
  validate :file_attached
  validate :file_content_type
  validate :file_size_within_limit

  audited

  def self.next_file_sequence_for(employee)
    employee.with_lock do
      relation = if respond_to?(:with_discarded)
                   with_discarded
                 else
                   all
                 end

      relation.where(employee_id: employee.id).maximum(:file_sequence).to_i + 1
    end
  end

  def storage_key_for(sequence:, original_filename:)
    extension = File.extname(original_filename.to_s).downcase
    extension = ".bin" if extension.blank?

    path_prefix = ENV.fetch("AWS_PATH", "").strip.gsub(%r{\A/+|/+$}, "")

    segments = []
    segments << path_prefix unless path_prefix.empty?
    segments << "documents"
    segments << employee.employee_id
    segments << "#{document_type}_#{sequence.to_s.rjust(3, '0')}#{extension}"

    segments.join("/")
  end

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
