class DescriptionSanitizer
  ALLOWED_TAGS = %w[p br ul ol li strong em a].freeze
  ALLOWED_ATTRIBUTES = %w[href].freeze

  Result = Struct.new(:html, :text, keyword_init: true)

  def self.call(richtext)
    new(richtext).call
  end

  def initialize(richtext)
    @richtext = richtext || {}
  end

  def call
    plain_text = extract_text(@richtext).strip
    html_source = plain_text.blank? ? "" : "<p>#{ERB::Util.html_escape(plain_text)}</p>"
    sanitized_html = ActionController::Base.helpers.sanitize(
      html_source,
      tags: ALLOWED_TAGS,
      attributes: ALLOWED_ATTRIBUTES
    )

    Result.new(html: sanitized_html, text: plain_text)
  end

  private

  def extract_text(node)
    return "" if node.nil?
    return extract_text_from_array(node) if node.is_a?(Array)
    return "" unless node.is_a?(Hash)

    extract_text_from_hash(node)
  end

  def extract_text_from_array(node)
    node.map { |item| extract_text(item) }.compact_blank.join(" ")
  end

  def extract_text_from_hash(node)
    text_value = fetch_text_value(node)
    return text_value.to_s if text_value.present?

    extract_text(fetch_content_value(node))
  end

  def fetch_text_value(node)
    node["text"] || node[:text]
  end

  def fetch_content_value(node)
    node["content"] || node[:content]
  end
end
