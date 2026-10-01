import type {AllergenCode} from './allergens'
import {refs, slug, type SanityDoc} from './helpers'

type AnimalOrigin = 'none' | 'dairy' | 'egg' | 'honey' | 'meat' | 'fish' | 'shellfish'

const ing = (
  id: string,
  name: string,
  allergens: AllergenCode[] = [],
  animalOrigin: AnimalOrigin = 'none',
  extra: {mayContain?: AllergenCode[]; supplier?: string; notes?: string} = {},
): SanityDoc => ({
  _id: `ingredient-${id}`,
  _type: 'ingredient',
  name,
  slug: slug(id),
  allergens: refs('allergen', allergens),
  ...(extra.mayContain?.length ? {mayContain: refs('allergen', extra.mayContain)} : {}),
  animalOrigin,
  ...(extra.supplier ? {supplier: extra.supplier} : {}),
  ...(extra.notes ? {notes: extra.notes} : {}),
})

// Fictional suppliers, referenced by name in the supplier spec summaries (guidance articles).
const MILL = 'Harvest Mill Co.'
const LEVANT = 'Levant Pantry Imports'
const COAST = 'Cold Coast Seafood'
const DAIRY = 'Hillside Dairy'
const BAKERY = 'Rise Bakery'
const COCOA = 'Noir Cocoa Works'
const FREEFROM = 'Clearway Free-From Foods'
const BUTCHER = 'Oakfield Butchers'

export const ingredients: SanityDoc[] = [
  // Cereals, breads, starches
  ing('wheat-flour', 'Wheat flour', ['gluten'], 'none', {supplier: MILL}),
  ing('semolina', 'Durum wheat semolina', ['gluten'], 'none', {supplier: MILL}),
  ing('bulgur-wheat', 'Bulgur wheat', ['gluten'], 'none', {supplier: LEVANT}),
  ing('filo-pastry', 'Filo pastry', ['gluten'], 'none', {supplier: BAKERY}),
  ing('panko-breadcrumbs', 'Panko breadcrumbs', ['gluten'], 'none', {supplier: MILL}),
  ing('sourdough-bread', 'Sourdough bread', ['gluten'], 'none', {supplier: BAKERY}),
  ing('penne', 'Durum wheat penne', ['gluten'], 'none', {supplier: MILL}),
  ing('gluten-free-pasta', 'Gluten-free penne (rice & corn)', [], 'none', {supplier: FREEFROM}),
  ing('gluten-free-flour-blend', 'Gluten-free flour blend (rice, tapioca, potato)', [], 'none', {supplier: FREEFROM}),
  ing('lupin-flour', 'Lupin flour', ['lupin'], 'none', {supplier: FREEFROM, notes: 'Used in the gluten-free flatbread for structure and protein.'}),
  ing('rolled-oats', 'Rolled oats', [], 'none', {supplier: MILL, mayContain: ['gluten'], notes: 'Standard oats, not certified gluten-free. Milled on a line shared with wheat.'}),
  ing('cornflour', 'Cornflour', [], 'none', {supplier: MILL}),
  ing('rice', 'Basmati rice', [], 'none', {supplier: LEVANT}),
  ing('potato', 'Maris Piper potatoes'),
  ing('yeast', 'Dried yeast'),
  ing('baking-powder', 'Baking powder (gluten-free)'),

  // Legumes, nuts, seeds
  ing('chickpeas', 'Chickpeas', [], 'none', {supplier: LEVANT}),
  ing('tahini', 'Tahini (sesame paste)', ['sesame'], 'none', {supplier: LEVANT, mayContain: ['peanuts'], notes: 'Supplier roasts peanuts on the same site.'}),
  ing('sesame-seeds', 'Sesame seeds', ['sesame'], 'none', {supplier: LEVANT}),
  ing('almonds', 'Almonds', ['tree-nuts'], 'none', {supplier: LEVANT}),
  ing('ground-almonds', 'Ground almonds', ['tree-nuts'], 'none', {supplier: LEVANT}),
  ing('hazelnuts', 'Hazelnuts', ['tree-nuts'], 'none', {supplier: LEVANT}),
  ing('pistachios', 'Pistachios', ['tree-nuts'], 'none', {supplier: LEVANT}),
  ing('walnuts', 'Walnuts', ['tree-nuts'], 'none', {supplier: LEVANT}),
  ing('pine-nuts', 'Pine nuts', ['tree-nuts'], 'none', {supplier: LEVANT, notes: 'Not on the EU Annex II tree-nut list, but the kitchen declares pine nuts as tree nuts (see allergen policy).'}),
  ing('za-atar', "Za'atar (thyme, sumac, sesame)", ['sesame'], 'none', {supplier: LEVANT}),

  // Vegetables, fruit, herbs
  ing('garlic', 'Garlic'),
  ing('lemon', 'Lemon'),
  ing('orange', 'Orange'),
  ing('tomato', 'Tomato'),
  ing('red-pepper', 'Red pepper'),
  ing('aubergine', 'Aubergine'),
  ing('courgette', 'Courgette'),
  ing('cauliflower', 'Cauliflower'),
  ing('red-onion', 'Red onion'),
  ing('cucumber', 'Cucumber'),
  ing('cos-lettuce', 'Cos lettuce'),
  ing('rocket', 'Rocket'),
  ing('parsley', 'Flat-leaf parsley'),
  ing('mint', 'Mint'),
  ing('basil', 'Basil'),
  ing('coriander', 'Coriander'),
  ing('pomegranate', 'Pomegranate'),
  ing('olives', 'Kalamata olives'),
  ing('capers', 'Capers'),
  ing('pickled-gherkins', 'Pickled gherkins'),

  // Spices, seasonings, condiments
  ing('sumac', 'Sumac'),
  ing('smoked-paprika', 'Smoked paprika'),
  ing('cumin', 'Cumin'),
  ing('cinnamon', 'Cinnamon'),
  ing('aleppo-pepper', 'Aleppo pepper'),
  ing('harissa-paste', 'Rose harissa paste', [], 'none', {supplier: LEVANT}),
  ing('salt', 'Sea salt'),
  ing('black-pepper', 'Black pepper'),
  ing('vanilla', 'Vanilla'),
  ing('dijon-mustard', 'Dijon mustard', ['mustard']),
  ing('red-wine-vinegar', 'Red wine vinegar', ['sulphites']),
  ing('red-wine', 'Red wine', ['sulphites']),
  ing('worcestershire-sauce', 'Worcestershire sauce', ['fish', 'gluten'], 'fish', {notes: 'Contains anchovies and barley malt vinegar.'}),
  ing('vegetable-stock', 'Vegetable stock', ['celery'], 'none', {notes: 'Stock base contains celery.'}),
  ing('chicken-stock', 'Chicken stock', ['celery'], 'meat', {supplier: BUTCHER, notes: 'Made in-house from roasted bones, onion, carrot and celery.'}),

  // Oils, sugars
  ing('olive-oil', 'Extra virgin olive oil'),
  ing('sunflower-oil', 'Sunflower oil (fryer oil)'),
  ing('sugar', 'Caster sugar'),
  ing('agave-syrup', 'Agave syrup'),
  ing('honey', 'Wildflower honey', [], 'honey'),
  ing('dark-chocolate', 'Dark chocolate 70%', ['soybeans'], 'none', {supplier: COCOA, mayContain: ['milk', 'tree-nuts'], notes: 'Contains soy lecithin. Made on a line that also runs milk chocolate and praline.'}),
  ing('coconut-cream', 'Coconut cream'),

  // Dairy & dairy alternatives
  ing('milk', 'Whole milk', ['milk'], 'dairy', {supplier: DAIRY}),
  ing('butter', 'Butter', ['milk'], 'dairy', {supplier: DAIRY}),
  ing('double-cream', 'Double cream', ['milk'], 'dairy', {supplier: DAIRY}),
  ing('greek-yogurt', 'Greek yogurt', ['milk'], 'dairy', {supplier: DAIRY}),
  ing('feta', 'Feta', ['milk'], 'dairy', {supplier: DAIRY}),
  ing('halloumi', 'Halloumi', ['milk'], 'dairy', {supplier: DAIRY}),
  ing('vegetarian-hard-cheese', 'Vegetarian hard cheese (grana style)', ['milk'], 'dairy', {supplier: DAIRY, notes: 'Made with microbial rennet, so suitable for vegetarians (unlike Parmigiano Reggiano).'}),
  ing('vegan-feta', 'Vegan feta-style cheese (coconut oil base)', [], 'none', {supplier: FREEFROM}),

  // Eggs
  ing('eggs', 'Free-range eggs', ['eggs'], 'egg'),
  ing('egg-yolk', 'Free-range egg yolk', ['eggs'], 'egg'),

  // Meat
  ing('lamb-mince', 'Lamb mince', [], 'meat', {supplier: BUTCHER}),
  ing('lamb-shoulder', 'Lamb shoulder', [], 'meat', {supplier: BUTCHER}),
  ing('beef-mince', 'Beef chuck mince', [], 'meat', {supplier: BUTCHER}),
  ing('chicken-thigh', 'Chicken thigh', [], 'meat', {supplier: BUTCHER}),

  // Fish & shellfish
  ing('cod-fillet', 'Cod fillet', ['fish'], 'fish', {supplier: COAST}),
  ing('sea-bass', 'Sea bass fillet', ['fish'], 'fish', {supplier: COAST}),
  ing('anchovies', 'Salted anchovies', ['fish'], 'fish', {supplier: COAST}),
  ing('king-prawns', 'King prawns', ['crustaceans'], 'shellfish', {supplier: COAST}),
  ing('calamari', 'Calamari (squid)', ['molluscs'], 'shellfish', {supplier: COAST}),
]
