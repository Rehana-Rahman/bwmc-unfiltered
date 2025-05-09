import { useState, useEffect, useRef } from "react";
import { Game } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface MiniGameProps {
  game: Game;
  preview?: boolean;
}

// Simple Tic-Tac-Toe game implementation
function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  useEffect(() => {
    // Computer move
    if (!isXNext && !winner && !board.every(square => square !== null)) {
      const timeoutId = setTimeout(() => {
        const emptySquares = board.map((square, index) => square === null ? index : null).filter(val => val !== null);
        if (emptySquares.length > 0) {
          const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)] as number;
          const newBoard = [...board];
          newBoard[randomIndex] = 'O';
          setBoard(newBoard);
          setIsXNext(true);
          setWinner(calculateWinner(newBoard));
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [isXNext, board, winner]);

  const handleClick = (index: number) => {
    if (board[index] || winner || !isXNext) return;
    
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsXNext(false);
    
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const renderSquare = (index: number) => (
    <button
      className="h-14 w-14 border border-border flex items-center justify-center text-xl font-bold bg-muted/50 hover:bg-muted/80"
      onClick={() => handleClick(index)}
    >
      {board[index]}
    </button>
  );

  const isBoardFull = board.every(square => square !== null);
  const status = winner
    ? `Winner: ${winner}`
    : isBoardFull
    ? "Game Draw!"
    : `${isXNext ? "Your" : "Computer's"} turn`;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-lg font-medium">{status}</div>
      <div className="grid grid-cols-3 gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSquare(i))}
      </div>
      <Button onClick={resetGame} variant="outline" className="mt-2">
        Reset Game
      </Button>
    </div>
  );
}

// Simple memory card game
function MemoryGame() {
  const [cards, setCards] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize cards
    const cardValues = [1, 2, 3, 4, 5, 6, 7, 8];
    const duplicatedCards = [...cardValues, ...cardValues];
    setCards(shuffleArray(duplicatedCards));
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const shuffleArray = (array: number[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleCardClick = (index: number) => {
    // Prevent clicking if there are already two cards flipped
    if (flipped.length === 2 || flipped.includes(index) || solved.includes(index)) return;

    // Add card to flipped array
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    // If this is the second card, check for a match
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        // If match, add to solved
        setSolved([...solved, ...newFlipped]);
        setFlipped([]);
      } else {
        // If no match, flip back after a delay
        timeoutRef.current = window.setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    const cardValues = [1, 2, 3, 4, 5, 6, 7, 8];
    const duplicatedCards = [...cardValues, ...cardValues];
    setCards(shuffleArray(duplicatedCards));
    setFlipped([]);
    setSolved([]);
    setMoves(0);
  };

  const renderCard = (index: number) => {
    const isFlipped = flipped.includes(index) || solved.includes(index);
    return (
      <div
        className={`h-14 w-14 rounded-md cursor-pointer flex items-center justify-center font-bold text-lg transition-all duration-300 transform ${
          isFlipped ? "bg-accent text-white" : "bg-muted"
        }`}
        onClick={() => handleCardClick(index)}
      >
        {isFlipped ? cards[index] : ""}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex justify-between w-full">
        <div className="text-lg font-medium">Memory Game</div>
        <div className="text-sm">Moves: {moves}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((_, index) => renderCard(index))}
      </div>
      {solved.length === cards.length && (
        <div className="text-center mt-4">
          <p className="text-green-600 font-bold">You won in {moves} moves!</p>
          <Button onClick={resetGame} variant="outline" className="mt-2">
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MiniGame({ game, preview = false }: MiniGameProps) {
  // If it's just a preview, show a simplified version
  if (preview) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center">
          <h3 className="font-semibold mb-1">{game.name}</h3>
          <p className="text-xs text-muted-foreground">Click to play</p>
        </div>
      </div>
    );
  }

  // Based on the game type, render different mini games
  const renderGame = () => {
    // For this demo, we'll check the game name to determine which game to show
    if (game.name.toLowerCase().includes("tic") || game.name.toLowerCase().includes("tac")) {
      return <TicTacToe />;
    } else if (game.name.toLowerCase().includes("memory")) {
      return <MemoryGame />;
    } else {
      // Default game or placeholder
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center h-80">
          <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
          <p className="text-muted-foreground mb-4">{game.description}</p>
          <p className="text-sm">Loading game...</p>
        </div>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-secondary p-2 rounded-md shadow-inner">
      {renderGame()}
    </div>
  );
}
