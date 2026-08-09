require "swagger_helper"

# rubocop:disable RSpec/MultipleMemoizedHelpers
RSpec.describe "Product Types" do
  path "/api/v1/product_types" do
    get "List product types" do
      tags "Product Types"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false
      parameter name: :sub_category_id, in: :query, type: :integer, required: false
      parameter name: :q, in: :query, type: :string, required: false
      parameter name: :order_by, in: :query, type: :string, required: false
      parameter name: :order_dir, in: :query, type: :string, required: false

      response "200", "product types listed" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:sub_category_a) { create(:sub_category, name: "SubCat A") }
        let!(:sub_category_b) { create(:sub_category, name: "SubCat B") }
        let!(:product_type_a) { create(:product_type, sub_category: sub_category_a, name: "Type Alpha") }
        let!(:product_type_b) { create(:product_type, sub_category: sub_category_b, name: "Type Beta") }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body["data"].pluck("id")).to include(product_type_a.id, product_type_b.id)
          expect(body["data"].first).to include("sub_category_id", "name", "created_at", "updated_at")
        end
      end

      response "200", "product types filtered and ordered" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:sub_category_a) { create(:sub_category, name: "SubCat C") }
        let!(:sub_category_b) { create(:sub_category, name: "SubCat D") }
        let!(:product_type_a) { create(:product_type, sub_category: sub_category_a, name: "Alpha") }
        let!(:product_type_b) { create(:product_type, sub_category: sub_category_b, name: "Beta") }
        let(:sub_category_id) { sub_category_b.id }
        let(:q) { "be" }
        let(:order_by) { "unknown" }
        let(:order_dir) { "desc" }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body["data"].size).to eq(1)
          expect(body["data"].first["id"]).to eq(product_type_b.id)
        end
      end

      response "403", "product types list forbidden for storefront ops" do
        let!(:user) do
          create(:user, :admin_storefront_ops, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:sub_category) { create(:sub_category, name: "SubCat E") }

        before do
          create(:product_type, sub_category: sub_category, name: "Ops Blocked")
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test!
      end
    end

    post "Create product type" do
      tags "Product Types"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :product_type, in: :body, schema: {
        type: :object,
        properties: {
          product_type: {
            type: :object,
            properties: {
              sub_category_id: { type: :integer },
              name: { type: :string }
            },
            required: %w[sub_category_id name]
          }
        },
        required: [ "product_type" ]
      }

      response "201", "product type created" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:sub_category) { create(:sub_category, name: "Shirts") }
        let(:product_type) do
          {
            product_type: {
              sub_category_id: sub_category.id,
              name: "Polo"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body.dig("data", "name")).to eq("Polo")
          expect(body.dig("data", "sub_category_id")).to eq(sub_category.id)
        end
      end
    end
  end

  path "/api/v1/product_types/{id}" do
    parameter name: :id, in: :path, type: :string

    get "Show product type" do
      tags "Product Types"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "product type shown" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:record) { create(:product_type, name: "Visible Type") }
        let(:id) { record.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body.dig("data", "id")).to eq(record.id)
        end
      end
    end

    patch "Update product type" do
      tags "Product Types"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :product_type, in: :body, schema: {
        type: :object,
        properties: {
          product_type: {
            type: :object,
            properties: {
              sub_category_id: { type: :integer },
              name: { type: :string }
            }
          }
        },
        required: [ "product_type" ]
      }

      response "200", "product type updated" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:record) { create(:product_type, name: "Old Type") }
        let!(:new_sub_category) { create(:sub_category, name: "New Sub") }
        let(:id) { record.id }
        let(:product_type) do
          {
            product_type: {
              sub_category_id: new_sub_category.id,
              name: "New Type"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body.dig("data", "name")).to eq("New Type")
          expect(record.reload.sub_category_id).to eq(new_sub_category.id)
        end
      end
    end

    delete "Delete product type" do
      tags "Product Types"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "product type discarded" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:record) { create(:product_type) }
        let(:id) { record.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body.dig("data", "discarded")).to be(true)
          expect(record.reload).to be_discarded
        end
      end
    end
  end
end
# rubocop:enable RSpec/MultipleMemoizedHelpers
