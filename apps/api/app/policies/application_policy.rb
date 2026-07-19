class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    false
  end

  def show?
    false
  end

  def create?
    false
  end

  def new?
    create?
  end

  def update?
    false
  end

  def edit?
    update?
  end

  def destroy?
    false
  end

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      return scope.none unless user
      return scope.all if company_admin_or_super_admin?

      scope.none
    end

    private

    def company_admin_or_super_admin?
      user&.super_admin? || user&.admin? || user&.admin_company?
    end
  end

  private

  def super_admin?
    !!user&.super_admin?
  end

  def admin_or_super_admin?
    company_admin_or_super_admin?
  end

  def company_admin?
    !!(user&.admin? || user&.admin_company?)
  end

  def company_admin_or_super_admin?
    !!(super_admin? || company_admin?)
  end
end
