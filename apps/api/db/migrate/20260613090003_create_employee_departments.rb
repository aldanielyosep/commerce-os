class CreateEmployeeDepartments < ActiveRecord::Migration[8.1]
  def change
    create_table :employee_departments do |t|
      t.references :employee, null: false, foreign_key: true
      t.references :department, null: false, foreign_key: true
      t.date :assigned_date, null: false
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :employee_departments, %i[employee_id department_id], unique: true
    add_index :employee_departments, :discarded_at
  end
end
