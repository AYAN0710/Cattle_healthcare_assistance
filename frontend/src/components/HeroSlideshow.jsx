import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    url: '/images/cattle1.jpg',
    title: 'Good care, healthier herds.',
    subtitle: 'Detect diseases early, get expert guidance, and keep your livestock healthy with the power of AI.',
  },
  {
    id: 2,
    url: '/images/cattle2.jpg',
    title: 'Precision AI for your cattle.',
    subtitle: 'Instant early disease detection from photo uploads, backed by intelligent RAG health guidance.',
  },
  {
    id: 3,
    url: '/images/cattle3.jpg',
    title: 'A brighter future for livestock.',
    subtitle: 'Turn everyday observations into actionable medical guidance to safeguard your entire farm.',
  },
  {
    id: 4,
    url: '/images/cattle4.jpg',
    title: 'Empowering Smart Farming.',
    subtitle: 'Comprehensive healthcare tools and intelligent insights for sustainable cattle management.',
  },
];

export default function HeroSlideshow({ onGetStarted }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play slideshow timer (every 4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <section className="hero-section" id="hero">
      {/* Background Slideshow Images */}
      <div className="slideshow-background">
        {SLIDES.map((slide, idx) => (
          <img
            key={slide.id}
            src={slide.url}
            alt="Cattle livestock"
            className={`slide-image ${idx === currentIndex ? 'active' : ''}`}
          />
        ))}
        <div className="slideshow-overlay"></div>
      </div>

      {/* Manual Left/Right Arrow Navigation Buttons */}
      <button
        className="slideshow-nav-btn prev"
        onClick={goToPrev}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className="slideshow-nav-btn next"
        onClick={goToNext}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Hero Content Overlay */}
      <div className="hero-content">
        <h1 className="hero-title">{SLIDES[currentIndex].title}</h1>
        <p className="hero-subtitle">{SLIDES[currentIndex].subtitle}</p>
        
        <button className="btn-primary-hero" onClick={onGetStarted}>
          <span>Get Started</span>
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Bottom Pagination Dots */}
      <div className="slideshow-pagination">
        {SLIDES.map((_, idx) => (
          <div
            key={idx}
            className={`dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
            role="button"
            tabIndex={0}
          />
        ))}
      </div>

      {/* Smooth Wave Section Divider SVG with light gradient blend */}
      <div className="hero-wave-divider">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60C240 120 480 120 720 60C960 0 1200 0 1440 60V120H0V60Z"
            fill="#FAF8F3"
          />
        </svg>
      </div>
    </section>
  );
}
