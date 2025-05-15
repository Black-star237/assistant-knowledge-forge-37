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
      code_promo: {
        Row: {
          contenu: string | null
          created_at: string
          id: number
          id_vector: number | null
          titre: string | null
          user_profile: string | null
        }
        Insert: {
          contenu?: string | null
          created_at?: string
          id?: number
          id_vector?: number | null
          titre?: string | null
          user_profile?: string | null
        }
        Update: {
          contenu?: string | null
          created_at?: string
          id?: number
          id_vector?: number | null
          titre?: string | null
          user_profile?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_promo_id_vector_fkey"
            columns: ["id_vector"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_promo_user_profile_fkey"
            columns: ["user_profile"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code_du_coupon: string | null
          commentaire: string | null
          created_at: string
          "description visuelle": string | null
          Heure: string | null
          id: number
          id_vector: number | null
          image_url: string | null
          jour: string | null
          odds: string | null
          user_id: string | null
        }
        Insert: {
          code_du_coupon?: string | null
          commentaire?: string | null
          created_at?: string
          "description visuelle"?: string | null
          Heure?: string | null
          id?: number
          id_vector?: number | null
          image_url?: string | null
          jour?: string | null
          odds?: string | null
          user_id?: string | null
        }
        Update: {
          code_du_coupon?: string | null
          commentaire?: string | null
          created_at?: string
          "description visuelle"?: string | null
          Heure?: string | null
          id?: number
          id_vector?: number | null
          image_url?: string | null
          jour?: string | null
          odds?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_id_vector_fkey"
            columns: ["id_vector"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Coupons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      exemples_de_discussions: {
        Row: {
          created_at: string
          discussion: string | null
          id: number
          id_vector: number | null
          titre: string | null
          user_profile: string | null
        }
        Insert: {
          created_at?: string
          discussion?: string | null
          id?: number
          id_vector?: number | null
          titre?: string | null
          user_profile?: string | null
        }
        Update: {
          created_at?: string
          discussion?: string | null
          id?: number
          id_vector?: number | null
          titre?: string | null
          user_profile?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exemples_de_discussions_id_vector_fkey"
            columns: ["id_vector"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exemples_de_discussions_user_profile_fkey"
            columns: ["user_profile"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      informations_bot: {
        Row: {
          "codes promo": string | null
          created_at: string
          "exemples de discutions": string | null
          id: string
          "liens utiles": string | null
          règles: string | null
          user_id: string
        }
        Insert: {
          "codes promo"?: string | null
          created_at?: string
          "exemples de discutions"?: string | null
          id?: string
          "liens utiles"?: string | null
          règles?: string | null
          user_id: string
        }
        Update: {
          "codes promo"?: string | null
          created_at?: string
          "exemples de discutions"?: string | null
          id?: string
          "liens utiles"?: string | null
          règles?: string | null
          user_id?: string
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
      liens_utiles: {
        Row: {
          contenu: string | null
          created_at: string
          id: number
          id_vector: number | null
          titre: string | null
          user_profile: string
        }
        Insert: {
          contenu?: string | null
          created_at?: string
          id?: number
          id_vector?: number | null
          titre?: string | null
          user_profile: string
        }
        Update: {
          contenu?: string | null
          created_at?: string
          id?: number
          id_vector?: number | null
          titre?: string | null
          user_profile?: string
        }
        Relationships: [
          {
            foreignKeyName: "liens_utiles_id_vector_fkey"
            columns: ["id_vector"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liens_utiles_user_profile_fkey"
            columns: ["user_profile"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      problemes_et_solutions: {
        Row: {
          category: string | null
          created_at: string
          Description: string | null
          id: number
          id_vector: number | null
          Solutions: string | null
          tags: string | null
          titre: string | null
          user_profile: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          Description?: string | null
          id?: number
          id_vector?: number | null
          Solutions?: string | null
          tags?: string | null
          titre?: string | null
          user_profile?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          Description?: string | null
          id?: number
          id_vector?: number | null
          Solutions?: string | null
          tags?: string | null
          titre?: string | null
          user_profile?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "problemes_et_solutions_id_vector_fkey"
            columns: ["id_vector"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problèmes_et_solutions_user_profile_fkey"
            columns: ["user_profile"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          created_at: string
          description: string | null
          etapes_procedure: string | null
          id: number
          id_vector: number | null
          Titre_procedure: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          etapes_procedure?: string | null
          id?: number
          id_vector?: number | null
          Titre_procedure?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          etapes_procedure?: string | null
          id?: number
          id_vector?: number | null
          Titre_procedure?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procedures_id_vector_fkey"
            columns: ["id_vector"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Procédures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      regles: {
        Row: {
          contenu: string | null
          created_at: string
          id: number
          id_vector: number | null
          titre: string | null
          user_profile: string | null
        }
        Insert: {
          contenu?: string | null
          created_at?: string
          id?: number
          id_vector?: number | null
          titre?: string | null
          user_profile?: string | null
        }
        Update: {
          contenu?: string | null
          created_at?: string
          id?: number
          id_vector?: number | null
          titre?: string | null
          user_profile?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regles_id_vector_fkey"
            columns: ["id_vector"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regles_user_profile_fkey"
            columns: ["user_profile"]
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
          "Numero whatsapp Bot": string | null
          "Numero Whatsapp perso": string | null
          Offre: string | null
          "Photo de profile": string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          nom?: string | null
          "Numero whatsapp Bot"?: string | null
          "Numero Whatsapp perso"?: string | null
          Offre?: string | null
          "Photo de profile"?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nom?: string | null
          "Numero whatsapp Bot"?: string | null
          "Numero Whatsapp perso"?: string | null
          Offre?: string | null
          "Photo de profile"?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
