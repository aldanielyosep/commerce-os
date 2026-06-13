class CreatePositionHistories < ActiveRecord::Migration[8.1]
  def change
    create_table :position_histories do |t|
      t.references :employee, null: false, foreign_key: true
      t.references :department, foreign_key: true
      t.string :position, null: false
      t.date :effective_date, null: false
      t.text :notes

      t.timestamps
    end

    add_index :position_histories, :effective_date
  end
end
