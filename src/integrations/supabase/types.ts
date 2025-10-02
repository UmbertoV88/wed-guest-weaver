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
      budget_categories: {
        Row: {
          budgeted: number
          color: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          budgeted?: number
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          budgeted?: number
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          due_date: string | null
          expense_date: string
          id: string
          name: string
          notes: string | null
          paid: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          due_date?: string | null
          expense_date?: string
          id?: string
          name: string
          notes?: string | null
          paid?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          due_date?: string | null
          expense_date?: string
          id?: string
          name?: string
          notes?: string | null
          paid?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_settings: {
        Row: {
          created_at: string
          currency: string
          id: string
          total_budget: number
          updated_at: string
          user_id: string
          wedding_date: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          total_budget?: number
          updated_at?: string
          user_id: string
          wedding_date?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          total_budget?: number
          updated_at?: string
          user_id?: string
          wedding_date?: string | null
        }
        Relationships: []
      }
      budget_vendors: {
        Row: {
          address: string | null
          category_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          default_cost: number | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          payment_due_date: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_cost?: number | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          payment_due_date?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_cost?: number | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          payment_due_date?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_vendors_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      invitati: {
        Row: {
          cognome: string | null
          confermato: boolean | null
          created_at: string | null
          fascia_eta: Database["public"]["Enums"]["fascia_eta_enum"] | null
          gruppo: string | null
          id: number
          is_principale: boolean
          nome: string | null
          nome_visualizzato: string
          note: string | null
          unita_invito_id: number
          user_id: string
        }
        Insert: {
          cognome?: string | null
          confermato?: boolean | null
          created_at?: string | null
          fascia_eta?: Database["public"]["Enums"]["fascia_eta_enum"] | null
          gruppo?: string | null
          id?: number
          is_principale?: boolean
          nome?: string | null
          nome_visualizzato: string
          note?: string | null
          unita_invito_id: number
          user_id: string
        }
        Update: {
          cognome?: string | null
          confermato?: boolean | null
          created_at?: string | null
          fascia_eta?: Database["public"]["Enums"]["fascia_eta_enum"] | null
          gruppo?: string | null
          id?: number
          is_principale?: boolean
          nome?: string | null
          nome_visualizzato?: string
          note?: string | null
          unita_invito_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitati_unita_invito_id_fkey"
            columns: ["unita_invito_id"]
            isOneToOne: false
            referencedRelation: "unita_invito"
            referencedColumns: ["id"]
          },
        ]
      }
      piani_salvati: {
        Row: {
          created_at: string | null
          id: number
          invitato_id: number
          tavolo_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          invitato_id: number
          tavolo_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          invitato_id?: number
          tavolo_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "piani_salvati_invitato_id_fkey"
            columns: ["invitato_id"]
            isOneToOne: false
            referencedRelation: "invitati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piani_salvati_tavolo_id_fkey"
            columns: ["tavolo_id"]
            isOneToOne: false
            referencedRelation: "tavoli"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_wedding_organizer: boolean
          updated_at: string
          user_id: string
          wedding_date: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_wedding_organizer?: boolean
          updated_at?: string
          user_id: string
          wedding_date?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_wedding_organizer?: boolean
          updated_at?: string
          user_id?: string
          wedding_date?: string | null
        }
        Relationships: []
      }
      relazioni: {
        Row: {
          invitato_a_id: number
          invitato_b_id: number
          punteggio: number
          tipo_relazione: string | null
        }
        Insert: {
          invitato_a_id: number
          invitato_b_id: number
          punteggio: number
          tipo_relazione?: string | null
        }
        Update: {
          invitato_a_id?: number
          invitato_b_id?: number
          punteggio?: number
          tipo_relazione?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relazioni_invitato_a_id_fkey"
            columns: ["invitato_a_id"]
            isOneToOne: false
            referencedRelation: "invitati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relazioni_invitato_b_id_fkey"
            columns: ["invitato_b_id"]
            isOneToOne: false
            referencedRelation: "invitati"
            referencedColumns: ["id"]
          },
        ]
      }
      tavoli: {
        Row: {
          capacita_max: number
          created_at: string | null
          id: number
          lato: string | null
          nome_tavolo: string | null
          user_id: string
        }
        Insert: {
          capacita_max: number
          created_at?: string | null
          id?: number
          lato?: string | null
          nome_tavolo?: string | null
          user_id: string
        }
        Update: {
          capacita_max?: number
          created_at?: string | null
          id?: number
          lato?: string | null
          nome_tavolo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      unita_invito: {
        Row: {
          created_at: string | null
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      budget_statistics: {
        Row: {
          categories_count: number | null
          remaining_budget: number | null
          spent_percentage: number | null
          total_allocated: number | null
          total_budget: number | null
          total_spent: number | null
          user_id: string | null
          wedding_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_default_budget_categories: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_wedding_organizer: {
        Args: { user_id: string }
        Returns: boolean
      }
      promote_to_wedding_organizer: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      fascia_eta_enum: "Adulto" | "Ragazzo" | "Bambino"
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
      fascia_eta_enum: ["Adulto", "Ragazzo", "Bambino"],
    },
  },
} as const
