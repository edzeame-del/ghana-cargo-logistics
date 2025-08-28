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
import { Input } from "@/components/ui/input";
import { Loader2, Search, Database, Package, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminNav from "@/components/admin/admin-nav";

type TrackingRecord = {
  id: number;
  shippingMark: string;
  dateReceived: string;
  dateLoaded: string;
  quantity: string;
  cbm: string;
  trackingNumber: string;
  eta: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type SearchResponse = {
  results: TrackingRecord[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export default function DatabaseSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<TrackingRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<SearchResponse['pagination'] | null>(null);
  const itemsPerPage = 100;

  const handleSearch = async (page = 1) => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setSearchError("");
    setHasSearched(true);
    setCurrentPage(page);

    try {
      const trimmedTerm = searchTerm.trim();
      const searchUrl = `/api/admin/search/${encodeURIComponent(trimmedTerm)}?page=${page}&limit=${itemsPerPage}`;

      const response = await fetch(searchUrl);
      
      if (response.ok) {
        const data: SearchResponse = await response.json();
        setSearchResults(data.results || []);
        setPagination(data.pagination);
      } else {
        const error = await response.json();
        setSearchResults([]);
        setPagination(null);
        if (response.status === 404) {
          setSearchError("No records found matching your search criteria");
        } else {
          setSearchError(error.message || "Search failed");
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Network error occurred while searching");
      setSearchResults([]);
      setPagination(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setHasSearched(false);
    setSearchError("");
    setCurrentPage(1);
    setPagination(null);
  };

  const handlePageChange = (page: number) => {
    handleSearch(page);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'loaded':
        return 'default';
      case 'pending loading':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Database Search</h1>
          <p className="text-muted-foreground">
            Search the tracking database directly by tracking number or shipping mark
          </p>
        </div>

        {/* Search Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Search Tracking Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter tracking number or shipping mark..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSearching}
                />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Search type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Auto-detect</SelectItem>
                  <SelectItem value="tracking_number">Tracking Number</SelectItem>
                  <SelectItem value="shipping_mark">Shipping Mark</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchTerm.trim()}
                  className="flex items-center gap-2"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  disabled={isSearching}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Search Results
                {pagination && (
                  <Badge variant="secondary" className="ml-2">
                    {pagination.totalCount} total record{pagination.totalCount !== 1 ? 's' : ''}
                    {pagination.totalPages > 1 && (
                      <span className="ml-1">
                        (Page {pagination.page} of {pagination.totalPages})
                      </span>
                    )}
                  </Badge>
                )}
              </CardTitle>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage || isSearching}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    {currentPage} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage || isSearching}
                    className="flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {searchError ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">No Results Found</p>
                  <p className="text-muted-foreground">{searchError}</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No records found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking Number</TableHead>
                        <TableHead>Shipping Mark</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>CBM</TableHead>
                        <TableHead>Date Received</TableHead>
                        <TableHead>Date Loaded</TableHead>
                        <TableHead>ETA</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-mono font-medium">
                            {record.trackingNumber || "-"}
                          </TableCell>
                          <TableCell className="font-medium">
                            {record.shippingMark || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {record.quantity || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {record.cbm || "-"}
                          </TableCell>
                          <TableCell>
                            {record.dateReceived ? format(new Date(record.dateReceived), 'MMM dd, yyyy') : "-"}
                          </TableCell>
                          <TableCell>
                            {record.dateLoaded ? format(new Date(record.dateLoaded), 'MMM dd, yyyy') : "-"}
                          </TableCell>
                          <TableCell>
                            {record.eta ? format(new Date(record.eta), 'MMM dd, yyyy') : "-"}
                          </TableCell>
                          <TableCell>
                            {record.status ? (
                              <Badge variant={getStatusBadgeVariant(record.status)}>
                                {record.status}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(record.createdAt), 'MMM dd, HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, pagination.totalCount)} of {pagination.totalCount} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage || isSearching}
                      className="flex items-center space-x-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={isSearching}
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
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage || isSearching}
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
        )}
      </div>
    </div>
  );
}