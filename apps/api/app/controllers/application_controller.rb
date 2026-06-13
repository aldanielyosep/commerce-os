class ApplicationController < ActionController::API
  include Pundit::Authorization
  include Pagy::Method

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from Pundit::NotAuthorizedError, with: :render_forbidden
  rescue_from Warden::NotAuthenticated, with: :render_unauthorized

  private

  def render_success(data = nil, meta: {}, status: :ok)
    render json: {
      success: true,
      data: data,
      meta: meta
    }, status: status
  end

  def render_error(message, errors: nil, status: :unprocessable_entity)
    render json: {
      success: false,
      message: message,
      errors: errors
    }, status: status
  end

  def render_not_found(error)
    render_error(error.message, status: :not_found)
  end

  def render_forbidden
    render_error("You are not authorized to perform this action", status: :forbidden)
  end

  def render_unauthorized
    render_error("Authentication required", status: :unauthorized)
  end

  def pundit_user
    current_user
  end
end
