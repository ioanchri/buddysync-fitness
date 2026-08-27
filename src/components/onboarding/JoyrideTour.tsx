'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { usePathname, useRouter } from 'next/navigation';
import { getTourSteps, TOUR_STORAGE_KEY } from './tourSteps';

// Map step target -> route that contains it, to auto-navigate when user clicks Next
// 'body' (centered modals) intentionally has no route — they work from any page
const targetRouteMap: Record<string, string> = {
  '[data-tour="header-brand"]': '/',
  '[data-tour="sidebar-nav"]': '/',
  '[data-tour="bottom-nav"]': '/',
  '[data-tour="dashboard-welcome"]': '/',
  '[data-tour="dashboard-metrics"]': '/',
  '[data-tour="dashboard-steps"]': '/',
  '[data-tour="dashboard-streak"]': '/',
  '[data-tour="dashboard-feed"]': '/',
  '[data-tour="buddies-invite"]': '/buddies',
  '[data-tour="buddies-feed"]': '/buddies',
  '[data-tour="calendar-grid"]': '/calendar',
  '[data-tour="calendar-invites"]': '/calendar',
  '[data-tour="progress-weight"]': '/progress',
  '[data-tour="progress-badges"]': '/progress',
  '[data-tour="onboarding-profile"]': '/onboarding',
  '[data-tour="onboarding-code"]': '/onboarding',
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = () => setIsMobile(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export const JoyrideTour: React.FC = () => {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const isNavigatingRef = React.useRef(false);

  const steps = useMemo(() => getTourSteps(isMobile), [isMobile]);

  // helper: check if target element already exists in current DOM (for global header/sidebar that exist on all routes)
  const targetExistsOnPage = React.useCallback((target: string) => {
    if (target === 'body') return true;
    try {
      return !!document.querySelector(target);
    } catch {
      return false;
    }
  }, []);

  // Expose global controls so Onboarding page button can start tour
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { step?: number } | undefined;
      const targetStep = typeof detail?.step === 'number' ? detail.step : 0;
      // If tour targets are on other routes, navigate to first step's route before starting — but only if element not already on page (header/sidebar are global)
      const firstStepTarget = steps[targetStep]?.target as string | undefined;
      const route = firstStepTarget ? targetRouteMap[firstStepTarget] : undefined;
      const needsNav = route && route !== pathname && firstStepTarget !== 'body' && firstStepTarget != null && !targetExistsOnPage(firstStepTarget);
      if (needsNav && route) {
        isNavigatingRef.current = true;
        router.push(route);
        setTimeout(() => {
          setStepIndex(targetStep);
          setRun(true);
          isNavigatingRef.current = false;
        }, 600);
      } else {
        setStepIndex(targetStep);
        setRun(true);
      }
    };
    window.addEventListener('buddysync:start-tour', handler as EventListener);
    return () => window.removeEventListener('buddysync:start-tour', handler as EventListener);
  }, [pathname, router, steps, targetExistsOnPage]);

  const handleCallback = useCallback(
    (data: any) => {
      const { status, type, index, action } = data;

      // Handle "target not found" — keep tour mounted and poll until element appears (handles slow mount after navigation)
      if (type === 'error:target_not_found') {
        const failedTarget = steps[index]?.target as string | undefined;
        if (!failedTarget || failedTarget === 'body') return;
        let attempts = 0;
        const poll = setInterval(() => {
          attempts++;
          const exists = (() => { try { return !!document.querySelector(failedTarget as string); } catch { return false; } })();
          if (exists || attempts > 20) {
            clearInterval(poll);
            if (exists) {
              setStepIndex(index);
            }
          }
        }, 200);
        return;
      }

      // Fallback for non-custom flows (if Joyride internal Next is ever used) — keep run true and poll for target
      if (type === 'step:after' && action === 'next') {
        const nextIdx = index + 1;
        const nextTarget = steps[nextIdx]?.target as string | undefined;
        const nextRoute = nextTarget ? targetRouteMap[nextTarget] : undefined;
        const needsNav = nextRoute && nextRoute !== pathname && nextTarget !== 'body' && nextTarget != null && !targetExistsOnPage(nextTarget as string);
        if (needsNav && nextRoute) {
          router.push(nextRoute);
          let attempts = 0;
          const poll = setInterval(() => {
            attempts++;
            const exists = nextTarget === 'body' || (() => { try { return !!document.querySelector(nextTarget as string); } catch { return false; } })();
            if (exists || attempts > 30) {
              clearInterval(poll);
              setStepIndex(nextIdx);
            }
          }, 150);
        } else {
          setStepIndex(nextIdx);
        }
        return;
      }
      if (type === 'step:after' && action === 'prev') {
        const prevIdx = index - 1;
        const prevTarget = steps[prevIdx]?.target as string | undefined;
        const prevRoute = prevTarget ? targetRouteMap[prevTarget] : undefined;
        const needsNav = prevRoute && prevRoute !== pathname && prevTarget !== 'body' && prevTarget != null && !targetExistsOnPage(prevTarget as string);
        if (needsNav && prevRoute) {
          router.push(prevRoute);
          let attempts = 0;
          const poll = setInterval(() => {
            attempts++;
            const exists = prevTarget === 'body' || (() => { try { return !!document.querySelector(prevTarget as string); } catch { return false; } })();
            if (exists || attempts > 30) {
              clearInterval(poll);
              setStepIndex(Math.max(0, prevIdx));
            }
          }, 150);
        } else {
          setStepIndex(Math.max(0, prevIdx));
        }
        return;
      }

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        // Ignore SKIPPED that was caused by our programmatic navigation pause
        if (status === STATUS.SKIPPED && isNavigatingRef.current) {
          return;
        }
        setRun(false);
        setStepIndex(0);
        isNavigatingRef.current = false;
        try {
          localStorage.setItem(TOUR_STORAGE_KEY, 'true');
          window.dispatchEvent(new Event('buddysync:tour-finished'));
        } catch {}
      }
      if (type === 'tour:end') {
        setRun(false);
      }
    },
    [pathname, router, steps, targetExistsOnPage]
  );

  // Responsive tooltip sizing: ensure joyride tooltip never overflows on mobile
  // We override styles based on current theme (detect .dark on html)
  // Custom tooltip that bypasses Joyride's broken React 19 primaryProps.onClick handler.
  // We directly control stepIndex via our state, which works reliably.
  const CustomTooltip = useCallback(
    (props: any) => {
      const { index, step, size, isLastStep, tooltipProps } = props;
      const title = (step as any).title as string | undefined;
      const content = (step as any).content as React.ReactNode;

      const handleNext = () => {
        const nextIdx = index + 1;
        if (isLastStep) {
          setRun(false);
          setStepIndex(0);
          try {
            localStorage.setItem(TOUR_STORAGE_KEY, 'true');
            window.dispatchEvent(new Event('buddysync:tour-finished'));
          } catch {}
          return;
        }
        const nextTarget = steps[nextIdx]?.target as string | undefined;
        const nextRoute = nextTarget ? targetRouteMap[nextTarget] : undefined;
        const needsNav = !!nextRoute && nextRoute !== pathname && nextTarget !== 'body' && nextTarget != null && !targetExistsOnPage(nextTarget);
        if (needsNav && nextRoute) {
          router.push(nextRoute);
          let attempts = 0;
          const poll = setInterval(() => {
            attempts++;
            const exists = nextTarget === 'body' || (() => { try { return !!document.querySelector(nextTarget as string); } catch { return false; } })();
            if (exists || attempts > 30) {
              clearInterval(poll);
              setStepIndex(nextIdx);
            }
          }, 150);
        } else {
          setStepIndex(nextIdx);
        }
      };

      const handleBack = () => {
        const prevIdx = Math.max(0, index - 1);
        const prevTarget = steps[prevIdx]?.target as string | undefined;
        const prevRoute = prevTarget ? targetRouteMap[prevTarget] : undefined;
        const needsNav = !!prevRoute && prevRoute !== pathname && prevTarget !== 'body' && prevTarget != null && !targetExistsOnPage(prevTarget);
        if (needsNav && prevRoute) {
          router.push(prevRoute);
          let attempts = 0;
          const poll = setInterval(() => {
            attempts++;
            const exists = prevTarget === 'body' || (() => { try { return !!document.querySelector(prevTarget as string); } catch { return false; } })();
            if (exists || attempts > 30) {
              clearInterval(poll);
              setStepIndex(prevIdx);
            }
          }, 150);
        } else {
          setStepIndex(prevIdx);
        }
      };

      const handleSkip = () => {
        setRun(false);
        setStepIndex(0);
        try {
          localStorage.setItem(TOUR_STORAGE_KEY, 'true');
          window.dispatchEvent(new Event('buddysync:tour-finished'));
        } catch {}
      };

      return (
        <div
          {...tooltipProps}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-[calc(100vw-32px)] sm:max-w-[420px] p-4 sm:p-5"
          style={{ maxWidth: isMobile ? 'calc(100vw - 32px)' : 420, ...tooltipProps.style }}
        >
          {title && <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">{title}</h3>}
          <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mb-4">{content}</div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={handleSkip}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                Skip tour
              </button>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px] font-bold text-slate-400">
                {index + 1} / {size}
              </span>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-emerald-500/20 buddysync-gradient-bg hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
              >
                {isLastStep ? 'Finish 🎉' : 'Next →'}
              </button>
            </div>
          </div>
          <button
            onClick={handleSkip}
            aria-label="Close"
            className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="text-sm">×</span>
          </button>
        </div>
      );
    },
    [isMobile, pathname, router, steps, targetExistsOnPage]
  );

  const joyrideStyles = useMemo(
    () => ({
      options: {
        zIndex: 10000,
        primaryColor: '#10b981',
        textColor: '#0f172a',
        backgroundColor: '#ffffff',
        overlayColor: 'rgba(15, 23, 42, 0.6)',
        arrowColor: '#ffffff',
        width: isMobile ? 340 : 420,
      },
      spotlight: {
        borderRadius: 16,
      },
      beacon: {
        display: 'none',
      },
    }),
    [isMobile]
  );

  const JoyrideAny = Joyride as any;
  return (
    <JoyrideAny
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      scrollToFirstStep={false}
      scrollOffset={80}
      disableOverlayClose={false}
      disableScrolling={false}
      spotlightClicks={false}
      callback={handleCallback}
      tooltipComponent={CustomTooltip}
      styles={joyrideStyles as any}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  );
};

export function startTour(step = 0) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('buddysync:start-tour', { detail: { step } }));
}
