export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
          created_at: string
          email: string
          experience: string | null
          gender: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location: string | null
          name: string
          phone: string | null
          rating: number | null
          specialties: string[] | null
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          email: string
          experience?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          email?: string
          experience?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string
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
          hairstyle_name: string | null
          id: string
          image_url: string | null
          service_id: string | null
          stylist_id: string | null
        }
        Insert: {
          created_at?: string | null
          hairstyle_name?: string | null
          id?: string
          image_url?: string | null
          service_id?: string | null
          stylist_id?: string | null
        }
        Update: {
          created_at?: string | null
          hairstyle_name?: string | null
          id?: string
          image_url?: string | null
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
            referencedRelation: "users"
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
      [_ in never]: never
    }
    Functions: {
      change_user_role: {
        Args: { target_user_id: string; new_role: string }
        Returns: Json
      }
      clean_expired_bookings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      confirm_booking: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      count_unread_messages: {
        Args: {
          p_stylist_id: string
          p_client_id: string
          p_user_type?: string
        }
        Returns: number
      }
      decline_booking: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      force_user_logout: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_admin_reservations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          scheduled_at: string
          status: string
          notes: string
          created_at: string
          updated_at: string
          client_name: string
          client_avatar: string
          client_email: string
          client_phone: string
          stylist_name: string
          stylist_avatar: string
          stylist_email: string
          stylist_phone: string
          stylist_specialties: string[]
          stylist_location: string
          stylist_role: string
          service_name: string
          service_description: string
          service_price: number
          service_duration: number
          service_category: string
        }[]
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_review_by_token: {
        Args: { token: string }
        Returns: {
          id: string
          reservation_id: string
          client_id: string
          professional_id: string
          status: string
          created_at: string
          client_name: string
          professional_name: string
          service_name: string
          scheduled_at: string
        }[]
      }
      get_stylist_reservations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          scheduled_at: string
          status: string
          notes: string
          created_at: string
          updated_at: string
          client_name: string
          client_avatar: string
          client_email: string
          client_phone: string
          service_name: string
          service_description: string
          service_price: number
          service_duration: number
          service_category: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_security_event: {
        Args: {
          event_type: string
          event_message: string
          user_id?: string
          metadata?: Json
        }
        Returns: undefined
      }
      mark_messages_as_read: {
        Args: { p_stylist_id: string; p_client_id: string }
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
        Args: { target_user_id: string; new_role: string; csrf_token?: string }
        Returns: Json
      }
      set_super_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      set_user_role: {
        Args: { user_id: string; new_role: string }
        Returns: undefined
      }
      submit_review: {
        Args: { token: string; rating: number; comment_text: string }
        Returns: Json
      }
      update_stylist_rating_for_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      validate_booking_service: {
        Args: { p_stylist_user_id: string; p_service_id: string }
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
      user_role: "client" | "coiffeur" | "admin" | "cosmetique" | "coiffeuse"
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
      user_role: ["client", "coiffeur", "admin", "cosmetique", "coiffeuse"],
      user_status: ["actif", "bloque", "inactif"],
    },
  },
} as const
