require "rails_helper"

RSpec.describe SalaryRecord do
  it "is valid with factory defaults" do
    expect(build(:salary_record)).to be_valid
  end

  it "requires positive basic salary" do
    record = build(:salary_record, basic_salary_cents: 0)

    expect(record).not_to be_valid
  end

  it "requires non-negative allowance and bonus" do
    record = build(:salary_record, allowance_cents: -1, bonus_cents: -1)

    expect(record).not_to be_valid
  end

  it "requires effective date" do
    record = build(:salary_record, effective_date: nil)

    expect(record).not_to be_valid
  end

  it "enforces unique effective date per employee" do
    existing = create(:salary_record)
    duplicate = build(:salary_record, employee: existing.employee, effective_date: existing.effective_date)

    expect(duplicate).not_to be_valid
  end

  it "rejects overlapping ranges for the same employee" do
    employee = create(:employee)
    create(:salary_record, employee: employee, effective_date: Date.new(2026, 1, 1), end_date: Date.new(2026, 12, 31))

    overlap = build(:salary_record, employee: employee, effective_date: Date.new(2026, 6, 1),
                                    end_date: Date.new(2026, 12, 31))

    expect(overlap).not_to be_valid
    expect(overlap.errors[:base]).to include("salary date range overlaps an existing record")
  end

  it "allows non-overlapping ranges for the same employee" do
    employee = create(:employee)
    create(:salary_record, employee: employee, effective_date: Date.new(2026, 1, 1), end_date: Date.new(2026, 6, 30))

    non_overlap = build(:salary_record, employee: employee, effective_date: Date.new(2026, 7, 1), end_date: nil)

    expect(non_overlap).to be_valid
  end
end
