/**
 * Crestline Realty Group — Live Interactive Texas Brokerage Map
 * Real, zero-API-key interactive map powered by Leaflet.js & OpenStreetMap / Esri World Imagery.
 * Features:
 * - 4 Real Texas Brokerage Hubs: Austin HQ, Dallas Hub, Houston Galleria, San Antonio Pearl
 * - Interactive office switching with smooth pan/fly animation
 * - Custom pins with pulse animations, badge icons & rich detail popups
 * - Real-time geolocation distance calculator ("Near Me")
 * - Dark & Light street styles, OSM standard tiles, and Satellite imagery
 * - Responsive auto-resize and graceful fallback
 */

(function () {
  'use strict';

  const OFFICES = [
    {
      id: 'austin',
      name: 'Austin Flagship HQ',
      type: 'Central Brokerage & Escrow Headquarters',
      tag: 'Central Texas HQ',
      tagClass: 'pill-green',
      lat: 30.247857,
      lng: -97.750138,
      zoom: 16,
      address: '1601 South Congress Avenue, Suite 300, Austin, TX 78704',
      cityState: 'Austin, TX 78704',
      phone: '+1 (512) 555-0142',
      phoneRaw: '+15125550142',
      email: 'austin@crestline-realty.example',
      hours: 'Mon – Fri: 8:30 AM – 6:00 PM · Sat: 10:00 AM – 4:00 PM',
      parking: 'Reserved client parking & Level 2 EV charging stations',
      image: 'assets/img/contact-office-hq.jpg',
      description: 'Primary Texas headquarters featuring executive brokerage desks, private client closing suites, TREC escrow counsel, and interactive 3D virtual tour theater.',
      amenities: ['Title & Escrow Center', '3D VR Viewing Suite', 'EV Charging', 'Notary On-Site'],
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=1601+South+Congress+Avenue+Austin+TX+78704'
    },
    {
      id: 'dallas',
      name: 'Dallas / Fort Worth Hub',
      type: 'North Metro Commercial & Luxury Residential',
      tag: 'North Metro Hub',
      tagClass: 'pill-slate',
      lat: 32.794628,
      lng: -96.804357,
      zoom: 16,
      address: '500 Crescent Court, Suite 410, Dallas, TX 75201',
      cityState: 'Dallas, TX 75201',
      phone: '+1 (214) 555-0188',
      phoneRaw: '+12145550188',
      email: 'dallas@crestline-realty.example',
      hours: 'Mon – Fri: 9:00 AM – 5:30 PM · Sat: By Appointment',
      parking: 'Complimentary valet parking at Crescent Court entrance',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      description: 'Serving Uptown, Highland Park, Preston Hollow, and Frisco with luxury relocation advisory and commercial multi-family acquisition services.',
      amenities: ['Private Valet', 'Luxury Advisory', 'Commercial Desks', 'Executive Boardroom'],
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=500+Crescent+Court+Suite+410+Dallas+TX+75201'
    },
    {
      id: 'houston',
      name: 'Houston Galleria Hub',
      type: 'Gulf Coast Advisory & Energy Corridor Office',
      tag: 'Gulf Coast Hub',
      tagClass: 'pill-slate',
      lat: 29.737300,
      lng: -95.461268,
      zoom: 16,
      address: '2800 Post Oak Blvd, Level 14, Houston, TX 77056',
      cityState: 'Houston, TX 77056',
      phone: '+1 (713) 555-0176',
      phoneRaw: '+17135550176',
      email: 'houston@crestline-realty.example',
      hours: 'Mon – Fri: 9:00 AM – 5:30 PM · Sat: By Appointment',
      parking: 'Covered visitor parking in Post Oak Tower garage (validated)',
      image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80',
      description: 'Specializing in River Oaks, Memorial, The Woodlands, and the Texas Medical Center with custom 1031 exchange advisors.',
      amenities: ['Validated Parking', '1031 Exchange Team', 'Foreign Buyer Desk', 'High-Rise Lounge'],
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=2800+Post+Oak+Blvd+Level+14+Houston+TX+77056'
    },
    {
      id: 'san-antonio',
      name: 'San Antonio Pearl Branch',
      type: 'Hill Country Heritage & Land Acquisition Branch',
      tag: 'Hill Country Branch',
      tagClass: 'pill-slate',
      lat: 29.442984,
      lng: -98.480606,
      zoom: 16,
      address: '312 Pearl Parkway, Suite 220, San Antonio, TX 78215',
      cityState: 'San Antonio, TX 78215',
      phone: '+1 (210) 555-0164',
      phoneRaw: '+12105550164',
      email: 'sanantonio@crestline-realty.example',
      hours: 'Mon – Fri: 9:00 AM – 5:00 PM · Sat: By Appointment',
      parking: 'Koehler & Emma garage parking with direct walkway access',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      description: 'Expert guidance across the Historic Pearl, Alamo Heights, Boerne, and Texas Hill Country ranch estates and acreage.',
      amenities: ['Ranch & Land Team', 'Walkable District', 'Historic Preservation', 'Client Tasting Room'],
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=312+Pearl+Parkway+Suite+220+San+Antonio+TX+78215'
    }
  ];

  let mapInstance = null;
  let currentLayer = null;
  let labelLayer = null;
  let activeTileKey = null;
  let activeOfficeId = 'austin';
  const markers = {};

  // Reliable, high-performance, 100% free un-watermarked tile providers powered by Esri ArcGIS Online
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
  const ESRI_ATTR = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, METI, NRCAN';

  const TILE_LAYERS = {
    // Street — Esri World Street Map (Crisp, complete street grid with zero watermark/key)
    street: {
      url: ESRI + 'World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: ESRI_ATTR, maxZoom: 19 }
    },
    // Street / Light alias
    light: {
      url: ESRI + 'World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: ESRI_ATTR, maxZoom: 19 }
    },
    // Dark — Esri Dark Gray Canvas (Sleek dark theme)
    dark: {
      url: ESRI + 'Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: ESRI_ATTR, maxZoom: 16 }
    },
    // Topo — Esri World Topographic Map
    topo: {
      url: ESRI + 'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: ESRI_ATTR, maxZoom: 19 }
    },
    // Satellite — Esri World Imagery (High-res aerial)
    satellite: {
      url: ESRI + 'World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      }
    },
    // NatGeo World Map
    natgeo: {
      url: ESRI + 'NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: ESRI_ATTR, maxZoom: 16 }
    },
    // Fallback Light Gray
    gray: {
      url: ESRI + 'Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: ESRI_ATTR, maxZoom: 16 }
    },
    // OpenStreetMap standard tiles — a completely different CDN host
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 19
      }
    },
    // OpenTopoMap — independent CDN host, different rendering again
    topoopen: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      options: {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
        subdomains: 'abc',
        maxZoom: 17
      }
    },
    // OpenStreetMap Germany mirror — another independent CDN host
    osmde: {
      url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 18
      }
    }
  };

  // Road and place-name label overlays for dark, satellite, and gray styles
  const LABEL_LAYERS = {
    dark: {
      url: ESRI + 'Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: '', maxZoom: 16, pane: 'shadowPane' }
    },
    satellite: {
      url: ESRI + 'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: '', maxZoom: 19, pane: 'shadowPane' }
    },
    gray: {
      url: ESRI + 'Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: '', maxZoom: 16, pane: 'shadowPane' }
    }
  };

  // Tried in order when the requested style cannot load any tiles.
  // The last two are on separate CDNs, so a block on the Esri host
  // (or a network that blocks it) still leaves the map working.
  const TILE_FALLBACKS = ['street', 'osm', 'osmde', 'topo', 'dark', 'natgeo', 'gray', 'topoopen'];


  function createMarkerIcon(office, isActive) {
    return L.divIcon({
      className: 'custom-map-pin-container',
      html: `
        <div class="custom-map-pin ${isActive ? 'is-active' : ''}" data-office-id="${office.id}">
          <div class="pin-pulse"></div>
          <div class="pin-badge">
            <i class="ri-building-2-fill"></i>
          </div>
          <div class="pin-label">${office.name}</div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 38],
      popupAnchor: [0, -38]
    });
  }

  function getPopupContent(office) {
    return `
      <div class="p-4 max-w-[280px]">
        <img src="${office.image}" alt="${office.name}" class="w-full h-28 object-cover rounded-xl mb-3 border border-ink-100 dark:border-white/10">
        <span class="tbl-pill ${office.tagClass} text-[10px] font-bold uppercase">${office.tag}</span>
        <h4 class="font-bold text-base text-ink-900 dark:text-white mt-1">${office.name}</h4>
        <p class="text-xs text-ink-500 dark:text-slate-300 mt-1"><i class="ri-map-pin-line text-brand-600"></i> ${office.address}</p>
        <p class="text-xs text-ink-500 dark:text-slate-300 mt-1"><i class="ri-phone-line text-brand-600"></i> ${office.phone}</p>
        <div class="mt-3 pt-3 border-t border-ink-100 dark:border-white/10 flex items-center justify-between gap-2">
          <a href="${office.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-brand-300 hover:underline">
            Directions <i class="ri-external-link-line"></i>
          </a>
          <button type="button" class="px-2.5 py-1 rounded-lg bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition" onclick="window.selectCrestlineOffice('${office.id}')">
            Select
          </button>
        </div>
      </div>
    `;
  }

  function updateSidebarCard(office) {
    const titleEl = document.getElementById('map-office-title');
    const typeEl = document.getElementById('map-office-type');
    const tagEl = document.getElementById('map-office-tag');
    const addressEl = document.getElementById('map-office-address');
    const phoneEl = document.getElementById('map-office-phone');
    const emailEl = document.getElementById('map-office-email');
    const hoursEl = document.getElementById('map-office-hours');
    const parkingEl = document.getElementById('map-office-parking');
    const imageEl = document.getElementById('map-office-image');
    const descEl = document.getElementById('map-office-desc');
    const amenitiesEl = document.getElementById('map-office-amenities');
    const directionsEl = document.getElementById('map-office-directions');

    if (titleEl) titleEl.textContent = office.name;
    if (typeEl) typeEl.textContent = office.type;
    if (tagEl) {
      tagEl.textContent = office.tag;
      tagEl.className = `tbl-pill ${office.tagClass} font-bold text-xs uppercase`;
    }
    if (addressEl) addressEl.textContent = office.address;
    if (phoneEl) {
      phoneEl.textContent = office.phone;
      phoneEl.href = `tel:${office.phoneRaw}`;
    }
    if (emailEl) {
      emailEl.textContent = office.email;
      emailEl.href = `mailto:${office.email}`;
    }
    if (hoursEl) hoursEl.textContent = office.hours;
    if (parkingEl) parkingEl.textContent = office.parking;
    if (imageEl) {
      imageEl.src = office.image;
      imageEl.alt = office.name;
    }
    if (descEl) descEl.textContent = office.description;
    if (amenitiesEl) {
      amenitiesEl.innerHTML = office.amenities.map(a => `
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-800 dark:text-brand-300 text-xs font-semibold border border-brand-100 dark:border-brand-500/20">
          <i class="ri-checkbox-circle-fill text-brand-600"></i> ${a}
        </span>
      `).join('');
    }
    if (directionsEl) directionsEl.href = office.googleMapsUrl;
  }

  function clearLayers() {
    if (currentLayer && mapInstance) mapInstance.removeLayer(currentLayer);
    if (labelLayer && mapInstance) mapInstance.removeLayer(labelLayer);
    currentLayer = null;
    labelLayer = null;
  }

  function hideMapStatus() {
    const el = document.getElementById('map-status-overlay');
    if (el) el.classList.add('hidden');
  }

  function showMapStatus(kind, message) {
    const el = document.getElementById('map-status-overlay');
    if (!el) return;
    const icon = el.querySelector('[data-status-icon]');
    const text = el.querySelector('[data-status-text]');
    const retry = el.querySelector('[data-status-retry]');
    const link = el.querySelector('[data-status-link]');
    const office = OFFICES.find(o => o.id === activeOfficeId) || OFFICES[0];

    if (icon) {
      icon.className = 'ri text-3xl ' + (kind === 'error'
        ? 'ri-error-warning-line text-ember-500'
        : 'ri-loader-4-line text-brand-600 animate-spin');
    }
    if (text) text.textContent = message;
    if (link) link.href = office.googleMapsUrl;
    if (retry) retry.classList.toggle('hidden', kind !== 'error');
    el.classList.remove('hidden');
  }

  function setMapTileLayer(type) {
    if (!mapInstance) return;
    clearLayers();

    const tried = [];
    let loadTimer = null;

    const attempt = (key) => {
      if (tried.indexOf(key) !== -1) return;
      tried.push(key);

      const cfg = TILE_LAYERS[key] || TILE_LAYERS.light;
      const layer = L.tileLayer(cfg.url, cfg.options);
      let errorCount = 0;
      let settled = false;

      layer.on('tileload', () => {
        clearTimeout(loadTimer);
        hideMapStatus();
      });

      layer.on('tileerror', () => {
        errorCount++;
        // The provider is rejecting us (blocked / offline) — try the next one
        if (settled || errorCount < 3) return;
        settled = true;
        clearTimeout(loadTimer);
        mapInstance.removeLayer(layer);
        if (layer === currentLayer) currentLayer = null;

        const next = TILE_FALLBACKS.find(f => tried.indexOf(f) === -1);
        if (next) {
          attempt(next);
        } else {
          showMapStatus('error', 'Live map tiles are blocked or unreachable on this network. Open the office in Google Maps instead.');
        }
      });

      layer.addTo(mapInstance);
      currentLayer = layer;
      activeTileKey = key;

      if (LABEL_LAYERS[key]) {
        labelLayer = L.tileLayer(LABEL_LAYERS[key].url, LABEL_LAYERS[key].options);
        labelLayer.addTo(mapInstance);
      }
    };

    showMapStatus('loading', 'Loading live map tiles…');
    attempt(type);

    // Watchdog fallback in case tile server is unreachable
    loadTimer = setTimeout(() => {
      if (!currentLayer || tried.length > 1) return;
      const mapEl = mapInstance.getContainer ? mapInstance.getContainer() : document.getElementById('contact-map-canvas');
      const anyLoaded = mapEl && mapEl.querySelectorAll('img.leaflet-tile').length > 0;
      if (!anyLoaded) {
        showMapStatus('error', 'Live map tiles took too long to load. Open the office in Google Maps instead.');
      }
    }, 9000);
  }

  function selectOffice(id, shouldFly = true) {
    const office = OFFICES.find(o => o.id === id);
    if (!office || !mapInstance) return;

    activeOfficeId = id;

    // Update filter buttons
    document.querySelectorAll('.map-branch-btn').forEach(btn => {
      const bId = btn.getAttribute('data-branch-id');
      btn.classList.toggle('active', bId === id);
    });

    // Update markers icons
    OFFICES.forEach(o => {
      const marker = markers[o.id];
      if (marker) {
        marker.setIcon(createMarkerIcon(o, o.id === id));
      }
    });

    // Update detail card
    updateSidebarCard(office);

    if (shouldFly) {
      mapInstance.flyTo([office.lat, office.lng], office.zoom, {
        duration: 1.0,
        easeLinearity: 0.25
      });
    }

    const targetMarker = markers[id];
    if (targetMarker) {
      setTimeout(() => {
        if (mapInstance) {
          mapInstance.invalidateSize({ animate: false });
          targetMarker.openPopup();
        }
      }, shouldFly ? 1050 : 80);
    }
  }

  window.selectCrestlineOffice = selectOffice;

  function viewAllOffices() {
    if (!mapInstance) return;

    document.querySelectorAll('.map-branch-btn').forEach(btn => {
      const bId = btn.getAttribute('data-branch-id');
      btn.classList.toggle('active', bId === 'all');
    });

    const bounds = L.latLngBounds(OFFICES.map(o => [o.lat, o.lng]));
    mapInstance.fitBounds(bounds, {
      padding: [50, 50],
      duration: 1.0
    });
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function findNearestOffice() {
    const feedbackEl = document.getElementById('nearest-office-feedback');
    if (!navigator.geolocation) {
      if (feedbackEl) feedbackEl.innerHTML = '<span class="text-ember-500 font-semibold">Geolocation is not supported by your browser.</span>';
      return;
    }

    if (feedbackEl) feedbackEl.innerHTML = '<span class="text-brand-600 dark:text-brand-400 font-semibold"><i class="ri-loader-4-line animate-spin"></i> Locating nearest Texas office…</span>';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        let closest = null;
        let minDistance = Infinity;

        OFFICES.forEach(office => {
          const dist = calculateDistance(userLat, userLng, office.lat, office.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closest = office;
          }
        });

        if (closest) {
          selectOffice(closest.id);
          if (feedbackEl) {
            feedbackEl.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-bold"><i class="ri-map-pin-user-fill"></i> Nearest branch: <strong>${closest.name}</strong> (~${minDistance.toFixed(1)} miles away)</span>`;
          }
        }
      },
      () => {
        if (feedbackEl) {
          feedbackEl.innerHTML = '<span class="text-slate-500 font-medium"><i class="ri-information-line"></i> Location access not granted. Showing Austin Flagship HQ.</span>';
        }
      },
      { timeout: 7000 }
    );
  }

  function initMap() {
    const container = document.getElementById('contact-map-canvas');
    if (!container) return;

    // Check if Leaflet library is available
    if (typeof L === 'undefined') {
      container.innerHTML = `
        <iframe 
          title="Crestline Realty Austin HQ Map"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-97.760%2C30.240%2C-97.740%2C30.255&amp;layer=mapnik&amp;marker=30.247857%2C-97.750138" 
          class="w-full h-full border-0 rounded-3xl"
          loading="lazy">
        </iframe>
      `;
      return;
    }

    if (mapInstance) {
      mapInstance.invalidateSize();
      return;
    }

    const austin = OFFICES[0];
    mapInstance = L.map(container, {
      center: [austin.lat, austin.lng],
      zoom: 15,
      minZoom: 5,
      maxZoom: 19,
      scrollWheelZoom: false,
      zoomControl: false
    });

    // Zoom and scale controls
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
    L.control.scale({ position: 'bottomleft', imperial: true, metric: true }).addTo(mapInstance);

    // Enable scroll zoom on map interaction
    mapInstance.on('click focus', () => mapInstance.scrollWheelZoom.enable());
    mapInstance.on('blur mouseout', () => mapInstance.scrollWheelZoom.disable());

    // Initial tile layer based on current theme
    const isDark = document.documentElement.classList.contains('dark');
    const initialStyle = isDark ? 'dark' : 'street';
    setMapTileLayer(initialStyle);
    document.querySelectorAll('[data-map-style]').forEach(btn => {
      const bStyle = btn.getAttribute('data-map-style');
      btn.classList.toggle('active', bStyle === initialStyle || (initialStyle === 'street' && bStyle === 'light'));
    });

    // Create markers for each office
    OFFICES.forEach(office => {
      const isSelected = office.id === activeOfficeId;
      const marker = L.marker([office.lat, office.lng], {
        icon: createMarkerIcon(office, isSelected)
      }).addTo(mapInstance);

      marker.bindPopup(getPopupContent(office));

      marker.on('click', () => {
        selectOffice(office.id, false);
      });

      markers[office.id] = marker;
    });

    // Initial card setup
    updateSidebarCard(austin);

    // Map style switches
    document.querySelectorAll('[data-map-style]').forEach(btn => {
      btn.addEventListener('click', () => {
        const style = btn.getAttribute('data-map-style');
        document.querySelectorAll('[data-map-style]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setMapTileLayer(style);
      });
    });

    // Branch filter buttons
    document.querySelectorAll('.map-branch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bId = btn.getAttribute('data-branch-id');
        if (bId === 'all') {
          viewAllOffices();
        } else {
          selectOffice(bId);
        }
      });
    });

    // Geolocation button
    const locateBtn = document.getElementById('btn-find-nearest-office');
    if (locateBtn) {
      locateBtn.addEventListener('click', findNearestOffice);
    }

    // Copy address button
    const copyBtn = document.getElementById('btn-copy-office-address');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const current = OFFICES.find(o => o.id === activeOfficeId) || OFFICES[0];
        navigator.clipboard.writeText(current.address).then(() => {
          const orig = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="ri-check-line text-emerald-500"></i> Copied!';
          setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
        });
      });
    }

    // Schedule consultation pre-fill
    const bookBtn = document.getElementById('btn-book-office-visit');
    if (bookBtn) {
      bookBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const current = OFFICES.find(o => o.id === activeOfficeId) || OFFICES[0];
        const msgInput = document.getElementById('contact-message');
        const formEl = document.querySelector('form[data-validate]') || document.getElementById('contact-form');
        
        if (msgInput) {
          msgInput.value = `Hello Crestline team, I would like to schedule an in-person consultation at your ${current.name} (${current.cityState}).`;
        }
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (msgInput) msgInput.focus();
        }
      });
    }

    // Focus on map from regional cards
    document.querySelectorAll('[data-focus-branch]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const branchId = btn.getAttribute('data-focus-branch');
        const mapSection = document.getElementById('live-map-section');
        if (mapSection) {
          mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setTimeout(() => {
          selectOffice(branchId);
          if (mapInstance) mapInstance.invalidateSize();
        }, 450);
      });
    });

    // Sync tile layer on dark/light mode toggle
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'class') {
          const darkNow = document.documentElement.classList.contains('dark');
          const activeStyleBtn = document.querySelector('[data-map-style].active');
          const currentStyle = activeStyleBtn ? activeStyleBtn.getAttribute('data-map-style') : null;
          if (currentStyle !== 'satellite' && currentStyle !== 'topo') {
            const next = darkNow ? 'dark' : 'street';
            setMapTileLayer(next);
            document.querySelectorAll('[data-map-style]').forEach(b => {
              const bStyle = b.getAttribute('data-map-style');
              b.classList.toggle('active', bStyle === next || (next === 'street' && bStyle === 'light'));
            });
          }
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    // Retry button on the blocked/unreachable overlay
    const retryBtn = document.getElementById('map-status-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        const activeStyleBtn = document.querySelector('[data-map-style].active');
        const style = activeStyleBtn ? activeStyleBtn.getAttribute('data-map-style') : 'street';
        setMapTileLayer(style === 'light' ? 'street' : style);
        if (mapInstance) mapInstance.invalidateSize();
      });
    }

    // Invalidate size on window resize / load
    const refreshSize = () => {
      if (mapInstance) mapInstance.invalidateSize({ animate: false });
    };

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(refreshSize).observe(container);
    }

    window.addEventListener('resize', refreshSize);
    window.addEventListener('load', refreshSize);
    setTimeout(refreshSize, 300);
    setTimeout(refreshSize, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }
})();
