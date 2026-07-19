# rubocop:disable RSpec/MultipleMemoizedHelpers
require "swagger_helper"

RSpec.describe "Users" do
  let(:force_update_failure) { false }

  before do
    next unless force_update_failure

    # rubocop:disable RSpec/AnyInstance
    allow_any_instance_of(User).to receive(:update).and_return(false)
    # rubocop:enable RSpec/AnyInstance
  end

  path "/api/v1/users" do
    get "List users" do
      tags "Users"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "users listed" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:admin_user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          ids = body["data"].pluck("id")

          expect(ids).to include(super_admin.id, admin_user.id)
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

    post "Create user" do
      tags "Users"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :user, in: :body, schema: {
        type: :object,
        properties: {
          user: {
            type: :object,
            properties: {
              email: { type: :string },
              username: { type: :string },
              password: { type: :string },
              password_confirmation: { type: :string },
              role: { type: :string, enum: %w[admin admin_company admin_storefront_ops super_admin] },
              status: { type: :string, enum: %w[active disabled] }
            },
            required: %w[email password password_confirmation role status]
          }
        },
        required: [ "user" ]
      }

      response "201", "user created" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let(:user) do
          {
            user: {
              email: "admin.phasee@example.com",
              username: "phaseeadmin",
              password: "Password123!",
              password_confirmation: "Password123!",
              role: "admin_company",
              status: "active"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["role"]).to eq("admin_company")
        end
      end

      response "422", "super admin creation blocked" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let(:user) do
          {
            user: {
              email: "blocked.super@example.com",
              username: "blockedsuper",
              password: "Password123!",
              password_confirmation: "Password123!",
              role: "super_admin",
              status: "active"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
        end
      end

      response "422", "user invalid" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:existing_user) { create(:user, email: "duplicate.user@example.com") }
        let(:user) do
          {
            user: {
              email: existing_user.email,
              username: "duplicateuser",
              password: "Password123!",
              password_confirmation: "Password123!",
              role: "admin",
              status: "active"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to create user")
        end
      end
    end
  end

  path "/api/v1/users/{id}" do
    parameter name: :id, in: :path, type: :string

    get "Show user" do
      tags "Users"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "user shown" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, email: "target.user@example.com") }
        let(:id) { target_user.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["id"]).to eq(target_user.id)
        end
      end
    end

    patch "Update user" do
      tags "Users"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :user, in: :body, schema: {
        type: :object,
        properties: {
          user: {
            type: :object,
            properties: {
              username: { type: :string }
            }
          }
        },
        required: [ "user" ]
      }

      response "200", "user updated" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, username: "before_update") }
        let(:id) { target_user.id }
        let(:user) { { user: { username: "after_update" } } }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["username"]).to eq("after_update")
        end
      end

      response "422", "user update invalid" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, username: "before_update") }
        let!(:existing_user) { create(:user, username: "already_taken") }
        let(:id) { target_user.id }
        let(:user) { { user: { username: existing_user.username } } }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to update user")
        end
      end
    end

    delete "Delete user" do
      tags "Users"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "user deleted" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, email: "delete.user@example.com") }
        let(:id) { target_user.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["deleted"]).to be(true)
        end
      end

      response "422", "self delete blocked" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let(:id) { super_admin.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to delete user")
        end
      end
    end
  end

  path "/api/v1/users/{id}/disable" do
    parameter name: :id, in: :path, type: :string

    patch "Disable user" do
      tags "Users"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "user disabled" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, status: :active) }
        let(:id) { target_user.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["status"]).to eq("disabled")
        end
      end

      response "422", "self disable blocked" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let(:id) { super_admin.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to disable user")
        end
      end

      response "422", "disable failed" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end

        let!(:target_user) { create(:user, status: :active) }
        let(:id) { target_user.id }
        let(:force_update_failure) { true }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)

          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to disable user")
        end
      end
    end
  end

  path "/api/v1/users/{id}/enable" do
    parameter name: :id, in: :path, type: :string

    patch "Enable user" do
      tags "Users"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "user enabled" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, status: :disabled) }
        let(:id) { target_user.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["status"]).to eq("active")
        end
      end

      response "422", "enable failed" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, status: :disabled) }
        let(:id) { target_user.id }
        let(:force_update_failure) { true }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to enable user")
        end
      end
    end
  end

  path "/api/v1/users/{id}/change_role" do
    parameter name: :id, in: :path, type: :string

    patch "Change user role" do
      tags "Users"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :user, in: :body, schema: {
        type: :object,
        properties: {
          user: {
            type: :object,
            properties: {
              role: { type: :string, enum: %w[admin admin_company admin_storefront_ops super_admin] }
            },
            required: [ "role" ]
          }
        },
        required: [ "user" ]
      }

      response "200", "role changed" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, role: :admin) }
        let(:id) { target_user.id }
        let(:user) { { user: { role: "admin" } } }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["role"]).to eq("admin")
        end
      end

      response "422", "super admin promotion blocked" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, role: :admin) }
        let(:id) { target_user.id }
        let(:user) { { user: { role: "super_admin" } } }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
        end
      end
    end
  end

  path "/api/v1/users/{id}/reset_password" do
    parameter name: :id, in: :path, type: :string

    post "Send reset password instructions" do
      tags "Users"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "password reset initiated" do
        let!(:super_admin) do
          create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!")
        end
        let!(:target_user) { create(:user, email: "reset.user@example.com") }
        let(:id) { target_user.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(super_admin) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["reset_password_sent"]).to be(true)
        end
      end
    end
  end
end

# rubocop:enable RSpec/MultipleMemoizedHelpers
