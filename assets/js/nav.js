(function(){
  var b=document.body, prev=b.dataset.prev, next=b.dataset.next, busy=false;
  var EASE='cubic-bezier(.2,.8,.2,1)', reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pending=[], counters=[], raf=0;
  function skip(){
    var had=pending.length>0;
    pending.splice(0).forEach(function(a){try{a.finish();}catch(e){}});
    counters.splice(0).forEach(function(c){c.set(1);});
    if(raf){cancelAnimationFrame(raf);raf=0;}
    return had;
  }
  function anim(el,kf,o){
    if(!el.animate) return null;
    o.easing=EASE; o.fill=o.fill||'backwards';
    var a=el.animate(kf,o); pending.push(a);
    var rm=function(){var i=pending.indexOf(a);if(i>-1)pending.splice(i,1);};
    a.onfinish=rm; a.oncancel=rm;
    return a;
  }
  function frame(){
    raf=0;
    counters.forEach(function(c){
      var d=c.drv, p=d.playState==='finished'?1:((d.effect.getComputedTiming().progress)||0);
      c.set(p);
    });
    if(pending.length) raf=requestAnimationFrame(frame); else counters.splice(0);
  }
  /* turn the first number in el's text into a fixed-width counter that eases 0 -> final */
  function counter(span,drv){
    var m=/^([^\d]*)([\d,]+)([\s\S]*)$/.exec(span.textContent);
    if(!m||!drv) return;
    var fin=m[2], target=parseInt(fin.replace(/,/g,''),10), n=document.createElement('span');
    n.className='num'; n.setAttribute('data-final',fin); n.textContent=fin;
    span.textContent=m[1]; span.appendChild(n); span.appendChild(document.createTextNode(m[3]));
    var c={drv:drv,set:function(p){n.textContent=p>=1?fin:Math.round(target*p).toLocaleString('en-IN');}};
    c.set(0); counters.push(c);
  }
  function startCounters(){ if(counters.length&&!raf) raf=requestAnimationFrame(frame); }
  function q(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  function fade(el,delay,dur,rise){
    return anim(el,[{opacity:0,transform:'translateY('+(rise||0)+'px)'},{opacity:1,transform:'none'}],{duration:dur,delay:delay});
  }
  function init(){
    if(reduce) return;
    var cls=document.body.className, D=100;
    if(cls==='s02'){
      var words=[];
      q('.stmt span').forEach(function(sp){
        var parts=sp.textContent.split(/(\s+)/); sp.textContent='';
        parts.forEach(function(t){
          if(!t) return;
          if(/^\s+$/.test(t)){sp.appendChild(document.createTextNode(t));return;}
          var w=document.createElement('span'); w.className='w'; w.textContent=t; sp.appendChild(w); words.push(w);
        });
      });
      words.forEach(function(w,i){fade(w,D+i*90,600,8);});
    } else if(cls==='s03'){
      q('.row3,.bc').forEach(function(el,i){fade(el,D+i*100,350);});
      var res=document.querySelector('.res'), t0=D+500;
      fade(res,t0,250);
      counter(res.querySelector('span'),anim(res,[],{duration:800,delay:t0,fill:'both'}));
      startCounters();
    } else if(cls==='s07'){
      var rows=q('.row'), order=[1,2,3,4,0];   /* Palantir (row 0) lands last */
      order.forEach(function(r,i){
        var row=rows[r], st=D+i*110;
        anim(row.querySelector('.bar'),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:450,delay:st});
        fade(row.querySelector('.rval'),st+450,300);
      });
    } else if(cls==='s12'){
      var bar=document.querySelector('.track b');
      var drv=anim(bar,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:1200,delay:D});
      bar.style.transformOrigin='left center';
      q('.sv span').forEach(function(sp){counter(sp,drv);});
      startCounters();
    }
  }
  function fullscreen(){
    try{
      var r;
      if(document.fullscreenElement) r=document.exitFullscreen&&document.exitFullscreen();
      else r=document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();
      if(r&&r.catch) r.catch(function(){});
    }catch(e){}
  }
  init();
  function go(url,fromNext){
    if(fromNext&&skip()) return;
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
      var nx=a.classList.contains('next'); go(nx?next:prev,nx);
    });
  });
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0) return;
    if(e.target.closest('a,button,input,select,textarea')) return;
    var sel=window.getSelection&&String(window.getSelection());
    if(sel) return;
    go(next,true);
  });
  document.addEventListener('keydown',function(e){
    if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey) return;
    var t=e.target, onCtl=t&&t.closest&&t.closest('a,button,input,select,textarea');
    if(e.key==='ArrowRight'){e.preventDefault();go(next,true);}
    else if(e.key==='ArrowLeft'){e.preventDefault();go(prev);}
    else if(e.key===' '||e.code==='Space'){
      if(onCtl) return;            /* let a focused button handle its own activation */
      e.preventDefault();go(next,true);
    }
    else if((e.key==='f'||e.key==='F')&&!(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))){e.preventDefault();fullscreen();}
  });
})();
