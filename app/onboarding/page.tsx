'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';
import { useUser } from '@/hooks/use-user';

const formSchema = z.object({
    height_cm: z.string().transform(v => parseFloat(v)).refine(v => v > 50 && v < 250, { message: "Altura inválida" }),
    weight_kg: z.string().transform(v => parseFloat(v)).refine(v => v > 20 && v < 300, { message: "Peso inválido" }),
    goal: z.enum(['emagrecer', 'definir', 'ganhar_massa', 'manter'], { required_error: "Selecione um objetivo" }),
});

export default function OnboardingPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user, profile, loading: authLoading } = useUser();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            height_cm: "" as any,
            weight_kg: "" as any,
            goal: undefined,
        },
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        } else if (profile?.goal && profile?.height_cm) {
            // If profile is already complete, skip onboarding
            router.push('/home');
        }
    }, [user, authLoading, profile, router]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return;
        setIsLoading(true);

        try {
            // 1. Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    height_cm: values.height_cm,
                    goal: values.goal,
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // 2. Insert Initial Body Metric
            const { error: metricsError } = await supabase
                .from('body_metrics')
                .insert({
                    user_id: user.id,
                    date: new Date().toISOString().split('T')[0],
                    weight_kg: values.weight_kg,
                });

            if (metricsError) throw metricsError;

            toast.success("Perfil configurado!");
            router.push('/home');
        } catch (error: any) {
            toast.error("Erro ao salvar dados", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Quase pronto!</h1>
                    <p className="text-muted-foreground text-pretty">Precisamos de alguns dados para personalizar sua experiência.</p>
                </div>

                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle>Seus Dados</CardTitle>
                        <CardDescription>Estes dados serão usados para calcular suas metas.</CardDescription>
                    </CardHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="height_cm">Altura (cm)</Label>
                                    <Input
                                        id="height_cm"
                                        placeholder="Ex: 165"
                                        type="number"
                                        {...form.register("height_cm")}
                                        disabled={isLoading}
                                    />
                                    {form.formState.errors.height_cm && <p className="text-xs text-destructive">{form.formState.errors.height_cm.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weight_kg">Peso Atual (kg)</Label>
                                    <Input
                                        id="weight_kg"
                                        placeholder="Ex: 65.5"
                                        type="number"
                                        step="0.1"
                                        {...form.register("weight_kg")}
                                        disabled={isLoading}
                                    />
                                    {form.formState.errors.weight_kg && <p className="text-xs text-destructive">{form.formState.errors.weight_kg.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="goal">Qual o seu objetivo?</Label>
                                <Select
                                    onValueChange={(v) => form.setValue("goal", v as any)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="goal">
                                        <SelectValue placeholder="Selecione um objetivo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="emagrecer">Emagrecer</SelectItem>
                                        <SelectItem value="definir">Definir</SelectItem>
                                        <SelectItem value="ganhar_massa">Ganhar Massa</SelectItem>
                                        <SelectItem value="manter">Manter Peso</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.goal && <p className="text-xs text-destructive">{form.formState.errors.goal.message}</p>}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Tudo pronto"}
                                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
