import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors when env vars are not set
let _stripe: Stripe | null = null;

export const stripe = new Proxy({} as Stripe, {
    get(_target, prop) {
        if (!_stripe) {
            const key = process.env.STRIPE_SECRET_KEY;
            if (!key) {
                throw new Error('STRIPE_SECRET_KEY environment variable is not set');
            }
            _stripe = new Stripe(key, {
                apiVersion: '2026-02-25.clover' as any,
                appInfo: {
                    name: 'FitMirror',
                    version: '0.1.0',
                },
            });
        }
        const value = (_stripe as any)[prop];
        return typeof value === 'function' ? value.bind(_stripe) : value;
    },
});
