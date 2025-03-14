import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { GameEngine } from "react-native-game-engine";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Configuration
const CONFIG = {
  BOID: { SIZE: 10, COUNT: 100, MAX_SPEED: 5 },
  FORCES: {
    SEPARATION: { DISTANCE: 30, STRENGTH: 2 },
    ALIGNMENT: { DISTANCE: 50, STRENGTH: 1 },
    COHESION: { DISTANCE: 70, STRENGTH: 1 },
    TARGET: { STRENGTH: 2 },
  },
};

/**
 * Boid visual component
 */
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
    <View style={[styles.wing, { width: size * 1.5, height: size / 3 }]} />
  </View>
);

/**
 * Vector utilities
 */
const Vector = {
  distance: (a, b) => {
    const dx = a.position.x - b.position.x;
    const dy = a.position.y - b.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  normalize: (vector, magnitude) => {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) return { x: 0, y: 0 };
    return {
      x: (vector.x / length) * magnitude,
      y: (vector.y / length) * magnitude,
    };
  },

  limitSpeed: (velocity) => {
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    if (speed > CONFIG.BOID.MAX_SPEED) {
      return {
        x: (velocity.x / speed) * CONFIG.BOID.MAX_SPEED,
        y: (velocity.y / speed) * CONFIG.BOID.MAX_SPEED,
      };
    }
    return velocity;
  },
};

/**
 * Create a new boid entity
 */
const createBoid = (x, y, angle) => ({
  position: { x, y },
  velocity: {
    x: Math.cos(angle) * 2,
    y: Math.sin(angle) * 2,
  },
  size: CONFIG.BOID.SIZE,
  angle,
  renderer: <Boid />,
});

/**
 * Main flocking simulation system
 */
const FlockingSystem = (entities, { touches }) => {
  const boids = Object.keys(entities).filter((key) => key !== "target");
  const target = entities.target;

  // Handle touches to set target
  if (touches.length > 0 && touches[0].type === "end") {
    const touch = touches[0].event;
    if (touch.pageX) {
      target.position = { x: touch.pageX, y: touch.pageY };
    }
  }

  // Update each boid
  boids.forEach((boidId) => {
    const boid = entities[boidId];

    // Initialize forces
    let forces = {
      separation: { x: 0, y: 0, count: 0 },
      alignment: { x: 0, y: 0, count: 0 },
      cohesion: { x: 0, y: 0, count: 0 },
    };

    // Calculate interactions with other boids
    boids.forEach((otherId) => {
      if (boidId !== otherId) {
        const otherBoid = entities[otherId];
        const dist = Vector.distance(boid, otherBoid);

        // Separation - avoid crowding
        if (dist < CONFIG.FORCES.SEPARATION.DISTANCE) {
          forces.separation.x += boid.position.x - otherBoid.position.x;
          forces.separation.y += boid.position.y - otherBoid.position.y;
          forces.separation.count++;
        }

        // Alignment - steer towards average heading
        if (dist < CONFIG.FORCES.ALIGNMENT.DISTANCE) {
          forces.alignment.x += otherBoid.velocity.x;
          forces.alignment.y += otherBoid.velocity.y;
          forces.alignment.count++;
        }

        // Cohesion - move toward center of mass
        if (dist < CONFIG.FORCES.COHESION.DISTANCE) {
          forces.cohesion.x += otherBoid.position.x;
          forces.cohesion.y += otherBoid.position.y;
          forces.cohesion.count++;
        }
      }
    });

    // Process and apply forces
    const appliedForces = {
      separation: { x: 0, y: 0 },
      alignment: { x: 0, y: 0 },
      cohesion: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
    };

    // Separation
    if (forces.separation.count > 0) {
      forces.separation.x /= forces.separation.count;
      forces.separation.y /= forces.separation.count;
      appliedForces.separation = Vector.normalize(
        forces.separation,
        CONFIG.FORCES.SEPARATION.STRENGTH
      );
    }

    // Alignment
    if (forces.alignment.count > 0) {
      forces.alignment.x /= forces.alignment.count;
      forces.alignment.y /= forces.alignment.count;
      appliedForces.alignment = Vector.normalize(
        forces.alignment,
        CONFIG.FORCES.ALIGNMENT.STRENGTH
      );
    }

    // Cohesion
    if (forces.cohesion.count > 0) {
      forces.cohesion.x =
        forces.cohesion.x / forces.cohesion.count - boid.position.x;
      forces.cohesion.y =
        forces.cohesion.y / forces.cohesion.count - boid.position.y;
      appliedForces.cohesion = Vector.normalize(
        forces.cohesion,
        CONFIG.FORCES.COHESION.STRENGTH
      );
    }

    // Target seeking
    if (target) {
      appliedForces.target = Vector.normalize(
        {
          x: target.position.x - boid.position.x,
          y: target.position.y - boid.position.y,
        },
        CONFIG.FORCES.TARGET.STRENGTH
      );
    }

    // Apply combined forces to velocity
    boid.velocity.x +=
      appliedForces.separation.x +
      appliedForces.alignment.x +
      appliedForces.cohesion.x +
      appliedForces.target.x;

    boid.velocity.y +=
      appliedForces.separation.y +
      appliedForces.alignment.y +
      appliedForces.cohesion.y +
      appliedForces.target.y;

    // Limit speed
    boid.velocity = Vector.limitSpeed(boid.velocity);

    // Update position
    boid.position.x += boid.velocity.x;
    boid.position.y += boid.velocity.y;

    // Update angle for visual rotation
    boid.angle = Math.atan2(boid.velocity.y, boid.velocity.x);

    // Wrap around edges of screen
    if (boid.position.x > width) boid.position.x = 0;
    if (boid.position.x < 0) boid.position.x = width;
    if (boid.position.y > height) boid.position.y = 0;
    if (boid.position.y < 0) boid.position.y = height;
  });

  return entities;
};

/**
 * Main component
 */
export default function BoidsSimulation() {
  const [running, setRunning] = useState(true);
  const gameEngineRef = useRef(null);

  // Create initial entities
  const setupEntities = () => {
    const entities = {};

    // Create boids
    for (let i = 0; i < CONFIG.BOID.COUNT; i++) {
      entities[`boid_${i}`] = createBoid(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2 * Math.PI
      );
    }

    // Add target entity
    entities.target = {
      position: { x: width / 2, y: height / 2 },
      renderer: <View style={styles.target} />,
    };

    return entities;
  };

  return (
    <View style={styles.container}>
      <GameEngine
        ref={gameEngineRef}
        style={styles.gameContainer}
        systems={[FlockingSystem]}
        entities={setupEntities()}
        running={running}
      />

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setRunning(!running)}
        >
          <Text style={styles.buttonText}>{running ? "Stop" : "Start"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => gameEngineRef.current?.swap(setupEntities())}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instructions}>Tap anywhere to guide the flock</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  boid: {
    position: "absolute",
    backgroundColor: "yellow",
    borderRadius: CONFIG.BOID.SIZE / 2,
  },
  wing: {
    position: "absolute",
    backgroundColor: "black",
    left: -CONFIG.BOID.SIZE / 4,
    top: CONFIG.BOID.SIZE / 3,
    borderRadius: CONFIG.BOID.SIZE / 2,
  },
  controls: {
    position: "absolute",
    top: 40,
    right: 20,
    flexDirection: "row",
  },
  button: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  instructions: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    padding: 10,
    borderRadius: 5,
  },
  target: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "red",
    backgroundColor: "transparent",
  },
});

// Empty component for the home screen
export function HomeScreen() {
  return <View />;
}
