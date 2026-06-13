require "rails_helper"

RSpec.describe EmployeeDepartment do
  it "is valid with factory defaults" do
    expect(build(:employee_department)).to be_valid
  end

  it "requires assigned_date" do
    record = build(:employee_department, assigned_date: nil)

    expect(record).not_to be_valid
  end

  it "enforces unique employee-department pair" do
    existing = create(:employee_department)
    duplicate = build(:employee_department, employee: existing.employee, department: existing.department)

    expect(duplicate).not_to be_valid
  end
end
