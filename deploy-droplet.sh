#!/bin/bash

# DigitalOcean Droplet Deployment Script for Ghana Cargo & Logistics
# Run this script on your fresh Ubuntu 22.04 droplet

set -e

echo "🚀 Starting deployment of Ghana Cargo & Logistics..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18
echo "🟢 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 (Process Manager)
echo "⚙️ Installing PM2..."
npm install -g pm2 tsx

# Install Nginx
echo "🌐 Installing Nginx..."
apt install nginx -y

# Install PostgreSQL
echo "🗄️ Installing PostgreSQL..."
apt install postgresql postgresql-contrib -y

# Create application directory
echo "📁 Setting up application directory..."
mkdir -p /var/www/ghana-cargo
mkdir -p /var/log/pm2

# Create postgres user and database
echo "🔐 Setting up PostgreSQL database..."
sudo -u postgres psql <<EOF
CREATE DATABASE ghana_cargo;
CREATE USER cargo_user WITH PASSWORD 'cargo_secure_password_2024';
GRANT ALL PRIVILEGES ON DATABASE ghana_cargo TO cargo_user;
ALTER USER cargo_user CREATEDB;
\q
EOF

# Configure PostgreSQL for external connections
echo "🔧 Configuring PostgreSQL..."
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/14/main/postgresql.conf
echo "host ghana_cargo cargo_user 127.0.0.1/32 md5" >> /etc/postgresql/14/main/pg_hba.conf

# Restart PostgreSQL
systemctl restart postgresql

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Start and enable services
echo "🔄 Starting services..."
systemctl enable nginx
systemctl enable postgresql
systemctl start nginx
systemctl start postgresql

echo "✅ Base setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /var/www/ghana-cargo"
echo "2. Set up environment variables"
echo "3. Install dependencies and start the application"
echo ""
echo "Repository setup commands:"
echo "cd /var/www/ghana-cargo"
echo "git clone https://github.com/yourusername/your-repo.git ."
echo "npm install"
echo "cp .env.example .env"
echo "nano .env  # Configure your environment variables"
echo "npm run db:push"
echo "pm2 start ecosystem.config.js"
echo "pm2 save && pm2 startup"
echo ""
echo "Database connection:"
echo "DATABASE_URL=postgresql://cargo_user:cargo_secure_password_2024@localhost:5432/ghana_cargo"