type CrestProps = {
  size?: number;
  className?: string;
};

export function Crest({ size = 46, className }: CrestProps) {
  return (
    <span
      className={className}
      style={{
        width: size,
        height: Math.round((size * 52) / 46),
        display: "inline-grid",
        placeItems: "center",
      }}
    >
      <svg viewBox="0 0 46 52" aria-hidden="true">
        <path
          d="M23 1 L44 9 V30 C44 42 34 49 23 51 C12 49 2 42 2 30 V9 Z"
          fill="#0F2470"
          stroke="#D9A93C"
          strokeWidth="2"
        />
        <path
          d="M15 34 L29 14"
          stroke="#F5F2E9"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <circle cx="31" cy="33" r="5" fill="#C8102E" />
        <path
          d="M28 31 C30 33 32 33 34 35"
          stroke="#F5F2E9"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </span>
  );
}