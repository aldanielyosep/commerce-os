require "swagger_helper"

RSpec.describe "Health Check" do
  path "/up" do
    get "Checks API health" do
      tags "Health"

      response "200", "healthy" do
        run_test!
      end
    end
  end
end
