FactoryBot.define do
  factory :product_variant do
    product
    company { product.company }
    sequence(:sku) { |n| "SKU-#{n.to_s.rjust(4, '0')}" }
    sequence(:barcode) { |n| "BC-#{n.to_s.rjust(4, '0')}" }
    status { :active }
    current_price { 990 }
    current_stock { 50 }
  end

  factory :product_variant_attribute do
    product_variant
    name { "ukuran" }
    value { "M" }
  end
end
