export function calculateProjections(currentWeight: number, goal: string) {
    // Simple heuristic projections for MVP
    // Losses/Gains are estimated based on typical sustainable progress (0.5kg to 1kg per week)

    let monthlyChange = 0;
    let fatChangePct = 0;

    switch (goal) {
        case 'emagrecer':
            monthlyChange = -2.5; // kg per month
            fatChangePct = -1.5;   // % per month
            break;
        case 'ganhar_massa':
            monthlyChange = 1.0;
            fatChangePct = -0.2;
            break;
        case 'definir':
            monthlyChange = -0.5;
            fatChangePct = -1.0;
            break;
        default:
            monthlyChange = 0;
            fatChangePct = -0.1;
    }

    return [30, 60, 90].map(days => {
        const months = days / 30;
        return {
            days,
            weight: (currentWeight + (monthlyChange * months)).toFixed(1),
            fatPercentage: fatChangePct * months,
            status: goal === 'emagrecer' ? 'Mais Leve' : goal === 'ganhar_massa' ? 'Mais Forte' : 'Mais Definida'
        };
    });
}
