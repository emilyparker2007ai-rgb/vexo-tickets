// VEXO wordmark, drawn from geometry (no font): heavy upright letters, the O is a stadium
// bowl seen from above and the X weaves a white stroke over a celeste one.
const LETTERS = {
  V: '<path d="M0 0h27l15 64 15-64h27L55 100H29z"/>',
  E: '<path transform="translate(96 0)" d="M0 0h60v20H24v20h28v20H24v20h36v20H0z"/>',
  O: '<path fill-rule="evenodd" transform="translate(260 0)" d="M39 0a39 39 0 0 1 39 39v22a39 39 0 0 1-78 0v-22a39 39 0 0 1 39-39zM39 22a15 15 0 0 0-15 15v26a15 15 0 0 0 30 0v-26a15 15 0 0 0-15-15z"/>',
};

export function wordmark({ cls = 'wordmark', label = 'Vexo' } = {}) {
  return `<svg class="${cls}" viewBox="0 0 338 100" role="img" aria-label="${label}">
    <g fill="currentColor">${LETTERS.V}${LETTERS.E}${LETTERS.O}</g>
    <g class="wordmark__x" transform="translate(168 0)">
      <path class="wordmark__under" fill="#74acdf" d="M54 0h26L26 100H0z"/>
      <path class="wordmark__over" fill="currentColor" stroke="var(--wm-gap, #070a12)" stroke-width="5" paint-order="stroke" d="M0 0h26l54 100H54z"/>
    </g>
  </svg>`;
}
