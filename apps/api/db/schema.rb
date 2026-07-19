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

ActiveRecord::Schema[8.1].define(version: 2026_07_19_160000) do
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

  create_table "companies", force: :cascade do |t|
    t.text "address"
    t.string "city"
    t.string "code", null: false
    t.string "company_registration_number"
    t.integer "company_type", null: false
    t.datetime "created_at", null: false
    t.bigint "created_by_id"
    t.string "deed_number"
    t.text "description"
    t.datetime "discarded_at"
    t.string "email", null: false
    t.decimal "latitude", precision: 10, scale: 8
    t.decimal "longitude", precision: 11, scale: 8
    t.string "name", null: false
    t.string "nib"
    t.string "owner_name", null: false
    t.string "phone", null: false
    t.string "pkp_number"
    t.string "postal_code"
    t.string "province"
    t.string "siup"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.bigint "updated_by_id"
    t.string "website"
    t.index ["code"], name: "index_companies_on_code", unique: true
    t.index ["company_type"], name: "index_companies_on_company_type"
    t.index ["created_by_id"], name: "index_companies_on_created_by_id"
    t.index ["discarded_at"], name: "index_companies_on_discarded_at"
    t.index ["status"], name: "index_companies_on_status"
    t.index ["updated_by_id"], name: "index_companies_on_updated_by_id"
  end

  create_table "company_assignments", force: :cascade do |t|
    t.bigint "company_id", null: false
    t.datetime "created_at", null: false
    t.bigint "created_by_id"
    t.datetime "discarded_at"
    t.string "role_in_company"
    t.datetime "updated_at", null: false
    t.bigint "updated_by_id"
    t.bigint "user_id", null: false
    t.index ["company_id"], name: "index_company_assignments_on_company_id"
    t.index ["created_by_id"], name: "index_company_assignments_on_created_by_id"
    t.index ["discarded_at"], name: "index_company_assignments_on_discarded_at"
    t.index ["updated_by_id"], name: "index_company_assignments_on_updated_by_id"
    t.index ["user_id", "company_id"], name: "index_company_assignments_on_user_and_company", unique: true, where: "(discarded_at IS NULL)"
    t.index ["user_id"], name: "index_company_assignments_on_user_id"
  end

  create_table "company_marketplace_links", force: :cascade do |t|
    t.bigint "company_id", null: false
    t.datetime "created_at", null: false
    t.bigint "created_by_id"
    t.datetime "discarded_at"
    t.boolean "is_active", default: true, null: false
    t.integer "marketplace", null: false
    t.string "store_name", null: false
    t.string "store_url", null: false
    t.datetime "updated_at", null: false
    t.bigint "updated_by_id"
    t.index ["company_id", "marketplace"], name: "index_company_marketplace_links_on_company_and_marketplace", unique: true, where: "(discarded_at IS NULL)"
    t.index ["company_id"], name: "index_company_marketplace_links_on_company_id"
    t.index ["created_by_id"], name: "index_company_marketplace_links_on_created_by_id"
    t.index ["discarded_at"], name: "index_company_marketplace_links_on_discarded_at"
    t.index ["updated_by_id"], name: "index_company_marketplace_links_on_updated_by_id"
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
    t.integer "file_sequence"
    t.text "notes"
    t.datetime "updated_at", null: false
    t.bigint "updated_by_id"
    t.bigint "uploaded_by_id", null: false
    t.index ["created_by_id"], name: "index_employee_documents_on_created_by_id"
    t.index ["discarded_at"], name: "index_employee_documents_on_discarded_at"
    t.index ["document_type"], name: "index_employee_documents_on_document_type"
    t.index ["employee_id", "file_sequence"], name: "index_employee_documents_on_employee_id_and_file_sequence", unique: true, where: "(file_sequence IS NOT NULL)"
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

  create_table "good_job_batches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "callback_priority"
    t.text "callback_queue_name"
    t.datetime "created_at", null: false
    t.text "description"
    t.datetime "discarded_at"
    t.datetime "enqueued_at"
    t.datetime "finished_at"
    t.datetime "jobs_finished_at"
    t.text "on_discard"
    t.text "on_finish"
    t.text "on_success"
    t.jsonb "serialized_properties"
    t.datetime "updated_at", null: false
  end

  create_table "good_job_executions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "active_job_id", null: false
    t.datetime "created_at", null: false
    t.interval "duration"
    t.text "error"
    t.text "error_backtrace", array: true
    t.integer "error_event", limit: 2
    t.datetime "finished_at"
    t.text "job_class"
    t.uuid "process_id"
    t.text "queue_name"
    t.datetime "scheduled_at"
    t.jsonb "serialized_params"
    t.datetime "updated_at", null: false
    t.index ["active_job_id", "created_at"], name: "index_good_job_executions_on_active_job_id_and_created_at"
    t.index ["process_id", "created_at"], name: "index_good_job_executions_on_process_id_and_created_at"
  end

  create_table "good_job_processes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "lock_type", limit: 2
    t.jsonb "state"
    t.datetime "updated_at", null: false
  end

  create_table "good_job_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "key"
    t.datetime "updated_at", null: false
    t.jsonb "value"
    t.index ["key"], name: "index_good_job_settings_on_key", unique: true
  end

  create_table "good_jobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "active_job_id"
    t.uuid "batch_callback_id"
    t.uuid "batch_id"
    t.text "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "cron_at"
    t.text "cron_key"
    t.text "error"
    t.integer "error_event", limit: 2
    t.integer "executions_count"
    t.datetime "finished_at"
    t.boolean "is_discrete"
    t.text "job_class"
    t.text "labels", array: true
    t.integer "lock_type", limit: 2
    t.datetime "locked_at"
    t.uuid "locked_by_id"
    t.datetime "performed_at"
    t.integer "priority"
    t.text "queue_name"
    t.uuid "retried_good_job_id"
    t.datetime "scheduled_at"
    t.jsonb "serialized_params"
    t.datetime "updated_at", null: false
    t.index ["active_job_id", "created_at"], name: "index_good_jobs_on_active_job_id_and_created_at"
    t.index ["batch_callback_id"], name: "index_good_jobs_on_batch_callback_id", where: "(batch_callback_id IS NOT NULL)"
    t.index ["batch_id"], name: "index_good_jobs_on_batch_id", where: "(batch_id IS NOT NULL)"
    t.index ["concurrency_key", "created_at"], name: "index_good_jobs_on_concurrency_key_and_created_at"
    t.index ["concurrency_key"], name: "index_good_jobs_on_concurrency_key_when_unfinished", where: "(finished_at IS NULL)"
    t.index ["created_at"], name: "index_good_jobs_on_created_at"
    t.index ["cron_key", "created_at"], name: "index_good_jobs_on_cron_key_and_created_at_cond", where: "(cron_key IS NOT NULL)"
    t.index ["cron_key", "cron_at"], name: "index_good_jobs_on_cron_key_and_cron_at_cond", unique: true, where: "(cron_key IS NOT NULL)"
    t.index ["finished_at"], name: "index_good_jobs_jobs_on_finished_at_only", where: "(finished_at IS NOT NULL)"
    t.index ["finished_at"], name: "index_good_jobs_on_discarded", order: :desc, where: "((finished_at IS NOT NULL) AND (error IS NOT NULL))"
    t.index ["id"], name: "index_good_jobs_on_unfinished_or_errored", where: "((finished_at IS NULL) OR (error IS NOT NULL))"
    t.index ["job_class"], name: "index_good_jobs_on_job_class"
    t.index ["labels"], name: "index_good_jobs_on_labels", where: "(labels IS NOT NULL)", using: :gin
    t.index ["locked_by_id"], name: "index_good_jobs_on_locked_by_id", where: "(locked_by_id IS NOT NULL)"
    t.index ["priority", "created_at"], name: "index_good_job_jobs_for_candidate_lookup", where: "(finished_at IS NULL)"
    t.index ["priority", "created_at"], name: "index_good_jobs_jobs_on_priority_created_at_when_unfinished", order: { priority: "DESC NULLS LAST" }, where: "(finished_at IS NULL)"
    t.index ["priority", "scheduled_at", "id"], name: "index_good_jobs_for_candidate_dequeue_unlocked", where: "((finished_at IS NULL) AND (locked_by_id IS NULL))"
    t.index ["priority", "scheduled_at", "id"], name: "index_good_jobs_on_priority_scheduled_at_unfinished", where: "(finished_at IS NULL)"
    t.index ["priority", "scheduled_at"], name: "index_good_jobs_on_priority_scheduled_at_unfinished_unlocked", where: "((finished_at IS NULL) AND (locked_by_id IS NULL))"
    t.index ["queue_name", "scheduled_at", "id"], name: "index_good_jobs_on_queue_name_priority_scheduled_at_unfinished", where: "(finished_at IS NULL)"
    t.index ["queue_name", "scheduled_at"], name: "index_good_jobs_on_queue_name_and_scheduled_at", where: "(finished_at IS NULL)"
    t.index ["queue_name"], name: "index_good_jobs_on_queue_name"
    t.index ["scheduled_at", "queue_name"], name: "index_good_jobs_on_scheduled_at_and_queue_name"
    t.index ["scheduled_at"], name: "index_good_jobs_on_scheduled_at", where: "(finished_at IS NULL)"
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

  create_table "refresh_tokens", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.datetime "revoked_at"
    t.string "token_digest", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["expires_at"], name: "index_refresh_tokens_on_expires_at"
    t.index ["revoked_at"], name: "index_refresh_tokens_on_revoked_at"
    t.index ["token_digest"], name: "index_refresh_tokens_on_token_digest", unique: true
    t.index ["user_id"], name: "index_refresh_tokens_on_user_id"
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
  add_foreign_key "companies", "users", column: "created_by_id"
  add_foreign_key "companies", "users", column: "updated_by_id"
  add_foreign_key "company_assignments", "companies"
  add_foreign_key "company_assignments", "users"
  add_foreign_key "company_assignments", "users", column: "created_by_id"
  add_foreign_key "company_assignments", "users", column: "updated_by_id"
  add_foreign_key "company_marketplace_links", "companies"
  add_foreign_key "company_marketplace_links", "users", column: "created_by_id"
  add_foreign_key "company_marketplace_links", "users", column: "updated_by_id"
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
  add_foreign_key "refresh_tokens", "users"
  add_foreign_key "salary_records", "employees"
  add_foreign_key "salary_records", "users", column: "created_by_id"
  add_foreign_key "salary_records", "users", column: "updated_by_id"
  add_foreign_key "users", "employees"
end
