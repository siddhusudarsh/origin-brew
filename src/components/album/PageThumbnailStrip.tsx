import { AlbumPage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PageThumbnailStripProps {
  pages: AlbumPage[];
  currentPage: number;
  onPageSelect: (pageIndex: number) => void;
  isEditMode: boolean;
}

export default function PageThumbnailStrip({
  pages,
  currentPage,
  onPageSelect,
}: PageThumbnailStripProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t py-4 z-40">
      <div className="container mx-auto px-6">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {pages.map((page, index) => (
            <PageThumbnail
              key={page.id}
              page={page}
              index={index}
              isActive={currentPage === index}
              onClick={() => onPageSelect(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PageThumbnailProps {
  page: AlbumPage;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function PageThumbnail({ page, index, isActive, onClick }: PageThumbnailProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0 cursor-pointer transition-all"
      )}
    >
      <div
        className={cn(
          "w-24 h-28 rounded-lg border-2 overflow-hidden bg-white relative group",
          isActive ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
        )}
        onClick={onClick}
      >
        <div
          dangerouslySetInnerHTML={{ __html: page.svgContent }}
          className="w-full h-full pointer-events-none"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
          Page {index + 1}
        </div>
      </div>
    </div>
  );
}
