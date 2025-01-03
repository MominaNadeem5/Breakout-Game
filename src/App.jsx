import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false); 

  const paddleHeight = 15;
  const paddleWidth = 150;
  const brickColumnCount = 6;
  const brickWidth = 75;
  const brickHeight = 20;
  const brickPadding = 10;

  let paddleX = 200;
  let bricks = [];

  const bonusMessage = {
    text: '',
    x: 0,
    y: 0,
    visible: false,
    timer: null,
  };

  const initializeBalls = (level) => {
    const balls = [];
    for (let i = 0; i < level; i++) {
      balls.push({
        x: 290,
        y: 290,
        dx: 2 + i,
        dy: -2 - i,
      });
    }
    return balls;
  };

  const initializeBricks = (level) => {
    const newBricks = [];
    const rows = level;
    const colorPairs = ['#00FF40', '#03C03C', '#00674b'];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < brickColumnCount; c++) {
        newBricks.push({
          x: c * (brickWidth + brickPadding) + 30,
          y: r * (brickHeight + brickPadding) + 30,
          status: 1,
          color: colorPairs[(c + r) % colorPairs.length],
        });
      }
    }

    return newBricks;
  };

  useEffect(() => {
    if (!gameStarted) return; 

    bricks = initializeBricks(level);
    let balls = initializeBalls(level);

    const canvas = document.getElementById('gameCanvas');
    canvas.width = 580;
    canvas.height = 520;
    const ctx = canvas.getContext('2d');

    const keyDownHandler = (e) => {
      if (e.key === 'ArrowLeft' && paddleX > 0) {
        paddleX -= 40;
      } else if (e.key === 'ArrowRight' && paddleX < canvas.width - paddleWidth) {
        paddleX += 40;
      }
    };
    window.addEventListener('keydown', keyDownHandler);

    const drawBall = (ball) => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#FF5733';
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.closePath();
    };

    const drawBricks = () => {
      bricks.forEach((brick) => {
        if (brick.status === 1) {
          ctx.beginPath();
          ctx.rect(brick.x, brick.y, brickWidth, brickHeight);
          ctx.fillStyle = brick.color;
          ctx.fill();
          ctx.closePath();
        }
      });
    };

    const drawBonusMessage = () => {
      if (bonusMessage.visible) {
        ctx.font = '30px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bonusMessage.text, bonusMessage.x, bonusMessage.y);
      }
    };

    let lastBrickHit = null;

    const collisionDetection = () => {
      bricks.forEach((brick) => {
        if (brick.status === 1) {
          balls.forEach((ball) => {
            if (
              ball.x > brick.x &&
              ball.x < brick.x + brickWidth &&
              ball.y > brick.y &&
              ball.y < brick.y + brickHeight
            ) {
              ball.dy = -ball.dy;

              if (lastBrickHit && lastBrickHit.color === brick.color && lastBrickHit !== brick) {
                lastBrickHit.status = 0;
                brick.status = 0;
                setScore((prev) => prev + 5);
                bonusMessage.text = '+5 Bonus';
                bonusMessage.x = canvas.width / 2;
                bonusMessage.y = canvas.height / 2;
                bonusMessage.visible = true;

                setTimeout(() => {
                  bonusMessage.visible = false;
                }, 1000);

                lastBrickHit = null;
              } else {
                lastBrickHit = brick;
              }
            }
          });
        }
      });

      if (bricks.every((brick) => brick.status === 0)) {
        setGameWon(true);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawPaddle();
      balls.forEach((ball) => drawBall(ball));
      collisionDetection();
      drawBonusMessage();

      balls.forEach((ball) => {
        if (ball.x + ball.dx > canvas.width - 10 || ball.x + ball.dx < 10) {
          ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < 10) {
          ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - 10) {
          if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
            ball.dy = -ball.dy;
          } else {
            balls = balls.filter((b) => b !== ball);
            if (balls.length === 0) setGameOver(true);
          }
        }
        ball.x += ball.dx;
        ball.y += ball.dy;
      });
    };

    const interval = setInterval(() => {
      if (!gameOver && !gameWon) draw();
    }, 10);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [gameOver, gameWon, level, gameStarted]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setLevel(1);
    bricks = initializeBricks(1);
  };

  const nextLevel = () => {
    setGameWon(false);
    setLevel((prev) => prev + 1);
    bricks = initializeBricks(level + 1);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="App">
      <h1>BreakOut Game</h1>
      {!gameStarted && (
        <div>
          <button className="start-btn" onClick={startGame}>Start Game</button>
        </div>
      )}

      {gameStarted && (
        <div>
          <div className="score-level-container">
            <div className="score">Score: {score}</div>
            <div className="level">Level: {level}</div>
          </div>

          <canvas id="gameCanvas"></canvas>
          {gameOver && (
            <div className="game-over">
              <h2>Game Over!</h2>
              <button className="restart-btn" onClick={resetGame}>Restart</button>
            </div>
          )}
          {gameWon && (
            <div className="game-over">
              <h2>Level {level} Complete!</h2>
              <button className="next-level-btn" onClick={nextLevel}>Next Level</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
