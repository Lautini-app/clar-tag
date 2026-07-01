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
    PostgrestVersion: "14.5"
  }
  clar_tag: {
    Tables: {
      families: {
        Row: {
          admin_user_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          id?: string
          name?: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      family_invites: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string
          family_id: string
          id: string
          kind: Database["clar_tag"]["Enums"]["invite_kind"]
          member_id: string
          pin_hash: string | null
          token: string | null
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at: string
          family_id: string
          id?: string
          kind: Database["clar_tag"]["Enums"]["invite_kind"]
          member_id: string
          pin_hash?: string | null
          token?: string | null
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string
          family_id?: string
          id?: string
          kind?: Database["clar_tag"]["Enums"]["invite_kind"]
          member_id?: string
          pin_hash?: string | null
          token?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invites_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invites_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_member_status: {
        Row: {
          current_step: number | null
          finished_at: string | null
          member_id: string
          started_at: string | null
          total_steps: number | null
          updated_at: string
          workflow_name: string | null
        }
        Insert: {
          current_step?: number | null
          finished_at?: string | null
          member_id: string
          started_at?: string | null
          total_steps?: number | null
          updated_at?: string
          workflow_name?: string | null
        }
        Update: {
          current_step?: number | null
          finished_at?: string | null
          member_id?: string
          started_at?: string | null
          total_steps?: number | null
          updated_at?: string
          workflow_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_member_status_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          created_at: string
          emoji: string
          family_id: string
          id: string
          name: string
          stage: Database["clar_tag"]["Enums"]["family_stage"]
          toggles: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          emoji?: string
          family_id: string
          id?: string
          name: string
          stage?: Database["clar_tag"]["Enums"]["family_stage"]
          toggles?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          emoji?: string
          family_id?: string
          id?: string
          name?: string
          stage?: Database["clar_tag"]["Enums"]["family_stage"]
          toggles?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_completions: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          user_id: string
          workflow_id: string | null
          workflow_key: string | null
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          user_id: string
          workflow_id?: string | null
          workflow_key?: string | null
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          user_id?: string
          workflow_id?: string | null
          workflow_key?: string | null
        }
        Relationships: []
      }
      workflow_schedules: {
        Row: {
          created_at: string
          id: string
          scheduled_at: string
          status: string
          user_id: string
          workflow_id: string | null
          workflow_key: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          scheduled_at: string
          status?: string
          user_id: string
          workflow_id?: string | null
          workflow_key?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          scheduled_at?: string
          status?: string
          user_id?: string
          workflow_id?: string | null
          workflow_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_schedules_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          category: string
          created_at: string
          icon: string | null
          id: string
          is_archived: boolean
          name: string
          steps: Json
          material: Json
          adhs_tips: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_archived?: boolean
          name: string
          steps?: Json
          material?: Json
          adhs_tips?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          steps?: Json
          material?: Json
          adhs_tips?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      library_routines: {
        Row: {
          id: string
          slug: string
          name: string
          icon: string
          category: string
          default_grade: string
          steps_grob: Json
          steps_mittel: Json
          steps_fein: Json
          material: Json
          adhs_tips: string | null
          variants: Json | null
          is_published: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          icon: string
          category: string
          default_grade?: string
          steps_grob?: Json
          steps_mittel?: Json
          steps_fein?: Json
          material?: Json
          adhs_tips?: string | null
          variants?: Json | null
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          icon?: string
          category?: string
          default_grade?: string
          steps_grob?: Json
          steps_mittel?: Json
          steps_fein?: Json
          material?: Json
          adhs_tips?: string | null
          variants?: Json | null
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_pin: {
        Args: { _pin: string }
        Returns: {
          family_id: string
          member_id: string
          name: string
        }[]
      }
      create_pin_invite: {
        Args: { _member_id: string }
        Returns: {
          expires_at: string
          pin: string
        }[]
      }
      is_family_admin: { Args: { _family_id: string }; Returns: boolean }
      is_family_member: { Args: { _family_id: string }; Returns: boolean }
    }
    Enums: {
      family_stage: "begleitet" | "unterstuetzt" | "selbststaendig"
      invite_kind: "pin" | "email"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "clar_tag">]

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
  clar_tag: {
    Enums: {
      family_stage: ["begleitet", "unterstuetzt", "selbststaendig"],
      invite_kind: ["pin", "email"],
    },
  },
} as const
