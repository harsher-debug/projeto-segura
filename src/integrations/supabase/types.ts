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
  public: {
    Tables: {
      favoritos: {
        Row: {
          created_at: string
          id: string
          imovel_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          imovel_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          imovel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      imoveis: {
        Row: {
          area: number | null
          ativo: boolean
          bairro: string | null
          banheiros: number | null
          cidade: string | null
          corretor_nome: string | null
          corretor_telefone: string | null
          created_at: string
          descricao: string | null
          destaque: boolean | null
          dormitorios: number | null
          estado: string | null
          external_id: string | null
          finalidade: Database["public"]["Enums"]["finalidade"]
          fotos: Json | null
          id: string
          imagem_principal: string | null
          mobiliado: boolean | null
          preco: number
          preco_condominio: number | null
          preco_iptu: number | null
          referencia: string | null
          suites: number | null
          tipo: string | null
          titulo: string
          updated_at: string
          vagas: number | null
        }
        Insert: {
          area?: number | null
          ativo?: boolean
          bairro?: string | null
          banheiros?: number | null
          cidade?: string | null
          corretor_nome?: string | null
          corretor_telefone?: string | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean | null
          dormitorios?: number | null
          estado?: string | null
          external_id?: string | null
          finalidade?: Database["public"]["Enums"]["finalidade"]
          fotos?: Json | null
          id?: string
          imagem_principal?: string | null
          mobiliado?: boolean | null
          preco?: number
          preco_condominio?: number | null
          preco_iptu?: number | null
          referencia?: string | null
          suites?: number | null
          tipo?: string | null
          titulo: string
          updated_at?: string
          vagas?: number | null
        }
        Update: {
          area?: number | null
          ativo?: boolean
          bairro?: string | null
          banheiros?: number | null
          cidade?: string | null
          corretor_nome?: string | null
          corretor_telefone?: string | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean | null
          dormitorios?: number | null
          estado?: string | null
          external_id?: string | null
          finalidade?: Database["public"]["Enums"]["finalidade"]
          fotos?: Json | null
          id?: string
          imagem_principal?: string | null
          mobiliado?: boolean | null
          preco?: number
          preco_condominio?: number | null
          preco_iptu?: number | null
          referencia?: string | null
          suites?: number | null
          tipo?: string | null
          titulo?: string
          updated_at?: string
          vagas?: number | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          corretor_id: string | null
          created_at: string
          email: string | null
          id: string
          imovel_id: string | null
          nome: string
          observacoes: string | null
          origem: string | null
          status: Database["public"]["Enums"]["lead_status"]
          telefone: string | null
          updated_at: string
          valor_estimado: number | null
        }
        Insert: {
          corretor_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          imovel_id?: string | null
          nome: string
          observacoes?: string | null
          origem?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          telefone?: string | null
          updated_at?: string
          valor_estimado?: number | null
        }
        Update: {
          corretor_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          imovel_id?: string | null
          nome?: string
          observacoes?: string | null
          origem?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          telefone?: string | null
          updated_at?: string
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          creci: string | null
          email: string | null
          id: string
          nome: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          creci?: string | null
          email?: string | null
          id: string
          nome?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          creci?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      propostas: {
        Row: {
          corretor_id: string | null
          created_at: string
          id: string
          imovel_id: string | null
          lead_id: string | null
          observacoes: string | null
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          corretor_id?: string | null
          created_at?: string
          id?: string
          imovel_id?: string | null
          lead_id?: string | null
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Update: {
          corretor_id?: string | null
          created_at?: string
          id?: string
          imovel_id?: string | null
          lead_id?: string | null
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
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
      visitas: {
        Row: {
          corretor_id: string | null
          created_at: string
          data_visita: string
          id: string
          imovel_id: string | null
          lead_id: string | null
          observacoes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          corretor_id?: string | null
          created_at?: string
          data_visita: string
          id?: string
          imovel_id?: string | null
          lead_id?: string | null
          observacoes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          corretor_id?: string | null
          created_at?: string
          data_visita?: string
          id?: string
          imovel_id?: string | null
          lead_id?: string | null
          observacoes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitas_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "corretor"
      finalidade: "locacao" | "venda"
      lead_status:
        | "novo"
        | "contato"
        | "visita"
        | "proposta"
        | "fechado"
        | "perdido"
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
    ?keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
   ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ?R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
     ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ?R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ?keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ?DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ?I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ?DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ?I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ?keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ?DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ?U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ?DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ?U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ?keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ?DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ?DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ?keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ?DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ?DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "corretor"],
      finalidade: ["locacao", "venda"],
      lead_status: [
        "novo",
        "contato",
        "visita",
        "proposta",
        "fechado",
        "perdido",
      ],
    },
  },
} as const
