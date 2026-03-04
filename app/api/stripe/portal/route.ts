import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const cookieStore = cookies();
        const { data: { user } } = await (await import('@/lib/supabase')).getSupabaseAdmin().auth.getUser(
            cookieStore.get('sb-access-token')?.value || ''
        );

        if (!user) {
            // Mock fallback
        }

        // Get the stripe customer ID from our database
        const { data: sub } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user?.id || 'mock-user-id')
            .single();

        if (!sub?.stripe_customer_id) {
            return NextResponse.json({ error: 'Nenhuma assinatura encontrada' }, { status: 400 });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: sub.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
