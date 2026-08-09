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

    if node.is_a?(Array)
      return node.map { |item| extract_text(item) }.reject(&:blank?).join(" ")
    end

    return "" unless node.is_a?(Hash)

    text_value = node["text"] || node[:text]
    return text_value.to_s if text_value.present?

    content = node["content"] || node[:content]
    extract_text(content)
  end
end
