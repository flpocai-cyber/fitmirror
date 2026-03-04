'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Loader2, Apple, ChevronLeft, Check, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/use-user';
import { computeDailySummary } from '@/lib/utils/daily-summary';

export default function ScanPage() {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [scannedData, setScannedData] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useUser();
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleScan = async () => {
        if (!image) return;
        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append('image', image);

            const response = await fetch('/api/food-scan', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setScannedData(data);
        } catch (error: any) {
            toast.error("Erro no scan", { description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirm = async () => {
        if (!user || !scannedData) return;
        setIsSaving(true);

        try {
            const today = new Date().toISOString();

            // 1. Upload photo to Supabase Storage
            const fileExt = image!.name.split('.').pop();
            const fileName = `${user.id}/${Math.random()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('meal-photos')
                .upload(fileName, image!);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('meal-photos')
                .getPublicUrl(fileName);

            // 2. Create Meal
            const { data: meal, error: mealError } = await supabase
                .from('meals')
                .insert({
                    user_id: user.id,
                    meal_time: today,
                    type: 'lanche', // Default or detected
                    photo_url: publicUrl,
                    source: 'ai',
                })
                .select()
                .single();

            if (mealError) throw mealError;

            // 3. Create Meal Items
            const itemsToInsert = scannedData.items.map((item: any) => ({
                meal_id: meal.id,
                custom_name: item.name,
                kcal: item.kcal,
                protein: item.protein,
                carb: item.carb,
                fat: item.fat,
                quantity: item.quantity,
                unit: item.unit,
            }));

            const { error: itemsError } = await supabase
                .from('meal_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            // 4. Recalculate
            await computeDailySummary(user.id, today.split('T')[0]);

            toast.success("Refeição registrada com sucesso!");
            router.push('/home');
        } catch (error: any) {
            toast.error("Erro ao salvar", { description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-6 pb-24 h-full flex flex-col">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h2 className="text-2xl font-bold">Food Scan</h2>
            </header>

            {!scannedData ? (
                <div className="flex-1 flex flex-col justify-center gap-8">
                    <div
                        className="aspect-square w-full bg-secondary/30 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden group active:scale-95 transition-transform"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {preview ? (
                            <>
                                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit2 className="h-8 w-8 text-white" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <Camera className="h-10 w-10" />
                                </div>
                                <p className="font-bold">Fotografar refeição</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Carregue ou capture</p>
                            </>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                            capture="environment"
                        />
                    </div>

                    <Button
                        className="h-16 text-lg rounded-2xl shadow-lg shadow-primary/20"
                        disabled={!image || isProcessing}
                        onClick={handleScan}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Analisando com IA...
                            </>
                        ) : (
                            <>
                                <Apple className="h-5 w-5 mr-2" />
                                Analisar Proteína & Macros
                            </>
                        )}
                    </Button>
                </div>
            ) : (
                <div className="space-y-6 flex-1">
                    <Card className="border-border/50 bg-card/50">
                        <CardHeader>
                            <CardTitle>Resultados do Scan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {scannedData.items.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-border/50">
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{item.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{item.quantity}{item.unit} • {item.kcal} kcal</p>
                                    </div>
                                    <div className="flex gap-2 text-[10px] font-bold">
                                        <span className="text-chart-1">P: {item.protein}g</span>
                                        <span className="text-chart-2">C: {item.carb}g</span>
                                        <span className="text-chart-3">G: {item.fat}g</span>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t border-border mt-4 flex justify-between items-center px-2">
                                <span className="font-bold">Total Estimado</span>
                                <span className="text-xl font-black text-primary">{scannedData.total_kcal} kcal</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            <Button className="w-full h-14 rounded-2xl" disabled={isSaving} onClick={handleConfirm}>
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
                                Confirmar & Salvar
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={() => setScannedData(null)}>
                                Refazer Scan
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
