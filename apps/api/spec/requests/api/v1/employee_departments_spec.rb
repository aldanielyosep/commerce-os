# rubocop:disable RSpec/MultipleMemoizedHelpers
require "swagger_helper"

RSpec.describe "Employee Departments" do
  path "/api/v1/employees/{employee_id}/employee_departments" do
    parameter name: :employee_id, in: :path, type: :string

    get "List employee department assignments" do
      tags "Employee Departments"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false
      parameter name: :order_by, in: :query, type: :string, required: false
      parameter name: :order_dir, in: :query, type: :string, required: false

      response "200", "assignments listed" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:department_one) { create(:department, code: "HR", name: "Human Resources") }
        let!(:department_two) { create(:department, code: "ENG", name: "Engineering") }
        let!(:assignment_one) do
          create(
            :employee_department,
            employee: employee,
            department: department_one,
            assigned_date: Date.current - 1.day
          )
        end
        let!(:assignment_two) do
          create(
            :employee_department,
            employee: employee,
            department: department_two,
            assigned_date: Date.current
          )
        end
        let(:employee_id) { employee.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"].size).to eq(2)
          expect(body["data"].map { |assignment| assignment["department"]["code"] }).to contain_exactly("HR", "ENG")
        end
      end

      response "403", "assignment list forbidden for storefront ops" do
        let!(:user) do
          create(:user, :admin_storefront_ops, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:department) { create(:department, code: "HR", name: "Human Resources") }
        let!(:assignment) { create(:employee_department, employee: employee, department: department) }
        let(:employee_id) { employee.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test!
      end

      response "200", "assignments ordered by assigned date ascending" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:department_one) { create(:department, code: "HR", name: "Human Resources") }
        let!(:department_two) { create(:department, code: "ENG", name: "Engineering") }
        let!(:assignment_one) do
          create(
            :employee_department,
            employee: employee,
            department: department_one,
            assigned_date: Date.current - 2.days
          )
        end
        let!(:assignment_two) do
          create(:employee_department, employee: employee, department: department_two, assigned_date: Date.current)
        end
        let(:employee_id) { employee.id }
        let(:page) { 1 }
        let(:per_page) { 20 }
        let(:order_by) { "assigned_date" }
        let(:order_dir) { "asc" }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          ids = JSON.parse(response.body)["data"].pluck("id")
          expect(ids.index(assignment_one.id)).to be < ids.index(assignment_two.id)
        end
      end
    end

    post "Assign department to employee" do
      tags "Employee Departments"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :employee_department, in: :body, schema: {
        type: :object,
        properties: {
          employee_department: {
            type: :object,
            properties: {
              department_id: { type: :integer },
              assigned_date: { type: :string, format: :date }
            },
            required: %w[department_id assigned_date]
          }
        },
        required: [ "employee_department" ]
      }

      response "201", "assignment created" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:department) { create(:department, code: "ENG", name: "Engineering") }
        let(:employee_id) { employee.id }
        let(:employee_department) do
          {
            employee_department: {
              department_id: department.id,
              assigned_date: Date.current.to_s
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["department"]["code"]).to eq("ENG")
        end
      end
    end
  end

  path "/api/v1/employees/{employee_id}/employee_departments/{id}" do
    parameter name: :employee_id, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    delete "Remove department assignment" do
      tags "Employee Departments"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "assignment discarded" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:department) { create(:department, code: "ENG", name: "Engineering") }
        let!(:assignment) { create(:employee_department, employee: employee, department: department) }
        let(:employee_id) { employee.id }
        let(:id) { assignment.id }

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

# rubocop:enable RSpec/MultipleMemoizedHelpers
