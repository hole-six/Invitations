import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasAdminAccess } from '../utils/permissions';

/**
 * AdminRoute - Protects admin pages
 * Requires user to be authenticated AND have admin permissions
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin access
  if (!hasAdminAccess()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
