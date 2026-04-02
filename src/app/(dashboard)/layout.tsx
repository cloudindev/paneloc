import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { getDashboardContext } from "@/app/actions/projects"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch global workspace context for the UI Layout (Navbar Swither & Sidebar)
  const { organizationName, resources } = await getDashboardContext()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar projects={resources} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar projects={resources} organization={organizationName} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#FAFAFA]">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
/**
 * OLA CLOUD - Dashboard Shell Layout
 * Fetches root user data (Projects, Organizations) and passes hydration props down 
 * to Sidebar and Navbar to achieve a blazing-fast context-aware Shell UI.
 */
