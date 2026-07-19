require "rails_helper"

RSpec.describe CompanyAssignmentPolicy, type: :policy do
  subject(:policy) { described_class.new(user, assignment) }

  let(:assignment) { create(:company_assignment) }

  context "when user is super admin" do
    let(:user) { create(:user, :super_admin) }

    it "allows assignment management actions" do
      expect(permission_map(policy)).to eq(
        {
          index: true,
          show: true,
          create: true,
          update: true,
          destroy: true,
          bulk_upsert: true
        }
      )
    end
  end

  context "when user is admin" do
    let(:user) { create(:user) }

    it "denies assignment management actions" do
      expect(permission_map(policy)).to eq(
        {
          index: false,
          show: false,
          create: false,
          update: false,
          destroy: false,
          bulk_upsert: false
        }
      )
    end
  end

  describe CompanyAssignmentPolicy::Scope do
    let!(:assignment_one) { create(:company_assignment) }
    let!(:assignment_two) { create(:company_assignment) }

    it "returns all for super admin" do
      scope = described_class.new(create(:user, :super_admin), CompanyAssignment.kept)

      expect(scope.resolve).to contain_exactly(assignment_one, assignment_two)
    end

    it "returns none for admin" do
      scope = described_class.new(create(:user), CompanyAssignment.kept)

      expect(scope.resolve).to be_empty
    end

    it "returns none for nil user" do
      scope = described_class.new(nil, CompanyAssignment.kept)

      expect(scope.resolve).to be_empty
    end
  end

  def permission_map(policy)
    {
      index: policy.index?,
      show: policy.show?,
      create: policy.create?,
      update: policy.update?,
      destroy: policy.destroy?,
      bulk_upsert: policy.bulk_upsert?
    }
  end
end
