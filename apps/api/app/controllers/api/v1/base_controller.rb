module Api
  module V1
    class BaseController < ApplicationController
      include Authenticable
      include Authorizable
    end
  end
end
