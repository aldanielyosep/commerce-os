FactoryBot.define do
  factory :product_department do
    sequence(:code) { |n| "PDEPT#{n}" }
    sequence(:name) { |n| "Product Department #{n}" }
  end
end
