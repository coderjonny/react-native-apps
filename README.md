# React Native Assessments

This repository contains coding assessments for React Native developers using the Hacker News API or some other APIs. The assessments test a developer's ability to create React Native applications with proper state management, API integration, and user experience.

## Repository Structure

```
├── hacker-news-task/
│   └── blank assessment
├── hacker-news-task-solution/
│   └── solution to assessment
├── shopping-cart
│   └── blank assessment
└── README.md (this file)
```

## Assessments

This repository contains assessment options:

### 60-Minute Assessment

A condensed assessment that focuses on the core skills:
- Setting up a React Native project with navigation
- Implementing Context API for state management
- Fetching and displaying data from the Hacker News API
- Building two screens (Home and Story Detail)
- Implementing basic bookmarking functionality

## Solutions

Each assessment includes a complete solution that demonstrates best practices for:

- Project structure
- State management with Context API
- API integration
- Component design
- Error handling
- Navigation
- UI/UX implementation

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- A mobile device or emulator

### Running the Solutions

1. Clone this repository
```bash
git clone https://github.com/your-username/react-native-hacker-news-assessment.git
cd react-native-hacker-news-assessment
```

2. Navigate to the solution you want to run
```bash
cd hacker-news-task
```

3. Install dependencies
```bash
npm install
# or
yarn install
```

4. Start the development server
```bash
expo start
# or
npm start
```

5. Open the app on your device or emulator
   - For iOS: Press 'i' in the terminal or scan the QR code with the Camera app
   - For Android: Press 'a' in the terminal or scan the QR code with the Expo Go app

## API Reference

The solutions use the Hacker News API:

- Top stories: `https://hacker-news.firebaseio.com/v0/topstories.json`
- Story item: `https://hacker-news.firebaseio.com/v0/item/{id}.json`
- User info: `https://hacker-news.firebaseio.com/v0/user/{id}.json`

## Evaluation Criteria

These assessments are designed to evaluate:

1. **Code Quality**: Is the code well-structured, clean, and maintainable?
2. **Context Implementation**: Is the Context API implemented correctly and used effectively?
3. **Error Handling**: Does the app handle errors gracefully?
4. **UI/UX**: Is the app visually appealing and user-friendly?
5. **Functionality**: Does the app work as specified?

## Learning Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [React Context API](https://react.dev/reference/react/createContext)
- [Hacker News API Documentation](https://github.com/HackerNews/API)

## Contributing

Contributions are welcome! If you have suggestions for improving the assessments or solutions, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.