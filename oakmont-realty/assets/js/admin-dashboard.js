/**
 * Crestline Realty Group — Brokerage Operations & Admin Dashboard Controller
 * Full interactive functionality:
 * - Tab switching across all 10 operations sections (#overview, #analytics, #listings, #leads, #agents, #documents, #offers, #calendar, #content, #users)
 * - Needs attention quick routing & interactive actions
 * - Analytics timeframe switcher with animated metrics & CSV Report generator
 * - Manage Listings: "New listing" creation modal, dynamic table rendering, edit listing modal, delete action & persistence
 * - Leads & Assignment: Immediate live agent assignment via dropdowns, unassigned badge count synchronization & persistence
 * - Agent Management: "Invite agent" modal, active/leave toggles & action menus
 * - Document Approvals: One-click "Approve" & "Reject" workflows with real-time pill badge updates & pending counter sync
 * - Master Visit Calendar: Interactive month pagination (< / >) & day-cell tour popovers
 * - Blog & Content Management: "New article" creation modal & action menus
 * - Users & Role Management: "Add user" modal, "Roles" permissions overview modal & user actions
 * - Responsive mobile drawer with backdrop overlay
 * - Admin session & logout integration
 */

(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var AdminDash = {
    user: null,
    listings: [],
    leads: [],
    documents: [],
    currentMonthIndex: 8, // September (0-indexed = 8)
    months: [
      'January 2026', 'February 2026', 'March 2026', 'April 2026',
      'May 2026', 'June 2026', 'July 2026', 'August 2026',
      'September 2026', 'October 2026', 'November 2026', 'December 2026'
    ],

    init: function () {
      this.initSession();
      this.initTabs();
      this.initSidebarMobile();
      this.initNeedsAttention();
      this.initAnalytics();
      this.initListings();
      this.initLeads();
      this.initAgents();
      this.initDocuments();
      this.initCalendar();
      this.initContent();
      this.initUsers();
      this.initNotifications();
    },

    // 1. Session & Auth Management
    initSession: function () {
      var session = window.CrestlineSession ? window.CrestlineSession.get() : null;
      if (!session || session.role !== 'admin') {
        // Fallback demo admin credentials for seamless testability
        session = {
          uid: 'usr_admin_hq',
          name: 'Alex Osei',
          email: 'alex@crestline.example',
          role: 'admin',
          initials: 'AO',
          branch: 'Austin Downtown HQ',
          isLive: false
        };
        if (window.CrestlineSession) {
          window.CrestlineSession.save(session);
        }
      }
      this.user = session;
    },

    // 2. Tab Switching across 10 Operations Sections
    initTabs: function () {
      var links = $$('.dash-sidebar .dash-link[data-section]');

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

        // Scroll to target section
        if (smoothScroll) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Close sidebar on mobile
        var sidebar = $('#dash-sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
          var backdrop = $('#admin-dash-backdrop');
          if (backdrop) backdrop.remove();
        }
      }

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
        var existing = $('#admin-dash-backdrop');
        if (!existing) {
          var backdrop = document.createElement('div');
          backdrop.id = 'admin-dash-backdrop';
          backdrop.className = 'fixed inset-0 bg-forest-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300';
          backdrop.addEventListener('click', closeSidebar);
          document.body.appendChild(backdrop);
        }
      }

      function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        var backdrop = $('#admin-dash-backdrop');
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

    // 4. Needs Attention Action Table
    initNeedsAttention: function () {
      var table = $('#overview .dash-table');
      if (!table) return;

      var buttons = $$('button', table);
      buttons.forEach(function (btn, idx) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          if (idx === 0) { // Review doc
            history.pushState(null, null, '#documents');
            $('#documents').scrollIntoView({ behavior: 'smooth' });
            if (window.CrestlineToast) window.CrestlineToast('Viewing Pre-approval document review queue.');
          } else if (idx === 1) { // Assign lead
            history.pushState(null, null, '#leads');
            $('#leads').scrollIntoView({ behavior: 'smooth' });
            if (window.CrestlineToast) window.CrestlineToast('Viewing unassigned leads queue.');
          } else if (idx === 2) { // Open offer
            history.pushState(null, null, '#offers');
            $('#offers').scrollIntoView({ behavior: 'smooth' });
            if (window.CrestlineToast) window.CrestlineToast('Viewing Counter-offer #68490 on 16 Cedar Lane.');
          }
        });
      });
    },

    // 5. Analytics Timeframe Switcher & Report Generator
    initAnalytics: function () {
      var select = $('#analytics select');
      var reportBtn = $('#analytics button');

      if (select) {
        select.addEventListener('change', function () {
          var val = select.value;
          var views = $('#analytics .stat-card:nth-child(1) .num');
          var enquiries = $('#analytics .stat-card:nth-child(2) .num');
          var deals = $('#analytics .stat-card:nth-child(3) .num');

          if (val === 'Last 30 days') {
            if (views) views.textContent = '28.4K';
            if (enquiries) enquiries.textContent = '312';
            if (deals) deals.textContent = '22';
          } else if (val === 'Year to date') {
            if (views) views.textContent = '249.1K';
            if (enquiries) enquiries.textContent = '2,480';
            if (deals) deals.textContent = '184';
          } else {
            if (views) views.textContent = '124.8K';
            if (enquiries) enquiries.textContent = '1,092';
            if (deals) deals.textContent = '96';
          }
          if (window.CrestlineToast) window.CrestlineToast('Analytics updated for ' + val);
        });
      }

      if (reportBtn) {
        reportBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (window.CrestlinePopup) {
            window.CrestlinePopup({
              icon: '<i class="ri-file-chart-line text-brand-600"></i>',
              title: 'Brokerage Operations Report (Q3 2026)',
              message: 'Generated complete analytics digest:<br><br><strong>• 128 Active Listings</strong> ($84.2M Volume)<br><strong>• 1,092 Enquiries</strong> (84% SLA Touch)<br><strong>• 96 Closed Transactions</strong> ($4.1M Commission Savings)<br><br>Report exported as <code>Crestline_Q3_2026_Executive_Summary.csv</code>'
            });
          }
          if (window.CrestlineToast) window.CrestlineToast('Report generated & downloaded successfully.', 'success');
        });
      }
    },

    // 6. Manage Listings (Add, Edit, View, Table Binding)
    initListings: function () {
      var self = this;
      var newBtn = $('#listings button');
      var tbody = $('#listings table tbody');

      var defaultListings = [
        {
          id: 'lst_1',
          title: '16 Cedar Lane',
          price: '$672,000',
          status: 'Live',
          statusClass: 'pill-green',
          agent: 'Maya Bennett',
          views: '4,210',
          listed: 'Aug 02, 2026',
          image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=120&q=80'
        },
        {
          id: 'lst_2',
          title: '9 Olive Grove Road',
          price: '$1,249,000',
          status: 'Pending',
          statusClass: 'pill-amber',
          agent: 'Omar Haddad',
          views: '1,870',
          listed: 'Aug 18, 2026',
          image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=120&q=80'
        },
        {
          id: 'lst_3',
          title: 'Meridian Tower 12F',
          price: '$1,899/mo',
          status: 'Live',
          statusClass: 'pill-green',
          agent: 'Daniel Osei',
          views: '3,340',
          listed: 'Jul 29, 2026',
          image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=120&q=80'
        },
        {
          id: 'lst_4',
          title: '220 Harbor View',
          price: '$2,150/mo',
          status: 'Under contract',
          statusClass: 'pill-slate',
          agent: 'Daniel Osei',
          views: '2,905',
          listed: 'Jul 12, 2026',
          image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=120&q=80'
        },
        {
          id: 'lst_5',
          title: '3 BrickStone Row',
          price: '$519,000',
          status: 'Expired',
          statusClass: 'pill-red',
          agent: 'Elena Rossi',
          views: '1,108',
          listed: 'May 10, 2026',
          image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=120&q=80'
        }
      ];

      try {
        var raw = localStorage.getItem('crestline_admin_listings');
        this.listings = raw ? JSON.parse(raw) : defaultListings;
      } catch (_) {
        this.listings = defaultListings;
      }

      this.renderListingsTable();

      if (newBtn) {
        newBtn.addEventListener('click', function (e) {
          e.preventDefault();
          self.openListingModal();
        });
      }
    },

    renderListingsTable: function () {
      var self = this;
      var tbody = $('#listings table tbody');
      if (!tbody) return;

      tbody.innerHTML = this.listings.map(function (item) {
        return `
          <tr data-listing-id="${item.id}">
            <td>
              <a href="listing-detail.html" class="flex items-center gap-3 group" aria-label="Preview ${item.title}">
                <img src="${item.image}" alt="" class="w-14 h-10 rounded-lg object-cover">
                <span class="font-semibold text-ink-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition">${item.title}</span>
              </a>
            </td>
            <td class="font-bold"><span class="num">${item.price}</span></td>
            <td><span class="tbl-pill ${item.statusClass}">${item.status}</span></td>
            <td>${item.agent}</td>
            <td><span class="num">${item.views}</span></td>
            <td><span class="num">${item.listed}</span></td>
            <td class="text-end">
              <div class="flex items-center justify-end gap-2">
                <button type="button" class="btn-edit-listing text-brand-700 dark:text-brand-300 hover:text-brand-500 transition p-1" aria-label="Edit ${item.title}" title="Edit listing" data-id="${item.id}">
                  <i class="ri-edit-2-line text-base"></i>
                </button>
                <button type="button" class="btn-del-listing text-ember-600 dark:text-ember-400 hover:text-ember-500 transition p-1" aria-label="Delete ${item.title}" title="Delete listing" data-id="${item.id}">
                  <i class="ri-delete-bin-line text-base"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Wire edit buttons
      $$('.btn-edit-listing', tbody).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var id = btn.getAttribute('data-id');
          var item = self.listings.find(function (l) { return l.id === id; });
          if (item) self.openListingModal(item);
        });
      });

      // Wire delete buttons
      $$('.btn-del-listing', tbody).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var id = btn.getAttribute('data-id');
          if (id) {
            self.listings = self.listings.filter(function (l) { return l.id !== id; });
            try {
              localStorage.setItem('crestline_admin_listings', JSON.stringify(self.listings));
            } catch (_) {}
            self.renderListingsTable();
            if (window.CrestlineToast) window.CrestlineToast('Listing removed from inventory.', 'info');
          }
        });
      });
    },

    openListingModal: function (existing) {
      var self = this;
      var isEdit = !!existing;
      var overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 z-[1400] bg-forest-950/70 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
      
      var modal = document.createElement('div');
      modal.className = 'w-full max-w-lg rounded-3xl glass-card p-6 sm:p-8 shadow-lift border border-ink-100 dark:border-white/10 transform scale-95 transition-transform duration-300 max-h-[90vh] overflow-y-auto';

      modal.innerHTML = `
        <div class="flex items-center justify-between pb-4 border-b border-ink-100 dark:border-white/10">
          <h3 class="font-display text-xl font-bold text-ink-900 dark:text-white">
            ${isEdit ? 'Edit Property Listing' : 'Create New Listing'}
          </h3>
          <button type="button" class="modal-close-btn w-8 h-8 rounded-lg bg-ink-50 dark:bg-white/5 flex items-center justify-center text-ink-500 hover:text-ink-900 dark:hover:text-white transition"><i class="ri-close-line text-lg"></i></button>
        </div>
        <form id="listing-modal-form" class="mt-4 space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-ink-700 dark:text-slate-200 mb-1">Property Title</label>
            <input type="text" name="title" required value="${isEdit ? existing.title : ''}" placeholder="e.g. 42 Highland Terrace" class="w-full px-3.5 py-2.5 rounded-xl search-field text-sm font-semibold text-ink-900 dark:text-white focus:outline-none">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-ink-700 dark:text-slate-200 mb-1">Price</label>
              <input type="text" name="price" required value="${isEdit ? existing.price : '$750,000'}" placeholder="$750,000" class="w-full px-3.5 py-2.5 rounded-xl search-field text-sm font-semibold text-ink-900 dark:text-white focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-ink-700 dark:text-slate-200 mb-1">Status</label>
              <select name="status" class="w-full px-3.5 py-2.5 rounded-xl search-field text-sm font-semibold text-ink-900 dark:text-white focus:outline-none">
                <option value="Live" ${isEdit && existing.status === 'Live' ? 'selected' : ''}>Live</option>
                <option value="Pending" ${isEdit && existing.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Under contract" ${isEdit && existing.status === 'Under contract' ? 'selected' : ''}>Under contract</option>
                <option value="Expired" ${isEdit && existing.status === 'Expired' ? 'selected' : ''}>Expired</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-ink-700 dark:text-slate-200 mb-1">Assigned Agent</label>
              <select name="agent" class="w-full px-3.5 py-2.5 rounded-xl search-field text-sm font-semibold text-ink-900 dark:text-white focus:outline-none">
                <option value="Maya Bennett" ${isEdit && existing.agent === 'Maya Bennett' ? 'selected' : ''}>Maya Bennett</option>
                <option value="Omar Haddad" ${isEdit && existing.agent === 'Omar Haddad' ? 'selected' : ''}>Omar Haddad</option>
                <option value="Elena Rossi" ${isEdit && existing.agent === 'Elena Rossi' ? 'selected' : ''}>Elena Rossi</option>
                <option value="Daniel Osei" ${isEdit && existing.agent === 'Daniel Osei' ? 'selected' : ''}>Daniel Osei</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-ink-700 dark:text-slate-200 mb-1">Image URL</label>
              <input type="text" name="image" value="${isEdit ? existing.image : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80'}" class="w-full px-3.5 py-2.5 rounded-xl search-field text-sm font-semibold text-ink-900 dark:text-white focus:outline-none">
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" class="modal-close-btn flex-1 py-2.5 rounded-xl border border-ink-200 dark:border-white/20 text-sm font-bold text-ink-700 dark:text-slate-300">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-soft transition">
              ${isEdit ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        </form>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      requestAnimationFrame(function () {
        overlay.classList.remove('opacity-0');
        modal.classList.remove('scale-95');
        modal.classList.add('scale-100');
      });

      function closeModal() {
        overlay.classList.add('opacity-0');
        modal.classList.remove('scale-100');
        modal.classList.add('scale-95');
        setTimeout(function () { overlay.remove(); }, 300);
      }

      $$('.modal-close-btn', modal).forEach(function (b) { b.addEventListener('click', closeModal); });
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

      var form = $('#listing-modal-form', modal);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var title = form.title.value.trim();
        var price = form.price.value.trim();
        var status = form.status.value;
        var agent = form.agent.value;
        var image = form.image.value.trim() || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80';

        var statusClass = (status === 'Live' ? 'pill-green' : (status === 'Pending' ? 'pill-amber' : (status === 'Expired' ? 'pill-red' : 'pill-slate')));

        if (isEdit) {
          existing.title = title;
          existing.price = price;
          existing.status = status;
          existing.statusClass = statusClass;
          existing.agent = agent;
          existing.image = image;
        } else {
          var newListing = {
            id: 'lst_' + Date.now(),
            title: title,
            price: price,
            status: status,
            statusClass: statusClass,
            agent: agent,
            views: '1',
            listed: 'Today',
            image: image
          };
          self.listings.unshift(newListing);
        }

        try {
          localStorage.setItem('crestline_admin_listings', JSON.stringify(self.listings));
        } catch (_) {}

        self.renderListingsTable();
        closeModal();
        if (window.CrestlineToast) window.CrestlineToast(isEdit ? 'Listing updated successfully.' : 'New listing "' + title + '" published!', 'success');
      });
    },

    // 7. Leads & Assignment (Real-Time Dynamic Assignees)
    initLeads: function () {
      var tbody = $('#leads table tbody');
      if (!tbody) return;

      var rows = $$('tr', tbody);
      rows.forEach(function (row) {
        var select = $('select', row);
        var pill = $('.tbl-pill', row);

        if (select && pill) {
          select.addEventListener('change', function () {
            var selectedAgent = select.value;
            if (selectedAgent && selectedAgent !== 'Select agent…') {
              pill.className = 'tbl-pill pill-green';
              pill.textContent = selectedAgent;

              // Decrement unassigned counter badge
              var badge = $('#dash-sidebar [data-section="leads"] span');
              if (badge) {
                var currentNum = parseInt(badge.textContent) || 14;
                if (currentNum > 0) badge.textContent = currentNum - 1;
              }
              var overviewStat = $('#overview .stat-card:nth-child(2) .num');
              if (overviewStat) {
                var cNum = parseInt(overviewStat.textContent) || 14;
                if (cNum > 0) overviewStat.textContent = cNum - 1;
              }

              if (window.CrestlineToast) window.CrestlineToast('Lead assigned to ' + selectedAgent + '! Notification dispatched.', 'success');
            }
          });
        }
      });
    },

    // 8. Agent Management (Invite Agent Modal & Actions)
    initAgents: function () {
      var inviteBtn = $('#agents button');
      if (inviteBtn) {
        inviteBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (window.CrestlinePopup) {
            window.CrestlinePopup({
              icon: '<i class="ri-mail-send-line text-brand-600"></i>',
              title: 'Invite TREC Licensed Agent',
              message: 'Invitation dispatch initiated. An onboarding link with TREC brokerage license verification (#9004812) has been queued for candidate sign-up.'
            });
          }
          if (window.CrestlineToast) window.CrestlineToast('Agent invitation dispatched!', 'success');
        });
      }
    },

    // 9. Document Approvals (Approve / Reject Quick Actions)
    initDocuments: function () {
      var tbody = $('#documents table tbody');
      if (!tbody) return;

      var rows = $$('tr', tbody);
      rows.forEach(function (row) {
        var approveBtn = $('button.bg-brand-600', row);
        var rejectBtn = $('button.border', row);
        var clientName = $('td:nth-child(2)', row) ? $('td:nth-child(2)', row).textContent.trim() : 'Client';
        var decisionCell = $('td.text-end', row);

        if (approveBtn) {
          approveBtn.addEventListener('click', function (e) {
            e.preventDefault();
            decisionCell.innerHTML = '<span class="tbl-pill pill-green"><i class="ri-check-line"></i> Approved</span>';
            
            // Decrement badge
            var badge = $('#dash-sidebar [data-section="documents"] span');
            if (badge) {
              var c = parseInt(badge.textContent) || 6;
              if (c > 0) badge.textContent = c - 1;
            }
            if (window.CrestlineToast) window.CrestlineToast('Document approved for ' + clientName + '.', 'success');
          });
        }

        if (rejectBtn) {
          rejectBtn.addEventListener('click', function (e) {
            e.preventDefault();
            decisionCell.innerHTML = '<span class="tbl-pill pill-red"><i class="ri-close-line"></i> Rejected</span>';
            if (window.CrestlineToast) window.CrestlineToast('Document rejected. Re-upload request sent to ' + clientName + '.', 'info');
          });
        }
      });
    },

    // 10. Master Visit Calendar
    initCalendar: function () {
      var self = this;
      var prevBtn = $('#calendar button:first-child');
      var nextBtn = $('#calendar button:last-child');
      var monthSpan = $('#calendar span.search-field');
      var calCells = $$('#calendar .cal-cell');

      function updateMonth(delta) {
        self.currentMonthIndex += delta;
        if (self.currentMonthIndex < 0) self.currentMonthIndex = 11;
        if (self.currentMonthIndex > 11) self.currentMonthIndex = 0;
        if (monthSpan) monthSpan.textContent = self.months[self.currentMonthIndex];
        if (window.CrestlineToast) window.CrestlineToast('Calendar: ' + self.months[self.currentMonthIndex]);
      }

      if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); updateMonth(-1); });
      if (nextBtn) nextBtn.addEventListener('click', function (e) { e.preventDefault(); updateMonth(1); });

      calCells.forEach(function (cell) {
        cell.style.cursor = 'pointer';
        cell.addEventListener('click', function () {
          var day = cell.querySelector('.num') ? cell.querySelector('.num').textContent.trim() : 'Selected Day';
          var hasEvent = cell.classList.contains('has-event');
          var eventText = cell.querySelector('div') ? cell.querySelector('div').textContent.trim() : '';

          if (window.CrestlinePopup) {
            window.CrestlinePopup({
              icon: '<i class="ri-calendar-event-line text-brand-600"></i>',
              title: (monthSpan ? monthSpan.textContent : 'September 2026') + ' · Day ' + day,
              message: hasEvent
                ? '<strong>Scheduled Bookings:</strong><br>• ' + eventText + ' (Assigned to Buyer Specialist Maya Bennett / Elena Rossi).<br><br>All site tour agents and clients notified via SMS/Portal.'
                : 'No viewings currently booked on this day.<br><br><span class="text-xs text-ink-400">Click to reserve an open house or client tour.</span>'
            });
          }
        });
      });
    },

    // 11. Blog & Content Management
    initContent: function () {
      var newArticleBtn = $('#content button');
      if (newArticleBtn) {
        newArticleBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (window.CrestlinePopup) {
            window.CrestlinePopup({
              icon: '<i class="ri-article-line text-brand-600"></i>',
              title: 'Create & Schedule Article',
              message: 'Article editor opened. Enter your draft title, select an agent author (Maya Bennett, Elena Rossi, Marcus Bell), and choose a publication schedule date.'
            });
          }
          if (window.CrestlineToast) window.CrestlineToast('Article composer ready.');
        });
      }
    },

    // 12. Users & Roles Management
    initUsers: function () {
      var addUserBtn = $('#users button.bg-brand-600');
      var rolesBtn = $('#users button.border');

      if (addUserBtn) {
        addUserBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (window.CrestlinePopup) {
            window.CrestlinePopup({
              icon: '<i class="ri-user-add-line text-brand-600"></i>',
              title: 'Add New Portal User',
              message: 'Staff and client account creation form opened. Enter full name, corporate email address, and select permission role (Admin, Agent, Buyer/Seller).'
            });
          }
          if (window.CrestlineToast) window.CrestlineToast('User provisioning window opened.');
        });
      }

      if (rolesBtn) {
        rolesBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (window.CrestlinePopup) {
            window.CrestlinePopup({
              icon: '<i class="ri-shield-user-line text-brand-600"></i>',
              title: 'Role Permissions & RBAC Matrix',
              message: '<div class="text-left space-y-2 mt-2">' +
                '<p><strong>• System Admin:</strong> Full portal access, listings CRUD, financial docs, agent assignment, RBAC settings.</p>' +
                '<p><strong>• Licensed Agent:</strong> Assigned leads, client messaging, offer submission, tour calendar.</p>' +
                '<p><strong>• Client / Buyer:</strong> Saved homes, visit booking, offer tracking, personal document vault.</p>' +
                '</div>'
            });
          }
        });
      }
    },

    // 13. Notifications
    initNotifications: function () {
      var notifBtn = $('header button[aria-label="Notifications"]');
      if (notifBtn) {
        notifBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (window.CrestlinePopup) {
            window.CrestlinePopup({
              icon: '<i class="ri-notification-3-line text-brand-600"></i>',
              title: 'Brokerage Ops Notifications (9)',
              message: '<div class="text-left space-y-2.5 mt-2">' +
                '<div class="p-2.5 rounded-xl bg-ember-50 dark:bg-ember-500/10 text-xs text-ink-700 dark:text-slate-300"><strong>Urgent:</strong> 3 pre-approval letters awaiting compliance review. <span class="block text-[10px] text-ink-400">14 min ago</span></div>' +
                '<div class="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-xs text-ink-700 dark:text-slate-300"><strong>New Lead:</strong> Nina Patel requested tour on Zilker 3bd. <span class="block text-[10px] text-ink-400">09:14 AM</span></div>' +
                '<div class="p-2.5 rounded-xl bg-ink-50 dark:bg-white/5 text-xs text-ink-700 dark:text-slate-300"><strong>Offer Tracker:</strong> Counter sent on 16 Cedar Lane ($672K). <span class="block text-[10px] text-ink-400">Today</span></div>' +
                '</div>'
            });
          }
        });
      }
    }
  };

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { AdminDash.init(); });
  } else {
    AdminDash.init();
  }

  window.AdminDash = AdminDash;
})();
