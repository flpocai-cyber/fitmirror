'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.name,
                    },
                },
            });

            if (error) {
                toast.error("Erro ao cadastrar", { description: error.message });
                return;
            }

            if (data.user) {
                // Try to auto sign-in immediately after signup
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: values.email,
                    password: values.password,
                });

                if (signInError) {
                    // Email confirmation is required — redirect to login with a friendly message
                    toast.success("Conta criada!", {
                        description: "Verifique seu e-mail para confirmar a conta e depois faça login.",
                        duration: 6000,
                    });
                    router.push('/auth/login');
                    return;
                }

                toast.success("Conta criada! Bem-vindo(a)!");
                router.push('/onboarding');
            }
        } catch (error) {
            toast.error("Ocorreu um erro inesperado");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
                <CardTitle>Comece sua jornada</CardTitle>
                <CardDescription>Crie sua conta e visualize o seu "Espelho do Futuro".</CardDescription>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Como podemos te chamar?</Label>
                        <Input
                            id="name"
                            placeholder="Seu nome"
                            {...form.register("name")}
                            disabled={isLoading}
                        />
                        {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            {...form.register("email")}
                            disabled={isLoading}
                        />
                        {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            {...form.register("password")}
                            disabled={isLoading}
                        />
                        {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar conta
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Já tem uma conta?{" "}
                        <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                            Entrar
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
