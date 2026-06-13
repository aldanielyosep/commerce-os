require "rails_helper"

RSpec.describe Authenticable do
  let(:controller_class) do
    Class.new(ActionController::API) do
      include Authenticable

      attr_accessor :current_user_stub, :sign_out_called_with, :render_error_args

      def authenticate_user!; end

      def current_user
        current_user_stub
      end

      def sign_out(user)
        self.sign_out_called_with = user
      end

      def render_error(message, status:)
        self.render_error_args = [ message, status ]
      end
    end
  end

  it "registers required before actions" do
    callbacks = controller_class._process_action_callbacks.map(&:filter)

    expect(callbacks).to include(:authenticate_user!)
    expect(callbacks).to include(:ensure_active_user!)
  end

  it "does nothing when user is active" do
    controller = controller_class.new
    controller.current_user_stub = instance_double(User, active?: true)

    controller.send(:ensure_active_user!)

    expect(controller.sign_out_called_with).to be_nil
    expect(controller.render_error_args).to be_nil
  end

  it "signs out and renders forbidden when user is disabled" do
    disabled_user = instance_double(User, active?: false)
    controller = controller_class.new
    controller.current_user_stub = disabled_user

    controller.send(:ensure_active_user!)

    expect(controller.sign_out_called_with).to eq(disabled_user)
    expect(controller.render_error_args).to eq([ "User account is disabled", :forbidden ])
  end

  it "renders forbidden when user is missing" do
    controller = controller_class.new
    controller.current_user_stub = nil

    controller.send(:ensure_active_user!)

    expect(controller.sign_out_called_with).to be_nil
    expect(controller.render_error_args).to eq([ "User account is disabled", :forbidden ])
  end
end
