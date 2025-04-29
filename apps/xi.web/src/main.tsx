import ReactDOM from 'react-dom/client';
import './index.css';
import './config/i18n';
import { AppProviders } from './providers';

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<AppProviders />);
}
