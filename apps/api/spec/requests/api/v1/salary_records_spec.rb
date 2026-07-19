# rubocop:disable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
require "swagger_helper"

RSpec.describe "Salary Records" do
  path "/api/v1/employees/{employee_id}/salary_records" do
    parameter name: :employee_id, in: :path, type: :string

    get "List salary timeline" do
      tags "Salary Records"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "salary records listed" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:latest_record) do
          create(:salary_record, employee: employee, basic_salary_cents: 8_000_000,
                                 effective_date: Date.current.beginning_of_month)
        end
        let!(:older_record) do
          create(:salary_record, employee: employee, basic_salary_cents: 6_000_000,
                                 effective_date: (Date.current - 1.month).beginning_of_month,
                                 end_date: Date.current.beginning_of_month - 1.day)
        end
        let(:employee_id) { employee.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"].size).to eq(2)
          expect(body["data"].first["basic_salary_cents"]).to eq(8_000_000)
        end
      end

      response "403", "salary list forbidden for admin" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:record) { create(:salary_record, employee: employee, basic_salary_cents: 8_000_000) }
        let(:employee_id) { employee.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test!
      end
    end

    post "Create salary timeline entry" do
      tags "Salary Records"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :salary_record, in: :body, schema: {
        type: :object,
        properties: {
          salary_record: {
            type: :object,
            properties: {
              basic_salary_cents: { type: :integer },
              allowance_cents: { type: :integer },
              bonus_cents: { type: :integer },
              effective_date: { type: :string, format: :date },
              end_date: { type: :string, format: :date, nullable: true },
              notes: { type: :string }
            },
            required: %w[basic_salary_cents allowance_cents bonus_cents effective_date]
          }
        },
        required: [ "salary_record" ]
      }

      response "201", "salary record created" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let(:employee_id) { employee.id }
        let(:salary_record) do
          {
            salary_record: {
              basic_salary_cents: 8_500_000,
              allowance_cents: 750_000,
              bonus_cents: 100_000,
              effective_date: Date.current.beginning_of_month.to_s,
              notes: "Annual adjustment"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["basic_salary_cents"]).to eq(8_500_000)
        end
      end

      response "422", "salary overlap rejected" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:existing_record) do
          create(:salary_record, employee: employee,
                                 effective_date: Date.new(2026, 1, 1),
                                 end_date: Date.new(2026, 12, 31))
        end
        let(:employee_id) { employee.id }
        let(:salary_record) do
          {
            salary_record: {
              basic_salary_cents: 9_000_000,
              allowance_cents: 1_000_000,
              bonus_cents: 0,
              effective_date: Date.new(2026, 6, 1).to_s,
              end_date: Date.new(2026, 12, 31).to_s,
              notes: "Overlapping adjustment"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["errors"]).to include("salary date range overlaps an existing record")
        end
      end
    end
  end

  path "/api/v1/employees/{employee_id}/salary_records/{id}" do
    parameter name: :employee_id, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    patch "Update salary timeline entry" do
      tags "Salary Records"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :salary_record, in: :body, schema: {
        type: :object,
        properties: {
          salary_record: {
            type: :object,
            properties: {
              basic_salary_cents: { type: :integer },
              allowance_cents: { type: :integer },
              bonus_cents: { type: :integer },
              effective_date: { type: :string, format: :date },
              end_date: { type: :string, format: :date, nullable: true },
              notes: { type: :string }
            }
          }
        },
        required: [ "salary_record" ]
      }

      response "200", "salary record updated" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee, full_name: "Alice Johnson") }
        let!(:record) { create(:salary_record, employee: employee, basic_salary_cents: 8_000_000) }
        let(:employee_id) { employee.id }
        let(:id) { record.id }
        let(:salary_record) do
          {
            salary_record: {
              basic_salary_cents: 8_200_000,
              notes: "Correction"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["basic_salary_cents"]).to eq(8_200_000)
        end
      end
    end
  end
end

# rubocop:enable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
