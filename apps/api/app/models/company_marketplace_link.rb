class CompanyMarketplaceLink < ApplicationRecord
  include Discard::Model
  include HumanAttribution

  enum :marketplace,
       {
         shopee: 0,
         tokopedia: 1,
         tiktok_shop: 2,
         lazada: 3,
         blibli: 4,
         shopify: 5,
         website: 6
       }

  belongs_to :company

  validates :marketplace, presence: true, uniqueness: { scope: :company_id, conditions: -> { kept } }
  validates :store_name, presence: true, length: { maximum: 100 }
  validates :store_url,
            presence: true,
            format: {
              with: %r{\Ahttps://.+}i,
              message: "must use HTTPS"
            }
  validates :is_active, inclusion: { in: [true, false] }

  audited
end
