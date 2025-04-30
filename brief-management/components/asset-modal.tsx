"use client"

import { useEffect, useState, FormEvent, useCallback } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { MediaUpload } from "./media-upload"
import { toast } from "sonner"
import { 
  useCreateAssetMutation, 
  useUpdateAssetMutation, 
  useGetTagsQuery,
  Asset as GraphQLAsset,
  Tag,
  Maybe,
  CommentInput
} from "../src/graphql/generated/graphql"
import { Badge } from "./ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Check, ChevronsUpDown, Loader2, AlertCircle, FileIcon, Trash2, Save, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "./ui/progress"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { BriefTokenizeInput } from "./brief-tokenize-input"
import React from "react"
import { Separator } from "./ui/separator"
import EnhancedCommentSection from "./enhanced-comment-section"
import { gql } from "@apollo/client"
import { useMutation } from "@apollo/client"

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

// Define the AddCommentToAsset mutation
const ADD_COMMENT_TO_ASSET = gql`
  mutation AddCommentToAsset($assetId: Int!, $commentInput: CommentInput!) {
    addCommentToAsset(assetId: $assetId, commentInput: $commentInput) {
      id
      text
      created_at
      user {
        id
        full_name
        profile_image
      }
    }
  }
`;

export interface IAsset extends Omit<GraphQLAsset, '__typename' | 'comments' | 'tags' | 'briefs' | 'thumbnail'> {
  url: string;
  fileType: string;
  tags?: { id: number; name: string }[];
  updated_at?: string;
  thumbnail?: {
    id: number;
    url: string;
    file_type: string;
  } | undefined;
  briefs?: { id: number; title: string }[];
  relatedBriefs?: { id: number; title: string }[];
  comments?: {
    id: string;
    text: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    } | null;
  }[];
}

// Comment interface to match with EnhancedCommentSection props
interface CommentUser {
  id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  id: string;
  text: string;
  user: CommentUser; 
  createdAt: string;
}

export interface AssetModalProps {
  isOpen: boolean
  onClose: (asset?: IAsset) => Promise<void> | void
  onSave: (asset: IAsset) => Promise<void>
  asset: IAsset | null
}

// Form schema for validation
const assetFormSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  mediaId: z.number().optional(),
  thumbnailMediaId: z.number().optional(),
  selectedTags: z.array(z.number())
    .min(1, "Please select at least one tag"),
  selectedBriefs: z.array(z.string()).optional(),
  fileType: z.string().optional(),
  url: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

export function AssetModal({ isOpen, onClose, onSave, asset }: AssetModalProps) {
  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [mediaRemoved, setMediaRemoved] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  // Add state for comments
  const [comments, setComments] = useState<Comment[]>([]);

  // Mutations and queries
  const [createAsset] = useCreateAssetMutation();
  const [updateAsset] = useUpdateAssetMutation();
  const { data: tagsData } = useGetTagsQuery();
  // Add the ADD_COMMENT_TO_ASSET mutation
  const [addCommentToAsset, { loading: addingComment }] = useMutation(ADD_COMMENT_TO_ASSET);

  // Form ref for manual submission
  const formRef = React.useRef<HTMLFormElement>(null);

  // Form with react-hook-form
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting, isDirty }, 
    reset,
    setValue,
    watch,
    clearErrors,
    getValues
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      title: asset?.name || '',
      description: asset?.description || '',
      mediaId: asset?.media_id ? Number(asset.media_id) : undefined,
      thumbnailMediaId: asset?.thumbnail_media_id ? Number(asset.thumbnail_media_id) : undefined,
      selectedTags: asset?.tags?.map(tag => tag.id) || [],
      selectedBriefs: asset?.relatedBriefs?.map(brief => String(brief.id)) || [],
      fileType: asset?.fileType || '',
      url: asset?.url || '',
    }
  });

  // Auto-save handler (debounced)
  const autoSaveAsset = useCallback(
    debounce(async () => {
      if (!asset?.id || !isDirty || isUploading) return;
      
      try {
        setAutoSaveStatus('saving');
        const data = getValues();
        
        const input = {
          media_id: data.mediaId as number,
          name: data.title.trim(),
          description: data.description.trim(),
          tagIds: data.selectedTags,
          thumbnail_media_id: data.thumbnailMediaId,
          relatedBriefIds: data.selectedBriefs ? data.selectedBriefs.map(id => parseInt(id)) : []
        };

        await updateAsset({
          variables: {
            id: asset.id,
            input
          }
        });

        setAutoSaveStatus('saved');
        
        // Reset to idle after a delay
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2000);
      } catch (error: any) {
        console.error("Auto-save error:", error);
        setAutoSaveStatus('error');
        
        // Reset to idle after a delay
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 3000);
      }
    }, 1500),
    [asset?.id, isDirty, isUploading, updateAsset, getValues]
  );

  // Watch for changes and trigger auto-save
  useEffect(() => {
    if (asset?.id && isDirty && !isUploading) {
      autoSaveAsset();
    }
  }, [
    watch('title'),
    watch('description'),
    watch('selectedTags'),
    watch('selectedBriefs'),
    watch('mediaId'),
    watch('thumbnailMediaId'),
    watch('fileType'),
    watch('url'),
    asset?.id,
    isDirty,
    isUploading,
    autoSaveAsset
  ]);

  // Reset form when asset changes
  useEffect(() => {
    if (isOpen) {
      // Get briefs from either relatedBriefs or briefs property
      const briefsData = asset?.briefs || asset?.relatedBriefs || [];
      console.log("Briefs data:", asset);
      
      reset({
        title: asset?.name || '',
        description: asset?.description || '',
        mediaId: asset?.media_id ? Number(asset.media_id) : undefined,
        thumbnailMediaId: asset?.thumbnail_media_id ? Number(asset.thumbnail_media_id) : undefined,
        selectedTags: asset?.tags?.map(tag => tag.id) || [],
        selectedBriefs: briefsData.map(brief => String(brief.id)) || [],
        fileType: asset?.fileType || '',
        url: asset?.url || '',
      });
      setMediaRemoved(false);
      setAutoSaveStatus('idle');
    }
  }, [asset, isOpen, reset]);

  const handleClose = () => {
    reset({
      title: '',
      description: '',
      mediaId: undefined,
      thumbnailMediaId: undefined,
      selectedTags: [],
      selectedBriefs: [],
      fileType: '',
      url: '',
    }, { 
      keepDefaultValues: false, 
    });
    
    // Force clear all errors
    clearErrors();
    
    // Reset state variables
    setMediaRemoved(false);
    setAutoSaveStatus('idle');
    setIsUploading(false);
    setUploadProgress(0);
    setTagPopoverOpen(false);
    
    // Reset the form element directly
    if (formRef.current) {
      formRef.current.reset();
    }
    
    onClose();
  };

  // Remove media handler
  const handleRemoveMedia = () => {
    setValue('mediaId', undefined, { shouldDirty: true });
    setValue('url', '', { shouldDirty: true });
    setValue('fileType', '', { shouldDirty: true });
    setValue('thumbnailMediaId', undefined, { shouldDirty: true });
    setMediaRemoved(true);
  };

  // Handle brief selection changes
  const handleBriefChange = (selectedBriefs: string[]) => {
    setValue('selectedBriefs', selectedBriefs, { shouldDirty: true, shouldValidate: true });
  };

  // Function to trigger form submission from outside the form
  const submitForm = () => {
    formRef.current?.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true })
    );
  };

  // Form submission
  const onSubmitForm = async (data: AssetFormValues) => {
    try {
      if (!data.mediaId && !asset && !mediaRemoved) {
        toast.error('Please upload a file');
        return;
      }

      setAutoSaveStatus('saving');

      const input = {
        media_id: data.mediaId as number,
        name: data.title.trim(),
        description: data.description.trim(),
        tagIds: data.selectedTags,
        thumbnail_media_id: data.thumbnailMediaId,
        relatedBriefIds: data.selectedBriefs ? data.selectedBriefs.map(id => parseInt(id)) : []
      };
      let updatedAsset;

      if (asset?.id) {
        const out = await updateAsset({
          variables: {
            id: asset.id,
            input
          }
        });
        updatedAsset = out.data?.updateAsset;
      } else {
        const out = await createAsset({
          variables: {
            input
          }
        });
        updatedAsset = out.data?.createAsset;
      }

      // Create the briefs data from selectedBriefs
      const briefsData = data.selectedBriefs?.map(briefId => {
        return { id: parseInt(briefId), title: `Brief ${briefId}` };
      }) || [];

      // Create a complete asset object to pass to onSave
      const savedAsset: IAsset = {
        id: updatedAsset?.id || asset?.id || 0,
        name: data.title,
        description: data.description,
        media_id: data.mediaId as number,
        thumbnail_media_id: data.thumbnailMediaId || null,
        url: data.url || '',
        fileType: data.fileType || '',
        tags: data.selectedTags.map(tagId => {
          const tag = availableTags.find(t => t.id === tagId);
          return { id: tagId, name: tag?.name || '' };
        }),
        relatedBriefs: briefsData,
        briefs: briefsData,
        created_at: asset?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        comments: [],
      };

      setAutoSaveStatus('saved');
      toast.success(`Asset ${asset ? 'updated' : 'created'} successfully`);
      await onSave(savedAsset);
      handleClose();
    } catch (error: any) {
      console.error(error);
      setAutoSaveStatus('error');
      toast.error(`Failed to ${asset ? 'update' : 'create'} asset: ${error.message}`);
    }
  };

  const handleMediaUploadComplete = (media: { 
    id: number; 
    url: string; 
    file_type: string;
    thumbnail_id?: number;
  }) => {
    setValue('mediaId', media.id);
    setValue('url', media.url);
    setValue('fileType', media.file_type);
    setUploadProgress(100);
    setIsUploading(false);
    setMediaRemoved(false);
    clearErrors('mediaId');

    // Set thumbnail ID if provided
    if (media.thumbnail_id) {
      setValue('thumbnailMediaId', media.thumbnail_id);
    }
  };

  const handleUploadStart = () => {
    setIsUploading(true);
    setUploadProgress(0);
  };

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const toggleTag = (tagId: number) => {
    const currentTags = watch('selectedTags');
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    
    setValue('selectedTags', newTags, { shouldDirty: true, shouldValidate: true });
  };

  const availableTags = (tagsData?.getTags || []).filter((tag): tag is Tag => !!tag && !!tag.id && !!tag.name);

  // Field error display component
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-2 mt-1 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  };

  // Auto-save status indicator
  const AutoSaveIndicator = () => {
    if (autoSaveStatus === 'idle' || !asset?.id) return null;
    
    return (
      <div className={cn(
        "flex items-center gap-2 text-xs",
        autoSaveStatus === 'saving' && "text-muted-foreground",
        autoSaveStatus === 'saved' && "text-green-600",
        autoSaveStatus === 'error' && "text-red-600"
      )}>
        {autoSaveStatus === 'saving' && (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Saving...</span>
          </>
        )}
        {autoSaveStatus === 'saved' && (
          <>
            <Save className="h-3 w-3" />
            <span>Saved</span>
          </>
        )}
        {autoSaveStatus === 'error' && (
          <>
            <AlertCircle className="h-3 w-3" />
            <span>Failed to save</span>
          </>
        )}
      </div>
    );
  };

  const renderPreview = () => {
    const url = watch('url') || asset?.url;
    const type = watch('fileType') || asset?.fileType;

    if (!url || !type || mediaRemoved) return null;

    if (type.startsWith('image/')) {
      return (
        <img
          src={url}
          alt="Preview"
          className="object-contain w-full h-full"
        />
      );
    }

    if (type.startsWith('video/')) {
      return (
        <video 
          src={url}
          controls
          className="object-contain w-full h-full"
          poster={asset?.thumbnail_media_id ? `/api/media/${asset.thumbnail_media_id}` : undefined}
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (type === 'application/pdf') {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <FileIcon className="w-16 h-16 text-muted-foreground" />
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View PDF
          </a>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <FileIcon className="w-16 h-16 text-muted-foreground" />
        <span className="text-muted-foreground">
          {type} file
        </span>
      </div>
    );
  };

  // Check if media exists
  const hasMedia = (watch('url') || asset?.url) && !mediaRemoved;

  useEffect(() => {
    if (!isOpen) {
      // Reset form values
      reset({
        title: '',
        description: '',
        mediaId: undefined,
        thumbnailMediaId: undefined,
        selectedTags: [],
        selectedBriefs: [],
        fileType: '',
        url: '',
      });
      
      // Reset UI state
      setMediaRemoved(false);
      setAutoSaveStatus('idle');
      setIsUploading(false);
      setUploadProgress(0);
      setTagPopoverOpen(false);
    } else if (asset) {
      // Only populate form if modal is opening with an asset
      reset({
        title: asset?.name || '',
        description: asset?.description || '',
        mediaId: asset?.media_id ? Number(asset.media_id) : undefined,
        thumbnailMediaId: asset?.thumbnail_media_id ? Number(asset.thumbnail_media_id) : undefined,
        selectedTags: asset?.tags?.map(tag => tag.id) || [],
        selectedBriefs: asset?.relatedBriefs?.map(brief => String(brief.id)) || [],
        fileType: asset?.fileType || '',
        url: asset?.url || '',
      });
    }
  }, [isOpen, asset, reset]);

  useEffect(() => {
    // Cleanup function that will run when component unmounts or dependencies change
    return () => {
      // Reset everything when the component is unmounted or modal is closed
      if (!isOpen) {
        reset({
          title: '',
          description: '',
          mediaId: undefined,
          thumbnailMediaId: undefined,
          selectedTags: [],
          selectedBriefs: [],
          fileType: '',
          url: '',
        });
        
        // Clean up all state
        setMediaRemoved(false);
        setAutoSaveStatus('idle');
        setIsUploading(false);
        setUploadProgress(0);
        setTagPopoverOpen(false);
        
        // Reset the form element directly
        if (formRef.current) {
          console.log('RESTING');
          formRef.current.reset();
        }
      }
    };
  }, [isOpen, reset]);

  // Load comments when asset changes
  useEffect(() => {
    if (asset?.id && isOpen) {
      // Initialize comments from the asset data if available
      if (asset.comments && asset.comments.length > 0) {
        setComments(asset.comments.map(comment => ({
          id: comment.id,
          text: comment.text,
          user: comment.user,
          createdAt: comment.createdAt
        })));
      } else {
        setComments([]);
      }
    }
  }, [asset?.id, asset?.comments, isOpen]);

  // Add handler for submitting comments
  const handleAddComment = async (text: string, mentionedUsers: {id: string, name: string}[] = []) => {
    // Only allow adding comments in edit mode (when asset exists)
    if (!asset?.id) {
      toast.error("Comments can only be added to saved assets");
      return;
    }
    
    if (!text.trim()) {
      toast.error("Comment text cannot be empty");
      return;
    }
    
    try {
      // Hard-coded user ID for demo purposes - in production, this should come from auth
      const userId = 2;
      
      // Create a comment input object with the proper field name
      const commentInput: CommentInput = {
        text: text.trim(), // Make sure to trim the text
        user_id: userId
      };
      
      console.log("Sending comment:", commentInput);
      
      // Call the mutation
      const response = await addCommentToAsset({
        variables: {
          assetId: Number(asset.id),
          commentInput
        }
      });
      
      if (response.data?.addCommentToAsset) {
        const newComment = response.data.addCommentToAsset;
        
        console.log("Received comment:", newComment);
        
        // Add the new comment to the state
        setComments(prevComments => [
          ...prevComments,
          {
            id: String(newComment.id),
            text: newComment.text || '', // Default to empty string if null
            user: {
              id: String(newComment.user?.id || 0),
              name: newComment.user?.full_name || 'Unknown User',
              avatar: newComment.user?.profile_image || undefined
            },
            createdAt: newComment.created_at || new Date().toISOString()
          }
        ]);
        
        toast.success("Comment added successfully");
      } else {
        throw new Error("Failed to add comment. Server returned no data.");
      }
    } catch (error: any) {
      console.error("Error adding comment:", error);
      let errorMessage = "Failed to add comment";
      
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      if (error.networkError) {
        errorMessage += " - Network error. Please check your connection.";
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[800px] flex flex-col h-[80vh]">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>{asset ? 'Edit Asset' : 'Upload Asset'}</DialogTitle>
          <AutoSaveIndicator />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <form 
            ref={formRef}
            onSubmit={handleSubmit(onSubmitForm as any)} 
            className="space-y-4"
            id="asset-form"
          >
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>File</Label>
                {hasMedia && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    onClick={handleRemoveMedia}
                    disabled={isUploading || isSubmitting}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </Button>
                )}
              </div>
              
              {(!hasMedia) && (
                <MediaUpload
                  onUploadComplete={handleMediaUploadComplete}
                  onUploadError={(error) => {
                    toast.error(error.message);
                    setIsUploading(false);
                    setUploadProgress(0);
                  }}
                  onUploadStart={handleUploadStart}
                  onUploadProgress={handleUploadProgress}
                  disabled={isUploading || isSubmitting}
                  accept="image/*,video/*,application/pdf"
                  maxSize={50 * 1024 * 1024} // 50MB
                  className={cn(
                    "w-full",
                    !watch('mediaId') && !asset && !mediaRemoved && "border-destructive"
                  )}
                />
              )}
              {!watch('mediaId') && !asset && !mediaRemoved && <FieldError error="Please upload a file" />}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Uploading... {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-1" />
                </div>
              )}
            </div>

            {hasMedia && (
              <>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                  {renderPreview()}
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    id="title"
                    {...field}
                    placeholder="Enter asset title"
                    disabled={isUploading || isSubmitting}
                    className={cn(
                      errors.title && "border-destructive"
                    )}
                  />
                )}
              />
              <FieldError error={errors.title?.message} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    {...field}
                    placeholder="Enter asset description"
                    rows={4}
                    disabled={isUploading || isSubmitting}
                    className={cn(
                      errors.description && "border-destructive"
                    )}
                  />
                )}
              />
              <FieldError error={errors.description?.message} />
            </div>

            <div className="grid gap-2">
              <Label>Tags *</Label>
              <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={tagPopoverOpen}
                    className={cn(
                      "justify-between",
                      errors.selectedTags && "border-destructive"
                    )}
                    disabled={isUploading || isSubmitting}
                  >
                    {watch('selectedTags')?.length > 0
                      ? `${watch('selectedTags')?.length} tags selected`
                      : "Select tags..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search tags..." />
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {availableTags.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => toggleTag(tag.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              watch('selectedTags')?.includes(tag.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {tag.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FieldError error={errors.selectedTags?.message} />
              <div className="flex flex-wrap gap-2 mt-2">
                {watch('selectedTags')?.map((tagId) => {
                  const tag = availableTags.find(t => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => !isUploading && !isSubmitting && toggleTag(tag.id)}
                    >
                      {tag.name}
                      <span className="ml-1 text-xs">×</span>
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Link to Briefs</Label>
              <BriefTokenizeInput 
                defaultValues={watch('selectedBriefs') || []}
                onChange={handleBriefChange}
                placeholder="Link to briefs..."
              />
            </div>

            {/* Comments Section */}
            <div className="space-y-3">
              {/* <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Comments</h3>
                </div>
                {asset && comments.length > 0 && (
                  <Badge variant="outline">{comments.length}</Badge>
                )}
              </div>
              <Separator /> */}
              {/* Only show comments section when in edit mode (when asset already exists) */}
              {/* {asset ? (
                <div className="mt-4">
                  <EnhancedCommentSection 
                    comments={comments.map(comment => ({
                      id: comment.id,
                      text: comment.text,
                      user: {
                        id: comment.user.id || '0',
                        name: comment.user.name || 'Unknown User',
                        avatar: comment.user.avatar
                      },
                      createdAt: comment.createdAt
                    }))} 
                    onAddComment={handleAddComment}
                    isLoading={addingComment}
                    placeholder="Add a comment to this asset..."
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                  <p>Comments will be available after creating the asset</p>
                </div>
              )} */}
            </div>
          </form>
        </div>

        <DialogFooter className="pt-4 border-t mt-auto">
          <Button 
            type="button"
            variant="outline" 
            onClick={handleClose}
            disabled={isUploading || isSubmitting}
          >
            {asset?.id && autoSaveStatus !== 'idle' ? 'Close' : 'Cancel'}
          </Button>
          {(asset?.id === undefined || autoSaveStatus === 'idle') && (
            <Button 
              type="button"
              onClick={submitForm}
              disabled={((!watch('mediaId') && !asset) && !mediaRemoved) || isUploading || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                asset ? 'Update' : 'Create'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
