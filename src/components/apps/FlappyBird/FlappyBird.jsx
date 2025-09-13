import React, { useState, useEffect, useCallback, useRef } from 'react';
import Bird from './Bird';
import Pipe from './Pipe';
import './FlappyBird.css';

// --- Game Constants ---
// We define these here to make the game easier to tweak.
const BIRD_SIZE = 50;
const BIRD_LEFT_OFFSET = 100; // The bird's horizontal position
const GRAVITY = 0.5; // Acceleration due to gravity
const JUMP_VELOCITY = -8; // Instant upward velocity on flap
const ROTATION_UP = 45; // Degrees to rotate up on flap
const ROTATION_DOWN_RATE = 2; // Rate of rotation downwards

const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 4;
const PIPE_SPAWN_DISTANCE = 250; // pixels between pipes

const FlappyBird = () => {
  const [gameDimensions, setGameDimensions] = useState({ width: 0, height: 0 });

  // --- Rendering State ---
  // We separate state to optimize re-renders. The bird updates every frame,
  // but the pipes and score only update periodically.
  const [birdState, setBirdState] = useState({ position: 0, rotation: 0 });
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState({
      hasStarted: false,
      isGameOver: false,
  });

  const gameLoopRef = useRef();
  const gameBoxRef = useRef(null);
  // --- Game State Ref ---
  // All game logic state is stored here to avoid re-renders on every frame.
  const gameStateRef = useRef(null);

  // Initialize game state and dimensions
  useEffect(() => {
    if (gameBoxRef.current) {
      const { width, height } = gameBoxRef.current.getBoundingClientRect();
      setGameDimensions({ width, height });

      const initialPosition = height / 2;
      gameStateRef.current = {
        birdVelocity: 0,
        birdPosition: initialPosition,
        birdRotation: 0,
        gameHasStarted: false,
        isGameOver: false,
        pipes: [],
        score: 0,
      };
      setBirdState({ position: initialPosition, rotation: 0 });
    }
  }, []);

  // The main game loop
  const gameLoop = useCallback(() => {
    const state = gameStateRef.current;
    if (!state || !state.gameHasStarted || state.isGameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

      // --- Bird Physics ---
      state.birdVelocity += GRAVITY;
      state.birdPosition += state.birdVelocity;
      state.birdRotation = Math.min(90, state.birdRotation + ROTATION_DOWN_RATE);

      // --- Pipe Logic ---
      state.pipes.forEach(pipe => (pipe.x -= PIPE_SPEED));

      const lastPipe = state.pipes[state.pipes.length - 1];
      if (!lastPipe || gameDimensions.width - lastPipe.x >= PIPE_SPAWN_DISTANCE) {
        const { width, height } = gameDimensions;
        if (height > 0) {
          const minTopHeight = 50;
          const maxTopHeight = height - PIPE_GAP - minTopHeight;
          const topHeight = Math.floor(Math.random() * (maxTopHeight - minTopHeight + 1)) + minTopHeight;
          state.pipes.push({ x: width, topHeight, passed: false });
        }
      }

      // --- Collision and Scoring Logic ---
      // We no longer need the old birdRect for collision, but we'll keep it for the score check.
      // This could be simplified, but it works and is not a performance bottleneck.
      const COLLISION_INSET = 8; // pixels to shrink hitbox for forgiveness

      const birdRect = {
        left: BIRD_LEFT_OFFSET + COLLISION_INSET,
        right: BIRD_LEFT_OFFSET + BIRD_SIZE - COLLISION_INSET,
        top: state.birdPosition + COLLISION_INSET,
        bottom: state.birdPosition + BIRD_SIZE - COLLISION_INSET,
      };

      // Check for ground/ceiling collision
      if (state.birdPosition <= 0 || state.birdPosition >= gameDimensions.height - BIRD_SIZE) {
        state.isGameOver = true;
      }

      // Check for pipe collision
      for (let pipe of state.pipes) {
        // We check if the bird's center has passed the pipe's center.
        const birdCenterX = BIRD_LEFT_OFFSET + BIRD_SIZE / 2;
        if (!pipe.passed && birdCenterX > pipe.x + PIPE_WIDTH / 2) {
          pipe.passed = true;
          state.score += 1; // Sync the internal score with the display score
          setScore(s => s + 1);
        }

        // --- NEW: Circle-based Collision Detection ---
        const birdCircle = {
          x: BIRD_LEFT_OFFSET + BIRD_SIZE / 2,
          y: state.birdPosition + BIRD_SIZE / 2,
          radius: BIRD_SIZE / 2 - COLLISION_INSET, // Use inset for forgiveness
        };

        const checkCollisionCircleRect = (circle, rect) => {
          const closestX = Math.max(rect.left, Math.min(circle.x, rect.right));
          const closestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
          const distanceX = circle.x - closestX;
          const distanceY = circle.y - closestY;
          const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
          return distanceSquared < (circle.radius * circle.radius);
        };

        const topPipeRect = {
          left: pipe.x,
          top: 0,
          right: pipe.x + PIPE_WIDTH,
          bottom: pipe.topHeight,
        };
        const bottomPipeRect = {
          left: pipe.x,
          top: pipe.topHeight + PIPE_GAP,
          right: pipe.x + PIPE_WIDTH,
          bottom: gameDimensions.height,
        };

        const isColliding = !pipe.passed && (checkCollisionCircleRect(birdCircle, topPipeRect) || checkCollisionCircleRect(birdCircle, bottomPipeRect));

        if (isColliding) {
          state.isGameOver = true;
        }
      }

      // Remove off-screen pipes
      state.pipes = state.pipes.filter(pipe => pipe.x > -PIPE_WIDTH);

      // --- Sync with React State for Rendering ---
      setBirdState({ position: state.birdPosition, rotation: state.birdRotation });

      setPipes([...state.pipes]); // Always update pipes to ensure smooth movement

      if (state.isGameOver) {
        setGameStatus({ hasStarted: false, isGameOver: true });
      }

    // Request the next frame to keep the loop going
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameDimensions]);
  
  // Start and stop the game loop
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameLoop]);

  // Handle player input
  const handleFlap = useCallback(() => {
    const state = gameStateRef.current;
    if (!state || state.isGameOver) return;

    if (!state.gameHasStarted) {
      state.gameHasStarted = true;
      setGameStatus({ hasStarted: true, isGameOver: false });
    }
    state.birdVelocity = JUMP_VELOCITY;
    state.birdRotation = -ROTATION_UP;
  }, []);

  // Function to restart the game
  const handleRetry = () => {
    const state = gameStateRef.current;
    if (!state) return;

    state.birdPosition = gameDimensions.height / 2;
    state.birdVelocity = 0;
    state.birdRotation = 0;
    state.pipes = [];
    state.score = 0; // This was the missing piece
    state.isGameOver = false;
    state.gameHasStarted = false; // Go back to the start screen
    setPipes([]);
    setScore(0);
    setGameStatus({ hasStarted: false, isGameOver: false });
  };

  // Listen for clicks to trigger the flap
  const handleClick = () => {
    // Only flap if the game has not started yet, or is already running.
    // This prevents flapping when the "Game Over" screen is visible.
    if (!gameStateRef.current?.isGameOver) {
      handleFlap();
    }
  };

  // Listen for spacebar presses to trigger the flap
  useEffect(() => {
    const handleKeyPress = (e) => {
      // If game is over, do nothing on space press
      if (gameStateRef.current?.isGameOver) {
        return;
      }
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault(); // Prevent spacebar from scrolling the page
        handleFlap();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleFlap]); // Re-bind to check isGameOver status

  return (
    <div
      className="flappy-bird-container"
      onClick={handleClick}
    >
      <div className="flappy-game-box" ref={gameBoxRef}>
        <Bird size={BIRD_SIZE} top={birdState.position} rotation={birdState.rotation} />
        {pipes.map((pipe, index) => (
          <Pipe
            key={index}
            x={pipe.x}
            topHeight={pipe.topHeight}
            bottomHeight={gameDimensions.height - pipe.topHeight - PIPE_GAP}
            width={PIPE_WIDTH}
          />
        ))}
      </div>

      {!gameStatus.hasStarted && !gameStatus.isGameOver && (
        <div className="flappy-start-screen">
          <h1 className="flappy-title">Flappy Bird</h1>
          <div className="flappy-instructions">Click or Space to Start</div>
        </div>
      )}

      {gameStatus.isGameOver && (
        <div className="flappy-game-over-screen">
          <h1 className="flappy-title">Game Over</h1>
          <div className="flappy-score">Score: {score}</div>
          <button
            className="flappy-retry-button"
            onClick={(e) => {
              e.stopPropagation();
              handleRetry();
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default FlappyBird;