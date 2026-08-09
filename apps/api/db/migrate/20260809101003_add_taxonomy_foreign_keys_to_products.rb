class AddTaxonomyForeignKeysToProducts < ActiveRecord::Migration[8.1]
  def change
    add_foreign_key :products, :product_departments, column: :department_id
    add_foreign_key :products, :categories
    add_foreign_key :products, :sub_categories
    add_foreign_key :products, :product_types

    add_index :products, :department_id
    add_index :products, :category_id
    add_index :products, :sub_category_id
    add_index :products, :product_type_id
  end
end
