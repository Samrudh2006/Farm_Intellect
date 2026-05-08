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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          action_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          action_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          action_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      billing_accounts: {
        Row: {
          account_name: string
          account_type: string
          billing_status: string
          created_at: string
          id: string
          monthly_budget_paise: number
          plan_tier: string
          subscriber_id: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_type?: string
          billing_status?: string
          created_at?: string
          id?: string
          monthly_budget_paise?: number
          plan_tier?: string
          subscriber_id?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_type?: string
          billing_status?: string
          created_at?: string
          id?: string
          monthly_budget_paise?: number
          plan_tier?: string
          subscriber_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_accounts_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "sms_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          category: string | null
          created_at: string
          description: string
          expert_id: string | null
          farmer_id: string
          id: string
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          expert_id?: string | null
          farmer_id: string
          id?: string
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          expert_id?: string | null
          farmer_id?: string
          id?: string
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      missed_call_events: {
        Row: {
          created_at: string
          id: string
          payload: Json
          phone: string
          processed_at: string | null
          provider: string
          provider_call_id: string | null
          status: string
          subscriber_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          phone: string
          processed_at?: string | null
          provider?: string
          provider_call_id?: string | null
          status?: string
          subscriber_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          phone?: string
          processed_at?: string | null
          provider?: string
          provider_call_id?: string | null
          status?: string
          subscriber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missed_call_events_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "sms_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount_paise: number
          billing_account_id: string | null
          created_at: string
          currency: string
          id: string
          metadata: Json
          paid_at: string | null
          payment_provider: string
          provider_ref: string | null
          status: string
        }
        Insert: {
          amount_paise: number
          billing_account_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          paid_at?: string | null
          payment_provider?: string
          provider_ref?: string | null
          status?: string
        }
        Update: {
          amount_paise?: number
          billing_account_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          paid_at?: string | null
          payment_provider?: string
          provider_ref?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_billing_account_id_fkey"
            columns: ["billing_account_id"]
            isOneToOne: false
            referencedRelation: "billing_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_plans: {
        Row: {
          area_acres: number | null
          created_at: string | null
          crop_name: string
          expected_harvest: string | null
          id: string
          notes: string | null
          season: string
          sowing_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_acres?: number | null
          created_at?: string | null
          crop_name: string
          expected_harvest?: string | null
          id?: string
          notes?: string | null
          season: string
          sowing_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_acres?: number | null
          created_at?: string | null
          crop_name?: string
          expected_harvest?: string | null
          id?: string
          notes?: string | null
          season?: string
          sowing_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      field_events: {
        Row: {
          created_at: string | null
          event_date: string | null
          event_description: string
          event_type: string
          field_name: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_date?: string | null
          event_description: string
          event_type: string
          field_name?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_date?: string | null
          event_description?: string
          event_type?: string
          field_name?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      knowledge_articles: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          id: string
          published_at: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          content: string
          created_at?: string
          id?: string
          published_at?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          published_at?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          crop_enabled: boolean
          id: string
          market_enabled: boolean
          push_enabled: boolean
          updated_at: string
          user_id: string
          weather_enabled: boolean
        }
        Insert: {
          created_at?: string
          crop_enabled?: boolean
          id?: string
          market_enabled?: boolean
          push_enabled?: boolean
          updated_at?: string
          user_id: string
          weather_enabled?: boolean
        }
        Update: {
          created_at?: string
          crop_enabled?: boolean
          id?: string
          market_enabled?: boolean
          push_enabled?: boolean
          updated_at?: string
          user_id?: string
          weather_enabled?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          crop_name: string
          delivery_date: string | null
          farmer_id: string | null
          id: string
          merchant_id: string
          notes: string | null
          payment_status: string | null
          price_per_kg: number
          quantity_kg: number
          status: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          crop_name: string
          delivery_date?: string | null
          farmer_id?: string | null
          id?: string
          merchant_id: string
          notes?: string | null
          payment_status?: string | null
          price_per_kg?: number
          quantity_kg?: number
          status?: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          crop_name?: string
          delivery_date?: string | null
          farmer_id?: string | null
          id?: string
          merchant_id?: string
          notes?: string | null
          payment_status?: string | null
          price_per_kg?: number
          quantity_kg?: number
          status?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          purpose: string
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          purpose?: string
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          purpose?: string
          used_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string | null
          id: string
          location: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheme_matches: {
        Row: {
          eligibility_score: number | null
          id: string
          matched_at: string | null
          scheme_name: string
          scheme_type: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          eligibility_score?: number | null
          id?: string
          matched_at?: string | null
          scheme_name: string
          scheme_type?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          eligibility_score?: number | null
          id?: string
          matched_at?: string | null
          scheme_name?: string
          scheme_type?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sms_log: {
        Row: {
          body: string
          cost_paise: number | null
          created_at: string
          error: string | null
          id: string
          provider_msg_id: string | null
          sent_at: string | null
          status: string
          subscriber_id: string | null
          template_key: string
        }
        Insert: {
          body: string
          cost_paise?: number | null
          created_at?: string
          error?: string | null
          id?: string
          provider_msg_id?: string | null
          sent_at?: string | null
          status?: string
          subscriber_id?: string | null
          template_key: string
        }
        Update: {
          body?: string
          cost_paise?: number | null
          created_at?: string
          error?: string | null
          id?: string
          provider_msg_id?: string | null
          sent_at?: string | null
          status?: string
          subscriber_id?: string | null
          template_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_log_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "sms_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_subscribers: {
        Row: {
          active: boolean
          billing_cycle_start: string
          consent_at: string
          created_at: string
          crop: string | null
          district: string
          farmer_type: string
          gram_panchayat: string | null
          id: string
          language: string
          monthly_sms_quota: number
          name: string
          plan_started_at: string
          plan_status: string
          plan_tier: string
          phone: string
          registered_by: string | null
          sevak_id: string | null
          sms_sent_this_month: number
          source: string
          state: string
          updated_at: string
          user_id: string | null
          village: string | null
        }
        Insert: {
          active?: boolean
          billing_cycle_start?: string
          consent_at?: string
          created_at?: string
          crop?: string | null
          district: string
          farmer_type?: string
          gram_panchayat?: string | null
          id?: string
          language?: string
          monthly_sms_quota?: number
          name: string
          plan_started_at?: string
          plan_status?: string
          plan_tier?: string
          phone: string
          registered_by?: string | null
          sevak_id?: string | null
          sms_sent_this_month?: number
          source?: string
          state: string
          updated_at?: string
          user_id?: string | null
          village?: string | null
        }
        Update: {
          active?: boolean
          billing_cycle_start?: string
          consent_at?: string
          created_at?: string
          crop?: string | null
          district?: string
          farmer_type?: string
          gram_panchayat?: string | null
          id?: string
          language?: string
          monthly_sms_quota?: number
          name?: string
          plan_started_at?: string
          plan_status?: string
          plan_tier?: string
          phone?: string
          registered_by?: string | null
          sevak_id?: string | null
          sms_sent_this_month?: number
          source?: string
          state?: string
          updated_at?: string
          user_id?: string | null
          village?: string | null
        }
        Relationships: []
      }
      sms_opt_out_events: {
        Row: {
          created_at: string
          id: string
          keyword: string
          payload: Json
          phone: string
          source: string
          subscriber_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          keyword: string
          payload?: Json
          phone: string
          source?: string
          subscriber_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          keyword?: string
          payload?: Json
          phone?: string
          source?: string
          subscriber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_opt_out_events_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "sms_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_schedules: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          day_of_week: number
          id: string
          kind: string
          name: string
          send_time: string
          template_key: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          day_of_week: number
          id?: string
          kind: string
          name: string
          send_time?: string
          template_key: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          day_of_week?: number
          id?: string
          kind?: string
          name?: string
          send_time?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      sms_templates: {
        Row: {
          body: string
          created_at: string
          dlt_template_id: string | null
          id: string
          key: string
          language: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          dlt_template_id?: string | null
          id?: string
          key: string
          language: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          dlt_template_id?: string | null
          id?: string
          key?: string
          language?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_assign_role: {
        Args: {
          _new_role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: undefined
      }
      assign_default_role: { Args: { _user_id: string }; Returns: undefined }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_sms_counter: {
        Args: { subscriber_id_input: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "farmer" | "merchant" | "expert" | "admin"
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
      app_role: ["farmer", "merchant", "expert", "admin"],
    },
  },
} as const
