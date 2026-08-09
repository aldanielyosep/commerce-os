require "swagger_helper"
require "stringio"

# rubocop:disable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
RSpec.describe "Product Images" do
  let(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
  let(:company) { create(:company) }
  let(:product) { create(:product, company: company) }

  before do
    create(:company_assignment, user: user, company: company)
  end

  path "/api/v1/products/{product_id}/images" do
    parameter name: :product_id, in: :path, type: :string

    get "List product images" do
      tags "Product Images"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "images listed" do
        let(:product_id) { product.id }
        let!(:image) { create(:product_image, product: product, is_cover: true) }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body["data"].size).to eq(1)
        end
      end
    end

    post "Upload product image" do
      tags "Product Images"
      consumes "multipart/form-data"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :image, in: :formData, type: :file
      parameter name: :alt_text, in: :formData, type: :string, required: false
      parameter name: :is_cover, in: :formData, type: :boolean, required: false
      parameter name: :position, in: :formData, type: :integer, required: false

      response "201", "image uploaded" do
        let(:product_id) { product.id }
        let(:image) do
          Rack::Test::UploadedFile.new(
            StringIO.new("fake png content"),
            "image/png",
            original_filename: "product.png"
          )
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          expect(response).to have_http_status(:created)
          expect(JSON.parse(response.body).dig("data", "id")).to be_present
        end
      end

      response "422", "invalid extension" do
        let(:product_id) { product.id }
        let(:image) do
          Rack::Test::UploadedFile.new(
            StringIO.new("invalid content"),
            "text/plain",
            original_filename: "file.txt"
          )
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          expect(response).to have_http_status(:unprocessable_content)
          expect(JSON.parse(response.body)["errors"].join(" ")).to include("extension is not allowed")
        end
      end
    end
  end

  path "/api/v1/products/{product_id}/images/{id}" do
    parameter name: :product_id, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    patch "Update product image" do
      tags "Product Images"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :product_image, in: :body, schema: {
        type: :object,
        properties: {
          product_image: {
            type: :object,
            properties: {
              alt_text: { type: :string },
              is_cover: { type: :boolean },
              position: { type: :integer }
            }
          }
        }
      }

      response "200", "image updated" do
        let!(:record) { create(:product_image, product: product, is_cover: false, position: 2) }
        let(:product_id) { product.id }
        let(:id) { record.id }
        let(:product_image) do
          {
            product_image: {
              alt_text: "Updated alt",
              is_cover: true,
              position: 1
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body.dig("data", "alt_text")).to eq("Updated alt")
          expect(record.reload.is_cover).to be(true)
        end
      end
    end

    delete "Delete product image" do
      tags "Product Images"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "image deleted" do
        let!(:record) { create(:product_image, product: product) }
        let(:product_id) { product.id }
        let(:id) { record.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do
          expect(record.reload).to be_discarded
        end
      end
    end
  end
end
# rubocop:enable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
