import TopBarLayout from "../layouts/TopBarLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import {motion} from "motion/react";
import Chip from "../components/ui/Chip.jsx";
import Box from "../components/ui/Box.jsx";
import {H1, H3} from "../components/ui/Headings.jsx";
import {ArrowButton} from "../components/ui/Buttons.jsx";
import MarqueeLayout from "../layouts/MarqueeLayout.jsx";
import {useNavigate} from "react-router-dom";
import cameraImg from '../assets/black-camera-lens-brown-wooden-table.jpg';
import lightImg from '../assets/bright-flashlight-beam-cutting-through-dark-background-with-dramatic-lighting-effect.jpg';
import micImg from '../assets/closeup-shot-condenser-microphone-with-pop-filter-blurred.jpg'
import editorImg from '../assets/empty-desk-equipped-with-mixing-console-music-recording-tools-home-studio.jpg';
import codeImg from '../assets/side-shot-code-editor-using-react-js.jpg';
import laptopImg from '../assets/woman-working-from-home-laptop.jpg';
import Img from "../components/ui/Img.jsx";

const heroVariants = {
    hidden: {opacity: 0},
    visible: {
        opacity: 1,
        transition: {staggerChildren: 0.12, delayChildren: 0.15},
    },
};

const heroItem = {
    hidden: {opacity: 0, y: 24},
    visible: {
        opacity: 1,
        y: 0,
        transition: {duration: 0.6, ease: [0.2, 0, 0, 1]},
    },
};

const images = [cameraImg, lightImg, micImg, editorImg, codeImg, laptopImg];

export default function Landing() {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <TopBarLayout />
            {/*hero*/}
            <Box id={'hero'} className={'pt-16'}>
                <motion.div
                    className={'flex flex-col items-center justify-center my-40 w-[50%] gap-8'}
                    variants={heroVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={heroItem}><Chip>مدرسه هنر و مهارت</Chip></motion.div>
                    <motion.div variants={heroItem}>
                        <H1 className={'text-7xl text-center leading-tight'}>
                            اینجا فقط یاد<br />نمی‌گیری؛
                        </H1>
                    </motion.div>
                    <motion.div variants={heroItem}>
                        <H3 className={'text-xl text-center leading-tight'}>
                            حرکت مدیا جایی برای یادگیری و تجربه در مرز هنر، رسانه و فناوری است؛ از عکاسی و تدوین و طراحی تا برنامه‌نویسی، طراحی سایت و هوش مصنوعی.
                        </H3>
                    </motion.div>
                    <motion.div variants={heroItem}>
                        <div>
                            <ArrowButton onClick={() => navigate('/#courses')}>
                                بریم شروع کنیم!
                            </ArrowButton>
                        </div>
                    </motion.div>
                    <motion.div variants={heroItem} className={'overflow-hidden'}>
                        <MarqueeLayout className={'mt-10'}>
                            {images.map((image, index) => (
                                <div className={'overflow-hidden'}>
                                    <Img src={image} key={index} className={'w-64 h-75'} groupHover={true}/>
                                </div>
                            ))}
                        </MarqueeLayout>
                    </motion.div>
                </motion.div>
            </Box>


        </MainLayout>
    )
}