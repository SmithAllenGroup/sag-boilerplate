"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface GalleryImage {
  url: string;
  alt?: string | null;
  name?: string | null;
}

interface ListingGalleryProps {
  images: GalleryImage[];
}

const ListingGallery = ({ images }: ListingGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "Escape") setLightboxOpen(false);
  };

  return (
    <>
      <section className="bg-gray-100 py-6">
        <div className="container max-w-7xl px-6">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="relative w-full"
          >
            <div className="absolute -top-1 right-12 flex h-8 items-center justify-end gap-2 z-10">
              <CarouselPrevious
                variant="default"
                className="relative left-0 top-0 translate-y-0 h-8 w-8 rounded-md"
              />
              <CarouselNext
                variant="default"
                className="relative right-0 top-0 translate-y-0 h-8 w-8 rounded-md"
              />
            </div>
            <CarouselContent className="-ml-3">
              {images.map((image, index) => (
                <CarouselItem key={index} className="pl-3 basis-auto">
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="block cursor-pointer"
                  >
                    <img
                      src={image.url}
                      alt={image.alt || image.name || `Gallery image ${index + 1}`}
                      className="w-[200px] h-[200px] object-cover rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px]"
                    />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          ref={(el) => el?.focus()}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-50 text-white/70 hover:text-white transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-8 w-8" />
          </button>

          {/* Previous button */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white/70 hover:text-white transition-colors p-2"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-12 w-12" />
          </button>

          {/* Next button */}
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white/70 hover:text-white transition-colors p-2"
            onClick={goToNext}
          >
            <ChevronRight className="h-12 w-12" />
          </button>

          {/* Main image - fills viewport */}
          <div className="w-screen h-screen flex items-center justify-center p-4 sm:p-8 md:p-12">
            <img
              src={images[currentIndex]?.url}
              alt={images[currentIndex]?.alt || images[currentIndex]?.name || `Gallery image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={goToNext}
            />
          </div>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export { ListingGallery };
