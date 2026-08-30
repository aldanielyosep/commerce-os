class Product < ApplicationRecord
  include Discard::Model
  include HumanAttribution

  enum :status, {
    draft: 0,
    active: 1,
    inactive: 2,
    archived: 3
  }, default: :draft

  belongs_to :company
  belongs_to :product_department, foreign_key: :department_id, inverse_of: :products
  belongs_to :category
  belongs_to :sub_category
  belongs_to :product_type
  has_many :product_images, dependent: :destroy
  has_many :product_variants, dependent: :destroy

  before_validation :assign_product_code, on: :create
  before_validation :assign_slug
  before_validation :derive_description_fields

  validates :product_code, presence: true, uniqueness: { scope: :company_id }
  validates :slug, presence: true, uniqueness: { scope: :company_id }
  validates :product_name, presence: true, length: { maximum: 255 }
  validates :short_description, presence: true
  validates :status, presence: true

  validate :description_richtext_schema
  validate :product_code_is_immutable, on: :update

  audited

  def activate!
    if product_images.kept.where(is_cover: true).none?
      errors.add(:base, "product must have one cover image before activation")
      return false
    end

    update(status: :active)
  end

  def deactivate!
    update(status: :inactive)
  end

  private

  def assign_product_code
    return if product_code.present?
    return if company.blank?

    self.product_code = ProductCodeGenerator.next_for(company)
  end

  def assign_slug
    base_slug = product_name.to_s.parameterize
    base_slug = "product" if base_slug.blank?

    return self.slug = base_slug if company_id.blank?

    self.slug = unique_slug_for(base_slug)
  end

  def unique_slug_for(base_slug)
    return base_slug unless slug_conflict?(base_slug)

    suffix = 2
    loop do
      candidate = "#{base_slug}-#{suffix}"
      return candidate unless slug_conflict?(candidate)

      suffix += 1
    end
  end

  def slug_conflict?(candidate)
    scope = self.class.where(company_id: company_id, slug: candidate)
    scope = scope.where.not(id: id) if persisted?
    scope.exists?
  end

  def derive_description_fields
    result = DescriptionSanitizer.call(description_richtext)
    self.description_html = result.html
    self.description_text = result.text
  end

  def description_richtext_schema
    richtext = description_richtext
    unless richtext.is_a?(Hash)
      errors.add(:description_richtext, "is invalid")
      return
    end

    unless richtext["type"] == "doc" || richtext[:type] == "doc"
      errors.add(:description_richtext, "is invalid")
      return
    end

    content = richtext["content"] || richtext[:content]
    errors.add(:description_richtext, "is invalid") unless content.is_a?(Array)
  end

  def product_code_is_immutable
    return unless will_save_change_to_product_code?

    errors.add(:product_code, "is system-generated and cannot be changed")
  end
end
