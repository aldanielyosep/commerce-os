class CompanyAssignment < ApplicationRecord
  include Discard::Model
  include HumanAttribution

  audited

  belongs_to :user
  belongs_to :company

  validates :user_id, uniqueness: { scope: :company_id, conditions: -> { kept } }
end