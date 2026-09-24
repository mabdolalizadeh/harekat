import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from './components/ui/CustomCursor.jsx';

function ScrollToTop() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        const scrollUp = () => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            if (window.__lenis) {
                window.__lenis.scrollTo(0, { immediate: true });
            }
        };

        // Scroll immediately
        scrollUp();
        // Retry after Lenis may have (re)initialized
        const t1 = setTimeout(scrollUp, 50);
        const t2 = setTimeout(() => {
            scrollUp();
            ScrollTrigger.refresh();
        }, 150);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [pathname, search]);

    return null;
}
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
import CartDrawer from "./components/cart/CartDrawer.jsx";
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
        <>
            <CustomCursor />
            <ScrollToTop />
            <CartDrawer />
            <Routes>
                <Route path='/' element={<Landing/>}/>
                <Route path='/cart' element={<CartPage/>}/>
                <Route path='/contact-us' element={<ContactUs/>}/>
                <Route path='/about-us' element={<AboutUs/>}/>
                <Route path='/auth' element={<ExternalLoginRedirect/>}/>
                <Route path='/login' element={<ExternalLoginRedirect/>}/>
                <Route path='/dashboard' element={<ExternalDashboardRedirect/>}/>

                {/* Dedicated separated routes for courses, capsules, and packages */}
                <Route path='/courses/:id' element={<ProductDetail type="course"/>}/>
                <Route path='/capsules/:id' element={<ProductDetail type="capsule"/>}/>
                <Route path='/packages/:id' element={<ProductDetail type="package"/>}/>

                {/* Products and legacy/fallback routes */}
                <Route path='/products/:id' element={<ProductDetail/>}/>

                <Route path='/teachers/:id' element={<TeacherDetail/>}/>
            </Routes>
        </>
    );
}
