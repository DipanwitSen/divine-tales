import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type SudokuGrid = (number | null)[][];

const generateSudoku = (): { puzzle: SudokuGrid; solution: SudokuGrid } => {
  // Simple sudoku generator (simplified for demo)
  const solution: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
  
  // Fill with a valid base pattern
  const base = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      solution[i][j] = ((i * 3 + Math.floor(i / 3) + j) % 9) + 1;
    }
  }

  // Create puzzle by removing numbers
  const puzzle: SudokuGrid = solution.map(row => [...row]);
  const cellsToRemove = 40; // Easy difficulty
  
  for (let i = 0; i < cellsToRemove; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    puzzle[row][col] = null;
  }

  return { puzzle, solution };
};

export default function SudokuGame() {
  const [grid, setGrid] = useState<SudokuGrid>([]);
  const [solution, setSolution] = useState<SudokuGrid>([]);
  const [initialGrid, setInitialGrid] = useState<SudokuGrid>([]);
  const { toast } = useToast();

  useEffect(() => {
    newGame();
  }, []);

  const newGame = () => {
    const { puzzle, solution: sol } = generateSudoku();
    setGrid(puzzle);
    setSolution(sol);
    setInitialGrid(puzzle.map(row => [...row]));
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    if (initialGrid[row][col] !== null) return;

    const newGrid = grid.map(r => [...r]);
    const num = parseInt(value);
    newGrid[row][col] = isNaN(num) || num < 1 || num > 9 ? null : num;
    setGrid(newGrid);

    // Check if completed
    if (checkComplete(newGrid)) {
      toast({
        title: "Congratulations! 🎉",
        description: "You solved the puzzle!",
      });
    }
  };

  const checkComplete = (currentGrid: SudokuGrid): boolean => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (currentGrid[i][j] !== solution[i][j]) return false;
      }
    }
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sudoku Wisdom</CardTitle>
          <Button onClick={newGame} variant="outline" size="sm">
            New Puzzle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-9 gap-0 max-w-[450px] mx-auto border-2 border-border">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <input
                key={`${rowIndex}-${colIndex}`}
                type="text"
                maxLength={1}
                value={cell || ""}
                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                disabled={initialGrid[rowIndex][colIndex] !== null}
                className={`
                  w-12 h-12 text-center border border-border
                  ${initialGrid[rowIndex][colIndex] !== null 
                    ? "bg-secondary/50 font-bold cursor-not-allowed" 
                    : "bg-background"
                  }
                  ${(colIndex + 1) % 3 === 0 && colIndex !== 8 ? "border-r-2 border-r-primary" : ""}
                  ${(rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? "border-b-2 border-b-primary" : ""}
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
              />
            ))
          )}
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Fill in the numbers 1-9 without repeating in any row, column, or 3x3 box
        </p>
      </CardContent>
    </Card>
  );
}
