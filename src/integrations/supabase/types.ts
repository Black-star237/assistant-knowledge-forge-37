export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Coupons: {
        Row: {
          code_du_coupon: string | null
          commentaire: string | null
          created_at: string
          "description visuelle": string | null
          Heure: string | null
          id: number
          image_url: string | null
          jour: string | null
          user_id: string | null
        }
        Insert: {
          code_du_coupon?: string | null
          commentaire?: string | null
          created_at?: string
          "description visuelle"?: string | null
          Heure?: string | null
          id?: number
          image_url?: string | null
          jour?: string | null
          user_id?: string | null
        }
        Update: {
          code_du_coupon?: string | null
          commentaire?: string | null
          created_at?: string
          "description visuelle"?: string | null
          Heure?: string | null
          id?: number
          image_url?: string | null
          jour?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Coupons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      "Informations Bot": {
        Row: {
          "codes promo": string | null
          created_at: string
          "exemples de discutions": string | null
          id: number
          "liens utiles": string | null
          user_id: string | null
        }
        Insert: {
          "codes promo"?: string | null
          created_at?: string
          "exemples de discutions"?: string | null
          id?: number
          "liens utiles"?: string | null
          user_id?: string | null
        }
        Update: {
          "codes promo"?: string | null
          created_at?: string
          "exemples de discutions"?: string | null
          id?: number
          "liens utiles"?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Informations Bot_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Procédures: {
        Row: {
          created_at: string
          id: number
          "Inscription 1xbet": string | null
          "Inscription Mega pari": string | null
          "Inscription melbet": string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          "Inscription 1xbet"?: string | null
          "Inscription Mega pari"?: string | null
          "Inscription melbet"?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          "Inscription 1xbet"?: string | null
          "Inscription Mega pari"?: string | null
          "Inscription melbet"?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Procédures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      "Quelques problèmes et leurs solutions": {
        Row: {
          created_at: string
          id: number
          Problèmes: string | null
          Solutions: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          Problèmes?: string | null
          Solutions?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          Problèmes?: string | null
          Solutions?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Quelques problèmes et leurs solutions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          nom: string | null
          "Numero perso": string | null
          "Numero whatsapp": string | null
          valeure: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          nom?: string | null
          "Numero perso"?: string | null
          "Numero whatsapp"?: string | null
          valeure?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nom?: string | null
          "Numero perso"?: string | null
          "Numero whatsapp"?: string | null
          valeure?: string | null
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
