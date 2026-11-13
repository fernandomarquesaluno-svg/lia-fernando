const toggle=document.querySelector('.mobile-toggle'),nav=document.querySelector('.nav');
if(toggle&&nav){
  toggle.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));nav.classList.toggle('open',!expanded);});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));
}
const reveal=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.09});
  reveal.forEach(el=>observer.observe(el))
}else reveal.forEach(el=>el.classList.add('visible'));
const progress=document.querySelector('.progress');
function updateProgress(){if(progress){const range=document.documentElement.scrollHeight-innerHeight;progress.style.width=(range>0?scrollY/range*100:0)+'%'}}
window.addEventListener('scroll',updateProgress,{passive:true});updateProgress();
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
 const filter=btn.dataset.filter;
 document.querySelectorAll('[data-filter]').forEach(other=>other.classList.toggle('active',other===btn));
 document.querySelectorAll('.event').forEach(entry=>entry.hidden=filter!=='todos'&&entry.dataset.type!==filter);
}));
const slides=[...document.querySelectorAll('.slide')];let index=0;const status=document.querySelector('#slide-status');
function showSlide(next){
 if(!slides.length)return;
 index=(next+slides.length)%slides.length;
 slides.forEach((slide,i)=>slide.classList.toggle('active',i===index));
 if(status)status.textContent=(index+1)+' / '+slides.length;
}
document.querySelectorAll('[data-slide-dir]').forEach(btn=>btn.addEventListener('click',()=>showSlide(index+Number(btn.dataset.slideDir))));
document.addEventListener('keydown',e=>{
 if(!slides.length||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
 if(e.key==='ArrowRight')showSlide(index+1);if(e.key==='ArrowLeft')showSlide(index-1);
});
showSlide(0);
