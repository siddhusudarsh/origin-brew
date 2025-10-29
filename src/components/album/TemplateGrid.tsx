import { cn } from "@/lib/utils";

interface TemplateGridProps {
  photos: string[];
  template: string;
}

export const TemplateGrid = ({ photos, template }: TemplateGridProps) => {
  if (photos.length === 0) return null;

  const renderSingleTemplate = () => (
    <div className="flex justify-center">
      <img
        src={photos[0]}
        alt="Photo 1"
        className="max-h-[600px] w-auto rounded-lg object-cover shadow-lg"
      />
    </div>
  );

  const renderTwoColumnTemplate = () => (
    <div className="grid grid-cols-2 gap-4">
      {photos.slice(0, 2).map((photo, idx) => (
        <img
          key={idx}
          src={photo}
          alt={`Photo ${idx + 1}`}
          className="h-[500px] w-full rounded-lg object-cover shadow-lg"
        />
      ))}
    </div>
  );

  const renderThreeGridTemplate = () => (
    <div className="grid grid-cols-3 gap-4">
      {photos.slice(0, 1).map((photo, idx) => (
        <img
          key={idx}
          src={photo}
          alt={`Photo ${idx + 1}`}
          className="col-span-2 h-[500px] w-full rounded-lg object-cover shadow-lg"
        />
      ))}
      <div className="space-y-4">
        {photos.slice(1, 3).map((photo, idx) => (
          <img
            key={idx + 1}
            src={photo}
            alt={`Photo ${idx + 2}`}
            className="h-[242px] w-full rounded-lg object-cover shadow-lg"
          />
        ))}
      </div>
    </div>
  );

  const renderFourGridTemplate = () => (
    <div className="grid grid-cols-2 gap-4">
      {photos.slice(0, 4).map((photo, idx) => (
        <img
          key={idx}
          src={photo}
          alt={`Photo ${idx + 1}`}
          className="h-[350px] w-full rounded-lg object-cover shadow-lg"
        />
      ))}
    </div>
  );

  const renderCollageTemplate = () => (
    <div className="grid grid-cols-4 gap-4">
      <img
        src={photos[0]}
        alt="Photo 1"
        className="col-span-2 row-span-2 h-full w-full rounded-lg object-cover shadow-lg"
      />
      {photos.slice(1, 5).map((photo, idx) => (
        <img
          key={idx + 1}
          src={photo}
          alt={`Photo ${idx + 2}`}
          className={cn(
            "h-full w-full rounded-lg object-cover shadow-lg",
            idx < 2 ? "col-span-1" : "col-span-2"
          )}
        />
      ))}
    </div>
  );

  switch (template) {
    case "single":
      return renderSingleTemplate();
    case "two-column":
      return renderTwoColumnTemplate();
    case "three-grid":
      return renderThreeGridTemplate();
    case "four-grid":
      return renderFourGridTemplate();
    case "collage":
      return renderCollageTemplate();
    default:
      return renderFourGridTemplate();
  }
};
