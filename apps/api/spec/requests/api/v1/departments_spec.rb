# rubocop:disable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
require "swagger_helper"

RSpec.describe "Departments" do
  path "/api/v1/departments" do
    get "List departments" do
      tags "Departments"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false

      response "200", "departments listed" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:department_one) { create(:department, code: "HR", name: "Human Resources") }
        let!(:department_two) { create(:department, code: "ENG", name: "Engineering") }
        let(:page) { 1 }
        let(:per_page) { 1 }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(true)
          expect(body["data"].size).to eq(1)
          expect(body["meta"]).to include(
            "page" => 1,
            "per_page" => 1,
            "total_count" => 2,
            "total_pages" => 2
          )
        end
      end

      response "403", "departments list forbidden for storefront ops" do
        let!(:user) do
          create(:user, :admin_storefront_ops, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:department) { create(:department, code: "HR", name: "Human Resources") }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test!
      end
    end

    post "Create department" do
      tags "Departments"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :department, in: :body, schema: {
        type: :object,
        properties: {
          department: {
            type: :object,
            properties: {
              code: { type: :string },
              name: { type: :string }
            },
            required: %w[code name]
          }
        },
        required: [ "department" ]
      }

      response "201", "department created" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let(:department) do
          {
            department: {
              code: "OPS",
              name: "Operations"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["code"]).to eq("OPS")
        end
      end
    end
  end

  path "/api/v1/departments/{id}" do
    parameter name: :id, in: :path, type: :string

    get "Show department" do
      tags "Departments"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "department shown" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:department) { create(:department, code: "HR", name: "Human Resources") }
        let(:id) { department.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["id"]).to eq(department.id)
        end
      end
    end

    patch "Update department" do
      tags "Departments"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :department, in: :body, schema: {
        type: :object,
        properties: {
          department: {
            type: :object,
            properties: {
              code: { type: :string },
              name: { type: :string }
            }
          }
        },
        required: [ "department" ]
      }

      response "200", "department updated" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:department_record) { create(:department, code: "HR", name: "Human Resources") }
        let(:id) { department_record.id }
        let(:department) do
          {
            department: {
              name: "People Operations"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["name"]).to eq("People Operations")
        end
      end

      response "404", "department not found" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let(:id) { 0 }
        let(:department) { { department: { name: "People Operations" } } }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test!
      end
    end

    delete "Delete department" do
      tags "Departments"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "department discarded" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:department) { create(:department, code: "HR", name: "Human Resources") }
        let(:id) { department.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["discarded"]).to be(true)
        end
      end
    end
  end
end

# rubocop:enable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
