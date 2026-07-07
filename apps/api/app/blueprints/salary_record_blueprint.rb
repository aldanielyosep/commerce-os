class SalaryRecordBlueprint < Blueprinter::Base
  identifier :id

  fields :effective_date,
         :end_date,
         :notes,
         :created_at,
         :updated_at

  field :basic_salary_cents
  field :allowance_cents
  field :bonus_cents
  field :basic_salary_amount do |record|
    record.basic_salary.to_f
  end
  field :allowance_amount do |record|
    record.allowance.to_f
  end
  field :bonus_amount do |record|
    record.bonus.to_f
  end
end
