export type RuntimeDiagnostic = {
  type: 'error' | 'unhandledrejection';
  message: string;
  source?: string;
  stack?: string;
  timestamp: string;
};

const MAX_DIAGNOSTICS = 50;
const diagnostics: RuntimeDiagnostic[] = [];
let installed = false;

function recordDiagnostic(entry: RuntimeDiagnostic) {
  diagnostics.push(entry);
  if (diagnostics.length > MAX_DIAGNOSTICS) {
    diagnostics.shift();
  }

  if (import.meta.env.DEV) {
    console.error('[runtime-diagnostics]', entry);
  }
}

export function getRuntimeDiagnostics(): RuntimeDiagnostic[] {
  return [...diagnostics];
}

export function installRuntimeDiagnostics() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (event) => {
    recordDiagnostic({
      type: 'error',
      message: event.message || 'Unknown runtime error',
      source: event.filename,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
    recordDiagnostic({
      type: 'unhandledrejection',
      message: reason,
      stack: event.reason instanceof Error ? event.reason.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  });

  if (import.meta.env.DEV) {
    (window as Window & { __scoreChartDiagnostics?: typeof getRuntimeDiagnostics }).__scoreChartDiagnostics =
      getRuntimeDiagnostics;
  }
}
