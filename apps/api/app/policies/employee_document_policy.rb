class EmployeeDocumentPolicy < ApplicationPolicy
  def index?
    admin_or_super_admin?
  end

  def show?
    admin_or_super_admin?
  end

  def create?
    admin_or_super_admin?
  end

  def update?
    admin_or_super_admin?
  end

  def destroy?
    admin_or_super_admin?
  end

  def download?
    show?
  end

  def archive?
    destroy?
  end
end
