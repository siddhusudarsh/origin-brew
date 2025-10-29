interface BookViewProps {
  leftPagePhotos: string[];
  rightPagePhotos: string[];
  template: string;
}

export const BookView = ({ leftPagePhotos, rightPagePhotos, template }: BookViewProps) => {
  const renderPagePhotos = (photos: string[]) => {
    if (photos.length === 0) return null;

    return (
      <div className="grid grid-cols-1 gap-3 p-8">
        {photos.map((photo, idx) => (
          <img
            key={idx}
            src={photo}
            alt={`Photo ${idx + 1}`}
            className="h-[240px] w-full rounded-lg object-cover shadow-md"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex justify-center gap-1">
      {/* Left Page */}
      <div className="w-[500px] rounded-l-lg border bg-white shadow-2xl">
        {renderPagePhotos(leftPagePhotos)}
      </div>
      
      {/* Book Spine/Center */}
      <div className="w-4 bg-gradient-to-r from-gray-200 to-gray-300 shadow-inner" />
      
      {/* Right Page */}
      <div className="w-[500px] rounded-r-lg border bg-white shadow-2xl">
        {renderPagePhotos(rightPagePhotos)}
      </div>
    </div>
  );
};
