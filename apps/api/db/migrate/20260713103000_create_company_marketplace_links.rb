class CreateCompanyMarketplaceLinks < ActiveRecord::Migration[8.1]
  def change
    create_table :company_marketplace_links do |t|
      t.references :company, null: false, foreign_key: true
      t.integer :marketplace, null: false
      t.string :store_name, null: false
      t.string :store_url, null: false
      t.boolean :is_active, null: false, default: true
      t.datetime :discarded_at
      t.references :created_by, foreign_key: { to_table: :users }
      t.references :updated_by, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :company_marketplace_links,
              %i[company_id marketplace],
              unique: true,
              where: "discarded_at IS NULL",
              name: "index_company_marketplace_links_on_company_and_marketplace"
    add_index :company_marketplace_links, :discarded_at
  end
end
