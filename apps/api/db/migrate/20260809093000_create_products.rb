class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.references :company, null: false, foreign_key: true
      t.string :product_code, null: false
      t.string :slug, null: false
      t.string :product_name, null: false
      t.bigint :department_id, null: false
      t.bigint :category_id, null: false
      t.bigint :sub_category_id, null: false
      t.bigint :product_type_id, null: false
      t.text :short_description, null: false
      t.jsonb :description_richtext, null: false, default: {}
      t.text :description_html
      t.text :description_text
      t.integer :status, null: false, default: 0
      t.datetime :discarded_at
      t.references :created_by, foreign_key: { to_table: :users }
      t.references :updated_by, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :products, [ :company_id, :product_code ], unique: true
    add_index :products, [ :company_id, :slug ], unique: true
    add_index :products, :status
    add_index :products, :discarded_at
  end
end
