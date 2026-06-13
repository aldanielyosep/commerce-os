class UserPolicy < ApplicationPolicy
  def index?
    super_admin?
  end

  def show?
    super_admin?
  end

  def create?
    super_admin?
  end

  def update?
    super_admin?
  end

  def destroy?
    super_admin?
  end

  def change_role?
    super_admin?
  end

  def enable?
    super_admin?
  end

  def disable?
    super_admin?
  end

  def reset_password?
    super_admin?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless user&.super_admin?

      scope.all
    end
  end
end
