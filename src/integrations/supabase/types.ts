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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campaign_runs: {
        Row: {
          campaign_id: string | null
          completed_at: string | null
          id: string
          results: Json | null
          started_at: string
          status: string | null
        }
        Insert: {
          campaign_id?: string | null
          completed_at?: string | null
          id?: string
          results?: Json | null
          started_at?: string
          status?: string | null
        }
        Update: {
          campaign_id?: string | null
          completed_at?: string | null
          id?: string
          results?: Json | null
          started_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_runs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          configuration: Json | null
          created_at: string
          description: string | null
          genome_id: string | null
          id: string
          name: string
          status: string | null
          target_metric: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          description?: string | null
          genome_id?: string | null
          id?: string
          name: string
          status?: string | null
          target_metric: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          description?: string | null
          genome_id?: string | null
          id?: string
          name?: string
          status?: string | null
          target_metric?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_genome_id_fkey"
            columns: ["genome_id"]
            isOneToOne: false
            referencedRelation: "genomes"
            referencedColumns: ["id"]
          },
        ]
      }
      genome_suggestions: {
        Row: {
          confidence: number | null
          created_at: string
          description: string | null
          genome_id: string | null
          id: string
          priority: string | null
          status: string | null
          suggestion_type: string
          template_patch: string | null
          title: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          genome_id?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          suggestion_type: string
          template_patch?: string | null
          title: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          genome_id?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          suggestion_type?: string
          template_patch?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "genome_suggestions_genome_id_fkey"
            columns: ["genome_id"]
            isOneToOne: false
            referencedRelation: "genomes"
            referencedColumns: ["id"]
          },
        ]
      }
      genomes: {
        Row: {
          created_at: string
          genome_data: Json | null
          id: string
          metrics: Json | null
          name: string
          repository_url: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          genome_data?: Json | null
          id?: string
          metrics?: Json | null
          name: string
          repository_url?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          genome_data?: Json | null
          id?: string
          metrics?: Json | null
          name?: string
          repository_url?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mutation_history: {
        Row: {
          action: string
          actor: string
          created_at: string
          id: string
          metadata: Json | null
          mutation_id: string | null
        }
        Insert: {
          action: string
          actor: string
          created_at?: string
          id?: string
          metadata?: Json | null
          mutation_id?: string | null
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          mutation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mutation_history_mutation_id_fkey"
            columns: ["mutation_id"]
            isOneToOne: false
            referencedRelation: "mutations"
            referencedColumns: ["id"]
          },
        ]
      }
      mutation_tests: {
        Row: {
          cost_per_request: number | null
          cpu_usage: number | null
          created_at: string
          id: string
          latency_ms: number | null
          memory_usage: number | null
          mutation_id: string | null
          pass_rate: number | null
          test_results: Json | null
        }
        Insert: {
          cost_per_request?: number | null
          cpu_usage?: number | null
          created_at?: string
          id?: string
          latency_ms?: number | null
          memory_usage?: number | null
          mutation_id?: string | null
          pass_rate?: number | null
          test_results?: Json | null
        }
        Update: {
          cost_per_request?: number | null
          cpu_usage?: number | null
          created_at?: string
          id?: string
          latency_ms?: number | null
          memory_usage?: number | null
          mutation_id?: string | null
          pass_rate?: number | null
          test_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mutation_tests_mutation_id_fkey"
            columns: ["mutation_id"]
            isOneToOne: false
            referencedRelation: "mutations"
            referencedColumns: ["id"]
          },
        ]
      }
      mutations: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          campaign_id: string | null
          composite_score: number | null
          confidence_score: number | null
          created_at: string
          description: string | null
          diff: string | null
          explain: string | null
          genome_id: string | null
          id: string
          metrics_after: Json | null
          metrics_before: Json | null
          mutated_code: string | null
          mutation_type: string
          original_code: string | null
          safety_score: number | null
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          campaign_id?: string | null
          composite_score?: number | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          diff?: string | null
          explain?: string | null
          genome_id?: string | null
          id?: string
          metrics_after?: Json | null
          metrics_before?: Json | null
          mutated_code?: string | null
          mutation_type: string
          original_code?: string | null
          safety_score?: number | null
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          campaign_id?: string | null
          composite_score?: number | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          diff?: string | null
          explain?: string | null
          genome_id?: string | null
          id?: string
          metrics_after?: Json | null
          metrics_before?: Json | null
          mutated_code?: string | null
          mutation_type?: string
          original_code?: string | null
          safety_score?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mutations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mutations_genome_id_fkey"
            columns: ["genome_id"]
            isOneToOne: false
            referencedRelation: "genomes"
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Enums: {
      app_role: "admin" | "developer" | "viewer"
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
      app_role: ["admin", "developer", "viewer"],
    },
  },
} as const
