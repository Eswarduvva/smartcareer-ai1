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
      career_goals: {
        Row: {
          career_goal: string | null
          career_readiness_score: number | null
          expected_salary: number | null
          student_id: string
          study_hours_per_week: number | null
        }
        Insert: {
          career_goal?: string | null
          career_readiness_score?: number | null
          expected_salary?: number | null
          student_id: string
          study_hours_per_week?: number | null
        }
        Update: {
          career_goal?: string | null
          career_readiness_score?: number | null
          expected_salary?: number | null
          student_id?: string
          study_hours_per_week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "career_goals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      career_preferences: {
        Row: {
          preferred_industry: string | null
          preferred_location: string | null
          preferred_work_mode: string | null
          preferred_work_role: string | null
          primary_interest: string | null
          secondary_interest: string | null
          student_id: string
          willing_to_relocate: string | null
        }
        Insert: {
          preferred_industry?: string | null
          preferred_location?: string | null
          preferred_work_mode?: string | null
          preferred_work_role?: string | null
          primary_interest?: string | null
          secondary_interest?: string | null
          student_id: string
          willing_to_relocate?: string | null
        }
        Update: {
          preferred_industry?: string | null
          preferred_location?: string | null
          preferred_work_mode?: string | null
          preferred_work_role?: string | null
          primary_interest?: string | null
          secondary_interest?: string | null
          student_id?: string
          willing_to_relocate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_preferences_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      career_recommendations: {
        Row: {
          career_match_score: number | null
          recommended_career_domain: string | null
          recommended_role: string | null
          skill_gap_score: number | null
          student_id: string
        }
        Insert: {
          career_match_score?: number | null
          recommended_career_domain?: string | null
          recommended_role?: string | null
          skill_gap_score?: number | null
          student_id: string
        }
        Update: {
          career_match_score?: number | null
          recommended_career_domain?: string | null
          recommended_role?: string | null
          skill_gap_score?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_recommendations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      smartcareer_staging: {
        Row: {
          id: number
          imported_at: string
          raw: Json
        }
        Insert: {
          id?: number
          imported_at?: string
          raw: Json
        }
        Update: {
          id?: number
          imported_at?: string
          raw?: Json
        }
        Relationships: []
      }
      student_experience: {
        Row: {
          certification_count: number | null
          internship_count: number | null
          project_count: number | null
          student_id: string
          work_experience_months: number | null
        }
        Insert: {
          certification_count?: number | null
          internship_count?: number | null
          project_count?: number | null
          student_id: string
          work_experience_months?: number | null
        }
        Update: {
          certification_count?: number | null
          internship_count?: number | null
          project_count?: number | null
          student_id?: string
          work_experience_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_experience_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      student_skill_scores: {
        Row: {
          adaptability_score: number | null
          analytical_thinking_score: number | null
          aptitude_score: number | null
          communication_score: number | null
          creativity_score: number | null
          data_analysis_score: number | null
          deep_learning_score: number | null
          english_score: number | null
          leadership_score: number | null
          learning_interest_score: number | null
          logical_reasoning_score: number | null
          machine_learning_score: number | null
          problem_solving_score: number | null
          programming_score: number | null
          python_score: number | null
          sql_score: number | null
          statistics_score: number | null
          student_id: string
          teamwork_score: number | null
          technical_score: number | null
        }
        Insert: {
          adaptability_score?: number | null
          analytical_thinking_score?: number | null
          aptitude_score?: number | null
          communication_score?: number | null
          creativity_score?: number | null
          data_analysis_score?: number | null
          deep_learning_score?: number | null
          english_score?: number | null
          leadership_score?: number | null
          learning_interest_score?: number | null
          logical_reasoning_score?: number | null
          machine_learning_score?: number | null
          problem_solving_score?: number | null
          programming_score?: number | null
          python_score?: number | null
          sql_score?: number | null
          statistics_score?: number | null
          student_id: string
          teamwork_score?: number | null
          technical_score?: number | null
        }
        Update: {
          adaptability_score?: number | null
          analytical_thinking_score?: number | null
          aptitude_score?: number | null
          communication_score?: number | null
          creativity_score?: number | null
          data_analysis_score?: number | null
          deep_learning_score?: number | null
          english_score?: number | null
          leadership_score?: number | null
          learning_interest_score?: number | null
          logical_reasoning_score?: number | null
          machine_learning_score?: number | null
          problem_solving_score?: number | null
          programming_score?: number | null
          python_score?: number | null
          sql_score?: number | null
          statistics_score?: number | null
          student_id?: string
          teamwork_score?: number | null
          technical_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_skill_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      students: {
        Row: {
          age: number | null
          backlogs: number | null
          branch: string | null
          cgpa: number | null
          city: string | null
          college_type: string | null
          degree: string | null
          gender: string | null
          graduation_year: number | null
          higher_education_interest: string | null
          specialization: string | null
          state: string | null
          student_id: string
        }
        Insert: {
          age?: number | null
          backlogs?: number | null
          branch?: string | null
          cgpa?: number | null
          city?: string | null
          college_type?: string | null
          degree?: string | null
          gender?: string | null
          graduation_year?: number | null
          higher_education_interest?: string | null
          specialization?: string | null
          state?: string | null
          student_id: string
        }
        Update: {
          age?: number | null
          backlogs?: number | null
          branch?: string | null
          cgpa?: number | null
          city?: string | null
          college_type?: string | null
          degree?: string | null
          gender?: string | null
          graduation_year?: number | null
          higher_education_interest?: string | null
          specialization?: string | null
          state?: string | null
          student_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_analytics: {
        Args: { p_branch?: string; p_degree?: string }
        Returns: Json
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
    Enums: {},
  },
} as const
