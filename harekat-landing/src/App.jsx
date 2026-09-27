import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

// Critical Landing Page
import Landing from "./pages/Landing.jsx";

// Route-based code-split pages
const ContactUs = lazy(() => import("./pages/ContactUs.jsx"));
const AboutUs = lazy(() => import("./pages/AboutUs.jsx"));
const TeacherDetail = lazy(() => import("./pages/TeacherDetail.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const CoursesPage = lazy(() => import("./pages/CoursesPage.jsx"));
const CapsulesPage = lazy(() => import("./pages/CapsulesPage.jsx"));
const PackagesPage = lazy(() => import("./pages/PackagesPage.jsx"));
const BlogPage = lazy(() => import("./pages/BlogPage.jsx"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage.jsx"));
const CartPage = lazy(() => import("./pages/CartPage.jsx"));
import CartDrawer from "./components/cart/CartDrawer.jsx";
import CustomCursor from "./components/ui/CustomCursor.jsx";
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
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <Routes>
                    <Route path='/' element={<Landing/>}/>
                    <Route path='/cart' element={<CartPage/>}/>
                    <Route path='/contact-us' element={<ContactUs/>}/>
                    <Route path='/about-us' element={<AboutUs/>}/>
                    <Route path='/auth' element={<ExternalLoginRedirect/>}/>
                    <Route path='/login' element={<ExternalLoginRedirect/>}/>
                    <Route path='/dashboard' element={<ExternalDashboardRedirect/>}/>

                    {/* Blog / Articles System */}
                    <Route path='/blog' element={<BlogPage/>}/>
                    <Route path='/blog/:slug' element={<BlogDetailPage/>}/>

                    {/* Catalog listings */}
                    <Route path='/courses' element={<CoursesPage/>}/>
                    <Route path='/packages' element={<PackagesPage/>}/>
                    <Route path='/capsules' element={<CapsulesPage/>}/>

                    {/* Dedicated separated routes for courses, capsules, and packages */}
                    <Route path='/courses/:id' element={<ProductDetail type="course"/>}/>
                    <Route path='/capsules/:id' element={<ProductDetail type="capsule"/>}/>
                    <Route path='/packages/:id' element={<ProductDetail type="package"/>}/>

                    {/* Products and legacy/fallback routes */}
                    <Route path='/products/:id' element={<ProductDetail/>}/>

                    <Route path='/teachers/:id' element={<TeacherDetail/>}/>
                </Routes>
            </Suspense>
        </>
    );
}
