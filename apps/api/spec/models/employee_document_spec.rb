require "rails_helper"
require "stringio"

RSpec.describe EmployeeDocument do
  let(:employee) { create(:employee) }
  let(:uploader) { create(:user) }

  around do |example|
    original_aws_path = ENV["AWS_PATH"]
    example.run
    ENV["AWS_PATH"] = original_aws_path
  end

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

  describe ".next_file_sequence_for" do
    it "returns 1 when employee has no existing documents" do
      expect(described_class.next_file_sequence_for(employee)).to eq(1)
    end

    it "increments from the max existing sequence for the employee" do
      create(:employee_document, employee: employee, uploaded_by: uploader, file_sequence: 1)
      create(:employee_document, employee: employee, uploaded_by: uploader, file_sequence: 2)

      expect(described_class.next_file_sequence_for(employee)).to eq(3)
    end

    it "includes discarded documents when calculating next sequence" do
      first = create(:employee_document, employee: employee, uploaded_by: uploader, file_sequence: 1)
      first.discard!

      expect(described_class.next_file_sequence_for(employee)).to eq(2)
    end
  end

  describe "#storage_key_for" do
    it "builds key with aws path prefix, documents folder, employee_id, and zero-padded sequence" do
      ENV["AWS_PATH"] = "local"
      document = build_document(filename: "anything.pdf", content_type: "application/pdf")
      document.document_type = :national_id

      key = document.storage_key_for(sequence: 1, original_filename: "scan.PDF")

      expect(key).to eq("local/documents/#{employee.employee_id}/national_id_001.pdf")
    end

    it "omits aws path prefix when blank" do
      ENV["AWS_PATH"] = ""
      document = build_document(filename: "anything.pdf", content_type: "application/pdf")
      document.document_type = :passport

      key = document.storage_key_for(sequence: 12, original_filename: "passport.png")

      expect(key).to eq("documents/#{employee.employee_id}/passport_012.png")
    end

    it "falls back to .bin extension when original filename has no extension" do
      ENV["AWS_PATH"] = "local"
      document = build_document(filename: "anything.pdf", content_type: "application/pdf")

      key = document.storage_key_for(sequence: 3, original_filename: "no_extension")

      expect(key).to eq("local/documents/#{employee.employee_id}/other_003.bin")
    end
  end
end
