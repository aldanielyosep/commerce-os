class CreateEmployeeIdSequence < ActiveRecord::Migration[8.1]
  def up
    execute "CREATE SEQUENCE IF NOT EXISTS employee_id_seq START 1 INCREMENT 1"
  end

  def down
    execute "DROP SEQUENCE IF EXISTS employee_id_seq"
  end
end