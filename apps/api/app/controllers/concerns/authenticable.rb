module Authenticable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
    before_action :ensure_active_user!
  end

  private

  def ensure_active_user!
    return if current_user&.active?

    sign_out(current_user) if current_user
    render_error("User account is disabled", status: :forbidden)
  end
end
