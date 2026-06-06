import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const AGE_GATE_STORAGE_KEY = 'oops-age-gate-approved';

type GateState = 'prompt' | 'granted' | 'denied';

const getInitialGateState = (): GateState => {
  if (typeof window === 'undefined') return 'prompt';
  return window.localStorage.getItem(AGE_GATE_STORAGE_KEY) === 'true' ? 'granted' : 'prompt';
};

const AgeGate = () => {
  const [gateState, setGateState] = useState<GateState>(getInitialGateState);

  const allowAccess = () => {
    window.localStorage.setItem(AGE_GATE_STORAGE_KEY, 'true');
    setGateState('granted');
  };

  const denyAccess = () => {
    setGateState('denied');
  };

  if (gateState === 'granted') return null;

  return (
    <>
      <AlertDialog open={gateState === 'prompt'}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl">
              Are you 21 or older?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6">
              This website contains adult wellness content and products intended only for visitors who are 21 years of age or above.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={denyAccess}>
              No, I am under 21
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={allowAccess}
              className="gradient-cyan text-primary-foreground hover:opacity-90"
            >
              Yes, I am 21+
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {gateState === 'denied' && (
        <div className="fixed inset-0 z-[60] flex min-h-screen items-center justify-center bg-background px-6 text-center">
          <div className="max-w-lg rounded-2xl border border-border bg-card p-8 shadow-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Access Restricted</p>
            <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
              You must be 21 or older to enter this site.
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              If you are under 21, please exit now. This restriction is in place to keep access limited to eligible adult visitors only.
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => window.history.length > 1 ? window.history.back() : window.location.replace('https://www.google.com')}
              >
                Leave Site
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgeGate;
