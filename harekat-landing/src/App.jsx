import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from "./pages/Landing.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import Products from "./pages/Products.jsx";
import TeacherDetail from "./pages/TeacherDetail.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import CapsulesPage from "./pages/CapsulesPage.jsx";
import PackagesPage from "./pages/PackagesPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import { getDashboardUrl } from "./utils/dashboardUrl.js";

function ExternalDashboardRedirect() {
    useEffect(() => {
        window.location.href = getDashboardUrl('/overview');
    }, []);
    return null;
}

function ExternalLoginRedirect() {
    useEffect(() => {
        window.location.href = getDashboardUrl('/login?redirect=' + encodeURIComponent(window.location.origin));
    }, []);
    return null;
}

export default function App() {
    return (
        <Routes>
            <Route path='/' element={<Landing/>}/>
            <Route path='/cart' element={<CartPage/>}/>
            <Route path='/contact-us' element={<ContactUs/>}/>
            <Route path='/about-us' element={<AboutUs/>}/>
            <Route path='/auth' element={<ExternalLoginRedirect/>}/>
            <Route path='/login' element={<ExternalLoginRedirect/>}/>
            <Route path='/dashboard' element={<ExternalDashboardRedirect/>}/>


            {/* Dedicated separated routes for courses, capsules, and packages */}
            <Route path='/courses' element={<CoursesPage/>}/>
            <Route path='/courses/:id' element={<ProductDetail type="course"/>}/>
            <Route path='/capsules' element={<CapsulesPage/>}/>
            <Route path='/capsules/:id' element={<ProductDetail type="capsule"/>}/>
            <Route path='/packages' element={<PackagesPage/>}/>
            <Route path='/packages/:id' element={<ProductDetail type="package"/>}/>

            {/* Products and legacy/fallback routes */}
            <Route path='/products' element={<Products/>}/>
            <Route path='/products/:id' element={<ProductDetail/>}/>

            <Route path='/teachers/:id' element={<TeacherDetail/>}/>
        </Routes>
    );
}
