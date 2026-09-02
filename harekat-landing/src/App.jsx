import {Routes, Route} from 'react-router-dom'
import Landing from "./pages/Landing.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import Auth from "./pages/Auth.jsx";

export default function App() {
    return (
        <Routes>
            <Route path='/' element={<Landing/>}/>
            <Route path='/contact-us' element={<ContactUs/>}/>
            <Route path='/about-us' element={<AboutUs/>}/>
            <Route path='/auth' element={<Auth/>}/>
        </Routes>
    )
}
