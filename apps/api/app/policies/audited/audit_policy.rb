module Audited
  class AuditPolicy < ApplicationPolicy
    def index?
      super_admin?
    end

    def show?
      super_admin?
    end

    class Scope < ApplicationPolicy::Scope
      def resolve
        return scope.none unless user&.super_admin?

        scope.all
      end
    end
  end
end
