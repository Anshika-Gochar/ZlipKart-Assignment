import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';


interface Slide {
  title: string;
  subtitle: string;
  badge: string;
  cta: string;
  q: string;
  gradient: string;
  accent: string;
  imageSideText: string;
}

const slides: Slide[] = [
  {
    title: 'Electronics Sale',
    subtitle: 'Up to 80% off on Mobiles, Laptops & Audio',
    badge: 'LIMITED OFFER',
    cta: 'Shop Electronics',
    q: 'electronics',
    gradient: 'from-[#2874f0] to-[#0f52ba]',
    accent: '#fb641b',
    imageSideText: 'LAPTOPS • PHONES • AUDIO',
  },
  {
    title: 'Fashion Fest',
    subtitle: "Min 50% off on Top Brands — Nike, Puma, Levi's & more",
    badge: 'SEASON SALE',
    cta: 'Explore Fashion',
    q: 'fashion',
    gradient: 'from-[#ff6161] to-[#c0392b]',
    accent: '#fff',
    imageSideText: 'SHOES • CLOTHING • ACCESSORIES',
  },
  {
    title: 'Beauty Bonanza',
    subtitle: 'Skincare, Haircare & Makeup — Trusted Brands at Best Prices',
    badge: 'NEW ARRIVALS',
    cta: 'Shop Beauty',
    q: 'beauty',
    gradient: 'from-[#e91e8c] to-[#9c27b0]',
    accent: '#fff',
    imageSideText: 'SERUM • LIPSTICK • TRIMMER',
  },
  {
    title: 'Sports & Fitness',
    subtitle: 'Gym gear, Sports accessories & Protein — All in one place',
    badge: 'FITNESS DEALS',
    cta: 'Get Active',
    q: 'sports',
    gradient: 'from-[#1da462] to-[#0d7a45]',
    accent: '#fff',
    imageSideText: 'YOGA • GYM • OUTDOOR',
  },
  {
    title: 'Home & Kitchen',
    subtitle: 'Cookware, Bedding, Storage — Make your home smarter',
    badge: 'HOME DEALS',
    cta: 'Shop Home',
    q: 'home',
    gradient: 'from-[#ff9f00] to-[#e65100]',
    accent: '#fff',
    imageSideText: 'KITCHEN • BEDROOM • STORAGE',
  },
];

export const HeroCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = slides.length;

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 4000);
  }, [total]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isHovered) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isHovered, startAutoPlay, stopAutoPlay]);

  const goTo = (index: number) => {
    setCurrent((index + total) % total);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(current - 1);
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(current + 1);
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(index);
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-none md:rounded-lg shadow-md"
      style={{ height: undefined }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides track */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <Link
            key={index}
            to={`/products?search=${slide.q}`}
            className="relative flex-shrink-0 w-full flex flex-row overflow-hidden select-none"
            style={{ height: 'clamp(220px, 26vw, 270px)' }}
            draggable={false}
          >
            {/* Left panel — 60% */}
            <div
              className={`relative flex flex-col justify-center px-6 md:px-12 py-8 w-[60%] bg-gradient-to-br ${slide.gradient}`}
            >
              {/* Badge */}
              <span
                className="inline-block self-start mb-3 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
                style={{
                  backgroundColor: slide.accent,
                  color: slide.accent === '#fff' ? '#333' : '#fff',
                }}
              >
                {slide.badge}
              </span>

              {/* Title */}
              <h2 className="text-white font-bold leading-tight mb-2 text-2xl md:text-3xl lg:text-4xl drop-shadow">
                {slide.title}
              </h2>

              {/* Subtitle */}
              <p className="text-white/80 text-xs md:text-sm mb-5 max-w-xs leading-relaxed">
                {slide.subtitle}
              </p>

              {/* CTA Button */}
              <button
                className="self-start px-5 py-2 rounded-full text-sm font-semibold shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95 focus:outline-none"
                style={{
                  backgroundColor: slide.accent,
                  color: slide.accent === '#fff' ? '#333' : '#fff',
                }}
                tabIndex={-1}
              >
                {slide.cta}
              </button>

              {/* Decorative wave / overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)',
                }}
              />
            </div>

            {/* Right panel — 40% */}
            <div
              className={`relative flex flex-col items-center justify-center w-[40%] bg-gradient-to-br ${slide.gradient} brightness-75`}
              style={{ filter: 'brightness(0.72)' }}
            >
              {/* Decorative circle */}
              <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-white/5 border border-white/10" />
              <div className="absolute w-32 h-32 md:w-44 md:h-44 rounded-full bg-white/5 border border-white/10" />

              {/* Category keywords stacked */}
              <div className="relative z-10 flex flex-col items-center gap-1 md:gap-2 px-4 text-center">
                {slide.imageSideText.split(' • ').map((word, wi) => (
                  <span
                    key={wi}
                    className="text-white/30 font-extrabold tracking-widest uppercase"
                    style={{
                      fontSize: 'clamp(0.75rem, 2.5vw, 1.4rem)',
                      lineHeight: 1.1,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Left Arrow */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className={`
          absolute left-3 top-1/2 -translate-y-1/2 z-20
          w-9 h-9 md:w-10 md:h-10 rounded-full
          bg-white/20 hover:bg-white/40 backdrop-blur-sm
          flex items-center justify-center
          text-white shadow-md
          transition-all duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={goNext}
        aria-label="Next slide"
        className={`
          absolute right-3 top-1/2 -translate-y-1/2 z-20
          w-9 h-9 md:w-10 md:h-10 rounded-full
          bg-white/20 hover:bg-white/40 backdrop-blur-sm
          flex items-center justify-center
          text-white shadow-md
          transition-all duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={(e) => handleDotClick(e, index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`
              rounded-full transition-all duration-300 focus:outline-none
              ${
                index === current
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }
            `}
          />
        ))}
      </div>
    </div>
  );
};
