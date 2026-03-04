'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/use-user';
import { computeDailySummary } from '@/lib/utils/daily-summary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Dumbbell, ChevronLeft } from 'lucide-react';

const formSchema = z.object({
    type: z.string().min(1, "Obrigatório"),
    duration_min: z.string().transform(v => parseInt(v) || 0).refine(v => v > 0, "Duração deve ser maior que 0"),
    kcal_burned: z.string().transform(v => parseFloat(v) || 0),
    notes: z.string().optional(),
});

export default function NewWorkoutPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user } = useUser();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "musculação",
            duration_min: "45" as any,
            kcal_burned: "300" as any,
            notes: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return;
        setIsLoading(true);

        try {
            const today = new Date().toISOString().split('T')[0];

            const { error } = await supabase
                .from('workouts')
                .insert({
                    user_id: user.id,
                    date: today,
                    type: values.type,
                    duration_min: values.duration_min,
                    kcal_burned: values.kcal_burned,
                    notes: values.notes,
                });

            if (error) throw error;

            await computeDailySummary(user.id, today);

            toast.success("Treino registrado!");
            router.push('/home');
        } catch (error: any) {
            toast.error("Erro ao salvar", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="p-6 space-y-6 pb-24">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h2 className="text-2xl font-bold">Registrar Treino</h2>
            </header>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Atividade Física</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Tipo de Treino</Label>
                            <Select onValueChange={(v) => form.setValue("type", v)} defaultValue="musculação">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="musculação">Musculação</SelectItem>
                                    <SelectItem value="cardio">Cardio / Corrida</SelectItem>
                                    <SelectItem value="hiit">HIIT</SelectItem>
                                    <SelectItem value="yoga">Yoga / Pilates</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Duração (min)</Label>
                                <Input type="number" {...form.register("duration_min")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Kcal Gastas (est.)</Label>
                                <Input type="number" {...form.register("kcal_burned")} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Anotações (opcional)</Label>
                            <Input placeholder="Como foi o treino?" {...form.register("notes")} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full h-14 rounded-2xl" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Dumbbell className="h-5 w-5 mr-2" />}
                            Salvar Treino
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
