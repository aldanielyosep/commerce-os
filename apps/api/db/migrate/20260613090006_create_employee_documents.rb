class CreateEmployeeDocuments < ActiveRecord::Migration[8.1]
  def change
    create_table :employee_documents do |t|
      t.references :employee, null: false, foreign_key: true
      t.integer :document_type, null: false
      t.references :uploaded_by, null: false, foreign_key: { to_table: :users }
      t.date :expiry_date
      t.text :notes
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :employee_documents, :discarded_at
    add_index :employee_documents, :document_type
  end
end