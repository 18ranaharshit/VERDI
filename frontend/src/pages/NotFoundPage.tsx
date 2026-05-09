// Performance: UI-only component - static 404 page, no API calls
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="page-bg flex items-center justify-center px-4" style={{ minHeight: '100dvh', height: '100vh' }}>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <m.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block mb-6"
          >
            <Leaf className="w-20 h-20 text-verdi-accent/50" />
          </m.div>

          <h1 className="font-display font-extrabold text-4xl text-verdi-primary mb-2">
            Lost in the forest?
          </h1>
          <p className="text-verdi-muted text-lg mb-8">
            This path doesn't lead anywhere verdi-friendly.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-verdi-accent text-white
                       font-display font-semibold hover:shadow-glow hover:scale-[1.02]
                       active:scale-[0.98] transition-all duration-200"
          >
            <Leaf className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </m.div>
      </div>
    </LazyMotion>
  );
}
