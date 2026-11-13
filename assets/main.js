// Comportamento comum a todas as páginas — sem dependências de build.
const toggle=document.querySelector('.mobile-toggle');
const nav=document.querySelector('.nav');
function closeMenu(){
  if(!toggle||!nav)return;
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded','false');
}
if(toggle&&nav){
  toggle.addEventListener('click',()=>{
    const next=toggle.getAttribute('aria-expanded')!=='true';
    toggle.setAttribute('aria-expanded',String(next));
    nav.classList.toggle('open',next);
  });
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('click',event=>{
    if(nav.classList.contains('open')&&!nav.contains(event.target)&&!toggle.contains(event.target))closeMenu();
  });
}
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveal=document.querySelectorAll('.reveal');
if(!reduceMotion&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.06,rootMargin:'0px 0px 32px 0px'});
  reveal.forEach(el=>observer.observe(el));
}else reveal.forEach(el=>el.classList.add('visible'));

const progress=document.querySelector('.progress');
let scrollQueued=false;
function updateProgress(){
  if(!progress)return;
  const range=document.documentElement.scrollHeight-innerHeight;
  progress.style.width=(range>0?scrollY/range*100:0)+'%';
  scrollQueued=false;
}
window.addEventListener('scroll',()=>{
  if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateProgress)}
},{passive:true});
window.addEventListener('resize',updateProgress);
updateProgress();

// Filtros de marcos na linha do tempo.
document.querySelectorAll('[data-filter]').forEach(button=>{
  button.setAttribute('aria-pressed',String(button.classList.contains('active')));
  button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(other=>{
      const active=other===button;
      other.classList.toggle('active',active);
      other.setAttribute('aria-pressed',String(active));
    });
    document.querySelectorAll('.event').forEach(entry=>{
      entry.hidden=filter!=='todos'&&entry.dataset.type!==filter;
    });
  });
});

// Quadro interativo da análise de Kallstenius.
const slides=[...document.querySelectorAll('.slide')];
const status=document.querySelector('#slide-status');
const deck=document.querySelector('#deck');
const modeButton=document.querySelector('[data-presentation-toggle]');
let index=0;
let focusBeforeDeck=null;
function showSlide(next){
  if(!slides.length)return;
  index=(next+slides.length)%slides.length;
  slides.forEach((slide,i)=>{
    const active=i===index;
    slide.classList.toggle('active',active);
    slide.setAttribute('aria-hidden',String(!active));
  });
  if(status)status.textContent=(index+1)+' / '+slides.length;
}
document.querySelectorAll('[data-slide-dir]').forEach(button=>{
  button.addEventListener('click',()=>showSlide(index+Number(button.dataset.slideDir)));
});
function setPresentation(enabled){
  if(!deck||!modeButton)return;
  deck.classList.toggle('is-fullscreen',enabled);
  document.body.classList.toggle('presentation-mode',enabled);
  modeButton.setAttribute('aria-pressed',String(enabled));
  modeButton.textContent=enabled?'Sair da apresentação ×':'Modo apresentação ⛶';
  if(enabled){
    focusBeforeDeck=document.activeElement;
    deck.setAttribute('role','dialog');
    deck.setAttribute('aria-modal','true');
    deck.focus();
  }else{
    deck.removeAttribute('role');
    deck.removeAttribute('aria-modal');
    if(focusBeforeDeck&&typeof focusBeforeDeck.focus==='function')focusBeforeDeck.focus();
    focusBeforeDeck=null;
  }
}
if(modeButton&&deck)modeButton.addEventListener('click',()=>setPresentation(!deck.classList.contains('is-fullscreen')));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
    closeMenu();
    if(deck&&deck.classList.contains('is-fullscreen'))setPresentation(false);
    return;
  }
  if(!slides.length||event.altKey||event.ctrlKey||event.metaKey)return;
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  const fullscreen=deck&&deck.classList.contains('is-fullscreen');
  const focused=deck&&deck.contains(document.activeElement);
  if(!fullscreen&&!focused)return;
  if(event.key==='ArrowRight'){event.preventDefault();showSlide(index+1)}
  if(event.key==='ArrowLeft'){event.preventDefault();showSlide(index-1)}
});
showSlide(0);
