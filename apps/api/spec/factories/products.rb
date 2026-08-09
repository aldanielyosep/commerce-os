FactoryBot.define do
  factory :product do
    company
    product_type

    sequence(:product_code) { |n| "P#{n.to_s.rjust(7, '0')}" }
    sequence(:slug) { |n| "product-#{n}" }
    sequence(:product_name) { |n| "Product #{n}" }

    product_department { product_type.sub_category.category.product_department }
    category { product_type.sub_category.category }
    sub_category { product_type.sub_category }
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
