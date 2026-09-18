import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FaqPage() {
  const faqs = [
    {
      q: 'چگونه به ویدیوهای دوره‌های خریداری شده دسترسی پیدا کنم؟',
      a: 'پس از ثبت سفارش و خرید دوره، ویدیوها و جزوات در بخش «دوره‌های من» و همچنین داشبورد اصلی برای شما فعال و قابل مشاهده خواهند بود.'
    },
    {
      q: 'آیا برای شرکت در وبینارها به نرم‌افزار خاصی نیاز است؟',
      a: 'خیر؛ تمامی جلسات آنلاین و وبینارها به صورت مستقیم از طریق مرورگر شما در دسترس قرار دارند.'
    },
    {
      q: 'چگونه امتیازات و یاقوت‌های آموزشی را ارتقا دهم؟',
      a: 'با تماشای درس‌ها، تکمیل تمرین‌ها و اعلام پایان هر جلسه، امتیاز به پروفایل شما اضافه شده و سطح شما ارتقا می‌یابد.'
    }
  ];

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        سوالات متداول (FAQ)
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 3.5 }}>
        پاسخ به سوالات پرتکرار دانش‌آموزان و همراهان مدرسه حرکت
      </Typography>

      {faqs.map((item, i) => (
        <Accordion
          key={i}
          sx={{
            mb: 1.5,
            borderRadius: '16px !important',
            border: '1px solid #eef2f7',
            boxShadow: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ color: '#475569', lineHeight: 1.8 }}>{item.a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
