import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { checkGithubConnection, getGithubRepositories } from "@/app/actions/github"
import { DeploymentWizard } from "./deployment-wizard"

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ github_connected?: string, error?: string }> }) {
  const { isConnected } = await checkGithubConnection()
  
  // En Next.js 15, searchParams es una promesa, hay que resolverlo.
  const resolvedParams = await searchParams
  const errorMsg = resolvedParams.error
  const successMsg = resolvedParams.github_connected === "true" ? "Cuenta de GitHub conectada con éxito." : null

  let repositories: any[] = []
  if (isConnected) {
    repositories = await getGithubRepositories()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-3 text-muted-foreground">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Proyectos
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Desplegar Nueva App</h1>
        <p className="text-muted-foreground mt-1">
          {isConnected 
            ? "Selecciona un repositorio de GitHub para configurar tu entorno base."
            : "Conecta tu cuenta de GitHub para desplegar directamente desde tus repositorios."}
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive border border-destructive/20">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-md bg-emerald-500/15 p-4 text-sm text-emerald-500 border border-emerald-500/20">
          {successMsg}
        </div>
      )}

      {!isConnected ? (
        <Card className="glass-panel border-border/40 max-w-xl mx-auto mt-12 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8 pt-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-2 border border-primary/20">
              <Github className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl">Conectar con GitHub</CardTitle>
            <CardDescription className="text-base max-w-sm mx-auto">
              Autoriza a OLA CLOUD para listar tus repositorios, inyectar variables de entorno y configurar webhooks de auto-despliegue.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-10">
             <Button asChild size="lg" className="w-full sm:w-auto font-medium shadow-primary/20 shadow-lg text-primary-foreground h-12 px-8">
                <Link href="/api/auth/github">
                  <Github className="mr-2 h-5 w-5" />
                  Conectar cuenta de GitHub
                </Link>
             </Button>
          </CardFooter>
        </Card>
      ) : (
        <DeploymentWizard repositories={repositories} />
      )}
    </div>
  )
}
