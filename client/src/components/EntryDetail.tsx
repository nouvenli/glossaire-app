import { Card } from "@/components/ui/card";
import { Streamdown } from 'streamdown';
import type { Entry } from "@/types";

interface EntryDetailProps {
  entry: Entry;
}

export default function EntryDetail({ entry }: EntryDetailProps) {
  return (
    <Card className="p-6 max-h-[600px] overflow-y-auto">
      <h2 className="text-2xl font-bold text-foreground mb-4">{entry.term}</h2>
      
      {entry.imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={entry.imageUrl}
            alt={entry.term}
            className="w-full h-auto max-h-64 object-cover"
          />
        </div>
      )}
      
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <Streamdown>{entry.definition}</Streamdown>
      </div>
    </Card>
  );
}
