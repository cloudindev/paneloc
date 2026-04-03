import { Receipt, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InvoiceDemoPage() {
  const invoices = [
    { id: "INV-2026-04", date: "Abril 1, 2026", amount: "$29.00", status: "Pagado" },
    { id: "INV-2026-03", date: "Marzo 1, 2026", amount: "$29.00", status: "Pagado" },
    { id: "INV-2026-02", date: "Febrero 1, 2026", amount: "$29.00", status: "Pagado" },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">Descarga tus facturas y recibos.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Exportar a CSV
        </Button>
      </div>

      <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="grid grid-cols-4 px-6 py-4 border-b bg-black/[0.02] text-sm font-medium text-muted-foreground">
          <div>Factura</div>
          <div>Fecha</div>
          <div>Cantidad</div>
          <div>Estado</div>
        </div>
        <div className="divide-y">
          {invoices.map((inv) => (
            <div key={inv.id} className="grid grid-cols-4 items-center px-6 py-4 text-sm hover:bg-black/[0.01] transition-colors">
              <div className="font-medium flex items-center gap-2">
                <Receipt className="w-4 h-4 text-muted-foreground" />
                {inv.id}
              </div>
              <div>{inv.date}</div>
              <div>{inv.amount}</div>
              <div className="flex items-center justify-between col-span-1 pr-4">
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  {inv.status}
                </span>
                <Button variant="ghost" size="sm" className="h-8 group-hover:opacity-100 opacity-0 transition-opacity">PDF</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
