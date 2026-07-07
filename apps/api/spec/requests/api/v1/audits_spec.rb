# rubocop:disable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
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

      response "200", "audits listed" do
        let!(:super_admin) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee) }
        let!(:audit_one) do
          Audited::Audit.create!(
            action: "update",
            auditable_type: "Employee",
            auditable_id: employee.id,
            user_id: super_admin.id,
            user_type: "User",
            audited_changes: { full_name: [ "Before", "After" ] }
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
        let!(:super_admin) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:employee) { create(:employee) }
        let!(:matching_audit) do
          Audited::Audit.create!(
            action: "update",
            auditable_type: "Employee",
            auditable_id: employee.id,
            user_id: super_admin.id,
            user_type: "User",
            audited_changes: { city: [ "A", "B" ] }
          )
        end
        let!(:non_matching_audit) do
          Audited::Audit.create!(
            action: "update",
            auditable_type: "Department",
            auditable_id: employee.id,
            user_id: super_admin.id,
            user_type: "User",
            audited_changes: { name: [ "X", "Y" ] }
          )
        end
        let(:auditable_type) { "Employee" }
        let(:auditable_id) { employee.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"].map { |audit| audit["id"] }).to include(matching_audit.id)
          expect(body["data"].map { |audit| audit["id"] }).not_to include(non_matching_audit.id)
        end
      end

      response "200", "audits filtered by actor user" do
        let!(:super_admin) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:other_user) { create(:user) }
        let!(:matching_audit) do
          Audited::Audit.create!(
            action: "update",
            auditable_type: "User",
            auditable_id: other_user.id,
            user_id: super_admin.id,
            user_type: "User",
            audited_changes: { status: [ "active", "disabled" ] }
          )
        end
        let!(:non_matching_audit) do
          Audited::Audit.create!(
            action: "update",
            auditable_type: "User",
            auditable_id: super_admin.id,
            user_id: other_user.id,
            user_type: "User",
            audited_changes: { status: [ "disabled", "active" ] }
          )
        end
        let(:user_id) { super_admin.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"].map { |audit| audit["id"] }).to include(matching_audit.id)
          expect(body["data"].map { |audit| audit["id"] }).not_to include(non_matching_audit.id)
        end
      end

      response "403", "forbidden for admin" do
        let!(:admin_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(admin_user) }
        # rubocop:enable RSpec/VariableName

        run_test!
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
        let!(:super_admin) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
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

# rubocop:enable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
