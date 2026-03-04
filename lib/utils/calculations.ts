import { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function calculateMacros(profile: Profile, currentWeight: number) {
    // Simple heuristic for the MVP
    // Base TDEE calculation (Simplified)
    const baseKcal = profile.height_cm ? (currentWeight * 22) + (profile.height_cm * 5) : currentWeight * 30;

    let targetKcal = baseKcal;
    let proteinRatio = 2.0; // g/kg
    let fatRatio = 0.8;    // g/kg

    switch (profile.goal) {
        case 'emagrecer':
            targetKcal -= 500;
            proteinRatio = 2.2;
            break;
        case 'ganhar_massa':
            targetKcal += 300;
            proteinRatio = 2.0;
            break;
        case 'definir':
            targetKcal -= 200;
            proteinRatio = 2.4;
            break;
        default:
            proteinRatio = 1.8;
    }

    const protein = currentWeight * proteinRatio;
    const fat = currentWeight * fatRatio;
    const carb = (targetKcal - (protein * 4) - (fat * 9)) / 4;

    return {
        kcal: Math.round(targetKcal),
        protein: Math.round(protein),
        carb: Math.round(carb),
        fat: Math.round(fat),
    };
}

export function getMacroProgressPercentage(current: number, target: number) {
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
}
