class PositionHistory < ApplicationRecord
  belongs_to :employee
  belongs_to :department, optional: true

  validates :position, presence: true
  validates :effective_date, presence: true

  audited
end