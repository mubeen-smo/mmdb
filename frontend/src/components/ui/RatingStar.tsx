export function RatingStar({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <polygon points="50,6 61,36 95,36 68,57 79,90 50,70 21,90 32,57 5,36 39,36" />
    </svg>
  );
}
