class AddFileSequenceToEmployeeDocuments < ActiveRecord::Migration[8.1]
  def change
    add_column :employee_documents, :file_sequence, :integer

    add_index :employee_documents,
              %i[employee_id file_sequence],
              unique: true,
              where: "file_sequence IS NOT NULL",
              name: "index_employee_documents_on_employee_id_and_file_sequence"
  end
end
