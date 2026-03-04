import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const cookieStore = cookies();
        // We assume the user is authenticated if they hit this endpoint
        // In a real app, we'd use supabase.auth.getUser()
        const { data: { user } } = await (await import('@/lib/supabase')).getSupabaseAdmin().auth.getUser(
            cookieStore.get('sb-access-token')?.value || ''
        );

        if (!user) {
            // Mock fallback for demonstration if no actual user session cookie is found
            // return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: 'FitMirror Premium',
                            description: 'Acesso completo, projeções de futuro e food scan ilimitado.',
                        },
                        unit_amount: 2990, // R$ 29,90
                        recurring: { interval: 'month' },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/home?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?canceled=true`,
            metadata: {
                userId: user?.id || 'mock-user-id',
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
