class RefreshToken < ApplicationRecord
  EXPIRY_WINDOW = 30.days

  belongs_to :user

  validates :token_digest, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where(revoked_at: nil).where("expires_at > ?", Time.current) }

  def self.issue_for(user)
    raw_token = SecureRandom.urlsafe_base64(48)
    refresh_token = user.refresh_tokens.create!(
      token_digest: digest(raw_token),
      expires_at: EXPIRY_WINDOW.from_now
    )

    [ refresh_token, raw_token ]
  end

  def self.find_active_by_token(raw_token)
    return nil if raw_token.blank?

    token = find_by(token_digest: digest(raw_token))
    token if token&.active?
  end

  def active?
    revoked_at.nil? && expires_at.future?
  end

  def revoke!
    update!(revoked_at: Time.current)
  end

  def self.digest(raw_token)
    Digest::SHA256.hexdigest(raw_token)
  end
end
