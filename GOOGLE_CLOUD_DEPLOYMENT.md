# Google Cloud Platform Deployment Guide

## Overview
This guide walks you through deploying your Ghana Cargo & Logistics web application to Google Cloud Platform using Cloud Run for serverless hosting with automatic scaling.

## Prerequisites
- Google Cloud account with billing enabled
- Google Cloud CLI installed locally
- Docker installed (for local testing)
- PostgreSQL database (we'll use Cloud SQL)

## Architecture
- **Frontend + Backend**: Single Node.js application deployed to Cloud Run
- **Database**: PostgreSQL on Cloud SQL
- **File Storage**: Google Cloud Storage (if needed)
- **Environment Variables**: Managed through Cloud Run

## Step 1: Set Up Google Cloud Project

### 1.1 Create a New Project
```bash
# Install Google Cloud CLI if not already installed
# Visit: https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Create a new project (replace PROJECT_ID with your desired ID)
gcloud projects create YOUR_PROJECT_ID --name="Ghana Cargo Logistics"

# Set the project as default
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 1.2 Set Up Billing
Visit the Google Cloud Console and enable billing for your project.

## Step 2: Set Up Cloud SQL (PostgreSQL)

### 2.1 Create PostgreSQL Instance
```bash
# Create Cloud SQL PostgreSQL instance
gcloud sql instances create cargo-logistics-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup-start-time=03:00

# Create database
gcloud sql databases create cargo_logistics --instance=cargo-logistics-db

# Create database user
gcloud sql users create dbuser --instance=cargo-logistics-db --password=YOUR_SECURE_PASSWORD
```

### 2.2 Get Connection Details
```bash
# Get the connection name
gcloud sql instances describe cargo-logistics-db --format="value(connectionName)"
```

## Step 3: Prepare Application for Deployment

### 3.1 Create Dockerfile
```dockerfile
# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the client
RUN npm run build

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
```

### 3.2 Create .dockerignore
```
node_modules
.git
.gitignore
README.md
.env*
.replit*
replit.nix
*.md
.next
.nuxt
dist
```

### 3.3 Update package.json Scripts
Add production scripts:
```json
{
  "scripts": {
    "start": "node server/index.js",
    "build": "tsc && vite build",
    "db:push": "drizzle-kit push:pg"
  }
}
```

## Step 4: Environment Variables

### 4.1 Required Environment Variables
Create a local `.env.production` file for reference:
```env
NODE_ENV=production
PORT=5000

# Database - Use Cloud SQL connection
DATABASE_URL=postgresql://dbuser:YOUR_SECURE_PASSWORD@localhost/cargo_logistics?host=/cloudsql/YOUR_PROJECT_ID:us-central1:cargo-logistics-db

# Session Secret
SESSION_SECRET=your-super-secure-session-secret-here

# Google Sheets Integration (if used)
GOOGLE_SERVICE_ACCOUNT_KEY=your-service-account-key-json
GOOGLE_SHEETS_ID=your-main-sheet-id
GOOGLE_SHEETS_ID_PENDING=your-pending-sheet-id
GOOGLE_SHEETS_ID_PENDING_COMPLETE=your-complete-sheet-id
```

## Step 5: Deploy to Cloud Run

### 5.1 Build and Deploy
```bash
# Build and deploy to Cloud Run
gcloud run deploy cargo-logistics \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 5000 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=production \
    --set-env-vars PORT=5000 \
    --add-cloudsql-instances YOUR_PROJECT_ID:us-central1:cargo-logistics-db
```

### 5.2 Set Environment Variables
```bash
# Set database connection
gcloud run services update cargo-logistics \
    --region us-central1 \
    --set-env-vars DATABASE_URL="postgresql://dbuser:YOUR_SECURE_PASSWORD@localhost/cargo_logistics?host=/cloudsql/YOUR_PROJECT_ID:us-central1:cargo-logistics-db"

# Set session secret
gcloud run services update cargo-logistics \
    --region us-central1 \
    --set-env-vars SESSION_SECRET="your-super-secure-session-secret-here"

# Set Google Sheets credentials (if used)
gcloud run services update cargo-logistics \
    --region us-central1 \
    --set-env-vars GOOGLE_SERVICE_ACCOUNT_KEY="$(cat path/to/service-account-key.json)" \
    --set-env-vars GOOGLE_SHEETS_ID="your-sheet-id"
```

## Step 6: Database Migration

### 6.1 Run Database Schema Migration
```bash
# Connect to Cloud SQL via proxy for initial setup
gcloud sql connect cargo-logistics-db --user=dbuser

# Or use Cloud Run job for schema push
gcloud run jobs create db-migrate \
    --image gcr.io/YOUR_PROJECT_ID/cargo-logistics \
    --region us-central1 \
    --add-cloudsql-instances YOUR_PROJECT_ID:us-central1:cargo-logistics-db \
    --set-env-vars DATABASE_URL="postgresql://dbuser:YOUR_SECURE_PASSWORD@localhost/cargo_logistics?host=/cloudsql/YOUR_PROJECT_ID:us-central1:cargo-logistics-db" \
    --command npm \
    --args run,db:push

# Execute the migration job
gcloud run jobs execute db-migrate --region us-central1
```

## Step 7: Custom Domain (Optional)

### 7.1 Set Up Custom Domain
```bash
# Add your domain
gcloud run domain-mappings create \
    --service cargo-logistics \
    --domain your-domain.com \
    --region us-central1
```

### 7.2 DNS Configuration
Add the provided DNS records to your domain registrar.

## Step 8: Monitoring and Logs

### 8.1 View Logs
```bash
# View application logs
gcloud run services logs tail cargo-logistics --region us-central1
```

### 8.2 Monitor Performance
Visit Google Cloud Console → Cloud Run → cargo-logistics for metrics and monitoring.

## Step 9: Production Optimizations

### 9.1 Enable Cloud CDN (Optional)
For static assets caching:
```bash
# Create load balancer with CDN
gcloud compute backend-services create cargo-logistics-backend --global
gcloud compute url-maps create cargo-logistics-map --default-service=cargo-logistics-backend
```

### 9.2 Set Up Backup Schedule
```bash
# Automated backups for Cloud SQL
gcloud sql instances patch cargo-logistics-db \
    --backup-start-time=03:00 \
    --retained-backups-count=7
```

## Cost Optimization

### Development/Testing
- Use `db-f1-micro` instance (free tier eligible)
- Set `--min-instances=0` for Cloud Run
- Use regional deployment

### Production
- Scale up to `db-n1-standard-1` or higher
- Set `--min-instances=1` to reduce cold starts
- Enable CDN for static assets

## Security Considerations

1. **Database Security**:
   - Use strong passwords
   - Enable SSL connections
   - Restrict database access to Cloud Run only

2. **Application Security**:
   - Keep dependencies updated
   - Use environment variables for secrets
   - Enable HTTPS only

3. **Access Control**:
   - Set up IAM roles properly
   - Use service accounts with minimal permissions

## Maintenance

### Regular Updates
```bash
# Redeploy with latest code
gcloud run deploy cargo-logistics --source . --region us-central1

# Update database schema
gcloud run jobs execute db-migrate --region us-central1
```

### Monitoring
- Set up Cloud Monitoring alerts
- Monitor database performance
- Check application logs regularly

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify Cloud SQL instance is running
   - Check connection string format
   - Ensure Cloud SQL connector is added

2. **Build Failures**:
   - Check Dockerfile syntax
   - Verify all dependencies in package.json
   - Ensure TypeScript compilation succeeds

3. **Environment Variables**:
   - Use `gcloud run services describe` to verify env vars
   - Check for special characters in values
   - Ensure JSON strings are properly escaped

### Support Commands
```bash
# Check service status
gcloud run services describe cargo-logistics --region us-central1

# View recent deployments
gcloud run revisions list --service cargo-logistics --region us-central1

# Debug container
gcloud run services proxy cargo-logistics --port 8080 --region us-central1
```

## Estimated Costs

### Development (Light Usage)
- Cloud Run: $0-5/month (free tier)
- Cloud SQL: $7-15/month (db-f1-micro)
- **Total**: ~$7-20/month

### Production (Moderate Usage)
- Cloud Run: $10-30/month
- Cloud SQL: $25-50/month (db-n1-standard-1)
- Load Balancer: $18/month
- **Total**: ~$53-98/month

The application will automatically scale based on traffic and you only pay for what you use with Cloud Run's pay-per-request model.