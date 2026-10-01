import {allergens} from './allergens'
import {components} from './components'
import {dishes} from './dishes'
import {equipmentList} from './equipment'
import {guidance} from './guidance'
import {ingredients} from './ingredients'

export {allergens, components, dishes, equipmentList, guidance, ingredients}

/** Every document, in dependency order (referenced documents before the ones that reference them). */
export const allDocuments = [
  ...allergens,
  ...ingredients,
  ...equipmentList,
  ...components,
  ...dishes,
  ...guidance,
]
