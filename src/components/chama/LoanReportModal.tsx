import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface LoanReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
  chamaId: string;
}

export const LoanReportModal: React.FC<LoanReportModalProps> = ({
  isOpen,
  onClose,
  loan,
  chamaId
}) => {
  const [paymentNumber, setPaymentNumber] = useState(loan.member_payment_number || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('chama_loan_requests')
        .update({
          member_payment_number: paymentNumber,
          report: `Payment details provided: ${paymentNumber}`
        })
        .eq('id', loan.id);

      if (error) throw error;

      toast({
        title: "Payment Details Saved! ✅",
        description: "Member payment details updated successfully"
      });

      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Failed to Save",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Loan Report & Payment Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Loan Amount:</span>
              <span className="font-medium">KES {loan.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-medium">KES {(loan.amount_paid || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">{loan.status}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentNumber">Member Payment Number</Label>
            <Input
              id="paymentNumber"
              value={paymentNumber}
              onChange={(e) => setPaymentNumber(e.target.value)}
              placeholder="e.g., +254712345678 or Mpesa number"
            />
            <p className="text-xs text-muted-foreground">
              This is where funds will be sent when you click "Send"
            </p>
          </div>

          {loan.report && (
            <div className="space-y-2">
              <Label>Report Notes</Label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                {loan.report}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? 'Saving...' : 'Save Details'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};