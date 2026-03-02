import { Calculator, TrendingUp, FileText, ArrowRight } from "lucide-react";

export default function SidebarCalculatorAd() {
    return (
        <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-gray-900 via-gray-700 to-gray-900 mb-6">
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/50 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-blue-500/30 blur-3xl" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                    backgroundSize: '30px 30px'
                }}
            />

            <div className="relative z-10 p-5">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/20 text-white text-xs font-medium mb-3">
                    <Calculator className="w-3.5 h-3.5" />
                    Free Tool
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-2">
                    What's Your Business Worth?
                </h3>

                <p className="text-sm text-gray-300 mb-4">
                    Get an instant valuation estimate with our free SDE calculator.
                </p>

                {/* Mini feature list */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-orange-600/20 flex items-center justify-center shrink-0">
                            <Calculator className="w-3.5 h-3.5 text-orange-500" />
                        </div>
                        <span className="text-xs text-gray-300">SDE calculation with add-backs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="text-xs text-gray-300">Business health metrics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 text-green-400" />
                        </div>
                        <span className="text-xs text-gray-300">Downloadable PDF report</span>
                    </div>
                </div>

                {/* CTA Button */}
                <a
                    href="/resources/calculators/sde-calculator/"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors group"
                >
                    Calculate Your Value
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>
    );
}
