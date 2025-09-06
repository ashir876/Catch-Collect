
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductsDataOptions {
  language?: string;
  limit?: number;
  offset?: number;
  searchTerm?: string;
  rarity?: string;
  type?: string;
  illustrator?: string;
  category?: string;
  stage?: string;
  evolveFrom?: string;
  setsFilter?: string;
  sortBy?: string;
}

export const useProductsData = (options: ProductsDataOptions = {}) => {
  const { 
    language = 'en', 
    limit = 50, 
    offset = 0, 
    searchTerm,
    rarity,
    type,
    illustrator,
    category,
    stage,
    evolveFrom,
    setsFilter,
    sortBy = 'newest'
  } = options;

  return useQuery({
    queryKey: ['products', language, limit, offset, searchTerm, rarity, type, illustrator, category, stage, evolveFrom, setsFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('language', language)
        .eq('on_stock', true);

      // Apply search filter (support name or card_number/article_number)
      if (searchTerm) {
        const trimmed = searchTerm.trim();
        // If looks like a pure card number pattern like 123 or 123/456, prioritize card_number
        const pureNumberPattern = /^(\d+)(?:\/(\d+))?$/;
        if (pureNumberPattern.test(trimmed)) {
          const match = trimmed.match(pureNumberPattern)!;
          if (match[2]) {
            query = query.eq('card_number', `${match[1]}/${match[2]}`);
          } else {
            query = query.or(`card_number.eq.${match[1]},card_number.ilike.${match[1]}/%`);
          }
        } else {
          // General search across key fields
          query = query.or(
            `name.ilike.%${trimmed}%,card_number.ilike.%${trimmed}%,article_number.ilike.%${trimmed}%`
          );
        }
      }

      // Apply rarity filter
      if (rarity && rarity !== 'all') {
        query = query.eq('rarity', rarity);
      }

      // Apply type filter
      if (type && type !== 'all') {
        query = query.contains('types', [type]);
      }

      // Apply illustrator filter
      if (illustrator && illustrator !== 'all') {
        query = query.eq('illustrator', illustrator);
      }

      // Apply category filter
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // Apply stage filter
      if (stage && stage !== 'all') {
        query = query.eq('stage', stage);
      }

      // Apply evolve from filter
      if (evolveFrom && evolveFrom !== 'all') {
        query = query.eq('evolvefrom', evolveFrom);
      }

      // Apply sets filter
      if (setsFilter && setsFilter !== 'all') {
        query = query.eq('set_id', setsFilter);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'rarity':
          query = query.order('rarity', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data;
    },
  });
};

// Hook to get total count of products for pagination
export const useProductsCount = (options: Omit<ProductsDataOptions, 'limit' | 'offset'> = {}) => {
  const { 
    language = 'en', 
    searchTerm,
    rarity,
    type,
    illustrator,
    category,
    stage,
    evolveFrom,
    setsFilter
  } = options;

  return useQuery({
    queryKey: ['products-count', language, searchTerm, rarity, type, illustrator, category, stage, evolveFrom, setsFilter],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('language', language)
        .eq('on_stock', true);

      // Apply search filter
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Apply rarity filter
      if (rarity && rarity !== 'all') {
        query = query.eq('rarity', rarity);
      }

      // Apply type filter
      if (type && type !== 'all') {
        query = query.contains('types', [type]);
      }

      // Apply illustrator filter
      if (illustrator && illustrator !== 'all') {
        query = query.eq('illustrator', illustrator);
      }

      // Apply category filter
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // Apply stage filter
      if (stage && stage !== 'all') {
        query = query.eq('stage', stage);
      }

      // Apply evolve from filter
      if (evolveFrom && evolveFrom !== 'all') {
        query = query.eq('evolvefrom', evolveFrom);
      }

      // Apply sets filter
      if (setsFilter && setsFilter !== 'all') {
        query = query.eq('set_id', setsFilter);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error fetching products count:', error);
        throw error;
      }

      return count || 0;
    },
  });
};
