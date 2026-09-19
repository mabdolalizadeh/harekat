# گزارش فنی و تحلیلی: کارت پروفایل و گیمیفیکیشن دانش‌آموز

این گزارش در پاسخ به بررسی تصویر ارائه‌شده (`Screenshot 2026-09-19 at 3.56.52 AM.png`) و تشریح عملکرد، اجزا و معماری پیاده‌سازی آن در پنل داشبورد یادگیری آماده شده است.

---

## ۱. این بخش دقیقاً چیست؟ (ماهیت کامپوننت)

این کامپوننت، **کارت خلاصه وضعیت، هویت و پیشرفت گیمیفیکیشن دانش‌آموز** (`Student Profile & Gamification Progress Widget`) است که در بالاترین قسمت نوار کناری (Sidebar) پنل کاربری دانش‌آموز در پروژه `harekat-dashboard` قرار دارد.

### هدف و فلسفه طراحی:
در سیستم‌های آموزشی مدرن (LMS)، تعامل پایدار دانش‌آموز به انگیزش‌های دیداری و بازی‌وارسازی (Gamification) وابسته است. این بخش بر اساس طرح مرجع **Dribbble** طراحی شده و سه کارکرد کلیدی دارد:
1. **احراز هویت و نمایش پروفایل فردی**: نشان دادن هویت کاربر واردشده (نام، تصویر آواتار و وضعیت عضویت).
2. **ارز مجازی و سیستم پاداش (یاقوت‌ها)**: نمایش موجودی توکن‌ها/یاقوت‌های کسب‌شده توسط دانش‌آموز که در خرید دوره‌ها یا دریافت امکانات ویژه کاربرد دارد.
3. **انگیزش یادگیری مبتنی بر تارگت (Milestones)**: نمایش امتیاز فعالیت آموزشی (Study Points) در قالب یک نوار پیشرفت داینامیک تا رسیدن به هدف دوره.
4. **میانبر دسترسی سریع به اشتراک و حساب**: هدایت کاربر با یک کلیک به صفحه جزییات پروفایل و مدیریت اشتراک‌ها.

---

## ۲. المان‌های دیداری و کارکرد هر بخش

در تصویر اسکرین‌شات ارائه‌شده، اجزای زیر دیده می‌شوند که به شرح زیر طراحی و هندل شده‌اند:

```
┌─────────────────────────────────────────────────────────┐
│  [۲۸ یاقوت 💎]                علی محمدی      [ 🧑‍🦱 ]   │
│                              دانش‌آموز فعال              │
│                                                         │
│  هدف ۳۰۰                                ۱۱۲ امتیاز 🏆   │
│  [████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   │
│  ۳۰۰                      ۲۰۰                       ۱۰۰ │
│ - - - - - - - - - - - - - - - - - - - - - - - - - - - - │
│  <                                    مشاهده حساب و اشتراک│
└─────────────────────────────────────────────────────────┘
```

1. **آواتار کاربر (`Avatar`)**:
   - کادر دایره‌ای با حاشیه ضخیم نارنجی (`border: '2px solid #f47c20'`).
   - تصویر کاربر از طریق آدرس اختصاصی یا استاتیک بارگذاری می‌شود (`assetUrl(user?.avatar)`).
   - در صورت عدم وجود عکس، به شکل خودکار حرف اول نام دانش‌آموز با پس‌زمینه رنگی نمایش داده می‌شود.

2. **نام و عنوان کاربری (`User Identity`)**:
   - نام و نام‌خانوادگی دانش‌آموز: «علی محمدی» (یا شماره همراه در صورت ثبت‌نام اولیه).
   - برچسب وضعیت: «دانش‌آموز فعال» با رنگ گرم نارنجی سازمانی (`#df5b13`).

3. **نشان یاقوت‌ها (`Rubies Badge`)**:
   - بج بیضی‌شکل با پس‌زمینه هلویی ملایم (`#ffefd3`) و بوردر اختصاصی.
   - آیکون الماس (`DiamondOutlinedIcon`) در کنار رقم فارسی «۲۸ یاقوت».
   - کاربرد: یاقوت‌ها دارایی بازی‌وارسازی هستند که به ازای مشاهده جلسات، ثبت تمرین و شرکت در وبینارها به دانش‌آموز اعطا می‌شوند.

4. **شمارنده امتیاز و هدف (`Study Points & Target`)**:
   - آیکون کاپ طلایی (`EmojiEventsOutlinedIcon`) به همراه عبارت «۱۱۲ امتیاز».
   - در سمت مخالف، هدف مرحله‌ای قرار دارد: «هدف ۳۰۰».

5. **نوار پیشرفت خطی (`LinearProgress Bar`)**:
   - یک نوار با لبه‌های کاملاً گرد (`borderRadius: 3`) و گرادیان جذاب افقی از نارنجی روشن به تیره (`linear-gradient(90deg, #f47c20 0%, #df5b13 100%)`).
   - محاسبه خودکار درصد پیشرفت (برای امتیاز ۱۱۲ از ۳۰۰، پیشرفت معادل **۳۷٪** است).
   - خطوط و نشانگرهای مرحله‌ای زیر نوار برای اهداف ۱۰۰، ۲۰۰ و ۳۰۰ امتیاز.

6. **لینک دسترسی سریع (`Quick Link`)**:
   - جدا شده با یک خط‌چین هماهنگ با تم (`borderTop: '1px dashed #ffdda8'`).
   - عبارت تعاملی «مشاهده حساب و اشتراک» همراه با آیکون فلش چپ (`ChevronLeftIcon`).
   - کلیک روی این بخش، دانش‌آموز را فوراً به مسیر `/profile` می‌برد.

---

## ۳. نحوه پیاده‌سازی و هندل فنی در کدهای پروژه

این بخش به صورت کامپوننت ماژولار و ساختاریافته در پروژه فرانت‌اند پیاده‌سازی شده است:

### الف) محل فایل‌های سورس کد
- **کامپوننت رندرکننده**: فایل [`Sidebar.jsx`](file:///Users/mohammad/WebstormProjects/harekat/harekat-dashboard/src/layouts/Sidebar.jsx#L50-L177)
- **مدیریت استیت و اطلاعات کاربر**: فایل [`AuthContext.jsx`](file:///Users/mohammad/WebstormProjects/harekat/harekat-dashboard/src/contexts/AuthContext.jsx#L238-L260)
- **توابع فرمت‌دهنده اعداد و آدرس‌ها**: فایل [`formatters.js`](file:///Users/mohammad/WebstormProjects/harekat/harekat-dashboard/src/utils/formatters.js)

### ب) منطق محاسبات در `Sidebar.jsx`
```javascript
// دریافت مقادیر کاربر و امتیازات از هوک سراسری useAuth
const { user, rubies, studyPoints } = useAuth();

// تعریف امتیاز هدف برای بازه جاری
const targetPoints = 300;

// محاسبه درصد پیشرفت خطی (محدود به سقف ۱۰۰٪)
const progressPercent = Math.min(100, Math.round((studyPoints / targetPoints) * 100));
```

### ج) ساختار JSX و استایل‌دهی سفارشی (MUI v6)
```jsx
<Box
  sx={{
    backgroundColor: '#fff8ed', // پس‌زمینه کرم گرم متناسب با پالت حرکت
    border: '1px solid #ffdda8', // خط حاشیه ملایم طلایی-عسلی
    borderRadius: '18px',
    p: 1.6,
    mb: 2,
    flexShrink: 0
  }}
>
  {/* بخش اول: آواتار، نام دانش‌آموز و بج یاقوت */}
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar
        src={assetUrl(user?.avatar)}
        alt={user?.firstName || 'کاربر'}
        sx={{
          width: 40,
          height: 40,
          border: '2px solid #f47c20',
          backgroundColor: '#ffa33f'
        }}
      >
        {(user?.firstName?.[0] || 'ح')}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: '#171715' }}>
          {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.phoneNumber || 'دانش‌آموز')}
        </Typography>
        <Typography variant="caption" sx={{ color: '#df5b13', fontWeight: 600, fontSize: '0.72rem' }}>
          دانش‌آموز فعال
        </Typography>
      </Box>
    </Box>

    {/* بج یاقوت */}
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, backgroundColor: '#ffefd3', borderRadius: '9999px', px: 1, py: 0.3 }}>
      <DiamondOutlinedIcon sx={{ fontSize: 13, color: '#f47c20' }} />
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#b94410' }}>
        {toPersianDigits(rubies)} یاقوت
      </Typography>
    </Box>
  </Box>

  {/* بخش دوم: نوار پیشرفت امتیاز آموزشی */}
  <Box sx={{ mt: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
        <EmojiEventsOutlinedIcon sx={{ fontSize: 15, color: '#d99400' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#171715' }}>
          {toPersianDigits(studyPoints)} امتیاز
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: '#72726a', fontSize: '0.7rem' }}>
        هدف {toPersianDigits(targetPoints)}
      </Typography>
    </Box>

    <LinearProgress
      variant="determinate"
      value={progressPercent}
      sx={{
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ffdda8',
        '& .MuiLinearProgress-bar': {
          borderRadius: 3,
          background: 'linear-gradient(90deg, #f47c20 0%, #df5b13 100%)'
        }
      }}
    />

    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.3 }}>
      <Typography variant="caption" sx={{ color: '#9b9b92', fontSize: '0.62rem' }}>۱۰۰</Typography>
      <Typography variant="caption" sx={{ color: '#9b9b92', fontSize: '0.62rem' }}>۲۰۰</Typography>
      <Typography variant="caption" sx={{ color: '#9b9b92', fontSize: '0.62rem' }}>۳۰۰</Typography>
    </Box>
  </Box>

  {/* بخش سوم: لینک اقدام سریع */}
  <Box
    component={NavLink}
    to="/profile"
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      textDecoration: 'none',
      color: '#df5b13',
      fontSize: '0.76rem',
      fontWeight: 700,
      mt: 1,
      pt: 0.8,
      borderTop: '1px dashed #ffdda8'
    }}
  >
    <span>مشاهده حساب و اشتراک</span>
    <ChevronLeftIcon sx={{ fontSize: 15 }} />
  </Box>
</Box>
```

### د) بومی‌سازی و ارقام فارسی (Persian Typography & RTL)
- تمام مقادیر عددی از جمله «۱۱۲»، «۲۸»، و «۳۰۰» از تابع تبدیل ارقام فارسی `toPersianDigits()` عبور داده می‌شوند تا ارقام به صورت کامپوزیت فارسی استاندارد رندر شوند.
- جهت‌گیری به شکل کامل `dir="rtl"` است و نوار پیشرفت از سمت راست به چپ به شکلی طبیعی پر می‌شود.

---

## ۴. ارتباط با بک‌اند و منابع داده (Backend Integration)

1. **مدل کاربری (`Users`)**:
   - اطلاعات هویتی (`firstName`, `lastName`, `avatar`, `phoneNumber`) مستقیماً از اندپوینت `/api/v1/user/profile` بک‌اند فراخوانی و در نشست ذخیره می‌شوند.
2. **اتصال امتیازات به عملکرد آموزشی**:
   - در منطق داشبورد، با تکمیل هر جلسه دوره (`sessions/watch`) یا گذراندن آزمون‌ها، متد افزایش امتیاز فعال شده و داده‌های این کارت به صورت بلادرنگ همگام‌سازی می‌گردند.
3. **حالت پیش‌نمایش آفلاین (Mock/Preview Mode)**:
   - در صورتی که کاربر به صورت میهمان وارد پنل شود، `AuthContext` کاربر نمونه پیش‌فرض `MOCK_PREVIEW_USER` را با امتیاز ۱۱۲ و ۲۸ یاقوت بارگذاری می‌کند تا ظاهر بصری و تجربه کاربری دقیقاً مشابه طرح مرجع دریبل باقی بماند.

---

## ۵. خلاصه
کارت اسکرین‌شات ارسال‌شده، **ویجت هویت بصری و انگیزش گیمیفیکیشن دانش‌آموز** در بالای سایدبار است. این بخش با ترکیب هویتی (آواتار/نام)، انگیزشی (یاقوت/امتیاز/پروگرس بار) و ناوبری (لینک پروفایل)، جلوه‌ای پویا به سامانه یادگیری بخشیده و تمام محاسبات و استایل‌های آن کاملاً اختصاصی و داینامیک پیاده‌سازی شده است.
