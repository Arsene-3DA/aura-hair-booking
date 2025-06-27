export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          client_email: string
          client_name: string
          client_phone: string
          client_user_id: string | null
          comments: string | null
          created_at: string
          expires_at: string | null
          hairdresser_id: string
          id: string
          service: string
          status: string | null
        }
        Insert: {
          booking_date: string
          booking_time: string
          client_email: string
          client_name: string
          client_phone: string
          client_user_id?: string | null
          comments?: string | null
          created_at?: string
          expires_at?: string | null
          hairdresser_id: string
          id?: string
          service: string
          status?: string | null
        }
        Update: {
          booking_date?: string
          booking_time?: string
          client_email?: string
          client_name?: string
          client_phone?: string
          client_user_id?: string | null
          comments?: string | null
          created_at?: string
          expires_at?: string | null
          hairdresser_id?: string
          id?: string
          service?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "hairdressers"
            referencedColumns: ["id"]
          },
        ]
      }
      coiffeur_profiles: {
        Row: {
          created_at: string
          hairdresser_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hairdresser_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hairdresser_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coiffeur_profiles_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: true
            referencedRelation: "hairdressers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coiffeur_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hairdressers: {
        Row: {
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
          user_id: string | null
        }
        Insert: {
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
          user_id?: string | null
        }
        Update: {
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
          user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          session_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          password_hash: string
          phone: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          password_hash: string
          phone?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          password_hash?: string
          phone?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_expired_bookings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
