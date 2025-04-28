"use client"

import { useState, useEffect, MouseEventHandler, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, FileIcon, FileImage, MessageSquare, FileText, Loader2, Save, AlertCircle } from "lucide-react"
import { cn, formatDate, formatFileSize } from "@/lib/utils"
import { mockProducts, mockObjectives, mockUsers, mockAssets, mockBriefs } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import EnhancedCommentSection from "@/components/enhanced-comment-section"
import { AssetModal, IAsset } from "@/components/asset-modal"
import AssetPreviewModal from "@/components/asset-preview-modal"
import { TokenizedSelect } from "@/components/tokenized-select"
import { QuickAssetSelector } from "@/components/quick-asset-selector"
import { QuickTagSelector } from "@/components/quick-tag-selector"
import { BriefDetailSkeleton } from "@/components/loading-skeletons"
import { 
  Brief, 
  BriefInput, 
  Maybe, 
  Tag, 
  Asset as APIAsset, 
  Asset,
  useGetBriefDropDownsQuery,
  useCreateBriefMutation,
  useUpdateBriefMutation
} from "@/src/graphql/generated/graphql"
import { AssignToTokenizeInput } from "./assign-to-tokenize-input"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { BriefTokenizeInput } from "@/components/brief-tokenize-input"

// Define BriefStatus enum since it's not available in the generated types
export enum BriefStatus {
  Draft = "Draft",
  Review = "Review",
  Approved = "Approved"
}

interface TokenizedOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

// Custom type for form data
interface BriefFormData {
  id?: string;
  status: BriefStatus;
  createdAt?: string;
  title: string;
  product_id: string;
  objective_id: string;
  about_target_audience: string;
  about_hook: string;
  go_live_on: string;
  userIds: string[];
  tagIds: string[];
  assetIds: string[];
  relatedBriefIds: string[];
  comments: Array<Maybe<Comment>>;
}

// Helper function to convert form data to BriefInput
const convertFormDataToBriefInput = (formData: BriefFormData): BriefInput => {
  // Build the input object with conditional relationship arrays
  // We use 'as any' to bypass TypeScript read-only property restrictions
  const input: any = {
    title: formData.title,
    product_id: parseInt(formData.product_id),
    objective_id: parseInt(formData.objective_id),
    about_target_audience: formData.about_target_audience || "",
    about_hook: formData.about_hook || "",
    go_live_on: formData.go_live_on,
    status: formData.status
  };

  // Only include relationship arrays if they have values
  if (formData.userIds && formData.userIds.length > 0) {
    input.userIds = formData.userIds.map(id => parseInt(id));
  }
  
  if (formData.tagIds && formData.tagIds.length > 0) {
    input.tagIds = formData.tagIds.map(id => parseInt(id));
  }
  
  if (formData.assetIds && formData.assetIds.length > 0) {
    input.assetIds = formData.assetIds.map(id => parseInt(id));
  }
  
  if (formData.relatedBriefIds && formData.relatedBriefIds.length > 0) {
    input.relatedBriefIds = formData.relatedBriefIds.map(id => parseInt(id));
  }

  console.log('Generated brief input:', JSON.stringify(input, null, 2));
  return input as BriefInput;
};

// Helper function for status color
const getStatusColor = (status: BriefStatus): string => {
  switch (status.toLowerCase()) {
    case "draft":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "review":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export interface IBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (brief: Brief) => void;
  brief: Brief | null;
}

interface Comment {
  id: string;
  text: string;
  user: any; // Replace with proper user type
  createdAt: Date;
  mentions: any[]; // Replace with proper mention type
}

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

// Form schema for validation
const briefFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  product_id: z.string().min(1, "Product is required"),
  objective_id: z.string().min(1, "Objective is required"),
  about_target_audience: z.string(),
  about_hook: z.string(),
  go_live_on: z.string(),
  status: z.nativeEnum(BriefStatus),
  userIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  assetIds: z.array(z.string()),
  relatedBriefIds: z.array(z.string())
});

type BriefFormValues = z.infer<typeof briefFormSchema>;

// Define an interface for our asset that's compatible with both the API asset and our UI needs
interface AssetDisplay {
  id: number;
  name: string;
  description?: string;
  media_id: number;
  thumbnail_media_id?: number | null;
  created_at: string;
  type: string;
  url: string;
  size: number;
  thumbnail: string | null;
  tags: string[];
}

export default function BriefModal({ isOpen, onClose, onSuccess, brief = null }: IBriefModalProps) {
  const { data: dropDownData, loading: dropDownLoading } = useGetBriefDropDownsQuery();
  const [createBrief, { loading: creatingBrief }] = useCreateBriefMutation();
  const [updateBrief, { loading: updatingBrief }] = useUpdateBriefMutation();

  const [selectedAssets, setSelectedAssets] = useState<AssetDisplay[]>([]);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [selectedAssetForModal, setSelectedAssetForModal] = useState<IAsset | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [previewAssetId, setPreviewAssetId] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const formRef = useRef<HTMLFormElement>(null);

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
  } = useForm<BriefFormValues>({
    resolver: zodResolver(briefFormSchema),
    defaultValues: {
      title: brief?.title || "",
      product_id: brief?.product?.id?.toString() || "",
      objective_id: brief?.objective?.id?.toString() || "",
      about_target_audience: brief?.about_target_audience || "",
      about_hook: brief?.about_hook || "",
      go_live_on: brief?.go_live_on || new Date().toISOString(),
      status: brief?.status as BriefStatus || BriefStatus.Draft,
      userIds: brief?.users?.map(user => user?.id?.toString() || "").filter(Boolean) || [],
      tagIds: brief?.tags?.map(tag => tag?.id?.toString() || "").filter(Boolean) || [],
      assetIds: brief?.assets?.map(asset => asset?.id?.toString() || "").filter(Boolean) || [],
      relatedBriefIds: brief?.related_briefs?.map(brief => brief?.id?.toString() || "").filter(Boolean) || []
    }
  });

  // Auto-save handler (debounced)
  const autoSaveBrief = useCallback(
    debounce(async () => {
      if (!brief?.id || !isDirty) return;
      
      try {
        setAutoSaveStatus('saving');
        const data = getValues();
        
        const briefInput = convertFormDataToBriefInput({
          ...data,
          id: brief.id.toString(),
          createdAt: brief.created_at || new Date().toISOString(),
          comments: [] // Don't include comments in the update
        });

        const result = await updateBrief({
          variables: {
            id: Number(brief.id),
            input: briefInput
          }
        });

        if (result.data?.updateBrief) {
          setAutoSaveStatus('saved');
          
          // Reset to idle after a delay
          setTimeout(() => {
            setAutoSaveStatus('idle');
          }, 2000);
        } else {
          throw new Error("Failed to update brief");
        }
      } catch (error: any) {
        console.error("Auto-save error:", error);
        setAutoSaveStatus('error');
        
        // Reset to idle after a delay
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 3000);
      }
    }, 1500),
    [brief?.id, isDirty, getValues, brief?.created_at, updateBrief]
  );

  // Watch for changes and trigger auto-save
  useEffect(() => {
    if (brief?.id && isDirty) {
      autoSaveBrief();
    }
  }, [
    watch('title'),
    watch('product_id'),
    watch('objective_id'),
    watch('about_target_audience'),
    watch('about_hook'),
    watch('go_live_on'),
    watch('status'),
    watch('userIds'),
    watch('tagIds'),
    watch('assetIds'),
    watch('relatedBriefIds'),
    brief?.id,
    isDirty,
    autoSaveBrief
  ]);

  useEffect(() => {
    if (brief?.assets) {
      const validAssets = brief.assets
        .filter((asset): asset is NonNullable<typeof asset> => asset !== null)
        .map((apiAsset): AssetDisplay => ({
          id: Number(apiAsset.id),
          name: apiAsset.name || '',
          description: apiAsset.description || '',
          media_id: Number(apiAsset.media_id || 0),
          thumbnail_media_id: apiAsset.thumbnail_media_id,
          created_at: apiAsset.created_at || '',
          // Get these from media
          type: apiAsset.media?.file_type?.split('/')[0] || 'file',
          url: apiAsset.media?.url || '',
          size: 0, // We don't have size in the API
          thumbnail: apiAsset.thumbnail?.url || null,
          tags: Array.from(apiAsset.tags || []).map(tag => tag?.name || '')
        }));
      setSelectedAssets(validAssets);
    } else {
      setSelectedAssets([]);
    }
  }, [brief]);

  const handleClose = () => {
    // Reset form state
    reset({
      title: "",
      product_id: "",
      objective_id: "",
      about_target_audience: "",
      about_hook: "",
      go_live_on: new Date().toISOString(),
      status: BriefStatus.Draft,
      userIds: [],
      tagIds: [],
      assetIds: [],
      relatedBriefIds: []
    }, { 
      keepDefaultValues: false, 
    });
    
    // Force clear all errors
    clearErrors();
    setAutoSaveStatus('idle');
    
    // Reset the form element directly
    if (formRef.current) {
      formRef.current.reset();
    }
    
    onClose();
  };

  // Reset form when brief changes
  useEffect(() => {
    if (isOpen && brief) {
      reset({
        title: brief?.title || "",
        product_id: brief?.product?.id?.toString() || "",
        objective_id: brief?.objective?.id?.toString() || "",
        about_target_audience: brief?.about_target_audience || "",
        about_hook: brief?.about_hook || "",
        go_live_on: brief?.go_live_on || new Date().toISOString(),
        status: brief?.status as BriefStatus || BriefStatus.Draft,
        userIds: brief?.users?.map(user => user?.id?.toString() || "").filter(Boolean) || [],
        tagIds: brief?.tags?.map(tag => tag?.id?.toString() || "").filter(Boolean) || [],
        assetIds: brief?.assets?.map(asset => asset?.id?.toString() || "").filter(Boolean) || [],
        relatedBriefIds: brief?.related_briefs?.map(brief => brief?.id?.toString() || "").filter(Boolean) || []
      });
      setAutoSaveStatus('idle');
    }
  }, [brief, isOpen, reset]);

  // Function to trigger form submission from outside the form
  const submitForm = () => {
    formRef.current?.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true })
    );
  };

  const onSubmitForm = async (data: BriefFormValues) => {
    try {
      setAutoSaveStatus('saving');
      
      const briefInput = convertFormDataToBriefInput({
        ...data,
        id: brief?.id?.toString(),
        createdAt: brief?.created_at || new Date().toISOString(),
        comments: [] // Don't include comments in the mutation
      });

      // Log the created input to help with debugging
      console.log('Brief input object:', briefInput);

      let result;
      if (brief?.id) {
        // Update existing brief
        try {
          result = await updateBrief({
            variables: {
              id: Number(brief.id),
              input: briefInput
            }
          });
          if (result.data?.updateBrief) {
            setAutoSaveStatus('saved');
            toast.success("Brief updated successfully");
            // Use type casting to handle the type mismatch
            onSuccess(result.data.updateBrief as Brief);
          } else {
            throw new Error("Failed to update brief");
          }
        } catch (updateError: any) {
          console.error("Update brief error:", updateError);

          // Handle specific constraint violation errors
          if (updateError.message.includes('asset_tags_tag_id_fkey')) {
            toast.error("One or more tags don't exist in the database. Please choose only from available tags.");
          } else if (updateError.message.includes('asset_tags')) {
            toast.error("Error with asset tags. Some tags may not exist in the database.");
          } else if (updateError.message.includes('foreign key constraint')) {
            toast.error("Relationship error: One of the selected items doesn't exist in the database.");
          } else if (updateError.message.includes('relationship')) {
            toast.error("Error with relationships. Try removing any assigned users, tags, assets, or related briefs and try again.");
          } else {
            throw new Error(`Failed to update brief: ${updateError.message}`);
          }
        }
      } else {
        // Create new brief
        try {
          // First attempt with all relationships
          result = await createBrief({
            variables: {
              input: briefInput
            }
          });
          if (result.data?.createBrief) {
            setAutoSaveStatus('saved');
            toast.success("Brief created successfully");
            // Use type casting to handle the type mismatch
            onSuccess(result.data.createBrief as Brief);
          } else {
            throw new Error("Failed to create brief");
          }
        } catch (createError: any) {
          console.error("Create brief error:", createError);
          
          // Handle specific constraint violation errors
          if (createError.message.includes('asset_tags_tag_id_fkey')) {
            toast.error("One or more tags don't exist in the database. Please choose only from available tags.");
            
            // Try creating without the problematic tags
            try {
              toast.info("Attempting to create brief without tags...");
              
              // Create a simplified input without tags
              const simpleInput = {
                ...briefInput,
                tagIds: undefined
              };
              
              const fallbackResult = await createBrief({
                variables: {
                  input: simpleInput
                }
              });
              
              if (fallbackResult.data?.createBrief) {
                setAutoSaveStatus('saved');
                toast.success("Brief created successfully (without tags)");
                onSuccess(fallbackResult.data.createBrief as Brief);
                return; // Exit early on success
              }
            } catch (fallbackError: any) {
              console.error("Fallback creation error:", fallbackError);
            }
          } else if (createError.message.includes('relationship')) {
            // If other relationship error, try creating without relationships
            try {
              toast.info("Attempting to create brief without relationships...");
              
              // Create a simplified input without relationships
              const simpleInput = {
                title: briefInput.title,
                product_id: briefInput.product_id,
                objective_id: briefInput.objective_id,
                about_target_audience: briefInput.about_target_audience,
                about_hook: briefInput.about_hook,
                go_live_on: briefInput.go_live_on,
                status: briefInput.status
              };
              
              const fallbackResult = await createBrief({
                variables: {
                  input: simpleInput
                }
              });
              
              if (fallbackResult.data?.createBrief) {
                setAutoSaveStatus('saved');
                toast.success("Brief created successfully (without relationships)");
                // Use type casting to handle the type mismatch
                onSuccess(fallbackResult.data.createBrief as Brief);
                return; // Exit early on success
              }
            } catch (fallbackError: any) {
              console.error("Fallback creation error:", fallbackError);
              throw new Error(`Failed to create brief: ${fallbackError.message}`);
            }
          }
          
          throw new Error(`Failed to create brief: ${createError.message}`);
        }
      }
      
      // Close modal after successful save
      handleClose();
    } catch (error: any) {
      console.error("Error saving brief:", error);
      setAutoSaveStatus('error');
      toast.error(`Failed to ${brief ? 'update' : 'create'} brief: ${error.message}`);
    }
  };

  const handleAssetSuccess = (newAsset: IAsset) => {
    // Convert IAsset to AssetDisplay type
    const assetToAdd: AssetDisplay = {
      id: newAsset.id,
      name: newAsset.name || '',
      description: newAsset.description || '',
      media_id: newAsset.media_id,
      thumbnail_media_id: newAsset.thumbnail_media_id,
      created_at: newAsset.created_at || new Date().toISOString(),
      type: newAsset.fileType.split('/')[0] || 'file',
      url: newAsset.url,
      size: 0,
      thumbnail: null,
      tags: newAsset.tags?.map(tag => tag.name) || []
    };
    
    setSelectedAssets(prev => [...prev, assetToAdd]);
    setAssetModalOpen(false);
    setSelectedAssetForModal(undefined);
    
    // Update form values
    setValue('assetIds', [...watch('assetIds'), newAsset.id.toString()], { shouldDirty: true });
  };

  const handleAssetEdit = (asset: AssetDisplay) => {
    // Convert AssetDisplay to IAsset type
    const assetForModal: IAsset = {
      id: asset.id,
      name: asset.name,
      description: asset.description || '',
      media_id: asset.media_id,
      thumbnail_media_id: asset.thumbnail_media_id,
      created_at: asset.created_at,
      url: asset.url,
      fileType: asset.type === 'image' ? 'image/jpeg' : 
                asset.type === 'video' ? 'video/mp4' : 
                'application/octet-stream', // Default MIME type
      tags: asset.tags.map(name => ({ id: 0, name }))  // We don't have tag IDs from the asset display
    };
    
    setSelectedAssetForModal(assetForModal);
    setAssetModalOpen(true);
    setIsPreviewOpen(false);
  };

  // Auto-save status indicator
  const AutoSaveIndicator = () => {
    if (autoSaveStatus === 'idle' || !brief?.id) return null;
    
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

  // Transform tags data for TokenizedSelect
  const tagOptions: TokenizedOption[] = dropDownData?.getTags?.map((tag) => ({
    value: String(tag?.id || ''),
    label: tag?.name || '',
  })) || [];

  // Transform objectives data for Select
  const objectiveOptions = dropDownData?.getObjectives?.filter((obj): obj is NonNullable<typeof obj> => obj !== null) || [];

  // Transform products data for Select
  const productOptions = dropDownData?.getProducts?.filter((prod): prod is NonNullable<typeof prod> => prod !== null) || [];

  // Cleanup on unmount or modal close
  useEffect(() => {
    // Cleanup function that will run when component unmounts or dependencies change
    return () => {
      // Reset everything when the component is unmounted or modal is closed
      if (!isOpen) {
        reset({
          title: "",
          product_id: "",
          objective_id: "",
          about_target_audience: "",
          about_hook: "",
          go_live_on: new Date().toISOString(),
          status: BriefStatus.Draft,
          userIds: [],
          tagIds: [],
          assetIds: [],
          relatedBriefIds: []
        });
        
        setAutoSaveStatus('idle');
        
        // Reset the form element directly
        if (formRef.current) {
          formRef.current.reset();
        }
      }
    };
  }, [isOpen, reset]);

  const handleAddComment = (text: string, mentionedUsers: any[] = []) => {
    const newComment = {
      id: Date.now().toString(),
      text,
      user: mockUsers[0],
      createdAt: new Date().toISOString()
    };
    // Handle comment addition logic here
  };

  // Function to preview an asset
  const handlePreviewAsset = (asset: AssetDisplay) => {
    setSelectedAssetForModal(undefined);
    setPreviewAssetId(asset.id);
    setIsPreviewOpen(true);
  };

  // Function to remove an asset from the brief
  const handleRemoveAsset = (assetId: number) => {
    // Update the form value
    const currentAssetIds = watch('assetIds');
    const filteredAssetIds = currentAssetIds.filter(id => id !== assetId.toString());
    setValue('assetIds', filteredAssetIds, { shouldDirty: true });
    
    // Update the UI state
    setSelectedAssets(prev => prev.filter(asset => asset.id !== assetId));
    
    toast.success("Asset removed from brief");
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle>{brief ? "Edit Brief" : "Create New Brief"}</DialogTitle>
            <AutoSaveIndicator />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(watch('status'))}>
                {watch('status')}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {brief?.created_at ? formatDate(brief.created_at) : 'Just now'}
              </span>
            </div>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Set status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(BriefStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </DialogHeader>

        {isLoading ? (
          <BriefDetailSkeleton />
        ) : (
          <form 
            ref={formRef}
            onSubmit={handleSubmit(onSubmitForm)} 
            className="space-y-6 py-2"
            id="brief-form"
          >
            {/* Title Section */}
            <div className="space-y-2">
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    id="title"
                    {...field}
                    placeholder="Brief title"
                    className={cn(
                      "text-lg font-medium h-12",
                      errors.title && "border-destructive"
                    )}
                  />
                )}
              />
              <FieldError error={errors.title?.message} />
            </div>

            {/* Main Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product">Product</Label>
                <Controller
                  name="product_id"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={cn(errors.product_id && "border-destructive")}>
                        <SelectValue placeholder="Select product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {productOptions.map((product) => (
                          <SelectItem key={product?.id} value={String(product?.id)}>
                            {product?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError error={errors.product_id?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="objective">Objective</Label>
                <Controller
                  name="objective_id"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={cn(errors.objective_id && "border-destructive")}>
                        <SelectValue placeholder="Select objective..." />
                      </SelectTrigger>
                      <SelectContent>
                        {objectiveOptions.map((objective) => (
                          <SelectItem key={objective.id} value={String(objective.id)}>
                            {objective.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError error={errors.objective_id?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="goLive">Go Live Date</Label>
                <Controller
                  name="go_live_on"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? formatDate(field.value) : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? date.toISOString() : new Date().toISOString())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label>Assigned To</Label>
                <Controller
                  name="userIds"
                  control={control}
                  render={({ field }) => (
                    <AssignToTokenizeInput
                      defaultValues={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            {/* Target Audience Section */}
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Tags:</span>
                  <Controller
                    name="tagIds"
                    control={control}
                    render={({ field }) => (
                      <TokenizedSelect
                        placeholder="Search tags..."
                        options={tagOptions}
                        value={field.value}
                        onChange={field.onChange}
                        searchPlaceholder="Search tags..."
                        multiSelect
                      />
                    )}
                  />
                </div>
              </div>
              <Controller
                name="about_target_audience"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="targetAudience"
                    {...field}
                    placeholder="Describe your target audience"
                    className="min-h-[80px]"
                  />
                )}
              />
            </div>

            {/* Hook/Angle Section */}
            <div className="space-y-2">
              <Label htmlFor="hookAngle">Hook/Angle</Label>
              <Controller
                name="about_hook"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="hookAngle"
                    {...field}
                    placeholder="Enter hook or angle for the brief"
                    className="min-h-[100px]"
                  />
                )}
              />
            </div>

            {/* Assets Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Assets</h3>
                </div>
              </div>

              <QuickAssetSelector
                selectedAssets={selectedAssets as any} // Type assertion for now
                onSelect={(assets: { 
                  id: number;
                  name: string;
                  description?: string;
                  type: string;
                  url: string;
                  size: number;
                  thumbnail?: string | null;
                  tags?: string[];
                }[]) => {
                  // Convert to our internal asset type
                  const typedAssets = assets.map(asset => ({
                    id: asset.id,
                    name: asset.name,
                    description: asset.description || '',
                    media_id: 0, // Not available from AssetDisplayType
                    created_at: '', // Not available from AssetDisplayType
                    type: asset.type,
                    url: asset.url,
                    size: asset.size,
                    thumbnail: asset.thumbnail || null,
                    tags: asset.tags || []
                  } as AssetDisplay));
                  
                  setSelectedAssets(typedAssets);
                  setValue('assetIds', assets.map(asset => asset.id.toString()), { shouldDirty: true });
                }}
                onAddNew={() => {
                  setSelectedAssetForModal(undefined)
                  setAssetModalOpen(true)
                }}
              />

              {/* Selected Assets Preview */}
              {selectedAssets.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                  {selectedAssets.map((asset) => (
                    <Card key={asset.id} className="overflow-hidden group relative">
                      <div
                        className="aspect-square relative bg-muted cursor-pointer"
                        onClick={() => handlePreviewAsset(asset)}
                      >
                        {asset.type === "image" ? (
                          <Image
                            src={asset.url || "/placeholder.svg"}
                            alt={asset.name}
                            fill
                            className="object-cover"
                          />
                        ) : asset.type === "video" ? (
                          <div className="w-full h-full relative">
                            <Image
                              src={asset.thumbnail || "/placeholder.svg?height=100&width=100&query=video thumbnail"}
                              alt={asset.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-8 w-8 rounded-full bg-black/60 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="white"
                                  className="w-4 h-4"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileIcon className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Add remove button overlay */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAsset(asset.id);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18" />
                              <path d="M6 6l12 12" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-2">
                        <div className="truncate text-xs font-medium">{asset.name}</div>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {asset.type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{formatFileSize(asset.size)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Related Briefs Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-medium">Related Briefs</h3>
              </div>
              <Controller
                name="relatedBriefIds"
                control={control}
                render={({ field }) => (
                  <BriefTokenizeInput
                    defaultValues={field.value}
                    onChange={field.onChange}
                    placeholder="Search briefs to link..."
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* Comments Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-medium">Comments</h3>
              </div>
              <Separator />
              <EnhancedCommentSection comments={brief?.comments || []} onAddComment={handleAddComment} />
            </div>
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {(brief?.id === undefined || autoSaveStatus === 'idle') && (
            <Button 
              onClick={submitForm}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                brief ? 'Update' : 'Create'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Asset Modal */}
      <AssetModal
        isOpen={assetModalOpen}
        onClose={() => {
          setAssetModalOpen(false);
          setSelectedAssetForModal(undefined);
        }}
        asset={selectedAssetForModal || null}
        onSave={async (asset) => {
          await handleAssetSuccess(asset);
          return Promise.resolve();
        }}
      />

      {/* Asset Preview Modal */}
      <AssetPreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        assetId={previewAssetId} 
        onEdit={handleAssetEdit}
      />
    </Dialog>
  )
}
