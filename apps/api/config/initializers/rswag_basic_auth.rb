class RswagBasicAuth
  DOCS_PATH_PREFIX = "/api-docs".freeze

  def initialize(app)
    @app = app
  end

  def call(env)
    return @app.call(env) unless docs_request?(env)
    return @app.call(env) unless credentials_configured?

    request = Rack::Auth::Basic::Request.new(env)
    return @app.call(env) if authorized?(request)

    unauthorized_response
  end

  private

  def docs_request?(env)
    env["PATH_INFO"].to_s.start_with?(DOCS_PATH_PREFIX)
  end

  def credentials_configured?
    docs_username.present? && docs_password.present?
  end

  def authorized?(request)
    return false unless request.provided? && request.basic? && request.credentials

    username, password = request.credentials

    secure_compare(username, docs_username) && secure_compare(password, docs_password)
  end

  def secure_compare(left, right)
    ActiveSupport::SecurityUtils.secure_compare(digest(left), digest(right))
  end

  def digest(value)
    Digest::SHA256.hexdigest(value.to_s)
  end

  def docs_username
    ENV.fetch("RSWAG_USERNAME", nil)
  end

  def docs_password
    ENV.fetch("RSWAG_PASSWORD", nil)
  end

  def unauthorized_response
    [
      401,
      {
        "WWW-Authenticate" => 'Basic realm="API Docs"',
        "Content-Type" => "text/plain"
      },
      ["Authorization required"]
    ]
  end
end

Rails.application.config.middleware.use RswagBasicAuth
