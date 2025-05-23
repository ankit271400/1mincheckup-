import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function History() {
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: readings, isLoading } = useQuery({
    queryKey: ['/api/readings/history', activeTab, page, pageSize],
  });

  // Default data for UI rendering while API is not implemented
  const defaultReadings = Array(pageSize).fill(null).map((_, i) => ({
    id: i + 1,
    type: i % 2 === 0 ? "Blood Sugar" : "Blood Pressure",
    value: i % 2 === 0 ? `${118 + i * 5} mg/dL` : `${120 + i * 2}/${80 + i} mmHg`,
    timestamp: new Date(Date.now() - i * 86400000).toISOString(),
    status: i % 3 === 0 ? "Normal" : (i % 3 === 1 ? "Elevated" : "High"),
    statusType: i % 3 === 0 ? "normal" : (i % 3 === 1 ? "elevated" : "high"),
    notes: i % 4 === 0 ? "After meal" : (i % 4 === 1 ? "Before bed" : (i % 4 === 2 ? "After exercise" : ""))
  }));
  
  const getFormattedDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const getFormattedTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getStatusClass = (statusType: string) => {
    switch (statusType) {
      case "normal":
        return "text-secondary bg-secondary/10";
      case "elevated":
        return "text-accent bg-accent/10";
      case "high":
        return "text-destructive bg-destructive/10";
      default:
        return "text-neutral-500 bg-neutral-100";
    }
  };

  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case "normal":
        return "check_circle";
      case "elevated":
        return "info";
      case "high":
        return "warning";
      default:
        return "help";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-medium text-neutral-500 mb-6">Reading History</h1>
      
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-3 sm:w-[400px]">
              <TabsTrigger value="all">All Readings</TabsTrigger>
              <TabsTrigger value="blood_sugar">Blood Sugar</TabsTrigger>
              <TabsTrigger value="blood_pressure">Blood Pressure</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="bg-neutral-50 rounded-lg p-4 animate-pulse">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/6"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(readings || defaultReadings).map((reading) => (
                <div key={reading.id} className="bg-neutral-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-neutral-700">{reading.type}</h3>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs flex items-center gap-1", getStatusClass(reading.statusType))}>
                        <span className="material-icons text-xs">{getStatusIcon(reading.statusType)}</span>
                        <span>{reading.status}</span>
                      </span>
                    </div>
                    <span className="text-neutral-500 font-medium">{reading.value}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-neutral-500">
                      {getFormattedDate(reading.timestamp)} at {getFormattedTime(reading.timestamp)}
                    </div>
                    {reading.notes && (
                      <div className="text-sm text-neutral-400 italic">
                        {reading.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }} 
                      disabled={page === 1}
                    />
                  </PaginationItem>
                  
                  {[...Array(5)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(i + 1);
                        }} 
                        isActive={page === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(page + 1);
                      }} 
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
