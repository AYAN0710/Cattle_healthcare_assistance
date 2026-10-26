import React from 'react';
import { FileText, Leaf, TrendingUp } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: FileText,
    title: 'Automated Health Reports',
    desc: 'Generate detailed health reports for your cattle with predictions, symptoms and recommendations.',
  },
  {
    icon: Leaf,
    title: 'AI-Powered Analysis',
    desc: 'Fast, reliable and accurate disease detection.',
  },
  {
    icon: TrendingUp,
    title: 'Better Livestock Outcomes',
    desc: 'Healthier cattle, higher productivity, brighter tomorrows.',
  },
];

export default function FeaturesHighlights() {
  return (
    <section className="section" id="features" style={{ paddingTop: '0px', paddingBottom: '70px' }}>
      <div className="section-container">
        <div className="features-highlight-container">
          <div className="features-grid">
            {HIGHLIGHTS.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="feature-item">
                  <div className="feature-icon-wrapper">
                    <IconComp size={24} />
                  </div>
                  <div className="feature-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
