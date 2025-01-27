# Deploying to Namecheap Shared Hosting

## Prerequisites
1. A Namecheap hosting account with Node.js support
2. Access to cPanel
3. FTP access credentials

## Deployment Steps

1. Build the application locally:
```bash
npm run build
```

2. Via cPanel File Manager or FTP:
   - Upload contents of `dist/public` to `public_html`
   - Upload the `.htaccess` file to `public_html`
   - Create a new folder outside `public_html` (e.g., `server`) and upload:
     - `dist/index.js`
     - `package.json`
     - `package-lock.json`

3. Set up Node.js App:
   - In cPanel, go to "Setup Node.js App"
   - Create a new application:
     - Application mode: Production
     - Application root: /server
     - Application URL: Your domain
     - Application startup file: index.js
     - Node.js version: 20.x
     - NPM Version: Latest stable
     - Environment variables:
       ```
       NODE_ENV=production
       PORT=3000
       HOST=127.0.0.1
       ```

4. Update DNS/Domain Settings:
   - Add an A record pointing to your hosting IP
   - Add a CNAME record for www subdomain

## Environment Variables
Remember to set these in cPanel's Node.js App configuration:
- DATABASE_URL (if using database)
- Any API keys or secrets used by your application

## Troubleshooting
1. If the site shows a 500 error:
   - Check Node.js error logs in cPanel
   - Verify all environment variables are set
   - Ensure the server port matches hosting requirements

2. If client-side routing doesn't work:
   - Verify .htaccess file is properly uploaded
   - Enable mod_rewrite in cPanel if available

3. For other issues:
   - Check error logs in cPanel
   - Verify file permissions (typically 644 for files, 755 for directories)
