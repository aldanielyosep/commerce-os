class CreateCategories < ActiveRecord::Migration[8.1]
  def change
    create_table :categories do |t|
      t.references :product_department, null: false, foreign_key: true
      t.string :name, null: false
      t.datetime :discarded_at
      t.references :created_by, foreign_key: { to_table: :users }
      t.references :updated_by, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :categories, [ :product_department_id, :name ], unique: true, where: "discarded_at IS NULL"
    add_index :categories, :discarded_at
  end
end
