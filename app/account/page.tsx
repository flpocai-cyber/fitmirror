'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/use-user';
import { useSubscription } from '@/hooks/use-subscription';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, CreditCard, User as UserIcon, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountPage() {
    const { user, profile, loading: authLoading } = useUser();
    const { plan, isPremium, loading: subLoading } = useSubscription();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/landing');
    };

    const handleUpgrade = async () => {
        try {
            const response = await fetch('/api/stripe/checkout', { method: 'POST' });
            const { url } = await response.json();
            if (url) window.location.href = url;
        } catch (error) {
            toast.error("Erro ao iniciar assinatura");
        }
    };

    if (authLoading || subLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="p-6 space-y-8 pb-24">
            <header>
                <h2 className="text-2xl font-bold">Minha Conta</h2>
                <p className="text-muted-foreground">Gerencie seu perfil e plano</p>
            </header>

            {/* User Card */}
            <Card className="border-border/50 bg-card/50">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-black border border-primary/30">
                        {profile?.name?.[0] || 'F'}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{profile?.name}</h3>
                        <p className="text-sm text-muted-foreground italic capitalize">{profile?.goal?.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card className={`border-none ${isPremium ? 'bg-primary' : 'bg-primary/5 border border-primary/20'} text-foreground overflow-hidden relative`}>
                {isPremium && <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[80%] bg-white/10 blur-[60px] rounded-full pointer-events-none" />}
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className={isPremium ? 'text-primary-foreground' : ''}>Plano {plan.toUpperCase()}</CardTitle>
                            <CardDescription className={isPremium ? 'text-primary-foreground/80' : ''}>
                                {isPremium ? 'Você tem acesso ilimitado a todas as funções.' : 'Acesse o FitMirror e escaneie fotos ilimitadas.'}
                            </CardDescription>
                        </div>
                        {isPremium ? <ShieldCheck className="h-8 w-8 text-primary-foreground" /> : <Sparkles className="h-8 w-8 text-primary" />}
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {!isPremium && (
                        <Button onClick={handleUpgrade} className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20">
                            Fazer Upgrade para PREMIUM
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
                <Button variant="outline" className="w-full h-14 justify-start gap-4 rounded-2xl border-border/50 bg-card/50">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <span>Editar Perfil</span>
                </Button>
                <Button variant="outline" className="w-full h-14 justify-start gap-4 rounded-2xl border-border/50 bg-card/50">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span>Gerenciar Assinatura</span>
                </Button>
                <Button
                    variant="ghost"
                    className="w-full h-14 justify-start gap-4 rounded-2xl text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    <span>Sair da Conta</span>
                </Button>
            </div>

            <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">FitMirror v0.1.0 • O Espelho do Futuro</p>
            </div>
        </div>
    );
}
