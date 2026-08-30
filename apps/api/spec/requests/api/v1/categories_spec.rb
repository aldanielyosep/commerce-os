require "swagger_helper"

# rubocop:disable-next RSpec/MultipleMemoizedHelpers
RSpec.describe "Categories" do
  path "/api/v1/categories" do
    get "List categories" do
      tags "Categories"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false
      parameter name: :department_id, in: :query, type: :integer, required: false
      parameter name: :q, in: :query, type: :string, required: false
      parameter name: :order_by, in: :query, type: :string, required: false
      parameter name: :order_dir, in: :query, type: :string, required: false

      response "200", "categories listed" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:department_one) { create(:product_department, code: "CATEGA", name: "Dept A") }
        let!(:department_two) { create(:product_department, code: "CATEGB", name: "Dept B") }
        let!(:category_one) { create(:category, product_department: department_one, name: "Alpha") }
        let!(:category_two) { create(:category, product_department: department_two, name: "Beta") }
        let(:page) { 1 }
        let(:per_page) { 10 }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body["data"].pluck("id")).to include(category_one.id, category_two.id)

          record = body["data"].find { |item| item["id"] == category_one.id }
          expect(record["department_id"]).to eq(department_one.id)
          expect(record["product_department_id"]).to eq(department_one.id)
        end
      end

      response "200", "categories filtered and ordered" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:department_one) { create(:product_department, code: "CATEGC", name: "Dept C") }
        let!(:department_two) { create(:product_department, code: "CATEGD", name: "Dept D") }
        let!(:category_one) { create(:category, product_department: department_one, name: "Alpha") }
        let!(:category_two) { create(:category, product_department: department_two, name: "Beta") }
        let(:department_id) { department_two.id }
        let(:q) { "be" }
        let(:order_by) { "unknown" }
        let(:order_dir) { "desc" }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body["data"].size).to eq(1)
          expect(body["data"].first["id"]).to eq(category_two.id)
        end
      end

      response "403", "categories list forbidden for storefront ops" do
        let!(:user) do
          create(:user, :admin_storefront_ops, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:department) { create(:product_department, code: "CATEGE", name: "Dept E") }

        before do
          create(:category, product_department: department, name: "Ops Blocked")
        end

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test!
      end
    end

    post "Create category" do
      tags "Categories"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :category, in: :body, schema: {
        type: :object,
        properties: {
          category: {
            type: :object,
            properties: {
              department_id: { type: :integer },
              name: { type: :string }
            },
            required: %w[department_id name]
          }
        },
        required: [ "category" ]
      }

      response "201", "category created" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:department) { create(:product_department, code: "CATEGF", name: "Dept F") }
        let(:category) do
          {
            category: {
              department_id: department.id,
              name: "Seasonal"
            }
          }
        end

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body.dig("data", "name")).to eq("Seasonal")
          expect(body.dig("data", "department_id")).to eq(department.id)
          expect(body.dig("data", "product_department_id")).to eq(department.id)
        end
      end
    end
  end

  path "/api/v1/categories/{id}" do
    parameter name: :id, in: :path, type: :string

    get "Show category" do
      tags "Categories"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "category shown" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:record) { create(:category, name: "Visible Category") }
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

    patch "Update category" do
      tags "Categories"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :category, in: :body, schema: {
        type: :object,
        properties: {
          category: {
            type: :object,
            properties: {
              product_department_id: { type: :integer },
              name: { type: :string }
            }
          }
        },
        required: [ "category" ]
      }

      response "200", "category updated" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:record) { create(:category, name: "Old Name") }
        let!(:target_department) { create(:product_department, code: "CATEGG", name: "Dept G") }
        let(:id) { record.id }
        let(:category) do
          {
            category: {
              product_department_id: target_department.id,
              name: "New Name"
            }
          }
        end

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body.dig("data", "name")).to eq("New Name")
          expect(record.reload.product_department_id).to eq(target_department.id)
        end
      end
    end

    delete "Delete category" do
      tags "Categories"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "category discarded" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:record) { create(:category) }
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
