// src/pages/customer/home/About.jsx
import { useSpring,animated , useInView, useTrail } from '@react-spring/web';

export default function About() {
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });

  // 1. hero text reveal
  const heroTrail = useTrail(3, {
    from: { opacity: 0, y: 40 },
    to: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 },
    config: { tension: 300, friction: 30 },
    delay: 200,
  });

  // 2. cards float up
  const cardTrail = useTrail(3, {
    from: { opacity: 0, y: 60 },
    to: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 },
    config: { tension: 280, friction: 35 },
    delay: 400,
  });

  return (
    <section ref={ref} className="bg-[hsl(210,40% , 98%)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl space-y-20">

        {/* hero */}
        <div className="text-center space-y-4">
          {heroTrail.map((s, i) => (
            <animated.div key={i} style={s}>
              {i === 0 && (
                <h1 className="text-4xl md:text-6xl font-black text-indigo-600">Built for Performance. Designed for Precision.</h1>
              )}
              {i === 1 && (
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                  CompatX is a high-performance hardware commerce platform engineered for speed, reliability, and seamless buying experiences. From components to complete systems, every flow is optimized for real-world performance.

                </p>
              )}
              {i === 2 && (
                <div className="pt-6">
                  <button className="rounded-full bg-violet-200 px-6 py-3 font-semibold text-indigo-700 shadow-sm hover:bg-violet-300 transition">
                    Explore the Platform

                  </button>
                </div>
              )}
            </animated.div>
          ))}
        </div>

       {/* cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {cardTrail.map((s, i) => (
            <animated.div
              key={i}
              style={s}
              className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-100"
            >
              <div className="mb-4 h-12 w-12 rounded-xl bg-violet-200 grid place-items-center text-indigo-700 font-black text-xl">
                0{i + 1}
              </div>
              <h3  className="text-xl font-bold text-gray-900"> 
                { i=== 0 && "Backend"}
                { i=== 1 && "Security"}
                { i=== 2 && "Frontend"}
                
                  </h3> 
             
              <p className="mt-2 text-gray-600">
                {i === 0 && 'Enterprise-grade backend built for scale, accuracy, and zero compromise on data integrity.'}
                {i === 1 && 'Modern authentication and role-based access control designed to protect users, orders, and payments.'}
                {i === 2 && 'A fast, responsive interface crafted for smooth browsing, instant feedback, and frictionless checkout.'}
              </p>
            </animated.div>
          ))}
        </div>

        {/* stats */}
        <div className="rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 p-10 md:p-16 text-center">
          <animated.div
            style={useSpring({
              from: { opacity: 0, scale: 0.9 },
              to: inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 },
              config: { tension: 280, friction: 30 },
            })}
          >
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <div className="text-4xl font-black text-indigo-700">99.7 %</div>
                <div className="mt-1 text-sm uppercase tracking-wider text-gray-600">Precision Matching</div>
              </div>
              <div>
                <div className="text-4xl font-black text-indigo-700">24 h</div>
                <div className="mt-1 text-sm uppercase tracking-wider text-gray-600">Fast Dispatch</div>
              </div>
              <div>
                <div className="text-4xl font-black text-indigo-700">∞</div>
                <div className="mt-1 text-sm uppercase tracking-wider text-gray-600">Always Available</div>
              </div>
            </div>
          </animated.div>
        </div>

      </div>
    </section>
  );
}