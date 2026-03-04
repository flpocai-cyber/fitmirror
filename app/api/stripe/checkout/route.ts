import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
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
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
