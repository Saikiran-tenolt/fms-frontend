// hooks/useWhyDidYouUpdate.ts
import { useEffect, useRef } from 'react';

export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
    const previousProps = useRef<Record<string, any>>({});

    useEffect(() => {
        const allKeys = Object.keys({ ...previousProps.current, ...props });
        const changedProps: Record<string, any> = {};

        allKeys.forEach((key) => {
            if (previousProps.current[key] !== props[key]) {
                changedProps[key] = {
                    from: previousProps.current[key],
                    to: props[key],
                };
            }
        });

        if (Object.keys(changedProps).length > 0) {
            console.log(`[${name}] re-rendered because:`, changedProps);
        }

        previousProps.current = props;
    });
}