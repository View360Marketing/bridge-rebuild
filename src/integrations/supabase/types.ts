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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      guests: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: Json | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: Json | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: Json | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          bootstrap_completed_at: string | null
          currency: string
          expected_room_count: number
          id: number
          instant_booking_enabled: boolean
          inventory_authority: string
          timezone: string
          updated_at: string
        }
        Insert: {
          bootstrap_completed_at?: string | null
          currency?: string
          expected_room_count?: number
          id?: number
          instant_booking_enabled?: boolean
          inventory_authority?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          bootstrap_completed_at?: string | null
          currency?: string
          expected_room_count?: number
          id?: number
          instant_booking_enabled?: boolean
          inventory_authority?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_nights: {
        Row: {
          claim_reason: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          owner_id: string | null
          owner_type: string
          stay_date: string
          unit_id: string
        }
        Insert: {
          claim_reason?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          owner_id?: string | null
          owner_type: string
          stay_date: string
          unit_id: string
        }
        Update: {
          claim_reason?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          owner_id?: string | null
          owner_type?: string
          stay_date?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_nights_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          code: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_archived: boolean
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_lines: {
        Row: {
          amount_cents: number
          id: string
          kind: string
          label: string
          quote_id: string
          sort_order: number
        }
        Insert: {
          amount_cents?: number
          id?: string
          kind?: string
          label: string
          quote_id: string
          sort_order?: number
        }
        Update: {
          amount_cents?: number
          id?: string
          kind?: string
          label?: string
          quote_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_lines_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          policy_version: string | null
          reservation_id: string | null
          status: string
          total_cents: number
        }
        Insert: {
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          policy_version?: string | null
          reservation_id?: string | null
          status?: string
          total_cents?: number
        }
        Update: {
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          policy_version?: string | null
          reservation_id?: string | null
          status?: string
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_units: {
        Row: {
          adults: number
          checkin_date: string
          checkout_date: string
          children: number
          created_at: string
          id: string
          reservation_id: string
          unit_id: string | null
        }
        Insert: {
          adults?: number
          checkin_date: string
          checkout_date: string
          children?: number
          created_at?: string
          id?: string
          reservation_id: string
          unit_id?: string | null
        }
        Update: {
          adults?: number
          checkin_date?: string
          checkout_date?: string
          children?: number
          created_at?: string
          id?: string
          reservation_id?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservation_units_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          booking_reference: string
          created_at: string
          created_by: string | null
          currency: string
          guest_id: string | null
          id: string
          paid_cents: number
          policy_version: string | null
          source: string
          status: string
          total_cents: number
          updated_at: string
          version: number
        }
        Insert: {
          booking_reference: string
          created_at?: string
          created_by?: string | null
          currency?: string
          guest_id?: string | null
          id?: string
          paid_cents?: number
          policy_version?: string | null
          source?: string
          status?: string
          total_cents?: number
          updated_at?: string
          version?: number
        }
        Update: {
          booking_reference?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          guest_id?: string | null
          id?: string
          paid_cents?: number
          policy_version?: string | null
          source?: string
          status?: string
          total_cents?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          amenities: Json
          code: string
          created_at: string
          default_max_guests: number
          description: string | null
          id: string
          is_archived: boolean
          name: string
          updated_at: string
        }
        Insert: {
          amenities?: Json
          code: string
          created_at?: string
          default_max_guests?: number
          description?: string | null
          id?: string
          is_archived?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          amenities?: Json
          code?: string
          created_at?: string
          default_max_guests?: number
          description?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      unit_media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_primary: boolean
          sort_order: number
          storage_path: string | null
          unit_id: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean
          sort_order?: number
          storage_path?: string | null
          unit_id: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean
          sort_order?: number
          storage_path?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_media_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          accessibility_notes: string | null
          base_rate_cents: number
          bathrooms: number
          bedrooms: number
          beds: number
          cleaning_fee_cents: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_archived: boolean
          is_closed: boolean
          is_published: boolean
          max_adults: number
          max_children: number
          max_guests: number
          pet_policy: string
          property_id: string | null
          public_name: string | null
          room_type_id: string | null
          sort_order: number
          unit_code: string
          unit_kind: string
          updated_at: string
        }
        Insert: {
          accessibility_notes?: string | null
          base_rate_cents?: number
          bathrooms?: number
          bedrooms?: number
          beds?: number
          cleaning_fee_cents?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          is_closed?: boolean
          is_published?: boolean
          max_adults?: number
          max_children?: number
          max_guests?: number
          pet_policy?: string
          property_id?: string | null
          public_name?: string | null
          room_type_id?: string | null
          sort_order?: number
          unit_code: string
          unit_kind?: string
          updated_at?: string
        }
        Update: {
          accessibility_notes?: string | null
          base_rate_cents?: number
          bathrooms?: number
          bedrooms?: number
          beds?: number
          cleaning_fee_cents?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          is_closed?: boolean
          is_published?: boolean
          max_adults?: number
          max_children?: number
          max_guests?: number
          pet_policy?: string
          property_id?: string | null
          public_name?: string | null
          room_type_id?: string | null
          sort_order?: number
          unit_code?: string
          unit_kind?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_manager: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "manager"
        | "front_desk"
        | "housekeeping"
        | "read_only"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "super_admin",
        "manager",
        "front_desk",
        "housekeeping",
        "read_only",
      ],
    },
  },
} as const
