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
  { id: '9', name: 'Fettuccine Alfredo', tags: ['pasta', 'cream', 'parmesan', 'butter', 'garlic'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Italian', category: 'pasta' },
  { id: '10', name: 'Minestrone Soup', tags: ['vegetables', 'beans', 'pasta', 'tomatoes', 'herbs'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Italian', category: 'soup' },

  // Asian
  { id: '11', name: 'Beef Teriyaki', tags: ['beef', 'soy sauce', 'sugar', 'ginger', 'garlic'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Japanese', category: 'meat' },
  { id: '12', name: 'Pad Thai', tags: ['noodles', 'shrimp', 'eggs', 'peanuts', 'lime'], cookingTime: 'quick', difficulty: 'medium', cuisine: 'Thai', category: 'noodles' },
  { id: '13', name: 'Sweet and Sour Pork', tags: ['pork', 'pineapple', 'bell peppers', 'vinegar', 'sugar'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Chinese', category: 'meat' },
  { id: '14', name: 'Chicken Tikka Masala', tags: ['chicken', 'yogurt', 'tomatoes', 'cream', 'spices'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Indian', category: 'chicken' },
  { id: '15', name: 'Fried Rice', tags: ['rice', 'eggs', 'vegetables', 'soy sauce', 'garlic'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Chinese', category: 'rice' },
  { id: '16', name: 'Ramen', tags: ['noodles', 'broth', 'eggs', 'pork', 'vegetables'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Japanese', category: 'noodles' },
  { id: '17', name: 'Korean BBQ Beef', tags: ['beef', 'soy sauce', 'garlic', 'sesame oil', 'sugar'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Korean', category: 'meat' },
  { id: '18', name: 'Thai Green Curry', tags: ['curry paste', 'coconut milk', 'chicken', 'vegetables', 'basil'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Thai', category: 'chicken' },
  { id: '19', name: 'Dim Sum', tags: ['dumplings', 'pork', 'shrimp', 'vegetables', 'soy sauce'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Chinese', category: 'appetizer' },
  { id: '20', name: 'Chicken Satay', tags: ['chicken', 'peanut sauce', 'coconut milk', 'spices', 'skewers'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Thai', category: 'chicken' },
  { id: '21', name: 'Miso Soup', tags: ['miso paste', 'tofu', 'seaweed', 'scallions', 'broth'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Japanese', category: 'soup' },
  { id: '22', name: 'Pho Bo', tags: ['beef', 'noodles', 'broth', 'herbs', 'spices'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Vietnamese', category: 'soup' },

  // European
  { id: '23', name: 'Beef Bourguignon', tags: ['beef', 'red wine', 'mushrooms', 'onions', 'carrots'], cookingTime: 'long', difficulty: 'hard', cuisine: 'French', category: 'meat' },
  { id: '24', name: 'Wiener Schnitzel', tags: ['veal', 'breadcrumbs', 'eggs', 'flour', 'lemon'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Austrian', category: 'meat' },
  { id: '25', name: 'Paella', tags: ['rice', 'saffron', 'seafood', 'chicken', 'vegetables'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Spanish', category: 'rice' },
  { id: '26', name: 'Fish and Chips', tags: ['fish', 'potatoes', 'flour', 'beer', 'oil'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'British', category: 'fish' },
  { id: '27', name: 'Moussaka', tags: ['eggplant', 'ground lamb', 'tomatoes', 'cheese', 'milk'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Greek', category: 'vegetable' },
  { id: '28', name: 'Coq au Vin', tags: ['chicken', 'red wine', 'mushrooms', 'bacon', 'onions'], cookingTime: 'long', difficulty: 'hard', cuisine: 'French', category: 'chicken' },
  { id: '29', name: 'Sauerbraten', tags: ['beef', 'vinegar', 'vegetables', 'spices', 'gravy'], cookingTime: 'long', difficulty: 'hard', cuisine: 'German', category: 'meat' },
  { id: '30', name: 'Shepherd\'s Pie', tags: ['ground lamb', 'potatoes', 'vegetables', 'gravy'], cookingTime: 'long', difficulty: 'medium', cuisine: 'British', category: 'meat' },
  { id: '31', name: 'Bouillabaisse', tags: ['fish', 'shellfish', 'tomatoes', 'saffron', 'herbs'], cookingTime: 'long', difficulty: 'hard', cuisine: 'French', category: 'soup' },
  { id: '32', name: 'Goulash', tags: ['beef', 'paprika', 'onions', 'tomatoes', 'potatoes'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Hungarian', category: 'meat' },

  // American
  { id: '33', name: 'BBQ Ribs', tags: ['pork ribs', 'bbq sauce', 'brown sugar', 'spices'], cookingTime: 'long', difficulty: 'medium', cuisine: 'American', category: 'meat' },
  { id: '34', name: 'Cheeseburger', tags: ['ground beef', 'cheese', 'bread', 'lettuce', 'tomatoes'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'American', category: 'meat' },
  { id: '35', name: 'Mac and Cheese', tags: ['pasta', 'cheese', 'milk', 'butter'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'American', category: 'pasta' },
  { id: '36', name: 'Buffalo Wings', tags: ['chicken wings', 'hot sauce', 'butter', 'celery'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'American', category: 'chicken' },
  { id: '37', name: 'Meatloaf', tags: ['ground beef', 'breadcrumbs', 'eggs', 'onions', 'ketchup'], cookingTime: 'long', difficulty: 'easy', cuisine: 'American', category: 'meat' },
  { id: '38', name: 'Clam Chowder', tags: ['clams', 'potatoes', 'cream', 'onions', 'celery'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'American', category: 'soup' },
  { id: '39', name: 'Pulled Pork', tags: ['pork shoulder', 'bbq sauce', 'spices', 'bread'], cookingTime: 'long', difficulty: 'easy', cuisine: 'American', category: 'meat' },
  { id: '40', name: 'Jambalaya', tags: ['rice', 'shrimp', 'sausage', 'chicken', 'vegetables'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'American', category: 'rice' },

  // Vegetarian/Vegan
  { id: '41', name: 'Vegetable Stir Fry', tags: ['vegetables', 'soy sauce', 'garlic', 'ginger', 'oil'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Asian', category: 'vegetable' },
  { id: '42', name: 'Caprese Salad', tags: ['tomatoes', 'mozzarella', 'basil', 'olive oil', 'balsamic'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Italian', category: 'salad' },
  { id: '43', name: 'Vegetable Curry', tags: ['vegetables', 'curry powder', 'coconut milk', 'onions', 'garlic'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Indian', category: 'vegetable' },
  { id: '44', name: 'Quinoa Salad', tags: ['quinoa', 'vegetables', 'olive oil', 'lemon', 'herbs'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Mediterranean', category: 'salad' },
  { id: '45', name: 'Mushroom Stroganoff', tags: ['mushrooms', 'cream', 'onions', 'pasta', 'herbs'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Russian', category: 'vegetable' },
  { id: '46', name: 'Ratatouille', tags: ['eggplant', 'zucchini', 'tomatoes', 'bell peppers', 'herbs'], cookingTime: 'long', difficulty: 'medium', cuisine: 'French', category: 'vegetable' },
  { id: '47', name: 'Stuffed Bell Peppers', tags: ['bell peppers', 'rice', 'onions', 'tomatoes', 'cheese'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Mediterranean', category: 'vegetable' },
  { id: '48', name: 'Buddha Bowl', tags: ['quinoa', 'vegetables', 'avocado', 'tahini', 'seeds'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'International', category: 'salad' },
  { id: '49', name: 'Falafel', tags: ['chickpeas', 'herbs', 'spices', 'tahini', 'vegetables'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Mediterranean', category: 'vegetable' },
  { id: '50', name: 'Vegetable Lasagna', tags: ['pasta', 'vegetables', 'cheese', 'tomato sauce'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Italian', category: 'vegetable' },

  // Seafood
  { id: '51', name: 'Grilled Salmon', tags: ['salmon', 'lemon', 'herbs', 'olive oil'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'International', category: 'fish' },
  { id: '52', name: 'Shrimp Scampi', tags: ['shrimp', 'garlic', 'white wine', 'butter', 'pasta'], cookingTime: 'quick', difficulty: 'medium', cuisine: 'Italian', category: 'seafood' },
  { id: '53', name: 'Fish Tacos', tags: ['fish', 'tortillas', 'cabbage', 'lime', 'spices'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Mexican', category: 'fish' },
  { id: '54', name: 'Paella de Mariscos', tags: ['rice', 'seafood', 'saffron', 'tomatoes', 'garlic'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Spanish', category: 'seafood' },
  { id: '55', name: 'Lobster Thermidor', tags: ['lobster', 'cream', 'cheese', 'mustard', 'brandy'], cookingTime: 'medium', difficulty: 'hard', cuisine: 'French', category: 'seafood' },
  { id: '56', name: 'Crab Cakes', tags: ['crab', 'breadcrumbs', 'eggs', 'mayonnaise', 'spices'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'American', category: 'seafood' },
  { id: '57', name: 'Cioppino', tags: ['fish', 'shellfish', 'tomatoes', 'wine', 'herbs'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Italian', category: 'soup' },
  { id: '58', name: 'Seafood Risotto', tags: ['rice', 'seafood', 'white wine', 'parmesan', 'herbs'], cookingTime: 'medium', difficulty: 'hard', cuisine: 'Italian', category: 'rice' },

  // Mexican/Latin American
  { id: '59', name: 'Chicken Fajitas', tags: ['chicken', 'bell peppers', 'onions', 'tortillas', 'spices'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Mexican', category: 'chicken' },
  { id: '60', name: 'Beef Tacos', tags: ['ground beef', 'tortillas', 'cheese', 'lettuce', 'tomatoes'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Mexican', category: 'meat' },
  { id: '61', name: 'Chicken Enchiladas', tags: ['chicken', 'tortillas', 'cheese', 'enchilada sauce', 'onions'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Mexican', category: 'chicken' },
  { id: '62', name: 'Chiles Rellenos', tags: ['poblano peppers', 'cheese', 'eggs', 'flour', 'tomato sauce'], cookingTime: 'medium', difficulty: 'hard', cuisine: 'Mexican', category: 'vegetable' },
  { id: '63', name: 'Ceviche', tags: ['fish', 'lime', 'onions', 'cilantro', 'peppers'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Peruvian', category: 'fish' },
  { id: '64', name: 'Empanadas', tags: ['dough', 'meat', 'vegetables', 'cheese', 'spices'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Argentine', category: 'appetizer' },

  // More International Dishes
  { id: '65', name: 'Chicken Curry', tags: ['chicken', 'curry powder', 'coconut milk', 'onions', 'rice'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Indian', category: 'chicken' },
  { id: '66', name: 'Beef Stew', tags: ['beef', 'potatoes', 'carrots', 'onions', 'broth'], cookingTime: 'long', difficulty: 'medium', cuisine: 'American', category: 'meat' },
  { id: '67', name: 'Chicken Alfredo', tags: ['chicken', 'pasta', 'cream', 'parmesan', 'garlic'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Italian', category: 'pasta' },
  { id: '68', name: 'Pork Chops', tags: ['pork', 'herbs', 'garlic', 'oil'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'American', category: 'meat' },
  { id: '69', name: 'Chicken Caesar Salad', tags: ['chicken', 'lettuce', 'parmesan', 'croutons', 'caesar dressing'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'American', category: 'salad' },
  { id: '70', name: 'Baked Cod', tags: ['cod', 'lemon', 'herbs', 'breadcrumbs'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'International', category: 'fish' },
  { id: '71', name: 'Turkey Meatballs', tags: ['ground turkey', 'breadcrumbs', 'eggs', 'herbs', 'tomato sauce'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Italian', category: 'meat' },
  { id: '72', name: 'Greek Salad', tags: ['tomatoes', 'cucumbers', 'olives', 'feta cheese', 'olive oil'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Greek', category: 'salad' },
  { id: '73', name: 'Moroccan Tagine', tags: ['lamb', 'vegetables', 'dried fruits', 'spices', 'couscous'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Moroccan', category: 'meat' },
  { id: '74', name: 'Turkish Kebab', tags: ['lamb', 'yogurt', 'spices', 'vegetables', 'pita'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Turkish', category: 'meat' },
  { id: '75', name: 'Brazilian Feijoada', tags: ['black beans', 'pork', 'sausage', 'rice', 'vegetables'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Brazilian', category: 'meat' },
  
  // More Italian
  { id: '76', name: 'Pasta Puttanesca', tags: ['pasta', 'tomatoes', 'olives', 'capers', 'anchovies', 'garlic'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Italian', category: 'pasta' },
  { id: '77', name: 'Saltimbocca', tags: ['veal', 'prosciutto', 'sage', 'white wine', 'butter'], cookingTime: 'quick', difficulty: 'medium', cuisine: 'Italian', category: 'meat' },
  { id: '78', name: 'Pasta Amatriciana', tags: ['pasta', 'bacon', 'tomatoes', 'onions', 'pecorino'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Italian', category: 'pasta' },
  { id: '79', name: 'Polenta with Mushrooms', tags: ['polenta', 'mushrooms', 'parmesan', 'butter', 'herbs'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Italian', category: 'vegetable' },
  { id: '80', name: 'Vitello Tonnato', tags: ['veal', 'tuna', 'capers', 'anchovies', 'mayonnaise'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Italian', category: 'meat' },
  { id: '81', name: 'Ribollita', tags: ['bread', 'beans', 'vegetables', 'tomatoes', 'herbs'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Italian', category: 'soup' },
  { id: '82', name: 'Pasta e Fagioli', tags: ['pasta', 'beans', 'tomatoes', 'vegetables', 'bacon'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Italian', category: 'soup' },
  { id: '83', name: 'Bruschetta', tags: ['bread', 'tomatoes', 'garlic', 'basil', 'olive oil'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Italian', category: 'appetizer' },
  { id: '84', name: 'Tiramisu', tags: ['mascarpone', 'coffee', 'eggs', 'ladyfingers', 'cocoa'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Italian', category: 'dessert' },

  // More Asian
  { id: '85', name: 'Bibimbap', tags: ['rice', 'beef', 'vegetables', 'egg', 'gochujang'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Korean', category: 'rice' },
  { id: '86', name: 'Tandoori Chicken', tags: ['chicken', 'yogurt', 'spices', 'lemon', 'garlic'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Indian', category: 'chicken' },
  { id: '87', name: 'Chicken Biryani', tags: ['chicken', 'rice', 'spices', 'yogurt', 'saffron'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Indian', category: 'rice' },
  { id: '88', name: 'Massaman Curry', tags: ['beef', 'coconut milk', 'peanuts', 'potatoes', 'curry paste'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Thai', category: 'meat' },
  { id: '89', name: 'Tom Yum Soup', tags: ['shrimp', 'lemongrass', 'lime', 'chili', 'mushrooms'], cookingTime: 'quick', difficulty: 'medium', cuisine: 'Thai', category: 'soup' },
  { id: '90', name: 'Kung Pao Chicken', tags: ['chicken', 'peanuts', 'chili', 'soy sauce', 'vegetables'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Chinese', category: 'chicken' },
  { id: '91', name: 'Mapo Tofu', tags: ['tofu', 'ground pork', 'chili', 'garlic', 'soy sauce'], cookingTime: 'quick', difficulty: 'medium', cuisine: 'Chinese', category: 'vegetable' },
  { id: '92', name: 'Spring Rolls', tags: ['rice paper', 'shrimp', 'vegetables', 'noodles', 'herbs'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Vietnamese', category: 'appetizer' },
  { id: '93', name: 'Sushi Rolls', tags: ['rice', 'fish', 'nori', 'vegetables', 'wasabi'], cookingTime: 'medium', difficulty: 'hard', cuisine: 'Japanese', category: 'fish' },
  { id: '94', name: 'Tonkatsu', tags: ['pork', 'breadcrumbs', 'eggs', 'cabbage', 'rice'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Japanese', category: 'meat' },
  { id: '95', name: 'Yakitori', tags: ['chicken', 'soy sauce', 'sake', 'sugar', 'skewers'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Japanese', category: 'chicken' },
  { id: '96', name: 'Udon Noodles', tags: ['udon', 'broth', 'vegetables', 'tempura', 'soy sauce'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Japanese', category: 'noodles' },
  { id: '97', name: 'Peking Duck', tags: ['duck', 'pancakes', 'cucumber', 'scallions', 'hoisin sauce'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Chinese', category: 'meat' },
  { id: '98', name: 'Laksa', tags: ['noodles', 'coconut milk', 'seafood', 'curry paste', 'herbs'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Malaysian', category: 'soup' },
  { id: '99', name: 'Nasi Goreng', tags: ['rice', 'shrimp', 'eggs', 'vegetables', 'soy sauce'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Indonesian', category: 'rice' },

  // More European
  { id: '100', name: 'Schnitzel with Spätzle', tags: ['pork', 'breadcrumbs', 'egg noodles', 'gravy'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'German', category: 'meat' },
  { id: '101', name: 'Fondue', tags: ['cheese', 'white wine', 'bread', 'garlic'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Swiss', category: 'appetizer' },
  { id: '102', name: 'Rösti', tags: ['potatoes', 'butter', 'onions'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Swiss', category: 'vegetable' },
  { id: '103', name: 'Swedish Meatballs', tags: ['ground beef', 'cream', 'lingonberries', 'breadcrumbs'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Swedish', category: 'meat' },
  { id: '104', name: 'Pierogi', tags: ['dough', 'potatoes', 'cheese', 'onions', 'sour cream'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Polish', category: 'vegetable' },
  { id: '105', name: 'Borscht', tags: ['beets', 'cabbage', 'potatoes', 'beef', 'sour cream'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Russian', category: 'soup' },
  { id: '106', name: 'Beef Wellington', tags: ['beef', 'puff pastry', 'mushrooms', 'pâté'], cookingTime: 'long', difficulty: 'hard', cuisine: 'British', category: 'meat' },
  { id: '107', name: 'Cottage Pie', tags: ['ground beef', 'potatoes', 'vegetables', 'gravy'], cookingTime: 'long', difficulty: 'medium', cuisine: 'British', category: 'meat' },
  { id: '108', name: 'Quiche Lorraine', tags: ['eggs', 'cream', 'bacon', 'cheese', 'pastry'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'French', category: 'eggs' },
  { id: '109', name: 'Ratatouille Nicoise', tags: ['eggplant', 'zucchini', 'tomatoes', 'bell peppers', 'olive oil'], cookingTime: 'long', difficulty: 'medium', cuisine: 'French', category: 'vegetable' },
  { id: '110', name: 'Duck Confit', tags: ['duck', 'duck fat', 'herbs', 'garlic'], cookingTime: 'long', difficulty: 'hard', cuisine: 'French', category: 'meat' },
  { id: '111', name: 'Cassoulet', tags: ['white beans', 'duck', 'sausage', 'pork', 'tomatoes'], cookingTime: 'long', difficulty: 'hard', cuisine: 'French', category: 'meat' },
  { id: '112', name: 'Spanish Tortilla', tags: ['eggs', 'potatoes', 'onions', 'olive oil'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Spanish', category: 'eggs' },
  { id: '113', name: 'Gazpacho', tags: ['tomatoes', 'cucumber', 'bell peppers', 'garlic', 'olive oil'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Spanish', category: 'soup' },
  { id: '114', name: 'Patatas Bravas', tags: ['potatoes', 'paprika', 'garlic', 'tomato sauce'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Spanish', category: 'vegetable' },
  { id: '115', name: 'Souvlaki', tags: ['pork', 'lemon', 'oregano', 'pita', 'tzatziki'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Greek', category: 'meat' },
  { id: '116', name: 'Spanakopita', tags: ['spinach', 'feta cheese', 'phyllo dough', 'eggs', 'herbs'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Greek', category: 'vegetable' },

  // More American
  { id: '117', name: 'Fried Chicken', tags: ['chicken', 'flour', 'buttermilk', 'spices'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'American', category: 'chicken' },
  { id: '118', name: 'Biscuits and Gravy', tags: ['flour', 'buttermilk', 'sausage', 'milk', 'butter'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'American', category: 'breakfast' },
  { id: '119', name: 'Chicken and Waffles', tags: ['chicken', 'flour', 'eggs', 'milk', 'syrup'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'American', category: 'chicken' },
  { id: '120', name: 'Lobster Roll', tags: ['lobster', 'mayonnaise', 'celery', 'bread', 'lemon'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'American', category: 'seafood' },
  { id: '121', name: 'Philly Cheesesteak', tags: ['beef', 'cheese', 'onions', 'bell peppers', 'bread'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'American', category: 'meat' },
  { id: '122', name: 'Gumbo', tags: ['chicken', 'sausage', 'shrimp', 'okra', 'rice'], cookingTime: 'long', difficulty: 'hard', cuisine: 'American', category: 'soup' },
  { id: '123', name: 'Corn Chowder', tags: ['corn', 'potatoes', 'cream', 'bacon', 'onions'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'American', category: 'soup' },
  { id: '124', name: 'Pot Roast', tags: ['beef', 'potatoes', 'carrots', 'onions', 'broth'], cookingTime: 'long', difficulty: 'easy', cuisine: 'American', category: 'meat' },

  // More Mexican/Latin
  { id: '125', name: 'Quesadillas', tags: ['tortillas', 'cheese', 'chicken', 'bell peppers', 'onions'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Mexican', category: 'chicken' },
  { id: '126', name: 'Carnitas', tags: ['pork', 'orange', 'garlic', 'cumin', 'tortillas'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Mexican', category: 'meat' },
  { id: '127', name: 'Mole Poblano', tags: ['chicken', 'chocolate', 'chili', 'spices', 'nuts'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Mexican', category: 'chicken' },
  { id: '128', name: 'Tamales', tags: ['masa', 'pork', 'chili', 'corn husks'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Mexican', category: 'appetizer' },
  { id: '129', name: 'Pozole', tags: ['hominy', 'pork', 'chili', 'cabbage', 'radishes'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Mexican', category: 'soup' },
  { id: '130', name: 'Arroz con Pollo', tags: ['chicken', 'rice', 'vegetables', 'saffron', 'tomatoes'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Latin American', category: 'chicken' },
  { id: '131', name: 'Picadillo', tags: ['ground beef', 'potatoes', 'olives', 'raisins', 'tomatoes'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Cuban', category: 'meat' },
  { id: '132', name: 'Ropa Vieja', tags: ['beef', 'bell peppers', 'tomatoes', 'onions', 'olives'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Cuban', category: 'meat' },
  { id: '133', name: 'Lomo Saltado', tags: ['beef', 'potatoes', 'tomatoes', 'onions', 'soy sauce'], cookingTime: 'quick', difficulty: 'medium', cuisine: 'Peruvian', category: 'meat' },
  { id: '134', name: 'Arepas', tags: ['corn flour', 'cheese', 'beans', 'avocado'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Venezuelan', category: 'vegetable' },

  // More Vegetarian/Vegan
  { id: '135', name: 'Lentil Soup', tags: ['lentils', 'vegetables', 'tomatoes', 'herbs', 'broth'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Mediterranean', category: 'soup' },
  { id: '136', name: 'Chickpea Curry', tags: ['chickpeas', 'curry powder', 'coconut milk', 'tomatoes', 'spinach'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Indian', category: 'vegetable' },
  { id: '137', name: 'Vegetable Paella', tags: ['rice', 'vegetables', 'saffron', 'bell peppers', 'peas'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Spanish', category: 'rice' },
  { id: '138', name: 'Eggplant Parmesan', tags: ['eggplant', 'tomato sauce', 'mozzarella', 'parmesan', 'basil'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Italian', category: 'vegetable' },
  { id: '139', name: 'Tofu Scramble', tags: ['tofu', 'vegetables', 'turmeric', 'nutritional yeast', 'spices'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Vegan', category: 'vegetable' },
  { id: '140', name: 'Black Bean Burgers', tags: ['black beans', 'breadcrumbs', 'onions', 'spices', 'bread'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'American', category: 'vegetable' },
  { id: '141', name: 'Vegetable Tempura', tags: ['vegetables', 'flour', 'ice water', 'soy sauce'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Japanese', category: 'vegetable' },
  { id: '142', name: 'Hummus Bowl', tags: ['chickpeas', 'tahini', 'vegetables', 'pita', 'olive oil'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Mediterranean', category: 'vegetable' },
  { id: '143', name: 'Shakshuka', tags: ['eggs', 'tomatoes', 'bell peppers', 'onions', 'spices'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Middle Eastern', category: 'eggs' },
  { id: '144', name: 'Mushroom Risotto', tags: ['rice', 'mushrooms', 'parmesan', 'white wine', 'butter'], cookingTime: 'medium', difficulty: 'hard', cuisine: 'Italian', category: 'rice' },
  { id: '145', name: 'Vegetable Spring Rolls', tags: ['rice paper', 'vegetables', 'noodles', 'herbs', 'peanut sauce'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Vietnamese', category: 'appetizer' },

  // More Seafood
  { id: '146', name: 'Mussels in White Wine', tags: ['mussels', 'white wine', 'garlic', 'butter', 'parsley'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'French', category: 'seafood' },
  { id: '147', name: 'Tuna Poke Bowl', tags: ['tuna', 'rice', 'avocado', 'soy sauce', 'sesame'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Hawaiian', category: 'fish' },
  { id: '148', name: 'Fish and Chips', tags: ['fish', 'potatoes', 'flour', 'beer', 'tartar sauce'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'British', category: 'fish' },
  { id: '149', name: 'Coconut Shrimp', tags: ['shrimp', 'coconut', 'breadcrumbs', 'sweet chili sauce'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Asian', category: 'seafood' },
  { id: '150', name: 'Calamari Fritti', tags: ['squid', 'flour', 'lemon', 'marinara sauce'], cookingTime: 'quick', difficulty: 'medium', cuisine: 'Italian', category: 'seafood' },
  { id: '151', name: 'Seafood Pasta', tags: ['pasta', 'shrimp', 'mussels', 'white wine', 'tomatoes'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Italian', category: 'seafood' },
  { id: '152', name: 'Blackened Fish', tags: ['fish', 'cajun spices', 'butter', 'lemon'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'American', category: 'fish' },
  { id: '153', name: 'Oysters Rockefeller', tags: ['oysters', 'spinach', 'butter', 'breadcrumbs', 'herbs'], cookingTime: 'medium', difficulty: 'hard', cuisine: 'American', category: 'seafood' },

  // More International
  { id: '154', name: 'Chicken Shawarma', tags: ['chicken', 'pita', 'tahini', 'vegetables', 'spices'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Middle Eastern', category: 'chicken' },
  { id: '155', name: 'Lamb Gyros', tags: ['lamb', 'pita', 'tzatziki', 'tomatoes', 'onions'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Greek', category: 'meat' },
  { id: '156', name: 'Ethiopian Doro Wat', tags: ['chicken', 'berbere spice', 'onions', 'eggs', 'injera'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Ethiopian', category: 'chicken' },
  { id: '157', name: 'Bobotie', tags: ['ground beef', 'curry powder', 'dried fruits', 'eggs', 'bread'], cookingTime: 'long', difficulty: 'medium', cuisine: 'South African', category: 'meat' },
  { id: '158', name: 'Bunny Chow', tags: ['bread', 'curry', 'potatoes', 'vegetables'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'South African', category: 'vegetable' },
  { id: '159', name: 'Jollof Rice', tags: ['rice', 'tomatoes', 'onions', 'bell peppers', 'spices'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'West African', category: 'rice' },
  { id: '160', name: 'Suya', tags: ['beef', 'peanuts', 'spices', 'onions', 'tomatoes'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Nigerian', category: 'meat' },
  { id: '161', name: 'Rendang', tags: ['beef', 'coconut milk', 'lemongrass', 'spices'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Indonesian', category: 'meat' },
  { id: '162', name: 'Kofta', tags: ['ground lamb', 'onions', 'herbs', 'spices', 'yogurt'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Middle Eastern', category: 'meat' },
  { id: '163', name: 'Baba Ganoush Bowl', tags: ['eggplant', 'tahini', 'garlic', 'lemon', 'pita'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Middle Eastern', category: 'vegetable' },
  { id: '164', name: 'Chicken Katsu Curry', tags: ['chicken', 'breadcrumbs', 'curry sauce', 'rice', 'vegetables'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Japanese', category: 'chicken' },
  { id: '165', name: 'Okonomiyaki', tags: ['cabbage', 'flour', 'eggs', 'pork', 'sauces'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Japanese', category: 'vegetable' },
  { id: '166', name: 'Banh Mi', tags: ['bread', 'pork', 'pickled vegetables', 'cilantro', 'mayonnaise'], cookingTime: 'quick', difficulty: 'easy', cuisine: 'Vietnamese', category: 'meat' },
  { id: '167', name: 'Samosas', tags: ['dough', 'potatoes', 'peas', 'spices', 'chutney'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Indian', category: 'appetizer' },
  { id: '168', name: 'Pakoras', tags: ['vegetables', 'chickpea flour', 'spices', 'chutney'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Indian', category: 'appetizer' },
  { id: '169', name: 'Aloo Gobi', tags: ['potatoes', 'cauliflower', 'tomatoes', 'spices', 'herbs'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Indian', category: 'vegetable' },
  { id: '170', name: 'Saag Paneer', tags: ['spinach', 'paneer', 'cream', 'spices', 'garlic'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Indian', category: 'vegetable' },
  { id: '171', name: 'Naan Bread', tags: ['flour', 'yogurt', 'yeast', 'butter', 'garlic'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Indian', category: 'bread' },
  { id: '172', name: 'Chicken Vindaloo', tags: ['chicken', 'vinegar', 'chili', 'spices', 'potatoes'], cookingTime: 'long', difficulty: 'hard', cuisine: 'Indian', category: 'chicken' },
  { id: '173', name: 'Butter Chicken', tags: ['chicken', 'butter', 'tomatoes', 'cream', 'spices'], cookingTime: 'medium', difficulty: 'medium', cuisine: 'Indian', category: 'chicken' },
  { id: '174', name: 'Chana Masala', tags: ['chickpeas', 'tomatoes', 'onions', 'spices', 'herbs'], cookingTime: 'medium', difficulty: 'easy', cuisine: 'Indian', category: 'vegetable' },
  { id: '175', name: 'Dal Makhani', tags: ['lentils', 'kidney beans', 'cream', 'butter', 'spices'], cookingTime: 'long', difficulty: 'medium', cuisine: 'Indian', category: 'vegetable' },
];

export const getAllIngredients = (): string[] => {
  const ingredients = new Set<string>();
  dinnerDishes.forEach(dish => {
    dish.tags.forEach(tag => ingredients.add(tag));
  });
  return Array.from(ingredients).sort();
};

export const filterDishesByIngredients = (selectedIngredients: string[], allDishes?: Dish[]): Dish[] => {
  const dishes = allDishes || dinnerDishes;
  if (selectedIngredients.length === 0) return dishes;
  
  return dishes.filter(dish => 
    selectedIngredients.every(ingredient => 
      dish.tags.some(tag => tag.toLowerCase().includes(ingredient.toLowerCase()))
    )
  );
};



export const convertUserDishToDish = (userDish: any): Dish => {
  return {
    id: userDish.id,
    name: userDish.name,
    tags: userDish.tags,
    cookingTime: userDish.cooking_time,
    difficulty: userDish.difficulty,
    cuisine: userDish.cuisine,
    category: userDish.category,
  };
};

export type Season = 'winter' | 'spring' | 'summer' | 'fall';

export const getCurrentSeason = (): Season => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

// Seasonal ingredient mappings
const seasonalIngredients: Record<Season, string[]> = {
  winter: ['cabbage', 'potatoes', 'carrots', 'onions', 'beef', 'pork', 'cheese', 'cream', 'beans', 'mushrooms'],
  spring: ['asparagus', 'herbs', 'eggs', 'chicken', 'lamb', 'peas', 'spinach', 'lettuce', 'radish'],
  summer: ['tomatoes', 'zucchini', 'bell peppers', 'cucumber', 'basil', 'shrimp', 'fish', 'lime', 'avocado', 'corn'],
  fall: ['pumpkin', 'squash', 'apples', 'mushrooms', 'game', 'nuts', 'cinnamon', 'ginger', 'root vegetables']
};

export const getSeasonalDishes = (season: Season): Dish[] => {
  const ingredients = seasonalIngredients[season];
  return dinnerDishes.filter(dish => 
    dish.tags.some(tag => 
      ingredients.some(ingredient => 
        tag.toLowerCase().includes(ingredient.toLowerCase())
      )
    )
  );
};