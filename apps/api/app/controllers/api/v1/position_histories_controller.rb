module Api
  module V1
    class PositionHistoriesController < BaseController
      before_action :set_employee
      before_action :set_position_history, only: :update

      def index
        authorize PositionHistory

        histories = @employee.position_histories.includes(:department).order(effective_date: :desc, id: :desc)
        render_success(PositionHistoryBlueprint.render_as_hash(histories))
      end

      def create
        authorize PositionHistory

        history = @employee.position_histories.new(position_history_params)
        history.department = find_department(position_history_params[:department_id]) if position_history_params[:department_id].present?

        if history.save
          render_success(PositionHistoryBlueprint.render_as_hash(history), status: :created)
        else
          render_error("Unable to save position history", errors: history.errors.full_messages)
        end
      end

      def update
        authorize @position_history

        attrs = position_history_params.except(:department_id)
        attrs[:department] = find_department(position_history_params[:department_id]) if position_history_params.key?(:department_id)

        if @position_history.update(attrs)
          render_success(PositionHistoryBlueprint.render_as_hash(@position_history))
        else
          render_error("Unable to update position history", errors: @position_history.errors.full_messages)
        end
      end

      private

      def set_employee
        @employee = scoped_records(Employee.kept).find(params.expect(:employee_id))
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
    end
  end
end
