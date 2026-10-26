(function(){
  var b=document.body, prev=b.dataset.prev, next=b.dataset.next, busy=false;
  function go(url){
    if(!url||busy) return;
    busy=true;
    var root=document.documentElement;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){location.href=url;return;}
    root.classList.add('leaving');
    setTimeout(function(){location.href=url;},230);
  }
  window.addEventListener('pageshow',function(){busy=false;document.documentElement.classList.remove('leaving');});
  document.querySelectorAll('.nav a').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault(); e.stopPropagation();
      go(a.classList.contains('next')?next:prev);
    });
  });
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0) return;
    if(e.target.closest('a,button,input,select,textarea')) return;
    var sel=window.getSelection&&String(window.getSelection());
    if(sel) return;
    go(next);
  });
  document.addEventListener('keydown',function(e){
    if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey) return;
    var t=e.target, onCtl=t&&t.closest&&t.closest('a,button,input,select,textarea');
    if(e.key==='ArrowRight'){e.preventDefault();go(next);}
    else if(e.key==='ArrowLeft'){e.preventDefault();go(prev);}
    else if(e.key===' '||e.code==='Space'){
      if(onCtl) return;            /* let a focused button handle its own activation */
      e.preventDefault();go(next);
    }
  });
})();
