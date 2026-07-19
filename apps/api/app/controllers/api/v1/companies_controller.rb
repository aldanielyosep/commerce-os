module Api
  module V1
    class CompaniesController < BaseController
      ORDERABLE_FIELDS = {
        "code" => "companies.code",
        "name" => "companies.name",
        "owner_name" => "companies.owner_name",
        "status" => "companies.status",
        "city" => "companies.city",
        "created_at" => "companies.created_at"
      }.freeze

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

        pagy_record, companies = paginate_collection(apply_order(scoped_records(Company.kept)))
        render_success(CompanyBlueprint.render_as_hash(companies), meta: pagination_meta(pagy_record))
      end

      def show
        authorize @company

        render_success(CompanyBlueprint.render_as_hash(@company))
      end

      def create
        authorize Company

        return unless valid_logo_mutation_request?

        company = Company.new(company_params)
        logo_blob = attach_logo_blob(company)

        if company.save
          render_success(CompanyBlueprint.render_as_hash(company), status: :created)
        else
          logo_blob&.purge_later
          render_error("Unable to save company", errors: company.errors.full_messages)
        end
      end

      def update
        authorize @company

        return unless valid_logo_mutation_request?

        @company.assign_attributes(company_params)
        logo_blob = attach_logo_blob(@company)

        if @company.save
          @company.logo.purge if remove_logo_requested?
          render_success(CompanyBlueprint.render_as_hash(@company))
        else
          logo_blob&.purge_later
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
        @company = Company.kept.find(params.expect(:id))
      end

      def company_params
        params.expect(company: COMPANY_PARAMS).except(:remove_logo)
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(params.fetch(:order_by, "name"), ORDERABLE_FIELDS.fetch("name"))
        order_direction = normalized_order_direction(params[:order_dir])

        scope.order(Arel.sql("#{order_column} #{order_direction}, companies.id asc"))
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

      def attach_logo_blob(company)
        uploaded_logo = params.dig(:company, :logo)
        return nil if uploaded_logo.blank?

        blob = ActiveStorage::Blob.create_and_upload!(
          io: uploaded_logo,
          filename: uploaded_logo.original_filename,
          content_type: uploaded_logo.content_type,
          key: company.storage_key_for_logo(original_filename: uploaded_logo.original_filename)
        )

        company.logo.attach(blob)
        blob
      end
    end
  end
end
