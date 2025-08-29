# GitHub Setup Guide

## Step-by-Step Instructions to Put Your Project on GitHub

### Prerequisites
- Git installed on your computer
- GitHub account (create one at https://github.com if you don't have one)

### Step 1: Install Git (if not already installed)

**Windows:**
- Download from https://git-scm.com/download/win
- Run the installer with default settings

**Mac:**
```bash
brew install git
# OR download from https://git-scm.com/download/mac
```

**Linux:**
```bash
sudo apt-get install git  # Ubuntu/Debian
sudo yum install git      # CentOS/RHEL
```

### Step 2: Configure Git (First Time Setup)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Create GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click the "+" icon** in the top-right corner
3. **Select "New repository"**
4. **Fill in repository details:**
   - Repository name: `ghana-cargo-logistics` (or your preferred name)
   - Description: `Comprehensive Ghana-focused cargo and logistics web application`
   - Choose **Public** or **Private**
   - **DO NOT** check "Add a README file" (we already have one)
   - **DO NOT** add .gitignore or license (we have them)
5. **Click "Create repository"**

### Step 4: Initialize Local Git Repository

Open terminal/command prompt in your project folder and run:

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Ghana cargo logistics application"

# Add GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/ghana-cargo-logistics.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

### Step 5: Verify Upload

1. **Refresh your GitHub repository page**
2. **You should see all your files uploaded**
3. **The README.md should display automatically**

## Alternative Method: Using GitHub Desktop

### Step 1: Download GitHub Desktop
- Go to https://desktop.github.com/
- Download and install GitHub Desktop

### Step 2: Sign In
- Open GitHub Desktop
- Sign in with your GitHub account

### Step 3: Add Repository
1. Click "File" → "Add local repository"
2. Choose your project folder
3. Click "Add repository"
4. If prompted, click "create a repository"

### Step 4: Publish to GitHub
1. Click "Publish repository" button
2. Enter repository name: `ghana-cargo-logistics`
3. Add description: `Comprehensive Ghana-focused cargo and logistics web application`
4. Choose public or private
5. Click "Publish repository"

## Setting Up Environment Variables on GitHub

### For GitHub Actions (CI/CD)
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add these secrets:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `GOOGLE_SERVICE_ACCOUNT_KEY`
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_SHEETS_ID_PENDING`

### For Collaborators
Create a `.env.example` file (already included) with placeholder values:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/cargo_logistics
SESSION_SECRET=your-secure-session-secret-here
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_SHEETS_ID=your-main-tracking-sheet-id
GOOGLE_SHEETS_ID_PENDING=your-pending-goods-sheet-id
```

## Daily Git Workflow

### Making Changes
```bash
# Check status of files
git status

# Add specific files
git add file1.js file2.js

# Or add all changes
git add .

# Commit changes with descriptive message
git commit -m "Add mobile-responsive design to admin panels"

# Push to GitHub
git push
```

### Best Practices for Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Reference issues if applicable: "Fix search bug (#123)"

**Examples:**
```bash
git commit -m "Add mobile-responsive navigation menu"
git commit -m "Fix database search pagination issue"
git commit -m "Update Google Sheets sync to handle 28k records"
git commit -m "Implement user activity heat map visualization"
```

## Branching Strategy (Recommended)

### Create Feature Branches
```bash
# Create and switch to new branch
git checkout -b feature/mobile-responsive-design

# Work on your feature...
# Add and commit changes

# Push branch to GitHub
git push -u origin feature/mobile-responsive-design

# Create Pull Request on GitHub
# After review, merge to main branch
```

### Working with Branches
```bash
# List all branches
git branch -a

# Switch to existing branch
git checkout branch-name

# Merge branch to main
git checkout main
git merge feature/mobile-responsive-design

# Delete branch after merging
git branch -d feature/mobile-responsive-design
```

## Collaboration Setup

### Adding Collaborators
1. Go to repository Settings
2. Click "Manage access"
3. Click "Invite a collaborator"
4. Enter their GitHub username or email

### Team Workflow
1. **Clone repository** (for new team members):
   ```bash
   git clone https://github.com/YOUR_USERNAME/ghana-cargo-logistics.git
   cd ghana-cargo-logistics
   ```

2. **Set up environment**:
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with actual values
   npm run db:push
   ```

3. **Regular updates**:
   ```bash
   git pull origin main  # Get latest changes
   # Make your changes
   git add .
   git commit -m "Your change description"
   git push
   ```

## Repository Maintenance

### Regular Tasks
- **Update README.md** when adding features
- **Tag releases** for version management
- **Clean up old branches** after merging
- **Monitor issues and pull requests**

### Version Tagging
```bash
# Create a tag for release
git tag -a v1.0.0 -m "Initial release with mobile admin panels"
git push origin v1.0.0
```

### Backup Strategy
- GitHub serves as your primary backup
- Consider setting up automated backups for production database
- Keep local development environment in sync

## Troubleshooting Common Issues

### Authentication Issues
```bash
# If you have 2FA enabled, use personal access token
# Go to GitHub Settings → Developer settings → Personal access tokens
# Use token as password when prompted
```

### Large File Issues
```bash
# If you have large files, use Git LFS
git lfs install
git lfs track "*.pdf"
git add .gitattributes
git commit -m "Add Git LFS for large files"
```

### Merge Conflicts
```bash
# When conflicts occur
git status                    # See conflicted files
# Edit files to resolve conflicts
git add resolved-file.js
git commit -m "Resolve merge conflict"
```

## GitHub Features to Explore

1. **Issues**: Track bugs and feature requests
2. **Projects**: Organize work with Kanban boards
3. **Actions**: Set up CI/CD pipelines
4. **Wiki**: Create detailed documentation
5. **Releases**: Package and distribute versions
6. **Security**: Vulnerability scanning and alerts

Your Ghana cargo logistics application is now ready for GitHub! The repository includes comprehensive documentation, proper gitignore settings, and clear setup instructions for collaborators.