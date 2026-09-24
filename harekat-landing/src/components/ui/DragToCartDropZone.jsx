import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Check, Sparkles } from 'lucide-react';
import { useCart } from '../../contexts/CartContext.jsx';

export default function DragToCartDropZone() {
    const { addToCart } = useCart();
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    useEffect(() => {
        const handleDragStartGlobal = (e) => {
            if (e.dataTransfer && e.dataTransfer.types.includes('application/harekat-item')) {
                setIsDragActive(true);
            }
        };

        const handleDragEndGlobal = () => {
            setIsDragActive(false);
            setIsDraggingOver(false);
        };

        window.addEventListener('dragenter', handleDragStartGlobal);
        window.addEventListener('dragend', handleDragEndGlobal);
        window.addEventListener('drop', handleDragEndGlobal);

        return () => {
            window.removeEventListener('dragenter', handleDragStartGlobal);
            window.removeEventListener('dragend', handleDragEndGlobal);
            window.removeEventListener('drop', handleDragEndGlobal);
        };
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        if (!isDraggingOver) setIsDraggingOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDraggingOver(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        setIsDragActive(false);

        try {
            const rawData = e.dataTransfer.getData('application/harekat-item');
            if (rawData) {
                const item = JSON.parse(rawData);
                await addToCart(item.id, item.type || 'course', 1, item.price);
                setJustAdded(true);
                setTimeout(() => setJustAdded(false), 2200);
            }
        } catch (err) {
            console.error('Drag to cart drop error:', err);
        }
    };

    return (
        <AnimatePresence>
            {(isDragActive || justAdded) && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[9990] max-w-[calc(100%-2rem)] flex items-center gap-3 sm:gap-4 px-5 py-3.5 sm:px-8 sm:py-5 rounded-full border-2 transition-all duration-300 shadow-2xl backdrop-blur-2xl ${
                        justAdded
                            ? 'bg-success-500/20 border-success-500 text-success-500 scale-105'
                            : isDraggingOver
                            ? 'bg-primary/25 border-primary text-primary scale-110 shadow-primary/30 ring-8 ring-primary/20'
                            : 'bg-card/90 border-dashed border-primary/60 text-foreground'
                    }`}
                >
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                        {justAdded ? (
                            <Check size={26} className="animate-bounce" />
                        ) : (
                            <ShoppingCart size={24} className={isDraggingOver ? 'animate-pulse' : ''} />
                        )}
                        {justAdded && (
                            <Sparkles size={16} className="absolute -top-1 -right-1 text-amber-400 animate-spin" />
                        )}
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-base font-extrabold">
                            {justAdded
                                ? 'به سبد خرید اضافه شد!'
                                : isDraggingOver
                                ? 'همینجا رها کن!'
                                : 'برای خرید، به اینجا بکشید و رها کنید'}
                        </span>
                        <span className="text-xs text-muted">
                            {justAdded ? 'می‌تونید در سبد خرید نهایی کنید' : 'افزودن سریع دوره'}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
