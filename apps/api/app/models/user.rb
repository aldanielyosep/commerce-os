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

  enum :role, {
    super_admin: 0,
    admin: 1,
    admin_company: 2,
    admin_storefront_ops: 3
  }, default: :admin
  enum :status, { active: 0, disabled: 1 }, default: :active

  belongs_to :employee, optional: true
  has_many :refresh_tokens, dependent: :destroy
  has_many :company_assignments, dependent: :destroy
  has_many :assigned_companies, through: :company_assignments, source: :company
  has_many :created_company_assignments,
           class_name: "CompanyAssignment",
           foreign_key: :created_by_id,
           inverse_of: :created_by,
           dependent: :nullify
  has_many :updated_company_assignments,
           class_name: "CompanyAssignment",
           foreign_key: :updated_by_id,
           inverse_of: :updated_by,
           dependent: :nullify
  has_many :uploaded_documents,
           class_name: "EmployeeDocument",
           foreign_key: :uploaded_by_id,
           inverse_of: :uploaded_by,
           dependent: :nullify
  has_many :created_employees,
           class_name: "Employee",
           foreign_key: :created_by_id,
           inverse_of: :created_by,
           dependent: :nullify
  has_many :updated_employees,
           class_name: "Employee",
           foreign_key: :updated_by_id,
           inverse_of: :updated_by,
           dependent: :nullify
  has_many :created_departments,
           class_name: "Department",
           foreign_key: :created_by_id,
           inverse_of: :created_by,
           dependent: :nullify
  has_many :updated_departments,
           class_name: "Department",
           foreign_key: :updated_by_id,
           inverse_of: :updated_by,
           dependent: :nullify
  has_many :created_employee_departments,
           class_name: "EmployeeDepartment",
           foreign_key: :created_by_id,
           inverse_of: :created_by,
           dependent: :nullify
  has_many :updated_employee_departments,
           class_name: "EmployeeDepartment",
           foreign_key: :updated_by_id,
           inverse_of: :updated_by,
           dependent: :nullify
  has_many :created_employee_documents,
           class_name: "EmployeeDocument",
           foreign_key: :created_by_id,
           inverse_of: :created_by,
           dependent: :nullify
  has_many :updated_employee_documents,
           class_name: "EmployeeDocument",
           foreign_key: :updated_by_id,
           inverse_of: :updated_by,
           dependent: :nullify
  has_many :created_position_histories,
           class_name: "PositionHistory",
           foreign_key: :created_by_id,
           inverse_of: :created_by,
           dependent: :nullify
  has_many :updated_position_histories,
           class_name: "PositionHistory",
           foreign_key: :updated_by_id,
           inverse_of: :updated_by,
           dependent: :nullify
  has_many :created_salary_records,
           class_name: "SalaryRecord",
           foreign_key: :created_by_id,
           inverse_of: :created_by,
           dependent: :nullify
  has_many :updated_salary_records,
           class_name: "SalaryRecord",
           foreign_key: :updated_by_id,
           inverse_of: :updated_by,
           dependent: :nullify

  validates :username, uniqueness: true, allow_nil: true

  audited
end
