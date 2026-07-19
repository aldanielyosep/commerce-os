if defined?(Bullet)
  if Rails.env.development?
    Bullet.enable = true
    Bullet.bullet_logger = true
    Bullet.rails_logger = true
    Bullet.alert = false
    Bullet.console = false
    Bullet.raise = ENV["BULLET_RAISE"] == "true"
  elsif Rails.env.test? && ENV["BULLET_ENABLED"] == "true"
    Bullet.enable = true
    Bullet.bullet_logger = true
    Bullet.rails_logger = true
    Bullet.alert = false
    Bullet.console = false
    Bullet.raise = true
  end
end
