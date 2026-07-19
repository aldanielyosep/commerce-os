class CompanyPolicy < ApplicationPolicy
  def index?
    admin_or_super_admin?
  end

  def show?
    super_admin? || company_in_scope?
  end

  def create?
    admin_or_super_admin?
  end

  def update?
    super_admin? || company_in_scope?
  end

  def destroy?
    super_admin? || company_in_scope?
  end

  def upload_logo?
    super_admin? || company_in_scope?
  end

  def manage_marketplaces?
    super_admin? || company_in_scope?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless user
      return scope.all if user.super_admin?
      return scope.none unless user.admin?

      scope.joins(:company_assignments).where(company_assignments: { user_id: user.id }).distinct
    end
  end

  private

  def company_in_scope?
    return false unless record.is_a?(Company)
    return false unless user&.admin?

    user.company_assignments.kept.exists?(company_id: record.id)
  end
end
