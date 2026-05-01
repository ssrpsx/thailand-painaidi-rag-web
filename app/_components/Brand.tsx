export default function Brand({ size = "md" }: { size?: "sm" | "md" }) {
  const cls = size === "sm" ? "brand brand-sm" : "brand";
  return (
    <span className={cls} aria-label="PAINAIDI">
      <span className="brand-mark" aria-hidden />
      <span className="brand-word">PAINAIDI</span>
    </span>
  );
}
