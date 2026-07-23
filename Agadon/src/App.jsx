import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Menu from './pages/Menu';
import Start from './pages/Start';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import MyTransportation from './pages/MyTransportation';
import MyPage from './pages/MyPage';
import { Layout } from './components/layouts/Layout';
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from './components/routes/AuthRoutes';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-200 flex justify-center">
        {/* 아이폰 13 기준 너비: 390px */}
        <div className="relative bg-bg w-full max-w-[390px] min-h-screen  shadow-2xl flex flex-col overflow-x-hidden pt-0">
          <Routes>
            {/*Navbar가 보이는 모바일 레이아웃 페이지*/}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/Menu" element={<Menu />} />
                <Route
                  path="/MyTransportation"
                  element={<MyTransportation />}
                />
                <Route path="/Mypage" element={<MyPage />} />
              </Route>
            </Route>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/" element={<Start />} />
              <Route path="/Login" element={<Login />} />
              <Route path="/SignUp" element={<Signup />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
