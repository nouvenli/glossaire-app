import { Button } from "@/components/ui/button";

interface AlphabeticNavProps {
  selectedLetter: string | null;
  onSelectLetter: (letter: string) => void;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function AlphabeticNav({ selectedLetter, onSelectLetter }: AlphabeticNavProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Navigation alphabétique</p>
      <div className="grid grid-cols-7 gap-1">
        {ALPHABET.map((letter) => (
          <Button
            key={letter}
            variant={selectedLetter === letter ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0 text-xs"
            onClick={() => onSelectLetter(letter)}
          >
            {letter}
          </Button>
        ))}
      </div>
    </div>
  );
}
