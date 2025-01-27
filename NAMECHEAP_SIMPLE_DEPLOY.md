# Simple Deployment Guide for Namecheap Shared Hosting

## Files to Upload
After running `npm run build`, you'll have these files ready in the `dist/public/` folder:

1. `index.html` - Your main HTML file
2. `assets/` folder - Contains all your JavaScript and CSS files
3. `.htaccess` - Important for client-side routing

## Step-by-Step Upload Process

1. Log into your Namecheap cPanel
2. Open File Manager
3. Navigate to `public_html`
4. Upload the files:
   - Upload `index.html` directly to `public_html`
   - Upload the entire `assets` folder to `public_html`
   - Upload `.htaccess` to `public_html`

## Important Notes
- Make sure all files are uploaded to the correct locations
- Don't modify any file names
- The `.htaccess` file is crucial for the application to work properly
- Keep the same folder structure as in `dist/public/`

## Verification Steps
After uploading, visit your domain and check:
1. The website loads properly
2. Dark mode toggle works
3. Navigation between pages works
4. All images and styles are loading correctly
