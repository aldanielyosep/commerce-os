require "rails_helper"

RSpec.describe ProductTypePolicy, type: :policy do
  subject(:policy) { described_class.new(user, ProductType.new) }

  context "when user is super admin" do
    let(:user) { build(:user, :super_admin) }

    it "allows all product type actions" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.update?).to be(true)
      expect(policy.destroy?).to be(true)
    end
  end

  context "when user is admin" do
    let(:user) { build(:user) }

    it "allows all product type actions" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.update?).to be(true)
      expect(policy.destroy?).to be(true)
    end
  end

  context "when user is admin_company" do
    let(:user) { build(:user, :admin_company) }

    it "allows all product type actions" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.update?).to be(true)
      expect(policy.destroy?).to be(true)
    end
  end

  context "when user is admin_storefront_ops" do
    let(:user) { build(:user, :admin_storefront_ops) }

    it "denies all product type actions" do
      expect(policy.index?).to be(false)
      expect(policy.show?).to be(false)
      expect(policy.create?).to be(false)
      expect(policy.update?).to be(false)
      expect(policy.destroy?).to be(false)
    end
  end

  context "when user is nil" do
    let(:user) { nil }

    it "denies all product type actions" do
      expect(policy.index?).to be(false)
      expect(policy.show?).to be(false)
      expect(policy.create?).to be(false)
      expect(policy.update?).to be(false)
      expect(policy.destroy?).to be(false)
    end
  end
end
