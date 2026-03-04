'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingUp, Scale, Camera as CameraIcon, Plus, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function ProgressPage() {
    const { user, loading: authLoading } = useUser();
    const [metrics, setMetrics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [weight, setWeight] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) router.push('/landing');
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;
        async function fetchMetrics() {
            const { data } = await supabase
                .from('body_metrics')
                .select('*')
                .eq('user_id', user!.id)
                .order('date', { ascending: true });
            if (data) setMetrics(data);
            setLoading(false);
        }
        fetchMetrics();
    }, [user]);

    const handleAddWeight = async () => {
        if (!weight || !user) return;
        setIsAdding(true);
        try {
            const { error } = await supabase
                .from('body_metrics')
                .insert({
                    user_id: user.id,
                    date: new Date().toISOString().split('T')[0],
                    weight_kg: parseFloat(weight),
                });

            if (error) throw error;
            toast.success("Peso registrado!");
            setWeight('');
            // Refresh
            const { data } = await supabase
                .from('body_metrics')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: true });
            if (data) setMetrics(data);
        } catch (error: any) {
            toast.error("Erro ao salvar", { description: error.message });
        } finally {
            setIsAdding(false);
        }
    };

    if (authLoading || loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const chartData = metrics.map(m => ({
        date: new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        weight: m.weight_kg
    }));

    return (
        <div className="p-6 space-y-8 pb-24">
            <header>
                <h2 className="text-2xl font-bold">Evolução</h2>
                <p className="text-muted-foreground">Acompanhe seu progresso físico</p>
            </header>

            {/* Quick Add Weight */}
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="weight" className="text-xs uppercase font-bold text-primary">Peso Hoje (kg)</Label>
                        <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            placeholder="Ex: 62.5"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="bg-background/50 border-primary/20"
                        />
                    </div>
                    <Button onClick={handleAddWeight} disabled={isAdding} size="icon" className="h-10 w-10">
                        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
                    </Button>
                </CardContent>
            </Card>

            {/* Weight Chart */}
            <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Tendência de Peso
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                                itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Body Photos Selection */}
            <div className="space-y-4">
                <h3 className="font-bold">Fotos de Comparação</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-32 flex-col rounded-2xl border-dashed border-border/50 gap-2">
                        <CameraIcon className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Frente</span>
                    </Button>
                    <Button variant="outline" className="h-32 flex-col rounded-2xl border-dashed border-border/50 gap-2">
                        <CameraIcon className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Lado</span>
                    </Button>
                </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
                <h3 className="font-bold">Histórico de Medidas</h3>
                <div className="space-y-3">
                    {metrics.slice().reverse().map((m) => (
                        <div key={m.id} className="flex justify-between items-center p-4 rounded-2xl bg-card/50 border border-border/50">
                            <div className="flex gap-3 items-center">
                                <div className="h-10 w-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                                    <Scale className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{m.weight_kg} kg</p>
                                    <p className="text-[10px] text-muted-foreground">{new Date(m.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
