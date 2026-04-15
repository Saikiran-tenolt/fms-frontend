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
        <Toaster 
          position="bottom-right" 
          expand={true} 
          visibleToasts={4}
          offset="32px"
          toastOptions={{
            duration: 5000,
            classNames: {
              toast: 'group flex items-start w-full bg-[#111110] border border-[#2B2B28] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] rounded-[14px] px-4 py-3 gap-3 text-white transition-all duration-300',
              title: 'text-[13px] font-medium text-[#EDEDEC] tracking-wide leading-none pt-0.5',
              description: 'text-[12px] font-normal text-[#A09F9C] mt-1.5 leading-snug',
              icon: 'mt-0.5 [&>svg]:w-4 [&>svg]:h-4 stroke-[2.5]',
              actionButton: 'bg-[#EDEDEC] text-[#111110] rounded-lg px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity',
              cancelButton: 'bg-[#2B2B28] text-[#A09F9C] rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[#3E3E3B] transition-colors',
              success: '[&_[data-icon]]:text-[#10B981]',
              error: '[&_[data-icon]]:text-[#F43F5E]',
              warning: '[&_[data-icon]]:text-[#F59E0B]',
              info: '[&_[data-icon]]:text-[#3B82F6]',
            }
          }}
        />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
