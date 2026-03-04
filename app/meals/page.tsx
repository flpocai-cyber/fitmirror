'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Calendar, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

export default function MealsPage() {
    const { user, loading: authLoading } = useUser();
    const [meals, setMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/landing');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;

        async function fetchMeals() {
            const { data, error } = await supabase
                .from('meals')
                .select(`
          *,
          meal_items (*)
        `)
                .eq('user_id', user!.id)
                .order('meal_time', { ascending: false });

            if (data) setMeals(data);
            setLoading(false);
        }

        fetchMeals();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 pb-24">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Refeições</h2>
                    <p className="text-muted-foreground">Seu histórico de alimentação</p>
                </div>
                <Button asChild size="icon" className="rounded-full h-12 w-12 shadow-lg shadow-primary/20">
                    <Link href="/meals/new">
                        <Plus className="h-6 w-6" />
                    </Link>
                </Button>
            </header>

            {meals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground">
                        <Calendar className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold">Nenhuma refeição ainda</p>
                        <p className="text-sm text-muted-foreground">Comece registrando o seu café da manhã!</p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/meals/new">Adicionar Manualmente</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {meals.map((meal) => (
                        <Card key={meal.id} className="border-border/50 bg-card/50 overflow-hidden active:scale-[0.98] transition-transform">
                            <CardContent className="p-0">
                                <div className="flex p-4 items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary border border-primary/20">
                                        <span className="text-[10px] font-bold uppercase">{format(new Date(meal.meal_time), 'MMM', { locale: ptBR })}</span>
                                        <span className="text-xl font-black">{format(new Date(meal.meal_time), 'dd')}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold capitalize">{meal.type}</h4>
                                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(meal.meal_time), 'HH:mm')}
                                            <span>•</span>
                                            <span>{meal.meal_items?.length || 0} itens</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-primary">
                                            {meal.meal_items?.reduce((acc: number, item: any) => acc + Number(item.kcal || 0), 0)}
                                            <span className="text-[10px] ml-1">kcal</span>
                                        </p>
                                        <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
