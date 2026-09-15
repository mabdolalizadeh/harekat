import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import TopBarLayout from '../layouts/TopBarLayout.jsx';
import Box from '../components/ui/Box.jsx';
import { H1, H2, P } from '../components/ui/Headings.jsx';
import { PrimaryButton } from '../components/ui/Buttons.jsx';
import { customerApi, storeApi } from '../services/api.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function price(value) {
    const number = Number(String(value ?? '').replace(/[,٬\s]/g, ''));
    return `${Number.isFinite(number) ? number.toLocaleString('fa-IR') : value} تومان`;
}

function videoSource(value) {
    if (!value) return null;
    try {
        const url = new URL(value, window.location.origin);
        if (/youtube\.com|youtu\.be/.test(url.hostname)) {
            const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').pop();
            return id ? { type: 'embed', src: `https://www.youtube.com/embed/${id}` } : null;
        }
        if (/aparat\.com/.test(url.hostname)) {
            const id = url.pathname.split('/').filter(Boolean).pop();
            return id ? { type: 'embed', src: `https://www.aparat.com/video/video/embed/videohash/${id}/vt/frame` } : null;
        }
        return { type: 'file', src: url.href };
    } catch { return null; }
}

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [course, setCourse] = useState(null);
    const [error, setError] = useState(null);
    const [added, setAdded] = useState(false);
    useEffect(() => { storeApi.getCourse(id).then((response) => setCourse(response.data)).catch((e) => setError(e.message)); }, [id]);
    if (error) return <MainLayout><TopBarLayout /><Box className="min-h-[50vh] gap-4 pt-32 text-center"><H1>محصول پیدا نشد</H1><PrimaryButton onClick={() => navigate('/')}>بازگشت</PrimaryButton></Box></MainLayout>;
    if (!course) return <MainLayout><TopBarLayout /><Box className="min-h-[50vh] pt-32"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></Box></MainLayout>;
    const discounted = course.salePrice && String(course.salePrice) !== String(course.price);
    const video = videoSource(course.videoUrl);
    const add = async () => {
        if (!localStorage.getItem('token')) {
            navigate('/auth', { state: { from: `${location.pathname}${location.search}${location.hash}` } });
            return;
        }
        await customerApi.addToCart(course.id, 'course', 1, discounted ? course.salePrice : course.price);
        setAdded(true);
    };
    return <MainLayout title={course.name} sectionIds={null} contentMap={null}><TopBarLayout /><Box className="w-full max-w-5xl gap-8 pb-20 pt-28 sm:pt-36">
        <button onClick={() => navigate(-1)} className="self-start text-sm text-muted">بازگشت</button>
        <div className="grid w-full gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <div className="overflow-hidden rounded-2xl border border-border bg-card"><img src={course.image} alt={course.name} className="aspect-square w-full object-cover" /></div>
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"><H1 className="text-2xl sm:text-3xl">{course.name}</H1><P className="text-muted">{course.description}</P><div className="mt-auto flex flex-col gap-2">{discounted && <span className="text-sm text-muted line-through">{price(course.price)}</span>}<span className="text-xl font-bold">{price(discounted ? course.salePrice : course.price)}</span><PrimaryButton onClick={add}>{added ? 'به سبد اضافه شد' : 'افزودن به سبد خرید'}</PrimaryButton></div></div>
        </div>
        {video && <div className="w-full overflow-hidden rounded-2xl border border-border bg-black">
            {video.type === 'embed' ? <div className="aspect-video"><iframe src={video.src} title={`ویدیوی ${course.name}`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : <video src={video.src} controls preload="metadata" className="aspect-video w-full" />}
        </div>}
        {course.longDescription && <div className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8"><H2 className="mb-4 text-xl">توضیحات دوره</H2><ReactMarkdown remarkPlugins={[remarkGfm]}>{course.longDescription}</ReactMarkdown></div>}
    </Box></MainLayout>;
}
