class GoodJobBasicAuth
  DASHBOARD_PATH_PREFIX = "/good_job".freeze

  def initialize(app)
    @app = app
  end

  def call(env)
    return @app.call(env) unless dashboard_request?(env)
    return @app.call(env) unless credentials_configured?

    request = Rack::Auth::Basic::Request.new(env)
    return @app.call(env) if authorized?(request)

    unauthorized_response
  end

  private

  def dashboard_request?(env)
    env["PATH_INFO"].to_s.start_with?(DASHBOARD_PATH_PREFIX)
  end

  def credentials_configured?
    username.present? && password.present?
  end

  def authorized?(request)
    return false unless request.provided? && request.basic? && request.credentials

    request_username, request_password = request.credentials
    secure_compare(request_username, username) && secure_compare(request_password, password)
  end

  def secure_compare(left, right)
    ActiveSupport::SecurityUtils.secure_compare(digest(left), digest(right))
  end

  def digest(value)
    Digest::SHA256.hexdigest(value.to_s)
  end

  def username
    ENV.fetch("GOOD_JOB_DASHBOARD_USERNAME", nil)
  end

  def password
    ENV.fetch("GOOD_JOB_DASHBOARD_PASSWORD", nil)
  end

  def unauthorized_response
    [
      401,
      {
        "WWW-Authenticate" => 'Basic realm="GoodJob Dashboard"',
        "Content-Type" => "text/plain"
      },
      ["Authorization required"]
    ]
  end
end

Rails.application.config.middleware.use GoodJobBasicAuth
