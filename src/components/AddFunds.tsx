import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, Globe2, Bitcoin, Users, ChevronRight, ArrowLeft, Check, Info, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddFundsProps {
  onBack: () => void;
}

type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  gradient: string;
  provider: string;
};

const AddFunds = ({ onBack }: AddFundsProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mpesa',
      name: 'M-Pesa STK Push',
      description: 'Instant top-up via phone',
      icon: Smartphone,
      badge: 'Fastest',
      gradient: 'from-green-500 to-emerald-600',
      provider: 'mpesa'
    },
    {
      id: 'card',
      name: 'Visa / Mastercard',
      description: 'Global card payments',
      icon: CreditCard,
      badge: 'Popular',
      gradient: 'from-blue-500 to-indigo-600',
      provider: 'stripe'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct bank deposit',
      icon: Building,
      gradient: 'from-purple-500 to-violet-600',
      provider: 'bank_transfer'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Global digital wallet',
      icon: Globe2,
      badge: 'Trusted',
      gradient: 'from-blue-600 to-blue-700',
      provider: 'paypal'
    }
  ];

  const quickAmounts = [200, 500, 1000, 2000, 5000, 10000];

  const exchangeRates = {
    KES: 1,
    USD: 0.0077,
    EUR: 0.0071,
    GBP: 0.0061
  };

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (!selectedMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please choose a payment method",
        variant: "destructive"
      });
      return;
    }

    if (selectedMethod === 'mpesa' && !phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your M-Pesa phone number",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to add funds",
          variant: "destructive"
        });
        return;
      }

      // Create transaction record
      const { data, error } = await supabase
        .from('add_funds_transactions')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          currency,
          payment_method: selectedMethod,
          payment_provider: paymentMethods.find(m => m.id === selectedMethod)?.provider || selectedMethod,
          status: 'pending',
          metadata: {
            phone_number: phoneNumber || undefined
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Call appropriate edge function based on payment method
      if (selectedMethod === 'mpesa') {
        await initiateMpesaPayment(data.id, phoneNumber, parseFloat(amount));
      } else if (selectedMethod === 'card') {
        await initiateStripePayment(data.id, parseFloat(amount));
      } else {
        toast({
          title: "Payment Method Coming Soon",
          description: `${paymentMethods.find(m => m.id === selectedMethod)?.name} integration is being set up`,
        });
      }

    } catch (error) {
      console.error('Add funds error:', error);
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const initiateMpesaPayment = async (transactionId: string, phone: string, amount: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          transaction_id: transactionId,
          phone_number: phone,
          amount
        }
      });

      if (error) throw error;

      toast({
        title: "M-Pesa Request Sent",
        description: "Please check your phone and enter your M-Pesa PIN",
      });
    } catch (error) {
      throw new Error('Failed to initiate M-Pesa payment');
    }
  };

  const initiateStripePayment = async (transactionId: string, amount: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          transaction_id: transactionId,
          amount
        }
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      throw new Error('Failed to initiate card payment');
    }
  };

  const getAmountInCurrency = (baseAmount: number): string => {
    const rate = exchangeRates[currency as keyof typeof exchangeRates];
    const converted = baseAmount * rate;
    return currency === 'KES' ? converted.toFixed(0) : converted.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Add Funds</h1>
            <p className="text-sm text-white/80">Top up your wallet instantly</p>
          </div>
        </div>

        {/* Amount Input */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <label className="text-xs text-white/70 mb-2 block">Enter Amount</label>
          <div className="flex items-center gap-3 mb-4">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-3xl font-bold bg-transparent border-0 text-white placeholder:text-white/30 focus-visible:ring-0 p-0 h-auto"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-white/20 text-white border-0 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-white/30"
            >
              <option value="KES" className="text-gray-900">KES</option>
              <option value="USD" className="text-gray-900">USD</option>
              <option value="EUR" className="text-gray-900">EUR</option>
              <option value="GBP" className="text-gray-900">GBP</option>
            </select>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((val) => (
              <button
                key={val}
                onClick={() => handleAmountSelect(val)}
                className="bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-lg py-2 text-sm font-semibold transition-all"
              >
                {currency} {getAmountInCurrency(val)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-foreground">Select Payment Method</h2>
          <Shield size={16} className="text-green-600" />
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;

            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                    : 'border-border bg-card hover:border-indigo-300'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{method.name}</span>
                    {method.badge && (
                      <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{method.description}</div>
                </div>
                {isSelected ? (
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Check className="text-white" size={16} />
                  </div>
                ) : (
                  <ChevronRight className="text-muted-foreground" size={20} />
                )}
              </button>
            );
          })}
        </div>

        {/* M-Pesa Phone Input */}
        {selectedMethod === 'mpesa' && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-800">
            <label className="text-sm font-medium text-foreground mb-2 block">
              M-Pesa Phone Number
            </label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="254712345678"
              className="bg-background"
            />
            <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <span>Enter your M-Pesa registered phone number (format: 254...)</span>
            </div>
          </div>
        )}

        {/* Security Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Secure & Encrypted</h3>
              <p className="text-xs text-muted-foreground">
                All transactions are encrypted with bank-level security. Your payment details are never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Add Funds Button */}
        <Button
          onClick={handleAddFunds}
          disabled={isProcessing || !amount || !selectedMethod}
          className="w-full mt-6 h-14 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap size={20} />
              Add {amount ? `${currency} ${amount}` : 'Funds'}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddFunds;