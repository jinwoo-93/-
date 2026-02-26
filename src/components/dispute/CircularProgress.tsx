'use client';

interface CircularProgressProps {
  buyerPercent: number;
  sellerPercent: number;
  size?: number;
}

export function CircularProgress({
  buyerPercent,
  sellerPercent,
  size = 120,
}: CircularProgressProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate offsets for buyer and seller
  const buyerOffset = circumference - (buyerPercent / 100) * circumference;
  const sellerOffset = circumference - (sellerPercent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />

        {/* Buyer progress (blue) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={buyerOffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />

        {/* Seller progress (red) - starts where buyer ends */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={sellerOffset}
          strokeLinecap="round"
          className="transition-all duration-500"
          style={{
            strokeDasharray: `${(sellerPercent / 100) * circumference} ${circumference}`,
            strokeDashoffset: -((buyerPercent / 100) * circumference),
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] text-muted-foreground">VS</div>
      </div>
    </div>
  );
}
