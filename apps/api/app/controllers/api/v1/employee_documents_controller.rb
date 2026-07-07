module Api
  module V1
    class EmployeeDocumentsController < BaseController
      SIGNED_URL_TTL = ENV.fetch("DOCUMENT_SIGNED_URL_TTL", 600).to_i.seconds

      before_action :set_employee
      before_action :set_employee_document, only: %i[download archive]

      def index
        authorize EmployeeDocument

        documents = @employee.employee_documents.kept.order(created_at: :desc)
        render_success(EmployeeDocumentBlueprint.render_as_hash(documents))
      end

      def create
        authorize EmployeeDocument

        document = @employee.employee_documents.new(employee_document_params)
        document.uploaded_by = current_user

        if document.save
          render_success(EmployeeDocumentBlueprint.render_as_hash(document), status: :created)
        else
          render_error("Unable to upload employee document", errors: document.errors.full_messages)
        end
      end

      def download
        authorize @employee_document, :download?

        return render_error("Document file is missing", status: :not_found) unless @employee_document.file.attached?

        expires_at = Time.current + SIGNED_URL_TTL
        set_active_storage_url_options

        render_success(
          {
            id: @employee_document.id,
            url: @employee_document.file.url(expires_in: SIGNED_URL_TTL),
            expires_at: expires_at.iso8601
          }
        )
      end

      def archive
        authorize @employee_document, :archive?

        @employee_document.discard!
        render_success({ id: @employee_document.id, discarded: true })
      end

      private

      def set_employee
        @employee = scoped_records(Employee.kept).find(params.expect(:employee_id))
      end

      def set_employee_document
        @employee_document = @employee.employee_documents.kept.find(params.expect(:id))
      end

      def employee_document_params
        permitted_keys = %i[document_type expiry_date notes file]
        return params.expect(employee_document: permitted_keys) if params[:employee_document].present?

        ActionController::Parameters.new(
          document_type: params["employee_document[document_type]"] || params[:document_type],
          expiry_date: params["employee_document[expiry_date]"] || params[:expiry_date],
          notes: params["employee_document[notes]"] || params[:notes],
          file: params["employee_document[file]"] || params[:file]
        ).permit(*permitted_keys)
      end

      def set_active_storage_url_options
        ActiveStorage::Current.url_options = {
          protocol: request.protocol.delete_suffix("://"),
          host: request.host,
          port: request.optional_port
        }
      end
    end
  end
end
