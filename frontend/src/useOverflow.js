import React, { useState, useEffect, useCallback } from 'react';

export const useOverflow = (ref) => {
    const [isOverflowing, setIsOverflowing] = useState(false);

    const checkOverflow = useCallback(() => {
        if (ref.current) {
            const { scrollHeight, clientHeight } = ref.current;
            setIsOverflowing(scrollHeight > clientHeight);
        }
    }, [ref]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        checkOverflow();

        const resizeObserver = new ResizeObserver(checkOverflow);
        resizeObserver.observe(element);

        window.addEventListener('resize', checkOverflow);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', checkOverflow);
        };
    }, [ref, checkOverflow]);

    return isOverflowing;
};
