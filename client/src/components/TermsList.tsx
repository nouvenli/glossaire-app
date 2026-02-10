import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Entry } from "@/types";

interface TermsListProps {
  groupedEntries: Record<string, Entry[]>;
  selectedEntryId: number | null;
  onSelectEntry: (entryId: number) => void;
}

export default function TermsList({
  groupedEntries,
  selectedEntryId,
  onSelectEntry,
}: TermsListProps) {
  const letters = Object.keys(groupedEntries).sort();

  if (letters.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p>Aucun terme trouvé</p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden max-h-[600px] overflow-y-auto">
      {letters.map((letter) => (
        <div key={letter}>
          <div className="sticky top-0 bg-accent text-accent-foreground px-4 py-2 font-semibold text-sm">
            {letter}
          </div>
          <div className="divide-y divide-border">
            {groupedEntries[letter].map((entry) => (
              <Button
                key={entry.id}
                variant={selectedEntryId === entry.id ? "default" : "ghost"}
                className="w-full justify-start rounded-none text-left font-normal"
                onClick={() => onSelectEntry(entry.id)}
              >
                <span className="truncate">{entry.term}</span>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}
