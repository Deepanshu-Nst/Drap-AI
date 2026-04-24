'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <>
      {/* Minimalist CTA section */}
      <section
        id="cta"
        className="py-32 px-8 md:px-16 relative overflow-hidden"
        style={{ background: 'var(--bg-secondary)' }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(184,163,134,0.03) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <div
              className="inline-flex items-center gap-3 rounded-full px-4 py-2 mb-8 text-[10px] font-semibold tracking-[0.2em] uppercase"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ color: 'var(--accent)' }}/>
              API Access Open
            </div>

            <h2
              className="font-display text-5xl md:text-6xl font-light mb-6 leading-tight"
              style={{ color: 'var(--text-main)' }}
            >
              Integrate <span className="italic text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)' }}>Agentic AI</span>
              <br />
              into your pipeline.
            </h2>

            <p className="text-lg mb-12 max-w-xl mx-auto font-light" style={{ color: 'var(--text-muted)' }}>
              Get enterprise-grade API access to our real-time fashion visualization models.
            </p>

            {!submitted ? (
              <motion.form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  required
                  className="flex-1 rounded-full px-6 py-4 text-sm font-medium"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary rounded-full px-8 py-4 text-sm tracking-wide uppercase font-semibold whitespace-nowrap"
                >
                  Request Access
                </button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-6 max-w-md mx-auto"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
              >
                <div className="text-3xl mb-3">✓</div>
                <div className="font-semibold mb-1 tracking-wide" style={{ color: 'var(--text-main)' }}>Access Requested</div>
                <div className="text-sm font-light" style={{ color: 'var(--text-muted)' }}>
                  Our team will securely provision your API keys within 24 hours.
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer
        className="py-12 px-8 md:px-16"
        style={{
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xl font-display font-medium tracking-wide" style={{ color: 'var(--text-main)' }}>
            Advait <span style={{ color: 'var(--accent)' }}>AI</span>
          </div>
          <div className="text-xs tracking-wide" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Advaitians Innovation Private Limited. All rights reserved.
          </div>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Documentation'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs uppercase tracking-widest font-medium transition-colors duration-300"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
