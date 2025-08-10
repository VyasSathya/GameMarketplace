// Simple interactive client mock
const qs = (s, el=document)=>el.querySelector(s);
const qsa = (s, el=document)=>Array.from(el.querySelectorAll(s));
const q = qs; // alias for brevity

const state = {
  view: 'store',
  storeTab: 'featured',
  storeLimit: 12,
  filterGenre: 'All',
  filterPrice: 'All',
  cart: [],
  wishlist: [],
  downloads: [],
  chatWith: null,
};

// Navigation
qsa('.navbtn').forEach(btn=>btn.addEventListener('click',()=>{
  const view = btn.dataset.view; setView(view);
}));

function setView(view){
  state.view=view;
  qsa('.view').forEach(v=>{v.classList.remove('active'); v.setAttribute('hidden','');});
  const current = qs(`#view-${view}`); current.classList.add('active'); current.removeAttribute('hidden');
  qsa('.navbtn').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  if(view==='store') renderStore();
  if(view==='library') renderLibrary();
  if(view==='downloads') renderDownloads();
  if(view==='community') renderCommunity();
  if(view==='friends') renderFriends();
  if(view==='settings') renderSettings('general');
}

// Store
const storeGrid = qs('#storeGrid');
const storeSort = ()=> qs('#storeSort')?.value || state.storeTab;
if(qs('#storeSort')) qs('#storeSort').addEventListener('change',()=>{ state.storeTab = storeSort(); renderStore(); });
if(qs('#storeGenre')) qs('#storeGenre').addEventListener('change',e=>{ state.filterGenre = e.target.value; renderStore(); });
if(qs('#storePrice')) qs('#storePrice').addEventListener('change',e=>{ state.filterPrice = e.target.value; renderStore(); });
if(qs('#seeAllBtn')) qs('#seeAllBtn').addEventListener('click',()=>{ state.storeLimit = state.storeLimit===12 ? 999 : 12; qs('#seeAllBtn').textContent = state.storeLimit===12? 'See all' : 'Show less'; renderStore(); });


qsa('[data-storetab]').forEach(b=>b.addEventListener('click',()=>{
  state.storeTab=b.dataset.storetab;
  qsa('[data-storetab]').forEach(x=>x.classList.toggle('active', x===b));
  const sortSel = qs('#storeSort'); if(sortSel) sortSel.value = state.storeTab;
  renderStore();
}));

function getStoreList(){
  const base = (DATA[state.storeTab] && DATA[state.storeTab].length) ? DATA[state.storeTab] : DATA.featured;
  return base.filter(g=>{
    const byGenre = state.filterGenre==='All' ? true : (g.tags||[]).includes(state.filterGenre);
    const p = g.price; let byPrice=true;
    if(state.filterPrice==='Under $10') byPrice = p<10;
    else if(state.filterPrice==='$10–$20') byPrice = p>=10 && p<=20;
    else if(state.filterPrice==='$20+') byPrice = p>20;
    return byGenre && byPrice;
  }).slice(0, state.storeLimit);
}

function renderStore(){
  // carousel
  const track = qs('#carouselTrack');
  track.innerHTML = '';
  const list = getStoreList();
  const source = (list && list.length) ? list : DATA.featured; // fallback to featured if empty
  // Ensure at least 4 items for carousel by repeating if needed
  const slides = source.length>=4 ? source.slice(0,4) : Array.from({length:4}, (_,i)=> source[i%source.length]);
  slides.forEach(g=>{
    const slide = document.createElement('div');
    slide.className='carousel-slide';
    slide.innerHTML = `<img src="${g.cover}" alt="${g.title}" />`;
    slide.addEventListener('click',()=>openGame(g.id));
    track.appendChild(slide);
  });
  let ix=0; const update=()=>{ track.style.transform=`translateX(-${ix*100}%)`; updateDots(); };
  qs('#carouselPrev').onclick=()=>{ix=(ix-1+track.children.length)%track.children.length;update();};
  qs('#carouselNext').onclick=()=>{ix=(ix+1)%track.children.length;update();};
  // Dots
  let dots = qs('#carouselDots');
  if(!dots){ dots = document.createElement('div'); dots.id='carouselDots'; dots.className='carousel-dots'; qs('#storeCarousel').appendChild(dots); }
  dots.innerHTML = '';
  slides.forEach((_,i)=>{
    const d = document.createElement('button'); d.className='dot'; d.setAttribute('aria-label',`Go to slide ${i+1}`);
    d.addEventListener('click',()=>{ ix=i; update(); }); dots.appendChild(d);
  });
  function updateDots(){ qsa('.carousel-dots .dot').forEach((d,i)=> d.classList.toggle('active', i===ix)); }
  updateDots();
  // Auto-advance for modern feel
  clearInterval(window.__carouselTimer);
  window.__carouselTimer = setInterval(()=>{ if(state.view==='store'){ ix=(ix+1)%track.children.length; update(); } }, 4000);

  // grid
  storeGrid.innerHTML='';
  qs('#storeSectionTitle') && (qs('#storeSectionTitle').textContent = titleForTab(state.storeTab));
  getStoreList().forEach(g=>{
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `
      <span class="rating-badge">⭐ ${g.rating}</span>
      <img src="${g.cover}" alt="${g.title}">
      <div class="overlay"><div class="quick"><button class="btn" onclick="toggleWishlist('${g.id}');event.stopPropagation()">♥</button><button class="btn primary" onclick="addToCart('${g.id}');event.stopPropagation()">Add</button></div></div>
      <div class="cbody">
        <div class="title">${g.title}</div>
        <div class="meta">${g.developer}</div>
        <div class="tags">${g.tags.map(t=>`<span class='tag-chip'>${t}</span>`).join('')}</div>
        <div class="price">$${g.price.toFixed(2)}</div>
      </div>`;
    el.addEventListener('click',()=>openGame(g.id));
    storeGrid.appendChild(el);
  });
}

function titleForTab(tab){
  return tab==='featured'?'Featured': tab==='new'?'New & Trending': tab==='topsellers'?'Top Sellers': tab==='specials'?'Specials': 'Your Queue';
}

function findGame(id){
  return DATA.featured.find(g=>g.id===id) || DATA.new.find(g=>g.id===id) || DATA.topsellers.find(g=>g.id===id) || DATA.specials.find(g=>g.id===id);
}

function openGame(id){
  const g = findGame(id); if(!g) return;
  qs('#gmTitle').textContent=g.title;
  qs('#gmDeveloper').textContent=`Developer: ${g.developer}`;
  qs('#gmRating').textContent=`⭐ ${g.rating}`;
  qs('#gmDescription').textContent=g.description;
  qs('#gmPrice').textContent=`$${g.price.toFixed(2)}`;
  const thumbs = qs('#gmMediaThumbs'); thumbs.innerHTML='';
  const viewer = qs('#gmMediaViewer'); viewer.innerHTML='';
  g.media.forEach((m,i)=>{
    const t = document.createElement(m.t==='vid'?'video':'img');
    t.src=m.src; if(m.t==='vid'){t.muted=true; t.loop=true; t.autoplay=true}
    t.addEventListener('click',()=>showMedia(m));
    thumbs.appendChild(t);
    if(i===0){ const v = t.cloneNode(true); v.controls = m.t==='vid'; viewer.appendChild(v); }
  });
  qs('#gmBuy').onclick=()=>addToCart(id,true);
  qs('#gmAddToCart').onclick=()=>addToCart(id);
  qs('#gmWishlist').onclick=()=>toggleWishlist(id);
  // DLC
  const dlc=qs('#gmDLC'); dlc.innerHTML='<h4>DLCs</h4>'+(g.dlc && g.dlc.length? g.dlc.map(d=>`<div class="small">${d.title} – $${d.price.toFixed(2)}</div>`).join('') : '<div class="small">No DLC</div>');
  // Related
  const rel=qs('#gmRelated'); rel.innerHTML='<h4>Related</h4>'+(g.related? g.related.map(r=>{
    const rg=findGame(r); return rg?`<button class="tab" onclick="openGame('${rg.id}')">${rg.title}</button>`:'';
  }).join(''):'');
  openModal('gameModal');
}

function showMedia(m){
  const fm = qs('#fullMedia'); fm.innerHTML='';
  const el = document.createElement(m.t==='vid'?'video':'img');
  el.src=m.src; if(m.t==='vid'){el.controls=true; el.autoplay=true}
  fm.appendChild(el);
  openModal('mediaModal');
}

// Cart & Wishlist
function addToCart(id, buyNow=false){
  if(!state.cart.includes(id)) state.cart.push(id);
  updateCartBadge();
  renderCart();
  openDrawer('cartDrawer');
  if(buyNow) qs('#checkoutBtn').focus();
}
function toggleWishlist(id){
  const i = state.wishlist.indexOf(id);
  if(i===-1) state.wishlist.push(id); else state.wishlist.splice(i,1);
  updateWishlistBadge();
  renderWishlist();
  openDrawer('wishlistDrawer');
}
function updateCartBadge(){ qs('#cartCount').textContent = String(state.cart.length); }
function updateWishlistBadge(){ qs('#wishlistCount').textContent = String(state.wishlist.length); }
qs('#cartBtn').onclick=()=>{renderCart(); openDrawer('cartDrawer')};
qs('#wishlistBtn').onclick=()=>{renderWishlist(); openDrawer('wishlistDrawer')};

function renderCart(){
  const body = qs('#cartItems'); body.innerHTML='';
  state.cart.forEach(id=>{
    const g=findGame(id); if(!g) return; const row=document.createElement('div');
    row.className='listitem';
    row.innerHTML=`<img src="${g.cover}"><div class="li-body"><div>${g.title}</div><div class="small">${g.developer}</div><div class="li-actions"><button class="primary" onclick="startDownload('${g.id}')">Download (Mock)</button><button onclick="removeCart('${g.id}')">Remove</button></div></div>`;
    body.appendChild(row);
  })
}
function renderWishlist(){
  const body = qs('#wishlistItems'); body.innerHTML='';
  state.wishlist.forEach(id=>{
    const g=findGame(id); if(!g) return; const row=document.createElement('div');
    row.className='listitem';
    row.innerHTML=`<img src="${g.cover}"><div class="li-body"><div>${g.title}</div><div class="small">${g.developer}</div><div class="li-actions"><button onclick="addToCart('${g.id}')">Add to Cart</button><button onclick="toggleWishlist('${g.id}')">Remove</button></div></div>`;
    body.appendChild(row);
  })
}
window.removeCart=id=>{ const i=state.cart.indexOf(id); if(i>-1) state.cart.splice(i,1); updateCartBadge(); renderCart(); }

// Library
let selectedLibGame = null;
function renderLibrary(){
  const sidebar = qs('#librarySidebar'); sidebar.innerHTML='';
  qs('#libGameCount').textContent = DATA.library.length;

  DATA.library.forEach(entry=>{
    const g=findGame(entry.id); if(!g) return;
    const el = document.createElement('div');
    el.className='lib-item' + (selectedLibGame===entry.id ? ' selected' : '');
    el.innerHTML = `
      <img src="${g.cover}" alt="${g.title}">
      <div class="lib-item-info">
        <div class="lib-item-title">${g.title}</div>
        <div class="lib-item-meta">${entry.installed? 'Installed' : 'Not installed'} • ${entry.hours}h</div>
      </div>`;
    el.addEventListener('click',()=>selectLibGame(entry.id));
    sidebar.appendChild(el);
  });

  if(selectedLibGame) renderLibraryDetails(selectedLibGame);
}

function selectLibGame(gameId){
  selectedLibGame = gameId;
  qsa('.lib-item').forEach(item => item.classList.remove('selected'));
  event.target.closest('.lib-item').classList.add('selected');
  renderLibraryDetails(gameId);
}

function renderLibraryDetails(gameId){
  const entry = DATA.library.find(e=>e.id===gameId);
  const g = findGame(gameId);
  if(!entry || !g) return;

  const details = qs('#libraryDetails');
  const achievementPercent = Math.round((entry.achievements / entry.totalAchievements) * 100);

  details.innerHTML = `
    <div class="lib-game-header">
      <img src="${g.cover}" alt="${g.title}" class="lib-game-cover">
      <div class="lib-game-info">
        <h2 class="lib-game-title">${g.title}</h2>
        <div class="lib-game-developer">${g.developer}</div>
        <div class="lib-game-actions">
          ${entry.installed ?
            `<button class="primary" onclick="playGame('${g.id}')">Play</button>
             <button onclick="openGame('${g.id}')">Store Page</button>` :
            `<button class="primary" onclick="startDownload('${g.id}')">Install</button>`
          }
          ${entry.updateAvailable ? '<button class="btn">Update Available</button>' : ''}
        </div>
      </div>
    </div>

    <div class="lib-game-stats">
      <div class="lib-stat">
        <div class="lib-stat-label">Hours Played</div>
        <div class="lib-stat-value">${entry.hours}</div>
      </div>
      <div class="lib-stat">
        <div class="lib-stat-label">Last Played</div>
        <div class="lib-stat-value">${entry.lastPlayed || 'Never'}</div>
      </div>
      <div class="lib-stat">
        <div class="lib-stat-label">Cloud Sync</div>
        <div class="lib-stat-value">${entry.cloudSync ? '✓ Enabled' : '✗ Disabled'}</div>
      </div>
      <div class="lib-stat">
        <div class="lib-stat-label">Controller</div>
        <div class="lib-stat-value">${entry.controllerSupport ? '✓ Supported' : '✗ Not Supported'}</div>
      </div>
    </div>

    <div class="lib-achievements">
      <h4>Achievements</h4>
      <div class="achievement-progress">
        <div>${entry.achievements} of ${entry.totalAchievements} achievements unlocked (${achievementPercent}%)</div>
        <div class="achievement-bar"><span style="width:${achievementPercent}%"></span></div>
      </div>
    </div>

    <div class="lib-sections">
      <div class="lib-section">
        <h4>Game Details</h4>
        <p>${g.description}</p>
      </div>
      <div class="lib-section">
        <h4>System Requirements</h4>
        <p>${g.requirements || 'No requirements listed'}</p>
      </div>
    </div>
  `;
}

window.playGame=id=>alert(`Launch ${findGame(id)?.title} (mock)`);

// Downloads
function renderDownloads(){
  const q = qs('#downloadQueue'); q.innerHTML='';
  const totalSize = state.downloads.reduce((sum, job) => sum + (job.size || 2.5), 0);
  const completedSize = state.downloads.reduce((sum, job) => sum + ((job.size || 2.5) * job.progress / 100), 0);

  // Update header stats
  const header = qs('.downloads-header .downloads-stats');
  if(header) {
    header.innerHTML = `
      <div>Total: <strong>${completedSize.toFixed(1)} GB</strong> / ${totalSize.toFixed(1)} GB</div>
      <div>Speed: <strong><span id="dlTotalSpeed">0</span> MB/s</strong></div>
      <div>Remaining: <strong>${Math.max(0, state.downloads.filter(j=>j.status!=='Completed').length)}</strong> items</div>
    `;
  }

  state.downloads.forEach((job, index)=>{
    const g=findGame(job.id);
    const row=document.createElement('div');
    row.className='job';
    row.draggable = true;
    row.innerHTML = `
      <div class="drag-handle">⋮⋮</div>
      <img src="${g.cover}" class="job-thumbnail" alt="${g.title}">
      <div class="job-info">
        <div class="job-title">${g.title}</div>
        <div class="job-status">${job.status} • ${job.progress}% • ${(job.size || 2.5).toFixed(1)} GB</div>
        <div class="job-progress"><span style="width:${job.progress}%"></span></div>
      </div>
      <div class="job-speed">${job.paused || job.status==='Completed' ? '' : (Math.random()*8+2).toFixed(1) + ' MB/s'}</div>
      <div class="job-controls">
        <button onclick="pauseJob('${job.id}')">${job.paused?'Resume':'Pause'}</button>
        <button onclick="cancelJob('${job.id}')">Cancel</button>
      </div>`;

    // Add drag and drop
    row.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', index));
    row.addEventListener('dragover', e => e.preventDefault());
    row.addEventListener('drop', e => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const toIndex = index;
      if(fromIndex !== toIndex) {
        const item = state.downloads.splice(fromIndex, 1)[0];
        state.downloads.splice(toIndex, 0, item);
        renderDownloads();
      }
    });

    q.appendChild(row);
  });
  updateTotalSpeed();
}

function updateTotalSpeed(){
  const active = state.downloads.filter(j=>!j.paused && j.status!=='Completed');
  const speed = active.reduce((s)=>s + (Math.random()*5),0); // mock speed
  qs('#dlTotalSpeed').textContent = speed.toFixed(2);
  updateTray();

}

window.startDownload = id => {
  if(state.downloads.find(j=>j.id===id)) { setView('downloads'); return; }
  const g = findGame(id);
  const size = Math.random() * 4 + 1; // Random size between 1-5 GB
  state.downloads.push({id, progress:0, paused:false, status:'Queued', size});
  setView('downloads');
  tickDownloads();
};

function tickDownloads(){
  state.downloads.forEach(job=>{
    if(job.paused || job.status==='Completed') return;
    job.status='Downloading';
    job.progress = Math.min(100, job.progress + Math.random()*8);
    if(job.progress>=100){ job.status='Completed'; job.progress=100; }
  updateTray();

  });
  renderDownloads();

function updateTray(){
  const tray = qs('#downloadsTray'); if(!tray) return;
  const active = state.downloads.filter(j=>j.status!=='Completed');
  if(active.length===0){ tray.style.display='none'; return; }
  tray.style.display='grid';
  qs('#trayCount').textContent = `(${active.length})`;
  const avg = active.reduce((a,j)=>a+j.progress,0) / active.length;
  qs('#trayProgress').style.width = `${avg}%`;
}

  if(state.downloads.some(j=>j.status!=='Completed')) setTimeout(tickDownloads, 700);
}

window.pauseJob = id => { const j=state.downloads.find(x=>x.id===id); if(j){ j.paused=!j.paused; renderDownloads(); if(!j.paused) tickDownloads(); } };
window.cancelJob = id => { const i=state.downloads.findIndex(x=>x.id===id); if(i>-1){ state.downloads.splice(i,1); renderDownloads(); } };

// Community
let communityTab = 'discussions';
function renderCommunity(){
  const content = qs('#communityContent');

  // Wire up tabs
  qsa('[data-comtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      communityTab = btn.dataset.comtab;
      qsa('[data-comtab]').forEach(b => b.classList.toggle('active', b === btn));
      renderCommunityContent();
    });
  });

  renderCommunityContent();
}

function renderCommunityContent(){
  const content = qs('#communityContent');

  if(communityTab === 'discussions') {
    content.innerHTML = `
      <div class="community-grid">
        ${DATA.community.discussions.map(d => `
          <div class="community-card">
            <div class="community-card-header">
              <div>
                <div class="community-card-title">${d.title}</div>
                <div class="community-card-meta">by ${d.author} • ${d.timestamp}</div>
              </div>
            </div>
            <div class="community-card-stats">
              <span>💬 ${d.replies} replies</span>
              <span>👍 ${d.likes} likes</span>
              <span>🎮 ${d.game}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
  } else if(communityTab === 'workshop') {
    content.innerHTML = `
      <div class="community-grid">
        ${DATA.community.workshop.map(w => `
          <div class="community-card">
            <img src="${w.thumbnail}" class="workshop-thumbnail" alt="${w.title}">
            <div class="community-card-title">${w.title}</div>
            <div class="community-card-meta">by ${w.author}</div>
            <div class="community-card-stats">
              <span>⬇️ ${w.downloads.toLocaleString()}</span>
              <span>⭐ ${w.rating}</span>
              <span>🎮 ${w.game}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
  } else if(communityTab === 'guides') {
    content.innerHTML = `
      <div class="community-grid">
        ${DATA.community.guides.map(g => `
          <div class="community-card">
            <div class="community-card-title">${g.title}</div>
            <div class="community-card-meta">by ${g.author}</div>
            <div class="community-card-stats">
              <span>👁️ ${g.views.toLocaleString()} views</span>
              <span>⭐ ${g.rating}</span>
              <span>🎮 ${g.game}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
  } else {
    content.innerHTML = `
      <div class="community-grid">
        <div class="community-card">
          <img src="https://picsum.photos/seed/ss1/300/200" class="workshop-thumbnail" alt="Screenshot">
          <div class="community-card-title">Epic Boss Fight</div>
          <div class="community-card-meta">by ProGamer2025</div>
          <div class="community-card-stats">
            <span>👍 234 likes</span>
            <span>🎮 CyberFarm 2077</span>
          </div>
        </div>
        <div class="community-card">
          <img src="https://picsum.photos/seed/ss2/300/200" class="workshop-thumbnail" alt="Screenshot">
          <div class="community-card-title">Beautiful Landscape</div>
          <div class="community-card-meta">by ArtisticPlayer</div>
          <div class="community-card-stats">
            <span>👍 567 likes</span>
            <span>🎮 SkyRails Tycoon</span>
          </div>
        </div>
      </div>`;
  }
}

// Friends & Chat
let openChats = new Map();
function renderFriends(){
  const list = qs('#friendsList');
  const onlineCount = DATA.friends.filter(f => f.status !== 'Offline').length;
  qs('#onlineFriendsCount').textContent = onlineCount;

  list.innerHTML='';
  DATA.friends.forEach(f=>{
    const statusClass = f.status === 'Online' ? 'status-online' :
                       f.status === 'Away' ? 'status-away' :
                       f.status === 'In Game' ? 'status-ingame' : 'status-offline';

    const row=document.createElement('div');
    row.className='friend' + (openChats.has(f.id) ? ' active' : '');
    row.innerHTML = `
      <img src="${f.avatar}" class="friend-avatar" alt="${f.name}">
      <div class="friend-info">
        <div class="friend-name">
          <span class="status-indicator ${statusClass}"></span>
          ${f.name}
        </div>
        <div class="friend-status">${f.status}</div>
        ${f.game ? `<div class="friend-game">Playing ${f.game}</div>` : ''}
      </div>`;
    row.addEventListener('click',()=>openChat(f));
    list.appendChild(row);
  });

  renderChatTabs();
}

function openChat(friend){
  if(!openChats.has(friend.id)) {
    openChats.set(friend.id, {
      friend,
      messages: [{text: `Say hi to ${friend.name}!`, type: 'system'}]
    });
  }
  state.chatWith = friend.id;
  renderChatTabs();
  renderChatContent();
  qsa('.friend').forEach(f => f.classList.remove('active'));
  event.target.closest('.friend').classList.add('active');
}

function renderChatTabs(){
  const tabsContainer = qs('#chatTabs');
  if(openChats.size === 0) {
    tabsContainer.innerHTML = '';
    return;
  }

  tabsContainer.innerHTML = Array.from(openChats.entries()).map(([id, chat]) => `
    <div class="chat-tab ${state.chatWith === id ? 'active' : ''}" onclick="switchChat('${id}')">
      ${chat.friend.name}
      <span class="close" onclick="closeChat('${id}'); event.stopPropagation();">×</span>
    </div>
  `).join('');
}

function renderChatContent(){
  const content = qs('#chatContent');
  if(!state.chatWith || !openChats.has(state.chatWith)) {
    content.innerHTML = '<div class="chat-empty">Select a friend to start chatting</div>';
    return;
  }

  const chat = openChats.get(state.chatWith);
  content.innerHTML = `
    <div class="chat-window">
      <div class="chat-header">
        <div>${chat.friend.name}</div>
        <div class="friend-status">${chat.friend.status}</div>
      </div>
      <div class="chat-messages" id="chatMessages">
        ${chat.messages.map(msg =>
          msg.type === 'system' ? `<div class="chat-message system">${msg.text}</div>` :
          `<div class="chat-message ${msg.type}">${msg.text}</div>`
        ).join('')}
      </div>
      <div class="chat-input-area">
        <input id="chatInput" placeholder="Type a message..." onkeypress="if(event.key==='Enter')sendMsg()">
        <button class="primary" onclick="sendMsg()">Send</button>
      </div>
    </div>`;

  qs('#chatInput').focus();
  const messages = qs('#chatMessages');
  messages.scrollTop = messages.scrollHeight;
}

window.switchChat = (friendId) => {
  state.chatWith = friendId;
  renderChatTabs();
  renderChatContent();
};

window.closeChat = (friendId) => {
  openChats.delete(friendId);
  if(state.chatWith === friendId) {
    state.chatWith = openChats.size > 0 ? Array.from(openChats.keys())[0] : null;
  }
  renderChatTabs();
  renderChatContent();
};

window.sendMsg = () => {
  const input = qs('#chatInput');
  const txt = input.value.trim();
  if(!txt || !state.chatWith) return;

  const chat = openChats.get(state.chatWith);
  chat.messages.push({text: txt, type: 'own'});

  // Simulate friend response
  setTimeout(() => {
    const responses = ['Hey!', 'How are you?', 'Nice!', 'Cool!', 'Awesome!', 'Let\'s play!'];
    chat.messages.push({text: responses[Math.floor(Math.random() * responses.length)], type: 'other'});
    if(state.chatWith === chat.friend.id) renderChatContent();
  }, 1000 + Math.random() * 2000);

  input.value = '';
  renderChatContent();
};

// Settings
function renderSettings(section){
  qsa('.snav').forEach(b=>b.classList.toggle('active', b.dataset.settings===section));
  const el = qs('#settingsContent');

  const settingsData = {
    general: {
      title: 'General',
      sections: [
        {
          title: 'Startup',
          items: [
            {label: 'Run GameMarketplace on startup', type: 'checkbox', checked: true},
            {label: 'Start minimized', type: 'checkbox', checked: false},
            {label: 'Enable hardware acceleration', type: 'checkbox', checked: true}
          ]
        },
        {
          title: 'Updates',
          items: [
            {label: 'Automatically update games', type: 'checkbox', checked: true},
            {label: 'Update games during off-peak hours', type: 'checkbox', checked: false}
          ]
        }
      ]
    },
    downloads: {
      title: 'Downloads',
      sections: [
        {
          title: 'Bandwidth',
          items: [
            {label: 'Limit bandwidth', type: 'checkbox', checked: false},
            {label: 'Download limit', type: 'range', min: 0, max: 100, value: 80, unit: 'MB/s'},
            {label: 'Upload limit', type: 'range', min: 0, max: 100, value: 20, unit: 'MB/s'}
          ]
        },
        {
          title: 'Region',
          items: [
            {label: 'Download region', type: 'select', options: ['US-West', 'US-East', 'EU-West', 'EU-East', 'Asia-Pacific'], value: 'US-West'},
            {label: 'Allow downloads from any region', type: 'checkbox', checked: true}
          ]
        }
      ]
    },
    interface: {
      title: 'Interface',
      sections: [
        {
          title: 'Appearance',
          items: [
            {label: 'Theme', type: 'select', options: ['Dark', 'Light', 'Auto'], value: 'Dark'},
            {label: 'UI Scale', type: 'range', min: 75, max: 150, value: 100, unit: '%'},
            {label: 'Show FPS counter', type: 'checkbox', checked: false}
          ]
        },
        {
          title: 'Notifications',
          items: [
            {label: 'Show desktop notifications', type: 'checkbox', checked: true},
            {label: 'Play notification sounds', type: 'checkbox', checked: true}
          ]
        }
      ]
    },
    ingame: {
      title: 'In-Game',
      sections: [
        {
          title: 'Overlay',
          items: [
            {label: 'Enable in-game overlay', type: 'checkbox', checked: true},
            {label: 'Show FPS counter', type: 'checkbox', checked: false},
            {label: 'Enable screenshot hotkey', type: 'checkbox', checked: true}
          ]
        }
      ]
    },
    controller: {
      title: 'Controller',
      sections: [
        {
          title: 'General',
          items: [
            {label: 'Enable controller support', type: 'checkbox', checked: true},
            {label: 'Use desktop configuration in launcher', type: 'checkbox', checked: false}
          ]
        }
      ]
    },
    cloud: {
      title: 'Cloud',
      sections: [
        {
          title: 'Save Data',
          items: [
            {label: 'Enable cloud saves', type: 'checkbox', checked: true},
            {label: 'Sync saves automatically', type: 'checkbox', checked: true}
          ]
        }
      ]
    },
    family: {
      title: 'Family',
      sections: [
        {
          title: 'Parental Controls',
          items: [
            {label: 'Enable family sharing', type: 'checkbox', checked: false},
            {label: 'Restrict mature content', type: 'checkbox', checked: false}
          ]
        }
      ]
    },
    account: {
      title: 'Account',
      sections: [
        {
          title: 'Profile',
          items: [
            {label: 'Email', type: 'text', value: 'user@example.com', readonly: true},
            {label: 'Display name', type: 'text', value: 'GamePlayer2025'}
          ]
        },
        {
          title: 'Security',
          items: [
            {label: 'Two-factor authentication', type: 'button', text: 'Enable 2FA'},
            {label: 'Manage devices', type: 'button', text: 'View Devices'}
          ]
        }
      ]
    }
  };

  const config = settingsData[section];
  if(!config) return;

  el.innerHTML = `
    <h3>${config.title}</h3>
    ${config.sections.map(sect => `
      <div class="settings-section">
        <h4>${sect.title}</h4>
        ${sect.items.map(item => `
          <div class="setting-item">
            <div class="setting-label">
              ${item.label}
              ${item.description ? `<div class="setting-description">${item.description}</div>` : ''}
            </div>
            <div class="setting-control">
              ${item.type === 'checkbox' ? `<input type="checkbox" ${item.checked ? 'checked' : ''}>` :
                item.type === 'range' ? `<input type="range" min="${item.min}" max="${item.max}" value="${item.value}"> <span>${item.value}${item.unit || ''}</span>` :
                item.type === 'select' ? `<select>${item.options.map(opt => `<option ${opt === item.value ? 'selected' : ''}>${opt}</option>`).join('')}</select>` :
                item.type === 'text' ? `<input type="text" value="${item.value}" ${item.readonly ? 'readonly' : ''}>` :
                item.type === 'button' ? `<button class="primary">${item.text}</button>` : ''
              }
            </div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  `;
}
qsa('.snav').forEach(b=>b.addEventListener('click',()=>renderSettings(b.dataset.settings)));

// Drawers & Modals
function openDrawer(id){ const el=qs('#'+id); el.setAttribute('aria-hidden','false'); }
qsa('.drawer .close').forEach(b=>b.addEventListener('click',()=>qs('#'+b.dataset.close).setAttribute('aria-hidden','true')));

function openModal(id){ const el=qs('#'+id); el.setAttribute('aria-hidden','false'); }
qsa('.modal .close').forEach(b=>b.addEventListener('click',()=>qs('#'+b.dataset.close).setAttribute('aria-hidden','true')));
window.addEventListener('keydown',e=>{ if(e.key==='Escape'){ qsa('.modal').forEach(m=>m.setAttribute('aria-hidden','true')); qsa('.drawer').forEach(d=>d.setAttribute('aria-hidden','true')); }});

// Initial render
renderStore();

