import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth';
import AppRoutes from './components/app/AppRoutes';
import { AppShell } from './components/app/AppShell';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
