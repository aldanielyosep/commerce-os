require "swagger_helper"

# rubocop:disable-next RSpec/MultipleMemoizedHelpers
RSpec.describe "Sub Categories" do
  path "/api/v1/sub_categories" do
    get "List sub categories" do
      tags "Sub Categories"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false
      parameter name: :category_id, in: :query, type: :integer, required: false
      parameter name: :q, in: :query, type: :string, required: false
      parameter name: :order_by, in: :query, type: :string, required: false
      parameter name: :order_dir, in: :query, type: :string, required: false

      response "200", "sub categories listed" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:department_a) { create(:product_department, code: "SCA", name: "SubCat A") }
        let!(:department_b) { create(:product_department, code: "SCB", name: "SubCat B") }
        let!(:category_a) { create(:category, product_department: department_a, name: "Category A") }
        let!(:category_b) { create(:category, product_department: department_b, name: "Category B") }
        let!(:sub_category_a) { create(:sub_category, category: category_a, name: "Alpha Sub") }
        let!(:sub_category_b) { create(:sub_category, category: category_b, name: "Beta Sub") }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body["data"].pluck("id")).to include(sub_category_a.id, sub_category_b.id)
          expect(body["data"].first).to include("category_id", "name", "created_at", "updated_at")
        end
      end

      response "200", "sub categories filtered and ordered" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:department_a) { create(:product_department, code: "SCC", name: "SubCat C") }
        let!(:department_b) { create(:product_department, code: "SCD", name: "SubCat D") }
        let!(:category_a) { create(:category, product_department: department_a, name: "Category C") }
        let!(:category_b) { create(:category, product_department: department_b, name: "Category D") }
        let!(:sub_category_a) { create(:sub_category, category: category_a, name: "Alpha") }
        let!(:sub_category_b) { create(:sub_category, category: category_b, name: "Beta") }
        let(:category_id) { category_b.id }
        let(:q) { "be" }
        let(:order_by) { "unknown" }
        let(:order_dir) { "desc" }

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body["data"].size).to eq(1)
          expect(body["data"].first["id"]).to eq(sub_category_b.id)
        end
      end

      response "403", "sub categories list forbidden for storefront ops" do
        let!(:user) do
          create(:user, :admin_storefront_ops, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:department) { create(:product_department, code: "SCE", name: "SubCat E") }
        let!(:category) { create(:category, product_department: department, name: "Category E") }

        before do
          create(:sub_category, category: category, name: "Ops Blocked")
        end

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test!
      end
    end

    post "Create sub category" do
      tags "Sub Categories"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :sub_category, in: :body, schema: {
        type: :object,
        properties: {
          sub_category: {
            type: :object,
            properties: {
              category_id: { type: :integer },
              name: { type: :string }
            },
            required: %w[category_id name]
          }
        },
        required: [ "sub_category" ]
      }

      response "201", "sub category created" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:category) { create(:category, name: "Outerwear") }
        let(:sub_category) do
          {
            sub_category: {
              category_id: category.id,
              name: "Jackets"
            }
          }
        end

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body.dig("data", "name")).to eq("Jackets")
          expect(body.dig("data", "category_id")).to eq(category.id)
        end
      end
    end
  end

  path "/api/v1/sub_categories/{id}" do
    parameter name: :id, in: :path, type: :string

    get "Show sub category" do
      tags "Sub Categories"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "sub category shown" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:record) { create(:sub_category, name: "Visible Sub Category") }
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

    patch "Update sub category" do
      tags "Sub Categories"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :sub_category, in: :body, schema: {
        type: :object,
        properties: {
          sub_category: {
            type: :object,
            properties: {
              category_id: { type: :integer },
              name: { type: :string }
            }
          }
        },
        required: [ "sub_category" ]
      }

      response "200", "sub category updated" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:record) { create(:sub_category, name: "Old Name") }
        let!(:new_category) { create(:category, name: "New Category") }
        let(:id) { record.id }
        let(:sub_category) do
          {
            sub_category: {
              category_id: new_category.id,
              name: "New Name"
            }
          }
        end

        # rubocop:disable-next RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body.dig("data", "name")).to eq("New Name")
          expect(record.reload.category_id).to eq(new_category.id)
        end
      end
    end

    delete "Delete sub category" do
      tags "Sub Categories"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "sub category discarded" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:record) { create(:sub_category) }
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
