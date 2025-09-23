export interface Dish {
  id: string;
  name: string;
  tags: string[];
  cookingTime: 'quick' | 'medium' | 'long'; // under 30min, 30-60min, over 60min
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  category: string;
}

export const dinnerDishes: Dish[] = [
  // Italian
  { id: '1', name: 'Spaghetti Carbonara', tags: ['pasta', 'eggs', 'bacon', 'parmesan', 'cream'], cookingTime: 'quick', difficulty: 'medium', cuisine: 'Italian', category: 'pasta' },
  { id: '2', name: 'Margherita Pizza', tags: ['dough', 'tomatoes', 'mozzarella', 'basil'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Italian', category: 'pizza' },
  { id: '3', name: 'Risotto ai Funghi', tags: ['rice', 'mushrooms', 'parmesan', 'white wine', 'onion'], cookingTime: 'medium', difficulty: 'hard', cuisine: 'Italian', category: 'rice' },
  { id: '4', name: 'Lasagna Bolognese', tags: ['pasta', 'ground beef', 'tomatoes', 'cheese', 'milk'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Italian', category: 'pasta' },
  { id: '5', name: 'Osso Buco', tags: ['veal', 'vegetables', 'white wine', 'tomatoes'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Italian', category: 'meat' },
  { id: '6', name: 'Penne Arrabbiata', tags: ['pasta', 'tomatoes', 'chili', 'garlic', 'olive oil'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Italian', category: 'pasta' },
  { id: '7', name: 'Chicken Parmigiana', tags: ['chicken', 'cheese', 'tomatoes', 'breadcrumbs'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Italian', category: 'chicken' },
  { id: '8', name: 'Gnocchi al Pesto', tags: ['gnocchi', 'basil', 'pine nuts', 'parmesan', 'olive oil'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Italian', category: 'pasta' },

  // Asian
  { id: '9', name: 'Beef Teriyaki', tags: ['beef', 'soy sauce', 'sugar', 'ginger', 'garlic'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Japanese', category: 'meat' },
  { id: '10', name: 'Pad Thai', tags: ['noodles', 'shrimp', 'eggs', 'peanuts', 'lime'], cookingTime: 'quick', difficulty: 'medium', cuisine: 'Thai', category: 'noodles' },
  { id: '11', name: 'Sweet and Sour Pork', tags: ['pork', 'pineapple', 'bell peppers', 'vinegar', 'sugar'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Chinese', category: 'meat' },
  { id: '12', name: 'Chicken Tikka Masala', tags: ['chicken', 'yogurt', 'tomatoes', 'cream', 'spices'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Indian', category: 'chicken' },
  { id: '13', name: 'Fried Rice', tags: ['rice', 'eggs', 'vegetables', 'soy sauce', 'garlic'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Chinese', category: 'rice' },
  { id: '14', name: 'Ramen', tags: ['noodles', 'broth', 'eggs', 'pork', 'vegetables'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Japanese', category: 'noodles' },
  { id: '15', name: 'Korean BBQ Beef', tags: ['beef', 'soy sauce', 'garlic', 'sesame oil', 'sugar'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Korean', category: 'meat' },
  { id: '16', name: 'Thai Green Curry', tags: ['curry paste', 'coconut milk', 'chicken', 'vegetables', 'basil'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Thai', category: 'chicken' },

  // European
  { id: '17', name: 'Beef Bourguignon', tags: ['beef', 'red wine', 'mushrooms', 'onions', 'carrots'], cookingTime: 'long', difficulty: 'hard', cuisine: 'French', category: 'meat' },
  { id: '18', name: 'Wiener Schnitzel', tags: ['veal', 'breadcrumbs', 'eggs', 'flour', 'lemon'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Austrian', category: 'meat' },
  { id: '19', name: 'Paella', tags: ['rice', 'saffron', 'seafood', 'chicken', 'vegetables'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Spanish', category: 'rice' },
  { id: '20', name: 'Fish and Chips', tags: ['fish', 'potatoes', 'flour', 'beer', 'oil'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'British', category: 'fish' },
  { id: '21', name: 'Moussaka', tags: ['eggplant', 'ground lamb', 'tomatoes', 'cheese', 'milk'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Greek', category: 'vegetable' },
  { id: '22', name: 'Coq au Vin', tags: ['chicken', 'red wine', 'mushrooms', 'bacon', 'onions'], cookingTime: 'long', difficulty: 'hard', cuisine: 'French', category: 'chicken' },

  // American
  { id: '23', name: 'BBQ Ribs', tags: ['pork ribs', 'bbq sauce', 'brown sugar', 'spices'], cookingTime: 'long', difficulty: 'medium', cuisine: 'American', category: 'meat' },
  { id: '24', name: 'Cheeseburger', tags: ['ground beef', 'cheese', 'bread', 'lettuce', 'tomatoes'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'American', category: 'meat' },
  { id: '25', name: 'Mac and Cheese', tags: ['pasta', 'cheese', 'milk', 'butter'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'American', category: 'pasta' },
  { id: '26', name: 'Buffalo Wings', tags: ['chicken wings', 'hot sauce', 'butter', 'celery'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'American', category: 'chicken' },
  { id: '27', name: 'Meatloaf', tags: ['ground beef', 'breadcrumbs', 'eggs', 'onions', 'ketchup'], cookingTime: 'long', difficulty: 'easy', cuisine: 'American', category: 'meat' },

  // Vegetarian/Vegan
  { id: '28', name: 'Vegetable Stir Fry', tags: ['vegetables', 'soy sauce', 'garlic', 'ginger', 'oil'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Asian', category: 'vegetable' },
  { id: '29', name: 'Caprese Salad', tags: ['tomatoes', 'mozzarella', 'basil', 'olive oil', 'balsamic'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Italian', category: 'salad' },
  { id: '30', name: 'Vegetable Curry', tags: ['vegetables', 'curry powder', 'coconut milk', 'onions', 'garlic'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Indian', category: 'vegetable' },
  { id: '31', name: 'Quinoa Salad', tags: ['quinoa', 'vegetables', 'olive oil', 'lemon', 'herbs'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Mediterranean', category: 'salad' },
  { id: '32', name: 'Mushroom Stroganoff', tags: ['mushrooms', 'cream', 'onions', 'pasta', 'herbs'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Russian', category: 'vegetable' },
  { id: '33', name: 'Ratatouille', tags: ['eggplant', 'zucchini', 'tomatoes', 'bell peppers', 'herbs'], cookingTime: 'long', difficulty: 'medium', cuisine: 'French', category: 'vegetable' },
  { id: '34', name: 'Stuffed Bell Peppers', tags: ['bell peppers', 'rice', 'onions', 'tomatoes', 'cheese'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Mediterranean', category: 'vegetable' },

  // Seafood
  { id: '35', name: 'Grilled Salmon', tags: ['salmon', 'lemon', 'herbs', 'olive oil'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'International', category: 'fish' },
  { id: '36', name: 'Shrimp Scampi', tags: ['shrimp', 'garlic', 'white wine', 'butter', 'pasta'], cookingTime: 'quick', difficulty: 'medium', cuisine: 'Italian', category: 'seafood' },
  { id: '37', name: 'Fish Tacos', tags: ['fish', 'tortillas', 'cabbage', 'lime', 'spices'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Mexican', category: 'fish' },
  { id: '38', name: 'Paella de Mariscos', tags: ['rice', 'seafood', 'saffron', 'tomatoes', 'garlic'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Spanish', category: 'seafood' },
  { id: '39', name: 'Lobster Thermidor', tags: ['lobster', 'cream', 'cheese', 'mustard', 'brandy'], cookingTime: 'medium', difficulty: 'hard', cuisine: 'French', category: 'seafood' },
  { id: '40', name: 'Crab Cakes', tags: ['crab', 'breadcrumbs', 'eggs', 'mayonnaise', 'spices'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'American', category: 'seafood' },

  // More dishes for variety
  { id: '41', name: 'Chicken Fajitas', tags: ['chicken', 'bell peppers', 'onions', 'tortillas', 'spices'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Mexican', category: 'chicken' },
  { id: '42', name: 'Beef Stew', tags: ['beef', 'potatoes', 'carrots', 'onions', 'broth'], cookingTime: 'long', difficulty: 'medium', cuisine: 'American', category: 'meat' },
  { id: '43', name: 'Chicken Alfredo', tags: ['chicken', 'pasta', 'cream', 'parmesan', 'garlic'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Italian', category: 'pasta' },
  { id: '44', name: 'Pork Chops', tags: ['pork', 'herbs', 'garlic', 'oil'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'American', category: 'meat' },
  { id: '45', name: 'Chicken Caesar Salad', tags: ['chicken', 'lettuce', 'parmesan', 'croutons', 'caesar dressing'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'American', category: 'salad' },
  { id: '46', name: 'Beef Tacos', tags: ['ground beef', 'tortillas', 'cheese', 'lettuce', 'tomatoes'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Mexican', category: 'meat' },
  { id: '47', name: 'Chicken Curry', tags: ['chicken', 'curry powder', 'coconut milk', 'onions', 'rice'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Indian', category: 'chicken' },
  { id: '48', name: 'Baked Cod', tags: ['cod', 'lemon', 'herbs', 'breadcrumbs'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'International', category: 'fish' },
  { id: '49', name: 'Turkey Meatballs', tags: ['ground turkey', 'breadcrumbs', 'eggs', 'herbs', 'tomato sauce'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Italian', category: 'meat' },
  { id: '50', name: 'Vegetable Lasagna', tags: ['pasta', 'vegetables', 'cheese', 'tomato sauce'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Italian', category: 'vegetable' },
];

export const getAllIngredients = (): string[] => {
  const ingredients = new Set<string>();
  dinnerDishes.forEach(dish => {
    dish.tags.forEach(tag => ingredients.add(tag));
  });
  return Array.from(ingredients).sort();
};

export const filterDishesByIngredients = (selectedIngredients: string[]): Dish[] => {
  if (selectedIngredients.length === 0) return dinnerDishes;
  
  return dinnerDishes.filter(dish => 
    selectedIngredients.every(ingredient => 
      dish.tags.some(tag => tag.toLowerCase().includes(ingredient.toLowerCase()))
    )
  );
};

export const getDishOfTheDay = (): Dish => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % dinnerDishes.length;
  return dinnerDishes[index];
};