require "rails_helper"

RSpec.describe CompanyPolicy, type: :policy do
  subject(:policy) { described_class.new(user, company) }

  let(:company) { create(:company) }

  describe "permissions" do
    context "when user is super admin" do
      let(:user) { create(:user, :super_admin) }

      it "allows all company actions" do
        expect(policy.index?).to be(true)
        expect(policy.show?).to be(true)
        expect(policy.create?).to be(true)
        expect(policy.update?).to be(true)
        expect(policy.destroy?).to be(true)
        expect(policy.upload_logo?).to be(true)
        expect(policy.manage_marketplaces?).to be(true)
      end
    end

    context "when user is assigned admin" do
      let(:user) { create(:user) }

      before do
        create(:company_assignment, user: user, company: company)
      end

      it "allows scoped access" do
        expect(policy.index?).to be(true)
        expect(policy.show?).to be(true)
        expect(policy.create?).to be(true)
        expect(policy.update?).to be(true)
        expect(policy.destroy?).to be(true)
        expect(policy.upload_logo?).to be(true)
        expect(policy.manage_marketplaces?).to be(true)
      end
    end

    context "when user is admin without assignment" do
      let(:user) { create(:user) }

      it "denies company-scoped actions" do
        expect(policy.index?).to be(true)
        expect(policy.show?).to be(false)
        expect(policy.create?).to be(true)
        expect(policy.update?).to be(false)
        expect(policy.destroy?).to be(false)
        expect(policy.upload_logo?).to be(false)
        expect(policy.manage_marketplaces?).to be(false)
      end
    end
  end

  describe CompanyPolicy::Scope do
    let!(:company_one) { create(:company, name: "Alpha Store") }
    let!(:company_two) { create(:company, name: "Beta Store") }

    context "when user is super admin" do
      let(:user) { create(:user, :super_admin) }

      it "returns all companies" do
        scope = described_class.new(user, Company.kept)

        expect(scope.resolve).to match_array([company_one, company_two])
      end
    end

    context "when user is assigned to one company" do
      let(:user) { create(:user) }

      before do
        create(:company_assignment, user: user, company: company_one)
      end

      it "returns only assigned companies" do
        scope = described_class.new(user, Company.kept)

        expect(scope.resolve).to match_array([company_one])
      end
    end
  end
end