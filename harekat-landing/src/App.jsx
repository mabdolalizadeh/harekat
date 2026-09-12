import {Routes, Route} from 'react-router-dom'
import Landing from "./pages/Landing.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import TeacherDetail from "./pages/TeacherDetail.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import { AuthGuard } from "./components/AuthGuard.jsx";

export default function App() {
    return (
        <Routes>
            <Route path='/' element={<Landing/>}/>
            <Route path='/contact-us' element={<ContactUs/>}/>
            <Route path='/about-us' element={<AboutUs/>}/>
            <Route path='/auth' element={<Auth/>}/>
            <Route path='/dashboard' element={<AuthGuard><Dashboard/></AuthGuard>}/>
            <Route path='/products' element={<Products/>}/>
            <Route path='/products/:id' element={<ProductDetail/>}/>
            <Route path='/teachers/:id' element={<TeacherDetail/>}/>
        </Routes>
    )
}
