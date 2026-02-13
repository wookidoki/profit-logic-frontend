import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ScriptAnalysis from './pages/ScriptAnalysis';
import ConsultPage from './pages/ConsultPage';
import ProjectList from './pages/ProjectList';
import ProjectCreate from './pages/ProjectCreate';
import ProjectDetail from './pages/ProjectDetail';
import ProjectEdit from './pages/ProjectEdit';
import ChatPage from './pages/ChatPage';
import BoardListPage from './pages/BoardListPage';
import BoardWritePage from './pages/BoardWritePage';
import BoardDetailPage from './pages/BoardDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminPage from './pages/AdminPage';
import MyPage from './pages/MyPage';
import { useAuthStore } from './store/authStore';

function HomePage() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Landing />;
  return <Layout><Dashboard /></Layout>;
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Landing (guest) or Dashboard (authenticated) */}
        <Route path="/" element={<HomePage />} />
        <Route
          path="/consult"
          element={<Layout><ConsultPage /></Layout>}
        />
        <Route
          path="/scripts"
          element={<Layout><ScriptAnalysis /></Layout>}
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Layout><ProjectList /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute>
              <Layout><ProjectCreate /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <Layout><ProjectDetail /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id/edit"
          element={
            <ProtectedRoute>
              <Layout><ProjectEdit /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout><ChatPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/board"
          element={<Layout><BoardListPage /></Layout>}
        />
        <Route
          path="/board/write"
          element={
            <ProtectedRoute>
              <Layout><BoardWritePage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/board/:id"
          element={<Layout><BoardDetailPage /></Layout>}
        />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <Layout><MyPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout><AdminPage /></Layout>
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
