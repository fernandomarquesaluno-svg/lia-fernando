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
