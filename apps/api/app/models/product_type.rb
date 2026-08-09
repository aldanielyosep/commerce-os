class ProductType < ApplicationRecord
  include Discard::Model
  include HumanAttribution

  belongs_to :sub_category
  has_many :products, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: { scope: :sub_category_id, conditions: -> { kept } }

  audited
end
