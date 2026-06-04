/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useReducer, useEffect, useState } from 'react';
import { AppState, AppAction, Screen } from './types';
import { appReducer, initialState, initApp } from './reducer';
import HomeScreen from './screens/HomeScreen';
import ScannerScreen from './screens/ScannerScreen';
import AnalyzingScreen from './screens/AnalyzingScreen';
import ResultScreen from './screens/ResultScreen';
import ErrorScreen from './screens/ErrorScreen';
import HistoryScreen from './screens/HistoryScreen';
import PricingScreen from './screens/PricingScreen';
import OnboardingScreen from './screens/OnboardingScreen';

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState, initApp);
  
  // Track previous screen so we can render it behind the History Sheet
  const [backgroundScreen, setBackgroundScreen] = useState<Screen>('home');
  
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
        return <ScannerScreen state={state} dispatch={dispatch} />;
      case 'analyzing':
        return <AnalyzingScreen state={state} dispatch={dispatch} />;
      case 'result':
        return <ResultScreen state={state} dispatch={dispatch} />;
      case 'error':
        return <ErrorScreen state={state} dispatch={dispatch} />;
      case 'onboarding':
        return <OnboardingScreen state={state} dispatch={dispatch} />;
      case 'pricing':
        return <PricingScreen state={state} dispatch={dispatch} />;
      default:
        return <HomeScreen dispatch={dispatch} />;
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-x-clip">
      {/* Background active screen */}
      {renderScreen(state.screen === 'history' ? backgroundScreen : state.screen)}
      
      {/* History Sheet overlay */}
      <HistoryScreen state={state} dispatch={dispatch} backgroundScreen={backgroundScreen} />
    </div>
  );
}
