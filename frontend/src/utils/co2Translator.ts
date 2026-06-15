/**
 * CO2 Translator Utility
 * Converts CO2 kg values into relatable, tangible comparisons
 */

export interface CO2Comparison {
  value: string;
  description: string;
  icon: string;
}

/**
 * Translates CO2 kg into relatable comparisons
 * @param co2Kg - Amount of CO2 in kilograms
 * @returns Array of relatable comparisons
 */
export function translateCO2(co2Kg: number): CO2Comparison[] {
  const comparisons: CO2Comparison[] = [];

  // Driving distance (average car: 0.12 kg CO2 per km)
  const kmDriven = co2Kg / 0.12;
  if (kmDriven >= 1) {
    comparisons.push({
      value: kmDriven.toFixed(1),
      description: kmDriven >= 1 ? 'km driven in an average car' : 'meters driven',
      icon: '🚗',
    });
  }

  // Trees needed to absorb (one tree absorbs ~21 kg CO2 per year, or ~0.058 kg per day)
  const treeDays = co2Kg / 0.058;
  if (treeDays >= 0.5) {
    comparisons.push({
      value: treeDays.toFixed(1),
      description: treeDays >= 1 ? 'tree-days of absorption needed' : 'tree-hours needed',
      icon: '🌳',
    });
  }

  // Smartphone charges (0.008 kg CO2 per full charge)
  const phoneCharges = co2Kg / 0.008;
  if (phoneCharges >= 1) {
    comparisons.push({
      value: phoneCharges.toFixed(0),
      description: 'smartphone charges',
      icon: '📱',
    });
  }

  // LED bulb hours (60W LED: ~0.012 kg CO2 per hour)
  const bulbHours = co2Kg / 0.012;
  if (bulbHours >= 1) {
    comparisons.push({
      value: bulbHours.toFixed(0),
      description: 'hours of LED light bulb',
      icon: '💡',
    });
  }

  // Meals (average meal: ~2.5 kg CO2)
  const meals = co2Kg / 2.5;
  if (meals >= 0.5) {
    comparisons.push({
      value: meals.toFixed(1),
      description: 'average meals',
      icon: '🍽️',
    });
  }

  // Streaming hours (1 hour HD streaming: ~0.055 kg CO2)
  const streamingHours = co2Kg / 0.055;
  if (streamingHours >= 1) {
    comparisons.push({
      value: streamingHours.toFixed(0),
      description: 'hours of HD video streaming',
      icon: '📺',
    });
  }

  // If very small amount, show in grams
  if (comparisons.length === 0 && co2Kg < 0.1) {
    comparisons.push({
      value: (co2Kg * 1000).toFixed(0),
      description: 'grams of CO2',
      icon: '⚖️',
    });
  }

  return comparisons.slice(0, 2); // Return top 2 most relevant comparisons
}

/**
 * Get a single, most relatable comparison for display
 */
export function getPrimaryComparison(co2Kg: number): CO2Comparison {
  const comparisons = translateCO2(co2Kg);
  return comparisons[0] || {
    value: co2Kg.toFixed(2),
    description: 'kg of CO2',
    icon: '🌍',
  };
}

/**
 * Format CO2 value with comparison for inline display
 */
export function formatCO2WithComparison(co2Kg: number): string {
  const primary = getPrimaryComparison(co2Kg);
  return `${co2Kg.toFixed(2)} kg CO₂ (≈ ${primary.icon} ${primary.value} ${primary.description})`;
}

// Made with Bob