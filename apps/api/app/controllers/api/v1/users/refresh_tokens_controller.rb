module Api
  module V1
    module Users
      class RefreshTokensController < ApplicationController
        def create
          token_param = params.expect(refresh_token: [ :token ]).fetch(:token)
          refresh_token = RefreshToken.find_active_by_token(token_param)

          return render_error("Invalid refresh token", status: :unauthorized) unless refresh_token

          user = refresh_token.user
          if user.disabled?
            refresh_token.revoke!
            return render_error("User account is disabled", status: :forbidden)
          end

          refresh_token.revoke!
          issued_token, raw_token = RefreshToken.issue_for(user)
          jwt_token, = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)

          response.set_header("Authorization", "Bearer #{jwt_token}")
          render json: auth_success_payload(user, raw_refresh_token: raw_token, refresh_token: issued_token), status: :ok
        end

        private

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