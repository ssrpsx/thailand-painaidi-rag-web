"use client";

interface Props {
  provinces: string[];
  types: string[];
  province: string;
  type: string;
  onChange: (next: { province?: string; type?: string }) => void;
}

export default function FilterBar({ provinces, types, province, type, onChange }: Props) {
  return (
    <div className="w-full flex flex-wrap gap-3 gap-y-2 px-4 mt-4 justify-center" role="tablist">
      <button
        className={`chip ${!province && !type ? "active" : "outline"}`}
        onClick={() => onChange({ province: "", type: "" })}
      >
        ทั้งหมด
      </button>
      {types.map((t) => (
        <button
          key={`type-${t}`}
          className={`chip ${type === t ? "active" : "outline"}`}
          onClick={() => onChange({ type: type === t ? "" : t })}
        >
          {t}
        </button>
      ))}
      <span style={{ width: 1, background: "var(--line)", margin: "4px 4px" }} />
      {provinces.map((p) => (
        <button
          key={`prov-${p}`}
          className={`chip ${province === p ? "active" : "outline"}`}
          onClick={() => onChange({ province: province === p ? "" : p })}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
