# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_06_13_110012) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "audits", force: :cascade do |t|
    t.string "action"
    t.integer "associated_id"
    t.string "associated_type"
    t.integer "auditable_id"
    t.string "auditable_type"
    t.jsonb "audited_changes"
    t.string "comment"
    t.datetime "created_at"
    t.string "remote_address"
    t.string "request_uuid"
    t.integer "user_id"
    t.string "user_type"
    t.string "username"
    t.integer "version", default: 0
    t.index ["associated_type", "associated_id"], name: "associated_index"
    t.index ["auditable_type", "auditable_id", "version"], name: "auditable_index"
    t.index ["created_at"], name: "index_audits_on_created_at"
    t.index ["request_uuid"], name: "index_audits_on_request_uuid"
    t.index ["user_id", "user_type"], name: "user_index"
  end

  create_table "departments", force: :cascade do |t|
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.bigint "created_by_id"
    t.datetime "discarded_at"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.bigint "updated_by_id"
    t.index ["code"], name: "index_departments_on_code", unique: true
    t.index ["created_by_id"], name: "index_departments_on_created_by_id"
    t.index ["discarded_at"], name: "index_departments_on_discarded_at"
    t.index ["updated_by_id"], name: "index_departments_on_updated_by_id"
  end

  create_table "employee_departments", force: :cascade do |t|
    t.date "assigned_date", null: false
    t.datetime "created_at", null: false
    t.bigint "created_by_id"
    t.bigint "department_id", null: false
    t.datetime "discarded_at"
    t.bigint "employee_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "updated_by_id"
    t.index ["created_by_id"], name: "index_employee_departments_on_created_by_id"
    t.index ["department_id"], name: "index_employee_departments_on_department_id"
    t.index ["discarded_at"], name: "index_employee_departments_on_discarded_at"
    t.index ["employee_id", "department_id"], name: "index_employee_departments_on_employee_id_and_department_id", unique: true
    t.index ["employee_id"], name: "index_employee_departments_on_employee_id"
    t.index ["updated_by_id"], name: "index_employee_departments_on_updated_by_id"
  end

  create_table "employee_documents", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "created_by_id"
    t.datetime "discarded_at"
    t.integer "document_type", null: false
    t.bigint "employee_id", null: false
    t.date "expiry_date"
    t.text "notes"
    t.datetime "updated_at", null: false
    t.bigint "updated_by_id"
    t.bigint "uploaded_by_id", null: false
    t.index ["created_by_id"], name: "index_employee_documents_on_created_by_id"
    t.index ["discarded_at"], name: "index_employee_documents_on_discarded_at"
    t.index ["document_type"], name: "index_employee_documents_on_document_type"
    t.index ["employee_id"], name: "index_employee_documents_on_employee_id"
    t.index ["updated_by_id"], name: "index_employee_documents_on_updated_by_id"
    t.index ["uploaded_by_id"], name: "index_employee_documents_on_uploaded_by_id"
  end

  create_table "employees", force: :cascade do |t|
    t.text "address", null: false
    t.date "birth_date", null: false
    t.string "city", null: false
    t.datetime "created_at", null: false
    t.bigint "created_by_id"
    t.datetime "discarded_at"
    t.string "email", null: false
    t.string "employee_id", null: false
    t.string "full_name", null: false
    t.integer "gender", null: false
    t.string "identity_number", null: false
    t.date "join_date", null: false
    t.string "phone_number", null: false
    t.string "postal_code", null: false
    t.integer "status", default: 0, null: false
    t.date "termination_date"
    t.datetime "updated_at", null: false
    t.bigint "updated_by_id"
    t.index ["created_by_id"], name: "index_employees_on_created_by_id"
    t.index ["discarded_at"], name: "index_employees_on_discarded_at"
    t.index ["email"], name: "index_employees_on_email", unique: true
    t.index ["employee_id"], name: "index_employees_on_employee_id", unique: true
    t.index ["identity_number"], name: "index_employees_on_identity_number", unique: true
    t.index ["status"], name: "index_employees_on_status"
    t.index ["updated_by_id"], name: "index_employees_on_updated_by_id"
  end

  create_table "position_histories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "created_by_id"
    t.bigint "department_id"
    t.date "effective_date", null: false
    t.bigint "employee_id", null: false
    t.text "notes"
    t.string "position", null: false
    t.datetime "updated_at", null: false
    t.bigint "updated_by_id"
    t.index ["created_by_id"], name: "index_position_histories_on_created_by_id"
    t.index ["department_id"], name: "index_position_histories_on_department_id"
    t.index ["effective_date"], name: "index_position_histories_on_effective_date"
    t.index ["employee_id"], name: "index_position_histories_on_employee_id"
    t.index ["updated_by_id"], name: "index_position_histories_on_updated_by_id"
  end

  create_table "salary_records", force: :cascade do |t|
    t.integer "allowance_cents", default: 0, null: false
    t.integer "basic_salary_cents", null: false
    t.integer "bonus_cents", default: 0, null: false
    t.datetime "created_at", null: false
    t.bigint "created_by_id"
    t.date "effective_date", null: false
    t.bigint "employee_id", null: false
    t.date "end_date"
    t.text "notes"
    t.datetime "updated_at", null: false
    t.bigint "updated_by_id"
    t.index ["created_by_id"], name: "index_salary_records_on_created_by_id"
    t.index ["employee_id", "effective_date"], name: "index_salary_records_on_employee_id_and_effective_date", unique: true
    t.index ["employee_id"], name: "index_salary_records_on_employee_id"
    t.index ["end_date"], name: "index_salary_records_on_end_date"
    t.index ["updated_by_id"], name: "index_salary_records_on_updated_by_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.bigint "employee_id"
    t.string "encrypted_password", default: "", null: false
    t.string "jti", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "role", default: 1, null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.string "username"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["employee_id"], name: "index_users_on_employee_id"
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
    t.index ["status"], name: "index_users_on_status"
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "departments", "users", column: "created_by_id"
  add_foreign_key "departments", "users", column: "updated_by_id"
  add_foreign_key "employee_departments", "departments"
  add_foreign_key "employee_departments", "employees"
  add_foreign_key "employee_departments", "users", column: "created_by_id"
  add_foreign_key "employee_departments", "users", column: "updated_by_id"
  add_foreign_key "employee_documents", "employees"
  add_foreign_key "employee_documents", "users", column: "created_by_id"
  add_foreign_key "employee_documents", "users", column: "updated_by_id"
  add_foreign_key "employee_documents", "users", column: "uploaded_by_id"
  add_foreign_key "employees", "users", column: "created_by_id"
  add_foreign_key "employees", "users", column: "updated_by_id"
  add_foreign_key "position_histories", "departments"
  add_foreign_key "position_histories", "employees"
  add_foreign_key "position_histories", "users", column: "created_by_id"
  add_foreign_key "position_histories", "users", column: "updated_by_id"
  add_foreign_key "salary_records", "employees"
  add_foreign_key "salary_records", "users", column: "created_by_id"
  add_foreign_key "salary_records", "users", column: "updated_by_id"
  add_foreign_key "users", "employees"
end
