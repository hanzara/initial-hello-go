import React, { useState } from 'react';
import { Home, Send, TrendingUp, Settings, User, Bell, Plus, QrCode, History, CreditCard, Link, Users, BarChart3, DollarSign, Clock, CheckCircle, ArrowLeft, Search, HelpCircle, Code, Shield, Phone, MessageCircle, ChevronRight, Menu, X, Wallet, FileText, AlertCircle, Key, Webhook, BookOpen, Zap } from 'lucide-react';
import BulkPayoutUI from '@/components/BulkPayoutUI';
import PaymentLinkUI from '@/components/PaymentLinkUI';
import GlobalQRPayment from '@/components/GlobalQRPayment';

const ChainFlowMobile = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState('main');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<number[]>([]);
  
  // Form states
  const [sendAmount, setSendAmount] = useState('5000');
  const [sendCurrency, setSendCurrency] = useState('USD');
  const [receiveCurrency, setReceiveCurrency] = useState('KES');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');


  const exchangeRate = 129.50;
  const calculatedAmount = (parseFloat(sendAmount) * exchangeRate).toFixed(2);
  const fee = (parseFloat(sendAmount) * 0.006).toFixed(2);

  const notifications = [
    { type: 'success', title: 'Payment completed', desc: '$5,000 USD → KES successfully delivered', time: '2 mins ago', id: 1 },
    { type: 'warning', title: 'Bulk payout attention', desc: '3 out of 250 payments failed', time: '1 hour ago', id: 2 },
    { type: 'info', title: 'Funds received', desc: '$2,500 USD received via bank transfer', time: '3 hours ago', id: 3 }
  ];

  const unreadCount = notifications.filter(n => !readNotifications.includes(n.id)).length;

  const markAsRead = (id: number) => {
    if (!readNotifications.includes(id)) {
      setReadNotifications(prev => [...prev, id]);
    }
  };

  const markAllAsRead = () => {
    setReadNotifications(notifications.map(n => n.id));
  };

  const transactions = [
    { id: 1, amount: '$5,000', to: 'KES', recipient: '+254712***678', status: 'Completed', date: 'Nov 22, 3:45 PM', color: 'green' },
    { id: 2, amount: '$1,200', to: 'PHP', recipient: '+639171***567', status: 'Processing', date: 'Nov 22, 2:30 PM', color: 'yellow' },
    { id: 3, amount: '$750', to: 'INR', recipient: 'john@***', status: 'Completed', date: 'Nov 22, 1:15 PM', color: 'green' },
    { id: 4, amount: '$2,500', to: 'EUR', recipient: 'maria@***', status: 'Completed', date: 'Nov 21, 5:20 PM', color: 'green' },
    { id: 5, amount: '$100', to: 'MXN', recipient: '+521234***890', status: 'Failed', date: 'Nov 21, 2:10 PM', color: 'red' }
  ];

  const filteredTransactions = transactions.filter(tx => {
    if (selectedFilter === 'All') return true;
    return tx.status === selectedFilter;
  }).filter(tx => {
    if (!searchQuery) return true;
    return tx.amount.includes(searchQuery) || tx.recipient.includes(searchQuery);
  });

  const goBack = () => {
    setCurrentScreen('main');
  };

  const handleSendMoney = () => {
    if (!recipientPhone) {
      alert('Please enter recipient phone number');
      return;
    }
    alert(`Sending ${sendAmount} ${sendCurrency} to ${recipientPhone}\nRecipient gets: ${calculatedAmount} ${receiveCurrency}\nFee: $${fee}`);
    setCurrentScreen('main');
  };

  const renderStatusBar = () => (
    <div className="bg-indigo-600 px-3 sm:px-4 md:px-6 pt-3 pb-2">
      <div className="flex items-center justify-between text-white text-xs sm:text-sm">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 border border-white rounded-sm"></div>
          <div className="w-1 h-3 bg-white rounded-sm"></div>
        </div>
      </div>
    </div>
  );

  const renderHeader = (title: string, showBack = false) => (
    <div className="bg-indigo-600 px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-white">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="p-1.5 sm:p-2 hover:bg-indigo-700 rounded-lg active:scale-95 transition-transform"
          >
            {menuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
          </button>
          {showBack && (
            <button onClick={goBack} className="p-1.5 sm:p-2 hover:bg-indigo-700 rounded-lg active:scale-95 transition-transform">
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
          )}
          {!showBack && (
            <div>
              <div className="text-xs sm:text-sm opacity-80">Welcome back</div>
              <div className="text-base sm:text-lg md:text-xl font-bold">{title}</div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-1.5 sm:p-2 hover:bg-indigo-700 rounded-lg active:scale-95 transition-all"
          >
            <Bell size={18} className="sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-[10px] sm:text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-700 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
            HR
          </div>
        </div>
      </div>
      {!showBack && currentTab === 'home' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-5">
          <div className="text-xs sm:text-sm opacity-80 mb-1">Total Balance</div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold">$50,000.00</div>
          <div className="text-xs sm:text-sm mt-1 sm:mt-2">USD</div>
        </div>
      )}
    </div>
  );

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 sm:py-3 shadow-2xl z-40 safe-area-bottom">
      <div className="flex items-center justify-around px-2 sm:px-4 md:px-6 max-w-2xl mx-auto">
        {[
          { icon: Home, label: 'Home', tab: 'home' },
          { icon: Send, label: 'Payments', tab: 'payments' },
          { icon: TrendingUp, label: 'Analytics', tab: 'analytics' },
          { icon: User, label: 'Account', tab: 'account' }
        ].map((nav, i) => {
          const Icon = nav.icon;
          const isActive = currentTab === nav.tab;
          return (
            <button
              key={i}
              onClick={() => { 
                setCurrentTab(nav.tab); 
                setCurrentScreen('main');
                setMenuOpen(false);
                setNotificationOpen(false);
              }}
              className={`flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all active:scale-95 ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500'}`}
            >
              <Icon size={20} className="sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs font-medium">{nav.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // HOME SCREEN
  const renderHomeScreen = () => (
    <>
      {/* Key Metrics Section */}
      <div className="px-3 sm:px-4 md:px-6 -mt-4 sm:-mt-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-card rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-border">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5 sm:mb-1">Total Volume</div>
            <div className="text-lg sm:text-2xl font-bold text-foreground">$2.5M</div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-0.5 sm:mt-1">+15% vs last mo</div>
          </div>
          <div className="bg-card rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-border">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5 sm:mb-1">Total Fees Saved</div>
            <div className="text-lg sm:text-2xl font-bold text-foreground">$75,000</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">vs traditional</div>
          </div>
          <div className="bg-card rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-border">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5 sm:mb-1">Success Rate</div>
            <div className="text-lg sm:text-2xl font-bold text-foreground">99.8%</div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-0.5 sm:mt-1">↑ 0.2%</div>
          </div>
          <div className="bg-card rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-border">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5 sm:mb-1">Active Customers</div>
            <div className="text-lg sm:text-2xl font-bold text-foreground">1,247</div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-0.5 sm:mt-1">+89 this month</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-2 sm:px-4 mb-6">
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-bold text-foreground">Recent Transactions</h3>
            <button onClick={() => setCurrentScreen('history')} className="text-indigo-600 text-sm font-medium active:scale-95">
              View All →
            </button>
          </div>
          <div className="divide-y divide-border">
            {[
              { amount: '$5,000', currency: 'USD → KES', status: 'Completed', time: '2 mins ago', method: 'Stellar', icon: '✅' },
              { amount: '$1,200', currency: 'USD → PHP', status: 'Processing', time: '5 mins ago', method: 'Bank Transfer', icon: '⏳' },
              { amount: '$750', currency: 'USD → INR', status: 'Completed', time: '12 mins ago', method: 'UPI', icon: '✅' }
            ].map((tx, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <span className="text-xl">{tx.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-sm">{tx.amount} {tx.currency}</div>
                  <div className="text-xs text-muted-foreground">{tx.status} • {tx.time} • {tx.method}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="px-2 sm:px-4 mb-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-4">
          <h3 className="font-bold text-foreground mb-4">Transaction Volume (Last 30 Days)</h3>
          <div className="relative h-48 flex items-end justify-between gap-1">
            {[120, 180, 250, 300, 280, 350, 420, 380, 450, 500, 480, 520].map((height, i) => (
              <div key={i} className="flex-1 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors cursor-pointer" 
                   style={{ height: `${(height / 520) * 100}%` }}
                   title={`$${height}k`}>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Nov 1</span>
            <span>Nov 15</span>
            <span>Nov 30</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 sm:px-4 md:px-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <button 
            onClick={() => setCurrentScreen('send')}
            className="bg-card rounded-lg sm:rounded-xl shadow-sm border border-border p-3 sm:p-4 active:scale-95 transition-transform hover:border-indigo-300"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <Send className="text-indigo-600" size={18} />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">💸 Send Money</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Send to anyone</div>
          </button>
          <button 
            onClick={() => setCurrentScreen('bulk')}
            className="bg-card rounded-lg sm:rounded-xl shadow-sm border border-border p-3 sm:p-4 active:scale-95 transition-transform hover:border-green-300"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <Users className="text-green-600" size={18} />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">📊 Disburse Bulk</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Pay multiple</div>
          </button>
          <button 
            onClick={() => setCurrentScreen('payment-link')}
            className="bg-card rounded-lg sm:rounded-xl shadow-sm border border-border p-3 sm:p-4 active:scale-95 transition-transform hover:border-purple-300"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <Link className="text-purple-600" size={18} />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">🔗 Create Link</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Get paid online</div>
          </button>
          <button 
            onClick={() => setCurrentScreen('scan')}
            className="bg-card rounded-lg sm:rounded-xl shadow-sm border border-border p-3 sm:p-4 active:scale-95 transition-transform hover:border-orange-300"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <QrCode className="text-orange-600" size={18} />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">📷 Scan QR</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Quick payment</div>
          </button>
        </div>
      </div>

      {/* Wallet Balances */}
      <div className="px-2 sm:px-4 pb-24">
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-bold text-foreground">Your Wallets</h3>
            <button className="text-indigo-600 text-sm font-medium active:scale-95">
              Add Funds →
            </button>
          </div>
          <div className="divide-y divide-border">
            {[
              { currency: 'USD', balance: '50,000.00', available: '48,500.00', flag: '💵' },
              { currency: 'USDC', balance: '25,000 USDC', available: '25,000 USDC', flag: '🪙' },
              { currency: 'KES', balance: '500,000 KES', available: '500,000 KES', flag: '🇰🇪' }
            ].map((wallet, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{wallet.flag}</span>
                  <div>
                    <div className="font-semibold text-foreground">{wallet.flag.includes('🪙') ? wallet.currency : `${wallet.currency}  $${wallet.balance.split(' ')[0]}`}</div>
                    <div className="text-sm text-muted-foreground">Available: {wallet.available}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // PAYMENTS SCREEN
  const renderPaymentsScreen = () => (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-20 sm:pb-24">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Payment Options</h2>
      <div className="space-y-3">
        {[
          { icon: Send, title: 'Send Money', desc: 'Transfer to anyone globally', screen: 'send' },
          { icon: Users, title: 'Bulk Payout', desc: 'Pay multiple recipients', screen: 'bulk' },
          { icon: Link, title: 'Payment Link', desc: 'Create shareable link', screen: 'payment-link' },
          { icon: CreditCard, title: 'Subscriptions', desc: 'Manage recurring payments', screen: 'subscriptions' },
          { icon: Shield, title: 'Escrow', desc: 'Secure held payments', screen: 'escrow' },
          { icon: History, title: 'All Transactions', desc: 'View payment history', screen: 'history' }
        ].map((option, i) => {
          const Icon = option.icon;
          return (
            <button
              key={i}
              onClick={() => setCurrentScreen(option.screen)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-500 active:bg-indigo-50 transition-all"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="text-indigo-600" size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">{option.title}</div>
                <div className="text-sm text-gray-600">{option.desc}</div>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );

  // ANALYTICS SCREEN
  const renderAnalyticsScreen = () => (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-20 sm:pb-24">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[
          { label: 'Total Volume', value: '$2.5M', change: '+15%', icon: TrendingUp, color: 'text-green-500' },
          { label: 'Fees Saved', value: '$75K', change: 'vs trad.', icon: DollarSign, color: 'text-blue-500' },
          { label: 'Success Rate', value: '99.8%', change: '↑ 0.2%', icon: CheckCircle, color: 'text-green-500' },
          { label: 'Avg Time', value: '4.2m', change: '↓ 1.5m', icon: Clock, color: 'text-purple-500' }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 font-medium">{metric.label}</span>
                <Icon className={metric.color} size={16} />
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-xs text-green-600 mt-1 font-medium">{metric.change}</div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {[
          { icon: BarChart3, title: 'Cost Savings Report', desc: 'Compare with traditional providers', screen: 'cost-savings' },
          { icon: TrendingUp, title: 'Performance Metrics', desc: 'Success rates & settlement speed', screen: 'performance' },
          { icon: BarChart3, title: 'Top Corridors', desc: 'Most used payment routes', screen: 'corridors' },
          { icon: FileText, title: 'Generate Reports', desc: 'Download detailed analytics', screen: 'reports' }
        ].map((option, i) => {
          const Icon = option.icon;
          return (
            <button
              key={i}
              onClick={() => setCurrentScreen(option.screen)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 active:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Icon className="text-indigo-600" size={20} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm">{option.title}</div>
                <div className="text-xs text-gray-600">{option.desc}</div>
              </div>
              <ChevronRight className="text-gray-400" size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );

  // ACCOUNT SCREEN
  const renderAccountScreen = () => (
    <div className="px-2 sm:px-4 py-6 pb-24">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            JD
          </div>
          <div>
            <div className="text-xl font-bold">Harun Nzai</div>
            <div className="text-sm opacity-80">nzaiharun28@gmail.com</div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 rounded-lg p-3">
            <div className="text-xs opacity-80">KYC Level</div>
            <div className="font-bold">Level 2 ✓</div>
          </div>
          <div className="flex-1 bg-white/10 rounded-lg p-3">
            <div className="text-xs opacity-80">Member Since</div>
            <div className="font-bold">Jan 2025</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { icon: User, title: 'Profile Settings', desc: 'Update your information', screen: 'profile' },
          { icon: Users, title: 'Team Management', desc: 'Manage team members', screen: 'team' },
          { icon: Shield, title: 'Security', desc: '2FA, API keys, sessions', screen: 'security' },
          { icon: Bell, title: 'Notifications', desc: 'Manage alerts & emails', screen: 'notifications-settings' },
          { icon: Code, title: 'Developer Tools', desc: 'API keys & documentation', screen: 'developer' },
          { icon: CreditCard, title: 'Billing', desc: 'Subscription & invoices', screen: 'billing' },
          { icon: HelpCircle, title: 'Help & Support', desc: 'Get help with ChainFlow', screen: 'help' },
          { icon: Settings, title: 'App Settings', desc: 'Preferences & configuration', screen: 'app-settings' }
        ].map((option, i) => {
          const Icon = option.icon;
          return (
            <button
              key={i}
              onClick={() => setCurrentScreen(option.screen)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 active:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Icon className="text-gray-700" size={20} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm">{option.title}</div>
                <div className="text-xs text-gray-600">{option.desc}</div>
              </div>
              <ChevronRight className="text-gray-400" size={18} />
            </button>
          );
        })}
      </div>

      <button 
        onClick={() => alert('Signing out...')}
        className="w-full mt-6 py-4 bg-red-50 text-red-600 font-bold rounded-xl active:bg-red-100 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );

  // SEND MONEY SCREEN
  const renderSendMoneyScreen = () => (
    <div className="px-4 py-6 pb-24 space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">You Send</label>
        <div className="relative">
          <input
            type="number"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
            className="w-full text-3xl font-bold p-4 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
          <select 
            value={sendCurrency}
            onChange={(e) => setSendCurrency(e.target.value)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold bg-gray-100 px-3 py-2 rounded-lg"
          >
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Zap className="text-indigo-600" size={20} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient Gets</label>
        <div className="relative">
          <input
            type="text"
            value={calculatedAmount}
            className="w-full text-3xl font-bold p-4 border-2 border-gray-300 rounded-xl bg-gray-50"
            readOnly
          />
          <select 
            value={receiveCurrency}
            onChange={(e) => setReceiveCurrency(e.target.value)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold bg-gray-100 px-3 py-2 rounded-lg"
          >
            <option>KES</option>
            <option>PHP</option>
            <option>INR</option>
            <option>MXN</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Exchange Rate</span>
          <span className="font-semibold">1 {sendCurrency} = {exchangeRate} {receiveCurrency}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Fee</span>
          <span className="font-semibold">${fee} (0.6%)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Arrival Time</span>
          <span className="font-semibold text-green-600">~5 minutes</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient Phone</label>
        <input
          type="tel"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(e.target.value)}
          placeholder="+254 712 345 678"
          className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <button 
        onClick={handleSendMoney}
        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl active:bg-indigo-700 transition-colors"
      >
        Send ${sendAmount}
      </button>
    </div>
  );

  // TRANSACTION HISTORY SCREEN
  const renderHistoryScreen = () => (
    <div className="px-4 py-6 pb-24">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transactions..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['All', 'Completed', 'Processing', 'Failed'].map((filter, i) => (
          <button
            key={i}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedFilter === filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((tx) => (
          <button
            key={tx.id}
            onClick={() => setCurrentScreen(`transaction-${tx.id}`)}
            className="w-full text-left p-4 bg-white rounded-xl border border-gray-200 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-lg">{tx.amount} → {tx.to}</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                tx.color === 'green' ? 'bg-green-100 text-green-800' :
                tx.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {tx.status}
              </span>
            </div>
            <div className="text-sm text-gray-600">To: {tx.recipient}</div>
            <div className="text-xs text-gray-500 mt-1">{tx.date}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // SIDE MENU
  const renderSideMenu = () => (
    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMenuOpen(false)}>
      <div 
        className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Menu</h3>
            <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {[
            { icon: Home, label: 'Home', tab: 'home' },
            { icon: Send, label: 'Payments', tab: 'payments' },
            { icon: TrendingUp, label: 'Analytics', tab: 'analytics' },
            { icon: User, label: 'Account', tab: 'account' },
            { icon: Code, label: 'Developers', screen: 'developer' },
            { icon: HelpCircle, label: 'Help & Support', screen: 'help' },
            { icon: Bell, label: 'Notifications', action: () => { setNotificationOpen(true); setMenuOpen(false); } }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => {
                  if (item.tab) {
                    setCurrentTab(item.tab);
                    setCurrentScreen('main');
                  }
                  if (item.screen) setCurrentScreen(item.screen);
                  if (item.action) item.action();
                  if (!item.action) setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <Icon size={20} className="text-gray-700" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // NOTIFICATIONS PANEL
  const renderNotifications = () => (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" 
      onClick={() => setNotificationOpen(false)}
    >
      <div 
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-6 shadow-lg z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Notifications</h3>
                <p className="text-xs text-white/80">{unreadCount} unread</p>
              </div>
            </div>
            <button 
              onClick={() => setNotificationOpen(false)} 
              className="p-2 hover:bg-white/20 rounded-lg transition-colors active:scale-95"
            >
              <X size={24} />
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs sm:text-sm font-medium text-white/90 hover:text-white flex items-center gap-2 transition-colors"
            >
              <CheckCircle size={16} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="text-muted-foreground" size={32} />
              </div>
              <h4 className="font-semibold text-foreground mb-1">All caught up!</h4>
              <p className="text-sm text-muted-foreground">No new notifications</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isRead = readNotifications.includes(notif.id);
              const getNotifIcon = () => {
                if (notif.type === 'success') return <CheckCircle className="text-green-600" size={20} />;
                if (notif.type === 'warning') return <AlertCircle className="text-yellow-600" size={20} />;
                return <Bell className="text-blue-600" size={20} />;
              };
              
              return (
                <div 
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`group relative p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    isRead 
                      ? 'bg-muted/50 border-border hover:border-border' 
                      : 'bg-card border-l-4 shadow-sm ' + (
                          notif.type === 'success' ? 'border-green-500 hover:border-green-600' :
                          notif.type === 'warning' ? 'border-yellow-500 hover:border-yellow-600' :
                          'border-blue-500 hover:border-blue-600'
                        )
                  }`}
                >
                  {!isRead && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'success' ? 'bg-green-100' :
                      notif.type === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {getNotifIcon()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm sm:text-base mb-1 ${isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notif.title}
                      </div>
                      <div className={`text-xs sm:text-sm mb-2 ${isRead ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                        {notif.desc}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span>{notif.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="sticky bottom-0 p-4 border-t border-border bg-background/95 backdrop-blur-lg">
            <button 
              onClick={() => {
                setNotificationOpen(false);
                // Navigate to notifications page
              }}
              className="w-full py-3 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-xl transition-all active:scale-95 border-2 border-transparent hover:border-indigo-200"
            >
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // GENERIC DETAIL SCREEN
  const renderDetailScreen = (title: string, content: string) => (
    <div className="px-4 py-6 pb-24">
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="text-indigo-600" size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{content}</p>
        <button 
          onClick={goBack}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg active:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  // TRANSACTION DETAIL SCREEN
  const renderTransactionDetail = (id: string) => {
    const transaction = transactions.find(tx => tx.id === parseInt(id));
    if (!transaction) return renderDetailScreen('Transaction Not Found', 'This transaction could not be found.');

    return (
      <div className="px-4 py-6 pb-24">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className={`p-6 text-center ${
            transaction.color === 'green' ? 'bg-green-50' :
            transaction.color === 'yellow' ? 'bg-yellow-50' :
            'bg-red-50'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              transaction.color === 'green' ? 'bg-green-100' :
              transaction.color === 'yellow' ? 'bg-yellow-100' :
              'bg-red-100'
            }`}>
              {transaction.color === 'green' ? 
                <CheckCircle className="text-green-600" size={32} /> :
                transaction.color === 'yellow' ?
                <Clock className="text-yellow-600" size={32} /> :
                <AlertCircle className="text-red-600" size={32} />
              }
            </div>
            <h2 className="text-3xl font-bold mb-2">{transaction.amount}</h2>
            <div className="text-lg font-semibold">{transaction.status}</div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-semibold">tx_{transaction.id}abc123</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">To Currency</span>
              <span className="font-semibold">{transaction.to}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Recipient</span>
              <span className="font-semibold">{transaction.recipient}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-semibold">{transaction.date}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Fee</span>
              <span className="font-semibold">$30.00 (0.6%)</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Route</span>
              <span className="font-semibold">Blockchain (Stellar)</span>
            </div>
          </div>

          <div className="p-6 space-y-3 border-t border-gray-200">
            <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg active:bg-indigo-700">
              Download Receipt
            </button>
            <button className="w-full py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg active:bg-gray-50">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  };

  // MAIN RENDER LOGIC
  const renderScreen = () => {
    // Transaction detail screens
    if (currentScreen.startsWith('transaction-')) {
      const id = currentScreen.split('-')[1];
      return (
        <>
          {renderStatusBar()}
          {renderHeader('Transaction Details', true)}
          {renderTransactionDetail(id)}
        </>
      );
    }

    // Main screens
    switch(currentScreen) {
      case 'main':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Harun')}
            {currentTab === 'home' && renderHomeScreen()}
            {currentTab === 'payments' && renderPaymentsScreen()}
            {currentTab === 'analytics' && renderAnalyticsScreen()}
            {currentTab === 'account' && renderAccountScreen()}
          </>
        );
      
      case 'send':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Send Money', true)}
            {renderSendMoneyScreen()}
          </>
        );
      
      case 'history':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Transaction History', true)}
            {renderHistoryScreen()}
          </>
        );
      
      case 'add-funds':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Add Funds', true)}
            {renderDetailScreen('Add Funds', 'Choose a payment method to add funds to your wallet.')}
          </>
        );
      
      case 'scan':
        return <GlobalQRPayment />;
      
      case 'bulk':
        return <BulkPayoutUI onBack={() => setCurrentScreen('main')} />;
      
      case 'payment-link':
        return <PaymentLinkUI onBack={() => setCurrentScreen('main')} />;
      
      case 'subscriptions':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Subscriptions', true)}
            {renderDetailScreen('Manage Subscriptions', 'View and manage your recurring payment subscriptions.')}
          </>
        );
      
      case 'escrow':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Escrow Payments', true)}
            {renderDetailScreen('Escrow Service', 'Create secure held payments that release when conditions are met.')}
          </>
        );
      
      case 'cost-savings':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Cost Savings', true)}
            {renderDetailScreen('Cost Savings Report', 'Detailed comparison of your savings vs traditional payment providers.')}
          </>
        );
      
      case 'performance':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Performance', true)}
            {renderDetailScreen('Performance Metrics', 'View success rates, average settlement times, and reliability statistics.')}
          </>
        );
      
      case 'corridors':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Top Corridors', true)}
            {renderDetailScreen('Payment Corridors', 'Analysis of your most used payment routes and corridors.')}
          </>
        );
      
      case 'reports':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Reports', true)}
            {renderDetailScreen('Generate Reports', 'Create and download detailed payment and analytics reports.')}
          </>
        );
      
      case 'profile':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Profile Settings', true)}
            {renderDetailScreen('Edit Profile', 'Update your personal information and business details.')}
          </>
        );
      
      case 'team':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Team Management', true)}
            {renderDetailScreen('Manage Team', 'Invite team members and manage their roles and permissions.')}
          </>
        );
      
      case 'security':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Security', true)}
            {renderDetailScreen('Security Settings', 'Manage 2FA, API keys, active sessions, and security preferences.')}
          </>
        );
      
      case 'notifications-settings':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Notification Settings', true)}
            {renderDetailScreen('Manage Notifications', 'Configure your email, SMS, and push notification preferences.')}
          </>
        );
      
      case 'developer':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Developer Tools', true)}
            {renderDetailScreen('Developer Portal', 'Access API keys, documentation, webhooks, and testing tools.')}
          </>
        );
      
      case 'billing':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Billing', true)}
            {renderDetailScreen('Billing & Invoices', 'View your subscription plan, payment methods, and invoice history.')}
          </>
        );
      
      case 'help':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('Help & Support', true)}
            {renderDetailScreen('Get Help', 'Search our help center, contact support, or start a live chat.')}
          </>
        );
      
      case 'app-settings':
        return (
          <>
            {renderStatusBar()}
            {renderHeader('App Settings', true)}
            {renderDetailScreen('Settings', 'Configure app preferences, language, theme, and other options.')}
          </>
        );
      
      default:
        return (
          <>
            {renderStatusBar()}
            {renderHeader(currentScreen, true)}
            {renderDetailScreen(currentScreen, `This is the ${currentScreen} screen.`)}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-screen w-full max-w-md lg:max-w-2xl mx-auto">
        
        {/* Mobile Phone Frame */}
        <div className="relative bg-white h-full overflow-hidden sm:rounded-3xl sm:shadow-2xl">
          
          {/* Screen Content */}
          <div className="h-full overflow-y-auto pb-safe">
            {renderScreen()}
          </div>

          {/* Bottom Navigation */}
          {renderBottomNav()}

          {/* Side Menu Overlay */}
          {menuOpen && renderSideMenu()}

          {/* Notifications Overlay */}
          {notificationOpen && renderNotifications()}
        </div>
      </div>
    </div>
  );
};

export default ChainFlowMobile;
