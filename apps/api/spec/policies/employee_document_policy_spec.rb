require "rails_helper"

RSpec.describe EmployeeDocumentPolicy, type: :policy do
  subject(:policy) { described_class.new(user, EmployeeDocument.new) }

  context "when user is admin" do
    let(:user) { build(:user) }

    it "allows all actions" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.update?).to be(true)
      expect(policy.destroy?).to be(true)
    end
  end

  context "when user is super admin" do
    let(:user) { build(:user, :super_admin) }

    it "allows all actions" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.update?).to be(true)
      expect(policy.destroy?).to be(true)
    end
  end

  context "when user is nil" do
    let(:user) { nil }

    it "denies all actions" do
      expect(policy.index?).to be(false)
      expect(policy.show?).to be(false)
      expect(policy.create?).to be(false)
      expect(policy.update?).to be(false)
      expect(policy.destroy?).to be(false)
    end
  end
end
