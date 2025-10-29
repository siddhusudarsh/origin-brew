import { AlbumPage } from "@/lib/types";

interface BookViewProps {
  pages: AlbumPage[];
}

const BookView = ({ pages }: BookViewProps) => {
  const leftPage = pages[0];
  const rightPage = pages[1];

  return (
    <div className="flex justify-center items-start gap-1">
      {/* Left Page */}
      <div 
        className="w-[500px] rounded-l-lg border bg-white shadow-2xl overflow-hidden"
        style={{ minHeight: '600px' }}
      >
        {leftPage && (
          <div dangerouslySetInnerHTML={{ __html: leftPage.svgContent }} />
        )}
      </div>
      
      {/* Book Spine/Center */}
      <div className="w-4 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 shadow-inner" style={{ minHeight: '600px' }} />
      
      {/* Right Page */}
      <div 
        className="w-[500px] rounded-r-lg border bg-white shadow-2xl overflow-hidden"
        style={{ minHeight: '600px' }}
      >
        {rightPage && (
          <div dangerouslySetInnerHTML={{ __html: rightPage.svgContent }} />
        )}
      </div>
    </div>
  );
};

export default BookView;
