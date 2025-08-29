# Ghana Cargo & Logistics Web Application

A comprehensive cargo and logistics management system built specifically for the Ghanaian market, featuring real-time vessel tracking, advanced search analytics, and seamless Google Sheets integration for cargo management.

## 🚀 Features

### 🔐 Admin Panel
- **Vessel Management**: Add, edit, and track vessels with MarineTraffic integration
- **Cargo Tracking**: Manage 28,000+ tracking records with dual Google Sheets sync
- **Search Analytics**: Comprehensive search logging with user activity heat maps
- **Database Search**: Direct database queries with unlimited shipping mark searches
- **Mobile-Responsive Design**: Optimized admin interface for all devices

### 📊 Data Management
- **Dual Google Sheets Integration**: Main tracking sheet (27,000+ records) + Pending goods (900+ records)
- **Automatic ETA Calculation**: Smart 45-day ETA with weekend adjustment logic
- **90-Day Data Retention**: Automatic cleanup of delivered goods
- **Bilingual Support**: Chinese/English column headers
- **Real-time Sync**: Manual sync with status monitoring

### 🔍 Search System
- **Intelligent Search**: Auto-detection between tracking numbers and shipping marks
- **Multiple Format Support**: Full numbers, last 6 digits, comma-separated searches
- **Advanced Analytics**: Search pattern analysis with visual heat maps
- **Performance Monitoring**: Success rate tracking and failure analysis

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: TanStack React Query
- **Authentication**: Passport.js with session management
- **Maps**: Leaflet (ready for vessel tracking features)
- **Cloud Integration**: Google Sheets API with service account authentication

## 📱 Mobile Responsive

The admin panel is fully optimized for mobile devices:
- Collapsible navigation menu
- Touch-friendly interface
- Mobile-first table designs
- Responsive statistics cards
- Adaptive layouts for all screen sizes

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Google Cloud service account (for Sheets integration)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ghana-cargo-logistics.git
cd ghana-cargo-logistics
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.production.example .env
# Edit .env with your database and API credentials
```

4. **Initialize database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🔑 Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/cargo_logistics

# Session Security
SESSION_SECRET=your-secure-session-secret

# Google Sheets Integration (Optional)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_SHEETS_ID=your-main-tracking-sheet-id
GOOGLE_SHEETS_ID_PENDING=your-pending-goods-sheet-id
```

## 🏗️ Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── routes.ts          # API route definitions
│   └── index.ts           # Server entry point
├── db/                    # Database schema and migrations
└── docs/                  # Documentation
```

## 🚢 Admin Features

### Vessel Management
- Add vessels via MarineTraffic URL auto-extraction
- Edit vessel information with real-time validation
- Delete vessels with confirmation dialogs
- Track vessel status and locations

### Cargo Tracking System
- **28,000+ Records**: Comprehensive tracking database
- **Dual Source Integration**: Main tracking + Pending goods sheets
- **Smart Status Management**: "Loaded" vs "Pending Loading" classification
- **Advanced Search**: Tracking numbers, shipping marks, date ranges
- **Export Capabilities**: Excel/CSV data export

### Search Analytics Dashboard
- **Real-time Monitoring**: Live search activity tracking
- **Visual Heat Maps**: Hour-by-day search pattern analysis
- **Success Rate Analysis**: Performance metrics and failure tracking
- **IP Address Logging**: Security and usage monitoring
- **Filtering & Pagination**: Advanced data exploration tools

## 🔒 Security Features

- Secure admin authentication with password hashing
- Session management with PostgreSQL storage
- Protected API routes with authentication middleware
- SQL injection prevention with parameterized queries
- Environment variable security for sensitive data

## 📊 Database Schema

### Core Tables
- **vessels**: Ship information and tracking URLs
- **tracking_data**: Comprehensive cargo tracking records
- **search_logs**: User search activity monitoring
- **daily_search_stats**: Aggregated search metrics
- **users**: Admin user management

### Key Features
- Optimized indexes for fast search performance
- Foreign key relationships for data integrity
- Automatic timestamp tracking
- 90-day data retention policy

## 🚀 Deployment

### Option 1: Google Cloud Platform
Complete deployment guide available in `DEPLOYMENT_STEP_BY_STEP.md`

### Option 2: Replit
1. Import project to Replit
2. Set environment variables in Secrets
3. Deploy using Replit Deployments

### Option 3: DigitalOcean
Detailed guide available for both App Platform and Droplet deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the deployment guides for hosting solutions

## 🎯 Roadmap

- [ ] Real-time vessel tracking with live map integration
- [ ] SMS/Email notifications for cargo status updates
- [ ] Multi-language support (Twi, French)
- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] API for third-party integrations

---

**Built with ❤️ for Ghana's logistics industry**