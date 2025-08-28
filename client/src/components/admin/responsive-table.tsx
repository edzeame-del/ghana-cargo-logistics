import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ResponsiveTableProps {
  headers: string[];
  data: any[];
  renderRow: (item: any, index: number) => React.ReactNode;
  renderMobileCard: (item: any, index: number) => React.ReactNode;
  title?: string;
  className?: string;
}

export function ResponsiveTable({
  headers,
  data,
  renderRow,
  renderMobileCard,
  title,
  className = ""
}: ResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className={className}>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headers.length} className="text-center py-8 text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => renderRow(item, index))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {data.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No data available
            </CardContent>
          </Card>
        ) : (
          data.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              {renderMobileCard(item, index)}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

interface MobileCardProps {
  children: React.ReactNode;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  title?: string;
}

export function MobileCard({
  children,
  isExpandable = false,
  isExpanded = false,
  onToggle,
  title
}: MobileCardProps) {
  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {isExpandable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="ml-auto p-2 h-8 w-8"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={`pt-0 ${!isExpandable || isExpanded ? 'block' : 'hidden'}`}>
        {children}
      </CardContent>
    </>
  );
}

interface DataRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function DataRow({ label, value, className = "" }: DataRowProps) {
  return (
    <div className={`flex justify-between items-start py-2 border-b border-gray-100 last:border-0 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground min-w-0 flex-shrink-0 mr-3">
        {label}:
      </span>
      <span className="text-sm text-right min-w-0 flex-1">
        {value}
      </span>
    </div>
  );
}