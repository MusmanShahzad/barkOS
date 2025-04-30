import { Metadata } from "next"
import UserDetailView from "@/components/user-detail-view"

export const metadata: Metadata = {
  title: "User Details",
  description: "View and edit user details",
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  return <UserDetailView userId={parseInt(params.id, 10)} />
}
