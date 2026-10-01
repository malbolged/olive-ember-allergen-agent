import {ref, slug, type SanityDoc} from './helpers'

type Section = 'small-plates' | 'mains' | 'sides' | 'desserts' | 'kids'

/** [componentId, removable?] */
type DishPart = [string, boolean?]
/** [replacesComponentId, withComponentId, surcharge] */
type Swap = [string, string, number]

const dish = (
  id: string,
  name: string,
  section: Section,
  price: number,
  description: string,
  parts: DishPart[],
  opts: {swaps?: Swap[]; spiceLevel?: number; available?: boolean} = {},
): SanityDoc => ({
  _id: `dish-${id}`,
  _type: 'dish',
  name,
  slug: slug(id),
  section,
  price,
  description,
  available: opts.available ?? true,
  spiceLevel: opts.spiceLevel ?? 0,
  components: parts.map(([componentId, removable = false]) => ({
    _key: componentId,
    _type: 'dishComponent',
    component: ref(`component-${componentId}`),
    removable,
  })),
  ...(opts.swaps?.length
    ? {
        substitutions: opts.swaps.map(([from, to, surcharge]) => ({
          _key: `${from}--${to}`,
          _type: 'substitution',
          replaces: ref(`component-${from}`),
          with: ref(`component-${to}`),
          surcharge,
        })),
      }
    : {}),
})

const PITA_TO_GF: Swap = ['pita', 'gluten-free-flatbread', 1]
const FRIES_TO_GF: Swap = ['plain-fries', 'gluten-free-fries', 0]

export const dishes: SanityDoc[] = [
  // Small plates
  dish('hummus-and-pita', 'Hummus & Warm Pita', 'small-plates', 7.5, 'Silky chickpea hummus with lemon and olive oil, warm pita from the bread oven.', [['hummus'], ['pita', true]], {swaps: [PITA_TO_GF]}),
  dish('crispy-calamari', 'Crispy Calamari', 'small-plates', 10, 'Semolina-dusted squid, smoked paprika, lemon mayonnaise.', [['crispy-calamari'], ['mayonnaise', true]]),
  dish('falafel', 'Falafel', 'small-plates', 8.5, 'Herb falafel with tahini sauce.', [['falafel'], ['tahini-sauce', true]]),
  dish('garlic-prawns', 'Garlic Prawns', 'small-plates', 13, 'King prawns on the plancha with garlic, Aleppo pepper and parsley, pita to mop up.', [['garlic-prawns'], ['pita', true]], {swaps: [PITA_TO_GF], spiceLevel: 1, available: false}),
  dish('halloumi-fries', 'Halloumi Fries', 'small-plates', 8, 'Crisp halloumi batons with harissa dressing.', [['halloumi-fries'], ['harissa-dressing', true]], {spiceLevel: 1}),
  dish('marinated-olives', 'Marinated Olives', 'small-plates', 4.5, 'Kalamata olives, garlic, orange zest.', [['marinated-olives']]),
  dish('flame-grilled-vegetables', 'Flame-grilled Vegetables', 'small-plates', 9.5, 'Smoky peppers, aubergine and courgette from the charcoal grill, house red pepper sauce, feta.', [['grilled-vegetables'], ['romesco', true], ['feta-crumble', true]], {swaps: [['feta-crumble', 'vegan-feta-crumble', 1]]}),

  // Mains
  dish('lamb-kofta', 'Lamb Kofta', 'mains', 19, 'Charcoal-grilled lamb kofta, tzatziki, herb tabbouleh, warm pita.', [['lamb-kofta-skewers'], ['tzatziki', true], ['herb-tabbouleh'], ['pita', true]], {swaps: [PITA_TO_GF], spiceLevel: 1}),
  dish('chicken-shish', 'Chicken Shish', 'mains', 18, 'Yogurt-marinated chicken thigh skewers, rice pilaf, garden salad, tahini sauce.', [['chicken-shish'], ['rice-pilaf'], ['garden-salad', true], ['tahini-sauce', true]]),
  dish('ember-burger', 'Ember Burger', 'mains', 17, 'Charcoal-grilled beef patty, burger sauce, sesame brioche bun, fries.', [['beef-patty'], ['brioche-bun'], ['burger-sauce', true], ['plain-fries']], {swaps: [['brioche-bun', 'gluten-free-bun', 1.5], FRIES_TO_GF]}),
  dish('cod-and-chips', 'Crispy Cod & Chips', 'mains', 21, 'Battered cod, fries, house mayonnaise, lemon.', [['crispy-battered-cod'], ['plain-fries'], ['mayonnaise', true]], {swaps: [FRIES_TO_GF]}),
  dish('slow-roast-lamb-shoulder', 'Slow-roast Lamb Shoulder', 'mains', 32, 'Seven-hour lamb shoulder with sticky pomegranate glaze, rice pilaf, tzatziki.', [['slow-roast-lamb'], ['rice-pilaf'], ['tzatziki', true]]),
  dish('plancha-sea-bass', 'Plancha Sea Bass', 'mains', 26, 'Crisp-skinned sea bass, basil pesto, garden salad.', [['plancha-sea-bass'], ['basil-pesto', true], ['garden-salad', true]]),
  dish('charred-cauliflower', 'Charred Cauliflower', 'mains', 16, 'Whole-roasted cauliflower from the grill, harissa dressing and hummus.', [['charred-cauliflower'], ['harissa-dressing', true], ['hummus']], {spiceLevel: 2}),
  dish('grilled-halloumi-salad', 'Grilled Halloumi Salad', 'mains', 15, "Charcoal-grilled halloumi, garden salad, lemon & caper dressing, za'atar.", [['grilled-halloumi'], ['garden-salad'], ['lemon-herb-dressing', true], ['za-atar-sprinkle', true]]),
  dish('ember-caesar', 'Ember Caesar', 'mains', 14, 'Cos hearts, anchovy Caesar dressing, grated hard cheese, sourdough croutons.', [['caesar-leaves'], ['caesar-dressing'], ['sourdough-croutons', true]]),

  // Sides
  dish('fries', 'Fries', 'sides', 4.5, 'Skin-on fries, sea salt.', [['plain-fries']], {swaps: [FRIES_TO_GF]}),
  dish('rice-pilaf', 'Rice Pilaf', 'sides', 5, 'Fluffy basmati pilaf with butter and a little cinnamon.', [['rice-pilaf']]),
  dish('herb-tabbouleh', 'Herb Tabbouleh', 'sides', 5.5, 'Parsley, mint, tomato, bulgur and lemon.', [['herb-tabbouleh']]),

  // Desserts
  dish('baklava', 'Baklava', 'desserts', 8, 'Pistachio and walnut baklava soaked in honey syrup, vanilla ice cream.', [['baklava'], ['vanilla-ice-cream', true]]),
  dish('orange-almond-cake', 'Orange & Almond Cake', 'desserts', 8.5, 'Flourless whole-orange and almond cake, vanilla ice cream.', [['orange-almond-cake'], ['vanilla-ice-cream', true]]),
  dish('dark-chocolate-mousse', 'Dark Chocolate Mousse', 'desserts', 8, '70% dark chocolate mousse, pistachio crumb.', [['dark-chocolate-mousse'], ['pistachio-crumb', true]]),
  dish('vegan-chocolate-pot', 'Vegan Chocolate Pot', 'desserts', 7.5, 'Dark chocolate and coconut cream pot, sea salt, toasted oat crumble.', [['vegan-chocolate-pot'], ['oat-crumble', true]]),

  // Kids
  dish('kids-chicken-goujons', 'Kids Chicken Goujons', 'kids', 9, 'Breaded chicken goujons with fries.', [['chicken-goujons'], ['plain-fries']], {swaps: [FRIES_TO_GF]}),
  dish('kids-tomato-pasta', 'Kids Tomato Pasta', 'kids', 7.5, 'Penne in tomato sauce with grated cheese.', [['penne-pasta'], ['tomato-sauce'], ['grated-hard-cheese', true]], {swaps: [['penne-pasta', 'gluten-free-penne', 1]]}),
]
