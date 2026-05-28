require "rails_helper"

RSpec.configure do |config|
  config.openapi_root = Rails.root.join("swagger").to_s

  config.openapi_specs = {
    "v1/swagger.json" => {
      openapi: "3.0.1",
      info: {
        title: "Commerce OS API",
        version: "v1",
        description: "OpenAPI schema for the Commerce OS API"
      },
      servers: [
        {
          url: "http://localhost:3000"
        }
      ],
      paths: {}
    }
  }

  config.openapi_format = :json
end