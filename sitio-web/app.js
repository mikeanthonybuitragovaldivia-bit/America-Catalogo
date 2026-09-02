(function(){
var WHATSAPP_NUMBER = "59167370803"; // EDITAR: reemplazar por el numero real de Mike (con codigo de pais, sin +)

// --- Marcas ------------------------------------------------------------
// CAME es la marca sombrilla (el logo del header). Cada marca de abajo es
// una tienda independiente con sus propias hojas de Google Sheets para
// Productos, Categorias (fotos de portada) y Carrusel de inicio.
// Para agregar productos/categorias a una marca: abre su Sheet de
// "Productos" (o "Categorias") en la carpeta de Drive "Catálogo América -
// Marcas / <NOMBRE MARCA>" y agrega filas ahi. El sitio se actualiza solo,
// sin tocar este archivo.
var MARCAS = {
  itenez: {
    id:'itenez', nombre:'Iténez', nombreCompleto:'Iténez Productos Orientales',
    tagline:'Cuidado natural para toda la familia',
    emoji:'🌿', color:'#3f6b4a', colorOsc:'#28422e',
    sheetProductos:'1PVtQ3nucdwCAN9FMi_csEMRm6sQEtOIChEJdr2KtlhQ',
    sheetCategorias:'1EiAiZv9SmLIpW-0aqGktu8jRWd8y9HrnyE350Ejx1Cc',
    sheetCarrusel:'1nqYKBMZ-VjAWEgIKP7ohxh1Uugl2ayIDImbWK5CV6JA',
    catOrder:["Hidrolatos","Tinturas Naturales","Aceites Esenciales","IVI SY","Oleatos y Macerados","Aceites Prensados en Frío","Sentido Natural","Vinagres","Harinas","Sales y Otros"],
    catIcons:{"Hidrolatos":"💧","Tinturas Naturales":"🌿","Aceites Esenciales":"🌸","IVI SY":"🧴","Oleatos y Macerados":"🫒","Aceites Prensados en Frío":"🥥","Sentido Natural":"🍃","Vinagres":"🍾","Harinas":"🌾","Sales y Otros":"🧂"}
  },
  natumis: {
    id:'natumis', nombre:'Natumis', nombreCompleto:'Natumis',
    tagline:'Jabones y velas artesanales',
    emoji:'🌱', color:'#1f8a55', colorOsc:'#155c3a',
    sheetProductos:'12jAmdaXPlVycNOjVcyVOvAbztSg48_Ab5PKCrRbXZSA',
    sheetCategorias:'1iM_fo8FWIfXiwxx3PbkuafRy2nQFPt1oN2UsOWn0rdk',
    sheetCarrusel:null,
    catOrder:['Jabones','Velas'], catIcons:{'Jabones':'🧼','Velas':'🕯️'}
  },
  gimnasio: {
    id:'gimnasio', nombre:'Gimnasio', nombreCompleto:'Gimnasio',
    tagline:'Muy pronto en tu catálogo',
    emoji:'🏋️', color:'#c9532f', colorOsc:'#8a3a20',
    sheetProductos:'13qa1MfuE8ZDKkIdZsReWDxgew5M_yP6qIgPSRP2cEO8',
    sheetCategorias:'1c2pyKZhEqh1XRI7ZoA_PYLPMZzUHTtLrFpBVU_p50oI',
    sheetCarrusel:null,
    catOrder:[], catIcons:{}
  },
  ropa: {
    id:'ropa', nombre:'Ropa', nombreCompleto:'Ropa',
    tagline:'Muy pronto en tu catálogo',
    emoji:'👕', color:'#3f57c9', colorOsc:'#2a3a8a',
    sheetProductos:'1QRe6YwIiZDhDYjk1RMEa8FEnklUA_8E0zdyocsWzhYE',
    sheetCategorias:'1I9rAz5nLLthdnazBtG_3B_zArpXQraaRjpodmkm1mG4',
    sheetCarrusel:null,
    catOrder:[], catIcons:{}
  }
};
var MARCA_ORDER = ['itenez','natumis','gimnasio','ropa'];

function izCsvUrl(sheetId){ return "https://docs.google.com/spreadsheets/d/"+sheetId+"/export?format=csv"; }

// Lee ?marca=xxx de la URL. Devuelve null si no hay marca valida (pantalla de bienvenida).
function izActiveMarcaId(){
  var params = new URLSearchParams(window.location.search);
  var m = params.get('marca');
  return (m && MARCAS[m]) ? m : null;
}

// Genera la lista de categorias de una marca a partir de sus datos reales del Sheet:
// respeta el orden conocido (catOrder) y agrega automaticamente al final cualquier
// categoria nueva que se escriba en la columna "categoria" del Sheet de Productos.
function izGetCategories(data, marca){
  var order = (marca && marca.catOrder) || [];
  var present = {}; var extras = [];
  data.forEach(function(p){
    var cat = (p.categoria||'').trim();
    if(!cat) return;
    if(!present[cat]){ present[cat]=true; if(order.indexOf(cat)===-1) extras.push(cat); }
  });
  extras.sort();
  return order.concat(extras);
}

function izRenderNav(activePage, marcaId){
  var nav = document.getElementById('nav-placeholder');
  if(!nav) return;
  var navMarca = MARCAS[marcaId];
  function link(href,label,page){ return '<a href="'+href+'" class="iz-link'+(page===activePage?' active':'')+'">'+label+'</a>'; }
  var qs = navMarca ? ('?marca='+navMarca.id) : ('?marca='+MARCAS.itenez.id);
  var badge = navMarca ? ('<a href="index.html" class="iz-marca-badge" title="Cambiar de marca" style="background:'+navMarca.color+'1c;color:'+navMarca.colorOsc+'">'+navMarca.emoji+' <span class="iz-badge-txt">'+navMarca.nombre+'</span></a>') : '';
  nav.innerHTML = '<div id="iz-nav"><div class="iz-brandwrap"><a href="index.html" class="iz-logo"><img src="logo-came.png" alt="CAME"></a>'+badge+'</div><div class="iz-links">'
    + link('index.html'+qs,'INICIO','home')
    + link('catalogo.html'+qs,'PRODUCTOS','productos')
    + link('contacto.html','CONTACTO','contacto')
    + '<button id="iz-cart-btn" onclick="izOpenCart()">🛒 Pedido<span id="iz-cart-count">0</span></button></div></div>';
  var navEl = document.getElementById('iz-nav');
  if(navEl){
    var onScroll = function(){ navEl.classList.toggle('scrolled', window.scrollY>8); };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }
}

function izRenderFooter(marcaId){
  var el = document.getElementById('footer-placeholder');
  if(!el) return;
  var qs = '?marca='+(marcaId||'itenez');
  var marcasLinks = MARCA_ORDER.map(function(id){
    var m = MARCAS[id];
    return '<a href="index.html?marca='+id+'">'+m.emoji+' '+m.nombre+'</a>';
  }).join('');
  el.innerHTML = ''
    + '<footer class="iz-footer">'
    +   '<div class="iz-footer-grid">'
    +     '<div class="iz-footer-col iz-footer-brand"><img src="logo-came.png" alt="CAME" class="iz-footer-logo"><p>Catálogo de marcas propias con productos naturales, elaborados de forma artesanal en Bolivia.</p></div>'
    +     '<div class="iz-footer-col"><h4>Navegación</h4><a href="index.html">Inicio</a><a href="catalogo.html'+qs+'">Productos</a><a href="contacto.html">Contacto</a></div>'
    +     '<div class="iz-footer-col"><h4>Marcas</h4>'+marcasLinks+'</div>'
    +     '<div class="iz-footer-col"><h4>Contáctanos</h4><a href="https://wa.me/'+WHATSAPP_NUMBER+'" target="_blank">💬 WhatsApp</a><p class="iz-footer-note">🚚 Envíos a todo el país<br>🤲 Elaboración artesanal<br>💬 Atención personalizada</p></div>'
    +   '</div>'
    +   '<div class="iz-footer-bottom">© '+new Date().getFullYear()+' CAME · Todos los derechos reservados</div>'
    + '</footer>';
}

// --- Animaciones al hacer scroll -------------------------------------
// Cualquier elemento con la clase "iz-reveal" aparece con un fade+slide-up
// suave apenas entra en la pantalla, con un pequeño efecto escalonado
// (cascada) segun el orden en que se observan dentro de su contenedor.
var izRevealObserver = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){ entry.target.classList.add('iz-inview'); izRevealObserver.unobserve(entry.target); }
  });
}, {threshold:0.12, rootMargin:'0px 0px -30px 0px'}) : null;
function izRevealInit(container){
  if(!container) return;
  var els = container.querySelectorAll ? container.querySelectorAll('.iz-reveal:not(.iz-observed)') : [];
  Array.prototype.forEach.call(els, function(el, i){
    el.classList.add('iz-observed');
    if(!izRevealObserver){ el.classList.add('iz-inview'); return; }
    el.style.transitionDelay = Math.min(i*50,500)+'ms';
    izRevealObserver.observe(el);
  });
}

function izParseCSV(text){
  var rows=[],row=[],field="",inQ=false;
  for(var i=0;i<text.length;i++){
    var c=text[i];
    if(inQ){
      if(c=='"'){ if(text[i+1]=='"'){field+='"';i++;} else {inQ=false;} }
      else field+=c;
    } else {
      if(c=='"') inQ=true;
      else if(c==','){ row.push(field); field=""; }
      else if(c=='\n'){ row.push(field); rows.push(row); row=[]; field=""; }
      else if(c=='\r'){ }
      else field+=c;
    }
  }
  if(field.length||row.length){ row.push(field); rows.push(row); }
  var headers=rows.shift();
  return rows.filter(function(r){return r.length>1 && r[0];}).map(function(r){
    var o={}; headers.forEach(function(h,idx){ o[h.trim()]=(r[idx]||"").trim(); }); return o;
  });
}

function izFixImgUrl(url){
  if(!url) return url;
  // Acepta cualquier formato de link que Google Drive entregue al compartir una imagen:
  // ...uc?export=view&id=ID / ...open?id=ID / .../file/d/ID/view / .../d/ID/...
  var m = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if(!m) m = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if(m && m[1]){ return "https://lh3.googleusercontent.com/d/" + m[1]; }
  return url;
}

// Une la presentacion/precio principal con las columnas opcionales presentacion2/precio2 ...
// presentacion6/precio6 en una sola lista de "variantes" que el cliente puede elegir.
// Si el producto no tiene columnas extra, devuelve una unica variante (comportamiento de antes).
function izGetVariants(p){
  var vs = [];
  if((p.presentacion1 && p.presentacion1.trim()) || (p.precio1 && p.precio1.trim())){
    vs.push({presentacion:(p.presentacion1||'').trim(), precio:(p.precio1||'').trim()});
  }
  for(var i=2;i<=6;i++){
    var pres = (p['presentacion'+i]||'').trim();
    var pre = (p['precio'+i]||'').trim();
    if(pres || pre) vs.push({presentacion:pres, precio:pre});
  }
  if(!vs.length) vs.push({presentacion:'', precio:''});
  return vs;
}

window.__izCache = {};
function izCacheFor(marcaId){ return (window.__izCache[marcaId] = window.__izCache[marcaId] || {}); }

function izLoadMarcaData(marca, cb){
  var cache = izCacheFor(marca.id);
  if(cache.products){ cb(cache.products); return; }
  fetch(izCsvUrl(marca.sheetProductos)).then(function(r){ return r.text(); }).then(function(txt){
    var data = izParseCSV(txt);
    data.forEach(function(p){ p.imagen_url = izFixImgUrl(p.imagen_url); p.variantes = izGetVariants(p); p._marca = marca.nombreCompleto; });
    cache.products = data;
    cb(data);
  }).catch(function(err){
    var root=document.getElementById('app-root');
    if(root) root.innerHTML='<p style="padding:60px 6vw;text-align:center;color:#c94b4b;">No se pudieron cargar los productos de '+marca.nombre+'. Verifica que su Google Sheet este compartido como "Cualquiera con el enlace - Lector".</p>';
    console.error(err);
  });
}

function izLoadMarcaCarousel(marca, cb){
  if(!marca.sheetCarrusel){ cb([]); return; }
  var cache = izCacheFor(marca.id);
  if(cache.carrusel){ cb(cache.carrusel); return; }
  fetch(izCsvUrl(marca.sheetCarrusel)).then(function(r){ return r.text(); }).then(function(txt){
    var rows = izParseCSV(txt);
    rows.forEach(function(r){ r.imagen_url = izFixImgUrl(r.imagen_url); });
    rows.sort(function(a,b){ return (parseFloat(a.orden)||99) - (parseFloat(b.orden)||99); });
    var slides = rows.filter(function(r){ return r.imagen_url; }).map(function(r){
      return { img:r.imagen_url, title:r.titulo||'', text:r.texto||'', ctaText:r.cta_texto||'Ver catálogo', cat:r.cta_cat||'', link:(r.cta_link||'').trim() };
    });
    cache.carrusel = slides;
    cb(slides);
  }).catch(function(){ cb([]); });
}

// Fotos de categoria: editable desde el Sheet "Categorias" de cada marca.
// Se puede cambiar la columna imagen_url de cualquier fila (o agregar una fila nueva
// con el nombre exacto de una categoria nueva) y la foto se actualiza sola en el sitio.
function izLoadMarcaCategoryImages(marca, cb){
  var cache = izCacheFor(marca.id);
  if(cache.catImgs){ cb(cache.catImgs); return; }
  fetch(izCsvUrl(marca.sheetCategorias)).then(function(r){ return r.text(); }).then(function(txt){
    var rows = izParseCSV(txt);
    var map = {};
    rows.forEach(function(r){
      var cat = (r.categoria||'').trim();
      var img = izFixImgUrl((r.imagen_url||'').trim());
      if(cat && img) map[cat] = img;
    });
    cache.catImgs = map;
    cb(map);
  }).catch(function(){ cb({}); });
}

function izGetCart(){ try{ return JSON.parse(localStorage.getItem('izCart')||'{}'); }catch(e){ return {}; } }
function izSetCart(c){ localStorage.setItem('izCart', JSON.stringify(c)); izUpdateCartCount(); }
function izUpdateCartCount(bump){
  var c=izGetCart(); var n=0; for(var k in c) n+=c[k].qty;
  var el=document.getElementById('iz-cart-count'); if(el) el.textContent=n;
  var btn=document.getElementById('iz-cart-btn');
  if(bump && btn){
    btn.classList.remove('iz-bump'); void btn.offsetWidth; btn.classList.add('iz-bump');
  }
}
function izAddToCart(slug, name, pres, price, img, qty){
  qty=qty||1;
  var key = slug + (pres ? ('__'+pres) : '');
  var c=izGetCart();
  if(c[key]) c[key].qty += qty; else c[key]={name:name,pres:pres,price:price,img:img,qty:qty};
  localStorage.setItem('izCart', JSON.stringify(c));
  izUpdateCartCount(true);
  izToast('✓ '+name+' agregado al pedido');
}
function izRemoveFromCart(slug){ var c=izGetCart(); delete c[slug]; izSetCart(c); izRenderCart(); }
function izChangeCartQty(slug, delta){
  var c=izGetCart(); if(!c[slug]) return;
  c[slug].qty += delta; if(c[slug].qty<=0) delete c[slug];
  izSetCart(c); izRenderCart();
}

function izOpenCart(){
  izRenderCart();
  document.getElementById('iz-overlay').style.display='block';
  document.getElementById('iz-cart-drawer').classList.add('open');
}
function izCloseAll(){
  document.getElementById('iz-overlay').style.display='none';
  document.getElementById('iz-cart-drawer').classList.remove('open');
  var m=document.getElementById('iz-modal'); if(m) m.classList.remove('open');
}
function izRenderCart(){
  var c=izGetCart(); var keys=Object.keys(c);
  var html = '<div class="iz-panel-head"><h2>Tu pedido</h2><button class="iz-close" onclick="izCloseAll()">×</button></div>';
  if(!keys.length){
    html += '<div class="iz-empty">Aún no agregaste productos.<br>Explora el <a href="catalogo.html">catálogo</a>.</div>';
  } else {
    html += '<div id="iz-cart-items">';
    keys.forEach(function(slug){
      var it=c[slug];
      html += '<div class="iz-cart-item"><img src="'+it.img+'"><div class="iz-ci-info"><b>'+it.name+'</b><span>'+it.pres+(it.price?(' · '+it.price):'')+'</span><span>Cant: '+it.qty+' &nbsp; <button class="iz-remove" onclick="izChangeCartQty(\''+slug+'\',-1)">−</button> <button class="iz-remove" onclick="izChangeCartQty(\''+slug+'\',1)">+</button></span></div><button class="iz-remove" onclick="izRemoveFromCart(\''+slug+'\')">Quitar</button></div>';
    });
    html += '</div>';
    var msg = "Hola, quiero hacer un pedido:%0A";
    keys.forEach(function(slug){ var it=c[slug]; msg += "- "+it.name+" ("+it.pres+") x"+it.qty+(it.price?(' - '+it.price):'')+"%0A"; });
    msg += "%0AGracias!";
    html += '<div id="iz-cart-foot"><a class="iz-wa-btn" target="_blank" href="https://wa.me/'+WHATSAPP_NUMBER+'?text='+msg+'">Enviar pedido por WhatsApp</a></div>';
  }
  document.getElementById('iz-cart-drawer').innerHTML = html;
}

function izOpenModal(p){
  var variants = (p.variantes && p.variantes.length) ? p.variantes : izGetVariants(p);
  var multi = variants.length>1;
  window.__izModalVariantIdx = 0;
  var html = '<div class="iz-panel-head"><h2>Detalle</h2><button class="iz-close" onclick="izCloseAll()">×</button></div>';
  html += '<img class="iz-modal-img" src="'+p.imagen_url+'">';
  html += '<div class="iz-modal-body"><h2>'+p.nombre+'</h2><div class="iz-pres">'+p.categoria+(multi?'':(' · '+variants[0].presentacion))+'</div>';
  if(multi){
    html += '<div class="iz-variant-chips" id="iz-modal-variant">'+variants.map(function(v,i){ return '<button type="button" class="iz-variant-chip'+(i===0?' active':'')+'" data-idx="'+i+'">'+(v.presentacion||('Opción '+(i+1)))+'</button>'; }).join('')+'</div>';
  }
  html += '<div class="iz-pres" id="iz-modal-price">'+(variants[0].precio?('<b>'+variants[0].precio+'</b>'):'')+'</div>';
  html += '<p class="iz-desc">'+p.descripcion+'</p>';
  if(p.disponible==='NO'){ html += '<p><span class="iz-badge-out">Agotado</span></p>'; }
  html += '<div class="iz-qty-row"><button onclick="izModalQty(-1)">−</button><span id="iz-modal-qty">1</span><button onclick="izModalQty(1)">+</button></div>';
  html += '<div class="iz-modal-actions"><button class="iz-add-btn" style="flex:1;padding:12px;" '+(p.disponible==='NO'?'disabled':'')+' onclick="izAddFromModal()">Agregar al pedido</button><button class="iz-share-btn" title="Compartir" onclick="izShareProduct(window.__izModalProduct)">🔗 Compartir</button></div></div>';
  document.getElementById('iz-modal').innerHTML = html;
  window.__izModalProduct = p;
  window.__izModalVariants = variants;
  document.getElementById('iz-overlay').style.display='block';
  document.getElementById('iz-modal').classList.add('open');
  var chipsWrap = document.getElementById('iz-modal-variant');
  if(chipsWrap){
    var chipBtns = chipsWrap.querySelectorAll('.iz-variant-chip');
    chipBtns.forEach(function(btn){
      btn.addEventListener('click', function(){
        chipBtns.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        window.__izModalVariantIdx = parseInt(btn.dataset.idx);
        var v = variants[window.__izModalVariantIdx];
        document.getElementById('iz-modal-price').innerHTML = v.precio ? ('<b>'+v.precio+'</b>') : '';
      });
    });
  }
}
function izModalQty(d){
  var el=document.getElementById('iz-modal-qty');
  var v=Math.max(1, parseInt(el.textContent)+d);
  el.textContent=v;
}
function izAddFromModal(){
  var p=window.__izModalProduct; var qty=parseInt(document.getElementById('iz-modal-qty').textContent);
  var variants = window.__izModalVariants || izGetVariants(p);
  var v = variants[window.__izModalVariantIdx||0];
  izAddToCart(p.slug, p.nombre, v.presentacion, v.precio, p.imagen_url, qty);
  izCloseAll();
}

function izCard(p){
  var out = p.disponible==='NO';
  var variants = (p.variantes && p.variantes.length) ? p.variantes : izGetVariants(p);
  var multi = variants.length>1;
  var div = document.createElement('div');
  div.className='iz-card iz-reveal';
  var presHtml = multi
    ? '<div class="iz-variant-chips">'+variants.map(function(v,i){ return '<button type="button" class="iz-variant-chip'+(i===0?' active':'')+'" data-idx="'+i+'">'+(v.presentacion||('Opción '+(i+1)))+'</button>'; }).join('')+'</div>'
    : '<span class="iz-pres">'+variants[0].presentacion+'</span>';
  div.innerHTML = '<div class="iz-card-imgwrap"><img src="'+p.imagen_url+'" loading="lazy"><button class="iz-share-icon" title="Compartir">🔗</button></div><div class="iz-card-body"><span class="iz-cat-tag">'+p.categoria+'</span><h3>'+p.nombre+'</h3>'+presHtml+'<span class="iz-price">'+(variants[0].precio||'')+'</span>'+(out?'<span class="iz-badge-out">Agotado</span>':'')+'<button class="iz-add-btn" '+(out?'disabled':'')+'>Agregar</button></div>';
  div.querySelector('img').addEventListener('click', function(){ izOpenModal(p); });
  div.querySelector('h3').addEventListener('click', function(){ izOpenModal(p); });
  div.querySelector('.iz-share-icon').addEventListener('click', function(e){ e.stopPropagation(); izShareProduct(p); });
  var priceEl = div.querySelector('.iz-price');
  var selectedIdx = 0;
  var chipBtns = div.querySelectorAll('.iz-variant-chip');
  chipBtns.forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      chipBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      selectedIdx = parseInt(btn.dataset.idx);
      priceEl.textContent = variants[selectedIdx].precio || '';
    });
  });
  div.querySelector('.iz-add-btn').addEventListener('click', function(e){
    e.stopPropagation();
    if(out) return;
    var v = variants[selectedIdx];
    izAddToCart(p.slug, p.nombre, v.presentacion, v.precio, p.imagen_url, 1);
  });
  return div;
}

function izShareUrl(slug, marcaId){
  var path = window.location.pathname;
  var dir = path.substring(0, path.lastIndexOf('/')+1);
  return window.location.origin + dir + 'catalogo.html?marca=' + encodeURIComponent(marcaId) + '&producto=' + encodeURIComponent(slug);
}
function izToast(msg){
  var el = document.getElementById('iz-toast');
  if(!el){ el = document.createElement('div'); el.id='iz-toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.__izToastTimer);
  window.__izToastTimer = setTimeout(function(){ el.classList.remove('show'); }, 2400);
}
function izShareProduct(p){
  if(!p) return;
  var marcaId = window.__izActiveMarcaId || 'itenez';
  var url = izShareUrl(p.slug, marcaId);
  var precio0 = (p.variantes && p.variantes[0] && p.variantes[0].precio) || '';
  var text = p.nombre + (precio0 ? (' - '+precio0) : '') + ' | ' + (p._marca || '');
  if(navigator.share){
    navigator.share({title:p.nombre, text:text, url:url}).catch(function(){});
  } else if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(function(){ izToast('Enlace copiado ✓'); }).catch(function(){ izToast(url); });
  } else {
    izToast(url);
  }
}

var HERO_SLIDES = [
  {img:"https://lh3.googleusercontent.com/d/1H1gTiEJ8C-mSOnnVVKNHRqJ5SwnLc9PM", title:"Productos naturales, cosecha a cosecha", text:"Hidrolatos y tinturas elaborados de forma artesanal, directo de la Amazonía boliviana.", cat:"Hidrolatos"},
  {img:"https://lh3.googleusercontent.com/d/17ZJBpXv15jCekVKXMNCATPBGWy0QAe9x", title:"Aceites esenciales 100% puros", text:"Aromaterapia y bienestar natural para el cuerpo y la mente.", cat:"Aceites Esenciales"},
  {img:"https://lh3.googleusercontent.com/d/1U8UuwMIEKqCEOYlyfAywyu24QCVHJsT6", title:"Línea IVI SY", text:"Jabones, desodorantes y tratamientos naturales para el cuidado diario de tu piel.", cat:"IVI SY"},
  {img:"https://lh3.googleusercontent.com/d/10yQ_fQXqwYCvYFSR780aRcu2z-0ZVBPv", title:"Sentido Natural", text:"Shampoos, cremas y protección solar hechos con ingredientes naturales.", cat:"Sentido Natural"},
  {img:"https://lh3.googleusercontent.com/d/1xiEClMmtSD62BOmfaUhotmy1oUerFExy", title:"Aceites prensados en frío", text:"Pureza y calidad, extraídos sin perder sus propiedades naturales.", cat:"Aceites Prensados en Frío"}
];

function izGetHeroSlides(data, marca){
  var marked = data.filter(function(p){ return p.carrusel_orden && String(p.carrusel_orden).trim() !== ''; });
  if(!marked.length) return (marca.id==='itenez') ? HERO_SLIDES : [];
  marked.sort(function(a,b){ return (parseFloat(a.carrusel_orden)||99) - (parseFloat(b.carrusel_orden)||99); });
  return marked.slice(0,8).map(function(p){
    var desc = p.carrusel_texto && p.carrusel_texto.trim() ? p.carrusel_texto.trim() : (p.descripcion||'').slice(0,140);
    return {
      img: p.imagen_url,
      title: (p.carrusel_titulo && p.carrusel_titulo.trim()) ? p.carrusel_titulo.trim() : p.nombre,
      text: desc,
      cat: p.categoria
    };
  });
}

// Arma el HTML del carrusel principal (usado en el home de cada marca y en la
// pantalla de bienvenida). Cada boton respeta el link/categoria elegidos en el Sheet.
function izBuildHeroHtml(slides, marcaId){
  if(!slides.length) return '';
  var html = '<div class="iz-hero-carousel">';
  slides.forEach(function(s, i){
    var link = s.link ? s.link : (s.cat ? ('catalogo.html?marca='+marcaId+'&cat='+encodeURIComponent(s.cat)) : ('catalogo.html?marca='+marcaId));
    var isExternal = /^https?:\/\//i.test(link);
    var target = isExternal ? ' target="_blank" rel="noopener"' : '';
    html += '<div class="iz-slide'+(i===0?' active':'')+'"><div class="iz-slide-bg" style="background-image:url(\''+s.img+'\')"></div><div class="iz-slide-overlay"><div class="iz-slide-content"><h1>'+s.title+'</h1><p>'+s.text+'</p><a class="iz-cta" href="'+link+'"'+target+'>'+(s.ctaText||'Ver catálogo')+'</a></div></div></div>';
  });
  if(slides.length>1){
    html += '<button class="iz-arrow prev" aria-label="Anterior">‹</button><button class="iz-arrow next" aria-label="Siguiente">›</button>';
    html += '<div class="iz-dots">';
    slides.forEach(function(s,i){ html += '<button class="iz-dot'+(i===0?' active':'')+'"></button>'; });
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// --- Pantalla de bienvenida: elegir marca ------------------------------
// Muestra el mismo carrusel principal (con los datos de Iténez, la marca con
// contenido) seguido del selector de marcas.
function izRenderMarcaChooser(){
  var root=document.getElementById('app-root');
  var itenez = MARCAS.itenez;
  root.innerHTML = '<div class="iz-loading"><div class="iz-spinner"></div><span>Cargando...</span></div>';
  izLoadMarcaData(itenez, function(data){
    izLoadMarcaCarousel(itenez, function(carruselSlides){
      var slides = (carruselSlides && carruselSlides.length) ? carruselSlides : izGetHeroSlides(data, itenez);
      var html = izBuildHeroHtml(slides, itenez.id);
      html += '<div class="iz-marca-chooser iz-fade"><span class="iz-marca-eyebrow">Catálogo CAME</span><h1>Elige una marca</h1><p>Cada marca tiene su propio catálogo de categorías y productos.</p><div class="iz-marca-grid">';
      MARCA_ORDER.forEach(function(id){
        var m = MARCAS[id];
        var soon = !(m.catOrder && m.catOrder.length);
        html += '<a class="iz-marca-card iz-reveal'+(soon?' iz-marca-soon':'')+'" href="index.html?marca='+id+'" style="--m-color:'+m.color+';--m-color-osc:'+m.colorOsc+'"><span class="iz-marca-emoji">'+m.emoji+'</span><h3>'+m.nombre+'</h3><span>'+m.tagline+'</span></a>';
      });
      html += '</div></div>';

      html += '<div class="iz-trust"><div class="iz-trust-item iz-reveal"><span>🌿</span><div><b>100% Natural</b><small>Ingredientes de origen vegetal</small></div></div><div class="iz-trust-item iz-reveal"><span>🤲</span><div><b>Elaboración artesanal</b><small>Producción propia en Bolivia</small></div></div><div class="iz-trust-item iz-reveal"><span>🚚</span><div><b>Envíos a todo el país</b><small>Coordinamos la entrega</small></div></div><div class="iz-trust-item iz-reveal"><span>💬</span><div><b>Atención personalizada</b><small>Pedidos directos por WhatsApp</small></div></div></div>';

      var destacados = data.filter(function(p){ return p.disponible!=='NO'; });
      var picked = [], seen = {};
      for(var i=0;i<destacados.length && picked.length<10;i++){
        var p = destacados[i];
        if(!seen[p.categoria]){ seen[p.categoria]=true; picked.push(p); }
      }
      if(picked.length<10){
        for(var j=0;j<destacados.length && picked.length<10;j++){ if(picked.indexOf(destacados[j])===-1) picked.push(destacados[j]); }
      }
      html += '<div class="iz-section"><div class="iz-section-head iz-reveal"><h2>Productos destacados</h2><a class="iz-see-all" href="catalogo.html?marca='+itenez.id+'">Ver todos →</a></div><div class="iz-scroll-row" id="iz-destacados"></div></div>';

      html += '<div class="iz-cta-band iz-reveal"><h2>¿Ya sabes qué buscas?</h2><p>Arma tu pedido y coordínalo directo por WhatsApp.</p><a class="iz-cta iz-cta-light" href="catalogo.html?marca='+itenez.id+'">Ir al catálogo</a></div>';

      root.innerHTML = html;
      var scrollRow = document.getElementById('iz-destacados');
      picked.forEach(function(p){ scrollRow.appendChild(izCard(p)); });
      izInitCarousel();
      izRevealInit(root);
    });
  });
}

// --- Marca sin contenido todavia (sin categorias/productos cargados) ---
function izRenderComingSoon(marca){
  var root=document.getElementById('app-root');
  root.innerHTML = '<div class="iz-comingsoon iz-fade"><span class="iz-emoji">'+marca.emoji+'</span><h1>'+marca.nombre+'</h1><p>Estamos preparando el catálogo de esta marca. Muy pronto vas a poder ver sus categorías y productos aquí.</p><a class="iz-cta" href="index.html">← Ver todas las marcas</a></div>';
}

function izRenderHome(marca, data, carruselSlides, catImgs){
  catImgs = catImgs || {};
  var counts={}; data.forEach(function(p){ counts[p.categoria]=(counts[p.categoria]||0)+1; });
  var root=document.getElementById('app-root');
  // El carrusel principal solo vive en la pantalla de bienvenida (izRenderMarcaChooser);
  // el home de cada marca arranca directo en la franja de confianza.
  var html = '';

  html += '<div class="iz-marca-hero" style="--m-color:'+marca.color+';--m-color-osc:'+marca.colorOsc+'"><span class="iz-marca-hero-emoji">'+marca.emoji+'</span><h1>'+marca.nombreCompleto+'</h1><p>'+marca.tagline+'</p></div>';

  html += '<div class="iz-trust"><div class="iz-trust-item iz-reveal"><span>🌿</span><div><b>100% Natural</b><small>Ingredientes de origen vegetal</small></div></div><div class="iz-trust-item iz-reveal"><span>🤲</span><div><b>Elaboración artesanal</b><small>Producción propia en Bolivia</small></div></div><div class="iz-trust-item iz-reveal"><span>🚚</span><div><b>Envíos a todo el país</b><small>Coordinamos la entrega</small></div></div><div class="iz-trust-item iz-reveal"><span>💬</span><div><b>Atención personalizada</b><small>Pedidos directos por WhatsApp</small></div></div></div>';

  html += '<div class="iz-section"><div class="iz-section-head iz-reveal"><h2>Explora por categoría</h2></div><div class="iz-cats">';
  izGetCategories(data, marca).forEach(function(cat){
    var img = catImgs[cat];
    var bg = img ? (' style="background-image:url(\''+img+'\')"') : '';
    html += '<a class="iz-cat-card iz-reveal'+(img?'':' iz-cat-noimg')+'" href="catalogo.html?marca='+marca.id+'&cat='+encodeURIComponent(cat)+'"'+bg+'><div class="iz-cat-info"><span class="iz-cat-name">'+cat+'</span><span class="iz-cat-count">'+(counts[cat]||0)+' productos</span></div></a>';
  });
  html += '</div></div>';

  var destacados = data.filter(function(p){ return p.disponible!=='NO'; });
  var picked = [], seen = {};
  for(var i=0;i<destacados.length && picked.length<10;i++){
    var p = destacados[i];
    if(!seen[p.categoria]){ seen[p.categoria]=true; picked.push(p); }
  }
  if(picked.length<10){
    for(var j=0;j<destacados.length && picked.length<10;j++){ if(picked.indexOf(destacados[j])===-1) picked.push(destacados[j]); }
  }
  html += '<div class="iz-section"><div class="iz-section-head iz-reveal"><h2>Productos destacados</h2><a class="iz-see-all" href="catalogo.html?marca='+marca.id+'">Ver todos →</a></div><div class="iz-scroll-row" id="iz-destacados"></div></div>';

  html += '<div class="iz-cta-band iz-reveal"><h2>¿Ya sabes qué buscas?</h2><p>Arma tu pedido y coordínalo directo por WhatsApp.</p><a class="iz-cta iz-cta-light" href="catalogo.html?marca='+marca.id+'">Ir al catálogo</a></div>';

  root.innerHTML = html;
  var scrollRow = document.getElementById('iz-destacados');
  picked.forEach(function(p){ scrollRow.appendChild(izCard(p)); });
  izInitCarousel();
  izRevealInit(root);
}

function izInitCarousel(){
  var wrap = document.querySelector('.iz-hero-carousel');
  if(!wrap) return;
  var slides = wrap.querySelectorAll('.iz-slide');
  var dots = wrap.querySelectorAll('.iz-dot');
  var idx = 0, timer;
  function show(i){
    slides[idx].classList.remove('active'); dots[idx].classList.remove('active');
    idx = (i+slides.length)%slides.length;
    slides[idx].classList.add('active'); dots[idx].classList.add('active');
    var bg = slides[idx].querySelector('.iz-slide-bg');
    bg.style.animation='none'; void bg.offsetWidth; bg.style.animation='';
  }
  function next(){ show(idx+1); }
  function prev(){ show(idx-1); }
  function startAuto(){ if(slides.length>1) timer=setInterval(next,5500); }
  function stopAuto(){ clearInterval(timer); }
  var nextBtn = wrap.querySelector('.iz-arrow.next'), prevBtn = wrap.querySelector('.iz-arrow.prev');
  if(nextBtn) nextBtn.addEventListener('click', function(){ next(); stopAuto(); startAuto(); });
  if(prevBtn) prevBtn.addEventListener('click', function(){ prev(); stopAuto(); startAuto(); });
  dots.forEach(function(d,i){ d.addEventListener('click', function(){ show(i); stopAuto(); startAuto(); }); });
  wrap.addEventListener('mouseenter', stopAuto);
  wrap.addEventListener('mouseleave', startAuto);
  var startX=null;
  wrap.addEventListener('touchstart', function(e){ startX=e.touches[0].clientX; }, {passive:true});
  wrap.addEventListener('touchend', function(e){ if(startX===null || slides.length<2) return; var dx=e.changedTouches[0].clientX-startX; if(dx>40) prev(); else if(dx<-40) next(); startX=null; });
  startAuto();
}

function izRenderProductos(marca, data){
  var root=document.getElementById('app-root');
  var params = new URLSearchParams(window.location.search);
  var activeCat = params.get('cat') || 'Todos';
  var html = '<div class="iz-toolbar"><input id="iz-search" class="iz-search" placeholder="Buscar producto..."><div class="iz-chips" id="iz-chips"></div></div><div class="iz-grid" id="iz-grid"></div>';
  root.innerHTML = html;
  var chips=document.getElementById('iz-chips');
  ['Todos'].concat(izGetCategories(data, marca)).forEach(function(cat){
    var b=document.createElement('button'); b.className='iz-chip'+(cat===activeCat?' active':''); b.textContent=cat;
    b.onclick=function(){ activeCat=cat; Array.prototype.forEach.call(chips.children,function(c){c.classList.remove('active');}); b.classList.add('active'); izFilter(); };
    chips.appendChild(b);
  });
  var search = document.getElementById('iz-search');
  search.addEventListener('input', izFilter);
  function izFilter(){
    var grid = document.getElementById('iz-grid');
    grid.classList.add('iz-fading');
    setTimeout(function(){
      var q = search.value.trim().toLowerCase();
      grid.innerHTML='';
      var filtered = data.filter(function(p){
        var matchCat = activeCat==='Todos' || p.categoria===activeCat;
        var matchQ = !q || p.nombre.toLowerCase().indexOf(q)>-1 || p.descripcion.toLowerCase().indexOf(q)>-1;
        return matchCat && matchQ;
      });
      if(!filtered.length){ grid.innerHTML='<p class="iz-empty">No se encontraron productos.</p>'; }
      else { filtered.forEach(function(p){ grid.appendChild(izCard(p)); }); izRevealInit(grid); }
      grid.classList.remove('iz-fading');
    }, 140);
  }
  izFilter();
  var sharedSlug = params.get('producto');
  if(sharedSlug){
    var shared = data.filter(function(p){ return p.slug===sharedSlug; })[0];
    if(shared) izOpenModal(shared);
  }
}

function izRenderContacto(){
  var root=document.getElementById('app-root');
  root.innerHTML = '<div class="iz-contact-wrap iz-fade"><h1>Contáctanos</h1><p>Escríbenos para consultas, pedidos especiales o mayoreo.</p><div class="iz-contact-card"><p style="font-size:15px;">💬 La forma más rápida de contactarnos es por WhatsApp.</p><a class="iz-cta" href="https://wa.me/'+WHATSAPP_NUMBER+'" target="_blank">Escribir por WhatsApp</a><p style="margin-top:22px;font-size:13px;color:#8a8570;">También puedes armar tu pedido desde el <a href="catalogo.html">catálogo</a> y enviarlo directamente por WhatsApp con el botón del carrito.</p></div></div>';
}

function izInit(){
  var root = document.getElementById('app-root');
  if(!root) return;
  var page = root.getAttribute('data-page') || 'home';
  var marcaId = izActiveMarcaId();
  window.__izActiveMarcaId = marcaId || 'itenez';
  izRenderNav(page, marcaId);
  izRenderFooter(marcaId);
  izUpdateCartCount();
  if(page==='contacto'){ izRenderContacto(); return; }
  if(page==='home' && !marcaId){ izRenderMarcaChooser(); return; }
  var marca = MARCAS[marcaId || 'itenez'] || MARCAS.itenez;
  root.innerHTML = '<div class="iz-loading"><div class="iz-spinner"></div><span>Cargando productos...</span></div>';
  izLoadMarcaData(marca, function(data){
    var cats = izGetCategories(data, marca);
    if(!cats.length){ izRenderComingSoon(marca); return; }
    if(page==='home'){
      izLoadMarcaCategoryImages(marca, function(catImgs){ izRenderHome(marca, data, null, catImgs); });
    }
    else if(page==='productos') izRenderProductos(marca, data);
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', izInit); else izInit();
window.izOpenCart = izOpenCart;
window.izCloseAll = izCloseAll;
window.izChangeCartQty = izChangeCartQty;
window.izRemoveFromCart = izRemoveFromCart;
window.izModalQty = izModalQty;
window.izAddFromModal = izAddFromModal;
window.izShareProduct = izShareProduct;
})();
