
export const mapDatabaseRarityToComponent = (dbRarity: string): "common" | "rare" | "epic" | "legendary" => {
  const normalizedRarity = dbRarity.toLowerCase().trim();

  if (normalizedRarity.includes('hiper rara') || normalizedRarity.includes('hiper raro')) {
    return "legendary";
  }
  
  switch (normalizedRarity) {
    
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
    case "none":
    case "two diamond":
    case "illustration rare":
    case "double rare":
      return "common";

    case "commune":
    case "peu commune":
    case "incomum":
      return "common";

    case "comum":
      return "common";

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
      
      if (normalizedRarity.includes('hiper') || normalizedRarity.includes('legendary') || normalizedRarity.includes('secret')) {
        return "legendary";
      }
      if (normalizedRarity.includes('ultra') || normalizedRarity.includes('hyper')) {
        return "epic";
      }
      if (normalizedRarity.includes('rare')) {
        return "rare";
      }
      
      return "common";
  }
}; 