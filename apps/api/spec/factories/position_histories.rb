FactoryBot.define do
  factory :position_history do
    employee
    department
    position { "Staff" }
    effective_date { Date.current }
    notes { "Initial assignment" }
  end
end
