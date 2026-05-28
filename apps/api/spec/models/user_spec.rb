require 'rails_helper'

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
end
