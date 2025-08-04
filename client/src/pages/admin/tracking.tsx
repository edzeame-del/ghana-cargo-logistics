import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, AlertCircle, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdminNav from "@/components/admin/admin-nav";
import CleanupButton from "@/components/admin/cleanup-button";
import * as XLSX from 'xlsx';

export default function TrackingAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { data: trackingData, isLoading } = useQuery({
    queryKey: ['tracking-data'],
    queryFn: async () => {
      const response = await fetch('/api/tracking');
      if (!response.ok) throw new Error('Failed to fetch tracking data');
      return response.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: any[]) => {
      const response = await fetch('/api/tracking/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload CSV');
      }
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tracking-data'] });
      setCsvFile(null);
      setCsvData([]);
      setPreview([]);
      toast({
        title: "Success",
        description: `Uploaded ${result.count} tracking records successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSelectedMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetch('/api/tracking/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete tracking records');
      }
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tracking-data'] });
      setSelectedItems([]);
      toast({
        title: "Success",
        description: `Deleted ${result.count} tracking records successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && trackingData) {
      setSelectedItems(trackingData.map((item: any) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedItems.length} tracking records? This action cannot be undone.`)) {
      deleteSelectedMutation.mutate(selectedItems);
    }
  };

  const parseSpreadsheet = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const arrayBuffer = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });

          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '' 
          });

          if (jsonData.length < 2) {
            resolve([]);
            return;
          }

          // Convert array format to object format
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];

          const parsedData = rows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              let value = row[index];

              // Handle Excel date values
              if ((header.toLowerCase().includes('date') || 
                   header.toLowerCase().includes('received') || 
                   header.toLowerCase().includes('loaded')) && value) {

                if (typeof value === 'number' && value > 0 && value < 100000) {
                  // Excel serial date conversion (corrected formula)
                  const excelEpoch = new Date(1900, 0, 1);
                  const jsDate = new Date(excelEpoch.getTime() + (value - 1) * 24 * 60 * 60 * 1000);
                  if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() > 1900 && jsDate.getFullYear() < 2100) {
                    value = jsDate.toISOString().split('T')[0]; // YYYY-MM-DD format
                  }
                } else if (typeof value === 'string' && value.trim()) {
                  // Try to parse as date string
                  const parsedDate = new Date(value.trim());
                  if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900 && parsedDate.getFullYear() < 2100) {
                    value = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
                  }
                }
              }

              // Normalize header names for consistent mapping
              const normalizedHeader = header.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
              obj[normalizedHeader] = value ? String(value).trim() : '';
            });
            return obj;
          });

          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.ods'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Error",
        description: "Please select an Excel file (.xlsx, .xls) or OpenDocument Spreadsheet (.ods)",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);

    try {
      const parsed = await parseSpreadsheet(file);
      setCsvData(parsed);
      setPreview(parsed.slice(0, 5)); // Show first 5 rows as preview
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse spreadsheet file. Please check the file format.",
        variant: "destructive",
      });
      setCsvFile(null);
    }
  };

  const handleUpload = () => {
    if (csvData.length === 0) {
      toast({
        title: "Error",
        description: "No data to upload",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate(csvData);
  };

  const expectedColumns = [
    "TRACKING NUMBER", "CBM", "QUANTITY", "RECEIVED", "LOADED", "ETA (optional)", "STATUS (optional)", "SHIPPING MARK"
  ];

  const validateColumns = (data: any[]) => {
    if (data.length === 0) return { valid: false, missing: expectedColumns };

    const headers = Object.keys(data[0]);
    const requiredColumns = [
      "TRACKING NUMBER", "CBM", "QUANTITY", "RECEIVED", "LOADED", "SHIPPING MARK"
    ];
    
    const missing = requiredColumns.filter(col => 
      !headers.some(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === col.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );

    return { valid: missing.length === 0, missing };
  };

  const validation = validateColumns(csvData);

  return (
    <div>
      <AdminNav />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Manage Tracking Data</h1>

      <div className="grid gap-8">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Spreadsheet Data
            </CardTitle>
            <CardDescription>
              Upload an Excel or Google Sheets file with tracking information. Expected columns (in order): {expectedColumns.join(", ")}
              <br />
              <span className="text-sm text-gray-500">Maximum file size: 10MB</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept=".xlsx,.xls,.ods"
              onChange={handleFileChange}
              className="cursor-pointer"
            />

            {csvFile && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  {csvFile.name} ({csvData.length} records)
                </div>

                {!validation.valid && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Missing columns: {validation.missing.join(", ")}
                    </AlertDescription>
                  </Alert>
                )}

                {preview.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Preview (first 5 records):</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(preview[0]).map(header => (
                              <TableHead key={header} className="text-xs">{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {preview.map((row, index) => (
                            <TableRow key={index}>
                              {Object.values(row).map((value: any, cellIndex) => (
                                <TableCell key={cellIndex} className="text-xs">{value}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleUpload} 
                  disabled={!validation.valid || uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? "Uploading..." : `Upload ${csvData.length} Records`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Tracking Data</CardTitle>
                <CardDescription>
                  {trackingData?.length || 0} tracking records in the system
                  {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {selectedItems.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={deleteSelectedMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteSelectedMutation.isPending ? "Deleting..." : `Delete ${selectedItems.length}`}
                  </Button>
                )}
                <CleanupButton onCleanupComplete={() => queryClient.invalidateQueries({ queryKey: ['tracking-data'] })} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading tracking data...</div>
            ) : trackingData?.length > 0 ? (
              <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedItems.length === trackingData?.length && trackingData?.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Tracking Number</TableHead>
                        <TableHead>CBM</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Loaded</TableHead>
                        <TableHead>ETA</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Shipping Mark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trackingData.map((item: any) => {
                        const getStatus = () => {
                          if (item.eta && new Date(item.eta) < new Date()) {
                            return "Delivered";
                          } else if (item.dateLoaded) {
                            return "In Transit";
                          } else if (item.dateReceived) {
                            return "Processing";
                          }
                          return "Received";
                        };

                        return (
                          <TableRow key={item.id}>
                            <TableCell className="w-12">
                              <Checkbox
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">{item.trackingNumber}</TableCell>
                            <TableCell>{item.cbm}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.dateReceived || 'N/A'}</TableCell>
                            <TableCell>{item.dateLoaded || 'N/A'}</TableCell>
                            <TableCell>{item.eta && item.eta.trim() !== '' ? item.eta : 'N/A'}</TableCell>
                            <TableCell>{item.status || getStatus()}</TableCell>
                            <TableCell>{item.shippingMark}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No tracking data uploaded yet. Upload an Excel or Google Sheets file to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}