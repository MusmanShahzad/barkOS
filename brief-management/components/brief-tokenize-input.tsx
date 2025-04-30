"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Check, ChevronsUpDown, Loader2, Link } from "lucide-react"
import { Button } from "./ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { useGetBriefsQuery } from "../src/graphql/generated/graphql"
import { useDebounce } from "@/hooks/use-debounce"
import { useApolloClient } from "@apollo/client"

export interface BriefTokenizeInputProps {
  defaultValues?: string[];
  onChange?: (selectedBriefs: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  initialTokens?: Array<{id: number, title: string}>;
}

interface BriefCacheItem {
  id: string;
  title: string;
}

export function BriefTokenizeInput({
  defaultValues = [],
  onChange,
  placeholder = "Select briefs...",
  disabled = false,
  initialTokens = [],
}: BriefTokenizeInputProps) {
  // UI state
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValues);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  
  // Command-specific state to handle proper highlighting
  const [commandValue, setCommandValue] = useState("");
  
  // Store all accumulated briefs for infinite scrolling
  const [accumulatedBriefs, setAccumulatedBriefs] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Store selected brief details that are not in search results
  const [selectedBriefDetails, setSelectedBriefDetails] = useState<Record<string, BriefCacheItem>>({});
  const [loadingBriefDetails, setLoadingBriefDetails] = useState(false);
  
  // Initialize Apollo client for manual cache management
  const client = useApolloClient();
  
  // Query briefs using generated hook
  const { data, loading, fetchMore, refetch } = useGetBriefsQuery({
    variables: {
      pagination: {
        page,
        pageSize: PAGE_SIZE
      },
      filters: {
        search: debouncedSearch || undefined
      },
      sort: [
        {
          field: "TITLE",
          order: "ASC"
        }
      ]
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network'
  });

  // Process brief data when it arrives
  useEffect(() => {
    if (data?.getBriefs?.briefs) {
      const processBriefs = data.getBriefs.briefs.filter(Boolean);
      
      if (page === 1) {
        setAccumulatedBriefs(processBriefs);
      } else {
        setAccumulatedBriefs(prev => {
          // Deduplicate briefs when adding new ones
          const existingIds = new Set(prev.map(brief => brief?.id));
          const uniqueNewBriefs = processBriefs.filter(brief => !existingIds.has(brief?.id));
          return [...prev, ...uniqueNewBriefs];
        });
      }
      
      setIsLoadingMore(false);
    }
  }, [data?.getBriefs?.briefs, page]);

  // Sync selection with parent component
  useEffect(() => {
    if (JSON.stringify(defaultValues) !== JSON.stringify(selectedValues)) {
      setSelectedValues(defaultValues);
    }
  }, [defaultValues, selectedValues]);

  // Handle search
  const handleSearch = (query: string) => {
    // When search changes, explicitly reset page to 1
    if (search !== query) {
      setPage(1);
      setAccumulatedBriefs([]);
    }
    setSearch(query);
  };

  // Refresh briefs data
  const refreshBriefs = useCallback(async () => {
    // Reset page and accumulated briefs
    setPage(1);
    setAccumulatedBriefs([]);
    
    // Clear cache to ensure fresh data
    client.cache.evict({ fieldName: 'getBriefs' });
    client.cache.gc();
    
    await refetch({
      pagination: {
        page: 1, // Always use page 1 when refreshing
        pageSize: PAGE_SIZE
      },
      filters: {
        search: debouncedSearch || undefined
      }
    });
  }, [client, debouncedSearch, refetch]);
  const hasMoreBriefs = data?.getBriefs?.hasNextPage || false;
  // Handle loading more briefs
  const handleLoadMore = useCallback(() => {
    if (loading || isLoadingMore || !hasMoreBriefs) return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    
    fetchMore({
      variables: {
        pagination: {
          page: nextPage,
          pageSize: PAGE_SIZE
        },
        filters: {
          search: debouncedSearch || undefined
        }
      }
    }).catch(error => {
      setIsLoadingMore(false);
      console.error("Error loading more briefs:", error);
    });
  }, [loading, isLoadingMore, fetchMore, page, debouncedSearch, hasMoreBriefs]);

  // Toggle brief selection
  const toggleBrief = useCallback((briefId: string) => {
    const newValues = selectedValues.includes(briefId)
      ? selectedValues.filter(id => id !== briefId)
      : [...selectedValues, briefId];
    
    setSelectedValues(newValues);
    onChange?.(newValues);
  }, [selectedValues, onChange]);

  // Available briefs data
  
  const totalBriefs = data?.getBriefs?.totalCount || 0;

  // Fetch missing brief details using a simple approach
  useEffect(() => {
    const briefsInResults = new Set(accumulatedBriefs.map(brief => String(brief?.id)));
    const missingBriefs = selectedValues.filter(id => 
      !briefsInResults.has(id) && 
      !selectedBriefDetails[id]
    );
    
    // Skip if no missing briefs
    if (missingBriefs.length === 0) return;
    
    // Set loading state
    setLoadingBriefDetails(true);
    
    // For simplicity, we'll use title placeholders for the briefs we don't have details for
    // This avoids the complex query that was causing issues
    missingBriefs.forEach(briefId => {
      setSelectedBriefDetails(prev => ({
        ...prev,
        [briefId]: {
          id: briefId,
          title: `Brief ${briefId}`,
        }
      }));
    });
    
    setLoadingBriefDetails(false);
  }, [selectedValues, accumulatedBriefs, selectedBriefDetails]);

  // Initialize tokens from initialTokens
  useEffect(() => {
    if (initialTokens && initialTokens.length > 0) {
      const briefDetails: Record<string, BriefCacheItem> = {};
      
      initialTokens.forEach(token => {
        if (token && token.id) {
          const id = String(token.id);
          briefDetails[id] = {
            id,
            title: token.title || `Brief ${id}`
          };
        }
      });
      
      setSelectedBriefDetails(prev => ({
        ...prev,
        ...briefDetails
      }));
    }
  }, [initialTokens]);

  // Loading brief skeleton
  const LoadingBriefSkeleton = () => (
    <div className="flex items-center gap-2 p-2 animate-pulse">
      <div className="h-4 w-4 rounded-sm bg-muted" />
      <div className="h-4 w-32 bg-muted rounded" />
    </div>
  );

  // Reset state when popover opens
  const handlePopoverOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      console.log("Popover opened, refreshing briefs");
      refreshBriefs();
    }
  }, [refreshBriefs]);

  // Add ref for intersection observer
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMoreBriefs && !loading && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMoreBriefs, loading, isLoadingMore, handleLoadMore]);

  // Reset pagination when search changes
  useEffect(() => {
    refetch({
      pagination: {
        page,
        pageSize: PAGE_SIZE
      },
      filters: {
        search: debouncedSearch || undefined
      }
    });
  }, [debouncedSearch, page, refetch]);

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
            disabled={disabled}
          >
            {selectedValues.length > 0
              ? `${selectedValues.length} briefs selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 max-h-[300px] overflow-auto">
          <Command 
            shouldFilter={false}
            value={commandValue}
            onValueChange={setCommandValue}
          >
            <CommandInput 
              placeholder="Search briefs..." 
              onValueChange={handleSearch}
              value={search}
            />
            <CommandEmpty>
              {loading && accumulatedBriefs.length === 0 ? <LoadingBriefSkeleton /> : "No briefs found."}
            </CommandEmpty>
            <CommandGroup>
              {accumulatedBriefs.length > 0 && accumulatedBriefs.map((brief) => {
                const id = String(brief?.id);
                const isSelected = selectedValues.includes(id);
                const itemValue = `brief-${id}`;
                
                return (
                  <CommandItem
                    key={`brief-item-${id}`}
                    value={itemValue}
                    onSelect={() => {
                      toggleBrief(id);
                      setCommandValue(itemValue); // Set active item
                    }}
                    className={cn(
                      "brief-item-hover",
                      commandValue === itemValue ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {brief?.title || "Untitled Brief"}
                  </CommandItem>
                );
              })}
              
              {/* Loading indicator for initial load or loading more */}
              {(loading && accumulatedBriefs.length === 0) || isLoadingMore ? (
                <div className="p-2">
                  <LoadingBriefSkeleton />
                  <LoadingBriefSkeleton />
                  <LoadingBriefSkeleton />
                </div>
              ) : null}
              
              {/* Infinite scroll trigger div - replace load more button */}
              {hasMoreBriefs && !isLoadingMore && !loading && (
                <div 
                  ref={loadMoreRef} 
                  className="h-4 w-full opacity-0"
                />
              )}
              
              {/* End of results message */}
              {!hasMoreBriefs && accumulatedBriefs.length > 0 && (
                <div className="p-2 text-center text-xs text-muted-foreground">
                  {totalBriefs === accumulatedBriefs.length ? (
                    <span>Showing all {totalBriefs} briefs</span>
                  ) : (
                    <span>End of results</span>
                  )}
                </div>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      <div className="flex flex-wrap gap-2">
        {selectedValues.map((briefId) => {
          const briefInResults = accumulatedBriefs?.find((b) => String(b?.id) === briefId);
          const briefInCache = selectedBriefDetails[briefId];
          const isLoading = !briefInResults && !briefInCache && loadingBriefDetails;

          // Find brief title from initialTokens if available
          const initialToken = initialTokens?.find(token => String(token.id) === briefId);
          const title = initialToken?.title || briefInResults?.title || briefInCache?.title || `Brief ${briefId}`;
          
          return (
            <Badge
              key={briefId}
              variant="outline"
              className="cursor-pointer flex items-center gap-1"
              onClick={() => !disabled && toggleBrief(briefId)}
            >
              <Link className="h-3 w-3" />
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Loading...
                </span>
              ) : title}
              <span className="ml-1 text-xs">×</span>
            </Badge>
          );
        })}
      </div>
    </div>
  );
} 