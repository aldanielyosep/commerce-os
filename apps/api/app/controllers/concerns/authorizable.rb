module Authorizable
  extend ActiveSupport::Concern

  private

  def scoped_records(scope)
    policy_scope(scope)
  end
end