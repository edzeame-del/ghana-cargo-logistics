import { google } from 'googleapis';
import cron from 'node-cron';
import { db } from "@db";
import { trackingData } from "@db/schema";

export class GoogleSheetsService {
  private sheets: any;
  private isConfigured = false;
  private spreadsheetId: string = '';
  private lastSyncTime: Date = new Date(0);

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Check if Google Sheets credentials are available
      const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

      if (!serviceAccountKey || !spreadsheetId) {
        console.log('Google Sheets integration not configured - missing credentials');
        return;
      }

      // Parse the service account key
      const credentials = JSON.parse(serviceAccountKey);
      
      // Create JWT auth
      const auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.spreadsheetId = spreadsheetId;
      this.isConfigured = true;

      console.log('Google Sheets integration configured successfully');
      
      // Start the periodic sync
      this.startPeriodicSync();
      
    } catch (error) {
      console.error('Failed to initialize Google Sheets service:', error);
    }
  }

  private startPeriodicSync() {
    if (!this.isConfigured) return;

    // Sync every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      console.log('Starting scheduled Google Sheets sync...');
      await this.syncData();
    });

    // Initial sync
    setTimeout(() => this.syncData(), 5000);
  }

  async syncData(): Promise<{ success: boolean; message: string; count?: number }> {
    if (!this.isConfigured) {
      return { success: false, message: 'Google Sheets integration not configured' };
    }

    try {
      // Get the sheet data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:H', // Assuming columns A-H contain the tracking data
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return { success: false, message: 'No data found in spreadsheet' };
      }

      // Skip header row and process data
      const dataRows = rows.slice(1);
      const processedData = this.processSheetData(dataRows);

      if (processedData.length === 0) {
        return { success: false, message: 'No valid tracking data found' };
      }

      // Clear existing data and insert new data (full sync)
      await db.delete(trackingData);
      const result = await db.insert(trackingData).values(processedData).returning();

      this.lastSyncTime = new Date();
      
      console.log(`Google Sheets sync completed: ${result.length} records processed`);
      return { 
        success: true, 
        message: 'Google Sheets sync completed successfully',
        count: result.length 
      };

    } catch (error) {
      console.error('Google Sheets sync failed:', error);
      return { 
        success: false, 
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  private processSheetData(rows: any[][]): any[] {
    return rows.map(row => {
      const processDate = (dateValue: any) => {
        if (!dateValue) return "";

        // If it's already a formatted date string (YYYY-MM-DD), return as is
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue.trim())) {
          return dateValue.trim();
        }

        // Handle Excel date serial numbers
        const numericValue = typeof dateValue === 'string' ? parseFloat(dateValue) : dateValue;
        
        if (typeof numericValue === 'number' && !isNaN(numericValue) && numericValue > 1 && numericValue < 100000) {
          const excelStartDate = new Date(1900, 0, 1);
          const jsDate = new Date(excelStartDate.getTime() + (numericValue - 1) * 24 * 60 * 60 * 1000);
          
          if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() > 1900 && jsDate.getFullYear() < 3000) {
            const year = jsDate.getFullYear();
            const month = String(jsDate.getMonth() + 1).padStart(2, '0');
            const day = String(jsDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
        }

        // Try to parse as regular date string
        if (typeof dateValue === 'string' && dateValue.trim()) {
          const parsedDate = new Date(dateValue.trim());
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
        }

        return dateValue ? dateValue.toString().trim() : "";
      };

      // Map columns based on expected order: TRACKING NUMBER, CBM, QUANTITY, RECEIVED, LOADED, ETA, STATUS, SHIPPING MARK
      return {
        trackingNumber: (row[0] || "").toString().trim(),
        cbm: (row[1] || "").toString().trim(),
        quantity: (row[2] || "").toString().trim(),
        dateReceived: processDate(row[3]),
        dateLoaded: processDate(row[4]),
        eta: processDate(row[5]),
        status: (row[6] || "").toString().trim(),
        shippingMark: (row[7] || "").toString().trim(),
      };
    }).filter(item => item.trackingNumber); // Only include rows with tracking numbers
  }

  getStatus() {
    return {
      configured: this.isConfigured,
      spreadsheetId: this.spreadsheetId ? this.spreadsheetId.substring(0, 10) + '...' : '',
      lastSyncTime: this.lastSyncTime,
    };
  }

  async manualSync(): Promise<{ success: boolean; message: string; count?: number }> {
    console.log('Manual Google Sheets sync initiated');
    return await this.syncData();
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();