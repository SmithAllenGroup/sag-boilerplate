"use client";

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { site } from '@/config/site';

interface NDAFormProps extends React.HTMLAttributes<HTMLElement> {}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function NDAForm({ ...props }: NDAFormProps) {
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState('');
  const [brokerageName, setBrokerageName] = useState('');
  const [signature, setSignature] = useState('');
  const [acceptedSignature, setAcceptedSignature] = useState(false);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [cashOnHand, setCashOnHand] = useState('');
  const [valueOfSecurities, setValueOfSecurities] = useState('');
  const [equityInRealEstate, setEquityInRealEstate] = useState('');

  const showBrokerage = userType === 'Real Estate Broker';

  const formatPhoneNumber = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

    if (!match) return value;

    let result = '';
    if (match[1]) result = `(${match[1]}`;
    if (match[2]) result += match[2].length === 3 ? `) ${match[2]}` : match[2];
    if (match[3]) result += `-${match[3]}`;

    return result;
  }, []);

  const formatCurrency = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) return '';
    return Number(cleaned).toLocaleString('en-US');
  }, []);

  const formatZipCode = useCallback((value: string): string => {
    return value.replace(/\D/g, '').slice(0, 5);
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  }, [formatPhoneNumber]);

  const handleUserTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUserType = e.target.value;
    setUserType(newUserType);

    // Clear brokerage name when field is hidden
    if (newUserType !== 'Real Estate Broker') {
      setBrokerageName('');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const formData = new FormData(e.currentTarget);

      // Add default value for brokerage_name if not shown
      if (!showBrokerage) {
        formData.set("brokerage_name", "No Brokerage");
      }

      const response = await fetch(site.forms.nda, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit form. Please try again.');
      }

      setStatus('success');

      // Reset form fields
      setPhone('');
      setUserType('');
      setBrokerageName('');
      setSignature('');
      setAcceptedSignature(false);
      setZipCode('');
      setCashOnHand('');
      setValueOfSecurities('');
      setEquityInRealEstate('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <section {...props}>
      <form
        onSubmit={handleSubmit}
        id="form"
      >
        {/* Buyer Assets Section */}
        <div className="mb-8">
          <h2>Buyer Assets</h2>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 pt-3">
            <div className="sm:col-span-1">
              <Label htmlFor="cash_on_hand">Cash on Hand</Label>
              <div className="mt-2 grid grid-cols-1">
                <Input
                  type="text"
                  name="cash_on_hand"
                  id="cash_on_hand"
                  value={cashOnHand}
                  onChange={(e) => setCashOnHand(formatCurrency(e.target.value))}
                  required
                  disabled={status === 'submitting' || status === 'success'}
                  className="col-start-1 row-start-1 w-full pl-7"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 ml-3 mt-1 self-center text-gray-500"
                >
                  $
                </span>
              </div>
              <p className="mt-1 text-sm text-primary-600">Seller may request proof of funds</p>
            </div>

            <div className="sm:col-span-1">
              <Label htmlFor="value_of_securities">Value of Securities</Label>
              <div className="mt-2 grid grid-cols-1">
                <Input
                  type="text"
                  name="value_of_securities"
                  id="value_of_securities"
                  value={valueOfSecurities}
                  onChange={(e) => setValueOfSecurities(formatCurrency(e.target.value))}
                  required
                  disabled={status === 'submitting' || status === 'success'}
                  className="col-start-1 row-start-1 w-full pl-7"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 ml-3 mt-1 self-center text-gray-500"
                >
                  $
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="equity_in_real_estate">Equity in Real Estate</Label>
              <div className="mt-2 grid grid-cols-1">
                <Input
                  type="text"
                  name="equity_in_real_estate"
                  id="equity_in_real_estate"
                  value={equityInRealEstate}
                  onChange={(e) => setEquityInRealEstate(formatCurrency(e.target.value))}
                  required
                  disabled={status === 'submitting' || status === 'success'}
                  className="col-start-1 row-start-1 w-full pl-7"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 ml-3 mt-1 self-center text-gray-500"
                >
                  $
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Information Section */}
        <div className="mb-8">
          <h2>Buyer Information</h2>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 pt-3">
            <div className="sm:col-span-2">
              <Label htmlFor="user_type">What Best Describes You?</Label>
              <div className="mt-2">
                <select
                  id="user_type"
                  name="user_type"
                  required
                  value={userType}
                  onChange={handleUserTypeChange}
                  disabled={status === 'submitting' || status === 'success'}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-colors focus:border-gray-900 outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  <option value="" disabled>— Select —</option>
                  <option value="First Time Buyer">First Time Buyer</option>
                  <option value="Experienced Business Owner">Experienced Business Owner</option>
                  <option value="Real Estate Broker">Real Estate Broker</option>
                </select>
              </div>
            </div>

            {showBrokerage && (
              <div className="sm:col-span-2">
                <Label htmlFor="brokerage_name">Brokerage Name</Label>
                <div className="mt-2">
                  <Input
                    id="brokerage_name"
                    name="brokerage_name"
                    type="text"
                    value={brokerageName}
                    onChange={(e) => setBrokerageName(e.target.value.trim())}
                    required
                    disabled={status === 'submitting' || status === 'success'}
                    placeholder="Enter your brokerage name"
                  />
                </div>
              </div>
            )}

            {/* Hidden field for form submission when brokerage not shown */}
            {!showBrokerage && (
              <Input type="hidden" name="brokerage_name" value="No Brokerage" />
            )}

            <div className="sm:col-span-1">
              <Label htmlFor="first_name">First name</Label>
              <div className="mt-2">
                <Input type="text" name="first_name" id="first_name" required disabled={status === 'submitting' || status === 'success'} />
              </div>
            </div>

            <div className="sm:col-span-1">
              <Label htmlFor="last_name">Last name</Label>
              <div className="mt-2">
                <Input type="text" name="last_name" id="last_name" required disabled={status === 'submitting' || status === 'success'} />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <div className="mt-2">
                <Input type="email" name="email" id="email" required disabled={status === 'submitting' || status === 'success'} />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="phone">Phone number</Label>
              <div className="mt-2">
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={14}
                  required
                  disabled={status === 'submitting' || status === 'success'}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <div className="mt-2">
                <Input type="text" name="address" id="address" required disabled={status === 'submitting' || status === 'success'} />
              </div>
            </div>

            <div className="sm:col-span-1">
              <Label htmlFor="city">City</Label>
              <div className="mt-2">
                <Input type="text" name="city" id="city" required disabled={status === 'submitting' || status === 'success'} />
              </div>
            </div>

            <div className="sm:col-span-1">
              <Label htmlFor="state">State</Label>
              <div className="mt-2">
                <Input type="text" name="state" id="state" required disabled={status === 'submitting' || status === 'success'} />
              </div>
            </div>

            <div className="sm:col-span-1">
              <Label htmlFor="zip_code">ZIP Code</Label>
              <div className="mt-2">
                <Input
                  type="text"
                  name="zip_code"
                  id="zip_code"
                  value={zipCode}
                  onChange={(e) => setZipCode(formatZipCode(e.target.value))}
                  pattern="\d{5}"
                  maxLength={5}
                  required
                  disabled={status === 'submitting' || status === 'success'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Digital Signature Section */}
        <div className="mb-8">
          <h2>Signature</h2>

          <div className="my-6">
            <Label htmlFor="signature">Type Your Full Name</Label>
            <div className="mt-2">
              <Input
                type="text"
                name="signature"
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                required
                disabled={status === 'submitting' || status === 'success'}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {signature && (
            <div className="mb-6 p-6 bg-gray-50 border-2 border-gray-300 rounded-md">
              <p className="text-sm text-gray-600 mt-0 mb-2">Your Signature:</p>
              <p
                className="text-4xl text-gray-900 m-0"
                style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive" }}
              >
                {signature}
              </p>
            </div>
          )}

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <Input
                id="accept_signature"
                name="accept_signature"
                type="checkbox"
                checked={acceptedSignature}
                onChange={(e) => setAcceptedSignature(e.target.checked)}
                required
                disabled={status === 'submitting' || status === 'success'}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <Label htmlFor="accept_signature" className="font-medium text-gray-700">
                I accept the use of this digital signature in lieu of a written signature
              </Label>
              <p className="text-sm mt-0 text-gray-500">
                By checking this box, you agree that your typed signature has the same legal effect as a handwritten signature.
              </p>
            </div>
          </div>
        </div>

        {status === 'success' && (
          <p className="text-green-600 text-sm mt-6">
            Form submitted successfully! Thank you for your submission.
          </p>
        )}

        {status === 'error' && (
          <p className="text-red-600 text-sm mt-6">
            {errorMessage || 'Something went wrong. Please try again.'}
          </p>
        )}

        <div className="mt-10">
          <button
            type="submit"
            disabled={!acceptedSignature || !signature || status === 'submitting' || status === 'success'}
            className={`block w-full rounded-md px-3.5 py-2.5 text-center text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 ${
              acceptedSignature && signature && status !== 'submitting' && status !== 'success'
                ? 'bg-gray-900 text-white hover:bg-gray-700 focus-visible:outline-gray-900'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {status === 'submitting' ? 'Submitting...' : status === 'success' ? 'Submitted!' : 'Submit'}
          </button>
        </div>
      </form>
    </section>
  );
}
