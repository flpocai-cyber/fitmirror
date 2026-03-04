import { supabase } from '@/lib/supabase';

export async function computeDailySummary(userId: string, date: string) {
    try {
        // 1. Fetch all meals for this user and date
        const startOfDay = `${date}T00:00:00Z`;
        const endOfDay = `${date}T23:59:59Z`;

        const { data: meals, error: mealsError } = await supabase
            .from('meals')
            .select(`
        id,
        meal_items (
          kcal,
          protein,
          carb,
          fat,
          quantity
        )
      `)
            .eq('user_id', userId)
            .gte('meal_time', startOfDay)
            .lte('meal_time', endOfDay);

        if (mealsError) throw mealsError;

        // 2. Fetch all workouts for this user and date
        const { data: workouts, error: workoutsError } = await supabase
            .from('workouts')
            .select('kcal_burned')
            .eq('user_id', userId)
            .eq('date', date);

        if (workoutsError) throw workoutsError;

        // 3. Sum up macros and calories
        let totalKcalIn = 0;
        let totalProtein = 0;
        let totalCarb = 0;
        let totalFat = 0;

        meals?.forEach(meal => {
            meal.meal_items?.forEach(item => {
                totalKcalIn += Number(item.kcal || 0);
                totalProtein += Number(item.protein || 0);
                totalCarb += Number(item.carb || 0);
                totalFat += Number(item.fat || 0);
            });
        });

        let totalKcalOut = 0;
        workouts?.forEach(workout => {
            totalKcalOut += Number(workout.kcal_burned || 0);
        });

        // 4. Update or Insert Daily Summary
        const { error: upsertError } = await supabase
            .from('daily_summary')
            .upsert({
                user_id: userId,
                date: date,
                kcal_in: totalKcalIn,
                kcal_out: totalKcalOut,
                protein: totalProtein,
                carb: totalCarb,
                fat: totalFat,
            }, { onConflict: 'user_id,date' });

        if (upsertError) throw upsertError;

        return { success: true };
    } catch (error) {
        console.error('Error computing daily summary:', error);
        return { success: false, error };
    }
}
