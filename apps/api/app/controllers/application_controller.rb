class ApplicationController < ActionController::API
  include Pundit::Authorization
  include Pagy::Method

  before_action :set_current_request_user
  after_action :clear_current_request_user

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

  def paginate_collection(scope)
    pagy_record, records = pagy(scope, page: pagination_page, limit: pagination_limit)
    [ pagy_record, records ]
  end

  def pagination_meta(pagy_record)
    {
      page: pagy_record.page,
      per_page: pagy_record.limit,
      total_count: pagy_record.count,
      total_pages: pagy_record.pages
    }
  end

  def pundit_user
    current_user
  end

  def pagination_page
    page = params.fetch(:page, 1).to_i
    page.positive? ? page : 1
  end

  def pagination_limit
    per_page = params.fetch(:per_page, 20).to_i
    return 20 unless per_page.positive?

    [ per_page, 100 ].min
  end

  def normalized_order_direction(value)
    value.to_s.casecmp("desc").zero? ? :desc : :asc
  end

  def set_current_request_user
    CurrentRequest.user = current_user if respond_to?(:current_user)
  end

  def clear_current_request_user
    CurrentRequest.reset
  end
end
