# Download & Deploy Guide

## What to Download for GitHub & DigitalOcean

### For GitHub Upload - Download Everything
You should download your **entire project folder** to push to GitHub. This includes all files and folders except those listed in `.gitignore`.

### Essential Files & Folders to Include:

#### ✅ Core Application Files
```
├── client/                    # React frontend (REQUIRED)
│   ├── src/                  # All React components, pages, hooks
│   ├── public/               # Static assets
│   └── index.html            # Main HTML file
├── server/                   # Express backend (REQUIRED)
│   ├── routes.ts            # API routes
│   ├── index.ts             # Server entry point
│   └── vite.ts              # Vite configuration
├── db/                       # Database schema (REQUIRED)
│   └── schema.ts            # Drizzle database models
```

#### ✅ Configuration Files (REQUIRED)
```
├── package.json             # Dependencies and scripts
├── package-lock.json        # Dependency lock file
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── tailwind.config.ts      # Tailwind CSS config
├── drizzle.config.ts       # Database configuration
├── postcss.config.js       # PostCSS configuration
└── theme.json              # UI theme settings
```

#### ✅ Documentation & Setup (REQUIRED)
```
├── README.md               # Project documentation
├── .gitignore             # Git exclusion rules
├── LICENSE                # MIT license
├── GITHUB_SETUP_GUIDE.md  # GitHub setup instructions
├── DEPLOYMENT_STEP_BY_STEP.md  # Google Cloud guide
└── .env.production.example # Environment variables template
```

#### ✅ Deployment Files (REQUIRED)
```
├── Dockerfile             # Docker container configuration
├── cloudbuild.yaml        # Google Cloud Build config
└── app.yaml               # App Engine configuration
```

### ❌ Files to EXCLUDE (automatically excluded by .gitignore):
```
├── node_modules/          # Dependencies (will be installed)
├── .env                   # Your actual environment variables
├── dist/                  # Build output
├── .replit               # Replit-specific files
├── replit.nix            # Replit configuration
└── *.log                 # Log files
```

## Step-by-Step Download Process

### Option 1: Download from Replit (Recommended)
1. **In Replit, go to Files panel**
2. **Click the three dots menu** at the top of the files
3. **Select "Download as zip"**
4. **Extract the zip file** to your local computer
5. **Navigate to the extracted folder** in terminal/command prompt

### Option 2: Clone from Replit Git
```bash
# If your Replit has Git enabled
git clone https://your-repl-name.repl.co.git
cd your-project-folder
```

## GitHub Upload Process

### After downloading, follow these steps:

1. **Open terminal in your project folder**
2. **Initialize Git repository:**
```bash
git init
git add .
git commit -m "Initial commit: Ghana cargo logistics application"
```

3. **Create GitHub repository** (on GitHub.com):
   - Go to https://github.com/new
   - Repository name: `ghana-cargo-logistics`
   - Description: `Comprehensive Ghana-focused cargo and logistics web application`
   - Public/Private: Your choice
   - **Don't** add README, .gitignore, or license (we have them)

4. **Connect and push to GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/ghana-cargo-logistics.git
git push -u origin main
```

## DigitalOcean Deployment Options

### Option 1: App Platform (Recommended - Easiest)

1. **Connect GitHub repository:**
   - Go to DigitalOcean App Platform
   - Click "Create App"
   - Connect your GitHub account
   - Select your `ghana-cargo-logistics` repository

2. **Configure build settings:**
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Environment: Node.js 18+

3. **Set environment variables:**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: Random secure string
   - `GOOGLE_SERVICE_ACCOUNT_KEY`: Your Google Sheets credentials
   - `GOOGLE_SHEETS_ID`: Main tracking sheet ID
   - `GOOGLE_SHEETS_ID_PENDING`: Pending goods sheet ID

4. **Deploy:**
   - DigitalOcean will automatically build and deploy
   - You'll get a live URL like `your-app.ondigitalocean.app`

### Option 2: Droplet (VPS - More Control)

1. **Create PostgreSQL database:**
   - Use DigitalOcean Managed Databases
   - Or install on your droplet

2. **Upload your code:**
```bash
# On your droplet
git clone https://github.com/YOUR_USERNAME/ghana-cargo-logistics.git
cd ghana-cargo-logistics
npm install
```

3. **Set up environment:**
```bash
cp .env.production.example .env
# Edit .env with your actual database and API credentials
nano .env
```

4. **Initialize database:**
```bash
npm run db:push
```

5. **Start application:**
```bash
npm run build
npm start
# Or use PM2 for production: pm2 start npm --name "cargo-logistics" -- start
```

## Required Environment Variables for Production

Create these environment variables in DigitalOcean:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secure-session-secret-32-chars
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
GOOGLE_SHEETS_ID=your-main-tracking-sheet-id
GOOGLE_SHEETS_ID_PENDING=your-pending-goods-sheet-id
GOOGLE_SHEETS_ID_PENDING_COMPLETE=your-complete-goods-sheet-id
```

## File Structure Verification

After download, your folder should look like this:
```
ghana-cargo-logistics/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── ...
├── server/
├── db/
├── package.json
├── README.md
├── Dockerfile
└── ...
```

## Pre-Deployment Checklist

- [ ] All source code downloaded
- [ ] Package.json includes all dependencies
- [ ] Environment variables configured
- [ ] Database schema ready (schema.ts)
- [ ] Build configuration present (vite.config.ts)
- [ ] Documentation files included
- [ ] Git repository initialized
- [ ] GitHub repository created and pushed
- [ ] DigitalOcean account ready
- [ ] Database service selected (Managed DB or self-hosted)

## Troubleshooting Common Issues

### Missing Dependencies
```bash
# If you get dependency errors
rm package-lock.json
rm -rf node_modules
npm install
```

### Build Errors
```bash
# Check build process
npm run build
# Fix any TypeScript or build errors before deploying
```

### Database Connection
```bash
# Test database connection
npm run db:push
# This should create tables without errors
```

### Environment Variables
- Double-check all environment variables are set correctly
- Use the exact format from `.env.production.example`
- Ensure no trailing spaces or quotes issues

Your project is now ready for GitHub and DigitalOcean deployment! The download should include everything needed for hosting.