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
        let!(:user) do
          create(
            :user,
            email: "admin@example.com",
            password: "Password123!",
            password_confirmation: "Password123!"
          )
        end

        let(:credentials) do
          {
            user: {
              email: user.email,
              password: "Password123!"
            }
          }
        end

        run_test! do |response|
          body = JSON.parse(response.body)

          expect(body.dig("data", "refresh_token")).to be_present
          expect(body.dig("data", "refresh_token_expires_at")).to be_present
          expect(response.headers["Authorization"]).to be_present
        end
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

  path "/api/v1/users/refresh_token" do
    post "Refresh access token" do
      tags "Authentication"
      consumes "application/json"
      produces "application/json"

      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          refresh_token: {
            type: :object,
            properties: {
              token: { type: :string }
            },
            required: %w[token]
          }
        },
        required: [ "refresh_token" ]
      }

      response "200", "token refreshed" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:issued_token) { RefreshToken.issue_for(user) }
        let(:payload) do
          {
            refresh_token: {
              token: issued_token.last
            }
          }
        end

        run_test! do |response|
          body = JSON.parse(response.body)

          expect(body.dig("data", "refresh_token")).to be_present
          expect(body.dig("data", "refresh_token")).not_to eq(issued_token.last)
          expect(response.headers["Authorization"]).to be_present
          expect(RefreshToken.active.count).to eq(1)
        end
      end

      response "401", "invalid refresh token" do
        let(:payload) do
          {
            refresh_token: {
              token: "invalid-refresh-token"
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
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:refresh_token) { RefreshToken.issue_for(user) }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) do
          token, = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)
          "Bearer #{token}"
        end
        # rubocop:enable RSpec/VariableName

        run_test! do
          expect(RefreshToken.active.find_active_by_token(refresh_token.last)).to be_nil
        end
      end
    end
  end
end
