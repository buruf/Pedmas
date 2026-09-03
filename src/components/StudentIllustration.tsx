/**
 * Hero illustration: a student working through a problem at a laptop.
 *
 * Inline SVG on purpose — it stays crisp at every size, costs no extra
 * request, and keeps the homepage light on slow connections (spec §24).
 *
 * Deliberately FLAT vector, not attempted realism: the four things that made
 * the previous drawing read as a cartoon were a perfect-circle head, hair as
 * one solid blob, features spaced like an emoji, and a dead-on symmetrical
 * pose. Those are fixed here — an egg-shaped skull that tapers to a small
 * jaw, hair with a swept fringe and a real edge, eyes set low with brows and
 * lids, and a three-quarter lean toward the work. The face itself stays
 * simple; simple is not the same as cartoonish once the proportions are
 * right, and chasing rendered realism in hand-authored paths is what goes
 * wrong.
 */
export function StudentIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 400"
      className={className}
      role="img"
      aria-label="A student working through a math problem at a laptop"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="si-hoodie" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="si-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E7C9A9" />
          <stop offset="1" stopColor="#D3AC85" />
        </linearGradient>
        <clipPath id="si-face">
          <path d="M202 150c0-27 15-45 38-45s38 18 38 45c0 21-5 37-16 46-7 6-13 8-22 8s-15-2-22-8c-11-9-16-25-16-46z" />
        </clipPath>
      </defs>

      {/* Soft backdrop */}
      <circle cx="242" cy="192" r="170" fill="#EDE9FE" />
      <circle cx="242" cy="192" r="130" fill="#F5F3FF" />

      {/* Floating maths — varied forms, not one repeated badge shape */}
      <g opacity=".95">
        <g fill="none" stroke="#C4B5FD" strokeWidth="2.6" strokeLinejoin="round">
          <path d="M74 128l26-42 26 42z" />
          <circle cx="404" cy="120" r="23" />
          <path d="M404 120l18-14" strokeLinecap="round" />
        </g>
        <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="700" textAnchor="middle">
          <text x="52" y="238" fontSize="25" fill="#A78BFA">÷</text>
          <text x="430" y="228" fontSize="26" fill="#A78BFA">π</text>
          <text x="112" y="62" fontSize="22" fill="#C4B5FD">2x + 5</text>
          <text x="386" y="64" fontSize="23" fill="#C4B5FD">×</text>
          <text x="60" y="318" fontSize="22" fill="#DDD6FE">a² + b²</text>
        </g>
      </g>

      {/* Chair back, offset so the pose is not dead-centre */}
      <path d="M188 208c0-14 11-25 25-25h60c14 0 25 11 25 25v104H188z" fill="#A78BFA" />
      <path d="M188 286h110v26H188z" fill="#8B5CF6" opacity=".55" />

      {/* ---------------- the student ---------------- */}
      {/* Neck first, so the jaw overlaps its top rather than hiding all of it —
          the head sat straight on the shoulders until this dropped below the chin. */}
      <path d="M227 192h30v34c0 11-30 11-30 0z" fill="#C89268" />

      {/* Torso: shoulders start below the chin and carry real width */}
      <path d="M178 318v-40c0-30 24-56 64-56s64 26 64 56v40z" fill="url(#si-hoodie)" />
      <path d="M242 222c40 0 64 26 64 56v40h-28v-40c0-26-16-48-36-54z" fill="#5B21B6" opacity=".26" />
      {/* Hood gathered behind the neck — a collar that sits round the neck,
          not a bib across the chest */}
      <path d="M210 238c8 11 19 17 32 17s24-6 32-17c-9-8-20-12-32-12s-23 4-32 12z" fill="#5B21B6" />

      {/* Arms reaching in to the keyboard */}
      <path d="M190 272c-15 11-22 28-20 44l22 4c0-13 5-24 16-32z" fill="#7C3AED" />
      <path d="M294 272c15 11 22 28 20 44l-22 4c0-13-5-24-16-32z" fill="#7C3AED" />
      <ellipse cx="199" cy="317" rx="10" ry="9" fill="#E0AC81" />
      <ellipse cx="285" cy="317" rx="10" ry="9" fill="#E0AC81" />

      {/* Head: tipped 6° toward the screen */}
      <g transform="rotate(6 242 150)">
        {/* Skull: wide cranium tapering to a small jaw and soft chin */}
        <path
          d="M202 150c0-27 15-45 38-45s38 18 38 45c0 21-5 37-16 46-7 6-13 8-22 8s-15-2-22-8c-11-9-16-25-16-46z"
          fill="#E0AC81"
        />
        {/* Form, not flatness: the jaw falls into shadow */}
        <g clipPath="url(#si-face)">
          <path d="M202 172c6 22 18 34 38 34s32-12 38-34c0 24-13 44-38 44s-38-20-38-44z" fill="#C89268" opacity=".45" />
        </g>
        {/* Ear */}
        <path d="M277 152c7-3 12 2 10 9-1 7-7 11-12 9z" fill="#C89268" />

        {/* Hair: a shaped mass with a swept fringe and a defined edge */}
        <path
          d="M200 152c-4-34 15-56 42-56 28 0 45 21 42 55-3-9-7-17-12-23-11 15-33 22-56 17-8 1-13 4-16 7z"
          fill="#2F2A3D"
        />
        <path d="M204 128c-3 15-3 25-2 32-6-13-6-26 2-32z" fill="#241F2E" />
        <path d="M262 104c10 6 17 16 20 28-6-11-14-19-25-24z" fill="#3B3550" />

        {/* Brows, then eyes set low and cast down at the work */}
        <path d="M216 141c5-4 12-4 16-1M252 140c5-3 12-3 16 1" stroke="#2F2A3D" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <ellipse cx="224" cy="154" rx="4" ry="4.4" fill="#2F2A3D" />
        <ellipse cx="260" cy="154" rx="4" ry="4.4" fill="#2F2A3D" />
        <circle cx="225.4" cy="152.4" r="1.3" fill="#fff" />
        <circle cx="261.4" cy="152.4" r="1.3" fill="#fff" />

        {/* Small nose, short philtrum — the proportions that read as a child */}
        <path d="M242 160c2 6 3 9 0 11" stroke="#C08A5F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {/* Concentrating, not grinning */}
        <path d="M233 182c6 4 14 4 19 0" stroke="#B5705A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <ellipse cx="215" cy="169" rx="7" ry="5" fill="#D98C6A" opacity=".3" />
        <ellipse cx="269" cy="169" rx="7" ry="5" fill="#D98C6A" opacity=".3" />
      </g>

      {/* ---------------- desk ---------------- */}
      <rect x="46" y="318" width="388" height="16" rx="6" fill="url(#si-desk)" />
      <rect x="46" y="330" width="388" height="6" rx="3" fill="#B98F66" opacity=".35" />
      <rect x="78" y="336" width="13" height="48" rx="6" fill="#D3AC85" />
      <rect x="389" y="336" width="13" height="48" rx="6" fill="#D3AC85" />

      {/* ---------------- laptop ---------------- */}
      <g>
        <rect x="164" y="236" width="156" height="78" rx="9" fill="#4C1D95" />
        <rect x="171" y="243" width="142" height="64" rx="5" fill="#FFFFFF" />
        <g fontFamily="ui-sans-serif, system-ui, sans-serif" textAnchor="middle">
          <text x="242" y="269" fontSize="20" fontWeight="700" fill="#4C1D95">1</text>
          <rect x="230" y="274" width="25" height="2.6" rx="1.3" fill="#4C1D95" />
          <text x="242" y="296" fontSize="20" fontWeight="700" fill="#4C1D95">2</text>
          <text x="199" y="284" fontSize="21" fontWeight="700" fill="#7C3AED">+</text>
          <text x="290" y="284" fontSize="21" fontWeight="700" fill="#7C3AED">?</text>
        </g>
        <rect x="148" y="314" width="188" height="11" rx="5.5" fill="#6D28D9" />
        <rect x="222" y="317" width="40" height="4" rx="2" fill="#A78BFA" />
      </g>

      {/* Books and pencils, to give the desk a lived-in edge */}
      <g>
        <rect x="344" y="294" width="72" height="10" rx="3" fill="#8B5CF6" />
        <rect x="350" y="284" width="66" height="10" rx="3" fill="#C4B5FD" />
        <rect x="346" y="274" width="62" height="10" rx="3" fill="#A78BFA" />
      </g>
      <g>
        <path d="M84 292h32v26H84z" fill="#A78BFA" />
        <rect x="92" y="270" width="5" height="23" rx="2.5" fill="#F59E0B" />
        <rect x="102" y="276" width="5" height="17" rx="2.5" fill="#16A34A" />
      </g>
    </svg>
  );
}
