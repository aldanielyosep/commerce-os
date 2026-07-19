Rails.application.routes.draw do
  devise_for :users,
             path: "api/v1/users",
             path_names: {
               sign_in: "sign_in",
               sign_out: "sign_out"
             },
             defaults: { format: :json },
             skip: [ :registrations ],
             controllers: {
               sessions: "api/v1/users/sessions"
             }

  namespace :api do
    namespace :v1 do
      namespace :users do
        resource :refresh_token, only: :create, controller: "refresh_tokens"
      end

      resources :companies do
        resources :marketplace_links,
                  controller: "company_marketplace_links",
                  only: %i[index create update destroy]
      end
      resources :departments
      resources :users do
        member do
          patch :enable
          patch :disable
          patch :change_role
          post :reset_password
        end

        resources :company_assignments,
                  controller: "user_company_assignments",
                  only: %i[index create destroy] do
          collection do
            post :bulk_upsert
          end
        end
      end
      resources :audits, only: %i[index show]

      resources :employees do
        member do
          patch :terminate
        end

        resources :employee_departments, only: %i[index create destroy]
        resources :position_histories, only: %i[index create update]
        resources :salary_records, only: %i[index create update]
        resources :employee_documents, only: %i[index create] do
          member do
            get :download
            patch :archive
          end
        end
      end
    end
  end
  if ENV["RSWAG_ENABLED"] == "true"
    mount Rswag::Ui::Engine => "/api-docs"
    mount Rswag::Api::Engine => "/api-docs"
  end

  mount GoodJob::Engine => "/good_job" if ENV["GOOD_JOB_DASHBOARD_ENABLED"] == "true"

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
