# LLM-facing tool definitions for Groq function calling.
# Only semantic / filter args are exposed — db, user_lat, user_lng
# are injected server-side at execution time.

TOOL_DEFINITIONS: list[dict] = [
    {
        "type": "function",
        "function": {
            "name": "search_places",
            "description": (
                "Search the MMDb database for restaurants, cafes, dhabas, and other "
                "food places in Hyderabad. Returns a ranked list of matching places "
                "with ratings, cuisine tags, price tier, and veg-friendly status. "
                "Use this when the user asks about where to eat, a type of cuisine, "
                "a specific area, or a particular place."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": (
                            "Free-text search query — e.g. 'biryani', 'rooftop cafe', "
                            "'quick breakfast'. Leave empty to browse without a keyword."
                        ),
                    },
                    "area": {
                        "type": "string",
                        "description": (
                            "Neighbourhood or locality to filter by — e.g. "
                            "'Banjara Hills', 'Old City', 'Jubilee Hills'."
                        ),
                    },
                    "place_type": {
                        "type": "string",
                        "description": (
                            "Type of establishment — e.g. 'restaurant', 'cafe', "
                            "'dhaba', 'bakery', 'street food'."
                        ),
                    },
                    "veg_friendly": {
                        "type": "boolean",
                        "description": "Pass true to restrict to vegetarian-friendly places.",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_items",
            "description": (
                "Search the MMDb database for specific dishes or menu items in Hyderabad. "
                "Returns a ranked list of matching items with ratings, diet type, course, "
                "price, and the place they're served at. Use this when the user asks about "
                "a specific dish, ingredient, or food category."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": (
                            "Free-text search for a dish or ingredient — e.g. 'haleem', "
                            "'paneer tikka', 'chocolate dessert'."
                        ),
                    },
                    "diet": {
                        "type": "string",
                        "description": "Filter by dietary type: 'veg', 'non_veg', or 'egg'. Omit this parameter entirely when the user has not expressed a dietary preference.",
                    },
                    "course": {
                        "type": "string",
                        "description": (
                            "Filter by course — e.g. 'main', 'starter', 'dessert', 'beverage'."
                        ),
                    },
                    "meal_time": {
                        "type": "string",
                        "description": (
                            "Filter by meal time — e.g. 'breakfast', 'lunch', 'dinner', 'snack'."
                        ),
                    },
                    "signature": {
                        "type": "boolean",
                        "description": "Pass true to return only signature/must-try dishes.",
                    },
                    "place_id": {
                        "type": "integer",
                        "description": (
                            "Restrict results to one or more places by ID. Pass a single ID or a list of IDs. "
                            "For location-scoped dish queries, first call search_places to get ranked place IDs, "
                            "then pass those IDs here."
                        ),
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_areas",
            "description": (
                "Return a list of all neighbourhoods and localities covered in the MMDb "
                "database. Use this when the user asks which areas are covered, or to "
                "help them pick a location to filter by."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
]
