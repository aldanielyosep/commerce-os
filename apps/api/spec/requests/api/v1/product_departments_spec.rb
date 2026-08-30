require "swagger_helper"

# rubocop:disable-next RSpec/MultipleMemoizedHelpers
RSpec.describe "Product Departments" do
  path "/api/v1/product_departments" do
    get "List product departments" do
      tags "Product Departments"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false
      parameter name: :q, in: :query, type: :string, required: false
      parameter name: :order_by, in: :query, type: :string, required: false
      parameter name: :order_dir, in: :query, type: :string, required: false

      response "200", "product departments listed" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:product_department_one) { create(:product_department, code: "BAG", name: "Bags") }
        let!(:product_department_two) { create(:product_department, code: "SHO", name: "Shoes") }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body["data"].pluck("code")).to include(product_department_one.code, product_department_two.code)
        end
      end

      response "200", "product departments filtered and ordered" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:product_department_one) { create(:product_department, code: "AAA", name: "Alpha") }
        let!(:product_department_two) { create(:product_department, code: "ZZZ", name: "Zulu") }
        let(:q) { "zu" }
        let(:order_by) { "unknown" }
        let(:order_dir) { "desc" }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body["data"].size).to eq(1)
          expect(body["data"].first["id"]).to eq(product_department_two.id)
        end
      end

      response "403", "product departments list forbidden for storefront ops" do
        let!(:user) do
          create(:user, :admin_storefront_ops, password: "Password123!", password_confirmation: "Password123!")
        end

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test!
      end
    end

    post "Create product department" do
      tags "Product Departments"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :product_department, in: :body, schema: {
        type: :object,
        properties: {
          product_department: {
            type: :object,
            properties: {
              code: { type: :string },
              name: { type: :string }
            },
            required: %w[code name]
          }
        },
        required: [ "product_department" ]
      }

      response "201", "product department created" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let(:product_department) do
          {
            product_department: {
              code: "ACC",
              name: "Accessories"
            }
          }
        end

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body.dig("data", "code")).to eq("ACC")
        end
      end
    end
  end

  path "/api/v1/product_departments/{id}" do
    parameter name: :id, in: :path, type: :string

    get "Show product department" do
      tags "Product Departments"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "product department shown" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:record) { create(:product_department, code: "SHOW", name: "Showcase") }
        let(:id) { record.id }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body.dig("data", "id")).to eq(record.id)
        end
      end
    end

    patch "Update product department" do
      tags "Product Departments"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :product_department, in: :body, schema: {
        type: :object,
        properties: {
          product_department: {
            type: :object,
            properties: {
              code: { type: :string },
              name: { type: :string }
            }
          }
        },
        required: [ "product_department" ]
      }

      response "200", "product department updated" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:record) { create(:product_department, code: "UPD", name: "Old Name") }
        let(:id) { record.id }
        let(:product_department) do
          {
            product_department: {
              name: "New Name"
            }
          }
        end

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body.dig("data", "name")).to eq("New Name")
        end
      end
    end

    delete "Delete product department" do
      tags "Product Departments"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "product department discarded" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:record) { create(:product_department, code: "DEL", name: "Delete Me") }
        let(:id) { record.id }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body.dig("data", "discarded")).to be(true)
          expect(record.reload).to be_discarded
        end
      end
    end
  end
end
