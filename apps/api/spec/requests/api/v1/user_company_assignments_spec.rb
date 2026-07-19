# rubocop:disable RSpec/MultipleMemoizedHelpers
require "swagger_helper"

RSpec.describe "User Company Assignments" do
  path "/api/v1/users/{user_id}/company_assignments" do
    parameter name: :user_id, in: :path, type: :string

    get "List user company assignments" do
      tags "User Company Assignments"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "assignments listed" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company_one) { create(:company, name: "Alpha Store") }
        let!(:company_two) { create(:company, name: "Beta Store") }
        let!(:assignment_one) { create(:company_assignment, user: target_user, company: company_one) }
        let!(:assignment_two) { create(:company_assignment, user: target_user, company: company_two) }
        let(:user_id) { target_user.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          company_names = body["data"].map { |row| row.dig("company", "name") }

          expect(company_names).to contain_exactly("Alpha Store", "Beta Store")
        end
      end

      response "403", "forbidden for admin" do
        let!(:admin_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:target_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let(:user_id) { target_user.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(admin_user) }
        # rubocop:enable RSpec/VariableName

        run_test!
      end
    end

    post "Assign company to user" do
      tags "User Company Assignments"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :company_assignment, in: :body, schema: {
        type: :object,
        properties: {
          company_assignment: {
            type: :object,
            properties: {
              company_id: { type: :integer },
              role_in_company: { type: :string }
            },
            required: %w[company_id]
          }
        },
        required: [ "company_assignment" ]
      }

      response "201", "assignment created" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, name: "Alpha Store") }
        let(:user_id) { target_user.id }
        let(:company_assignment) do
          {
            company_assignment: {
              company_id: company.id,
              role_in_company: "manager"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)

          expect(body.dig("data", "company_id")).to eq(company.id)
          expect(body.dig("data", "role_in_company")).to eq("manager")
        end
      end

      response "422", "duplicate assignment rejected" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, name: "Alpha Store") }
        let!(:assignment) { create(:company_assignment, user: target_user, company: company) }
        let(:user_id) { target_user.id }
        let(:company_assignment) do
          {
            company_assignment: {
              company_id: company.id
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)

          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to assign company")
        end
      end

      response "403", "forbidden for admin" do
        let!(:admin_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:target_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, name: "Alpha Store") }
        let(:user_id) { target_user.id }
        let(:company_assignment) do
          {
            company_assignment: {
              company_id: company.id
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(admin_user) }
        # rubocop:enable RSpec/VariableName

        run_test!
      end
    end
  end

  path "/api/v1/users/{user_id}/company_assignments/{id}" do
    parameter name: :user_id, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    delete "Remove user company assignment" do
      tags "User Company Assignments"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "assignment discarded" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, name: "Alpha Store") }
        let!(:assignment) { create(:company_assignment, user: target_user, company: company) }
        let(:user_id) { target_user.id }
        let(:id) { assignment.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)

          expect(body.dig("data", "discarded")).to be(true)
        end
      end

      response "403", "forbidden for admin" do
        let!(:admin_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:target_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, name: "Alpha Store") }
        let!(:assignment) { create(:company_assignment, user: target_user, company: company) }
        let(:user_id) { target_user.id }
        let(:id) { assignment.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(admin_user) }
        # rubocop:enable RSpec/VariableName

        run_test!
      end
    end
  end
end

# rubocop:enable RSpec/MultipleMemoizedHelpers