import { supabase } from '../../supabase';

interface AssetInput {
  media_id: number;
  name?: string;
  description?: string;
  thumbnail_media_id?: number;
  tagIds?: number[];
  commentIds?: number[];
  relatedBriefIds?: number[];
}

export const assetMutations = {
  createAsset: async (_: any, { input }: { input: AssetInput }) => {
    try {
      // Start a Supabase transaction
      await supabase.rpc('begin_transaction');

      try {
        // Check if the media is a video and generate thumbnail if needed
        const { data: _, error: mediaError } = await supabase
          .from('media')
          .select('url, file_type')
          .eq('id', input.media_id)
          .single();

        if (mediaError) throw mediaError;

        let thumbnailMediaId = input.thumbnail_media_id;
        

        // 1. Create the asset
        const assetData = {
          media_id: input.media_id,
          name: input.name,
          description: input.description,
          thumbnail_media_id: thumbnailMediaId
        };

        const { data: asset, error: assetError } = await supabase
          .from('assets')
          .insert([assetData])
          .select()
          .single();

        if (assetError) throw assetError;
        if (!asset) throw new Error('Failed to create asset');

        // 2. Assign tags if provided
        if (input.tagIds && input.tagIds.length > 0) {
          const assetTagsData = input.tagIds.map(tagId => ({
            tag_id: tagId,
            asset_id: asset.id
          }));

          const { error: assetTagsError } = await supabase
            .from('asset_tags')
            .insert(assetTagsData);

          if (assetTagsError) throw assetTagsError;
        }

        // 3. Assign to briefs if provided
        if (input.relatedBriefIds && input.relatedBriefIds.length > 0) {
          const briefAssetData = input.relatedBriefIds
            .filter(id => id && typeof id === 'number') // Filter out invalid IDs
            .map(briefId => ({
              brief_id: briefId,
              asset_id: asset.id
            }));

          if (briefAssetData.length > 0) {
            const { error: briefAssetError } = await supabase
              .from('brief_assets')
              .insert(briefAssetData);

            if (briefAssetError) {
              console.error('Error adding brief relationships:', briefAssetError, briefAssetData);
              throw briefAssetError;
            }
          }
        }

        // Commit transaction
        await supabase.rpc('commit_transaction');

        // Return the created asset with all relationships
        const { data: fullAsset, error: fullAssetError } = await supabase
          .from('assets')
          .select(`
            *,
            media:media_id(*),
            thumbnail:thumbnail_media_id(*),
            comments:asset_comments(comment:comments(*)),
            tags:asset_tags(tag:tags(*)),
            briefs:brief_assets(brief:briefs(*))
          `)
          .eq('id', asset.id)
          .single();

        if (fullAssetError) throw fullAssetError;
        return fullAsset;

      } catch (error) {
        // Rollback transaction on error
        await supabase.rpc('rollback_transaction');
        throw error;
      }
    } catch (error) {
      console.error('Error in createAsset:', error);
      throw new Error(`Failed to create asset: ${error.message}`);
    }
  },

  updateAsset: async (_: any, { id, input }: { id: number, input: AssetInput }) => {
    try {
      // Start a Supabase transaction
      await supabase.rpc('begin_transaction');

      try {
        // Check if the media is a video and generate thumbnail if needed
        const { data: _, error: mediaError } = await supabase
          .from('media')
          .select('url, file_type')
          .eq('id', input.media_id)
          .single();

        if (mediaError) throw mediaError;

        let thumbnailMediaId = input.thumbnail_media_id;
        
        // 1. Update the asset's basic information
        const assetData = {
          media_id: input.media_id,
          name: input.name,
          description: input.description,
          thumbnail_media_id: thumbnailMediaId
        };

        const { data: asset, error: assetError } = await supabase
          .from('assets')
          .update(assetData)
          .eq('id', id)
          .select()
          .single();

        if (assetError) throw assetError;
        if (!asset) throw new Error('Asset not found');

        // 2. Update tag assignments if provided
        if (input.tagIds !== undefined) {
          // Delete existing assignments
          const { error: deleteTagError } = await supabase
            .from('asset_tags')
            .delete()
            .eq('asset_id', id);

          if (deleteTagError) throw deleteTagError;

          // Add new assignments
          if (input.tagIds.length > 0) {
            const assetTagsData = input.tagIds.map(tagId => ({
              tag_id: tagId,
              asset_id: id
            }));

            const { error: assetTagsError } = await supabase
              .from('asset_tags')
              .insert(assetTagsData);

            if (assetTagsError) throw assetTagsError;
          }
        }

        // 3. Update brief assignments if provided
        if (input.relatedBriefIds !== undefined) {
          // Delete existing brief-asset relationships
          const { error: deleteBriefAssetError } = await supabase
            .from('brief_assets')
            .delete()
            .eq('asset_id', id);

          if (deleteBriefAssetError) throw deleteBriefAssetError;

          // Add new brief-asset relationships
          if (input.relatedBriefIds.length > 0) {
            const briefAssetData = input.relatedBriefIds
              .filter(id => id && typeof id === 'number') // Filter out invalid IDs
              .map(briefId => ({
                brief_id: briefId,
                asset_id: id
              }));

            if (briefAssetData.length > 0) {
              const { error: briefAssetError } = await supabase
                .from('brief_assets')
                .insert(briefAssetData);

              if (briefAssetError) {
                console.error('Error updating brief relationships:', briefAssetError, briefAssetData);
                throw briefAssetError;
              }
            }
          }
        }

        // Commit transaction
        await supabase.rpc('commit_transaction');

        // Return the updated asset with all relationships
        const { data: fullAsset, error: fullAssetError } = await supabase
          .from('assets')
          .select(`
            *,
            media:media_id(*),
            thumbnail:thumbnail_media_id(*),
            comments:asset_comments(comment:comments(*)),
            tags:asset_tags(tag:tags(*)),
            briefs:brief_assets(brief:briefs(*))
          `)
          .eq('id', id)
          .single();

        if (fullAssetError) throw fullAssetError;
        return fullAsset;

      } catch (error) {
        // Rollback transaction on error
        await supabase.rpc('rollback_transaction');
        throw error;
      }
    } catch (error) {
      console.error('Error in updateAsset:', error);
      throw new Error(`Failed to update asset: ${error.message}`);
    }
  },

  deleteAsset: async (_: any, { id }: { id: number }) => {
    try {
      // Start a Supabase transaction
      await supabase.rpc('begin_transaction');

      try {
        // Delete all relationships first
        const { error: assetCommentsError } = await supabase
          .from('asset_comments')
          .delete()
          .eq('asset_id', id);
        if (assetCommentsError) throw assetCommentsError;

        const { error: assetTagsError } = await supabase
          .from('asset_tags')
          .delete()
          .eq('asset_id', id);
        if (assetTagsError) throw assetTagsError;

        const { error: briefAssetsError } = await supabase
          .from('brief_assets')
          .delete()
          .eq('asset_id', id);
        if (briefAssetsError) throw briefAssetsError;

        // Delete the asset
        const { error: assetError } = await supabase
          .from('assets')
          .delete()
          .eq('id', id);
        if (assetError) throw assetError;

        // Commit transaction
        await supabase.rpc('commit_transaction');
        return true;

      } catch (error) {
        // Rollback transaction on error
        await supabase.rpc('rollback_transaction');
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteAsset:', error);
      throw new Error(`Failed to delete asset: ${error.message}`);
    }
  }
};