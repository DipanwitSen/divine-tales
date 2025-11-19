import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type CardType = {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
};

const emojis = ["🕉️", "🙏", "🧘", "🌸", "🎨", "📿", "🌟", "💫"];

const createCards = (): CardType[] => {
  const cards = [...emojis, ...emojis].map((emoji, index) => ({
    id: index,
    emoji,
    flipped: false,
    matched: false,
  }));
  return cards.sort(() => Math.random() - 0.5);
};

export default function MemoryGame() {
  const [cards, setCards] = useState<CardType[]>(createCards());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard?.emoji === secondCard?.emoji) {
        setCards(prev =>
          prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, matched: true }
              : card
          )
        );
        setScore(prev => prev + 10);
      }

      setTimeout(() => {
        setCards(prev =>
          prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, flipped: false }
              : card
          )
        );
        setFlippedCards([]);
      }, 1000);

      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (cards.every(card => card.matched)) {
      toast({
        title: "Congratulations! 🎉",
        description: `You completed the game in ${moves} moves with ${score} points!`,
      });
    }
  }, [cards, moves, score, toast]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(id)) return;
    if (cards.find(c => c.id === id)?.matched) return;

    setCards(prev =>
      prev.map(card =>
        card.id === id ? { ...card, flipped: true } : card
      )
    );
    setFlippedCards(prev => [...prev, id]);
  };

  const resetGame = () => {
    setCards(createCards());
    setFlippedCards([]);
    setMoves(0);
    setScore(0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Memory Match</CardTitle>
          <div className="flex gap-4 text-sm">
            <span>Moves: {moves}</span>
            <span>Score: {score}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-4">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                aspect-square rounded-lg text-4xl
                transition-all duration-300 transform
                ${card.flipped || card.matched
                  ? "bg-primary text-primary-foreground rotate-0"
                  : "bg-secondary hover:bg-secondary/80 rotate-180"
                }
                ${card.matched ? "opacity-50 cursor-not-allowed" : ""}
              `}
              disabled={card.matched}
            >
              {(card.flipped || card.matched) && card.emoji}
            </button>
          ))}
        </div>
        <Button onClick={resetGame} className="w-full">
          New Game
        </Button>
      </CardContent>
    </Card>
  );
}
