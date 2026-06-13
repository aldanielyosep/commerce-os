require "rails_helper"

RSpec.describe UserPolicy, type: :policy do
  subject(:policy) { described_class.new(user, build(:user)) }

  context "when user is super admin" do
    let(:user) { build(:user, :super_admin) }

    it "allows core user management actions" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.update?).to be(true)
      expect(policy.destroy?).to be(true)
    end

    it "allows privileged account actions" do
      expect(policy.change_role?).to be(true)
      expect(policy.enable?).to be(true)
      expect(policy.disable?).to be(true)
      expect(policy.reset_password?).to be(true)
    end
  end

  context "when user is admin" do
    let(:user) { build(:user) }

    it "denies core user management actions" do
      expect(policy.index?).to be(false)
      expect(policy.show?).to be(false)
      expect(policy.create?).to be(false)
      expect(policy.update?).to be(false)
      expect(policy.destroy?).to be(false)
    end

    it "denies privileged account actions" do
      expect(policy.change_role?).to be(false)
      expect(policy.enable?).to be(false)
      expect(policy.disable?).to be(false)
      expect(policy.reset_password?).to be(false)
    end
  end

  describe UserPolicy::Scope do
    it "returns all for super admin" do
      scope = described_class.new(create(:user, :super_admin), User.all)

      expect(scope.resolve.to_sql).to eq(User.all.to_sql)
    end

    it "returns none for admin" do
      scope = described_class.new(create(:user), User.all)

      expect(scope.resolve).to be_empty
    end

    it "returns none for nil user" do
      scope = described_class.new(nil, User.all)

      expect(scope.resolve).to be_empty
    end
  end
end
