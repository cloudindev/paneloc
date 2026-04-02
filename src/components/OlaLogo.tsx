import { cn } from "@/lib/utils";

export default function OlaLogo({ className }: { className?: string }) {
  return (
    <div className={cn("w-[160px] h-[52px] relative shrink-0 group flex items-center", className)}>
      {/* Base Logo - Clean */}
      <img 
        src="/olacloud-logo.png" 
        alt="OLA Logo" 
        className="object-contain w-full h-full object-left relative z-10 transition-all duration-300"
      />
      
      {/* Holographic sweep strictly clamped to the right side (\CLOUD) */}
      <div 
        className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-multiply"
        style={{
          WebkitMaskImage: 'url("/olacloud-logo.png")',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'left center',
          maskImage: 'url("/olacloud-logo.png")',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'left center',
          
          /* Corta el Div exactamente entre "OLA" y "\CLOUD". 
             El 38.5% preserva el verde original de OLA. */
          clipPath: 'inset(0 0 0 38.5%)',
          WebkitClipPath: 'inset(0 0 0 38.5%)',
          
          /* Gradiente continuo holográfico corporativo */
          background: 'linear-gradient(90deg, #0ea5e9 0%, #e8aff6 33%, #00FFC7 66%, #0ea5e9 100%)',
          backgroundSize: '200% 100%',
          animation: 'bgPan 2.5s infinite linear'
        }}
      />
    </div>
  );
}
