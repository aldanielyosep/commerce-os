module Api
  module V1
    module Users
      class SessionsController < Devise::SessionsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          refresh_token, raw_refresh_token = RefreshToken.issue_for(resource)

          render json: auth_success_payload(
            resource,
            raw_refresh_token: raw_refresh_token,
            refresh_token: refresh_token
          ),
                 status: :ok
        end

        def respond_to_on_destroy(_opts = {})
          revoke_active_tokens(current_user) if current_user
          render json: { success: true, message: "Signed out successfully" }, status: :ok
        end

        def revoke_active_tokens(user)
          now = Time.current

          user.refresh_tokens.active.find_each do |refresh_token|
            refresh_token.update!(revoked_at: now)
          end
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
