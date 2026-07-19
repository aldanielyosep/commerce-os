module Api
  module V1
    class PositionHistoriesController < BaseController
      ORDERABLE_FIELDS = {
        "effective_date" => "position_histories.effective_date",
        "position" => "position_histories.position",
        "created_at" => "position_histories.created_at"
      }.freeze

      before_action :set_employee
      before_action :set_position_history, only: :update

      def index
        authorize PositionHistory

        pagy_record, histories = paginate_collection(apply_order(@employee.position_histories.includes(:department)))
        render_success(PositionHistoryBlueprint.render_as_hash(histories), meta: pagination_meta(pagy_record))
      end

      def create
        authorize PositionHistory

        history = @employee.position_histories.new(position_history_params)
        if position_history_params[:department_id].present?
          history.department = find_department(position_history_params[:department_id])
        end

        if history.save
          render_success(PositionHistoryBlueprint.render_as_hash(history), status: :created)
        else
          render_error("Unable to save position history", errors: history.errors.full_messages)
        end
      end

      def update
        authorize @position_history

        attrs = position_history_params.except(:department_id)
        if position_history_params.key?(:department_id)
          attrs[:department] =
            find_department(position_history_params[:department_id])
        end

        if @position_history.update(attrs)
          render_success(PositionHistoryBlueprint.render_as_hash(@position_history))
        else
          render_error("Unable to update position history", errors: @position_history.errors.full_messages)
        end
      end

      private

      def set_employee
        @employee = Employee.kept.find(params.expect(:employee_id))
      end

      def set_position_history
        @position_history = @employee.position_histories.find(params.expect(:id))
      end

      def find_department(department_id)
        Department.kept.find(department_id)
      end

      def position_history_params
        params.expect(position_history: %i[position department_id effective_date notes])
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(
          params.fetch(:order_by, "effective_date"),
          ORDERABLE_FIELDS.fetch("effective_date")
        )
        order_direction = params.key?(:order_dir) ? normalized_order_direction(params[:order_dir]) : :desc

        scope.order(Arel.sql("#{order_column} #{order_direction}, position_histories.id desc"))
      end
    end
  end
end
