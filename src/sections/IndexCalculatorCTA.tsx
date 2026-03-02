import React from 'react';
import { Calculator, TrendingUp, FileText, ArrowRight } from 'lucide-react';

interface IndexCalculatorCTAProps {
  className?: string;
}

const IndexCalculatorCTA: React.FC<IndexCalculatorCTAProps> = ({ className }) => {
  return (
    <section className={className}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-gray-900 via-gray-700 to-gray-900">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-500/30 blur-3xl" />
          </div>

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <div className="relative z-10 px-8 py-12 md:px-12 md:py-16 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-white text-sm font-medium mb-4">
                  <Calculator className="w-4 h-4" />
                  Free Tool
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  What's Your Restaurant Worth?
                </h2>

                <p className="text-lg text-gray-300 mb-6">
                  Use our free SDE calculator to get an instant estimate of your restaurant's value based on industry-standard multiples and real market data.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/resources/calculators/sde-calculator"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors group"
                  >
                    Calculate Your Value
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    Request Free BPO
                  </a>
                </div>
              </div>

              {/* Feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-md bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-md bg-orange-600/20 flex items-center justify-center mb-3">
                    <Calculator className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">SDE Calculation</h3>
                  <p className="text-gray-400 text-sm">
                    Seller's Discretionary Earnings with all add-backs included
                  </p>
                </div>

                <div className="p-5 rounded-md bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-md bg-blue-500/20 flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">Health Metrics</h3>
                  <p className="text-gray-400 text-sm">
                    Rent ratio, prime cost, and margin benchmarks
                  </p>
                </div>

                <div className="p-5 rounded-md bg-white/5 border border-white/10 backdrop-blur-sm sm:col-span-2">
                  <div className="w-10 h-10 rounded-md bg-green-500/20 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">PDF Report</h3>
                  <p className="text-gray-400 text-sm">
                    Download a professional valuation report with detailed analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndexCalculatorCTA;
