FactoryBot.define do
  factory :user do
    username { Faker::Internet.unique.username(specifier: 8) }
    email { Faker::Internet.unique.email }
    password { Faker::Internet.password(min_length: 8) }
    role { :admin }
    status { :active }

    trait :super_admin do
      role { :super_admin }
    end

    trait :disabled do
      status { :disabled }
    end
  end
end
