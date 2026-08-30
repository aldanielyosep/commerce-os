class ProductVariantAttribute < ApplicationRecord
  belongs_to :product_variant

  validates :name, presence: true
  validates :value, presence: true
  validates :name, length: { maximum: 255 }
  validates :value, length: { maximum: 255 }

  scope :by_name, ->(name) { where(name: name.to_s) }
end
