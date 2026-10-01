// GROQ against the schema in studio/schemaTypes. Nesting is fixed-depth on purpose:
// dish -> component -> subComponent (max one level, enforced by Studio validation) -> ingredient -> allergen.

const INGREDIENT = /* groq */ `{
  _id,
  name,
  animalOrigin,
  "allergens": coalesce(allergens[]->code, []),
  "mayContain": coalesce(mayContain[]->code, [])
}`

// For every piece of equipment a component touches, list the *other* components prepared on it
// and the allergens they carry. `^._id` is the equipment document here.
const EQUIPMENT = /* groq */ `{
  _id,
  name,
  shared,
  "sharedWith": *[_type == "component" && references(^._id)]{
    _id,
    name,
    "allergens": coalesce(ingredients[]->allergens[]->code, []),
    "subAllergens": coalesce(subComponents[]->ingredients[]->allergens[]->code, [])
  }
}`

const COMPONENT = /* groq */ `{
  _id,
  name,
  "slug": slug.current,
  "ingredients": coalesce(ingredients[]->${INGREDIENT}, []),
  "preparedOn": coalesce(preparedOn[]->${EQUIPMENT}, []),
  "subComponents": coalesce(subComponents[]->{
    _id,
    name,
    "slug": slug.current,
    "ingredients": coalesce(ingredients[]->${INGREDIENT}, []),
    "preparedOn": coalesce(preparedOn[]->${EQUIPMENT}, [])
  }, [])
}`

export const DISH_FIELDS = /* groq */ `
  _id,
  name,
  "slug": slug.current,
  section,
  price,
  description,
  "available": coalesce(available, true),
  spiceLevel,
  "components": coalesce(components[]{
    _key,
    "removable": coalesce(removable, false),
    "component": component->${COMPONENT}
  }, []),
  "substitutions": coalesce(substitutions[]{
    _key,
    "surcharge": coalesce(surcharge, 0),
    "replaces": replaces->{_id, name},
    "with": with->${COMPONENT}
  }, [])
`

export const DISH_GRAPH_QUERY = /* groq */ `*[_type == "dish" && slug.current == $slug][0]{${DISH_FIELDS}}`

export const ALLERGENS_QUERY = /* groq */ `*[_type == "allergen"] | order(annexNumber asc){name, code, icon}`
