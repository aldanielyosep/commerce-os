require "rails_helper"

RSpec.describe User do
  let(:user) { build(:user) }

  it "is valid with valid attributes" do
    expect(user).to be_valid
  end

  it "is invalid without email" do
    user.email = nil
    expect(user).not_to be_valid
  end

  it "is invalid without password" do
    user.password = nil
    expect(user).not_to be_valid
  end

  it "uses JTIMatcher JWT revocation strategy" do
    expect(described_class.included_modules).to include(Devise::JWT::RevocationStrategies::JTIMatcher)
  end

  it "generates jti for persisted users" do
    persisted_user = create(:user)

    expect(persisted_user.jti).to be_present
  end
end
