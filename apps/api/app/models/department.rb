class Department < ApplicationRecord
  include Discard::Model
  include HumanAttribution

  has_many :employee_departments, dependent: :destroy
  has_many :employees, through: :employee_departments
  has_many :position_histories, dependent: :nullify

  validates :code, presence: true, uniqueness: true, length: { maximum: 20 }
  validates :name, presence: true

  audited
end
