FactoryBot.define do
  factory :employee do
    full_name { "John Doe" }
    gender { :male }
    birth_date { Date.new(1990, 1, 1) }
    join_date { Date.current }
    status { :active }
    sequence(:identity_number) { |n| "IDN#{100_000 + n}" }
    sequence(:phone_number) { |n| "+62812345#{format('%04d', n)}" }
    sequence(:email) { |n| "employee#{n}@example.com" }
    address { "Jl. Sudirman No. 1" }
    city { "Jakarta" }
    postal_code { "10220" }
  end
end
