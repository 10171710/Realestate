const fs = require('fs');
const path = require('path');
const out = path.join(__dirname);

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// palettes (sky1, sky2, accent, house body, roof, glass, ground)
const scenes = [
  { sky: ['#f6e6d4', '#e9d3b5'], accent: '#c96f4a', body: '#f5f0e8', roof: '#8a5a3b', glass: '#7fb4c9', ground: '#d9c9a8', tree: ['#7aa35c', '#53763c'], tag: '#fff7ec', tagText: '#6b4a2f' },
  { sky: ['#dcefe4', '#bcdccb'], accent: '#2f7d5d', body: '#fbf6ee', roof: '#5d6e6a', glass: '#9cc3d8', ground: '#c9d9b8', tree: ['#6f9a53', '#4e7a3c'], tag: '#122', tagText: '#f5f0e8' },
  { sky: ['#f3dccf', '#e5c1ad'], accent: '#b4572e', body: '#f7f1e9', roof: '#6e4f3a', glass: '#8fb7cb', ground: '#d4bfa2', tree: ['#75924f', '#56733c'], tag: '#fff7ec', tagText: '#6b4a2f' },
  { sky: ['#e7e3d8', '#d0ccbd'], accent: '#8a8575', body: '#f3efe6', roof: '#4f5d57', glass: '#aac2ce', ground: '#bfc9a9', tree: ['#66894d', '#48703a'], tag: '#fffaf3', tagText: '#5c5244' }
];

function houseSVG(s, w, h, label, sub) {
  const sky = `linear-gradient(180deg, ${s.sky[0]} 0%, ${s.sky[1]} 55%, ${s.ground} 55%, ${s.ground} 100%)`;
  const cx = w / 2, g = h * 0.55;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">
  <rect width="${w}" height="${h}" rx="24" fill="url(#sky)"/>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${s.sky[0]}"/><stop offset="0.55" stop-color="${s.sky[1]}"/>
      <stop offset="0.58" stop-color="${s.ground}"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="1" stop-color="${s.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${w*0.16}" cy="${h*0.16}" r="${w*0.13}" fill="url(#sun)"/>
  <circle cx="${w*0.84}" cy="${h*0.18}" r="${Math.max(10, w*0.02)}" fill="#ffffff" opacity="0.7"/>
  <circle cx="${w*0.9}" cy="${h*0.08}" r="${Math.max(6, w*0.012)}" fill="#ffffff" opacity="0.6"/>
  <rect x="0" y="${g}" width="${w}" height="${h-g}" fill="${s.ground}" opacity="0.9"/>
  <text x="${w*0.08}" y="${g+h*0.09}" font-size="${Math.round(w*0.035)}" font-weight="700" fill="${s.tagText}" opacity="0.55">${esc(sub)}</text>
  <ellipse cx="${w*0.5}" cy="${g+10}" rx="${w*0.34}" ry="${w*0.05}" fill="#00000022"/>
  <g>
    <polygon points="${cx-w*0.16},${g-h*0.16} ${cx},${g-h*0.30} ${cx+w*0.16},${g-h*0.16}" fill="${s.roof}"/>
    <rect x="${cx-w*0.15}" y="${g-h*0.16}" width="${w*0.30}" height="${h*0.30}" rx="6" fill="${s.body}"/>
    <rect x="${cx-w*0.055}" y="${g-h*0.10}" width="${w*0.05}" height="${h*0.10}" rx="3" fill="${s.glass}"/>
    <rect x="${cx+w*0.02}" y="${g-h*0.10}" width="${w*0.05}" height="${h*0.10}" rx="3" fill="${s.glass}"/>
    <rect x="${cx-w*0.025}" y="${g+h*0.10}" width="${w*0.05}" height="${h*0.08}" rx="2" fill="${s.accent}"/>
    <path d="M ${cx-w*0.05} ${g} L ${cx+w*0.05} ${g} L ${cx+w*0.05} ${g+h*0.10} L ${cx-w*0.05} ${g+h*0.10} Z" fill="${s.accent}" opacity="0.85"/>
    <rect x="${cx-w*0.14}" y="${g-h*0.16}" width="${w*0.12}" height="${h*0.05}" fill="${s.body}" opacity="0.9"/>
    <rect x="${cx+w*0.02}" y="${g-h*0.16}" width="${w*0.12}" height="${h*0.05}" fill="${s.body}" opacity="0.9"/>
  </g>
  <g>
    <rect x="${cx-w*0.34}" y="${g-h*0.03}" width="${w*0.055}" height="${h*0.16}" rx="3" fill="${s.tree[1]}"/>
    <circle cx="${cx-w*0.31}" cy="${g-h*0.09}" r="${w*0.06}" fill="${s.tree[0]}"/>
    <circle cx="${cx-w*0.38}" cy="${g-h*0.05}" r="${w*0.045}" fill="${s.tree[0]}" opacity="0.8"/>
  </g>
  <g>
    <rect x="${cx+w*0.28}" y="${g-h*0.03}" width="${w*0.055}" height="${h*0.16}" rx="3" fill="${s.tree[1]}"/>
    <circle cx="${cx+w*0.31}" cy="${g-h*0.09}" r="${w*0.06}" fill="${s.tree[0]}"/>
    <circle cx="${cx+w*0.38}" cy="${g-h*0.05}" r="${w*0.045}" fill="${s.tree[0]}" opacity="0.8"/>
  </g>
</svg>`;
}

function flatSVG(s, w, h, label, sub) {
  const sky = `linear-gradient(180deg, ${s.sky[0]} 0%, ${s.sky[1]} 55%, ${s.ground} 55%, ${s.ground} 100%)`;
  const g = h * 0.58, bw = w * 0.5, bh = h * 0.34, bx = (w - bw) / 2, by = g - bh;
  const floors = [
    ['#f4ede2', '#c9a06a'],
    ['#efe6d8', '#a97f55'],
    ['#f7f1e6', '#8a5a3b']
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">
  <defs>
    <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${s.sky[0]}"/><stop offset="0.55" stop-color="${s.sky[1]}"/>
      <stop offset="0.58" stop-color="${s.ground}"/>
    </linearGradient>
    <radialGradient id="sun2" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="1" stop-color="${s.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="24" fill="url(#sky2)"/>
  <circle cx="${w*0.84}" cy="${h*0.16}" r="${w*0.13}" fill="url(#sun2)"/>
  <text x="${w*0.08}" y="${g+h*0.09}" font-size="${Math.round(w*0.035)}" font-weight="700" fill="${s.tagText}" opacity="0.55">${esc(sub)}</text>
  <ellipse cx="${w*0.5}" cy="${g+12}" rx="${w*0.42}" ry="${w*0.055}" fill="#00000022"/>
  <rect x="0" y="${g}" width="${w}" height="${h-g}" fill="${s.ground}" opacity="0.9"/>
  <g>
    <rect x="${bx-8}" y="${by-8}" width="${bw+16}" height="${bh+8}" rx="6" fill="${floors[2][1]}" opacity="0.35"/>
    ${floors.map((f, i) => {
      const fy = by + i * (bh / 3);
      const fh = bh / 3;
      let wins = '';
      for (let k = 0; k < 3; k++) {
        wins += `<rect x="${bx + 12 + k*((bw-36)/3)}" y="${fy + 8}" width="${(bw-36)/3 - 8}" height="${fh - 16}" rx="3" fill="${s.glass}"/>`;
      }
      return `<g><rect x="${bx}" y="${fy}" width="${bw}" height="${fh}" rx="4" fill="${f[0]}"/><rect x="${bx}" y="${fy+4}" width="${bw}" height="4" fill="${f[1]}" opacity="0.8"/>${wins}</g>`;
    }).join('')}
  </g>
  <g>
    ${[0,1,2].map(i => {
      const fy = by + i * (bh/3);
      const dx = i*10;
      return `<rect x="${bx-8-dx}" y="${by+6+dx}" width="7" height="${bh-10-dx*0}" rx="2" fill="${s.tree[1]}"/><circle cx="${bx-4-dx}" cy="${by-2+dx}" r="13" fill="${s.tree[0]}"/>`;
    }).join('')}
  </g>
</svg>`;
}

function officeSVG(s, w, h, label, sub) {
  const avatars = '#c9a06a', glass = '#8fb7cb', glass2 = '#6fa0bc';
  const g = h * 0.6, bw = w * 0.42, bh = h * 0.40, bx = (w - bw) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">
  <defs>
    <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${s.sky[0]}"/><stop offset="0.55" stop-color="${s.sky[1]}"/>
      <stop offset="0.58" stop-color="${s.ground}"/>
    </linearGradient>
    <radialGradient id="sun3" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="1" stop-color="${s.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="24" fill="url(#sky3)"/>
  <circle cx="${w*0.16}" cy="${h*0.16}" r="${w*0.13}" fill="url(#sun3)"/>
  <text x="${w*0.08}" y="${g+h*0.09}" font-size="${Math.round(w*0.035)}" font-weight="700" fill="${s.tagText}" opacity="0.55">${esc(sub)}</text>
  <ellipse cx="${w*0.5}" cy="${g+12}" rx="${w*0.42}" ry="${w*0.055}" fill="#00000022"/>
  <rect x="0" y="${g}" width="${w}" height="${h-g}" fill="${s.ground}" opacity="0.9"/>
  <rect x="${bx}" y="${g-bh}" width="${bw}" height="${bh}" rx="6" fill="${s.body}"/>
  <rect x="${bx}" y="${g-bh}" width="${bw}" height="16" rx="6" fill="${s.roof}"/>
  <g>
    ${[0,1].map(col => [0,1,2,3].map(row => {
      const wx = bx + 14 + col*((bw-36)/2), wy = g-bh+28 + row*((bh-48)/4);
      const ww = (bw-36)/2 - 10, wh = (bh-48)/4 - 10;
      return `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="3" fill="${row%2 ? glass : glass2}"/>`;
    }).join('')).join('')}
  </g>
  <rect x="${bx+bw/2-9}" y="${g-24}" width="18" height="24" rx="2" fill="${s.accent}"/>
</svg>`;
}

function landSVG(s, w, h, label, sub) {
  const g = h * 0.68;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">
  <defs>
    <linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${s.sky[0]}"/><stop offset="0.5" stop-color="${s.sky[1]}"/>
      <stop offset="0.52" stop-color="${s.ground}"/>
    </linearGradient>
    <radialGradient id="sun4" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="1" stop-color="${s.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="24" fill="url(#sky4)"/>
  <circle cx="${w*0.8}" cy="${h*0.18}" r="${w*0.13}" fill="url(#sun4)"/>
  <text x="${w*0.08}" y="${g+h*0.16}" font-size="${Math.round(w*0.035)}" font-weight="700" fill="${s.tagText}" opacity="0.55">${esc(sub)}</text>
  <rect x="${w*0.06}" y="${g}" width="${w*0.88}" height="${h*0.16}" rx="8" fill="${s.tag}" opacity="0.9"/>
  <path d="M ${w*0.06} ${g+8} L ${w*0.94} ${g+8}" stroke="${s.accent}" stroke-width="2" stroke-dasharray="10 7" fill="none" opacity="0.6"/>
  <rect x="${w*0.14}" y="${g+h*0.02}" width="${w*0.5}" height="${h*0.07}" rx="4" fill="${s.accent}" opacity="0.14"/>
  <rect x="${w*0.06}" y="${g-6}" width="${w*0.88}" height="6" fill="${s.accent}" opacity="0.7"/>
  ${[0,1,2].map(i => `<rect x="${w*(0.18+i*0.24)}" y="${g-h*0.03}" width="3" height="${h*0.14}" fill="${s.tree[1]}"/><circle cx="${w*(0.18+i*0.24)+2}" cy="${g-h*0.08}" r="${w*0.045}" fill="${s.tree[0]}"/>`).join('')}
</svg>`;
}

function storySVG(s, w, h, label, sub) {
  // interior-like illustration with arch window
  const g = h * 0.72;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">
  <defs>
    <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${s.sky[0]}"/><stop offset="0.55" stop-color="${s.sky[1]}"/>
      <stop offset="0.58" stop-color="${s.ground}"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="1" stop-color="${s.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="24" fill="url(#sk)"/>
  <circle cx="${w*0.15}" cy="${h*0.15}" r="${w*0.13}" fill="url(#sun)"/>
  <text x="${w*0.08}" y="${g+h*0.13}" font-size="${Math.round(w*0.035)}" font-weight="700" fill="${s.tagText}" opacity="0.55">${esc(sub)}</text>
  <ellipse cx="${w*0.5}" cy="${g+12}" rx="${w*0.4}" ry="${w*0.05}" fill="#00000022"/>
  <rect x="0" y="${g}" width="${w}" height="${h-g}" fill="${s.ground}" opacity="0.9"/>
  <g>
    <rect x="${w*0.3}" y="${g-h*0.3}" width="${w*0.4}" height="${h*0.3}" rx="8" fill="${s.body}"/>
    <path d="M ${w*0.3} ${g-h*0.3} L ${w*0.5} ${g-h*0.44} L ${w*0.7} ${g-h*0.3}" fill="${s.roof}"/>
    <rect x="${w*0.46}" y="${g-h*0.22}" width="${w*0.08}" height="${w*0.08}" rx="2" fill="${s.glass}"/>
    <rect x="${w*0.46}" y="${g-h*0.12}" width="${w*0.08}" height="${h*0.06}" rx="2" fill="${s.accent}"/>
  </g>
  <g>
    <rect x="${w*0.16}" y="${g-h*0.02}" width="${w*0.06}" height="${h*0.14}" rx="3" fill="${s.tree[1]}"/>
    <circle cx="${w*0.19}" cy="${g-h*0.08}" r="${w*0.065}" fill="${s.tree[0]}"/>
  </g>
  <g>
    <rect x="${w*0.78}" y="${g-h*0.02}" width="${w*0.06}" height="${h*0.14}" rx="3" fill="${s.tree[1]}"/>
    <circle cx="${w*0.81}" cy="${g-h*0.08}" r="${w*0.065}" fill="${s.tree[0]}"/>
  </g>
</svg>`;
}

function avatarSVG(name, initials, bg, fg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" font-family="Arial, Helvetica, sans-serif">
  <defs><radialGradient id="av" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="${fg}" stop-opacity="0.85"/><stop offset="1" stop-color="${bg}"/></radialGradient></defs>
  <rect width="96" height="96" rx="48" fill="url(#av)"/>
  <circle cx="48" cy="36" r="18" fill="${fg}" opacity="0.9"/>
  <path d="M48 57c-16 0-24 11-24 22v17h48V79c0-11-8-22-24-22z" fill="${fg}" opacity="0.9"/>
  <text x="48" y="86" font-size="14" font-weight="700" text-anchor="middle" fill="${bg}" opacity="0.85">${initials}</text>
</svg>`;
}

function blogSVG(s, w, h, label, sub) {
  const g = h * 0.68;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">
  <defs>
    <linearGradient id="bk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${s.sky[0]}"/><stop offset="0.5" stop-color="${s.sky[1]}"/>
      <stop offset="0.52" stop-color="${s.ground}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="24" fill="url(#bk)"/>
  <circle cx="${w*0.84}" cy="${h*0.16}" r="${w*0.09}" fill="#ffffff" opacity="0.55"/>
  <rect x="${w*0.08}" y="${g}" width="${w*0.84}" height="${h*0.1}" rx="6" fill="${s.tag}" opacity="0.95"/>
  <text x="${w*0.12}" y="${g+h*0.068}" font-size="${Math.round(w*0.028)}" font-weight="700" fill="${s.tagText}" opacity="0.8">${esc(sub)}</text>
  <rect x="${w*0.08}" y="${g-h*0.05}" width="${w*0.84}" height="6" fill="${s.accent}" opacity="0.7"/>
  ${[0,1].map(i => `<rect x="${w*(0.12+i*0.28)}" y="${g-h*0.04}" width="3" height="${h*0.045}" fill="${s.tree[1]}"/><circle cx="${w*(0.12+i*0.28)+2}" cy="${g-h*0.05}" r="${w*0.035}" fill="${s.tree[0]}"/>`).join('')}
</svg>`;
}

function heroPanorama(s, w, h) {
  const g = h * 0.75;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">
  <defs>
    <linearGradient id="hk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${s.sky[0]}"/><stop offset="0.5" stop-color="${s.sky[1]}"/>
      <stop offset="0.52" stop-color="${s.ground}"/>
    </linearGradient>
    <radialGradient id="hs" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="1" stop-color="${s.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#hk)"/>
  <circle cx="${w*0.12}" cy="${h*0.18}" r="${w*0.11}" fill="url(#hs)"/>
  ${[0,1,2,3,4,5].map(i => {
    const x = w * (0.06 + i * 0.17);
    const bw = w * 0.12, bh = h * (0.16 + (i%3)*0.05);
    return `<g><rect x="${x}" y="${g-bh}" width="${bw}" height="${bh}" rx="6" fill="${['#f4ede2','#efe6d8','#f7f1e6'][i%3]}"/><rect x="${x}" y="${g-bh}" width="${bw}" height="${bw*0.14}" rx="6" fill="${s.accent}"/><rect x="${x+6}" y="${g-bh+bw*0.20}" width="${bw*0.2}" height="${bh*0.25}" rx="2" fill="${s.glass}"/><rect x="${x+bw-6-bw*0.2}" y="${g-bh+bw*0.20}" width="${bw*0.2}" height="${bh*0.25}" rx="2" fill="${s.glass}"/></g>`;
  }).join('')}
  <rect x="0" y="${g}" width="${w}" height="${h-g}" fill="${s.ground}" opacity="0.9"/>
</svg>`;
}

const P = (id, h, label, sub) => {
  const s = scenes[id % scenes.length];
  const types = [houseSVG, flatSVG, officeSVG, landSVG];
  return types[id % types.length](s, 800, 560, label, sub);
};

const props = [
  ['hero-1.png', p => heroPanorama(scenes[0], 1200, 800), 0],
  ['property-1.png', p => P(0, p, 'Alder Ridge', 'Modern Family Home')],
  ['property-2.png', p => P(1, p, 'Harbor Lofts', 'City Apartment')],
  ['property-3.png', p => P(2, p, 'Olive Grove Villa', 'Private Villa')],
  ['property-4.png', p => P(3, p, 'Meridian Tower', 'Commercial Office')],
  ['property-5.png', p => P(4, p, 'Willow Fields', 'Land & Lot')],
  ['property-6.png', p => P(5, p, 'BrickStone Row', 'Townhouse')],
  ['listing-1.png', p => P(6, p, '16 Cedar Lane', '4 Bed · 2.5 Bath')],
  ['listing-2.png', p => P(7, p, '220 Harbor View', '2 Bed · 2 Bath')],
  ['listing-3.png', p => P(8, p, '9 Olive Grove Rd', '5 Bed · 4 Bath')],
  ['listing-4.png', p => P(9, p, 'Meridian Tower 12F', 'Office · 1,860 sqft')],
  ['listing-5.png', p => P(10, p, 'Willow Fields L07', '2.4 Acres · Buildable')],
  ['listing-6.png', p => P(11, p, '3 BrickStone Row', '3 Bed · 2 Bath')],
  ['category-house.png', p => P(0, p, 'Houses', '128 properties')],
  ['category-apartment.png', p => P(1, p, 'Apartments', '94 properties')],
  ['category-villa.png', p => P(2, p, 'Villas', '47 properties')],
  ['category-office.png', p => P(3, p, 'Offices', '21 properties')],
  ['category-land.png', p => P(4, p, 'Land & Lots', '33 properties')],
  ['category-townhouse.png', p => P(5, p, 'Townhouses', '18 properties')],
  ['story.png', p => P(0, p, 'The Harper Family Story', 'From search to keys in 6 weeks')],
  ['blog-1.png', p => blogSVG(scenes[1], 800, 500, 'Blog', 'Market Report 2026')],
  ['blog-2.png', p => blogSVG(scenes[2], 800, 500, 'Blog', 'First-Time Buyer Guide')],
  ['blog-3.png', p => blogSVG(scenes[0], 800, 500, 'Blog', 'Neighborhood Spotlight')],
  ['blog-4.png', p => blogSVG(scenes[3], 800, 500, 'Blog', 'Interior Trends')],
  ['cta.png', p => heroPanorama(scenes[2], 1200, 800)],
  ['hero-2.png', p => P(1, p, 'Featured', 'Curated Listings')],
  ['agent-1.png', p => avatarSVG('Maya Bennett', 'MB', '#c96f4a', '#fdf3ea')],
  ['agent-2.png', p => avatarSVG('Omar Haddad', 'OH', '#2f7d5d', '#eef7f0')],
  ['agent-3.png', p => avatarSVG('Elena Rossi', 'ER', '#b4572e', '#fdf0e8')],
  ['agent-4.png', p => avatarSVG('Daniel Osei', 'DO', '#6a5b8a', '#f1eef7')],
  ['avatar-1.png', p => avatarSVG('Sofia Alvarez', 'SA', '#c96f4a', '#fdf3ea')],
  ['avatar-2.png', p => avatarSVG('Marcus Bell', 'MB', '#2f7d5d', '#eef7f0')],
  ['avatar-3.png', p => avatarSVG('Nina Patel', 'NP', '#b4572e', '#fdf0e8')],
  ['avatar-4.png', p => avatarSVG('Jordan Lee', 'JL', '#6a5b8a', '#f1eef7')],
];

// SVG lets us write .svg; but write .png-named svg content? Keep svg ext for browser
props.forEach(([name, fn]) => {
  const svg = fn(800, 560);
  fs.writeFileSync(path.join(out, name.replace('.png', '.svg')), svg);
});
console.log('generated', props.length, 'svgs');