class ApplicationController < ActionController::API
  include Pundit::Authorization
  include Pagy::Backend

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from Pundit::NotAuthorizedError, with: :render_forbidden

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

  def current_user
    @current_user ||= current_api_v1_user
  end
end
