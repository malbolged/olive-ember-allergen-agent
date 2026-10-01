import {refs, slug, type SanityDoc} from './helpers'

const comp = (
  id: string,
  name: string,
  ingredients: string[],
  opts: {sub?: string[]; on?: string[]; notes?: string} = {},
): SanityDoc => ({
  _id: `component-${id}`,
  _type: 'component',
  name,
  slug: slug(id),
  ingredients: refs('ingredient', ingredients),
  ...(opts.sub?.length ? {subComponents: refs('component', opts.sub)} : {}),
  ...(opts.on?.length ? {preparedOn: refs('equipment', opts.on)} : {}),
  ...(opts.notes ? {notes: opts.notes} : {}),
})

export const components: SanityDoc[] = [
  // Fryer 1 (shared oil)
  comp('plain-fries', 'Fries', ['potato', 'sunflower-oil', 'salt'], {on: ['fryer-1'], notes: 'Potato, oil and salt only, but cooked in the shared fryer.'}),
  comp('crispy-battered-cod', 'Crispy battered cod', ['cod-fillet', 'wheat-flour', 'baking-powder', 'sunflower-oil', 'salt'], {on: ['fryer-1']}),
  comp('crispy-calamari', 'Crispy calamari', ['calamari', 'semolina', 'wheat-flour', 'smoked-paprika', 'sunflower-oil'], {on: ['fryer-1']}),
  comp('falafel', 'Falafel', ['chickpeas', 'parsley', 'coriander', 'garlic', 'cumin', 'wheat-flour', 'sunflower-oil'], {on: ['fryer-1'], notes: 'A little wheat flour binds the mix. Not gluten-free.'}),
  comp('halloumi-fries', 'Halloumi fries', ['halloumi', 'cornflour', 'sunflower-oil'], {on: ['fryer-1']}),
  comp('chicken-goujons', 'Chicken goujons', ['chicken-thigh', 'panko-breadcrumbs', 'eggs', 'sunflower-oil'], {on: ['fryer-1']}),

  // Fryer 2 (dedicated)
  comp('gluten-free-fries', 'Gluten-free fries', ['potato', 'sunflower-oil', 'salt'], {on: ['fryer-2'], notes: 'Same recipe as the fries, cooked only in the dedicated gluten-free fryer.'}),

  // Charcoal grill
  comp('lamb-kofta-skewers', 'Lamb kofta skewers', ['lamb-mince', 'red-onion', 'parsley', 'cumin', 'aleppo-pepper', 'salt'], {on: ['charcoal-grill']}),
  comp('chicken-shish', 'Chicken shish', ['chicken-thigh', 'greek-yogurt', 'garlic', 'lemon', 'smoked-paprika'], {on: ['charcoal-grill'], notes: 'Marinated overnight in yogurt.'}),
  comp('grilled-halloumi', 'Grilled halloumi', ['halloumi', 'olive-oil'], {on: ['charcoal-grill']}),
  comp('beef-patty', 'Beef patty', ['beef-mince', 'red-onion', 'salt', 'black-pepper'], {on: ['charcoal-grill']}),
  comp('grilled-vegetables', 'Flame-grilled vegetables', ['aubergine', 'courgette', 'red-pepper', 'olive-oil', 'salt'], {on: ['charcoal-grill']}),
  comp('charred-cauliflower', 'Charred cauliflower', ['cauliflower', 'olive-oil', 'cumin', 'salt'], {on: ['charcoal-grill']}),
  comp('sticky-pomegranate-glaze', 'Sticky pomegranate glaze', ['pomegranate', 'red-wine', 'worcestershire-sauce', 'sugar', 'garlic'], {notes: 'Reduced in a pot, brushed on the lamb shoulder. Worcestershire adds anchovy and malt vinegar.'}),
  comp('slow-roast-lamb', 'Slow-roast lamb shoulder', ['lamb-shoulder', 'garlic', 'cumin', 'salt'], {sub: ['sticky-pomegranate-glaze'], notes: 'Roasted for 7 hours and glazed in the oven, so the glaze never touches the shared grill.'}),

  // Seafood plancha
  comp('garlic-prawns', 'Garlic prawns', ['king-prawns', 'garlic', 'olive-oil', 'butter', 'aleppo-pepper', 'parsley'], {on: ['plancha']}),
  comp('plancha-sea-bass', 'Plancha sea bass', ['sea-bass', 'olive-oil', 'lemon', 'salt'], {on: ['plancha']}),

  // Breads
  comp('pita', 'Pita', ['wheat-flour', 'yeast', 'olive-oil', 'salt'], {on: ['bread-oven']}),
  comp('brioche-bun', 'Brioche bun', ['wheat-flour', 'butter', 'eggs', 'milk', 'sugar', 'yeast', 'sesame-seeds'], {on: ['bread-oven'], notes: 'Sesame-topped.'}),
  comp('sourdough-croutons', 'Sourdough croutons', ['sourdough-bread', 'olive-oil', 'garlic'], {on: ['bread-oven']}),
  comp('gluten-free-bun', 'Gluten-free bun', ['gluten-free-flour-blend', 'eggs', 'yeast', 'sunflower-oil', 'salt'], {on: ['gf-toaster'], notes: 'Contains egg.'}),
  comp('gluten-free-flatbread', 'Gluten-free flatbread', ['gluten-free-flour-blend', 'lupin-flour', 'olive-oil', 'salt'], {on: ['gf-toaster'], notes: 'Contains lupin.'}),

  // Cold sauces, dressings, salads (cold prep is not a shared surface)
  comp('mayonnaise', 'House mayonnaise', ['egg-yolk', 'sunflower-oil', 'dijon-mustard', 'lemon', 'salt'], {on: ['cold-prep']}),
  comp('burger-sauce', 'Ember burger sauce', ['smoked-paprika', 'pickled-gherkins', 'tomato'], {sub: ['mayonnaise'], on: ['cold-prep']}),
  comp('romesco', 'House red pepper sauce (romesco)', ['red-pepper', 'almonds', 'hazelnuts', 'sourdough-bread', 'garlic', 'red-wine-vinegar', 'smoked-paprika', 'olive-oil'], {on: ['cold-prep'], notes: 'Thickened with toasted almonds, hazelnuts and bread.'}),
  comp('tahini-sauce', 'Tahini sauce', ['tahini', 'lemon', 'garlic', 'salt'], {on: ['cold-prep']}),
  comp('caesar-dressing', 'Caesar dressing', ['anchovies', 'garlic', 'lemon', 'vegetarian-hard-cheese', 'olive-oil'], {sub: ['mayonnaise'], on: ['cold-prep']}),
  comp('basil-pesto', 'Basil pesto', ['basil', 'pine-nuts', 'vegetarian-hard-cheese', 'olive-oil', 'garlic'], {on: ['cold-prep']}),
  comp('hummus', 'Hummus', ['chickpeas', 'tahini', 'lemon', 'garlic', 'olive-oil'], {on: ['cold-prep']}),
  comp('tzatziki', 'Tzatziki', ['greek-yogurt', 'cucumber', 'garlic', 'mint', 'olive-oil'], {on: ['cold-prep']}),
  comp('herb-tabbouleh', 'Herb tabbouleh', ['bulgur-wheat', 'parsley', 'mint', 'tomato', 'lemon', 'olive-oil'], {on: ['cold-prep']}),
  comp('harissa-dressing', 'Harissa dressing', ['harissa-paste', 'honey', 'lemon', 'olive-oil'], {on: ['cold-prep'], notes: 'Sweetened with honey.'}),
  comp('lemon-herb-dressing', 'Lemon & caper dressing', ['olive-oil', 'lemon', 'dijon-mustard', 'capers', 'parsley'], {on: ['cold-prep']}),
  comp('garden-salad', 'Garden salad', ['cos-lettuce', 'tomato', 'cucumber', 'red-onion', 'rocket', 'sumac'], {on: ['cold-prep']}),
  comp('caesar-leaves', 'Cos hearts', ['cos-lettuce'], {on: ['cold-prep']}),
  comp('za-atar-sprinkle', "Za'atar sprinkle", ['za-atar', 'olive-oil'], {on: ['cold-prep'], notes: 'Added after grilling, never on the grill.'}),
  comp('feta-crumble', 'Feta crumble', ['feta'], {on: ['cold-prep']}),
  comp('vegan-feta-crumble', 'Vegan feta crumble', ['vegan-feta'], {on: ['cold-prep']}),
  comp('marinated-olives', 'Marinated olives', ['olives', 'olive-oil', 'garlic', 'orange'], {on: ['cold-prep']}),
  comp('grated-hard-cheese', 'Grated hard cheese', ['vegetarian-hard-cheese'], {on: ['cold-prep']}),

  // Hot kitchen, pots (no shared-surface equipment)
  comp('rice-pilaf', 'Rice pilaf', ['rice', 'butter', 'chicken-stock', 'cinnamon', 'salt'], {notes: 'Cooked in chicken stock.'}),
  comp('tomato-sauce', 'Tomato sauce', ['tomato', 'garlic', 'olive-oil', 'basil', 'vegetable-stock']),
  comp('penne-pasta', 'Penne', ['penne', 'salt']),
  comp('gluten-free-penne', 'Gluten-free penne', ['gluten-free-pasta', 'salt'], {notes: 'Cooked in a separate pot of fresh water.'}),

  // Desserts
  comp('baklava', 'Pistachio & walnut baklava', ['filo-pastry', 'pistachios', 'walnuts', 'butter', 'honey', 'cinnamon'], {on: ['pastry-bench']}),
  comp('orange-almond-cake', 'Orange & almond cake', ['ground-almonds', 'eggs', 'sugar', 'orange', 'baking-powder'], {on: ['pastry-bench'], notes: 'Flourless recipe.'}),
  comp('dark-chocolate-mousse', 'Dark chocolate mousse', ['dark-chocolate', 'double-cream', 'eggs', 'sugar'], {on: ['pastry-bench']}),
  comp('pistachio-crumb', 'Pistachio crumb', ['pistachios', 'sugar'], {on: ['pastry-bench']}),
  comp('vegan-chocolate-pot', 'Vegan chocolate pot', ['dark-chocolate', 'coconut-cream', 'agave-syrup', 'salt'], {on: ['cold-prep']}),
  comp('oat-crumble', 'Toasted oat crumble', ['rolled-oats', 'sugar', 'sunflower-oil'], {on: ['cold-prep']}),
  comp('vanilla-ice-cream', 'Vanilla ice cream', ['milk', 'double-cream', 'egg-yolk', 'sugar', 'vanilla']),
]
