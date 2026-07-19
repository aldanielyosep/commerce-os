# rubocop:disable RSpec/MultipleMemoizedHelpers
require "swagger_helper"

RSpec.describe "Audits" do
  path "/api/v1/audits" do
    get "List audits" do
      tags "Audits"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :auditable_type, in: :query, type: :string, required: false
      parameter name: :auditable_id, in: :query, type: :string, required: false
      parameter name: :user_id, in: :query, type: :string, required: false
      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false
      parameter name: :order_by, in: :query, type: :string, required: false
      parameter name: :order_dir, in: :query, type: :string, required: false

      response "200", "audits listed" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:employee) { create(:employee) }
        let!(:audit_one) do
          Audited::Audit.create!(
            action: "update",
            auditable_type: "Employee",
            auditable_id: employee.id,
            user_id: super_admin.id,
            user_type: "User",
            audited_changes: { full_name: %w[Before After] }
          )
        end
        let!(:audit_two) do
          Audited::Audit.create!(
            action: "create",
            auditable_type: "Department",
            auditable_id: 999,
            user_id: super_admin.id,
            user_type: "User",
            audited_changes: { name: [ nil, "Ops" ] }
          )
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"].size).to be >= 2
        end
      end

      response "200", "audits filtered by auditable entity" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:employee) { create(:employee) }
        let!(:matching_audit) do
          Audited::Audit.create!(
            action: "update",
            auditable_type: "Employee",
            auditable_id: employee.id,
            user_id: super_admin.id,
            user_type: "User",
            audited_changes: { city: %w[A B] }
          )
        end
        let!(:non_matching_audit) do
          Audited::Audit.create!(
            action: "update",
            auditable_type: "Department",
            auditable_id: employee.id,
            user_id: super_admin.id,
            user_type: "User",
            audited_changes: { name: %w[X Y] }
          )
        end
        let(:auditable_type) { "Employee" }
        let(:auditable_id) { employee.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          ids = body["data"].pluck("id")

          expect(ids).to include(matching_audit.id)
          expect(ids).not_to include(non_matching_audit.id)
        end
      end

      response "200", "audits filtered by actor user" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:other_user) { create(:user) }
        let!(:matching_audit) do
          Audited::Audit.create!(
            action: "update",
            auditable_type: "User",
            auditable_id: other_user.id,
            user_id: super_admin.id,
            user_type: "User",
            audited_changes: { status: %w[active disabled] }
          )
        end
        let!(:non_matching_audit) do
          Audited::Audit.create!(
            action: "update",
            auditable_type: "User",
            auditable_id: super_admin.id,
            user_id: other_user.id,
            user_type: "User",
            audited_changes: { status: %w[disabled active] }
          )
        end
        let(:user_id) { super_admin.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          ids = body["data"].pluck("id")

          expect(ids).to include(matching_audit.id)
          expect(ids).not_to include(non_matching_audit.id)
        end
      end

      response "403", "forbidden for admin" do
        let!(:admin_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(admin_user) }
        # rubocop:enable RSpec/VariableName

        run_test!
      end

      response "200", "audits ordered by action ascending" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:employee) { create(:employee) }
        let!(:audit_one) do
          Audited::Audit.create!(
            action: "update",
            auditable_type: "Employee",
            auditable_id: employee.id,
            user_id: super_admin.id,
            user_type: "User",
            audited_changes: { city: %w[A B] }
          )
        end
        let!(:audit_two) do
          Audited::Audit.create!(
            action: "create",
            auditable_type: "Employee",
            auditable_id: employee.id,
            user_id: super_admin.id,
            user_type: "User",
            audited_changes: { full_name: [ nil, "Name" ] }
          )
        end
        let(:page) { 1 }
        let(:per_page) { 20 }
        let(:order_by) { "action" }
        let(:order_dir) { "asc" }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          ids = body["data"].pluck("id")

          expect(ids.index(audit_two.id)).to be < ids.index(audit_one.id)
        end
      end
    end
  end

  path "/api/v1/audits/{id}" do
    parameter name: :id, in: :path, type: :string

    get "Show audit" do
      tags "Audits"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "audit shown" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:audit_record) do
          Audited::Audit.create!(
            action: "create",
            auditable_type: "User",
            auditable_id: super_admin.id,
            user_id: super_admin.id,
            user_type: "User",
            audited_changes: { email: [ nil, super_admin.email ] }
          )
        end
        let(:id) { audit_record.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["id"]).to eq(audit_record.id)
        end
      end
    end
  end
end

# rubocop:enable RSpec/MultipleMemoizedHelpers
