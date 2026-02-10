import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Search } from "lucide-react";
import { Streamdown } from 'streamdown';
import AddEntryForm from "@/components/AddEntryForm";
import EntryDetail from "@/components/EntryDetail";
import AlphabeticNav from "@/components/AlphabeticNav";
import GlossarySelector from "@/components/GlossarySelector";
import TermsList from "@/components/TermsList";

export default function GlossaryApp() {
  const { user, isAuthenticated } = useAuth();
  const [selectedGlossaryId, setSelectedGlossaryId] = useState<number | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isAddingGlossary, setIsAddingGlossary] = useState(false);
  const [newGlossaryTitle, setNewGlossaryTitle] = useState("");

  // Fetch glossaries
  const { data: glossaries = [], isLoading: glossariesLoading } = trpc.glossaries.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch entries for selected glossary
  const { data: entries = [], isLoading: entriesLoading } = trpc.entries.list.useQuery(
    { glossaryId: selectedGlossaryId || 0 },
    { enabled: !!selectedGlossaryId }
  );

  // Search entries
  const { data: searchResults = [] } = trpc.entries.search.useQuery(
    { glossaryId: selectedGlossaryId || 0, searchTerm },
    { enabled: !!selectedGlossaryId && searchTerm.length > 0 }
  );

  // Get selected entry details
  const { data: selectedEntry } = trpc.entries.getById.useQuery(
    { entryId: selectedEntryId || 0 },
    { enabled: !!selectedEntryId }
  );

  // Create glossary mutation
  const createGlossaryMutation = trpc.glossaries.create.useMutation({
    onSuccess: () => {
      trpc.useUtils().glossaries.list.invalidate();
      setNewGlossaryTitle("");
      setIsAddingGlossary(false);
    },
  });

  // Filter and sort entries
  const displayEntries = useMemo(() => {
    let filtered = searchTerm ? searchResults : entries;
    filtered = filtered.sort((a, b) => a.term.localeCompare(b.term));
    
    if (selectedLetter && !searchTerm) {
      filtered = filtered.filter(e => e.term.charAt(0).toUpperCase() === selectedLetter);
    }
    
    return filtered;
  }, [entries, searchResults, searchTerm, selectedLetter]);

  // Group entries by first letter
  const groupedEntries = useMemo(() => {
    const groups: Record<string, typeof entries> = {};
    displayEntries.forEach(entry => {
      const letter = entry.term.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(entry);
    });
    return groups;
  }, [displayEntries]);

  const handleCreateGlossary = async () => {
    if (newGlossaryTitle.trim()) {
      await createGlossaryMutation.mutateAsync({
        title: newGlossaryTitle,
        description: "",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <p className="text-foreground mb-4">Veuillez vous connecter pour accéder à l'application.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">📚 Mon Glossaire</h1>
            <Dialog open={isAddingGlossary} onOpenChange={setIsAddingGlossary}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau glossaire
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau glossaire</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Titre du glossaire (ex: Kotlin, Personnages bibliques)"
                    value={newGlossaryTitle}
                    onChange={(e) => setNewGlossaryTitle(e.target.value)}
                  />
                  <Button
                    onClick={handleCreateGlossary}
                    disabled={createGlossaryMutation.isPending}
                    className="w-full"
                  >
                    {createGlossaryMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      "Créer"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Glossary Selector */}
          {glossaries.length > 0 && (
            <GlossarySelector
              glossaries={glossaries}
              selectedGlossaryId={selectedGlossaryId}
              onSelect={setSelectedGlossaryId}
            />
          )}
        </div>
      </header>

      {glossariesLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : glossaries.length === 0 ? (
        <div className="container py-12 text-center">
          <p className="text-muted-foreground mb-4">Aucun glossaire créé. Commencez par en créer un !</p>
        </div>
      ) : !selectedGlossaryId ? (
        <div className="container py-12 text-center">
          <p className="text-muted-foreground mb-4">Sélectionnez un glossaire pour commencer</p>
        </div>
      ) : (
        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel: Search and Navigation */}
            <div className="lg:col-span-1 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un terme..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedLetter(null);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Alphabetic Navigation */}
              <AlphabeticNav
                selectedLetter={selectedLetter}
                onSelectLetter={(letter) => {
                  setSelectedLetter(letter);
                  setSearchTerm("");
                }}
              />

              {/* Add Entry Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un terme
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau terme</DialogTitle>
                  </DialogHeader>
                  <AddEntryForm
                    glossaryId={selectedGlossaryId}
                    onSuccess={() => {
                      trpc.useUtils().entries.list.invalidate({ glossaryId: selectedGlossaryId });
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Middle Panel: Terms List */}
            <div className="lg:col-span-1">
              {entriesLoading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : (
                <TermsList
                  groupedEntries={groupedEntries}
                  selectedEntryId={selectedEntryId}
                  onSelectEntry={setSelectedEntryId}
                />
              )}
            </div>

            {/* Right Panel: Entry Details */}
            <div className="lg:col-span-1">
              {selectedEntry ? (
                <EntryDetail entry={selectedEntry} />
              ) : (
                <Card className="p-6 text-center text-muted-foreground">
                  <p>Sélectionnez un terme pour voir sa définition</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
