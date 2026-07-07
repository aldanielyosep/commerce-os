module Api
  module V1
    class UsersController < BaseController
      before_action :set_user, only: %i[show update destroy enable disable change_role reset_password]

      def index
        authorize User

        users = scoped_records(User.includes(:employee)).order(:id)
        render_success(UserBlueprint.render_as_hash(users))
      end

      def show
        authorize @user

        render_success(UserBlueprint.render_as_hash(@user))
      end

      def create
        authorize User

        if create_params[:role] == "super_admin"
          return render_error("Unable to create user",
                              errors: [ "Creating super admin users is not allowed" ])
        end

        user = User.new(create_params)

        if user.save
          render_success(UserBlueprint.render_as_hash(user), status: :created)
        else
          render_error("Unable to create user", errors: user.errors.full_messages)
        end
      end

      def update
        authorize @user

        if @user.update(update_params)
          render_success(UserBlueprint.render_as_hash(@user))
        else
          render_error("Unable to update user", errors: @user.errors.full_messages)
        end
      end

      def destroy
        authorize @user

        if @user == current_user
          return render_error("Unable to delete user",
                              errors: [ "You cannot delete your own account" ])
        end

        @user.destroy!
        render_success({ id: @user.id, deleted: true })
      end

      def enable
        authorize @user, :enable?

        if @user.update(status: :active)
          render_success(UserBlueprint.render_as_hash(@user))
        else
          render_error("Unable to enable user", errors: @user.errors.full_messages)
        end
      end

      def disable
        authorize @user, :disable?

        if @user == current_user
          return render_error("Unable to disable user",
                              errors: [ "You cannot disable your own account" ])
        end

        if @user.update(status: :disabled)
          render_success(UserBlueprint.render_as_hash(@user))
        else
          render_error("Unable to disable user", errors: @user.errors.full_messages)
        end
      end

      def change_role
        authorize @user, :change_role?

        role = change_role_params[:role]
        if role == "super_admin" && !@user.super_admin?
          return render_error("Unable to change role", errors: [ "Promoting users to super admin is not allowed" ])
        end

        if @user.update(role: role)
          render_success(UserBlueprint.render_as_hash(@user))
        else
          render_error("Unable to change role", errors: @user.errors.full_messages)
        end
      end

      def reset_password
        authorize @user, :reset_password?

        @user.send_reset_password_instructions
        render_success({ id: @user.id, reset_password_sent: true })
      end

      private

      def set_user
        @user = scoped_records(User).find(params.expect(:id))
      end

      def create_params
        params.expect(user: %i[email username password password_confirmation employee_id role status])
      end

      def update_params
        params.expect(user: %i[email username employee_id])
      end

      def change_role_params
        params.expect(user: [ :role ])
      end
    end
  end
end
