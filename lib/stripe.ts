import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover' as any, // Cast as any if TS complains about the preview version
    appInfo: {
        name: 'FitMirror',
        version: '0.1.0',
    },
});
