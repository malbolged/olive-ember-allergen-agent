import {describe, expect, it} from 'vitest'

import {type DishGraph, evaluateDish, type GraphComponent, type GraphEquipment} from './safety'

const ing = (name: string, allergens: string[] = [], extra: Partial<{mayContain: string[]; animalOrigin: 'none' | 'dairy' | 'egg' | 'meat' | 'fish'}> = {}) => ({
  _id: `ing-${name}`,
  name,
  allergens,
  mayContain: extra.mayContain ?? [],
  animalOrigin: extra.animalOrigin ?? 'none',
})

const fryer: GraphEquipment = {
  _id: 'eq-fryer',
  name: 'Fryer 1',
  shared: true,
  sharedWith: [
    {_id: 'c-fries', name: 'House fries', allergens: [], subAllergens: []},
    {_id: 'c-cod', name: 'Battered cod', allergens: ['fish'], subAllergens: [['gluten', 'eggs']]},
  ],
}

const fries: GraphComponent = {_id: 'c-fries', name: 'House fries', ingredients: [ing('Potato'), ing('Sunflower oil')], preparedOn: [fryer]}
const salad: GraphComponent = {_id: 'c-salad', name: 'Side salad', ingredients: [ing('Leaves'), ing('Olive oil')]}
const brioche: GraphComponent = {
  _id: 'c-brioche',
  name: 'Brioche bun',
  ingredients: [ing('Wheat flour', ['gluten']), ing('Butter', ['milk'], {animalOrigin: 'dairy'}), ing('Egg', ['eggs'], {animalOrigin: 'egg'})],
}
const gfBun: GraphComponent = {_id: 'c-gfbun', name: 'Gluten-free bun', ingredients: [ing('Rice flour', [], {mayContain: ['sesame']})]}
const patty: GraphComponent = {_id: 'c-patty', name: 'Beef patty', ingredients: [ing('Beef', [], {animalOrigin: 'meat'})]}
const aioli: GraphComponent = {
  _id: 'c-aioli',
  name: 'Garlic aioli',
  ingredients: [ing('Garlic')],
  subComponents: [{_id: 'c-mayo', name: 'Mayonnaise', ingredients: [ing('Egg yolk', ['eggs'], {animalOrigin: 'egg'}), ing('Mustard', ['mustard'])]}],
}

const burger: DishGraph = {
  _id: 'd-burger',
  name: 'Ember burger',
  slug: 'ember-burger',
  components: [
    {_key: 'a', removable: false, component: patty},
    {_key: 'b', removable: false, component: brioche},
    {_key: 'c', removable: true, component: aioli},
    {_key: 'd', removable: false, component: fries},
  ],
  substitutions: [
    {_key: 's1', surcharge: 1.5, replaces: {_id: 'c-brioche', name: 'Brioche bun'}, with: gfBun},
    {_key: 's2', surcharge: 0, replaces: {_id: 'c-fries', name: 'House fries'}, with: salad},
  ],
}

describe('evaluateDish', () => {
  it('rolls allergens up through sub-components', () => {
    const r = evaluateDish(burger, {avoid: []})
    expect(r.verdict).toBe('safe')
    expect(r.contains).toEqual(['eggs', 'gluten', 'milk', 'mustard'])
  })

  it('flags cross-contact from shared equipment, not just ingredients', () => {
    const plate: DishGraph = {_id: 'd-fries', name: 'Fries', slug: 'fries', components: [{_key: 'a', component: fries}]}
    const r = evaluateDish(plate, {avoid: ['gluten']})
    expect(r.contains).toEqual([])
    expect(r.hits.crossContact).toEqual(['gluten'])
    expect(r.crossContact.find((c) => c.allergen === 'gluten')).toMatchObject({equipment: 'Fryer 1', from: ['Battered cod']})
    expect(r.verdict).toBe('caution')
  })

  it('finds the smallest set of swaps/removals that makes a dish safe', () => {
    const r = evaluateDish(burger, {avoid: ['gluten', 'eggs']})
    expect(r.hits.contains).toEqual(['eggs', 'gluten'])
    expect(r.verdict).toBe('safe-with-changes')
    expect(r.fixes).toEqual([
      {type: 'swap', component: 'Brioche bun', with: 'Gluten-free bun', surcharge: 1.5},
      {type: 'remove', component: 'Garlic aioli'},
      {type: 'swap', component: 'House fries', with: 'Side salad', surcharge: 0},
    ])
    expect(r.afterFixes?.hits).toEqual({contains: [], mayContain: [], crossContact: []})
  })

  it('reports supplier may-contain as caution', () => {
    const r = evaluateDish(burger, {avoid: ['gluten', 'eggs', 'sesame']})
    expect(r.verdict).toBe('caution')
    expect(r.afterFixes?.hits.mayContain).toEqual(['sesame'])
  })

  it('applies diet rules and cannot fix a meat patty for vegetarians', () => {
    const r = evaluateDish(burger, {avoid: [], diet: 'vegetarian'})
    expect(r.verdict).toBe('unsafe')
    expect(r.dietIssues.map((d) => d.ingredient)).toEqual(['Beef'])
    expect(r.fixes).toEqual([])
  })
})
