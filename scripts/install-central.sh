#!/bin/bash
set -e

echo "Starting Central Monitoring Stack Installation (Bare-Metal)"

# 1. Update and Base Deps
sudo apt update && sudo apt upgrade -y
sudo apt install -y wget curl tar gzip gnupg2 software-properties-common apt-transport-https ca-certificates build-essential jq

# 2. Add System Users
echo "Creating system users for services..."
sudo useradd --no-create-home --shell /bin/false prometheus || true
sudo useradd --no-create-home --shell /bin/false victoriametrics || true
sudo useradd --no-create-home --shell /bin/false alertmanager || true
sudo useradd --no-create-home --shell /bin/false loki || true
sudo useradd --no-create-home --shell /bin/false tempo || true
sudo useradd --system --user-group --shell /bin/false minio-user || true

# Directories
sudo mkdir -p /etc/prometheus /var/lib/prometheus /etc/alertmanager /var/lib/alertmanager /etc/loki /etc/tempo
sudo mkdir -p /opt/victoriametrics /opt/minio/data /opt/loki/data /opt/tempo/data

# 3. PostgreSQL Database (For Incidents)
echo "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE USER incident_user WITH PASSWORD 'incident_pass';"
sudo -u postgres psql -c "CREATE DATABASE incidents OWNER incident_user;"

# 4. Prometheus
echo "Installing Prometheus..."
PROM_VER="2.53.1"
wget https://github.com/prometheus/prometheus/releases/download/v${PROM_VER}/prometheus-${PROM_VER}.linux-amd64.tar.gz
tar xvf prometheus-${PROM_VER}.linux-amd64.tar.gz
sudo cp prometheus-${PROM_VER}.linux-amd64/prometheus /usr/local/bin/
sudo cp prometheus-${PROM_VER}.linux-amd64/promtool /usr/local/bin/
sudo chown prometheus:prometheus /usr/local/bin/prometheus /usr/local/bin/promtool

sudo cp -r prometheus-${PROM_VER}.linux-amd64/consoles /etc/prometheus
sudo cp -r prometheus-${PROM_VER}.linux-amd64/console_libraries /etc/prometheus
sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus
rm -rf prometheus-*

cat <<EOF | sudo tee /etc/systemd/system/prometheus.service
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
    --config.file /etc/prometheus/prometheus.yml \
    --storage.tsdb.path /var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
EOF

# 5. VictoriaMetrics
echo "Installing VictoriaMetrics..."
VM_VER="v1.102.1"
wget https://github.com/VictoriaMetrics/VictoriaMetrics/releases/download/${VM_VER}/victoria-metrics-linux-amd64-${VM_VER}.tar.gz
tar xvf victoria-metrics-linux-amd64-${VM_VER}.tar.gz
sudo mv victoria-metrics-prod /usr/local/bin/victoria-metrics
sudo chown victoriametrics:victoriametrics /usr/local/bin/victoria-metrics
rm victoria-metrics-*

cat <<EOF | sudo tee /etc/systemd/system/victoriametrics.service
[Unit]
Description=VictoriaMetrics
After=network.target

[Service]
Type=simple
User=victoriametrics
Group=victoriametrics
ExecStart=/usr/local/bin/victoria-metrics -storageDataPath=/opt/victoriametrics -retentionPeriod=6M
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 6. Alertmanager
echo "Installing Alertmanager..."
AM_VER="0.27.0"
wget https://github.com/prometheus/alertmanager/releases/download/v${AM_VER}/alertmanager-${AM_VER}.linux-amd64.tar.gz
tar xvf alertmanager-${AM_VER}.linux-amd64.tar.gz
sudo mv alertmanager-${AM_VER}.linux-amd64/alertmanager /usr/local/bin/
sudo chown alertmanager:alertmanager /usr/local/bin/alertmanager
rm -rf alertmanager-*

cat <<EOF | sudo tee /etc/systemd/system/alertmanager.service
[Unit]
Description=Alertmanager
Wants=network-online.target
After=network-online.target

[Service]
User=alertmanager
Group=alertmanager
Type=simple
ExecStart=/usr/local/bin/alertmanager \
    --config.file=/etc/alertmanager/alertmanager.yml \
    --storage.path=/var/lib/alertmanager
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 7. Grafana
echo "Installing Grafana..."
sudo mkdir -p /etc/apt/keyrings/
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
sudo apt update
sudo apt install grafana -y

# 8. MinIO
echo "Installing MinIO..."
wget https://dl.min.io/server/minio/release/linux-amd64/minio
sudo chmod +x minio
sudo mv minio /usr/local/bin/
sudo chown minio-user:minio-user /usr/local/bin/minio
sudo chown -R minio-user:minio-user /opt/minio

cat <<EOF | sudo tee /etc/systemd/system/minio.service
[Unit]
Description=MinIO
Documentation=https://min.io/docs/minio/linux/index.html
Wants=network-online.target
After=network-online.target

[Service]
User=minio-user
Group=minio-user
Environment="MINIO_ROOT_USER=admin"
Environment="MINIO_ROOT_PASSWORD=SuperSecretPassword123"
ExecStart=/usr/local/bin/minio server /opt/minio/data --console-address ":9001"
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 9. Loki & Promtail (Central)
echo "Installing Loki..."
LOKI_VER="3.1.0"
wget "https://github.com/grafana/loki/releases/download/v${LOKI_VER}/loki-linux-amd64.zip"
unzip loki-linux-amd64.zip
sudo mv loki-linux-amd64 /usr/local/bin/loki
sudo chown loki:loki /usr/local/bin/loki
rm loki-*

cat <<EOF | sudo tee /etc/systemd/system/loki.service
[Unit]
Description=Loki service
After=network.target

[Service]
Type=simple
User=loki
ExecStart=/usr/local/bin/loki -config.file /etc/loki/local-config.yaml
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# 10. Tempo
echo "Installing Tempo..."
TEMPO_VER="2.5.0"
wget "https://github.com/grafana/tempo/releases/download/v${TEMPO_VER}/tempo_${TEMPO_VER}_linux_amd64.tar.gz"
tar -xzvf tempo_${TEMPO_VER}_linux_amd64.tar.gz tempo
sudo mv tempo /usr/local/bin/tempo
sudo chown tempo:tempo /usr/local/bin/tempo
rm tempo_*

cat <<EOF | sudo tee /etc/systemd/system/tempo.service
[Unit]
Description=Tempo service
After=network.target

[Service]
Type=simple
User=tempo
ExecStart=/usr/local/bin/tempo -config.file /etc/tempo.yaml
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# 11. Node.js & PM2 (For Fastify + Next.js)
echo "Installing Node.js & PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2 yarn bun
pm2 startup systemd -u root --hp /root

# 12. Enable and Start Native Services
echo "Reloading systemd, enabling, and starting services..."
sudo systemctl daemon-reload

sudo systemctl enable prometheus victoriametrics alertmanager grafana-server minio loki tempo
sudo systemctl start prometheus victoriametrics alertmanager grafana-server minio loki tempo

echo "Bare-metal installation of main components complete!"
echo "Wazuh and Suricata should be installed via their official repos/scripts next."
