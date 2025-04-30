import { useGetUsersQuery } from "@/src/graphql/generated/graphql";
import { TokenizedSelect } from "./tokenized-select"
import { useState, useCallback, useEffect } from 'react'

const LoadingUserSkeleton = () => (
  <div className="flex items-center gap-2 p-2 animate-pulse">
    <div className="h-5 w-5 rounded-full bg-muted" />
    <div className="h-4 w-32 bg-muted rounded" />
  </div>
)

const LoadingContent = () => (
  <div className="py-2">
    <LoadingUserSkeleton />
    <LoadingUserSkeleton />
    <LoadingUserSkeleton />
  </div>
)

export interface IAssignToTokenizeInput {
  defaultValues: string | string[];
  onChange: (changedValue: string[]) => void
  initialTokens?: Array<{id: number, full_name?: string, email?: string, profile_image?: string}>;
}

export const AssignToTokenizeInput = ({
  defaultValues,
  onChange,
  initialTokens = [],
}: IAssignToTokenizeInput) => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 200
  const [mergedUserOptions, setMergedUserOptions] = useState<any[]>([])

  const { data, loading, fetchMore } = useGetUsersQuery({
    variables: {
      filters: {
        search,
      },
      pagination: {
        page,
        pageSize: PAGE_SIZE,
      },
      sort: {
        field: "FULL_NAME",
        order: "ASC",
      }
    },
    fetchPolicy: 'network-only'
  });

  useEffect(() => {
    if (data?.getUsers?.users) {
      const apiUsers = data.getUsers.users.filter((user): user is NonNullable<typeof user> => user !== null);
      
      // Convert API users to options format
      const apiUserOptions = apiUsers.map((user) => ({
        value: String(user.id),
        label: user.full_name || user.email || 'Unnamed User',
        icon: (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full overflow-hidden bg-muted">
            <img
              src={user.profile_image || "/placeholder.svg"}
              alt={user.full_name || user.email || 'Unnamed User'}
              className="h-full w-full object-cover"
            />
          </span>
        ),
        user, // Keep the full user object for reference
      }));
      
      // If we have initialTokens, process them
      if (initialTokens && initialTokens.length > 0) {
        // Create a set of user IDs from API results for fast lookup
        const apiUserIds = new Set(apiUsers.map(user => String(user.id)));
        
        // Filter initialTokens to only include those not already in API results
        const missingUsers = initialTokens.filter(user => !apiUserIds.has(String(user.id)));
        
        // Convert missing users to options format
        const missingUserOptions = missingUsers.map(user => ({
          value: String(user.id),
          label: user.full_name || user.email || `User ${user.id}`,
          icon: (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full overflow-hidden bg-muted">
              <img
                src={user.profile_image || "/placeholder.svg"}
                alt={user.full_name || user.email || `User ${user.id}`}
                className="h-full w-full object-cover"
              />
            </span>
          ),
          user, // Keep the full user object for reference
        }));
        
        // Merge API users with missing initialToken users
        setMergedUserOptions([...apiUserOptions, ...missingUserOptions]);
      } else {
        // No initialTokens, just use API results
        setMergedUserOptions(apiUserOptions);
      }
    }
  }, [data?.getUsers?.users, initialTokens]);

  const handleSearch = useCallback(async (query: string) => {
    setSearch(query)
    setPage(1)
  }, [])

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1
    await fetchMore({
      variables: {
        pagination: {
          page: nextPage,
          pageSize: PAGE_SIZE,
        }
      },
      updateQuery: (prev: any, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev
        return {
          ...fetchMoreResult,
          getUsers: {
            ...fetchMoreResult.getUsers,
            users: [
              ...(prev.getUsers?.users || []),
              ...(fetchMoreResult.getUsers?.users || [])
            ]
          }
        }
      }
    })
    setPage(nextPage)
  }, [page, fetchMore]);

  return (
    <TokenizedSelect
      placeholder="Assign users..."
      options={mergedUserOptions}
      value={defaultValues}
      onChange={(value) => onChange(Array.isArray(value) ? value : [value])}
      searchPlaceholder="Search users..."
      multiSelect
      onSearch={handleSearch}
      onLoadMore={handleLoadMore}
      isLoading={loading && mergedUserOptions.length === 0}
      hasMore={data?.getUsers?.hasNextPage || false}
      virtualized
      loadingContent={<LoadingUserSkeleton />}
    />
  )
}