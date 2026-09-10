import { RouterProvider } from 'react-router-dom';
import router from './router';
import { AuthProvider } from './features/auth/store/AuthStore';
import { UIFeedbackProvider } from './components/common/UIFeedback';
import SessionWarningModal from './components/SessionWarningModal';

function App() {
  return (
    <AuthProvider>
      <UIFeedbackProvider>
        <SessionWarningModal />
        <RouterProvider router={router} />
      </UIFeedbackProvider>
    </AuthProvider>
  );
}

export default App;

