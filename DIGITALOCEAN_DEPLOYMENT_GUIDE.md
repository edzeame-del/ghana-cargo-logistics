# DigitalOcean Deployment Guide for Ghana Cargo & Logistics

This guide will walk you through deploying your tracking application to DigitalOcean using their App Platform.

## Prerequisites

- DigitalOcean account
- Your application code repository (GitHub, GitLab, or Bitbucket)
- Environment variables and secrets ready

## Method 1: DigitalOcean App Platform (Recommended)

### Step 1: Prepare Your Repository

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)
2. **Create a `Dockerfile`** in your project root:

```dockerfile
# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
```

3. **Update package.json** to include these scripts:
```json
{
  "scripts": {
    "start": "tsx server/index.ts",
    "build": "echo 'Build completed'",
    "db:push": "drizzle-kit push:pg"
  }
}
```

### Step 2: Set Up PostgreSQL Database

1. **Log into DigitalOcean** → Databases → Create Database
2. **Select PostgreSQL** version 15
3. **Choose your plan** (Basic $15/month is sufficient for start)
4. **Select datacenter region** (closest to your users)
5. **Name your database** (e.g., `ghana-cargo-db`)
6. **Wait for database creation** (5-10 minutes)
7. **Note down connection details**:
   - Host
   - Port
   - Username
   - Password
   - Database name
   - SSL Certificate (download if needed)

### Step 3: Create DigitalOcean App

1. **Go to Apps** → Create App
2. **Connect your repository**:
   - Choose your Git provider
   - Authorize DigitalOcean access
   - Select your repository
   - Choose branch (usually `main` or `master`)

3. **Configure your app**:
   - **Name**: `ghana-cargo-app`
   - **Region**: Same as your database
   - **Plan**: Basic ($12/month) or Professional ($24/month)
   - **Instance Count**: 1

### Step 4: Configure Environment Variables

In the App Platform settings, add these environment variables:

**Required Variables:**
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
SESSION_SECRET=your-super-secret-session-key-here-make-it-long-and-random
```

**Google Sheets Integration:**
```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
GOOGLE_SHEETS_ID=your-main-google-sheets-id
GOOGLE_SHEETS_ID_PENDING=your-pending-google-sheets-id
```

**How to set environment variables:**
1. Go to App → Settings → App-Level Environment Variables
2. Click "Edit" → Add Variable
3. Set each variable with `Key` and `Value`
4. Mark sensitive variables as "Encrypted"

### Step 5: Deploy Your Application

1. **Click "Deploy App"**
2. **Wait for deployment** (10-15 minutes)
3. **Check deployment logs** for any errors
4. **Test your application** using the provided URL

### Step 6: Set Up Custom Domain (Optional)

1. **Add your domain** in App → Settings → Domains
2. **Update DNS records** at your domain provider:
   - Add CNAME record pointing to your DigitalOcean app URL
3. **Wait for SSL certificate** to be automatically provisioned

## Method 2: DigitalOcean Droplet (Manual Setup)

### Step 1: Create a Droplet

1. **Create Droplet** → Ubuntu 22.04 LTS
2. **Choose plan**: Basic $12/month (2GB RAM)
3. **Add SSH key** or create password
4. **Name your droplet**: `ghana-cargo-server`

### Step 2: Initial Server Setup

```bash
# Connect to your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install PostgreSQL
apt install postgresql postgresql-contrib -y
```

### Step 3: Set Up PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE ghana_cargo;
CREATE USER cargo_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE ghana_cargo TO cargo_user;
\q

# Configure PostgreSQL for external connections
nano /etc/postgresql/14/main/postgresql.conf
# Change: listen_addresses = 'localhost' to listen_addresses = '*'

nano /etc/postgresql/14/main/pg_hba.conf
# Add: host ghana_cargo cargo_user 0.0.0.0/0 md5

# Restart PostgreSQL
systemctl restart postgresql
```

### Step 4: Deploy Application

```bash
# Clone your repository
git clone https://github.com/yourusername/your-repo.git /var/www/ghana-cargo
cd /var/www/ghana-cargo

# Install dependencies
npm install

# Set up environment variables
nano .env
```

Add to `.env`:
```
NODE_ENV=production
DATABASE_URL=postgresql://cargo_user:your-secure-password@localhost:5432/ghana_cargo
SESSION_SECRET=your-super-secret-session-key
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_SHEETS_ID=your-sheets-id
GOOGLE_SHEETS_ID_PENDING=your-pending-sheets-id
```

```bash
# Run database migrations
npm run db:push

# Start application with PM2
pm2 start npm --name "ghana-cargo" -- start
pm2 save
pm2 startup
```

### Step 5: Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/ghana-cargo
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/ghana-cargo /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Install SSL certificate with Let's Encrypt
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Environment Variables Explained

### Required Variables
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Random string for session encryption (generate with `openssl rand -base64 32`)
- **NODE_ENV**: Set to `production`

### Google Sheets Integration
- **GOOGLE_SERVICE_ACCOUNT_KEY**: JSON key from Google Cloud Console
- **GOOGLE_SHEETS_ID**: ID from your main tracking Google Sheet URL
- **GOOGLE_SHEETS_ID_PENDING**: ID from your pending goods Google Sheet URL

## Post-Deployment Checklist

### 1. Test Your Application
- [ ] Visit your domain/IP address
- [ ] Test tracking search functionality
- [ ] Verify admin login works
- [ ] Test Google Sheets sync (if configured)

### 2. Set Up Monitoring
- [ ] Configure DigitalOcean monitoring alerts
- [ ] Set up log monitoring
- [ ] Test database connection

### 3. Security
- [ ] Ensure all environment variables are set
- [ ] Verify SSL certificate is working
- [ ] Test admin authentication
- [ ] Review firewall settings

### 4. Backup Strategy
- [ ] Set up automated database backups
- [ ] Document restore procedures
- [ ] Test backup restoration

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL format
- Verify database credentials
- Ensure database server is running

**Application Won't Start**
- Check application logs: `pm2 logs ghana-cargo`
- Verify all environment variables are set
- Check Node.js version compatibility

**SSL Certificate Issues**
- Verify domain DNS settings
- Check Nginx configuration
- Ensure port 80/443 are open

### Useful Commands

```bash
# Check application status
pm2 status

# View application logs
pm2 logs ghana-cargo

# Restart application
pm2 restart ghana-cargo

# Check Nginx status
systemctl status nginx

# Check database status
systemctl status postgresql

# View Nginx error logs
tail -f /var/log/nginx/error.log
```

## Cost Estimation

### DigitalOcean App Platform
- **Basic App**: $12/month
- **PostgreSQL Database**: $15/month
- **Total**: ~$27/month

### DigitalOcean Droplet
- **Basic Droplet**: $12/month (2GB RAM)
- **Managed Database**: $15/month (optional)
- **Total**: $12-27/month

## Support and Maintenance

### Regular Maintenance
- Monitor application performance
- Keep dependencies updated
- Review security patches
- Monitor database usage
- Check backup integrity

### Scaling Considerations
- Increase droplet size for more traffic
- Add load balancer for high availability
- Consider CDN for static assets
- Implement caching strategies

---

**Need Help?**
- DigitalOcean Documentation: https://docs.digitalocean.com/
- DigitalOcean Community: https://www.digitalocean.com/community
- Support tickets for technical issues