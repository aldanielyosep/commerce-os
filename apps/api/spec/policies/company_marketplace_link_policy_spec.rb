require "rails_helper"

RSpec.describe CompanyMarketplaceLinkPolicy, type: :policy do
  subject(:policy) { described_class.new(user, company_marketplace_link) }

  let(:company_marketplace_link) { create(:company_marketplace_link) }

  it "allows all actions for admin" do
    user = create(:user)

    permission_map = {
      index: policy_for(user).index?,
      show: policy_for(user).show?,
      create: policy_for(user).create?,
      update: policy_for(user).update?,
      destroy: policy_for(user).destroy?
    }

    expect(permission_map).to eq(
      {
        index: true,
        show: true,
        create: true,
        update: true,
        destroy: true
      }
    )
  end

  it "allows all actions for super admin" do
    user = create(:user, :super_admin)

    permission_map = {
      index: policy_for(user).index?,
      show: policy_for(user).show?,
      create: policy_for(user).create?,
      update: policy_for(user).update?,
      destroy: policy_for(user).destroy?
    }

    expect(permission_map).to eq(
      {
        index: true,
        show: true,
        create: true,
        update: true,
        destroy: true
      }
    )
  end

  it "denies all actions for nil user" do
    permission_map = {
      index: policy_for(nil).index?,
      show: policy_for(nil).show?,
      create: policy_for(nil).create?,
      update: policy_for(nil).update?,
      destroy: policy_for(nil).destroy?
    }

    expect(permission_map).to eq(
      {
        index: false,
        show: false,
        create: false,
        update: false,
        destroy: false
      }
    )
  end

  def policy_for(target_user)
    described_class.new(target_user, company_marketplace_link)
  end
end
