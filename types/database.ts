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
            users: {
                Row: {
                    id: string
                    email: string | null
                    name: string | null
                    role: 'customer' | 'provider' | 'admin'
                    phone: string | null
                    medical_notes: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    name?: string | null
                    role?: 'customer' | 'provider' | 'admin'
                    phone?: string | null
                    medical_notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    name?: string | null
                    role?: 'customer' | 'provider' | 'admin'
                    phone?: string | null
                    medical_notes?: string | null
                    created_at?: string
                }
            }
            services: {
                Row: {
                    id: string
                    provider_id: string | null
                    type: 'Nurse' | 'Driver' | 'House Help'
                    name: string
                    description: string | null
                    hourly_rate: number
                    availability: Json | null
                    image_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    provider_id?: string | null
                    type: 'Nurse' | 'Driver' | 'House Help'
                    name: string
                    description?: string | null
                    hourly_rate: number
                    availability?: Json | null
                    image_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    type?: 'Nurse' | 'Driver' | 'House Help'
                    name?: string
                    description?: string | null
                    hourly_rate?: number
                    availability?: Json | null
                    image_url?: string | null
                    created_at?: string
                }
            }
            bookings: {
                Row: {
                    id: string
                    user_id: string
                    service_id: string
                    status: 'pending' | 'confirmed' | 'in_review' | 'completed' | 'cancelled'
                    scheduled_at: string
                    duration_hours: number
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    service_id: string
                    status?: 'pending' | 'confirmed' | 'in_review' | 'completed' | 'cancelled'
                    scheduled_at: string
                    duration_hours?: number
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    service_id?: string
                    status?: 'pending' | 'confirmed' | 'in_review' | 'completed' | 'cancelled'
                    scheduled_at?: string
                    duration_hours?: number
                    notes?: string | null
                    created_at?: string
                }
            }
        }
    }
}
