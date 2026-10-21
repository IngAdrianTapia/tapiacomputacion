// Tapia Computación · sitio estático, sin backend ni rastreadores.
// ÚNICO lugar con el número de WhatsApp/teléfono. Cambiarlo aquí cambia todo el sitio
// (botones WhatsApp, enlaces tel:, número visible y datos para Google/JSON-LD).
const WA_NUM = '528721370047';      // 52 + 10 dígitos → 872 137 0047
// Enlace de pago de Mercado Pago. Mientras esté vacío, el botón pide el enlace por WhatsApp.
const MP_LINK = '';

(function(){
  var diez = WA_NUM.replace(/^52/, '');
  var visible = diez.slice(0,3) + ' ' + diez.slice(3,6) + ' ' + diez.slice(6);
  function wa(t){ return 'https://wa.me/' + WA_NUM + (t ? '?text=' + encodeURIComponent(t) : ''); }

  // Enlaces y textos de contacto
  document.querySelectorAll('[data-wa]').forEach(function(a){ a.href = wa(a.getAttribute('data-wa')); });
  document.querySelectorAll('[data-tel]').forEach(function(a){ a.href = 'tel:+' + WA_NUM; });
  document.querySelectorAll('[data-tel-texto]').forEach(function(s){ s.textContent = visible; });

  // Datos estructurados (Google) con el mismo número
  var ld = document.getElementById('ld-negocio');
  if (ld) try {
    var j = JSON.parse(ld.textContent);
    j.telephone = '+52 ' + visible;
    if (j.contactPoint) j.contactPoint.telephone = j.telephone;
    ld.textContent = JSON.stringify(j);
  } catch (e) {}

  // Menú móvil: abre y cierra con el botón, con Esc, al tocar fuera o al elegir una sección
  var btn = document.querySelector('.menu-btn'), menu = document.getElementById('menu');
  function menuAbierto(a, devolverFoco){
    if (!btn || !menu) return;
    menu.classList.toggle('abierto', a);
    btn.setAttribute('aria-expanded', a ? 'true' : 'false');
    btn.setAttribute('aria-label', a ? 'Cerrar menú' : 'Abrir menú');
    if (a) { var primero = menu.querySelector('a'); if (primero) primero.focus(); }
    else if (devolverFoco) btn.focus();
  }
  if (btn && menu) {
    btn.addEventListener('click', function(){ menuAbierto(!menu.classList.contains('abierto')); });
    menu.addEventListener('click', function(e){ if (e.target.closest('a')) menuAbierto(false); });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && menu.classList.contains('abierto')) menuAbierto(false, true);
    });
    document.addEventListener('click', function(e){
      if (menu.classList.contains('abierto') && !menu.contains(e.target) && !btn.contains(e.target)) menuAbierto(false);
    });
    window.addEventListener('resize', function(){ if (window.innerWidth > 960) menuAbierto(false); });
  }

  var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Anclas internas: scroll suave a la sección real; si el destino es una pregunta o un sistema, se abre
  function abrirDestino(id){
    var el = id && document.getElementById(id);
    if (!el) return null;
    if (el.tagName === 'DETAILS') el.open = true;
    var panel = el.closest('[role="tabpanel"]');
    if (panel && panel.hidden) activarPestana(document.getElementById(panel.getAttribute('aria-labelledby')), false);
    return el;
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-wa') && a.getAttribute('href').indexOf('#') !== 0) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var el = abrirDestino(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({behavior: reducir ? 'auto' : 'smooth', block: 'start'});
    if (history.pushState) history.pushState(null, '', '#' + id);
    if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|DETAILS)$/.test(el.tagName)) el.setAttribute('tabindex', '-1');
    el.focus({preventScroll: true});
  });
  window.addEventListener('hashchange', function(){ abrirDestino(location.hash.slice(1)); });

  // Pestañas del catálogo CONTPAQi®: se arman desde los grupos (sin JavaScript se ven todos)
  var grupos = [].slice.call(document.querySelectorAll('#catalogo .grupo[data-pestana]'));
  var pestanas = [];
  function activarPestana(tab, foco){
    if (!tab) return;
    pestanas.forEach(function(t){
      var si = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
      t.setAttribute('aria-selected', si ? 'true' : 'false');
      t.tabIndex = si ? 0 : -1;
      panel.hidden = !si;
    });
    if (foco) tab.focus();
  }
  if (grupos.length > 1) {
    var lista = document.createElement('div');
    lista.className = 'pestanas';
    lista.setAttribute('role', 'tablist');
    lista.setAttribute('aria-label', 'Categorías de sistemas CONTPAQi');
    grupos.forEach(function(g){
      var b = document.createElement('button');
      b.type = 'button';
      b.id = 'pestana-' + g.id;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', g.id);
      b.innerHTML = '<span></span><span class="pestanas__n"></span>';
      b.firstChild.textContent = g.getAttribute('data-pestana');
      b.lastChild.textContent = g.getAttribute('data-cuantos');
      g.setAttribute('role', 'tabpanel');
      g.setAttribute('aria-labelledby', b.id);
      g.tabIndex = 0;
      g.classList.add('grupo--pestana');
      b.addEventListener('click', function(){ activarPestana(b); });
      lista.appendChild(b);
      pestanas.push(b);
    });
    lista.addEventListener('keydown', function(e){
      var i = pestanas.indexOf(document.activeElement), n = pestanas.length, j = -1;
      if (i < 0) return;
      if (e.key === 'ArrowRight') j = (i + 1) % n;
      else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = n - 1;
      if (j >= 0) { e.preventDefault(); activarPestana(pestanas[j], true); }
    });
    grupos[0].parentNode.insertBefore(lista, grupos[0]);
    activarPestana(pestanas[0]);
  }

  // Menú: marca la sección visible
  var enlacesMenu = menu ? [].slice.call(menu.querySelectorAll('a[href^="#"]:not(.btn)')) : [];
  var secciones = [].slice.call(document.querySelectorAll('main section[id], footer[id]'));
  var barra = document.querySelector('.barra'), avance = document.querySelector('.barra__avance span');
  var subir = document.querySelector('.subir');
  var pendiente = false;
  function alDesplazar(){
    pendiente = false;
    var y = window.scrollY, alto = document.documentElement.scrollHeight - window.innerHeight;
    var actual = null;
    secciones.forEach(function(s){ if (s.getBoundingClientRect().top <= 120) actual = s.id; });
    if (alto - y < 4) actual = secciones.length ? secciones[secciones.length - 1].id : actual;
    enlacesMenu.forEach(function(a){
      var si = a.getAttribute('href') === '#' + actual;
      a.classList.toggle('activo', si);
      if (si) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
    if (barra) barra.classList.toggle('con-sombra', y > 8);
    if (avance) avance.style.transform = 'scaleX(' + (alto > 0 ? Math.min(1, y / alto) : 0) + ')';
    if (subir) subir.hidden = y < 900;
  }
  window.addEventListener('scroll', function(){ if (!pendiente) { pendiente = true; requestAnimationFrame(alDesplazar); } }, {passive: true});
  alDesplazar();
  if (subir) subir.addEventListener('click', function(){
    window.scrollTo({top: 0, behavior: reducir ? 'auto' : 'smooth'});
    var m = document.querySelector('.marca'); if (m) m.focus({preventScroll: true});
  });

  // Entrada suave de tarjetas al aparecer (sin JavaScript o con movimiento reducido se ven normales)
  if ('IntersectionObserver' in window && !reducir) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add('anim-visto'); io.unobserve(en.target); } });
    }, {rootMargin: '0px 0px -8% 0px'});
    document.querySelectorAll('.beneficio, .tarjeta, .ventaja, .paso, .paquete, .planes, .galeria__item').forEach(function(el){
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('anim-entrada'); io.observe(el); }
    });
  }

  // Visor de capturas del Facturador: flechas, teclado y Esc; nunca más grande que la captura real
  var visor = document.getElementById('visor');
  var abrir = [].slice.call(document.querySelectorAll('.galeria__abrir'));
  if (visor && abrir.length && typeof visor.showModal === 'function') {
    var fig = visor.querySelector('.visor__figura'), pie = visor.querySelector('.visor__pie');
    var cuenta = visor.querySelector('.visor__cuenta'), img = null;
    var idx = 0, origen = null;
    function mostrar(i){
      idx = (i + abrir.length) % abrir.length;
      if (!img) { img = document.createElement('img'); img.decoding = 'async'; fig.insertBefore(img, pie); }
      var a = abrir[idx], mini = a.querySelector('img'), cap = a.parentNode.querySelector('figcaption');
      img.src = a.getAttribute('href');
      img.alt = mini ? mini.alt : '';
      img.width = +a.getAttribute('data-ancho') || 0;
      img.height = +a.getAttribute('data-alto') || 0;
      img.style.maxWidth = img.width ? img.width + 'px' : '';
      pie.textContent = cap ? cap.textContent : '';
      cuenta.textContent = 'Captura ' + (idx + 1) + ' de ' + abrir.length;
    }
    abrir.forEach(function(a, i){
      a.addEventListener('click', function(e){ e.preventDefault(); origen = a; mostrar(i); visor.showModal(); visor.querySelector('.visor__cerrar').focus(); });
    });
    visor.querySelector('.visor__btn--ant').addEventListener('click', function(){ mostrar(idx - 1); });
    visor.querySelector('.visor__btn--sig').addEventListener('click', function(){ mostrar(idx + 1); });
    visor.querySelector('.visor__cerrar').addEventListener('click', function(){ visor.close(); });
    visor.addEventListener('click', function(e){ if (e.target === visor) visor.close(); });
    visor.addEventListener('keydown', function(e){
      if (e.key === 'ArrowLeft') { e.preventDefault(); mostrar(idx - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(idx + 1); }
    });
    var tx = null;
    visor.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, {passive: true});
    visor.addEventListener('touchend', function(e){
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 50) mostrar(idx + (dx < 0 ? 1 : -1));
    });
    visor.addEventListener('close', function(){ if (origen) origen.focus(); });
  }

  // Al llegar con #ancla en la dirección (por ejemplo #pregunta-3), se abre ese destino
  if (location.hash) { var dest = abrirDestino(location.hash.slice(1)); if (dest) dest.scrollIntoView({block: 'start'}); }

  var y = document.getElementById('anio'); if (y) y.textContent = new Date().getFullYear();

  // Abierto/cerrado según la hora de Coahuila: L-V 10-18, sáb 10-17, dom cerrado
  var el = document.getElementById('abierto');
  if (el) try {
    var p = new Intl.DateTimeFormat('en-US', {timeZone:'America/Monterrey', weekday:'short', hour:'numeric', minute:'numeric', hour12:false}).formatToParts(new Date());
    var d = {}; p.forEach(function(x){ d[x.type] = x.value; });
    var h = (parseInt(d.hour,10) % 24) + parseInt(d.minute,10)/60, dia = d.weekday;
    var cierre = dia === 'Sun' ? 0 : (dia === 'Sat' ? 17 : 18), abierto = cierre && h >= 10 && h < cierre;
    el.textContent = abierto ? 'Abierto ahora' : 'Cerrado ahora · escríbanos y le respondemos al abrir';
    if (!abierto) el.classList.add('cerrado');
    el.hidden = false;
  } catch (e) {}

  // Botón de pago
  var bp = document.getElementById('btnPago');
  if (bp && MP_LINK) { bp.href = MP_LINK; bp.removeAttribute('data-wa'); bp.textContent = 'Pagar con Mercado Pago'; }

  // Programa Empresa Piloto: arma el mensaje de WhatsApp (no se guarda nada)
  var f = document.getElementById('formPiloto');
  if (f) f.addEventListener('submit', function(e){
    e.preventDefault();
    if (!f.reportValidity()) return;
    var t = 'Hola, quiero registrarme en el Programa Empresa Piloto de Tapia Computación.\n' +
      'Nombre: ' + f.nombre.value.trim() + '\n' +
      'Empresa: ' + f.empresa.value.trim() + '\n' +
      'Ciudad: ' + f.ciudad.value.trim() + '\n' +
      'Sistema CONTPAQi: ' + f.sistema.value + '\n' +
      'Teléfono: ' + f.telefono.value.trim();
    window.open(wa(t), '_blank', 'noopener');
  });
})();
