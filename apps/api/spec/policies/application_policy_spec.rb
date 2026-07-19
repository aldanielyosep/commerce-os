require "rails_helper"

RSpec.describe ApplicationPolicy, type: :policy do
  subject(:policy) { described_class.new(user, User.new) }

  context "when using default permissions" do
    let(:user) { build(:user) }

    it "denies index/show/create/update/destroy" do
      expect(policy.index?).to be(false)
      expect(policy.show?).to be(false)
      expect(policy.create?).to be(false)
      expect(policy.update?).to be(false)
      expect(policy.destroy?).to be(false)
    end

    it "delegates new? to create?" do
      expect(policy.new?).to eq(policy.create?)
    end

    it "delegates edit? to update?" do
      expect(policy.edit?).to eq(policy.update?)
    end
  end

  describe ApplicationPolicy::Scope do
    context "when user is nil" do
      it "returns empty scope" do
        scope = described_class.new(nil, User.all)

        expect(scope.resolve).to be_empty
      end
    end

    context "when user is admin" do
      let(:user) { create(:user) }

      it "returns full scope" do
        scope = described_class.new(user, User.all)

        expect(scope.resolve.to_sql).to eq(User.all.to_sql)
      end
    end

    context "when user is admin_company" do
      let(:user) { create(:user, :admin_company) }

      it "returns full scope" do
        scope = described_class.new(user, User.all)

        expect(scope.resolve.to_sql).to eq(User.all.to_sql)
      end
    end

    context "when user is super admin" do
      let(:user) { create(:user, :super_admin) }

      it "returns full scope" do
        scope = described_class.new(user, User.all)

        expect(scope.resolve.to_sql).to eq(User.all.to_sql)
      end
    end

    context "when user is disabled admin" do
      let(:user) { create(:user, :disabled) }

      it "still resolves by role" do
        scope = described_class.new(user, User.all)

        expect(scope.resolve.to_sql).to eq(User.all.to_sql)
      end
    end

    context "when user is admin_storefront_ops" do
      let(:user) { create(:user, :admin_storefront_ops) }

      it "returns empty scope" do
        scope = described_class.new(user, User.all)

        expect(scope.resolve).to be_empty
      end
    end
  end
end
