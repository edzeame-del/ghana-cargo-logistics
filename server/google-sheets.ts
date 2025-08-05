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
      // Get the full sheet data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:Z', // Full range to capture all data
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return { success: false, message: 'No data found in spreadsheet' };
      }

      console.log(`Found ${rows.length} rows in Google Sheets`);
      console.log('Raw headers:', rows[0]);

      // Process data with smart column detection
      const processedData = this.processSheetData(rows);

      if (processedData.length === 0) {
        return { success: false, message: 'No valid tracking data found' };
      }

      console.log(`Processing ${processedData.length} records for database insert`);

      // Clear existing data and insert in batches for better performance
      await db.delete(trackingData);
      
      let result = [];
      if (processedData.length > 0) {
        const batchSize = 500; // Reasonable batch size
        for (let i = 0; i < processedData.length; i += batchSize) {
          const batch = processedData.slice(i, i + batchSize);
          const batchResult = await db.insert(trackingData).values(batch).returning();
          result.push(...batchResult);
          console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(processedData.length/batchSize)}`);
        }
      }

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
    
    // Enhanced column mapping with Chinese/English support
    const columnMappings = {
      trackingNumber: [
        'tracking number', 'tracking', 'trackingnumber', 'track', 'number', 'tracking no', 'track no',
        '跟踪号', '追踪号', '快递单号', 'supplier', 'tracking no'
      ],
      cbm: [
        'cbm', 'cubic meter', 'cubic', 'volume', 'm3', '体积', '立方'
      ],
      quantity: [
        'quantity', 'qty', 'pieces', 'pcs', 'count', 'amount', '件数', 'ctns', '数量'
      ],
      dateReceived: [
        'received', 'date received', 'datereceived', 'received date', 'receipt date', 'date of receipt',
        '收货日期', '送货日期', 'receipt'
      ],
      dateLoaded: [
        'loaded', 'date loaded', 'dateloaded', 'loaded date', 'loading date', 'date of loading',
        '装柜日期', '装载日期', 'loading'
      ],
      eta: [
        'eta', 'estimated arrival', 'arrival date', 'expected arrival', 'delivery date',
        '预计到达', '到货日期'
      ],
      status: [
        'status', 'state', 'condition', 'stage', '状态', '情况'
      ],
      shippingMark: [
        'shipping mark', 'shippingmark', 'mark', 'reference', 'ref', 'marks',
        '唛头', '客户名', 'client', 'shippin mark'
      ]
    };

    // Find column indices based on headers
    const getColumnIndex = (fieldMappings: string[]) => {
      return headers.findIndex(header => 
        fieldMappings.some(mapping => 
          header.includes(mapping) || mapping.includes(header)
        )
      );
    };

    // Fixed column positions based on your Google Sheets structure
    const columnIndices = {
      shippingMark: 0,     // Column A: 唛头/客户名SHIPPIN MARK/CLIENT
      dateReceived: 1,     // Column B: 送货日期\nDATE OF RECEIPT  
      dateLoaded: 2,       // Column C: 装柜日期\nDATE OF LOADING
      quantity: 4,         // Column E: 件数\nCTNS
      cbm: 6,              // Column G: 体积\nCBM
      trackingNumber: 7,   // Column H: 供应商/快递单号\nSUPPLIER&TRACKING NO
      eta: 8,              // Column I: ETA
      status: -1           // Not present in your sheet
    };

    console.log('Google Sheets headers detected:', headers);
    console.log('Fixed column mappings applied:', columnIndices);

    const processDate = (dateValue: any) => {
      if (!dateValue) return "";

      // If it's already a formatted date string (YYYY-MM-DD), return as is
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue.trim())) {
        return dateValue.trim();
      }

      // Handle Excel date serial numbers - Google Sheets API provides them as numbers
      const numericValue = typeof dateValue === 'string' ? parseFloat(dateValue) : dateValue;
      
      if (typeof numericValue === 'number' && !isNaN(numericValue)) {
        // For values that look like Excel serial dates (between reasonable date range)
        if (numericValue > 25000 && numericValue < 100000) {
          // Excel epoch: January 1, 1900 (but Excel has a leap year bug for 1900)
          const excelEpoch = new Date(1899, 11, 30); // December 30, 1899 to account for Excel's bug
          const msPerDay = 24 * 60 * 60 * 1000;
          const jsDate = new Date(excelEpoch.getTime() + numericValue * msPerDay);
          
          if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() >= 2020 && jsDate.getFullYear() <= 2030) {
            const year = jsDate.getFullYear();
            const month = String(jsDate.getMonth() + 1).padStart(2, '0');
            const day = String(jsDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
        }
        
        // For smaller numbers, might be day/month values - try different approach
        if (numericValue > 1 && numericValue < 25000) {
          // Try treating as days since Unix epoch
          const unixDate = new Date(numericValue * 24 * 60 * 60 * 1000);
          if (!isNaN(unixDate.getTime()) && unixDate.getFullYear() > 1970) {
            return unixDate.toISOString().split('T')[0];
          }
        }
      }

      // Try to parse as regular date string
      if (typeof dateValue === 'string' && dateValue.trim()) {
        let dateStr = dateValue.trim();
        
        // Handle Google Sheets format like "2025/6/2" by converting to proper format
        if (dateStr.match(/^\d{4}\/\d{1,2}\/\d{1,2}$/)) {
          const parts = dateStr.split('/');
          const year = parts[0];
          const month = parts[1].padStart(2, '0');
          const day = parts[2].padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        
        // Handle formats like "4th April" by adding current year
        if (dateStr.match(/^\d+(st|nd|rd|th)\s+\w+$/i)) {
          const currentYear = new Date().getFullYear();
          dateStr = `${dateStr} ${currentYear}`;
        }
        
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900) {
          return parsedDate.toISOString().split('T')[0];
        }
      }

      // If all else fails, return the original value as a string
      return dateValue ? dateValue.toString().trim() : "";
    };

    const getValue = (row: any[], index: number) => {
      return index >= 0 && row[index] !== undefined && row[index] !== null ? row[index].toString().trim() : "";
    };

    // Helper function to calculate ETA (45 days from loading date)
    const calculateEtaFromLoading = (loadingDate: string) => {
      if (!loadingDate) return "";
      
      try {
        const loading = new Date(loadingDate);
        if (isNaN(loading.getTime())) return "";
        
        // Add 45 calendar days
        const eta = new Date(loading);
        eta.setDate(eta.getDate() + 45);
        
        const year = eta.getFullYear();
        const month = String(eta.getMonth() + 1).padStart(2, '0');
        const day = String(eta.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (error) {
        return "";
      }
    };

    return dataRows.map(row => {
      const trackingNumber = getValue(row, columnIndices.trackingNumber);
      const shippingMark = getValue(row, columnIndices.shippingMark);
      
      // Ensure we have required fields
      if (!trackingNumber && !shippingMark) {
        return null;
      }

      const rawDateReceived = getValue(row, columnIndices.dateReceived);
      const rawDateLoaded = getValue(row, columnIndices.dateLoaded);
      const rawEta = getValue(row, columnIndices.eta);
      
      // Debug logging for date conversion (can be removed later)
      if (trackingNumber === "940215") {
        const testDateReceived = processDate(rawDateReceived);
        const testDateLoaded = processDate(rawDateLoaded);
        console.log('Date conversion test for', trackingNumber, ':', {
          raw: { dateReceived: rawDateReceived, dateLoaded: rawDateLoaded },
          processed: { dateReceived: testDateReceived, dateLoaded: testDateLoaded }
        });
      }
      
      const dateReceived = processDate(rawDateReceived);
      const dateLoaded = processDate(rawDateLoaded);
      const providedEta = processDate(rawEta);
      
      // Use provided ETA if available, otherwise calculate from loading date + 45 days
      const finalEta = providedEta || calculateEtaFromLoading(dateLoaded);

      return {
        trackingNumber: trackingNumber || "",
        cbm: getValue(row, columnIndices.cbm),
        quantity: getValue(row, columnIndices.quantity),
        dateReceived: dateReceived,
        dateLoaded: dateLoaded,
        eta: finalEta,
        status: getValue(row, columnIndices.status),
        shippingMark: shippingMark || "",
      };
    }).filter(item => item !== null && (item.trackingNumber || item.shippingMark)); // Include rows with tracking number or shipping mark
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