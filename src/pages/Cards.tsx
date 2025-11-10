
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Heart, ShoppingCart, Star, Filter, Grid3X3, List, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import TradingCard from "@/components/cards/TradingCard";
import { useToast } from "@/hooks/use-toast";
import { useCardsData, useCardsCount } from "@/hooks/useCardsData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import CardWithWishlist from "@/components/cards/CardWithWishlist";
import CompactCardListItem from "@/components/cards/CardListItem";
import LanguageFilter from "@/components/LanguageFilter";
import AdvancedFilters from "@/components/filters/AdvancedFilters";
import CardDetailModal from "@/components/cards/CardDetailModal";
import AddToCollectionModal from "@/components/cards/AddToCollectionModal";
import BulkAddToCollectionModal from "@/components/cards/BulkAddToCollectionModal";
import React from "react"; // Added missing import
import { useIsCardInCollection } from "@/hooks/useCollectionData";
import { useIsCardInWishlist } from "@/hooks/useWishlistData";
import { useCollectionActions, useWishlistActions } from "@/hooks/useCollectionActions";

const Cards = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const setFilter = searchParams.get("set");
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("en");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [hpRange, setHpRange] = useState({ min: "", max: "" });
  const [illustratorFilter, setIllustratorFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [wishlistFilter, setWishlistFilter] = useState("all");
  // New filter states
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [evolveFromFilter, setEvolveFromFilter] = useState("all");
  const [retreatCostFilter, setRetreatCostFilter] = useState("all");
  const [regulationMarkFilter, setRegulationMarkFilter] = useState("all");
  const [formatLegalityFilter, setFormatLegalityFilter] = useState("all");
  const [weaknessTypeFilter, setWeaknessTypeFilter] = useState("all");
  const [setsFilter, setSetsFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Show 50 items per page for more compact view
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Selection state for bulk actions
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [isBulkSelectionMode, setIsBulkSelectionMode] = useState(false);
  
  // Modal state
  const [isAddToCollectionModalOpen, setIsAddToCollectionModalOpen] = useState(false);
  const [selectedCardForCollection, setSelectedCardForCollection] = useState<any>(null);
  const [isBulkAddToCollectionModalOpen, setIsBulkAddToCollectionModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToCollection, removeFromCollection, isAddingToCollection, isRemovingFromCollection } = useCollectionActions();
  const { addToWishlist, removeFromWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlistActions();

  // Calculate offset for pagination
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch cards data with all filters
  const { data: cardsData, isLoading, error } = useCardsData({
    setId: (setFilter || (setsFilter !== "all" ? setsFilter : undefined)) || undefined,
    language: languageFilter === "all" ? undefined : languageFilter,
    limit: itemsPerPage,
    offset,
    searchTerm: searchTerm || undefined,
    rarity: rarityFilter === "all" ? undefined : rarityFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    hpMin: hpRange.min ? parseInt(hpRange.min) : undefined,
    hpMax: hpRange.max ? parseInt(hpRange.max) : undefined,
    illustrator: illustratorFilter === "all" ? undefined : illustratorFilter,
    collectionFilter: collectionFilter === "all" ? undefined : collectionFilter,
    wishlistFilter: wishlistFilter === "all" ? undefined : wishlistFilter,
    userId: user?.id,
    // New filters
    category: categoryFilter === "all" ? undefined : categoryFilter,
    stage: stageFilter === "all" ? undefined : stageFilter,
    evolveFrom: evolveFromFilter === "all" ? undefined : evolveFromFilter,
    retreatCost: retreatCostFilter === "all" ? undefined : retreatCostFilter,
    regulationMark: regulationMarkFilter === "all" ? undefined : regulationMarkFilter,
    formatLegality: formatLegalityFilter === "all" ? undefined : formatLegalityFilter,
    weaknessType: weaknessTypeFilter === "all" ? undefined : weaknessTypeFilter
  });

  // Fetch total count for pagination with all filters
  const { data: totalCount = 0 } = useCardsCount({
    setId: (setFilter || (setsFilter !== "all" ? setsFilter : undefined)) || undefined,
    language: languageFilter === "all" ? undefined : languageFilter,
    searchTerm: searchTerm || undefined,
    rarity: rarityFilter === "all" ? undefined : rarityFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    hpMin: hpRange.min ? parseInt(hpRange.min) : undefined,
    hpMax: hpRange.max ? parseInt(hpRange.max) : undefined,
    illustrator: illustratorFilter === "all" ? undefined : illustratorFilter,
    collectionFilter: collectionFilter === "all" ? undefined : collectionFilter,
    wishlistFilter: wishlistFilter === "all" ? undefined : wishlistFilter,
    userId: user?.id,
    // New filters
    category: categoryFilter === "all" ? undefined : categoryFilter,
    stage: stageFilter === "all" ? undefined : stageFilter,
    evolveFrom: evolveFromFilter === "all" ? undefined : evolveFromFilter,
    retreatCost: retreatCostFilter === "all" ? undefined : retreatCostFilter,
    regulationMark: regulationMarkFilter === "all" ? undefined : regulationMarkFilter,
    formatLegality: formatLegalityFilter === "all" ? undefined : formatLegalityFilter,
    weaknessType: weaknessTypeFilter === "all" ? undefined : weaknessTypeFilter
  });



  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Reset to first page when filters change
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleLanguageFilterChange = (newLanguageFilter: string) => {
    setLanguageFilter(newLanguageFilter);
    setCurrentPage(1);
  };

  // Initialize and update language filter from URL parameters
  React.useEffect(() => {
    const urlLanguage = searchParams.get("language");
    if (urlLanguage) {
      setLanguageFilter(urlLanguage);
    }
  }, [searchParams]);

  const handleRarityFilterChange = (newRarityFilter: string) => {
    setRarityFilter(newRarityFilter);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (newTypeFilter: string) => {
    setTypeFilter(newTypeFilter);
    setCurrentPage(1);
  };

  const handleHpRangeChange = (newHpRange: { min: string; max: string }) => {
    setHpRange(newHpRange);
    setCurrentPage(1);
  };

  const handleIllustratorFilterChange = (newIllustratorFilter: string) => {
    setIllustratorFilter(newIllustratorFilter);
    setCurrentPage(1);
  };

  const handleCollectionFilterChange = (newCollectionFilter: string) => {
    setCollectionFilter(newCollectionFilter);
    setCurrentPage(1);
  };

  const handleWishlistFilterChange = (newWishlistFilter: string) => {
    setWishlistFilter(newWishlistFilter);
    setCurrentPage(1);
  };

  // New filter change handlers
  const handleCategoryFilterChange = (newCategoryFilter: string) => {
    setCategoryFilter(newCategoryFilter);
    setCurrentPage(1);
  };

  const handleStageFilterChange = (newStageFilter: string) => {
    setStageFilter(newStageFilter);
    setCurrentPage(1);
  };

  const handleEvolveFromFilterChange = (newEvolveFromFilter: string) => {
    setEvolveFromFilter(newEvolveFromFilter);
    setCurrentPage(1);
  };

  const handleRetreatCostFilterChange = (newRetreatCostFilter: string) => {
    setRetreatCostFilter(newRetreatCostFilter);
    setCurrentPage(1);
  };

  const handleRegulationMarkFilterChange = (newRegulationMarkFilter: string) => {
    setRegulationMarkFilter(newRegulationMarkFilter);
    setCurrentPage(1);
  };

  const handleFormatLegalityFilterChange = (newFormatLegalityFilter: string) => {
    setFormatLegalityFilter(newFormatLegalityFilter);
    setCurrentPage(1);
  };

  const handleWeaknessTypeFilterChange = (newWeaknessTypeFilter: string) => {
    setWeaknessTypeFilter(newWeaknessTypeFilter);
    setCurrentPage(1);
  };

  const handleSetsFilterChange = (newSetsFilter: string) => {
    setSetsFilter(newSetsFilter);
    setCurrentPage(1);
  };

  const handleReloadCollection = () => {
    queryClient.invalidateQueries({ queryKey: ['collection', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['collection-count', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    toast({
      title: t('messages.collectionReloaded'),
      description: t('messages.collectionReloadedDescription'),
    });
  };

  // Bulk selection handlers
  const handleCardSelection = (cardId: string, isSelected: boolean) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(cardId);
      } else {
        newSet.delete(cardId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredCards.map(card => `${card.card_id}-${card.language}`)));
    }
  };

  const handleBulkAddToCollection = () => {
    if (selectedCards.size === 0) {
      toast({
        title: t('messages.noCardsSelected'),
        description: t('messages.pleaseSelectCards'),
        variant: "destructive",
      });
      return;
    }
    setIsBulkAddToCollectionModalOpen(true);
  };

  const handleBulkAddToCollectionWithDetails = async (cardDetails: { [cardId: string]: {
    condition: string;
    price: number;
    date: string;
    notes: string;
  }}) => {
    if (!user || selectedCards.size === 0) return;

    // Optimistic updates for all selected cards
    const selectedCardData = filteredCards.filter(card => 
      selectedCards.has(`${card.card_id}-${card.language}`)
    );
    const previousCheckData: { [cardId: string]: any } = {};
    
    // Store previous data and set optimistic updates
    selectedCardData.forEach(card => {
      const cardId = card.card_id;
      previousCheckData[cardId] = queryClient.getQueryData(['collection-check', user?.id, cardId]);
      queryClient.setQueryData(['collection-check', user?.id, cardId], true);
    });

    try {
      // Insert records with individual details for each card (one copy per card)
      const insertData = [];
      for (const card of selectedCardData) {
        const cardId = `${card.card_id}-${card.language}`;
        const details = cardDetails[cardId];
        
        if (details) {
          insertData.push({
            user_id: user.id,
            card_id: card.card_id,
            language: card.language || 'en',
            // Store full card details for proper display
            name: card.name,
            set_name: card.set_name,
            set_id: card.set_id,
            card_number: card.card_number,
            rarity: card.rarity,
            image_url: card.image_url,
            description: card.description,
            illustrator: card.illustrator,
            hp: card.hp,
            types: card.types,
            attacks: card.attacks,
            weaknesses: card.weaknesses,
            retreat: card.retreat,
            series_name: card.series_name,
            condition: details.condition,
            price: details.price,
            notes: details.notes || `Acquired on: ${details.date}`,
          });
        }
      }

      const { error } = await supabase
        .from('card_collections')
        .insert(insertData);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['collection', user.id] });
      queryClient.invalidateQueries({ queryKey: ['collection-count', user.id] });
      
      // Invalidate collection check queries for all selected cards
      selectedCardData.forEach(card => {
        queryClient.invalidateQueries({ queryKey: ['collection-check', user?.id, card.card_id] });
      });
      
      setIsBulkAddToCollectionModalOpen(false);
      setSelectedCards(new Set());
      setIsBulkSelectionMode(false);
      
      const totalCards = selectedCardData.length;
      const totalCopies = insertData.length;
      
      toast({
        title: t('messages.addedToCollection'),
        description: `${totalCards} cards added to collection (${totalCopies} total copies).`,
      });
    } catch (error) {
      console.error('Error adding cards to collection:', error);
      // Revert optimistic updates
      selectedCardData.forEach(card => {
        const cardId = card.card_id;
        if (previousCheckData[cardId] !== undefined) {
          queryClient.setQueryData(['collection-check', user?.id, cardId], previousCheckData[cardId]);
        }
      });
      toast({
        title: t('messages.error'),
        description: t('messages.collectionError'),
        variant: "destructive",
      });
    }
  };

  const toggleBulkSelectionMode = () => {
    setIsBulkSelectionMode(!isBulkSelectionMode);
    if (isBulkSelectionMode) {
      setSelectedCards(new Set());
    }
  };



  // Use cards data directly since we're filtering by language at the database level
  const filteredCards = cardsData || [];
  
  // Fetch prices for all cards directly from card_prices table
  // Match using card_id, language, and get the latest based on download_id
  const cardIds = filteredCards.length > 0 ? Array.from(new Set(filteredCards.map(card => card.card_id))) : [];
  
  // Create a map of cards by card_id + language for quick lookup
  const cardsByKey = new Map<string, any>();
  filteredCards.forEach((card) => {
    const key = `${card.card_id}-${card.language || 'en'}`;
    cardsByKey.set(key, card);
  });
  
  // Create a stable key for the query based on card IDs and language filter
  const priceQueryKey = cardIds.length > 0 
    ? ['card-prices-direct', cardIds.sort().join(','), languageFilter, filteredCards.length]
    : ['card-prices-direct', 'empty'];
  
  const { data: cardPricesData, isLoading: pricesLoading } = useQuery({
    queryKey: priceQueryKey,
    queryFn: async () => {
      if (cardIds.length === 0 || filteredCards.length === 0) {
        console.log('📊 No cards to fetch prices for');
        return [];
      }
      
      console.log('📊 Fetching prices for', cardIds.length, 'unique card IDs,', filteredCards.length, 'total cards');
      console.log('📊 Cards sample:', filteredCards.slice(0, 3).map(c => ({ 
        id: c.card_id, 
        lang: c.language || 'en',
        hasLang: !!c.language 
      })));
      
      // ============================================================================
      // PRICE DATA SOURCE VERIFICATION
      // ============================================================================
      // Table: card_prices (NOT price_history or any other table)
      // Field: avg_sell_price (this is the CardMarket average sell price in EUR)
      // 
      // Schema of card_prices table:
      //   - id: primary key
      //   - card_id: TEXT (matches card.card_id)
      //   - language: TEXT (matches card.language, e.g., 'en', 'fr', 'de')
      //   - avg_sell_price: DECIMAL/NUMERIC (the price we display)
      //   - download_id: TEXT (used to determine latest price, format: "YYYY/MM/DD/HH")
      //   - date_recorded: TIMESTAMP (fallback for determining latest price)
      //   - updated_at: TIMESTAMP (fallback for determining latest price)
      //
      // Note: We query the table directly (not the latest_prices view) because:
      //   1. We need to parse download_id to accurately determine the latest price
      //   2. The view uses simpler ordering (date_recorded, updated_at, id) which
      //      doesn't account for download_id parsing logic
      // ============================================================================
      console.log('🔍 VERIFICATION: Querying card_prices table');
      console.log('  📊 Table: card_prices (confirmed correct)');
      console.log('  💰 Field: avg_sell_price (confirmed correct)');
      console.log('  📋 Selected fields: card_id, language, avg_sell_price, download_id, date_recorded, updated_at');
      console.log('  🎯 Card IDs to fetch:', cardIds.length, 'unique IDs');
      
      const { data, error } = await supabase
        .from('card_prices')  // ✅ CORRECT TABLE: card_prices
        .select('card_id, language, avg_sell_price, download_id, date_recorded, updated_at')  // ✅ CORRECT FIELD: avg_sell_price
        .in('card_id', cardIds);
      
      if (error) {
        console.error('❌ Error fetching prices from card_prices:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️ No price data found in card_prices table for card_ids:', cardIds.slice(0, 5));
        return [];
      }
      
      // ============================================================================
      // VERIFICATION: Confirm data source
      // ============================================================================
      console.log('✅ SUCCESS: Retrieved', data.length, 'price records from card_prices table');
      console.log('  📊 Source Table: card_prices ✅');
      console.log('  💰 Price Field: avg_sell_price ✅');
      
      // DEBUG: Log the actual structure of the first record to verify field names
      if (data.length > 0) {
        const firstRecord = data[0];
        const allKeys = Object.keys(firstRecord);
        console.log('');
        console.log('🔍 FIRST PRICE RECORD STRUCTURE VERIFICATION:');
        console.log('  📋 All field names in record:', allKeys);
        console.log('  🔑 card_id:', firstRecord.card_id);
        console.log('  🌐 language:', firstRecord.language);
        console.log('  💰 avg_sell_price:', firstRecord.avg_sell_price, '(type:', typeof firstRecord.avg_sell_price + ')');
        console.log('  📥 download_id:', firstRecord.download_id);
        console.log('  📅 date_recorded:', firstRecord.date_recorded);
        console.log('  ⏰ updated_at:', firstRecord.updated_at);
        
        // Check if avg_sell_price exists or if there's a different field name
        if (!('avg_sell_price' in firstRecord)) {
          console.error('');
          console.error('❌ CRITICAL ERROR: avg_sell_price field NOT FOUND in database response!');
          console.error('❌ This means we are NOT querying the correct table/field!');
          console.error('❌ Available fields:', allKeys);
          // Check for common alternative field names
          const possiblePriceFields = allKeys.filter(k => 
            k.toLowerCase().includes('price') || 
            k.toLowerCase().includes('avg') ||
            k.toLowerCase().includes('sell')
          );
          if (possiblePriceFields.length > 0) {
            console.error('⚠️ Possible price fields found:', possiblePriceFields);
          }
          console.error('');
        } else {
          console.log('');
          console.log('✅ VERIFICATION PASSED: avg_sell_price field EXISTS');
          console.log('  💰 Price value:', firstRecord.avg_sell_price);
          console.log('  📊 Data type:', typeof firstRecord.avg_sell_price);
          console.log('  ✅ Table: card_prices (confirmed)');
          console.log('  ✅ Field: avg_sell_price (confirmed)');
          console.log('');
        }
        
        // Log the full record as JSON for inspection
        console.log('  📄 Full record (JSON):', JSON.stringify(firstRecord, null, 2));
        console.log('');
      }
      
      console.log('📊 Price data sample:', data.slice(0, 3).map((p: any) => ({ 
        id: p.card_id, 
        lang: p.language || 'en', 
        price: p.avg_sell_price,
        priceType: typeof p.avg_sell_price,
        hasPrice: !!p.avg_sell_price,
        allFields: Object.keys(p)
      })));
      
      // Helper function to parse download_id and convert to comparable format
      const parseDownloadId = (downloadId: string): number => {
        if (!downloadId) return 0;
        const parts = downloadId.split('/').map(Number);
        if (parts.length >= 3) {
          return parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0) + (parts[3] || 0) * 0.01;
        }
        return 0;
      };
      
      // Group prices by (card_id, language) first
      const pricesByKey = new Map<string, any[]>();
      data.forEach((price: any) => {
        const priceCardId = price.card_id;
        const priceLanguage = (price.language || 'en').toLowerCase().trim();
        const key = `${priceCardId}-${priceLanguage}`;
        
        if (!pricesByKey.has(key)) {
          pricesByKey.set(key, []);
        }
        pricesByKey.get(key)!.push(price);
      });
      
      console.log('📊 Prices grouped by key:', pricesByKey.size, 'unique combinations');
      console.log('📊 Sample price keys:', Array.from(pricesByKey.keys()).slice(0, 5));
      
      // For each card, find the matching price record
      const priceResults: Array<{ key: string; priceData: any }> = [];
      
      filteredCards.forEach((card) => {
        const cardId = card.card_id;
        // Normalize language - handle null, undefined, and trim whitespace
        const cardLanguage = (card.language || 'en').toLowerCase().trim();
        const key = `${cardId}-${cardLanguage}`;
        
        // Get all price records for this card_id + language combination
        let matchingPrices = pricesByKey.get(key) || [];
        
        // If no exact match, try fallback to any language for this card_id
        if (matchingPrices.length === 0) {
          const fallbackKey = Array.from(pricesByKey.keys()).find(k => {
            const [priceCardId] = k.split('-');
            return priceCardId === cardId;
          });
          
          if (fallbackKey) {
            const fallbackPrices = pricesByKey.get(fallbackKey) || [];
            if (fallbackPrices.length > 0) {
              const fallbackLang = fallbackKey.split('-').slice(1).join('-');
              console.log(`⚠️ Using fallback price for ${cardId} (wanted "${cardLanguage}", found "${fallbackLang}")`);
              matchingPrices = fallbackPrices;
            }
          }
        }
        
        if (matchingPrices.length === 0) {
          console.log(`❌ No price found for card_id: ${cardId}, language: ${cardLanguage}`);
          return;
        }
        
        // Find the latest price by download_id or date_recorded
        let latestPrice = matchingPrices[0];
        let latestDownloadIdValue = parseDownloadId(latestPrice.download_id || '');
        
        matchingPrices.forEach((price: any) => {
          const currentDownloadIdValue = parseDownloadId(price.download_id || '');
          
          if (currentDownloadIdValue > latestDownloadIdValue) {
            latestPrice = price;
            latestDownloadIdValue = currentDownloadIdValue;
          } else if (currentDownloadIdValue === 0 && latestDownloadIdValue === 0) {
            // Compare by date_recorded if no download_id
            if (price.date_recorded && latestPrice.date_recorded) {
              const currentDate = new Date(price.date_recorded).getTime();
              const existingDate = new Date(latestPrice.date_recorded).getTime();
              if (currentDate > existingDate) {
                latestPrice = price;
              }
            } else if (price.date_recorded && !latestPrice.date_recorded) {
              latestPrice = price;
            }
          }
        });
        
        // Ensure price is a number, not a string or null
        const priceValue = latestPrice.avg_sell_price != null 
          ? Number(latestPrice.avg_sell_price) 
          : null;
        
        // Only add if we have a valid price value
        if (priceValue != null && !isNaN(priceValue) && priceValue > 0) {
          // Store the price result
          priceResults.push({
            key,
            priceData: {
              card_id: cardId,
              language: cardLanguage,
              cardmarket_avg_sell_price: priceValue,
              download_id: latestPrice.download_id,
              last_updated: latestPrice.updated_at || latestPrice.date_recorded
            }
          });
          
          console.log(`✅ Matched price for ${key}:`);
          console.log('  💰 Price value:', priceValue, '(type:', typeof priceValue + ')');
          console.log('  📥 Download ID:', latestPrice.download_id);
          console.log('  🌐 Language:', latestPrice.language || 'en');
          console.log('  📦 Price data object:', JSON.stringify({
            card_id: cardId,
            language: cardLanguage,
            cardmarket_avg_sell_price: priceValue,
            download_id: latestPrice.download_id,
            last_updated: latestPrice.updated_at || latestPrice.date_recorded
          }, null, 2));
        } else {
          console.log(`⚠️ Invalid price for ${key}:`, {
            avg_sell_price: latestPrice.avg_sell_price,
            converted: priceValue,
            isNaN: isNaN(priceValue),
            isNull: priceValue == null
          });
        }
      });
      
      // ============================================================================
      // FINAL VERIFICATION SUMMARY
      // ============================================================================
      console.log('');
      console.log('📊 FINAL PRICE PROCESSING SUMMARY:');
      console.log('  ✅ Source Table: card_prices');
      console.log('  ✅ Price Field: avg_sell_price');
      console.log('  📊 Total records retrieved:', data.length);
      console.log('  🎯 Cards with prices:', priceResults.length, 'out of', filteredCards.length, 'cards');
      console.log('  💰 All prices extracted from: card_prices.avg_sell_price');
      console.log('');
      
      return priceResults;
    },
    enabled: cardIds.length > 0 && filteredCards.length > 0 && !isLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Convert price results array to a Map for easy lookup
  const priceMap = React.useMemo(() => {
    const map = new Map<string, any>();
    if (cardPricesData && Array.isArray(cardPricesData)) {
      cardPricesData.forEach(({ key, priceData }) => {
        map.set(key, priceData);
      });
      console.log('📊 Price map created with', map.size, 'entries');
      if (map.size > 0) {
        console.log('📊 Sample price map keys:', Array.from(map.keys()).slice(0, 5));
        console.log('📊 Sample price map values:', Array.from(map.values()).slice(0, 2).map(v => ({
          card_id: v.card_id,
          language: v.language,
          price: v.cardmarket_avg_sell_price
        })));
      }
    } else {
      console.log('📊 No price data available yet');
    }
    return map;
  }, [cardPricesData]);
  
  // Debug: Log price lookup for first few cards and verify data structure
  React.useEffect(() => {
    if (filteredCards.length > 0 && priceMap.size > 0) {
      console.log('🔍 Price lookup debug for first 5 cards:');
      filteredCards.slice(0, 5).forEach(card => {
        const lookupKey = `${card.card_id}-${(card.language || 'en').toLowerCase().trim()}`;
        const price = priceMap.get(lookupKey);
        console.log(`  Card: ${card.card_id}, Lang: ${card.language || 'en'}, Key: ${lookupKey}, Found: ${!!price}`, {
          priceData: price,
          priceValue: price?.cardmarket_avg_sell_price,
          priceType: typeof price?.cardmarket_avg_sell_price,
          isNumber: typeof price?.cardmarket_avg_sell_price === 'number',
          isGreaterThanZero: price?.cardmarket_avg_sell_price > 0
        });
      });
    } else if (filteredCards.length > 0) {
      console.log('⚠️ Price map is empty but cards exist. Cards:', filteredCards.length, 'Price map size:', priceMap.size);
    }
  }, [filteredCards, priceMap]);

  // Handler for opening add to collection modal
  const handleAddToCollection = (card) => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredCollection'),
        variant: "destructive",
      });
      return;
    }
    setSelectedCardForCollection(card);
    setIsAddToCollectionModalOpen(true);
  };

  // Handler for adding to collection with modal data
  const handleAddToCollectionWithDetails = async (entries: Array<{
    id: string;
    condition: string;
    price: number;
    date: string;
    notes: string;
    language: string;
    acquiredDate: string;
  }>) => {
    if (!user || !selectedCardForCollection) return;

    // Optimistic update for collection check
    const cardId = selectedCardForCollection.card_id;
    const previousCheckData = queryClient.getQueryData(['collection-check', user?.id, cardId]);
    console.log('Cards - Setting optimistic update for card:', cardId, 'previousData:', previousCheckData, 'timestamp:', new Date().toISOString());
    queryClient.setQueryData(['collection-check', user?.id, cardId], true);

    try {
      // Create insert data for all entries (each entry represents one card copy)
      const insertData = entries.map(entry => ({
        user_id: user.id,
        card_id: selectedCardForCollection.card_id,
        language: entry.language || selectedCardForCollection.language || 'en',
        // Store full card details for proper display
        name: selectedCardForCollection.name,
        set_name: selectedCardForCollection.set_name,
        set_id: selectedCardForCollection.set_id,
        card_number: selectedCardForCollection.card_number,
        rarity: selectedCardForCollection.rarity,
        image_url: selectedCardForCollection.image_url,
        description: selectedCardForCollection.description,
        illustrator: selectedCardForCollection.illustrator,
        hp: selectedCardForCollection.hp,
        types: selectedCardForCollection.types,
        attacks: selectedCardForCollection.attacks,
        weaknesses: selectedCardForCollection.weaknesses,
        retreat: selectedCardForCollection.retreat,
        series_name: selectedCardForCollection.series_name,
        condition: entry.condition,
        price: entry.price,
        notes: entry.notes || `Acquired on: ${entry.date}`,
      }));

      const { error } = await supabase
        .from('card_collections')
        .insert(insertData);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['collection', user.id] });
      queryClient.invalidateQueries({ queryKey: ['collection-count', user.id] });
      queryClient.invalidateQueries({ queryKey: ['collection-check', user?.id, selectedCardForCollection.card_id] });
      setIsAddToCollectionModalOpen(false);
      setSelectedCardForCollection(null);
      
      const totalCopies = entries.length;
      toast({
        title: t('messages.addedToCollection'),
        description: `${selectedCardForCollection.name} ${t('messages.addedToCollection').toLowerCase()} (${totalCopies} ${totalCopies === 1 ? 'copy' : 'copies'}).`,
      });
    } catch (error) {
      console.error('Error adding to collection:', error);
      // Revert optimistic update
      if (previousCheckData !== undefined) {
        queryClient.setQueryData(['collection-check', user?.id, cardId], previousCheckData);
      }
      toast({
        title: t('messages.error'),
        description: t('messages.collectionError'),
        variant: "destructive",
      });
    }
  };

  // Handler for adding to wishlist from list view
  const handleAddToWishlist = async (card) => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredWishlist'),
        variant: "destructive",
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('card_wishlist')
        .insert({
          user_id: user.id,
          card_id: card.card_id,
          language: card.language || 'en',
        });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count', user.id] });
      toast({
        title: t('messages.addedToWishlist'),
        description: `${card.name} ${t('messages.addedToWishlist').toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: t('messages.error'),
        description: t('messages.wishlistError'),
        variant: "destructive",
      });
    }
  };

  // Test function to check database connectivity
  const testDatabaseConnection = async () => {

    
    try {
      // Test cards table
      const { data: cardsTest, error: cardsError } = await supabase
        .from('cards')
        .select('card_id, name, language')
        .limit(1);
      
      
      
      // Test card_wishlist table
      const { data: wishlistTest, error: wishlistError } = await supabase
        .from('card_wishlist')
        .select('*')
        .limit(1);
      
      
      
      // Test card_collections table
      const { data: collectionsTest, error: collectionsError } = await supabase
        .from('card_collections')
        .select('*')
        .limit(1);
      
      
      
    } catch (error) {
      console.error('Database connection test error:', error);
    }
  };

  // Run the test when component mounts
  React.useEffect(() => {
    testDatabaseConnection();
  }, []);





  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">{t('cards.loadError')}</h2>
          <p className="text-muted-foreground">{t('cards.loadErrorSubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
          <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-8 uppercase tracking-wider">
            <span className="bg-yellow-400 text-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
              {t('cards.title')}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-bold">
            {t('cards.subtitle')}
          </p>
        </div>

      {/* Advanced Search and Filters */}
             <AdvancedFilters
         searchTerm={searchTerm}
         onSearchChange={handleSearchChange}
         languageFilter={languageFilter}
         onLanguageChange={handleLanguageFilterChange}
         rarityFilter={rarityFilter}
         onRarityChange={handleRarityFilterChange}
         typeFilter={typeFilter}
         onTypeChange={handleTypeFilterChange}
         hpRange={hpRange}
         onHpRangeChange={handleHpRangeChange}
         illustratorFilter={illustratorFilter}
         onIllustratorChange={handleIllustratorFilterChange}
         collectionFilter={collectionFilter}
         onCollectionChange={handleCollectionFilterChange}
         wishlistFilter={wishlistFilter}
         onWishlistChange={handleWishlistFilterChange}
         onReloadCollection={handleReloadCollection}
         // New filter props
         categoryFilter={categoryFilter}
         onCategoryChange={handleCategoryFilterChange}
         stageFilter={stageFilter}
         onStageChange={handleStageFilterChange}
         evolveFromFilter={evolveFromFilter}
         onEvolveFromChange={handleEvolveFromFilterChange}
         retreatCostFilter={retreatCostFilter}
         onRetreatCostChange={handleRetreatCostFilterChange}
         regulationMarkFilter={regulationMarkFilter}
         onRegulationMarkChange={handleRegulationMarkFilterChange}
         formatLegalityFilter={formatLegalityFilter}
         onFormatLegalityChange={handleFormatLegalityFilterChange}
         weaknessTypeFilter={weaknessTypeFilter}
         onWeaknessTypeChange={handleWeaknessTypeFilterChange}
         setsFilter={setsFilter}
         onSetsChange={handleSetsFilterChange}
       />

      {/* View Mode Toggle and Bulk Actions */}
      <div className="flex justify-between items-center mb-6">
        {/* Bulk Selection Controls */}
        {isBulkSelectionMode && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedCards.size === filteredCards.length ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedCards.size} of {filteredCards.length} selected
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkAddToCollection}
              disabled={selectedCards.size === 0}
            >
              Add {selectedCards.size} to Collection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBulkSelectionMode}
            >
              Cancel
            </Button>
          </div>
        )}
        
        {/* View Mode Toggle */}
        <div className="flex gap-2 ml-auto">
          <Button
            variant={isBulkSelectionMode ? "outline" : "default"}
            size="sm"
            onClick={toggleBulkSelectionMode}
          >
            {isBulkSelectionMode ? 'Exit Selection' : 'Select Multiple'}
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
            size="sm"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="sm"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Pagination Info and Controls */}
      {totalCount > 0 && (
        <div className="mb-4 space-y-4">
          <PaginationInfo
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}



      {/* Cards Display */}
      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="pixel-card animate-pulse">
                <div className="aspect-[3/4] bg-muted"></div>
                <div className="p-4">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3 p-3 border rounded-lg">
                  <div className="w-16 h-20 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : viewMode === "grid" ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
           {filteredCards.map((card) => (
             <div key={`${card.card_id}-${card.language}`} className="relative">
               {/* Selection Checkbox */}
               {isBulkSelectionMode && (
                 <div className="absolute top-2 left-2 z-50">
                   <input
                     type="checkbox"
                     checked={selectedCards.has(`${card.card_id}-${card.language}`)}
                     onChange={(e) => {
                       e.stopPropagation();
                       handleCardSelection(`${card.card_id}-${card.language}`, e.target.checked);
                     }}
                     onClick={(e) => e.stopPropagation()}
                     className="w-4 h-4 text-primary bg-background border-2 border-primary rounded focus:ring-primary focus:ring-2 cursor-pointer"
                   />
                 </div>
               )}
               <CardWithWishlist
                 key={`${card.card_id}-${card.language || 'en'}-${priceMap.has(`${card.card_id}-${(card.language || 'en').toLowerCase().trim()}`) ? 'with-price' : 'no-price'}`}
                 card={card}
                 hidePriceAndBuy={true}
                 onAddToCollection={handleAddToCollection}
                 priceData={priceMap.get(`${card.card_id}-${(card.language || 'en').toLowerCase().trim()}`) || undefined}
               />
             </div>
           ))}
         </div>
      ) : (
        <div className="space-y-2">
          {filteredCards.map((card) => (
            <div key={`${card.card_id}-${card.language}`} className="relative">
              {/* Selection Checkbox */}
              {isBulkSelectionMode && (
                <div className="absolute top-2 left-2 z-50">
                  <input
                    type="checkbox"
                    checked={selectedCards.has(`${card.card_id}-${card.language}`)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCardSelection(`${card.card_id}-${card.language}`, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-primary bg-background border-2 border-primary rounded focus:ring-primary focus:ring-2 cursor-pointer"
                  />
                </div>
              )}
              <CompactCardListItem
                key={`${card.card_id}-${card.language || 'en'}-${priceMap.has(`${card.card_id}-${(card.language || 'en').toLowerCase().trim()}`) ? 'with-price' : 'no-price'}`}
                card={card}
                onAddToCollection={handleAddToCollection}
                priceData={priceMap.get(`${card.card_id}-${(card.language || 'en').toLowerCase().trim()}`) || undefined}
              />
            </div>
          ))}
        </div>
      )}



      {/* Empty State */}
      {!isLoading && filteredCards.length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('cards.noCardsFound')}</h3>
          <p className="text-muted-foreground">
            {t('cards.noCardsSubtitle')}
          </p>
        </div>
      )}

      {/* Bottom Pagination Controls */}
      {totalCount > 0 && totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add to Collection Modal */}
      <AddToCollectionModal
        isOpen={isAddToCollectionModalOpen}
        onClose={() => {
          setIsAddToCollectionModalOpen(false);
          setSelectedCardForCollection(null);
        }}
        onAdd={handleAddToCollectionWithDetails}
        cardName={selectedCardForCollection?.name || ''}
        isLoading={isAddingToCollection}
        cardId={selectedCardForCollection?.card_id}
        defaultLanguage={selectedCardForCollection?.language}
      />

      {/* Bulk Add to Collection Modal */}
      <BulkAddToCollectionModal
        isOpen={isBulkAddToCollectionModalOpen}
        onClose={() => {
          setIsBulkAddToCollectionModalOpen(false);
        }}
        onAdd={handleBulkAddToCollectionWithDetails}
        selectedCards={filteredCards.filter(card => 
          selectedCards.has(`${card.card_id}-${card.language}`)
        )}
        isLoading={isAddingToCollection}
      />
    </div>
  );
};


export default Cards;
