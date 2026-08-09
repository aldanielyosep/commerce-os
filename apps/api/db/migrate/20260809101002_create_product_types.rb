class CreateProductTypes < ActiveRecord::Migration[8.1]
  def change
    create_table :product_types do |t|
      t.references :sub_category, null: false, foreign_key: true
      t.string :name, null: false
      t.datetime :discarded_at
      t.references :created_by, foreign_key: { to_table: :users }
      t.references :updated_by, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :product_types, [ :sub_category_id, :name ], unique: true, where: "discarded_at IS NULL"
    add_index :product_types, :discarded_at
  end
end
