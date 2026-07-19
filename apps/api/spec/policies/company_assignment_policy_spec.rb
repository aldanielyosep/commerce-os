require "rails_helper"

RSpec.describe CompanyAssignmentPolicy, type: :policy do
  subject(:policy) { described_class.new(user, assignment) }

  let(:assignment) { create(:company_assignment) }

  context "when user is super admin" do
    let(:user) { create(:user, :super_admin) }

    it "allows assignment management actions" do
      expect(policy.index?).to be(true)
      expect(policy.show?).to be(true)
      expect(policy.create?).to be(true)
      expect(policy.update?).to be(true)
      expect(policy.destroy?).to be(true)
      expect(policy.bulk_upsert?).to be(true)
    end
  end

  context "when user is admin" do
    let(:user) { create(:user) }

    it "denies assignment management actions" do
      expect(policy.index?).to be(false)
      expect(policy.show?).to be(false)
      expect(policy.create?).to be(false)
      expect(policy.update?).to be(false)
      expect(policy.destroy?).to be(false)
      expect(policy.bulk_upsert?).to be(false)
    end
  end

  describe CompanyAssignmentPolicy::Scope do
    let!(:assignment_one) { create(:company_assignment) }
    let!(:assignment_two) { create(:company_assignment) }

    it "returns all for super admin" do
      scope = CompanyAssignmentPolicy::Scope.new(create(:user, :super_admin), CompanyAssignment.kept)

      expect(scope.resolve).to match_array([assignment_one, assignment_two])
    end

    it "returns none for admin" do
      scope = CompanyAssignmentPolicy::Scope.new(create(:user), CompanyAssignment.kept)

      expect(scope.resolve).to be_empty
    end

    it "returns none for nil user" do
      scope = CompanyAssignmentPolicy::Scope.new(nil, CompanyAssignment.kept)

      expect(scope.resolve).to be_empty
    end
  end
end