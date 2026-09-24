export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      area_translations: {
        Row: {
          area_id: string
          description: string | null
          id: string
          language_code: string
          name: string
        }
        Insert: {
          area_id: string
          description?: string | null
          id?: string
          language_code: string
          name: string
        }
        Update: {
          area_id?: string
          description?: string | null
          id?: string
          language_code?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "area_translations_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      areas: {
        Row: {
          city_id: string
          created_at: string
          id: string
          is_active: boolean
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          region_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          region_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          region_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      city_translations: {
        Row: {
          city_id: string
          description: string | null
          id: string
          language_code: string
          name: string
        }
        Insert: {
          city_id: string
          description?: string | null
          id?: string
          language_code: string
          name: string
        }
        Update: {
          city_id?: string
          description?: string | null
          id?: string
          language_code?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_translations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_tags: {
        Row: {
          guide_id: string
          tag_id: string
        }
        Insert: {
          guide_id: string
          tag_id: string
        }
        Update: {
          guide_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_tags_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_translations: {
        Row: {
          body_markdown: string | null
          guide_id: string
          id: string
          language_code: string
          summary: string | null
          title: string
        }
        Insert: {
          body_markdown?: string | null
          guide_id: string
          id?: string
          language_code: string
          summary?: string | null
          title: string
        }
        Update: {
          body_markdown?: string | null
          guide_id?: string
          id?: string
          language_code?: string
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_translations_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          created_at: string
          featured: boolean
          guide_type: string
          id: string
          last_verified_at: string | null
          published_at: string | null
          slug: string
          source_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          featured?: boolean
          guide_type: string
          id?: string
          last_verified_at?: string | null
          published_at?: string | null
          slug: string
          source_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          featured?: boolean
          guide_type?: string
          id?: string
          last_verified_at?: string | null
          published_at?: string | null
          slug?: string
          source_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      place_tags: {
        Row: {
          place_id: string
          tag_id: string
        }
        Insert: {
          place_id: string
          tag_id: string
        }
        Update: {
          place_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_tags_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      place_translations: {
        Row: {
          address_text: string | null
          description: string | null
          id: string
          language_code: string
          local_tip: string | null
          name: string
          place_id: string
          summary: string | null
        }
        Insert: {
          address_text?: string | null
          description?: string | null
          id?: string
          language_code: string
          local_tip?: string | null
          name: string
          place_id: string
          summary?: string | null
        }
        Update: {
          address_text?: string | null
          description?: string | null
          id?: string
          language_code?: string
          local_tip?: string | null
          name?: string
          place_id?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_translations_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          area_id: string | null
          created_at: string
          foreigner_friendly: boolean | null
          id: string
          kakao_map_url: string | null
          last_verified_at: string | null
          location: unknown
          naver_map_url: string | null
          opening_hours: Json | null
          phone: string | null
          place_type: string
          price_level: number | null
          published_at: string | null
          slug: string
          source_id: string | null
          status: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          foreigner_friendly?: boolean | null
          id?: string
          kakao_map_url?: string | null
          last_verified_at?: string | null
          location?: unknown
          naver_map_url?: string | null
          opening_hours?: Json | null
          phone?: string | null
          place_type: string
          price_level?: number | null
          published_at?: string | null
          slug: string
          source_id?: string | null
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          area_id?: string | null
          created_at?: string
          foreigner_friendly?: boolean | null
          id?: string
          kakao_map_url?: string | null
          last_verified_at?: string | null
          location?: unknown
          naver_map_url?: string | null
          opening_hours?: Json | null
          phone?: string | null
          place_type?: string
          price_level?: number | null
          published_at?: string | null
          slug?: string
          source_id?: string | null
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      region_translations: {
        Row: {
          description: string | null
          id: string
          language_code: string
          name: string
          region_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          language_code: string
          name: string
          region_id: string
        }
        Update: {
          description?: string | null
          id?: string
          language_code?: string
          name?: string
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "region_translations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      route_places: {
        Row: {
          id: string
          note: string | null
          place_id: string
          route_id: string
          stay_minutes: number | null
          stop_order: number
          travel_minutes_to_next: number | null
        }
        Insert: {
          id?: string
          note?: string | null
          place_id: string
          route_id: string
          stay_minutes?: number | null
          stop_order: number
          travel_minutes_to_next?: number | null
        }
        Update: {
          id?: string
          note?: string | null
          place_id?: string
          route_id?: string
          stay_minutes?: number | null
          stop_order?: number
          travel_minutes_to_next?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_places_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_tags: {
        Row: {
          route_id: string
          tag_id: string
        }
        Insert: {
          route_id: string
          tag_id: string
        }
        Update: {
          route_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_tags_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      route_translations: {
        Row: {
          description: string | null
          id: string
          language_code: string
          name: string
          route_id: string
          summary: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          language_code: string
          name: string
          route_id: string
          summary?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          language_code?: string
          name?: string
          route_id?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_translations_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          area_id: string | null
          created_at: string
          difficulty: string | null
          distance_km: number | null
          duration_minutes: number | null
          id: string
          last_verified_at: string | null
          published_at: string | null
          route_type: string
          slug: string
          source_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          difficulty?: string | null
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          last_verified_at?: string | null
          published_at?: string | null
          route_type?: string
          slug: string
          source_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          difficulty?: string | null
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          last_verified_at?: string | null
          published_at?: string | null
          route_type?: string
          slug?: string
          source_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          attribution: string | null
          created_at: string
          id: string
          last_checked_at: string | null
          license_name: string | null
          name: string
          source_type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          attribution?: string | null
          created_at?: string
          id?: string
          last_checked_at?: string | null
          license_name?: string | null
          name: string
          source_type?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          attribution?: string | null
          created_at?: string
          id?: string
          last_checked_at?: string | null
          license_name?: string | null
          name?: string
          source_type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      tag_translations: {
        Row: {
          id: string
          language_code: string
          name: string
          tag_id: string
        }
        Insert: {
          id?: string
          language_code: string
          name: string
          tag_id: string
        }
        Update: {
          id?: string
          language_code?: string
          name?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tag_translations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          slug: string
          tag_group: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
          tag_group?: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
          tag_group?: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

