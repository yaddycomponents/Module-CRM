class StatsWidget extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._clickCount = 0
  }

  static get observedAttributes() {
    return ['title', 'value', 'subtitle', 'color', 'icon']
  }

  connectedCallback() {
    this.render()
    this.addEventListeners()
  }

  attributeChangedCallback() {
    this.render()
  }

  addEventListeners() {
    this.shadowRoot.querySelector('.stats-card').addEventListener('click', () => {
      this._clickCount++
      this.dispatchEvent(new CustomEvent('stats-click', {
        bubbles: true,
        composed: true,
        detail: {
          title: this.getAttribute('title'),
          value: this.getAttribute('value'),
          clickCount: this._clickCount,
        },
      }))
      this.animateClick()
    })
  }

  animateClick() {
    const card = this.shadowRoot.querySelector('.stats-card')
    card.classList.add('clicked')
    setTimeout(() => card.classList.remove('clicked'), 200)
  }

  getIcon() {
    const icon = this.getAttribute('icon') || 'chart'
    const icons = {
      chart: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v8H3v-8zm6-6h2v14H9V7zm6 3h2v11h-2V10zm6-7h2v18h-2V3z"/></svg>`,
      money: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg>`,
      users: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
      trending: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>`,
    }
    return icons[icon] || icons.chart
  }

  render() {
    const title = this.getAttribute('title') || 'Stat'
    const value = this.getAttribute('value') || '0'
    const subtitle = this.getAttribute('subtitle') || ''
    const color = this.getAttribute('color') || '#6366f1'

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .stats-card {
          background: linear-gradient(135deg, ${color}15 0%, ${color}05 100%);
          border: 1px solid ${color}30;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stats-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: ${color};
        }

        .stats-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px ${color}20;
          border-color: ${color}50;
        }

        .stats-card.clicked {
          transform: scale(0.98);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .title {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .icon {
          width: 32px;
          height: 32px;
          background: ${color};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .icon svg {
          width: 18px;
          height: 18px;
        }

        .value {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
          background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 12px;
          color: #94a3b8;
        }

        .click-indicator {
          position: absolute;
          bottom: 8px;
          right: 12px;
          font-size: 10px;
          color: ${color};
          opacity: 0.6;
        }

        .pulse {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 8px;
          height: 8px;
          background: ${color};
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>

      <div class="stats-card">
        <div class="pulse"></div>
        <div class="header">
          <span class="title">${title}</span>
          <div class="icon">${this.getIcon()}</div>
        </div>
        <div class="value">${value}</div>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
        <div class="click-indicator">Click for details</div>
      </div>
    `
  }
}

customElements.define('stats-widget', StatsWidget)

export default StatsWidget
