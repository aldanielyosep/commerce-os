class ProductVariant < ApplicationRecord
  include Discard::Model

  enum :status, {
    draft: 0,
    active: 1,
    inactive: 2,
    archived: 3
  }, default: :draft

  belongs_to :company
  belongs_to :product
  has_many :product_variant_attributes, dependent: :destroy
  has_many :product_variant_images, dependent: :destroy
  has_many :variant_price_histories, dependent: :destroy
  has_many :variant_stock_ledgers, dependent: :destroy

  validates :company, presence: true
  validates :product, presence: true
  validates :sku, presence: true, uniqueness: { scope: :company_id }
  validates :barcode, presence: true, uniqueness: { scope: :company_id }
  validates :current_price, numericality: { greater_than_or_equal_to: 0 }
  validates :current_stock, numericality: { greater_than_or_equal_to: 0 }
  validates :status, presence: true

  before_validation :normalize_identifiers

  private

  def normalize_identifiers
    self.sku = sku.to_s.strip.presence
    self.barcode = barcode.to_s.strip.presence
  end
end
