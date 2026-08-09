class ProductImage < ApplicationRecord
  include Discard::Model
  include HumanAttribution

  ALLOWED_CONTENT_TYPES = %w[image/jpg image/jpeg image/png image/webp].freeze
  MAX_FILE_SIZE = 5.megabytes
  MIN_WIDTH = 1000
  MIN_HEIGHT = 1000

  belongs_to :product
  has_one_attached :image

  before_validation :normalize_position, on: :create
  before_save :unset_other_cover_images, if: :is_cover?

  validates :position, numericality: { only_integer: true, greater_than: 0 }
  validate :image_attached
  validate :image_content_type
  validate :image_size_within_limit
  validate :image_dimensions_within_limit

  audited

  private

  def normalize_position
    return if position.present?

    self.position = next_position
  end

  def next_position
    relation = if self.class.respond_to?(:with_discarded)
                 self.class.with_discarded
               else
                 self.class.all
               end

    relation.where(product_id: product_id).maximum(:position).to_i + 1
  end

  def unset_other_cover_images
    return if new_record? && product_id.blank?

    self.class.kept.where(product_id: product_id).where.not(id: id).update_all(is_cover: false)
  end

  def image_attached
    errors.add(:image, "must be attached") unless image.attached?
  end

  def image_content_type
    return unless image.attached?

    unless ALLOWED_CONTENT_TYPES.include?(image.blob.content_type)
      errors.add(:image, "extension is not allowed (jpg, jpeg, png, webp)")
    end
  end

  def image_size_within_limit
    return unless image.attached?

    errors.add(:image, "size exceeds 5 MB") if image.blob.byte_size > MAX_FILE_SIZE
  end

  def image_dimensions_within_limit
    return unless image.attached?

    width, height = read_dimensions
    return if width <= 0 || height <= 0

    if width < MIN_WIDTH || height < MIN_HEIGHT
      errors.add(:image, "minimum dimension is 1000x1000")
    end
  end

  def read_dimensions
    metadata = image.blob.metadata
    width = metadata["width"].to_i
    height = metadata["height"].to_i

    return [ width, height ] if width.positive? && height.positive?

    begin
      downloaded = image.blob.download
      inspected_image = Vips::Image.new_from_buffer(downloaded, "")
      [ inspected_image.width, inspected_image.height ]
    rescue StandardError
      [ 0, 0 ]
    end
  end
end
