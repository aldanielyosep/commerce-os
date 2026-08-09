FactoryBot.define do
  factory :sub_category do
    category
    sequence(:name) { |n| "Sub Category #{n}" }
  end
end
