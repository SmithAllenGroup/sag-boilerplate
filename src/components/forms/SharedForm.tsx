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
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/config/site";

interface SharedFormProps {
  className?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  message: z.string().optional(),
  referring_url: z.string().optional(),
});

const SharedForm: React.FC<SharedFormProps> = ({ className }) => {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      message: "",
      referring_url: "",
    },
  });

  useEffect(() => {
    form.setValue("referring_url", window.location.href);
  }, [form]);

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

      const response = await fetch(site.forms.contact, {
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
    <div className={className || ""}>
      <h5>Request A Callback</h5>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                    placeholder="(555) 555-5555"
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
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    className="resize-none bg-background"
                    rows={4}
                    disabled={status === 'submitting' || status === 'success'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
              {status === 'submitting' ? 'Sending...' : status === 'success' ? 'Sent!' : "Let's talk"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SharedForm;
