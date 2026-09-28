import React, { useLayoutEffect, useRef } from 'react'
import kfw from '../static/images/img/KFW.png'
import giz from '../static/images/img/giz.jpg'
import green from '../static/images/img/green.png'
import modernized from '../static/images/img/modernized.png'
import uncdf from '../static/images/img/Uncdf.png'
import { useReducedMotionPreference } from '../shared/PublicMotion'
import './Partner.css'

const partners = [
    { name: 'KfW', image: kfw, width: 216, height: 91, shape: 'standard' },
    { name: 'GIZ', image: giz, width: 473, height: 112, shape: 'wide' },
    { name: 'GrEEn', image: green, width: 388, height: 91, shape: 'wide' },
    { name: 'Modernizing Agriculture in Ghana', image: modernized, width: 235, height: 166, shape: 'portrait' },
    { name: 'UNCDF', image: uncdf, width: 404, height: 394, shape: 'square' },
]

const PartnerSequence = ({ duplicate = false, sequenceRef }) => (
    <div
        ref={sequenceRef}
        className="partners-rail__sequence"
        role={duplicate ? undefined : 'list'}
        aria-hidden={duplicate ? 'true' : undefined}
    >
        {partners.map((partner) => (
            <div
                className={`partner-logo partner-logo--${partner.shape}`}
                role={duplicate ? undefined : 'listitem'}
                key={partner.name}
            >
                <img
                    src={partner.image}
                    alt={duplicate ? '' : partner.name}
                    width={partner.width}
                    height={partner.height}
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                />
            </div>
        ))}
    </div>
)

const Partner = () => {
    const railRef = useRef(null)
    const trackRef = useRef(null)
    const sequenceRef = useRef(null)
    const animationRef = useRef(null)
    const isPausedRef = useRef(false)
    const reduceMotion = useReducedMotionPreference()

    useLayoutEffect(() => {
        const rail = railRef.current
        const track = trackRef.current
        const sequence = sequenceRef.current
        if (reduceMotion || !rail || !track || !sequence) return undefined

        let cancelled = false
        let observer

        const startAnimation = () => {
            const distance = sequence.getBoundingClientRect().width
            const duration = Math.min(40, Math.max(25, distance / 45))

            import('motion')
                .then(({ animate }) => {
                    if (cancelled) return

                    animationRef.current = animate(track, { x: [0, -distance] }, {
                        duration,
                        ease: 'linear',
                        repeat: Infinity,
                    })

                    if (isPausedRef.current) animationRef.current.pause()
                })
                .catch(() => {
                    track.style.transform = 'none'
                })
        }

        if (window.IntersectionObserver) {
            observer = new IntersectionObserver(([entry]) => {
                if (!entry.isIntersecting) return
                observer.disconnect()
                startAnimation()
            }, { rootMargin: '160px 0px' })
            observer.observe(rail)
        } else {
            startAnimation()
        }

        return () => {
            cancelled = true
            observer?.disconnect()
            animationRef.current?.stop()
            animationRef.current = null
            track.style.transform = 'none'
        }
    }, [reduceMotion])

    const pauseRail = () => {
        isPausedRef.current = true
        animationRef.current?.pause()
    }

    const resumeRail = () => {
        isPausedRef.current = false
        animationRef.current?.play()
    }

    const handleBlur = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) resumeRail()
    }

    return (
        <section className="partners-section" aria-labelledby="partners-title">
            <div className="partners-section__heading">
                <span className="section-kicker">Working together</span>
                <h2 id="partners-title">Development Partners</h2>
                <p>Partner institutions supporting district development and public information in Ghana.</p>
            </div>
            <div
                ref={railRef}
                className={`partners-rail${reduceMotion ? ' is-static' : ''}`}
                role="region"
                aria-label="Development partner logos"
                onMouseEnter={pauseRail}
                onMouseLeave={resumeRail}
                onFocusCapture={pauseRail}
                onBlurCapture={handleBlur}
            >
                <div ref={trackRef} className="partners-rail__track">
                    <PartnerSequence sequenceRef={sequenceRef} />
                    {!reduceMotion && <PartnerSequence duplicate />}
                </div>
            </div>
        </section>
    )
}

export default Partner
