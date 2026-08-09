class ProductCodeGenerator
  DIGITS = ENV.fetch("PRODUCT_CODE_DIGITS", 7).to_i

  def self.next_for(company)
    new(company).next_code
  end

  def initialize(company)
    @company = company
  end

  def next_code
    prefix = ENV.fetch("PRODUCT_CODE_PREFIX", "P").strip.upcase
    prefix = "P" if prefix.blank?

    next_number = next_sequence_value
    "#{prefix}#{next_number.to_s.rjust(normalized_digits, '0')}"
  end

  private

  attr_reader :company

  def normalized_digits
    DIGITS.positive? ? DIGITS : 7
  end

  def next_sequence_value
    sequence_name = "product_code_seq_company_#{company.id}"
    Product.connection.execute("CREATE SEQUENCE IF NOT EXISTS #{sequence_name} START 1 INCREMENT 1")
    Product.connection.select_value("SELECT nextval('#{sequence_name}')").to_i
  end
end
