import React, { useState, useRef, useEffect, useMemo } from "react";
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

// Grid constants for spatial partitioning
const CELL_SIZE = Math.max(SEPARATION_DISTANCE, ALIGNMENT_DISTANCE, COHESION_DISTANCE);
const GRID_WIDTH = Math.ceil(width / CELL_SIZE);
const GRID_HEIGHT = Math.ceil(height / CELL_SIZE);
const SHOW_GRID = true; // Change this from false to true to show grid visualization

// Update tap indicator constants
const TAP_INDICATOR_SIZE = 40;
const TAP_INDICATOR_DURATION = 3000;
const MAX_TAP_INDICATORS = 1;

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

// Grid visualization component
const GridVisualization = ({ activeCells = [] }) => {
  const activeCellsSet = new Set(activeCells);
  
  const cells = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const isCellActive = activeCellsSet.has(`${x},${y}`);
      
      cells.push(
        <View
          key={`cell-${x}-${y}`}
          style={{
            position: 'absolute',
            left: x * CELL_SIZE,
            top: y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            borderWidth: 1,
            borderColor: isCellActive ? 'rgba(255, 255, 100, 0.8)' : 'rgba(255, 255, 255, 0.5)',
            backgroundColor: isCellActive ? 'rgba(255, 255, 0, 0.1)' : 'rgba(100, 100, 255, 0.05)'
          }}
        >
          <Text style={{ 
            color: isCellActive ? 'rgba(255, 255, 100, 0.9)' : 'rgba(255, 255, 255, 0.7)', 
            fontSize: 9,
            position: 'absolute',
            top: 4,
            left: 4,
            fontWeight: isCellActive ? 'bold' : '500'
          }}>
            {x},{y}
          </Text>
        </View>
      );
    }
  }
  return <>{cells}</>;
};

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

// Grid-based spatial partitioning
const createGrid = () => {
  const grid = Array(GRID_HEIGHT)
    .fill()
    .map(() => Array(GRID_WIDTH).fill().map(() => []));
  return grid;
};

const getGridCell = (x, y) => {
  const gridX = Math.floor(x / CELL_SIZE);
  const gridY = Math.floor(y / CELL_SIZE);
  return { gridX: Math.max(0, Math.min(GRID_WIDTH - 1, gridX)), 
           gridY: Math.max(0, Math.min(GRID_HEIGHT - 1, gridY)) };
};

const getNeighboringCells = (gridX, gridY) => {
  const neighbors = [];
  for (let y = Math.max(0, gridY - 1); y <= Math.min(GRID_HEIGHT - 1, gridY + 1); y++) {
    for (let x = Math.max(0, gridX - 1); x <= Math.min(GRID_WIDTH - 1, gridX + 1); x++) {
      neighbors.push({ x, y });
    }
  }
  return neighbors;
};

// Optimized flocking physics system using grid partitioning
const FlockingSystem = (entities, { touches }) => {
  const boids = Object.values(entities).filter((e) => e.size === BOID_SIZE);
  const target = entities.target;

  // Handle touches to set target position
  if (touches.length > 0 && touches[0].type === "end" && touches[0].event?.pageX) {
    target.position = { x: touches[0].event.pageX, y: touches[0].event.pageY };
  }

  // Create and populate grid
  const grid = createGrid();
  boids.forEach(boid => {
    const { gridX, gridY } = getGridCell(boid.position.x, boid.position.y);
    grid[gridY][gridX].push(boid);
  });

  // Track active cells for visualization
  const newActiveCells = [];
  
  boids.forEach((boid) => {
    let separationForce = { x: 0, y: 0 };
    let alignmentForce = { x: 0, y: 0 };
    let cohesionForce = { x: 0, y: 0 };
    let separationCount = 0;
    let alignmentCount = 0;
    let cohesionCount = 0;

    // Get current grid cell and neighbors
    const { gridX, gridY } = getGridCell(boid.position.x, boid.position.y);
    const neighbors = getNeighboringCells(gridX, gridY);

    // Add to active cells for visualization
    newActiveCells.push(`${gridX},${gridY}`);
    
    // Check only neighboring cells instead of all boids
    neighbors.forEach(neighbor => {
      grid[neighbor.y][neighbor.x].forEach(otherBoid => {
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
    });

    // Calculate final forces (same as before)
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

  // Update active cells (needs to be passed back or handled elsewhere)
  if (entities.activeCellsCallback) {
    entities.activeCellsCallback(newActiveCells);
  }

  return entities;
};

export default function App() {
  const [running, setRunning] = useState(true);
  const gameEngineRef = useRef(null);
  const [tapIndicators, setTapIndicators] = useState([]);
  const [activeCells, setActiveCells] = useState([]);
  const [activeCellsTimeout, setActiveCellsTimeout] = useState(null);
  
  const handleScreenTouch = (e) => {
    if (!running) return;
    
    const { pageX, pageY } = e.nativeEvent;
    gameEngineRef.current?.dispatch({ type: "tap", x: pageX, y: pageY });
    
    const newIndicator = { 
      id: Date.now(),
      x: pageX, 
      y: pageY,
      fadeAnim: new Animated.Value(0.8)
    };
    
    setTapIndicators(prevIndicators => {
      const updatedIndicators = [newIndicator, ...prevIndicators];
      return updatedIndicators.slice(0, MAX_TAP_INDICATORS);
    });
  };

  useEffect(() => {
    tapIndicators.forEach(indicator => {
      Animated.timing(indicator.fadeAnim, {
        toValue: 0.4,
        duration: TAP_INDICATOR_DURATION,
        useNativeDriver: true,
      }).start();
    });
  }, [tapIndicators]);

  // Memoize entity creation
  const setupEntities = useRef(() => {
    const entities = {};
    for (let i = 0; i < BOID_COUNT; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const angle = Math.random() * 2 * Math.PI;
      entities[`boid_${i}`] = createBoid(x, y, angle);
    }
    entities.target = { position: { x: width / 2, y: height / 2 } };
    return entities;
  }).current;

  // Generate initial entities only once
  const initialEntities = useMemo(() => setupEntities(), []);

  const systemsWithEvents = [
    (entities, { touches, events = [] }) => {
      const target = entities.target;
      
      events.forEach(e => {
        if (e.type === "tap" && target) {
          target.position = { x: e.x, y: e.y };
        }
      });
      
      // Add a callback to update active cells
      entities.activeCellsCallback = (newActiveCells) => {
        // Clear previous timeout to prevent rapid updates
        if (activeCellsTimeout) {
          clearTimeout(activeCellsTimeout);
        }
        
        // Update active cells and set a timeout to clear them
        setActiveCells(newActiveCells);
        const timeout = setTimeout(() => {
          setActiveCells([]);
        }, 500); // Clear after 500ms
        
        setActiveCellsTimeout(timeout);
      };
      
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
          entities={initialEntities}
          running={running}
        />
        
        {/* Grid visualization with active cells */}
        {SHOW_GRID && <GridVisualization activeCells={activeCells} />}
        
        {/* Tap indicators */}
        {tapIndicators.map(indicator => (
          <Animated.View 
            key={indicator.id}
            style={[
              styles.tapIndicator, 
              { 
                left: indicator.x - TAP_INDICATOR_SIZE/2, 
                top: indicator.y - TAP_INDICATOR_SIZE/2,
                opacity: indicator.fadeAnim,
                transform: [{
                  scale: indicator.fadeAnim.interpolate({
                    inputRange: [0.4, 0.8],
                    outputRange: [1.3, 1]
                  })
                }]
              }
            ]} 
          />
        ))}
      </TouchableOpacity>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => setRunning(!running)}>
          <Text style={styles.buttonText}>{running ? "Stop" : "Start"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            gameEngineRef.current?.swap(setupEntities());
            setTapIndicators([]);
          }}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setTapIndicators([])}
        >
          <Text style={styles.buttonText}>Clear</Text>
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
  // Updated tap indicator style
  tapIndicator: {
    position: 'absolute',
    width: TAP_INDICATOR_SIZE,
    height: TAP_INDICATOR_SIZE,
    borderRadius: TAP_INDICATOR_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 10,
  },
});

export function HomeScreen() {
  return <View />;
}