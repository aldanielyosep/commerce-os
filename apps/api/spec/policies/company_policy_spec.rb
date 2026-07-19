require "rails_helper"

RSpec.describe CompanyPolicy, type: :policy do
  subject(:policy) { described_class.new(user, company) }

  let(:company) { create(:company) }

  describe "permissions" do
    context "when user is super admin" do
      let(:user) { create(:user, :super_admin) }

      it "allows all company actions" do
        expect(permission_map(policy)).to eq(
          {
            index: true,
            show: true,
            create: true,
            update: true,
            destroy: true,
            upload_logo: true,
            manage_marketplaces: true
          }
        )
      end
    end

    context "when user is assigned admin" do
      let(:user) { create(:user) }

      before do
        create(:company_assignment, user: user, company: company)
      end

      it "allows scoped access" do
        expect(permission_map(policy)).to eq(
          {
            index: true,
            show: true,
            create: true,
            update: true,
            destroy: true,
            upload_logo: true,
            manage_marketplaces: true
          }
        )
      end
    end

    context "when user is admin without assignment" do
      let(:user) { create(:user) }

      it "denies company-scoped actions" do
        expect(permission_map(policy)).to eq(
          {
            index: true,
            show: false,
            create: true,
            update: false,
            destroy: false,
            upload_logo: false,
            manage_marketplaces: false
          }
        )
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

        expect(scope.resolve).to contain_exactly(company_one, company_two)
      end
    end

    context "when user is assigned to one company" do
      let(:user) { create(:user) }

      before do
        create(:company_assignment, user: user, company: company_one)
      end

      it "returns only assigned companies" do
        scope = described_class.new(user, Company.kept)

        expect(scope.resolve).to contain_exactly(company_one)
      end
    end
  end

  def permission_map(policy)
    {
      index: policy.index?,
      show: policy.show?,
      create: policy.create?,
      update: policy.update?,
      destroy: policy.destroy?,
      upload_logo: policy.upload_logo?,
      manage_marketplaces: policy.manage_marketplaces?
    }
  end
end
