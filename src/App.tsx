import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ScriptAnalysis from './pages/ScriptAnalysis';
import ProjectList from './pages/ProjectList';
import ProjectCreate from './pages/ProjectCreate';
import ProjectDetail from './pages/ProjectDetail';
import ProjectEdit from './pages/ProjectEdit';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Layout-wrapped pages */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
