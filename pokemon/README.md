# Assessment: Advanced React Native PokéDex (60 Minutes)

## Overview
Build a performant Pokémon browser application using React Native's advanced features. You'll implement a modern UI that showcases efficient list rendering, animations, and React's latest patterns.

## Time Allocation
You have 60 minutes to complete this assessment.

## API Reference
This assessment uses the free PokéAPI:
- Pokémon list: `https://pokeapi.co/api/v2/pokemon?limit=20&offset=0`
- Pokémon details: `https://pokeapi.co/api/v2/pokemon/{id or name}`

## Requirements

### Task 1: Set Up the Project Structure
- Initialize a new React Native project using Expo
- Set up the necessary component structure
- Install required dependencies

### Task 2: Implement the PokéDex Screen
- Display a list of Pokémon using `FlatList` with the following optimizations:
  - Implement `windowSize` and `maxToRenderPerBatch` optimizations
  - Use proper `key` handling
  - Implement `removeClippedSubviews` to improve memory usage
  - Use appropriate `ListHeaderComponent` and `ListFooterComponent`
  - Implement `ItemSeparatorComponent`

- Each list item should include:
  - Pokémon name
  - Pokémon image (sprite)
  - Pokémon number
  - At least one type badge with appropriate color
  
- Features to implement:
  - Use the `Pressable` component with proper pressed state visual feedback
  - When pressing a Pokémon, show a detailed modal with additional information
  - Implement proper list pagination with a loading indicator at the bottom

### Task 3: Implement the Detail Modal
- Create a modal that shows when a Pokémon is selected
- The modal should include:
  - Larger image
  - Stats with visualizations (using React Animated)
  - Type information
  - Basic physical information (height, weight)
  - A close button with proper touch feedback

### Task 4: Implement Advanced Features (choose at least 2)
- Use `React.memo` to optimize re-renders
- Implement skeleton loading using `MaskedView` or similar approach
- Add a search filter at the top of the list using `debounce`
- Create a smooth shared element transition for the image between list and modal
- Use the latest React Native features like `Reanimated 2` or `Animated` with the new native driver
- Implement swipe to dismiss for the modal
- Add haptic feedback using Expo's Haptics module when interacting with Pokémon

### Task 5: Implement Error Handling and Loading States
- Create a proper loading indicator for the initial data fetch
- Handle API errors gracefully
- Implement retry functionality for failed API calls
- Use React suspense and/or error boundaries if appropriate

## Starting Code
Here's a minimal starting point for your PokéDex component:

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, Pressable, Image, ActivityIndicator } from 'react-native';

export default function PokeDex() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  const fetchPokemon = useCallback(async () => {
    // Implement API call to fetch pokemon
  }, [offset]);

  const loadMore = () => {
    // Implement pagination
  };

  const renderItem = ({ item }) => {
    // Implement render logic for each item
  };

  // Implement additional components and logic here
  
  return (
    <View style={styles.container}>
      <FlatList
        data={pokemon}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        // Add FlatList optimizations here
      />
      
      {/* Implement detail modal here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Add your styles here
});
```

## Evaluation Criteria

1. **Code Quality**: Use of modern React patterns and best practices
2. **Performance Optimization**: Proper use of FlatList optimizations and React.memo
3. **UI/UX**: Smooth animations, transitions, and loading states
4. **Error Handling**: Graceful error management
5. **Advanced Features**: Implementation of the selected advanced features
6. **Component Structure**: Proper component hierarchy and organization

## Submission

Submit a GitHub repository with your code and a brief explanation of:
1. Which advanced features you chose to implement and why
2. Any performance optimizations you added beyond the requirements
3. How your implementation handles edge cases


# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
