import type {Diet} from './safety'

export interface AllergenOption {
  code: string
  name: string
  icon?: string | null
}

// Fallback when the dataset can't be reached. The live list comes from the `allergen` documents.
export const FALLBACK_ALLERGENS: AllergenOption[] = [
  {code: 'gluten', name: 'Cereals containing gluten', icon: '🌾'},
  {code: 'crustaceans', name: 'Crustaceans', icon: '🦐'},
  {code: 'eggs', name: 'Eggs', icon: '🥚'},
  {code: 'fish', name: 'Fish', icon: '🐟'},
  {code: 'peanuts', name: 'Peanuts', icon: '🥜'},
  {code: 'soybeans', name: 'Soybeans', icon: '🫘'},
  {code: 'milk', name: 'Milk', icon: '🥛'},
  {code: 'tree-nuts', name: 'Tree nuts', icon: '🌰'},
  {code: 'celery', name: 'Celery', icon: '🥬'},
  {code: 'mustard', name: 'Mustard', icon: '🟡'},
  {code: 'sesame', name: 'Sesame', icon: '⚪'},
  {code: 'sulphites', name: 'Sulphur dioxide & sulphites', icon: '🍷'},
  {code: 'lupin', name: 'Lupin', icon: '🌼'},
  {code: 'molluscs', name: 'Molluscs', icon: '🦪'},
]

// Compact labels for chips; the dataset keeps the full regulatory names.
const SHORT: Record<string, string> = {
  gluten: 'Gluten',
  soybeans: 'Soy',
  sulphites: 'Sulphites',
}

export const shortName = (a: AllergenOption) => SHORT[a.code] ?? a.name

export const DIETS:{value: Diet; label: string}[] = [
  {value: 'vegetarian', label: 'Vegetarian'},
  {value: 'vegan', label: 'Vegan'},
  {value: 'pescatarian', label: 'Pescatarian'},
]
