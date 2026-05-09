// Performance: UI-only component - wraps every page with entrance animation and page background
import { LazyMotion, domAnimation, m } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`page-bg min-h-screen pt-20 pb-24 lg:pb-8 px-4 sm:px-6 lg:pl-[260px] lg:pr-6 ${className}`}
      >
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </m.div>
    </LazyMotion>
  );
}
