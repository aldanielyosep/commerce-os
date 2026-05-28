require "spec_helper"

ENV["RAILS_ENV"] ||= "test"

require_relative "../config/environment"

# Prevent database truncation if the environment is production
abort("The Rails environment is running in production mode!") if Rails.env.production?

require "rspec/rails"

# Auto require support files
Rails.root.glob("spec/support/**/*.rb").sort_by(&:to_s).each { |f| require f }

# Ensures that the test database schema matches the current schema file.
begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  # FactoryBot helpers
  config.include FactoryBot::Syntax::Methods

  # Fixture path
  config.fixture_paths = [
    Rails.root.join("spec/fixtures")
  ]

  # Transactional tests
  config.use_transactional_fixtures = true

  # Infer spec type from file location
  config.infer_spec_type_from_file_location!

  # Filter Rails backtrace noise
  config.filter_rails_from_backtrace!

  # Run focused specs
  config.filter_run_when_matching :focus

  # Persist example statuses
  config.example_status_persistence_file_path = "spec/examples.txt"

  # Disable monkey patching
  config.disable_monkey_patching!

  # Use doc formatter for single spec file
  config.default_formatter = "doc" if config.files_to_run.one?

  # Show slowest examples
  config.profile_examples = 10

  # Randomize spec order
  config.order = :random
  Kernel.srand config.seed
end
