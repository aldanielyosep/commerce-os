module Api
  module V1
    class AuditsController < BaseController
      ORDERABLE_FIELDS = {
        "created_at" => "audits.created_at",
        "action" => "audits.action",
        "auditable_type" => "audits.auditable_type",
        "user_id" => "audits.user_id"
      }.freeze

      before_action :set_audit, only: :show

      def index
        authorize Audited::Audit

        pagy_record, audits = paginate_collection(filtered_audits)
        render_success(AuditBlueprint.render_as_hash(audits), meta: pagination_meta(pagy_record))
      end

      def show
        authorize @audit

        render_success(AuditBlueprint.render_as_hash(@audit))
      end

      private

      def set_audit
        @audit = scoped_records(Audited::Audit).find(params.expect(:id))
      end

      def filtered_audits
        scope = scoped_records(Audited::Audit)

        scope = scope.where(auditable_type: params[:auditable_type]) if params[:auditable_type].present?
        scope = scope.where(auditable_id: params[:auditable_id]) if params[:auditable_id].present?
        scope = scope.where(user_id: params[:user_id]) if params[:user_id].present?

        apply_order(scope)
      end

      def apply_order(scope)
        order_column = ORDERABLE_FIELDS.fetch(
          params.fetch(:order_by, "created_at"),
          ORDERABLE_FIELDS.fetch("created_at")
        )
        order_direction = params.key?(:order_dir) ? normalized_order_direction(params[:order_dir]) : :desc

        scope.order(Arel.sql("#{order_column} #{order_direction}, audits.id desc"))
      end
    end
  end
end
