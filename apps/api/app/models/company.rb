class Company < ApplicationRecord
  include Discard::Model
  include HumanAttribution

  ALLOWED_LOGO_CONTENT_TYPES = %w[
    image/png
    image/jpg
    image/jpeg
    image/webp
    image/svg+xml
  ].freeze

  enum :company_type, { individual: 0, cv: 1, pt: 2 }
  enum :status, { active: 0, inactive: 1 }, default: :active

  has_one_attached :logo
  has_many :company_marketplace_links, dependent: :destroy

  phony_normalize :phone, default_country_code: "ID"

  validates :code, presence: true, uniqueness: true, length: { maximum: 50 }
  validates :name, presence: true, length: { maximum: 100 }
  validates :owner_name, presence: true, length: { maximum: 100 }
  validates :company_type, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true, phony_plausible: true
  validates :status, presence: true
  validates :website,
            format: {
              with: %r{\Ahttps://.+\z}i,
              message: "must use HTTPS"
            },
            allow_blank: true
  validates :latitude,
            numericality: {
              greater_than_or_equal_to: -90,
              less_than_or_equal_to: 90
            },
            allow_nil: true
  validates :longitude,
            numericality: {
              greater_than_or_equal_to: -180,
              less_than_or_equal_to: 180
            },
            allow_nil: true

  validate :latitude_and_longitude_presence
  validate :business_information_rules
  validate :logo_content_type
  validate :logo_size_within_limit

  audited

  def storage_key_for_logo(original_filename:)
    extension = File.extname(original_filename.to_s).downcase
    extension = ".bin" if extension.blank?

    path_prefix = ENV.fetch("AWS_PATH", "").strip.gsub(%r{\A/+|/+$}, "")

    segments = []
    segments << path_prefix unless path_prefix.empty?
    segments << "companies"
    segments << "logo"
    segments << "#{code}_#{SecureRandom.hex(6)}#{extension}"

    segments.join("/")
  end

  private

  def latitude_and_longitude_presence
    return if latitude.present? == longitude.present?

    errors.add(:base, "Latitude and longitude must be provided together")
  end

  def business_information_rules
    if individual?
      return unless business_information_present?

      errors.add(:base, "Business information must not be provided for individual companies")
      return
    end

    errors.add(:company_registration_number, "can't be blank") if company_registration_number.blank?
    errors.add(:nib, "can't be blank") if nib.blank?
  end

  def business_information_present?
    [company_registration_number, nib, siup, deed_number, pkp_number].any?(&:present?)
  end

  def logo_content_type
    return unless logo.attached?

    return if ALLOWED_LOGO_CONTENT_TYPES.include?(logo.blob.content_type)

    errors.add(:logo, "must be a PNG, JPG, JPEG, WebP, or SVG")
  end

  def logo_size_within_limit
    return unless logo.attached?

    errors.add(:logo, "must be smaller than 2 MB") if logo.blob.byte_size > 2.megabytes
  end
end
