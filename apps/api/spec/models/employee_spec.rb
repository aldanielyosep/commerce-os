require "rails_helper"

RSpec.describe Employee do
  around do |example|
    CurrentRequest.reset
    example.run
    CurrentRequest.reset
  end

  it "is valid with factory defaults" do
    expect(build(:employee)).to be_valid
  end

  it "generates employee_id with default prefix" do
    employee = create(:employee)

    expect(employee.employee_id).to match(/^B\d{4,}$/)
  end

  it "uses ENV prefix for generated employee_id" do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("EMPLOYEE_ID_PREFIX", "B").and_return("x")

    employee = create(:employee)

    expect(employee.employee_id).to match(/^X\d{4,}$/)
  end

  it "assigns created_by and updated_by from CurrentRequest.user on create" do
    actor = create(:user)
    CurrentRequest.user = actor

    employee = create(:employee)

    expect(employee.created_by).to eq(actor)
    expect(employee.updated_by).to eq(actor)
  end

  it "updates updated_by when CurrentRequest.user changes" do
    creator = create(:user)
    updater = create(:user)

    CurrentRequest.user = creator
    employee = create(:employee)

    CurrentRequest.user = updater
    employee.update!(full_name: "Updated Employee")

    expect(employee.created_by).to eq(creator)
    expect(employee.updated_by).to eq(updater)
  end
end
