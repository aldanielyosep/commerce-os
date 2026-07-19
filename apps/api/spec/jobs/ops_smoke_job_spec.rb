require "rails_helper"

RSpec.describe OpsSmokeJob do
  around do |example|
    original_adapter = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :good_job
    GoodJob::Job.delete_all

    example.run
  ensure
    GoodJob::Job.delete_all
    ActiveJob::Base.queue_adapter = original_adapter
  end

  it "persists and executes the job through good_job" do
    expect do
      described_class.perform_later("spec-smoke")
    end.to change(GoodJob::Job, :count).by(1)

    job = GoodJob::Job.order(created_at: :desc).first

    expect(job.job_class).to eq("OpsSmokeJob")
    expect(job.queue_name).to eq("default")
    expect(job.error).to be_nil
    expect(job.finished_at).to be_present
  end
end
