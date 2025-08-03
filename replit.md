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
- **Vessel Editing**: Fixed vessel editing functionality with proper dialog state management
- **Tracking Reset**: Completely removed all existing tracking components and cleared tracking page for new implementation
- **Components Removed**: vessel-search, vessel-map, vessel-thumbnail, journey-timeline

## User Preferences
- Prefers clean, modern UI design
- Wants comprehensive functionality with real-time features
- Interested in innovative tracking solutions

## Development Notes
- Uses Vite for development with HMR
- Follows fullstack_js development guidelines
- Database migrations handled via `npm run db:push`
- All components use shadcn/ui for consistency

## Current Status
- ✅ Vessel management system fully functional
- ✅ Admin CRUD operations working
- ✅ MarineTraffic URL integration active  
- 🔄 Tracking page cleared and ready for new concept
- 📋 Awaiting user's new tracking page vision