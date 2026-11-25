/* Glass backdrop — a wallpaper behind the Harness UI whose see-through level
 * and frosted-glass blur are adjusted by hand in Settings. */

window.__ModuleLoader__.load({
  id: 'dsh-glass-backdrop',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Plugin identity: also the token-layer source name. */
    const SOURCE = 'dsh-glass-backdrop'
    /** Root attribute that turns the whole effect on (CSS scopes under it). */
    const ROOT_ATTR = 'data-glass-backdrop'
    /** Root attribute naming the active wallpaper. */
    const WALLPAPER_ATTR = 'data-glass-wallpaper'
    /** Root attribute that enables the frosted-glass backdrop filter. */
    const GLASS_ATTR = 'data-glass-glass'
    /** Durable per-browser preference. */
    const STORAGE_KEY = 'dsh.glass-backdrop'
    /** Locale namespace owned by this plugin's settings page. */
    const NS = 'glass-backdrop'
    /** Wallpaper order: also the roving-focus order in the settings page. */
    const WALLPAPERS = ['dusk', 'aurora', 'abyss']
    /** Bounds of the two sliders. */
    const VISIBILITY_MIN = 0
    const VISIBILITY_MAX = 100
    const BLUR_MIN = 0
    const BLUR_MAX = 48
    /** First-run look: dusk wallpaper, mostly see-through, a soft frost. */
    const DEFAULTS = { enabled: true, wallpaper: 'dusk', visibility: 70, blur: 20 }

    /**
     * Surfaces made translucent, and how strongly each one follows the
     * visibility slider. The frame follows it most; raised layers keep a little
     * more body so text on cards stays comfortable; overlays keep the most.
     * @type {ReadonlyArray<readonly [string, number]>}
     */
    const SURFACES = [
      ['--dsw-alias-bg-base', 0.85],
      ['--dsw-specific-sidebar-fill', 0.80],
      ['--dsw-alias-bg-layer-1', 0.58],
      ['--dsw-alias-bg-layer-2', 0.46],
      ['--dsw-alias-bg-layer-3', 0.52],
      ['--dsw-alias-bg-module-platform', 0.56],
      ['--dsw-alias-bg-document-preview', 0.60],
      ['--dsw-alias-settings-card-fill', 0.48],
      ['--dsw-specific-input-major', 0.48],
      ['--dsw-alias-bg-overlay', 0.28],
    ]

    /** Copy for every locale the shell can ask for. */
    const COPY = {
      en: {
        'meta.title': 'Glass backdrop',
        'meta.description':
          'A wallpaper behind the Harness UI. Drag the sliders to set how much the background shows through and how soft the frosted glass is.',
        'section.label': 'Backdrop & glass',
        'enable.title': 'Glass backdrop',
        'enable.description':
          'Puts a wallpaper behind the interface and turns the panels into translucent frosted glass.',
        'enable.label': 'On',
        'wallpaper.title': 'Wallpaper',
        'wallpaper.description': 'The artwork behind the interface.',
        'wallpaper.dusk': 'Dusk',
        'wallpaper.aurora': 'Aurora',
        'wallpaper.abyss': 'Abyss',
        'visibility.title': 'Background visibility',
        'visibility.description':
          'How much of the wallpaper shows through the interface. Higher values look more transparent but soften text contrast.',
        'blur.title': 'Glass blur',
        'blur.description':
          'Frosting strength of the glass mask. At 0 the wallpaper stays crisp behind the panels.',
        'reset': 'Restore defaults',
      },
      zh: {
        'meta.title': '玻璃背景',
        'meta.description':
          '在 Harness 界面后方铺一层壁纸，并把面板变成半透明的磨砂玻璃；拖动滑块手动调节背景透出程度与玻璃模糊强度。',
        'section.label': '背景与玻璃',
        'enable.title': '玻璃背景',
        'enable.description': '在界面后方显示壁纸，面板变为半透明的磨砂玻璃。',
        'enable.label': '开启',
        'wallpaper.title': '壁纸',
        'wallpaper.description': '界面后方的画面。',
        'wallpaper.dusk': '暮色',
        'wallpaper.aurora': '极光',
        'wallpaper.abyss': '深海',
        'visibility.title': '背景可见度',
        'visibility.description':
          '背景透过界面的程度。数值越高越通透，但会降低文字对比度。',
        'blur.title': '玻璃模糊',
        'blur.description': '玻璃蒙版的磨砂强度；为 0 时壁纸在面板后保持清晰。',
        'reset': '恢复默认',
      },
    }

    /** Swatch colours shown in each wallpaper chip (dark-scheme anchors). */
    const SWATCHES = {
      dusk: ['#150420', '#FF5CA8', '#FF9A40'],
      aurora: ['#050B16', '#40FFD0', '#7E74FF'],
      abyss: ['#030814', '#288CFF', '#58E6D6'],
    }

    /* Wallpaper artwork: layered radial gradients so it stays sharp at any
     * resolution. Each wallpaper has a light and a dark variant; the scheme
     * switch is CSS-only (body[data-ds-dark-theme]). */
    const WALLPAPER_CSS = [
      // Base placement: the wallpaper is painted on the body and propagates to
      // the canvas, so it fills the viewport behind every panel.
      `html[${ROOT_ATTR}] body{background-attachment:fixed !important;background-position:center center !important;background-size:cover !important;background-repeat:no-repeat !important}`,

      // Dusk — violet night with a magenta/amber sunset low on the right.
      `html[${ROOT_ATTR}][${WALLPAPER_ATTR}="dusk"] body{background-image:radial-gradient(80% 64% at 88% 98%, rgba(255,120,180,.55) 0%, rgba(255,120,180,0) 60%),radial-gradient(58% 52% at 100% 112%, rgba(255,176,110,.50) 0%, rgba(255,176,110,0) 56%),radial-gradient(52% 46% at 6% 4%, rgba(120,205,255,.45) 0%, rgba(120,205,255,0) 60%),linear-gradient(162deg,#fdf8fc 0%,#f8f1fb 48%,#f3eafb 100%) !important}`,
      `html[${ROOT_ATTR}][${WALLPAPER_ATTR}="dusk"] body[data-ds-dark-theme]{background-image:radial-gradient(80% 64% at 88% 98%, rgba(255,92,168,.58) 0%, rgba(255,92,168,0) 60%),radial-gradient(58% 52% at 100% 112%, rgba(255,150,64,.48) 0%, rgba(255,150,64,0) 56%),radial-gradient(52% 46% at 6% 4%, rgba(88,230,214,.20) 0%, rgba(88,230,214,0) 60%),radial-gradient(120% 40% at 50% 78%, rgba(122,52,152,.45) 0%, rgba(122,52,152,0) 100%),linear-gradient(168deg,#12061f 0%,#1b0929 44%,#341040 100%) !important}`,

      // Aurora — cool night sky with teal and violet ribbons.
      `html[${ROOT_ATTR}][${WALLPAPER_ATTR}="aurora"] body{background-image:radial-gradient(62% 48% at 14% 18%, rgba(90,225,200,.50) 0%, rgba(90,225,200,0) 60%),radial-gradient(54% 56% at 82% 22%, rgba(150,130,255,.45) 0%, rgba(150,130,255,0) 60%),radial-gradient(64% 50% at 52% 102%, rgba(255,150,205,.38) 0%, rgba(255,150,205,0) 62%),linear-gradient(160deg,#f7fbfd 0%,#f2f7fc 52%,#f7f2fd 100%) !important}`,
      `html[${ROOT_ATTR}][${WALLPAPER_ATTR}="aurora"] body[data-ds-dark-theme]{background-image:radial-gradient(62% 48% at 14% 18%, rgba(64,255,208,.34) 0%, rgba(64,255,208,0) 60%),radial-gradient(54% 56% at 82% 22%, rgba(126,116,255,.44) 0%, rgba(126,116,255,0) 60%),radial-gradient(64% 50% at 52% 102%, rgba(255,92,168,.28) 0%, rgba(255,92,168,0) 62%),linear-gradient(160deg,#050b16 0%,#0a1424 52%,#141033 100%) !important}`,

      // Abyss — deep indigo water with a blue glow and cyan glints.
      `html[${ROOT_ATTR}][${WALLPAPER_ATTR}="abyss"] body{background-image:radial-gradient(64% 50% at 20% 86%, rgba(120,190,255,.55) 0%, rgba(120,190,255,0) 60%),radial-gradient(54% 44% at 90% 14%, rgba(110,230,225,.45) 0%, rgba(110,230,225,0) 58%),linear-gradient(170deg,#f6fafd 0%,#eef5fb 55%,#eaf2fb 100%) !important}`,
      `html[${ROOT_ATTR}][${WALLPAPER_ATTR}="abyss"] body[data-ds-dark-theme]{background-image:radial-gradient(64% 50% at 20% 86%, rgba(40,140,255,.42) 0%, rgba(40,140,255,0) 60%),radial-gradient(54% 44% at 90% 14%, rgba(88,230,214,.26) 0%, rgba(88,230,214,0) 58%),radial-gradient(80% 70% at 50% 50%, rgba(10,30,70,.35) 0%, rgba(10,30,70,0) 100%),linear-gradient(170deg,#040a18 0%,#071830 55%,#0a2036 100%) !important}`,

      // The glass mask: one backdrop filter on the app root blurs the whole
      // wallpaper at once, while the translucent token layer above it lets the
      // frosted image through every panel.
      `html[${ROOT_ATTR}][${GLASS_ATTR}] #root{-webkit-backdrop-filter:blur(var(--gb-blur,20px)) saturate(1.12);backdrop-filter:blur(var(--gb-blur,20px)) saturate(1.12)}`,

      // Dialogs sit above the app content, so they frost their own backdrop:
      // otherwise the page behind a translucent settings panel stays legible
      // enough to look like noise instead of glass.
      `html[${ROOT_ATTR}][${GLASS_ATTR}] [role="dialog"]{-webkit-backdrop-filter:blur(var(--gb-blur,20px)) saturate(1.08);backdrop-filter:blur(var(--gb-blur,20px)) saturate(1.08)}`,
    ].join('')

    /** Settings-page chrome, scoped under one prefix and matched to host rows. */
    const UI_CSS = [
      '.gb-page{display:flex;flex-direction:column;min-width:0}',
      '.gb-row{display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2);flex-wrap:wrap;min-width:0}',
      '.gb-row:last-of-type{border-bottom:0}',
      '.gb-text{display:flex;flex-direction:column;gap:4px;flex:1 1 240px;min-width:0}',
      '.gb-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}',
      '.gb-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px;max-width:58ch}',
      '.gb-controls{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-left:auto}',
      '.gb-group{display:flex;gap:2px;padding:3px;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l1)}',
      '.gb-option{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 9px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:20px;cursor:pointer;white-space:nowrap}',
      '.gb-option:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.gb-option[aria-checked="true"]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l3)}',
      '.gb-chip{display:inline-flex;width:15px;height:11px;border-radius:2px;overflow:hidden;box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l3);flex:none}',
      '.gb-chip i{display:block;flex:1;height:100%}',
      '.gb-switch{display:inline-flex;align-items:center;gap:8px;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:20px;cursor:pointer;white-space:nowrap}',
      '.gb-track{position:relative;display:block;width:32px;height:18px;border-radius:999px;background:var(--dsw-alias-bg-layer-3);box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l3);transition:background .16s cubic-bezier(.2,.8,.2,1)}',
      '.gb-switch[aria-checked="true"] .gb-track{background:var(--dsw-alias-state-business-primary)}',
      '.gb-thumb{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:999px;background:var(--dsw-alias-switch-thumb);transition:transform .16s cubic-bezier(.2,.8,.2,1),background .16s cubic-bezier(.2,.8,.2,1)}',
      '.gb-switch[aria-checked="true"] .gb-thumb{transform:translateX(14px);background:var(--dsw-alias-label-primary-foreground)}',
      '.gb-slider{display:flex;align-items:center;gap:12px}',
      '.gb-range{-webkit-appearance:none;appearance:none;width:172px;height:18px;margin:0;padding:0;background:transparent;cursor:pointer}',
      '.gb-range::-webkit-slider-runnable-track{height:4px;border-radius:999px;background:linear-gradient(to right,var(--dsw-alias-state-business-primary) 0 var(--gb-pct,0%),var(--dsw-alias-bg-layer-3) var(--gb-pct,0%) 100%);box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l3)}',
      '.gb-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;margin-top:-5px;border-radius:999px;background:var(--dsw-alias-switch-thumb);box-shadow:0 0 0 .5px var(--dsw-alias-border-l4),0 1px 2px #00000033;transition:transform .12s cubic-bezier(.2,.8,.2,1)}',
      '.gb-range:active::-webkit-slider-thumb{transform:scale(1.12)}',
      '.gb-value{min-width:46px;text-align:right;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;font-variant-numeric:tabular-nums}',
      '.gb-foot{display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:16px 0 8px}',
      '.gb-reset{height:30px;padding:0 12px;border-radius:var(--dsw-radius-md);border:.5px solid var(--dsw-alias-border-l3);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:20px;cursor:pointer;white-space:nowrap}',
      '.gb-reset:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.gb-page :focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}',
      '.gb-page.gb-off .gb-row{opacity:.45}',
      '.gb-page.gb-off .gb-row.gb-row-enable{opacity:1}',
      '.gb-page.gb-off .gb-row:not(.gb-row-enable){pointer-events:none}',
      '@media (prefers-reduced-motion: reduce){.gb-track,.gb-thumb,.gb-range::-webkit-slider-thumb{transition:none}}',
      '@media (max-width: 860px){.gb-controls{margin-left:0;width:100%}.gb-range{width:100%;min-width:120px}.gb-slider{width:100%}}',
    ].join('')

    /** Clamp a number into [min, max], falling back when it is not finite. */
    function clamp(value, min, max, fallback) {
      if (!Number.isFinite(value)) return fallback
      return Math.min(max, Math.max(min, value))
    }

    /** Read the stored preference; anything malformed falls back per field. */
    function readState() {
      const fallback = { ...DEFAULTS }
      let parsed
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw === null) return fallback
        parsed = JSON.parse(raw)
      } catch (error) {
        console.error('[glass-backdrop] stored preference unreadable; using defaults', error)
        return fallback
      }
      if (typeof parsed !== 'object' || parsed === null) return fallback
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : fallback.enabled,
        wallpaper: WALLPAPERS.includes(parsed.wallpaper) ? parsed.wallpaper : fallback.wallpaper,
        visibility: clamp(
          Math.round(Number(parsed.visibility)),
          VISIBILITY_MIN,
          VISIBILITY_MAX,
          fallback.visibility,
        ),
        blur: clamp(Math.round(Number(parsed.blur)), BLUR_MIN, BLUR_MAX, fallback.blur),
      }
    }

    /** Persist the preference; a browser that refuses storage keeps the live value. */
    function writeState(state) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (error) {
        console.error('[glass-backdrop] preference could not be saved', error)
      }
    }

    /**
     * One live preference store in the shape `React.useSyncExternalStore` reads.
     * Persistence is coalesced so dragging a slider does not write on every frame.
     * @returns the store
     */
    function createStore() {
      let state = readState()
      const listeners = new Set()
      let timer = 0
      const flush = () => {
        timer = 0
        writeState(state)
      }
      const source = {
        getSnapshot: () => state,
        subscribe: (listener) => {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
      }
      const set = (patch) => {
        const next = {
          enabled: patch.enabled === undefined ? state.enabled : Boolean(patch.enabled),
          wallpaper: WALLPAPERS.includes(patch.wallpaper) ? patch.wallpaper : state.wallpaper,
          visibility: clamp(
            Math.round(Number(patch.visibility === undefined ? state.visibility : patch.visibility)),
            VISIBILITY_MIN,
            VISIBILITY_MAX,
            state.visibility,
          ),
          blur: clamp(
            Math.round(Number(patch.blur === undefined ? state.blur : patch.blur)),
            BLUR_MIN,
            BLUR_MAX,
            state.blur,
          ),
        }
        if (
          next.enabled === state.enabled &&
          next.wallpaper === state.wallpaper &&
          next.visibility === state.visibility &&
          next.blur === state.blur
        ) {
          return
        }
        state = next
        if (timer === 0) timer = window.setTimeout(flush, 160)
        for (const listener of [...listeners]) listener()
      }
      return {
        source,
        get: () => state,
        set,
        /** Drop a pending write (plugin teardown). */
        dispose: () => {
          if (timer !== 0) {
            window.clearTimeout(timer)
            timer = 0
            writeState(state)
          }
        },
      }
    }

    /**
     * Parse a CSS colour produced by the theme layer.
     * @param {string} input - hex or rgb()/rgba() text
     * @returns {[number, number, number, number] | null} r, g, b, a
     */
    function parseColor(input) {
      if (typeof input !== 'string') return null
      const value = input.trim()
      if (value === '') return null
      if (value.startsWith('#')) {
        let hex = value.slice(1)
        if (hex.length === 3 || hex.length === 4) {
          hex = hex
            .split('')
            .map((part) => part + part)
            .join('')
        }
        if (hex.length !== 6 && hex.length !== 8) return null
        const r = Number.parseInt(hex.slice(0, 2), 16)
        const g = Number.parseInt(hex.slice(2, 4), 16)
        const b = Number.parseInt(hex.slice(4, 6), 16)
        const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1
        if (![r, g, b, a].every(Number.isFinite)) return null
        return [r, g, b, a]
      }
      const match = /^rgba?\(([^)]*)\)$/i.exec(value)
      if (match === null) return null
      const parts = match[1]
        .split(/[\s,/]+/)
        .filter(Boolean)
        .map(Number)
      if (parts.length < 3 || parts.slice(0, 3).some((part) => !Number.isFinite(part))) return null
      const a = parts.length > 3 && Number.isFinite(parts[3]) ? parts[3] : 1
      return [parts[0], parts[1], parts[2], a]
    }

    /** Compose one rgba() value for a surface from its base colour and the slider. */
    function translucent(base, visibility, weight) {
      const alpha = Math.max(0.18, 1 - (visibility / 100) * weight) * base[3]
      return `rgba(${base[0]}, ${base[1]}, ${base[2]}, ${Number(alpha.toFixed(3))})`
    }

    /**
     * Mount one plugin-owned stylesheet and return its remover.
     * @param {object} ctx - client root context
     * @param {string} css - stylesheet text
     * @param {string} name - tag identity for the devtools stylesheet list
     * @returns {() => void} remover
     */
    function mountStyle(ctx, css, name) {
      return ctx.effect(() => {
        const tag = document.createElement('style')
        tag.dataset.plugin = SOURCE
        tag.dataset.pluginCss = `${SOURCE}/${name}`
        tag.textContent = css
        document.head.appendChild(tag)
        return () => {
          tag.remove()
        }
      }, `glass-backdrop: ${name}`)
    }

    /**
     * Settings page: the on/off switch, the wallpaper picker, and the two
     * sliders. Every change lands in the store; the token layer follows it.
     * @param {object} props - injected face plus the slot's own props
     * @returns {object} the page element
     */
    function GlassBackdropSection(props) {
      const state = React.useSyncExternalStore(props.source.subscribe, props.source.getSnapshot)
      const t = props.t ?? props.translate
      const set = props.set
      const optionRefs = React.useRef({})
      const on = state.enabled

      const moveWallpaper = (event) => {
        const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']
        if (!keys.includes(event.key)) return
        event.preventDefault()
        const index = WALLPAPERS.indexOf(state.wallpaper)
        const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
        const nextIndex =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? WALLPAPERS.length - 1
              : (index + step + WALLPAPERS.length) % WALLPAPERS.length
        const next = WALLPAPERS[nextIndex]
        set({ wallpaper: next })
        const node = optionRefs.current[next]
        if (node !== undefined) node.focus()
      }

      const row = (key, titleKey, descriptionKey, control, extra) =>
        h(
          'div',
          { key, className: `gb-row${extra === undefined ? '' : ` ${extra}`}` },
          h(
            'div',
            { className: 'gb-text' },
            h('div', { className: 'gb-title' }, t(`${titleKey}.title`)),
            h('div', { className: 'gb-desc' }, t(`${descriptionKey}.description`)),
          ),
          h('div', { className: 'gb-controls' }, control),
        )

      const slider = (key, titleKey, value, min, max, suffix, unit, onChange) =>
        row(
          key,
          titleKey,
          titleKey,
          h(
            'div',
            { className: 'gb-slider' },
            h('input', {
              type: 'range',
              className: 'gb-range',
              min,
              max,
              step: 1,
              value,
              'aria-label': t(`${titleKey}.title`),
              style: { '--gb-pct': `${((value - min) / (max - min)) * 100}%` },
              onChange: (event) => onChange(Number(event.target.value)),
            }),
            h('span', { className: 'gb-value' }, `${value}${suffix}${unit}`),
          ),
        )

      return h(
        'div',
        { className: `gb-page${on ? '' : ' gb-off'}` },
        row(
          'enable',
          'enable',
          'enable',
          h(
            'button',
            {
              type: 'button',
              role: 'switch',
              'aria-checked': on,
              className: 'gb-switch',
              onClick: () => set({ enabled: !on }),
            },
            h('span', { className: 'gb-track' }, h('span', { className: 'gb-thumb' })),
            h('span', null, t('enable.label')),
          ),
          'gb-row-enable',
        ),
        row(
          'wallpaper',
          'wallpaper',
          'wallpaper',
          h(
            'div',
            { className: 'gb-group', role: 'radiogroup', 'aria-label': t('wallpaper.title'), onKeyDown: moveWallpaper },
            WALLPAPERS.map((id) => {
              const checked = state.wallpaper === id
              return h(
                'button',
                {
                  key: id,
                  type: 'button',
                  role: 'radio',
                  'aria-checked': checked,
                  tabIndex: checked ? 0 : -1,
                  className: 'gb-option',
                  ref: (node) => {
                    optionRefs.current[id] = node
                  },
                  onClick: () => set({ wallpaper: id }),
                },
                h(
                  'span',
                  { className: 'gb-chip', 'aria-hidden': 'true' },
                  SWATCHES[id].map((stop, index) => h('i', { key: index, style: { background: stop } })),
                ),
                t(`wallpaper.${id}`),
              )
            }),
          ),
        ),
        slider('visibility', 'visibility', state.visibility, VISIBILITY_MIN, VISIBILITY_MAX, '', '%', (value) =>
          set({ visibility: value }),
        ),
        slider('blur', 'blur', state.blur, BLUR_MIN, BLUR_MAX, '', 'px', (value) => set({ blur: value })),
        h(
          'div',
          { className: 'gb-foot' },
          h(
            'button',
            {
              type: 'button',
              className: 'gb-reset',
              onClick: () => set({ ...DEFAULTS }),
            },
            t('reset'),
          ),
        ),
      )
    }

    /** Client plugin: owns the wallpaper stylesheet, the token layer and the settings page. */
    return {
      inject: ['slots', 'theme', 'locale'],
      /**
       * Apply the backdrop and mount its controls.
       * @param {object} ctx - client root context
       */
      apply(ctx) {
        for (const [locale, dict] of Object.entries(COPY)) {
          ctx.effect(() => ctx.locale.register(NS, locale, dict), `glass-backdrop: ${locale} copy`)
        }
        mountStyle(ctx, WALLPAPER_CSS, 'wallpaper.css')
        mountStyle(ctx, UI_CSS, 'settings.css')

        const store = createStore()
        const root = document.documentElement

        /** Base surface colours, resolved once per colour scheme. */
        const baseCache = Object.create(null)
        let layerDispose = null
        let painting = false
        let frame = 0

        /**
         * Resolve the theme's current colour for every translucent surface.
         * The override layer is retracted first so the reads see the theme, not
         * this plugin's own values. A registered theme carries its alias colours
         * in the snapshot, so that is the authority; the built-in palettes keep
         * them in the base stylesheet, so the computed style is the fallback.
         * @param {string} scheme - active colour scheme
         * @returns {Record<string, number[]>} token name to r/g/b/a
         */
        const readBase = (scheme) => {
          if (layerDispose !== null) {
            const dispose = layerDispose
            layerDispose = null
            dispose()
          }
          const snapshot = ctx.theme.getTheme()
          const tokens = snapshot.active.tokens ?? {}
          const computed = getComputedStyle(document.body)
          const colors = {}
          for (const [name] of SURFACES) {
            const declared = tokens[name]
            let parsed = typeof declared === 'string' ? parseColor(declared) : null
            if (parsed === null) parsed = parseColor(computed.getPropertyValue(name))
            if (parsed !== null) colors[name] = parsed
          }
          baseCache[scheme] = colors
          return colors
        }

        /** Compose the override layer for the current state and colour scheme. */
        const composeLayer = (state, scheme) => {
          const active = baseCache[scheme] ?? readBase(scheme)
          const tokens = {}
          for (const [name, weight] of SURFACES) {
            const base = active[name]
            if (base === undefined) continue
            const lightBase = scheme === 'light' ? base : baseCache.light?.[name]
            const darkBase = scheme === 'dark' ? base : baseCache.dark?.[name]
            if (lightBase === undefined || darkBase === undefined) {
              // A scheme that has never been on screen: use this one for both
              // so the layer is always complete; the next theme/change fixes it.
              tokens[name] = {
                light: translucent(base, state.visibility, weight),
                dark: translucent(base, state.visibility, weight),
              }
              continue
            }
            tokens[name] = {
              light: translucent(lightBase, state.visibility, weight),
              dark: translucent(darkBase, state.visibility, weight),
            }
          }
          return tokens
        }

        /**
         * Project the current preference onto the document: root attributes,
         * the blur variable, and the translucent token layer.
         * @param {boolean} forceBase - re-read the theme colours (scheme/theme changed)
         */
        const paint = (forceBase) => {
          if (painting) return
          painting = true
          try {
            const state = store.get()
            const live = state.enabled && state.visibility > 0
            if (!live) {
              if (layerDispose !== null) {
                const dispose = layerDispose
                layerDispose = null
                dispose()
              }
              root.removeAttribute(ROOT_ATTR)
              root.removeAttribute(WALLPAPER_ATTR)
              root.removeAttribute(GLASS_ATTR)
              return
            }
            root.setAttribute(ROOT_ATTR, '')
            root.setAttribute(WALLPAPER_ATTR, state.wallpaper)
            if (state.blur > 0) {
              root.setAttribute(GLASS_ATTR, '')
              root.style.setProperty('--gb-blur', `${state.blur}px`)
            } else {
              root.removeAttribute(GLASS_ATTR)
              root.style.setProperty('--gb-blur', '0px')
            }
            const theme = ctx.theme.getTheme()
            const scheme = theme.active.colorScheme
            if (forceBase || baseCache[scheme] === undefined) readBase(scheme)
            layerDispose = ctx.theme.overrideTokens(SOURCE, composeLayer(state, scheme))
          } finally {
            painting = false
          }
        }

        const schedule = () => {
          if (frame !== 0) return
          frame = window.requestAnimationFrame(() => {
            frame = 0
            paint(false)
          })
        }

        ctx.effect(() => {
          paint(true)
          const offStore = store.source.subscribe(schedule)
          const offTheme = ctx.on('theme/change', () => {
            if (painting) return
            // A theme or colour-scheme switch changes the colours under the
            // surfaces: resolve them again on the next frame.
            for (const key of Object.keys(baseCache)) delete baseCache[key]
            schedule()
          })
          return () => {
            offStore()
            offTheme()
            if (frame !== 0) window.cancelAnimationFrame(frame)
            if (layerDispose !== null) {
              const dispose = layerDispose
              layerDispose = null
              dispose()
            }
            root.removeAttribute(ROOT_ATTR)
            root.removeAttribute(WALLPAPER_ATTR)
            root.removeAttribute(GLASS_ATTR)
            root.style.removeProperty('--gb-blur')
            store.dispose()
          }
        }, 'glass-backdrop: token layer')

        ctx.slots.inject('settings.section', () =>
          ctx.slots.register(
            {
              name: 'settings.section',
              id: 'glass-backdrop',
              order: 5,
              label: () => ctx.locale.bind(NS)('section.label'),
              locale: NS,
              inject: () => ({
                source: store.source,
                set: (patch) => store.set(patch),
                translate: ctx.locale.bind(NS),
              }),
            },
            GlassBackdropSection,
          ),
        )
      },
    }
  },
})
