import { StyleSheet } from "react-native";

import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Text, Dimensions } from "react-native";
import { GameEngine } from "react-native-game-engine";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Constants for the simulation
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

// Create a bee/bird entity
const createBoid = (x, y, angle) => {
  return {
    position: { x, y },
    velocity: {
      x: Math.cos(angle) * 2,
      y: Math.sin(angle) * 2,
    },
    size: BOID_SIZE,
    angle,
    renderer: <Boid />,
  };
};

// Visual component for each boid (bee/bird)
const Boid = ({ size, position, angle }) => {
  return (
    <View
      style={{
        position: "absolute",
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        backgroundColor: "yellow", // Yellow for bees
        borderRadius: size / 2,
        transform: [{ rotate: `${angle}rad` }],
      }}
    >
      {/* Wings or details - simplified */}
      <View
        style={{
          position: "absolute",
          width: size * 1.5,
          height: size / 3,
          backgroundColor: "black",
          left: -size / 4,
          top: size / 3,
          borderRadius: size / 2,
        }}
      />
    </View>
  );
};

// Calculate distance between two points
const distance = (boid1, boid2) => {
  const dx = boid1.position.x - boid2.position.x;
  const dy = boid1.position.y - boid2.position.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Normalize a vector to have a specific magnitude
const normalize = (vector, magnitude) => {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (length === 0) return { x: 0, y: 0 };
  return {
    x: (vector.x / length) * magnitude,
    y: (vector.y / length) * magnitude,
  };
};

// Limit velocity to maximum speed
const limitSpeed = (velocity) => {
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  if (speed > MAX_SPEED) {
    return {
      x: (velocity.x / speed) * MAX_SPEED,
      y: (velocity.y / speed) * MAX_SPEED,
    };
  }
  return velocity;
};

// Main flocking physics system
const FlockingSystem = (entities, { time, touches }) => {
  const boids = Object.keys(entities).filter((key) => key !== "target");
  const target = entities.target;

  // Handle touches to set target
  if (touches.length > 0 && touches[0].type === "end") {
    target.position = touches[0].event.pageX
      ? { x: touches[0].event.pageX, y: touches[0].event.pageY }
      : target.position;
  }

  // Apply flocking behavior to each boid
  boids.forEach((boidId) => {
    const boid = entities[boidId];

    // Initialize forces
    let separation = { x: 0, y: 0 };
    let alignment = { x: 0, y: 0 };
    let cohesion = { x: 0, y: 0 };
    let separationCount = 0;
    let alignmentCount = 0;
    let cohesionCount = 0;

    // Calculate interaction with other boids
    boids.forEach((otherId) => {
      if (boidId !== otherId) {
        const otherBoid = entities[otherId];
        const dist = distance(boid, otherBoid);

        // Separation - avoid crowding
        if (dist < SEPARATION_DISTANCE) {
          separation.x += boid.position.x - otherBoid.position.x;
          separation.y += boid.position.y - otherBoid.position.y;
          separationCount++;
        }

        // Alignment - steer towards average heading
        if (dist < ALIGNMENT_DISTANCE) {
          alignment.x += otherBoid.velocity.x;
          alignment.y += otherBoid.velocity.y;
          alignmentCount++;
        }

        // Cohesion - move toward center of mass
        if (dist < COHESION_DISTANCE) {
          cohesion.x += otherBoid.position.x;
          cohesion.y += otherBoid.position.y;
          cohesionCount++;
        }
      }
    });

    // Apply separation
    if (separationCount > 0) {
      separation.x /= separationCount;
      separation.y /= separationCount;
      separation = normalize(separation, SEPARATION_FORCE);
    }

    // Apply alignment
    if (alignmentCount > 0) {
      alignment.x /= alignmentCount;
      alignment.y /= alignmentCount;
      alignment = normalize(alignment, ALIGNMENT_FORCE);
    }

    // Apply cohesion
    if (cohesionCount > 0) {
      cohesion.x = cohesion.x / cohesionCount - boid.position.x;
      cohesion.y = cohesion.y / cohesionCount - boid.position.y;
      cohesion = normalize(cohesion, COHESION_FORCE);
    }

    // Apply target seeking
    let targetForce = { x: 0, y: 0 };
    if (target) {
      targetForce = {
        x: target.position.x - boid.position.x,
        y: target.position.y - boid.position.y,
      };
      targetForce = normalize(targetForce, TARGET_FORCE);
    }

    // Update velocity with all forces
    boid.velocity.x += separation.x + alignment.x + cohesion.x + targetForce.x;
    boid.velocity.y += separation.y + alignment.y + cohesion.y + targetForce.y;

    // Limit speed
    boid.velocity = limitSpeed(boid.velocity);

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

    // Update the entity
    entities[boidId] = boid;
  });

  return entities;
};

export default function App() {
  const [running, setRunning] = useState(true);
  const gameEngineRef = useRef(null);

  // Set up initial entities
  const setupEntities = () => {
    const entities = {};

    // Create initial boids
    for (let i = 0; i < BOID_COUNT; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const angle = Math.random() * 2 * Math.PI;
      entities[`boid_${i}`] = createBoid(x, y, angle);
    }

    // Add an invisible target entity
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
          onPress={() => {
            if (gameEngineRef.current) {
              gameEngineRef.current.swap(setupEntities());
            }
          }}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instructions}>
        Tap anywhere on the screen to direct the swarm
      </Text>
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

export function OriginalScreen() {
  return <View />;
}
