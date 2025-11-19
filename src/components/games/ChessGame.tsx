import { useState } from "react";
import { Chess } from "chess.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function ChessGame() {
  const [game] = useState(new Chess());
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chess Challenge</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Chess game coming soon! We're working on integrating the full chess engine.</p>
          <Button onClick={() => toast({ title: "Chess", description: "Full chess game launching soon!" })}>
            Start Game (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
