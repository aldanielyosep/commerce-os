class SalaryRecord < ApplicationRecord
  belongs_to :employee

  monetize :basic_salary_cents
  monetize :allowance_cents
  monetize :bonus_cents

  validates :basic_salary_cents, numericality: { greater_than: 0 }
  validates :allowance_cents, numericality: { greater_than_or_equal_to: 0 }
  validates :bonus_cents, numericality: { greater_than_or_equal_to: 0 }
  validates :effective_date, presence: true
  validates :effective_date, uniqueness: { scope: :employee_id }
  validate :non_overlapping_range

  audited

  private

  def non_overlapping_range
    return if effective_date.blank?

    current_start = effective_date
    current_end = end_date || Date.new(9999, 12, 31)

    overlaps = SalaryRecord.where(employee_id: employee_id).where.not(id: id).any? do |record|
      record_start = record.effective_date
      record_end = record.end_date || Date.new(9999, 12, 31)

      current_start <= record_end && record_start <= current_end
    end

    return unless overlaps

    errors.add(:base, "salary date range overlaps an existing record")
  end
end
