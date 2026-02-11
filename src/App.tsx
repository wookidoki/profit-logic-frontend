import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import ProjectCreate from './pages/ProjectCreate';
import ProjectDetail from './pages/ProjectDetail';
import CommunityList from './pages/CommunityList';
import PostCreate from './pages/PostCreate';
import PostDetail from './pages/PostDetail';

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        {/* 비인증 (Layout 없음) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Layout 적용 */}
        <Route
          path="/"
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
          path="/analyze"
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }
        />

        {/* 커뮤니티 (비인증 읽기 가능) */}
        <Route path="/community" element={<Layout><CommunityList /></Layout>} />
        <Route
          path="/community/new"
          element={
            <ProtectedRoute>
              <Layout><PostCreate /></Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/community/:id" element={<Layout><PostDetail /></Layout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
