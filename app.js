// ═══ DATA ═══
const PRODS=[
  {id:1,cat:'wine',name:'Каберне Совиньон',brand:'Фанагория',desc:'Выдержанное красное сухое вино с нотами чёрной смородины, ежевики и ванили. Танинное, с долгим послевкусием.',price:490,unit:'бут. 0.75л',emoji:'🍷',badge:'Хит',color:'rgba(123,45,94,.09)',catColor:'#7B2D5E',attrs:{Крепость:'13.5%',Объём:'0.75 л',Страна:'Россия',Тип:'Красное сухое'}},
  {id:2,cat:'wine',name:'Шардоне',brand:'Абрау-Дюрсо',desc:'Элегантное белое вино с ароматом зелёного яблока, персика и цветов. Свежее и гармоничное.',price:380,unit:'бут. 0.75л',emoji:'🥂',badge:null,color:'rgba(200,146,10,.08)',catColor:'#A07010',attrs:{Крепость:'12.5%',Объём:'0.75 л',Страна:'Россия',Тип:'Белое сухое'}},
  {id:3,cat:'wine',name:'Розе Брют',brand:'Наследие Мастера',desc:'Игристое розовое вино с ароматом клубники и розы. Мелкие пузырьки, свежий финиш.',price:620,unit:'бут. 0.75л',emoji:'🍾',badge:'Новинка',color:'rgba(200,80,120,.08)',catColor:'#C05080',attrs:{Крепость:'11.5%',Объём:'0.75 л',Страна:'Россия',Тип:'Розовое игристое'}},
  {id:4,cat:'wine',name:'Совиньон Блан',brand:'Лефкадия',desc:'Сухое белое вино с ярким ароматом крыжовника, грейпфрута и свежей травы.',price:520,unit:'бут. 0.75л',emoji:'🍷',badge:null,color:'rgba(42,140,60,.08)',catColor:'#2A8C3C',attrs:{Крепость:'13%',Объём:'0.75 л',Страна:'Россия',Тип:'Белое сухое'}},
  {id:5,cat:'beer',name:'Балтика №3',brand:'Балтика',desc:'Классическое светлое пиво с чистым солодовым вкусом и лёгкой хмелевой горчинкой.',price:95,unit:'бан. 0.5л',emoji:'🍺',badge:'Хит',color:'rgba(200,135,10,.09)',catColor:'#A06008',attrs:{Крепость:'4.8%',Объём:'0.5 л',Страна:'Россия',Тип:'Светлое'}},
  {id:6,cat:'beer',name:'Жигулёвское',brand:'Жигули',desc:'Традиционное российское пиво. Лёгкое, освежающее, с характерным солодовым ароматом.',price:85,unit:'бан. 0.45л',emoji:'🍻',badge:null,color:'rgba(180,120,10,.08)',catColor:'#B47800',attrs:{Крепость:'4.5%',Объём:'0.45 л',Страна:'Россия',Тип:'Светлое'}},
  {id:7,cat:'beer',name:'Heineken',brand:'Heineken',desc:'Премиальное нидерландское лагер-пиво. Чистый вкус, лёгкая горчинка, освежающий финиш.',price:140,unit:'бан. 0.5л',emoji:'🍺',badge:null,color:'rgba(26,100,40,.08)',catColor:'#1A6428',attrs:{Крепость:'5%',Объём:'0.5 л',Страна:'Нидерланды',Тип:'Светлое лагер'}},
  {id:8,cat:'beer',name:'Крафт ИПА',brand:'AF Brew',desc:'Насыщенное крафтовое пиво с обильным хмелением, тропическими и цитрусовыми нотами.',price:220,unit:'бот. 0.33л',emoji:'🍺',badge:'Крафт',color:'rgba(180,90,20,.08)',catColor:'#B45A14',attrs:{Крепость:'6.5%',Объём:'0.33 л',Страна:'Россия',Тип:'Индийский Пэйл Эль'}},
  {id:9,cat:'soda',name:'Coca-Cola',brand:'Coca-Cola HBC',desc:'Культовый газированный напиток с неповторимым вкусом. Поставляется компанией Coca-Cola HBC.',price:89,unit:'бут. 1.5л',emoji:'🥤',badge:'Хит',color:'rgba(180,30,30,.07)',catColor:'#B41E1E',attrs:{Объём:'1.5 л',Сахар:'10.6г/100мл',Страна:'Россия',Тип:'Лимонад'}},
  {id:10,cat:'soda',name:'Sprite',brand:'Coca-Cola HBC',desc:'Освежающий лимонно-лаймовый напиток. Прозрачный, игристый, без кофеина.',price:79,unit:'бут. 1.5л',emoji:'🧃',badge:null,color:'rgba(26,92,56,.07)',catColor:'#1A5C38',attrs:{Объём:'1.5 л',Сахар:'6.6г/100мл',Страна:'Россия',Тип:'Лимонад'}},
  {id:11,cat:'soda',name:'Добрый Яблоко',brand:'Coca-Cola HBC',desc:'Натуральный яблочный сок с мякотью. Без консервантов, богатый витаминами.',price:65,unit:'пак. 1л',emoji:'🍎',badge:null,color:'rgba(150,100,20,.07)',catColor:'#966414',attrs:{Объём:'1 л',Сахар:'естественный',Страна:'Россия',Тип:'Сок'}},
  {id:12,cat:'soda',name:'Red Bull',brand:'Red Bull GmbH',desc:'Энергетический напиток с таурином и кофеином. Поддерживает концентрацию и энергию.',price:130,unit:'бан. 0.25л',emoji:'⚡',badge:null,color:'rgba(200,146,10,.08)',catColor:'#C89200',attrs:{Объём:'0.25 л',Кофеин:'80мг',Страна:'Австрия',Тип:'Энергетик'}},
  {id:13,cat:'water',name:'Acqua Panna',brand:'Acqua Panna',desc:'Натуральная минеральная вода без газа из Тосканы. Мягкая, сбалансированный минеральный состав.',price:120,unit:'бут. 0.75л',emoji:'💧',badge:null,color:'rgba(26,74,107,.07)',catColor:'#1A4A6B',attrs:{Объём:'0.75 л',Минерализация:'низкая',Страна:'Италия',Тип:'Негазированная'}},
  {id:14,cat:'water',name:'Архыз',brand:'Архыз',desc:'Природная горная вода с Кавказа. Слабоминерализованная, идеальна для ежедневного употребления.',price:45,unit:'бут. 1.5л',emoji:'🏔️',badge:'Хит',color:'rgba(26,74,107,.07)',catColor:'#1A4A6B',attrs:{Объём:'1.5 л',Минерализация:'200-500 мг/л',Страна:'Россия',Тип:'Негазированная'}},
  {id:15,cat:'water',name:'Боржоми',brand:'Боржоми',desc:'Природная минеральная вода с высоким содержанием минералов. Лечебно-столовая.',price:95,unit:'бут. 0.5л',emoji:'💦',badge:null,color:'rgba(26,74,107,.07)',catColor:'#1A4A6B',attrs:{Объём:'0.5 л',Минерализация:'5000-7500 мг/л',Страна:'Грузия',Тип:'Газированная'}},
  {id:16,cat:'water',name:'Святой Источник',brand:'Nestle',desc:'Российская питьевая вода высшей категории. Обогащена фтором для защиты зубов.',price:35,unit:'бут. 1.5л',emoji:'💧',badge:null,color:'rgba(26,74,107,.07)',catColor:'#1A4A6B',attrs:{Объём:'1.5 л',Минерализация:'низкая',Страна:'Россия',Тип:'Негазированная'}},
];
const ADDRS=['Домодедово, тер. Триколор, 11','Тула, ул. Щегловская Засека, 31А','Тула, ул. Луначарского, 76','Рязань, ул. Ряжское шоссе, 20','Истра, д. Покровское, Центральная, 27с2'];
const CATNAMES={wine:'Вино',beer:'Пиво',soda:'Газировки',water:'Вода'};

let cart={}, curCat='all', srtMode='', orders=[], user=null, selAddr=0;
const PATH_TO_VIEW={
  '/':'home',
  '/catalog':'catalogue',
  '/services':'services',
  '/tariffs':'tariffs',
  '/about':'about',
  '/contacts':'contacts',
  '/cart':'cart',
  '/checkout':'checkout',
  '/orders':'orders',
  '/auth':'auth',
  '/profile':'profile'
};
const VIEW_TO_PATH=Object.fromEntries(Object.entries(PATH_TO_VIEW).map(([k,v])=>[v,k]));
const PROTECTED_VIEWS=new Set(['checkout','orders','profile']);
const STORAGE_KEYS={cart:'diplom_cart',orders:'diplom_orders',user:'diplom_user'};
let hasDemoOrders=false;

function saveState(){
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}
function loadState(){
  try{
    cart=JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '{}') || {};
    orders=JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || '[]') || [];
  }catch(_e){
    cart={}; orders=[];
  }
}

// ═══ NAV ═══
function go(v){
  goToView(v, true);
}
function goPath(path){
  goToView(PATH_TO_VIEW[path] || 'home', false);
}
function goToView(v, push){
  const target=PROTECTED_VIEWS.has(v) && !user ? 'auth' : v;
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.getElementById('view-'+target).classList.add('active');
  document.querySelectorAll('.nav-lnk').forEach(x=>x.classList.remove('on'));
  const map={home:0,catalogue:1,services:2,tariffs:3,about:4,contacts:5};
  if(map[target]!==undefined) document.querySelectorAll('.nav-lnk')[map[target]].classList.add('on');
  const fn={catalogue:rp,cart:renderCart,checkout:renderCheckout,orders:renderOrds,profile:renderProfile,services:()=>{},tariffs:()=>{},about:()=>{}};
  if(fn[target]) fn[target]();
  if(push){
    const path=VIEW_TO_PATH[target] || '/';
    if(window.location.pathname!==path) history.pushState({view:target},'',path);
  }
  window.scrollTo(0,0);
}

// ═══ CATALOGUE ═══
function fcat(c){
  curCat=c;
  document.querySelectorAll('.ftab').forEach(t=>t.classList.remove('on'));
  const i={all:0,wine:1,beer:2,soda:3,water:4}[c];
  document.querySelectorAll('.ftab')[i].classList.add('on');
  rp();
}
function srt(m){srtMode=m;rp();}
function filtered(){
  let l=PRODS.filter(p=>curCat==='all'||p.cat===curCat);
  const q=(document.getElementById('si')||{value:''}).value.toLowerCase();
  if(q) l=l.filter(p=>p.name.toLowerCase().includes(q)||p.brand.toLowerCase().includes(q));
  if(srtMode==='pa') l.sort((a,b)=>a.price-b.price);
  else if(srtMode==='pd') l.sort((a,b)=>b.price-a.price);
  else if(srtMode==='nm') l.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
  return l;
}
function rp(){
  const g=document.getElementById('pgrid'); if(!g) return;
  const l=filtered();
  if(!l.length){g.innerHTML='<div class="no-res"><div class="no-res-icon">🔍</div><div style="font-size:16px;font-weight:500">Ничего не найдено</div></div>';return;}
  g.innerHTML=l.map(p=>{
    const ic=cart[p.id]||0;
    return `<div class="pc ani" onclick="openProd(${p.id})">
      <div class="pc-img" style="background:${p.color}">
        ${p.badge?`<span class="pc-badge" style="background:${p.catColor};color:#fff">${p.badge}</span>`:''}
        ${p.emoji}
      </div>
      <div class="pc-body">
        <div class="pc-cat" style="color:${p.catColor}">${CATNAMES[p.cat]}</div>
        <div class="pc-name">${p.name}</div>
        <div class="pc-brand">${p.brand}</div>
        <div class="pc-desc">${p.desc.slice(0,75)}…</div>
        <div class="pc-foot">
          <div><div class="pc-price" style="color:var(--green)">${p.price}₽</div><div class="pc-unit">${p.unit}</div></div>
          ${ic?`<div class="qty-wrap" onclick="event.stopPropagation()"><button class="qb" onclick="cq(${p.id},-1)">−</button><span class="qn">${ic}</span><button class="qb" onclick="cq(${p.id},1)">+</button></div>`
              :`<button class="btn-add" onclick="event.stopPropagation();addC(${p.id})">В корзину</button>`}
        </div>
      </div>
    </div>`;
  }).join('');
}

// ═══ MODAL ═══
function openProd(id){
  const p=PRODS.find(x=>x.id===id), ic=cart[p.id]||0;
  document.getElementById('mcontent').innerHTML=`
    <div class="m-img" style="background:${p.color}">${p.emoji}</div>
    <div class="m-body">
      <div class="m-cat" style="color:${p.catColor}">${CATNAMES[p.cat]}</div>
      <div class="m-name">${p.name}</div>
      <div class="m-brand">${p.brand}</div>
      <div class="m-price-row"><div class="m-price">${p.price}₽</div><div class="m-per">/ ${p.unit}</div></div>
      <div class="m-desc">${p.desc}</div>
      <div class="m-attrs">${Object.entries(p.attrs).map(([k,v])=>`<div class="m-attr"><div class="m-albl">${k}</div><div class="m-aval">${v}</div></div>`).join('')}</div>
      <div class="m-foot">
        ${ic?`<div class="qty-wrap"><button class="qb" onclick="cq(${p.id},-1);openProd(${p.id})">−</button><span class="qn">${ic}</span><button class="qb" onclick="cq(${p.id},1);openProd(${p.id})">+</button></div><span style="font-size:13px;color:var(--ink3)">В корзине: ${ic} шт.</span>`
            :`<button class="btn-solid" style="flex:1;padding:13px;font-size:15px;border-radius:12px" onclick="addC(${p.id});openProd(${p.id})">Добавить в корзину</button>`}
      </div>
    </div>`;
  document.getElementById('pmodal').classList.add('open');
}
function cmodal(e){if(e.target.id==='pmodal') document.getElementById('pmodal').classList.remove('open');}

// ═══ CART LOGIC ═══
function addC(id){cart[id]=(cart[id]||0)+1;updBadge();saveState();toast('✓','Добавлено в корзину');rp();}
function cq(id,d){cart[id]=(cart[id]||0)+d;if(cart[id]<=0)delete cart[id];updBadge();saveState();rp();renderCart();}
function updBadge(){const t=Object.values(cart).reduce((a,b)=>a+b,0),d=document.getElementById('cdot');d.textContent=t;d.style.display=t?'flex':'none';}
function cartTotal(){return Object.entries(cart).reduce((s,[id,q])=>s+PRODS.find(p=>p.id==id).price*q,0);}

function renderCart(){
  const el=document.getElementById('cart-content'); if(!el) return;
  const its=Object.entries(cart);
  if(!its.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon">🛒</div><div class="empty-ttl">Корзина пуста</div><p style="margin-bottom:28px;color:var(--ink3)">Добавьте товары из каталога</p><button class="btn-solid" style="padding:12px 32px;font-size:15px;border-radius:10px" onclick="go('catalogue')">Открыть каталог</button></div>`;return;}
  const total=cartTotal();
  el.innerHTML=`<div class="clayout">
    <div class="cart-list">
      ${its.map(([id,q])=>{const p=PRODS.find(x=>x.id==id);return`<div class="ci"><div class="ci-emoji">${p.emoji}</div><div class="ci-info"><div class="ci-name">${p.name}</div><div class="ci-meta">${p.brand} · ${p.unit} · ${p.price}₽/шт.</div></div><div class="qty-wrap"><button class="qb" onclick="cq(${id},-1)">−</button><span class="qn">${q}</span><button class="qb" onclick="cq(${id},1)">+</button></div><div class="ci-price">${p.price*q}₽</div><button class="ci-del" onclick="delC(${id})" aria-label="Удалить">✕</button></div>`;}).join('')}
    </div>
    <div class="csum">
      <div class="csum-title">Итого</div>
      <div class="crow"><span class="crow-lbl">Позиций</span><span class="crow-val">${its.length} шт.</span></div>
      <div class="crow"><span class="crow-lbl">Товаров</span><span class="crow-val">${its.reduce((s,[,q])=>s+q,0)} шт.</span></div>
      <div class="crow"><span class="crow-lbl">Сумма</span><span class="crow-total">${total}₽</span></div>
      <button class="btn-full btn-full-main" onclick="go('checkout')">Оформить заказ →</button>
      <button class="btn-full btn-full-out" style="margin-top:8px" onclick="go('catalogue')">Продолжить покупки</button>
      <button class="btn-full btn-full-danger" onclick="clearC()">Очистить корзину</button>
    </div>
  </div>`;
}
function delC(id){delete cart[id];updBadge();saveState();renderCart();}
function clearC(){cart={};updBadge();saveState();renderCart();}

// ═══ CHECKOUT ═══
function pickAddr(i){selAddr=i;document.querySelectorAll('.aopt').forEach((e,j)=>e.classList.toggle('on',j===i));}
function pickTime(el){document.querySelectorAll('.tslot').forEach(s=>s.classList.remove('on'));el.classList.add('on');}
function renderCheckout(){
  const its=Object.entries(cart), total=cartTotal();
  const ci=document.getElementById('co-items'); if(!ci) return;
  ci.innerHTML=its.map(([id,q])=>{const p=PRODS.find(x=>x.id==id);return`<div class="crow"><span class="crow-lbl">${p.emoji} ${p.name} ×${q}</span><span class="crow-val">${p.price*q}₽</span></div>`;}).join('');
  document.getElementById('co-rows').innerHTML=`<div class="crow" style="border-top:1px solid var(--bg2);margin-top:8px;padding-top:14px"><span class="crow-lbl" style="font-weight:700">К оплате</span><span class="crow-total">${total}₽</span></div>`;
  const td=new Date().toISOString().split('T')[0];
  const dd=document.getElementById('co-date'); if(dd){dd.min=td;dd.value=td;}
}
function placeOrder(){
  if(!user){toast('⚠️','Войдите для оформления заказа');go('auth');return;}
  const its=Object.entries(cart).map(([id,q])=>({p:PRODS.find(x=>x.id==id),q}));
  if(!its.length){toast('⚠️','Корзина пуста');return;}
  const ts=document.querySelector('.tslot.on'), dd=document.getElementById('co-date');
  const o={id:'#'+Math.floor(Math.random()*90000+10000),date:new Date().toLocaleDateString('ru-RU'),pDate:dd?dd.value:'—',pTime:ts?ts.textContent:'не выбрано',addr:ADDRS[selAddr],items:its.map(x=>({name:x.p.name,emoji:x.p.emoji,q:x.q,price:x.p.price})),total:cartTotal(),status:'new'};
  orders.unshift(o);cart={};updBadge();saveState();
  toast('🎉','Заказ '+o.id+' оформлен!');go('orders');
}

// ═══ ORDERS ═══
const SLBL={new:'Новый',processing:'В обработке',ready:'Готов к выдаче',done:'Выдан'};
const SCL={new:'sb-new',processing:'sb-proc',ready:'sb-ready',done:'sb-done'};
const SSTEP={new:1,processing:2,ready:3,done:4};
function renderOrds(){
  const el=document.getElementById('ord-wrap'); if(!el) return;
  if(!orders.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon">📦</div><div class="empty-ttl">Заказов пока нет</div><p style="margin-bottom:28px;color:var(--ink3)">Оформите первый заказ из каталога</p><button class="btn-solid" style="padding:12px 32px;font-size:15px;border-radius:10px" onclick="go('catalogue')">Открыть каталог</button></div>`;return;}
  const sls=['Принят','Обработка','Готов','Выдан'];
  el.innerHTML=orders.map(o=>{const st=SSTEP[o.status];return`<div class="ocard">
    <div class="ocard-head"><div><div class="ocard-num">Заказ ${o.id}</div><div class="ocard-meta">от ${o.date} · Самовывоз: ${o.pDate}, ${o.pTime}</div></div><span class="sbadge ${SCL[o.status]}">${SLBL[o.status]}</span></div>
    <div class="oprog">${sls.map((l,i)=>`<div class="opstep ${i+1<st?'done':''} ${i+1===st?'cur':''}"><div class="opstep-dot">${i+1<st?'✓':i+1}</div><div class="opstep-lbl">${l}</div></div>`).join('')}</div>
    <div style="font-size:12px;color:var(--ink3);margin-bottom:10px">📍 ${o.addr}</div>
    <div class="oitems">${o.items.map(i=>`<span class="oitem-chip">${i.emoji} ${i.name} ×${i.q}</span>`).join('')}</div>
    <div class="ocard-foot"><div><div class="o-total">${o.total}₽</div><div class="o-addr">${o.addr}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn-repeat" onclick="repOrder('${o.id}')">↻ Повторить заказ</button>${o.status==='new'?`<button class="btn-cancel" onclick="cancelOrd('${o.id}')">Отменить</button>`:''}</div></div>
  </div>`;}).join('');
}
function repOrder(id){
  const o=orders.find(x=>x.id===id);
  o.items.forEach(i=>{const p=PRODS.find(x=>x.name===i.name);if(p) cart[p.id]=(cart[p.id]||0)+i.q;});
  updBadge();saveState();toast('✓','Товары добавлены в корзину');go('cart');
}
function cancelOrd(id){const o=orders.find(x=>x.id===id);if(o) o.status='done';saveState();renderOrds();}

// ═══ AUTH ═══
let loginMethod='email';

function atab(t){
  document.querySelectorAll('#auth-main-tabs .a-tab').forEach((el,i)=>el.classList.toggle('on',(t==='l'&&i===0)||(t==='r'&&i===1)));
  document.getElementById('a-login').style.display=t==='l'?'block':'none';
  document.getElementById('a-reg').style.display=t==='r'?'block':'none';
}
function loginMethodTab(method){
  loginMethod=method;
  document.querySelectorAll('.a-tab-login').forEach((el,i)=>el.classList.toggle('on',(method==='email'&&i===0)||(method==='phone'&&i===1)));
  document.getElementById('l-email-wrap').style.display=method==='email'?'block':'none';
  document.getElementById('l-phone-wrap').style.display=method==='phone'?'block':'none';
}
async function doLogin(){
  const em=document.getElementById('l-email').value.trim();
  const ph=document.getElementById('l-phone').value.trim();
  const p=document.getElementById('l-pass').value;
  const loginValue=loginMethod==='email'?em:ph;
  if(!loginValue||!p){toast('⚠️','Заполните все поля');return;}
  
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ login: loginValue, password: p })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка входа');
    
    await checkAuth();
    toast('👋','Добро пожаловать!');go('catalogue');
  } catch (err) {
    toast('⚠️', err.message);
  }
}
async function doReg(){
  const nm=document.getElementById('r-nm').value.trim(), ln=document.getElementById('r-ln').value.trim();
  const em=document.getElementById('r-email').value.trim();
  const ph=document.getElementById('r-ph').value.trim();
  const p=document.getElementById('r-pass').value, p2=document.getElementById('r-pass2').value;
  if(!nm||(!em&&!ph)||!p){toast('⚠️','Заполните обязательные поля');return;}
  if(em && !/^\S+@\S+\.\S+$/.test(em)){toast('⚠️','Укажите корректную почту');return;}
  if(p.length<8){toast('⚠️','Пароль — минимум 8 символов');return;}
  if(p!==p2){toast('⚠️','Пароли не совпадают');return;}
  
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ firstName: nm, lastName: ln, email: em || null, phone: ph || null, password: p })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');
    
    await checkAuth();
    toast('🎉','Регистрация успешна!');go('catalogue');
  } catch (err) {
    toast('⚠️', err.message);
  }
}
async function doLogout(){
  try {
    await fetch('http://localhost:3000/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch(e){}
  user=null;
  updAuthUI();
  go('home');
  toast('👋','Вы вышли из аккаунта');
}
function updAuthUI(){
  document.getElementById('nauth').style.display=user?'none':'block';
  document.getElementById('nlogout').style.display=user?'block':'none';
  document.getElementById('norders').style.display=user?'block':'none';
  if(user){
    const av=(user.name[0]+(user.lastname?user.lastname[0]:'')).toUpperCase();
    document.getElementById('p-av').textContent=av;
    document.getElementById('p-nm').textContent=user.name+' '+(user.lastname||'');
    document.getElementById('p-ph').textContent=user.phone||'+7 (495) 000-00-00';
  }
}

// ═══ PROFILE ═══
function psec(s){
  document.querySelectorAll('.sitem').forEach((el,i)=>el.classList.toggle('on',['data','orders','security'][i]===s));
  const el=document.getElementById('p-main'); if(!el) return;
  if(s==='data'){el.innerHTML=`<div class="scard"><div class="scard-title">Личные данные</div><div class="frow"><div class="fg"><label class="flbl">Имя</label><input class="finp" value="${user?user.name:''}"></div><div class="fg"><label class="flbl">Фамилия</label><input class="finp" value="${user?user.lastname:''}"></div></div><div class="fg"><label class="flbl">Телефон</label><input class="finp" value="${user?user.phone:''}"></div><button class="btn-solid" style="padding:11px 28px;font-size:14px;border-radius:10px" onclick="toast('✓','Данные сохранены')">Сохранить</button></div>`;}
  else if(s==='orders'){el.innerHTML='<div id="ord-wrap"></div>';renderOrds();}
  else{el.innerHTML=`<div class="scard"><div class="scard-title">Безопасность</div><div class="fg"><label class="flbl">Текущий пароль</label><input class="finp" type="password" placeholder="••••••••"></div><div class="fg"><label class="flbl">Новый пароль</label><input class="finp" type="password" placeholder="Минимум 8 символов"></div><div class="fg"><label class="flbl">Подтверждение</label><input class="finp" type="password" placeholder="••••••••"></div><button class="btn-solid" style="padding:11px 28px;font-size:14px;border-radius:10px" onclick="toast('✓','Пароль изменён')">Изменить</button></div>`;}
}
function renderProfile(){if(!user){go('auth');return;}psec('data');}

// ═══ CONTACTS FORM ═══
function sendForm(){
  const n=document.getElementById('c-name').value.trim();
  const p=document.getElementById('c-phone').value.trim();
  if(!n||!p){toast('⚠️','Заполните имя и телефон');return;}
  toast('✓','Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
  ['c-name','c-phone','c-msg'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

// ═══ CALCULATOR ═══
function calcStorage(){
  const r=parseInt(document.getElementById('pal-type').value)||32;
  const c=parseInt(document.getElementById('pal-cnt').value)||0;
  const d=parseInt(document.getElementById('pal-days').value)||0;
  const res=r*c*d;
  const el=document.getElementById('calc-result');
  if(el) el.textContent=res.toLocaleString('ru-RU')+'₽';
}

// ═══ TOAST ═══
function toast(ic,msg){
  document.getElementById('tic').textContent=ic;
  document.getElementById('tmsg').textContent=msg;
  const t=document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t=setTimeout(()=>t.classList.remove('show'),3200);
}


// ═══ API ═══
async function checkAuth() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      user = {
        name: data.user.first_name,
        lastname: data.user.last_name,
        phone: data.user.phone,
        email: data.user.email
      };
    } else {
      user = null;
    }
  } catch (err) {
    user = null;
  }
  updAuthUI();
}

async function fetchCategories() {
  try {
    const res = await fetch('http://localhost:3000/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    console.log('Fetched categories from backend:', data);
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

async function fetchProductsByCategory(categoryId) {
  try {
    const url = categoryId && categoryId !== 'all' 
      ? `http://localhost:3000/products?category_id=${categoryId}` 
      : 'http://localhost:3000/products';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    console.log(`Fetched products for category ${categoryId || 'all'} from backend:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

// ═══ INIT ═══
(async function(){
  loadState();
  hasDemoOrders=orders.length>0;
  window.addEventListener('popstate',()=>goPath(window.location.pathname));
  rp();
  const td=new Date().toISOString().split('T')[0];
  const dd=document.getElementById('co-date'); if(dd){dd.min=td;dd.value=td;}
  if(!hasDemoOrders){
    orders.push({id:'#48291',date:'15.01.2024',pDate:'16.01.2024',pTime:'10:00–11:00',addr:ADDRS[0],items:[{name:'Каберне Совиньон',emoji:'🍷',q:12,price:490},{name:'Архыз',emoji:'🏔️',q:24,price:45}],total:6960,status:'done'});
    orders.push({id:'#48154',date:'12.01.2024',pDate:'13.01.2024',pTime:'14:00–15:00',addr:ADDRS[1],items:[{name:'Балтика №3',emoji:'🍺',q:48,price:95},{name:'Coca-Cola',emoji:'🥤',q:12,price:89}],total:5628,status:'ready'});
    saveState();
  }
  updBadge();
  
  await checkAuth();
  
  goPath(window.location.pathname);

  // Вызовы бэкенд ручек
  fetchCategories();
  fetchProductsByCategory('11111111-1111-1111-1111-111111111111');
})();
