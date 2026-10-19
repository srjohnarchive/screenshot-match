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
      anexos: {
        Row: {
          chave_arquivo: string
          cobranca_id: string | null
          enviado_em: string
          enviado_por: string
          id: string
          movimentacao_id: string | null
          nome_original: string
          tamanho: number
          tipo: string
        }
        Insert: {
          chave_arquivo: string
          cobranca_id?: string | null
          enviado_em?: string
          enviado_por?: string
          id?: string
          movimentacao_id?: string | null
          nome_original: string
          tamanho?: number
          tipo: string
        }
        Update: {
          chave_arquivo?: string
          cobranca_id?: string | null
          enviado_em?: string
          enviado_por?: string
          id?: string
          movimentacao_id?: string | null
          nome_original?: string
          tamanho?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_cobranca_id_fkey"
            columns: ["cobranca_id"]
            isOneToOne: false
            referencedRelation: "cobrancas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anexos_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anexos_movimentacao_id_fkey"
            columns: ["movimentacao_id"]
            isOneToOne: false
            referencedRelation: "movimentacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      auditoria: {
        Row: {
          acao: string
          criado_em: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          entidade: string
          id: string
          registro_id: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          entidade: string
          id?: string
          registro_id: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          entidade?: string
          id?: string
          registro_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          ativa: boolean
          id: string
          natureza: string
          nome: string
        }
        Insert: {
          ativa?: boolean
          id?: string
          natureza: string
          nome: string
        }
        Update: {
          ativa?: boolean
          id?: string
          natureza?: string
          nome?: string
        }
        Relationships: []
      }
      cobrancas: {
        Row: {
          cancelada_em: string | null
          categoria_id: string
          criada_em: string
          criada_por: string
          data_emissao: string
          data_vencimento: string
          descricao: string
          id: string
          motivo_cancelamento: string | null
          natureza: string
          referencia: string | null
          terceiro_id: string
          valor_total: number
        }
        Insert: {
          cancelada_em?: string | null
          categoria_id: string
          criada_em?: string
          criada_por?: string
          data_emissao?: string
          data_vencimento: string
          descricao: string
          id?: string
          motivo_cancelamento?: string | null
          natureza: string
          referencia?: string | null
          terceiro_id: string
          valor_total: number
        }
        Update: {
          cancelada_em?: string | null
          categoria_id?: string
          criada_em?: string
          criada_por?: string
          data_emissao?: string
          data_vencimento?: string
          descricao?: string
          id?: string
          motivo_cancelamento?: string | null
          natureza?: string
          referencia?: string | null
          terceiro_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_criada_por_fkey"
            columns: ["criada_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_terceiro_id_fkey"
            columns: ["terceiro_id"]
            isOneToOne: false
            referencedRelation: "terceiros"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_financeiras: {
        Row: {
          ativa: boolean
          data_saldo_inicial: string
          id: string
          nome: string
          saldo_inicial: number
          tipo: string
        }
        Insert: {
          ativa?: boolean
          data_saldo_inicial?: string
          id?: string
          nome: string
          saldo_inicial?: number
          tipo: string
        }
        Update: {
          ativa?: boolean
          data_saldo_inicial?: string
          id?: string
          nome?: string
          saldo_inicial?: number
          tipo?: string
        }
        Relationships: []
      }
      movimentacoes: {
        Row: {
          cancelada_em: string | null
          cancelada_por: string | null
          categoria_id: string
          cobranca_id: string | null
          conta_financeira_id: string
          criada_em: string
          criada_por: string
          data_movimentacao: string
          forma_pagamento: string
          id: string
          motivo_cancelamento: string | null
          natureza: string
          referencia_bancaria: string | null
          valor: number
        }
        Insert: {
          cancelada_em?: string | null
          cancelada_por?: string | null
          categoria_id: string
          cobranca_id?: string | null
          conta_financeira_id: string
          criada_em?: string
          criada_por?: string
          data_movimentacao?: string
          forma_pagamento: string
          id?: string
          motivo_cancelamento?: string | null
          natureza: string
          referencia_bancaria?: string | null
          valor: number
        }
        Update: {
          cancelada_em?: string | null
          cancelada_por?: string | null
          categoria_id?: string
          cobranca_id?: string | null
          conta_financeira_id?: string
          criada_em?: string
          criada_por?: string
          data_movimentacao?: string
          forma_pagamento?: string
          id?: string
          motivo_cancelamento?: string | null
          natureza?: string
          referencia_bancaria?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_cancelada_por_fkey"
            columns: ["cancelada_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_cobranca_id_fkey"
            columns: ["cobranca_id"]
            isOneToOne: false
            referencedRelation: "cobrancas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_conta_financeira_id_fkey"
            columns: ["conta_financeira_id"]
            isOneToOne: false
            referencedRelation: "contas_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_criada_por_fkey"
            columns: ["criada_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      terceiros: {
        Row: {
          ativo: boolean
          criado_em: string
          documento: string
          email: string | null
          id: string
          nome: string
          telefone: string | null
          tipo: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          documento: string
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          tipo: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          documento?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: string
        }
        Relationships: []
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
      usuarios: {
        Row: {
          ativo: boolean
          criado_em: string
          email: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          email: string
          id: string
          nome?: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          email?: string
          id?: string
          nome?: string
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
      pode_editar: { Args: { _user_id: string }; Returns: boolean }
      usuario_ativo: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "tesouraria" | "consulta"
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
      app_role: ["admin", "tesouraria", "consulta"],
    },
  },
} as const
