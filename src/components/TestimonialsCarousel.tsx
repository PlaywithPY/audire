'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

type Testimonial = {
  id: number;
  name: string;
  text: string;
  rating: number;
  location: string | null;
  isVisible: boolean;
  isFeatured: boolean;
  googlePhotoUrl: string | null;
  googleAuthorUrl: string | null;
  googleRelativeTime: string | null;
  showAsGoogle: boolean;
};

export default function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  async function fetchTestimonials() {
    try {
      const res = await fetch('/api/testimonials?visible=true&featured=true');
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  }

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg max-w-3xl mx-auto"></div>
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-primary-light/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-text-light text-lg">
            Découvrez les avis de nos clients
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Carousel */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            {!currentTestimonial.showAsGoogle && (
              <div className="absolute top-4 left-4 text-primary/10 text-6xl font-serif">"</div>
            )}

            <div className="relative z-10">
              {currentTestimonial.showAsGoogle ? (
                /* Style Google */
                <div>
                  {/* Header : avatar + nom + logo Google */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      {currentTestimonial.googlePhotoUrl ? (
                        <img
                          src={currentTestimonial.googlePhotoUrl}
                          alt={currentTestimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                          {currentTestimonial.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        {currentTestimonial.googleAuthorUrl ? (
                          <a
                            href={currentTestimonial.googleAuthorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-gray-900 hover:underline"
                          >
                            {currentTestimonial.name}
                          </a>
                        ) : (
                          <p className="font-semibold text-gray-900">{currentTestimonial.name}</p>
                        )}
                        {currentTestimonial.googleRelativeTime && (
                          <p className="text-sm text-gray-500">{currentTestimonial.googleRelativeTime}</p>
                        )}
                      </div>
                    </div>
                    {/* Logo Google */}
                    <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" aria-label="Google">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  {/* Étoiles */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < currentTestimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                      />
                    ))}
                  </div>
                  {/* Texte */}
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {currentTestimonial.text}
                  </p>
                </div>
              ) : (
                /* Style classique */
                <div>
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < currentTestimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xl md:text-2xl text-gray-700 text-center mb-8 leading-relaxed italic">
                    {currentTestimonial.text}
                  </p>
                  <div className="text-center">
                    <p className="font-semibold text-lg text-gray-900">{currentTestimonial.name}</p>
                    {currentTestimonial.location && (
                      <p className="text-text-light mt-1">{currentTestimonial.location}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all hover:scale-110"
                aria-label="Avis précédent"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all hover:scale-110"
                aria-label="Avis suivant"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Dots Navigation */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Aller à l'avis ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
