FactoryBot.define do
  factory :salary_record do
    employee
    basic_salary_cents { 5_000_000 }
    allowance_cents { 500_000 }
    bonus_cents { 0 }
    effective_date { Date.current.beginning_of_month }
    end_date { nil }
    notes { "Initial package" }
  end
end
