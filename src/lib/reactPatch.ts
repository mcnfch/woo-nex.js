'use client';

/**
 * React 19 Compatibility Patch
 * 
 * This module provides patches for libraries that depend on older React versions.
 * It intercepts and patches problematic React internal APIs that may have changed in React 19.
 */

// Apply patches as soon as the module is imported
export function applyReactPatches() {
  if (typeof window === 'undefined') return;

  console.log('Applying React 19 compatibility patches...');

  // Patch 1: React DevTools hook
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    const originalInject = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject;
    
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = (renderer: any) => {
      try {
        return originalInject.call(window.__REACT_DEVTOOLS_GLOBAL_HOOK__, renderer);
      } catch (error) {
        console.warn('React DevTools injection error prevented', error);
        return null;
      }
    };
  }

  // Patch 2: ReactCurrentDispatcher
  const ReactModule = window.React || (window as any).React;
  if (typeof ReactModule !== 'undefined' && ReactModule.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    // Create a fallback for ReactCurrentDispatcher if it doesn't exist
    const internals = ReactModule.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    
    if (!internals.ReactCurrentDispatcher) {
      internals.ReactCurrentDispatcher = {
        current: {
          readContext: () => undefined,
          useContext: () => undefined,
          useState: () => [undefined, () => {}],
          useReducer: () => [undefined, () => {}],
          useRef: () => ({ current: undefined }),
          useEffect: () => {},
          useLayoutEffect: () => {},
          useCallback: (cb: any) => cb,
          useMemo: (cb: any) => cb(),
          useImperativeHandle: () => {},
          useDebugValue: () => {},
          useDeferredValue: (value: any) => value,
          useTransition: () => [false, () => {}],
          useMutableSource: () => undefined,
          useOpaqueIdentifier: () => undefined,
          unstable_isNewReconciler: false
        }
      };
    }
  }

  // Patch 3: ReactDOM render method (used by older versions of React-Redux)
  const ReactDOMModule = window.ReactDOM || (window as any).ReactDOM;
  if (typeof ReactDOMModule !== 'undefined') {
    const originalRender = ReactDOMModule.render;
    
    if (originalRender && !ReactDOMModule._patched) {
      ReactDOMModule.render = function(element: any, container: any, callback?: any) {
        try {
          // Try to use the original render if possible
          return originalRender.call(this, element, container, callback);
        } catch (error) {
          console.warn('ReactDOM.render error prevented, falling back to root.render', error);
          
          // Fallback to createRoot if available (React 18+ style)
          if (ReactDOMModule.createRoot) {
            const root = ReactDOMModule.createRoot(container);
            root.render(element);
            if (callback) {
              setTimeout(callback, 0);
            }
            return null;
          }
          
          console.error('Failed to render component - no viable render method');
          return null;
        }
      };
      
      // Mark as patched to avoid double patching
      ReactDOMModule._patched = true;
    }
  }

  console.log('React 19 compatibility patches applied');
}

// Declare global interface for TypeScript
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      renderers: Map<any, any>;
      inject: (renderer: any) => any;
    }
    React?: any;
    ReactDOM?: any;
  }
}

// Apply patches immediately
applyReactPatches();

export default applyReactPatches;
