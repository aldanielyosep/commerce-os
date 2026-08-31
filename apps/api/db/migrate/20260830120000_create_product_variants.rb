class CreateProductVariants < ActiveRecord::Migration[8.1]
  def change
    create_table :product_variants do |t|
      t.references :company, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.string :sku, null: false
      t.string :barcode, null: false
      t.integer :status, null: false, default: 0
      t.decimal :current_price, precision: 12, scale: 2, default: 0.0, null: false
      t.integer :current_stock, null: false, default: 0
      t.datetime :discarded_at

      t.timestamps
    end

    create_table :product_variant_attributes do |t|
      t.references :product_variant, null: false, foreign_key: true
      t.string :name, null: false
      t.string :value, null: false

      t.timestamps
    end

    create_table :product_variant_images do |t|
      t.references :product_variant, null: false, foreign_key: true
      t.string :image_url, null: false
      t.boolean :is_cover, null: false, default: false
      t.integer :position, null: false, default: 0
      t.datetime :discarded_at

      t.timestamps
    end

    create_table :variant_price_histories do |t|
      t.references :product_variant, null: false, foreign_key: true
      t.decimal :price, precision: 12, scale: 2, null: false
      t.datetime :effective_from, null: false
      t.datetime :effective_to
      t.string :reason
      t.references :changed_by, foreign_key: { to_table: :users }

      t.timestamps
    end

    create_table :variant_stock_ledgers do |t|
      t.references :product_variant, null: false, foreign_key: true
      t.string :event_type, null: false
      t.integer :delta, null: false
      t.string :reason
      t.integer :previous_stock, null: false
      t.integer :new_stock, null: false

      t.timestamps
    end

    add_index :product_variants, [ :company_id, :sku ], unique: true
    add_index :product_variants, [ :company_id, :barcode ], unique: true
    add_index :product_variants, :status
    add_index :product_variants, :discarded_at

    add_index :product_variant_attributes, [ :product_variant_id, :name, :value ], unique: true
    add_index :product_variant_attributes, :name
    add_index :product_variant_images, :position
    add_index :product_variant_images, :discarded_at
    add_index :variant_price_histories, [ :product_variant_id, :effective_from ], unique: true
    add_index :variant_stock_ledgers, [ :product_variant_id, :created_at ]
  end
end
