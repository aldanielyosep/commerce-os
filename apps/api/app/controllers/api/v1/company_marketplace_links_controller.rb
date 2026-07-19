module Api
  module V1
    class CompanyMarketplaceLinksController < BaseController
      before_action :set_company
      before_action :authorize_company_marketplace_management!
      before_action :set_marketplace_link, only: %i[update destroy]

      def index
        links = @company.company_marketplace_links.kept.order(:marketplace)
        render_success(CompanyMarketplaceLinkBlueprint.render_as_hash(links))
      end

      def create
        link = @company.company_marketplace_links.new(company_marketplace_link_params)

        if link.save
          render_success(CompanyMarketplaceLinkBlueprint.render_as_hash(link), status: :created)
        else
          render_error("Unable to save marketplace link", errors: link.errors.full_messages)
        end
      end

      def update
        authorize @marketplace_link

        if @marketplace_link.update(company_marketplace_link_params)
          render_success(CompanyMarketplaceLinkBlueprint.render_as_hash(@marketplace_link))
        else
          render_error("Unable to update marketplace link", errors: @marketplace_link.errors.full_messages)
        end
      end

      def destroy
        authorize @marketplace_link

        @marketplace_link.discard!
        render_success({ id: @marketplace_link.id, discarded: true })
      end

      private

      def set_company
        @company = scoped_records(Company.kept).find(params.expect(:company_id))
      end

      def set_marketplace_link
        @marketplace_link = @company.company_marketplace_links.kept.find(params.expect(:id))
      end

      def authorize_company_marketplace_management!
        authorize @company, :manage_marketplaces?
      end

      def company_marketplace_link_params
        params.expect(company_marketplace_link: %i[marketplace store_name store_url is_active])
      end
    end
  end
end
