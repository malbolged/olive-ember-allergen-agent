import {slug, type SanityDoc} from './helpers'

type Category = 'kitchen-procedure' | 'policy' | 'allergen-reference' | 'supplier-spec'

const DISCLAIMER =
  '\n\n---\n\n_Olive & Ember is a fictional restaurant created for a Sanity Context demo. This is not real allergen advice. Always confirm allergens with the staff of the venue you are eating at._'

const article = (id: string, title: string, category: Category, body: string): SanityDoc => ({
  _id: `guidance-${id}`,
  _type: 'guidanceArticle',
  title,
  slug: slug(id),
  category,
  body: body.trim() + DISCLAIMER,
})

export const guidance: SanityDoc[] = [
  article(
    'about-olive-and-ember',
    'About Olive & Ember and this allergen guide',
    'policy',
    `
# About Olive & Ember

Olive & Ember is a (fictional) Mediterranean charcoal grill in Dublin, Ireland: meze, grilled meats and fish, and a small dessert menu. This guide is the kitchen's handbook on allergens, dietary requirements and how the team handles special requests. It explains **why** we do things and **how** staff should act.

## How this guide relates to the menu data

What is in each dish (ingredients, sub-recipes, which station or fryer it is cooked on, which parts can be left off and which swaps we offer) lives in the structured menu. The menu is the single source of truth for "does dish X contain Y". This guide never lists a dish's ingredients. It covers what the menu data cannot express on its own:

- what our labels mean ("contains", "may contain", "cross-contact")
- which procedures protect a guest with an allergy
- how to talk to guests about risk, honestly and without over-promising
- what to do in an emergency

## Our promise to guests

We declare all 14 major allergens in every dish, including those in sauces, stocks and garnishes. We tell guests about cross-contact risks from shared fryers, grills and benches. We never guarantee that a dish is "allergen-free". We say what is in it, what it might touch, and what we can change.

## Where we are and which rules apply

We are in Dublin, Ireland, so prices are in euro and the allergen rules are EU Regulation 1169/2011 (the 14 allergens), enforced by the Food Safety Authority of Ireland. We also train staff on the UK Food Standards Agency's allergen guidance for food businesses, which follows the same 14 allergens and is a clear, practical reference. In an emergency, call 112 or 999; both work in Ireland.

If a guest's needs cannot be met safely, we say so. Turning away an order is always better than guessing.
`,
  ),

  article(
    'fryer-and-cross-contact-policy',
    'Cross-contact and the shared fryer policy',
    'kitchen-procedure',
    `
# Cross-contact and the shared fryer policy

**Cross-contact** happens when an allergen moves from one food to another through shared oil, surfaces, utensils or hands. A dish can have perfectly clean ingredients and still be unsafe because of where it is cooked.

## Our two fryers

- **Fryer 1 (shared)** is the main fryer. Battered cod, crispy calamari, falafel, halloumi fries, chicken goujons *and* the regular fries all go through the same oil. Anything cooked in Fryer 1 must be treated as potentially containing **gluten, fish, molluscs, milk and eggs**, even plain potato fries.
- **Fryer 2 (dedicated gluten-free)** only ever cooks gluten-free fries. It has its own baskets, its own scoop, and is filtered and logged daily. Nothing battered, breaded or dusted is allowed in it, not even "just this once" during a rush.

When a guest avoids gluten, fish, shellfish, milk or egg and orders anything with fries, staff must offer the **gluten-free fries swap** (no charge). They are the same recipe cooked in Fryer 2.

## Other shared stations

- **Charcoal grill:** meats, halloumi and vegetables share the bars. The bars are brushed between services, not between orders. Grilled vegetables and cauliflower may therefore have contact with milk (halloumi, yogurt-marinated chicken).
- **Seafood plancha:** reserved for prawns and sea bass. We never cook non-seafood items on it.
- **Bread oven:** wheat breads only. Gluten-free bread is never warmed here; it goes in the dedicated gluten-free toaster.
- **Pastry bench:** every baked dessert is made here, and the bench handles wheat flour, nuts, butter and eggs daily. Guests with a severe nut or gluten allergy should be told that **all baked desserts carry cross-contact risk**, including the flourless orange and almond cake.

## Cold prep

Cold prep uses colour-coded boards and utensils, and sauces are made in separate, labelled batches. We do not treat cold prep as a shared surface for declaration purposes.

## Removing isn't the same as remaking

Leaving a component off (for example the croutons on the Caesar) removes that component's allergens from the plate. It does **not** undo cross-contact from shared equipment used for the rest of the dish.
`,
  ),

  article(
    'allergy-order-procedure',
    'How we take and cook an allergy order',
    'kitchen-procedure',
    `
# How we take and cook an allergy order

Every allergy order follows the same five steps, whether it is busy or quiet.

## 1. Ask, don't assume
When a guest mentions an allergy or intolerance, the server asks:
- which allergens exactly (for example "tree nuts, or peanuts too?")
- how severe: intolerance, allergy, or anaphylaxis risk
- whether trace amounts or cross-contact matter (for coeliac disease and severe allergies, they always do)

## 2. Check the menu data together
The server checks the dish in the allergen menu (the tablet or the assistant), never from memory. They read out every declared allergen, any supplier "may contain" warnings, and the cross-contact notes for the stations the dish uses.

## 3. Flag the ticket
Allergy orders are rung in with the **ALLERGY** modifier and the allergens written in full ("ALLERGY: SESAME, PEANUT – SEVERE"). The ticket prints in red on the pass. Any swaps (gluten-free bun, gluten-free fries, vegan feta) are entered as modifiers, never as free-text notes.

## 4. Chef confirmation
The chef on the pass reads the ticket aloud, confirms the recipe and swaps, and **initials the ticket**. If there is any doubt about a sub-recipe or a supplier change, the chef checks the spec sheet folder before cooking. If the chef cannot confirm the dish is suitable, the dish is not served. The server goes back to the guest with alternatives.

## 5. Separate, then deliver by hand
Allergy dishes are plated with clean utensils on a separate tray, given a red allergy pick, and carried by the server who took the order. They are never run by a food runner. The server names the dish and the allergens it is free from as it is set down.

## After service
Any near-miss (wrong garnish, missing modifier) is written in the allergy log the same night and reviewed at the next pre-shift briefing.
`,
  ),

  article(
    'may-contain-policy',
    'What "may contain" means at Olive & Ember',
    'policy',
    `
# What "may contain" means

We use three different levels. Staff should always say which one applies.

| Level | Meaning | Where it comes from |
|---|---|---|
| **Contains** | The allergen is a deliberate ingredient in the dish, a sauce, or a sub-recipe. | Our recipes |
| **May contain (supplier)** | The allergen is not in the recipe, but the manufacturer of an ingredient warns of possible traces from their factory. | Supplier spec sheets (precautionary allergen labelling) |
| **Cross-contact (kitchen)** | The allergen may transfer in our kitchen from shared fryers, grills, ovens or benches. | Our station set-up |

## How we treat "may contain"

A "may contain" warning is not a legal requirement. Suppliers add it when they cannot rule out traces, usually because the same production line runs other products. It carries real risk for people with severe allergies. Our policy:

- **We always tell the guest.** A "may contain" item is never described as "free from" that allergen.
- **For severe allergies we recommend avoiding it.** For example, our dark chocolate may contain milk and tree nuts, so the vegan chocolate pot contains no milk by recipe, but we do not recommend it to a guest with a severe milk or nut allergy.
- **For intolerances and preferences** (for example vegans avoiding dairy by choice) a "may contain" is usually acceptable. We still mention it so the guest can decide.
- **Oats are a special case for coeliac guests.** Our rolled oats are not certified gluten-free and may contain gluten (see the coeliac guidance).

## What staff should never say
- "There's only a tiny bit."
- "It should be fine."
- "It's gluten-free, it just might have gluten."

Say instead: "The recipe doesn't contain X, but the supplier warns it may contain traces of X. I wouldn't recommend it for a severe allergy."
`,
  ),

  article(
    'anaphylaxis-emergency-procedure',
    'Allergic reaction and anaphylaxis emergency procedure',
    'kitchen-procedure',
    `
# Allergic reaction and anaphylaxis: what to do

Anaphylaxis is a severe, potentially life-threatening allergic reaction. It can develop within minutes. **Every member of staff must know this procedure.**

## Recognise the signs
- swelling of the lips, tongue, face or throat
- difficulty breathing, wheezing, persistent cough, hoarse voice
- dizziness, collapse, pale or floppy (especially children)
- widespread hives, vomiting or stomach pain after eating

## Act immediately
1. **Call 112 or 999 straight away (both reach emergency services in Ireland).** Say "anaphylaxis" clearly and give the restaurant address.
2. **Help the guest use their own adrenaline auto-injector** (EpiPen, Jext, Emerade) if they have one: into the outer thigh, through clothing if needed. Note the time.
3. **Position:** keep them lying down with legs raised. If breathing is difficult, let them sit up. Do not make them stand or walk. Pregnant guests lie on their left side.
4. If there is no improvement after 5 minutes and a second auto-injector is available, use it.
5. **Stay with the guest** until paramedics arrive. Send a colleague to the door to guide them in.
6. If the guest stops breathing, start CPR.

## Afterwards
- Keep the dish, the ticket and any packaging. The paramedics and the manager will need to know exactly what was eaten.
- The manager completes an incident report the same day and reviews the ticket, the modifiers and the chef confirmation step.

## Milder reactions
Even if symptoms seem mild (tingling mouth, a few hives), tell the manager and keep watching the guest. Mild reactions can escalate. Never give the guest food or drink to "wash it down", and never let them leave alone.

## Staff do not diagnose
Staff do not decide whether a reaction is "serious". If in doubt, call for help.
`,
  ),

  article(
    'eu-14-allergens-hidden-sources',
    'The EU 14 allergens and where they hide in our kitchen',
    'allergen-reference',
    `
# The 14 allergens and where they hide

EU Regulation 1169/2011 (Annex II) requires restaurants to declare 14 allergens. The obvious sources are easy. The **hidden** sources are the ones that catch people out. These are the ones that matter in a Mediterranean kitchen like ours:

- **Gluten:** bulgur (in tabbouleh), semolina (calamari dusting), filo, panko, and a little wheat flour used to bind falafel. Malt vinegar in Worcestershire sauce is made from barley. Oats are a special case (see the coeliac guidance).
- **Crustaceans:** prawns. Our crustaceans stay on the seafood plancha.
- **Eggs:** mayonnaise and anything made from it (burger sauce, Caesar dressing), brioche, fresh ice cream, the gluten-free bun (which contains egg), and the breadcrumb coating on goujons.
- **Fish:** anchovies in Caesar dressing and in Worcestershire sauce. That means a meat dish can contain fish when it is brushed with a glaze made with Worcestershire.
- **Peanuts:** we do not cook with peanuts, but our tahini supplier roasts peanuts on the same site.
- **Soybeans:** soy lecithin in dark chocolate.
- **Milk:** butter in rice pilaf and on prawns, yogurt marinades, halloumi, feta, hard cheese in pesto and Caesar dressing.
- **Tree nuts:** romesco sauce is thickened with almonds and hazelnuts. Pesto uses pine nuts. Our orange cake is made with ground almonds. The Annex II list does not include pine nuts, but **we declare pine nuts as a tree nut** because many nut-allergic guests react to them.
- **Celery:** stocks. Both our chicken stock and our vegetable stock contain celery, so pilaf and tomato sauce contain celery.
- **Mustard:** Dijon in house mayonnaise and in the lemon & caper dressing.
- **Sesame:** tahini, and therefore hummus and tahini sauce. Za'atar (sprinkled on the grilled halloumi salad after grilling). The sesame topping on brioche buns.
- **Sulphites:** red wine and red wine vinegar (in romesco and the pomegranate glaze).
- **Lupin:** lupin flour in our gluten-free flatbread. Lupin often turns up in gluten-free products, exactly where gluten-avoiding guests are looking.
- **Molluscs:** calamari (squid).

## Rule of thumb
Sauces, stocks, dressings, glazes and "free-from" substitutes are where hidden allergens live. When in doubt, check the sub-recipes, not just the dish name.
`,
  ),

  article(
    'coeliac-gluten-and-oats',
    'Coeliac disease, gluten intolerance and oats',
    'allergen-reference',
    `
# Coeliac disease, gluten intolerance and oats

## Coeliac disease is not a preference
Coeliac disease is an autoimmune condition. Even a few crumbs can cause damage, often with no immediate symptoms. For a coeliac guest, **cross-contact matters as much as ingredients**. People with non-coeliac gluten sensitivity or a wheat allergy vary widely in how much they can tolerate. Always ask.

## What we can offer coeliac guests
- **Gluten-free fries** from the dedicated Fryer 2. The regular fries are cooked in Fryer 1 alongside battered and breaded food and are **not** suitable.
- **Gluten-free bun** (contains egg) and **gluten-free flatbread** (contains lupin). Both are warmed only in the dedicated gluten-free toaster, never in the bread oven.
- **Gluten-free penne** for the kids' pasta, cooked in a separate pot of fresh water.
- Salads can be made without croutons. The croutons come from the bread oven and are added at the pass, so leaving them off is a clean removal.

## What we cannot make safe
- Anything from Fryer 1 (calamari, falafel, halloumi fries, cod, goujons, regular fries).
- Tabbouleh (bulgur wheat).
- Anything with Worcestershire-based glaze (barley malt vinegar).
- Baked desserts: the pastry bench handles wheat flour every day. The orange & almond cake is flourless but is baked there. We tell coeliac guests it carries a cross-contact risk.

## Oats
Oats contain avenin rather than gluten. Most coeliac people tolerate **pure, uncontaminated** oats, but a minority react even to those. Ordinary oats are almost always contaminated with wheat or barley during growing and milling. Our rolled oats (from Harvest Mill Co.) are **not certified gluten-free** and carry a "may contain gluten" warning. The toasted oat crumble on the vegan chocolate pot is therefore **not suitable for coeliac guests**. Offer the pot without the crumble.

## Words to avoid
Never describe a dish as "gluten-free" if it only lacks gluten ingredients but is cooked in a shared environment. Say "no gluten ingredients, but cooked in a shared fryer/oven".
`,
  ),

  article(
    'vegan-vegetarian-definitions',
    'Vegan, vegetarian and pescatarian: how our kitchen defines them',
    'policy',
    `
# Vegan, vegetarian and pescatarian: our definitions

Dietary choices aren't allergens, but guests rely on us to get them right. Our kitchen uses these definitions:

- **Vegan:** no animal products of any kind. That means no meat, fish, shellfish, dairy, eggs, **or honey**. Honey is an animal product, and it is the most common reason a "plant-based-looking" dish is not vegan.
- **Vegetarian:** no meat, fish or shellfish, **including stocks, fats and sauces made from them**. Dairy, eggs and honey are fine. Our hard cheese is made with microbial rennet, so it is vegetarian (traditional Parmigiano Reggiano is not).
- **Pescatarian:** vegetarian plus fish and shellfish.

## Where our menu trips people up
- **Honey hides in sweet dressings.** The harissa dressing is sweetened with honey, so dishes dressed with it are vegetarian but not vegan unless the dressing is left off.
- **Stock hides in sides.** The rice pilaf is cooked in chicken stock and butter. It is not vegetarian, even though it contains no visible meat.
- **Anchovy hides in dressings and glazes.** Caesar dressing and Worcestershire sauce contain anchovies, so they are neither vegetarian nor vegan.
- **Butter hides on seafood** and in pilaf.
- **Frying oil is shared.** The falafel and fries contain no animal ingredients, but Fryer 1 also cooks fish, squid, halloumi and chicken. Strict vegans who object to shared oil should be told. For allergy purposes this is covered by the cross-contact policy.

## Vegan swaps we offer
- Vegan feta instead of feta on the flame-grilled vegetables (+€1).
- Leave off honey-sweetened dressings, mayonnaise-based sauces, tzatziki and yogurt.

## How to answer
If a guest asks "is this vegan?", check every sub-recipe, not just the dish description. When the answer depends on removing a component, say so: "It's vegan if we leave off the harissa dressing, which contains honey."
`,
  ),

  article(
    'supplier-spec-summaries',
    'Supplier specification sheet summaries',
    'supplier-spec',
    `
# Supplier specification sheet summaries

These summaries come from each supplier's current specification sheet. The full sheets are in the red folder in the office. **If a supplier changes a product, the sheet must be updated before the product is used**, and the head chef updates the ingredient in the menu data the same day.

## Harvest Mill Co. (flours, semolina, panko, pasta, oats, cornflour)
- Wheat products: contain gluten.
- **Rolled oats:** not certified gluten-free. Milled on a line shared with wheat. Label: *may contain gluten*.
- Cornflour: gluten-free, milled on a dedicated line.

## Levant Pantry Imports (tahini, chickpeas, nuts, seeds, spices, harissa, bulgur, rice)
- **Tahini:** 100% sesame. The factory also roasts peanuts. Label: *may contain peanuts*. This affects hummus and tahini sauce.
- Nuts are packed in a facility handling all tree nuts and sesame.
- Rose harissa paste: no declared allergens (chilli, rose, garlic, oil, spices).

## Noir Cocoa Works (dark chocolate)
- 70% dark chocolate contains **soy lecithin**.
- Made on a line that also produces milk chocolate and hazelnut praline. Label: *may contain milk and tree nuts*.

## Clearway Free-From Foods (gluten-free flour, pasta and flatbread flour, vegan feta)
- Gluten-free blend: rice, tapioca and potato flour. Certified gluten-free (<20 ppm).
- **Lupin flour:** declared allergen *lupin*. It is used in our gluten-free flatbread, so the flatbread is gluten-free but **contains lupin**.
- Vegan feta: coconut oil base, no declared allergens.

## Hillside Dairy (milk, cream, butter, yogurt, feta, halloumi, hard cheese)
- All products contain milk.
- The hard cheese uses microbial rennet and is suitable for vegetarians.

## Rise Bakery (sourdough, filo)
- Contains gluten. The bakery also handles sesame and eggs, but our sourdough and filo carry no precautionary labelling for them.

## Cold Coast Seafood (cod, sea bass, anchovies, prawns, calamari)
- Fish, crustaceans and molluscs are processed in the same plant. We treat every seafood delivery as a possible source of all three.

## Oakfield Butchers (lamb, beef, chicken)
- Fresh meat, no added ingredients. Our chicken stock is made in-house from their bones.
`,
  ),

  article(
    'substitutions-and-surcharges',
    'Substitutions, removals and surcharges',
    'policy',
    `
# Substitutions, removals and surcharges

We want as many guests as possible to eat safely. We also keep the kitchen predictable, so **we only offer the swaps listed in the menu data for each dish**. Improvised swaps at the pass are how mistakes happen.

## Standard swaps

| Swap | Surcharge | Why |
|---|---|---|
| Brioche bun → gluten-free bun | +€1.50 | Gluten. The GF bun contains egg. |
| Pita → gluten-free flatbread | +€1.00 | Gluten. The flatbread contains lupin. |
| Fries → gluten-free fries (Fryer 2) | Free | We never charge for a safer fryer. |
| Feta → vegan feta | +€1.00 | Milk / vegan. |
| Penne → gluten-free penne (kids) | +€1.00 | Gluten. Cooked in fresh water. |

Swaps are only offered on the dishes where the menu lists them. A guest may ask for a gluten-free bun on a dish that doesn't have one listed. If the chef agrees, it is entered as a manager-approved modifier. The assistant should not promise it.

## Removals ("leave it off")
Components marked **removable** in the menu data can be left off at no charge and with no remake needed. Typical examples are sauces, dressings, croutons, garnishes and side breads. A removal takes that component's allergens off the plate. It does **not** remove cross-contact from shared stations used for the rest of the dish.

Components that are **not** removable are cooked into the dish (a marinade, a glaze, a binder). We cannot take them out. Offer a different dish instead.

## Combining swaps and removals
A dish can often be made suitable through a combination. For example: swap the bun, swap the fries, and leave off the sauce. Each change must be entered as its own modifier on the ticket so the pass can check it.

## When nothing works
If no combination of listed swaps and removals makes a dish suitable, the honest answer is "this dish can't be made safe for you". Then suggest dishes that can.
`,
  ),

  article(
    'kids-menu-allergy-policy',
    "Children's menu allergy policy",
    'policy',
    `
# Children's menu allergy policy

Children with allergies can't always explain what they are allergic to, or recognise a reaction early. We take extra care.

## Always speak to the parent or guardian
Allergy information for a child is taken from the accompanying adult, never from the child alone. If a child orders independently (for example at a party table), the server confirms allergies with an adult before sending the order.

## Our kids' dishes and what to check
- **Chicken goujons** are breaded with panko (gluten) and egg, and fried in the shared Fryer 1. The fries that come with them can be swapped for gluten-free fries from Fryer 2 at no charge. The goujons themselves cannot be made gluten- or egg-free.
- **Tomato pasta** uses durum wheat penne (gluten). Gluten-free penne is available for +€1 and is cooked in a separate pot of fresh water. The tomato sauce is made with vegetable stock, which **contains celery**. The grated cheese (milk) can be left off.

## Party and group bookings
For children's parties we ask for allergy details at booking. The kitchen prepares allergy portions first, plates them separately and labels each with the child's name.

## Desserts for children
All baked desserts come from the shared pastry bench (nuts, gluten, egg, milk). For a child with a severe nut allergy, we recommend no baked dessert at all. The vegan chocolate pot is made at cold prep, but its chocolate *may contain* milk and tree nuts, so it is not suitable either. In that case, offer fresh fruit (not on the menu, always available on request).

## Adrenaline auto-injectors
If a parent tells us a child carries an auto-injector, the server notes it on the ticket ("CHILD HAS EPIPEN") so the team knows where it is if needed. See the emergency procedure.
`,
  ),
]
