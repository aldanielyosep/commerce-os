FactoryBot.define do
  factory :company do
    sequence(:code) { |n| "COMP#{n}-#{SecureRandom.hex(2)}" }
    sequence(:name) { |n| "Company #{n}" }
    sequence(:owner_name) { |n| "Owner #{n}" }
    sequence(:email) { |n| "company#{n}-#{SecureRandom.hex(2)}@example.com" }
    phone { "+628123450001" }
    company_type { :individual }
    status { :active }

    trait :pt do
      company_type { :pt }
      company_registration_number { "REG-001" }
      nib { "NIB-001" }
    end

    trait :cv do
      company_type { :cv }
      company_registration_number { "REG-002" }
      nib { "NIB-002" }
    end
  end
end
