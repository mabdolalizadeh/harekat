import {Routes, Route} from 'react-router-dom'
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminCoupons from "./pages/admin/AdminCoupons.jsx";
import AdminHeader from "./pages/admin/AdminHeader.jsx";
import AdminContent from "./pages/admin/AdminContent.jsx";
import AdminTeachers from "./pages/admin/AdminTeachers.jsx";
import AdminMarquee from "./pages/admin/AdminMarquee.jsx";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions.jsx";
import AdminBanners from "./pages/admin/AdminBanners.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

export default function App({ mode, onToggleTheme }) {
    return (
        <Routes>
            <Route path='/login' element={<AdminLogin/>}/>
            <Route path='/' element={<AdminLayout mode={mode} onToggleTheme={onToggleTheme} />}>
                <Route index element={<AdminDashboard/>}/>
                <Route path='products' element={<AdminProducts/>}/>
                <Route path='coupons' element={<AdminCoupons/>}/>
                <Route path='header' element={<AdminHeader/>}/>
                <Route path='content' element={<AdminContent/>}/>
                <Route path='teachers' element={<AdminTeachers/>}/>
                <Route path='marquee' element={<AdminMarquee/>}/>
                <Route path='subscriptions' element={<AdminSubscriptions/>}/>
                <Route path='banners' element={<AdminBanners/>}/>
                <Route path='settings' element={<AdminSettings/>}/>
            </Route>
        </Routes>
    )
}
