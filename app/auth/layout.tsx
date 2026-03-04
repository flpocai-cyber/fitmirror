import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-primary italic">FitMirror</h1>
                    <p className="text-muted-foreground">O seu espelho do futuro</p>
                </div>
                {children}
            </div>
        </div>
    );
}
