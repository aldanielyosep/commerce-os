require "swagger_helper"

RSpec.describe "Authentication" do
  path "/api/v1/users/sign_in" do
    post "Sign in user" do
      tags "Authentication"
      consumes "application/json"
      produces "application/json"

      parameter name: :credentials, in: :body, schema: {
        type: :object,
        properties: {
          user: {
            type: :object,
            properties: {
              email: { type: :string, format: :email },
              password: { type: :string }
            },
            required: %w[email password]
          }
        },
        required: [ "user" ]
      }

      response "200", "signed in" do
        let(:credentials) do
          {
            user: {
              email: "admin@example.com",
              password: "Password123!"
            }
          }
        end

        run_test!
      end

      response "401", "invalid credentials" do
        let(:credentials) do
          {
            user: {
              email: "invalid@example.com",
              password: "wrong-password"
            }
          }
        end

        run_test!
      end
    end
  end

  path "/api/v1/users/sign_out" do
    delete "Sign out user" do
      tags "Authentication"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "signed out" do
        run_test!
      end
    end
  end
end
