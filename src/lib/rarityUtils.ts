// Shared utility function to map database rarity to component rarity
export const mapDatabaseRarityToComponent = (dbRarity: string): "common" | "rare" | "epic" | "legendary" => {
  console.log('Processing rarity:', dbRarity, 'Normalized:', dbRarity.toLowerCase());
  const normalizedRarity = dbRarity.toLowerCase().trim();
  
  // Check for partial matches first
  if (normalizedRarity.includes('hiper rara') || normalizedRarity.includes('hiper raro')) {
    return "legendary";
  }
  
  switch (normalizedRarity) {
    // English terms
    case "common":
    case "uncommon":
      return "common";
    case "rare":
      return "rare";
    case "ultra rare":
    case "hyper rare":
      return "epic";
    case "legendary":
    case "secret rare":
      return "legendary";
    
    // German terms
    case "häufig":
      return "common";
    case "selten":
      return "rare";
    case "ungewöhnlich":
      return "rare";
    case "ultra selten":
      return "epic";
    case "versteckt selten":
      return "legendary";
    case "holografisch selten":
      return "legendary";
    case "holografisch selten v":
      return "legendary";
    case "doppelselten":
      return "legendary";
    case "shiny rare":
      return "legendary";
    case "keine":
      return "common";
    
    // French terms
    case "commune":
    case "peu commune":
    case "incomum":
      return "common";
    
    // Portuguese terms
    case "comum":
      return "common";
    
    // Spanish terms
    case "común":
    case "comun":
      return "common";
    case "rara":
    case "poco común":
    case "poco comun":
      return "rare";
    case "ultra rara":
    case "ultra raro":
      return "epic";
    case "hiper rara":
    case "hiper raro":
    case "hiper rara ":
    case "hiper raro ":
    case " hiper rara":
    case " hiper raro":
    case "secreta rara":
    case "secreta raro":
    case "legendaria":
    case "legendario":
      return "legendary";
    
    default:
      // Final fallback check for any remaining cases
      if (normalizedRarity.includes('hiper') || normalizedRarity.includes('legendary') || normalizedRarity.includes('secret')) {
        return "legendary";
      }
      if (normalizedRarity.includes('ultra') || normalizedRarity.includes('hyper')) {
        return "epic";
      }
      if (normalizedRarity.includes('rare')) {
        return "rare";
      }
      console.warn(`Unknown database rarity: ${dbRarity}, defaulting to common`);
      return "common";
  }
}; 