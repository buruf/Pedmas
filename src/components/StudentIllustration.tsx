/**
 * Hero illustration: a student practising math at a laptop.
 *
 * Inline SVG on purpose — it stays crisp at every size, costs no extra
 * request, and keeps the homepage light on slow connections (spec §24).
 * Drawn from the brand palette so it matches the rest of the page.
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
      {/* Soft backdrop */}
      <circle cx="242" cy="196" r="168" fill="#ede9fe" />
      <circle cx="242" cy="196" r="128" fill="#f5f3ff" />

      {/* Floating math symbols */}
      <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="700" textAnchor="middle">
        <circle cx="86" cy="96" r="27" fill="#ddd6fe" />
        <text x="86" y="106" fontSize="26" fill="#6d28d9">×</text>

        <circle cx="396" cy="86" r="24" fill="#c4b5fd" />
        <text x="396" y="95" fontSize="24" fill="#4c1d95">÷</text>

        <circle cx="52" cy="212" r="21" fill="#c4b5fd" />
        <text x="52" y="221" fontSize="22" fill="#4c1d95">+</text>

        <circle cx="424" cy="198" r="25" fill="#ddd6fe" />
        <text x="424" y="208" fontSize="24" fill="#6d28d9">π</text>

        <circle cx="146" cy="44" r="20" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="2" />
        <text x="146" y="53" fontSize="20" fill="#6d28d9">√</text>
      </g>

      {/* Chair back */}
      <rect x="188" y="176" width="108" height="132" rx="22" fill="#a78bfa" />

      {/* Student */}
      <g>
        {/* Torso / hoodie */}
        <path
          d="M196 310v-58c0-26 20-46 46-46s46 20 46 46v58z"
          fill="#7c3aed"
        />
        {/* Hood collar */}
        <path d="M214 214c8 14 18 21 28 21s20-7 28-21c-8-6-17-9-28-9s-20 3-28 9z" fill="#6d28d9" />

        {/* Neck */}
        <rect x="230" y="176" width="24" height="26" rx="11" fill="#e8b088" />

        {/* Head */}
        <circle cx="242" cy="152" r="40" fill="#f3c9a8" />
        {/* Ear */}
        <circle cx="203" cy="156" r="7" fill="#e8b088" />
        {/* Hair */}
        <path
          d="M202 142c2-24 19-38 40-38s38 14 40 38c-6-4-10-11-12-17-8 10-24 16-44 13-9-1-16 0-24 4z"
          fill="#2f2a3d"
        />
        {/* Eyes, focused down at the screen */}
        <circle cx="230" cy="156" r="3.4" fill="#2f2a3d" />
        <circle cx="256" cy="156" r="3.4" fill="#2f2a3d" />
        {/* Smile */}
        <path d="M232 168c4 5 14 5 18 0" stroke="#2f2a3d" strokeWidth="2.6" strokeLinecap="round" fill="none" />

        {/* Arms reaching to the keyboard */}
        <path
          d="M200 258c-14 10-20 26-18 40l20 4c0-12 4-22 14-30z"
          fill="#6d28d9"
        />
        <path
          d="M284 258c14 10 20 26 18 40l-20 4c0-12-4-22-14-30z"
          fill="#6d28d9"
        />
        <circle cx="205" cy="302" r="9" fill="#f3c9a8" />
        <circle cx="279" cy="302" r="9" fill="#f3c9a8" />
      </g>

      {/* Desk */}
      <rect x="52" y="312" width="380" height="15" rx="7" fill="#c4b5fd" />
      <rect x="80" y="327" width="12" height="46" rx="6" fill="#ddd6fe" />
      <rect x="392" y="327" width="12" height="46" rx="6" fill="#ddd6fe" />

      {/* Laptop */}
      <g>
        <rect x="166" y="230" width="152" height="76" rx="8" fill="#4c1d95" />
        <rect x="173" y="237" width="138" height="62" rx="5" fill="#ffffff" />
        {/* An equation on screen */}
        <g fontFamily="ui-sans-serif, system-ui, sans-serif" textAnchor="middle">
          <text x="242" y="262" fontSize="19" fontWeight="700" fill="#4c1d95">1</text>
          <rect x="230" y="267" width="24" height="2.4" rx="1.2" fill="#4c1d95" />
          <text x="242" y="288" fontSize="19" fontWeight="700" fill="#4c1d95">2</text>
          <text x="200" y="277" fontSize="20" fontWeight="700" fill="#7c3aed">+</text>
          <text x="288" y="277" fontSize="20" fontWeight="700" fill="#7c3aed">?</text>
        </g>
        {/* Base */}
        <rect x="150" y="306" width="184" height="11" rx="5.5" fill="#6d28d9" />
        <rect x="222" y="309" width="40" height="4" rx="2" fill="#a78bfa" />
      </g>

      {/* Books beside the desk */}
      <g>
        <rect x="342" y="288" width="70" height="10" rx="3" fill="#8b5cf6" />
        <rect x="348" y="278" width="64" height="10" rx="3" fill="#c4b5fd" />
        <rect x="344" y="268" width="60" height="10" rx="3" fill="#a78bfa" />
      </g>

      {/* Pencil cup */}
      <g>
        <rect x="86" y="286" width="30" height="26" rx="5" fill="#a78bfa" />
        <rect x="94" y="266" width="5" height="22" rx="2.5" fill="#f59e0b" />
        <rect x="104" y="272" width="5" height="16" rx="2.5" fill="#16a34a" />
      </g>
    </svg>
  );
}
