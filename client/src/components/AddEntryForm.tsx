import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

interface AddEntryFormProps {
  glossaryId: number;
  onSuccess: () => void;
}

export default function AddEntryForm({ glossaryId, onSuccess }: AddEntryFormProps) {
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createEntryMutation = trpc.entries.create.useMutation({
    onSuccess: () => {
      toast.success("Terme ajouté avec succès !");
      setTerm("");
      setDefinition("");
      setImageUrl(null);
      setImagePreview(null);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'ajout du terme");
    },
  });

  const uploadImageMutation = trpc.entries.uploadImage.useMutation({
    onSuccess: (data) => {
      setImageUrl(data.url);
      toast.success("Image uploadée avec succès !");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'upload de l'image");
    },
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(",")[1];
      if (base64) {
        await uploadImageMutation.mutateAsync({
          fileName: file.name,
          fileData: base64,
        });
      }
    };
    fileReader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    await createEntryMutation.mutateAsync({
      glossaryId,
      term: term.trim(),
      definition: definition.trim(),
      imageUrl: imageUrl || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Terme *</label>
        <Input
          placeholder="Ex: Coroutine, Moïse..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Définition (Markdown) *</label>
        <Textarea
          placeholder="Entrez la définition en Markdown. Vous pouvez utiliser **gras**, *italique*, `code`, etc."
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          rows={6}
          className="mt-1 font-mono text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Image (optionnel)</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadImageMutation.isPending}
          >
            {uploadImageMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Upload...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Sélectionner une image
              </>
            )}
          </Button>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="h-12 w-12 rounded object-cover" />
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={createEntryMutation.isPending}
      >
        {createEntryMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Ajout en cours...
          </>
        ) : (
          "Ajouter le terme"
        )}
      </Button>
    </form>
  );
}
