# rubocop:disable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
require "swagger_helper"

RSpec.describe "Employees" do
  path "/api/v1/employees" do
    get "List employees" do
      tags "Employees"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :status, in: :query, type: :string, required: false
      parameter name: :department_id, in: :query, type: :string, required: false
      parameter name: :q, in: :query, type: :string, required: false
      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false
      parameter name: :order_by, in: :query, type: :string, required: false
      parameter name: :order_dir, in: :query, type: :string, required: false

      response "200", "employees listed" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:department) { create(:department, code: "ENG", name: "Engineering") }
        let!(:employee_one) { create(:employee, full_name: "Alice Johnson", email: "alice@example.com") }
        let!(:employee_two) { create(:employee, full_name: "Bob Smith", email: "bob@example.com") }
        let!(:assignment) { create(:employee_department, employee: employee_one, department: department) }

        let(:department_id) { department.id }
        let(:page) { 1 }
        let(:per_page) { 10 }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"].size).to eq(1)
          expect(body["data"].first["full_name"]).to eq("Alice Johnson")
          expect(body["meta"]).to include(
            "page" => 1,
            "per_page" => 10,
            "total_count" => 1,
            "total_pages" => 1
          )
        end
      end

      response "403", "employees list forbidden for storefront ops" do
        let!(:user) do
          create(:user, :admin_storefront_ops, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test!
      end

      response "200", "employees ordered by employee id descending" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee_one) { create(:employee, employee_id: "EMP-0010", full_name: "Alice Johnson") }
        let!(:employee_two) { create(:employee, employee_id: "EMP-0020", full_name: "Bob Smith") }
        let(:page) { 1 }
        let(:per_page) { 20 }
        let(:order_by) { "employee_id" }
        let(:order_dir) { "desc" }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"].first["employee_id"]).to eq(employee_two.employee_id)
          expect(body["data"].second["employee_id"]).to eq(employee_one.employee_id)
        end
      end
    end

    post "Create employee" do
      tags "Employees"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :employee, in: :body, schema: {
        type: :object,
        properties: {
          employee: {
            type: :object,
            properties: {
              full_name: { type: :string },
              gender: { type: :string, enum: %w[male female] },
              birth_date: { type: :string, format: :date },
              join_date: { type: :string, format: :date },
              identity_number: { type: :string },
              phone_number: { type: :string },
              email: { type: :string },
              address: { type: :string },
              city: { type: :string },
              postal_code: { type: :string }
            },
            required: %w[
              full_name
              gender
              birth_date
              join_date
              identity_number
              phone_number
              email
              address
              city
              postal_code
            ]
          }
        },
        required: [ "employee" ]
      }

      response "201", "employee created" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let(:employee) do
          {
            employee: {
              full_name: "Alice Johnson",
              gender: "female",
              birth_date: "1992-02-03",
              join_date: "2024-01-02",
              identity_number: "IDN9001",
              phone_number: "+628123450001",
              email: "alice.johnson@example.com",
              address: "Jl. Melati No. 1",
              city: "Jakarta",
              postal_code: "10110"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["employee_id"]).to match(/^B\d{4,}$/)
        end
      end

      response "422", "employee invalid" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:existing_employee) do
          create(
            :employee,
            identity_number: "IDN9001",
            email: "alice.johnson@example.com"
          )
        end
        let(:employee) do
          {
            employee: {
              full_name: "Invalid Employee",
              gender: "female",
              birth_date: "1992-02-03",
              join_date: "2024-01-02",
              identity_number: "IDN9001",
              phone_number: "+628123450002",
              email: "alice.johnson@example.com",
              address: "Jl. Melati No. 2",
              city: "Jakarta",
              postal_code: "10110"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to save employee")
        end
      end
    end
  end

  path "/api/v1/employees/{id}" do
    parameter name: :id, in: :path, type: :string

    get "Show employee" do
      tags "Employees"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "employee shown" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let(:id) { employee.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["id"]).to eq(employee.id)
        end
      end
    end

    patch "Update employee" do
      tags "Employees"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :employee, in: :body, schema: {
        type: :object,
        properties: {
          employee: {
            type: :object,
            properties: {
              full_name: { type: :string },
              phone_number: { type: :string },
              city: { type: :string }
            }
          }
        },
        required: [ "employee" ]
      }

      response "200", "employee updated" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee_record) { create(:employee, full_name: "Alice Johnson") }
        let(:id) { employee_record.id }
        let(:employee) do
          {
            employee: {
              full_name: "Alice Cooper"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["full_name"]).to eq("Alice Cooper")
        end
      end

      response "422", "employee update invalid" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee_record) { create(:employee, full_name: "Alice Johnson") }
        let!(:conflicting_employee) do
          create(
            :employee,
            identity_number: "IDN9002",
            email: "bob.smith@example.com"
          )
        end
        let(:id) { employee_record.id }
        let(:employee) do
          {
            employee: {
              email: conflicting_employee.email
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to update employee")
        end
      end
    end

    delete "Delete employee" do
      tags "Employees"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "employee discarded" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee_record) { create(:employee, full_name: "Alice Johnson") }
        let(:id) { employee_record.id }

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

  path "/api/v1/employees/{id}/terminate" do
    parameter name: :id, in: :path, type: :string

    patch "Terminate employee" do
      tags "Employees"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "employee terminated" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee_record) { create(:employee, full_name: "Alice Johnson") }
        let(:id) { employee_record.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["status"]).to eq("terminated")
          expect(body["data"]["termination_date"]).to eq(Date.current.to_s)
        end
      end

      response "422", "employee termination invalid" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee_record) { create(:employee, full_name: "Alice Johnson") }
        let(:id) { employee_record.id }

        before do
          # rubocop:disable RSpec/AnyInstance
          allow_any_instance_of(Employee).to receive(:update).and_return(false)
          # rubocop:enable RSpec/AnyInstance
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to terminate employee")
        end
      end
    end
  end
end

# rubocop:enable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
