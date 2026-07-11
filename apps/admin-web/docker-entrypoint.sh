#!/bin/sh
set -eu

escaped_api_base_url=""
if [ -n "${ADMIN_WEB_API_BASE_URL:-}" ]; then
  escaped_api_base_url=$(printf '%s' "${ADMIN_WEB_API_BASE_URL}" | sed 's/\\/\\\\/g; s/"/\\"/g')
fi

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  API_BASE_URL: "${escaped_api_base_url}"
};
EOF

exec nginx -g 'daemon off;'
