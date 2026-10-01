import type {SanityDoc} from './helpers'

export type AllergenCode =
  | 'gluten'
  | 'crustaceans'
  | 'eggs'
  | 'fish'
  | 'peanuts'
  | 'soybeans'
  | 'milk'
  | 'tree-nuts'
  | 'celery'
  | 'mustard'
  | 'sesame'
  | 'sulphites'
  | 'lupin'
  | 'molluscs'

const allergen = (
  annexNumber: number,
  code: AllergenCode,
  name: string,
  icon: string,
  alsoKnownAs: string[],
  description: string,
): SanityDoc => ({
  _id: `allergen-${code}`,
  _type: 'allergen',
  name,
  code,
  annexNumber,
  icon,
  alsoKnownAs,
  description,
})

export const allergens: SanityDoc[] = [
  allergen(1, 'gluten', 'Cereals containing gluten', '🌾', ['wheat', 'spelt', 'khorasan', 'kamut', 'rye', 'barley', 'oats', 'semolina', 'durum', 'bulgur', 'couscous', 'malt', 'filo', 'panko'], 'Wheat (including spelt and khorasan), rye, barley, oats and their hybrids, and products made from them. Barley malt and malt vinegar are common hidden sources.'),
  allergen(2, 'crustaceans', 'Crustaceans', '🦐', ['prawns', 'shrimp', 'crab', 'lobster', 'langoustine', 'crayfish'], 'Prawns, crab, lobster, crayfish and products made from them, including shellfish stocks and pastes.'),
  allergen(3, 'eggs', 'Eggs', '🥚', ['egg yolk', 'albumen', 'mayonnaise', 'aioli', 'brioche', 'meringue'], 'Eggs from any bird and products made from them. Found in mayonnaise, aioli, brioche, fresh pasta, batters and many desserts.'),
  allergen(4, 'fish', 'Fish', '🐟', ['anchovy', 'cod', 'sea bass', 'Worcestershire sauce', 'fish sauce', 'Caesar dressing'], 'All fish and products made from them. Anchovy is a hidden source in Caesar dressing, salsa verde and Worcestershire sauce.'),
  allergen(5, 'peanuts', 'Peanuts', '🥜', ['groundnuts', 'arachis oil', 'monkey nuts'], 'Peanuts (a legume, not a tree nut) and products made from them, including groundnut oil.'),
  allergen(6, 'soybeans', 'Soybeans', '🫘', ['soya', 'soy', 'tofu', 'edamame', 'soy lecithin', 'soy sauce', 'tamari'], 'Soya and products made from it. Soy lecithin in chocolate is a common hidden source.'),
  allergen(7, 'milk', 'Milk', '🥛', ['dairy', 'butter', 'cream', 'cheese', 'yogurt', 'whey', 'casein', 'lactose', 'ghee', 'halloumi', 'feta'], 'Milk from any animal and products made from it, including lactose. Lactose intolerance and milk allergy are different conditions.'),
  allergen(8, 'tree-nuts', 'Tree nuts', '🌰', ['almonds', 'hazelnuts', 'walnuts', 'cashews', 'pecans', 'Brazil nuts', 'pistachios', 'macadamia', 'pine nuts', 'romesco', 'pesto', 'praline', 'frangipane', 'marzipan'], 'Almonds, hazelnuts, walnuts, cashews, pecans, Brazil nuts, pistachios and macadamia (Annex II list). Our kitchen also treats pine nuts as a tree nut. Romesco and pesto are common hidden sources.'),
  allergen(9, 'celery', 'Celery', '🥬', ['celeriac', 'celery salt', 'celery seed', 'stock', 'bouillon'], 'Celery stalks, leaves, seeds and celeriac. Stocks and bouillon are the most common hidden source.'),
  allergen(10, 'mustard', 'Mustard', '🟡', ['Dijon', 'mustard seed', 'mustard powder', 'mayonnaise', 'vinaigrette'], 'Mustard seeds, powder, leaves and prepared mustard. Often in mayonnaise, vinaigrettes and marinades.'),
  allergen(11, 'sesame', 'Sesame', '⚪', ['tahini', "za'atar", 'sesame oil', 'hummus', 'halva', 'benne'], 'Sesame seeds and products made from them. Tahini (and therefore hummus) and za\'atar are major sources; many burger buns are topped with sesame.'),
  allergen(12, 'sulphites', 'Sulphur dioxide and sulphites', '🍷', ['E220', 'E221', 'E222', 'E223', 'E224', 'E226', 'E227', 'E228', 'wine', 'wine vinegar', 'dried fruit'], 'At concentrations above 10 mg/kg or 10 mg/litre. Found in wine, wine vinegars, dried apricots and some cured meats.'),
  allergen(13, 'lupin', 'Lupin', '🌼', ['lupin flour', 'lupine', 'lupin seeds'], 'Lupin seeds and flour. Increasingly used in gluten-free breads and pasta, so it often appears exactly where guests avoiding gluten are looking.'),
  allergen(14, 'molluscs', 'Molluscs', '🦑', ['squid', 'calamari', 'mussels', 'clams', 'oysters', 'octopus', 'scallops', 'oyster sauce'], 'Squid, octopus, mussels, clams, oysters, scallops, snails and products made from them.'),
]
