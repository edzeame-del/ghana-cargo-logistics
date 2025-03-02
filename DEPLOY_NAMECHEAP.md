# Deploying to Namecheap Shared Hosting

## Prerequisites
1. A Namecheap hosting account with Node.js support
2. Access to cPanel
3. FTP access credentials
4. PostgreSQL database (create this in cPanel)

## Deployment Steps

1. Create PostgreSQL Database:
   - In cPanel, go to "PostgreSQL Databases"
   - Create a new database and note down:
     - Database name
     - Username
     - Password
     - Host
     - Port

2. Set up Environment Variables:
   - Create `.env.production` from `.env.production.example`
   - Set the DATABASE_URL in format:
     ```
     DATABASE_URL=postgres://username:password@host:port/database
     ```

3. Build the application locally:
```bash
npm run build
```

4. Via cPanel File Manager or FTP:
   - Upload contents of `dist/public` to `public_html`
   - Upload the `.htaccess` file to `public_html`
   - Create a new folder outside `public_html` (e.g., `server`) and upload:
     - `dist/index.js`
     - `package.json`
     - `package-lock.json`
     - `.env.production` (rename to `.env`)

5. Set up Node.js App:
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
       DATABASE_URL=postgres://username:password@host:port/database
       ```

6. Update DNS/Domain Settings:
   - Add an A record pointing to your hosting IP
   - Add a CNAME record for www subdomain

## Environment Variables
Remember to set these in cPanel's Node.js App configuration:
- DATABASE_URL (using your PostgreSQL credentials)
- Any API keys or secrets used by your application

## Database Initialization
The database schema will be automatically created on first run.
Make sure your database user has permissions to create tables.

## Troubleshooting
1. If you see "DATABASE_URL must be set" error:
   - Verify the DATABASE_URL is correctly set in Node.js App configuration
   - Check that the database credentials are correct
   - Ensure the database exists and is accessible

2. If you see database connection errors:
   - Verify the database host is accessible from your Node.js environment
   - Check if the database user has proper permissions
   - Verify the database name exists

3. If the site shows a 500 error:
   - Check Node.js error logs in cPanel
   - Verify all environment variables are set
   - Ensure the server port matches hosting requirements

4. If client-side routing doesn't work:
   - Verify .htaccess file is properly uploaded
   - Enable mod_rewrite in cPanel if available

5. For other issues:
   - Check error logs in cPanel
   - Verify file permissions (typically 644 for files, 755 for directories)