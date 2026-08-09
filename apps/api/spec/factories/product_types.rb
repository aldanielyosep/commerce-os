FactoryBot.define do
  factory :product_type do
    sub_category
    sequence(:name) { |n| "Product Type #{n}" }
  end
end
