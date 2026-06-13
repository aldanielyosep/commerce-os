class EmployeeDepartment < ApplicationRecord
  include Discard::Model
  include HumanAttribution

  belongs_to :employee
  belongs_to :department

  validates :assigned_date, presence: true
  validates :department_id, uniqueness: { scope: :employee_id }

  audited
end
