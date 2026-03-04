export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            body_metrics: {
                Row: {
                    body_fat_pct: number | null
                    created_at: string
                    date: string
                    hip_cm: number | null
                    id: string
                    photo_front_url: string | null
                    photo_side_url: string | null
                    user_id: string
                    waist_cm: number | null
                    weight_kg: number
                }
                Insert: {
                    body_fat_pct?: number | null
                    created_at?: string
                    date: string
                    hip_cm?: number | null
                    id?: string
                    photo_front_url?: string | null
                    photo_side_url?: string | null
                    user_id: string
                    waist_cm?: number | null
                    weight_kg: number
                }
                Update: {
                    body_fat_pct?: number | null
                    created_at?: string
                    date?: string
                    hip_cm?: number | null
                    id?: string
                    photo_front_url?: string | null
                    photo_side_url?: string | null
                    user_id?: string
                    waist_cm?: number | null
                    weight_kg?: number
                }
            }
            daily_summary: {
                Row: {
                    carb: number
                    date: string
                    fat: number
                    kcal_in: number
                    kcal_out: number
                    protein: number
                    user_id: string
                }
                Insert: {
                    carb?: number
                    date: string
                    fat?: number
                    kcal_in?: number
                    kcal_out?: number
                    protein?: number
                    user_id: string
                }
                Update: {
                    carb?: number
                    date?: string
                    fat?: number
                    kcal_in?: number
                    kcal_out?: number
                    protein?: number
                    user_id?: string
                }
            }
            foods: {
                Row: {
                    brand: string | null
                    carb_per_unit: number
                    fat_per_unit: number
                    id: string
                    kcal_per_unit: number
                    name: string
                    portion_unit: string
                    protein_per_unit: number
                }
                Insert: {
                    brand?: string | null
                    carb_per_unit: number
                    fat_per_unit: number
                    id?: string
                    kcal_per_unit: number
                    name: string
                    portion_unit: string
                    protein_per_unit: number
                }
                Update: {
                    brand?: string | null
                    carb_per_unit?: number
                    fat_per_unit?: number
                    id?: string
                    kcal_per_unit?: number
                    name?: string
                    portion_unit?: string
                    protein_per_unit?: number
                }
            }
            meal_items: {
                Row: {
                    carb: number | null
                    custom_name: string | null
                    fat: number | null
                    food_id: string | null
                    id: string
                    kcal: number | null
                    meal_id: string
                    protein: number | null
                    quantity: number
                    unit: string | null
                }
                Insert: {
                    carb?: number | null
                    custom_name?: string | null
                    fat?: number | null
                    food_id?: string | null
                    id?: string
                    kcal?: number | null
                    meal_id: string
                    protein?: number | null
                    quantity: number
                    unit?: string | null
                }
                Update: {
                    carb?: number | null
                    custom_name?: string | null
                    fat?: number | null
                    food_id?: string | null
                    id?: string
                    kcal?: number | null
                    meal_id?: string
                    protein?: number | null
                    quantity?: number
                    unit?: string | null
                }
            }
            meals: {
                Row: {
                    created_at: string
                    id: string
                    meal_time: string
                    notes: string | null
                    photo_url: string | null
                    source: string | null
                    type: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    meal_time: string
                    notes?: string | null
                    photo_url?: string | null
                    source?: string | null
                    type: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    meal_time?: string
                    notes?: string | null
                    photo_url?: string | null
                    source?: string | null
                    type?: string
                    user_id?: string
                }
            }
            profiles: {
                Row: {
                    created_at: string
                    goal: Database["public"]["Enums"]["user_goal"] | null
                    height_cm: number | null
                    id: string
                    name: string | null
                }
                Insert: {
                    created_at?: string
                    goal?: Database["public"]["Enums"]["user_goal"] | null
                    height_cm?: number | null
                    id: string
                    name?: string | null
                }
                Update: {
                    created_at?: string
                    goal?: Database["public"]["Enums"]["user_goal"] | null
                    height_cm?: number | null
                    id?: string
                    name?: string | null
                }
            }
            subscriptions: {
                Row: {
                    created_at: string
                    current_period_end: string | null
                    plan: Database["public"]["Enums"]["user_plan"] | null
                    status: string | null
                    stripe_customer_id: string | null
                    stripe_subscription_id: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    current_period_end?: string | null
                    plan?: Database["public"]["Enums"]["user_plan"] | null
                    status?: string | null
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string
                    current_period_end?: string | null
                    plan?: Database["public"]["Enums"]["user_plan"] | null
                    status?: string | null
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    user_id?: string
                }
            }
            workouts: {
                Row: {
                    created_at: string
                    date: string
                    duration_min: number
                    id: string
                    kcal_burned: number | null
                    notes: string | null
                    type: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    date: string
                    duration_min: number
                    id?: string
                    kcal_burned?: number | null
                    notes?: string | null
                    type: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    date?: string
                    duration_min?: number
                    id?: string
                    kcal_burned?: number | null
                    notes?: string | null
                    type?: string
                    user_id?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_goal: 'emagrecer' | 'definir' | 'ganhar_massa' | 'manter'
            user_plan: 'free' | 'premium'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
