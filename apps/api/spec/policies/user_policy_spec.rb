require "rails_helper"

RSpec.describe UserPolicy, type: :policy do
  subject(:policy) { described_class.new(user, build(:user)) }

  context "when user is super admin" do
    let(:user) { build(:user, :super_admin) }

    it "allows user administration actions" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.update?).to be(true)
      expect(policy.change_role?).to be(true)
      expect(policy.enable?).to be(true)
      expect(policy.disable?).to be(true)
      expect(policy.reset_password?).to be(true)
    end
  end

  context "when user is admin" do
    let(:user) { build(:user) }

    it "denies user administration actions" do
      expect(policy.index?).to be(false)
      expect(policy.show?).to be(false)
      expect(policy.create?).to be(false)
      expect(policy.update?).to be(false)
      expect(policy.change_role?).to be(false)
      expect(policy.enable?).to be(false)
      expect(policy.disable?).to be(false)
      expect(policy.reset_password?).to be(false)
    end
  end
end
