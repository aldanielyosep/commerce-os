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
        remove_logo
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

        return unless valid_logo_mutation_request?

        company = Company.new(company_params)

        if company.save
          render_success(CompanyBlueprint.render_as_hash(company), status: :created)
        else
          render_error("Unable to save company", errors: company.errors.full_messages)
        end
      end

      def update
        authorize @company

        return unless valid_logo_mutation_request?

        if @company.update(company_params)
          @company.logo.purge if remove_logo_requested?
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
        params.expect(company: COMPANY_PARAMS).except(:remove_logo)
      end

      def valid_logo_mutation_request?
        return true unless remove_logo_requested? && logo_payload_present?

        render_error("Unable to process logo", errors: ["Logo upload and remove_logo cannot be sent together"])
        false
      end

      def remove_logo_requested?
        ActiveModel::Type::Boolean.new.cast(params.dig(:company, :remove_logo))
      end

      def logo_payload_present?
        params.dig(:company, :logo).present?
      end
    end
  end
end
