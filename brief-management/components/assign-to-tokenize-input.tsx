import { useGetUsersQuery } from "@/src/graphql/generated/graphql";
import { TokenizedSelect } from "./tokenized-select"
import { useState, useCallback } from 'react'

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
}

export const AssignToTokenizeInput = ({
  defaultValues,
  onChange,
}: IAssignToTokenizeInput) => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

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
      updateQuery: (prev: GetUsersQuery, { fetchMoreResult }) => {
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
  }, [page, fetchMore])

  const userOptions = data?.getUsers?.users?.filter((user): user is NonNullable<typeof user> => user !== null)
    .map((user) => ({
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
    })) || []

  return (
    <TokenizedSelect
      placeholder="Assign users..."
      options={userOptions}
      value={defaultValues}
      onChange={(value) => onChange(Array.isArray(value) ? value : [value])}
      searchPlaceholder="Search users..."
      multiSelect
      onSearch={handleSearch}
      onLoadMore={handleLoadMore}
      isLoading={loading}
      hasMore={data?.getUsers?.hasNextPage || false}
      virtualized
      loadingContent={<LoadingUserSkeleton />}
    />
  )
}