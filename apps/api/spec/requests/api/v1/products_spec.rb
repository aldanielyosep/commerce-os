require "swagger_helper"

# rubocop:disable-next RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
RSpec.describe "Products" do
  let(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
  let(:company) { create(:company) }
  let(:other_company) { create(:company) }

  before do
    create(:company_assignment, user: user, company: company)
  end

  path "/api/v1/products" do
    get "List products" do
      tags "Products"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false
      parameter name: :q, in: :query, type: :string, required: false
      parameter name: :status, in: :query, type: :string, required: false
      parameter name: :order_by, in: :query, type: :string, required: false
      parameter name: :order_dir, in: :query, type: :string, required: false

      response "200", "products listed" do
        let!(:product_one) do
          create(:product, company: company, product_name: "Alpha Product", product_code: "P0000001")
        end
        let!(:product_two) do
          create(:product, company: company, product_name: "Beta Product", product_code: "P0000002", status: :inactive)
        end
        let!(:out_of_scope) { create(:product, company: other_company, product_name: "Gamma Product") }
        let(:q) { "Alpha" }
        let(:status) { "draft" }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body["data"].size).to eq(1)
          expect(body["data"].first["product_name"]).to eq("Alpha Product")
        end
      end

      response "401", "unauthorized" do
        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { nil }

        run_test! do |response|
          expect(response).to have_http_status(:unauthorized)
        end
      end
    end

    post "Create product" do
      tags "Products"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :product, in: :body, schema: {
        type: :object,
        properties: {
          product: {
            type: :object,
            properties: {
              company_id: { type: :integer },
              product_name: { type: :string },
              department_id: { type: :integer },
              category_id: { type: :integer },
              sub_category_id: { type: :integer },
              product_type_id: { type: :integer },
              short_description: { type: :string },
              description_richtext: { type: :object },
              status: { type: :string }
            },
            required: %w[company_id product_name department_id category_id sub_category_id product_type_id
                         short_description description_richtext status]
          }
        },
        required: ["product"]
      }

      response "201", "product created" do
        let!(:product_department) { create(:product_department) }
        let!(:category) { create(:category, product_department: product_department) }
        let!(:sub_category) { create(:sub_category, category: category) }
        let!(:product_type) { create(:product_type, sub_category: sub_category) }
        let(:product) do
          {
            product: {
              company_id: company.id,
              product_name: "Goodie Bag Dino",
              department_id: product_department.id,
              category_id: category.id,
              sub_category_id: sub_category.id,
              product_type_id: product_type.id,
              short_description: "Goodie bag premium",
              description_richtext: { type: "doc", content: [] },
              status: "draft"
            }
          }
        end

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body.dig("data", "product_code")).to be_present
        end
      end

      response "422", "rejects product code override" do
        let!(:product_department) { create(:product_department) }
        let!(:category) { create(:category, product_department: product_department) }
        let!(:sub_category) { create(:sub_category, category: category) }
        let!(:product_type) { create(:product_type, sub_category: sub_category) }
        let(:product) do
          {
            product: {
              company_id: company.id,
              product_name: "Goodie Bag Dino",
              product_code: "P9999999",
              department_id: product_department.id,
              category_id: category.id,
              sub_category_id: sub_category.id,
              product_type_id: product_type.id,
              short_description: "Goodie bag premium",
              description_richtext: { type: "doc", content: [] },
              status: "draft"
            }
          }
        end

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(response).to have_http_status(:unprocessable_content)
          expect(body["errors"]).to include("product_code is system-generated and cannot be changed")
        end
      end
    end
  end

  path "/api/v1/products/{id}" do
    parameter name: :id, in: :path, type: :string

    get "Show product" do
      tags "Products"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "product shown" do
        let!(:record) { create(:product, company: company) }
        let(:id) { record.id }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body.dig("data", "id")).to eq(record.id)
        end
      end

      response "403", "forbidden for out-of-scope company" do
        let!(:record) { create(:product, company: other_company) }
        let(:id) { record.id }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          expect(response).to have_http_status(:forbidden)
        end
      end
    end

    patch "Update product" do
      tags "Products"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :product, in: :body, schema: {
        type: :object,
        properties: {
          product: {
            type: :object,
            properties: {
              product_name: { type: :string },
              short_description: { type: :string },
              description_richtext: { type: :object },
              status: { type: :string }
            }
          }
        }
      }

      response "200", "product updated" do
        let!(:record) { create(:product, company: company, product_name: "Old Name") }
        let(:id) { record.id }
        let(:product) do
          {
            product: {
              product_name: "New Name",
              short_description: "Updated"
            }
          }
        end

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body).dig("data", "product_name")).to eq("New Name")
        end
      end
    end

    delete "Archive product" do
      tags "Products"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "product archived" do
        let!(:record) { create(:product, company: company) }
        let(:id) { record.id }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do
          expect(record.reload).to be_discarded
          expect(record.archived?).to be(true)
        end
      end
    end
  end

  path "/api/v1/products/{id}/restore" do
    parameter name: :id, in: :path, type: :string

    post "Restore product" do
      tags "Products"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "product restored" do
        let!(:record) do
          product = create(:product, company: company, status: :archived)
          product.discard!
          product
        end
        let(:id) { record.id }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do
          expect(record.reload).not_to be_discarded
          expect(record.draft?).to be(true)
        end
      end
    end
  end

  path "/api/v1/products/{id}/activate" do
    parameter name: :id, in: :path, type: :string

    post "Activate product" do
      tags "Products"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "422", "activation fails without cover image" do
        let!(:record) { create(:product, company: company, status: :draft) }
        let(:id) { record.id }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      response "200", "activation succeeds with cover image" do
        let!(:record) { create(:product, company: company, status: :draft) }
        let!(:cover) { create(:product_image, product: record, is_cover: true) }
        let(:id) { record.id }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do
          expect(record.reload.active?).to be(true)
        end
      end
    end
  end

  path "/api/v1/products/{id}/deactivate" do
    parameter name: :id, in: :path, type: :string

    post "Deactivate product" do
      tags "Products"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "deactivation succeeds" do
        let!(:record) { create(:product, company: company, status: :active) }
        let(:id) { record.id }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do
          expect(record.reload.inactive?).to be(true)
        end
      end
    end
  end
end
