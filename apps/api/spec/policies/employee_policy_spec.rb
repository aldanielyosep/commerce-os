require "rails_helper"

RSpec.describe EmployeePolicy, type: :policy do
  subject(:policy) { described_class.new(user, Employee.new) }

  context "when user is super admin" do
    let(:user) { build(:user, :super_admin) }

    it "allows non-destructive employee actions" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.update?).to be(true)
    end

    it "allows destructive employee actions" do
      expect(policy.terminate?).to be(true)
      expect(policy.destroy?).to be(true)
    end
  end

  context "when user is admin" do
    let(:user) { build(:user) }

    it "allows read/write actions" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.update?).to be(true)
    end

    it "blocks destructive actions" do
      expect(policy.terminate?).to be(false)
      expect(policy.destroy?).to be(false)
    end
  end

  context "when user is nil" do
    let(:user) { nil }

    it "denies access" do
      expect(policy.index?).to be(false)
      expect(policy.create?).to be(false)
      expect(policy.update?).to be(false)
    end
  end
end
