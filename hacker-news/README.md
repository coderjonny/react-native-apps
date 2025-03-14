# Assessment: Single-Screen Hacker News App (60 Minutes)

## Overview
Build a single-screen React Native application that fetches and displays stories from the Hacker News API with pagination support. You'll implement state management using React's Context API.

## Time Allocation
You have 60 minutes to complete this assessment.

## Requirements

### Task 1: Set Up the Project Structure
- Initialize a new React Native project using Expo
- Create a single screen that will display a paginated list of Hacker News stories
- Set up the necessary component structure

### Task 2: Implement the Context Provider API
- Create a HackerNewsContext to manage the application state
- The Context should manage:
  - Current stories list
  - Loading states
  - Pagination state (current page, items per page)
  - Error states
- Implement the following methods in your Context:
  - `fetchStories`: Fetch a batch of stories from the Hacker News API
  - `loadMoreStories`: Load the next batch of stories (pagination)
  - `refreshStories`: Refresh the story list
  - `getStoryDetails`: Fetch additional details for a story if needed

### Task 3: Implement the Story List Screen
- Display a list of stories from the Hacker News API (`/v0/topstories.json`)
- Each list item should display:
  - Story title
  - Points/score
  - Author (username)
  - Relative time of submission (e.g., "2 hours ago")
  - Number of comments
- Implement pagination using a "Load More" button or infinite scrolling
- Show loading indicators for:
  - Initial load
  - Pagination loading
  - Refresh actions
- Handle error states appropriately with error messages and retry options

### Task 4: Implement UI Enhancements and Interactions
- Add pull-to-refresh functionality to refresh the story list
- Display a loading indicator at the bottom of the list when loading more stories
- Add a button or gesture to open the story URL in an external browser
- Implement basic story filtering or sorting (e.g., by score, date, or title)
- Make the app visually appealing with consistent styling

## API Reference

The Hacker News API endpoints you'll need:

- Top stories list: `https://hacker-news.firebaseio.com/v0/topstories.json`
- New stories list: `https://hacker-news.firebaseio.com/v0/newstories.json` (optional, for filtering)
- Story item: `https://hacker-news.firebaseio.com/v0/item/{id}.json`

## Pagination Implementation Notes

Since the Hacker News API doesn't directly support pagination, you'll need to:
1. Fetch the complete list of story IDs first (e.g., top stories)
2. Implement client-side pagination by:
   - Slicing the array of IDs based on the current page and items per page
   - Fetching details only for the current batch of stories
   - Managing the pagination state in your Context

## Example Context Implementation (Starting Point)

```javascript
import React, { createContext, useState, useContext } from 'react';

const HackerNewsContext = createContext();

export const HackerNewsProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [storyIds, setStoryIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  // Implement these methods:
  const fetchStories = async () => {
    // Fetch story IDs and then the first batch of stories
    // Your code here
  };

  const loadMoreStories = async () => {
    // Load the next batch of stories using pagination
    // Your code here
  };

  const refreshStories = async () => {
    // Refresh the story list
    // Your code here
  };

  const getStoryDetails = async (id) => {
    // Fetch details for a specific story
    // Your code here
  };

  return (
    <HackerNewsContext.Provider
      value={{
        stories,
        loading,
        refreshing,
        loadingMore,
        error,
        hasMore,
        fetchStories,
        loadMoreStories,
        refreshStories,
        getStoryDetails,
      }}
    >
      {children}
    </HackerNewsContext.Provider>
  );
};

export const useHackerNews = () => useContext(HackerNewsContext);
```

## Evaluation Criteria

Your submission will be evaluated based on:
1. **Functionality**: Does the app work as specified with proper pagination?
2. **Context Implementation**: Is the Context API implemented correctly and used effectively?
3. **Code Quality**: Is the code well-structured, clean, and maintainable?
4. **Error Handling**: Does the app handle errors gracefully?
5. **UI/UX**: Is the app visually appealing and user-friendly?
6. **Performance**: Does the app handle pagination efficiently?

## Submission

Please submit:
1. A GitHub repository with your code
2. Instructions for running your application
3. A brief explanation of your pagination implementation approach




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
