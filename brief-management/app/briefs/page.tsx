import type { Metadata } from "next"
import BriefList from "@/components/brief-list"
import DashboardLayout from "@/components/dashboard-layout"

export const metadata: Metadata = {
  title: "Brief Management",
  description: "Manage your creative briefs efficiently",
}

export default function BriefsPage() {
  return (
    <DashboardLayout>
      <BriefList />
    </DashboardLayout>
  )
}
