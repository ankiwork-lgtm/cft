/**
 * Tip Rules Library
 * Defines all available tip rules with conditions and messages
 */

import { TipRule } from '../types/tipRule.types';

export const TIP_RULES: TipRule[] = [
  // Transport Tips
  {
    id: 'transport-high-percentage',
    title: 'Reduce Transportation Emissions',
    message:
      'Transportation makes up a large portion of your carbon footprint. Consider carpooling, public transit, or cycling for shorter trips to make a meaningful impact.',
    category: 'transport',
    priority: 'high',
    condition: {
      type: 'category_percentage',
      category: 'transport',
      threshold: 40, // >40% of weekly total
    },
    estimatedSavingsKg: 0.7,
    savingsPeriod: 'day',
    actionableSteps: [
      'Use public transportation for your daily commute',
      'Carpool with colleagues or neighbors',
      'Bike or walk for trips under 3 km',
      'Combine errands into a single trip',
    ],
    source: 'EPA Transportation Emissions Data',
  },
  {
    id: 'car-frequent-use',
    title: 'Try Alternative Transportation',
    message:
      "You've been driving frequently this week. Even replacing one car trip with public transit or cycling can reduce your emissions significantly.",
    category: 'transport',
    priority: 'medium',
    condition: {
      type: 'activity_frequency',
      category: 'transport',
      activityType: 'car',
      threshold: 5, // 5+ car trips this week
    },
    estimatedSavingsKg: 0.5,
    savingsPeriod: 'day',
    actionableSteps: [
      'Plan one car-free day this week',
      'Use a bike-sharing service for short trips',
      'Try the bus or train for your commute',
      'Walk to nearby destinations',
    ],
  },
  {
    id: 'flight-taken',
    title: 'Offset Your Flight Emissions',
    message:
      'Air travel has a significant carbon impact. Consider carbon offset programs or video conferencing for future trips when possible.',
    category: 'transport',
    priority: 'high',
    condition: {
      type: 'activity_frequency',
      category: 'transport',
      activityType: 'flight',
      threshold: 1, // Any flight this week
    },
    estimatedSavingsKg: 2.5,
    savingsPeriod: 'day',
    actionableSteps: [
      'Purchase carbon offsets for your flight',
      'Consider train travel for shorter distances',
      'Use video conferencing when possible',
      'Combine business trips to reduce frequency',
    ],
  },

  // Food Tips
  {
    id: 'red-meat-frequent',
    title: 'Explore Plant-Based Meals',
    message:
      "You've logged red meat several times this week. Swapping just one or two meals for plant-based options can significantly reduce your food-related emissions.",
    category: 'food',
    priority: 'high',
    condition: {
      type: 'activity_frequency',
      category: 'food',
      activityType: 'beef',
      threshold: 3, // 3+ beef meals this week
    },
    estimatedSavingsKg: 1.2,
    savingsPeriod: 'day',
    actionableSteps: [
      'Try "Meatless Monday" or another meat-free day',
      'Explore plant-based protein alternatives',
      'Choose chicken or fish instead of beef',
      'Experiment with vegetarian recipes',
    ],
    source: 'Oxford University Food Emissions Study',
  },
  {
    id: 'food-high-percentage',
    title: 'Optimize Your Diet',
    message:
      'Food choices are a major part of your carbon footprint. Small changes like reducing meat consumption or choosing local produce can make a big difference.',
    category: 'food',
    priority: 'medium',
    condition: {
      type: 'category_percentage',
      category: 'food',
      threshold: 35, // >35% of weekly total
    },
    estimatedSavingsKg: 0.8,
    savingsPeriod: 'day',
    actionableSteps: [
      'Buy seasonal and local produce',
      'Reduce food waste by meal planning',
      'Choose plant-based meals more often',
      'Compost food scraps if possible',
    ],
  },
  {
    id: 'pork-frequent',
    title: 'Diversify Your Protein Sources',
    message:
      'Varying your protein sources can help reduce emissions. Consider incorporating more poultry, fish, or plant-based proteins into your meals.',
    category: 'food',
    priority: 'low',
    condition: {
      type: 'activity_frequency',
      category: 'food',
      activityType: 'pork',
      threshold: 4, // 4+ pork meals this week
    },
    estimatedSavingsKg: 0.4,
    savingsPeriod: 'day',
    actionableSteps: [
      'Try legumes like lentils or chickpeas',
      'Incorporate more fish into your diet',
      'Experiment with tofu or tempeh',
      'Mix vegetables with smaller portions of meat',
    ],
  },

  // Energy Tips
  {
    id: 'energy-high-percentage',
    title: 'Reduce Energy Consumption',
    message:
      'Your energy usage is higher than average. Simple changes like adjusting your thermostat or switching to LED bulbs can lower both emissions and costs.',
    category: 'energy',
    priority: 'high',
    condition: {
      type: 'category_percentage',
      category: 'energy',
      threshold: 30, // >30% of weekly total
    },
    estimatedSavingsKg: 0.6,
    savingsPeriod: 'day',
    actionableSteps: [
      'Adjust thermostat by 2°C (saves 10% energy)',
      'Switch to LED bulbs throughout your home',
      'Unplug devices when not in use',
      'Use energy-efficient appliances',
    ],
    source: 'Department of Energy Efficiency Guidelines',
  },
  {
    id: 'heating-high-use',
    title: 'Optimize Home Heating',
    message:
      'Heating is a significant energy consumer. Better insulation and smart thermostat use can keep you comfortable while reducing emissions.',
    category: 'energy',
    priority: 'medium',
    condition: {
      type: 'activity_frequency',
      category: 'energy',
      activityType: 'heating',
      threshold: 5, // High heating usage
    },
    estimatedSavingsKg: 0.5,
    savingsPeriod: 'day',
    actionableSteps: [
      'Lower thermostat when sleeping or away',
      'Seal drafts around windows and doors',
      'Use a programmable thermostat',
      'Wear warmer clothing indoors',
    ],
  },
  {
    id: 'cooling-high-use',
    title: 'Smart Cooling Strategies',
    message:
      'Air conditioning can be energy-intensive. Using fans, closing blinds during peak sun, and raising the thermostat slightly can help.',
    category: 'energy',
    priority: 'medium',
    condition: {
      type: 'activity_frequency',
      category: 'energy',
      activityType: 'cooling',
      threshold: 5, // High cooling usage
    },
    estimatedSavingsKg: 0.5,
    savingsPeriod: 'day',
    actionableSteps: [
      'Raise AC temperature by 2°C',
      'Use ceiling fans to circulate air',
      'Close blinds during the hottest part of the day',
      'Ensure AC filters are clean',
    ],
  },

  // Shopping Tips
  {
    id: 'shopping-high-percentage',
    title: 'Mindful Shopping Habits',
    message:
      'Consumer goods have hidden carbon costs from manufacturing and shipping. Buying less, choosing quality over quantity, and supporting sustainable brands helps.',
    category: 'shopping',
    priority: 'medium',
    condition: {
      type: 'category_percentage',
      category: 'shopping',
      threshold: 25, // >25% of weekly total
    },
    estimatedSavingsKg: 0.4,
    savingsPeriod: 'day',
    actionableSteps: [
      'Buy second-hand when possible',
      'Choose durable, quality items',
      'Support brands with sustainability commitments',
      'Repair items instead of replacing them',
    ],
  },
  {
    id: 'electronics-purchase',
    title: 'Extend Electronics Lifespan',
    message:
      'Electronics have a high carbon footprint from manufacturing. Maintaining and repairing devices, or buying refurbished, can significantly reduce impact.',
    category: 'shopping',
    priority: 'high',
    condition: {
      type: 'activity_frequency',
      category: 'shopping',
      activityType: 'electronics',
      threshold: 1, // Any electronics purchase
    },
    estimatedSavingsKg: 1.0,
    savingsPeriod: 'week',
    actionableSteps: [
      'Consider refurbished electronics',
      'Repair devices instead of replacing',
      'Recycle old electronics properly',
      'Buy only what you truly need',
    ],
  },

  // Engagement Tips (no activity)
  {
    id: 'no-recent-logs',
    title: 'Keep Tracking Your Progress',
    message:
      "We haven't seen any activity logs recently. Regular tracking helps you understand your patterns and identify opportunities for improvement.",
    category: 'general',
    priority: 'low',
    condition: {
      type: 'no_activity',
      days: 2, // No logs in 2+ days
    },
    estimatedSavingsKg: 0.3,
    savingsPeriod: 'day',
    actionableSteps: [
      'Log your daily activities to track progress',
      'Set a reminder to log activities each evening',
      'Review your weekly summary for insights',
      'Celebrate small wins in reducing emissions',
    ],
  },

  // Default/General Tips (always show if no other matches)
  {
    id: 'general-reduce-waste',
    title: 'Reduce, Reuse, Recycle',
    message:
      'Small daily choices add up. Bringing reusable bags, bottles, and containers reduces waste and the carbon footprint of single-use items.',
    category: 'general',
    priority: 'low',
    condition: {
      type: 'always',
    },
    estimatedSavingsKg: 0.2,
    savingsPeriod: 'day',
    actionableSteps: [
      'Carry a reusable water bottle',
      'Use reusable shopping bags',
      'Bring your own coffee cup',
      'Choose products with minimal packaging',
    ],
  },
  {
    id: 'general-energy-awareness',
    title: 'Be Energy Conscious',
    message:
      'Simple habits like turning off lights, unplugging chargers, and using natural light can reduce your energy footprint without sacrificing comfort.',
    category: 'general',
    priority: 'low',
    condition: {
      type: 'always',
    },
    estimatedSavingsKg: 0.3,
    savingsPeriod: 'day',
    actionableSteps: [
      'Turn off lights when leaving a room',
      'Unplug chargers when not in use',
      'Use natural light during the day',
      'Enable power-saving modes on devices',
    ],
  },
  {
    id: 'general-local-food',
    title: 'Choose Local and Seasonal',
    message:
      'Buying local, seasonal produce reduces transportation emissions and supports your community. Visit farmers markets or join a CSA program.',
    category: 'general',
    priority: 'low',
    condition: {
      type: 'always',
    },
    estimatedSavingsKg: 0.4,
    savingsPeriod: 'day',
    actionableSteps: [
      'Shop at local farmers markets',
      'Choose seasonal fruits and vegetables',
      'Join a Community Supported Agriculture (CSA) program',
      'Grow herbs or vegetables at home',
    ],
  },
  {
    id: 'general-water-conservation',
    title: 'Conserve Water',
    message:
      'Water treatment and heating require energy. Shorter showers, fixing leaks, and efficient appliances reduce both water use and carbon emissions.',
    category: 'general',
    priority: 'low',
    condition: {
      type: 'always',
    },
    estimatedSavingsKg: 0.2,
    savingsPeriod: 'day',
    actionableSteps: [
      'Take shorter showers (5-7 minutes)',
      'Fix leaky faucets promptly',
      'Run dishwasher and washing machine with full loads',
      'Install low-flow showerheads',
    ],
  },
  {
    id: 'general-digital-footprint',
    title: 'Reduce Digital Carbon Footprint',
    message:
      'Data centers consume significant energy. Unsubscribing from emails, streaming at lower quality, and deleting unused files all help reduce digital emissions.',
    category: 'general',
    priority: 'low',
    condition: {
      type: 'always',
    },
    estimatedSavingsKg: 0.1,
    savingsPeriod: 'day',
    actionableSteps: [
      'Unsubscribe from unnecessary emails',
      'Delete old files and emails',
      'Stream video at lower quality when possible',
      'Turn off video in virtual meetings when not needed',
    ],
  },
];

// Made with Bob