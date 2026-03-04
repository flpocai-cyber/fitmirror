import Link from "next/link";
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="z-10 text-center space-y-6 max-w-lg">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-4">
            <Sparkles className="mr-2 h-3 w-3" />
            <span>O Futuro da sua Evolução</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-balance">
            Enxergue o seu <span className="text-primary italic">Amanhã</span>.
          </h1>

          <p className="text-xl text-muted-foreground text-pretty">
            O único app que projeta sua evolução física usando IA e inteligência preditiva.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-2xl shadow-xl shadow-primary/20">
              <Link href="/auth/signup">
                Começar Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-2xl border-border/50 bg-background/50 backdrop-blur">
              <Link href="/auth/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="p-6 bg-card/30 backdrop-blur-sm border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto py-8">
          <div className="space-y-3 p-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">FitMirror</h3>
            <p className="text-muted-foreground">Projeções visuais de 30, 60 e 90 dias com base na sua dedicação atual.</p>
          </div>
          <div className="space-y-3 p-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Food Scan</h3>
            <p className="text-muted-foreground">Registre suas refeições apenas com uma foto. Rápido, lindo e inteligente.</p>
          </div>
          <div className="space-y-3 p-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Metas Reais</h3>
            <p className="text-muted-foreground">Cálculos precisos de macros e treinos adaptados ao seu objetivo feminino.</p>
          </div>
        </div>
      </section>

      {/* Mobile Footer Spacing for TabBar */}
      <div className="h-20" />
    </div>
  );
}
