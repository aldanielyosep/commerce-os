class ProductVariantPolicy < ApplicationPolicy
  def index?
    admin_or_super_admin?
  end

  def show?
    super_admin? || company_in_scope?
  end

  def create?
    return false unless admin_or_super_admin?
    return true if super_admin?

    company_id = record.product&.company_id
    return false if company_id.blank?

    user.company_assignments.kept.exists?(company_id: company_id)
  end

  def update?
    super_admin? || company_in_scope?
  end

  def destroy?
    super_admin? || company_in_scope?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless user
      return scope.all if user.super_admin?
      return scope.none unless user.admin? || user.admin_company?

      scope.where(company_id: user.company_assignments.kept.select(:company_id))
    end
  end

  private

  def company_in_scope?
    return false unless record.respond_to?(:product)
    return false unless company_admin?

    company_id = record.product&.company_id
    return false if company_id.blank?

    user.company_assignments.kept.exists?(company_id: company_id)
  end
end
