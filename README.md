# Olive & Ember · Allergen-safe menu agent

An AI allergy concierge for a (fictional) Mediterranean grill in Dublin. Guests pick their allergies and diet, ask questions in plain language, and get answers grounded in the restaurant's **structured menu graph in Sanity** plus a **Sanity Context Knowledge Base** of kitchen procedures and UK Food Standards Agency guidance.

**Live demo:** https://olive-ember-allergen-agent.vercel.app
**Public dataset:** project `a2iy46w2`, dataset `production` (public read, e.g. [all dishes](https://a2iy46w2.api.sanity.io/v2026-03-03/data/query/production?query=*%5B_type%3D%3D%22dish%22%5D%7Bname%2C%22slug%22%3Aslug.current%2Cprice%7D))

Built for the [DEV Sanity Challenge](https://dev.to/devteam/join-the-sanity-challenge-2500-in-prizes-for-five-winners-514m), Path One. Not medical or dietary advice.

## Why structure matters here

"Is this dish safe for me?" can't be answered from menu prose. The fries have three clean ingredients, yet they are **not** gluten-free: they share Fryer 1 with battered cod and calamari. The Caesar is gluten-free only once the croutons are left off. The "vegan-looking" cauliflower has honey in its dressing. Those answers only exist as relationships:

```
dish ─▶ components[] (removable?) ─▶ subComponents[] (max 1 level)
                    │                          │
                    └──▶ ingredients[] ◀────────┘
                            ├─▶ allergens[]   (EU Annex II, 14)
                            ├─▶ mayContain[]  (supplier labels)
                            └─  animalOrigin  (vegan / vegetarian)
component ─▶ preparedOn[] ─▶ equipment {shared}   ← cross-contact
dish ─▶ substitutions[] {replaces, with, surcharge}
```

## Architecture

| Piece | What it does |
|---|---|
| `studio/` | Sanity Studio (v6): 6 schema types, seed data (14 allergens, 87 ingredients, 8 stations, 51 components, 25 dishes, 11 guidance articles), offline validator |
| Context MCP `menu` | **GROQ mode**, dataset source, filtered to menu types. The agent writes fixed-depth GROQ over the graph. |
| Knowledge Base | Built from the 11 `guidanceArticle` docs (dataset source) + the FSA allergen guidance (website source). Served by Context MCP `guidance` in **Knowledge Base mode**. |
| `app/` | Next.js 16 + AI SDK 7. The chat route connects to **both** MCP endpoints (an endpoint with a dataset source ignores KB sources, so they're separate), inlines both `/initial-context` payloads, and adds one local tool, `verify_dishes`. |
| `app/src/lib/safety.ts` | Pure function that turns a dish graph + guest selections into `safe / safe-with-changes / caution / unsafe` and the minimal fixes (removals and swaps). It renders every dish card and backs `verify_dishes`, so **the LLM never decides safety on its own**. |

The model is pluggable (`LLM_PROVIDER` = google, anthropic, openai, groq). The demo runs on Gemini with a fallback chain across Flash models.

## Run it locally

```bash
pnpm install
cp .env.example .env            # fill in values (see comments in the file)
pnpm --filter studio seed       # needs SANITY_WRITE_TOKEN
pnpm dev:studio                 # http://localhost:3333
pnpm dev:app                    # http://localhost:3000
```

Context endpoints and the Knowledge Base are created in the Sanity Dashboard → Context (see below).

## Sanity Context setup

Dashboard → **Context**, in this order. Context must be enabled for the organization (Manage → Labs), and the app needs an organization API token with **Context Viewer** permission.

### 1. MCP `menu` (GROQ mode: the structured menu graph)

- **Name:** `menu` · **Source:** Dataset `<projectId>.production`
- **GROQ filter:**

  ```
  _type in ["dish", "component", "ingredient", "allergen", "equipment"]
  ```

- **Instructions:**

  ```
  This dataset is the allergen graph of Olive & Ember, a (fictional) Mediterranean grill.
  A dish is assembled from components[] (each {component->, removable}); a component has ingredients[]-> and at most one level of subComponents[]->; an ingredient has allergens[]-> and mayContain[]-> (supplier precautionary labelling) and animalOrigin (none|dairy|egg|honey|meat|fish|shellfish).
  Allergens are the 14 EU Annex II allergens; always filter on allergen.code (gluten, crustaceans, eggs, fish, peanuts, soybeans, milk, tree-nuts, celery, mustard, sesame, sulphites, lupin, molluscs).
  A dish's allergens = allergens of its components' ingredients PLUS the ingredients of their subComponents. Never judge from names or descriptions.
  Cross-contact: a component's preparedOn[]-> equipment with shared == true exposes it to the allergens of every other component prepared on that equipment: *[_type == "component" && references($equipmentId)].
  dish.substitutions[] ({replaces->, with->, surcharge}) and removable components are the only modifications the kitchen supports.
  Only recommend dishes with available == true.
  ```

### 2. Knowledge Base "Olive & Ember allergen guidance"

- **Purpose:**

  ```
  Guest- and staff-facing allergen guidance for Olive & Ember: how the kitchen handles allergy orders, cross-contact and shared fryers, what "may contain" means, coeliac and vegan definitions, substitution policy, and emergency procedures, grounded in UK Food Standards Agency guidance.
  ```

- **Source 1, Dataset:** `*[_type == "guidanceArticle"]{title, category, body}`
- **Source 2, Website:** `https://www.gov.uk/government/publications/allergen-guidance-for-food-businesses/allergen-guidance-for-food-businesses` (the old food.gov.uk URL redirects across hosts and crawls 0 documents)
- **Build entries**, then review **Issues**. The first build flags a conflict over the emergency number; keep "999 or 112" (the restaurant is in Dublin, where both work).

### 3. MCP `guidance` (Knowledge Base mode)

- **Name:** `guidance` · **Source:** the Knowledge Base only. Adding a dataset source switches the endpoint to GROQ mode and silently ignores the Knowledge Base.
- **Instructions:**

  ```
  Kitchen procedures, policies and allergen definitions for Olive & Ember (a fictional demo restaurant in Dublin, Ireland), plus UK Food Standards Agency guidance. Use this for "how / why / what does it mean" questions. It does not list what is in each dish; that comes from the menu graph.
  ```

### 4. Wire the endpoints into `.env`

```
SANITY_CONTEXT_MENU_MCP_URL=https://api.sanity.io/v1/context/organizations/<orgId>/mcp/menu
SANITY_CONTEXT_KB_MCP_URL=https://api.sanity.io/v1/context/organizations/<orgId>/mcp/guidance
```

## Tests

```bash
pnpm --filter app test                       # verdict engine unit tests
npx tsx studio/scripts/validate-data.ts      # referential integrity + per-dish allergen table
```
