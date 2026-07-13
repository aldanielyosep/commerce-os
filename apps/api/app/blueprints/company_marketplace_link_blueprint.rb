class CompanyMarketplaceLinkBlueprint < Blueprinter::Base
  identifier :id

  fields :marketplace, :store_name, :store_url, :is_active, :created_at, :updated_at
end
