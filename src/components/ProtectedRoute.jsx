import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

// ProtectedRoute component
const ProtectedRoute = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  console.log("🔐 ProtectedRoute - user:", user, "| loading:", loading);
  if (loading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        aria-label={t('protected.loadingAria')}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-harmony-accent"
          role="status"
          aria-label={t('protected.loadingAria')}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
