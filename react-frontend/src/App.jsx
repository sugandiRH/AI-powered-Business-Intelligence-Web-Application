import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'

import Homepage from './pages/homePage/homePage.jsx';
import Loginpage from './pages/loginPage/login.jsx';
import RegisterPage from './pages/loginPage/register.jsx';
import Dashboard from './pages/dashboardPage/dashboard.jsx';
import Testpage from './pages/dashboardPage/testpage.jsx';
import UplaodPage from './pages/dashboardPage/uploadpage1.jsx';
import ReviewPage from './pages/reviewPage/reviewpage.jsx';
import ReviewPage1 from './pages/reviewPage/reviewPage1.jsx';

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
        <Route path="/review/:datasetId" element={<ReviewPage />} />
        <Route path="/review1/:datasetId" element={<ReviewPage1 />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
