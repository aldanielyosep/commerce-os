# rubocop:disable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
require "swagger_helper"

RSpec.describe "Companies" do
  path "/api/v1/companies" do
    get "List companies" do
      tags "Companies"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "companies listed" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company_one) { create(:company, name: "Alpha Store") }
        let!(:company_two) { create(:company, name: "Beta Store") }
        let!(:company_one_link) do
          create(
            :company_marketplace_link,
            company: company_one,
            marketplace: :shopee,
            store_name: "Alpha Official",
            store_url: "https://shopee.co.id/alpha-official"
          )
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)

          expect(body["success"]).to be(true)

          rows = body["data"]
          names = rows.pluck("name")

          expect(names).to include("Alpha Store", "Beta Store")

          alpha_row = rows.find { |row| row["name"] == "Alpha Store" }

          expect(alpha_row.fetch("marketplace_links").size).to eq(1)
          expect(alpha_row.fetch("marketplace_links").first.fetch("marketplace")).to eq("shopee")
        end
      end
    end

    post "Create company" do
      tags "Companies"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :company, in: :body, schema: {
        type: :object,
        properties: {
          company: {
            type: :object,
            properties: {
              code: { type: :string },
              name: { type: :string },
              owner_name: { type: :string },
              company_type: { type: :string, enum: %w[individual cv pt] },
              email: { type: :string },
              phone: { type: :string },
              status: { type: :string, enum: %w[active inactive] },
              company_registration_number: { type: :string },
              nib: { type: :string },
              latitude: { type: :number },
              longitude: { type: :number },
              website: { type: :string }
            },
            required: %w[code name owner_name company_type email phone status]
          }
        },
        required: ["company"]
      }

      response "201", "individual company created" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let(:company) do
          {
            company: {
              code: "ABC-STORE",
              name: "ABC Store",
              owner_name: "Daniel",
              company_type: "individual",
              email: "admin@abc-store.com",
              phone: "+628123450001",
              status: "active"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["company_type"]).to eq("individual")
        end
      end

      response "201", "pt company created" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let(:company) do
          {
            company: {
              code: "PT-ABC",
              name: "PT ABC Store",
              owner_name: "Daniel",
              company_type: "pt",
              email: "admin@pt-abc.com",
              phone: "+628123450002",
              status: "active",
              company_registration_number: "REG-123",
              nib: "NIB-123"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["company_type"]).to eq("pt")
          expect(body["data"]["nib"]).to eq("NIB-123")
        end
      end

      response "422", "individual company rejects business fields" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let(:company) do
          {
            company: {
              code: "IND-ABC",
              name: "Individual ABC",
              owner_name: "Daniel",
              company_type: "individual",
              email: "admin@ind-abc.com",
              phone: "+628123450003",
              status: "active",
              nib: "NIB-123"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to save company")
        end
      end

      response "422", "pt company requires business fields" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let(:company) do
          {
            company: {
              code: "PT-MISS",
              name: "PT Missing",
              owner_name: "Daniel",
              company_type: "pt",
              email: "admin@pt-miss.com",
              phone: "+628123450004",
              status: "active"
            }
          }
        end

        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to save company")
        end
      end
    end
  end

  path "/api/v1/companies/{id}" do
    parameter name: :id, in: :path, type: :string

    get "Show company" do
      tags "Companies"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "company shown" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company_record) { create(:company, name: "Alpha Store") }
        let!(:marketplace_link) do
          create(
            :company_marketplace_link,
            company: company_record,
            marketplace: :tokopedia,
            store_name: "Alpha Tokopedia",
            store_url: "https://tokopedia.com/alpha-tokopedia"
          )
        end
        let(:id) { company_record.id }
        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["id"]).to eq(company_record.id)
          expect(body["data"]["marketplace_links"].size).to eq(1)
          expect(body["data"]["marketplace_links"].first["marketplace"]).to eq("tokopedia")
        end
      end
    end

    patch "Update company" do
      tags "Companies"
      consumes "application/json"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      parameter name: :company, in: :body, schema: {
        type: :object,
        properties: {
          company: {
            type: :object,
            properties: {
              name: { type: :string },
              status: { type: :string, enum: %w[active inactive] },
              latitude: { type: :number },
              longitude: { type: :number },
              website: { type: :string }
            }
          }
        },
        required: ["company"]
      }

      response "200", "company updated" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company_record) { create(:company, name: "Alpha Store") }
        let(:id) { company_record.id }
        let(:company) do
          {
            company: {
              name: "Alpha Store Updated",
              status: "inactive"
            }
          }
        end
        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["name"]).to eq("Alpha Store Updated")
          expect(body["data"]["status"]).to eq("inactive")
        end
      end

      response "422", "company invalid coordinates" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company_record) { create(:company, name: "Alpha Store") }
        let(:id) { company_record.id }
        let(:company) do
          {
            company: {
              latitude: -6.2
            }
          }
        end
        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["success"]).to be(false)
          expect(body["message"]).to eq("Unable to update company")
        end
      end
    end

    delete "Delete company" do
      tags "Companies"
      produces "application/json"
      security [ { bearerAuth: [] } ]

      response "200", "company discarded" do
        let!(:user) { create(:user, password: "Password123!", password_confirmation: "Password123!") }
        let!(:company_record) { create(:company) }
        let(:id) { company_record.id }
        # rubocop:disable RSpec/VariableName
        let(:Authorization) { bearer_token_for(user) }
        # rubocop:enable RSpec/VariableName

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body["data"]["discarded"]).to be(true)
        end
      end
    end
  end
end

# rubocop:enable RSpec/MultipleMemoizedHelpers, RSpec/LetSetup
