"use client";

import { useState, useMemo } from "react";
import { site, fullAddress } from "@/config/site";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { jsPDF } from "jspdf";
import {
  Calculator,
  UtensilsCrossed,
  DollarSign,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  FileDown,
  TrendingUp,
  BarChart3,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ============================================================================
// CONCEPT BENCHMARKS
// ============================================================================

const CONCEPT_BENCHMARKS: Record<string, { ideal: [number, number]; acceptable: [number, number]; label: string }> = {
  "fine-dining":  { ideal: [28, 35], acceptable: [25, 38], label: "Fine Dining" },
  "full-service": { ideal: [28, 32], acceptable: [25, 36], label: "Full Service" },
  "fast-casual":  { ideal: [25, 30], acceptable: [22, 34], label: "Fast Casual" },
  "qsr":          { ideal: [22, 28], acceptable: [18, 32], label: "QSR / Fast Food" },
  "cafe-coffee":  { ideal: [20, 28], acceptable: [15, 32], label: "Cafe / Coffee Shop" },
  "bakery":       { ideal: [25, 35], acceptable: [20, 40], label: "Bakery" },
  "bar-brewery":  { ideal: [18, 25], acceptable: [15, 30], label: "Bar / Brewery" },
  "catering":     { ideal: [28, 35], acceptable: [25, 38], label: "Catering" },
  "pizza":        { ideal: [22, 28], acceptable: [18, 32], label: "Pizza" },
  "food-truck":   { ideal: [25, 32], acceptable: [20, 36], label: "Food Truck" },
};

const CONCEPT_KEYS = Object.keys(CONCEPT_BENCHMARKS) as [string, ...string[]];

const UNITS = ["oz", "lb", "g", "kg", "each", "cup", "tbsp", "gal", "ml", "l"] as const;

// ============================================================================
// FORM SCHEMA
// ============================================================================

const ingredientSchema = z.object({
  name: z.string().optional(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  costPerUnit: z.string().optional(),
  wasteFactor: z.string().optional(),
});

const formSchema = z.object({
  conceptType: z.enum(CONCEPT_KEYS),
  dishName: z.string().optional(),
  menuPrice: z.string().min(1, "Menu price is required"),
  targetFoodCostPct: z.string().optional(),
  ingredients: z.array(ingredientSchema),
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrencyWhole(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatInputCurrency(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
  return cleaned;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

type HealthStatus = "good" | "warning" | "danger";

function getHealthStatus(
  value: number,
  benchmark: { ideal: [number, number]; acceptable: [number, number] }
): HealthStatus {
  if (value >= benchmark.ideal[0] && value <= benchmark.ideal[1]) return "good";
  if (value >= benchmark.acceptable[0] && value <= benchmark.acceptable[1]) return "warning";
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

const LOGO_BASE64 = "data:image/png;base64,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";

interface IngredientCalc {
  name: string;
  rawCost: number;
  adjustedCost: number;
  sharePercent: number;
}

interface PDFReportData {
  dishName: string;
  conceptType: string;
  conceptLabel: string;
  menuPrice: number;
  totalDishCost: number;
  foodCostPct: number;
  grossProfit: number;
  grossMargin: number;
  markup: number;
  ingredients: IngredientCalc[];
  benchmarkIdeal: [number, number];
  healthStatus: HealthStatus;
  suggestedPrices: { pct: number; price: number }[];
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

  const primaryColor: [number, number, number] = [31, 41, 55];
  const secondaryColor: [number, number, number] = [107, 114, 128];
  const accentColor: [number, number, number] = [79, 70, 229];

  let y = contentStartY;

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const addHeader = () => {
    try {
      doc.addImage(LOGO_BASE64, "PNG", margin, margin, 20, 12);
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text(site.name, margin, margin + 8);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text(site.contact.phone, pageWidth - margin, margin + 4, { align: "right" });
    doc.text(site.domain, pageWidth - margin, margin + 9, { align: "right" });
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - footerHeight + 5;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(fullAddress, margin, footerY + 8);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY + 8, { align: "right" });
  };

  const checkNewPage = (requiredSpace: number): void => {
    if (y + requiredSpace > contentEndY) {
      doc.addPage();
      addHeader();
      y = contentStartY;
    }
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

  // === BUILD PDF ===
  addHeader();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text("Food Cost Analysis Report", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text(`Generated: ${today}`, margin, y);
  y += 10;

  // Food Cost Result Box
  checkNewPage(40);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y - 4, contentWidth, 28, 3, 3, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text("FOOD COST PERCENTAGE", margin + 8, y + 4);

  const statusColors: Record<HealthStatus, [number, number, number]> = {
    good: [22, 163, 74],
    warning: [217, 119, 6],
    danger: [220, 38, 38],
  };
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...statusColors[data.healthStatus]);
  doc.text(`${formatPercent(data.foodCostPct)}`, margin + 8, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text(`${data.conceptLabel} ideal: ${data.benchmarkIdeal[0]}-${data.benchmarkIdeal[1]}%`, pageWidth - margin - 8, y + 16, { align: "right" });
  y += 36;

  // Dish Summary
  addSectionHeader(data.dishName || "Dish Summary");
  y += 2;
  addKeyValue("Concept Type", data.conceptLabel);
  addKeyValue("Menu Price", formatCurrency(data.menuPrice));
  addKeyValue("Total Dish Cost", formatCurrency(data.totalDishCost), true);
  addKeyValue("Food Cost %", formatPercent(data.foodCostPct), true);
  addKeyValue("Gross Profit", formatCurrency(data.grossProfit));
  addKeyValue("Gross Margin", formatPercent(data.grossMargin));
  addKeyValue("Markup", formatPercent(data.markup));
  y += 6;

  // Ingredient Breakdown
  if (data.ingredients.length > 0) {
    addSectionHeader("Ingredient Breakdown");
    y += 2;

    data.ingredients.forEach((ing) => {
      addKeyValue(
        `${ing.name || "Ingredient"}`,
        `${formatCurrency(ing.adjustedCost)} (${formatPercent(ing.sharePercent)})`
      );
    });
    y += 6;
  }

  // Suggested Pricing
  addSectionHeader("Suggested Menu Pricing");
  y += 2;
  data.suggestedPrices.forEach((sp) => {
    addKeyValue(`At ${sp.pct}% food cost`, formatCurrency(sp.price));
  });
  y += 6;

  // Disclaimer
  checkNewPage(50);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
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
    "This report provides estimates based on the ingredient costs and menu price provided. " +
    "Actual food costs vary with supplier pricing, waste, portioning, and market conditions. " +
    "For a comprehensive analysis of your restaurant's financial health and business value, " +
    `contact ${site.name} for a confidential consultation.`;
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(disclaimerLines, margin, y);
  y += disclaimerLines.length * 4;

  // CTA
  checkNewPage(28);
  doc.setFillColor(...accentColor);
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Want to know what your restaurant is worth?", pageWidth / 2, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Contact us: ${site.contact.phone} | ${site.contact.email}`, pageWidth / 2, y + 14, { align: "center" });

  // Footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  const pdfUrl = doc.output("bloburl");
  window.open(pdfUrl, "_blank");
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FoodCostCalculator() {
  const [showWaste, setShowWaste] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      conceptType: "full-service",
      dishName: "",
      menuPrice: "",
      targetFoodCostPct: "",
      ingredients: [
        { name: "", quantity: "", unit: "oz", costPerUnit: "", wasteFactor: "" },
        { name: "", quantity: "", unit: "oz", costPerUnit: "", wasteFactor: "" },
        { name: "", quantity: "", unit: "oz", costPerUnit: "", wasteFactor: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const watchedValues = form.watch();

  const calculations = useMemo(() => {
    const menuPrice = parseNumber(watchedValues.menuPrice);
    const conceptType = watchedValues.conceptType || "full-service";
    const benchmark = CONCEPT_BENCHMARKS[conceptType];

    // Per-ingredient calculations
    const ingredientCalcs: IngredientCalc[] = (watchedValues.ingredients || []).map((ing) => {
      const qty = parseNumber(ing.quantity);
      const cpu = parseNumber(ing.costPerUnit);
      const waste = parseNumber(ing.wasteFactor);
      const rawCost = qty * cpu;
      const adjustedCost = waste > 0 && waste < 100 ? rawCost / (1 - waste / 100) : rawCost;
      return {
        name: ing.name || "",
        rawCost,
        adjustedCost,
        sharePercent: 0,
      };
    });

    const totalDishCost = ingredientCalcs.reduce((sum, i) => sum + i.adjustedCost, 0);

    // Calculate share percentages
    ingredientCalcs.forEach((ing) => {
      ing.sharePercent = totalDishCost > 0 ? (ing.adjustedCost / totalDishCost) * 100 : 0;
    });

    const foodCostPct = menuPrice > 0 ? (totalDishCost / menuPrice) * 100 : 0;
    const grossProfit = menuPrice - totalDishCost;
    const grossMargin = menuPrice > 0 ? (grossProfit / menuPrice) * 100 : 0;
    const markup = totalDishCost > 0 ? (grossProfit / totalDishCost) * 100 : 0;

    // Suggested pricing
    const suggestedPrices = [25, 30, 35].map((pct) => ({
      pct,
      price: totalDishCost > 0 ? totalDishCost / (pct / 100) : 0,
    }));

    // Health status
    const healthStatus: HealthStatus = totalDishCost > 0 && menuPrice > 0
      ? getHealthStatus(foodCostPct, benchmark)
      : "good";

    // Highest cost ingredient
    const highestCostIngredient = ingredientCalcs
      .filter((i) => i.adjustedCost > 0)
      .sort((a, b) => b.adjustedCost - a.adjustedCost)[0] || null;

    return {
      menuPrice,
      conceptType,
      benchmark,
      ingredientCalcs,
      totalDishCost,
      foodCostPct,
      grossProfit,
      grossMargin,
      markup,
      suggestedPrices,
      healthStatus,
      highestCostIngredient,
      hasResults: totalDishCost > 0 && menuPrice > 0,
    };
  }, [watchedValues]);

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Column - Inputs */}
        <div className="lg:col-span-3 space-y-6">
          {/* Recipe Cost Builder */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <UtensilsCrossed className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 m-0">Recipe Cost Builder</h3>
                <p className="text-sm text-gray-500 m-0">Add ingredients to calculate your dish's food cost percentage</p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-5">
                {/* Concept Type */}
                <FormField
                  control={form.control}
                  name="conceptType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Concept</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select concept type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(CONCEPT_BENCHMARKS).map(([key, val]) => (
                            <SelectItem key={key} value={key}>
                              {val.label} — ideal {val.ideal[0]}-{val.ideal[1]}%
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Dish Name + Menu Price */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dishName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dish Name</FormLabel>
                        <FormControl>
                          <Input className="bg-white" placeholder="e.g. Grilled Salmon" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="menuPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Menu Price
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              className="bg-white pl-7 text-lg font-medium"
                              placeholder="24.00"
                              {...field}
                              onChange={(e) => {
                                field.onChange(formatInputCurrency(e.target.value));
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Ingredients Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <FormLabel className="text-sm font-medium">Ingredients</FormLabel>
                    <span className="text-xs text-gray-400">{fields.length} item{fields.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs w-[28%]">Ingredient</TableHead>
                          <TableHead className="text-xs w-[14%]">Qty</TableHead>
                          <TableHead className="text-xs w-[16%]">Unit</TableHead>
                          <TableHead className="text-xs w-[18%]">Cost/Unit</TableHead>
                          {showWaste && <TableHead className="text-xs w-[12%]">Waste %</TableHead>}
                          <TableHead className="text-xs text-right w-[14%]">Total</TableHead>
                          <TableHead className="text-xs w-[32px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => {
                          const ingCalc = calculations.ingredientCalcs[index];
                          return (
                            <TableRow key={field.id}>
                              <TableCell className="p-1">
                                <FormField
                                  control={form.control}
                                  name={`ingredients.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem className="space-y-0">
                                      <FormControl>
                                        <Input
                                          className="bg-white border-0 shadow-none h-8 text-sm px-2"
                                          placeholder="Salmon fillet"
                                          {...field}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell className="p-1">
                                <FormField
                                  control={form.control}
                                  name={`ingredients.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem className="space-y-0">
                                      <FormControl>
                                        <Input
                                          className="bg-white border-0 shadow-none h-8 text-sm px-2"
                                          placeholder="8"
                                          {...field}
                                          onChange={(e) => {
                                            field.onChange(e.target.value.replace(/[^0-9.]/g, ""));
                                          }}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell className="p-1">
                                <FormField
                                  control={form.control}
                                  name={`ingredients.${index}.unit`}
                                  render={({ field }) => (
                                    <FormItem className="space-y-0">
                                      <Select onValueChange={field.onChange} value={field.value || "oz"}>
                                        <FormControl>
                                          <SelectTrigger className="bg-white border-0 shadow-none h-8 text-sm px-2">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {UNITS.map((u) => (
                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell className="p-1">
                                <FormField
                                  control={form.control}
                                  name={`ingredients.${index}.costPerUnit`}
                                  render={({ field }) => (
                                    <FormItem className="space-y-0">
                                      <FormControl>
                                        <div className="relative">
                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                          <Input
                                            className="bg-white border-0 shadow-none h-8 text-sm pl-5 pr-2"
                                            placeholder="1.25"
                                            {...field}
                                            onChange={(e) => {
                                              field.onChange(e.target.value.replace(/[^0-9.]/g, ""));
                                            }}
                                          />
                                        </div>
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              {showWaste && (
                                <TableCell className="p-1">
                                  <FormField
                                    control={form.control}
                                    name={`ingredients.${index}.wasteFactor`}
                                    render={({ field }) => (
                                      <FormItem className="space-y-0">
                                        <FormControl>
                                          <div className="relative">
                                            <Input
                                              className="bg-white border-0 shadow-none h-8 text-sm px-2 pr-6"
                                              placeholder="10"
                                              {...field}
                                              onChange={(e) => {
                                                field.onChange(e.target.value.replace(/[^0-9.]/g, ""));
                                              }}
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                          </div>
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                              )}
                              <TableCell className="p-1 text-right">
                                <span className="text-sm font-medium text-gray-700">
                                  {ingCalc && ingCalc.adjustedCost > 0
                                    ? formatCurrency(ingCalc.adjustedCost)
                                    : "—"}
                                </span>
                              </TableCell>
                              <TableCell className="p-1">
                                {fields.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      {calculations.totalDishCost > 0 && (
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={showWaste ? 5 : 4} className="text-sm font-semibold text-gray-900">
                              Total Dish Cost
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(calculations.totalDishCost)}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableFooter>
                      )}
                    </Table>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => append({ name: "", quantity: "", unit: "oz", costPerUnit: "", wasteFactor: "" })}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Ingredient
                  </Button>
                </div>

                {/* Live Food Cost Display */}
                {calculations.hasResults && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mt-0">Food Cost Percentage</p>
                      <p className="text-xs text-gray-500 mt-0">(Total Cost / Menu Price) x 100</p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-2xl font-bold",
                        calculations.healthStatus === "good" ? "text-green-600" :
                        calculations.healthStatus === "warning" ? "text-amber-600" : "text-red-600"
                      )}>
                        {formatPercent(calculations.foodCostPct)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0">
                        {calculations.benchmark.label} ideal: {calculations.benchmark.ideal[0]}-{calculations.benchmark.ideal[1]}%
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>

          {/* Waste & Yield Toggle */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <button
              type="button"
              onClick={() => setShowWaste(!showWaste)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-blue-600 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 m-0">Waste & Yield Adjustments</h3>
                  <p className="text-sm text-gray-500 m-0">Account for trim loss, shrinkage, and yield on each ingredient</p>
                </div>
              </div>
              {showWaste ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showWaste && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 m-0">
                  A "Waste %" column has been added to your ingredient table above. Most proteins have 15-25% yield loss from trimming and cooking. Produce averages 10-15%. Enter a percentage to adjust for waste in your cost calculations.
                </p>
              </div>
            )}
          </div>

          {/* Industry Benchmarks Reference */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="font-medium text-sm text-blue-800 m-0">Food Cost Benchmarks by Concept</p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-blue-800">
              {Object.entries(CONCEPT_BENCHMARKS).map(([key, val]) => (
                <div key={key} className="flex justify-between gap-4">
                  <span>{val.label}:</span>
                  <span className="font-medium">{val.ideal[0]}-{val.ideal[1]}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="lg:sticky lg:top-6 space-y-6">
            {/* Main Results Card */}
            {calculations.hasResults ? (
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Food Cost Analysis</span>
                </div>
                <div className={cn(
                  "text-3xl md:text-4xl font-bold mb-1",
                  calculations.healthStatus === "good" ? "text-green-300" :
                  calculations.healthStatus === "warning" ? "text-amber-300" : "text-red-300"
                )}>
                  {formatPercent(calculations.foodCostPct)}
                </div>
                <p className="text-sm opacity-80 mb-4">
                  vs {calculations.benchmark.label} ideal: {calculations.benchmark.ideal[0]}-{calculations.benchmark.ideal[1]}%
                </p>

                <div className="pt-3 border-t border-white/20 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Gross Profit per Dish:</span>
                    <span className="font-medium">{formatCurrency(calculations.grossProfit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Gross Margin:</span>
                    <span className="font-medium">{formatPercent(calculations.grossMargin)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Markup:</span>
                    <span className="font-medium">{formatPercent(calculations.markup)}</span>
                  </div>
                </div>

                {/* Download PDF Button */}
                <button
                  type="button"
                  onClick={() => generatePDFReport({
                    dishName: watchedValues.dishName || "Untitled Dish",
                    conceptType: calculations.conceptType,
                    conceptLabel: calculations.benchmark.label,
                    menuPrice: calculations.menuPrice,
                    totalDishCost: calculations.totalDishCost,
                    foodCostPct: calculations.foodCostPct,
                    grossProfit: calculations.grossProfit,
                    grossMargin: calculations.grossMargin,
                    markup: calculations.markup,
                    ingredients: calculations.ingredientCalcs.filter((i) => i.adjustedCost > 0),
                    benchmarkIdeal: calculations.benchmark.ideal,
                    healthStatus: calculations.healthStatus,
                    suggestedPrices: calculations.suggestedPrices,
                  })}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Download PDF Report
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4 inline-block">
                  <Calculator className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Food Cost Analysis Will Appear Here</h3>
                <p className="text-sm text-gray-500">
                  Add ingredients and a menu price to see your food cost percentage, margin, and benchmark comparison
                </p>
              </div>
            )}

            {/* Suggested Pricing */}
            {calculations.totalDishCost > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Suggested Menu Pricing
                </h4>
                <div className="space-y-3">
                  {calculations.suggestedPrices.map((sp) => {
                    const isCurrentRange = calculations.menuPrice > 0 &&
                      Math.abs(calculations.foodCostPct - sp.pct) < 3;
                    return (
                      <div
                        key={sp.pct}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-colors",
                          isCurrentRange
                            ? "bg-primary/5 border-primary/30"
                            : "bg-gray-50 border-gray-200"
                        )}
                      >
                        <span className="text-sm text-gray-700">
                          At {sp.pct}% food cost:
                        </span>
                        <span className={cn(
                          "text-sm font-semibold",
                          isCurrentRange ? "text-primary" : "text-gray-900"
                        )}>
                          {formatCurrency(sp.price)}
                          {isCurrentRange && (
                            <span className="text-xs font-normal text-primary/70 ml-1">(current)</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            {calculations.ingredientCalcs.filter((i) => i.adjustedCost > 0).length > 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Cost Breakdown
                </h4>
                <div className="space-y-2">
                  {calculations.ingredientCalcs
                    .filter((i) => i.adjustedCost > 0)
                    .sort((a, b) => b.adjustedCost - a.adjustedCost)
                    .map((ing, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={cn(
                            "text-gray-700",
                            idx === 0 && "font-medium"
                          )}>
                            {ing.name || "Ingredient"}
                            {idx === 0 && (
                              <span className="text-xs text-amber-600 ml-1">(highest)</span>
                            )}
                          </span>
                          <span className="text-gray-600">
                            {formatCurrency(ing.adjustedCost)} ({formatPercent(ing.sharePercent)})
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={cn(
                              "h-1.5 rounded-full",
                              idx === 0 ? "bg-primary" : "bg-primary/40"
                            )}
                            style={{ width: `${Math.min(ing.sharePercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Sell-Readiness Card */}
            {calculations.hasResults && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3">What This Means for Business Value</h4>
                {calculations.healthStatus === "good" ? (
                  <div className="space-y-2">
                    <HealthIndicator
                      status="good"
                      value={formatPercent(calculations.foodCostPct)}
                      label="Food Cost"
                      benchmark={`${calculations.benchmark.ideal[0]}-${calculations.benchmark.ideal[1]}%`}
                    />
                    <p className="text-sm text-gray-600">
                      Strong food costs directly improve your SDE and command higher valuation multiples. Buyers see disciplined cost control as a sign of a well-run operation.
                    </p>
                  </div>
                ) : calculations.healthStatus === "warning" ? (
                  <div className="space-y-2">
                    <HealthIndicator
                      status="warning"
                      value={formatPercent(calculations.foodCostPct)}
                      label="Food Cost"
                      benchmark={`${calculations.benchmark.ideal[0]}-${calculations.benchmark.ideal[1]}%`}
                    />
                    <p className="text-sm text-gray-600">
                      Your food cost is within an acceptable range but above ideal. Reducing it by {(calculations.foodCostPct - calculations.benchmark.ideal[1]).toFixed(0)}% could meaningfully increase your annual SDE and business value.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <HealthIndicator
                      status="danger"
                      value={formatPercent(calculations.foodCostPct)}
                      label="Food Cost"
                      benchmark={`${calculations.benchmark.ideal[0]}-${calculations.benchmark.ideal[1]}%`}
                    />
                    <p className="text-sm text-gray-600">
                      Elevated food costs compress margins and reduce your SDE, which directly lowers your business valuation. Addressing this before a sale could significantly increase your asking price.
                    </p>
                  </div>
                )}
                <a
                  href="/resources/calculators/sde-calculator"
                  className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  See what your restaurant is worth
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gray-900 rounded-xl p-5 text-white">
              <h4 className="font-semibold mb-2 text-white">Get a Professional Broker Price Opinion</h4>
              <p className="text-sm text-gray-300 mb-4">
                Food cost is one piece of the puzzle. For a complete analysis of your restaurant's value, speak with our team.
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
