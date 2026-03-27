import { revalidatePath } from "next/cache"

// Esta acción implementará la creación de base de datos en Coolify V4
export async function handleCreateDatabase(projectId: string, payload: any) {
  // Aquí llamaremos al API y si va bien revalidamos
  return { success: true, message: "Implementación en progreso" }
}
