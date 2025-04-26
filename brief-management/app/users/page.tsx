import type { Metadata } from "next"
import UserList from "@/components/user-list"

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage users in the brief management system",
}

export default function UsersPage() {
  return <UserList />
}
