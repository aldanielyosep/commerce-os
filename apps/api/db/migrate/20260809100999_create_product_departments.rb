class CreateProductDepartments < ActiveRecord::Migration[8.1]
  def change
    create_table :product_departments do |t|
      t.string :code, null: false
      t.string :name, null: false
      t.datetime :discarded_at
      t.references :created_by, foreign_key: { to_table: :users }
      t.references :updated_by, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :product_departments, :code, unique: true, where: "discarded_at IS NULL"
    add_index :product_departments, :discarded_at
  end
end
