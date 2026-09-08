import { useReducer, useEffect, useState, useRef, lazy, Suspense } from 'react';
import { Screen } from './types';
import { appReducer, initialState, initApp } from './reducer';
import { saveToHistory } from './utils/storage';
import HomeScreen from './screens/HomeScreen';

// Code-split heavy and secondary screens so landing page bundle remains lightweight
const ScannerScreen = lazy(() => import('./screens/ScannerScreen'));
const AnalyzingScreen = lazy(() => import('./screens/AnalyzingScreen'));
const ResultScreen = lazy(() => import('./screens/ResultScreen'));
const ErrorScreen = lazy(() => import('./screens/ErrorScreen'));
const HistoryScreen = lazy(() => import('./screens/HistoryScreen'));
const PricingScreen = lazy(() => import('./screens/PricingScreen'));
const OnboardingScreen = lazy(() => import('./screens/OnboardingScreen'));

function ScreenLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--navy-deep)] text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/20 border-t-[var(--gold)] rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-white/60">Memuat...</span>
      </div>
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState, initApp);
  const [backgroundScreen, setBackgroundScreen] = useState<Screen>('home');
  const isInitialMount = useRef(true);

  // Sync state.history to localStorage using pure effect
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveToHistory(state.history);
  }, [state.history]);

  useEffect(() => {
    if (state.screen !== 'history') {
      setBackgroundScreen(state.screen);
    }
  }, [state.screen]);

  const renderScreen = (screenType: Screen) => {
    switch (screenType) {
      case 'home':
        return <HomeScreen dispatch={dispatch} />;
      case 'scanner':
        return (
          <Suspense fallback={<ScreenLoader />}>
            <ScannerScreen state={state} dispatch={dispatch} />
          </Suspense>
        );
      case 'analyzing':
        return (
          <Suspense fallback={<ScreenLoader />}>
            <AnalyzingScreen state={state} dispatch={dispatch} />
          </Suspense>
        );
      case 'result':
        return (
          <Suspense fallback={<ScreenLoader />}>
            <ResultScreen state={state} dispatch={dispatch} />
          </Suspense>
        );
      case 'error':
        return (
          <Suspense fallback={<ScreenLoader />}>
            <ErrorScreen state={state} dispatch={dispatch} />
          </Suspense>
        );
      case 'onboarding':
        return (
          <Suspense fallback={<ScreenLoader />}>
            <OnboardingScreen state={state} dispatch={dispatch} />
          </Suspense>
        );
      case 'pricing':
        return (
          <Suspense fallback={<ScreenLoader />}>
            <PricingScreen state={state} dispatch={dispatch} />
          </Suspense>
        );
      default:
        return <HomeScreen dispatch={dispatch} />;
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-x-clip">
      {/* Background active screen */}
      {renderScreen(state.screen === 'history' ? backgroundScreen : state.screen)}

      {/* History Sheet overlay */}
      <Suspense fallback={null}>
        <HistoryScreen state={state} dispatch={dispatch} backgroundScreen={backgroundScreen} />
      </Suspense>
    </div>
  );
}
