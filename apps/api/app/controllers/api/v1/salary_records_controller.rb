module Api
  module V1
    class SalaryRecordsController < BaseController
      ORDERABLE_FIELDS = {
        "effective_date" => "salary_records.effective_date",
        "basic_salary_cents" => "salary_records.basic_salary_cents",
        "created_at" => "salary_records.created_at"
      }.freeze

      before_action :set_employee
      before_action :set_salary_record, only: :update

      def index
        authorize SalaryRecord

        pagy_record, records = paginate_collection(apply_order(@employee.salary_records))
        render_success(SalaryRecordBlueprint.render_as_hash(records), meta: pagination_meta(pagy_record))
      end

      def create
        authorize SalaryRecord

        record = @employee.salary_records.new(salary_record_params)

        if record.save
          render_success(SalaryRecordBlueprint.render_as_hash(record), status: :created)
        else
          render_error("Unable to save salary record", errors: record.errors.full_messages)
        end
      end

      def update
        authorize @salary_record

        if @salary_record.update(salary_record_params)
          render_success(SalaryRecordBlueprint.render_as_hash(@salary_record))
        else
          render_error("Unable to update salary record", errors: @salary_record.errors.full_messages)
        end
      end

      private

      def set_employee
        @employee = scoped_records(Employee.kept).find(params.expect(:employee_id))
      end

      def set_salary_record
        @salary_record = @employee.salary_records.find(params.expect(:id))
      end

      def salary_record_params
        params.expect(salary_record: %i[basic_salary_cents allowance_cents bonus_cents effective_date end_date notes])
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(
          params.fetch(:order_by, "effective_date"),
          ORDERABLE_FIELDS.fetch("effective_date")
        )
        order_direction = params.key?(:order_dir) ? normalized_order_direction(params[:order_dir]) : :desc

        scope.order(Arel.sql("#{order_column} #{order_direction}, salary_records.id desc"))
      end
    end
  end
end
