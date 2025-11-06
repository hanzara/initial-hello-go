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
      campaigns: {
        Row: {
          completed_at: string | null
          compute_budget: number | null
          created_at: string | null
          goal_weights: Json | null
          id: string
          max_variants: number | null
          mode: string | null
          name: string
          progress: number | null
          repository_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          compute_budget?: number | null
          created_at?: string | null
          goal_weights?: Json | null
          id?: string
          max_variants?: number | null
          mode?: string | null
          name: string
          progress?: number | null
          repository_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          compute_budget?: number | null
          created_at?: string | null
          goal_weights?: Json | null
          id?: string
          max_variants?: number | null
          mode?: string | null
          name?: string
          progress?: number | null
          repository_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      genome_dependencies: {
        Row: {
          created_at: string | null
          genome_id: string | null
          id: string
          name: string
          type: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          genome_id?: string | null
          id?: string
          name: string
          type?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          genome_id?: string | null
          id?: string
          name?: string
          type?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genome_dependencies_genome_id_fkey"
            columns: ["genome_id"]
            isOneToOne: false
            referencedRelation: "genomes"
            referencedColumns: ["id"]
          },
        ]
      }
      genome_functions: {
        Row: {
          complexity: number | null
          created_at: string | null
          genome_id: string | null
          id: string
          lines_of_code: number | null
          module_id: string | null
          name: string
        }
        Insert: {
          complexity?: number | null
          created_at?: string | null
          genome_id?: string | null
          id?: string
          lines_of_code?: number | null
          module_id?: string | null
          name: string
        }
        Update: {
          complexity?: number | null
          created_at?: string | null
          genome_id?: string | null
          id?: string
          lines_of_code?: number | null
          module_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "genome_functions_genome_id_fkey"
            columns: ["genome_id"]
            isOneToOne: false
            referencedRelation: "genomes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genome_functions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "genome_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      genome_health: {
        Row: {
          created_at: string | null
          details: Json | null
          genome_id: string | null
          id: string
          metric_name: string
          score: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          genome_id?: string | null
          id?: string
          metric_name: string
          score?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          genome_id?: string | null
          id?: string
          metric_name?: string
          score?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genome_health_genome_id_fkey"
            columns: ["genome_id"]
            isOneToOne: false
            referencedRelation: "genomes"
            referencedColumns: ["id"]
          },
        ]
      }
      genome_modules: {
        Row: {
          complexity: number | null
          created_at: string | null
          dependencies_count: number | null
          genome_id: string | null
          id: string
          lines_of_code: number | null
          name: string
          path: string | null
        }
        Insert: {
          complexity?: number | null
          created_at?: string | null
          dependencies_count?: number | null
          genome_id?: string | null
          id?: string
          lines_of_code?: number | null
          name: string
          path?: string | null
        }
        Update: {
          complexity?: number | null
          created_at?: string | null
          dependencies_count?: number | null
          genome_id?: string | null
          id?: string
          lines_of_code?: number | null
          name?: string
          path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genome_modules_genome_id_fkey"
            columns: ["genome_id"]
            isOneToOne: false
            referencedRelation: "genomes"
            referencedColumns: ["id"]
          },
        ]
      }
      genome_packages: {
        Row: {
          created_at: string | null
          genome_id: string | null
          id: string
          name: string
          size_kb: number | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          genome_id?: string | null
          id?: string
          name: string
          size_kb?: number | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          genome_id?: string | null
          id?: string
          name?: string
          size_kb?: number | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genome_packages_genome_id_fkey"
            columns: ["genome_id"]
            isOneToOne: false
            referencedRelation: "genomes"
            referencedColumns: ["id"]
          },
        ]
      }
      genome_suggestions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          genome_id: string | null
          id: string
          impact_score: number | null
          priority: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          genome_id?: string | null
          id?: string
          impact_score?: number | null
          priority?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          genome_id?: string | null
          id?: string
          impact_score?: number | null
          priority?: string | null
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
          complexity_score: number | null
          created_at: string | null
          health_score: number | null
          id: string
          repository_id: string | null
          total_dependencies: number | null
          total_functions: number | null
          total_modules: number | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          complexity_score?: number | null
          created_at?: string | null
          health_score?: number | null
          id?: string
          repository_id?: string | null
          total_dependencies?: number | null
          total_functions?: number | null
          total_modules?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          complexity_score?: number | null
          created_at?: string | null
          health_score?: number | null
          id?: string
          repository_id?: string | null
          total_dependencies?: number | null
          total_functions?: number | null
          total_modules?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genomes_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          lesson_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_comments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          title: string
          xp_points: number | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          title: string
          xp_points?: number | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          title?: string
          xp_points?: number | null
        }
        Relationships: []
      }
      mutation_history: {
        Row: {
          action: string
          actor: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          mutation_id: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mutation_id?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string | null
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
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
          created_at: string | null
          description: string | null
          diff: string | null
          explain: string | null
          id: string
          improvement_metrics: Json | null
          metrics_after: Json | null
          metrics_before: Json | null
          mutated_code: string | null
          mutation_type: string
          original_code: string | null
          repository_id: string | null
          safety_score: number | null
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          campaign_id?: string | null
          composite_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          diff?: string | null
          explain?: string | null
          id?: string
          improvement_metrics?: Json | null
          metrics_after?: Json | null
          metrics_before?: Json | null
          mutated_code?: string | null
          mutation_type: string
          original_code?: string | null
          repository_id?: string | null
          safety_score?: number | null
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          campaign_id?: string | null
          composite_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          diff?: string | null
          explain?: string | null
          id?: string
          improvement_metrics?: Json | null
          metrics_after?: Json | null
          metrics_before?: Json | null
          mutated_code?: string | null
          mutation_type?: string
          original_code?: string | null
          repository_id?: string | null
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
            foreignKeyName: "mutations_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      repositories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          lesson_id: string | null
          quiz_score: number | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          quiz_score?: number | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          quiz_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
