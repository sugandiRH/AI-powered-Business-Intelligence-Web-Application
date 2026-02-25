import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'

import Homepage from './pages/homePage/homePage.jsx';
import Loginpage from './pages/loginPage/login.jsx';
import RegisterPage from './pages/loginPage/register.jsx';
import Dashboard from './pages/dashboardPage/dashboard.jsx';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/login' element={<Loginpage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
