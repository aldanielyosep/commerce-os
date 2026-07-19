# rubocop:disable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
require "swagger_helper"

RSpec.describe "Position Histories" do
  path "/api/v1/employees/{employee_id}/position_histories" do
    parameter name: :employee_id, in: :path, type: :string

    get "List position timeline" do
      tags "Position Histories"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false
      parameter name: :order_by, in: :query, type: :string, required: false
      parameter name: :order_dir, in: :query, type: :string, required: false

      response "200", "position histories listed" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:department) { create(:department, code: "ENG", name: "Engineering") }
        let!(:latest_history) do
          create(:position_history, employee: employee, department: department, position: "Lead",
                                    effective_date: Date.current)
        end
        let!(:older_history) do
          create(:position_history, employee: employee, department: department, position: "Staff",
                                    effective_date: Date.current - 1.month)
        end
        let(:employee_id) { employee.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"].size).to eq(2)
          expect(body["data"].first["position"]).to eq("Lead")
        end
      end

      response "403", "position histories list forbidden for storefront ops" do
        let!(:user) do
          create(:user, :admin_storefront_ops, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:department) { create(:department, code: "ENG", name: "Engineering") }
        let!(:history) { create(:position_history, employee: employee, department: department, position: "Lead") }
        let(:employee_id) { employee.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test!
      end

      response "200", "position histories ordered by position ascending" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:department) { create(:department, code: "ENG", name: "Engineering") }
        let!(:history_one) { create(:position_history, employee: employee, department: department, position: "Lead") }
        let!(:history_two) { create(:position_history, employee: employee, department: department, position: "Staff") }
        let(:employee_id) { employee.id }
        let(:page) { 1 }
        let(:per_page) { 20 }
        let(:order_by) { "position" }
        let(:order_dir) { "asc" }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          ids = JSON.parse(response.body)["data"].pluck("id")
          expect(ids.index(history_one.id)).to be < ids.index(history_two.id)
        end
      end
    end

    post "Create position timeline entry" do
      tags "Position Histories"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :position_history, in: :body, schema: {
        type: :object,
        properties: {
          position_history: {
            type: :object,
            properties: {
              position: { type: :string },
              department_id: { type: :integer },
              effective_date: { type: :string, format: :date },
              notes: { type: :string }
            },
            required: %w[position effective_date]
          }
        },
        required: [ "position_history" ]
      }

      response "201", "position history created" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:department) { create(:department, code: "ENG", name: "Engineering") }
        let(:employee_id) { employee.id }
        let(:position_history) do
          {
            position_history: {
              position: "Supervisor",
              department_id: department.id,
              effective_date: Date.current.to_s,
              notes: "Promotion"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["position"]).to eq("Supervisor")
        end
      end
    end
  end

  path "/api/v1/employees/{employee_id}/position_histories/{id}" do
    parameter name: :employee_id, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    patch "Update position timeline entry" do
      tags "Position Histories"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :position_history, in: :body, schema: {
        type: :object,
        properties: {
          position_history: {
            type: :object,
            properties: {
              position: { type: :string },
              department_id: { type: :integer },
              effective_date: { type: :string, format: :date },
              notes: { type: :string }
            }
          }
        },
        required: [ "position_history" ]
      }

      response "200", "position history updated" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:department) { create(:department, code: "OPS", name: "Operations") }
        let!(:history) { create(:position_history, employee: employee, position: "Staff") }
        let(:employee_id) { employee.id }
        let(:id) { history.id }
        let(:position_history) do
          {
            position_history: {
              position: "Senior Staff",
              department_id: department.id,
              notes: "Updated title"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["position"]).to eq("Senior Staff")
        end
      end
    end
  end
end

# rubocop:enable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
