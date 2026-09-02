import Image from "next/image";

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
        height: size,
        display: "inline-block",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <Image
        src="/logo.gif"
        alt="Glostrup Cricket Club crest"
        width={size}
        height={size}
        unoptimized
        priority
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </span>
  );
}