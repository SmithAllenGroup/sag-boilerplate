"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

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
import { site } from "@/config/site";

interface ListingRequestFormProps {
  listingTitle?: string;
  listingSlug?: string;
  askingPrice?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  buy_timeline: z.string({
    required_error: "Please select a buying timeline.",
  }),
  purchase_method: z.string({
    required_error: "Please select a purchase method.",
  }),
  loan_progress: z.string().optional(),
  referring_url: z.string().optional(),
}).refine((data) => {
  if (data.purchase_method === "Loan" || data.purchase_method === "Cash Plus Loan") {
    return data.loan_progress && data.loan_progress.length > 0;
  }
  return true;
}, {
  message: "Loan application progress is required for loan-based purchases.",
  path: ["loan_progress"],
});

export default function ListingRequestForm({
  listingTitle = '',
  listingSlug = '',
  askingPrice = ''
}: ListingRequestFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      buy_timeline: "",
      purchase_method: "",
      loan_progress: "",
      referring_url: "",
    },
  });

  useEffect(() => {
    form.setValue("referring_url", window.location.href);
  }, [form]);

  const purchaseMethod = form.watch("purchase_method");
  const showLoan = purchaseMethod === "Loan" || purchaseMethod === "Cash Plus Loan";

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

    if (!match) return value;

    let result = "";
    if (match[1]) result = `(${match[1]}`;
    if (match[2]) result += match[2].length === 3 ? `) ${match[2]}` : match[2];
    if (match[3]) result += `-${match[3]}`;

    return result;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setStatus('submitting');
    setErrorMessage('');

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      // Add hidden fields
      if (!showLoan) {
        formData.append("loan_progress", "No Loan Required");
      }
      formData.append("listing_title", listingTitle);
      formData.append("asking_price", askingPrice);
      formData.append("listing_slug", listingSlug);

      const response = await fetch(site.forms.listingRequest, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit form. Please try again.');
      }

      setStatus('success');
      form.reset();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }

  return (
    <section className="global-form">
      <h5>Request More Information</h5>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 pt-3 border-t border-gray-300 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      disabled={status === 'submitting' || status === 'success'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      disabled={status === 'submitting' || status === 'success'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background"
                    type="email"
                    disabled={status === 'submitting' || status === 'success'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background"
                    type="tel"
                    maxLength={14}
                    disabled={status === 'submitting' || status === 'success'}
                    {...field}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="buy_timeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buying Timeline</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={status === 'submitting' || status === 'success'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">— Select —</option>
                    <option value="1-3 Months">1-3 Months</option>
                    <option value="3-6 Months">3-6 Months</option>
                    <option value="More Than 6 Months">More Than 6 Months</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchase_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Method</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={status === 'submitting' || status === 'success'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">— Select —</option>
                    <option value="Cash">Cash</option>
                    <option value="Loan">Loan</option>
                    <option value="Cash Plus Loan">Cash + Loan</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showLoan && (
            <FormField
              control={form.control}
              name="loan_progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Application Progress</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={status === 'submitting' || status === 'success'}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">— Select —</option>
                      <option value="Still Need to Apply">Still Need to Apply</option>
                      <option value="Loan Process Started">Loan Process Started</option>
                      <option value="Loan Secured">Loan Secured</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {status === 'success' && (
            <p className="text-green-600 text-sm">
              Form submitted successfully! Redirecting...
            </p>
          )}

          {status === 'error' && (
            <p className="text-red-600 text-sm">
              {errorMessage || 'Something went wrong. Please try again.'}
            </p>
          )}

          <div className="mt-6">
            <Button
              className="w-full"
              type="submit"
              disabled={status === 'submitting' || status === 'success'}
            >
              {status === 'submitting' ? 'Submitting...' : status === 'success' ? 'Submitted!' : 'Request Info'}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
