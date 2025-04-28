import { Brief, BriefStatus } from '../../types';
import { supabase } from '../../supabase';

interface BriefInput extends Omit<Brief, 'id' | 'created_at'> {
  userIds?: number[];
  tagIds?: number[];
  assetIds?: number[];
  relatedBriefIds?: number[];
}

export const briefMutations = {
  createBrief: async (_: any, { input }: { input: BriefInput }) => {
    try {
      // Validate required fields
      if (!input.title) {
        throw new Error('Title is required');
      }
      if (!input.product_id) {
        throw new Error('Product is required');
      }
      if (!input.objective_id) {
        throw new Error('Objective is required');
      }

      console.log('Creating brief with input:', JSON.stringify(input, null, 2));
      
      // 1. Create the brief
      const briefData = {
        title: input.title,
        description: input.description || '',
        go_live_on: input.go_live_on,
        about_target_audience: input.about_target_audience || '',
        about_hook: input.about_hook || '',
        product_id: input.product_id,
        objective_id: input.objective_id,
        status: input.status || BriefStatus.Draft
      };

      console.log('Creating brief with data:', JSON.stringify(briefData, null, 2));

      const { data: brief, error: briefError } = await supabase
        .from('briefs')
        .insert([briefData])
        .select()
        .single();

      if (briefError) {
        console.error('Error creating brief:', briefError);
        throw new Error(`Error creating brief: ${briefError.message || briefError.code || JSON.stringify(briefError)}`);
      }
      if (!brief) throw new Error('Failed to create brief: no data returned');

      console.log('Brief created successfully with ID:', brief.id);

      // 2. Assign users if provided
      if (input.userIds && input.userIds.length > 0) {
        console.log(`Attempting to assign ${input.userIds.length} users to brief ${brief.id}:`, input.userIds);
        
        // Validate that all user IDs are valid numbers
        const validUserIds = input.userIds.filter(id => typeof id === 'number' && id > 0);
        
        if (validUserIds.length === 0) {
          console.warn('No valid user IDs provided, skipping user assignment');
        } else {
          console.log(`Assigning ${validUserIds.length} valid users to brief ${brief.id}`);
          
          // First verify these users exist
          const { data: existingUsers, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .in('id', validUserIds);

          if (userCheckError) {
            console.error('Error checking user existence:', userCheckError);
            // Don't throw, just log the error and continue
            console.warn(`Skipping user assignment due to error: ${userCheckError.message}`);
          } else {
            // Get the list of users that actually exist
            const existingUserIds = existingUsers ? existingUsers.map(user => user.id) : [];
            
            if (existingUserIds.length === 0) {
              console.warn('None of the provided user IDs exist in the database, skipping user assignment');
            } else {
              // Create data only for existing users
              const userBriefsData = existingUserIds.map(userId => ({
                user_id: userId,
                brief_id: brief.id
              }));
              
              const { error: userBriefsError } = await supabase
                .from('briefs_users')
                .insert(userBriefsData);

              if (userBriefsError) {
                console.error('Error assigning users:', userBriefsError);
                // Don't throw, just log the error and continue
                console.warn(`User assignment failed: ${userBriefsError.message || userBriefsError.code || JSON.stringify(userBriefsError)}`);
              } else {
                console.log(`Successfully assigned ${existingUserIds.length} users to brief ${brief.id}`);
              }
            }
          }
        }
      }

      // 3. Assign tags if provided
      if (input.tagIds && input.tagIds.length > 0) {
        console.log(`Attempting to assign ${input.tagIds.length} tags to brief ${brief.id}:`, input.tagIds);
        
        // Validate that all tag IDs are valid numbers
        const validTagIds = input.tagIds.filter(id => typeof id === 'number' && id > 0);
        
        if (validTagIds.length === 0) {
          console.warn('No valid tag IDs provided, skipping tag assignment');
        } else {
          console.log(`Assigning ${validTagIds.length} valid tags to brief ${brief.id}`);
          
          // First verify these tags exist
          const { data: existingTags, error: tagCheckError } = await supabase
            .from('tags')
            .select('id')
            .in('id', validTagIds);

          if (tagCheckError) {
            console.error('Error checking tag existence:', tagCheckError);
            // Don't throw, just log the error and continue
            console.warn(`Skipping tag assignment due to error: ${tagCheckError.message}`);
          } else {
            // Get the list of tags that actually exist
            const existingTagIds = existingTags ? existingTags.map(tag => tag.id) : [];
            
            if (existingTagIds.length === 0) {
              console.warn('None of the provided tag IDs exist in the database, skipping tag assignment');
            } else {
              // Create data only for existing tags
              const briefTagsData = existingTagIds.map(tagId => ({
                tag_id: tagId,
                brief_id: brief.id
              }));
              
              const { error: briefTagsError } = await supabase
                .from('brief_tags')
                .insert(briefTagsData);

              if (briefTagsError) {
                console.error('Error assigning tags:', briefTagsError);
                // Don't throw, just log the error and continue
                console.warn(`Tag assignment failed: ${briefTagsError.message || briefTagsError.code || JSON.stringify(briefTagsError)}`);
              } else {
                console.log(`Successfully assigned ${existingTagIds.length} tags to brief ${brief.id}`);
              }
            }
          }
        }
      }

      // 4. Assign assets if provided
      if (input.assetIds && input.assetIds.length > 0) {
        console.log(`Attempting to assign ${input.assetIds.length} assets to brief ${brief.id}:`, input.assetIds);
        
        // Validate that all asset IDs are valid numbers
        const validAssetIds = input.assetIds.filter(id => typeof id === 'number' && id > 0);
        
        if (validAssetIds.length === 0) {
          console.warn('No valid asset IDs provided, skipping asset assignment');
        } else {
          console.log(`Assigning ${validAssetIds.length} valid assets to brief ${brief.id}`);
          
          // First verify these assets exist
          const { data: existingAssets, error: assetCheckError } = await supabase
            .from('assets')
            .select('id')
            .in('id', validAssetIds);

          if (assetCheckError) {
            console.error('Error checking asset existence:', assetCheckError);
            // Don't throw, just log the error and continue
            console.warn(`Skipping asset assignment due to error: ${assetCheckError.message}`);
          } else {
            // Get the list of assets that actually exist
            const existingAssetIds = existingAssets ? existingAssets.map(asset => asset.id) : [];
            
            if (existingAssetIds.length === 0) {
              console.warn('None of the provided asset IDs exist in the database, skipping asset assignment');
            } else {
              // Create data only for existing assets
              const briefAssetsData = existingAssetIds.map(assetId => ({
                asset_id: assetId,
                brief_id: brief.id
              }));
              
              const { error: briefAssetsError } = await supabase
                .from('brief_assets')
                .insert(briefAssetsData);

              if (briefAssetsError) {
                console.error('Error assigning assets:', briefAssetsError);
                // Don't throw, just log the error and continue
                console.warn(`Asset assignment failed: ${briefAssetsError.message || briefAssetsError.code || JSON.stringify(briefAssetsError)}`);
              } else {
                console.log(`Successfully assigned ${existingAssetIds.length} assets to brief ${brief.id}`);
              }
            }
          }
        }
      }

      // 5. Create related brief relationships if provided
      if (input.relatedBriefIds && input.relatedBriefIds.length > 0) {
        console.log(`Attempting to assign ${input.relatedBriefIds.length} related briefs to brief ${brief.id}:`, input.relatedBriefIds);
        
        // Validate that all related brief IDs are valid numbers and not the current brief
        const validRelatedIds = input.relatedBriefIds.filter(id => typeof id === 'number' && id > 0 && id !== brief.id);
        
        if (validRelatedIds.length === 0) {
          console.warn('No valid related brief IDs provided, skipping relationship creation');
        } else {
          console.log(`Assigning ${validRelatedIds.length} valid related briefs to brief ${brief.id}`);
          
          // First verify these briefs exist
          const { data: existingBriefs, error: briefCheckError } = await supabase
            .from('briefs')
            .select('id')
            .in('id', validRelatedIds);

          if (briefCheckError) {
            console.error('Error checking related brief existence:', briefCheckError);
            // Don't throw, just log the error and continue
            console.warn(`Skipping related brief assignment due to error: ${briefCheckError.message}`);
          } else {
            // Get the list of briefs that actually exist
            const existingBriefIds = existingBriefs ? existingBriefs.map(b => b.id) : [];
            
            if (existingBriefIds.length === 0) {
              console.warn('None of the provided related brief IDs exist in the database, skipping relationship creation');
            } else {
              // Create data only for existing related briefs
              const relatedBriefsData = existingBriefIds.map(relatedId => ({
                brief_id: brief.id,
                related_brief_id: relatedId
              }));
              
              const { error: relatedBriefsError } = await supabase
                .from('related_briefs')
                .insert(relatedBriefsData);

              if (relatedBriefsError) {
                console.error('Error assigning related briefs:', relatedBriefsError);
                // Don't throw, just log the error and continue
                console.warn(`Related brief assignment failed: ${relatedBriefsError.message || relatedBriefsError.code || JSON.stringify(relatedBriefsError)}`);
              } else {
                console.log(`Successfully assigned ${existingBriefIds.length} related briefs to brief ${brief.id}`);
              }
            }
          }
        }
      }

      // Return the created brief with all relationships
      try {
        // Use a simple query that just returns the brief without trying to fetch all relationships
        const { data: fullBrief, error: fullBriefError } = await supabase
          .from('briefs')
          .select('*')
          .eq('id', brief.id)
          .single();

        if (fullBriefError) {
          console.error('Error fetching created brief:', fullBriefError);
          // Return the basic brief if we can't get the full brief with relationships
          return brief;
        }
        
        return fullBrief;
      } catch (queryError) {
        console.error('Error in relationship query:', queryError);
        // Return the basic brief if we can't get the full brief with relationships
        return brief;
      }
    } catch (error) {
      console.error('Error in createBrief:', error);
      // Make sure we always return a proper error message
      if (error instanceof Error) {
        throw new Error(`Failed to create brief: ${error.message}`);
      } else {
        throw new Error(`Failed to create brief: ${JSON.stringify(error)}`);
      }
    }
  },

  updateBrief: async (_: any, { id, input }: { id: number, input: BriefInput }) => {
    try {
      // Validate required fields
      if (!id) {
        throw new Error('Brief ID is required');
      }
      if (!input.title) {
        throw new Error('Title is required');
      }
      if (!input.product_id) {
        throw new Error('Product is required');
      }
      if (!input.objective_id) {
        throw new Error('Objective is required');
      }

      console.log(`Updating brief ${id} with input:`, JSON.stringify(input, null, 2));

      // 1. Update the brief's basic information
      const briefData = {
        title: input.title,
        description: input.description || '',
        go_live_on: input.go_live_on,
        about_target_audience: input.about_target_audience || '',
        about_hook: input.about_hook || '',
        product_id: input.product_id,
        objective_id: input.objective_id,
        status: input.status
      };

      console.log(`Updating brief ${id} with data:`, JSON.stringify(briefData, null, 2));

      const { data: brief, error: briefError } = await supabase
        .from('briefs')
        .update(briefData)
        .eq('id', id)
        .select()
        .single();

      if (briefError) {
        console.error('Error updating brief:', briefError);
        throw new Error(`Error updating brief: ${briefError.message || briefError.code || JSON.stringify(briefError)}`);
      }
      if (!brief) throw new Error('Brief not found or could not be updated');

      console.log('Brief updated successfully');

      // 2. Update user assignments if provided
      if (input.userIds !== undefined) {
        try {
          // Delete existing assignments
          console.log(`Deleting existing user assignments for brief ${id}`);
          const { error: deleteUserError } = await supabase
            .from('briefs_users')
            .delete()
            .eq('brief_id', id);

          if (deleteUserError) {
            console.error('Error deleting user assignments:', deleteUserError);
            console.warn(`User assignment update failed. Continuing anyway. Error: ${deleteUserError.message}`);
          } else {
            // Add new assignments if there are any
            if (input.userIds && input.userIds.length > 0) {
              console.log(`Attempting to assign ${input.userIds.length} users to brief ${id}:`, input.userIds);
              
              // Validate that all user IDs are valid numbers
              const validUserIds = input.userIds.filter(id => typeof id === 'number' && id > 0);
              
              if (validUserIds.length === 0) {
                console.warn('No valid user IDs provided, skipping user assignment');
              } else {
                console.log(`Assigning ${validUserIds.length} valid users to brief ${id}`);
                
                // First verify these users exist
                const { data: existingUsers, error: userCheckError } = await supabase
                  .from('users')
                  .select('id')
                  .in('id', validUserIds);

                if (userCheckError) {
                  console.error('Error checking user existence:', userCheckError);
                  console.warn(`Skipping user assignment due to error: ${userCheckError.message}`);
                } else {
                  // Get the list of users that actually exist
                  const existingUserIds = existingUsers ? existingUsers.map(user => user.id) : [];
                  
                  if (existingUserIds.length === 0) {
                    console.warn('None of the provided user IDs exist in the database, skipping user assignment');
                  } else {
                    // Create data only for existing users
                    const userBriefsData = existingUserIds.map(userId => ({
                      user_id: userId,
                      brief_id: id
                    }));
                    
                    const { error: userBriefsError } = await supabase
                      .from('briefs_users')
                      .insert(userBriefsData);

                    if (userBriefsError) {
                      console.error('Error adding user assignments:', userBriefsError);
                      console.warn(`User assignment failed: ${userBriefsError.message || userBriefsError.code || JSON.stringify(userBriefsError)}`);
                    } else {
                      console.log(`Successfully assigned ${existingUserIds.length} users to brief ${id}`);
                    }
                  }
                }
              }
            } else {
              console.log(`No users to assign to brief ${id}`);
            }
          }
        } catch (userAssignmentError) {
          console.error('Error handling user assignments:', userAssignmentError);
          // Continue with other operations
        }
      }

      // 3. Update tag assignments if provided
      if (input.tagIds !== undefined) {
        try {
          // Delete existing assignments
          console.log(`Deleting existing tag assignments for brief ${id}`);
          const { error: deleteTagError } = await supabase
            .from('brief_tags')
            .delete()
            .eq('brief_id', id);

          if (deleteTagError) {
            console.error('Error deleting tag assignments:', deleteTagError);
            console.warn(`Tag assignment update failed. Continuing anyway. Error: ${deleteTagError.message}`);
          } else {
            // Add new assignments if there are any
            if (input.tagIds && input.tagIds.length > 0) {
              console.log(`Attempting to assign ${input.tagIds.length} tags to brief ${id}:`, input.tagIds);
              
              // Validate that all tag IDs are valid numbers
              const validTagIds = input.tagIds.filter(id => typeof id === 'number' && id > 0);
              
              if (validTagIds.length === 0) {
                console.warn('No valid tag IDs provided, skipping tag assignment');
              } else {
                console.log(`Assigning ${validTagIds.length} valid tags to brief ${id}`);
                
                // First verify these tags exist
                const { data: existingTags, error: tagCheckError } = await supabase
                  .from('tags')
                  .select('id')
                  .in('id', validTagIds);

                if (tagCheckError) {
                  console.error('Error checking tag existence:', tagCheckError);
                  console.warn(`Skipping tag assignment due to error: ${tagCheckError.message}`);
                } else {
                  // Get the list of tags that actually exist
                  const existingTagIds = existingTags ? existingTags.map(tag => tag.id) : [];
                  
                  if (existingTagIds.length === 0) {
                    console.warn('None of the provided tag IDs exist in the database, skipping tag assignment');
                  } else {
                    // Create data only for existing tags
                    const briefTagsData = existingTagIds.map(tagId => ({
                      tag_id: tagId,
                      brief_id: id
                    }));
                    
                    const { error: briefTagsError } = await supabase
                      .from('brief_tags')
                      .insert(briefTagsData);

                    if (briefTagsError) {
                      console.error('Error assigning tags:', briefTagsError);
                      // Don't throw, just log the error and continue
                      console.warn(`Tag assignment failed: ${briefTagsError.message || briefTagsError.code || JSON.stringify(briefTagsError)}`);
                    } else {
                      console.log(`Successfully assigned ${existingTagIds.length} tags to brief ${id}`);
                    }
                  }
                }
              }
            } else {
              console.log(`No tags to assign to brief ${id}`);
            }
          }
        } catch (tagAssignmentError) {
          console.error('Error handling tag assignments:', tagAssignmentError);
          // Continue with other operations
        }
      }

      // 4. Update asset assignments if provided
      if (input.assetIds !== undefined) {
        try {
          // Delete existing assignments
          console.log(`Deleting existing asset assignments for brief ${id}`);
          const { error: deleteAssetError } = await supabase
            .from('brief_assets')
            .delete()
            .eq('brief_id', id);

          if (deleteAssetError) {
            console.error('Error deleting asset assignments:', deleteAssetError);
            console.warn(`Asset assignment update failed. Continuing anyway. Error: ${deleteAssetError.message}`);
          } else {
            // Add new assignments if there are any
            if (input.assetIds && input.assetIds.length > 0) {
              console.log(`Attempting to assign ${input.assetIds.length} assets to brief ${id}:`, input.assetIds);
              
              // Validate that all asset IDs are valid numbers
              const validAssetIds = input.assetIds.filter(id => typeof id === 'number' && id > 0);
              
              if (validAssetIds.length === 0) {
                console.warn('No valid asset IDs provided, skipping asset assignment');
              } else {
                console.log(`Assigning ${validAssetIds.length} valid assets to brief ${id}`);
                
                // First verify these assets exist
                const { data: existingAssets, error: assetCheckError } = await supabase
                  .from('assets')
                  .select('id')
                  .in('id', validAssetIds);

                if (assetCheckError) {
                  console.error('Error checking asset existence:', assetCheckError);
                  console.warn(`Skipping asset assignment due to error: ${assetCheckError.message}`);
                } else {
                  // Get the list of assets that actually exist
                  const existingAssetIds = existingAssets ? existingAssets.map(asset => asset.id) : [];
                  
                  if (existingAssetIds.length === 0) {
                    console.warn('None of the provided asset IDs exist in the database, skipping asset assignment');
                  } else {
                    // Create data only for existing assets
                    const briefAssetsData = existingAssetIds.map(assetId => ({
                      asset_id: assetId,
                      brief_id: id
                    }));
                    
                    const { error: briefAssetsError } = await supabase
                      .from('brief_assets')
                      .insert(briefAssetsData);

                    if (briefAssetsError) {
                      console.error('Error assigning assets:', briefAssetsError);
                      // Don't throw, just log the error and continue
                      console.warn(`Asset assignment failed: ${briefAssetsError.message || briefAssetsError.code || JSON.stringify(briefAssetsError)}`);
                    } else {
                      console.log(`Successfully assigned ${existingAssetIds.length} assets to brief ${id}`);
                    }
                  }
                }
              }
            } else {
              console.log(`No assets to assign to brief ${id}`);
            }
          }
        } catch (assetAssignmentError) {
          console.error('Error handling asset assignments:', assetAssignmentError);
          // Continue with other operations
        }
      }

      // 5. Update related brief relationships if provided
      if (input.relatedBriefIds !== undefined) {
        try {
          // Delete existing relationships
          console.log(`Deleting existing related brief relationships for brief ${id}`);
          const { error: deleteRelatedError } = await supabase
            .from('related_briefs')
            .delete()
            .eq('brief_id', id);

          if (deleteRelatedError) {
            console.error('Error deleting related brief relationships:', deleteRelatedError);
            console.warn(`Related brief relationship update failed. Continuing anyway. Error: ${deleteRelatedError.message}`);
          } else {
            // Add new relationships if there are any
            if (input.relatedBriefIds && input.relatedBriefIds.length > 0) {
              console.log(`Attempting to assign ${input.relatedBriefIds.length} related briefs to brief ${id}:`, input.relatedBriefIds);
              
              // Validate that all related brief IDs are valid numbers and not the current brief
              const validRelatedIds = input.relatedBriefIds.filter(relId => typeof relId === 'number' && relId > 0 && relId !== id);
              
              if (validRelatedIds.length === 0) {
                console.warn('No valid related brief IDs provided, skipping relationship creation');
              } else {
                console.log(`Assigning ${validRelatedIds.length} valid related briefs to brief ${id}`);
                
                // First verify these briefs exist
                const { data: existingBriefs, error: briefCheckError } = await supabase
                  .from('briefs')
                  .select('id')
                  .in('id', validRelatedIds);

                if (briefCheckError) {
                  console.error('Error checking related brief existence:', briefCheckError);
                  console.warn(`Skipping related brief assignment due to error: ${briefCheckError.message}`);
                } else {
                  // Get the list of briefs that actually exist
                  const existingBriefIds = existingBriefs ? existingBriefs.map(b => b.id) : [];
                  
                  if (existingBriefIds.length === 0) {
                    console.warn('None of the provided related brief IDs exist in the database, skipping relationship creation');
                  } else {
                    // Create data only for existing related briefs
                    const relatedBriefsData = existingBriefIds.map(relatedId => ({
                      brief_id: id,
                      related_brief_id: relatedId
                    }));
                    
                    const { error: relatedBriefsError } = await supabase
                      .from('related_briefs')
                      .insert(relatedBriefsData);

                    if (relatedBriefsError) {
                      console.error('Error assigning related briefs:', relatedBriefsError);
                      // Don't throw, just log the error and continue
                      console.warn(`Related brief assignment failed: ${relatedBriefsError.message || relatedBriefsError.code || JSON.stringify(relatedBriefsError)}`);
                    } else {
                      console.log(`Successfully assigned ${existingBriefIds.length} related briefs to brief ${id}`);
                    }
                  }
                }
              }
            } else {
              console.log(`No related briefs to assign to brief ${id}`);
            }
          }
        } catch (briefRelationshipError) {
          console.error('Error handling brief relationships:', briefRelationshipError);
          // Continue with other operations
        }
      }

      // Return the updated brief with all relationships
      try {
        // Use a simple query that just returns the brief without trying to fetch all relationships
        const { data: fullBrief, error: fullBriefError } = await supabase
          .from('briefs')
          .select('*')
          .eq('id', id)
          .single();

        if (fullBriefError) {
          console.error('Error fetching updated brief:', fullBriefError);
          // Return the basic brief if we can't get the full brief with relationships
          return brief;
        }
        
        return fullBrief;
      } catch (queryError) {
        console.error('Error in relationship query:', queryError);
        // Return the basic brief if we can't get the full brief with relationships
        return brief;
      }
    } catch (error) {
      console.error('Error in updateBrief:', error);
      // Make sure we always return a proper error message
      if (error instanceof Error) {
        throw new Error(`Failed to update brief: ${error.message}`);
      } else {
        throw new Error(`Failed to update brief: ${JSON.stringify(error)}`);
      }
    }
  },

  deleteBrief: async (_: any, { id }: { id: number }) => {
    try {
      if (!id) {
        throw new Error('Brief ID is required');
      }
      
      console.log(`Attempting to delete brief ${id}`);
      
      let anyErrors = false;
      let errorMessages = [];
      
      // Delete all relationships first - continue even if some fail
      try {
        console.log(`Deleting user assignments for brief ${id}`);
        const { error: userBriefsError } = await supabase
          .from('briefs_users')
          .delete()
          .eq('brief_id', id);
          
        if (userBriefsError) {
          console.error('Error deleting user assignments:', userBriefsError);
          anyErrors = true;
          errorMessages.push(`Error deleting user assignments: ${userBriefsError.message}`);
        }
      } catch (error) {
        console.error('Exception deleting user assignments:', error);
        anyErrors = true;
        errorMessages.push(`Exception deleting user assignments: ${error.message || JSON.stringify(error)}`);
      }

      try {
        console.log(`Deleting tag assignments for brief ${id}`);
        const { error: briefTagsError } = await supabase
          .from('brief_tags')
          .delete()
          .eq('brief_id', id);
          
        if (briefTagsError) {
          console.error('Error deleting tag assignments:', briefTagsError);
          anyErrors = true;
          errorMessages.push(`Error deleting tag assignments: ${briefTagsError.message}`);
        }
      } catch (error) {
        console.error('Exception deleting tag assignments:', error);
        anyErrors = true;
        errorMessages.push(`Exception deleting tag assignments: ${error.message || JSON.stringify(error)}`);
      }

      try {
        console.log(`Deleting asset assignments for brief ${id}`);
        const { error: briefAssetsError } = await supabase
          .from('brief_assets')
          .delete()
          .eq('brief_id', id);
          
        if (briefAssetsError) {
          console.error('Error deleting asset assignments:', briefAssetsError);
          anyErrors = true;
          errorMessages.push(`Error deleting asset assignments: ${briefAssetsError.message}`);
        }
      } catch (error) {
        console.error('Exception deleting asset assignments:', error);
        anyErrors = true;
        errorMessages.push(`Exception deleting asset assignments: ${error.message || JSON.stringify(error)}`);
      }

      try {
        console.log(`Deleting related brief relationships for brief ${id}`);
        const { error: relatedBriefsError } = await supabase
          .from('related_briefs')
          .delete()
          .eq('brief_id', id);
          
        if (relatedBriefsError) {
          console.error('Error deleting related brief relationships:', relatedBriefsError);
          anyErrors = true;
          errorMessages.push(`Error deleting related brief relationships: ${relatedBriefsError.message}`);
        }
      } catch (error) {
        console.error('Exception deleting related brief relationships:', error);
        anyErrors = true;
        errorMessages.push(`Exception deleting related brief relationships: ${error.message || JSON.stringify(error)}`);
      }

      // Check if we can continue with deleting the brief itself
      if (anyErrors) {
        console.warn(`Encountered errors while deleting brief relationships, but continuing with brief deletion: ${errorMessages.join('; ')}`);
      }

      // Finally delete the brief
      try {
        console.log(`Deleting brief ${id}`);
        const { error: briefError } = await supabase
          .from('briefs')
          .delete()
          .eq('id', id);
          
        if (briefError) {
          console.error('Error deleting brief:', briefError);
          throw new Error(`Error deleting brief: ${briefError.message || briefError.code || JSON.stringify(briefError)}`);
        }
        
        console.log(`Brief ${id} deleted successfully`);
        return true;
      } catch (error) {
        console.error('Exception deleting brief:', error);
        throw new Error(`Failed to delete brief: ${error.message || JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('Error in deleteBrief:', error);
      // Make sure we always return a proper error message
      if (error instanceof Error) {
        throw new Error(`Failed to delete brief: ${error.message}`);
      } else {
        throw new Error(`Failed to delete brief: ${JSON.stringify(error)}`);
      }
    }
  },

  safeUpdateBrief: async (_: any, { id, input }: { id: number, input: Omit<BriefInput, 'userIds' | 'tagIds' | 'assetIds' | 'relatedBriefIds'> }) => {
    try {
      if (!id) {
        throw new Error('Brief ID is required');
      }
      
      console.log(`Safe updating brief ${id} with input:`, JSON.stringify(input, null, 2));
      
      // Sanitize the input data to prevent null/undefined fields
      const sanitizedInput = Object.entries(input).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = typeof value === 'string' ? value.trim() : value;
        }
        return acc;
      }, {} as any);
      
      console.log(`Sanitized input for safe update:`, JSON.stringify(sanitizedInput, null, 2));
      
      const { data, error } = await supabase
        .from('briefs')
        .update(sanitizedInput)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error in safeUpdateBrief:', error);
        throw new Error(`Failed to update brief: ${error.message || error.code || JSON.stringify(error)}`);
      }
      
      if (!data) {
        throw new Error('Brief not found or could not be updated');
      }
      
      console.log(`Brief ${id} safely updated successfully`);
      return data;
    } catch (error) {
      console.error('Error in safeUpdateBrief:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to safely update brief: ${error.message}`);
      } else {
        throw new Error(`Failed to safely update brief: ${JSON.stringify(error)}`);
      }
    }
  }
}; 