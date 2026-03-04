'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Utensils, Scan, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Refeições', href: '/meals', icon: Utensils },
    { name: 'Scan', href: '/scan', icon: Scan, primary: true },
    { name: 'Evolução', href: '/progress', icon: TrendingUp },
    { name: 'Conta', href: '/account', icon: User },
];

export function BottomTabBar() {
    const pathname = usePathname();

    // Don't show tab bar on auth or onboarding pages
    const hideOnPaths = ['/auth', '/onboarding', '/landing'];
    if (hideOnPaths.some(path => pathname?.startsWith(path)) || pathname === '/') {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border pb-safe-bottom">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = tab.icon;

                    if (tab.primary) {
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className="relative -top-4 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
                            >
                                <Icon size={28} />
                                <span className="sr-only">{tab.name}</span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{tab.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
