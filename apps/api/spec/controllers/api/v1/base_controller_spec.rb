require "rails_helper"

RSpec.describe Api::V1::BaseController do
  it "inherits from ApplicationController" do
    expect(described_class < ApplicationController).to be(true)
  end

  it "includes Authenticable" do
    expect(described_class.ancestors).to include(Authenticable)
  end

  it "includes Authorizable" do
    expect(described_class.ancestors).to include(Authorizable)
  end
end
