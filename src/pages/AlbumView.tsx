import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Grid3x3, Edit } from "lucide-react";
import Header from "@/components/Header";
import { TemplateGrid } from "@/components/album/TemplateGrid";
import { BookView } from "@/components/album/BookView";

const AlbumView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const photos = location.state?.photos || [];
  const albumTitle = location.state?.albumTitle || "Untitled Album";
  
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "book">("grid");
  const [currentTemplate, setCurrentTemplate] = useState(0);
  
  // Different layout templates
  const templates = [
    "single", // One large photo
    "two-column", // Two photos side by side
    "three-grid", // Three photos in various arrangements
    "four-grid", // Four photos in a grid
    "collage", // Mixed sizes
  ];

  const photosPerPage = viewMode === "book" ? 4 : 6;
  const totalPages = Math.ceil(photos.length / photosPerPage);

  const getCurrentPagePhotos = () => {
    const start = currentPage * photosPerPage;
    return photos.slice(start, start + photosPerPage);
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const cycleTemplate = () => {
    setCurrentTemplate((prev) => (prev + 1) % templates.length);
  };

  if (photos.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No photos uploaded</p>
          <Button onClick={() => navigate("/new-album")} className="mt-4">
            Upload Photos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Edit Toolbar */}
      <div className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <h2 className="text-xl font-semibold text-primary">{albumTitle}</h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "book" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("book")}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={cycleTemplate}>
              Change Layout
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Photo Display Area */}
      <div className="container mx-auto px-6 py-8">
        {viewMode === "grid" ? (
          <TemplateGrid
            photos={getCurrentPagePhotos()}
            template={templates[currentTemplate]}
          />
        ) : (
          <BookView
            leftPagePhotos={getCurrentPagePhotos().slice(0, photosPerPage / 2)}
            rightPagePhotos={getCurrentPagePhotos().slice(photosPerPage / 2)}
            template={templates[currentTemplate]}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlbumView;
