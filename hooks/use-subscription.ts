'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useUser } from './use-user';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export function useSubscription() {
    const { user } = useUser();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setSubscription(null);
            setLoading(false);
            return;
        }

        async function fetchSubscription() {
            try {
                const { data, error } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', user!.id)
                    .single();

                if (error) throw error;
                setSubscription(data);
            } catch (err) {
                console.error('Error fetching subscription:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchSubscription();

        // Subscribe to changes (Realtime)
        const channel = supabase
            .channel('subscription_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'subscriptions',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    setSubscription(payload.new as Subscription);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';

    return {
        subscription,
        isPremium,
        loading,
        plan: subscription?.plan ?? 'free',
    };
}
