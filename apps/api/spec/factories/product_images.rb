require "stringio"

FactoryBot.define do
  factory :product_image do
    product
    alt_text { "Product image" }
    is_cover { false }
    sequence(:position) { |n| n }

    after(:build) do |record|
      next if record.image.attached?

      record.image.attach(
        io: StringIO.new("fake png content"),
        filename: "product.png",
        content_type: "image/png"
      )
    end
  end
end
