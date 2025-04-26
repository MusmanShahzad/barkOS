import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/ui/chart"

export const metadata: Metadata = {
  title: "Analytics Dashboard",
  description: "View analytics for your briefs and assets",
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="briefs">Briefs</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Briefs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Briefs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">+18% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Brief Status Distribution</CardTitle>
                <CardDescription>Distribution of briefs by status</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={[
                    { name: "Draft", value: 12 },
                    { name: "Review", value: 8 },
                    { name: "Approved", value: 5 },
                  ]}
                  index="name"
                  categories={["value"]}
                  valueFormatter={(value) => `${value} briefs`}
                  colors={["#FCD34D", "#60A5FA", "#34D399"]}
                  className="aspect-square"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brief Creation Trend</CardTitle>
                <CardDescription>Number of briefs created over time</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={[
                    { month: "Jan", briefs: 4 },
                    { month: "Feb", briefs: 6 },
                    { month: "Mar", briefs: 8 },
                    { month: "Apr", briefs: 5 },
                    { month: "May", briefs: 12 },
                    { month: "Jun", briefs: 10 },
                  ]}
                  index="month"
                  categories={["briefs"]}
                  colors={["#3B82F6"]}
                  valueFormatter={(value) => `${value} briefs`}
                  className="aspect-square"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="briefs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Briefs by Product Type</CardTitle>
              <CardDescription>Distribution of briefs across different product types</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={[
                  { product: "Website Redesign", count: 5 },
                  { product: "Mobile App", count: 7 },
                  { product: "Marketing Campaign", count: 10 },
                  { product: "Social Media", count: 8 },
                  { product: "Email Newsletter", count: 4 },
                  { product: "Product Launch", count: 6 },
                ]}
                index="product"
                categories={["count"]}
                colors={["#3B82F6"]}
                valueFormatter={(value) => `${value} briefs`}
                className="aspect-[2/1]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assets by Type</CardTitle>
              <CardDescription>Distribution of assets by file type</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart
                data={[
                  { type: "Image", count: 85 },
                  { type: "Document", count: 32 },
                  { type: "Video", count: 18 },
                  { type: "Audio", count: 7 },
                ]}
                index="type"
                categories={["count"]}
                valueFormatter={(value) => `${value} assets`}
                colors={["#3B82F6", "#F97316", "#8B5CF6", "#10B981"]}
                className="aspect-square"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
