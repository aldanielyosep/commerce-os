require "rails_helper"

RSpec.describe "Companies logo upload flow", type: :request do
  let(:user) do
    create(:user, password: "Password123!", password_confirmation: "Password123!")
  end

  let(:headers) do
    {
      "Authorization" => bearer_token_for(user)
    }
  end

  describe "POST /api/v1/companies" do
    subject(:create_company) do
      post "/api/v1/companies",
           params: {
             company: {
               code: "LOGO-#{SecureRandom.hex(3)}",
               name: "Logo Company",
               owner_name: "Owner",
               company_type: "individual",
               email: "logo-#{SecureRandom.hex(2)}@example.com",
               phone: "+628123450001",
               status: "active",
               logo: logo_file
             }
           },
           headers: headers,
           as: :multipart_form
    end

    context "with valid logo" do
      let(:logo_file) do
        Rack::Test::UploadedFile.new(
          StringIO.new("fake image"),
          "image/png",
          original_filename: "logo.png"
        )
      end

      it "creates company and stores logo" do
        create_company

        expect(response).to have_http_status(:created)
        expect(response.parsed_body.dig("data", "logo_url")).to be_present
        expect(Company.order(:id).last.logo).to be_attached
      end
    end

    context "with unsupported logo type" do
      let(:logo_file) do
        Rack::Test::UploadedFile.new(
          StringIO.new("not an image"),
          "text/plain",
          original_filename: "logo.txt"
        )
      end

      it "returns validation error" do
        create_company

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["message"]).to eq("Unable to save company")
      end
    end

    context "with oversized logo" do
      let(:logo_file) do
        Rack::Test::UploadedFile.new(
          StringIO.new("a" * (2.megabytes + 1)),
          "image/png",
          original_filename: "large-logo.png"
        )
      end

      it "returns validation error" do
        create_company

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["message"]).to eq("Unable to save company")
      end
    end
  end

  describe "PATCH /api/v1/companies/:id" do
    let!(:company) { create(:company) }

    before do
      company.logo.attach(
        io: StringIO.new("existing image"),
        filename: "existing-logo.png",
        content_type: "image/png"
      )
    end

    it "removes logo when remove_logo is true" do
      patch "/api/v1/companies/#{company.id}",
            params: {
              company: {
                remove_logo: true
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("data", "logo_url")).to be_nil
      expect(company.reload.logo).not_to be_attached
    end

    it "rejects remove_logo combined with upload" do
      new_logo_file = Rack::Test::UploadedFile.new(
        StringIO.new("new image"),
        "image/png",
        original_filename: "new-logo.png"
      )

      patch "/api/v1/companies/#{company.id}",
            params: {
              company: {
                remove_logo: true,
                logo: new_logo_file
              }
            },
            headers: headers,
            as: :multipart_form

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["message"]).to eq("Unable to process logo")
    end
  end
end
