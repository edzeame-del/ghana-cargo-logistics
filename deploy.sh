#!/bin/bash

# Create deployment directories
mkdir -p deploy/public_html
mkdir -p deploy/server

# Build the application
echo "Building application..."
npm run build

# Copy frontend files to public_html
echo "Copying frontend files..."
cp -r dist/public/* deploy/public_html/

# Copy server files
echo "Copying server files..."
cp dist/index.js deploy/server/
cp package.json deploy/server/
cp package-lock.json deploy/server/

# Create .htaccess file
echo "Creating .htaccess..."
cat > deploy/public_html/.htaccess << EOL
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOL

echo "Deployment files prepared in 'deploy' directory"
echo "1. Upload 'public_html' contents to your hosting's public_html folder"
echo "2. Upload 'server' directory outside of public_html"
echo "3. On your hosting panel, set up Node.js to run server/index.js"
echo "4. Configure your domain DNS settings"
