import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, Loader, QrCode, Store, User, Globe, CreditCard, Wallet, Building, DollarSign, Receipt, Download, Share2, Copy, Check, AlertCircle, TrendingUp, Clock, ArrowUpRight, ArrowDownLeft, Settings } from 'lucide-react';

const GlobalQRPayment = () => {
  const [mode, setMode] = useState('select'); // select, customer, merchant
  const [view, setView] = useState('home');
  const [scannedData, setScannedData] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<any>(null);
  const [merchantInfo, setMerchantInfo] = useState({
    name: 'My Business',
    id: 'MERCH-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    category: 'retail'
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
    { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
    { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.50 },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.24 },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.12 },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.35 },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67 },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rate: 129.50 },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 775.00 }
  ];

  const paymentNetworks = [
    { id: 'emvco', name: 'EMVCo Universal', logo: '💳' },
    { id: 'alipay', name: 'Alipay', logo: '🇨🇳' },
    { id: 'wechat', name: 'WeChat Pay', logo: '💬' },
    { id: 'upi', name: 'UPI (India)', logo: '🇮🇳' },
    { id: 'paynow', name: 'PayNow (SG)', logo: '🇸🇬' },
    { id: 'promptpay', name: 'PromptPay (TH)', logo: '🇹🇭' },
    { id: 'pix', name: 'PIX (Brazil)', logo: '🇧🇷' },
    { id: 'mpesa', name: 'M-Pesa', logo: '🇰🇪' }
  ];

  const paymentMethods = [
    { id: 'wallet', name: 'Digital Wallet', balance: convertCurrency(2450, 'USD', currency), icon: Wallet },
    { id: 'card', name: 'Visa ****4242', balance: 'Credit Card', icon: CreditCard },
    { id: 'bank', name: 'Bank Account', balance: convertCurrency(8320.50, 'USD', currency), icon: Building }
  ];

  function convertCurrency(amount: number, from: string, to: string) {
    const fromRate = currencies.find(c => c.code === from)?.rate || 1;
    const toRate = currencies.find(c => c.code === to)?.rate || 1;
    return ((amount / fromRate) * toRate).toFixed(2);
  }

  function getCurrencySymbol(code: string) {
    return currencies.find(c => c.code === code)?.symbol || '$';
  }

  const generateQRCode = (data: any) => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#000000';
    const moduleSize = size / 25;
    
    const dataHash = JSON.stringify(data).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const drawFinderPattern = (x: number, y: number) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3);
    };
    
    drawFinderPattern(0, 0);
    drawFinderPattern(size - moduleSize * 7, 0);
    drawFinderPattern(0, size - moduleSize * 7);
    
    for (let i = 8; i < 17; i++) {
      for (let j = 8; j < 17; j++) {
        if (((dataHash >> (i + j)) & 1) === 1) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    return canvas.toDataURL();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setView('scanning');
        setScanning(true);
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startQRDetection();
        };
      }
    } catch (err) {
      alert('Camera access denied. Please allow camera permissions.');
      setView('home');
    }
  };

  const startQRDetection = () => {
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        if (Math.random() < 0.04) {
          handleQRDetected();
        }
      }
    }, 300);
  };

  const handleQRDetected = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    setScanning(false);
    
    const mockMerchants = [
      { name: 'Starbucks Coffee', id: 'EMVCO-SB-001', network: 'emvco', amount: '12.50', verified: true, location: 'Downtown', category: 'food' },
      { name: '淘宝店铺 (Taobao Shop)', id: 'ALIPAY-TB-789', network: 'alipay', amount: '89.99', verified: true, location: 'Hangzhou, China', category: 'shopping' },
      { name: 'Mumbai Grocery', id: 'UPI-MG-456', network: 'upi', amount: '450.00', verified: true, location: 'Mumbai, India', category: 'retail' },
      { name: 'Singapore Taxi', id: 'PAYNOW-TX-123', network: 'paynow', amount: '28.50', verified: true, location: 'Singapore', category: 'transport' },
      { name: 'Bangkok Street Food', id: 'PROMPTPAY-BKK-999', network: 'promptpay', amount: '150.00', verified: true, location: 'Bangkok, Thailand', category: 'food' },
      { name: 'Nairobi Market', id: 'MPESA-NB-567', network: 'mpesa', amount: '500.00', verified: true, location: 'Nairobi, Kenya', category: 'retail' }
    ];
    
    const merchant = mockMerchants[Math.floor(Math.random() * mockMerchants.length)];
    const merchantCurrency = merchant.network === 'upi' ? 'INR' : 
                            merchant.network === 'paynow' ? 'SGD' :
                            merchant.network === 'promptpay' ? 'THB' :
                            merchant.network === 'mpesa' ? 'KES' :
                            merchant.network === 'alipay' ? 'CNY' : 'USD';
    
    setScannedData({ ...merchant, currency: merchantCurrency });
    setAmount(merchant.amount);
    setCurrency(merchantCurrency);
    stopCamera();
    setView('payment');
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const processPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      const transaction = {
        id: 'TXN' + Date.now(),
        type: 'payment',
        merchant: scannedData.name,
        amount: amount,
        currency: currency,
        network: scannedData.network,
        status: 'completed',
        timestamp: new Date().toISOString(),
        method: selectedPaymentMethod
      };
      
      setTransactions(prev => [transaction, ...prev]);
      setIsProcessing(false);
      setView('success');
      
      setTimeout(() => {
        setView('home');
        setScannedData(null);
        setAmount('');
      }, 3000);
    }, 2000);
  };

  const generateMerchantQR = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter amount to generate QR');
      return;
    }

    const qrData = {
      type: 'merchant_payment',
      merchant: merchantInfo,
      amount: amount,
      currency: currency,
      timestamp: Date.now(),
      network: 'emvco'
    };

    // Set data first without image, then generate after mount
    setGeneratedQR({ ...qrData, image: null });
    setView('qr-display');
  };

  const downloadQR = () => {
    if (generatedQR && generatedQR.image) {
      const link = document.createElement('a');
      link.download = `payment-qr-${generatedQR.timestamp}.png`;
      link.href = generatedQR.image;
      link.click();
    }
  };

  const copyPaymentLink = () => {
    const link = `https://pay.global/m/${merchantInfo.id}?amt=${amount}&cur=${currency}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Generate QR image when qr-display view mounts
  useEffect(() => {
    if (view === 'qr-display' && generatedQR && !generatedQR.image && qrCanvasRef.current) {
      const qrImage = generateQRCode(generatedQR);
      setGeneratedQR(prev => prev ? { ...prev, image: qrImage } : null);
    }
  }, [view, generatedQR]);

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="bg-background rounded-full p-6 mb-6 inline-block shadow-2xl">
              <Globe className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-5xl font-bold text-primary-foreground mb-3">Global QR Payments</h1>
            <p className="text-muted-foreground text-xl">Universal payment system for the world</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => { setMode('customer'); setView('home'); }}
              className="bg-card rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all group"
            >
              <div className="bg-gradient-to-br from-primary to-primary rounded-2xl p-6 mb-6 group-hover:scale-110 transition-transform">
                <User className="w-16 h-16 text-primary-foreground mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Customer Mode</h2>
              <p className="text-muted-foreground mb-4">Scan QR codes to make payments worldwide</p>
              <ul className="text-left text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Scan merchant QR codes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Multi-currency payments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Transaction history
                </li>
              </ul>
            </button>

            <button
              onClick={() => { setMode('merchant'); setView('home'); }}
              className="bg-card rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all group"
            >
              <div className="bg-gradient-to-br from-accent to-accent rounded-2xl p-6 mb-6 group-hover:scale-110 transition-transform">
                <Store className="w-16 h-16 text-accent-foreground mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Merchant Mode</h2>
              <p className="text-muted-foreground mb-4">Generate QR codes to receive payments</p>
              <ul className="text-left text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Generate payment QR codes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Accept global payments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Real-time settlements
                </li>
              </ul>
            </button>
          </div>

          <div className="mt-12 grid grid-cols-4 gap-4">
            {paymentNetworks.slice(0, 4).map((network) => (
              <div key={network.id} className="bg-card/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{network.logo}</div>
                <p className="text-primary-foreground text-xs font-semibold">{network.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'customer' && view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-accent p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setMode('select')}
              className="p-2 bg-card/20 rounded-full backdrop-blur-sm"
            >
              <X className="w-6 h-6 text-primary-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-primary-foreground">Pay with QR</h1>
            <button className="p-2 bg-card/20 rounded-full backdrop-blur-sm">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </button>
          </div>

          <div className="bg-card/10 backdrop-blur-lg rounded-3xl p-6 mb-6 border border-border">
            <p className="text-muted-foreground text-sm mb-2">Total Balance</p>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-4xl font-bold text-primary-foreground">
                {getCurrencySymbol(currency)}{convertCurrency(10770.50, 'USD', currency)}
              </h2>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-card/20 backdrop-blur-sm text-foreground rounded-lg px-3 py-2 font-semibold border border-border"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code} className="text-foreground bg-background">{c.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={startCamera}
              className="bg-card rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              <div className="bg-primary/10 rounded-xl p-3 mb-3 inline-block">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <p className="font-bold text-foreground">Scan QR</p>
              <p className="text-xs text-muted-foreground mt-1">Pay merchant</p>
            </button>

            <button
              onClick={() => setView('transactions')}
              className="bg-card rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              <div className="bg-accent/10 rounded-xl p-3 mb-3 inline-block">
                <Receipt className="w-8 h-8 text-accent" />
              </div>
              <p className="font-bold text-foreground">History</p>
              <p className="text-xs text-muted-foreground mt-1">{transactions.length} transactions</p>
            </button>
          </div>

          <div className="bg-card/10 backdrop-blur-lg rounded-2xl p-6 border border-border">
            <h3 className="text-primary-foreground font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Supported Payment Networks
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {paymentNetworks.map(network => (
                <div key={network.id} className="text-center">
                  <div className="bg-card/20 rounded-lg p-3 mb-2 backdrop-blur-sm">
                    <span className="text-2xl">{network.logo}</span>
                  </div>
                  <p className="text-xs text-primary-foreground">{network.name.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'merchant' && view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-primary p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setMode('select')}
              className="p-2 bg-card/20 rounded-full backdrop-blur-sm"
            >
              <X className="w-6 h-6 text-primary-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-primary-foreground">Receive Payment</h1>
            <button className="p-2 bg-card/20 rounded-full backdrop-blur-sm">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </button>
          </div>

          <div className="bg-card rounded-3xl p-6 shadow-2xl mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-accent/10 rounded-2xl p-4">
                <Store className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{merchantInfo.name}</h2>
                <p className="text-sm text-muted-foreground">ID: {merchantInfo.id}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount to Receive
              </label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-muted rounded-lg px-2 py-1 font-semibold text-foreground border-none"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-20 pr-4 py-4 text-3xl font-bold border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background text-foreground"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <button
              onClick={generateMerchantQR}
              disabled={!amount || parseFloat(amount) <= 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                !amount || parseFloat(amount) <= 0
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-gradient-to-r from-accent to-primary text-primary-foreground shadow-lg hover:shadow-xl'
              }`}
            >
              Generate QR Code
            </button>
          </div>

          <div className="bg-card/10 backdrop-blur-lg rounded-2xl p-6 border border-border">
            <h3 className="text-primary-foreground font-semibold mb-4">Today's Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Received</p>
                <p className="text-2xl font-bold text-primary-foreground">
                  {getCurrencySymbol(currency)}{convertCurrency(1250, 'USD', currency)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Transactions</p>
                <p className="text-2xl font-bold text-primary-foreground">{transactions.filter(t => t.type === 'received').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'qr-display' && generatedQR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-primary p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setView('home')}
              className="p-2 bg-card/20 rounded-full backdrop-blur-sm"
            >
              <X className="w-6 h-6 text-primary-foreground" />
            </button>
            <h1 className="text-xl font-bold text-primary-foreground">Payment QR Code</h1>
            <div className="w-10"></div>
          </div>

          <div className="bg-card rounded-3xl p-8 shadow-2xl mb-6">
            <canvas ref={qrCanvasRef} className="hidden" />
            <div className="bg-background rounded-2xl p-6 mb-6 border-4 border-accent/20">
              {generatedQR.image && (
                <img src={generatedQR.image} alt="Payment QR" className="w-full" />
              )}
            </div>

            <div className="text-center mb-6">
              <p className="text-muted-foreground mb-2">Amount to Pay</p>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                {getCurrencySymbol(generatedQR.currency)}{generatedQR.amount}
              </h2>
              <div className="bg-accent/10 rounded-lg p-3">
                <p className="text-sm text-foreground">{merchantInfo.name}</p>
                <p className="text-xs text-muted-foreground">{generatedQR.network.toUpperCase()} Payment</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={downloadQR}
                className="flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
              <button
                onClick={copyPaymentLink}
                className="flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'scanning') {
    return (
      <div className="fixed inset-0 bg-background z-50">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-between p-6">
          <div className="w-full flex justify-between items-center">
            <button
              onClick={() => { stopCamera(); setView('home'); }}
              className="p-3 bg-card/80 backdrop-blur-sm rounded-full"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>
            <div className="bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-sm font-semibold text-foreground">Scanning QR Code...</p>
            </div>
            <div className="w-12"></div>
          </div>

          <div className="relative">
            <div className="w-64 h-64 border-4 border-primary rounded-3xl">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-accent rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-accent rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-accent rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-accent rounded-br-2xl"></div>
            </div>
            {scanning && (
              <div className="absolute top-0 left-0 w-full h-1 bg-accent animate-pulse"></div>
            )}
          </div>

          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 text-center">
            <p className="text-foreground font-medium">Position QR code within the frame</p>
            <p className="text-muted-foreground text-sm mt-1">Supports all major payment networks</p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'payment' && scannedData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setView('home')}
              className="p-2 bg-muted rounded-full"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Confirm Payment</h1>
            <div className="w-10"></div>
          </div>

          <div className="bg-card rounded-3xl p-6 shadow-lg mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary/10 rounded-2xl p-4">
                <Store className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-foreground">{scannedData.name}</h2>
                  {scannedData.verified && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{scannedData.location}</p>
              </div>
            </div>

            <div className="bg-muted rounded-2xl p-6 text-center mb-6">
              <p className="text-muted-foreground text-sm mb-2">Amount to Pay</p>
              <h3 className="text-4xl font-bold text-foreground mb-2">
                {getCurrencySymbol(currency)}{amount}
              </h3>
              <p className="text-sm text-muted-foreground">{paymentNetworks.find(n => n.id === scannedData.network)?.name}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">Payment Method</label>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        selectedPaymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${selectedPaymentMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-foreground">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.balance}</p>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={processPayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay Now</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-full p-8 mb-6 inline-block animate-bounce">
            <CheckCircle className="w-20 h-20 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Payment Successful!</h1>
          <p className="text-green-100 text-lg mb-6">Your payment has been processed</p>
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-30">
            <p className="text-white font-semibold mb-2">{scannedData?.name}</p>
            <p className="text-3xl font-bold text-white">
              {getCurrencySymbol(currency)}{amount}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'transactions') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setView('home')}
              className="p-2 bg-muted rounded-full"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Transaction History</h1>
            <div className="w-10"></div>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="bg-card rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <Receipt className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{txn.merchant}</p>
                        <p className="text-xs text-muted-foreground">{new Date(txn.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{getCurrencySymbol(txn.currency)}{txn.amount}</p>
                      <span className="text-xs bg-green-500/20 text-green-700 px-2 py-1 rounded-full">
                        {txn.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default GlobalQRPayment;