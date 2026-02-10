import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Glossary } from "@/types";

interface GlossarySelectorProps {
  glossaries: Glossary[];
  selectedGlossaryId: number | null;
  onSelect: (glossaryId: number) => void;
}

export default function GlossarySelector({
  glossaries,
  selectedGlossaryId,
  onSelect,
}: GlossarySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-foreground">Glossaire :</label>
      <Select
        value={selectedGlossaryId?.toString() || ""}
        onValueChange={(value) => onSelect(parseInt(value))}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Sélectionnez un glossaire" />
        </SelectTrigger>
        <SelectContent>
          {glossaries.map((glossary) => (
            <SelectItem key={glossary.id} value={glossary.id.toString()}>
              {glossary.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
