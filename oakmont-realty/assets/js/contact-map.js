/**
 * Crestline Realty Group — Live Interactive Map
 * Powered by Leaflet.js & OpenStreetMap / CartoDB tiles
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
      lat: 30.2520,
      lng: -97.7650,
      zoom: 15,
      address: '2400 Crestline Avenue, Suite 300, Austin, TX 78704',
      cityState: 'Austin, TX 78704',
      phone: '+1 (512) 555-0142',
      phoneRaw: '+15125550142',
      email: 'austin@crestline-realty.example',
      hours: 'Mon – Fri: 8:30 AM – 6:00 PM · Sat: 10:00 AM – 4:00 PM',
      parking: 'Reserved client parking & Level 2 EV charging stations',
      image: 'assets/img/contact-office-hq.jpg',
      description: 'Primary Texas headquarters with executive brokerage desks, private client closing suites, TREC escrow counsel, and interactive 3D virtual tour theater.',
      amenities: ['Title & Escrow Center', '3D VR Viewing Suite', 'EV Charging', 'Notary On-Site'],
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=2400+Crestline+Avenue+Austin+TX+78704'
    },
    {
      id: 'dallas',
      name: 'Dallas / Fort Worth Hub',
      type: 'North Metro Commercial & Luxury Residential',
      tag: 'North Metro Hub',
      tagClass: 'pill-slate',
      lat: 32.7938,
      lng: -96.8023,
      zoom: 15,
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
      lat: 29.7380,
      lng: -95.4614,
      zoom: 15,
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
      lat: 29.4427,
      lng: -98.4795,
      zoom: 15,
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
  let activeOfficeId = 'austin';
  const markers = {};

  const TILE_LAYERS = {
    light: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
      }
    }
  };

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
            Select Office
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

  function setMapTileLayer(type) {
    if (!mapInstance) return;
    if (currentLayer) {
      mapInstance.removeLayer(currentLayer);
    }
    const layerConfig = TILE_LAYERS[type] || TILE_LAYERS.light;
    currentLayer = L.tileLayer(layerConfig.url, layerConfig.options).addTo(mapInstance);
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

    // Pan & open popup
    if (shouldFly) {
      mapInstance.flyTo([office.lat, office.lng], office.zoom, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }

    const targetMarker = markers[id];
    if (targetMarker) {
      setTimeout(() => {
        targetMarker.openPopup();
      }, shouldFly ? 1000 : 100);
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
      padding: [60, 60],
      duration: 1.2
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
      if (feedbackEl) feedbackEl.textContent = 'Geolocation is not supported by your browser.';
      return;
    }

    if (feedbackEl) feedbackEl.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Locating nearest Texas office…';

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
            feedbackEl.innerHTML = `<span class="text-brand-700 dark:text-brand-300 font-bold"><i class="ri-map-pin-user-fill"></i> Nearest office: <strong>${closest.name}</strong> (~${minDistance.toFixed(1)} miles away)</span>`;
          }
        }
      },
      (err) => {
        if (feedbackEl) {
          feedbackEl.innerHTML = '<span class="text-ember-600 dark:text-ember-400"><i class="ri-error-warning-line"></i> Location access was denied or timed out. Defaulted to Austin HQ.</span>';
        }
      },
      { timeout: 8000 }
    );
  }

  function initMap() {
    const container = document.getElementById('contact-map-canvas');
    if (!container || typeof L === 'undefined') return;

    const isDarkMode = document.documentElement.classList.contains('dark');
    const initialLayer = isDarkMode ? 'dark' : 'light';

    const austin = OFFICES[0];
    mapInstance = L.map('contact-map-canvas', {
      center: [austin.lat, austin.lng],
      zoom: 14,
      scrollWheelZoom: false,
      zoomControl: false
    });

    // Custom positioned zoom controls
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

    // Initial tile layer
    setMapTileLayer(initialLayer);

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
      btn.addEventListener('click', (e) => {
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
          const original = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="ri-check-line text-emerald-500"></i> Copied!';
          setTimeout(() => { copyBtn.innerHTML = original; }, 2000);
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
        const formSection = document.getElementById('contact-form-section') || document.querySelector('form[data-validate]');
        
        if (msgInput) {
          msgInput.value = `Hello Crestline team, I would like to schedule an in-person consultation at your ${current.name} (${current.cityState}).`;
        }
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          mapInstance.invalidateSize();
        }, 500);
      });
    });

    // Listen to theme toggles to auto-switch tile layers if in light/dark mode
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          const activeStyleBtn = document.querySelector('[data-map-style].active');
          const currentStyle = activeStyleBtn ? activeStyleBtn.getAttribute('data-map-style') : null;
          if (currentStyle !== 'satellite') {
            setMapTileLayer(isDark ? 'dark' : 'light');
            document.querySelectorAll('[data-map-style]').forEach(b => {
              b.classList.toggle('active', b.getAttribute('data-map-style') === (isDark ? 'dark' : 'light'));
            });
          }
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    // Invalidate size on scroll / resize
    window.addEventListener('resize', () => {
      if (mapInstance) mapInstance.invalidateSize();
    });
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }
})();
