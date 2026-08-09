FactoryBot.define do
  factory :category do
    product_department
    sequence(:name) { |n| "Category #{n}" }
  end
end
