module Api
  module V1
    module Users
      class SessionsController < Devise::SessionsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          render json: {
            success: true,
            data: {
              id: resource.id,
              email: resource.email,
              username: resource.username,
              role: resource.role,
              status: resource.status
            }
          }, status: :ok
        end

        def respond_to_on_destroy(_opts = {})
          render json: { success: true, message: "Signed out successfully" }, status: :ok
        end
      end
    end
  end
end
