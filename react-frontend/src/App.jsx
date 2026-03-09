import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'

import Homepage from './pages/homePage/homePage.jsx';
import Loginpage from './pages/loginPage/login.jsx';
import RegisterPage from './pages/loginPage/register.jsx';
import Dashboard from './pages/dashboardPage/dashboard.jsx';
import Testpage from './pages/dashboardPage/testpage.jsx';
import UplaodPage from './pages/dashboardPage/uploadpage.jsx';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/login' element={<Loginpage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/testpage' element={<Testpage />} />
        <Route path="/upload" element={<UplaodPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
