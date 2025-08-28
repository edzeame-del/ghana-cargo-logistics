# Ghana Cargo & Logistics Web Application

## Overview
A comprehensive Ghana-focused cargo and logistics web application that provides seamless shipping and transportation services for the Ghanaian market and international clients. Features vessel management with admin functionality and a clean tracking interface ready for new innovations.

## Technology Stack
- **Frontend**: React.js with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: shadcn/ui with Radix UI
- **State Management**: TanStack React Query
- **Maps & Visualization**: Leaflet (available for future use)
- **Routing**: Wouter

## Project Architecture

### Database Schema
- **vessels**: Stores vessel information (id, name, imo, mmsi, trackingUrl, thumbnailUrl, timestamps)
- **users**: Basic user authentication structure for admin access
- **tracking_data**: Comprehensive cargo tracking with columns: id, shippingMark, dateReceived, dateLoaded, quantity, cbm, trackingNumber, eta, status, timestamps
- **search_logs**: Search monitoring with columns: id, searchTerm, searchType, success, resultsCount, ipAddress, userAgent, timestamp

### API Routes
**Vessel Management:**
- `GET /api/vessels` - Fetch all vessels
- `POST /api/vessels` - Add new vessel
- `PUT /api/vessels/:id` - Update vessel information
- `DELETE /api/vessels/:id` - Delete vessel
- `GET /api/vessels/:id` - Get specific vessel
- `POST /api/vessels/extract-info` - Extract vessel info from MarineTraffic URLs

**Tracking System:**
- `GET /api/tracking` - Get all tracking data (admin)
- `GET /api/tracking/:number` - Search tracking by number(s)
- `POST /api/tracking/upload` - Upload Excel/CSV tracking data
- `DELETE /api/tracking/bulk-delete` - Delete multiple tracking records
- `POST /api/tracking/cleanup` - Manual cleanup of old records

**Google Sheets Integration:**
- `GET /api/google-sheets/status` - Get integration status and last sync time
- `POST /api/google-sheets/sync` - Trigger manual sync from Google Sheets

**Search Logging:**
- `GET /api/search-logs` - Get recent search logs for admin analysis

**General:**
- `POST /api/contact` - Contact form submission
- `POST /api/service-request` - Service request form submission

### Key Features
1. **Admin Dashboard** (`/admin/vessels`):
   - Add vessels via MarineTraffic URL auto-extraction
   - Edit vessel information with dialog-based interface
   - Delete vessels with confirmation dialog
   - Real-time form validation

2. **Admin Search Logs** (`/admin/search-logs`):
   - Comprehensive search monitoring and analytics
   - Real-time statistics: total searches, success rate, search type breakdown
   - Daily and all-time metrics with automatic midnight reset
   - Advanced filtering by search term, type, and success status
   - Detailed logs with IP addresses, timestamps, and result counts
   - Pagination support (200 records per page) for large datasets
   - Pattern analysis for optimizing search functionality

3. **Admin Database Search** (`/admin/database-search`):
   - Direct search interface for the tracking database
   - Search by tracking number or shipping mark with auto-detection
   - Real-time search results with full record details
   - Complete tracking information display with status badges
   - Error handling for failed searches and network issues

4. **Tracking Page** (`/tracking`):
   - **CLEAN SLATE**: Completely cleared for new implementation
   - Ready for fresh tracking concept

5. **Static Pages**:
   - Home page with hero section
   - Services overview
   - Contact form
   - Terms and conditions

## Recent Changes
- **Date**: 2025-08-28
- **Search Logging System**: Comprehensive admin search monitoring implemented
  - All search attempts automatically logged to database with success/failure tracking
  - Tracks search term, type (tracking_number vs shipping_mark), results count, IP address, and timestamp
  - Admin interface at `/admin/search-logs` with filtering and statistics
  - **Daily Metrics**: Automatic daily search tracking that resets at midnight
  - **Pagination**: 200 records per page with navigation controls
  - Real-time success rate monitoring and search pattern analysis
  - Dual statistics display: today's activity and all-time totals
  - Visual statistics cards showing total searches, success rate, and search type breakdown
- **Date**: 2025-08-05
- **Bulk Delete Functionality**: Added multi-select bulk delete for tracking records
  - Individual and "select all" checkboxes in admin tracking table
  - Bulk delete button with confirmation dialog
  - Backend API endpoint for batch deletion with validation
- **Dual Google Sheets Integration**: Comprehensive tracking system with two data sources
  - **Main Tracking Sheet**: Fully operational with bilingual Chinese/English support (25,000+ records)
  - **Pending Goods Sheet**: Successfully integrated with 700+ records  
  - Records automatically tagged with status: "Loaded" for main sheet, "Pending Loading" for pending sheet
  - Total system capacity: 26,000+ records across both sheets
  - **Manual Sync Only**: Auto-sync disabled - only manual sync through admin interface
  - Initial sync on server startup, then regular updates to keep data current
  - Manual sync button in admin interface
  - Service account authentication with environment variables
  - Real-time sync status and last sync time display
  - Full data replacement on each sync to ensure accuracy
  - **Fixed Column Mapping**: Correctly maps user's specific Google Sheets structure:
    - Column A (0): Shipping Mark (唛头/客户名SHIPPIN MARK/CLIENT)
    - Column B (1): Date Received (送货日期\nDATE OF RECEIPT)
    - Column C (2): Date Loaded (装柜日期\nDATE OF LOADING)
    - Column E (4): Quantity (件数\nCTNS)
    - Column G (6): CBM (体积\nCBM)
    - Column H (7): Tracking Number (供应商/快递单号\nSUPPLIER&TRACKING NO)
    - Column I (8): ETA
  - Batch processing for optimal performance with large datasets
  - **Smart ETA Calculation**: Automatically calculates ETA as 45 calendar days from loading date when not specified in Google Sheets
  - **Weekend ETA Adjustment**: If calculated ETA falls on weekend (Saturday/Sunday), automatically moves to following Monday for business delivery expectations
  - **Date Format Handling**: FULLY RESOLVED Google Sheets date parsing to properly handle YYYY/M/D format from spreadsheet
    - Fixed critical issue where parseFloat('2025/6/2') returned 2025 and triggered incorrect Unix epoch conversion
    - Reordered parsing logic to check string patterns BEFORE numeric conversion
    - All dates now correctly display as 2025 instead of 1975
- **Database Connection Reliability**: Enhanced production database connection handling
  - Connection pooling with @neondatabase/serverless for better performance
  - Retry logic with exponential backoff for tracking searches
  - Database warmup on server start to prevent cold start issues
  - Health check endpoint at `/api/health` for monitoring
  - Automatic connection keep-alive every 4 minutes to prevent timeouts
- **Date**: 2025-08-03
- **Automatic Data Cleanup**: Implemented 90-day data retention policy
  - Tracking data automatically deleted 90 days after ETA date
  - Only deletes records with valid ETA dates (preserves pending goods)
  - Scheduled cleanup runs every 24 hours
  - Manual cleanup button in admin interface
  - Server-side cleanup on startup
- **Basic Authentication System**: Implemented secure admin authentication
  - Passport.js-based authentication with session management
  - Password hashing with scrypt and salt
  - Protected admin routes requiring login
  - Admin login/logout functionality at `/auth`
  - MemoryStore session storage for development
  - **SECURITY**: Public registration disabled - only existing admins can access
  - **Password Management**: Admin users can change their passwords securely
- **Duplicate Tracking Numbers**: Removed unique constraint to allow duplicate tracking numbers
  - Multiple shipments with same tracking number now supported
  - Search returns all matching entries with clear numbering
- **Enhanced Search Capability**: Added dual search functionality
  - Support for tracking numbers: full numbers, last 6 digits, comma-separated
  - Support for shipping marks: shows goods received in past 2 weeks + all pending goods
  - Intelligent search type detection (alphanumeric = tracking number, text = shipping mark)
  - Space-to-comma conversion for user convenience
- **Spreadsheet Tracking System**: Comprehensive Excel/Google Sheets-based cargo tracking system
  - Admin Excel/Google Sheets upload with validation and preview at `/admin/tracking`
  - Support for .xlsx, .xls, and .ods file formats
  - Client tracking search at `/tracking` (full number or last 6 digits)
  - Database schema for tracking data with columns: TRACKING NUMBER, CBM, QUANTITY, RECEIVED, LOADED, ETA, STATUS, SHIPPING MARK
  - Real-time status tracking and timeline display
  - STATUS column visible only in admin interface, hidden from client tracking
- **Vessel Editing**: Fixed vessel editing functionality with proper dialog state management

## User Preferences
- Prefers clean, modern UI design
- Wants comprehensive functionality with real-time features
- Excel column order preference: TRACKING NUMBER, CBM, QUANTITY, RECEIVED, LOADED, ETA, STATUS, SHIPPING MARK
- Favors practical solutions over complex implementations

## Development Notes
- Uses Vite for development with HMR
- Follows fullstack_js development guidelines
- Database migrations handled via `npm run db:push`
- All components use shadcn/ui for consistency

## Deployment
- DigitalOcean deployment guide available in `DIGITALOCEAN_DEPLOYMENT_GUIDE.md`
- Supports both App Platform and Droplet deployment methods
- Requires PostgreSQL database and environment variables for production

## Current Status
- ✅ Vessel management system fully functional
- ✅ Admin CRUD operations working
- ✅ MarineTraffic URL integration active  
- ✅ Excel/Google Sheets-based tracking system implemented
- ✅ Admin spreadsheet upload with validation and preview (.xlsx, .xls, .ods)
- ✅ Client tracking with full/6-digit search capability
- ✅ Real-time tracking status and timeline display