class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
    include Devise::JWT::RevocationStrategies::JTIMatcher
  
    devise :database_authenticatable,
     :recoverable,
     :rememberable,
     :validatable,
     :jwt_authenticatable,
     jwt_revocation_strategy: self
  
  enum :role, { super_admin: 0, admin: 1 }, default: :admin
  enum :status, { active: 0, disabled: 1 }, default: :active
  
  belongs_to :employee, optional: true
  has_many :uploaded_documents, class_name: "EmployeeDocument", foreign_key: :uploaded_by_id, dependent: :nullify
  
  validates :username, uniqueness: true, allow_nil: true
  
  audited
end
