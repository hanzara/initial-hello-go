import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Loader2 } from 'lucide-react';
import { useChamaWallet } from '@/hooks/useChamaWallet';
import { useToast } from '@/hooks/use-toast';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chamaId: string;
  chamaName: string;
  expectedAmount?: number;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  chamaId,
  chamaName,
  expectedAmount
}) => {
  const [formData, setFormData] = useState({
    amount: expectedAmount?.toString() || '',
    payment_method: 'mobile_money',
    payment_reference: '',
    notes: ''
  });

  const { contributeToChama, isProcessing } = useChamaWallet();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount",
        variant: "destructive"
      });
      return;
    }

    try {
      await contributeToChama({
        chama_id: chamaId,
        amount,
        description: formData.notes || `Contribution to ${chamaName}`
      });

      onClose();
      setFormData({
        amount: expectedAmount?.toString() || '',
        payment_method: 'mobile_money', 
        payment_reference: '',
        notes: ''
      });
    } catch (error: any) {
      toast({
        title: "Contribution Failed",
        description: error.message || "Failed to process contribution",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Contribute to {chamaName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Expected Amount Display */}
          {expectedAmount && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Expected Contribution</p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatCurrency(expectedAmount)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min="1"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(value) => handleInputChange('payment_method', value)}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile_money">Mobile Money (M-Pesa)</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Reference */}
            <div className="space-y-2">
              <Label htmlFor="payment_reference">Payment Reference</Label>
              <Input
                id="payment_reference"
                placeholder="Transaction ID or reference"
                value={formData.payment_reference}
                onChange={(e) => handleInputChange('payment_reference', e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add a note for this contribution"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={isProcessing}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isProcessing || !formData.amount}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Contribute'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};