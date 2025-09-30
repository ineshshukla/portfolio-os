import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Snake.css';
import apple from '../../../assets/apple.png';

// --- Game Constants ---
const MIN_SPEED_MS = 80;
const SPEED_INCREMENT = 5;

const GRID_PIXEL_SIZE = 400;

const DIFFICULTIES = {
  easy: { name: 'Easy', gridSize: 10, initialSpeed: 280 },   // 40px tiles
  medium: { name: 'Medium', gridSize: 16, initialSpeed: 180 }, // 25px tiles
  hard: { name: 'Hard', gridSize: 20, initialSpeed: 120 },   // 20px tiles
};

// Helper to get a random coordinate on the grid
const getRandomCoord = (gridSize) => ({
  x: Math.floor(Math.random() * gridSize),
  y: Math.floor(Math.random() * gridSize),
});

const Snake = () => {
  // --- State for Rendering ---
  const [snake, setSnake] = useState([]);
  const [food, setFood] = useState({ x: -1, y: -1 });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(null);
  const [headDirectionClass, setHeadDirectionClass] = useState('dir-up');

  // --- Refs for Game Logic (to avoid stale state in loops) ---
  const gameLoopTimeoutRef = useRef(null);
  const directionRef = useRef({ x: 0, y: -1 }); // Start going up
  const speedRef = useRef(200); // Default, will be overwritten by difficulty

  const startGame = (selectedDifficulty) => {
    const config = DIFFICULTIES[selectedDifficulty];
    config.tileSize = GRID_PIXEL_SIZE / config.gridSize;

    const startPos = Math.floor(config.gridSize / 2);

    setDifficulty(config);
    setSnake([{ x: startPos, y: startPos }]);
    setFood(getRandomCoord(config.gridSize));
    directionRef.current = { x: 0, y: -1 };
    speedRef.current = config.initialSpeed;
    setScore(0);
    setIsGameOver(false);
    setGameHasStarted(true);
    setHeadDirectionClass('dir-up');
  };
  
  const resetGame = () => {
    setSnake([]);
    setGameHasStarted(false);
    setIsGameOver(false);
    setDifficulty(null);
    setScore(0);
  };

  const generateFood = (currentSnake) => {
    let newFoodPosition;
    do {
      newFoodPosition = getRandomCoord(difficulty.gridSize);
    } while (currentSnake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
    setFood(newFoodPosition);
  };

  const gameLoop = useCallback(() => {
    if (isGameOver || !gameHasStarted) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const currentHead = newSnake[0];

      // --- Proactive Collision Detection ---
      // Calculate the next position before moving.
      const nextHead = {
        x: currentHead.x + directionRef.current.x,
        y: currentHead.y + directionRef.current.y,
      };

      // Wall collision
      if (nextHead.x < 0 || nextHead.x >= difficulty.gridSize || nextHead.y < 0 || nextHead.y >= difficulty.gridSize) {
        setIsGameOver(true);
        return prevSnake;
      }
      // Self collision
      for (let i = 0; i < newSnake.length; i++) {
        if (nextHead.x === newSnake[i].x && nextHead.y === newSnake[i].y) {
          setIsGameOver(true);
          return prevSnake;
        }
      }

      newSnake.unshift(nextHead); // Add new head

      // --- Food Consumption ---
      if (nextHead.x === food.x && nextHead.y === food.y) {
        setScore(s => s + 1);
        speedRef.current = Math.max(MIN_SPEED_MS, speedRef.current - SPEED_INCREMENT);
        generateFood(newSnake); // Pass the new snake to avoid placing food on the new head
      } else {
        newSnake.pop(); // Remove tail if no food was eaten
      }

      return newSnake;
    });

    gameLoopTimeoutRef.current = setTimeout(gameLoop, speedRef.current);
  }, [isGameOver, gameHasStarted, food.x, food.y, difficulty]);

  // --- Effects ---
  // Start/Stop game loop
  useEffect(() => {
    if (gameHasStarted && !isGameOver) {
      gameLoopTimeoutRef.current = setTimeout(gameLoop, speedRef.current);
    }
    return () => clearTimeout(gameLoopTimeoutRef.current);
  }, [gameHasStarted, isGameOver, gameLoop]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent input if the game is not in an active state
      if (!gameHasStarted || isGameOver) return;

      // Update head direction class for styling
      const keyMap = {
        'ArrowUp': 'dir-up',
        'ArrowDown': 'dir-down',
        'ArrowLeft': 'dir-left',
        'ArrowRight': 'dir-right',
      };
      if (keyMap[e.key]) setHeadDirectionClass(keyMap[e.key]);

      const { x, y } = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (y === 0) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (y === 0) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (x === 0) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (x === 0) directionRef.current = { x: 1, y: 0 };
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameHasStarted, isGameOver]);

  const gridStyle = difficulty ? {
    width: GRID_PIXEL_SIZE,
    height: GRID_PIXEL_SIZE,
    backgroundSize: `${difficulty.tileSize}px ${difficulty.tileSize}px`,
  } : {};

  return (
    <div className="snake-game-container">
      {gameHasStarted && difficulty && (
        <>
          <div className="snake-score">Score: {score}</div>
          <div className="snake-grid" style={gridStyle}>
            {snake.map((segment, index) => {
              const isHead = index === 0;
              const isPenultimate = index === snake.length - 2 && snake.length > 2;
              const isTail = index === snake.length - 1 && snake.length > 1;
              let segmentClass = 'snake-segment';
              if (isHead) segmentClass += ` head ${headDirectionClass}`;
              if (isPenultimate) segmentClass += ' penultimate-tail';
              if (isTail) segmentClass += ' tail';

              return (
                <div key={index} className={segmentClass} style={{ left: segment.x * difficulty.tileSize, top: segment.y * difficulty.tileSize, width: difficulty.tileSize, height: difficulty.tileSize }} />
              );
            })}
            <img
              src={apple}
              alt="food"
              className="snake-food"
              style={{
                left: food.x * difficulty.tileSize,
                top: food.y * difficulty.tileSize,
                width: difficulty.tileSize,
                height: difficulty.tileSize,
              }} />
          </div>
        </>
      )}

      {!gameHasStarted && !isGameOver && (
        <div className="snake-overlay">
          <h1 className="snake-title">Snake</h1>
          <p className="snake-instructions">Select a difficulty</p>
          <div className="snake-difficulty-selector">
            {Object.keys(DIFFICULTIES).map(key => (
              <button
                key={key}
                className="snake-difficulty-button"
                onClick={() => startGame(key)}
              >
                {DIFFICULTIES[key].name}
              </button>
            ))}
          </div>
        </div>
      )}
      {isGameOver && (
        <div className="snake-overlay">
          <h1 className="snake-title">Game Over</h1>
          <button className="snake-retry-button" onClick={resetGame}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default Snake;