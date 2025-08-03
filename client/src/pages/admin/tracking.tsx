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
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdminNav from "@/components/admin/admin-nav";

export default function TrackingAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [preview, setPreview] = useState<any[]>([]);

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

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return data;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setCsvData(parsed);
      setPreview(parsed.slice(0, 5)); // Show first 5 rows as preview
    };
    reader.readAsText(file);
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
    "shipping mark", "Date Received", "Date Loaded", 
    "Quantity", "CBM", "tracking number"
  ];

  const validateColumns = (data: any[]) => {
    if (data.length === 0) return { valid: false, missing: expectedColumns };
    
    const headers = Object.keys(data[0]);
    const missing = expectedColumns.filter(col => 
      !headers.some(h => h.toLowerCase() === col.toLowerCase())
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
              Upload CSV Data
            </CardTitle>
            <CardDescription>
              Upload a CSV file with tracking information. Expected columns (in order): {expectedColumns.join(", ")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept=".csv"
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
            <CardTitle>Current Tracking Data</CardTitle>
            <CardDescription>
              {trackingData?.length || 0} tracking records in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading tracking data...</div>
            ) : trackingData?.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipping Mark</TableHead>
                      <TableHead>Date Received</TableHead>
                      <TableHead>Date Loaded</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>CBM</TableHead>
                      <TableHead>Tracking Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trackingData.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.shippingMark}</TableCell>
                        <TableCell>{item.dateReceived}</TableCell>
                        <TableCell>{item.dateLoaded}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.cbm}</TableCell>
                        <TableCell className="font-mono text-sm">{item.trackingNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No tracking data uploaded yet. Upload a CSV file to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}