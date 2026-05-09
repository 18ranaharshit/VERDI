// Performance: Lazy loads qrcode.react to keep it out of the initial bundle
import React, { Suspense } from 'react';
const QRCode = React.lazy(() => import('qrcode.react').then(mod => ({ default: mod.QRCodeSVG })));

interface QRCodeDisplayProps {
  value: string;
}

export default function QRCodeDisplay({ value }: QRCodeDisplayProps) {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-white p-3 rounded-xl inline-block shadow-sm">
        <Suspense fallback={<div className="w-[140px] h-[140px] bg-gray-100 animate-pulse rounded-lg" />}>
          <QRCode
            value={value}
            size={140}
            bgColor="#ffffff"
            fgColor="#000000" // Explicit black to ensure contrast even in dark mode
            level="M"
          />
        </Suspense>
      </div>
    </div>
  );
}
