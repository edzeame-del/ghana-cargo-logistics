# Deploying to Namecheap Shared Hosting

## Step 1: Build the Application
1. Run the build command:
```bash
npm run build
```

## Step 2: Locate the Build Files
After building, you'll find the following files:
- Frontend files in `dist/public/` directory:
  - `index.html`
  - `assets/` folder (containing JavaScript and CSS)
  - Other static assets

## Step 3: Upload to Namecheap
1. Access your Namecheap cPanel
2. Navigate to File Manager
3. Upload the contents of `dist/public/` to your `public_html` folder:
   - All files from `assets/`
   - `index.html`
   - `.htaccess` (important for client-side routing)

## Step 4: Verify Installation
1. Visit your domain
2. Check if:
   - The site loads properly
   - Dark mode toggle works
   - Client-side routing works (try navigating between pages)
   - Images and styles are loading correctly

## Troubleshooting
If you encounter issues:
1. Check if all files are uploaded to the correct locations
2. Verify that `.htaccess` is properly uploaded
3. Make sure your domain's DNS settings are correct
4. Check the error logs in cPanel if something isn't working

## Important Notes
- Keep your production environment variables secure
- Don't upload the `node_modules` folder
- Make sure file permissions are set correctly (usually 644 for files, 755 for directories)
