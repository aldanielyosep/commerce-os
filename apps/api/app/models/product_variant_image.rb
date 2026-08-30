class ProductVariantImage < ApplicationRecord
  include Discard::Model

  belongs_to :product_variant

  validates :image_url, presence: true
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
