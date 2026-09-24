/* Crestline Realty — Main JS (v1) */
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
  const ls = (k, v) => { try { if (v !== undefined) localStorage.setItem(k, v); else return localStorage.getItem(k); } catch (_) {} };

  /* ---------- Apply saved theme & dir before paint ---------- */
  const savedTheme = ls('oak-theme') || 'light';
  const savedDir = ls('oak-dir') || 'ltr';
  document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  document.documentElement.setAttribute('dir', savedDir);
  document.documentElement.setAttribute('lang', savedDir === 'rtl' ? 'ar' : 'en');

  /* ---------- Theme toggle ---------- */
  const themeBtn = $('#theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    ls('oak-theme', dark ? 'dark' : 'light');
  });

  /* ---------- RTL / Language toggle ---------- */
  const dirBtns = $$('#dir-toggle, #dir-toggle-mobile');
  dirBtns.forEach(btn => btn.addEventListener('click', () => {
    const rtl = document.documentElement.getAttribute('dir') === 'rtl';
    document.documentElement.setAttribute('dir', rtl ? 'ltr' : 'rtl');
    document.documentElement.setAttribute('lang', rtl ? 'en' : 'ar');
    ls('oak-dir', rtl ? 'ltr' : 'rtl');
    const m = $('#mobile-menu');
    if (m) m.classList.add('hidden');
  }));

  /* ---------- Header shrink on scroll ---------- */
  const header = $('#site-header');
  if (header) {
    const checkScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const mobileBtn = $('#mobile-menu-btn');
  const mobileMenu = $('#mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden');
      // toggle icon
      const i = $('i', mobileBtn);
      if (i) i.className = open ? 'ri-menu-3-line text-2xl' : 'ri-close-line text-2xl';
    });
    // collapse sub-toggles inside mobile
    $$('[data-mobile-toggle]', mobileMenu).forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.getAttribute('data-mobile-toggle'));
        if (target) target.classList.toggle('hidden');
      });
    });
  }

  /* ---------- Toast notification helper ---------- */
  function showToast(msg, icon = 'ri-information-line', dur = 3200) {
    let container = $('#toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<i class="${icon} text-brand-400 text-lg shrink-0"></i><span>${msg}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, dur);
  }
  window.showToast = showToast;

  /* ---------- Session & Auth helpers ---------- */
  window.CrestlineSession = {
    get: function () {
      try {
        var data = localStorage.getItem('crestline_session') || localStorage.getItem('crestline-session');
        return data ? JSON.parse(data) : null;
      } catch (e) {
        return null;
      }
    },
    save: function (obj) {
      try {
        localStorage.setItem('crestline_session', JSON.stringify(obj));
        localStorage.setItem('crestline-session', JSON.stringify(obj));
        window.dispatchEvent(new CustomEvent('crestline_auth_changed', { detail: { user: obj } }));
      } catch (e) {}
    },
    set: function (obj) {
      this.save(obj);
    },
    clear: function () {
      try {
        localStorage.removeItem('crestline_session');
        localStorage.removeItem('crestline-session');
        window.dispatchEvent(new CustomEvent('crestline_auth_changed', { detail: { user: null } }));
      } catch (e) {}
    }
  };

  /* ---------- Toast notification helper ---------- */
  window.CrestlineToast = function (message, type) {
    type = type || 'success';
    var isError = type === 'error';
    var isInfo = type === 'info';
    var toast = document.createElement('div');
    var bgClass = isError ? 'bg-red-700' : (isInfo ? 'bg-ember-600' : 'bg-brand-600');
    var iconClass = isError ? 'ri-error-warning-line' : (isInfo ? 'ri-information-line' : 'ri-checkbox-circle-line');
    toast.className = 'fixed bottom-6 start-1/2 -translate-x-1/2 z-[1300] px-5 py-3 rounded-full text-white font-bold text-sm shadow-2xl flex items-center gap-2 transition-all duration-300 pointer-events-auto opacity-0 translate-y-4 ' + bgClass;
    toast.innerHTML = '<i class="' + iconClass + ' text-lg"></i><span>' + message + '</span>';
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.remove('opacity-0', 'translate-y-4');
      toast.classList.add('opacity-100', 'translate-y-0');
    });
    setTimeout(function () {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'translate-y-4');
      setTimeout(function () { toast.remove(); }, 350);
    }, 3200);
  };

  /* ---------- Popup helper ---------- */
  window.CrestlinePopup = function (opts) {
    opts = opts || {};
    var overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[1400] bg-forest-950/70 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
    var box = document.createElement('div');
    box.className = 'w-full max-w-md rounded-3xl glass-card p-6 sm:p-8 text-center shadow-lift border border-ink-100 dark:border-white/10 transform scale-95 transition-transform duration-300';
    box.innerHTML =
      '<div class="text-4xl mb-3">' + (opts.icon || '<i class="ri-information-line text-brand-600"></i>') + '</div>' +
      '<h3 class="font-display text-xl font-bold text-ink-900 dark:text-white">' + (opts.title || 'Notice') + '</h3>' +
      '<p class="mt-2 text-sm text-ink-500 dark:text-slate-400 leading-relaxed">' + (opts.message || '') + '</p>' +
      '<button type="button" class="popup-close-btn mt-6 w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-soft transition">Understood</button>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.classList.remove('opacity-0');
      box.classList.remove('scale-95');
      box.classList.add('scale-100');
    });

    var close = function () {
      overlay.classList.add('opacity-0');
      box.classList.remove('scale-100');
      box.classList.add('scale-95');
      setTimeout(function () { overlay.remove(); }, 300);
    };

    var btn = box.querySelector('.popup-close-btn');
    if (btn) btn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function h(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', h); }
    });
  };

  /* ---------- Update Navbar Login buttons based on active session ---------- */
  function updateNavbarAuth() {
    var session = window.CrestlineSession ? window.CrestlineSession.get() : null;
    var desktopBtn = $('#login-btn');
    var mobileBtn = $('#login-btn-mobile');

    if (session && session.email) {
      var isAdmin = session.role === 'admin';
      var label = isAdmin ? 'Admin Hub' : 'My Portal';
      var icon = isAdmin ? 'ri-shield-user-line' : 'ri-user-smile-line';
      var targetUrl = isAdmin ? 'admin-dashboard.html' : 'customer-dashboard.html';
      var bgClass = isAdmin ? 'bg-ember-600 hover:bg-ember-500' : 'bg-brand-600 hover:bg-brand-500';

      if (desktopBtn) {
        desktopBtn.href = targetUrl;
        desktopBtn.className = 'hidden lg:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white ' + bgClass + ' shadow-soft transition';
        desktopBtn.innerHTML = '<i class="' + icon + '"></i><span>' + label + '</span>';
      }
      if (mobileBtn) {
        mobileBtn.href = targetUrl;
        mobileBtn.className = 'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-white text-sm font-semibold ' + bgClass + ' shadow-soft transition';
        mobileBtn.innerHTML = '<i class="' + icon + '"></i> ' + label;
      }
    } else {
      if (desktopBtn) {
        desktopBtn.href = 'login.html';
        desktopBtn.className = 'hidden lg:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-soft transition';
        desktopBtn.innerHTML = '<i class="ri-user-line"></i><span>Login</span>';
      }
      if (mobileBtn) {
        mobileBtn.href = 'login.html';
        mobileBtn.className = 'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold shadow-soft transition';
        mobileBtn.innerHTML = '<i class="ri-user-line"></i> Login';
      }
    }
  }
  updateNavbarAuth();
  window.addEventListener('crestline_auth_changed', updateNavbarAuth);

  /* ---------- Universal Validation Helpers ---------- */
  function isValidEmailDomain(email) {
    if (!email || typeof email !== 'string') return false;
    var parts = email.trim().split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
    var domain = parts[1];
    // Strictly reject uppercase letters in domain (e.g. GMAIL.COM or Gmail.com)
    if (/[A-Z]/.test(domain)) {
      return false;
    }
    return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain);
  }
  window.isValidEmailDomain = isValidEmailDomain;

  function isValidName(name) {
    if (!name || typeof name !== 'string') return false;
    var trimmed = name.trim();
    // Must be more than 1 letter (at least 2 characters)
    return trimmed.length >= 2 && /^[a-zA-Z\s'-]{2,}$/.test(trimmed);
  }
  window.isValidName = isValidName;

  // Auto-sanitize email inputs on blur/input
  document.addEventListener('blur', function (e) {
    if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'email') {
      var val = e.target.value.trim();
      var parts = val.split('@');
      if (parts.length === 2 && /[A-Z]/.test(parts[1])) {
        // Lowercase domain part automatically on blur
        e.target.value = parts[0] + '@' + parts[1].toLowerCase();
      }
    }
  }, true);

  /* ---------- Auth Form Handlers (Login & Register) ---------- */
  $$('[data-auth]').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var mode = form.getAttribute('data-auth');
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

      if (mode === 'register') {
        var role = (form.querySelector('[name="role"]') ? form.querySelector('[name="role"]').value : 'user');
        var firstInput = form.querySelector('[name="first"]');
        var lastInput = form.querySelector('[name="last"]');
        var emailInput = form.querySelector('[name="email"]');
        var passInput = form.querySelector('[name="pass"]');
        var phoneInput = form.querySelector('[name="phone"]');

        var first = firstInput ? firstInput.value.trim() : '';
        var last = lastInput ? lastInput.value.trim() : '';
        var email = emailInput ? emailInput.value.trim() : '';
        var pass = passInput ? passInput.value : '';
        var phone = phoneInput ? phoneInput.value.trim() : '';

        // Validate first and last names (must be more than 1 letter)
        if (!first || first.length < 2) {
          if (window.CrestlineToast) window.CrestlineToast('First name must be at least 2 letters long.', 'error');
          if (firstInput) firstInput.focus();
          return;
        }
        if (!isValidName(first)) {
          if (window.CrestlineToast) window.CrestlineToast('Please enter a valid first name (letters only, min 2 characters).', 'error');
          if (firstInput) firstInput.focus();
          return;
        }

        if (!last || last.length < 2) {
          if (window.CrestlineToast) window.CrestlineToast('Last name must be at least 2 letters long.', 'error');
          if (lastInput) lastInput.focus();
          return;
        }
        if (!isValidName(last)) {
          if (window.CrestlineToast) window.CrestlineToast('Please enter a valid last name (letters only, min 2 characters).', 'error');
          if (lastInput) lastInput.focus();
          return;
        }

        var fullName = (first + ' ' + last).trim() || email.split('@')[0];

        // Validate Email
        if (!email) {
          if (window.CrestlineToast) window.CrestlineToast('Please enter your email address.', 'error');
          if (emailInput) emailInput.focus();
          return;
        }

        var domainPart = email.split('@')[1] || '';
        if (/[A-Z]/.test(domainPart)) {
          if (window.CrestlineToast) window.CrestlineToast('Email domain must be in lowercase only (e.g., @gmail.com).', 'error');
          if (emailInput) emailInput.focus();
          return;
        }

        if (!isValidEmailDomain(email)) {
          if (window.CrestlineToast) window.CrestlineToast('Please enter a valid email address with a lowercase domain.', 'error');
          if (emailInput) emailInput.focus();
          return;
        }

        // Lowercase full email for storage
        email = email.toLowerCase();

        if (pass.length < 6) {
          if (window.CrestlineToast) window.CrestlineToast('Password must be at least 6 characters.', 'error');
          if (passInput) passInput.focus();
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Creating Account...';
        }

        try {
          var user;
          if (window.CrestlineAuth) {
            user = await window.CrestlineAuth.signUp(email, pass, fullName, role, phone);
          } else {
            user = { uid: 'usr_' + Date.now().toString(36), email: email, name: fullName, role: role, phone: phone };
            if (window.CrestlineSession) window.CrestlineSession.save(user);
          }

          if (window.CrestlineToast) {
            window.CrestlineToast(role === 'admin' ? 'Staff credentials registered! Welcome, ' + fullName + '.' : 'Welcome to Crestline Realty, ' + (first || fullName) + '!');
          }

          setTimeout(function () {
            var redirectParam = new URLSearchParams(window.location.search).get('redirect');
            var targetUrl = (redirectParam && redirectParam.indexOf('login') === -1 && redirectParam.indexOf('register') === -1)
              ? redirectParam
              : (role === 'admin' ? 'admin-dashboard.html' : 'customer-dashboard.html');
            window.location.href = targetUrl;
          }, 300);

        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
          if (window.CrestlineToast) {
            window.CrestlineToast(err.message || 'Registration failed.', 'error');
          }
        }
        return;
      }

      // Login Mode
      var loginRole = (form.querySelector('[name="role"]') ? form.querySelector('[name="role"]').value : 'user');
      var loginEmailInput = form.querySelector('[name="email"]');
      var loginPassInput = form.querySelector('[name="pass"]');

      var loginEmail = loginEmailInput ? loginEmailInput.value.trim() : '';
      var loginPass = loginPassInput ? loginPassInput.value : '';

      if (!loginEmail || !loginPass) {
        if (window.CrestlineToast) window.CrestlineToast('Please enter both email and password.', 'error');
        return;
      }

      var loginDomain = loginEmail.split('@')[1] || '';
      if (/[A-Z]/.test(loginDomain)) {
        if (window.CrestlineToast) window.CrestlineToast('Email domain must be in lowercase only (e.g., @gmail.com).', 'error');
        if (loginEmailInput) loginEmailInput.focus();
        return;
      }

      if (!isValidEmailDomain(loginEmail)) {
        if (window.CrestlineToast) window.CrestlineToast('Please enter a valid email format with lowercase domain.', 'error');
        if (loginEmailInput) loginEmailInput.focus();
        return;
      }

      loginEmail = loginEmail.toLowerCase();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Signing In...';
      }

      try {
        var loggedUser;
        if (window.CrestlineAuth) {
          loggedUser = await window.CrestlineAuth.signIn(loginEmail, loginPass, loginRole);
        } else {
          var defaultName = loginEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); });
          loggedUser = { uid: 'usr_' + Date.now().toString(36), email: loginEmail, name: defaultName, role: loginRole };
          if (window.CrestlineSession) window.CrestlineSession.save(loggedUser);
        }

        if (window.CrestlineToast) {
          window.CrestlineToast('Welcome back, ' + (loggedUser.name || 'Client') + '!');
        }

        setTimeout(function () {
          var redirectParam = new URLSearchParams(window.location.search).get('redirect');
          var targetUrl = (redirectParam && redirectParam.indexOf('login') === -1 && redirectParam.indexOf('register') === -1)
            ? redirectParam
            : (loggedUser.role === 'admin' ? 'admin-dashboard.html' : 'customer-dashboard.html');
          window.location.href = targetUrl;
        }, 300);

      } catch (err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        if (window.CrestlineToast) {
          window.CrestlineToast(err.message || 'Sign in failed.', 'error');
        }
      }
    });
  });

  /* ---------- Generic Data-Validate Forms Handler (e.g., Contact Form, Newsletter) ---------- */
  $$('form[data-validate]').forEach(function (vForm) {
    // Avoid double binding auth forms or profile forms that have specific handlers
    if (vForm.hasAttribute('data-auth') || vForm.id === 'profile-settings-form') return;

    vForm.addEventListener('submit', function (ev) {
      var nameInput = vForm.querySelector('#contact-name') || vForm.querySelector('input[name="name"]') || vForm.querySelector('input[placeholder*="Name"]');
      var emailInput = vForm.querySelector('#contact-email') || vForm.querySelector('input[type="email"]');

      if (nameInput) {
        var nameVal = nameInput.value.trim();
        if (nameVal && nameVal.length < 2) {
          ev.preventDefault();
          ev.stopPropagation();
          if (window.CrestlineToast) window.CrestlineToast('Name must be at least 2 characters long.', 'error');
          nameInput.focus();
          return;
        }
      }

      if (emailInput) {
        var emVal = emailInput.value.trim();
        if (emVal) {
          var domain = emVal.split('@')[1] || '';
          if (/[A-Z]/.test(domain)) {
            ev.preventDefault();
            ev.stopPropagation();
            if (window.CrestlineToast) window.CrestlineToast('Email domain must be in lowercase only (e.g., @gmail.com).', 'error');
            emailInput.focus();
            return;
          }
          if (!isValidEmailDomain(emVal)) {
            ev.preventDefault();
            ev.stopPropagation();
            if (window.CrestlineToast) window.CrestlineToast('Please enter a valid email format with a lowercase domain.', 'error');
            emailInput.focus();
            return;
          }
        }
      }

      // Success feedback
      var successTarget = vForm.getAttribute('data-success');
      if (successTarget) {
        var successEl = document.querySelector(successTarget);
        if (successEl) {
          ev.preventDefault();
          successEl.classList.remove('hidden');
          if (window.CrestlineToast) window.CrestlineToast('Inquiry submitted successfully! A licensed broker will respond shortly.');
          vForm.reset();
          setTimeout(function () { successEl.classList.add('hidden'); }, 5000);
        }
      }
    });
  });

  /* ---------- Dashboard Route Guard & Dynamic Data Binding ---------- */
  function initDashboardBinding() {
    var path = window.location.pathname.toLowerCase();
    var isCustomerDash = path.indexOf('customer-dashboard') !== -1;
    var isAdminDash = path.indexOf('admin-dashboard') !== -1;

    if (!isCustomerDash && !isAdminDash) return;

    var session = window.CrestlineSession ? window.CrestlineSession.get() : null;

    // Route Guard & Demo Session for Customer Portal
    if (isCustomerDash) {
      if (!session || !session.email) {
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

      // Determine greeting
      var hour = new Date().getHours();
      var timeGreeting = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening');
      var fullName = session.name || session.email.split('@')[0];
      var nameParts = fullName.trim().split(/\s+/);
      var firstName = nameParts[0] || 'Client';
      var lastName = nameParts.slice(1).join(' ') || '';
      var initials = (firstName.charAt(0) + (lastName ? lastName.charAt(0) : (nameParts[0].length > 1 ? nameParts[0].charAt(1) : ''))).toUpperCase() || 'CP';

      // Update Topbar
      var greetingEl = document.getElementById('dash-greeting');
      if (greetingEl) greetingEl.textContent = timeGreeting + ', ' + firstName;

      var topAvatar = document.getElementById('dash-top-avatar');
      if (topAvatar) {
        if (session.photoURL) {
          topAvatar.innerHTML = '<img src="' + session.photoURL + '" alt="' + fullName + '" class="w-full h-full object-cover rounded-full">';
        } else {
          topAvatar.textContent = initials;
        }
      }

      // Update Profile Card
      var profileName = document.getElementById('dash-profile-name');
      if (profileName) profileName.textContent = fullName;

      var profileEmail = document.getElementById('dash-profile-email');
      if (profileEmail) profileEmail.textContent = session.email;

      var profileAvatar = document.getElementById('dash-profile-avatar');
      if (profileAvatar) {
        if (session.photoURL) {
          profileAvatar.innerHTML = '<img src="' + session.photoURL + '" alt="' + fullName + '" class="w-full h-full object-cover rounded-full">';
        } else {
          profileAvatar.textContent = initials;
        }
      }

      // Populate Profile Form Fields
      var pFirst = document.getElementById('profile-first');
      var pLast = document.getElementById('profile-last');
      var pEmail = document.getElementById('profile-email');
      var pPhone = document.getElementById('profile-phone');

      if (pFirst && !pFirst.value) pFirst.value = firstName;
      if (pLast && !pLast.value) pLast.value = lastName;
      if (pEmail) pEmail.value = session.email;
      if (pPhone && !pPhone.value) pPhone.value = session.phone || '';
    }

    // Route Guard & Demo Session for Admin Portal
    if (isAdminDash) {
      if (!session || session.role !== 'admin') {
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
    }
  }
  initDashboardBinding();

  /* ---------- Dashboard Logout Handler ---------- */
  $$('a, button').forEach(function (el) {
    var txt = (el.textContent || '').trim().toLowerCase();
    if (txt === 'log out' || txt === 'logout' || el.hasAttribute('data-logout') || el.getAttribute('data-auth-action') === 'logout') {
      el.addEventListener('click', async function (e) {
        e.preventDefault();
        try {
          if (window.CrestlineAuth) {
            await window.CrestlineAuth.signOut();
          } else if (window.CrestlineSession) {
            window.CrestlineSession.clear();
          }
        } catch (_) {
          if (window.CrestlineSession) window.CrestlineSession.clear();
        }
        if (window.CrestlineToast) window.CrestlineToast('Logged out successfully.');
        setTimeout(function () {
          window.location.href = 'index.html';
        }, 500);
      });
    }
  });

  /* ---------- Separate Legal & Policy Popups System ---------- */
  const legalPopups = {
    cpn: {
      id: 'modal-trec-cpn',
      title: 'Texas Consumer Protection Notice',
      toast: 'Texas Consumer Protection Notice (TREC CN 1-5)',
      icon: 'ri-shield-check-fill',
      html: `
        <div class="modal-panel w-full max-w-2xl rounded-3xl bg-white dark:bg-forest-800 border border-ink-100 dark:border-white/10 shadow-lift p-6 sm:p-8 relative">
          <div class="flex items-start justify-between pb-4 border-b border-ink-100 dark:border-white/10">
            <div>
              <div class="flex items-center gap-2">
                <span class="eyebrow"><i class="ri-government-line"></i> State of Texas • TREC Notice</span>
                <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-brand-500/20 text-brand-700 dark:text-brand-300 font-mono">TREC #9004812</span>
              </div>
              <h3 class="font-display mt-2 text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Texas Real Estate Commission Consumer Protection Notice</h3>
              <p class="mt-0.5 text-xs text-ink-500 dark:text-slate-400">TREC Form CN 1-5 • Mandated under Texas Real Estate License Act (TRELA § 1101.552)</p>
            </div>
            <button class="modal-close w-9 h-9 rounded-lg bg-ink-50 dark:bg-white/5 flex items-center justify-center text-ink-500 hover:text-ink-900 dark:hover:text-white transition" aria-label="Close modal">
              <i class="ri-close-line text-lg"></i>
            </button>
          </div>

          <div class="legal-scroll-body mt-4 pe-2 space-y-4 text-ink-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed" style="max-height: 52vh;">
            <div class="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20">
              <p class="font-bold text-brand-900 dark:text-brand-300 text-sm">
                The Texas Real Estate Commission (TREC) regulates real estate brokers and sales agents, real estate inspectors, easement and right-of-way agents, and timeshare interest providers.
              </p>
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
              <div class="p-3.5 rounded-xl glass-card border border-ink-100 dark:border-white/10">
                <h4 class="font-bold text-xs uppercase tracking-wider text-ink-900 dark:text-white flex items-center gap-1.5 mb-1"><i class="ri-search-eye-line text-brand-600"></i> Check License Status</h4>
                <p class="text-xs text-ink-500 dark:text-slate-400">You can check the active status of any Texas license holder or review disciplinary records online at <a href="https://www.trec.texas.gov" target="_blank" rel="noopener noreferrer" class="text-brand-600 font-bold underline">www.trec.texas.gov</a>.</p>
              </div>
              <div class="p-3.5 rounded-xl glass-card border border-ink-100 dark:border-white/10">
                <h4 class="font-bold text-xs uppercase tracking-wider text-ink-900 dark:text-white flex items-center gap-1.5 mb-1"><i class="ri-feedback-line text-ember-600"></i> File a Complaint</h4>
                <p class="text-xs text-ink-500 dark:text-slate-400">You can file a formal complaint against a license holder with TREC online via the TREC portal or by calling (512) 936-3000.</p>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-ink-50 dark:bg-white/5 border border-ink-100 dark:border-white/10 space-y-1 text-xs">
              <p class="font-bold text-ink-900 dark:text-white"><i class="ri-safe-2-line text-brand-600 me-1"></i> Real Estate Recovery Trust Account</p>
              <p class="text-ink-600 dark:text-slate-400">TREC administers the Recovery Trust Account which may be used to satisfy civil judgments against a broker or sales agent for out-of-pocket damages up to $125,000 per transaction.</p>
            </div>

            <div class="p-3 rounded-xl border border-dashed border-ink-200 dark:border-white/15 text-xs text-ink-600 dark:text-slate-400 space-y-1">
              <div><strong>Licensed Brokerage Firm:</strong> Crestline Realty Group LLC (TREC #9004812)</div>
              <div><strong>Designated Broker:</strong> Marcus Vance (License #0642198)</div>
              <div><strong>Central Headquarters:</strong> 2400 Crestline Avenue, Austin, TX 78704 &bull; +1 (512) 555-0142</div>
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-ink-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <button type="button" class="inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-900 dark:hover:text-white transition" onclick="window.print()">
              <i class="ri-printer-line text-sm"></i> Print Notice
            </button>
            <div class="flex items-center gap-2">
              <a href="https://www.trec.texas.gov" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-ink-50 dark:bg-white/5 hover:bg-ink-100 text-ink-700 dark:text-slate-200 text-xs font-bold transition">
                Visit TREC.texas.gov <i class="ri-external-link-line ms-0.5"></i>
              </a>
              <button type="button" class="modal-close px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-soft transition">
                I Understand &bull; Close
              </button>
            </div>
          </div>
        </div>
      `
    },
    iabs: {
      id: 'modal-trec-iabs',
      title: 'Information About Brokerage Services',
      toast: 'Information About Brokerage Services (TREC IABS 1-0)',
      icon: 'ri-file-list-3-fill',
      html: `
        <div class="modal-panel w-full max-w-2xl rounded-3xl bg-white dark:bg-forest-800 border border-ink-100 dark:border-white/10 shadow-lift p-6 sm:p-8 relative">
          <div class="flex items-start justify-between pb-4 border-b border-ink-100 dark:border-white/10">
            <div>
              <div class="flex items-center gap-2">
                <span class="eyebrow"><i class="ri-file-paper-2-line"></i> Texas Statutory Disclosure</span>
                <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-brand-500/20 text-brand-700 dark:text-brand-300 font-mono">TREC Form IABS 1-0</span>
              </div>
              <h3 class="font-display mt-2 text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Information About Brokerage Services</h3>
              <p class="mt-0.5 text-xs text-ink-500 dark:text-slate-400">Texas law requires all real estate license holders to give this notice to prospective buyers, tenants, sellers, and landlords.</p>
            </div>
            <button class="modal-close w-9 h-9 rounded-lg bg-ink-50 dark:bg-white/5 flex items-center justify-center text-ink-500 hover:text-ink-900 dark:hover:text-white transition" aria-label="Close modal">
              <i class="ri-close-line text-lg"></i>
            </button>
          </div>

          <div class="legal-scroll-body mt-4 pe-2 space-y-4 text-ink-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed" style="max-height: 52vh;">
            <div class="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20">
              <p class="font-bold text-brand-900 dark:text-brand-300 text-xs sm:text-sm">
                A broker's minimum duties required by Texas law (A client is the person that the broker represents):
              </p>
              <ul class="mt-2 space-y-1.5 text-xs text-brand-800 dark:text-brand-200 font-medium">
                <li class="flex items-start gap-1.5"><i class="ri-check-line text-brand-600 font-bold"></i> <span><strong>Put the interests of the client above all others</strong>, including the broker's own interests.</span></li>
                <li class="flex items-start gap-1.5"><i class="ri-check-line text-brand-600 font-bold"></i> <span><strong>Inform the client of any material information</strong> about the property or transaction known by the broker.</span></li>
                <li class="flex items-start gap-1.5"><i class="ri-check-line text-brand-600 font-bold"></i> <span><strong>Answer the client's questions</strong> and present any offer to or counter-offer promptly.</span></li>
                <li class="flex items-start gap-1.5"><i class="ri-check-line text-brand-600 font-bold"></i> <span><strong>Treat all parties to a real estate transaction honestly and fairly.</strong></span></li>
              </ul>
            </div>

            <div class="space-y-2 text-xs">
              <div class="p-2.5 rounded-xl bg-ink-50 dark:bg-white/5 border border-ink-100 dark:border-white/10">
                <span class="font-bold text-ink-900 dark:text-white block mb-0.5">1. As Agent For Owner (Seller/Landlord):</span>
                <p class="text-ink-600 dark:text-slate-400">The broker becomes the property owner's fiduciary agent through a written listing agreement. The owner's agent must perform minimum duties and disclose material facts.</p>
              </div>
              <div class="p-2.5 rounded-xl bg-ink-50 dark:bg-white/5 border border-ink-100 dark:border-white/10">
                <span class="font-bold text-ink-900 dark:text-white block mb-0.5">2. As Agent For Buyer/Tenant:</span>
                <p class="text-ink-600 dark:text-slate-400">The broker becomes the buyer/tenant's fiduciary agent through a written representation agreement, protecting the buyer's financial and contract interests.</p>
              </div>
              <div class="p-2.5 rounded-xl bg-ink-50 dark:bg-white/5 border border-ink-100 dark:border-white/10">
                <span class="font-bold text-ink-900 dark:text-white block mb-0.5">3. As Intermediary:</span>
                <p class="text-ink-600 dark:text-slate-400">To act as an intermediary between parties, the broker must obtain written agreement from both sides and remain neutral without disclosing confidential price or terms.</p>
              </div>
            </div>

            <div class="p-3 rounded-xl border border-dashed border-ink-200 dark:border-white/15 text-xs grid sm:grid-cols-2 gap-2 text-ink-600 dark:text-slate-400">
              <div><strong>Broker Firm:</strong> Crestline Realty Group (#9004812)</div>
              <div><strong>Designated Broker:</strong> Marcus Vance (#0642198)</div>
              <div><strong>Supervisor:</strong> Sarah Jenkins (#0719823)</div>
              <div><strong>Email:</strong> broker@crestlinerealty.com</div>
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-ink-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <button type="button" class="inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-900 dark:hover:text-white transition" onclick="window.print()">
              <i class="ri-printer-line text-sm"></i> Print / Save IABS
            </button>
            <button type="button" class="modal-close px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-soft transition">
              I Acknowledge &bull; Close
            </button>
          </div>
        </div>
      `
    },
    privacy: {
      id: 'modal-privacy-policy',
      title: 'Privacy Policy & Consumer Data Protection',
      toast: 'Crestline Realty Privacy Policy & Data Rights',
      icon: 'ri-lock-2-fill',
      html: `
        <div class="modal-panel w-full max-w-2xl rounded-3xl bg-white dark:bg-forest-800 border border-ink-100 dark:border-white/10 shadow-lift p-6 sm:p-8 relative">
          <div class="flex items-start justify-between pb-4 border-b border-ink-100 dark:border-white/10">
            <div>
              <div class="flex items-center gap-2">
                <span class="eyebrow"><i class="ri-lock-2-line"></i> Consumer Data Rights</span>
                <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-brand-500/20 text-brand-700 dark:text-brand-300">Updated Sep 2026</span>
              </div>
              <h3 class="font-display mt-2 text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Crestline Realty Privacy Policy</h3>
              <p class="mt-0.5 text-xs text-ink-500 dark:text-slate-400">Strict zero data selling commitment and bank-grade digital security.</p>
            </div>
            <button class="modal-close w-9 h-9 rounded-lg bg-ink-50 dark:bg-white/5 flex items-center justify-center text-ink-500 hover:text-ink-900 dark:hover:text-white transition" aria-label="Close modal">
              <i class="ri-close-line text-lg"></i>
            </button>
          </div>

          <div class="legal-scroll-body mt-4 pe-2 space-y-3.5 text-ink-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed" style="max-height: 52vh;">
            <div class="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20">
              <h4 class="font-bold text-brand-900 dark:text-brand-300 text-xs sm:text-sm flex items-center gap-1.5"><i class="ri-shield-keyhole-line"></i> 100% Zero-Data-Sale Guarantee</h4>
              <p class="mt-1 text-xs text-brand-800 dark:text-brand-200">Crestline Realty Group does <strong>never sell, rent, monetize, or trade</strong> your contact details, financial valuations, or saved searches to third-party marketing brokers or lead resellers.</p>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <h4 class="font-bold text-ink-900 dark:text-white mb-0.5">1. Information We Collect</h4>
                <p class="text-ink-600 dark:text-slate-400">We collect information provided directly by you when you save properties, request a Comparative Market Analysis (CMA) valuation, or schedule a home showing with our licensed agents.</p>
              </div>
              <div>
                <h4 class="font-bold text-ink-900 dark:text-white mb-0.5">2. Bank-Grade Security</h4>
                <p class="text-ink-600 dark:text-slate-400">All data in transit is protected using TLS 1.3 / 256-bit encryption. Document archives and transaction records adhere to Texas Real Estate Commission 4-year retention mandates.</p>
              </div>
              <div>
                <h4 class="font-bold text-ink-900 dark:text-white mb-0.5">3. Your Data Rights & Deletion</h4>
                <p class="text-ink-600 dark:text-slate-400">You may at any time request an export of your saved property portfolio or request complete account erasure by emailing <a href="mailto:privacy@crestlinerealty.com" class="text-brand-600 font-bold underline">privacy@crestlinerealty.com</a>.</p>
              </div>
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-ink-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <a href="mailto:privacy@crestlinerealty.com" class="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-500 transition">
              <i class="ri-mail-line"></i> privacy@crestlinerealty.com
            </a>
            <button type="button" class="modal-close px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-soft transition">
              Understood &bull; Close
            </button>
          </div>
        </div>
      `
    },
    terms: {
      id: 'modal-terms-of-service',
      title: 'Portal Terms of Service',
      toast: 'Crestline Realty Terms of Service & MLS Rules',
      icon: 'ri-scales-3-fill',
      html: `
        <div class="modal-panel w-full max-w-2xl rounded-3xl bg-white dark:bg-forest-800 border border-ink-100 dark:border-white/10 shadow-lift p-6 sm:p-8 relative">
          <div class="flex items-start justify-between pb-4 border-b border-ink-100 dark:border-white/10">
            <div>
              <div class="flex items-center gap-2">
                <span class="eyebrow"><i class="ri-scales-3-line"></i> Portal Terms</span>
                <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-brand-500/20 text-brand-700 dark:text-brand-300">MLS Compliance</span>
              </div>
              <h3 class="font-display mt-2 text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Crestline Realty Terms of Service</h3>
              <p class="mt-0.5 text-xs text-ink-500 dark:text-slate-400">Terms governing MLS property listings and digital brokerage services.</p>
            </div>
            <button class="modal-close w-9 h-9 rounded-lg bg-ink-50 dark:bg-white/5 flex items-center justify-center text-ink-500 hover:text-ink-900 dark:hover:text-white transition" aria-label="Close modal">
              <i class="ri-close-line text-lg"></i>
            </button>
          </div>

          <div class="legal-scroll-body mt-4 pe-2 space-y-3.5 text-ink-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed" style="max-height: 52vh;">
            <div class="space-y-3 text-xs">
              <div>
                <h4 class="font-bold text-ink-900 dark:text-white mb-0.5">1. Authorized Non-Commercial Use</h4>
                <p class="text-ink-600 dark:text-slate-400">The listing data on this website is for the consumer's personal, non-commercial use in identifying potential properties they may be interested in purchasing or leasing.</p>
              </div>
              <div>
                <h4 class="font-bold text-ink-900 dark:text-white mb-0.5">2. Listing Accuracy & Independence</h4>
                <p class="text-ink-600 dark:text-slate-400">All information provided is deemed reliable but is not guaranteed and should be independently verified through licensed property inspections and local tax appraisal records.</p>
              </div>
              <div>
                <h4 class="font-bold text-ink-900 dark:text-white mb-0.5">3. Agency Representation</h4>
                <p class="text-ink-600 dark:text-slate-400">Browsing listings or submitting online inquiries does not create a licensed broker-client fiduciary relationship until a formal Texas Real Estate Commission Representation Agreement is executed.</p>
              </div>
              <div>
                <h4 class="font-bold text-ink-900 dark:text-white mb-0.5">4. Equal Housing Opportunity</h4>
                <p class="text-ink-600 dark:text-slate-400">Crestline Realty strictly adheres to Title VIII of the Civil Rights Act of 1968 (Fair Housing Act), providing equal service regardless of race, color, religion, sex, disability, familial status, or national origin.</p>
              </div>
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-ink-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <button type="button" class="inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink-900 dark:hover:text-white transition" onclick="window.print()">
              <i class="ri-printer-line text-sm"></i> Print Terms
            </button>
            <button type="button" class="modal-close px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-soft transition">
              I Agree &bull; Close
            </button>
          </div>
        </div>
      `
    }
  };

  function getOrMountSeparatePopup(key) {
    const popupCfg = legalPopups[key] || legalPopups.cpn;
    let modal = $(`#${popupCfg.id}`);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = popupCfg.id;
      modal.className = 'modal-backdrop';
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.innerHTML = popupCfg.html;
      document.body.appendChild(modal);

      // Bind close buttons for this specific popup
      $$('.modal-close', modal).forEach(c => c.addEventListener('click', () => modal.classList.remove('open')));
      modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });
    }
    return modal;
  }

  function openSeparateLegalPopup(key = 'cpn') {
    // Close any other open legal modal first
    $$('.modal-backdrop.open').forEach(m => m.classList.remove('open'));

    const popupCfg = legalPopups[key] || legalPopups.cpn;
    const modal = getOrMountSeparatePopup(key);
    modal.classList.add('open');
    showToast(`📄 Displaying ${popupCfg.toast}`, popupCfg.icon, 3500);
  }
  window.openSeparateLegalPopup = openSeparateLegalPopup;

  // Intercept all legal / disclosure links across the page and open the matching separate popup
  document.addEventListener('click', e => {
    const target = e.target.closest('a, button');
    if (!target) return;

    const href = target.getAttribute('href') || '';
    const text = (target.textContent || '').trim();
    const dataLegal = target.getAttribute('data-legal');

    if (dataLegal && legalPopups[dataLegal]) {
      e.preventDefault();
      openSeparateLegalPopup(dataLegal);
      return;
    }

    if (text.includes('Texas Consumer Protection Notice') || href.includes('trec-cpn')) {
      e.preventDefault();
      openSeparateLegalPopup('cpn');
    } else if (text.includes('Information About Brokerage Services') || href.includes('trec-iabs') || text.includes('IABS')) {
      e.preventDefault();
      openSeparateLegalPopup('iabs');
    } else if (text.includes('Privacy Policy') || href.includes('privacy-policy')) {
      e.preventDefault();
      openSeparateLegalPopup('privacy');
    } else if (text.includes('Terms of Service') || href.includes('terms-of-service')) {
      e.preventDefault();
      openSeparateLegalPopup('terms');
    }
  });

  /* ---------- Dashboard sidebar toggle (mobile) ---------- */
  const dashToggle = $('#dash-toggle');
  const dashSide = $('.dash-sidebar');
  if (dashToggle && dashSide) {
    dashToggle.addEventListener('click', () => dashSide.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (dashSide.classList.contains('open') && !dashSide.contains(e.target) && e.target !== dashToggle)
        dashSide.classList.remove('open');
    });
  }

  /* ---------- Services page tabs ---------- */
  const tabBtns = $$('.tab-btn[data-tab]');
  if (tabBtns.length) {
    const paneMap = {};
    $$('.tab-pane[id]').forEach(p => paneMap[p.id] = p);
    const activate = (id) => {
      tabBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === id));
      Object.values(paneMap).forEach(p => p.classList.toggle('active', p.id === id));
    };
    tabBtns.forEach(b => b.addEventListener('click', () => {
      activate(b.getAttribute('data-tab'));
      if (history.replaceState) history.replaceState(null, '', '#' + b.getAttribute('data-tab'));
    }));
    // activate from hash or first by default
    const hash = location.hash.replace('#', '');
    const first = tabBtns.find(b => b.getAttribute('data-tab') === hash) || tabBtns.find(b => b.classList.contains('active')) || tabBtns[0];
    if (first) activate(first.getAttribute('data-tab'));
  }

  /* ---------- Testimonial carousel ---------- */
  const carousel = $('[data-carousel]');
  if (carousel) {
    const track = $('.snap-row', carousel);
    const prevBtn = $('[data-carousel-prev]', carousel);
    const nextBtn = $('[data-carousel-next]', carousel);
    if (track && prevBtn && nextBtn) {
      const scrollAmt = () => Math.min(track.clientWidth * 0.82, 390);
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -scrollAmt(), behavior: 'smooth' });
      });
      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: scrollAmt(), behavior: 'smooth' });
      });
    }
  }

  /* ---------- Animated Live Counters Engine ---------- */
  const counters = $$('[data-counter]');
  if (counters.length) {
    function animateCounter(el) {
      if (el.dataset.animated === 'true') return;
      el.dataset.animated = 'true';

      const target = parseFloat(el.getAttribute('data-counter')) || 0;
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const decimalsAttr = el.getAttribute('data-decimals');
      const isFloat = decimalsAttr !== null ? parseInt(decimalsAttr, 10) : (String(target).includes('.') ? 1 : 0);
      const isComma = el.getAttribute('data-format') === 'comma' || target >= 1000;
      const dur = parseInt(el.getAttribute('data-duration'), 10) || 1600;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const p = Math.min(elapsed / dur, 1);
        // Quartic Ease-Out: starts briskly and decelerates smoothly into the final number
        const ease = 1 - Math.pow(1 - p, 4);
        const val = target * ease;

        let formatted;
        if (isFloat > 0) {
          formatted = val.toFixed(isFloat);
        } else {
          const rounded = Math.round(val);
          formatted = isComma ? rounded.toLocaleString('en-US') : String(rounded);
        }

        el.textContent = prefix + formatted + suffix;

        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          // Guarantee exact final precision
          const finalVal = isFloat > 0
            ? target.toFixed(isFloat)
            : (isComma ? Math.round(target).toLocaleString('en-US') : String(Math.round(target)));
          el.textContent = prefix + finalVal + suffix;
        }
      }

      requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            animateCounter(e.target);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -10px 0px' });

      counters.forEach(c => {
        const prefix = c.getAttribute('data-prefix') || '';
        const suffix = c.getAttribute('data-suffix') || '';
        const decimalsAttr = c.getAttribute('data-decimals');
        const isFloat = decimalsAttr !== null ? parseInt(decimalsAttr, 10) : (String(c.getAttribute('data-counter')).includes('.') ? 1 : 0);
        c.textContent = prefix + (isFloat > 0 ? (0).toFixed(isFloat) : '0') + suffix;
        obs.observe(c);
      });

      // Trigger counters immediately if already in viewport
      setTimeout(() => {
        counters.forEach(c => {
          const rect = c.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom >= 0) {
            animateCounter(c);
          }
        });
      }, 80);
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---------- FAQ: auto-close others (optional UX) ---------- */
  $$('.faq-item[open]').forEach(d => {
    d.addEventListener('toggle', () => {
      if (d.open) {
        $$('.faq-item').forEach(other => { if (other !== d) other.removeAttribute('open'); });
      }
    });
  });

  /* ---------- Back to top ---------- */
  const btt = $('#back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Footer year ---------- */
  const yearEl = $('#footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Simple form validation ---------- */
  $$('[data-validate]').forEach(form => {
    form.setAttribute('novalidate', '');

    // Clear field-level error messages as soon as user types
    $$('input, textarea, select', form).forEach(input => {
      input.addEventListener('input', () => {
        input.style.borderColor = '';
        const errEl = document.getElementById(input.id + '-error');
        if (errEl) errEl.classList.add('hidden');
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      $$('[required]', form).forEach(input => {
        let msg = '';
        const val = input.value.trim();

        if (input.type === 'email') {
          if (!val) {
            msg = 'Email address is required.';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            msg = 'Please enter a valid email address.';
          }
        } else if (input.type === 'tel' || input.id === 'contact-phone' || (input.name && input.name.includes('phone'))) {
          const digits = val.replace(/\D/g, '');
          if (!val) {
            msg = 'Phone number is mandatory (10 digits).';
          } else if (digits.length === 10) {
            msg = ''; // Valid 10 digits
          } else if (digits.length === 11 && digits.startsWith('1')) {
            msg = ''; // Valid 10 digits with country code 1
          } else {
            msg = 'Please enter a valid 10-digit phone number.';
          }
        } else if (!val) {
          msg = 'This field is required.';
        }

        input.style.borderColor = msg ? '#be3a2e' : '';
        const errEl = document.getElementById(input.id + '-error');
        if (errEl) {
          errEl.textContent = msg;
          errEl.classList.toggle('hidden', !msg);
        }
        if (msg) valid = false;
      });

      if (valid) {
        const successEl = $(form.getAttribute('data-success'));
        if (successEl) successEl.classList.remove('hidden');
        form.reset();
      }
    });
  });

  /* ---------- Dashboard sidebar scrollspy ---------- */
  const dashLinks = $$('.dash-link[data-section]');
  if (dashLinks.length) {
    const sections = dashLinks.map(l => document.getElementById(l.getAttribute('data-section'))).filter(Boolean);
    const spy = () => {
      let current = '';
      const pos = window.scrollY + 140;
      sections.forEach(s => { if (s.offsetTop <= pos) current = s.id; });
      if (!current && sections.length) current = sections[0].id;
      dashLinks.forEach(l => l.classList.toggle('active', l.getAttribute('data-section') === current));
    };
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }

  /* ---------- AOS init ---------- */
  if (typeof AOS !== 'undefined') AOS.init({ duration: 650, easing: 'ease-out-cubic', once: true });

  /* ---------- Snap-row scroll snapping ---------- */
  $$('.snap-row').forEach(row => {
    row.style.scrollSnapType = 'x mandatory';
    $$('> *', row).forEach(child => child.style.scrollSnapAlign = 'start');
  });

  /* ---------- Blog Category Filter ---------- */
  const blogFilterBtns = $$('.filter-btn[data-filter]');
  const blogCards = $$('[data-category]');
  if (blogFilterBtns.length && blogCards.length) {
    blogFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        blogFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        blogCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.classList.remove('hidden');
            card.style.display = '';
          } else {
            card.classList.add('hidden');
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ---------- Commission Savings Calculator ---------- */
  const homePriceSlider = $('#home-price-slider');
  if (homePriceSlider) {
    const priceDisplay = $('#calc-home-price');
    const traditionalFeeDisplay = $('#calc-traditional-fee');
    const crestlineFeeDisplay = $('#calc-crestline-fee');
    const totalSavingsDisplay = $('#calc-total-savings');

    const updateCalc = () => {
      const price = parseFloat(homePriceSlider.value) || 650000;
      const traditionalFee = price * 0.06;
      const crestlineFee = price * 0.025;
      const savings = traditionalFee - crestlineFee;

      if (priceDisplay) priceDisplay.textContent = '$' + price.toLocaleString();
      if (traditionalFeeDisplay) traditionalFeeDisplay.textContent = '$' + Math.round(traditionalFee).toLocaleString();
      if (crestlineFeeDisplay) crestlineFeeDisplay.textContent = '$' + Math.round(crestlineFee).toLocaleString();
      if (totalSavingsDisplay) totalSavingsDisplay.textContent = '$' + Math.round(savings).toLocaleString();
    };

    homePriceSlider.addEventListener('input', updateCalc);
    updateCalc();
  }

  /* ---------- Mortgage Calculator (Listing Detail) ---------- */
  const mortPriceInput = $('#mort-price');
  const mortDownInput = $('#mort-down');
  const mortRateInput = $('#mort-rate');
  const mortTermSelect = $('#mort-term');
  const mortTotalDisplay = $('#mort-total-monthly');
  const mortPiDisplay = $('#mort-pi');
  const mortTaxDisplay = $('#mort-tax');
  const mortInsDisplay = $('#mort-ins');

  if (mortPriceInput && mortTotalDisplay) {
    const calculateMortgage = () => {
      const price = parseFloat(mortPriceInput.value) || 684900;
      const downPercent = parseFloat(mortDownInput ? mortDownInput.value : 20) || 20;
      const annualRate = parseFloat(mortRateInput ? mortRateInput.value : 5.85) || 5.85;
      const termYears = parseFloat(mortTermSelect ? mortTermSelect.value : 30) || 30;

      const principal = price * (1 - downPercent / 100);
      const monthlyRate = annualRate / 100 / 12;
      const numPayments = termYears * 12;

      let monthlyPI = 0;
      if (monthlyRate > 0) {
        monthlyPI = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      } else {
        monthlyPI = principal / numPayments;
      }

      const monthlyTax = (price * 0.018) / 12; // ~1.8% TX property tax avg
      const monthlyIns = (price * 0.005) / 12; // ~0.5% Homeowners insurance
      const total = monthlyPI + monthlyTax + monthlyIns;

      if (mortTotalDisplay) mortTotalDisplay.textContent = '$' + Math.round(total).toLocaleString() + '/mo';
      if (mortPiDisplay) mortPiDisplay.textContent = '$' + Math.round(monthlyPI).toLocaleString();
      if (mortTaxDisplay) mortTaxDisplay.textContent = '$' + Math.round(monthlyTax).toLocaleString();
      if (mortInsDisplay) mortInsDisplay.textContent = '$' + Math.round(monthlyIns).toLocaleString();
    };

    [mortPriceInput, mortDownInput, mortRateInput, mortTermSelect].filter(Boolean).forEach(el => {
      el.addEventListener('input', calculateMortgage);
      el.addEventListener('change', calculateMortgage);
    });
    calculateMortgage();
  }

  /* ---------- Hero Multi-Tab Search Portal Engine (Buy, Rent, Sell, Free Valuation) ---------- */
  const searchPortal = $('#hero-search-portal');
  if (searchPortal) {
    const tabBtns = $$('.search-mode-btn', searchPortal);
    const form = $('#hero-portal-form');
    const modeInput = $('#hero-search-mode-input');
    const input1 = $('#search-input-1');
    const label1 = $('#label-text-1');
    const icon1 = $('#search-icon-1');
    const select2 = $('#search-select-2');
    const label2 = $('#label-text-2');
    const icon2 = $('#search-icon-2');
    const select3 = $('#search-select-3');
    const label3 = $('#label-text-3');
    const icon3 = $('#search-icon-3');
    const submitText = $('#hero-submit-text');
    const submitIcon = $('#hero-submit-icon');
    const tagsList = $('#hero-tags-list');
    const valuationModal = $('#modal-free-valuation');

    const searchConfigs = {
      buy: {
        mode: 'buy',
        action: 'home-2.html',
        label1: 'Location',
        icon1: 'ri-map-pin-2-line',
        placeholder1: 'Austin, Westlake, Round Rock, ZIP',
        label2: 'Property Type',
        icon2: 'ri-home-5-line',
        options2: [
          { val: 'single-family', text: 'Single-Family Home' },
          { val: 'villa', text: 'Luxury Villa' },
          { val: 'condo', text: 'Downtown Condo' },
          { val: 'townhouse', text: 'Modern Townhouse' },
          { val: 'multi-family', text: 'Multi-Family / Duplex' },
          { val: 'land', text: 'Land & Lot' }
        ],
        label3: 'Price Range',
        icon3: 'ri-money-dollar-circle-line',
        options3: [
          { val: 'any', text: 'Any Price' },
          { val: '300k-600k', text: '$300K – $600K' },
          { val: '600k-1.2m', text: '$600K – $1.2M' },
          { val: '1.2m-2.5m', text: '$1.2M – $2.5M' },
          { val: '2.5m+', text: '$2.5M+' }
        ],
        submitText: 'Search 4,120+ Homes',
        submitIcon: 'ri-search-line',
        tags: [
          { text: 'Austin Villas', href: 'home-2.html?tag=villas' },
          { text: 'Westlake Hills', href: 'home-2.html?tag=westlake' },
          { text: 'Downtown Condos < $600k', href: 'home-2.html?tag=condos' },
          { text: 'Top School Districts', href: 'home-2.html?tag=schools' }
        ]
      },
      rent: {
        mode: 'rent',
        action: 'home-2.html',
        label1: 'Rental City / Area',
        icon1: 'ri-building-line',
        placeholder1: 'Downtown, South Congress, Domain, ZIP',
        label2: 'Lease Type',
        icon2: 'ri-home-wifi-line',
        options2: [
          { val: 'luxury-apartment', text: 'Luxury Apartment' },
          { val: 'single-family-rental', text: 'Single-Family Home' },
          { val: 'furnished-condo', text: 'Furnished Condo' },
          { val: 'townhouse-rental', text: 'Townhome' },
          { val: 'corporate-suite', text: 'Corporate Short-Term' }
        ],
        label3: 'Monthly Budget',
        icon3: 'ri-bank-card-line',
        options3: [
          { val: 'any', text: 'Any Budget' },
          { val: '1500-2500', text: '$1,500 – $2,500/mo' },
          { val: '2500-4000', text: '$2,500 – $4,000/mo' },
          { val: '4000-7000', text: '$4,000 – $7,000/mo' },
          { val: '7000+', text: '$7,000+/mo' }
        ],
        submitText: 'Search Rentals (840+ Units)',
        submitIcon: 'ri-building-2-line',
        tags: [
          { text: 'Pet Friendly', href: 'home-2.html?tag=pet-friendly' },
          { text: 'Furnished Condos', href: 'home-2.html?tag=furnished' },
          { text: 'Domain Luxury Units', href: 'home-2.html?tag=domain' },
          { text: 'Under $2,500/mo', href: 'home-2.html?tag=budget' }
        ]
      },
      sell: {
        mode: 'sell',
        action: 'pricing.html#seller-plans',
        label1: 'Property Address',
        icon1: 'ri-map-pin-user-line',
        placeholder1: 'Enter your Texas street address',
        label2: 'Target Timeline',
        icon2: 'ri-calendar-event-line',
        options2: [
          { val: 'immediate', text: 'Sell Immediately (1-30 days)' },
          { val: '1-3mo', text: 'In 1 to 3 Months' },
          { val: '3-6mo', text: 'In 3 to 6 Months' },
          { val: 'exploring', text: 'Just Exploring Market Value' }
        ],
        label3: 'Preferred Listing Plan',
        icon3: 'ri-shield-star-line',
        options3: [
          { val: 'flat-fee', text: '$299 Flat-Fee MLS Plan' },
          { val: 'full-service', text: '2.5% Full-Service Brokerage' },
          { val: 'vip-luxury', text: 'VIP Luxury Advisory' }
        ],
        submitText: 'Get Seller Listing Proposal',
        submitIcon: 'ri-price-tag-3-line',
        tags: [
          { text: 'Flat-Fee MLS ($299)', href: 'pricing.html#seller-plans' },
          { text: '2.5% Full-Service', href: 'pricing.html#seller-plans' },
          { text: 'Free 3D Virtual Tour', href: 'services.html' },
          { text: 'Save $6,000+ in Fees', href: 'services.html#savings-calculator' }
        ]
      },
      valuation: {
        mode: 'valuation',
        action: '#modal-free-valuation',
        label1: 'Home Address',
        icon1: 'ri-home-search-line',
        placeholder1: 'Enter Texas address for Instant CMA',
        label2: 'Beds & Baths',
        icon2: 'ri-door-open-line',
        options2: [
          { val: '3b2b', text: '3 Beds / 2 Baths' },
          { val: '4b3b', text: '4 Beds / 3 Baths' },
          { val: '5b4b', text: '5+ Beds / 4+ Baths' },
          { val: '2b2b', text: '2 Beds / 2 Baths' }
        ],
        label3: 'Square Footage',
        icon3: 'ri-ruler-2-line',
        options3: [
          { val: '1500-2200', text: '1,500 – 2,200 sqft' },
          { val: '2200-3200', text: '2,200 – 3,200 sqft' },
          { val: '3200-4500', text: '3,200 – 4,500 sqft' },
          { val: '4500+', text: '4,500+ sqft' }
        ],
        submitText: 'Calculate Instant Valuation',
        submitIcon: 'ri-calculator-line',
        tags: [
          { text: 'Neighborhood Comps', href: '#modal-free-valuation' },
          { text: 'Recent Sold History', href: '#modal-free-valuation' },
          { text: 'Tax Assessment Comp', href: '#modal-free-valuation' },
          { text: 'Instant CMA Report', href: '#modal-free-valuation' }
        ]
      }
    };

    function switchSearchMode(mode) {
      const cfg = searchConfigs[mode] || searchConfigs.buy;
      
      tabBtns.forEach(btn => {
        const isCurrent = btn.getAttribute('data-mode') === mode;
        btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        if (isCurrent) {
          btn.className = 'search-mode-btn active px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-white dark:bg-forest-800 text-brand-700 dark:text-brand-300 shadow-card flex items-center gap-1.5 transition-all cursor-pointer';
        } else {
          btn.className = 'search-mode-btn px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-ink-500 dark:text-slate-400 hover:text-ink-800 dark:hover:text-white transition-all flex items-center gap-1.5 cursor-pointer';
        }
      });

      if (modeInput) modeInput.value = cfg.mode;
      if (form) form.action = cfg.action;

      if (label1) label1.textContent = cfg.label1;
      if (icon1) icon1.className = cfg.icon1 + ' text-brand-600';
      if (input1) input1.placeholder = cfg.placeholder1;

      if (label2) label2.textContent = cfg.label2;
      if (icon2) icon2.className = cfg.icon2 + ' text-brand-600';
      if (select2) {
        select2.innerHTML = cfg.options2.map(o => `<option value="${o.val}">${o.text}</option>`).join('');
      }

      if (label3) label3.textContent = cfg.label3;
      if (icon3) icon3.className = cfg.icon3 + ' text-brand-600';
      if (select3) {
        select3.innerHTML = cfg.options3.map(o => `<option value="${o.val}">${o.text}</option>`).join('');
      }

      if (submitText) submitText.textContent = cfg.submitText;
      if (submitIcon) submitIcon.className = cfg.submitIcon;

      if (tagsList) {
        tagsList.innerHTML = cfg.tags.map(t => {
          if (t.href.startsWith('#')) {
            return `<a href="${t.href}" class="cma-tag-trigger px-2.5 py-1 rounded-md bg-ink-50 dark:bg-white/5 hover:bg-brand-50 dark:hover:bg-brand-500/20 text-ink-700 dark:text-slate-300 transition font-medium">${t.text}</a>`;
          }
          return `<a href="${t.href}" class="px-2.5 py-1 rounded-md bg-ink-50 dark:bg-white/5 hover:bg-brand-50 dark:hover:bg-brand-500/20 text-ink-700 dark:text-slate-300 transition font-medium">${t.text}</a>`;
        }).join('');

        $$('.cma-tag-trigger', tagsList).forEach(el => {
          el.addEventListener('click', e => {
            e.preventDefault();
            if (valuationModal) valuationModal.classList.add('open');
          });
        });
      }

      showToast(`Switched to ${mode.toUpperCase()} Search Mode`, cfg.submitIcon, 2000);
    }

    tabBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const mode = btn.getAttribute('data-mode');
        switchSearchMode(mode);
      });
    });

    if (form) {
      form.addEventListener('submit', e => {
        const mode = modeInput ? modeInput.value : 'buy';
        if (mode === 'valuation') {
          e.preventDefault();
          const addr = (input1 && input1.value.trim()) ? input1.value.trim() : '2400 Crestline Area, Austin, TX';
          const targetAddrEl = $('#valuation-target-address');
          if (targetAddrEl) targetAddrEl.textContent = addr;

          // Compute dynamic estimate based on address & sqft
          const sqftVal = select3 ? select3.value : '2200-3200';
          let low = 580000;
          let high = 640000;
          if (sqftVal === '2200-3200') { low = 645000; high = 695000; }
          else if (sqftVal === '3200-4500') { low = 780000; high = 850000; }
          else if (sqftVal === '4500+') { low = 1150000; high = 1350000; }
          
          const valRangeEl = $('#valuation-price-range');
          if (valRangeEl) {
            valRangeEl.textContent = '$' + low.toLocaleString() + ' – $' + high.toLocaleString();
          }
          
          if (valuationModal) {
            valuationModal.classList.add('open');
          }
          showToast('Generated instant MLS market valuation!', 'ri-checkbox-circle-fill', 3000);
        } else if (mode === 'sell') {
          e.preventDefault();
          window.location.href = 'pricing.html#seller-plans';
        }
      });
    }

    if (valuationModal) {
      $$('.modal-close', valuationModal).forEach(c => c.addEventListener('click', () => valuationModal.classList.remove('open')));
      valuationModal.addEventListener('click', e => { if (e.target === valuationModal) valuationModal.classList.remove('open'); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') valuationModal.classList.remove('open'); });
    }
  }

  // Global triggers for valuation modal
  $$('a[href="#modal-free-valuation"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const vm = $('#modal-free-valuation');
      if (vm) vm.classList.add('open');
    });
  });

  /* ============================================================
    GLOBAL TOAST NOTIFICATION SYSTEM
  ============================================================ */
  let toastTimer = null;
  function showToast(title, msg, iconClass, duration) {
    let toast = $('#save-favorite-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'save-favorite-toast';
      toast.className = 'fixed bottom-6 end-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl glass-card bg-forest-900/95 text-white shadow-lift border border-white/10 transition-all duration-300 transform translate-y-8 opacity-0';
      toast.innerHTML = `
        <span class="w-8 h-8 rounded-full bg-brand-600/30 text-brand-300 flex items-center justify-center text-base shrink-0" id="toast-icon">
          <i class="ri-checkbox-circle-fill text-emerald-400"></i>
        </span>
        <div>
          <p class="text-xs font-bold text-white" id="toast-title">Notification</p>
          <p class="text-[11px] text-slate-300" id="toast-msg">Action completed successfully.</p>
        </div>
      `;
      document.body.appendChild(toast);
    }

    const titleEl = $('#toast-title', toast);
    const msgEl = $('#toast-msg', toast);
    const iconSpan = $('#toast-icon', toast);

    if (titleEl) titleEl.textContent = title || 'Notification';
    if (msgEl) msgEl.textContent = msg || '';
    if (iconSpan) {
      iconSpan.innerHTML = `<i class="${iconClass || 'ri-checkbox-circle-fill text-emerald-400'}"></i>`;
    }

    toast.classList.remove('hidden');
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-8', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-8', 'opacity-0');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, duration || 3000);
  }

  /* ============================================================
    FEATURED PROPERTIES PORTAL SHOWCASE CONTROLLER (HOME 1)
  ============================================================ */
  function initPropertyPortal() {
    const portal = $('#featured-properties-portal');
    if (!portal) return;

    const filterTabs = $$('#property-filter-tabs .prop-filter-btn', portal);
    const sortSelect = $('#property-sort-select', portal);
    const visibleCountEl = $('#visible-prop-count', portal);
    const spotlight = $('#spotlight-showcase', portal);
    const grid = $('#property-grid', portal);
    const cards = $$('.property-card', grid);
    const noPropsMsg = $('#no-properties-msg', portal);
    const resetFilterBtn = $('#reset-prop-filter-btn', portal);

    // Store original card order for 'featured' reset
    const originalCards = [...cards];

    let currentFilter = 'all';

    // Property modal & data dictionary
    const quickModal = $('#property-quick-modal');
    const modalContent = $('#property-modal-content');
    const modalCloseBtn = $('#close-prop-modal');

    const propDataStore = {
      'spotlight-1': {
        type: 'Luxury Hill Country Villa',
        badge: 'For Sale • Price Drop',
        badgeBg: 'bg-ember-600',
        title: '482 Westlake Crest Blvd',
        location: 'Westlake Hills, Austin, TX 78746 • Eanes ISD',
        price: '$1,425,000',
        note: '$294/sqft • Est. $7,120/mo',
        beds: '5 Beds',
        baths: '5.5 Baths',
        sqft: '4,850 sqft',
        img: 'assets/img/listing-2.svg',
        desc: 'Panoramic Hill Country luxury estate with infinity edge heated pool, solar + Tesla Powerwalls, chef kitchen, custom wine room, and private gated 0.75-acre grounds in top-ranked Eanes ISD.',
        link: 'listing-detail.html'
      },
      'card-1': {
        type: 'Single Family Home',
        badge: 'For Sale',
        badgeBg: 'bg-brand-600',
        title: '16 Cedar Lane',
        location: 'Alder Ridge, Austin, TX 78704',
        price: '$684,900',
        note: '$220/sqft • Est. $3,410/mo',
        beds: '4 Beds',
        baths: '3.5 Baths',
        sqft: '3,120 sqft',
        img: 'assets/img/listing-1.svg',
        desc: 'Modern craftsman featuring open floorplan, 2-car garage with Level 2 EV charging, private fenced yard with covered patio, and energy-efficient construction.',
        link: 'listing-detail.html'
      },
      'card-2': {
        type: 'Downtown Luxury Loft',
        badge: 'For Rent',
        badgeBg: 'bg-ember-600',
        title: '220 Harbor View #14B',
        location: 'Harbor Lofts, Downtown Austin, TX 78701',
        price: '$3,450 / mo',
        note: '12-Month Lease • $3,450 Deposit',
        beds: '2 Beds',
        baths: '2 Baths',
        sqft: '1,420 sqft',
        img: 'assets/img/property-2.svg',
        desc: 'High-floor corner loft with floor-to-ceiling skyline views, modern Italian quartz kitchen, 24/7 concierge, resort rooftop infinity pool, and pet spa.',
        link: 'listing-detail.html'
      },
      'card-3': {
        type: 'Luxury High-Rise Penthouse',
        badge: 'For Sale',
        badgeBg: 'bg-brand-600',
        title: '100 Congress Ave #2402',
        location: 'Downtown Austin, TX 78701',
        price: '$1,150,000',
        note: '$480/sqft • Est. $5,750/mo',
        beds: '2 Beds',
        baths: '2.5 Baths',
        sqft: '2,395 sqft',
        img: 'assets/img/listing-3.svg',
        desc: 'Architectural penthouse overlooking Lady Bird Lake with double-height ceilings, private terrace, motorized smart blinds, and 2 reserved garage spaces.',
        link: 'listing-detail.html'
      },
      'card-4': {
        type: 'Modern Green Townhouse',
        badge: 'For Rent',
        badgeBg: 'bg-ember-600',
        title: '7820 Mueller Green Way',
        location: 'Mueller District, Austin, TX 78723',
        price: '$2,650 / mo',
        note: '12-Month Lease • Partial Utilities',
        beds: '3 Beds',
        baths: '2.5 Baths',
        sqft: '1,980 sqft',
        img: 'assets/img/listing-4.svg',
        desc: 'LEED Platinum certified townhouse with rooftop solar, private courtyard, direct access to Mueller Lake Park, farmers market, and community pool.',
        link: 'listing-detail.html'
      },
      'card-5': {
        type: 'South Congress Craftsman',
        badge: 'For Sale',
        badgeBg: 'bg-brand-600',
        title: '914 Barton Springs Rd',
        location: 'South Congress, Austin, TX 78704',
        price: '$890,000',
        note: '$414/sqft • Est. $4,430/mo',
        beds: '3 Beds',
        baths: '2.5 Baths',
        sqft: '2,150 sqft',
        img: 'assets/img/listing-5.svg',
        desc: 'Walk to Barton Springs Pool and South Congress dining. Features private rooftop deck with skyline views, custom chef kitchen, and spa master bath.',
        link: 'listing-detail.html'
      },
      'card-6': {
        type: 'Suburban Executive Retreat',
        badge: 'For Rent',
        badgeBg: 'bg-ember-600',
        title: '1402 Oak Ridge Trail',
        location: 'Round Rock, TX 78681',
        price: '$3,800 / mo',
        note: 'Flexible 12-24 Mo • Furnished Option',
        beds: '4 Beds',
        baths: '3.5 Baths',
        sqft: '3,200 sqft',
        img: 'assets/img/listing-6.svg',
        desc: 'Spacious executive home on cul-de-sac with private heated pool, upstairs media game room, home office suite, and top Round Rock ISD campus zoning.',
        link: 'listing-detail.html'
      },
      'card-7': {
        type: 'Private Hill Country Estate',
        badge: 'For Sale',
        badgeBg: 'bg-brand-600',
        title: '9 Olive Grove Road',
        location: 'Olive Grove, Dripping Springs, TX 78620',
        price: '$1,249,000',
        note: '$318/sqft • Est. $6,220/mo',
        beds: '5 Beds',
        baths: '4 Baths',
        sqft: '3,920 sqft',
        img: 'assets/img/property-1.svg',
        desc: '2.5 secluded acres with detached guest casita, outdoor stone kitchen, custom workshop, and panoramic Texas sunset views.',
        link: 'listing-detail.html'
      },
      'card-8': {
        type: 'Historic Brownstone Row',
        badge: 'For Sale',
        badgeBg: 'bg-brand-600',
        title: '3 BrickStone Row',
        location: 'BrickStone Row, Georgetown, TX 78626',
        price: '$519,000',
        note: '$291/sqft • Est. $2,580/mo',
        beds: '3 Beds',
        baths: '2 Baths',
        sqft: '1,780 sqft',
        img: 'assets/img/property-6.svg',
        desc: 'Classic brick architecture near Georgetown Historic Square. Features interior exposed brick, courtyard garden, low tax rate, and low HOA fees.',
        link: 'listing-detail.html'
      }
    };

    // Filter Logic
    function applyFilter(filter) {
      currentFilter = filter;

      // Update Tab Styles
      filterTabs.forEach(tab => {
        const isActive = tab.getAttribute('data-filter') === filter;
        tab.classList.toggle('active', isActive);
        tab.classList.toggle('bg-brand-600', isActive);
        tab.classList.toggle('text-white', isActive);
        tab.classList.toggle('shadow-soft', isActive);
        tab.classList.toggle('font-bold', isActive);
        tab.classList.toggle('text-ink-600', !isActive);
        tab.classList.toggle('dark:text-slate-300', !isActive);
        tab.classList.toggle('font-semibold', !isActive);

        const badge = tab.querySelector('.prop-tab-badge');
        if (badge) {
          badge.className = isActive
            ? 'prop-tab-badge px-1.5 py-0.5 rounded-md text-[11px] font-extrabold bg-white/20 text-white'
            : 'prop-tab-badge px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-ink-100 dark:bg-white/10 text-ink-600 dark:text-slate-400';
        }
      });

      // Toggle Spotlight visibility (spotlight is sale + luxury)
      let spotlightVisible = false;
      if (spotlight) {
        if (filter === 'all' || filter === 'sale' || filter === 'luxury') {
          spotlight.style.display = 'block';
          spotlightVisible = true;
        } else {
          spotlight.style.display = 'none';
          spotlightVisible = false;
        }
      }

      // Filter Grid Cards
      let visibleCount = 0;
      cards.forEach(card => {
        const cat = (card.getAttribute('data-category') || '').toLowerCase();
        const cats = cat.split(/\s+/);
        const match = (filter === 'all') || cats.includes(filter);

        if (match) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      const totalVisible = visibleCount + (spotlightVisible ? 1 : 0);
      if (visibleCountEl) visibleCountEl.textContent = totalVisible;

      if (noPropsMsg) {
        noPropsMsg.classList.toggle('hidden', totalVisible > 0);
      }
    }

    filterTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        applyFilter(filter);
      });
    });

    if (resetFilterBtn) {
      resetFilterBtn.addEventListener('click', () => applyFilter('all'));
    }

    // Sort Logic
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        const val = sortSelect.value;
        let sortedCards = [...cards];

        if (val === 'price-asc') {
          sortedCards.sort((a, b) => parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price')));
        } else if (val === 'price-desc') {
          sortedCards.sort((a, b) => parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price')));
        } else if (val === 'sqft-desc') {
          sortedCards.sort((a, b) => parseFloat(b.getAttribute('data-sqft')) - parseFloat(a.getAttribute('data-sqft')));
        } else {
          sortedCards = [...originalCards];
        }

        sortedCards.forEach(c => grid.appendChild(c));
      });
    }

    // Quick View Modal Handlers
    function openModal(propId) {
      const data = propDataStore[propId];
      if (!data || !quickModal) return;

      const imgEl = $('#modal-prop-img', quickModal);
      const badgeEl = $('#modal-prop-badge', quickModal);
      const typeEl = $('#modal-prop-type', quickModal);
      const titleEl = $('#modal-prop-title', quickModal);
      const locEl = $('#modal-prop-location', quickModal);
      const priceEl = $('#modal-prop-price', quickModal);
      const noteEl = $('#modal-prop-note', quickModal);
      const bedsEl = $('#modal-prop-beds', quickModal);
      const bathsEl = $('#modal-prop-baths', quickModal);
      const sqftEl = $('#modal-prop-sqft', quickModal);
      const descEl = $('#modal-prop-desc', quickModal);
      const linkEl = $('#modal-prop-link', quickModal);

      if (imgEl) imgEl.src = data.img;
      if (badgeEl) {
        badgeEl.textContent = data.badge;
        badgeEl.className = `absolute top-3 start-3 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-soft ${data.badgeBg || 'bg-brand-600'}`;
      }
      if (typeEl) typeEl.textContent = data.type;
      if (titleEl) titleEl.textContent = data.title;
      if (locEl) locEl.innerHTML = `<i class="ri-map-pin-line text-brand-600"></i> ${data.location}`;
      if (priceEl) priceEl.textContent = data.price;
      if (noteEl) noteEl.textContent = data.note;
      if (bedsEl) bedsEl.textContent = data.beds;
      if (bathsEl) bathsEl.textContent = data.baths;
      if (sqftEl) sqftEl.textContent = data.sqft;
      if (descEl) descEl.textContent = data.desc;
      if (linkEl) linkEl.href = data.link || 'listing-detail.html';

      quickModal.classList.remove('hidden');
      quickModal.classList.add('flex');

      requestAnimationFrame(() => {
        quickModal.classList.remove('opacity-0');
        quickModal.classList.add('opacity-100');
        if (modalContent) {
          modalContent.classList.remove('scale-95');
          modalContent.classList.add('scale-100');
        }
      });
    }

    function closeModal() {
      if (!quickModal) return;
      quickModal.classList.remove('opacity-100');
      quickModal.classList.add('opacity-0');
      if (modalContent) {
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
      }
      setTimeout(() => {
        quickModal.classList.remove('flex');
        quickModal.classList.add('hidden');
      }, 300);
    }

    $$('.quick-view-btn', portal).forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const id = btn.getAttribute('data-prop-id');
        openModal(id);
      });
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (quickModal) {
      quickModal.addEventListener('click', e => {
        if (e.target === quickModal) closeModal();
      });
    }
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && quickModal && !quickModal.classList.contains('hidden')) {
        closeModal();
      }
    });

    // Favorites / Save Home Feature with Persistence
    const savedFavorites = JSON.parse(ls('oak_saved_props') || '[]');

    function updateFavBtns() {
      $$('.prop-fav-btn', portal).forEach(btn => {
        const title = btn.getAttribute('data-prop-title');
        const isFav = savedFavorites.includes(title);
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = isFav ? 'ri-heart-3-fill text-ember-500 text-base' : 'ri-heart-line text-base text-ink-500 hover:text-ember-500';
        }
      });
    }

    $$('.prop-fav-btn', portal).forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const title = btn.getAttribute('data-prop-title') || 'Listing';
        const idx = savedFavorites.indexOf(title);

        if (idx > -1) {
          savedFavorites.splice(idx, 1);
          showToast('Removed from Saved Homes', `Removed ${title} from your saved favorites.`, 'ri-heart-dislike-line text-ink-400');
        } else {
          savedFavorites.push(title);
          showToast('Saved to Dashboard!', `Added ${title} to your saved favorites list.`, 'ri-heart-3-fill text-ember-400');
        }

        ls('oak_saved_props', JSON.stringify(savedFavorites));
        updateFavBtns();
      });
    });

    updateFavBtns();
  }

  // Initialize on load
  initPropertyPortal();

  /* ---------- Home 2 Search & Filter Engine ---------- */
  function initHome2Filter() {
    const form = document.getElementById('home2-search-form');
    const queryInput = document.getElementById('home2-search-query');
    const typeSelect = document.getElementById('home2-search-type');
    const bedsSelect = document.getElementById('home2-search-beds');
    const countBadge = document.getElementById('home2-results-count');
    const noResults = document.getElementById('home2-no-results');
    const resetBtn = document.getElementById('home2-reset-filter');
    const clearBtn = document.getElementById('home2-clear-btn');
    const cards = Array.from(document.querySelectorAll('#home2-listings-grid [data-property-card]'));
    const categoryTabs = Array.from(document.querySelectorAll('[data-home2-tab]'));
    const quickTags = Array.from(document.querySelectorAll('[data-home2-quick-tag]'));

    if (cards.length === 0) return;

    function updateCategoryTabs(activeType) {
      categoryTabs.forEach(tab => {
        const tabType = tab.getAttribute('data-home2-tab');
        const isActive = (tabType === activeType);
        if (isActive) {
          tab.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-brand-600 text-white shadow-soft cursor-pointer';
        } else {
          tab.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-white dark:bg-forest-800 border border-ink-100 dark:border-white/10 text-ink-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-700 dark:hover:text-brand-300 cursor-pointer';
        }
      });
    }

    function applyFilter(isSubmit = false) {
      const q = (queryInput ? queryInput.value.trim().toLowerCase() : '');
      const type = (typeSelect ? typeSelect.value : 'all');
      const minBeds = (bedsSelect ? parseInt(bedsSelect.value, 10) || 0 : 0);

      let visibleCount = 0;

      cards.forEach(card => {
        const cardType = (card.getAttribute('data-type') || 'sale').toLowerCase();
        const cardBeds = parseInt(card.getAttribute('data-beds'), 10) || 0;
        const cardLoc = (card.getAttribute('data-location') || '').toLowerCase();
        const cardText = card.textContent.toLowerCase();

        const matchesType = (type === 'all' || cardType === type);
        const matchesBeds = (minBeds === 0 || cardBeds >= minBeds);
        const matchesQuery = (!q || cardLoc.includes(q) || cardText.includes(q) || cardType.includes(q));

        if (matchesType && matchesBeds && matchesQuery) {
          card.style.display = '';
          card.classList.remove('hidden');
          card.classList.add('aos-animate');
          card.style.opacity = '1';
          card.style.transform = 'none';
          card.style.visibility = 'visible';
          visibleCount++;
        } else {
          card.style.display = 'none';
          card.classList.add('hidden');
        }
      });

      if (countBadge) {
        countBadge.textContent = `${visibleCount} Propert${visibleCount === 1 ? 'y' : 'ies'}`;
      }

      if (noResults) {
        noResults.style.display = visibleCount > 0 ? 'none' : 'block';
        noResults.classList.toggle('hidden', visibleCount > 0);
      }

      updateCategoryTabs(type);

      const hasActiveFilters = q !== '' || type !== 'all' || minBeds !== 0;
      if (resetBtn) {
        resetBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';
        resetBtn.classList.toggle('hidden', !hasActiveFilters);
      }

      if (window.AOS) window.AOS.refresh();

      if (isSubmit) {
        const targetSection = document.getElementById('home2-featured-section');
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        showToast(
          visibleCount > 0 ? `Found ${visibleCount} matching listings` : 'No matching properties found',
          visibleCount > 0 ? 'ri-search-eye-line' : 'ri-information-line'
        );
      }
    }

    function resetFilters() {
      if (queryInput) queryInput.value = '';
      if (typeSelect) typeSelect.value = 'all';
      if (bedsSelect) bedsSelect.value = '0';
      applyFilter(false);
    }

    // Input & select events for instant real-time responsiveness
    if (queryInput) {
      ['input', 'keyup', 'change', 'search'].forEach(evt => {
        queryInput.addEventListener(evt, () => applyFilter(false));
      });
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', () => applyFilter(false));
    }
    if (bedsSelect) {
      bedsSelect.addEventListener('change', () => applyFilter(false));
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilter(true);
      });
    }

    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
    if (clearBtn) clearBtn.addEventListener('click', resetFilters);

    // Category Tabs click
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const tabType = tab.getAttribute('data-home2-tab') || 'all';
        if (typeSelect) typeSelect.value = tabType;
        if (queryInput) queryInput.value = '';
        if (bedsSelect) bedsSelect.value = '0';
        applyFilter(false);
      });
    });

    // Quick tags click
    quickTags.forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.preventDefault();
        const val = tag.getAttribute('data-home2-quick-tag');
        if (val === 'all') {
          resetFilters();
        } else if (val === 'sale' || val === 'rent' || val === 'commercial' || val === 'land') {
          if (typeSelect) typeSelect.value = val;
          if (queryInput) queryInput.value = '';
          if (bedsSelect) bedsSelect.value = '0';
          applyFilter(true);
        } else if (val === 'austin') {
          if (queryInput) queryInput.value = 'Austin';
          if (typeSelect) typeSelect.value = 'all';
          applyFilter(true);
        }
      });
    });

    // Read URL query params
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = (urlParams.get('cat') || '').toLowerCase();
      const filterParam = (urlParams.get('filter') || '').toLowerCase();
      const modeParam = (urlParams.get('mode') || '').toLowerCase();
      const locParam = urlParams.get('location') || urlParams.get('q') || '';
      const typeParam = (urlParams.get('property_type') || urlParams.get('type') || '').toLowerCase();
      const bedsParam = urlParams.get('beds') || '';
      const tagParam = (urlParams.get('tag') || '').toLowerCase();

      if (locParam && queryInput) queryInput.value = locParam;
      if (bedsParam && bedsSelect) bedsSelect.value = bedsParam;

      if (modeParam === 'rent' && typeSelect) typeSelect.value = 'rent';
      else if (modeParam === 'buy' && typeSelect) typeSelect.value = 'sale';

      if (typeParam) {
        if (typeParam.includes('rent') && typeSelect) typeSelect.value = 'rent';
        else if (typeParam.includes('commercial') && typeSelect) typeSelect.value = 'commercial';
        else if (typeParam.includes('land') && typeSelect) typeSelect.value = 'land';
        else if ((typeParam.includes('sale') || typeParam.includes('single') || typeParam.includes('villa')) && typeSelect) typeSelect.value = 'sale';
      }

      if (tagParam) {
        if (tagParam.includes('villa') || tagParam.includes('westlake')) {
          if (typeSelect) typeSelect.value = 'sale';
        } else if (tagParam.includes('condo')) {
          if (queryInput) queryInput.value = 'Harbor';
        } else if (tagParam.includes('land')) {
          if (typeSelect) typeSelect.value = 'land';
        }
      }

      if (catParam) {
        if (catParam.includes('rent') && typeSelect) typeSelect.value = 'rent';
        else if (catParam.includes('villa') || catParam.includes('luxury')) {
          if (typeSelect) typeSelect.value = 'sale';
          if (queryInput) queryInput.value = 'Dripping Springs';
        } else if (catParam.includes('condo') && queryInput) {
          queryInput.value = 'Harbor';
        } else if (catParam.includes('land') && typeSelect) {
          typeSelect.value = 'land';
        }
      }

      if (filterParam === 'family' && bedsSelect) bedsSelect.value = '3';
    } catch (_) {}

    // Initialize filter state
    applyFilter(false);

    window.filterHome2Category = function(catType) {
      if (typeSelect) typeSelect.value = catType;
      if (queryInput) queryInput.value = '';
      if (bedsSelect) bedsSelect.value = '0';
      applyFilter(false);
    };
  }

  initHome2Filter();

  /* ---------- Home 2 Property Save & Favorites Logic ---------- */
  function initHome2SaveButtons() {
    const saveBtns = Array.from(document.querySelectorAll('.home2-save-btn'));
    const favIcons = Array.from(document.querySelectorAll('.home2-fav-icon-btn'));

    function getSavedList() {
      try {
        const stored = ls('oak_saved_props');
        return stored ? JSON.parse(stored) : [];
      } catch (_) {
        return [];
      }
    }

    function updateHeaderCount(count) {
      const badges = document.querySelectorAll('#header-saved-count');
      badges.forEach(badge => {
        badge.textContent = count;
        badge.classList.remove('heart-pop');
        void badge.offsetWidth;
        badge.classList.add('heart-pop');
      });
    }

    function saveList(list) {
      ls('oak_saved_props', JSON.stringify(list));
      updateHeaderCount(list.length);
      window.dispatchEvent(new CustomEvent('oak_saved_props_changed', { detail: { saved: list } }));
    }

    function updateCardUI(title, isSaved) {
      // Update action button
      saveBtns.forEach(btn => {
        if (btn.getAttribute('data-prop-title') === title) {
          const defaultText = btn.getAttribute('data-default-text') || 'Save';
          const textSpan = btn.querySelector('span');
          const icon = btn.querySelector('i');

          if (isSaved) {
            btn.classList.add('bg-emerald-700', 'ring-2', 'ring-emerald-400/40');
            btn.classList.remove('bg-brand-600', 'hover:bg-brand-500');
            if (textSpan) textSpan.textContent = 'Saved';
            if (icon) {
              icon.className = 'ri-heart-3-fill text-ember-400 text-sm heart-pop';
            }
            btn.setAttribute('aria-pressed', 'true');
            btn.setAttribute('title', `Saved to favorites. Click to remove.`);
          } else {
            btn.classList.remove('bg-emerald-700', 'ring-2', 'ring-emerald-400/40');
            btn.classList.add('bg-brand-600', 'hover:bg-brand-500');
            if (textSpan) textSpan.textContent = defaultText;
            if (icon) {
              icon.className = 'ri-heart-line text-sm';
            }
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('title', `Click to ${defaultText.toLowerCase()}`);
          }
        }
      });

      // Update floating heart icon
      favIcons.forEach(btn => {
        if (btn.getAttribute('data-prop-title') === title) {
          const icon = btn.querySelector('i');
          if (isSaved) {
            btn.classList.add('text-ember-500', 'ring-2', 'ring-ember-400/40');
            btn.classList.remove('text-ink-600', 'dark:text-slate-300');
            if (icon) icon.className = 'ri-heart-3-fill text-ember-500 text-base heart-pop';
            btn.setAttribute('aria-pressed', 'true');
            btn.setAttribute('title', 'Remove from favorites');
          } else {
            btn.classList.remove('text-ember-500', 'ring-2', 'ring-ember-400/40');
            btn.classList.add('text-ink-600', 'dark:text-slate-300');
            if (icon) icon.className = 'ri-heart-line text-base';
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('title', 'Add to favorites');
          }
        }
      });
    }

    function refreshAll() {
      const saved = getSavedList();
      const allTitles = new Set([
        ...saveBtns.map(b => b.getAttribute('data-prop-title')).filter(Boolean),
        ...favIcons.map(b => b.getAttribute('data-prop-title')).filter(Boolean)
      ]);
      allTitles.forEach(title => {
        updateCardUI(title, saved.includes(title));
      });
      updateHeaderCount(saved.length);
    }

    function toggleSave(title, defaultText = 'Save') {
      if (!title) return;
      let saved = getSavedList();
      const idx = saved.indexOf(title);
      const isCurrentlySaved = (idx > -1);

      if (isCurrentlySaved) {
        saved.splice(idx, 1);
        saveList(saved);
        updateCardUI(title, false);
        showToast(`Removed "${title}" from saved favorites`, 'ri-heart-dislike-line text-ink-400');
      } else {
        saved.push(title);
        saveList(saved);
        updateCardUI(title, true);
        showToast(`Saved "${title}" to your favorites!`, 'ri-heart-3-fill text-ember-400');
      }
    }

    saveBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const title = btn.getAttribute('data-prop-title');
        const defaultText = btn.getAttribute('data-default-text') || 'Save';
        toggleSave(title, defaultText);
      });
    });

    favIcons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const title = btn.getAttribute('data-prop-title');
        toggleSave(title);
      });
    });

    // Initial state refresh
    refreshAll();

    window.addEventListener('storage', (e) => {
      if (e.key === 'oak_saved_props') refreshAll();
    });
    window.addEventListener('oak_saved_props_changed', () => {
      refreshAll();
    });
  }

  initHome2SaveButtons();

  /* ---------- Home 2 Texas Mortgage & Affordability Estimator ---------- */
  function initHome2Calculator() {
    const priceInput = document.getElementById('home2-calc-price-input');
    const priceRange = document.getElementById('home2-calc-price-range');
    const downPills = Array.from(document.querySelectorAll('#home2-calc-down-pills button'));
    const termPills = Array.from(document.querySelectorAll('#home2-calc-term-pills button'));
    const homesteadToggle = document.getElementById('home2-calc-homestead');
    const presets = Array.from(document.querySelectorAll('[data-calc-preset]'));

    const totalDisplay = document.getElementById('home2-calc-total-display');
    const loanSummary = document.getElementById('home2-calc-loan-summary');
    const downAmountDisplay = document.getElementById('home2-calc-down-amount');

    const barPI = document.getElementById('bar-pi');
    const barTax = document.getElementById('bar-tax');
    const barIns = document.getElementById('bar-ins');
    const barHOA = document.getElementById('bar-hoa');

    const breakdownPI = document.getElementById('breakdown-pi');
    const breakdownTax = document.getElementById('breakdown-tax');
    const breakdownIns = document.getElementById('breakdown-ins');
    const breakdownHOA = document.getElementById('breakdown-hoa');

    if (!priceInput || !priceRange) return;

    let currentPrice = parseInt(priceInput.value, 10) || 684900;
    let currentDownPct = 20;
    let currentYears = 30;
    let currentRate = 5.85;
    let isHomestead = homesteadToggle ? homesteadToggle.checked : true;

    function update() {
      const downAmount = currentPrice * (currentDownPct / 100);
      const loanAmount = Math.max(0, currentPrice - downAmount);
      const monthlyRate = (currentRate / 100) / 12;
      const numPayments = currentYears * 12;

      let piMonthly = 0;
      if (monthlyRate > 0 && loanAmount > 0) {
        piMonthly = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      }

      const taxableValue = isHomestead ? Math.max(0, currentPrice - 100000) : currentPrice;
      const taxMonthly = (taxableValue * (1.81 / 100)) / 12;
      const insMonthly = 145;
      const hoaMonthly = 65;
      const pmiMonthly = currentDownPct < 20 ? (loanAmount * 0.0055) / 12 : 0;

      const total = Math.round(piMonthly + taxMonthly + insMonthly + hoaMonthly + pmiMonthly);

      if (totalDisplay) totalDisplay.textContent = '$' + total.toLocaleString();
      if (loanSummary) {
        loanSummary.textContent = `Based on $${Math.round(loanAmount).toLocaleString()} loan amount at ${currentRate}% for ${currentYears} years.`;
      }
      if (downAmountDisplay) {
        downAmountDisplay.textContent = `$${Math.round(downAmount).toLocaleString()} (${currentDownPct}%)`;
      }

      if (breakdownPI) breakdownPI.textContent = '$' + Math.round(piMonthly + pmiMonthly).toLocaleString();
      if (breakdownTax) breakdownTax.textContent = '$' + Math.round(taxMonthly).toLocaleString();
      if (breakdownIns) breakdownIns.textContent = '$' + Math.round(insMonthly).toLocaleString();
      if (breakdownHOA) breakdownHOA.textContent = '$' + Math.round(hoaMonthly).toLocaleString();

      if (barPI && barTax && barIns && barHOA && total > 0) {
        const piPct = Math.max(5, Math.round(((piMonthly + pmiMonthly) / total) * 100));
        const taxPct = Math.max(5, Math.round((taxMonthly / total) * 100));
        const insPct = Math.max(2, Math.round((insMonthly / total) * 100));
        const hoaPct = Math.max(1, 100 - piPct - taxPct - insPct);

        barPI.style.width = piPct + '%';
        barTax.style.width = taxPct + '%';
        barIns.style.width = insPct + '%';
        barHOA.style.width = Math.max(1, hoaPct) + '%';
      }
    }

    function setPrice(val) {
      currentPrice = Math.max(50000, Math.min(5000000, parseInt(val, 10) || 500000));
      priceInput.value = currentPrice;
      priceRange.value = currentPrice;
      update();
    }

    priceInput.addEventListener('input', () => setPrice(priceInput.value));
    priceRange.addEventListener('input', () => setPrice(priceRange.value));

    downPills.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        currentDownPct = parseInt(this.getAttribute('data-down'), 10) || 20;
        downPills.forEach(b => {
          if (b === btn) {
            b.className = 'px-2.5 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-soft transition cursor-pointer';
          } else {
            b.className = 'px-2.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-forest-800 border border-ink-100 dark:border-white/10 text-ink-700 dark:text-slate-300 hover:border-brand-500 transition cursor-pointer';
          }
        });
        update();
      });
    });

    termPills.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        currentYears = parseInt(this.getAttribute('data-term'), 10) || 30;
        currentRate = parseFloat(this.getAttribute('data-rate')) || 5.85;
        termPills.forEach(b => {
          if (b === btn) {
            b.className = 'px-2.5 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-soft transition cursor-pointer';
          } else {
            b.className = 'px-2.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-forest-800 border border-ink-100 dark:border-white/10 text-ink-700 dark:text-slate-300 hover:border-brand-500 transition cursor-pointer';
          }
        });
        update();
      });
    });

    if (homesteadToggle) {
      homesteadToggle.addEventListener('change', function() {
        isHomestead = this.checked;
        update();
      });
    }

    presets.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const val = parseInt(this.getAttribute('data-calc-preset'), 10);
        if (val) {
          setPrice(val);
          presets.forEach(p => {
            p.classList.remove('bg-brand-500/10', 'text-brand-700', 'dark:text-brand-300', 'border-brand-500/20');
            p.classList.add('bg-white', 'dark:bg-forest-800', 'border-ink-100', 'dark:border-white/10', 'text-ink-700', 'dark:text-slate-300');
          });
          btn.classList.add('bg-brand-500/10', 'text-brand-700', 'dark:text-brand-300', 'border-brand-500/20');
          btn.classList.remove('bg-white', 'dark:bg-forest-800', 'border-ink-100', 'dark:border-white/10', 'text-ink-700', 'dark:text-slate-300');
        }
      });
    });

    update();
  }

  initHome2Calculator();

  /* ---------- Carousel Navigation (Smooth Scroll) ---------- */
  function initCarousels() {
    $$('[data-carousel]').forEach(carousel => {
      const row = $('.snap-row', carousel);
      const prevBtn = $('[data-carousel-prev]', carousel);
      const nextBtn = $('[data-carousel-next]', carousel);
      if (!row || (!prevBtn && !nextBtn)) return;

      const getScrollAmount = () => {
        const firstCard = row.querySelector('.scroll-snap-align-start, > div');
        return firstCard ? firstCard.offsetWidth + 24 : 360;
      };

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
          row.scrollBy({ left: isRtl ? getScrollAmount() : -getScrollAmount(), behavior: 'smooth' });
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
          row.scrollBy({ left: isRtl ? -getScrollAmount() : getScrollAmount(), behavior: 'smooth' });
        });
      }
    });
  }

  initCarousels();

})();