'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Loader2, Plus, Trash2, ChevronLeft, Apple } from 'lucide-react';

const itemSchema = z.object({
    name: z.string().min(1, "Obrigatório"),
    kcal: z.string().min(1),
    protein: z.string().min(1),
    carb: z.string().min(1),
    fat: z.string().min(1),
    quantity: z.string().min(1),
});

type ItemFormValues = {
    type: string;
    items: {
        name: string;
        kcal: string;
        protein: string;
        carb: string;
        fat: string;
        quantity: string;
    }[];
};

const formSchema = z.object({
    type: z.string().min(1, "Selecione o tipo"),
    items: z.array(itemSchema).min(1, "Adicione pelo menos um item"),
});

export default function NewMealPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user } = useUser();

    const form = useForm<ItemFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "almoço",
            items: [{ name: "", kcal: "0", protein: "0", carb: "0", fat: "0", quantity: "1" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        name: "items",
        control: form.control,
    });

    async function onSubmit(values: ItemFormValues) {
        if (!user) return;
        setIsLoading(true);

        try {
            const today = new Date().toISOString();

            // 1. Create Meal
            const { data: meal, error: mealError } = await supabase
                .from('meals')
                .insert({
                    user_id: user.id,
                    meal_time: today,
                    type: values.type,
                    source: 'manual',
                })
                .select()
                .single();

            if (mealError) throw mealError;

            // 2. Create Meal Items
            const itemsToInsert = values.items.map(item => ({
                meal_id: meal.id,
                custom_name: item.name,
                kcal: parseFloat(item.kcal) || 0,
                protein: parseFloat(item.protein) || 0,
                carb: parseFloat(item.carb) || 0,
                fat: parseFloat(item.fat) || 0,
                quantity: parseFloat(item.quantity) || 1,
            }));

            const { error: itemsError } = await supabase
                .from('meal_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            // 3. Recalculate Daily Summary
            await computeDailySummary(user.id, today.split('T')[0]);

            toast.success("Refeição salva!");
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
                <h2 className="text-2xl font-bold">Nova Refeição</h2>
            </header>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Detalhes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tipo de Refeição</Label>
                            <Select onValueChange={(v) => form.setValue("type", v)} defaultValue="almoço">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="café da manhã">Café da Manhã</SelectItem>
                                    <SelectItem value="almoço">Almoço</SelectItem>
                                    <SelectItem value="lanche">Lanche</SelectItem>
                                    <SelectItem value="jantar">Jantar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="font-bold">Itens da Refeição</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full gap-1 border-primary/50 text-primary"
                            onClick={() => append({ name: "", kcal: "0", protein: "0", carb: "0", fat: "0", quantity: "1" })}
                        >
                            <Plus className="h-4 w-4" />
                            Item
                        </Button>
                    </div>

                    {fields.map((field, index) => (
                        <Card key={field.id} className="border-border/50 bg-card/50 relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 text-destructive"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <CardContent className="p-4 space-y-4">
                                <div className="pt-2">
                                    <Label className="text-xs uppercase text-muted-foreground tracking-wider">Nome Alimento</Label>
                                    <Input placeholder="Ex: Frango Grelhado" {...form.register(`items.${index}.name`)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs uppercase text-muted-foreground tracking-wider">Qtd (g/un)</Label>
                                        <Input type="number" step="0.1" {...form.register(`items.${index}.quantity`)} />
                                    </div>
                                    <div>
                                        <Label className="text-xs uppercase text-muted-foreground tracking-wider">Calorias (kcal)</Label>
                                        <Input type="number" {...form.register(`items.${index}.kcal`)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground uppercase">Prot(g)</Label>
                                        <Input type="number" step="0.1" {...form.register(`items.${index}.protein`)} />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground uppercase">Carb(g)</Label>
                                        <Input type="number" step="0.1" {...form.register(`items.${index}.carb`)} />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground uppercase">Gord(g)</Label>
                                        <Input type="number" step="0.1" {...form.register(`items.${index}.fat`)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Button type="submit" className="w-full h-14 text-lg rounded-2xl" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Apple className="h-5 w-5 mr-2" />}
                    Salvar Refeição
                </Button>
            </form>
        </div>
    );
}
