module RswagAuthHelper
  def bearer_token_for(user)
    token, = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)
    "Bearer #{token}"
  end
end

RSpec.configure do |config|
  config.include RswagAuthHelper
end
