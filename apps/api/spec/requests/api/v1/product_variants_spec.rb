require "swagger_helper"
# rubocop:disable-next RSpec/MultipleMemoizedHelpers
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
        let(:variants) do
          [
            create(:product_variant, product: product, sku: "SKU-001", barcode: "BC-001"),
            create(:product_variant, product: product, sku: "SKU-002", barcode: "BC-002")
          ]
        end
        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        let(:product_id) do
          variants
          product.id
        end

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
        # rubocop:disable-next RSpec/VariableName
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
        let(:existing_variant) do
          create(:product_variant, product: product, sku: "SKU-EXIST", barcode: "BC-EXIST")
        end
        let(:existing_variant_attributes) do
          [
            create(:product_variant_attribute, product_variant: existing_variant, name: "ukuran", value: "M"),
            create(:product_variant_attribute, product_variant: existing_variant, name: "warna", value: "Putih")
          ]
        end
        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        let(:product_id) { product.id }
        let(:variant) do
          existing_variant_attributes

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

  path "/api/v1/products/{product_id}/variants/{id}/price" do
    parameter name: :product_id, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    patch "Update variant price" do
      tags "Product Variants"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :price, in: :body, schema: {
        type: :object,
        properties: {
          price: {
            type: :object,
            properties: {
              value: { type: :number },
              effective_from: { type: :string, format: :date_time },
              reason: { type: :string }
            },
            required: %w[value effective_from]
          }
        }
      }

      response "200", "price updated" do
        let!(:record) { create(:product_variant, product: product, current_price: 900) }
        let(:product_id) { product.id }
        let(:id) { record.id }
        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        let(:price) do
          {
            price: {
              value: 1200,
              effective_from: "2026-08-30T00:00:00Z",
              reason: "sale adjustment"
            }
          }
        end

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(response).to have_http_status(:ok)
          expect(body.dig("data", "current_price").to_f).to eq(1200.0)
        end
      end
    end
  end

  path "/api/v1/products/{product_id}/variants/{id}/stock" do
    parameter name: :product_id, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    patch "Update variant stock" do
      tags "Product Variants"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :stock, in: :body, schema: {
        type: :object,
        properties: {
          stock: {
            type: :object,
            properties: {
              delta: { type: :integer },
              event_type: { type: :string },
              reason: { type: :string }
            },
            required: %w[delta event_type]
          }
        }
      }

      response "200", "stock updated" do
        let!(:record) { create(:product_variant, product: product, current_stock: 40) }
        let(:product_id) { product.id }
        let(:id) { record.id }
        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        let(:stock) do
          {
            stock: {
              delta: -15,
              event_type: "adjustment_out",
              reason: "manual correction"
            }
          }
        end

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(response).to have_http_status(:ok)
          expect(body.dig("data", "current_stock")).to eq(25)
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
        # rubocop:disable-next RSpec/VariableName
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
