require "rails_helper"

RSpec.describe Department do
  it "is valid with factory defaults" do
    expect(build(:department)).to be_valid
  end

  it "requires code" do
    department = build(:department, code: nil)

    expect(department).not_to be_valid
  end

  it "requires name" do
    department = build(:department, name: nil)

    expect(department).not_to be_valid
  end

  it "enforces code uniqueness" do
    create(:department, code: "ADMIN")
    duplicate = build(:department, code: "ADMIN")

    expect(duplicate).not_to be_valid
  end

  it "limits code length to 20 characters" do
    department = build(:department, code: "A" * 21)

    expect(department).not_to be_valid
  end
end
