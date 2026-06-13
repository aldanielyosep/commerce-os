require "rails_helper"

RSpec.describe Audited::AuditPolicy, type: :policy do
  subject(:policy) { described_class.new(user, Audited::Audit.new) }

  context "when user is super admin" do
    let(:user) { build(:user, :super_admin) }

    it "allows index and show" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
    end

    it "scope resolves all" do
      scope = described_class::Scope.new(user, User.all)

      expect(scope.resolve.to_sql).to eq(User.all.to_sql)
    end
  end

  context "when user is admin" do
    let(:user) { build(:user) }

    it "denies index and show" do
      expect(policy.index?).to be(false)
      expect(policy.show?).to be(false)
    end

    it "scope resolves none" do
      scope = described_class::Scope.new(user, User.all)

      expect(scope.resolve).to be_empty
    end
  end
end
