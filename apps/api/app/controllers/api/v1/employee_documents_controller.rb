module Api
  module V1
    class EmployeeDocumentsController < BaseController
      SIGNED_URL_TTL = ENV.fetch("DOCUMENT_SIGNED_URL_TTL", 600).to_i.seconds
      ORDERABLE_FIELDS = {
        "created_at" => :created_at,
        "document_type" => :document_type,
        "expiry_date" => :expiry_date
      }.freeze

      before_action :set_employee
      before_action :set_employee_document, only: %i[download archive]

      def index
        authorize EmployeeDocument

        pagy_record, documents = paginate_collection(
          apply_order(@employee.employee_documents.kept.includes(:file_attachment))
        )
        render_success(EmployeeDocumentBlueprint.render_as_hash(documents), meta: pagination_meta(pagy_record))
      end

      def create
        authorize EmployeeDocument

        document = @employee.employee_documents.new(employee_document_attributes)
        document.uploaded_by = current_user

        uploaded_file = employee_document_file
        sequence = EmployeeDocument.next_file_sequence_for(@employee)
        document.file_sequence = sequence

        blob = ActiveStorage::Blob.create_and_upload!(
          io: uploaded_file,
          filename: uploaded_file.original_filename,
          content_type: uploaded_file.content_type,
          key: document.storage_key_for(sequence: sequence, original_filename: uploaded_file.original_filename)
        )

        document.file.attach(blob)

        if document.save
          render_success(EmployeeDocumentBlueprint.render_as_hash(document), status: :created)
        else
          blob.purge_later
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
        @employee = Employee.kept.find(params.expect(:employee_id))
      end

      def set_employee_document
        @employee_document = @employee.employee_documents.kept.find(params.expect(:id))
      end

      def employee_document_attributes
        permitted_keys = %i[document_type expiry_date notes]
        if params[:employee_document].present?
          return params.expect(employee_document: %i[document_type expiry_date notes
                                                     file]).slice(*permitted_keys)
        end

        ActionController::Parameters.new(
          document_type: params["employee_document[document_type]"] || params[:document_type],
          expiry_date: params["employee_document[expiry_date]"] || params[:expiry_date],
          notes: params["employee_document[notes]"] || params[:notes]
        ).permit(*permitted_keys)
      end

      def employee_document_file
        if params[:employee_document].present?
          file = params.expect(employee_document: %i[file]).fetch(:file)
          return file if file.present?
        end

        file = params["employee_document[file]"] || params[:file]
        return file if file.present?

        raise ActionController::ParameterMissing, :file
      end

      def set_active_storage_url_options
        ActiveStorage::Current.url_options = {
          protocol: request.protocol.delete_suffix("://"),
          host: request.host,
          port: request.optional_port
        }
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(
          params.fetch(:order_by, "created_at"),
          ORDERABLE_FIELDS.fetch("created_at")
        )
        order_direction = params.key?(:order_dir) ? normalized_order_direction(params[:order_dir]) : :desc

        scope.order(order_column => order_direction, id: :desc)
      end
    end
  end
end
