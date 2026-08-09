class Category < ApplicationRecord
  include Discard::Model
  include HumanAttribution

  belongs_to :product_department
  has_many :sub_categories, dependent: :destroy
  has_many :products, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: { scope: :product_department_id, conditions: -> { kept } }

  audited
end
