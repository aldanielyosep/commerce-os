FactoryBot.define do
  factory :product do
    association :company

    sequence(:product_code) { |n| "P#{n.to_s.rjust(7, '0')}" }
    sequence(:slug) { |n| "product-#{n}" }
    sequence(:product_name) { |n| "Product #{n}" }

    department_id { 10 }
    category_id { 20 }
    sub_category_id { 30 }
    product_type_id { 40 }
    short_description { "Product short description" }
    description_richtext do
      {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Product description" }
            ]
          }
        ]
      }
    end
    status { :draft }
  end
end
