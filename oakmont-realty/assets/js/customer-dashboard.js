/**
 * Crestline Realty Group — Customer Client Portal Controller
 * Full interactive functionality:
 * - Tab switching / SPA navigation (#overview, #saved, #visits, #offers, #documents, #messages, #profile)
 * - Dynamic saved homes management (live sync, removal, schedule visit trigger, ask agent trigger)
 * - Schedule a visit form with live validation, timeline addition, persistence & reschedule/cancel
 * - Live agent messaging simulation with smart auto-responses, persistence, auto-scroll & typing indicator
 * - Document upload dropzone & file selection with mock upload, status pill updates & downloads
 * - Offer approval flow with modal confirmation
 * - Profile settings editing with instant topbar, avatar & card synchronization
 * - Notifications drawer / modal
 * - Mobile sidebar toggle & responsive navigation
 * - Session guard & logout integration
 */

(function () {
  'use strict';

  // --- Helper Shortcuts ---
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var CustomerDash = {
    user: null,
    savedHomes: [],
    visits: [],
    documents: [],
    messages: [],

    init: function () {
      this.initSession();
      this.initTabs();
      this.initSidebarMobile();
      this.initSavedHomes();
      this.initVisits();
      this.initOffers();
      this.initDocuments();
      this.initMessages();
      this.initProfile();
      this.initNotifications();
      this.initActionShortcuts();
    },

    // 1. Session & Auth Management
    initSession: function () {
      var session = window.CrestlineSession ? window.CrestlineSession.get() : null;
      if (!session || !session.email) {
        // Fallback demo client profile if accessing directly without sign-in
        session = {
          uid: 'usr_client_demo',
          name: 'Elena Vance',
          email: 'elena.vance@example.com',
          phone: '(512) 555-0142',
          role: 'user',
          photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&crop=faces&q=80',
          timeline: 'Within 3 months',
          assignedAgent: 'Maya Bennett'
        };
        if (window.CrestlineSession) {
          window.CrestlineSession.save(session);
        }
      }
      this.user = session;
      this.syncUserUI();
    },

    syncUserUI: function () {
      if (!this.user) return;
      var fullName = this.user.name || this.user.email.split('@')[0];
      var nameParts = fullName.trim().split(/\s+/);
      var firstName = nameParts[0] || 'Client';
      var lastName = nameParts.slice(1).join(' ') || '';
      var initials = (firstName.charAt(0) + (lastName ? lastName.charAt(0) : (nameParts[0].length > 1 ? nameParts[0].charAt(1) : ''))).toUpperCase() || 'CP';

      var hour = new Date().getHours();
      var timeGreeting = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening');

      // Topbar
      var greeting = $('#dash-greeting');
      if (greeting) greeting.textContent = timeGreeting + ', ' + firstName;

      var topAvatar = $('#dash-top-avatar');
      if (topAvatar) {
        if (this.user.photoURL) {
          topAvatar.innerHTML = '<img src="' + this.user.photoURL + '" alt="' + fullName + '" class="w-full h-full object-cover rounded-full">';
        } else {
          topAvatar.textContent = initials;
        }
      }

      // Profile Card
      var pName = $('#dash-profile-name');
      if (pName) pName.textContent = fullName;
      var pEmail = $('#dash-profile-email');
      if (pEmail) pEmail.textContent = this.user.email;
      var pAvatar = $('#dash-profile-avatar');
      if (pAvatar) {
        if (this.user.photoURL) {
          pAvatar.innerHTML = '<img src="' + this.user.photoURL + '" alt="' + fullName + '" class="w-full h-full object-cover rounded-full">';
        } else {
          pAvatar.textContent = initials;
        }
      }

      // Profile Form Fields
      var pFirst = $('#profile-first');
      var pLast = $('#profile-last');
      var pFormEmail = $('#profile-email');
      var pPhone = $('#profile-phone');

      if (pFirst) pFirst.value = firstName;
      if (pLast) pLast.value = lastName;
      if (pFormEmail) pFormEmail.value = this.user.email;
      if (pPhone) pPhone.value = this.user.phone || '';
    },

    // 2. Tab Switching & Navigation
    initTabs: function () {
      var self = this;
      var links = $$('.dash-sidebar .dash-link[data-section]');
      var sections = $$('.dash-section');

      function activateTab(sectionId, smoothScroll) {
        if (!sectionId) sectionId = 'overview';
        sectionId = sectionId.replace('#', '');

        var targetSection = document.getElementById(sectionId);
        if (!targetSection) return;

        // Update active sidebar link
        links.forEach(function (l) {
          var sec = l.getAttribute('data-section');
          if (sec === sectionId) {
            l.classList.add('active');
            l.setAttribute('aria-current', 'page');
          } else {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
          }
        });

        // Scroll to target section smoothly
        if (smoothScroll) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Close sidebar on mobile if open
        var sidebar = $('#dash-sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
          var backdrop = $('#dash-backdrop');
          if (backdrop) backdrop.remove();
        }
      }

      // Handle sidebar link clicks
      links.forEach(function (link) {
        link.addEventListener('click', function (e) {
          var sec = link.getAttribute('data-section');
          if (sec) {
            e.preventDefault();
            history.pushState(null, null, '#' + sec);
            activateTab(sec, true);
          }
        });
      });

      // Handle direct hash navigation on load & hashchange
      window.addEventListener('hashchange', function () {
        var hash = window.location.hash;
        if (hash) activateTab(hash.replace('#', ''), true);
      });

      if (window.location.hash) {
        setTimeout(function () {
          activateTab(window.location.hash.replace('#', ''), true);
        }, 150);
      }
    },

    // 3. Mobile Sidebar Toggle
    initSidebarMobile: function () {
      var sidebar = $('#dash-sidebar');
      var toggleBtn = $('#dash-toggle');
      var closeBtns = $$('.dash-sidebar-close');

      function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('open');
        var existing = $('#dash-backdrop');
        if (!existing) {
          var backdrop = document.createElement('div');
          backdrop.id = 'dash-backdrop';
          backdrop.className = 'fixed inset-0 bg-forest-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300';
          backdrop.addEventListener('click', closeSidebar);
          document.body.appendChild(backdrop);
        }
      }

      function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        var backdrop = $('#dash-backdrop');
        if (backdrop) backdrop.remove();
      }

      if (toggleBtn) {
        toggleBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (sidebar.classList.contains('open')) closeSidebar();
          else openSidebar();
        });
      }

      closeBtns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          closeSidebar();
        });
      });
    },

    // 4. Saved Homes Management
    initSavedHomes: function () {
      var self = this;
      var defaultSaved = [
        {
          id: 'prop-16-cedar',
          title: '16 Cedar Lane',
          location: 'Alder Ridge, Austin TX',
          price: '$672,000',
          priceDrop: '$6K',
          beds: '4 Bed',
          baths: '2.5 Bath',
          sqft: '2,340 sqft',
          image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
          link: 'listing-detail.html'
        },
        {
          id: 'prop-9-olive',
          title: '9 Olive Grove Road',
          location: 'Dripping Springs',
          price: '$1,249,000',
          beds: '5 Bed',
          baths: '4 Bath',
          sqft: '3,920 sqft',
          image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80',
          link: 'listing-detail.html'
        },
        {
          id: 'prop-220-harbor',
          title: '220 Harbor View',
          location: 'Harbor Lofts, Austin TX',
          price: '$2,150/mo',
          beds: '2 Bed',
          baths: '2 Bath',
          sqft: '1,150 sqft',
          image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
          link: 'listing-detail.html'
        }
      ];

      try {
        var raw = localStorage.getItem('crestline_saved_homes');
        this.savedHomes = raw ? JSON.parse(raw) : defaultSaved;
      } catch (e) {
        this.savedHomes = defaultSaved;
      }

      this.renderSavedHomes();
    },

    renderSavedHomes: function () {
      var self = this;
      var container = $('#saved .grid');
      var count = this.savedHomes.length;

      // Update counters
      var statSaved = $('#dash-stat-saved');
      if (statSaved) statSaved.textContent = count;
      var sidebarSaved = $('#dash-sidebar-saved');
      if (sidebarSaved) sidebarSaved.textContent = count;
      var profileSaved = $('#dash-profile-saved');
      if (profileSaved) profileSaved.textContent = count;

      if (!container) return;

      if (count === 0) {
        container.innerHTML = `
          <div class="col-span-full rounded-2xl glass-card p-10 text-center">
            <span class="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 flex items-center justify-center text-3xl mx-auto mb-4">
              <i class="ri-heart-line"></i>
            </span>
            <h3 class="font-display text-xl font-bold text-ink-900 dark:text-white">No saved homes yet</h3>
            <p class="mt-2 text-sm text-ink-500 dark:text-slate-400 max-w-md mx-auto">Explore Austin and Central Texas luxury listings and heart your favorites to monitor price changes and book viewings.</p>
            <a href="home-2.html" class="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-soft transition">
              <i class="ri-search-line"></i> Browse Listings
            </a>
          </div>
        `;
        return;
      }

      container.innerHTML = this.savedHomes.map(function (item) {
        return `
          <div class="card-hover rounded-2xl glass-card overflow-hidden" data-id="${item.id}">
            <a href="${item.link}" class="img-zoom relative block" aria-label="View ${item.title} details">
              <img src="${item.image}" alt="${item.title}" class="w-full aspect-[16/10] object-cover" loading="lazy">
              <button type="button" class="btn-remove-saved absolute top-3 end-3 w-9 h-9 rounded-full bg-white/95 dark:bg-forest-900/95 text-ember-500 flex items-center justify-center shadow-card hover:scale-110 transition" aria-label="Remove from saved" title="Remove from saved">
                <i class="ri-heart-3-fill"></i>
              </button>
              ${item.priceDrop ? `<span class="absolute bottom-3 start-3 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-forest-950/90 text-ink-900 dark:text-white"><i class="ri-time-line text-brand-600 dark:text-brand-400"></i> Price dropped <span class="num">${item.priceDrop}</span></span>` : ''}
            </a>
            <div class="p-5">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3 class="font-bold text-ink-900 dark:text-white"><a href="${item.link}" class="hover:text-brand-700 dark:hover:text-brand-300 transition">${item.title}</a></h3>
                  <p class="text-xs text-ink-400">${item.location}</p>
                </div>
                <p class="font-extrabold text-brand-700 dark:text-brand-300"><span class="num">${item.price}</span></p>
              </div>
              <div class="listing-meta mt-3">
                <span>${item.beds}</span><span>${item.baths}</span><span>${item.sqft}</span>
              </div>
              <div class="mt-4 flex gap-2">
                <button type="button" class="btn-card-visit flex-1 text-center px-3 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-sm" data-property="${item.title}">Schedule visit</button>
                <button type="button" class="btn-card-ask flex-1 text-center px-3 py-2.5 rounded-lg border border-ink-200 dark:border-white/20 text-xs font-bold text-ink-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-white/5 transition" data-property="${item.title}">Ask agent</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Wire removal buttons
      $$('.btn-remove-saved', container).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var card = btn.closest('[data-id]');
          var id = card ? card.getAttribute('data-id') : null;
          if (id) {
            self.savedHomes = self.savedHomes.filter(function (h) { return h.id !== id; });
            try {
              localStorage.setItem('crestline_saved_homes', JSON.stringify(self.savedHomes));
            } catch (_) {}
            self.renderSavedHomes();
            if (window.CrestlineToast) window.CrestlineToast('Property removed from saved homes.', 'info');
          }
        });
      });

      // Wire Schedule Visit buttons
      $$('.btn-card-visit', container).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var propName = btn.getAttribute('data-property');
          var visitSelect = $('#visit-property');
          if (visitSelect) {
            // Find option matching property or add it
            var matchFound = false;
            for (var i = 0; i < visitSelect.options.length; i++) {
              if (visitSelect.options[i].text.indexOf(propName) !== -1) {
                visitSelect.selectedIndex = i;
                matchFound = true;
                break;
              }
            }
            if (!matchFound) {
              var newOpt = document.createElement('option');
              newOpt.text = propName + ' — Custom visit request';
              newOpt.selected = true;
              visitSelect.add(newOpt, 0);
            }
          }
          history.pushState(null, null, '#visits');
          var visitSec = $('#visits');
          if (visitSec) visitSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (window.CrestlineToast) window.CrestlineToast('Selected ' + propName + '. Choose a date & time below.');
        });
      });

      // Wire Ask Agent buttons
      $$('.btn-card-ask', container).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var propName = btn.getAttribute('data-property');
          history.pushState(null, null, '#messages');
          var msgSec = $('#messages');
          if (msgSec) msgSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          var msgInput = $('#messages input[type="text"]');
          if (msgInput) {
            msgInput.value = 'Hi Maya, I would like more information about ' + propName + '.';
            msgInput.focus();
          }
        });
      });
    },

    // 5. Schedule a Visit System
    initVisits: function () {
      var self = this;
      var visitForm = $('#visits form');
      var dateInput = $('#visit-date');
      var visitsContainer = $('#visits .space-y-5');

      // Set min date to today
      if (dateInput) {
        var today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        if (!dateInput.value) {
          var tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          dateInput.value = tomorrow.toISOString().split('T')[0];
        }
      }

      // Default upcoming visits
      var defaultVisits = [
        {
          id: 'vis_1',
          property: '3 BrickStone Row',
          dateFormatted: 'Sat, Sep 19 · 10:30 AM',
          agent: 'Maya Bennett',
          status: 'Confirmed',
          statusClass: 'pill-green',
          type: 'Open house',
          typeIcon: 'ri-drinks-line'
        },
        {
          id: 'vis_2',
          property: '220 Harbor View',
          dateFormatted: 'Sun, Sep 20 · 09:15 AM',
          agent: 'Maya Bennett',
          status: 'Awaiting confirm',
          statusClass: 'pill-amber',
          type: 'Live video tour',
          typeIcon: 'ri-video-line'
        }
      ];

      try {
        var rawVisits = localStorage.getItem('crestline_visits');
        this.visits = rawVisits ? JSON.parse(rawVisits) : defaultVisits;
      } catch (_) {
        this.visits = defaultVisits;
      }

      this.renderVisitsList();

      if (visitForm) {
        visitForm.addEventListener('submit', function (e) {
          e.preventDefault();
          var propSelect = $('#visit-property');
          var timeSelect = $('#visit-time');
          var noteInput = $('#visit-note');

          var prop = propSelect ? propSelect.value.split('—')[0].trim() : '16 Cedar Lane';
          var rawDate = dateInput ? dateInput.value : '';
          var time = timeSelect ? timeSelect.value : '10:00 – 10:45';
          var note = noteInput ? noteInput.value.trim() : '';

          if (!rawDate) {
            if (window.CrestlineToast) window.CrestlineToast('Please select a visit date.', 'error');
            return;
          }

          var dateObj = new Date(rawDate + 'T12:00:00');
          var formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + time.split('–')[0].trim();

          var newVisit = {
            id: 'vis_' + Date.now(),
            property: prop,
            dateFormatted: formattedDate,
            agent: 'Maya Bennett',
            status: 'Confirmed',
            statusClass: 'pill-green',
            type: 'Private tour',
            typeIcon: 'ri-user-star-line',
            note: note
          };

          self.visits.unshift(newVisit);
          try {
            localStorage.setItem('crestline_visits', JSON.stringify(self.visits));
          } catch (_) {}

          self.renderVisitsList();

          var successNotice = $('#visit-success');
          if (successNotice) {
            successNotice.classList.remove('hidden');
            setTimeout(function () { successNotice.classList.add('hidden'); }, 4500);
          }

          if (noteInput) noteInput.value = '';
          if (window.CrestlineToast) window.CrestlineToast('Visit request confirmed for ' + prop + '!', 'success');
        });
      }
    },

    renderVisitsList: function () {
      var self = this;
      var container = $('#visits .space-y-5');
      if (!container) return;

      var headerHtml = '<h2 class="font-display text-2xl font-bold text-ink-900 dark:text-white">Upcoming visits</h2>';
      var footerCardHtml = `
        <div class="rounded-2xl bg-brand-700 p-5 text-white">
          <p class="font-bold">Tour, recorded.</p>
          <p class="mt-1 text-sm text-brand-100">Every confirmed visit is added to your timeline so you never lose track of where you've been.</p>
        </div>
      `;

      var visitsCardsHtml = this.visits.map(function (v) {
        return `
          <div class="flex items-start gap-4 rounded-2xl glass-card p-5 transition-all hover:border-brand-500/30" data-visit-id="${v.id}">
            <span class="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xl shrink-0"><i class="ri-calendar-2-line"></i></span>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-ink-900 dark:text-white">${v.property}</p>
              <p class="text-sm text-ink-500 dark:text-slate-400">${v.dateFormatted} with ${v.agent}</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span class="tbl-pill ${v.statusClass}"><i class="ri-checkbox-circle-line"></i> ${v.status}</span>
                <span class="tbl-pill pill-slate"><i class="${v.typeIcon || 'ri-home-4-line'}"></i> ${v.type}</span>
              </div>
            </div>
            <div class="flex flex-col gap-1 items-end shrink-0">
              <button type="button" class="btn-reschedule-visit text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition py-1">Reschedule</button>
              <button type="button" class="btn-cancel-visit text-xs font-bold text-ember-600 dark:text-ember-400 hover:text-ember-500 transition py-1">Cancel</button>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = headerHtml + (visitsCardsHtml || '<div class="rounded-2xl glass-card p-6 text-center text-ink-500">No upcoming visits scheduled. Pick a property to book a tour.</div>') + footerCardHtml;

      // Wire Reschedule buttons
      $$('.btn-reschedule-visit', container).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var card = btn.closest('[data-visit-id]');
          var vId = card ? card.getAttribute('data-visit-id') : null;
          var found = self.visits.find(function (v) { return v.id === vId; });
          if (found) {
            var dateInput = $('#visit-date');
            if (dateInput) dateInput.focus();
            if (window.CrestlineToast) window.CrestlineToast('Select a new date and time for ' + found.property + ' on the left.');
          }
        });
      });

      // Wire Cancel buttons
      $$('.btn-cancel-visit', container).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var card = btn.closest('[data-visit-id]');
          var vId = card ? card.getAttribute('data-visit-id') : null;
          if (vId) {
            self.visits = self.visits.filter(function (v) { return v.id !== vId; });
            try {
              localStorage.setItem('crestline_visits', JSON.stringify(self.visits));
            } catch (_) {}
            self.renderVisitsList();
            if (window.CrestlineToast) window.CrestlineToast('Visit appointment cancelled.', 'info');
          }
        });
      });
    },

    // 6. Offers & Negotiations System
    initOffers: function () {
      var approveBtn = $('#offers button.bg-brand-600');
      var msgAgentBtn = $('#offers button.border');

      if (approveBtn) {
        approveBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (window.CrestlinePopup) {
            window.CrestlinePopup({
              icon: '<i class="ri-hand-coin-line text-brand-600"></i>',
              title: 'Approve Counter-Offer #68490',
              message: 'Confirm acceptance of the seller counter-offer at $672,000 with a $6,000 closing credit on 16 Cedar Lane? This will trigger digital contract preparation with Maya Bennett.'
            });
            approveBtn.textContent = 'Counter Approved ✓';
            approveBtn.classList.remove('bg-brand-600');
            approveBtn.classList.add('bg-emerald-700', 'cursor-default');
            approveBtn.disabled = true;
          } else {
            if (window.CrestlineToast) window.CrestlineToast('Counter-offer approval registered! Forwarded to Maya Bennett.');
          }
        });
      }

      if (msgAgentBtn) {
        msgAgentBtn.addEventListener('click', function (e) {
          e.preventDefault();
          history.pushState(null, null, '#messages');
          var msgSec = $('#messages');
          if (msgSec) msgSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          var msgInput = $('#messages input[type="text"]');
          if (msgInput) {
            msgInput.value = 'Hi Maya, regarding Offer #68490 on 16 Cedar Lane...';
            msgInput.focus();
          }
        });
      }
    },

    // 7. Documents System
    initDocuments: function () {
      var self = this;
      var fileInput = $('#documents input[type="file"]');
      var dropzone = $('#documents .border-dashed');
      var tableBody = $('#documents table tbody');

      var defaultDocs = [
        {
          name: 'Pre-approval letter — Chase',
          type: 'Financial',
          date: 'Aug 28, 2026',
          status: 'Approved',
          statusClass: 'pill-green'
        },
        {
          name: "Driver's license (front)",
          type: 'ID',
          date: 'Aug 28, 2026',
          status: 'Approved',
          statusClass: 'pill-green'
        },
        {
          name: 'Pay stubs (last 2 months)',
          type: 'Financial',
          date: 'Sep 01, 2026',
          status: 'In review',
          statusClass: 'pill-amber'
        }
      ];

      try {
        var rawDocs = localStorage.getItem('crestline_customer_docs');
        this.documents = rawDocs ? JSON.parse(rawDocs) : defaultDocs;
      } catch (_) {
        this.documents = defaultDocs;
      }

      function addDocument(fileName) {
        var ext = fileName.split('.').pop().toUpperCase();
        var docType = (ext === 'PDF' ? 'Financial' : (ext === 'JPG' || ext === 'PNG' ? 'ID' : 'Legal'));
        var now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        var newDoc = {
          name: fileName,
          type: docType,
          date: now,
          status: 'In review',
          statusClass: 'pill-amber'
        };

        self.documents.unshift(newDoc);
        try {
          localStorage.setItem('crestline_customer_docs', JSON.stringify(self.documents));
        } catch (_) {}

        self.renderDocumentsTable();
        if (window.CrestlineToast) window.CrestlineToast('Uploaded ' + fileName + ' successfully. Agent notified!', 'success');
      }

      if (fileInput) {
        fileInput.addEventListener('change', function () {
          if (fileInput.files && fileInput.files.length > 0) {
            for (var i = 0; i < fileInput.files.length; i++) {
              addDocument(fileInput.files[i].name);
            }
            fileInput.value = '';
          }
        });
      }

      if (dropzone) {
        ['dragenter', 'dragover'].forEach(function (eventName) {
          dropzone.addEventListener(eventName, function (e) {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('border-brand-500', 'bg-brand-50/50', 'dark:bg-brand-500/10');
          });
        });

        ['dragleave', 'drop'].forEach(function (eventName) {
          dropzone.addEventListener(eventName, function (e) {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('border-brand-500', 'bg-brand-50/50', 'dark:bg-brand-500/10');
          });
        });

        dropzone.addEventListener('drop', function (e) {
          var dt = e.dataTransfer;
          var files = dt ? dt.files : null;
          if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              addDocument(files[i].name);
            }
          }
        });

        dropzone.addEventListener('click', function () {
          if (fileInput) fileInput.click();
        });
        dropzone.style.cursor = 'pointer';
      }

      this.renderDocumentsTable();
    },

    renderDocumentsTable: function () {
      var tableBody = $('#documents table tbody');
      if (!tableBody) return;

      tableBody.innerHTML = this.documents.map(function (d) {
        return `
          <tr>
            <td class="font-semibold text-ink-900 dark:text-white flex items-center gap-2">
              <i class="ri-file-text-line text-brand-600 dark:text-brand-400"></i> ${d.name}
            </td>
            <td>${d.type}</td>
            <td><span class="num">${d.date}</span></td>
            <td><span class="tbl-pill ${d.statusClass}"><i class="${d.status === 'Approved' ? 'ri-check-line' : 'ri-time-line'}"></i> ${d.status}</span></td>
            <td class="text-end">
              <button type="button" class="btn-download-doc text-brand-700 dark:text-brand-300 hover:text-brand-500 transition" aria-label="Download ${d.name}" title="Download ${d.name}" data-name="${d.name}">
                <i class="ri-download-2-line text-lg"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Wire download buttons
      $$('.btn-download-doc', tableBody).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var name = btn.getAttribute('data-name') || 'Document';
          if (window.CrestlineToast) window.CrestlineToast('Downloading ' + name + '...', 'info');
        });
      });
    },

    // 8. Live Agent Messaging Simulation
    initMessages: function () {
      var self = this;
      var msgForm = $('#messages form');
      var chatContainer = $('#messages .lg\\:col-span-2 .py-5');
      var msgInput = $('#messages input[type="text"]');

      if (!chatContainer) return;

      // Scroll to bottom helper
      function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }

      // Default smart replies for demo
      var autoReplies = [
        "I just checked with the listing agent — they confirmed the seller has reviewed our addendum and will reply before 5 PM today!",
        "Got it! I have updated your file and scheduled that viewing into our portal calendar.",
        "Absolutely. I'll send over the updated disclosure package right away.",
        "Great question! The HOA fee covers all exterior maintenance, trash/recycling, and access to the community pool and trails."
      ];
      var replyIndex = 0;

      if (msgInput) {
        msgInput.placeholder = 'Type a message to Maya Bennett...';
      }

      if (msgForm) {
        msgForm.addEventListener('submit', function (e) {
          e.preventDefault();
          var text = msgInput ? msgInput.value.trim() : '';
          if (!text) return;

          var timeStr = 'Today · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // Append customer bubble
          var userBubble = document.createElement('div');
          userBubble.className = 'flex items-start justify-end gap-2 animate-fade-in';
          userBubble.innerHTML = `
            <div class="bg-brand-600 text-white px-4 py-3 rounded-2xl rounded-br-md text-sm shadow-sm max-w-[80%]">
              ${text}
              <span class="block text-[10px] text-white/70 mt-1">${timeStr}</span>
            </div>
          `;
          chatContainer.appendChild(userBubble);
          msgInput.value = '';
          scrollToBottom();

          // Typing indicator simulation
          var typingBubble = document.createElement('div');
          typingBubble.id = 'agent-typing';
          typingBubble.className = 'flex items-start gap-2 animate-fade-in';
          typingBubble.innerHTML = `
            <img src="https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=120&h=120&crop=faces&q=80" alt="Maya Bennett" class="w-8 h-8 rounded-full object-cover mt-1 border border-brand-500/50">
            <div class="msg-bubble px-4 py-3 rounded-2xl text-xs text-ink-500 dark:text-slate-400 italic flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span> Maya is typing...
            </div>
          `;
          chatContainer.appendChild(typingBubble);
          scrollToBottom();

          setTimeout(function () {
            var typingEl = document.getElementById('agent-typing');
            if (typingEl) typingEl.remove();

            var replyText = autoReplies[replyIndex % autoReplies.length];
            replyIndex++;

            var agentBubble = document.createElement('div');
            agentBubble.className = 'flex items-start gap-2 animate-fade-in';
            agentBubble.innerHTML = `
              <img src="https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=120&h=120&crop=faces&q=80" alt="Maya Bennett" class="w-8 h-8 rounded-full object-cover mt-1 border border-brand-500/50">
              <div class="msg-bubble px-4 py-3 rounded-2xl text-sm text-ink-700 dark:text-slate-200 max-w-[80%] shadow-sm">
                ${replyText}
                <span class="block text-[10px] text-ink-400 mt-1">Just now</span>
              </div>
            `;
            chatContainer.appendChild(agentBubble);
            scrollToBottom();

            if (window.CrestlineToast) window.CrestlineToast('New reply from Maya Bennett');
          }, 1200);
        });
      }
    },

    // 9. Profile Settings Form
    initProfile: function () {
      var self = this;
      var form = $('#profile-settings-form');
      var cancelBtn = $('#profile-settings-form button[type="button"]');

      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var pFirst = $('#profile-first');
          var pLast = $('#profile-last');
          var pPhone = $('#profile-phone');
          var pAssigned = $('#profile-assigned');

          var first = pFirst ? pFirst.value.trim() : 'Elena';
          var last = pLast ? pLast.value.trim() : 'Vance';
          var phone = pPhone ? pPhone.value.trim() : '';

          if (first.length < 2) {
            if (window.CrestlineToast) window.CrestlineToast('First name must be at least 2 characters long.', 'error');
            if (pFirst) pFirst.focus();
            return;
          }

          if (last.length < 2) {
            if (window.CrestlineToast) window.CrestlineToast('Last name must be at least 2 characters long.', 'error');
            if (pLast) pLast.focus();
            return;
          }

          var fullName = (first + ' ' + last).trim();

          self.user.name = fullName;
          self.user.phone = phone;
          if (pAssigned) self.user.assignedAgent = pAssigned.value;

          if (window.CrestlineSession) {
            window.CrestlineSession.save(self.user);
          }

          self.syncUserUI();

          var successNotice = $('#profile-success');
          if (successNotice) {
            successNotice.classList.remove('hidden');
            setTimeout(function () { successNotice.classList.add('hidden'); }, 3500);
          }

          if (window.CrestlineToast) window.CrestlineToast('Profile changes saved successfully!', 'success');
        });
      }

      if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
          self.syncUserUI();
          if (window.CrestlineToast) window.CrestlineToast('Changes cancelled.', 'info');
        });
      }
    },

    // 10. Notifications
    initNotifications: function () {
      var notifBtn = $('header button[aria-label="Notifications"]');
      if (notifBtn) {
        notifBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (window.CrestlinePopup) {
            window.CrestlinePopup({
              icon: '<i class="ri-notification-3-line text-brand-600"></i>',
              title: 'Portal Notifications (3)',
              message: '<div class="text-left space-y-2.5 mt-2">' +
                '<div class="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-xs text-ink-700 dark:text-slate-300"><strong>Counter-offer received</strong> on 16 Cedar Lane ($672,000). <span class="block text-[10px] text-ink-400">2h ago</span></div>' +
                '<div class="p-2.5 rounded-xl bg-ink-50 dark:bg-white/5 text-xs text-ink-700 dark:text-slate-300"><strong>Viewing confirmed</strong> at 3 BrickStone Row for Sat 10:30. <span class="block text-[10px] text-ink-400">5h ago</span></div>' +
                '<div class="p-2.5 rounded-xl bg-ink-50 dark:bg-white/5 text-xs text-ink-700 dark:text-slate-300"><strong>Document approved:</strong> Pre-approval letter — Chase. <span class="block text-[10px] text-ink-400">Yesterday</span></div>' +
                '</div>'
            });
          }
        });
      }
    },

    // 11. In-page Action Shortcuts
    initActionShortcuts: function () {
      // Recent activity items click navigation
      var recentItems = $$('#overview .mt-4 > div');
      recentItems.forEach(function (item, idx) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function () {
          if (idx === 0) {
            history.pushState(null, null, '#offers');
            $('#offers').scrollIntoView({ behavior: 'smooth' });
          } else if (idx === 1) {
            history.pushState(null, null, '#visits');
            $('#visits').scrollIntoView({ behavior: 'smooth' });
          } else if (idx === 2) {
            history.pushState(null, null, '#documents');
            $('#documents').scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    }
  };

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { CustomerDash.init(); });
  } else {
    CustomerDash.init();
  }

  window.CustomerDash = CustomerDash;
})();
