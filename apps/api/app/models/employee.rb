class Employee < ApplicationRecord
  include Discard::Model

  enum :gender, { male: 0, female: 1 }
  enum :status, { active: 0, probation: 1, resigned: 2, terminated: 3, retired: 4 }, default: :active

  has_many :employee_departments, dependent: :destroy
  has_many :departments, through: :employee_departments
  has_many :position_histories, dependent: :destroy
  has_many :salary_records, dependent: :destroy
  has_many :employee_documents, dependent: :destroy
  has_one :user, dependent: :nullify

  phony_normalize :phone_number, default_country_code: "ID"

  validates :employee_id, presence: true, uniqueness: true
  validates :full_name, presence: true
  validates :gender, presence: true
  validates :birth_date, presence: true
  validates :join_date, presence: true
  validates :status, presence: true
  validates :identity_number, presence: true, uniqueness: true
  validates :phone_number, presence: true, phony_plausible: true
  validates :email, presence: true, uniqueness: true
  validates :address, presence: true
  validates :city, presence: true
  validates :postal_code, presence: true

  audited
end
