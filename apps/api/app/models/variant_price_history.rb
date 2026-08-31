class VariantPriceHistory < ApplicationRecord
  belongs_to :product_variant

  validates :effective_from, presence: true
  validates :price, numericality: { greater_than_or_equal_to: 0 }
  validates :reason, length: { maximum: 255 }, allow_blank: true
end
