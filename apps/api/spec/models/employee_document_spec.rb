require "rails_helper"
require "stringio"

RSpec.describe EmployeeDocument do
  let(:employee) { create(:employee) }
  let(:uploader) { create(:user) }

  def build_document(filename:, content_type:, size: 10)
    doc = described_class.new(employee: employee, uploaded_by: uploader, document_type: :other)
    doc.file.attach(
      io: StringIO.new("a" * size),
      filename: filename,
      content_type: content_type
    )
    doc
  end

  it "is valid with an allowed attachment" do
    document = build_document(filename: "id-card.png", content_type: "image/png")

    expect(document).to be_valid
  end

  it "requires an attached file" do
    document = described_class.new(employee: employee, uploaded_by: uploader, document_type: :other)

    expect(document).not_to be_valid
    expect(document.errors[:file]).to include("must be attached")
  end

  it "rejects unsupported content type" do
    document = build_document(filename: "script.exe", content_type: "application/octet-stream")

    expect(document).not_to be_valid
    expect(document.errors[:file]).to include("must be a PDF, JPG, PNG, or DOCX")
  end

  it "rejects files larger than 20 MB" do
    document = build_document(filename: "large.pdf", content_type: "application/pdf", size: 20.megabytes + 1)

    expect(document).not_to be_valid
    expect(document.errors[:file]).to include("must be smaller than 20 MB")
  end
end
