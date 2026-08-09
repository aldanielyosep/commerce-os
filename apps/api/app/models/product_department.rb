class ProductDepartment < ApplicationRecord
  include Discard::Model
  include HumanAttribution

  has_many :categories, dependent: :restrict_with_error
  has_many :products, foreign_key: :department_id, inverse_of: :product_department, dependent: :restrict_with_error

  validates :code, presence: true, uniqueness: { conditions: -> { kept } }, length: { maximum: 20 }
  validates :name, presence: true

  audited
end
