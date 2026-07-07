module Api
  module V1
    class AuditsController < BaseController
      before_action :set_audit, only: :show

      def index
        authorize Audited::Audit

        audits = filtered_audits
        render_success(AuditBlueprint.render_as_hash(audits))
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

        scope.order(created_at: :desc, id: :desc)
      end
    end
  end
end
