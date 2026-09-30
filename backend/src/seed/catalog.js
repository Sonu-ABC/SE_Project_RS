import { Ingredient, Food, RestaurantAccount } from "../models/index.js";

const ingredientSeed = [
  ["Burger Bun", 10, "piece"],
  ["Veg/Potato Patty", 15, "piece"],
  ["Cheese Slice / Mozzarella", 12, "slice"],
  ["Onion", 0.04, "gram"],
  ["Tomato", 0.05, "gram"],
  ["Potato", 0.03, "gram"],
  ["Cooking Oil", 0.15, "ml"],
  ["8-inch Pizza Base", 20, "piece"],
  ["Pizza/Pasta Sauce", 0.2, "gram"],
  ["Penne Pasta", 0.12, "gram"],
  ["Fresh Milk", 0.06, "ml"],
  ["Sandwich Bread", 4, "slice"],
  ["Butter", 0.5, "gram"],
  ["Paneer (Cottage Cheese)", 0.4, "gram"],
  ["Tortilla / Wrap Base", 12, "piece"],
  ["Mayo / Mint Mayo Sauce", 0.25, "gram"],
  ["Ground Coffee Powder", 1.5, "gram"],
  ["Sugar", 0.05, "gram"],
  ["Tea Leaves & Spices", 0.6, "gram"],
  ["Baguette/Garlic Loaf", 25, "loaf"],
];
const foodSeed = [
  [
    "Classic Veg Burger",
    120,
    32.7,
    [
      ["Burger Bun", 1],
      ["Veg/Potato Patty", 1],
      ["Onion", 30],
      ["Tomato", 30],
      ["Mayo / Mint Mayo Sauce", 20],
    ],
  ],
  [
    "Cheese Burst Pizza (8 inch)",
    249,
    67.6,
    [
      ["8-inch Pizza Base", 1],
      ["Pizza/Pasta Sauce", 40],
      ["Cheese Slice / Mozzarella", 3],
      ["Onion", 40],
      ["Tomato", 40],
    ],
  ],
  [
    "Crispy French Fries",
    99,
    16.5,
    [
      ["Potato", 250],
      ["Cooking Oil", 60],
    ],
  ],
  [
    "White Sauce Pasta",
    180,
    44,
    [
      ["Penne Pasta", 100],
      ["Fresh Milk", 150],
      ["Butter", 20],
      ["Cheese Slice / Mozzarella", 1],
      ["Onion", 25],
    ],
  ],
  [
    "Grilled Cheese Sandwich",
    110,
    40.5,
    [
      ["Sandwich Bread", 2],
      ["Butter", 15],
      ["Cheese Slice / Mozzarella", 2],
      ["Tomato", 20],
    ],
  ],
  [
    "Paneer Tikka Wrap",
    160,
    52.95,
    [
      ["Tortilla / Wrap Base", 1],
      ["Paneer (Cottage Cheese)", 80],
      ["Onion", 30],
      ["Mayo / Mint Mayo Sauce", 25],
      ["Cooking Oil", 10],
    ],
  ],
  [
    "Cheesy Garlic Bread",
    130,
    59,
    [
      ["Baguette/Garlic Loaf", 1],
      ["Butter", 20],
      ["Cheese Slice / Mozzarella", 2],
    ],
  ],
  [
    "Cold Coffee",
    80,
    19,
    [
      ["Fresh Milk", 200],
      ["Ground Coffee Powder", 4],
      ["Sugar", 20],
    ],
  ],
  [
    "Masala Chai",
    40,
    9.75,
    [
      ["Fresh Milk", 100],
      ["Tea Leaves & Spices", 5],
      ["Sugar", 15],
    ],
  ],
  [
    "Paneer Loaded Pizza (8 inch)",
    279,
    81.2,
    [
      ["8-inch Pizza Base", 1],
      ["Pizza/Pasta Sauce", 40],
      ["Cheese Slice / Mozzarella", 2],
      ["Paneer (Cottage Cheese)", 70],
      ["Onion", 30],
    ],
  ],
];

export async function seedCatalog() {
  const ids = {};
  for (const [name, costPrice, unit] of ingredientSeed) {
    const item = await Ingredient.findOneAndUpdate(
      { name },
      {
        $set: { name, costPrice, reorderThreshold: 20, unit },
        $setOnInsert: { currentStock: 100 },
      },
      { upsert: true, new: true },
    );
    ids[name] = item._id;
  }
  for (const [name, sellingPrice, totalIngredientCost, parts] of foodSeed) {
    await Food.findOneAndUpdate(
      { name },
      {
        name,
        sellingPrice,
        totalIngredientCost,
        profit: sellingPrice - totalIngredientCost,
        ingredients: parts.map(([ingredientName, quantityRequired]) => ({
          ingredientId: ids[ingredientName],
          quantityRequired,
        })),
      },
      { upsert: true, new: true },
    );
  }
  await RestaurantAccount.findOneAndUpdate(
    { key: "MAIN" },
    { $setOnInsert: { key: "MAIN", balance: 0, totalSales: 0 } },
    { upsert: true, new: true },
  );
}
