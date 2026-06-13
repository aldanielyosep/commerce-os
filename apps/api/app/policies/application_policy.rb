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
      return scope.all if user.super_admin? || user.admin?

      scope.none
    end
  end

  private

  def super_admin?
    !!user&.super_admin?
  end

  def admin_or_super_admin?
    !!(user&.admin? || user&.super_admin?)
  end
end
