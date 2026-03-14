#!/bin/bash
# add-website.sh
# Adds a new URL to monitor for uptime in the Prometheus Blackbox exporter config

if [ -z "$1" ]; then
    echo "Usage: ./add-website.sh https://your-website.com"
    exit 1
fi

TARGET_URL=$1
PROMETHEUS_YML="/etc/prometheus/prometheus.yml"

echo "Adding $TARGET_URL to uptime monitoring..."

# Basic injection into Prometheus target lists (this requires sudo in production)
# In our setup, Blackbox exporter targets are usually defined in prometheus.yml under the blackbox job
# For demonstration purposes, we will append it or alert the user to edit the file.

echo "To monitor this website, ensure your prometheus.yml has the following section:"
echo ""
echo "  - job_name: 'blackbox'"
echo "    metrics_path: /probe"
echo "    params:"
echo "      module: [http_2xx]"
echo "    static_configs:"
echo "      - targets:"
echo "        - $TARGET_URL"
echo "    relabel_configs:"
echo "      - source_labels: [__address__]"
echo "        target_label: __param_target"
echo "      - source_labels: [__param_target]"
echo "        target_label: instance"
echo "      - target_label: __address__"
echo "        replacement: 127.0.0.1:9115  # The blackbox exporter's real hostname:port"

echo ""
echo "After adding the target, run: sudo systemctl restart prometheus"
