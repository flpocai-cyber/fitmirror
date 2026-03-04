import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    const body = await req.text();
    const sig = headers().get('stripe-signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const userId = session.metadata.userId;

        await supabaseAdmin
            .from('subscriptions')
            .upsert({
                user_id: userId,
                plan: 'premium',
                status: 'active',
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription,
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Mock end date
            });
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as any;
        await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'canceled', plan: 'free' })
            .eq('stripe_subscription_id', subscription.id);
    }

    return NextResponse.json({ received: true });
}
