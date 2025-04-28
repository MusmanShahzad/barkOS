"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  FileIcon,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Info,
  MessageSquare,
  Tag,
  FileText,
  Maximize,
  Minimize,
  Link,
  Edit,
} from "lucide-react"
import { formatFileSize, formatDate } from "@/lib/utils"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import EnhancedCommentSection from "@/components/enhanced-comment-section"
import { useGetAssetQuery, GetAssetQueryResult, BriefStatus } from "@/src/graphql/generated/graphql"
import { toast } from "sonner"

export interface AssetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number | null;
  onEdit?: (asset: any) => void;
}

// Define a simpler Brief type for our component based on the GetBriefsQueryResult
type BriefInfo = {
  id: number;
  title?: string | null;
  status?: BriefStatus | null;
}

// Get the briefs with titles from the brief query
type BriefWithTitle = {
  readonly __typename: "Brief";
  readonly id: number;
  readonly title?: string | null;
  readonly status?: BriefStatus | null;
  readonly created_at: string;
}

export default function AssetPreviewModal({ isOpen, onClose, assetId, onEdit }: AssetPreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [activeSection, setActiveSection] = useState("details")
  const [relatedAssets, setRelatedAssets] = useState([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get asset data using Apollo client
  const { data, loading: isLoading, error } = useGetAssetQuery({
    variables: { getAssetId: assetId || 0 },
    skip: !assetId || !isOpen,
    fetchPolicy: 'network-only'
  });

  const asset = data?.getAsset;
  
  // Reset state when asset changes or modal closes
  useEffect(() => {
    if (!isOpen) {
      setZoomLevel(1)
      setRotation(0)
      setIsFullscreen(false)
    }
  }, [isOpen, assetId]);

  // Video player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(progress)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / rect.width
      videoRef.current.currentTime = pos * videoRef.current.duration
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Image controls
  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Handle download
  const handleDownload = () => {
    if (asset?.media?.url) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = asset.media.url;
      link.download = asset.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error("Download URL not available");
    }
  }

  // Handle edit
  const handleEdit = () => {
    if (onEdit && asset) {
      onEdit({
        id: asset.id,
        name: asset.name || '',
        description: asset.description || '',
        media_id: asset.media_id,
        thumbnail_media_id: asset.thumbnail_media_id || null,
        url: asset.media?.url || '',
        fileType: asset.media?.file_type || '',
        tags: asset.tags?.filter(tag => !!tag).map(tag => ({
          id: tag?.id || 0,
          name: tag?.name || ''
        })) || [],
        created_at: asset.created_at,
        relatedBriefs: asset.briefs?.filter(brief => !!brief).map(brief => {
          // Cast to BriefWithTitle to access title safely
          const briefInfo = brief as unknown as BriefWithTitle;
          return {
            id: briefInfo.id || 0,
            title: briefInfo.title || 'Untitled Brief'
          };
        }) || []
      });
      onClose();
    }
  }

  // Handle adding a comment
  const handleAddComment = (comment: string, mentionedUsers: any[] = []) => {
    // In a real app, you would update the asset with the new comment
    console.log(`Adding comment: ${comment}`, mentionedUsers)
  }

  const getFileType = (fileType?: string | null) => {
    if (!fileType) return "unknown";
    
    if (fileType.startsWith("image/")) return "image";
    if (fileType.startsWith("video/")) return "video";
    if (fileType === "application/pdf") return "pdf";
    
    return "document";
  }

  const renderPreview = () => {
    if (!asset?.media?.file_type) return null;
    
    const fileType = getFileType(asset.media.file_type);
    const mediaUrl = asset.media.url || '';
    
    if (fileType === "image") {
      return (
        <div
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            transition: "transform 0.3s ease",
          }}
          className="relative max-w-full max-h-full"
        >
          <Image
            src={mediaUrl}
            alt={asset.name || 'Preview'}
            width={800}
            height={600}
            className="object-contain"
          />
        </div>
      );
    }
    
    if (fileType === "video") {
      return (
        <video
          ref={videoRef}
          src={mediaUrl}
          className="max-w-full max-h-full"
          poster={asset.thumbnail?.url || undefined}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      );
    }
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <FileIcon className="h-24 w-24 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">{asset.name}</p>
        <p className="text-sm text-muted-foreground mb-4">{asset.media.file_type}</p>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">{asset?.name || 'Asset Preview'}</DialogTitle>
        
        {/* Header with title and actions */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <>
                <div className="h-8 w-8 rounded overflow-hidden bg-muted flex-shrink-0">
                  {getFileType(asset?.media?.file_type) === "image" ? (
                    <Image
                      src={asset?.media?.url || "/placeholder.svg"}
                      alt={asset?.name || ""}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : getFileType(asset?.media?.file_type) === "video" ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={asset?.thumbnail?.url || "/placeholder.svg"}
                        alt={asset?.name || ""}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-medium">{asset?.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{getFileType(asset?.media?.file_type)}</Badge>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowInfo(!showInfo)}>
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showInfo ? "Hide info" : "Show info"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!isLoading && asset?.media?.url && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleEdit}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Main content area with preview and info panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview area */}
          <div
            ref={containerRef}
            className={cn(
              "flex-1 relative bg-muted/30 flex items-center justify-center overflow-hidden",
              showInfo ? "border-r" : "",
            )}
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="h-[400px] w-[400px]" />
              </div>
            ) : asset?.media?.file_type && getFileType(asset.media.file_type) === "image" ? (
              <div className="relative w-full h-full flex items-center justify-center p-4">
                {renderPreview()}

                {/* Image controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 p-2 rounded-full">
                  <Button variant="ghost" size="icon" onClick={zoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-medium">{Math.round(zoomLevel * 100)}%</span>
                  <Button variant="ghost" size="icon" onClick={zoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="ghost" size="icon" onClick={rotate}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : asset?.media?.file_type && getFileType(asset.media.file_type) === "video" ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {renderPreview()}

                {/* Video controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="w-full h-1 bg-muted rounded-full mb-2 cursor-pointer" onClick={handleSeek}>
                    <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={togglePlay}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={toggleMute}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>

                      <span className="text-xs text-white">
                        {videoRef.current ? formatTime(videoRef.current.currentTime) : "0:00"} /
                        {duration ? formatTime(duration) : "0:00"}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Play button overlay when paused */}
                {!isPlaying && (
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                  >
                    <div className="h-16 w-16 rounded-full bg-black/60 flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              renderPreview()
            )}
          </div>

          {/* Info panel */}
          {showInfo && (
            <div className="w-80 flex-shrink-0 overflow-y-auto border-l">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="p-4">
                  {/* Section tabs */}
                  <div className="flex border-b mb-4">
                    <button
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 text-sm font-medium border-b-2 -mb-px",
                        activeSection === "details"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => setActiveSection("details")}
                    >
                      <Info className="h-4 w-4" />
                      Details
                    </button>
                    <button
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 text-sm font-medium border-b-2 -mb-px",
                        activeSection === "comments"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => setActiveSection("comments")}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Comments
                    </button>
                  </div>

                  {/* Details section */}
                  {activeSection === "details" && (
                    <div className="space-y-4">
                      {/* Description */}
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
                          <span>Description</span>
                          <ChevronRight className="h-4 w-4 transition-transform ui-open:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 pb-4">
                          <p className="text-sm text-muted-foreground">
                            {asset?.description || "No description provided."}
                          </p>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Tags */}
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            <span>Tags</span>
                          </div>
                          <ChevronRight className="h-4 w-4 transition-transform ui-open:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 pb-4">
                          {asset?.tags && asset.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {asset.tags.filter(tag => !!tag).map((tag) => (
                                <Badge key={tag?.id} variant="secondary">
                                  {tag?.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No tags.</p>
                          )}
                        </CollapsibleContent>
                      </Collapsible>

                      {/* File details */}
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <FileIcon className="h-4 w-4" />
                            <span>File Details</span>
                          </div>
                          <ChevronRight className="h-4 w-4 transition-transform ui-open:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 pb-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Type</span>
                              <span className="text-sm font-medium">{asset?.media?.file_type || "Unknown"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Created</span>
                              <span className="text-sm font-medium">{formatDate(asset?.created_at || "")}</span>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Related briefs */}
                      {asset?.briefs && asset.briefs.length > 0 && (
                        <Collapsible defaultOpen>
                          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Related Briefs</span>
                            </div>
                            <ChevronRight className="h-4 w-4 transition-transform ui-open:rotate-90" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2 pb-4">
                            <div className="space-y-2">
                              {asset.briefs.filter(brief => !!brief).map((brief) => (
                                <div
                                  key={brief?.id}
                                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                                >
                                  <span className="text-sm font-medium truncate">
                                    {(brief as unknown as BriefWithTitle)?.title || "Untitled Brief"}
                                  </span>
                                  <Badge variant="outline">{brief?.status || "Unknown"}</Badge>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  )}

                  {/* Comments section */}
                  {activeSection === "comments" && (
                    <div className="space-y-4">
                      <EnhancedCommentSection comments={asset?.comments?.filter(comment => !!comment) || []} onAddComment={handleAddComment} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
