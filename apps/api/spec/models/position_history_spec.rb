require "rails_helper"

RSpec.describe PositionHistory do
  it "is valid with factory defaults" do
    expect(build(:position_history)).to be_valid
  end

  it "requires position" do
    history = build(:position_history, position: nil)

    expect(history).not_to be_valid
  end

  it "requires effective_date" do
    history = build(:position_history, effective_date: nil)

    expect(history).not_to be_valid
  end

  it "allows missing department" do
    history = build(:position_history, department: nil)

    expect(history).to be_valid
  end
end
