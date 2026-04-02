import React from "react"
import { CreditCard, Check, ArrowRight, Zap, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BillingPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu plan activo, métodos de pago y facturas mensuales.
          </p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" /> Exportar Historial
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Active Plan Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-2xl p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <CreditCard className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500 border border-emerald-500/20 mb-4 transition-colors">
                Plan Activo
              </span>
              <h2 className="text-2xl font-bold mb-2">Pro Infrastructure</h2>
              <p className="text-muted-foreground max-w-md">
                Despliegues ilimitados en la red global, con 100GB de transferencia y soporte prioritario.
              </p>
            </div>
            
            <div className="mt-8 flex items-end gap-x-2">
              <span className="text-4xl font-bold tracking-tight text-foreground">$49</span>
              <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">/mes</span>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border/40 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Próximo cobro</span>
                <span className="font-semibold text-sm">01 de Mayo, 2026</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Método de pago</span>
                <span className="font-semibold text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  •••• 4242
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <Zap className="w-8 h-8 opacity-80 mb-4" />
            <h3 className="text-xl font-bold mb-2">Escala a Enterprise</h3>
            <p className="text-primary-foreground/80 text-sm">
              Nodos dedicados, aislamiento de VPC, y SLAs empresariales del 99.99%.
            </p>
            <ul className="mt-6 space-y-3">
              {['VPC Privada dedicada', 'SLA 99.99%', 'Account Manager'].map(feat => (
                <li key={feat} className="flex gap-3 text-sm text-primary-foreground/90 font-medium">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
          <Button variant="secondary" className="w-full mt-8 bg-white text-black hover:bg-neutral-100 font-semibold gap-2">
            Contactar Ventas <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-lg font-semibold tracking-tight mb-4">Facturas recientes</h3>
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-3">Referencia</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {[
                { ref: 'INV-2026-004', date: '01 Abr 2026', status: 'Pagada', amount: '$49.00' },
                { ref: 'INV-2026-003', date: '01 Mar 2026', status: 'Pagada', amount: '$49.00' },
                { ref: 'INV-2026-002', date: '01 Feb 2026', status: 'Pagada', amount: '$49.00' },
              ].map((invoice) => (
                <tr key={invoice.ref} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium">{invoice.ref}</td>
                  <td className="px-6 py-4 text-muted-foreground">{invoice.date}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono">{invoice.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
