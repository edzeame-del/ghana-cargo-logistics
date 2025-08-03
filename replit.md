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
- **users**: Basic user authentication structure (currently unused)

### API Routes
- `GET /api/vessels` - Fetch all vessels
- `POST /api/vessels` - Add new vessel
- `PUT /api/vessels/:id` - Update vessel information
- `DELETE /api/vessels/:id` - Delete vessel
- `GET /api/vessels/:id` - Get specific vessel
- `POST /api/vessels/extract-info` - Extract vessel info from MarineTraffic URLs
- `POST /api/contact` - Contact form submission
- `POST /api/service-request` - Service request form submission

### Key Features
1. **Admin Dashboard** (`/admin/vessels`):
   - Add vessels via MarineTraffic URL auto-extraction
   - Edit vessel information with dialog-based interface
   - Delete vessels with confirmation dialog
   - Real-time form validation

2. **Tracking Page** (`/tracking`):
   - **CLEAN SLATE**: Completely cleared for new implementation
   - Ready for fresh tracking concept

3. **Static Pages**:
   - Home page with hero section
   - Services overview
   - Contact form
   - Terms and conditions

## Recent Changes
- **Date**: 2025-08-03
- **Automatic Data Cleanup**: Implemented 90-day data retention policy
  - Tracking data automatically deleted after 90 days from upload
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
- **Multi-Search Capability**: Added comma-separated tracking number search
  - Support for "000001,000860" format searches
  - Space-to-comma conversion for user convenience
  - Display multiple results with separators
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

## Current Status
- ✅ Vessel management system fully functional
- ✅ Admin CRUD operations working
- ✅ MarineTraffic URL integration active  
- ✅ Excel/Google Sheets-based tracking system implemented
- ✅ Admin spreadsheet upload with validation and preview (.xlsx, .xls, .ods)
- ✅ Client tracking with full/6-digit search capability
- ✅ Real-time tracking status and timeline display