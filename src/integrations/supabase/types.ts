export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      availabilities: {
        Row: {
          created_at: string | null
          end_at: string
          id: string
          start_at: string
          status: Database["public"]["Enums"]["availability_status"] | null
          stylist_id: string
        }
        Insert: {
          created_at?: string | null
          end_at: string
          id?: string
          start_at: string
          status?: Database["public"]["Enums"]["availability_status"] | null
          stylist_id: string
        }
        Update: {
          created_at?: string | null
          end_at?: string
          id?: string
          start_at?: string
          status?: Database["public"]["Enums"]["availability_status"] | null
          stylist_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          client_auth_id: string | null
          client_email: string
          client_id: string | null
          client_name: string
          client_phone: string
          comments: string | null
          created_at: string
          expires_at: string | null
          hairdresser_id: string
          id: string
          scheduled_at: string
          service: string
          service_id: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          stylist_id: string | null
        }
        Insert: {
          booking_date: string
          booking_time: string
          client_auth_id?: string | null
          client_email: string
          client_id?: string | null
          client_name: string
          client_phone: string
          comments?: string | null
          created_at?: string
          expires_at?: string | null
          hairdresser_id: string
          id?: string
          scheduled_at: string
          service: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          stylist_id?: string | null
        }
        Update: {
          booking_date?: string
          booking_time?: string
          client_auth_id?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string
          client_phone?: string
          comments?: string | null
          created_at?: string
          expires_at?: string | null
          hairdresser_id?: string
          id?: string
          scheduled_at?: string
          service?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          stylist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          note: string | null
          stylist_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          note?: string | null
          stylist_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          note?: string | null
          stylist_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          auth_id: string
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          auth_id: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          auth_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          client_email: string
          client_id: string
          client_name: string
          created_at: string | null
          hairdresser_id: string
          id: string
          message: string
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          client_email: string
          client_id: string
          client_name: string
          created_at?: string | null
          hairdresser_id: string
          id?: string
          message: string
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          client_email?: string
          client_id?: string
          client_name?: string
          created_at?: string | null
          hairdresser_id?: string
          id?: string
          message?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "hairdressers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_requests_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "hairdressers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_requests_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "hairdressers_public_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_requests_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      hairdresser_services: {
        Row: {
          created_at: string | null
          hairdresser_id: string
          id: string
          service_id: string
        }
        Insert: {
          created_at?: string | null
          hairdresser_id: string
          id?: string
          service_id: string
        }
        Update: {
          created_at?: string | null
          hairdresser_id?: string
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hairdresser_services_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "hairdressers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hairdresser_services_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "hairdressers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hairdresser_services_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "hairdressers_public_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hairdresser_services_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hairdresser_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      hairdressers: {
        Row: {
          auth_id: string | null
          bio: string | null
          created_at: string
          email: string
          experience: string | null
          gender: string | null
          id: string
          image_url: string | null
          instagram: string | null
          is_active: boolean | null
          location: string | null
          name: string
          phone: string | null
          rating: number | null
          salon_address: string | null
          specialties: string[] | null
          updated_at: string
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          auth_id?: string | null
          bio?: string | null
          created_at?: string
          email: string
          experience?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          is_active?: boolean | null
          location?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          salon_address?: string | null
          specialties?: string[] | null
          updated_at?: string
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          auth_id?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          experience?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          is_active?: boolean | null
          location?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          salon_address?: string | null
          specialties?: string[] | null
          updated_at?: string
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string | null
          booking_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          receiver_id: string | null
          sender_id: string | null
          ticket_id: string | null
        }
        Insert: {
          body?: string | null
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          receiver_id?: string | null
          sender_id?: string | null
          ticket_id?: string | null
        }
        Update: {
          body?: string | null
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          receiver_id?: string | null
          sender_id?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      new_reservations: {
        Row: {
          client_name: string | null
          client_user_id: string
          created_at: string | null
          id: string
          notes: string | null
          scheduled_at: string
          service_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          stylist_user_id: string
          updated_at: string | null
        }
        Insert: {
          client_name?: string | null
          client_user_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_at: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stylist_user_id: string
          updated_at?: string | null
        }
        Update: {
          client_name?: string | null
          client_user_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stylist_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_reservations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_read: boolean | null
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          created_at: string | null
          display_order: number | null
          hairstyle_name: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          service_id: string | null
          stylist_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          hairstyle_name?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          service_id?: string | null
          stylist_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          hairstyle_name?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          service_id?: string | null
          stylist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_clients: {
        Row: {
          client_id: string
          created_at: string | null
          first_booking_date: string
          id: string
          last_booking_date: string | null
          professional_id: string
          status: string
          total_bookings: number | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          first_booking_date?: string
          id?: string
          last_booking_date?: string | null
          professional_id: string
          status?: string
          total_bookings?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          first_booking_date?: string
          id?: string
          last_booking_date?: string | null
          professional_id?: string
          status?: string
          total_bookings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_test: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_test?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_test?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          ends_at: string
          id: string
          is_active: boolean | null
          starts_at: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          ends_at: string
          id?: string
          is_active?: boolean | null
          starts_at: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          ends_at?: string
          id?: string
          is_active?: boolean | null
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          client_id: string
          coiffeur_id: string
          created_at: string
          date_reservation: string
          heure_reservation: string
          id: string
          notes: string | null
          service_demande: string
          status: Database["public"]["Enums"]["reservation_status"] | null
          updated_at: string
        }
        Insert: {
          client_id: string
          coiffeur_id: string
          created_at?: string
          date_reservation: string
          heure_reservation: string
          id?: string
          notes?: string | null
          service_demande: string
          status?: Database["public"]["Enums"]["reservation_status"] | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          coiffeur_id?: string
          created_at?: string
          date_reservation?: string
          heure_reservation?: string
          id?: string
          notes?: string | null
          service_demande?: string
          status?: Database["public"]["Enums"]["reservation_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "professionals_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_coiffeur_id_fkey"
            columns: ["coiffeur_id"]
            isOneToOne: false
            referencedRelation: "professionals_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_coiffeur_id_fkey"
            columns: ["coiffeur_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          client_id: string | null
          comment: string | null
          created_at: string | null
          email_sent_at: string | null
          id: string
          is_approved: boolean | null
          professional_id: string | null
          rating: number | null
          reservation_id: string | null
          review_token: string | null
          status: string | null
          stylist_id: string | null
        }
        Insert: {
          booking_id?: string | null
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          email_sent_at?: string | null
          id?: string
          is_approved?: boolean | null
          professional_id?: string | null
          rating?: number | null
          reservation_id?: string | null
          review_token?: string | null
          status?: string | null
          stylist_id?: string | null
        }
        Update: {
          booking_id?: string | null
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          email_sent_at?: string | null
          id?: string
          is_approved?: boolean | null
          professional_id?: string | null
          rating?: number | null
          reservation_id?: string | null
          review_token?: string | null
          status?: string | null
          stylist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "new_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_logs: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration: number
          id: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      stylist_schedule: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          stylist_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          stylist_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          stylist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stylist_schedule_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "hairdressers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stylist_schedule_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "hairdressers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stylist_schedule_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "hairdressers_public_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stylist_schedule_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string | null
          event_type: string
          id: number
          message: string | null
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: number
          message?: string | null
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: number
          message?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_id: string | null
          created_at: string
          email: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_test: boolean | null
          nom: string
          prenom: string
          role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["user_status"] | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          email: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_test?: boolean | null
          nom: string
          prenom: string
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          email?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_test?: boolean | null
          nom?: string
          prenom?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      webpush_subscriptions: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          keys: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          keys: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          keys?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      hairdressers_public: {
        Row: {
          auth_id: string | null
          bio: string | null
          created_at: string | null
          experience: string | null
          gender: string | null
          id: string | null
          image_url: string | null
          instagram: string | null
          is_active: boolean | null
          location: string | null
          name: string | null
          rating: number | null
          salon_address: string | null
          specialties: string[] | null
          updated_at: string | null
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          auth_id?: string | null
          bio?: string | null
          created_at?: string | null
          experience?: string | null
          gender?: string | null
          id?: string | null
          image_url?: string | null
          instagram?: string | null
          is_active?: boolean | null
          location?: string | null
          name?: string | null
          rating?: number | null
          salon_address?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          auth_id?: string | null
          bio?: string | null
          created_at?: string | null
          experience?: string | null
          gender?: string | null
          id?: string | null
          image_url?: string | null
          instagram?: string | null
          is_active?: boolean | null
          location?: string | null
          name?: string | null
          rating?: number | null
          salon_address?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      hairdressers_public_safe: {
        Row: {
          auth_id: string | null
          bio: string | null
          created_at: string | null
          experience: string | null
          gender: string | null
          id: string | null
          image_url: string | null
          instagram: string | null
          is_active: boolean | null
          location: string | null
          name: string | null
          rating: number | null
          salon_address: string | null
          specialties: string[] | null
          updated_at: string | null
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          auth_id?: string | null
          bio?: string | null
          created_at?: string | null
          experience?: string | null
          gender?: string | null
          id?: string | null
          image_url?: string | null
          instagram?: string | null
          is_active?: boolean | null
          location?: string | null
          name?: string | null
          rating?: number | null
          salon_address?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          auth_id?: string | null
          bio?: string | null
          created_at?: string | null
          experience?: string | null
          gender?: string | null
          id?: string | null
          image_url?: string | null
          instagram?: string | null
          is_active?: boolean | null
          location?: string | null
          name?: string | null
          rating?: number | null
          salon_address?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      professionals_directory: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["user_status"] | null
        }
        Relationships: []
      }
      professionals_public: {
        Row: {
          bio: string | null
          created_at: string | null
          experience: string | null
          gender: string | null
          id: string | null
          image_url: string | null
          instagram: string | null
          is_active: boolean | null
          location: string | null
          name: string | null
          professional_type: Database["public"]["Enums"]["user_role"] | null
          rating: number | null
          specialties: string[] | null
          updated_at: string | null
          website: string | null
          working_hours: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      change_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: Json
      }
      clean_expired_bookings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clean_invalid_image_urls: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_all_demo_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_demo_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      confirm_booking: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      count_unread_messages: {
        Args: {
          p_client_id: string
          p_stylist_id: string
          p_user_type?: string
        }
        Returns: number
      }
      create_booking_by_hairdresser_id: {
        Args: {
          client_email: string
          client_name: string
          client_phone: string
          hairdresser_id: string
          notes?: string
          scheduled_datetime: string
          service_id: string
        }
        Returns: Json
      }
      create_guest_booking: {
        Args: {
          p_client_email: string
          p_client_name: string
          p_client_phone: string
          p_hairdresser_id: string
          p_notes?: string
          p_scheduled_datetime: string
          p_service_id?: string
        }
        Returns: Json
      }
      create_public_booking: {
        Args: {
          client_email: string
          client_name: string
          client_phone: string
          notes?: string
          professional_id: string
          scheduled_datetime: string
          service_id: string
        }
        Returns: Json
      }
      decline_booking: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      force_user_logout: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      force_user_session_refresh: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_admin_reservations: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_avatar: string
          client_email: string
          client_name: string
          client_phone: string
          created_at: string
          id: string
          notes: string
          scheduled_at: string
          service_category: string
          service_description: string
          service_duration: number
          service_name: string
          service_price: number
          status: string
          stylist_avatar: string
          stylist_email: string
          stylist_location: string
          stylist_name: string
          stylist_phone: string
          stylist_role: string
          stylist_specialties: string[]
          updated_at: string
        }[]
      }
      get_all_users_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          auth_id: string
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          id: string
          nom: string
          prenom: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          telephone: string
          updated_at: string
        }[]
      }
      get_available_time_slots: {
        Args: {
          professional_id: string
          target_date?: string
          timezone_name?: string
        }
        Returns: {
          is_available: boolean
          slot_datetime: string
          time_slot: string
        }[]
      }
      get_client_name: {
        Args: { client_user_id: string }
        Returns: string
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_professional_availabilities: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          created_at: string
          end_at: string
          id: string
          start_at: string
          status: string
        }[]
      }
      get_professional_availability: {
        Args: { check_date: string; professional_id: string }
        Returns: {
          booking_duration: unknown
          is_available: boolean
          time_slot: string
        }[]
      }
      get_professional_availability_by_id: {
        Args: { check_date: string; hairdresser_id: string }
        Returns: {
          booking_duration: unknown
          is_available: boolean
          time_slot: string
        }[]
      }
      get_professional_by_auth_id: {
        Args: { auth_user_id: string }
        Returns: {
          auth_id: string
          bio: string
          created_at: string
          experience: string
          gender: string
          id: string
          image_url: string
          instagram: string
          is_active: boolean
          name: string
          rating: number
          salon_address: string
          specialties: string[]
          updated_at: string
          website: string
          working_hours: Json
        }[]
      }
      get_professional_by_id: {
        Args: { professional_id: string }
        Returns: {
          auth_id: string
          bio: string
          created_at: string
          experience: string
          gender: string
          id: string
          image_url: string
          instagram: string
          is_active: boolean
          name: string
          rating: number
          salon_address: string
          specialties: string[]
          updated_at: string
          website: string
          working_hours: Json
        }[]
      }
      get_professionals_by_role: {
        Args: { role_filter?: string }
        Returns: {
          auth_id: string
          bio: string
          created_at: string
          email: string
          experience: string
          gender: string
          id: string
          image_url: string
          instagram: string
          is_active: boolean
          location: string
          name: string
          phone: string
          rating: number
          role: string
          salon_address: string
          specialties: string[]
          updated_at: string
          website: string
          working_hours: Json
        }[]
      }
      get_professionals_for_booking: {
        Args: Record<PropertyKey, never>
        Returns: {
          auth_id: string
          avatar_url: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
        }[]
      }
      get_public_hairdresser_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          auth_id: string
          bio: string
          created_at: string
          experience: string
          gender: string
          id: string
          image_url: string
          instagram: string
          is_active: boolean
          location: string
          name: string
          rating: number
          salon_address: string
          specialties: string[]
          updated_at: string
          website: string
          working_hours: Json
        }[]
      }
      get_public_hairdresser_data_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          bio: string
          created_at: string
          gender: string
          id: string
          image_url: string
          instagram: string
          is_active: boolean
          location: string
          name: string
          rating: number
          updated_at: string
          website: string
          working_hours: Json
        }[]
      }
      get_public_hairdresser_data_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          auth_id: string
          bio: string
          created_at: string
          gender: string
          id: string
          image_url: string
          instagram: string
          is_active: boolean
          location: string
          name: string
          rating: number
          salon_address: string
          specialties: string[]
          updated_at: string
          website: string
          working_hours: Json
        }[]
      }
      get_public_professional_availability: {
        Args: { check_date: string; professional_auth_id: string }
        Returns: {
          booking_duration: number
          is_available: boolean
          time_slot: string
        }[]
      }
      get_review_by_token: {
        Args: { token: string }
        Returns: {
          client_id: string
          client_name: string
          created_at: string
          id: string
          professional_id: string
          professional_name: string
          reservation_id: string
          scheduled_at: string
          service_name: string
          status: string
        }[]
      }
      get_stylist_reservations: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_avatar: string
          client_email: string
          client_name: string
          client_phone: string
          created_at: string
          id: string
          notes: string
          scheduled_at: string
          service_category: string
          service_description: string
          service_duration: number
          service_name: string
          service_price: number
          status: string
          updated_at: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_hairdresser_access: {
        Args: {
          access_type: string
          hairdresser_id: string
          user_agent?: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          event_message: string
          event_type: string
          metadata?: Json
          user_id?: string
        }
        Returns: undefined
      }
      mark_messages_as_read: {
        Args: { p_client_id: string; p_stylist_id: string }
        Returns: undefined
      }
      promote_to_admin: {
        Args: { p_email: string }
        Returns: undefined
      }
      refresh_stylists_rating: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      secure_change_user_role: {
        Args: { csrf_token?: string; new_role: string; target_user_id: string }
        Returns: Json
      }
      send_contact_request: {
        Args: {
          p_client_email: string
          p_client_name: string
          p_hairdresser_id: string
          p_message: string
          p_subject: string
        }
        Returns: Json
      }
      set_professional_availability: {
        Args: {
          availability_status?: string
          end_datetime: string
          start_datetime: string
        }
        Returns: Json
      }
      set_super_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      set_user_role: {
        Args: { new_role: string; user_id: string }
        Returns: undefined
      }
      submit_contact_form: {
        Args: {
          csrf_token?: string
          email: string
          message: string
          name: string
        }
        Returns: Json
      }
      submit_review: {
        Args: { comment_text: string; rating: number; token: string }
        Returns: Json
      }
      update_stylist_rating_for_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      validate_booking_service: {
        Args: { p_service_id: string; p_stylist_user_id: string }
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: Json
      }
      validate_security_context: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      validate_session_security: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      availability_status: "available" | "busy" | "unavailable"
      booking_status:
        | "pending"
        | "confirmed"
        | "declined"
        | "completed"
        | "no_show"
      gender_type: "homme" | "femme" | "autre" | "non_specifie"
      reservation_status: "en_attente" | "confirmee" | "annulee"
      user_role:
        | "client"
        | "coiffeur"
        | "admin"
        | "cosmetique"
        | "coiffeuse"
        | "stylist"
      user_status: "actif" | "bloque" | "inactif"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      availability_status: ["available", "busy", "unavailable"],
      booking_status: [
        "pending",
        "confirmed",
        "declined",
        "completed",
        "no_show",
      ],
      gender_type: ["homme", "femme", "autre", "non_specifie"],
      reservation_status: ["en_attente", "confirmee", "annulee"],
      user_role: [
        "client",
        "coiffeur",
        "admin",
        "cosmetique",
        "coiffeuse",
        "stylist",
      ],
      user_status: ["actif", "bloque", "inactif"],
    },
  },
} as const
