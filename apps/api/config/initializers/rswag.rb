Rswag::Api.configure do |c|
  c.openapi_root = Rails.root.join("swagger").to_s
end

Rswag::Api::Engine.routes.default_url_options = {
  host: ENV.fetch("SWAGGER_HOST", "localhost"),
  port: ENV.fetch("SWAGGER_PORT", 3000)
}

Rswag::Ui.configure do |c|
  c.openapi_endpoint "/api-docs/v1/swagger.json", "Commerce OS API V1"
end