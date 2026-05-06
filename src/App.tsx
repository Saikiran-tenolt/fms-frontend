import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AppRoutes } from './routes/AppRoutes';
import { useAppDispatch, useAppSelector } from './hooks';

import { setNotifications } from './features/notifications/notificationsSlice';
import { mockNotifications } from './services/mockData';

import { ToastProvider } from './components/toast';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      // Load initial data in simulation mode
      dispatch(setNotifications(mockNotifications));
    }
  }, [isAuthenticated, dispatch]);

  return <AppRoutes />;
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
