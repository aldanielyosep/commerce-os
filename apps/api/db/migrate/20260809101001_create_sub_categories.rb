class CreateSubCategories < ActiveRecord::Migration[8.1]
  def change
    create_table :sub_categories do |t|
      t.references :category, null: false, foreign_key: true
      t.string :name, null: false
      t.datetime :discarded_at
      t.references :created_by, foreign_key: { to_table: :users }
      t.references :updated_by, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :sub_categories, [ :category_id, :name ], unique: true, where: "discarded_at IS NULL"
    add_index :sub_categories, :discarded_at
  end
end
