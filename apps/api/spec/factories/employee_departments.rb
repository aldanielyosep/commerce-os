FactoryBot.define do
  factory :employee_department do
    employee
    department
    assigned_date { Date.current }
  end
end
