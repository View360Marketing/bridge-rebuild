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
      blocks: {
        Row: {
          checkin_date: string
          checkout_date: string
          created_at: string
          created_by: string | null
          group_id: string | null
          id: string
          owner_type: string
          reason: string | null
          unit_id: string
        }
        Insert: {
          checkin_date: string
          checkout_date: string
          created_at?: string
          created_by?: string | null
          group_id?: string | null
          id?: string
          owner_type: string
          reason?: string | null
          unit_id: string
        }
        Update: {
          checkin_date?: string
          checkout_date?: string
          created_at?: string
          created_by?: string | null
          group_id?: string | null
          id?: string
          owner_type?: string
          reason?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      date_rate_overrides: {
        Row: {
          created_at: string
          id: string
          nightly_cents: number
          rate_plan_id: string | null
          reason: string | null
          stay_date: string
          unit_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nightly_cents: number
          rate_plan_id?: string | null
          reason?: string | null
          stay_date: string
          unit_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nightly_cents?: number
          rate_plan_id?: string | null
          reason?: string | null
          stay_date?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "date_rate_overrides_rate_plan_id_fkey"
            columns: ["rate_plan_id"]
            isOneToOne: false
            referencedRelation: "rate_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "date_rate_overrides_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      fees: {
        Row: {
          amount_cents: number
          basis: string
          code: string
          created_at: string
          id: string
          is_active: boolean
          is_taxable: boolean
          name: string
        }
        Insert: {
          amount_cents?: number
          basis?: string
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_taxable?: boolean
          name: string
        }
        Update: {
          amount_cents?: number
          basis?: string
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_taxable?: boolean
          name?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          checkin_date: string | null
          checkout_date: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          group_code: string
          id: string
          name: string
          payment_responsibility: string
          release_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          checkin_date?: string | null
          checkout_date?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          group_code: string
          id?: string
          name: string
          payment_responsibility?: string
          release_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          checkin_date?: string | null
          checkout_date?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          group_code?: string
          id?: string
          name?: string
          payment_responsibility?: string
          release_date?: string | null
          status?: string
          updated_at?: string
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
      housekeeping_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          id: string
          inspected_at: string | null
          inspected_by: string | null
          is_turnover: boolean
          notes: string | null
          priority: string
          reservation_id: string | null
          status: string
          task_date: string
          unit_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          inspected_at?: string | null
          inspected_by?: string | null
          is_turnover?: boolean
          notes?: string | null
          priority?: string
          reservation_id?: string | null
          status?: string
          task_date: string
          unit_id: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          inspected_at?: string | null
          inspected_by?: string | null
          is_turnover?: boolean
          notes?: string | null
          priority?: string
          reservation_id?: string | null
          status?: string
          task_date?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_tasks_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      ical_imported_events: {
        Row: {
          dtend: string | null
          dtstart: string | null
          feed_uid: string
          ical_uid: string
          id: string
          imported_at: string
          source: string
          status: string
          summary: string | null
          unit_id: string
        }
        Insert: {
          dtend?: string | null
          dtstart?: string | null
          feed_uid: string
          ical_uid: string
          id?: string
          imported_at?: string
          source?: string
          status?: string
          summary?: string | null
          unit_id: string
        }
        Update: {
          dtend?: string | null
          dtstart?: string | null
          feed_uid?: string
          ical_uid?: string
          id?: string
          imported_at?: string
          source?: string
          status?: string
          summary?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ical_imported_events_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      ical_sync_log: {
        Row: {
          cancelled_count: number
          error_message: string | null
          feed_url: string
          finished_at: string | null
          id: string
          imported_count: number
          raw_event_count: number
          started_at: string
          status: string
          unit_id: string
          updated_count: number
        }
        Insert: {
          cancelled_count?: number
          error_message?: string | null
          feed_url: string
          finished_at?: string | null
          id?: string
          imported_count?: number
          raw_event_count?: number
          started_at?: string
          status?: string
          unit_id: string
          updated_count?: number
        }
        Update: {
          cancelled_count?: number
          error_message?: string | null
          feed_url?: string
          finished_at?: string | null
          id?: string
          imported_count?: number
          raw_event_count?: number
          started_at?: string
          status?: string
          unit_id?: string
          updated_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "ical_sync_log_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          created_at: string
          id: string
          key: string
          operation: string
          request_hash: string
          result: Json | null
          scope: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          operation: string
          request_hash: string
          result?: Json | null
          scope: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          operation?: string
          request_hash?: string
          result?: Json | null
          scope?: string
        }
        Relationships: []
      }
      inbound_events: {
        Row: {
          created_at: string
          error: string | null
          event_type: string | null
          id: string
          payload: Json
          processed_at: string | null
          provider: string
          provider_event_id: string
          status: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          event_type?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          provider: string
          provider_event_id: string
          status?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          event_type?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
          provider_event_id?: string
          status?: string
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          advance_notice_days: number
          balance_deadline_days: number | null
          booking_horizon_days: number | null
          bootstrap_completed_at: string | null
          currency: string
          default_checkin_time: string
          default_checkout_time: string
          default_cleanliness_on_checkout: string
          default_hold_minutes: number
          deposit_percent: number | null
          expected_room_count: number
          ical_export_base_url: string | null
          ical_stale_after_hours: number
          ical_sync_enabled: boolean
          ical_sync_interval_minutes: number
          id: number
          instant_booking_enabled: boolean
          inventory_authority: string
          same_day_turnover_enabled: boolean
          season_end_date: string | null
          season_start_date: string | null
          stripe_configured: boolean
          stripe_environment: string
          timezone: string
          updated_at: string
        }
        Insert: {
          advance_notice_days?: number
          balance_deadline_days?: number | null
          booking_horizon_days?: number | null
          bootstrap_completed_at?: string | null
          currency?: string
          default_checkin_time?: string
          default_checkout_time?: string
          default_cleanliness_on_checkout?: string
          default_hold_minutes?: number
          deposit_percent?: number | null
          expected_room_count?: number
          ical_export_base_url?: string | null
          ical_stale_after_hours?: number
          ical_sync_enabled?: boolean
          ical_sync_interval_minutes?: number
          id?: number
          instant_booking_enabled?: boolean
          inventory_authority?: string
          same_day_turnover_enabled?: boolean
          season_end_date?: string | null
          season_start_date?: string | null
          stripe_configured?: boolean
          stripe_environment?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          advance_notice_days?: number
          balance_deadline_days?: number | null
          booking_horizon_days?: number | null
          bootstrap_completed_at?: string | null
          currency?: string
          default_checkin_time?: string
          default_checkout_time?: string
          default_cleanliness_on_checkout?: string
          default_hold_minutes?: number
          deposit_percent?: number | null
          expected_room_count?: number
          ical_export_base_url?: string | null
          ical_stale_after_hours?: number
          ical_sync_enabled?: boolean
          ical_sync_interval_minutes?: number
          id?: number
          instant_booking_enabled?: boolean
          inventory_authority?: string
          same_day_turnover_enabled?: boolean
          season_end_date?: string | null
          season_start_date?: string | null
          stripe_configured?: boolean
          stripe_environment?: string
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
          group_id: string | null
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
          group_id?: string | null
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
          group_id?: string | null
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
      manual_payments: {
        Row: {
          amount_cents: number
          collected_at: string
          collected_by: string
          created_at: string
          currency: string
          id: string
          method: string
          notes: string | null
          reference: string | null
          reservation_id: string
          reverses_id: string | null
        }
        Insert: {
          amount_cents: number
          collected_at?: string
          collected_by: string
          created_at?: string
          currency?: string
          id?: string
          method: string
          notes?: string | null
          reference?: string | null
          reservation_id: string
          reverses_id?: string | null
        }
        Update: {
          amount_cents?: number
          collected_at?: string
          collected_by?: string
          created_at?: string
          currency?: string
          id?: string
          method?: string
          notes?: string | null
          reference?: string | null
          reservation_id?: string
          reverses_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manual_payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_payments_reverses_id_fkey"
            columns: ["reverses_id"]
            isOneToOne: false
            referencedRelation: "manual_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      outbox_jobs: {
        Row: {
          attempts: number
          created_at: string
          dedup_key: string | null
          id: string
          kind: string
          last_error: string | null
          next_attempt_at: string
          payload: Json
          reservation_id: string | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          dedup_key?: string | null
          id?: string
          kind: string
          last_error?: string | null
          next_attempt_at?: string
          payload?: Json
          reservation_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          dedup_key?: string | null
          id?: string
          kind?: string
          last_error?: string | null
          next_attempt_at?: string
          payload?: Json
          reservation_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outbox_jobs_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      outgoing_webhook_deliveries: {
        Row: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          endpoint_id: string | null
          error_message: string | null
          event_name: string
          id: string
          payload: Json
          status: string
          status_code: number | null
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          endpoint_id?: string | null
          error_message?: string | null
          event_name: string
          id?: string
          payload: Json
          status?: string
          status_code?: number | null
        }
        Update: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          endpoint_id?: string | null
          error_message?: string | null
          event_name?: string
          id?: string
          payload?: Json
          status?: string
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "outgoing_webhook_deliveries_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "outgoing_webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      outgoing_webhook_endpoints: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_enabled: boolean
          name: string
          secret: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          is_enabled?: boolean
          name: string
          secret?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_enabled?: boolean
          name?: string
          secret?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      payment_attempts: {
        Row: {
          created_at: string
          currency: string
          environment: string
          expected_amount_cents: number
          expires_at: string | null
          id: string
          idempotency_key: string
          provider: string
          provider_account_id: string | null
          provider_checkout_url: string | null
          provider_payment_intent_id: string | null
          provider_session_id: string | null
          reservation_id: string
          scope: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          environment?: string
          expected_amount_cents: number
          expires_at?: string | null
          id?: string
          idempotency_key: string
          provider?: string
          provider_account_id?: string | null
          provider_checkout_url?: string | null
          provider_payment_intent_id?: string | null
          provider_session_id?: string | null
          reservation_id: string
          scope?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          environment?: string
          expected_amount_cents?: number
          expires_at?: string | null
          id?: string
          idempotency_key?: string
          provider?: string
          provider_account_id?: string | null
          provider_checkout_url?: string | null
          provider_payment_intent_id?: string | null
          provider_session_id?: string | null
          reservation_id?: string
          scope?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount_cents: number
          captured_at: string | null
          created_at: string
          currency: string
          environment: string
          id: string
          payment_attempt_id: string | null
          provider: string
          provider_account_id: string | null
          provider_transaction_id: string
          reservation_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          captured_at?: string | null
          created_at?: string
          currency?: string
          environment?: string
          id?: string
          payment_attempt_id?: string | null
          provider?: string
          provider_account_id?: string | null
          provider_transaction_id: string
          reservation_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          captured_at?: string | null
          created_at?: string
          currency?: string
          environment?: string
          id?: string
          payment_attempt_id?: string | null
          provider?: string
          provider_account_id?: string | null
          provider_transaction_id?: string
          reservation_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_payment_attempt_id_fkey"
            columns: ["payment_attempt_id"]
            isOneToOne: false
            referencedRelation: "payment_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_versions: {
        Row: {
          cancellation_policy: Json | null
          checkin_rules: Json | null
          created_at: string
          house_rules: Json | null
          id: string
          is_active: boolean
          version: string
        }
        Insert: {
          cancellation_policy?: Json | null
          checkin_rules?: Json | null
          created_at?: string
          house_rules?: Json | null
          id?: string
          is_active?: boolean
          version: string
        }
        Update: {
          cancellation_policy?: Json | null
          checkin_rules?: Json | null
          created_at?: string
          house_rules?: Json | null
          id?: string
          is_active?: boolean
          version?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          code: string
          created_at: string
          discount_cents: number | null
          discount_percent: number | null
          effective_from: string | null
          effective_to: string | null
          id: string
          is_active: boolean
          max_redemptions: number | null
          mechanic: string
          name: string
          redemptions_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_cents?: number | null
          discount_percent?: number | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          mechanic?: string
          name: string
          redemptions_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_cents?: number | null
          discount_percent?: number | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          mechanic?: string
          name?: string
          redemptions_count?: number
        }
        Relationships: []
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
      property_events: {
        Row: {
          code: string
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          includes_overnight_access: boolean
          is_active: boolean
          is_confirmed: boolean
          is_tentative: boolean
          location: string | null
          sort_order: number
          start_time: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          includes_overnight_access?: boolean
          is_active?: boolean
          is_confirmed?: boolean
          is_tentative?: boolean
          location?: string | null
          sort_order?: number
          start_time?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          includes_overnight_access?: boolean
          is_active?: boolean
          is_confirmed?: boolean
          is_tentative?: boolean
          location?: string | null
          sort_order?: number
          start_time?: string | null
          subtitle?: string | null
          title?: string
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
          adults: number | null
          children: number | null
          created_at: string
          currency: string
          discount_cents: number
          expires_at: string | null
          fees_cents: number
          id: string
          nights: number | null
          policy_version: string | null
          reservation_id: string | null
          status: string
          subtotal_cents: number
          taxes_cents: number
          total_cents: number
        }
        Insert: {
          adults?: number | null
          children?: number | null
          created_at?: string
          currency?: string
          discount_cents?: number
          expires_at?: string | null
          fees_cents?: number
          id?: string
          nights?: number | null
          policy_version?: string | null
          reservation_id?: string | null
          status?: string
          subtotal_cents?: number
          taxes_cents?: number
          total_cents?: number
        }
        Update: {
          adults?: number | null
          children?: number | null
          created_at?: string
          currency?: string
          discount_cents?: number
          expires_at?: string | null
          fees_cents?: number
          id?: string
          nights?: number | null
          policy_version?: string | null
          reservation_id?: string | null
          status?: string
          subtotal_cents?: number
          taxes_cents?: number
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
      rate_plans: {
        Row: {
          additional_adult_cents: number
          additional_child_cents: number
          base_nightly_cents: number
          code: string
          created_at: string
          effective_from: string | null
          effective_to: string | null
          id: string
          is_active: boolean
          name: string
          room_type_id: string | null
          unit_id: string | null
          updated_at: string
          weekend_days: number[]
          weekend_nightly_cents: number | null
        }
        Insert: {
          additional_adult_cents?: number
          additional_child_cents?: number
          base_nightly_cents?: number
          code: string
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          name: string
          room_type_id?: string | null
          unit_id?: string | null
          updated_at?: string
          weekend_days?: number[]
          weekend_nightly_cents?: number | null
        }
        Update: {
          additional_adult_cents?: number
          additional_child_cents?: number
          base_nightly_cents?: number
          code?: string
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          name?: string
          room_type_id?: string | null
          unit_id?: string | null
          updated_at?: string
          weekend_days?: number[]
          weekend_nightly_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_plans_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_plans_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          payment_transaction_id: string
          provider: string
          provider_refund_id: string | null
          reason: string | null
          reservation_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          payment_transaction_id: string
          provider?: string
          provider_refund_id?: string | null
          reason?: string | null
          reservation_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          payment_transaction_id?: string
          provider?: string
          provider_refund_id?: string | null
          reason?: string | null
          reservation_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_access_capabilities: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          label: string | null
          last_used_at: string | null
          reservation_id: string
          revoked_at: string | null
          scope: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          last_used_at?: string | null
          reservation_id: string
          revoked_at?: string | null
          scope?: string
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          last_used_at?: string | null
          reservation_id?: string
          revoked_at?: string | null
          scope?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_access_capabilities_reservation_id_fkey"
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
          adults: number
          amendment_of: string | null
          booking_reference: string
          cancelled_at: string | null
          checkin_date: string | null
          checkout_date: string | null
          children: number
          created_at: string
          created_by: string | null
          currency: string
          group_id: string | null
          guest_id: string | null
          guest_requests: string | null
          hold_expires_at: string | null
          id: string
          paid_cents: number
          policy_version: string | null
          source: string
          staff_notes: string | null
          status: string
          total_cents: number
          updated_at: string
          version: number
        }
        Insert: {
          adults?: number
          amendment_of?: string | null
          booking_reference: string
          cancelled_at?: string | null
          checkin_date?: string | null
          checkout_date?: string | null
          children?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          group_id?: string | null
          guest_id?: string | null
          guest_requests?: string | null
          hold_expires_at?: string | null
          id?: string
          paid_cents?: number
          policy_version?: string | null
          source?: string
          staff_notes?: string | null
          status?: string
          total_cents?: number
          updated_at?: string
          version?: number
        }
        Update: {
          adults?: number
          amendment_of?: string | null
          booking_reference?: string
          cancelled_at?: string | null
          checkin_date?: string | null
          checkout_date?: string | null
          children?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          group_id?: string | null
          guest_id?: string | null
          guest_requests?: string | null
          hold_expires_at?: string | null
          id?: string
          paid_cents?: number
          policy_version?: string | null
          source?: string
          staff_notes?: string | null
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
      restrictions: {
        Row: {
          closed_to_arrival: boolean
          closed_to_departure: boolean
          created_at: string
          id: string
          is_closed: boolean
          max_stay: number | null
          min_stay: number | null
          room_type_id: string | null
          stay_date: string
          unit_id: string | null
        }
        Insert: {
          closed_to_arrival?: boolean
          closed_to_departure?: boolean
          created_at?: string
          id?: string
          is_closed?: boolean
          max_stay?: number | null
          min_stay?: number | null
          room_type_id?: string | null
          stay_date: string
          unit_id?: string | null
        }
        Update: {
          closed_to_arrival?: boolean
          closed_to_departure?: boolean
          created_at?: string
          id?: string
          is_closed?: boolean
          max_stay?: number | null
          min_stay?: number | null
          room_type_id?: string | null
          stay_date?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restrictions_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restrictions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
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
      seasonal_offers: {
        Row: {
          code: string
          created_at: string
          description: string
          effective_from: string
          effective_to: string
          id: string
          is_active: boolean
          promotion_code: string | null
          sort_order: number
          title: string
          updated_at: string
          weekday_label: string
          weekday_rate_cents: number
          weekend_label: string
          weekend_rate_cents: number
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          effective_from: string
          effective_to: string
          id?: string
          is_active?: boolean
          promotion_code?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          weekday_label?: string
          weekday_rate_cents: number
          weekend_label?: string
          weekend_rate_cents: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          effective_from?: string
          effective_to?: string
          id?: string
          is_active?: boolean
          promotion_code?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          weekday_label?: string
          weekday_rate_cents?: number
          weekend_label?: string
          weekend_rate_cents?: number
        }
        Relationships: []
      }
      taxes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          rate_percent: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          rate_percent: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          rate_percent?: number
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
          airbnb_listing_id: string | null
          airbnb_url: string | null
          base_rate_cents: number
          bathrooms: number
          bedrooms: number
          beds: number
          cleaning_fee_cents: number
          cleanliness_state: string
          created_at: string
          created_by: string | null
          description: string | null
          ical_export_token: string | null
          ical_import_url: string | null
          ical_last_attempt_at: string | null
          ical_last_synced_at: string | null
          ical_sync_status: string | null
          id: string
          is_archived: boolean
          is_closed: boolean
          is_published: boolean
          max_adults: number
          max_children: number
          max_guests: number
          pet_policy: string
          primary_image_url: string | null
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
          airbnb_listing_id?: string | null
          airbnb_url?: string | null
          base_rate_cents?: number
          bathrooms?: number
          bedrooms?: number
          beds?: number
          cleaning_fee_cents?: number
          cleanliness_state?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ical_export_token?: string | null
          ical_import_url?: string | null
          ical_last_attempt_at?: string | null
          ical_last_synced_at?: string | null
          ical_sync_status?: string | null
          id?: string
          is_archived?: boolean
          is_closed?: boolean
          is_published?: boolean
          max_adults?: number
          max_children?: number
          max_guests?: number
          pet_policy?: string
          primary_image_url?: string | null
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
          airbnb_listing_id?: string | null
          airbnb_url?: string | null
          base_rate_cents?: number
          bathrooms?: number
          bedrooms?: number
          beds?: number
          cleaning_fee_cents?: number
          cleanliness_state?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ical_export_token?: string | null
          ical_import_url?: string | null
          ical_last_attempt_at?: string | null
          ical_last_synced_at?: string | null
          ical_sync_status?: string | null
          id?: string
          is_archived?: boolean
          is_closed?: boolean
          is_published?: boolean
          max_adults?: number
          max_children?: number
          max_guests?: number
          pet_policy?: string
          primary_image_url?: string | null
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
      venue_rate_cards: {
        Row: {
          catering_offer_note: string | null
          catering_weekday_rate_cents: number | null
          code: string
          created_at: string
          description: string | null
          duration_hours: number
          excludes_weddings: boolean
          id: string
          includes: string[]
          inquiry_category: string
          is_active: boolean
          label: string
          max_guests: number | null
          sort_order: number
          updated_at: string
          weekday_label: string
          weekday_rate_cents: number
          weekend_label: string
          weekend_rate_cents: number
        }
        Insert: {
          catering_offer_note?: string | null
          catering_weekday_rate_cents?: number | null
          code: string
          created_at?: string
          description?: string | null
          duration_hours?: number
          excludes_weddings?: boolean
          id?: string
          includes?: string[]
          inquiry_category?: string
          is_active?: boolean
          label: string
          max_guests?: number | null
          sort_order?: number
          updated_at?: string
          weekday_label?: string
          weekday_rate_cents: number
          weekend_label?: string
          weekend_rate_cents: number
        }
        Update: {
          catering_offer_note?: string | null
          catering_weekday_rate_cents?: number | null
          code?: string
          created_at?: string
          description?: string | null
          duration_hours?: number
          excludes_weddings?: boolean
          id?: string
          includes?: string[]
          inquiry_category?: string
          is_active?: boolean
          label?: string
          max_guests?: number | null
          sort_order?: number
          updated_at?: string
          weekday_label?: string
          weekday_rate_cents?: number
          weekend_label?: string
          weekend_rate_cents?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_inventory: {
        Args: {
          p_adults?: number
          p_booking_reference: string
          p_checkin_date?: string
          p_checkout_date?: string
          p_children?: number
          p_created_by?: string
          p_currency: string
          p_group_id?: string
          p_guest_email: string
          p_guest_name: string
          p_guest_phone: string
          p_hold_expires_at?: string
          p_owner_type?: string
          p_policy_version?: string
          p_source: string
          p_status: string
          p_total_cents: number
          p_units?: Json
        }
        Returns: Json
      }
      amend_reservation: {
        Args: {
          p_adults: number
          p_children: number
          p_created_by: string
          p_new_checkin: string
          p_new_checkout: string
          p_new_total_cents: number
          p_new_units: Json
          p_reservation_id: string
        }
        Returns: Json
      }
      claim_block: {
        Args: {
          p_checkin_date: string
          p_checkout_date: string
          p_created_by?: string
          p_group_id?: string
          p_owner_type: string
          p_reason?: string
          p_unit_id: string
        }
        Returns: Json
      }
      claim_external_block: {
        Args: {
          p_checkin_date: string
          p_checkout_date: string
          p_created_by?: string
          p_owner_type: string
          p_source_uid: string
          p_unit_id: string
        }
        Returns: Json
      }
      group_pickup: {
        Args: {
          p_adults: number
          p_booking_reference: string
          p_checkin_date: string
          p_checkout_date: string
          p_children: number
          p_created_by: string
          p_group_id: string
          p_guest_email: string
          p_guest_name: string
          p_guest_phone: string
          p_unit_id: string
        }
        Returns: Json
      }
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
      reconcile_external_event: {
        Args: {
          p_checkin_date: string
          p_checkout_date: string
          p_owner_type: string
          p_source_uid: string
          p_unit_id: string
        }
        Returns: Json
      }
      release_block: { Args: { p_block_id: string }; Returns: undefined }
      release_external_block: {
        Args: { p_source_uid: string; p_unit_id: string }
        Returns: undefined
      }
      release_reservation: {
        Args: { p_reservation_id: string }
        Returns: undefined
      }
      reservation_amount_due: {
        Args: { p_reservation_id: string }
        Returns: number
      }
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
