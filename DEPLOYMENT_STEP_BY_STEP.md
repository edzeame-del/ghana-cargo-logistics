# Step-by-Step Google Cloud Deployment Guide

## Prerequisites Checklist
- [ ] Google account with billing enabled
- [ ] Google Cloud CLI installed on your computer
- [ ] Basic terminal/command line knowledge

## Part 1: Initial Setup (15 minutes)

### Step 1: Install Google Cloud CLI
**Windows:**
1. Go to https://cloud.google.com/sdk/docs/install
2. Download the installer
3. Run the installer and follow prompts

**Mac:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Step 2: Login to Google Cloud
Open terminal/command prompt and run:
```bash
gcloud auth login
```
- A browser will open
- Sign in with your Google account
- Allow permissions

### Step 3: Create Project
```bash
# Replace "my-cargo-app" with your preferred project name
gcloud projects create my-cargo-app --name="Cargo Logistics App"

# Set as default project
gcloud config set project my-cargo-app

# Enable billing (you'll need to do this in the web console)
echo "Go to https://console.cloud.google.com/billing and enable billing for your project"
```

### Step 4: Enable Required APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## Part 2: Database Setup (20 minutes)

### Step 5: Create PostgreSQL Database
```bash
# Create the database instance (this takes 5-10 minutes)
gcloud sql instances create cargo-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --backup-start-time=03:00

# Create the database
gcloud sql databases create cargo_logistics --instance=cargo-db

# Create database user (replace YOUR_PASSWORD with a strong password)
gcloud sql users create dbuser --instance=cargo-db --password=YOUR_STRONG_PASSWORD
```

### Step 6: Get Database Connection Info
```bash
# Get your connection name - save this for later
gcloud sql instances describe cargo-db --format="value(connectionName)"
```
**Example output:** `my-cargo-app:us-central1:cargo-db`

## Part 3: Prepare Your Application (10 minutes)

### Step 7: Add Health Check Endpoint
Your application already has this! The health endpoint is at `/api/health`.

### Step 8: Create Environment Variables
Create a file called `.env.production` in your project:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://dbuser:YOUR_STRONG_PASSWORD@localhost/cargo_logistics?host=/cloudsql/my-cargo-app:us-central1:cargo-db
SESSION_SECRET=your-super-secure-session-secret-at-least-32-characters-long
```

**Replace:**
- `YOUR_STRONG_PASSWORD` with the password you created in Step 5
- `my-cargo-app` with your actual project ID
- `your-super-secure-session-secret...` with a random 32+ character string

## Part 4: Deploy to Google Cloud (15 minutes)

### Step 9: Deploy to Cloud Run
In your project directory, run:
```bash
# This will build and deploy your app
gcloud run deploy cargo-logistics \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 5000 \
    --memory 1Gi \
    --cpu 1 \
    --add-cloudsql-instances my-cargo-app:us-central1:cargo-db
```

**When prompted:**
- Press Enter to confirm the source code location
- Wait 5-10 minutes for the build to complete

### Step 10: Set Environment Variables
```bash
# Set database connection
gcloud run services update cargo-logistics \
    --region us-central1 \
    --set-env-vars DATABASE_URL="postgresql://dbuser:YOUR_STRONG_PASSWORD@localhost/cargo_logistics?host=/cloudsql/my-cargo-app:us-central1:cargo-db"

# Set session secret
gcloud run services update cargo-logistics \
    --region us-central1 \
    --set-env-vars SESSION_SECRET="your-super-secure-session-secret-at-least-32-characters-long"
```

### Step 11: Initialize Database Schema
```bash
# Create a temporary job to set up your database tables
gcloud run jobs create db-setup \
    --image gcr.io/my-cargo-app/cargo-logistics \
    --region us-central1 \
    --add-cloudsql-instances my-cargo-app:us-central1:cargo-db \
    --set-env-vars DATABASE_URL="postgresql://dbuser:YOUR_STRONG_PASSWORD@localhost/cargo_logistics?host=/cloudsql/my-cargo-app:us-central1:cargo-db" \
    --command npm \
    --args run,db:push

# Run the database setup
gcloud run jobs execute db-setup --region us-central1
```

## Part 5: Test Your Deployment (5 minutes)

### Step 12: Get Your App URL
```bash
gcloud run services describe cargo-logistics --region us-central1 --format="value(status.url)"
```

### Step 13: Test Your Application
1. Open the URL from Step 12 in your browser
2. Try logging in with your admin credentials
3. Test the tracking search functionality
4. Check the admin panel

## Part 6: Optional Enhancements

### Step 14: Add Custom Domain (Optional)
If you have a domain:
```bash
gcloud run domain-mappings create \
    --service cargo-logistics \
    --domain your-domain.com \
    --region us-central1
```

### Step 15: Set Up Monitoring (Recommended)
1. Go to https://console.cloud.google.com/monitoring
2. Create alerts for your service
3. Set up uptime checks

## Troubleshooting Common Issues

### Build Failed
**Error:** Build timeout or failure
**Solution:**
```bash
# Check build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

### Database Connection Error
**Error:** Can't connect to database
**Solution:**
```bash
# Verify Cloud SQL instance is running
gcloud sql instances list

# Check connection string format
gcloud run services describe cargo-logistics --region us-central1
```

### Environment Variables Not Set
**Error:** Missing environment variables
**Solution:**
```bash
# List current environment variables
gcloud run services describe cargo-logistics --region us-central1 --format="export" | grep env

# Update if needed
gcloud run services update cargo-logistics --region us-central1 --set-env-vars KEY=VALUE
```

## Cost Monitoring

### Expected Monthly Costs:
- **Development/Testing:** $5-15/month
  - Cloud Run: Free tier covers light usage
  - Cloud SQL: ~$7/month (db-f1-micro)

- **Production:** $30-80/month
  - Cloud Run: $10-25/month (depends on traffic)
  - Cloud SQL: $20-50/month (depending on size)

### Cost Optimization:
```bash
# Set minimum instances to 0 to save money during low traffic
gcloud run services update cargo-logistics \
    --region us-central1 \
    --min-instances 0

# Monitor usage
gcloud billing budgets list
```

## Maintenance Commands

### Update Your Application:
```bash
# Redeploy after making changes
gcloud run deploy cargo-logistics --source . --region us-central1
```

### View Logs:
```bash
# Stream live logs
gcloud run services logs tail cargo-logistics --region us-central1

# View recent logs
gcloud run services logs read cargo-logistics --region us-central1 --limit=50
```

### Database Backups:
```bash
# List backups
gcloud sql backups list --instance=cargo-db

# Create manual backup
gcloud sql backups create --instance=cargo-db
```

## Security Checklist

- [ ] Database password is strong (16+ characters)
- [ ] Session secret is random (32+ characters)
- [ ] HTTPS is enabled (automatic with Cloud Run)
- [ ] Database allows connections only from Cloud Run
- [ ] Regular backups are configured
- [ ] Monitoring and alerts are set up

## Next Steps After Deployment

1. **Test thoroughly** - Check all features work correctly
2. **Set up monitoring** - Create uptime checks and alerts
3. **Configure backups** - Ensure data is backed up regularly
4. **Document** - Keep track of your configuration
5. **Update DNS** - Point your domain to the new service

## Getting Help

If you encounter issues:
1. Check the logs: `gcloud run services logs tail cargo-logistics --region us-central1`
2. Verify environment variables are set correctly
3. Ensure database instance is running
4. Check the Google Cloud Console for error messages

Your application should now be live and accessible via the Cloud Run URL!