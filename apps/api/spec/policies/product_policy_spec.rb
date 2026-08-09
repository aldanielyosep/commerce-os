require "rails_helper"

# rubocop:disable RSpec/MultipleMemoizedHelpers
RSpec.describe ProductPolicy, type: :policy do
  subject(:policy) { described_class.new(user, product) }

  let(:company) { create(:company) }
  let(:other_company) { create(:company) }
  let(:product) { create(:product, company: company) }

  describe "permissions" do
    context "when user is super admin" do
      let(:user) { create(:user, :super_admin) }

      # rubocop:disable RSpec/MultipleExpectations
      it "allows all actions" do
        expect(policy.index?).to be(true)
        expect(policy.show?).to be(true)
        expect(policy.create?).to be(true)
        expect(policy.update?).to be(true)
        expect(policy.destroy?).to be(true)
        expect(policy.restore?).to be(true)
        expect(policy.activate?).to be(true)
        expect(policy.deactivate?).to be(true)
      end
      # rubocop:enable RSpec/MultipleExpectations
    end

    context "when user is assigned to company" do
      let(:user) { create(:user) }

      before do
        create(:company_assignment, user: user, company: company)
      end

      it "allows in-scope actions" do
        expect(policy.index?).to be(true)
        expect(policy.show?).to be(true)
        expect(policy.update?).to be(true)
        expect(policy.destroy?).to be(true)
      end
    end

    context "when user is not assigned to company" do
      let(:user) { create(:user) }

      it "denies record actions" do
        expect(policy.show?).to be(false)
        expect(policy.update?).to be(false)
        expect(policy.destroy?).to be(false)
      end
    end

    context "when creating with explicit company" do
      let(:user) { create(:user) }
      let(:product) do
        Product.new(company: company, product_name: "New", short_description: "Desc", department_id: 1, category_id: 1,
                    sub_category_id: 1, product_type_id: 1, description_richtext: { type: "doc", content: [] })
      end

      it "allows create only for assigned company" do
        create(:company_assignment, user: user, company: company)
        expect(policy.create?).to be(true)

        product.company = other_company
        expect(described_class.new(user, product).create?).to be(false)
      end
    end
  end

  describe ProductPolicy::Scope do
    let!(:product_one) { create(:product, company: company) }
    let!(:product_two) { create(:product, company: other_company) }

    context "when user is super admin" do
      let(:user) { create(:user, :super_admin) }

      it "returns all products" do
        scope = described_class.new(user, Product.kept)
        expect(scope.resolve).to contain_exactly(product_one, product_two)
      end
    end

    context "when user is assigned to one company" do
      let(:user) { create(:user) }

      before do
        create(:company_assignment, user: user, company: company)
      end

      it "returns only assigned company products" do
        scope = described_class.new(user, Product.kept)
        expect(scope.resolve).to contain_exactly(product_one)
      end
    end
  end
end
# rubocop:enable RSpec/MultipleMemoizedHelpers
