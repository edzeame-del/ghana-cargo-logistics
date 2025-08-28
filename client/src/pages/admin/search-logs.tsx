import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Search, TrendingUp, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminNav from "@/components/admin/admin-nav";
import SearchHeatmap from "@/components/admin/search-heatmap";

type SearchLog = {
  id: number;
  searchTerm: string;
  searchType: string;
  success: boolean;
  resultsCount: number;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
};

type DailyStats = {
  date: string;
  totalSearches: number;
  successfulSearches: number;
  failedSearches: number;
  trackingNumberSearches: number;
  shippingMarkSearches: number;
};

type SearchLogsResponse = {
  logs: SearchLog[];
  dailyStats: DailyStats;
};

export default function SearchLogsPage() {
  const [searchFilter, setSearchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [successFilter, setSuccessFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(200);

  const { data: searchLogsData, isLoading, error } = useQuery<SearchLogsResponse>({
    queryKey: ["/api/search-logs"],
  });

  const searchLogs = searchLogsData?.logs || [];
  const dailyStats = searchLogsData?.dailyStats;

  // Calculate statistics
  const stats = searchLogs ? {
    total: searchLogs.length,
    successful: searchLogs.filter(log => log.success).length,
    failed: searchLogs.filter(log => !log.success).length,
    trackingNumberSearches: searchLogs.filter(log => log.searchType === 'tracking_number').length,
    shippingMarkSearches: searchLogs.filter(log => log.searchType === 'shipping_mark').length,
    successRate: searchLogs.length > 0 ? Math.round((searchLogs.filter(log => log.success).length / searchLogs.length) * 100) : 0
  } : null;

  // Filter logs
  const filteredLogs = searchLogs?.filter(log => {
    const matchesSearch = searchFilter === "" || 
      log.searchTerm.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.ipAddress.includes(searchFilter);
    
    const matchesType = typeFilter === "all" || log.searchType === typeFilter;
    const matchesSuccess = successFilter === "all" || 
      (successFilter === "success" && log.success) ||
      (successFilter === "failed" && !log.success);

    return matchesSearch && matchesType && matchesSuccess;
  }) || [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, typeFilter, successFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">Failed to load search logs</p>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />
      <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Search Logs</h1>
        <p className="text-muted-foreground">
          Monitor all search attempts made by users, tracking success rates and patterns
        </p>
      </div>

      {/* Search Activity Heat Map */}
      <SearchHeatmap />

      {/* Statistics Cards */}
      {stats && dailyStats && (
        <div className="space-y-6 mb-8">
          {/* Daily Statistics */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Today's Search Activity ({format(new Date(), 'MMM dd, yyyy')})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Today's Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-blue-500" />
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">{dailyStats.totalSearches}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Today Successful</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">{dailyStats.successfulSearches}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Today Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-2xl font-bold text-red-600">{dailyStats.failedSearches}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Today Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-2xl font-bold text-purple-600">
                      {dailyStats.totalSearches > 0 
                        ? Math.round((dailyStats.successfulSearches / dailyStats.totalSearches) * 100)
                        : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Today Tracking #</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold text-blue-600">{dailyStats.trackingNumberSearches}</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Today Shipping Marks</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold text-orange-600">{dailyStats.shippingMarkSearches}</span>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Total Statistics */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">All-Time Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-blue-500" />
                    <span className="text-2xl font-bold">{stats.total}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Successful</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">{stats.successful}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-2xl font-bold text-red-600">{stats.failed}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overall Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-2xl font-bold">{stats.successRate}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Tracking #</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold text-blue-600">{stats.trackingNumberSearches}</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Shipping Marks</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold text-orange-600">{stats.shippingMarkSearches}</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by term or IP address..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="tracking_number">Tracking Numbers</SelectItem>
            <SelectItem value="shipping_mark">Shipping Marks</SelectItem>
          </SelectContent>
        </Select>
        <Select value={successFilter} onValueChange={setSuccessFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="success">Successful Only</SelectItem>
            <SelectItem value="failed">Failed Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search Logs Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Search Logs ({filteredLogs.length} of {searchLogs?.length || 0})
            {totalPages > 1 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                Page {currentPage} of {totalPages} ({paginatedLogs.length} records)
              </span>
            )}
          </CardTitle>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Search Term</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Results</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Search className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {filteredLogs.length === 0 ? "No search logs found" : "No results on this page"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {searchFilter || typeFilter !== "all" || successFilter !== "all" 
                            ? "Try adjusting your filters or go to a different page" 
                            : "Search logs will appear here as users search for tracking data"
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono font-medium">
                        {log.searchTerm}
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.searchType === 'tracking_number' ? 'default' : 'secondary'}>
                          {log.searchType === 'tracking_number' ? 'Tracking #' : 'Shipping Mark'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.success ? 'default' : 'destructive'}>
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={log.success ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                          {log.resultsCount}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} filtered results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}