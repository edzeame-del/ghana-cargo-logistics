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
      // Get the sheet data - expanded range to capture more columns
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:Z', // Extended range to capture any column layout
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
    if (rows.length === 0) return [];
    
    // Get headers from first row
    const headers = rows[0].map((header: any) => header ? header.toString().trim().toLowerCase() : '');
    const dataRows = rows.slice(1); // Skip header row
    
    // Define column mapping variations for flexible header matching
    const columnMappings = {
      trackingNumber: ['tracking number', 'tracking', 'trackingnumber', 'track', 'number', 'tracking no', 'track no'],
      cbm: ['cbm', 'cubic meter', 'cubic', 'volume', 'm3'],
      quantity: ['quantity', 'qty', 'pieces', 'pcs', 'count', 'amount'],
      dateReceived: ['received', 'date received', 'datereceived', 'received date', 'receipt date', 'date of receipt'],
      dateLoaded: ['loaded', 'date loaded', 'dateloaded', 'loaded date', 'loading date', 'date of loading'],
      eta: ['eta', 'estimated arrival', 'arrival date', 'expected arrival', 'delivery date'],
      status: ['status', 'state', 'condition', 'stage'],
      shippingMark: ['shipping mark', 'shippingmark', 'mark', 'reference', 'ref', 'marks']
    };

    // Find column indices based on headers
    const getColumnIndex = (fieldMappings: string[]) => {
      return headers.findIndex(header => 
        fieldMappings.some(mapping => 
          header.includes(mapping) || mapping.includes(header)
        )
      );
    };

    const columnIndices = {
      trackingNumber: getColumnIndex(columnMappings.trackingNumber),
      cbm: getColumnIndex(columnMappings.cbm),
      quantity: getColumnIndex(columnMappings.quantity),
      dateReceived: getColumnIndex(columnMappings.dateReceived),
      dateLoaded: getColumnIndex(columnMappings.dateLoaded),
      eta: getColumnIndex(columnMappings.eta),
      status: getColumnIndex(columnMappings.status),
      shippingMark: getColumnIndex(columnMappings.shippingMark)
    };

    console.log('Google Sheets headers detected:', headers);
    console.log('Column mappings found:', columnIndices);

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

    const getValue = (row: any[], index: number) => {
      return index >= 0 && row[index] ? row[index].toString().trim() : "";
    };

    return dataRows.map(row => {
      return {
        trackingNumber: getValue(row, columnIndices.trackingNumber),
        cbm: getValue(row, columnIndices.cbm),
        quantity: getValue(row, columnIndices.quantity),
        dateReceived: processDate(getValue(row, columnIndices.dateReceived)),
        dateLoaded: processDate(getValue(row, columnIndices.dateLoaded)),
        eta: processDate(getValue(row, columnIndices.eta)),
        status: getValue(row, columnIndices.status),
        shippingMark: getValue(row, columnIndices.shippingMark),
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