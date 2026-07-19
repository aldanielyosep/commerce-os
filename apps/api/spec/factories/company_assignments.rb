FactoryBot.define do
  factory :company_assignment do
    user
    company
    role_in_company { nil }
  end
end
