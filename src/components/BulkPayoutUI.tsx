import React, { useState } from 'react';
import { Upload, Download, Users, DollarSign, Check, X, AlertCircle, FileText, Send, ChevronRight, Search, Filter, ArrowLeft, Plus, Trash2, Edit, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Recipient {
  id: number;
  name: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  method: string;
  country: string;
  status: string;
}

interface BulkPayoutUIProps {
  onBack: () => void;
}

const BulkPayoutUI: React.FC<BulkPayoutUIProps> = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Confirm, 4: Processing, 5: Complete
  const [uploadMethod, setUploadMethod] = useState('csv'); // csv, manual, paste
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [schedule, setSchedule] = useState('immediate');
  const [errors, setErrors] = useState<string[]>([]);

  // Sample data for demo
  const sampleRecipients: Recipient[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', amount: 1500, currency: 'USD', method: 'Bank Account', country: 'US', status: 'pending' },
    { id: 2, name: 'Maria Garcia', email: 'maria@example.com', phone: '+521234567890', amount: 500, currency: 'MXN', method: 'SPEI', country: 'MX', status: 'pending' },
    { id: 3, name: 'Wei Chen', email: 'wei@example.com', phone: '+861234567890', amount: 3200, currency: 'CNY', method: 'Alipay', country: 'CN', status: 'pending' },
    { id: 4, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+442012345678', amount: 2100, currency: 'GBP', method: 'Bank Transfer', country: 'UK', status: 'pending' },
    { id: 5, name: 'Raj Patel', email: 'raj@example.com', phone: '+911234567890', amount: 890, currency: 'INR', method: 'UPI', country: 'IN', status: 'pending' }
  ];

  const calculateTotals = () => {
    const total = recipients.reduce((sum, r) => sum + r.amount, 0);
    const fee = total * 0.008; // 0.8% fee
    return { total, fee, net: total + fee };
  };

  const handleUploadCSV = () => {
    setRecipients(sampleRecipients);
    setStep(2);
  };

  const handleManualAdd = () => {
    const newRecipient: Recipient = {
      id: recipients.length + 1,
      name: '',
      email: '',
      phone: '',
      amount: 0,
      currency: 'USD',
      method: 'Bank Account',
      country: 'US',
      status: 'pending'
    };
    setRecipients([...recipients, newRecipient]);
  };

  const handleDeleteRecipient = (id: number) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const handleUpdateRecipient = (id: number, field: keyof Recipient, value: string | number) => {
    setRecipients(recipients.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const handleSubmit = () => {
    const newErrors: string[] = [];
    recipients.forEach((r, index) => {
      if (!r.name) newErrors.push(`Row ${index + 1}: Name is required`);
      if (!r.amount || r.amount <= 0) newErrors.push(`Row ${index + 1}: Valid amount required`);
      if (!r.method) newErrors.push(`Row ${index + 1}: Payment method required`);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    setStep(3);
  };

  const handleConfirm = () => {
    setStep(4);
    setTimeout(() => {
      setStep(5);
      setRecipients(recipients.map(r => ({
        ...r,
        status: Math.random() > 0.1 ? 'completed' : 'failed'
      })));
    }, 3000);
  };

  // STEP 1: UPLOAD METHOD
  const renderUploadStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Create Bulk Payout</h2>
        <p className="text-muted-foreground">Choose how you want to add recipients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setUploadMethod('csv')}
          className={`p-6 border-2 rounded-xl transition-all ${
            uploadMethod === 'csv' 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <Upload className="mx-auto mb-3 text-primary" size={32} />
          <div className="font-semibold mb-1">Upload CSV</div>
          <div className="text-sm text-muted-foreground">Import from file</div>
        </button>

        <button
          onClick={() => setUploadMethod('manual')}
          className={`p-6 border-2 rounded-xl transition-all ${
            uploadMethod === 'manual' 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <Plus className="mx-auto mb-3 text-primary" size={32} />
          <div className="font-semibold mb-1">Add Manually</div>
          <div className="text-sm text-muted-foreground">Enter one by one</div>
        </button>

        <button
          onClick={() => setUploadMethod('paste')}
          className={`p-6 border-2 rounded-xl transition-all ${
            uploadMethod === 'paste' 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <FileText className="mx-auto mb-3 text-primary" size={32} />
          <div className="font-semibold mb-1">Paste Data</div>
          <div className="text-sm text-muted-foreground">Copy & paste</div>
        </button>
      </div>

      {uploadMethod === 'csv' && (
        <div>
          <label className="block text-sm font-medium mb-2">Upload CSV File</label>
          <div 
            onClick={handleUploadCSV}
            className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer"
          >
            <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-lg font-semibold mb-2">Drag & drop your CSV file here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90">
              Choose File
            </button>
          </div>

          <div className="mt-4 flex items-start gap-3 p-4 bg-accent rounded-lg">
            <AlertCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-semibold mb-1">CSV Format Requirements:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Columns: Name, Email/Phone, Amount, Currency, Payment Method, Country</li>
                <li>• Maximum 10,000 recipients per file</li>
                <li>• Supported formats: .csv, .xlsx</li>
              </ul>
            </div>
          </div>

          <button className="mt-4 flex items-center gap-2 text-primary font-medium hover:underline">
            <Download size={18} />
            Download CSV Template
          </button>
        </div>
      )}

      {uploadMethod === 'manual' && (
        <div>
          <button
            onClick={() => {
              setRecipients([{
                id: 1,
                name: '',
                email: '',
                phone: '',
                amount: 0,
                currency: 'USD',
                method: 'Bank Account',
                country: 'US',
                status: 'pending'
              }]);
              setStep(2);
            }}
            className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90"
          >
            Start Adding Recipients
          </button>
        </div>
      )}

      {uploadMethod === 'paste' && (
        <div>
          <label className="block text-sm font-medium mb-2">Paste Recipient Data</label>
          <textarea
            placeholder="Paste your data here (tab or comma separated)&#10;John Doe, john@example.com, 1500, USD, Bank Account&#10;Maria Garcia, maria@example.com, 500, MXN, SPEI"
            className="w-full h-48 p-4 border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
          />
          <button
            onClick={() => {
              setRecipients(sampleRecipients);
              setStep(2);
            }}
            className="mt-4 w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90"
          >
            Parse & Continue
          </button>
        </div>
      )}
    </div>
  );

  // STEP 2: REVIEW & EDIT
  const renderReviewStep = () => {
    const totals = calculateTotals();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Review Recipients</h2>
            <p className="text-muted-foreground">{recipients.length} recipients • Total: ${totals.total.toLocaleString()}</p>
          </div>
          <button
            onClick={handleManualAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90"
          >
            <Plus size={18} />
            Add Recipient
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipients..."
              className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none bg-background"
            />
          </div>
          <button className="px-4 py-3 border-2 border-border rounded-lg hover:border-primary transition-colors">
            <Filter size={20} />
          </button>
        </div>

        {errors.length > 0 && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-destructive mb-2">Please fix these errors:</p>
                <ul className="text-sm text-destructive space-y-1">
                  {errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="text-left p-4 font-semibold text-sm">Recipient</th>
                  <th className="text-left p-4 font-semibold text-sm">Contact</th>
                  <th className="text-left p-4 font-semibold text-sm">Amount</th>
                  <th className="text-left p-4 font-semibold text-sm">Method</th>
                  <th className="text-left p-4 font-semibold text-sm">Country</th>
                  <th className="text-left p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((recipient) => (
                  <tr key={recipient.id} className="border-b border-border hover:bg-accent">
                    <td className="p-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={recipient.name}
                        onChange={(e) => handleUpdateRecipient(recipient.id, 'name', e.target.value)}
                        placeholder="Enter name"
                        className="w-full px-2 py-1 border border-border rounded focus:border-primary focus:outline-none bg-background"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={recipient.email || recipient.phone}
                        onChange={(e) => handleUpdateRecipient(recipient.id, 'email', e.target.value)}
                        placeholder="Email or phone"
                        className="w-full px-2 py-1 border border-border rounded focus:border-primary focus:outline-none bg-background"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={recipient.amount}
                          onChange={(e) => handleUpdateRecipient(recipient.id, 'amount', parseFloat(e.target.value))}
                          className="w-24 px-2 py-1 border border-border rounded focus:border-primary focus:outline-none bg-background"
                        />
                        <select
                          value={recipient.currency}
                          onChange={(e) => handleUpdateRecipient(recipient.id, 'currency', e.target.value)}
                          className="px-2 py-1 border border-border rounded focus:border-primary focus:outline-none bg-background"
                        >
                          <option>USD</option>
                          <option>EUR</option>
                          <option>GBP</option>
                          <option>MXN</option>
                          <option>INR</option>
                          <option>CNY</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={recipient.method}
                        onChange={(e) => handleUpdateRecipient(recipient.id, 'method', e.target.value)}
                        className="w-full px-2 py-1 border border-border rounded focus:border-primary focus:outline-none bg-background"
                      >
                        <option>Bank Account</option>
                        <option>Mobile Money</option>
                        <option>Digital Wallet</option>
                        <option>SPEI</option>
                        <option>UPI</option>
                        <option>Alipay</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={recipient.country}
                        onChange={(e) => handleUpdateRecipient(recipient.id, 'country', e.target.value)}
                        className="w-full px-2 py-1 border border-border rounded focus:border-primary focus:outline-none bg-background"
                      >
                        <option>US</option>
                        <option>UK</option>
                        <option>MX</option>
                        <option>IN</option>
                        <option>CN</option>
                        <option>KE</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteRecipient(recipient.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-accent border border-border rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4">Payment Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Recipients</div>
              <div className="text-2xl font-bold">{recipients.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
              <div className="text-2xl font-bold">${totals.total.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Fees</div>
              <div className="text-2xl font-bold text-primary">${totals.fee.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">You'll Pay</div>
              <div className="text-2xl font-bold text-green-600">${totals.net.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStep(1)}
            className="flex-1 py-4 border-2 border-border font-bold rounded-xl hover:border-primary transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Continue to Confirm
          </button>
        </div>
      </div>
    );
  };

  // STEP 3: CONFIRM & SCHEDULE
  const renderConfirmStep = () => {
    const totals = calculateTotals();

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Confirm & Schedule</h2>
          <p className="text-muted-foreground">Review payment details before sending</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">When to send?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSchedule('immediate')}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                schedule === 'immediate'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  schedule === 'immediate' ? 'border-primary' : 'border-border'
                }`}>
                  {schedule === 'immediate' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                </div>
                <span className="font-semibold">Send Immediately</span>
              </div>
              <p className="text-sm text-muted-foreground ml-8">Payments will be processed right away</p>
            </button>

            <button
              onClick={() => setSchedule('scheduled')}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                schedule === 'scheduled'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  schedule === 'scheduled' ? 'border-primary' : 'border-border'
                }`}>
                  {schedule === 'scheduled' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                </div>
                <span className="font-semibold">Schedule for Later</span>
              </div>
              <p className="text-sm text-muted-foreground ml-8">Choose a specific date and time</p>
            </button>
          </div>

          {schedule === 'scheduled' && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <input
                type="date"
                className="px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none bg-background"
              />
              <input
                type="time"
                className="px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none bg-background"
              />
            </div>
          )}
        </div>

        <div className="bg-card border-2 border-border rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Recipients</span>
              <span className="font-semibold">{recipients.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold">${totals.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction Fees (0.8%)</span>
              <span className="font-semibold">${totals.fee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-bold text-lg">Total to Debit</span>
              <span className="font-bold text-lg text-primary">${totals.net.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Recipients ({recipients.length})</h3>
          <div className="bg-card border border-border rounded-xl max-h-64 overflow-y-auto">
            {recipients.slice(0, 5).map(recipient => (
              <div key={recipient.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                <div>
                  <div className="font-semibold">{recipient.name}</div>
                  <div className="text-sm text-muted-foreground">{recipient.email || recipient.phone}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{recipient.amount} {recipient.currency}</div>
                  <div className="text-sm text-muted-foreground">{recipient.method}</div>
                </div>
              </div>
            ))}
            {recipients.length > 5 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                and {recipients.length - 5} more recipients...
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-accent border border-border rounded-lg">
          <input type="checkbox" className="mt-1" required />
          <div className="text-sm">
            <p className="font-semibold mb-1">Confirm Payment</p>
            <p className="text-muted-foreground">
              I confirm that all recipient information is correct and authorize ChainFlow to process these payments. 
              Once confirmed, this action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStep(2)}
            className="flex-1 py-4 border-2 border-border font-bold rounded-xl hover:border-primary transition-colors"
          >
            Back to Edit
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Send size={20} />
            Confirm & Send
          </button>
        </div>
      </div>
    );
  };

  // STEP 4: PROCESSING
  const renderProcessingStep = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-bold mb-2">Processing Payments...</h2>
      <p className="text-muted-foreground mb-8">Please wait while we process your bulk payout</p>
      <div className="w-full max-w-md bg-muted rounded-full h-3 overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
      <p className="text-sm text-muted-foreground mt-4">Processing {recipients.length} payments...</p>
    </div>
  );

  // STEP 5: COMPLETE
  const renderCompleteStep = () => {
    const completed = recipients.filter(r => r.status === 'completed').length;
    const failed = recipients.filter(r => r.status === 'failed').length;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Payout Complete!</h2>
          <p className="text-muted-foreground">Your bulk payout has been processed</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-accent border border-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">{recipients.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{completed}</div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">{failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Payment Details</h3>
            <button className="text-primary text-sm font-medium hover:underline">
              Download Report
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {recipients.map(recipient => (
              <div key={recipient.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  {recipient.status === 'completed' ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <XCircle className="text-red-600" size={20} />
                  )}
                  <div>
                    <div className="font-semibold">{recipient.name}</div>
                    <div className="text-sm text-muted-foreground">{recipient.email || recipient.phone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{recipient.amount} {recipient.currency}</div>
                  <div className={`text-sm ${recipient.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                    {recipient.status === 'completed' ? 'Completed' : 'Failed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 py-4 border-2 border-border font-bold rounded-xl hover:border-primary transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => setStep(1)}
            className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Create New Payout
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-primary px-4 py-4 text-primary-foreground">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-primary/80 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Bulk Payout</h1>
        </div>
        
        {step < 5 && (
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full ${
                  s <= step ? 'bg-primary-foreground' : 'bg-primary-foreground/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {step === 1 && renderUploadStep()}
        {step === 2 && renderReviewStep()}
        {step === 3 && renderConfirmStep()}
        {step === 4 && renderProcessingStep()}
        {step === 5 && renderCompleteStep()}
      </div>
    </div>
  );
};

export default BulkPayoutUI;
