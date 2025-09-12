import React, { useState, useEffect, useCallback, useRef } from 'react';
import Bird from './Bird';
import './FlappyBird.css';

// --- Game Constants ---
// We define these here to make the game easier to tweak.
const BIRD_SIZE = 60;
const GRAVITY = 2.5;
const JUMP_HEIGHT = 55;

const FlappyBird = () => {
  const [gameDimensions, setGameDimensions] = useState({ width: 0, height: 0 });
  const [birdPosition, setBirdPosition] = useState(0);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const gameLoopRef = useRef();
  const gameBoxRef = useRef(null);

  // Get the dimensions of the game container and set initial bird position
  useEffect(() => {
    if (gameBoxRef.current) {
      const { width, height } = gameBoxRef.current.getBoundingClientRect();
      setGameDimensions({ width, height });
      // Set initial bird position to the middle of the screen
      setBirdPosition(height / 2);
    }
  }, []);

  // Function to end the game
  const endGame = useCallback(() => {
    setGameHasStarted(false);
    setIsGameOver(true);
    cancelAnimationFrame(gameLoopRef.current);
  }, []);

  // The main game loop
  const gameLoop = useCallback(() => {
    // This is the heartbeat of our game!
    if (gameHasStarted) {
      setBirdPosition(prevPosition => {
        const newPosition = prevPosition + GRAVITY;
        // Check for collision with top or bottom
        if (newPosition <= 0 || newPosition >= gameDimensions.height - BIRD_SIZE) {
          endGame();
          return Math.max(0, Math.min(newPosition, gameDimensions.height - BIRD_SIZE));
        }
        return newPosition;
      });
    }

    // Request the next frame to keep the loop going
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameHasStarted, gameDimensions.height, endGame]);

  // Start and stop the game loop
  useEffect(() => {
    if (gameHasStarted) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    // Cleanup function to stop the loop when the component unmounts
    return () => {
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameHasStarted, gameLoop]);

  // Handle player input
  const handleFlap = () => {
    if (isGameOver) return; // Don't flap if the game is over

    if (!gameHasStarted) {
      setGameHasStarted(true);
    }
    setBirdPosition(prevPosition => prevPosition - JUMP_HEIGHT);  
  };

  // Function to restart the game
  const handleRetry = () => {
    setBirdPosition(gameDimensions.height / 2);
    setScore(0);
    setIsGameOver(false);
    setGameHasStarted(false);
  };

  // Listen for clicks to trigger the flap
  const handleClick = () => {
    // Don't flap if the game is over
    if (isGameOver) return;
    handleFlap();
  };

  // Listen for spacebar presses to trigger the flap
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isGameOver) return;
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault(); // Prevent spacebar from scrolling the page
        handleFlap();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isGameOver]); // Re-bind to check isGameOver status

  return (
    <div
      className="flappy-bird-container"
      onClick={handleClick}
    >
      <div className="flappy-game-box" ref={gameBoxRef}>
        <Bird size={BIRD_SIZE} top={birdPosition} />
      </div>

      {!gameHasStarted && !isGameOver && (
        <div className="flappy-start-screen">
          <h1 className="flappy-title">Flappy Bird</h1>
          <div className="flappy-instructions">Click or Space to Start</div>
        </div>
      )}

      {isGameOver && (
        <div className="flappy-game-over-screen">
          <h1 className="flappy-title">Game Over</h1>
          <div className="flappy-score">Score: {score}</div>
          <button className="flappy-retry-button" onClick={(e) => { e.stopPropagation(); handleRetry(); }}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default FlappyBird;