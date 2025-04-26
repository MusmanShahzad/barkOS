import type { Metadata } from "next"
import UserDetail from "@/components/user-detail"

export const metadata: Metadata = {
  title: "User Details",
  description: "View and edit user details",
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  return <UserDetail userId={params.id} />
}
