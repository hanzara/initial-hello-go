import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserPin } from '@/hooks/useUserPin';
import { useNavigate, useLocation } from 'react-router-dom';
import PinVerificationModal from '@/components/PinVerificationModal';
import PinSetupModal from '@/components/PinSetupModal';
import { useToast } from '@/hooks/use-toast';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';

interface PinGateProps {
  children: React.ReactNode;
}

const PinGate: React.FC<PinGateProps> = ({ children }) => {
  const { user, pinVerified, hasPinSetup, setPinVerified, checkPinStatus } = useAuth();
  const { verifyPin } = useUserPin();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);

  // Set up inactivity timeout (5 minutes)
  useInactivityTimeout({
    timeoutMinutes: 5,
    onTimeout: () => {
      toast({
        title: "Session Timeout",
        description: "Please verify your PIN to continue",
        variant: "default",
      });
    }
  });

  // Auth-related routes that don't need PIN verification
  const publicRoutes = ['/', '/auth'];

  useEffect(() => {
    const isPublicRoute = publicRoutes.includes(location.pathname);
    
    if (!user) {
      // Not logged in - no PIN gate needed
      setShowPinVerification(false);
      setShowPinSetup(false);
      return;
    }

    if (isPublicRoute) {
      // On public routes - redirect authenticated users to dashboard if PIN verified
      if (pinVerified) {
        navigate('/dashboard');
      }
      return;
    }

    // User is logged in and on a protected route
    if (hasPinSetup === null) {
      // Still checking PIN status
      return;
    }

    if (!hasPinSetup) {
      // No PIN setup - show PIN setup modal
      setShowPinSetup(true);
      setShowPinVerification(false);
    } else if (!pinVerified) {
      // Has PIN but not verified - show verification modal
      setShowPinVerification(true);
      setShowPinSetup(false);
    } else {
      // PIN verified - close all modals
      setShowPinVerification(false);
      setShowPinSetup(false);
    }
  }, [user, pinVerified, hasPinSetup, location.pathname, navigate]);

  const handlePinVerification = async (pin: string): Promise<boolean> => {
    const isValid = await verifyPin(pin);
    
    if (isValid) {
      setPinVerified(true);
      setShowPinVerification(false);
      toast({
        title: "Access Granted",
        description: "PIN verified successfully",
      });
      return true;
    }
    
    return false;
  };

  const handlePinSetupComplete = async () => {
    await checkPinStatus();
    setShowPinSetup(false);
    // After setup, show verification
    setShowPinVerification(true);
  };

  return (
    <>
      {children}
      
      <PinVerificationModal
        isOpen={showPinVerification}
        onClose={() => {
          // Don't allow closing without verification on protected routes
          if (!publicRoutes.includes(location.pathname)) {
            toast({
              title: "PIN Required",
              description: "Please verify your PIN to continue",
              variant: "destructive",
            });
          } else {
            setShowPinVerification(false);
          }
        }}
        onVerify={handlePinVerification}
        title="Verify Your PIN"
        description="For your security, please enter your 4-digit PIN to continue"
        required={!publicRoutes.includes(location.pathname)}
      />

      <PinSetupModal
        isOpen={showPinSetup}
        onClose={handlePinSetupComplete}
        required={true}
      />
    </>
  );
};

export default PinGate;
