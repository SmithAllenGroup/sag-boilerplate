// Mapping function to convert database values to display names
export const conceptDisplayNames: Record<string, string> = {
  'bakery': 'Bakery',
  'bar': 'Bar',
  'buffet': 'Buffet',
  'cafeteria': 'Cafeteria',
  'casual_dining': 'Casual Dining',
  'coffee_shop': 'Coffee Shop',
  'dessert_shop': 'Dessert Shop',
  'fast_casual': 'Fast Casual',
  'fine_dining': 'Fine Dining',
  'food_truck': 'Food Truck',
  'ghost_kitchen': 'Ghost Kitchen',
  'quick_service': 'Quick Service',
  'other': 'Other'
};

// Cuisine type display names
export const cuisineDisplayNames: Record<string, string> = {
  'american': 'American',
  'asian': 'Asian',
  'bbq': 'BBQ',
  'breakfast': 'Breakfast',
  'chinese': 'Chinese',
  'dessert': 'Dessert',
  'european': 'European',
  'french': 'French',
  'greek': 'Greek',
  'ice_cream': 'Ice Cream',
  'indian': 'Indian',
  'italian': 'Italian',
  'japanese': 'Japanese',
  'korean': 'Korean',
  'mediterranean': 'Mediterranean',
  'mexican': 'Mexican',
  'middle_eastern': 'Middle Eastern',
  'pizza': 'Pizza',
  'seafood': 'Seafood',
  'steakhouse': 'Steakhouse',
  'sushi': 'Sushi',
  'thai': 'Thai',
  'vietnamese': 'Vietnamese',
};

export const formatConcepts = (concepts: string | string[] | undefined): string => {
  if (!concepts) return '';
  if (Array.isArray(concepts)) {
    return concepts.map(concept => conceptDisplayNames[concept] || concept).join(', ');
  }
  return conceptDisplayNames[concepts] || concepts;
};

export const formatCuisine = (cuisine: string | string[] | undefined): string => {
  if (!cuisine) return '';
  if (Array.isArray(cuisine)) {
    return cuisine.map(c => cuisineDisplayNames[c] || c).join(', ');
  }
  return cuisineDisplayNames[cuisine] || cuisine;
};

// Status configuration for visual indicators
export interface StatusConfig {
  label: string;
  classes: string;
}

export const getStatusConfig = (status: string | undefined): StatusConfig => {
  const configs: Record<string, StatusConfig> = {
    'active': {
      label: 'Available',
      classes: 'inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border border-green-200'
    },
    'coming_soon': {
      label: 'Coming Soon',
      classes: 'inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 border border-purple-200'
    },
    'off_market': {
      label: 'Off Market',
      classes: 'inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200'
    },
    'sold': {
      label: 'Sold',
      classes: 'inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200'
    },
    'pending': {
      label: 'Pending',
      classes: 'inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 border border-yellow-200'
    }
  };
  return configs[status || 'active'] || configs['active'];
};
