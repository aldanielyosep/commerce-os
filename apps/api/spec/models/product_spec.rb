require "rails_helper"

RSpec.describe Product do
  describe "validations" do
    it "is valid with factory defaults" do
      expect(build(:product)).to be_valid
    end

    it "rejects invalid description_richtext type" do
      product = build(:product, description_richtext: { type: "paragraph", content: [] })

      expect(product).not_to be_valid
      expect(product.errors[:description_richtext]).to include("is invalid")
    end

    it "rejects non-hash description_richtext" do
      product = build(:product, description_richtext: "plain text")

      expect(product).not_to be_valid
      expect(product.errors[:description_richtext]).to include("is invalid")
    end

    it "rejects product_code changes on update" do
      product = create(:product)

      product.product_code = "P9999999"

      expect(product).not_to be_valid
      expect(product.errors[:product_code]).to include("is system-generated and cannot be changed")
    end
  end

  describe "callbacks" do
    it "assigns product code from generator when blank" do
      company = create(:company)
      product = build(:product, company: company, product_code: nil)

      allow(ProductCodeGenerator).to receive(:next_for).with(company).and_return("P7654321")

      product.validate

      expect(product.product_code).to eq("P7654321")
    end

    it "falls back to product slug when product_name is blank" do
      product = build(:product, product_name: nil)

      product.validate

      expect(product.slug).to eq("product")
    end

    it "adds suffix to keep slug unique per company" do
      company = create(:company)
      create(:product, company: company, product_name: "Same Name", slug: "same-name")
      product = create(:product, company: company, product_name: "Same Name", slug: nil, product_code: nil)

      expect(product.slug).to eq("same-name-2")
    end
  end

  describe "status transitions" do
    it "activates when cover image exists" do
      product = create(:product, status: :draft)
      create(:product_image, product: product, is_cover: true)

      expect(product.activate!).to be(true)
      expect(product.reload).to be_active
    end

    it "fails activation without cover image" do
      product = create(:product, status: :draft)

      expect(product.activate!).to be(false)
      expect(product.errors[:base]).to include("product must have one cover image before activation")
    end

    it "deactivates product" do
      product = create(:product, status: :active)

      expect(product.deactivate!).to be(true)
      expect(product.reload).to be_inactive
    end
  end
end
