RSpec.describe "EmployeeDocuments upload flow" do
  describe "POST /api/v1/employees/:employee_id/employee_documents" do
    subject(:upload_document) do
      post "/api/v1/employees/#{employee.id}/employee_documents",
           params: {
             document_type: "national_id",
             expiry_date: nil,
             notes: "Identity card copy",
             file: file
           },
           headers: {
             "Authorization" => bearer_token_for(user)
           },
           as: :multipart_form
    end

    let(:user) do
      create(:user, password: "Password123!", password_confirmation: "Password123!")
    end

    let(:employee) { create(:employee) }

    let(:file) do
      Rack::Test::UploadedFile.new(
        StringIO.new("not a pdf"),
        "text/plain",
        original_filename: "identity.txt"
      )
    end

    it "returns an error for an unsupported file type" do
      upload_document

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["message"]).to eq("Unable to upload employee document")
    end
  end
end
