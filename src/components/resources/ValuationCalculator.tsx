"use client";

import { useState, useMemo } from "react";
import { site, fullAddress } from "@/config/site";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { jsPDF } from "jspdf";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Building2,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Gauge,
  Home,
  Users,
  UtensilsCrossed,
  SquareStack,
  FileDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ============================================================================
// INDUSTRY BENCHMARKS (from research)
// ============================================================================

const BENCHMARKS = {
  rent: {
    ideal: { min: 5, max: 8 },
    acceptable: { min: 4, max: 10 },
    label: "Rent to Sales",
    description: "Base rent as % of gross sales",
  },
  occupancy: {
    ideal: { min: 6, max: 10 },
    acceptable: { min: 5, max: 12 },
    label: "Total Occupancy",
    description: "Rent + NNN + CAM as % of gross sales",
  },
  cogs: {
    ideal: { min: 25, max: 35 },
    acceptable: { min: 20, max: 40 },
    label: "Cost of Goods",
    description: "Food & beverage cost as % of gross sales",
  },
  labor: {
    ideal: { min: 25, max: 35 },
    acceptable: { min: 20, max: 40 },
    label: "Labor Cost",
    description: "Total labor as % of gross sales",
  },
  primeCost: {
    ideal: { min: 55, max: 65 },
    acceptable: { min: 50, max: 70 },
    label: "Prime Cost",
    description: "COGS + Labor as % of gross sales",
  },
  profitMargin: {
    ideal: { min: 8, max: 15 },
    acceptable: { min: 5, max: 20 },
    label: "Net Profit Margin",
    description: "Net profit as % of gross sales",
  },
  salesPerSqFt: {
    fullService: { min: 150, target: 250, strong: 325 },
    limitedService: { min: 200, target: 300, strong: 400 },
    label: "Sales per Sq Ft",
    description: "Annual gross sales per square foot",
  },
};

// SDE Multiples by earnings tier
const SDE_MULTIPLES = {
  "under-75k": { low: 1.0, mid: 1.5, high: 2.0, label: "Under $75K" },
  "75k-150k": { low: 1.5, mid: 2.0, high: 2.5, label: "$75K - $150K" },
  "150k-300k": { low: 2.0, mid: 2.5, high: 3.0, label: "$150K - $300K" },
  "300k-500k": { low: 2.25, mid: 2.75, high: 3.25, label: "$300K - $500K" },
  "500k-1m": { low: 2.5, mid: 3.0, high: 3.5, label: "$500K - $1M" },
  "over-1m": { low: 3.0, mid: 3.5, high: 4.0, label: "Over $1M" },
};

const REVENUE_MULTIPLES = {
  low: 0.25,
  mid: 0.275,
  high: 0.30,
};

// Multiple adjustments based on business health
const HEALTH_ADJUSTMENTS = {
  occupancy: {
    good: 0.25,      // Under 10% occupancy = premium
    warning: 0,      // 10-12% = baseline
    danger: -0.5,    // Over 12% = significant discount
  },
  primeCost: {
    good: 0.25,      // Under 65% = premium
    warning: 0,      // 65-70% = baseline
    danger: -0.5,    // Over 70% = discount
  },
  profitMargin: {
    good: 0.25,      // 8%+ margin = premium
    warning: 0,      // 5-8% = baseline
    danger: -0.25,   // Under 5% = discount
  },
  salesPerSqFt: {
    strong: 0.25,    // Above $300/sq ft
    average: 0,      // $200-300/sq ft
    weak: -0.25,     // Below $200/sq ft
  },
};

// ============================================================================
// FORM SCHEMA
// ============================================================================

const formSchema = z.object({
  // Core financials (required for quick calc)
  annualRevenue: z.string().min(1, "Annual revenue is required"),
  netProfit: z.string().min(1, "Net profit is required"),
  ownerSalary: z.string().optional(),

  // Business metrics (optional for health analysis)
  monthlyRent: z.string().optional(),
  monthlyNNN: z.string().optional(),
  annualCOGS: z.string().optional(),
  annualLabor: z.string().optional(),
  squareFootage: z.string().optional(),
  conceptType: z.enum(["full-service", "limited-service", "bar", "other"]).optional(),

  // Additional SDE add-backs
  ownerHealthInsurance: z.string().optional(),
  ownerPerks: z.string().optional(),
  oneTimeExpenses: z.string().optional(),
  depreciation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  return parseFloat(value.replace(/[^0-9.-]/g, "")) || 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatInputCurrency(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return new Intl.NumberFormat("en-US").format(parseInt(num));
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getSDETier(sde: number): keyof typeof SDE_MULTIPLES {
  if (sde < 75000) return "under-75k";
  if (sde < 150000) return "75k-150k";
  if (sde < 300000) return "150k-300k";
  if (sde < 500000) return "300k-500k";
  if (sde < 1000000) return "500k-1m";
  return "over-1m";
}

type HealthStatus = "good" | "warning" | "danger";

function getHealthStatus(
  value: number,
  benchmark: { ideal: { min: number; max: number }; acceptable: { min: number; max: number } }
): HealthStatus {
  if (value >= benchmark.ideal.min && value <= benchmark.ideal.max) return "good";
  if (value >= benchmark.acceptable.min && value <= benchmark.acceptable.max) return "warning";
  return "danger";
}

function HealthIndicator({ status, value, label, benchmark }: {
  status: HealthStatus;
  value: string;
  label: string;
  benchmark: string;
}) {
  const config = {
    good: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    danger: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  };

  const { icon: Icon, color, bg, border } = config[status];

  return (
    <div className={cn("flex items-center justify-between p-3 rounded-lg border", bg, border)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", color)} />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="text-right">
        <span className={cn("text-sm font-semibold", color)}>{value}</span>
        <span className="text-xs text-gray-500 ml-2">target: {benchmark}</span>
      </div>
    </div>
  );
}

// ============================================================================
// PDF GENERATION
// ============================================================================

// Logo as base64 (embedded for PDF generation)
const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ8AAAClCAYAAABC33gCAAAACXBIWXMAAAsSAAALEgHS3X78AAAPOklEQVR4nO2d7XEbRxKGZ678H8oAugjIi4B0BKQjEBwB4QgERSAqAkMRiI7AZASmMiAjODKCuRpdw4Wigfna+Vw8TxVKqiKIXSyxL7p73unWSqlLBQAQx6MVD8NFA4BIfv4XVwwAUkA8ACAJxAMAkkA8ACAJxAMAkvhJKfXApQOASF60MazUAkA8pC0AkATiAQBJIB4AkATiAQBJIB4AkATiAQBJ/FTzsmmtz5VS9vF+7/GWF7vdd+/fR2PMC39egL4o6vPQWltxuJbHxYSX+q6UuldKbY0xjxlPEQASKSIeWmvbYGitlLoq8Id5VkptjDHbAq8NAKFY8cj1kJTkXhoMlX482Ygm5/nvHpHvYVviHCae/23E+d8nHsP5uo7fu6z0+Sj12Ey9NvYaNPxs+D7bweeWrWCqtd4opf6amJ7EsFRKfdNab7XW7yod8xDXDY99jFWH5wQzY7J42BtXa23V7GOjS/PBqmlDAVlorbu5WbXWVswWHZwKzJxJ4iE37H3FaOMYZ40FpKfog6gDqjB1qXYrN24ozyI2T/LvId5L7eQy8rXP5Hxa3MhXdmXJGPPU4Nh/I6tbJYrUAP8gWTykxhHyQX2Vm/o29uaSm2ElKzchobi9idfGmNuY42TiWgqVLemx/gIzJUk85KYOqXHYRkOr1G9k+b2N1trelFasbgJ+zT5/28BYtu5APNaNjx/CS+YGVO+leH6MVzEb5qJpdNkTqZHHJuA5X40xWfJvEYK11vpOKXXniUIWchPXzv2X1kHbysQm7l3XTdQFcn2yDRqTCNj1RWYdygw2K0B0wVSKkh88T3vIJRz7GGPuAz94142Kpy2/+UeIOmBGpKy2hIhCsW99+eb6zfO0RaP8v2XNgXoHVCVFPHzf/F9LrzpIQfTZ87SSN9OxYzfxfMgxj6VyvusEkESKeJx7fn5X6U/hq7uUzHNd+2p6i3hq/T3gxEgRD19RrlbB0HdTLGRVqAQu8bgqeNx/EODtaL0CBDMlezOgWkYpWYHxLfkVuYnlPbqOXTP6cB3re2vjGsyX0TuJHXOp7vClWFNwRR81Vz5cxyLqgGJkFw/xG9TClyKVXK69EwPSIZY1rkOAt4N6BxSjRBvCy4p1Dxt5/Oz4ebGQ3aZNYlo75nlZVzCquaKOr7RvhJKkiMerx+G5rmUPl2P4UpeSbB3iUaPuwSoLNCMlbfFFFctTybXF8drE8+HzdhhjEA8oSop4hHwoP9gGQY07fNWileeDqAOaUko8lDQIerJb5Gf+J67u+cDbAT0QLR7iG/gS+HQbVn/WWtvi4m3llZgqNPJ84O2A5qQu1W4i90wspBfHX1rrJxGSVjtfS1Db84G3A5qTJB6yynHt8Dm4WIqQfFNK/VfE5M6mNzLvZUSqeT7kGuHtgOYkm8T2mrqkCMg+S8nfPyul/tRaGym2DhOdiJi6btqc0YdrBQdvB1RjkknMCoh8q95FNiv2cSGPH20Htda7cZN3sjzaI8U9HyKkrLKMz6phlJ2tgD/ZYSrFuXNZVdkUmhlyJo8brfWr3CR3PXkZrKhprZ+PpBQ/PB8ZRmS6ZrLg7RgHXye+Ici2t0Ua9FhV+1S4Ac1CLv43qZdsOkptSns+XCkLwgFVyboxzubbxhg7y9OKyC82B89QE3GxlOa3vfhJink+5Hddw7VYZYGqFNuSb0No2wTZGGOjgv9IRJKz5f4+Oz/JY0svSWHPhyvqwNsB1anSz8MWViUisRO4teyE3YlJzshkN3ayZTPgUp4Pl3gQdUB1mjQDssXFPTHZRSa/SprzfeLLL6Qe0kpAsns+8HZAj5To5xGNeEYed9/aUgC93HukLANv7U1XewhToT4feDvmxW8Ve9685TaXraIL8XjLnunqxzfq3szaVcRUtIWIUYsaiNPzYcUx9IbH2zFLHlv5lew+s1yvNUQPU1sM3FvF+TViKfisxRwVX5+PyMIp3g7okuEaIIvR6lzqIyGEzNUtgatwGiNoeDugS4bsni5+kpVEIT6WjYqnLvG4CPF84O2Anhl69IJEISG9RarXPQI8H1Nn/uLtgKYEF0ytDdzx46cM+zZS2UhdwFVIbbUJaeuIHFYBKRXeDuiWmNWWj46fPXjC9GLsLY3eOI5RbfzjG+7kJj9U8FzKUvLBqjveDuidmLTF5QRt3V7QdyOFLu9mJaDPhyuywNsBXRMjHi5Ty+JEOqWn4Nxpe+i64e2AEYgRD9833agtBIuS6PnA2wHdkyvyUJUnw49GrOfDtYEO4YAuiBEPn522Zb9RX82lVCuAUII9H/J/194DVlmgC4LFI8CLv2jo5vSlTE39EJGeD1fUgbcDuiHWJOazhN/UbuwaMD1NNR6GvSM0dXGlf0Qd0A2x4hHi5bir3M0r5IbqQTx8fT4uxUaPtwOGIEo8JHXx1Q8W0s2ruIBI31Jf1PG1h1A/0PPhijrwdkBXpOxtCWmltxOQYtvhxS7/OeCpreowh/B1V3e15CfqgK5IGXT9GLgZzQrI7zL9LVsdRML7e49dfseXngqMAZ6PY+DtgO5InVW7jug1eiFjJB9lHm30PhO7BGyjGBGNPz3b1Hd8l/PsjZQ9QAgHdMeUNoSXUogM7Yd4JmnGZ5mstutb+nLAgGbrJe/kX5/v4RDPHTtet4FR0z6sskB3JIuH7GaNFZAdy70B17mxEdGq1+KiTaO01g+B0ZPC2wG9MqkZkNyglxEtAUtjb8rqHdMTiEldiDqgSyZ3EttrCfhL4dGSLuxxf5M5MN0vZ0rjpNBrRb0DuiTnoOu7vUHXNUXERj3nMmh7JEJEAW8HdEuRQdciIr9mmP52jGcRqX/LPNwRawIhYkfUAd1SZOiTfFtuZWrb+zfT31K6eu1WZ2xx9n6AmoYX+x5k1enY9cDbAV1TfGKcRAXb/SLhnmnMtZy624/y2CB031baD7NyXIOcAvnJ8bPUqM31mjXx/Z1aRKW+a9MyUvZ9toPPTRtj8pwSAJwUQ89tAYB2IB4AkATiAQBJIB4AkATiAQBJIB4AkATiAQBJIB4AkATiAQBJNBcPrbXd/2I8j6p7WWxzZc/59DDK4SCjnrv0pvV9Dlo/gq6d9O31nWux5uAB55fl89FUPGQ8patj+I6zyrNgAEpz23A8axZaRx4xw7F7bGYMkMoisRl2N7QWjxhBaDlIG6AEVzIlcEiaiYekITGNkxeRkQrACGxH/VJsGXmkpCHNikwAhVh0NtUwmOLNgBykRBEXtjMZowhOktfMDZJSKHX8G631nUwUHIYm4iHLVMfGK+6aJx/7+Zri6UliO8r1OsgrBzZ9OR+p4XWrtMWVfmwDpskDzI3laOlLdfGQhsiuaWk+8ViMXKEGcHCTcyh8aVpEHq6Uw3YMf5Su4a7ZL0QfMFeGmT/UQjxcUcP+hXMZaK5Spu0DDIB1Uw+RvlQVD0k3XHNb9tMVn/uO6ANG5YvnvD+OsB2jduThuuEf9pdgZbDTc+JrAfTMxvPZViNY16uJh6QZV46nHLpYrgu4pHAKIyLLsT67QffpS83Iw3ejH1ph8akv4gFDIosCf3jOfd1zba+meLiU9uA0eEljXMOyP7BZDgZm5VlV7HrnbRXxkLXr0ELpWyicwiyRL0zf59duyejSUV0r8nBdoFfPNHifeGBVh2EJTF82PaYvxcUjoFuYUxxEnV0XdzmSKw/gAOsR05cakYcvLAu5KK7IJOQYAN0itT3fyspFb6uLrcXjWfwcPnx2dbqMwdAYY6y7+sHzHrpqHFRUPAK6hQX5+CV1cW6WY9kWZsBQqy+lIw9fMdOXjsQ8l8IpDE1g+tJN39Ni4iHhletNPsR0BAvYact4BhiewPSli7ENJTuJXTu6ganE8Mv+zo3j5ysikNnyvqFd+75yi0D7Gf7L8fNd46Cmn/WS4uFbAYlJWXYgHqeLvWE+Nnz31cTDLiJorT953m/zvqdF0paAbmEH7eg+AnbaLlqO8QPIhTFm49maoVqvvpSqeeQslL4FuzqcCr7PctO+p6XEY4od3YdPPC7oMgZzQCLtT563ctNqoSC7eMgyUu5C6d8E7LRV1D1gRtz22jioROSRw47ugz4fcBIE7rxt0jgo62pLQLewUDu6Dysenx3P+dFlbGJ6BH3xvWFE2XRCoV1R0Vp/8aw0fpTVl2pT9XIv1foUMktbeavGWus/PEK1mliYhb54GW0cY2Y2ElG7+uLYL9Vq9Y/a4vGScfu879vgirm2MBfkC9PeX3863pJNX9biUi1ONvEI6BZm+b3y33I16gRygLdI+uKLuDeSvhT/0sxZMO3RX4HnA+ZGNztvs4hHQLewVtBlDGZFT31Pc0UePX/DE33ArOil7+kpiAfjGWCOhKQvRQunk8UjoFtYDxB9wKwInDpXtHFQjtUW3xuw4VVp48q1R8DWpVUYoDbGmK0s37p2sG/FshC9i93HJPEI6BZmWZdeNtJaP3mWgW3h9Lym+w6gEiv5cj62n2y3+pI9Apmatvg2wUW1GpxAiJOUzXIwOyL6nmZfdZwqHjU2wXmRkOyr53mMZ4BZ0mpsQ7J4BHQLe628t8R3LMYzwJyp3jhoSuTh7RZWokhzjIDu6orUBeaKpC8hjYOypS9TxKOLlCXymGd0GYO5Etr3NNfbTxIPWR5yFUqfG22fDrkwRB8wZ0LSlyykRh6+2kGTPhoB3dUVhjGYM4F9T7MQLR4B3cJUY0OW79iMZ4BZE5i+TCYl8vDdeN8bN+AJiXoQD5g7xdPzFIdplVaDqVjh0lo/eJaRLyZ2GWs5+nD3zZLKqOfe9Lx3TLz21QjsezoNY0zwQ2odxvN4F/OaJR4icL7z3Bw7tqyH+36/2cN1zUY9d6XUZc/n7Tv/N+/lfupr5HjYe1Hadca8x/vQY8emLb5CadIYyQKQusDJE9g4KJlg8QjsFtZFt/JAu/qy5HZlgB4Qy8SXEqcSE3n4FOy5szkpRB8A/2cT4L6OJkY8Sg6vzk6gXf0KxynMnVLpS5B4SLcwnzOtx2Y7IY5TUheYPYF9T6MIXap953GtvXQ6XMkKmq+Ae+jnI08mG/XcQzZ2jcK207/DKiCDCL6PtSzpAABEUWJKPgCcAIgHACSBeABAEogHACSBeABAEogHACSBeABAEogHACShc89yAICTYKulAQgAQAw/k7YAQBKIBwAkgXgAQBKIBwAkgXgAQBI/zagBCwDUQqmn/wFSVXQAXmL8ZAAAAABJRU5ErkJggg==";

interface PDFReportData {
  revenue: number;
  netProfit: number;
  sde: number;
  percentages: {
    rent: number;
    occupancy: number;
    cogs: number;
    labor: number;
    primeCost: number;
    profitMargin: number;
    sdeMargin: number;
  } | null;
  salesPerSqFt: number;
  valuations: {
    sde: {
      low: number;
      high: number;
      baseMultiples: { low: number; high: number; label: string };
      adjustedMultiples: { low: number; high: number; label: string };
      tier: string;
      adjustments: { factor: string; value: number; reason: string }[];
      totalAdjustment: number;
    };
    revenue: {
      low: number;
      high: number;
    };
  };
  hasMetrics: boolean;
}

function generatePDFReport(data: PDFReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  const headerHeight = 35;
  const footerHeight = 25;
  const contentStartY = margin + headerHeight;
  const contentEndY = pageHeight - footerHeight;

  // Colors
  const primaryColor: [number, number, number] = [31, 41, 55]; // gray-800
  const secondaryColor: [number, number, number] = [107, 114, 128]; // gray-500
  const accentColor: [number, number, number] = [79, 70, 229]; // primary/indigo

  // Track current Y position
  let y = contentStartY;

  // Get current date
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // === HEADER FUNCTION (called on each page) ===
  const addHeader = () => {
    // Add logo
    try {
      doc.addImage(LOGO_BASE64, "PNG", margin, margin, 20, 12);
    } catch {
      // Fallback to text if logo fails
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text(site.name, margin, margin + 8);
    }

    // Add contact info on right
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text(site.contact.phone, pageWidth - margin, margin + 4, { align: "right" });
    doc.text(site.domain, pageWidth - margin, margin + 9, { align: "right" });
  };

  // === FOOTER FUNCTION (called on each page) ===
  const addFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - footerHeight + 5;

    // Footer line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    // Address
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(fullAddress, margin, footerY + 8);

    // Page number
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY + 8, { align: "right" });
  };

  // === CHECK IF NEW PAGE NEEDED ===
  const checkNewPage = (requiredSpace: number): void => {
    if (y + requiredSpace > contentEndY) {
      doc.addPage();
      addHeader();
      y = contentStartY;
    }
  };

  // === HELPER FUNCTIONS ===
  const addLine = (yPos: number) => {
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  const addSectionHeader = (title: string): number => {
    checkNewPage(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text(title, margin, y);
    y += 8;
    return y;
  };

  const addKeyValue = (key: string, value: string, highlight = false): number => {
    checkNewPage(8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text(key, margin, y);

    doc.setFont("helvetica", highlight ? "bold" : "normal");
    doc.setTextColor(...(highlight ? accentColor : primaryColor));
    doc.text(value, pageWidth - margin, y, { align: "right" });
    y += 6;
    return y;
  };

  // === START BUILDING PDF ===
  addHeader();

  // Report title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text("SDE Valuation Report", margin, y);
  y += 6;

  // Generated date below title
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text(`Generated: ${today}`, margin, y);
  y += 10;

  // === ESTIMATED VALUE RANGE ===
  checkNewPage(40);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y - 4, contentWidth, 28, 3, 3, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text("ESTIMATED VALUE RANGE", margin + 8, y + 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...accentColor);
  doc.text(
    `${formatCurrency(data.valuations.sde.low)} - ${formatCurrency(data.valuations.sde.high)}`,
    margin + 8,
    y + 16
  );
  y += 36;

  // === FINANCIAL SUMMARY ===
  addSectionHeader("Financial Summary");
  y += 2;

  addKeyValue("Annual Gross Sales", formatCurrency(data.revenue));
  addKeyValue("Net Profit", formatCurrency(data.netProfit));
  addKeyValue("Seller's Discretionary Earnings (SDE)", formatCurrency(data.sde), true);

  if (data.percentages) {
    addKeyValue("Net Profit Margin", formatPercent(data.percentages.profitMargin));
    addKeyValue("SDE Margin", formatPercent(data.percentages.sdeMargin));
  }
  y += 6;

  // === VALUATION METHODOLOGY ===
  addSectionHeader("Valuation Methodology");
  y += 2;

  // SDE Method
  checkNewPage(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text("SDE Method (Primary)", margin, y);
  y += 6;

  const tierLabel = SDE_MULTIPLES[data.valuations.sde.tier as keyof typeof SDE_MULTIPLES]?.label || data.valuations.sde.tier;
  addKeyValue("SDE Tier", tierLabel);
  addKeyValue("Base Multiple Range", `${data.valuations.sde.baseMultiples.low}x - ${data.valuations.sde.baseMultiples.high}x`);

  if (data.valuations.sde.totalAdjustment !== 0) {
    const adjSign = data.valuations.sde.totalAdjustment > 0 ? "+" : "";
    addKeyValue("Health Adjustment", `${adjSign}${data.valuations.sde.totalAdjustment.toFixed(2)}x`);
    addKeyValue(
      "Adjusted Multiple Range",
      `${data.valuations.sde.adjustedMultiples.low.toFixed(2)}x - ${data.valuations.sde.adjustedMultiples.high.toFixed(2)}x`,
      true
    );
  }
  addKeyValue("SDE Value Range", `${formatCurrency(data.valuations.sde.low)} - ${formatCurrency(data.valuations.sde.high)}`, true);
  y += 4;

  // Revenue Method
  checkNewPage(24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text("Revenue Method (Secondary)", margin, y);
  y += 6;

  addKeyValue("Multiple Range", "0.25x - 0.30x");
  addKeyValue("Revenue Value Range", `${formatCurrency(data.valuations.revenue.low)} - ${formatCurrency(data.valuations.revenue.high)}`);
  y += 6;

  // === HEALTH ADJUSTMENTS (if any) ===
  if (data.valuations.sde.adjustments.length > 0) {
    addSectionHeader("Multiple Adjustments Applied");
    y += 2;

    data.valuations.sde.adjustments.forEach((adj) => {
      const sign = adj.value > 0 ? "+" : "";
      addKeyValue(`${adj.factor}: ${adj.reason}`, `${sign}${adj.value.toFixed(2)}x`);
    });
    y += 6;
  }

  // === BUSINESS METRICS (if provided) ===
  if (data.hasMetrics && data.percentages) {
    addSectionHeader("Business Health Metrics");
    y += 2;

    if (data.percentages.occupancy > 0) {
      addKeyValue("Total Occupancy (Rent + NNN)", formatPercent(data.percentages.occupancy));
    }
    if (data.percentages.cogs > 0) {
      addKeyValue("Cost of Goods Sold", formatPercent(data.percentages.cogs));
    }
    if (data.percentages.labor > 0) {
      addKeyValue("Labor Cost", formatPercent(data.percentages.labor));
    }
    if (data.percentages.primeCost > 0) {
      addKeyValue("Prime Cost (COGS + Labor)", formatPercent(data.percentages.primeCost));
    }
    if (data.salesPerSqFt > 0) {
      addKeyValue("Sales per Square Foot", `${formatCurrency(data.salesPerSqFt)}/year`);
    }
    y += 6;
  }

  // === DISCLAIMER ===
  checkNewPage(50);
  addLine(y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("Important Disclaimer", margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  const disclaimer =
    "This report provides estimates based on industry-standard SDE multiples and the information provided. " +
    "Actual business value depends on many factors including but not limited to: lease terms, location, " +
    "equipment condition, brand value, market conditions, and buyer demand. This is not a formal appraisal " +
    `or broker price opinion. For an accurate valuation of your business, please contact ${site.name} ` +
    "for a confidential consultation.";

  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(disclaimerLines, margin, y);
  y += disclaimerLines.length * 4;

  // === CONTACT CTA ===
  checkNewPage(28);
  doc.setFillColor(...accentColor);
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Ready for a professional broker price opinion?", pageWidth / 2, y + 8, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Contact us: ${site.contact.phone} | ${site.contact.email}`, pageWidth / 2, y + 14, { align: "center" });

  // === ADD FOOTERS TO ALL PAGES ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  // Open in new tab instead of downloading
  const pdfUrl = doc.output("bloburl");
  window.open(pdfUrl, "_blank");
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ValuationCalculator() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAddBacks, setShowAddBacks] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annualRevenue: "",
      netProfit: "",
      ownerSalary: "",
      monthlyRent: "",
      monthlyNNN: "",
      annualCOGS: "",
      annualLabor: "",
      squareFootage: "",
      conceptType: "full-service",
      ownerHealthInsurance: "",
      ownerPerks: "",
      oneTimeExpenses: "",
      depreciation: "",
    },
  });

  const watchedValues = form.watch();

  // Calculate all metrics in real-time
  const calculations = useMemo(() => {
    const revenue = parseNumber(watchedValues.annualRevenue);
    const netProfit = parseNumber(watchedValues.netProfit);
    const ownerSalary = parseNumber(watchedValues.ownerSalary);
    const monthlyRent = parseNumber(watchedValues.monthlyRent);
    const monthlyNNN = parseNumber(watchedValues.monthlyNNN);
    const annualCOGS = parseNumber(watchedValues.annualCOGS);
    const annualLabor = parseNumber(watchedValues.annualLabor);
    const squareFootage = parseNumber(watchedValues.squareFootage);
    const ownerHealthInsurance = parseNumber(watchedValues.ownerHealthInsurance);
    const ownerPerks = parseNumber(watchedValues.ownerPerks);
    const oneTimeExpenses = parseNumber(watchedValues.oneTimeExpenses);
    const depreciation = parseNumber(watchedValues.depreciation);

    // Core calculations
    const annualRent = monthlyRent * 12;
    const annualOccupancy = (monthlyRent + monthlyNNN) * 12;
    const primeCost = annualCOGS + annualLabor;

    // SDE calculation
    const sde = netProfit + ownerSalary + ownerHealthInsurance + ownerPerks + oneTimeExpenses + depreciation;

    // Percentages (only if revenue > 0)
    const percentages = revenue > 0 ? {
      rent: (annualRent / revenue) * 100,
      occupancy: (annualOccupancy / revenue) * 100,
      cogs: (annualCOGS / revenue) * 100,
      labor: (annualLabor / revenue) * 100,
      primeCost: (primeCost / revenue) * 100,
      profitMargin: (netProfit / revenue) * 100,
      sdeMargin: (sde / revenue) * 100,
    } : null;

    // Sales per square foot
    const salesPerSqFt = squareFootage > 0 ? revenue / squareFootage : 0;

    // Calculate multiple adjustments based on business health
    const adjustments: { factor: string; value: number; reason: string }[] = [];
    let totalAdjustment = 0;

    // Occupancy adjustment (only if entered)
    if (percentages && percentages.occupancy > 0) {
      const occupancyStatus = getHealthStatus(percentages.occupancy, BENCHMARKS.occupancy);
      const adj = HEALTH_ADJUSTMENTS.occupancy[occupancyStatus];
      if (adj !== 0) {
        adjustments.push({
          factor: "Occupancy",
          value: adj,
          reason: occupancyStatus === "good"
            ? `${formatPercent(percentages.occupancy)} (healthy)`
            : `${formatPercent(percentages.occupancy)} (high)`,
        });
        totalAdjustment += adj;
      }
    }

    // Prime cost adjustment (only if both COGS and labor entered)
    if (percentages && percentages.primeCost > 0) {
      const primeStatus = getHealthStatus(percentages.primeCost, BENCHMARKS.primeCost);
      const adj = HEALTH_ADJUSTMENTS.primeCost[primeStatus];
      if (adj !== 0) {
        adjustments.push({
          factor: "Prime Cost",
          value: adj,
          reason: primeStatus === "good"
            ? `${formatPercent(percentages.primeCost)} (efficient)`
            : `${formatPercent(percentages.primeCost)} (high)`,
        });
        totalAdjustment += adj;
      }
    }

    // Profit margin adjustment
    if (percentages && percentages.profitMargin > 0) {
      const marginStatus = getHealthStatus(percentages.profitMargin, BENCHMARKS.profitMargin);
      const adj = HEALTH_ADJUSTMENTS.profitMargin[marginStatus];
      if (adj !== 0) {
        adjustments.push({
          factor: "Profit Margin",
          value: adj,
          reason: marginStatus === "good"
            ? `${formatPercent(percentages.profitMargin)} (strong)`
            : `${formatPercent(percentages.profitMargin)} (weak)`,
        });
        totalAdjustment += adj;
      }
    }

    // Sales per sq ft adjustment
    if (salesPerSqFt > 0) {
      let sqftStatus: "strong" | "average" | "weak" = "average";
      if (salesPerSqFt >= 300) sqftStatus = "strong";
      else if (salesPerSqFt < 200) sqftStatus = "weak";

      const adj = HEALTH_ADJUSTMENTS.salesPerSqFt[sqftStatus];
      if (adj !== 0) {
        adjustments.push({
          factor: "Sales/Sq Ft",
          value: adj,
          reason: sqftStatus === "strong"
            ? `${formatCurrency(salesPerSqFt)}/yr (strong)`
            : `${formatCurrency(salesPerSqFt)}/yr (weak)`,
        });
        totalAdjustment += adj;
      }
    }

    // Valuations with adjustments
    const sdeTier = getSDETier(sde);
    const baseMultiples = SDE_MULTIPLES[sdeTier];

    // Apply adjustments to multiples (floor at 0.5x minimum)
    const adjustedMultiples = {
      low: Math.max(0.5, baseMultiples.low + totalAdjustment),
      mid: Math.max(0.75, baseMultiples.mid + totalAdjustment),
      high: Math.max(1.0, baseMultiples.high + totalAdjustment),
      label: baseMultiples.label,
    };

    const valuations = {
      sde: {
        low: sde * adjustedMultiples.low,
        mid: sde * adjustedMultiples.mid,
        high: sde * adjustedMultiples.high,
        baseMultiples: baseMultiples,
        adjustedMultiples: adjustedMultiples,
        tier: sdeTier,
        adjustments: adjustments,
        totalAdjustment: totalAdjustment,
      },
      revenue: {
        low: revenue * REVENUE_MULTIPLES.low,
        mid: revenue * REVENUE_MULTIPLES.mid,
        high: revenue * REVENUE_MULTIPLES.high,
      },
    };

    return {
      revenue,
      netProfit,
      sde,
      percentages,
      salesPerSqFt,
      valuations,
      hasMetrics: monthlyRent > 0 || annualCOGS > 0 || annualLabor > 0,
    };
  }, [watchedValues]);

  // Quick valuation (always visible as user types)
  const quickValuation = useMemo(() => {
    if (calculations.sde <= 0) return null;
    const { adjustedMultiples, baseMultiples, totalAdjustment, adjustments } = calculations.valuations.sde;
    return {
      low: calculations.valuations.sde.low,
      high: calculations.valuations.sde.high,
      method: "SDE",
      baseMultiple: `${baseMultiples.low}x - ${baseMultiples.high}x`,
      adjustedMultiple: `${adjustedMultiples.low.toFixed(2)}x - ${adjustedMultiples.high.toFixed(2)}x`,
      hasAdjustments: totalAdjustment !== 0,
      totalAdjustment,
      adjustments,
    };
  }, [calculations]);

  function handleCurrencyInput(
    e: React.ChangeEvent<HTMLInputElement>,
    field: { onChange: (value: string) => void }
  ) {
    const formatted = formatInputCurrency(e.target.value);
    field.onChange(formatted);
  }

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Input Form - Wider */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Calculator Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <Calculator className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 m-0">Quick Valuation Estimate</h3>
                <p className="text-sm text-gray-500 m-0">Enter Basic Numbers For An Instant Estimate</p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-5">
                {/* Core Financials Grid */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="annualRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Annual Gross Sales
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              className="bg-white pl-7 text-lg font-medium"
                              placeholder="1,200,000"
                              {...field}
                              onChange={(e) => handleCurrencyInput(e, field)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="netProfit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Net Profit
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              className="bg-white pl-7 text-lg font-medium"
                              placeholder="120,000"
                              {...field}
                              onChange={(e) => handleCurrencyInput(e, field)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Salary</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              className="bg-white pl-7 text-lg font-medium"
                              placeholder="75,000"
                              {...field}
                              onChange={(e) => handleCurrencyInput(e, field)}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Live SDE Display */}
                {calculations.sde > 0 && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mt-0">Seller's Discretionary Earnings (SDE)</p>
                      <p className="text-xs text-gray-500 mt-0">Net Profit + Owner Salary + Add-backs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculations.sde)}</p>
                      {calculations.percentages && (
                        <p className="text-sm text-gray-500 mt-0">
                          {formatPercent(calculations.percentages.sdeMargin)} of revenue
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Add-backs */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAddBacks(!showAddBacks)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Additional SDE Add-backs</span>
                    </div>
                    {showAddBacks ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {showAddBacks && (
                    <div className="p-4 space-y-4 bg-gray-50/50">
                      <p className="text-xs text-gray-500">
                        Add-backs increase your SDE and business value. Common items include owner benefits, perks, and non-recurring expenses.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="ownerHealthInsurance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Owner Health Insurance</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <Input
                                    className="bg-white pl-7"
                                    placeholder="18,000"
                                    {...field}
                                    onChange={(e) => handleCurrencyInput(e, field)}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ownerPerks"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Owner Perks (Auto, Phone, etc.)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <Input
                                    className="bg-white pl-7"
                                    placeholder="12,000"
                                    {...field}
                                    onChange={(e) => handleCurrencyInput(e, field)}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="oneTimeExpenses"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">One-Time Expenses</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <Input
                                    className="bg-white pl-7"
                                    placeholder="10,000"
                                    {...field}
                                    onChange={(e) => handleCurrencyInput(e, field)}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="depreciation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Depreciation</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <Input
                                    className="bg-white pl-7"
                                    placeholder="15,000"
                                    {...field}
                                    onChange={(e) => handleCurrencyInput(e, field)}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {/* Business Health Analysis */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-start gap-3">
                <Gauge className="w-5 h-5 text-blue-600 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 m-0">Business Health Analysis</h3>
                  <p className="text-sm text-gray-500 m-0">Add Additional Metrics To See If Your Numbers Are In Healthy Ranges</p>
                </div>
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-6 space-y-6">
                <Form {...form}>
                  <form className="space-y-6">
                    {/* Occupancy Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-gray-500" />
                        <h4 className="font-medium text-gray-700">Occupancy Costs</h4>
                        <span className="text-xs text-gray-400 ml-auto">Target: 6-10% of sales</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="monthlyRent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Monthly Base Rent</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <Input
                                    className="bg-white pl-7"
                                    placeholder="8,000"
                                    {...field}
                                    onChange={(e) => handleCurrencyInput(e, field)}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="monthlyNNN"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm flex items-center gap-1">
                                Monthly NNN/CAM
                                <HelpCircle className="w-3 h-3 text-gray-400" />
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <Input
                                    className="bg-white pl-7"
                                    placeholder="1,500"
                                    {...field}
                                    onChange={(e) => handleCurrencyInput(e, field)}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      {calculations.percentages && calculations.percentages.occupancy > 0 && (
                        <HealthIndicator
                          status={getHealthStatus(calculations.percentages.occupancy, BENCHMARKS.occupancy)}
                          value={formatPercent(calculations.percentages.occupancy)}
                          label="Total Occupancy"
                          benchmark="6-10%"
                        />
                      )}
                    </div>

                    {/* COGS & Labor Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-gray-500" />
                        <h4 className="font-medium text-gray-700">Prime Cost (COGS + Labor)</h4>
                        <span className="text-xs text-gray-400 ml-auto">Target: 55-65% of sales</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="annualCOGS"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Annual Food & Bev Cost</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <Input
                                    className="bg-white pl-7"
                                    placeholder="360,000"
                                    {...field}
                                    onChange={(e) => handleCurrencyInput(e, field)}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="annualLabor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Annual Labor Cost</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <Input
                                    className="bg-white pl-7"
                                    placeholder="350,000"
                                    {...field}
                                    onChange={(e) => handleCurrencyInput(e, field)}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        {calculations.percentages && calculations.percentages.cogs > 0 && (
                          <HealthIndicator
                            status={getHealthStatus(calculations.percentages.cogs, BENCHMARKS.cogs)}
                            value={formatPercent(calculations.percentages.cogs)}
                            label="Food & Bev Cost"
                            benchmark="25-35%"
                          />
                        )}
                        {calculations.percentages && calculations.percentages.labor > 0 && (
                          <HealthIndicator
                            status={getHealthStatus(calculations.percentages.labor, BENCHMARKS.labor)}
                            value={formatPercent(calculations.percentages.labor)}
                            label="Labor Cost"
                            benchmark="25-35%"
                          />
                        )}
                        {calculations.percentages && calculations.percentages.primeCost > 0 && (
                          <HealthIndicator
                            status={getHealthStatus(calculations.percentages.primeCost, BENCHMARKS.primeCost)}
                            value={formatPercent(calculations.percentages.primeCost)}
                            label="Prime Cost"
                            benchmark="55-65%"
                          />
                        )}
                      </div>
                    </div>

                    {/* Square Footage */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <SquareStack className="w-4 h-4 text-gray-500" />
                        <h4 className="font-medium text-gray-700">Sales Efficiency</h4>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="squareFootage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Total Square Feet</FormLabel>
                              <FormControl>
                                <Input
                                  className="bg-white"
                                  placeholder="2,500"
                                  {...field}
                                  onChange={(e) => {
                                    const num = e.target.value.replace(/[^0-9]/g, "");
                                    field.onChange(num ? new Intl.NumberFormat("en-US").format(parseInt(num)) : "");
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="conceptType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Concept Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="full-service">Full Service Restaurant</SelectItem>
                                  <SelectItem value="limited-service">QSR / Fast Casual</SelectItem>
                                  <SelectItem value="bar">Bar / Nightclub</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      {calculations.salesPerSqFt > 0 && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-sm font-medium text-gray-700">Sales per Sq Ft</span>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(calculations.salesPerSqFt)}/year
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              target: $200-400+
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>

          {/* Industry Benchmarks Reference */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="font-medium text-sm text-blue-800 m-0">Industry Benchmark Reference</p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-blue-800">
              <div className="flex justify-between gap-4">
                <span>Rent to Sales:</span>
                <span className="font-medium">5-8%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Total Occupancy:</span>
                <span className="font-medium">6-10%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Food & Bev (COGS):</span>
                <span className="font-medium">25-35%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Labor:</span>
                <span className="font-medium">25-35%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Prime Cost (COGS+Labor):</span>
                <span className="font-medium">55-65%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Net Profit Margin:</span>
                <span className="font-medium">5-15%</span>
              </div>
            </div>
          </div>

          {/* Factors That Affect Multiple */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="font-medium text-sm text-amber-800 m-0">Factors That Affect Your Multiple</p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-amber-800">
              <div>Lease terms (5+ years remaining = higher)</div>
              <div>Rent under 8% of sales = higher multiple</div>
              <div>Growing revenue trends = higher multiple</div>
              <div>Absentee ownership = higher multiple</div>
              <div>Type 47 liquor license = premium value</div>
              <div>Strong location/visibility = higher</div>
            </div>
          </div>
        </div>

        {/* Results Panel - Narrower, Sticky */}
        <div className="lg:col-span-2 space-y-6">
          <div className="lg:sticky lg:top-6 space-y-6">
            {/* Quick Valuation Result */}
            {quickValuation ? (
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Estimated Value Range</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-3">
                  {formatCurrency(quickValuation.low)} - {formatCurrency(quickValuation.high)}
                </div>
                <div className="pt-3 border-t border-white/20 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">SDE Tier:</span>
                    <span className="font-medium">{SDE_MULTIPLES[calculations.valuations.sde.tier].label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Base Multiple:</span>
                    <span className="font-medium">{quickValuation.baseMultiple}</span>
                  </div>
                  {quickValuation.hasAdjustments && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="opacity-80">Adjusted Multiple:</span>
                        <span className={cn(
                          "font-medium",
                          quickValuation.totalAdjustment > 0 ? "text-green-300" : "text-red-300"
                        )}>
                          {quickValuation.adjustedMultiple}
                        </span>
                      </div>
                      <p className="text-xs text-white mt-1">
                        Base multiple adjusted for business health metrics.
                      </p>
                    </>
                  )}
                </div>

                {/* Show adjustments breakdown */}
                {quickValuation.adjustments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs text-white font-semibold opacity-80 m-0 mb-1">Multiple Adjustments:</p>
                    <div className="space-y-1">
                      {quickValuation.adjustments.map((adj, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="opacity-70">{adj.factor}: {adj.reason}</span>
                          <span className={cn(
                            "font-medium",
                            adj.value > 0 ? "text-green-300" : "text-red-300"
                          )}>
                            {adj.value > 0 ? "+" : ""}{adj.value.toFixed(2)}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download PDF Button */}
                <button
                  type="button"
                  onClick={() => generatePDFReport(calculations)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Download PDF Report
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4 inline-block">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Valuation Estimate Will Appear Here</h3>
                <p className="text-sm text-gray-500">
                  Start with gross sales and net profit to see an instant valuation estimate
                </p>
              </div>
            )}

            {/* Valuation Breakdown */}
            {calculations.sde > 0 && (() => {
              const sdeMid = (calculations.valuations.sde.low + calculations.valuations.sde.high) / 2;
              const revenueMid = (calculations.valuations.revenue.low + calculations.valuations.revenue.high) / 2;
              const sdeIsHigher = sdeMid >= revenueMid;

              return (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Valuation Methods
                  </h4>

                  <div className="space-y-4">
                    {/* SDE Method */}
                    <div className={cn(
                      "p-4 rounded-lg border-2 transition-colors",
                      sdeIsHigher ? "bg-gray-900/5 border-gray-900" : "bg-gray-50 border-gray-200"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">SDE Method</span>
                        {sdeIsHigher && (
                          <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">Highest</span>
                        )}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 mb-1">
                        {formatCurrency(calculations.valuations.sde.low)} - {formatCurrency(calculations.valuations.sde.high)}
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div>SDE: {formatCurrency(calculations.sde)}</div>
                        <div>Base Multiple: {calculations.valuations.sde.baseMultiples.low}x - {calculations.valuations.sde.baseMultiples.high}x ({SDE_MULTIPLES[calculations.valuations.sde.tier].label})</div>
                        {calculations.valuations.sde.totalAdjustment !== 0 && (
                          <div className={cn(
                            "font-medium",
                            calculations.valuations.sde.totalAdjustment > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            Health Adjustment: {calculations.valuations.sde.totalAdjustment > 0 ? "+" : ""}
                            {calculations.valuations.sde.totalAdjustment.toFixed(2)}x → {calculations.valuations.sde.adjustedMultiples.low.toFixed(2)}x - {calculations.valuations.sde.adjustedMultiples.high.toFixed(2)}x
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Revenue Method */}
                    <div className={cn(
                      "p-4 rounded-lg border-2 transition-colors",
                      !sdeIsHigher ? "bg-gray-900/5 border-gray-900" : "bg-gray-50 border-gray-200"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Revenue Method</span>
                        {!sdeIsHigher && (
                          <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">Highest</span>
                        )}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 mb-1">
                        {formatCurrency(calculations.valuations.revenue.low)} - {formatCurrency(calculations.valuations.revenue.high)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Revenue: {formatCurrency(calculations.revenue)} × 0.25 - 0.30
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Profit Analysis */}
            {calculations.percentages && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Profit Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Net Profit Margin</span>
                    <span className={cn(
                      "text-sm font-semibold",
                      calculations.percentages.profitMargin >= 8 ? "text-green-600" :
                      calculations.percentages.profitMargin >= 5 ? "text-amber-600" : "text-red-600"
                    )}>
                      {formatPercent(calculations.percentages.profitMargin)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">SDE Margin</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPercent(calculations.percentages.sdeMargin)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Higher SDE margins typically command higher multiples. Restaurants with 15%+ SDE margin are considered strong performers.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gray-900 rounded-xl p-5 text-white">
              <h4 className="font-semibold mb-2 text-white">Get a Professional Broker Price Opinion</h4>
              <p className="text-sm text-gray-300 mb-4">
                This calculator provides estimates. For an accurate valuation considering all factors, speak with our team.
              </p>
              <a
                href="/contact"
                className="block w-full text-center bg-white text-gray-900 font-medium py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Request Free Broker Price Opinion
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
