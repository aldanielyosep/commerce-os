require "rails_helper"
require "stringio"

RSpec.describe ProductImage do
  let(:product) { create(:product) }

  def build_image(content_type: "image/png", size: 10)
    image = described_class.new(product: product, alt_text: "img", is_cover: false)
    image.image.attach(
      io: StringIO.new("a" * size),
      filename: "photo.png",
      content_type: content_type
    )
    image
  end

  it "is valid with factory defaults" do
    expect(build(:product_image)).to be_valid
  end

  it "requires an attached image" do
    image = described_class.new(product: product, alt_text: "img", is_cover: false)

    expect(image).not_to be_valid
    expect(image.errors[:image]).to include("must be attached")
  end

  it "rejects unsupported extension" do
    image = build_image(content_type: "text/plain")

    expect(image).not_to be_valid
    expect(image.errors[:image]).to include("extension is not allowed (jpg, jpeg, png, webp)")
  end

  it "rejects files larger than 5 MB" do
    image = build_image(size: 5.megabytes + 1)

    expect(image).not_to be_valid
    expect(image.errors[:image]).to include("size exceeds 5 MB")
  end

  it "rejects images below minimum dimensions" do
    image = build_image
    allow(image).to receive(:read_dimensions).and_return([900, 900])

    expect(image).not_to be_valid
    expect(image.errors[:image]).to include("minimum dimension is 1000x1000")
  end

  it "normalizes position on create when missing" do
    image = build_image
    image.position = nil
    allow(image).to receive(:next_position).and_return(7)

    image.send(:normalize_position)

    expect(image.position).to eq(7)
  end

  it "unsets other cover images for same product" do
    current_cover = create(:product_image, product: product, is_cover: true)
    new_cover = create(:product_image, product: product, is_cover: true)

    expect(new_cover.reload.is_cover).to be(true)
    expect(current_cover.reload.is_cover).to be(false)
  end
end
