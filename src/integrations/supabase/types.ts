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
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_wedding_organizer: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_wedding_organizer?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_wedding_organizer?: boolean
          updated_at?: string
          user_id?: string
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
          nome_tavolo: string | null
        }
        Insert: {
          capacita_max: number
          created_at?: string | null
          id?: number
          nome_tavolo?: string | null
        }
        Update: {
          capacita_max?: number
          created_at?: string | null
          id?: number
          nome_tavolo?: string | null
        }
        Relationships: []
      }
      unita_invito: {
        Row: {
          created_at: string | null
          id: number
        }
        Insert: {
          created_at?: string | null
          id?: number
        }
        Update: {
          created_at?: string | null
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_wedding_organizer: {
        Args: { user_id: string }
        Returns: boolean
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
