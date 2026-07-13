module Api
  module V1
    class CompaniesController < BaseController
      before_action :set_company, only: %i[show update destroy]

      BASIC_PARAMS = %i[
        code
        name
        owner_name
        company_type
        email
        phone
        website
        description
        status
        logo
      ].freeze

      ADDRESS_PARAMS = %i[
        address
        province
        city
        postal_code
        latitude
        longitude
      ].freeze

      BUSINESS_PARAMS = %i[
        company_registration_number
        nib
        siup
        deed_number
        pkp_number
      ].freeze

      COMPANY_PARAMS = (
        BASIC_PARAMS +
        ADDRESS_PARAMS +
        BUSINESS_PARAMS
      ).freeze

      def index
        authorize Company

        companies = scoped_records(Company.kept).order(:name)
        render_success(CompanyBlueprint.render_as_hash(companies))
      end

      def show
        authorize @company

        render_success(CompanyBlueprint.render_as_hash(@company))
      end

      def create
        authorize Company

        company = Company.new(company_params)

        if company.save
          render_success(CompanyBlueprint.render_as_hash(company), status: :created)
        else
          render_error("Unable to save company", errors: company.errors.full_messages)
        end
      end

      def update
        authorize @company

        if @company.update(company_params)
          render_success(CompanyBlueprint.render_as_hash(@company))
        else
          render_error("Unable to update company", errors: @company.errors.full_messages)
        end
      end

      def destroy
        authorize @company

        @company.discard!
        render_success({ id: @company.id, discarded: true })
      end

      private

      def set_company
        @company = scoped_records(Company.kept).find(params.expect(:id))
      end

      def company_params
        params.expect(company: COMPANY_PARAMS)
      end
    end
  end
end
