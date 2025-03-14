import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Animated } from "react-native";
import { GameEngine } from "react-native-game-engine";

// Screen dimensions
const { width, height } = Dimensions.get("window");

// Simulation constants
const BOID_SIZE = 10;
const BOID_COUNT = 200;
const MAX_SPEED = 5;
const SEPARATION_DISTANCE = 40;
const ALIGNMENT_DISTANCE = 50;
const COHESION_DISTANCE = 70;
const SEPARATION_FORCE = 2.5;
const ALIGNMENT_FORCE = 1;
const COHESION_FORCE = 1;
const TARGET_FORCE = 2;

// Add this after the other constants
const TAP_INDICATOR_SIZE = 40;
const TAP_INDICATOR_DURATION = 800;

// Create a boid entity
const createBoid = (x, y, angle) => ({
  position: { x, y },
  velocity: { x: Math.cos(angle) * 2, y: Math.sin(angle) * 2 },
  size: BOID_SIZE,
  angle,
  renderer: <Boid />,
});

// Boid visual component
const Boid = ({ size, position, angle }) => (
  <View
    style={[
      styles.boid,
      {
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        transform: [{ rotate: `${angle}rad` }],
      },
    ]}
  >
    <View style={styles.wing} />
  </View>
);

// Utility functions
const distance = (boid1, boid2) => {
  const dx = boid1.position.x - boid2.position.x;
  const dy = boid1.position.y - boid2.position.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const normalize = (vector, magnitude) => {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  return length === 0
    ? { x: 0, y: 0 }
    : { x: (vector.x / length) * magnitude, y: (vector.y / length) * magnitude };
};

const limitSpeed = (velocity) => {
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  return speed > MAX_SPEED
    ? { x: (velocity.x / speed) * MAX_SPEED, y: (velocity.y / speed) * MAX_SPEED }
    : velocity;
};

// Main flocking physics system
const FlockingSystem = (entities, { touches }) => {
  const boids = Object.values(entities).filter((e) => e.size === BOID_SIZE);
  const target = entities.target;

  // Handle touches to set target position
  if (touches.length > 0 && touches[0].type === "end" && touches[0].event?.pageX) {
    target.position = { x: touches[0].event.pageX, y: touches[0].event.pageY };
  }

  boids.forEach((boid) => {
    let separationForce = { x: 0, y: 0 };
    let alignmentForce = { x: 0, y: 0 };
    let cohesionForce = { x: 0, y: 0 };
    let separationCount = 0;
    let alignmentCount = 0;
    let cohesionCount = 0;

    boids.forEach((otherBoid) => {
      if (boid !== otherBoid) {
        const dist = distance(boid, otherBoid);

        // Separation
        if (dist < SEPARATION_DISTANCE) {
          separationForce.x += boid.position.x - otherBoid.position.x;
          separationForce.y += boid.position.y - otherBoid.position.y;
          separationCount++;
        }

        // Alignment
        if (dist < ALIGNMENT_DISTANCE) {
          alignmentForce.x += otherBoid.velocity.x;
          alignmentForce.y += otherBoid.velocity.y;
          alignmentCount++;
        }

        // Cohesion
        if (dist < COHESION_DISTANCE) {
          cohesionForce.x += otherBoid.position.x;
          cohesionForce.y += otherBoid.position.y;
          cohesionCount++;
        }
      }
    });

    // Calculate final forces
    if (separationCount > 0) {
      separationForce = normalize(
        { x: separationForce.x / separationCount, y: separationForce.y / separationCount },
        SEPARATION_FORCE
      );
    }
    if (alignmentCount > 0) {
      alignmentForce = normalize(
        { x: alignmentForce.x / alignmentCount, y: alignmentForce.y / alignmentCount },
        ALIGNMENT_FORCE
      );
    }
    if (cohesionCount > 0) {
      cohesionForce = normalize(
        {
          x: cohesionForce.x / cohesionCount - boid.position.x,
          y: cohesionForce.y / cohesionCount - boid.position.y,
        },
        COHESION_FORCE
      );
    }

    // Apply target force
    const targetForce = target?.position
      ? normalize(
          {
            x: target.position.x - boid.position.x,
            y: target.position.y - boid.position.y,
          },
          TARGET_FORCE
        )
      : { x: 0, y: 0 };

    // Update velocity
    boid.velocity.x += separationForce.x + alignmentForce.x + cohesionForce.x + targetForce.x;
    boid.velocity.y += separationForce.y + alignmentForce.y + cohesionForce.y + targetForce.y;

    // Limit speed and update position
    boid.velocity = limitSpeed(boid.velocity);
    boid.position.x += boid.velocity.x;
    boid.position.y += boid.velocity.y;

    // Update angle
    boid.angle = Math.atan2(boid.velocity.y, boid.velocity.x);

    // Screen wrapping
    if (boid.position.x > width) boid.position.x = 0;
    if (boid.position.x < 0) boid.position.x = width;
    if (boid.position.y > height) boid.position.y = 0;
    if (boid.position.y < 0) boid.position.y = height;
  });

  return entities;
};

export default function App() {
  const [running, setRunning] = useState(true);
  const gameEngineRef = useRef(null);
  // Add state for tap indicator
  const [tapIndicator, setTapIndicator] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0.8)).current;

  // Add effect to handle tap animation
  useEffect(() => {
    if (tapIndicator) {
      // Reset opacity and start animation
      fadeAnim.setValue(0.8);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: TAP_INDICATOR_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setTapIndicator(null);
      });
    }
  }, [tapIndicator]);

  const setupEntities = () => {
    const entities = {};
    for (let i = 0; i < BOID_COUNT; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const angle = Math.random() * 2 * Math.PI;
      entities[`boid_${i}`] = createBoid(x, y, angle);
    }
    entities.target = { position: { x: width / 2, y: height / 2 } };
    return entities;
  };

  // Add tap handler to capture taps 
  const handleScreenTouch = (e) => {
    if (!running) return;
    
    const { pageX, pageY } = e.nativeEvent;
    // Set target position for boids
    gameEngineRef.current?.dispatch({ type: "tap", x: pageX, y: pageY });
    // Show tap indicator
    setTapIndicator({ x: pageX, y: pageY });
  };

  // Update FlockingSystem to handle our custom events
  const systemsWithEvents = [
    (entities, { touches, events = [] }) => {
      const target = entities.target;
      
      // Handle custom events
      events.forEach(e => {
        if (e.type === "tap" && target) {
          target.position = { x: e.x, y: e.y };
        }
      });
      
      return FlockingSystem(entities, { touches });
    }
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={1} 
        style={styles.touchableArea}
        onPress={handleScreenTouch}
      >
        <GameEngine
          ref={gameEngineRef}
          style={styles.gameContainer}
          systems={systemsWithEvents}
          entities={setupEntities()}
          running={running}
        />
        
        {/* Tap indicator */}
        {tapIndicator && (
          <Animated.View 
            style={[
              styles.tapIndicator, 
              { 
                left: tapIndicator.x - TAP_INDICATOR_SIZE/2, 
                top: tapIndicator.y - TAP_INDICATOR_SIZE/2,
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 0.8],
                    outputRange: [1.5, 1]
                  })
                }]
              }
            ]} 
          />
        )}
      </TouchableOpacity>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => setRunning(!running)}>
          <Text style={styles.buttonText}>{running ? "Stop" : "Start"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => gameEngineRef.current?.swap(setupEntities())}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.instructions}>Tap to guide the swarm</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  touchableArea: { flex: 1 },
  gameContainer: { flex: 1, backgroundColor: "#87CEEB" },
  boid: {
    position: "absolute",
    backgroundColor: "yellow",
    borderRadius: BOID_SIZE / 2,
  },
  wing: {
    position: "absolute",
    width: BOID_SIZE * 1.5,
    height: BOID_SIZE / 3,
    backgroundColor: "black",
    left: -BOID_SIZE / 4,
    top: BOID_SIZE / 3,
    borderRadius: BOID_SIZE / 2,
  },
  controls: { position: "absolute", top: 40, right: 20, flexDirection: "row" },
  button: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 10,
    borderRadius: 5,
  },
  buttonText: { color: "white", fontWeight: "bold" },
  instructions: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    padding: 10,
    borderRadius: 5,
  },
  // Add tap indicator style
  tapIndicator: {
    position: 'absolute',
    width: TAP_INDICATOR_SIZE,
    height: TAP_INDICATOR_SIZE,
    borderRadius: TAP_INDICATOR_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 10,
  },
});

export function HomeScreen() {
  return <View />;
}