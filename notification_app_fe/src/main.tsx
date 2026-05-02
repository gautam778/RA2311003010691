import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { setLoggerCredentials } from 'logging-middleware'

setLoggerCredentials({
  clientID:     import.meta.env.VITE_CLIENT_ID || "",
  clientSecret: import.meta.env.VITE_CLIENT_SECRET || "",
  email:        import.meta.env.VITE_EMAIL || "",
  name:         import.meta.env.VITE_NAME || "",
  rollNo:       import.meta.env.VITE_ROLL_NO || "",
  accessCode:   import.meta.env.VITE_ACCESS_CODE || "",
});

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
document.head.appendChild(link);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
