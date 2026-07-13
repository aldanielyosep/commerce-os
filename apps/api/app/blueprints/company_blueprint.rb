class CompanyBlueprint < Blueprinter::Base
  identifier :id

  fields :code,
         :name,
         :owner_name,
         :company_type,
         :email,
         :phone,
         :website,
         :description,
         :address,
         :province,
         :city,
         :postal_code,
         :latitude,
         :longitude,
         :status,
         :company_registration_number,
         :nib,
         :siup,
         :deed_number,
         :pkp_number,
         :created_at,
         :updated_at

  field :logo_url do |company|
    Rails.application.routes.url_helpers.rails_blob_path(company.logo, only_path: true) if company.logo.attached?
  end

  association :marketplace_links, blueprint: CompanyMarketplaceLinkBlueprint do |company|
    company.company_marketplace_links.kept.order(:marketplace)
  end
end
