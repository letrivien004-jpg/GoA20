import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installRuntimeDiagnostics } from './utils/runtimeDiagnostics';

installRuntimeDiagnostics();

createRoot(document.getElementById('root')!).render(<App />);
