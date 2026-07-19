module Api
  module V1
    class UsersController < BaseController
      ORDERABLE_FIELDS = {
        "id" => :id,
        "email" => :email,
        "username" => :username,
        "role" => :role,
        "status" => :status,
        "created_at" => :created_at
      }.freeze

      before_action :set_user, only: %i[show update destroy enable disable change_role reset_password]

      def index
        authorize User

        pagy_record, users = paginate_collection(filtered_users)
        render_success(UserBlueprint.render_as_hash(users), meta: pagination_meta(pagy_record))
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

      def filtered_users
        scope = scoped_records(User)
        scope = filter_by_query(scope)
        apply_order(scope)
      end

      def filter_by_query(scope)
        query_term = params.fetch(:q, nil)
        return scope if query_term.blank?

        query = "%#{query_term.strip}%"
        search_clause = [
          "users.email ILIKE :query",
          "users.username ILIKE :query",
          "employees.employee_id ILIKE :query",
          "employees.full_name ILIKE :query"
        ].join(" OR ")

        scope.left_joins(:employee).where(
          search_clause,
          query: query
        )
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(params.fetch(:order_by, "id"), ORDERABLE_FIELDS.fetch("id"))
        order_direction = normalized_order_direction(params[:order_dir])

        scope.order(order_column => order_direction, id: :asc)
      end
    end
  end
end
