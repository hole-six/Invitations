import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import ToastContainer from './components/Toast.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import BottomNavigation from './components/BottomNavigation.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import TokenHandler from './components/TokenHandler.jsx'

import HomePage from './pages/HomePage.jsx'
import CollectionPage from './pages/CollectionPage.jsx'
import EditorPage from './pages/EditorPage.jsx'
import HtmlEditorPage from './pages/HtmlEditorPage.jsx'
import AdvancedHtmlEditorPage from './pages/AdvancedHtmlEditorPage.jsx'
import UltimateHtmlEditorPage from './pages/UltimateHtmlEditorPage.jsx'
import ManagementPage from './pages/ManagementPage.jsx'
import AdminTemplatePage from './pages/AdminTemplatePage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import InvitationViewPage from './pages/InvitationViewPage.jsx'
import TemplateTestPage from './pages/TemplateTestPage.jsx'
import TemplateExportPage from './pages/TemplateExportPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DashboardInvitationsPage from './pages/DashboardInvitationsPage.jsx'
import DashboardTemplatesPage from './pages/DashboardTemplatesPage.jsx'
import DashboardTemplateEditorPage from './pages/DashboardTemplateEditorPage.jsx'
import DashboardUsersPage from './pages/DashboardUsersPage.jsx'
import DashboardAnalyticsPage from './pages/DashboardAnalyticsPage.jsx'
import DashboardSettingsPage from './pages/DashboardSettingsPage.jsx'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <TokenHandler />
          <ToastContainer />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/template-test" element={<TemplateTestPage />} />
            <Route path="/template-export" element={<TemplateExportPage />} />
            {/* Public Invitation View */}
            <Route path="/invitation/:slug" element={<InvitationViewPage />} />

            {/* Protected Routes */}
            <Route
              path="/editor"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/html-editor"
              element={
                <ProtectedRoute>
                  <HtmlEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/advanced-html-editor"
              element={
                <ProtectedRoute>
                  <AdvancedHtmlEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ultimate-html-editor"
              element={
                <ProtectedRoute>
                  <UltimateHtmlEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/:id"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/management"
              element={
                <ProtectedRoute>
                  <ManagementPage />
                </ProtectedRoute>
              }
            />
            {/* Admin Template Management - Requires admin permissions */}
            <Route
              path="/admin/templates"
              element={
                <AdminRoute>
                  <AdminTemplatePage />
                </AdminRoute>
              }
            />

            {/* Dashboard Routes - Requires admin permissions */}
            <Route
              path="/dashboard"
              element={
                <AdminRoute>
                  <DashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/invitations"
              element={
                <AdminRoute>
                  <DashboardInvitationsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/invitations/drafts"
              element={
                <AdminRoute>
                  <DashboardInvitationsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/invitations/published"
              element={
                <AdminRoute>
                  <DashboardInvitationsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/invitations/archived"
              element={
                <AdminRoute>
                  <DashboardInvitationsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/templates"
              element={
                <AdminRoute>
                  <DashboardTemplatesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/templates/create"
              element={
                <AdminRoute>
                  <DashboardTemplateEditorPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/templates/edit/:id"
              element={
                <AdminRoute>
                  <DashboardTemplateEditorPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/templates/categories"
              element={
                <AdminRoute>
                  <DashboardTemplatesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/users"
              element={
                <AdminRoute>
                  <DashboardUsersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/users/active"
              element={
                <AdminRoute>
                  <DashboardUsersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/users/roles"
              element={
                <AdminRoute>
                  <DashboardUsersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <AdminRoute>
                  <DashboardAnalyticsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/analytics/usage"
              element={
                <AdminRoute>
                  <DashboardAnalyticsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/analytics/revenue"
              element={
                <AdminRoute>
                  <DashboardAnalyticsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <AdminRoute>
                  <DashboardSettingsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/settings/email"
              element={
                <AdminRoute>
                  <DashboardSettingsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/settings/backup"
              element={
                <AdminRoute>
                  <DashboardSettingsPage />
                </AdminRoute>
              }
            />
          </Routes>
          <BottomNavigation />
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
