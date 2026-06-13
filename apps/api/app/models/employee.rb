class Employee < ApplicationRecord
  include Discard::Model
  include HumanAttribution

  EMPLOYEE_ID_MIN_DIGITS = 4

  enum :gender, { male: 0, female: 1 }
  enum :status, { active: 0, probation: 1, resigned: 2, terminated: 3, retired: 4 }, default: :active

  has_many :employee_departments, dependent: :destroy
  has_many :departments, through: :employee_departments
  has_many :position_histories, dependent: :destroy
  has_many :salary_records, dependent: :destroy
  has_many :employee_documents, dependent: :destroy
  has_one :user, dependent: :nullify

  before_validation :assign_employee_id, on: :create

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

  private

  def assign_employee_id
    return if employee_id.present?

    prefix = ENV.fetch("EMPLOYEE_ID_PREFIX", "B").strip.upcase
    prefix = "B" if prefix.blank?

    next_number = next_employee_id_sequence_value
    self.employee_id = "#{prefix}#{next_number.to_s.rjust(EMPLOYEE_ID_MIN_DIGITS, '0')}"
  end

  def next_employee_id_sequence_value
    self.class.connection.execute("CREATE SEQUENCE IF NOT EXISTS employee_id_seq START 1 INCREMENT 1")
    self.class.connection.select_value("SELECT nextval('employee_id_seq')").to_i
  end
end
