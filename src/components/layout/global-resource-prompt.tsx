import { FolderGit2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface GlobalResourcePromptProps {
  title: string
  description: string
}

export function GlobalResourcePrompt({ title, description }: GlobalResourcePromptProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white border rounded-xl shadow-sm p-8 max-w-md w-full text-center space-y-6">
        <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto">
          <FolderGit2 className="w-6 h-6 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/projects">
            Seleccionar un Proyecto <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
