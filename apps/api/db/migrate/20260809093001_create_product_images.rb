class CreateProductImages < ActiveRecord::Migration[8.1]
  def change
    create_table :product_images do |t|
      t.references :product, null: false, foreign_key: true
      t.text :alt_text
      t.boolean :is_cover, null: false, default: false
      t.integer :position, null: false, default: 1
      t.datetime :discarded_at
      t.references :created_by, foreign_key: { to_table: :users }
      t.references :updated_by, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :product_images, :discarded_at
    add_index :product_images, [ :product_id, :position ]
    add_index :product_images, [ :product_id, :is_cover ],
              unique: true,
              where: "is_cover = true AND discarded_at IS NULL",
              name: "index_product_images_unique_cover_per_product"
  end
end
