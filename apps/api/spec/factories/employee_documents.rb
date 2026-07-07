require "stringio"

FactoryBot.define do
  factory :employee_document do
    employee
    uploaded_by { association :user }

    document_type { :other }
    expiry_date { nil }
    notes { "Employment document" }

    after(:build) do |document|
      next if document.file.attached?

      document.file.attach(
        io: StringIO.new("document"),
        filename: "document.pdf",
        content_type: "application/pdf"
      )
    end
  end
end
