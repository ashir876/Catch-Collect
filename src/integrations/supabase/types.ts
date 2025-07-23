export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accessories: {
        Row: {
          badge: string | null
          collection_id: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          featured_image_id: string | null
          id: string
          images: Json
          name: string
          price: number
          rating: number
          slug: string
          stock: number | null
          tags: Json
          total_comments: number
          updated_at: string | null
        }
        Insert: {
          badge?: string | null
          collection_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          featured_image_id?: string | null
          id: string
          images?: Json
          name: string
          price?: number
          rating?: number
          slug: string
          stock?: number | null
          tags?: Json
          total_comments?: number
          updated_at?: string | null
        }
        Update: {
          badge?: string | null
          collection_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          featured_image_id?: string | null
          id?: string
          images?: Json
          name?: string
          price?: number
          rating?: number
          slug?: string
          stock?: number | null
          tags?: Json
          total_comments?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accessories_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["article_number"]
          },
          {
            foreignKeyName: "accessories_featured_image_id_fkey"
            columns: ["featured_image_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          address_id: string
          address_type: string
          city: string
          country_code: string
          created_at: string | null
          id: number | null
          is_active: boolean | null
          is_default_billing: boolean | null
          is_default_shipping: boolean | null
          label: string | null
          postal_code: string
          state_province: string | null
          street_address: string
          street_address_2: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_id?: string
          address_type: string
          city: string
          country_code?: string
          created_at?: string | null
          id?: number | null
          is_active?: boolean | null
          is_default_billing?: boolean | null
          is_default_shipping?: boolean | null
          label?: string | null
          postal_code: string
          state_province?: string | null
          street_address: string
          street_address_2?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_id?: string
          address_type?: string
          city?: string
          country_code?: string
          created_at?: string | null
          id?: number | null
          is_active?: boolean | null
          is_default_billing?: boolean | null
          is_default_shipping?: boolean | null
          label?: string | null
          postal_code?: string
          state_province?: string | null
          street_address?: string
          street_address_2?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      card_collections: {
        Row: {
          attacks: Json | null
          card_count_official: number | null
          card_count_total: number | null
          card_id: string
          card_number: string | null
          category: string | null
          condition: string | null
          created_at: string
          description: string | null
          evolvefrom: string | null
          hp: number | null
          id: number | null
          illustrator: string | null
          image_url: string | null
          language: string
          legal: Json | null
          localid: string | null
          name: string | null
          notes: string | null
          price: number | null
          rarity: string | null
          regulationmark: string | null
          retreat: number | null
          set_id: string | null
          set_name: string | null
          set_symbol_url: string | null
          stage: string | null
          types: string[] | null
          user_id: string
          variants: Json | null
          weaknesses: Json | null
        }
        Insert: {
          attacks?: Json | null
          card_count_official?: number | null
          card_count_total?: number | null
          card_id: string
          card_number?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          evolvefrom?: string | null
          hp?: number | null
          id?: number | null
          illustrator?: string | null
          image_url?: string | null
          language: string
          legal?: Json | null
          localid?: string | null
          name?: string | null
          notes?: string | null
          price?: number | null
          rarity?: string | null
          regulationmark?: string | null
          retreat?: number | null
          set_id?: string | null
          set_name?: string | null
          set_symbol_url?: string | null
          stage?: string | null
          types?: string[] | null
          user_id: string
          variants?: Json | null
          weaknesses?: Json | null
        }
        Update: {
          attacks?: Json | null
          card_count_official?: number | null
          card_count_total?: number | null
          card_id?: string
          card_number?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          evolvefrom?: string | null
          hp?: number | null
          id?: number | null
          illustrator?: string | null
          image_url?: string | null
          language?: string
          legal?: Json | null
          localid?: string | null
          name?: string | null
          notes?: string | null
          price?: number | null
          rarity?: string | null
          regulationmark?: string | null
          retreat?: number | null
          set_id?: string | null
          set_name?: string | null
          set_symbol_url?: string | null
          stage?: string | null
          types?: string[] | null
          user_id?: string
          variants?: Json | null
          weaknesses?: Json | null
        }
        Relationships: []
      }
      card_wishlist: {
        Row: {
          card_id: string
          created_at: string
          id: number | null
          language: string
          priority: number | null
          series_id: string | null
          set_id: string | null
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: number | null
          language: string
          priority?: number | null
          series_id?: string | null
          set_id?: string | null
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: number | null
          language?: string
          priority?: number | null
          series_id?: string | null
          set_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          attacks: Json | null
          card_count_official: number | null
          card_count_total: number | null
          card_id: string
          card_number: string | null
          category: string | null
          description: string | null
          evolvefrom: string | null
          hp: number | null
          id: number | null
          illustrator: string | null
          image_url: string | null
          language: string
          legal: Json | null
          localid: string | null
          name: string | null
          rarity: string | null
          regulationmark: string | null
          retreat: number | null
          set_id: string | null
          set_name: string | null
          set_symbol_url: string | null
          stage: string | null
          types: string[] | null
          variants: Json | null
          weaknesses: Json | null
        }
        Insert: {
          attacks?: Json | null
          card_count_official?: number | null
          card_count_total?: number | null
          card_id: string
          card_number?: string | null
          category?: string | null
          description?: string | null
          evolvefrom?: string | null
          hp?: number | null
          id?: number | null
          illustrator?: string | null
          image_url?: string | null
          language: string
          legal?: Json | null
          localid?: string | null
          name?: string | null
          rarity?: string | null
          regulationmark?: string | null
          retreat?: number | null
          set_id?: string | null
          set_name?: string | null
          set_symbol_url?: string | null
          stage?: string | null
          types?: string[] | null
          variants?: Json | null
          weaknesses?: Json | null
        }
        Update: {
          attacks?: Json | null
          card_count_official?: number | null
          card_count_total?: number | null
          card_id?: string
          card_number?: string | null
          category?: string | null
          description?: string | null
          evolvefrom?: string | null
          hp?: number | null
          id?: number | null
          illustrator?: string | null
          image_url?: string | null
          language?: string
          legal?: Json | null
          localid?: string | null
          name?: string | null
          rarity?: string | null
          regulationmark?: string | null
          retreat?: number | null
          set_id?: string | null
          set_name?: string | null
          set_symbol_url?: string | null
          stage?: string | null
          types?: string[] | null
          variants?: Json | null
          weaknesses?: Json | null
        }
        Relationships: []
      }
      "cards_duplicate_02.05.": {
        Row: {
          attacks: Json | null
          card_count_official: number | null
          card_count_total: number | null
          card_id: string
          card_number: string | null
          category: string | null
          description: string | null
          evolvefrom: string | null
          hp: number | null
          illustrator: string | null
          image_url: string | null
          language: string
          legal: Json | null
          localid: string | null
          name: string | null
          rarity: string | null
          regulationmark: string | null
          retreat: number | null
          set_id: string | null
          set_name: string | null
          set_symbol_url: string | null
          stage: string | null
          types: string[] | null
          variants: Json | null
          weaknesses: Json | null
        }
        Insert: {
          attacks?: Json | null
          card_count_official?: number | null
          card_count_total?: number | null
          card_id: string
          card_number?: string | null
          category?: string | null
          description?: string | null
          evolvefrom?: string | null
          hp?: number | null
          illustrator?: string | null
          image_url?: string | null
          language: string
          legal?: Json | null
          localid?: string | null
          name?: string | null
          rarity?: string | null
          regulationmark?: string | null
          retreat?: number | null
          set_id?: string | null
          set_name?: string | null
          set_symbol_url?: string | null
          stage?: string | null
          types?: string[] | null
          variants?: Json | null
          weaknesses?: Json | null
        }
        Update: {
          attacks?: Json | null
          card_count_official?: number | null
          card_count_total?: number | null
          card_id?: string
          card_number?: string | null
          category?: string | null
          description?: string | null
          evolvefrom?: string | null
          hp?: number | null
          illustrator?: string | null
          image_url?: string | null
          language?: string
          legal?: Json | null
          localid?: string | null
          name?: string | null
          rarity?: string | null
          regulationmark?: string | null
          retreat?: number | null
          set_id?: string | null
          set_name?: string | null
          set_symbol_url?: string | null
          stage?: string | null
          types?: string[] | null
          variants?: Json | null
          weaknesses?: Json | null
        }
        Relationships: []
      }
      carts: {
        Row: {
          article_number: string
          created_at: string
          id: number | null
          price: number | null
          quantity: number
          user_id: string
        }
        Insert: {
          article_number: string
          created_at?: string
          id?: number | null
          price?: number | null
          quantity: number
          user_id: string
        }
        Update: {
          article_number?: string
          created_at?: string
          id?: number | null
          price?: number | null
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_article_number_fkey"
            columns: ["article_number"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["article_number"]
          },
        ]
      }
      collections: {
        Row: {
          article_number: string
          description: string
          featured_image_id: string | null
          id: number | null
          label: string
          order: number | null
          slug: string
          title: string
        }
        Insert: {
          article_number: string
          description: string
          featured_image_id?: string | null
          id?: number | null
          label: string
          order?: number | null
          slug: string
          title: string
        }
        Update: {
          article_number?: string
          description?: string
          featured_image_id?: string | null
          id?: number | null
          label?: string
          order?: number | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      conditions: {
        Row: {
          condition_de: string
          designation_de: string
          designation_en: string
          symbol: string
        }
        Insert: {
          condition_de: string
          designation_de: string
          designation_en: string
          symbol: string
        }
        Update: {
          condition_de?: string
          designation_de?: string
          designation_en?: string
          symbol?: string
        }
        Relationships: []
      }
      "conditions_duplicate_02.05.": {
        Row: {
          condition_de: string
          designation_de: string
          designation_en: string
          symbol: string
        }
        Insert: {
          condition_de: string
          designation_de: string
          designation_en: string
          symbol: string
        }
        Update: {
          condition_de?: string
          designation_de?: string
          designation_en?: string
          symbol?: string
        }
        Relationships: []
      }
      medias: {
        Row: {
          alt: string
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
        }
        Insert: {
          alt: string
          created_at?: string | null
          id: string
          key: string
          updated_at?: string | null
        }
        Update: {
          alt?: string
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          article_number: string
          created_at: string | null
          id: number
          status: string | null
          total: number | null
          user_id: string | null
        }
        Insert: {
          article_number?: string
          created_at?: string | null
          id?: number
          status?: string | null
          total?: number | null
          user_id?: string | null
        }
        Update: {
          article_number?: string
          created_at?: string | null
          id?: number
          status?: string | null
          total?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_article_number_fkey"
            columns: ["article_number"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["article_number"]
          },
        ]
      }
      pokedex_multilang: {
        Row: {
          English: string | null
          French: string | null
          German: string | null
          Italian: string | null
          Japanese: string | null
          Korean: string | null
          No: string
          Spanish: string | null
        }
        Insert: {
          English?: string | null
          French?: string | null
          German?: string | null
          Italian?: string | null
          Japanese?: string | null
          Korean?: string | null
          No: string
          Spanish?: string | null
        }
        Update: {
          English?: string | null
          French?: string | null
          German?: string | null
          Italian?: string | null
          Japanese?: string | null
          Korean?: string | null
          No?: string
          Spanish?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          article_number: string
          attacks: Json | null
          card_id: string
          card_number: string | null
          category: string | null
          condition_symbol: string
          created_at: string | null
          evolvefrom: string | null
          id: number | null
          illustrator: string | null
          image_url: string | null
          language: string
          localid: string | null
          main: boolean | null
          name: string
          notes: string | null
          on_stock: boolean
          price: number
          rarity: string | null
          set_id: string
          set_name: string
          set_symbol: string | null
          stage: string | null
          stock: number | null
          types: string[] | null
          updated_at: string | null
        }
        Insert: {
          article_number: string
          attacks?: Json | null
          card_id: string
          card_number?: string | null
          category?: string | null
          condition_symbol: string
          created_at?: string | null
          evolvefrom?: string | null
          id?: number | null
          illustrator?: string | null
          image_url?: string | null
          language: string
          localid?: string | null
          main?: boolean | null
          name: string
          notes?: string | null
          on_stock?: boolean
          price: number
          rarity?: string | null
          set_id: string
          set_name: string
          set_symbol?: string | null
          stage?: string | null
          stock?: number | null
          types?: string[] | null
          updated_at?: string | null
        }
        Update: {
          article_number?: string
          attacks?: Json | null
          card_id?: string
          card_number?: string | null
          category?: string | null
          condition_symbol?: string
          created_at?: string | null
          evolvefrom?: string | null
          id?: number | null
          illustrator?: string | null
          image_url?: string | null
          language?: string
          localid?: string | null
          main?: boolean | null
          name?: string
          notes?: string | null
          on_stock?: boolean
          price?: number
          rarity?: string | null
          set_id?: string
          set_name?: string
          set_symbol?: string | null
          stage?: string | null
          stock?: number | null
          types?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_cards"
            columns: ["card_id", "language"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["card_id", "language"]
          },
          {
            foreignKeyName: "fk_products_cards"
            columns: ["card_id", "language"]
            isOneToOne: false
            referencedRelation: "cards_view"
            referencedColumns: ["id", "language"]
          },
          {
            foreignKeyName: "fk_products_conditions"
            columns: ["condition_symbol"]
            isOneToOne: false
            referencedRelation: "conditions"
            referencedColumns: ["symbol"]
          },
        ]
      }
      series: {
        Row: {
          id: number | null
          language: string
          logo_url: string | null
          series_id: string
          series_name: string | null
        }
        Insert: {
          id?: number | null
          language: string
          logo_url?: string | null
          series_id: string
          series_name?: string | null
        }
        Update: {
          id?: number | null
          language?: string
          logo_url?: string | null
          series_id?: string
          series_name?: string | null
        }
        Relationships: []
      }
      series_sets: {
        Row: {
          id: number | null
          language: string
          logo_url: string | null
          official_cards: number | null
          series_id: string
          series_name: string | null
          set_id: string
          set_name: string | null
          total_cards: number | null
        }
        Insert: {
          id?: number | null
          language: string
          logo_url?: string | null
          official_cards?: number | null
          series_id: string
          series_name?: string | null
          set_id: string
          set_name?: string | null
          total_cards?: number | null
        }
        Update: {
          id?: number | null
          language?: string
          logo_url?: string | null
          official_cards?: number | null
          series_id?: string
          series_name?: string | null
          set_id?: string
          set_name?: string | null
          total_cards?: number | null
        }
        Relationships: []
      }
      sets: {
        Row: {
          firsted: number | null
          holo: number | null
          language: string
          legal: Json | null
          logo_url: string | null
          name: string | null
          normal: number | null
          official: number | null
          release_date: string | null
          reverse: number | null
          series_id: string | null
          series_name: string | null
          set_id: string
          symbol_url: string | null
          total: number | null
        }
        Insert: {
          firsted?: number | null
          holo?: number | null
          language: string
          legal?: Json | null
          logo_url?: string | null
          name?: string | null
          normal?: number | null
          official?: number | null
          release_date?: string | null
          reverse?: number | null
          series_id?: string | null
          series_name?: string | null
          set_id: string
          symbol_url?: string | null
          total?: number | null
        }
        Update: {
          firsted?: number | null
          holo?: number | null
          language?: string
          legal?: Json | null
          logo_url?: string | null
          name?: string | null
          normal?: number | null
          official?: number | null
          release_date?: string | null
          reverse?: number | null
          series_id?: string | null
          series_name?: string | null
          set_id?: string
          symbol_url?: string | null
          total?: number | null
        }
        Relationships: []
      }
      "sets_duplicate_02.05.": {
        Row: {
          firsted: number | null
          holo: number | null
          language: string
          legal: Json | null
          logo_url: string | null
          name: string | null
          normal: number | null
          official: number | null
          release_date: string | null
          reverse: number | null
          series_id: string | null
          series_name: string | null
          set_id: string
          symbol_url: string | null
          total: number | null
        }
        Insert: {
          firsted?: number | null
          holo?: number | null
          language: string
          legal?: Json | null
          logo_url?: string | null
          name?: string | null
          normal?: number | null
          official?: number | null
          release_date?: string | null
          reverse?: number | null
          series_id?: string | null
          series_name?: string | null
          set_id: string
          symbol_url?: string | null
          total?: number | null
        }
        Update: {
          firsted?: number | null
          holo?: number | null
          language?: string
          legal?: Json | null
          logo_url?: string | null
          name?: string | null
          normal?: number | null
          official?: number | null
          release_date?: string | null
          reverse?: number | null
          series_id?: string | null
          series_name?: string | null
          set_id?: string
          symbol_url?: string | null
          total?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          account_status: string
          account_type: string | null
          avatar_url: string | null
          created_at: string | null
          default_billing_address_id: string | null
          default_shipping_address_id: string | null
          email: string
          full_name: string | null
          id: number | null
          last_login: string | null
          loyalty_points: number | null
          marketing_preferences: Json | null
          metadata: Json | null
          newsletter_opt_in: boolean | null
          phone_number: string | null
          role: string
          stripe_customer_id: string | null
          user_id: string
        }
        Insert: {
          account_status?: string
          account_type?: string | null
          avatar_url?: string | null
          created_at?: string | null
          default_billing_address_id?: string | null
          default_shipping_address_id?: string | null
          email: string
          full_name?: string | null
          id?: number | null
          last_login?: string | null
          loyalty_points?: number | null
          marketing_preferences?: Json | null
          metadata?: Json | null
          newsletter_opt_in?: boolean | null
          phone_number?: string | null
          role?: string
          stripe_customer_id?: string | null
          user_id: string
        }
        Update: {
          account_status?: string
          account_type?: string | null
          avatar_url?: string | null
          created_at?: string | null
          default_billing_address_id?: string | null
          default_shipping_address_id?: string | null
          email?: string
          full_name?: string | null
          id?: number | null
          last_login?: string | null
          loyalty_points?: number | null
          marketing_preferences?: Json | null
          metadata?: Json | null
          newsletter_opt_in?: boolean | null
          phone_number?: string | null
          role?: string
          stripe_customer_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_default_billing_address_fkey"
            columns: ["default_billing_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["address_id"]
          },
          {
            foreignKeyName: "users_default_billing_address_fkey"
            columns: ["default_billing_address_id"]
            isOneToOne: false
            referencedRelation: "addresses_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_default_shipping_address_fkey"
            columns: ["default_shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["address_id"]
          },
          {
            foreignKeyName: "users_default_shipping_address_fkey"
            columns: ["default_shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      addresses_view: {
        Row: {
          address_type: string | null
          city: string | null
          country_code: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          is_default_billing: boolean | null
          is_default_shipping: boolean | null
          label: string | null
          original_id: number | null
          postal_code: string | null
          state_province: string | null
          street_address: string | null
          street_address_2: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_type?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          is_default_billing?: boolean | null
          is_default_shipping?: boolean | null
          label?: string | null
          original_id?: number | null
          postal_code?: string | null
          state_province?: string | null
          street_address?: string | null
          street_address_2?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_type?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          is_default_billing?: boolean | null
          is_default_shipping?: boolean | null
          label?: string | null
          original_id?: number | null
          postal_code?: string | null
          state_province?: string | null
          street_address?: string | null
          street_address_2?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      card_collections_with_id: {
        Row: {
          attacks: Json | null
          card_count_official: number | null
          card_count_total: number | null
          card_id: string | null
          card_number: string | null
          category: string | null
          condition: string | null
          created_at: string | null
          description: string | null
          evolvefrom: string | null
          hp: number | null
          id: string | null
          illustrator: string | null
          image_url: string | null
          language: string | null
          legal: Json | null
          localid: string | null
          name: string | null
          notes: string | null
          price: number | null
          rarity: string | null
          regulationmark: string | null
          retreat: number | null
          set_id: string | null
          set_name: string | null
          set_symbol_url: string | null
          stage: string | null
          types: string[] | null
          user_id: string | null
          variants: Json | null
          weaknesses: Json | null
        }
        Insert: {
          attacks?: Json | null
          card_count_official?: number | null
          card_count_total?: number | null
          card_id?: string | null
          card_number?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          evolvefrom?: string | null
          hp?: number | null
          id?: never
          illustrator?: string | null
          image_url?: string | null
          language?: string | null
          legal?: Json | null
          localid?: string | null
          name?: string | null
          notes?: string | null
          price?: number | null
          rarity?: string | null
          regulationmark?: string | null
          retreat?: number | null
          set_id?: string | null
          set_name?: string | null
          set_symbol_url?: string | null
          stage?: string | null
          types?: string[] | null
          user_id?: string | null
          variants?: Json | null
          weaknesses?: Json | null
        }
        Update: {
          attacks?: Json | null
          card_count_official?: number | null
          card_count_total?: number | null
          card_id?: string | null
          card_number?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          evolvefrom?: string | null
          hp?: number | null
          id?: never
          illustrator?: string | null
          image_url?: string | null
          language?: string | null
          legal?: Json | null
          localid?: string | null
          name?: string | null
          notes?: string | null
          price?: number | null
          rarity?: string | null
          regulationmark?: string | null
          retreat?: number | null
          set_id?: string | null
          set_name?: string | null
          set_symbol_url?: string | null
          stage?: string | null
          types?: string[] | null
          user_id?: string | null
          variants?: Json | null
          weaknesses?: Json | null
        }
        Relationships: []
      }
      card_wishlist_with_id: {
        Row: {
          card_id: string | null
          created_at: string | null
          id: string | null
          language: string | null
          priority: number | null
          series_id: string | null
          set_id: string | null
          user_id: string | null
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          id?: never
          language?: string | null
          priority?: number | null
          series_id?: string | null
          set_id?: string | null
          user_id?: string | null
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          id?: never
          language?: string | null
          priority?: number | null
          series_id?: string | null
          set_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cards_view: {
        Row: {
          attacks: Json | null
          card_count_official: number | null
          card_count_total: number | null
          card_number: string | null
          category: string | null
          description: string | null
          evolvefrom: string | null
          hp: number | null
          id: string | null
          illustrator: string | null
          image_url: string | null
          language: string | null
          legal: Json | null
          localid: string | null
          name: string | null
          original_id: number | null
          rarity: string | null
          regulationmark: string | null
          retreat: number | null
          set_id: string | null
          set_name: string | null
          set_symbol_url: string | null
          stage: string | null
          types: string[] | null
          variants: Json | null
          weaknesses: Json | null
        }
        Insert: {
          attacks?: Json | null
          card_count_official?: number | null
          card_count_total?: number | null
          card_number?: string | null
          category?: string | null
          description?: string | null
          evolvefrom?: string | null
          hp?: number | null
          id?: string | null
          illustrator?: string | null
          image_url?: string | null
          language?: string | null
          legal?: Json | null
          localid?: string | null
          name?: string | null
          original_id?: number | null
          rarity?: string | null
          regulationmark?: string | null
          retreat?: number | null
          set_id?: string | null
          set_name?: string | null
          set_symbol_url?: string | null
          stage?: string | null
          types?: string[] | null
          variants?: Json | null
          weaknesses?: Json | null
        }
        Update: {
          attacks?: Json | null
          card_count_official?: number | null
          card_count_total?: number | null
          card_number?: string | null
          category?: string | null
          description?: string | null
          evolvefrom?: string | null
          hp?: number | null
          id?: string | null
          illustrator?: string | null
          image_url?: string | null
          language?: string | null
          legal?: Json | null
          localid?: string | null
          name?: string | null
          original_id?: number | null
          rarity?: string | null
          regulationmark?: string | null
          retreat?: number | null
          set_id?: string | null
          set_name?: string | null
          set_symbol_url?: string | null
          stage?: string | null
          types?: string[] | null
          variants?: Json | null
          weaknesses?: Json | null
        }
        Relationships: []
      }
      carts_with_id: {
        Row: {
          article_number: string | null
          created_at: string | null
          id: string | null
          price: number | null
          quantity: number | null
          user_id: string | null
        }
        Insert: {
          article_number?: string | null
          created_at?: string | null
          id?: never
          price?: number | null
          quantity?: number | null
          user_id?: string | null
        }
        Update: {
          article_number?: string | null
          created_at?: string | null
          id?: never
          price?: number | null
          quantity?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_article_number_fkey"
            columns: ["article_number"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["article_number"]
          },
        ]
      }
      orders_view: {
        Row: {
          article_number: string | null
          created_at: string | null
          id: number | null
          status: string | null
          total: number | null
          user_id: string | null
        }
        Insert: {
          article_number?: string | null
          created_at?: string | null
          id?: number | null
          status?: string | null
          total?: number | null
          user_id?: string | null
        }
        Update: {
          article_number?: string | null
          created_at?: string | null
          id?: number | null
          status?: string | null
          total?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_article_number_fkey"
            columns: ["article_number"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["article_number"]
          },
        ]
      }
      series_with_id: {
        Row: {
          id: string | null
          language: string | null
          logo_url: string | null
          series_id: string | null
          series_name: string | null
        }
        Insert: {
          id?: never
          language?: string | null
          logo_url?: string | null
          series_id?: string | null
          series_name?: string | null
        }
        Update: {
          id?: never
          language?: string | null
          logo_url?: string | null
          series_id?: string | null
          series_name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      execute_sql: {
        Args: { query: string; params?: string[] }
        Returns: {
          result: Json
        }[]
      }
      get_cards_unlimited: {
        Args: { p_language?: string; p_set_id?: string; p_limit?: number }
        Returns: {
          card_id: string
          card_number: string
          name: string
          set_id: string
          set_name: string
          set_symbol_url: string
          image_url: string
          language: string
          rarity: string
          hp: number
          types: string[]
          illustrator: string
          category: string
          total_count: number
        }[]
      }
      get_composite_id: {
        Args: { schema_name: string; table_name: string; id_parts: string[] }
        Returns: string
      }
      get_series_unlimited: {
        Args: { p_language?: string }
        Returns: {
          series_id: string
          series_name: string
          language: string
          logo_url: string
        }[]
      }
      get_sets_unlimited: {
        Args: { p_language?: string; p_series_id?: string }
        Returns: {
          set_id: string
          name: string
          language: string
          series_id: string
          series_name: string
          logo_url: string
          symbol_url: string
        }[]
      }
      simple_search_cards: {
        Args: {
          search_term: string
          language_filter?: string
          max_results?: number
        }
        Returns: {
          card_id: string
          name: string
          language: string
          image_url: string
          set_name: string
          rarity: string
          types: string[]
          similarity_score: number
          match_type: string
        }[]
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
    Enums: {},
  },
} as const
