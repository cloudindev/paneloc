import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { getProjectsFromDB } from "@/app/actions/projects"
import { cookies } from "next/headers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch global workspace context for the UI Layout (Navbar Swither & Sidebar)
  const projects = await getProjectsFromDB()

  // Find organization name (taking the first organization of the first project for now, or default)
  const organizationName = projects.length > 0 && projects[0].organization ? projects[0].organization.name : "Personal"

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar projects={projects} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar projects={projects} organization={organizationName} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/20">
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
