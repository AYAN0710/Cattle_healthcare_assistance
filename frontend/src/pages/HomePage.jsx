import React from 'react';
import HeroSlideshow from '../components/HeroSlideshow';
import HowItWorks from '../components/HowItWorks';
import FeaturesHighlights from '../components/FeaturesHighlights';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/cnn-prediction');
  };

  return (
    <main>
      <HeroSlideshow onGetStarted={handleGetStarted} />
      <HowItWorks />
      <FeaturesHighlights />
    </main>
  );
}
