'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/use-user';
import { calculateMacros, getMacroProgressPercentage } from '@/lib/utils/calculations';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, Flame, Dumbbell, Apple, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
    const { user, profile, loading: authLoading } = useUser();
    const [summary, setSummary] = useState<any>(null);
    const [latestWeight, setLatestWeight] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/landing');
            return;
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;

        async function fetchData() {
            const today = new Date().toISOString().split('T')[0];

            // 1. Fetch Daily Summary
            const { data: summaryData } = await supabase
                .from('daily_summary')
                .select('*')
                .eq('user_id', user!.id)
                .eq('date', today)
                .single();

            // 2. Fetch Latest Weight
            const { data: weightData } = await supabase
                .from('body_metrics')
                .select('weight_kg')
                .eq('user_id', user!.id)
                .order('date', { ascending: false })
                .limit(1)
                .single();

            setSummary(summaryData || { kcal_in: 0, kcal_out: 0, protein: 0, carb: 0, fat: 0 });
            setLatestWeight(weightData?.weight_kg || 0);
            setLoading(false);
        }

        fetchData();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const targets = profile ? calculateMacros(profile as any, latestWeight) : { kcal: 2000, protein: 120, carb: 200, fat: 60 };
    const netKcal = (summary?.kcal_in || 0) - (summary?.kcal_out || 0);

    return (
        <div className="p-6 space-y-8 pb-24">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Olá, {profile?.name || 'Guerreira'}!</h2>
                    <p className="text-muted-foreground">Sua meta de hoje está {netKcal > targets.kcal ? 'quase lá!' : 'no caminho.'}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                    {profile?.name?.[0] || 'F'}
                </div>
            </header>

            {/* Main Calorie Card */}
            <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[80%] bg-white/10 blur-[60px] rounded-full pointer-events-none" />
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-primary-foreground/80 font-medium">Calorias Restantes</p>
                            <h3 className="text-5xl font-black">{Math.max(0, targets.kcal - summary.kcal_in)}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-primary-foreground/80 text-sm">Meta: {targets.kcal} kcal</p>
                            <p className="text-sm font-bold">Consumido: {summary.kcal_in} kcal</p>
                        </div>
                    </div>
                    <Progress value={getMacroProgressPercentage(summary.kcal_in, targets.kcal)} className="h-3 bg-white/20" />
                </CardContent>
            </Card>

            {/* Macro Grid */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Proteína', value: summary.protein, target: targets.protein, color: 'bg-chart-1' },
                    { label: 'Carbo', value: summary.carb, target: targets.carb, color: 'bg-chart-2' },
                    { label: 'Gordura', value: summary.fat, target: targets.fat, color: 'bg-chart-3' },
                ].map((macro) => (
                    <div key={macro.label} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span>{macro.label}</span>
                            <span>{macro.value}g</span>
                        </div>
                        <Progress value={getMacroProgressPercentage(macro.value, macro.target)} className="h-2" />
                    </div>
                ))}
            </div>

            {/* Activity Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Sugestões Rápidas</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Button asChild variant="secondary" className="h-20 flex-col gap-1 rounded-2xl bg-secondary/50 border-border/50">
                        <Link href="/meals/new">
                            <Apple className="h-5 w-5 text-green-500" />
                            <span>Add Refeição</span>
                        </Link>
                    </Button>
                    <Button asChild variant="secondary" className="h-20 flex-col gap-1 rounded-2xl bg-secondary/50 border-border/50">
                        <Link href="/scan">
                            <Flame className="h-5 w-5 text-orange-500" />
                            <span>Scan Foto</span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* FitMirror Preview (Premium Gate) */}
            <Card className="border-primary/20 bg-primary/5 border-dashed overflow-hidden">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm">Espelho do Futuro</h4>
                        <p className="text-xs text-muted-foreground italic">Veja como você estará em 30 dias se mantiver o foco hoje.</p>
                    </div>
                    <Link href="/fitmirror" className="text-primary">
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </CardContent>
            </Card>

            <div className="h-10" />
        </div>
    );
}
