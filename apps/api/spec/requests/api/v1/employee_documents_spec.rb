# rubocop:disable RSpec/MultipleMemoizedHelpers
require "swagger_helper"

RSpec.describe "Employee Documents" do
  path "/api/v1/employees/{employee_id}/employee_documents" do
    parameter name: :employee_id, in: :path, type: :string

    get "List employee documents" do
      tags "Employee Documents"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "documents listed" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:document) do
          create(:employee_document, employee: employee, uploaded_by: user, document_type: :national_id)
        end
        let(:employee_id) { employee.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"].size).to eq(1)
          expect(body["data"].first["document_type"]).to eq("national_id")
        end
      end
    end

    post "Upload employee document" do
      tags "Employee Documents"
      consumes "multipart/form-data"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: "employee_document[document_type]", in: :formData, type: :string
      parameter name: "employee_document[expiry_date]", in: :formData, type: :string, format: :date
      parameter name: "employee_document[notes]", in: :formData, type: :string
      parameter name: "employee_document[file]", in: :formData, type: :file

      response "201", "document uploaded" do
        # rubocop:disable RSpec/VariableName
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let(:employee_id) { employee.id }
        let(:'employee_document[document_type]') { "passport" }
        let(:'employee_document[expiry_date]') { nil }
        let(:'employee_document[notes]') { "Passport copy" }
        let(:'employee_document[file]') do
          Rack::Test::UploadedFile.new(StringIO.new("passport"), "application/pdf", original_filename: "passport.pdf")
        end
        # rubocop:enable RSpec/VariableName

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["document_type"]).to eq("passport")
          expect(body["data"]["filename"]).to eq("passport.pdf")
        end
      end
    end
  end

  path "/api/v1/employees/{employee_id}/employee_documents/{id}/download" do
    parameter name: :employee_id, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    get "Get signed download URL" do
      tags "Employee Documents"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "signed URL returned" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:document) { create(:employee_document, employee: employee, uploaded_by: user, document_type: :tax_id) }
        let(:employee_id) { employee.id }
        let(:id) { document.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["url"]).to be_present
          expect(body["data"]["expires_at"]).to be_present
        end
      end
    end
  end

  path "/api/v1/employees/{employee_id}/employee_documents/{id}/archive" do
    parameter name: :employee_id, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    patch "Archive employee document" do
      tags "Employee Documents"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "document archived" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:document) do
          create(:employee_document, employee: employee, uploaded_by: user, document_type: :employment_contract)
        end
        let(:employee_id) { employee.id }
        let(:id) { document.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["discarded"]).to be(true)
          expect(document.reload.discarded?).to be(true)
        end
      end
    end
  end
end

# rubocop:enable RSpec/MultipleMemoizedHelpers
