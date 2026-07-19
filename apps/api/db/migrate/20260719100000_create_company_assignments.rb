class CreateCompanyAssignments < ActiveRecord::Migration[8.1]
  def change
    create_table :company_assignments do |t|
      t.references :user, null: false, foreign_key: true
      t.references :company, null: false, foreign_key: true
      t.string :role_in_company
      t.datetime :discarded_at
      t.references :created_by, foreign_key: { to_table: :users }
      t.references :updated_by, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :company_assignments,
              %i[user_id company_id],
              unique: true,
              where: "discarded_at IS NULL",
              name: "index_company_assignments_on_user_and_company"
    add_index :company_assignments, :discarded_at
  end
end