/** UNA Mart — Tailwind theme extension
 *  Values match una-mart-tokens.css. Contrast ratios are noted where the
 *  choice is load-bearing.
 */

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#EEF3F8',
          100: '#D3E0EC',
          200: '#A7C0D8',
          400: '#3F6C99',
          600: '#1C4570',
          700: '#123354',
          800: '#0B2A4A',  // primary brand — 14.54:1 on white
          900: '#061B31',
        },
        coral: {
          50:  '#FFF0EB',
          100: '#FFD6C7',
          200: '#FFB59B',
          400: '#FF6B35',  // brand orange — background only
          500: '#F2551C',
          600: '#D94A1F',  // safest CTA fill with white text (large only)
          700: '#B23A15',  // 5.98:1 — orange text on light bg
          800: '#8A2C10',  // 8.58:1 — orange text, any size
        },
        neutral: {
          0:   '#FFFFFF',
          50:  '#F7F9FA',
          100: '#EDF1F4',
          200: '#DDE3E8',
          300: '#C3CCD4',
          400: '#93A0AB',  // decorative only
          500: '#6B7883',  // muted text floor — 4.53:1
          600: '#4C5760',
          700: '#333B42',
          800: '#1F252A',
          900: '#12171A',
        },
        success: { DEFAULT: '#0F7A46', bg: '#E6F4EC' },
        warning: { DEFAULT: '#8A5A00', bg: '#FFF6E0' },
        danger:  { DEFAULT: '#C0271F', bg: '#FDECEA' },
        info:    { DEFAULT: '#1C5FA8', bg: '#E8F1FB' },
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
    },
  },
  plugins: [],
};

/* Usage reference — the pairings that pass:
 *
 *   Primary button   bg-navy-800  text-white          14.54:1  AAA
 *   CTA button       bg-coral-400 text-navy-800        5.13:1  AA  (any size)
 *   CTA alt          bg-coral-600 text-white           4.24:1  AA  (18px+ only)
 *   Body text        text-neutral-800 on bg-white     15.48:1  AAA
 *   Secondary text   text-neutral-600 on bg-white      7.40:1  AAA
 *   Muted text       text-neutral-500 on bg-white      4.53:1  AA
 *   Sale badge       bg-coral-50  text-coral-800       8.19:1  AAA
 *   Price drop       text-danger  on bg-white          5.91:1  AA
 *   In stock         text-success on bg-white          5.39:1  AA
 *
 * The pairings that FAIL — do not ship these:
 *
 *   bg-coral-400 text-white                            2.84:1  ✗
 *   text-coral-400 on bg-white                         2.62:1  ✗
 *   text-neutral-400 on bg-white                       2.67:1  ✗
 */
