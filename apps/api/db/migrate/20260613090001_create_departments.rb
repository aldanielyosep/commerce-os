class CreateDepartments < ActiveRecord::Migration[8.1]
  def change
    create_table :departments do |t|
      t.string :code, null: false
      t.string :name, null: false
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :departments, :code, unique: true
    add_index :departments, :discarded_at
  end
end
