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
      Clients: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      "Company informations": {
        Row: {
          "Activity domain": string | null
          Client_digit: number | null
          created_at: string
          Email: string | null
          id: number
          Location: string | null
          Map: string | null
          "Phone number  1": number | null
          "Phone number 2": number | null
          Vision: string | null
        }
        Insert: {
          "Activity domain"?: string | null
          Client_digit?: number | null
          created_at?: string
          Email?: string | null
          id?: number
          Location?: string | null
          Map?: string | null
          "Phone number  1"?: number | null
          "Phone number 2"?: number | null
          Vision?: string | null
        }
        Update: {
          "Activity domain"?: string | null
          Client_digit?: number | null
          created_at?: string
          Email?: string | null
          id?: number
          Location?: string | null
          Map?: string | null
          "Phone number  1"?: number | null
          "Phone number 2"?: number | null
          Vision?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Company informations_Client_digit_fkey"
            columns: ["Client_digit"]
            isOneToOne: false
            referencedRelation: "Clients"
            referencedColumns: ["id"]
          },
        ]
      }
      "Leads messages": {
        Row: {
          Client_digit: number | null
          "contact id": number | null
          created_at: string
          id: number
          "Last update": string | null
          message: string | null
          Responses: string | null
        }
        Insert: {
          Client_digit?: number | null
          "contact id"?: number | null
          created_at?: string
          id?: number
          "Last update"?: string | null
          message?: string | null
          Responses?: string | null
        }
        Update: {
          Client_digit?: number | null
          "contact id"?: number | null
          created_at?: string
          id?: number
          "Last update"?: string | null
          message?: string | null
          Responses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Leads messages_Client_digit_fkey"
            columns: ["Client_digit"]
            isOneToOne: false
            referencedRelation: "Clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Leads messages_contact id_fkey"
            columns: ["contact id"]
            isOneToOne: false
            referencedRelation: "Leads table"
            referencedColumns: ["id"]
          },
        ]
      }
      "Leads table": {
        Row: {
          Client_digit: number | null
          Comprehension: string | null
          created_at: string
          id: number
          "Last name": string | null
          Name: string | null
          "Phone number": number | null
        }
        Insert: {
          Client_digit?: number | null
          Comprehension?: string | null
          created_at?: string
          id?: number
          "Last name"?: string | null
          Name?: string | null
          "Phone number"?: number | null
        }
        Update: {
          Client_digit?: number | null
          Comprehension?: string | null
          created_at?: string
          id?: number
          "Last name"?: string | null
          Name?: string | null
          "Phone number"?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Leads table_Client_digit_fkey"
            columns: ["Client_digit"]
            isOneToOne: false
            referencedRelation: "Clients"
            referencedColumns: ["id"]
          },
        ]
      }
      Orders: {
        Row: {
          Client_digit: number | null
          created_at: string
          Delevery_date: string | null
          id: number
          lead_Id: number | null
          Product_id: number | null
          Quanity: number | null
          "Total amount": number | null
        }
        Insert: {
          Client_digit?: number | null
          created_at?: string
          Delevery_date?: string | null
          id?: number
          lead_Id?: number | null
          Product_id?: number | null
          Quanity?: number | null
          "Total amount"?: number | null
        }
        Update: {
          Client_digit?: number | null
          created_at?: string
          Delevery_date?: string | null
          id?: number
          lead_Id?: number | null
          Product_id?: number | null
          Quanity?: number | null
          "Total amount"?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Orders_Client_digit_fkey"
            columns: ["Client_digit"]
            isOneToOne: false
            referencedRelation: "Clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Orders_lead_Id_fkey"
            columns: ["lead_Id"]
            isOneToOne: false
            referencedRelation: "Leads table"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Orders_Product_id_fkey"
            columns: ["Product_id"]
            isOneToOne: false
            referencedRelation: "Services"
            referencedColumns: ["id"]
          },
        ]
      }
      "Promotions and ads": {
        Row: {
          created_at: string
          Description: string | null
          End_date: string | null
          id: number
          Name: string | null
          Start_date: string | null
        }
        Insert: {
          created_at?: string
          Description?: string | null
          End_date?: string | null
          id?: number
          Name?: string | null
          Start_date?: string | null
        }
        Update: {
          created_at?: string
          Description?: string | null
          End_date?: string | null
          id?: number
          Name?: string | null
          Start_date?: string | null
        }
        Relationships: []
      }
      Realisations: {
        Row: {
          "Cover image path": string | null
          created_at: string
          Description: string | null
          id: number
          Link: string | null
          Name: string | null
        }
        Insert: {
          "Cover image path"?: string | null
          created_at?: string
          Description?: string | null
          id?: number
          Link?: string | null
          Name?: string | null
        }
        Update: {
          "Cover image path"?: string | null
          created_at?: string
          Description?: string | null
          id?: number
          Link?: string | null
          Name?: string | null
        }
        Relationships: []
      }
      Services: {
        Row: {
          created_at: string
          Description: string | null
          id: number
          "Image path": string | null
          Name: string | null
          Price: number | null
        }
        Insert: {
          created_at?: string
          Description?: string | null
          id?: number
          "Image path"?: string | null
          Name?: string | null
          Price?: number | null
        }
        Update: {
          created_at?: string
          Description?: string | null
          id?: number
          "Image path"?: string | null
          Name?: string | null
          Price?: number | null
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
