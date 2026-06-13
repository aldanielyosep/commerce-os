class CreateSalaryRecords < ActiveRecord::Migration[8.1]
  def change
    create_table :salary_records do |t|
      t.references :employee, null: false, foreign_key: true
      t.integer :basic_salary_cents, null: false
      t.integer :allowance_cents, null: false, default: 0
      t.integer :bonus_cents, null: false, default: 0
      t.date :effective_date, null: false
      t.date :end_date
      t.text :notes

      t.timestamps
    end

    add_index :salary_records, %i[employee_id effective_date], unique: true
    add_index :salary_records, :end_date
  end
end
