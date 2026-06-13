class CreateEmployees < ActiveRecord::Migration[8.1]
  def change
    create_table :employees do |t|
      t.string :employee_id, null: false
      t.string :full_name, null: false
      t.integer :gender, null: false
      t.date :birth_date, null: false
      t.date :join_date, null: false
      t.date :termination_date
      t.integer :status, null: false, default: 0
      t.string :identity_number, null: false
      t.string :phone_number, null: false
      t.string :email, null: false
      t.text :address, null: false
      t.string :city, null: false
      t.string :postal_code, null: false
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :employees, :employee_id, unique: true
    add_index :employees, :identity_number, unique: true
    add_index :employees, :email, unique: true
    add_index :employees, :status
    add_index :employees, :discarded_at
  end
end