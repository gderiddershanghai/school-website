// Encrypted role-specific index and on-demand attachments.
const role=location.pathname.match(/\/(jim|barry)\/?$/)?.[1]||'staff',storageKey='flying-recruitment-key-'+role;
lang=role==='staff'?'zh':(localStorage.getItem('recruitment-language-'+role)||'en');
let activeKey=null,cryptoKey=null,assetUrls=new Map(),loadSequence=0;
function clearAssets(){for(const url of assetUrls.values())URL.revokeObjectURL(url);assetUrls.clear();}
async function assetUrl(id){
 if(assetUrls.has(id))return assetUrls.get(id);
 const f=archive.files?.[id];if(!f)throw Error('Missing attachment');
 const response=await fetch(f.url);if(!response.ok)throw Error('Attachment download failed');
 const bytes=new Uint8Array(await response.arrayBuffer());
 const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12),additionalData:new TextEncoder().encode('flying-recruitment-asset-v1:'+role+':'+id)},cryptoKey,bytes.slice(12));
 const url=URL.createObjectURL(new Blob([raw],{type:f.contentType}));assetUrls.set(id,url);return url;
}
function avatar(c,large=false){
 const a=el('span',c.name.split(/\s+/).map(s=>s[0]).slice(0,2).join(''),'avatar'+(large?' portrait-large':''));
 if(c.portrait)assetUrl(c.portrait.asset).then(url=>{if(!a.isConnected)return;const img=el('img');img.src=url;img.alt=c.name;a.replaceChildren(img);}).catch(()=>{});
 return a;
}
function documents(c){
 $('detail').append(el('p',t('resumes'),'section-label'));
 for(const d of c.documents||[]){
  const row=el('div',null,'document');row.append(el('strong',d.name));
  const a=el('a',t('download'));a.href='#';a.download=d.name;
  a.onclick=async e=>{if(a.href.startsWith('blob:'))return;e.preventDefault();a.textContent=lang==='zh'?'正在加载…':'Loading…';try{a.href=await assetUrl(d.asset);a.textContent=t('download');a.click();}catch{a.textContent=lang==='zh'?'重试下载':'Retry download';}};
  row.append(a);$('detail').append(row);
 }
}
function video(c){
 $('detail').append(el('p',t('video'),'section-label'));
 if(!c.video){$('detail').append(el('p',t('noVideo')));return;}
 const host=el('div'),button=el('button',lang==='zh'?'播放自我介绍视频':'Play introduction video');
 button.onclick=async()=>{button.disabled=true;button.textContent=lang==='zh'?'正在加载视频…':'Loading video…';try{const url=await assetUrl(c.video.asset);const p=el('video');p.controls=true;p.src=url;const a=el('a',t('download'));a.href=url;a.download=c.video.name;host.replaceChildren(p,a);p.play().catch(()=>{});}catch{button.disabled=false;button.textContent=lang==='zh'?'重试加载视频':'Retry video';}};
 host.append(button);$('detail').append(host);
}
function review(c){
 const box=el('section',null,'review-panel');if(c.interviewAt)box.append(el('p',String(t('interview'))+': '+date(c.interviewAt)));if(c.decisionAt)box.append(el('p',String(t('decision'))+': '+date(c.decisionAt)));
 if(c.recruiterComment)box.append(el('p',value(c.recruiterComment)));
 if(c.rejectionReason)box.append(el('p',value(c.rejectionReason)));
 if(role==='staff'&&c.notes)box.append(el('strong',t('notes')),el('p',c.notes));
 $('detail').append(box);
}
function graduationCheck(){}
function locked(message){
 clearAssets();archive={candidates:[]};$('detail').replaceChildren();$('candidates').replaceChildren();$('workspace').hidden=true;$('logout').hidden=true;$('login').hidden=false;$('login-form').hidden=true;
 $('unlock-message')?.remove();const p=el('p',message);p.id='unlock-message';p.setAttribute('role','status');$('login').append(p);
}
async function load(){
 if(!activeKey)return locked(lang==='zh'?'请使用收到的专属链接打开此页面。':'Open the private invitation link you received.');
 const seq=++loadSequence;locked(lang==='zh'?'正在加载候选人…':'Loading candidates…');
 let stage='network';
 try{
  const raw=await fetch('index.bin?v=20261029b',{cache:'no-store'});if(!raw.ok)throw Error('HTTP '+raw.status);
  const bytes=new Uint8Array(await raw.arrayBuffer());stage='unlock';
  const keyBytes=Uint8Array.from(atob(activeKey.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-activeKey.length%4)%4)),c=>c.charCodeAt(0));
  const key=await crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,['decrypt']);
  const decrypted=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12),additionalData:new TextEncoder().encode('flying-recruitment-v1:'+role)},key,bytes.slice(12));
  const next=JSON.parse(new TextDecoder().decode(decrypted));if(next.scope!==role)throw Error('Wrong scope');
  if(seq!==loadSequence)return;cryptoKey=key;archive=next;stage='display';$('login').hidden=true;$('workspace').hidden=false;translate();
 }catch(e){
  if(seq!==loadSequence)return;
  locked(stage==='network'?(lang==='zh'?'网络加载失败，请点击重试。':'Could not download candidates. Please retry.'):(stage==='unlock'?(lang==='zh'?'链接无法解锁此页面，请重新打开完整的专属链接。':'This link could not unlock the page. Reopen the full invitation link.'):(lang==='zh'?'页面显示失败，请重试。':'Could not display candidates. Please retry.')));
  const retry=el('button',lang==='zh'?'重试':'Retry');retry.onclick=load;$('login').append(retry);
 }
}
if(role==='barry'){
 Object.assign(portalWords.en,{title:'Arun candidate portal',staff:'BARRY SHORTEN / ARUN'});
 Object.assign(portalWords.zh,{title:'Arun 候选人页面',staff:'BARRY SHORTEN / ARUN'});
}
function contacts(c){
 const box=el('section',null,'contact-panel');box.append(el('p',lang==='zh'?'联系方式':'Contact information','section-label'));
 const labels={email:lang==='zh'?'邮箱':'Email',phone:lang==='zh'?'电话':'Phone',wechat:'WeChat',whatsapp:'WhatsApp'};
 const entries=c.contact?.entries||[];
 if(!entries.length)box.append(el('p',lang==='zh'?'未提供直接联系方式，请联系招聘顾问。':'Direct contact details not provided; contact the recruiter.'));
 for(const item of entries){const p=el('p');p.append(el('strong',(labels[item.type]||item.type)+': '));if(item.type==='email'){const a=el('a',item.value);a.href='mailto:'+item.value;p.append(a);}else p.append(document.createTextNode(item.value));if(item.label)p.append(el('small',' ('+value(item.label)+')'));box.append(p);}
 $('detail').append(box);
}
const originalRender=render;
render=function(){
 originalRender();
 for(const c of archive.candidates){
  const group=c.applicationGroup;if(!group)continue;
  const others=group.members.filter(x=>x.id!==c.id);
  if(!others.length)continue;
  const label=(lang==='zh'?'共同申请：':'Applying together: ')+others.map(x=>x.name).join(', ');
  const cards=[...$('candidates').children];const card=cards.find(x=>x.querySelector('strong')?.textContent===c.name);
  if(card)card.querySelector('.candidate-info').append(el('span',label,'pair-note'));
  if(c.id===selected){const note=el('p',label,'pair-note');$('detail').insertBefore(note,$('detail').querySelector('h2').nextSibling);}
 }
 const c=archive.candidates.find(x=>x.id===selected);if(c)contacts(c);
};
$('login-form').hidden=true;
$('language').onclick=()=>{lang=lang==='en'?'zh':'en';try{localStorage.setItem('recruitment-language-'+role,lang);}catch{}translate();};
$('refresh').onclick=load;$('search').oninput=render;$('recruiter').onchange=render;$('status-filter').onchange=render;
function acceptLink(){
 const fragment=location.hash.slice(1);
 if(/^[A-Za-z0-9_-]{43}$/.test(fragment)){activeKey=fragment;try{localStorage.setItem(storageKey,activeKey);}catch{}history.replaceState(null,'',location.pathname+location.search);}
 else{try{activeKey=localStorage.getItem(storageKey);}catch{}}
}
acceptLink();translate();load();
window.addEventListener('hashchange',()=>{acceptLink();load();});
