# rubocop:disable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
require "swagger_helper"

RSpec.describe "Company Marketplace Links" do
  path "/api/v1/companies/{company_id}/marketplace_links" do
    parameter name: :company_id, in: :path, type: :string

    get "List marketplace links" do
      tags "Company Marketplace Links"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "links listed" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, :pt) }
        let!(:link_one) { create(:company_marketplace_link, company: company, marketplace: :shopee) }
        let!(:link_two) { create(:company_marketplace_link, company: company, marketplace: :tokopedia) }
        let(:company_id) { company.id }
        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"].size).to eq(2)
        end
      end

      response "403", "admin cannot list links outside scope" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, :pt) }
        let!(:link_one) { create(:company_marketplace_link, company: company, marketplace: :shopee) }
        let(:company_id) { company.id }
        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(response.status).to eq(403)
          expect(body["success"]).to be(false)
        end
      end
    end

    post "Create marketplace link" do
      tags "Company Marketplace Links"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :company_marketplace_link, in: :body, schema: {
        type: :object,
        properties: {
          company_marketplace_link: {
            type: :object,
            properties: {
              marketplace: { type: :string, enum: %w[shopee tokopedia tiktok_shop lazada blibli shopify website] },
              store_name: { type: :string },
              store_url: { type: :string },
              is_active: { type: :boolean }
            },
            required: %w[marketplace store_name store_url is_active]
          }
        },
        required: ["company_marketplace_link"]
      }

      response "201", "link created" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, :pt) }
        let(:company_id) { company.id }
        let(:company_marketplace_link) do
          {
            company_marketplace_link: {
              marketplace: "shopee",
              store_name: "ABC Official",
              store_url: "https://shopee.co.id/abc-official",
              is_active: true
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body.dig("data", "marketplace")).to eq("shopee")
        end
      end

      response "422", "duplicate marketplace rejected" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, :pt) }
        let!(:existing_link) { create(:company_marketplace_link, company: company, marketplace: :shopee) }
        let(:company_id) { company.id }
        let(:company_marketplace_link) do
          {
            company_marketplace_link: {
              marketplace: "shopee",
              store_name: "ABC Official 2",
              store_url: "https://shopee.co.id/abc-official-2",
              is_active: true
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to save marketplace link")
        end
      end

      response "422", "non-https url rejected" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, :pt) }
        let(:company_id) { company.id }
        let(:company_marketplace_link) do
          {
            company_marketplace_link: {
              marketplace: "tokopedia",
              store_name: "ABC Official",
              store_url: "http://tokopedia.com/abc-official",
              is_active: true
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to save marketplace link")
        end
      end

      response "403", "admin cannot create link outside scope" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, :pt) }
        let(:company_id) { company.id }
        let(:company_marketplace_link) do
          {
            company_marketplace_link: {
              marketplace: "shopee",
              store_name: "ABC Official",
              store_url: "https://shopee.co.id/abc-official",
              is_active: true
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(response.status).to eq(403)
          expect(body["success"]).to be(false)
        end
      end
    end
  end

  path "/api/v1/companies/{company_id}/marketplace_links/{id}" do
    parameter name: :company_id, in: :path, type: :string
    parameter name: :id, in: :path, type: :string

    patch "Update marketplace link" do
      tags "Company Marketplace Links"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :company_marketplace_link, in: :body, schema: {
        type: :object,
        properties: {
          company_marketplace_link: {
            type: :object,
            properties: {
              store_name: { type: :string },
              store_url: { type: :string },
              is_active: { type: :boolean }
            }
          }
        },
        required: ["company_marketplace_link"]
      }

      response "200", "link updated" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, :pt) }
        let!(:marketplace_link) { create(:company_marketplace_link, company: company, marketplace: :shopee) }
        let(:company_id) { company.id }
        let(:id) { marketplace_link.id }
        let(:company_marketplace_link) do
          {
            company_marketplace_link: {
              store_name: "ABC Updated",
              is_active: false
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body.dig("data", "store_name")).to eq("ABC Updated")
          expect(body.dig("data", "is_active")).to be(false)
        end
      end

      response "403", "admin cannot update link outside scope" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, :pt) }
        let!(:marketplace_link) { create(:company_marketplace_link, company: company, marketplace: :shopee) }
        let(:company_id) { company.id }
        let(:id) { marketplace_link.id }
        let(:company_marketplace_link) do
          {
            company_marketplace_link: {
              store_name: "Should Not Update"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(response.status).to eq(403)
          expect(body["success"]).to be(false)
        end
      end
    end

    delete "Delete marketplace link" do
      tags "Company Marketplace Links"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "link discarded" do
        let!(:user) { create(:user, :super_admin, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, :pt) }
        let!(:marketplace_link) { create(:company_marketplace_link, company: company, marketplace: :shopee) }
        let(:company_id) { company.id }
        let(:id) { marketplace_link.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body.dig("data", "discarded")).to be(true)
        end
      end

      response "403", "admin cannot delete link outside scope" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company) { create(:company, :pt) }
        let!(:marketplace_link) { create(:company_marketplace_link, company: company, marketplace: :shopee) }
        let(:company_id) { company.id }
        let(:id) { marketplace_link.id }

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(response.status).to eq(403)
          expect(body["success"]).to be(false)
        end
      end
    end
  end
end

# rubocop:enable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
