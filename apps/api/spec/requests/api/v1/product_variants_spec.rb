require "swagger_helper"

RSpec.describe "Product Variants" do
  let(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
  let(:company) { create(:company) }
  let(:other_company) { create(:company) }
  let(:product) { create(:product, company: company) }

  before do
    create(:company_assignment, user: user, company: company)
  end

  path "/api/v1/products/{product_id}/variants" do
    parameter name: :product_id, in: :path, type: :string

    get "List product variants" do
      tags "Product Variants"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "variants listed" do
        let!(:variant_one) { create(:product_variant, product: product, sku: "SKU-001", barcode: "BC-001") }
        let!(:variant_two) { create(:product_variant, product: product, sku: "SKU-002", barcode: "BC-002") }
        let(:Authorization) { bearer_token_for(user) }
        let(:product_id) { product.id }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(response).to have_http_status(:ok)
          expect(body["success"]).to be(true)
          expect(body["data"].size).to eq(2)
        end
      end
    end

    post "Create product variant" do
      tags "Product Variants"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :variant, in: :body, schema: {
        type: :object,
        properties: {
          variant: {
            type: :object,
            properties: {
              sku: { type: :string },
              barcode: { type: :string },
              status: { type: :string },
              current_price: { type: :integer },
              current_stock: { type: :integer },
              attributes: {
                type: :array,
                items: { type: :object }
              }
            },
            required: %w[sku barcode status current_price current_stock attributes]
          }
        }
      }

      response "201", "variant created" do
        let(:Authorization) { bearer_token_for(user) }
        let(:product_id) { product.id }
        let(:variant) do
          {
            variant: {
              sku: "SKU-100",
              barcode: "BC-100",
              status: "active",
              current_price: 950,
              current_stock: 45,
              attributes: [
                { name: "ukuran", value: "M" },
                { name: "warna", value: "Putih" }
              ]
            }
          }
        end

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(response).to have_http_status(:created)
          expect(body["success"]).to be(true)
          expect(body.dig("data", "sku")).to eq("SKU-100")
        end
      end

      response "422", "rejects duplicate attribute combination" do
        let!(:existing_variant) do
          create(:product_variant, product: product, sku: "SKU-EXIST", barcode: "BC-EXIST")
        end
        let!(:existing_attr) do
          create(:product_variant_attribute, product_variant: existing_variant, name: "ukuran", value: "M")
        end
        let!(:existing_attr_2) do
          create(:product_variant_attribute, product_variant: existing_variant, name: "warna", value: "Putih")
        end

        let(:Authorization) { bearer_token_for(user) }
        let(:product_id) { product.id }
        let(:variant) do
          {
            variant: {
              sku: "SKU-NEW",
              barcode: "BC-NEW",
              status: "active",
              current_price: 1000,
              current_stock: 10,
              attributes: [
                { name: "ukuran", value: "M" },
                { name: "warna", value: "Putih" }
              ]
            }
          }
        end

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(response).to have_http_status(:unprocessable_content)
          expect(body["errors"]).to include(a_string_including("combination"))
        end
      end
    end
  end

  path "/api/v1/products/{product_id}/variants/{id}" do
    parameter name: :product_id, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    get "Show product variant" do
      tags "Product Variants"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "variant shown" do
        let!(:record) { create(:product_variant, product: product, sku: "SKU-DETAIL", barcode: "BC-DETAIL") }
        let(:product_id) { product.id }
        let(:id) { record.id }
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(response).to have_http_status(:ok)
          expect(body.dig("data", "id")).to eq(record.id)
        end
      end
    end
  end
end
