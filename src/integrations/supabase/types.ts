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
      admin_invites: {
        Row: {
          claimed_at: string | null
          created_at: string
          email: string
          invited_by: string | null
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          email: string
          invited_by?: string | null
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          email?: string
          invited_by?: string | null
        }
        Relationships: []
      }
      ai_roadmaps: {
        Row: {
          catalog_version: number
          created_at: string
          guidance: string
          id: string
          model: string
          module_id: string
          preferences: Json
          topic_ids: Json
          user_id: string
        }
        Insert: {
          catalog_version: number
          created_at?: string
          guidance?: string
          id?: string
          model: string
          module_id: string
          preferences: Json
          topic_ids: Json
          user_id: string
        }
        Update: {
          catalog_version?: number
          created_at?: string
          guidance?: string
          id?: string
          model?: string
          module_id?: string
          preferences?: Json
          topic_ids?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_roadmaps_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_answers: {
        Row: {
          attempt_id: string
          position: number
          question_id: string
          selected_option: number | null
        }
        Insert: {
          attempt_id: string
          position: number
          question_id: string
          selected_option?: number | null
        }
        Update: {
          attempt_id?: string
          position?: number
          question_id?: string
          selected_option?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "student_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          bank_key: string
          correct_option: number
          created_at: string
          difficulty: string
          explanation: string
          id: string
          options: Json
          prompt: string
          review_status: string
          skill: string
          topic: string
        }
        Insert: {
          bank_key: string
          correct_option: number
          created_at?: string
          difficulty: string
          explanation: string
          id?: string
          options: Json
          prompt: string
          review_status?: string
          skill: string
          topic: string
        }
        Update: {
          bank_key?: string
          correct_option?: number
          created_at?: string
          difficulty?: string
          explanation?: string
          id?: string
          options?: Json
          prompt?: string
          review_status?: string
          skill?: string
          topic?: string
        }
        Relationships: []
      }
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
      class_attendance: {
        Row: {
          created_at: string
          id: string
          recorded_by: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recorded_by: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recorded_by?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          created_by: string
          ends_at: string
          id: string
          meeting_url: string | null
          starts_at: string
          title: string
        }
        Insert: {
          created_by: string
          ends_at: string
          id?: string
          meeting_url?: string | null
          starts_at: string
          title: string
        }
        Update: {
          created_by?: string
          ends_at?: string
          id?: string
          meeting_url?: string | null
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      coach_conversations: {
        Row: {
          active_request: string | null
          messages: Json
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_request?: string | null
          messages?: Json
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_request?: string | null
          messages?: Json
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_request_limits: {
        Row: {
          requests: number
          user_id: string
          window_start: string
        }
        Insert: {
          requests?: number
          user_id: string
          window_start?: string
        }
        Update: {
          requests?: number
          user_id?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_request_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_account_links: {
        Row: {
          approved_at: string
          approved_by: string
          student_id: string
          user_id: string
        }
        Insert: {
          approved_at?: string
          approved_by: string
          student_id: string
          user_id: string
        }
        Update: {
          approved_at?: string
          approved_by?: string
          student_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_account_links_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "learning_account_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_activities: {
        Row: {
          career: string
          content: Json
          created_at: string
          created_by: string
          description: string
          difficulty: string
          due_at: string | null
          evidence_weight: number
          id: string
          kind: string
          points: number
          resource_id: string | null
          skill: string
          title: string
        }
        Insert: {
          career: string
          content?: Json
          created_at?: string
          created_by: string
          description: string
          difficulty: string
          due_at?: string | null
          evidence_weight?: number
          id?: string
          kind: string
          points?: number
          resource_id?: string | null
          skill: string
          title: string
        }
        Update: {
          career?: string
          content?: Json
          created_at?: string
          created_by?: string
          description?: string
          difficulty?: string
          due_at?: string | null
          evidence_weight?: number
          id?: string
          kind?: string
          points?: number
          resource_id?: string | null
          skill?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_activities_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "learning_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_ai_limits: {
        Row: {
          requests: number
          user_id: string
          window_start: string
        }
        Insert: {
          requests?: number
          user_id: string
          window_start?: string
        }
        Update: {
          requests?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      learning_answer_keys: {
        Row: {
          activity_id: string
          answers: Json
        }
        Insert: {
          activity_id: string
          answers: Json
        }
        Update: {
          activity_id?: string
          answers?: Json
        }
        Relationships: [
          {
            foreignKeyName: "learning_answer_keys_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: true
            referencedRelation: "learning_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_link_audit: {
        Row: {
          approved_by: string
          created_at: string
          id: string
          student_id: string
          user_id: string
        }
        Insert: {
          approved_by: string
          created_at?: string
          id?: string
          student_id: string
          user_id: string
        }
        Update: {
          approved_by?: string
          created_at?: string
          id?: string
          student_id?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_modules: {
        Row: {
          created_at: string
          id: string
          notes_origin: string
          reviewed_at: string | null
          reviewed_by: string | null
          slug: string
          status: string
          title: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes_origin?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug: string
          status?: string
          title: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          notes_origin?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug?: string
          status?: string
          title?: string
          version?: number
        }
        Relationships: []
      }
      learning_notes: {
        Row: {
          content: Json
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          topic_id: string
          version: number
        }
        Insert: {
          content: Json
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          topic_id: string
          version?: number
        }
        Update: {
          content?: Json
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          topic_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_notes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_resources: {
        Row: {
          created_at: string
          created_by: string
          id: string
          provider: string
          title: string
          url: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          provider: string
          title: string
          url: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          provider?: string
          title?: string
          url?: string
          verified?: boolean
        }
        Relationships: []
      }
      learning_scoring_policies: {
        Row: {
          assessment_weight: number
          mastery_weight: number
          project_target: number
          project_weight: number
          version: number
        }
        Insert: {
          assessment_weight?: number
          mastery_weight?: number
          project_target?: number
          project_weight?: number
          version?: number
        }
        Update: {
          assessment_weight?: number
          mastery_weight?: number
          project_target?: number
          project_weight?: number
          version?: number
        }
        Relationships: []
      }
      learning_topics: {
        Row: {
          estimated_minutes: number
          id: string
          module_id: string
          position: number
          prerequisite: string | null
          title: string
        }
        Insert: {
          estimated_minutes?: number
          id: string
          module_id: string
          position: number
          prerequisite?: string | null
          title: string
        }
        Update: {
          estimated_minutes?: number
          id?: string
          module_id?: string
          position?: number
          prerequisite?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_topics_prerequisite_fkey"
            columns: ["prerequisite"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_assignments: {
        Row: {
          created_at: string
          mentor_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          mentor_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          mentor_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      mentor_feedback: {
        Row: {
          category: string
          created_at: string
          id: string
          mentor_id: string
          note: string
          student_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          mentor_id?: string
          note: string
          student_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          mentor_id?: string
          note?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      roadmap_milestones: {
        Row: {
          exercise: string
          id: string
          roadmap_id: string
          topic_ids: Json
          week: number
        }
        Insert: {
          exercise?: string
          id?: string
          roadmap_id: string
          topic_ids: Json
          week: number
        }
        Update: {
          exercise?: string
          id?: string
          roadmap_id?: string
          topic_ids?: Json
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_milestones_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "ai_roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_assessment_results: {
        Row: {
          created_at: string
          feedback: string
          graded_by: string
          id: string
          policy_version: number
          progress_id: string
          score: number
          skill: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          feedback: string
          graded_by: string
          id?: string
          policy_version: number
          progress_id: string
          score: number
          skill: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          feedback?: string
          graded_by?: string
          id?: string
          policy_version?: number
          progress_id?: string
          score?: number
          skill?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessment_results_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: true
            referencedRelation: "student_activity_progress"
            referencedColumns: ["id"]
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
      student_accounts: {
        Row: {
          complete: boolean
          profile: Json | null
          roadmap_done: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          complete?: boolean
          profile?: Json | null
          roadmap_done?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          complete?: boolean
          profile?: Json | null
          roadmap_done?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_activity_progress: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          points: number
          status: string
          submission: Json
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          points?: number
          status?: string
          submission: Json
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          points?: number
          status?: string
          submission?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_activity_progress_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "learning_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      student_assessments: {
        Row: {
          expires_at: string
          id: string
          marks: number | null
          percentage: number | null
          proficiency: string | null
          skill: string
          started_at: string
          status: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          expires_at?: string
          id?: string
          marks?: number | null
          percentage?: number | null
          proficiency?: string | null
          skill: string
          started_at?: string
          status?: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          marks?: number | null
          percentage?: number | null
          proficiency?: string | null
          skill?: string
          started_at?: string
          status?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      student_learning_sessions: {
        Row: {
          active_seconds: number
          id: string
          last_at: string
          last_event: string | null
          topic_id: string
          user_id: string
        }
        Insert: {
          active_seconds?: number
          id?: string
          last_at?: string
          last_event?: string | null
          topic_id: string
          user_id: string
        }
        Update: {
          active_seconds?: number
          id?: string
          last_at?: string
          last_event?: string | null
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_learning_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      student_quiz_answers: {
        Row: {
          attempt_id: string
          position: number
          question_id: string
          selected_option: number | null
        }
        Insert: {
          attempt_id: string
          position: number
          question_id: string
          selected_option?: number | null
        }
        Update: {
          attempt_id?: string
          position?: number
          question_id?: string
          selected_option?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_quiz_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "student_quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "topic_quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_quiz_attempts: {
        Row: {
          id: string
          marks: number | null
          passed: boolean | null
          percentage: number | null
          started_at: string
          status: string
          submitted_at: string | null
          topic_id: string
          user_id: string
        }
        Insert: {
          id?: string
          marks?: number | null
          passed?: boolean | null
          percentage?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          topic_id: string
          user_id: string
        }
        Update: {
          id?: string
          marks?: number | null
          passed?: boolean | null
          percentage?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_quiz_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      student_skill_history: {
        Row: {
          assessment_id: string
          created_at: string
          id: string
          policy_version: number
          score: number
          skill: string
          user_id: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          id?: string
          policy_version: number
          score: number
          skill: string
          user_id: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          id?: string
          policy_version?: number
          score?: number
          skill?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_skill_history_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: true
            referencedRelation: "skill_assessment_results"
            referencedColumns: ["id"]
          },
        ]
      }
      student_skill_proficiency: {
        Row: {
          attempt_id: string
          percentage: number
          proficiency: string
          skill: string
          user_id: string
          verified_at: string
        }
        Insert: {
          attempt_id: string
          percentage: number
          proficiency: string
          skill: string
          user_id: string
          verified_at: string
        }
        Update: {
          attempt_id?: string
          percentage?: number
          proficiency?: string
          skill?: string
          user_id?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_skill_proficiency_attempt_id_user_id_fkey"
            columns: ["attempt_id", "user_id"]
            isOneToOne: false
            referencedRelation: "student_assessments"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "student_skill_proficiency_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
      student_topic_progress: {
        Row: {
          completed_at: string | null
          passed_attempt: string | null
          started_at: string
          topic_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          passed_attempt?: string | null
          started_at?: string
          topic_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          passed_attempt?: string | null
          started_at?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_topic_progress_passed_attempt_user_id_fkey"
            columns: ["passed_attempt", "user_id"]
            isOneToOne: false
            referencedRelation: "student_quiz_attempts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "student_topic_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
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
      support_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          kind: string
          message: string
          name: string
          rating: number | null
          status: string
          subject: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          kind: string
          message: string
          name: string
          rating?: number | null
          status?: string
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          kind?: string
          message?: string
          name?: string
          rating?: number | null
          status?: string
          subject?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      topic_quiz_questions: {
        Row: {
          correct_option: number
          explanation: string
          id: string
          options: Json
          prompt: string
          status: string
          topic_id: string
          version: number
        }
        Insert: {
          correct_option: number
          explanation: string
          id?: string
          options: Json
          prompt: string
          status?: string
          topic_id: string
          version?: number
        }
        Update: {
          correct_option?: number
          explanation?: string
          id?: string
          options?: Json
          prompt?: string
          status?: string
          topic_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "topic_quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          roles: string[]
        }[]
      }
      assessment_finalize_internal: {
        Args: { p_attempt: string }
        Returns: undefined
      }
      assessment_save: {
        Args: { p_attempt: string; p_option: number; p_question: string }
        Returns: Json
      }
      assessment_snapshot: { Args: { p_attempt: string }; Returns: Json }
      assessment_start: { Args: { p_skill: string }; Returns: string }
      assessment_submit: { Args: { p_attempt: string }; Returns: Json }
      can_read_learning: { Args: { p_user: string }; Returns: boolean }
      can_view_student: { Args: { _student_id: string }; Returns: boolean }
      coach_begin:
        | { Args: { p_request: string; p_text: string }; Returns: Json }
        | {
            Args: { p_request: string; p_text: string; p_user: string }
            Returns: Json
          }
      coach_clear: { Args: never; Returns: undefined }
      coach_finish:
        | { Args: { p_request: string; p_text: string }; Returns: undefined }
        | {
            Args: { p_request: string; p_text: string; p_user: string }
            Returns: undefined
          }
      curriculum_admin_approve: {
        Args: { p_attested: boolean; p_module: string }
        Returns: undefined
      }
      curriculum_admin_save: {
        Args: {
          p_module: string
          p_notes: Json
          p_questions: Json
          p_title: string
          p_topic: string
        }
        Returns: undefined
      }
      curriculum_admin_snapshot: { Args: never; Returns: Json }
      curriculum_import_notes: { Args: { p_topics: Json }; Returns: string }
      curriculum_snapshot: { Args: { p_user?: string }; Returns: Json }
      curriculum_topic: { Args: { p_topic: string }; Returns: Json }
      curriculum_topic_allowed: { Args: { p_topic: string }; Returns: boolean }
      get_analytics: {
        Args: { p_branch?: string; p_degree?: string }
        Returns: Json
      }
      get_dashboard_analytics: {
        Args: { p_branch?: string; p_degree?: string }
        Returns: Json
      }
      get_data_quality: { Args: never; Returns: Json }
      get_my_cohort_dashboard: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      learning_admin: {
        Args: { p_command: string; p_data: Json }
        Returns: string
      }
      learning_grade: {
        Args: { p_feedback: string; p_progress: string; p_score: number }
        Returns: string
      }
      learning_plan_reserve: { Args: never; Returns: undefined }
      learning_plan_save: {
        Args: {
          p_guidance: string
          p_milestones: Json
          p_model: string
          p_module: string
          p_preferences: Json
          p_topics: Json
        }
        Returns: string
      }
      learning_snapshot: { Args: { p_user?: string }; Returns: Json }
      learning_submit: {
        Args: { p_activity: string; p_submission: Json }
        Returns: string
      }
      topic_activity_record: {
        Args: { p_event: string; p_topic: string }
        Returns: number
      }
      topic_quiz_save: {
        Args: { p_attempt: string; p_option: number; p_question: string }
        Returns: Json
      }
      topic_quiz_snapshot: { Args: { p_attempt: string }; Returns: Json }
      topic_quiz_start: { Args: { p_topic: string }; Returns: Json }
      topic_quiz_submit: { Args: { p_attempt: string }; Returns: Json }
    }
    Enums: {
      app_role: "student" | "mentor" | "admin"
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
      app_role: ["student", "mentor", "admin"],
    },
  },
} as const
