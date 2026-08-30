class VariantStockLedger < ApplicationRecord
  belongs_to :product_variant

  validates :event_type, presence: true
  validates :delta, numericality: { other_than: 0 }
  validates :reason, length: { maximum: 255 }, allow_blank: true
end
