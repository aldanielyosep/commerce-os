module HumanAttribution
  extend ActiveSupport::Concern

  included do
    belongs_to :created_by, class_name: "User", optional: true
    belongs_to :updated_by, class_name: "User", optional: true

    before_validation :assign_created_by, on: :create
    before_validation :assign_updated_by
  end

  private

  def assign_created_by
    return if created_by_id.present? || CurrentRequest.user.nil?

    self.created_by = CurrentRequest.user
  end

  def assign_updated_by
    return if CurrentRequest.user.nil?

    self.updated_by = CurrentRequest.user
  end
end
