import { AlbumPage } from "@/lib/types";

interface SinglePageViewProps {
  pages: AlbumPage[];
}

const SinglePageView = ({ pages }: SinglePageViewProps) => {
  if (!pages || pages.length === 0) return null;

  const page = pages[0];

  return (
    <div className="flex justify-center">
      <div 
        className="bg-white rounded-lg shadow-2xl overflow-hidden"
        style={{ width: '500px', height: '600px' }}
      >
        <div 
          dangerouslySetInnerHTML={{ __html: page.svgContent }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default SinglePageView;
