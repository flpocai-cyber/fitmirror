'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/use-user';
import { useSubscription } from '@/hooks/use-subscription';
import { calculateProjections } from '@/lib/utils/projections';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, ChevronLeft, Target, Zap, ShieldAlert, Lock } from 'lucide-react';
import Link from 'next/link';

export default function FitMirrorPage() {
    const { user, profile, loading: authLoading } = useUser();
    const { isPremium, loading: subLoading } = useSubscription();
    const [projections, setProjections] = useState<any[]>([]);
    const [currentWeight, setCurrentWeight] = useState(0);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) router.push('/landing');
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user || !profile) return;

        async function fetchLatestWeight() {
            const { data } = await supabase
                .from('body_metrics')
                .select('weight_kg')
                .eq('user_id', user!.id)
                .order('date', { ascending: false })
                .limit(1)
                .single();

            const weight = data?.weight_kg || 65; // fall back
            setCurrentWeight(weight);
            setProjections(calculateProjections(weight, profile?.goal ?? 'manter'));
        }

        fetchLatestWeight();
    }, [user, profile]);

    if (authLoading || subLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!isPremium) {
        return (
            <div className="p-6 h-screen flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                    <Lock className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black italic text-primary">ÁREA PREMIUM</h2>
                    <p className="text-muted-foreground text-balance">O FitMirror (Espelho do Futuro) está disponível apenas para assinantes.</p>
                </div>
                <Card className="border-primary/20 bg-primary/5 p-4 text-left">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        O que você ganha:
                    </h4>
                    <ul className="text-xs space-y-2 text-muted-foreground">
                        <li>• Projeção visual de peso de 30/60/90 dias</li>
                        <li>• Estimativa de perda de gordura baseada em tendência</li>
                        <li>• Histórico completo de fotos e medidas</li>
                        <li>• Escaneamento ilimitado de refeições</li>
                    </ul>
                </Card>
                <Button asChild className="w-full h-14 rounded-2xl shadow-lg shadow-primary/20">
                    <Link href="/account">Fazer Upgrade Agora</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 pb-24">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 italic">
                        FitMirror
                        <Sparkles className="h-5 w-5 text-primary" />
                    </h2>
                    <p className="text-muted-foreground text-xs uppercase tracking-widest">Seu Eu do Futuro</p>
                </div>
            </header>

            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 text-center space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2"><Target className="h-20 w-20 text-primary/5 rotate-12" /></div>
                <p className="text-xs text-primary font-black uppercase tracking-widest">Status Inicial</p>
                <h3 className="text-4xl font-black">{currentWeight} <span className="text-sm font-normal text-muted-foreground italic">kg hoje</span></h3>
                <p className="text-sm text-muted-foreground capitalize">Meta: {profile?.goal?.replace('_', ' ')}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {projections.map((p, i) => (
                    <Card key={p.days} className={`border-none ${i === 2 ? 'bg-primary' : i === 1 ? 'bg-card/80' : 'bg-card/50'} relative overflow-hidden active:scale-95 transition-transform`}>
                        {i === 2 && <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 blur-[50px] rounded-full pointer-events-none" />}
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${i === 2 ? 'text-primary-foreground/80' : 'text-primary'}`}>{p.days} DIAS</span>
                                <Zap className={`h-4 w-4 ${i === 2 ? 'text-primary-foreground' : 'text-primary'}`} />
                            </div>
                            <CardTitle className={`text-4xl font-black ${i === 2 ? 'text-primary-foreground' : ''}`}>
                                {p.weight} <span className="text-lg font-normal italic">kg</span>
                            </CardTitle>
                            <CardDescription className={i === 2 ? 'text-primary-foreground/80' : ''}>
                                Estimativa de <span className="font-bold">{p.status}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className={`flex-1 p-3 rounded-2xl ${i === 2 ? 'bg-white/10' : 'bg-background/50'} text-center`}>
                                    <p className={`text-[10px] uppercase font-bold ${i === 2 ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>Gordura</p>
                                    <p className={`text-lg font-black ${i === 2 ? 'text-primary-foreground' : 'text-chart-5'}`}>{p.fatPercentage.toFixed(1)}%</p>
                                </div>
                                <div className={`flex-1 p-3 rounded-2xl ${i === 2 ? 'bg-white/10' : 'bg-background/50'} text-center`}>
                                    <p className={`text-[10px] uppercase font-bold ${i === 2 ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>Foco Diário</p>
                                    <p className={`text-sm font-bold ${i === 2 ? 'text-primary-foreground' : ''}`}>Consistência</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/50 text-xs text-muted-foreground italic text-pretty">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <p>As projeções são estimativas baseadas em tendências metabólicas médias e pressupõem a manutenção do plano sugerido.</p>
            </div>
        </div>
    );
}
