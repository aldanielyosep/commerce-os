class AddHumanAttributionColumns < ActiveRecord::Migration[8.1]
  DOMAIN_TABLES = %i[
    employees
    departments
    employee_departments
    employee_documents
    position_histories
    salary_records
  ].freeze

  def change
    DOMAIN_TABLES.each do |table_name|
      add_reference table_name, :created_by, foreign_key: { to_table: :users }
      add_reference table_name, :updated_by, foreign_key: { to_table: :users }
    end
  end
end