import type {SanityDoc} from './helpers'

const equipment = (id: string, name: string, shared: boolean, notes: string): SanityDoc => ({
  _id: `equipment-${id}`,
  _type: 'equipment',
  name,
  shared,
  notes,
})

export const equipmentList: SanityDoc[] = [
  equipment('fryer-1', 'Fryer 1 (shared)', true, 'Main fryer. Battered cod, calamari, falafel, halloumi fries, chicken goujons and plain fries all share this oil.'),
  equipment('fryer-2', 'Fryer 2 (dedicated gluten-free)', false, 'Dedicated fryer: only gluten-free fries go in. Separate baskets, filtered daily, never used for anything else.'),
  equipment('charcoal-grill', 'Charcoal grill', true, 'Meat, halloumi and vegetables share the grill bars. Bars are brushed between services, not between orders.'),
  equipment('plancha', 'Seafood plancha', true, 'Flat-top reserved for seafood (prawns, sea bass).'),
  equipment('bread-oven', 'Bread oven', true, 'Bakes and warms wheat breads: pita, brioche buns, sourdough croutons.'),
  equipment('gf-toaster', 'Gluten-free toaster', false, 'Dedicated contact toaster for gluten-free buns and flatbreads only.'),
  equipment('pastry-bench', 'Pastry bench', true, 'All baked desserts are made here. The bench handles wheat flour, nuts, butter and eggs every day.'),
  equipment('cold-prep', 'Cold prep station', false, 'Colour-coded boards and utensils per allergen group; sauces are made in separate, labelled batches. Not treated as a shared surface.'),
]
