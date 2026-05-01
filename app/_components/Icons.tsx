// Stroke-based SVG icons (Lucide style). Sized via the `size` prop, color
// inherits from CSS `currentColor` so usage stays a one-liner:
//
//   <IconHeart size={18} className="text-rose-500" />
//
// Keeping them inline avoids a runtime icon-library dependency.

import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number };

function svg(props: Props) {
  const { size = 22, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export const IconCompass = (p: Props) => (
  <svg {...svg(p)}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M15.6 8.4 13.4 13.4 8.4 15.6 10.6 10.6Z" />
  </svg>
);

export const IconHeart = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 7.5 2.8c0 5.6-7.5 10.2-7.5 10.2z" />
  </svg>
);

export const IconHeartFill = (p: Props) => (
  <svg {...svg(p)} fill="currentColor" stroke="none">
    <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 7.5 2.8c0 5.6-7.5 10.2-7.5 10.2z" />
  </svg>
);

export const IconChat = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.7-5.4A8 8 0 1 1 21 12z" />
  </svg>
);

export const IconFilter = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

export const IconSliders = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

export const IconX = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconCheck = (p: Props) => (
  <svg {...svg(p)}>
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export const IconUndo = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h11a5 5 0 0 1 0 10h-3" />
  </svg>
);

export const IconSearch = (p: Props) => (
  <svg {...svg(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.3-4.3" />
  </svg>
);

export const IconNavigation = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M3 11 21 3l-8 18-2-8-8-2z" />
  </svg>
);

export const IconSend = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22 11 13 2 9z" />
  </svg>
);

export const IconEdit = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

export const IconTrash = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

export const IconPlus = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconPaperclip = (p: Props) => (
  <svg {...svg(p)}>
    <path d="m21 11-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8.5-8.5" />
  </svg>
);

export const IconSparkles = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="m6 6 2 2M16 16l2 2M6 18l2-2M16 8l2-2" />
  </svg>
);

export const IconMapPin = (p: Props) => (
  <svg {...svg(p)}>
    <path d="M12 22s7-7.6 7-12a7 7 0 0 0-14 0c0 4.4 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
