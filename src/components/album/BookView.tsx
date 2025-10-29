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
        className="w-[500px] h-[600px] rounded-l-lg border bg-white shadow-2xl overflow-hidden"
      >
        {leftPage && (
          <div 
            dangerouslySetInnerHTML={{ __html: leftPage.svgContent }} 
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
      
      {/* Book Spine/Center */}
      <div className="w-4 h-[600px] bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 shadow-inner" />
      
      {/* Right Page */}
      <div 
        className="w-[500px] h-[600px] rounded-r-lg border bg-white shadow-2xl overflow-hidden"
      >
        {rightPage && (
          <div 
            dangerouslySetInnerHTML={{ __html: rightPage.svgContent }} 
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
    </div>
  );
};

export default BookView;
