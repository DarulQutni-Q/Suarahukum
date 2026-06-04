import { Screen, AppState, AppAction } from './types';

export const initialState: AppState = {
  screen: 'home',
  imageFiles: [],
  imagePreviews: [],
  analyzingMessage: '',
  result: null,
  history: [],
  error: null,
  profile: null,
  onboardingRedirect: null,
};

export function initApp(initial: AppState): AppState {
  try {
    const stored = localStorage.getItem('suarahukum_v1');
    const history = stored ? JSON.parse(stored) : [];
    return { ...initial, history };
  } catch (e) {
    return initial;
  }
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen, error: null };
    case 'SET_IMAGES':
      return { ...state, imageFiles: action.files, imagePreviews: action.previews, error: null };
    case 'START_ANALYZING':
      return { ...state, screen: 'analyzing', error: null };
    case 'SET_ANALYZING_MESSAGE':
      return { ...state, analyzingMessage: action.message };
    case 'SET_RESULT':
      return { ...state, result: action.result, screen: 'result', error: null };
    case 'SET_ERROR':
      return { ...state, error: action.message, screen: 'error' };
    case 'ADD_FOLLOW_UP':
      if (!state.result) return state;
      return {
        ...state,
        result: {
          ...state.result,
          followUpQA: [...(state.result.followUpQA || []), action.qa]
        }
      };
    case 'SAVE_TO_HISTORY': {
      const newHistory = [action.entry, ...state.history];
      try {
        localStorage.setItem('suarahukum_v1', JSON.stringify(newHistory));
      } catch(e) {}
      return { ...state, history: newHistory };
    }
    case 'DELETE_HISTORY': {
      const newHistory = state.history.filter(h => h.id !== action.id);
      try {
        localStorage.setItem('suarahukum_v1', JSON.stringify(newHistory));
      } catch(e) {}
      return { ...state, history: newHistory };
    }
    case 'CLEAR_HISTORY': {
      try {
        localStorage.setItem('suarahukum_v1', JSON.stringify([]));
      } catch(e) {}
      return { ...state, history: [] };
    }
    case 'SET_PROFILE':
      return { ...state, profile: action.profile };
    case 'SET_ONBOARDING_REDIRECT':
      return { ...state, onboardingRedirect: action.target };
    case 'RESET':
      return { ...state, screen: 'scanner', imageFiles: [], imagePreviews: [], result: null, error: null };
    default:
      return state;
  }
}
