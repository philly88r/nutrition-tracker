# Nutrition Tracker App

A React-based nutrition tracking application that uses the USDA FoodData Central API for accurate nutritional information.

## Features

- **USDA FoodData Central Integration**: Access comprehensive nutritional data from the USDA database
- **Food Diary**: Log your daily food intake by meal type
- **Nutrition Dashboard**: View daily macronutrient and calorie summaries
- **Micronutrient Tracking**: Monitor essential vitamins and minerals
- **Reports**: Visualize your nutrition trends over time
- **Saved Foods**: Save frequently used foods for quick access

## Technical Details

- Built with React and Vite
- Styled with Tailwind CSS
- Uses localStorage for data persistence
- Responsive design for mobile and desktop

## USDA API Integration

This application exclusively uses the USDA FoodData Central API for nutrition data. The API provides accurate, comprehensive nutritional information for thousands of foods.

### API Key

The application uses a public API key for the USDA FoodData Central API. This key is included in the `usdaApiService.js` file.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Data Storage

The application stores the following data in localStorage:
- Food log entries
- Saved foods from the USDA database
- User settings and preferences

## Future Improvements

- User authentication and cloud storage
- Barcode scanning for food entry
- Meal planning features
- Recipe analysis
