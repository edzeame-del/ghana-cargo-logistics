# DigitalOcean Deployment Guide

## Prerequisites
- DigitalOcean account
- Domain name (optional but recommended)
- Your app's environment variables

## Step 1: Create a Droplet
1. Go to DigitalOcean Dashboard
2. Click "Create" → "Droplets"
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic plan, $12/month (2GB RAM, 1 CPU)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH key (recommended) or password
4. Click "Create Droplet"

## Step 2: Connect to Your Server
```bash
ssh root@your-droplet-ip
```

## Step 3: Install Docker and Docker Compose
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start Docker service
systemctl start docker
systemctl enable docker
```

## Step 4: Upload Your Code
```bash
# Option 1: Clone from Git (if you have a repository)
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Option 2: Upload files using SCP
# From your local machine:
scp -r . root@your-droplet-ip:/app
```

## Step 5: Set Up Environment Variables
```bash
# Create environment file
nano .env
```

Add your environment variables:
```env
DATABASE_URL=postgresql://postgres:your-password@db:5432/cargo_tracking
SESSION_SECRET=your-super-secret-session-key
DB_PASSWORD=your-secure-database-password
GOOGLE_SERVICE_ACCOUNT_KEY=your-google-service-account-key
GOOGLE_SHEETS_ID=your-main-google-sheets-id
GOOGLE_SHEETS_ID_PENDING=your-pending-google-sheets-id
GOOGLE_SHEETS_ID_PENDING_COMPLETE=your-pending-complete-google-sheets-id
```

## Step 6: Deploy with Docker Compose
```bash
# Build and start the application
docker-compose up -d --build

# Check if everything is running
docker-compose ps

# View logs
docker-compose logs app
```

## Step 7: Set Up Domain (Optional)
If you have a domain:

1. **Point DNS to your droplet**:
   - Add A record: `your-domain.com` → `your-droplet-ip`

2. **Install SSL certificate**:
```bash
# Install Certbot
apt install snapd
snap install --classic certbot

# Get SSL certificate
certbot --nginx -d your-domain.com

# Update nginx.conf with your domain name
nano nginx.conf
# Replace "your-domain.com" with your actual domain

# Restart nginx
docker-compose restart nginx
```

## Step 8: Database Migration
```bash
# Run database migrations
docker-compose exec app npm run db:push
```

## Step 9: Test Your Deployment
- Visit `http://your-droplet-ip` or `https://your-domain.com`
- Test tracking search functionality
- Check admin login at `/auth`

## Maintenance Commands

**View logs**:
```bash
docker-compose logs -f app
```

**Restart application**:
```bash
docker-compose restart app
```

**Update application**:
```bash
git pull  # if using git
docker-compose up -d --build
```

**Backup database**:
```bash
docker-compose exec db pg_dump -U postgres cargo_tracking > backup.sql
```

## Estimated Monthly Costs
- **Droplet**: $12/month (2GB RAM)
- **Domain**: $10-15/year
- **Total**: ~$12-13/month

## Security Best Practices
1. Set up firewall: `ufw enable && ufw allow 22,80,443/tcp`
2. Disable root SSH login after creating a user account
3. Keep system updated: `apt update && apt upgrade`
4. Use strong passwords and SSH keys
5. Regular backups of your database

## Troubleshooting
- Check app logs: `docker-compose logs app`
- Check database connectivity: `docker-compose exec app npm run db:push`
- Restart services: `docker-compose restart`
- Check disk space: `df -h`
- Check memory usage: `free -h`