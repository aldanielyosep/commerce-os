class OpsSmokeJob < ApplicationJob
  queue_as :default

  def perform(marker = "good_job_smoke")
    Rails.logger.info("[OpsSmokeJob] #{marker}")
  end
end
