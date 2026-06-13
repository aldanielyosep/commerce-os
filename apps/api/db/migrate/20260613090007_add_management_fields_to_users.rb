class AddManagementFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_reference :users, :employee, foreign_key: true
    add_column :users, :username, :string
    add_column :users, :role, :integer, null: false, default: 1
    add_column :users, :status, :integer, null: false, default: 0

    add_index :users, :username, unique: true
    add_index :users, :role
    add_index :users, :status
  end
end
