module Api
  module V1
    class SalaryRecordsController < BaseController
      before_action :set_employee
      before_action :set_salary_record, only: :update

      def index
        authorize SalaryRecord

        records = @employee.salary_records.order(effective_date: :desc, id: :desc)
        render_success(SalaryRecordBlueprint.render_as_hash(records))
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
    end
  end
end
