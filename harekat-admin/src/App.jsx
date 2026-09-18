import { Routes, Route } from 'react-router-dom';
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
import AdminStudents from "./pages/admin/AdminStudents.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminPayments from "./pages/admin/AdminPayments.jsx";
import AdminTickets from "./pages/admin/AdminTickets.jsx";
import AdminExams from "./pages/admin/AdminExams.jsx";
import AdminLicenses from "./pages/admin/AdminLicenses.jsx";
import AdminTAs from "./pages/admin/AdminTAs.jsx";

export default function App({ mode, onToggleTheme }) {
    return (
        <Routes>
            <Route path='/login' element={<AdminLogin />} />
            <Route path='/' element={<AdminLayout mode={mode} onToggleTheme={onToggleTheme} />}>
                <Route index element={<AdminDashboard />} />
                <Route path='students' element={<AdminStudents />} />
                <Route path='courses' element={<AdminProducts defaultTab="products" />} />
                <Route path='capsules' element={<AdminProducts defaultTab="capsule" />} />
                <Route path='packages' element={<AdminProducts defaultTab="skill" />} />
                <Route path='categories' element={<AdminProducts defaultTab="categories" />} />
                <Route path='products' element={<AdminProducts />} />
                <Route path='subscriptions' element={<AdminSubscriptions />} />
                <Route path='orders' element={<AdminOrders />} />
                <Route path='payments' element={<AdminPayments />} />
                <Route path='tickets' element={<AdminTickets />} />
                <Route path='exams' element={<AdminExams />} />
                <Route path='licenses' element={<AdminLicenses />} />
                <Route path='tas' element={<AdminTAs />} />
                <Route path='teachers' element={<AdminTeachers />} />
                <Route path='coupons' element={<AdminCoupons />} />
                <Route path='marquee' element={<AdminMarquee />} />
                <Route path='banners' element={<AdminBanners />} />
                <Route path='header' element={<AdminHeader />} />
                <Route path='content' element={<AdminContent />} />
                <Route path='settings' element={<AdminSettings />} />
            </Route>
        </Routes>
    );
}
