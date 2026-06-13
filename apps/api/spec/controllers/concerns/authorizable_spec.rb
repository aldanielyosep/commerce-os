require "rails_helper"

RSpec.describe Authorizable do
  let(:host_class) do
    Class.new do
      include Authorizable

      attr_accessor :policy_scope_arg

      def policy_scope(scope)
        self.policy_scope_arg = scope
        [ :ok ]
      end
    end
  end

  it "delegates scoped_records to policy_scope" do
    host = host_class.new
    result = host.send(:scoped_records, User)

    expect(host.policy_scope_arg).to eq(User)
    expect(result).to eq([ :ok ])
  end
end
