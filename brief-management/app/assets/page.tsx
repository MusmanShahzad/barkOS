import AssetList from "@/components/asset-list"

export default function AssetsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Assets</h1>
      </div>
      <AssetList />
    </div>
  )
}
