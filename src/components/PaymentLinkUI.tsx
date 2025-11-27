import React, { useState } from 'react';
import { Link, Copy, Check, QrCode, Share2, Mail, MessageCircle, Eye, Settings, DollarSign, Calendar, CreditCard, Smartphone, Globe, Lock, ExternalLink, Download, X, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentLinkUIProps {
  onBack: () => void;
}

const PaymentLinkUI: React.FC<PaymentLinkUIProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [linkData, setLinkData] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    customerName: '',
    customerEmail: '',
    allowCustomAmount: false,
    minAmount: '',
    maxAmount: '',
    expiryEnabled: false,
    expiryDays: 7,
    expiryDate: '',
    limitEnabled: false,
    usageLimit: 1,
    paymentMethods: ['card', 'bank', 'mobile_money', 'crypto'],
    collectShipping: false,
    sendReceipt: true,
    redirectUrl: '',
    metadata: {}
  });

  const [generatedLink, setGeneratedLink] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [qrCode, setQrCode] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setLinkData(prev => ({ ...prev, [field]: value }));
  };

  const togglePaymentMethod = (method: string) => {
    setLinkData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const handleGenerateLink = () => {
    const linkId = 'plink_' + Math.random().toString(36).substr(2, 9);
    const fullLink = `https://pay.chainflow.com/${linkId}`;
    const short = `https://cf.link/${linkId.substr(-6)}`;
    setGeneratedLink(fullLink);
    setShortUrl(short);
    setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    setStep(4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderBasicDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Create Payment Link</h2>
        <p className="text-muted-foreground">Set up your payment details</p>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-xl p-6">
        <label className="flex items-center gap-2 text-sm font-medium mb-3">
          <DollarSign size={18} className="text-primary" />
          Payment Amount
        </label>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="number"
              value={linkData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="100.00"
              className="w-full px-4 py-3 text-2xl font-bold border-2 border-input bg-background rounded-xl focus:border-primary focus:outline-none"
              disabled={linkData.allowCustomAmount}
            />
          </div>
          <select
            value={linkData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="px-4 py-3 text-lg font-semibold border-2 border-input bg-background rounded-xl focus:border-primary focus:outline-none"
            disabled={linkData.allowCustomAmount}
          >
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>KES</option>
            <option>INR</option>
            <option>MXN</option>
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={linkData.allowCustomAmount}
            onChange={(e) => handleInputChange('allowCustomAmount', e.target.checked)}
            className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium">Allow customers to enter their own amount</span>
        </label>

        {linkData.allowCustomAmount && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Minimum Amount</label>
              <input
                type="number"
                value={linkData.minAmount}
                onChange={(e) => handleInputChange('minAmount', e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 border-2 border-input bg-background rounded-lg focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Maximum Amount</label>
              <input
                type="number"
                value={linkData.maxAmount}
                onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                placeholder="10000"
                className="w-full px-3 py-2 border-2 border-input bg-background rounded-lg focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
        <textarea
          value={linkData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="e.g., Website Design Services - November 2025"
          rows={3}
          className="w-full px-4 py-3 border-2 border-input bg-background rounded-xl focus:border-primary focus:outline-none"
        />
        <p className="text-xs text-muted-foreground mt-1">This will be shown to customers on the payment page</p>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Customer Information (Optional)</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={linkData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            placeholder="Customer Name"
            className="w-full px-4 py-3 border-2 border-input bg-background rounded-xl focus:border-primary focus:outline-none"
          />
          <input
            type="email"
            value={linkData.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            placeholder="customer@email.com"
            className="w-full px-4 py-3 border-2 border-input bg-background rounded-xl focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 border-2 border-input font-bold rounded-xl hover:border-primary transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => setStep(2)}
          className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          Continue to Customize
        </button>
      </div>
    </div>
  );

  const renderCustomizeStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Customize Your Link</h2>
        <p className="text-muted-foreground">Configure payment options and settings</p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-3">
          <CreditCard size={18} className="text-primary" />
          Accepted Payment Methods
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
            { id: 'bank', label: 'Bank Transfer', icon: DollarSign },
            { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
            { id: 'crypto', label: 'Cryptocurrency', icon: Globe }
          ].map(method => {
            const Icon = method.icon;
            const isSelected = linkData.paymentMethods.includes(method.id);
            return (
              <button
                key={method.id}
                onClick={() => togglePaymentMethod(method.id)}
                className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {isSelected && <Check className="text-primary-foreground" size={14} />}
                </div>
                <Icon size={18} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                <span className="text-sm font-medium">{method.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-xl p-6">
        <label className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <span className="text-sm font-medium">Set Link Expiry</span>
          </div>
          <input
            type="checkbox"
            checked={linkData.expiryEnabled}
            onChange={(e) => handleInputChange('expiryEnabled', e.target.checked)}
            className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
          />
        </label>

        {linkData.expiryEnabled && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Expire after (days)</label>
              <input
                type="number"
                value={linkData.expiryDays}
                onChange={(e) => handleInputChange('expiryDays', e.target.value)}
                className="w-full px-3 py-2 border-2 border-input bg-background rounded-lg focus:border-primary focus:outline-none"
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">OR</div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Specific date</label>
              <input
                type="date"
                value={linkData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className="w-full px-3 py-2 border-2 border-input bg-background rounded-lg focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border-2 border-border rounded-xl p-6">
        <label className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            <span className="text-sm font-medium">Limit Number of Uses</span>
          </div>
          <input
            type="checkbox"
            checked={linkData.limitEnabled}
            onChange={(e) => handleInputChange('limitEnabled', e.target.checked)}
            className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
          />
        </label>

        {linkData.limitEnabled && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Maximum uses</label>
            <input
              type="number"
              value={linkData.usageLimit}
              onChange={(e) => handleInputChange('usageLimit', e.target.value)}
              placeholder="1"
              className="w-full px-3 py-2 border-2 border-input bg-background rounded-lg focus:border-primary focus:outline-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Link will expire after this many successful payments</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-border rounded-xl hover:border-primary/50 transition-colors">
          <input
            type="checkbox"
            checked={linkData.collectShipping}
            onChange={(e) => handleInputChange('collectShipping', e.target.checked)}
            className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium">Collect shipping address</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-border rounded-xl hover:border-primary/50 transition-colors">
          <input
            type="checkbox"
            checked={linkData.sendReceipt}
            onChange={(e) => handleInputChange('sendReceipt', e.target.checked)}
            className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium">Send email receipt automatically</span>
        </label>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Success Redirect URL (Optional)</label>
        <input
          type="url"
          value={linkData.redirectUrl}
          onChange={(e) => handleInputChange('redirectUrl', e.target.value)}
          placeholder="https://yourwebsite.com/thank-you"
          className="w-full px-4 py-3 border-2 border-input bg-background rounded-xl focus:border-primary focus:outline-none"
        />
        <p className="text-xs text-muted-foreground mt-1">Redirect customers here after successful payment</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 py-4 border-2 border-input font-bold rounded-xl hover:border-primary transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setStep(3)}
          className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          Preview Link
        </button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Preview Payment Page</h2>
        <p className="text-muted-foreground">See what your customers will see</p>
      </div>

      <div className="bg-muted rounded-xl p-8">
        <div className="max-w-md mx-auto bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground text-center">
            <div className="w-16 h-16 bg-background/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign size={32} />
            </div>
            <h3 className="text-xl font-bold mb-1">Payment Request</h3>
            <p className="text-sm opacity-80">from ChainFlow</p>
          </div>

          <div className="p-6 space-y-4">
            {linkData.description && (
              <div className="text-center">
                <p className="text-muted-foreground">{linkData.description}</p>
              </div>
            )}

            <div className="bg-muted rounded-xl p-6 text-center">
              <div className="text-sm text-muted-foreground mb-1">Amount to Pay</div>
              {linkData.allowCustomAmount ? (
                <div>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="text-4xl font-bold text-center w-full bg-transparent border-b-2 border-border focus:border-primary focus:outline-none mb-2"
                  />
                  <div className="text-sm text-muted-foreground">
                    {linkData.minAmount && `Min: ${linkData.minAmount} ${linkData.currency}`}
                    {linkData.minAmount && linkData.maxAmount && ' • '}
                    {linkData.maxAmount && `Max: ${linkData.maxAmount} ${linkData.currency}`}
                  </div>
                </div>
              ) : (
                <div className="text-4xl font-bold text-primary">
                  {linkData.amount || '0.00'} {linkData.currency}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {linkData.paymentMethods.map(method => (
                  <button
                    key={method}
                    className="p-3 border-2 border-border rounded-lg hover:border-primary transition-colors text-sm font-medium"
                  >
                    {method === 'card' && '💳 Card'}
                    {method === 'bank' && '🏦 Bank'}
                    {method === 'mobile_money' && '📱 Mobile'}
                    {method === 'crypto' && '🪙 Crypto'}
                  </button>
                ))}
              </div>
            </div>

            {linkData.customerName || linkData.customerEmail ? (
              <div className="space-y-2">
                {linkData.customerName && (
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={linkData.customerName}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-border rounded-lg bg-muted"
                  />
                )}
                {linkData.customerEmail && (
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={linkData.customerEmail}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-border rounded-lg bg-muted"
                  />
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
            )}

            <button className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors">
              Pay Now
            </button>

            <div className="text-center text-xs text-muted-foreground">
              Powered by ChainFlow • Secure Payment
            </div>
          </div>
        </div>
      </div>

      <div className="bg-accent border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-3">Link Configuration Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Amount</div>
            <div className="font-semibold">
              {linkData.allowCustomAmount
                ? 'Customer choice'
                : `${linkData.amount || '0.00'} ${linkData.currency}`}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Payment Methods</div>
            <div className="font-semibold">{linkData.paymentMethods.length} enabled</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Expiry</div>
            <div className="font-semibold">
              {linkData.expiryEnabled
                ? linkData.expiryDate || `${linkData.expiryDays} days`
                : 'Never'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Usage Limit</div>
            <div className="font-semibold">
              {linkData.limitEnabled ? `${linkData.usageLimit} use(s)` : 'Unlimited'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(2)}
          className="flex-1 py-4 border-2 border-input font-bold rounded-xl hover:border-primary transition-colors"
        >
          Back to Edit
        </button>
        <button
          onClick={handleGenerateLink}
          className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Check size={20} />
          Generate Link
        </button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={48} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Payment Link Created!</h2>
        <p className="text-muted-foreground">Share this link with your customers to receive payments</p>
      </div>

      <div className="bg-card border-2 border-primary/20 rounded-xl p-6">
        <label className="text-sm font-medium mb-3 block">Your Payment Link</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={generatedLink}
            readOnly
            className="flex-1 px-4 py-3 bg-muted border-2 border-border rounded-lg font-mono text-sm"
          />
          <button
            onClick={() => copyToClipboard(generatedLink)}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <input
            type="text"
            value={shortUrl}
            readOnly
            className="flex-1 px-4 py-3 bg-primary/10 border-2 border-primary/20 rounded-lg font-mono text-sm"
          />
          <button
            onClick={() => copyToClipboard(shortUrl)}
            className="px-6 py-3 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors"
          >
            Copy Short URL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <QrCode size={20} className="text-primary" />
            QR Code
          </h3>
          <div className="bg-muted p-6 rounded-xl mb-4">
            <div className="w-48 h-48 bg-background mx-auto flex items-center justify-center rounded-lg border border-border">
              <QrCode size={64} className="text-muted-foreground" />
            </div>
          </div>
          <button className="w-full py-3 bg-muted font-semibold rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2">
            <Download size={18} />
            Download QR Code
          </button>
        </div>

        <div className="bg-card border-2 border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Share2 size={20} className="text-primary" />
            Share Link
          </h3>
          <div className="space-y-3">
            <button className="w-full py-3 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
              <Mail size={18} />
              Share via Email
            </button>
            <button className="w-full py-3 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2">
              <MessageCircle size={18} />
              Share via WhatsApp
            </button>
            <button className="w-full py-3 bg-purple-50 text-purple-700 font-semibold rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2">
              <Share2 size={18} />
              Share via Social Media
            </button>
            <button className="w-full py-3 bg-muted font-semibold rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2">
              <ExternalLink size={18} />
              Open Link
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-accent to-primary/10 border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Link Analytics (Coming Soon)</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-xs text-muted-foreground">Payments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0%</div>
            <div className="text-xs text-muted-foreground">Conversion</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">$0</div>
            <div className="text-xs text-muted-foreground">Revenue</div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          Done
        </button>
        <button
          onClick={() => setStep(1)}
          className="flex-1 py-4 border-2 border-input font-bold rounded-xl hover:border-primary transition-colors"
        >
          Create Another Link
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {step === 1 && renderBasicDetailsStep()}
        {step === 2 && renderCustomizeStep()}
        {step === 3 && renderPreviewStep()}
        {step === 4 && renderCompleteStep()}
      </div>
    </div>
  );
};

export default PaymentLinkUI;
