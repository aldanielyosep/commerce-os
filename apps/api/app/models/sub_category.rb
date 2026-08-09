class SubCategory < ApplicationRecord
  include Discard::Model
  include HumanAttribution

  belongs_to :category
  has_many :product_types, dependent: :destroy
  has_many :products, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: { scope: :category_id, conditions: -> { kept } }

  audited
end
