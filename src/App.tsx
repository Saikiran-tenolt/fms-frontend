import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from './store/store';
import { AppRoutes } from './routes/AppRoutes';
import { useAppDispatch, useAppSelector } from './hooks';
import { setPlots } from './features/plots/plotsSlice';
import { setNotifications } from './features/notifications/notificationsSlice';
import { mockPlots, mockNotifications } from './services/mockData';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  useEffect(() => {
    if (isAuthenticated) {
      // Load initial data in simulation mode
      dispatch(setPlots(mockPlots));
      dispatch(setNotifications(mockNotifications));
    }
  }, [isAuthenticated, dispatch]);
  
  return <AppRoutes />;
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
        <Toaster position="bottom-right" richColors expand={true} visibleToasts={6} />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
