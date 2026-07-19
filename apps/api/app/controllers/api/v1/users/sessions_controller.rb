module Api
  module V1
    module Users
      class SessionsController < Devise::SessionsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          refresh_token, raw_refresh_token = RefreshToken.issue_for(resource)

          render json: auth_success_payload(resource, raw_refresh_token: raw_refresh_token, refresh_token: refresh_token), status: :ok
        end

        def respond_to_on_destroy(_opts = {})
          current_user&.refresh_tokens&.active&.update_all(revoked_at: Time.current, updated_at: Time.current)
          render json: { success: true, message: "Signed out successfully" }, status: :ok
        end

        def auth_success_payload(user, raw_refresh_token:, refresh_token:)
          {
            success: true,
            data: {
              id: user.id,
              email: user.email,
              username: user.username,
              role: user.role,
              status: user.status,
              refresh_token: raw_refresh_token,
              refresh_token_expires_at: refresh_token.expires_at.iso8601
            }
          }
        end
      end
    end
  end
end
