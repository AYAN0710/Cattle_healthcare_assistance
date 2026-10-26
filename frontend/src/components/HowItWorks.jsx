import React from 'react';
import { Camera, Cpu, FileSpreadsheet, ShieldCheck, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    num: '1',
    title: '1. Upload Image',
    desc: 'Capture or upload a photo of your cattle.',
    icon: Camera,
  },
  {
    num: '2',
    title: '2. AI Prediction',
    desc: 'Detect diseases with high accuracy.',
    icon: Cpu,
  },
  {
    num: '3',
    title: '3. Health Guidance',
    desc: 'Get symptoms, precautions and expert advice.',
    icon: FileSpreadsheet,
  },
  {
    num: '4',
    title: '4. A Healthier Herd',
    desc: 'Take timely action and prevent further spread.',
    icon: ShieldCheck,
  },
];

export default function HowItWorks() {
  return (
    <section className="section how-it-works-section" id="how-it-works">
      <div className="section-container">
        {/* Section Header */}
        <div className="how-header-grid">
          <div>
            <div className="section-kicker">HOW IT WORKS</div>
            <h2 className="how-title">From Image to Insight</h2>
          </div>
          <div>
            <p className="how-subtitle">
              A simple, powerful way to keep your livestock healthy. Fast disease identification powered by modern computer vision and AI agent guidance.
            </p>
          </div>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="timeline-grid">
          {STEPS.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.num} className="timeline-step-card">
                <div className="timeline-icon-box">
                  <IconComponent size={28} />
                </div>
                <h3 className="timeline-step-title">{step.title}</h3>
                <p className="timeline-step-desc">{step.desc}</p>
                {index < STEPS.length - 1 && (
                  <div className="timeline-arrow">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
