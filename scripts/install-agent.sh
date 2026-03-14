#!/bin/bash
set -e

# Configuration
CENTRAL_IP="MONITORING_SERVER_IP"
LOKI_URL="http://${CENTRAL_IP}:3100/loki/api/v1/push"
PROM_VER="1.8.2"

echo "Starting Agent Installation (Promtail, Node Exporter, Fail2ban)"

# 1. Base packages
sudo apt update
sudo apt install -y curl wget unzip fail2ban ufw

# 2. Node Exporter
echo "Installing Node Exporter..."
sudo useradd --no-create-home --shell /bin/false node_exporter || true
wget https://github.com/prometheus/node_exporter/releases/download/v${PROM_VER}/node_exporter-${PROM_VER}.linux-amd64.tar.gz
tar xvf node_exporter-${PROM_VER}.linux-amd64.tar.gz
sudo mv node_exporter-${PROM_VER}.linux-amd64/node_exporter /usr/local/bin/
sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter
rm -rf node_exporter-*

cat <<EOF | sudo tee /etc/systemd/system/node_exporter.service
[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

# 3. Promtail
echo "Installing Promtail..."
wget "https://github.com/grafana/loki/releases/download/v3.1.0/promtail-linux-amd64.zip"
unzip promtail-linux-amd64.zip
sudo mv promtail-linux-amd64 /usr/local/bin/promtail
rm promtail-*
sudo mkdir -p /etc/promtail

cat <<EOF | sudo tee /etc/promtail/promtail-config.yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: ${LOKI_URL}

scrape_configs:
- job_name: system
  static_configs:
  - targets:
      - localhost
    labels:
      job: varlogs
      __path__: /var/log/*log
- job_name: nginx
  static_configs:
  - targets:
      - localhost
    labels:
      job: nginx
      __path__: /var/log/nginx/*log
EOF

cat <<EOF | sudo tee /etc/systemd/system/promtail.service
[Unit]
Description=Promtail service
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/promtail -config.file /etc/promtail/promtail-config.yaml
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# 4. Fail2ban setup
echo "Configuring Fail2ban..."
cat <<EOF | sudo tee /etc/fail2ban/jail.local
[DEFAULT]
bantime  = 1h
findtime  = 10m
maxretry = 5

[sshd]
enabled = true

# Nginx/Node.js brute force protection rules can be added here
EOF

# 5. Start Services
sudo systemctl daemon-reload
sudo systemctl enable node_exporter promtail fail2ban
sudo systemctl restart node_exporter promtail fail2ban

echo "Agent installation complete."
