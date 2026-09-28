import React, {
    forwardRef,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'

const numberFormatter = new Intl.NumberFormat('en-GH')
const motionEase = [0.22, 1, 0.36, 1]

export const useReducedMotionPreference = () => {
    const [reduceMotion, setReduceMotion] = useState(() => (
        typeof window !== 'undefined'
        && window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ))

    useEffect(() => {
        if (!window.matchMedia) return undefined

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const handleChange = (event) => setReduceMotion(event.matches)
        mediaQuery.addEventListener('change', handleChange)

        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    return reduceMotion
}

const setFinalStyles = (element, items) => {
    element.style.opacity = '1'
    element.style.transform = 'none'
    items.forEach((item) => {
        item.style.opacity = '1'
        item.style.transform = 'none'
    })
}

export const PublicMotionSection = forwardRef(({ children, onEnter, ...props }, forwardedRef) => {
    const sectionRef = useRef(null)
    const reduceMotion = useReducedMotionPreference()

    useLayoutEffect(() => {
        const element = sectionRef.current
        if (!element) return undefined

        const items = Array.from(element.querySelectorAll('[data-public-motion-item]'))
        let controls = []
        let cancelled = false

        const revealImmediately = () => {
            setFinalStyles(element, items)
            onEnter?.()
        }

        if (reduceMotion || !window.IntersectionObserver) {
            revealImmediately()
            return undefined
        }

        element.style.opacity = '0'
        element.style.transform = 'translateY(16px)'
        items.forEach((item) => {
            item.style.opacity = '0'
            item.style.transform = 'translateY(10px)'
        })

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return

            observer.disconnect()
            onEnter?.()

            import('motion')
                .then(({ animate, stagger }) => {
                    if (cancelled) return

                    controls = [
                        animate(element, { opacity: [0, 1], y: [16, 0] }, {
                            duration: 0.55,
                            ease: motionEase,
                        }),
                        animate(items, { opacity: [0, 1], y: [10, 0] }, {
                            duration: 0.45,
                            delay: stagger(0.08),
                            ease: motionEase,
                        }),
                    ]
                })
                .catch(revealImmediately)
        }, { threshold: 0.12 })

        observer.observe(element)

        return () => {
            cancelled = true
            observer.disconnect()
            controls.forEach((control) => control.stop())
            setFinalStyles(element, items)
        }
    }, [onEnter, reduceMotion])

    const setRefs = useCallback((element) => {
        sectionRef.current = element
        if (typeof forwardedRef === 'function') forwardedRef(element)
        else if (forwardedRef) forwardedRef.current = element
    }, [forwardedRef])

    return (
        <section ref={setRefs} {...props}>
            {children}
        </section>
    )
})

PublicMotionSection.displayName = 'PublicMotionSection'

export const PublicMotionItem = ({ children, ...props }) => (
    <div data-public-motion-item="" {...props}>{children}</div>
)

export const AnimatedNumber = ({ value, active, as: Element = 'strong', className }) => {
    const elementRef = useRef(null)
    const hasAnimated = useRef(false)
    const reduceMotion = useReducedMotionPreference()
    const isAvailable = Number.isInteger(value)
    const formattedValue = isAvailable ? numberFormatter.format(value) : '\u2014'

    useLayoutEffect(() => {
        if (!isAvailable || !active || reduceMotion || value === 0 || hasAnimated.current) return undefined

        const element = elementRef.current
        if (!element) return undefined

        let controls
        let cancelled = false
        hasAnimated.current = true
        element.textContent = numberFormatter.format(0)

        import('motion')
            .then(({ animate }) => {
                if (cancelled) return

                controls = animate(0, value, {
                    duration: 1,
                    ease: motionEase,
                    onUpdate: (current) => {
                        element.textContent = numberFormatter.format(Math.round(current))
                    },
                })
            })
            .catch(() => {
                element.textContent = formattedValue
            })

        return () => {
            cancelled = true
            controls?.stop()
            hasAnimated.current = false
            element.textContent = formattedValue
        }
    }, [active, formattedValue, isAvailable, reduceMotion, value])

    return (
        <Element ref={elementRef} className={className} aria-label={isAvailable ? formattedValue : undefined}>
            {formattedValue}
        </Element>
    )
}
