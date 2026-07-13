class CreateCompanies < ActiveRecord::Migration[8.1]
  def change
    create_table :companies do |t|
      t.string :code, null: false
      t.string :name, null: false
      t.string :owner_name, null: false
      t.integer :company_type, null: false
      t.string :email, null: false
      t.string :phone, null: false
      t.string :website
      t.text :description
      t.text :address
      t.string :province
      t.string :city
      t.string :postal_code
      t.decimal :latitude, precision: 10, scale: 8
      t.decimal :longitude, precision: 11, scale: 8
      t.integer :status, null: false, default: 0
      t.string :company_registration_number
      t.string :nib
      t.string :siup
      t.string :deed_number
      t.string :pkp_number
      t.datetime :discarded_at
      t.references :created_by, foreign_key: { to_table: :users }
      t.references :updated_by, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :companies, :code, unique: true
    add_index :companies, :status
    add_index :companies, :discarded_at
    add_index :companies, :company_type
  end
end