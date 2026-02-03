import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNavigation from './components/BottomNavigation'

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
            <Route
              path="/admin/templates"
              element={
                <ProtectedRoute>
                  <AdminTemplatePage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/invitations"
              element={
                <ProtectedRoute>
                  <DashboardInvitationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/invitations/drafts"
              element={
                <ProtectedRoute>
                  <DashboardInvitationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/invitations/published"
              element={
                <ProtectedRoute>
                  <DashboardInvitationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/invitations/archived"
              element={
                <ProtectedRoute>
                  <DashboardInvitationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/templates"
              element={
                <ProtectedRoute>
                  <DashboardTemplatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/templates/create"
              element={
                <ProtectedRoute>
                  <DashboardTemplateEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/templates/edit/:id"
              element={
                <ProtectedRoute>
                  <DashboardTemplateEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/templates/categories"
              element={
                <ProtectedRoute>
                  <DashboardTemplatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/users"
              element={
                <ProtectedRoute>
                  <DashboardUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/users/active"
              element={
                <ProtectedRoute>
                  <DashboardUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/users/roles"
              element={
                <ProtectedRoute>
                  <DashboardUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute>
                  <DashboardAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics/usage"
              element={
                <ProtectedRoute>
                  <DashboardAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics/revenue"
              element={
                <ProtectedRoute>
                  <DashboardAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <DashboardSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings/email"
              element={
                <ProtectedRoute>
                  <DashboardSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings/backup"
              element={
                <ProtectedRoute>
                  <DashboardSettingsPage />
                </ProtectedRoute>
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
