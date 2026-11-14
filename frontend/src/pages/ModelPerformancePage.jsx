import React from 'react';
import ModelPerformanceDashboard from '../components/ModelPerformanceDashboard';

export default function ModelPerformancePage({ onNavigateHome, darkMode }) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <ModelPerformanceDashboard onBackToHome={onNavigateHome} />
    </main>
  );
}
