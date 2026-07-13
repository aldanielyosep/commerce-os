FactoryBot.define do
  factory :company_marketplace_link do
    company
    marketplace { :shopee }
    sequence(:store_name) { |n| "Store #{n}" }
    sequence(:store_url) { |n| "https://store#{n}.example.com" }
    is_active { true }
  end
end
