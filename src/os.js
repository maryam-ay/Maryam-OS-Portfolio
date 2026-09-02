(function(){
  "use strict";
  var desktop=document.getElementById('desktop');
  var tasks=document.getElementById('tasks');
  var startBtn=document.getElementById('startbtn');
  var startMenu=document.getElementById('startmenu');
  var themeBtn=document.getElementById('themebtn');
  var soundBtn=document.getElementById('soundbtn');
  var mobileAppNav=document.getElementById('mobile-app-nav');
  var mobileMoreSheet=document.getElementById('mobile-more-sheet');
  var mobileNavScrim=document.getElementById('mobile-nav-scrim');
  var z=20, openOrder=[], mobileHistory=[], mobileBackNavigating=false, mobileWorkKind='live';

  function applyTheme(dark){
    document.body.classList.toggle('dark',dark);
    themeBtn.innerHTML='<i class="ti ti-'+(dark?'sun':'moon')+'" aria-hidden="true"></i>';
    themeBtn.title=dark?'light mode':'dark mode';
  }
  var savedTheme=null;
  try{savedTheme=localStorage.getItem('maryam-os-theme');}catch(_){}
  applyTheme(savedTheme==='dark');

  var SoundSystem = (function() {
    var audioCtx = null;
    var isMuted = false;

    try {
      isMuted = localStorage.getItem('maryam-os-muted') === 'true';
    } catch(_) {}

    function init() {
      if (!audioCtx) {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
    }

    function playClick() {
      if (isMuted) return;
      init();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      var t = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1000, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    }

    function playOpen() {
      if (isMuted) return;
      init();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      var t = audioCtx.currentTime;
      var notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      var durations = [0.06, 0.06, 0.12];
      var startTimes = [0, 0.05, 0.10];

      notes.forEach(function(freq, i) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + startTimes[i]);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.15, t + startTimes[i] + durations[i]);

        gain.gain.setValueAtTime(0.06, t + startTimes[i]);
        gain.gain.exponentialRampToValueAtTime(0.001, t + startTimes[i] + durations[i]);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(t + startTimes[i]);
        osc.stop(t + startTimes[i] + durations[i]);
      });
    }

    function playWinOpen() {
      if (isMuted) return;
      init();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      var t = audioCtx.currentTime;
      var notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
      var durations = [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.15];
      var startTimes = [0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18];

      notes.forEach(function(freq, i) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();

        osc.type = (i === notes.length - 1) ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t + startTimes[i]);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + startTimes[i] + durations[i]);

        var volume = (i === notes.length - 1) ? 0.06 : 0.04;
        gain.gain.setValueAtTime(volume, t + startTimes[i]);
        gain.gain.exponentialRampToValueAtTime(0.001, t + startTimes[i] + durations[i]);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(t + startTimes[i]);
        osc.stop(t + startTimes[i] + durations[i]);
      });
    }

    function setMute(muted) {
      isMuted = muted;
      try {
        localStorage.setItem('maryam-os-muted', muted ? 'true' : 'false');
      } catch(_) {}
      updateUI();
    }

    function getMute() {
      return isMuted;
    }

    function updateUI() {
      if (!soundBtn) return;
      if (isMuted) {
        soundBtn.innerHTML = '<i class="ti ti-volume-off" aria-hidden="true"></i>';
        soundBtn.title = 'sound is muted';
        soundBtn.ariaLabel = 'Unmute sound';
      } else {
        soundBtn.innerHTML = '<i class="ti ti-volume" aria-hidden="true"></i>';
        soundBtn.title = 'sound is on';
        soundBtn.ariaLabel = 'Mute sound';
      }
    }

    return {
      playClick: playClick,
      playOpen: playOpen,
      playWinOpen: playWinOpen,
      setMute: setMute,
      getMute: getMute,
      updateUI: updateUI
    };
  })();

  SoundSystem.updateUI();

  function reducedMotion(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches);}
  function anchorCenter(el){
    var fb={x:window.innerWidth/2,y:window.innerHeight-30};
    if(!el)return fb;
    var t=el;
    if(el.classList&&(el.classList.contains('pdi')||el.classList.contains('taskbtn')||el.classList.contains('pt'))){
      var g=el.querySelector('svg,i,.ti');if(g)t=g;
    }
    var r=t.getBoundingClientRect();
    if(r.width<1&&r.height<1)return fb;
    return {x:r.left+r.width/2,y:r.top+r.height/2};
  }
  function fadeIn(win){
    // The class is what holds the window at opacity 0 for the length of the
    // animation, and 'animationend' is what takes it off again. If that event
    // never arrives — a background tab, a throttled frame loop, reduced-motion
    // quirks — the window stays invisible. Clear it on a timer as well; both
    // paths are idempotent.
    var cleared=false;
    function clear(){
      if(cleared)return;cleared=true;
      win.classList.remove('gfade');
      win.removeEventListener('animationend',onEnd);
    }
    function onEnd(){clear();}
    win.classList.add('gfade');
    win.addEventListener('animationend',onEnd);
    setTimeout(clear,400);
  }

  var Genie=(function(){
    var canvas,gl,prog,vbo,ibo,aUV,u={},idxCount=0,dpr=1,glOK=false,inited=false;
    var texCache={}, pendingWarm={}, current=null, res={w:0,h:0}, lastC2F=null;
    var STATIC_IDS=['welcome','work','builds','about','xp','contact','app-empty-state','app-png-to-svg','app-ng-logos'];
    function idle(fn){
      // A hover gives roughly 200-300ms of warning before the click lands, and a
      // capture is about 60ms, so the deadline has to sit inside that window.
      // At 800ms the work frequently had not started when the click arrived and
      // the open fell back to a fade.
      if(window.requestIdleCallback)requestIdleCallback(fn,{timeout:250});
      else setTimeout(fn,1);
    }
    var VS=[
      'attribute vec2 a_uv;','uniform vec4 R;','uniform vec2 I;','uniform vec2 res;','uniform vec2 perp;','uniform float P;','uniform float nearV;','uniform float bendK;','uniform vec2 off;','uniform float spring;','varying vec2 v_uv; varying float v_lp;',
      'void main(){','  v_uv=a_uv;','  vec2 rest=R.xy + a_uv*R.zw;','  float flow=abs(a_uv.y-nearV);','  float lead=flow;','  float S=0.65;','  float lin=clamp(P*(1.0+S)-(1.0-lead)*S,0.0,1.0);','  v_lp=lin;','  float bb=lin-1.0;','  float back=1.0+1.5*bb*bb*bb+0.5*bb*bb;','  float lp=mix(lin,back,spring);','  vec2 A=rest;','  vec2 B=I;','  vec2 mid=mix(A,B,0.5);','  float d=length(B-A);','  vec2 C=mid+perp*d*bendK;','  float t=lp, mt=1.0-t;','  vec2 pos=mt*mt*B + 2.0*mt*t*C + t*t*A;','  pos+=off;','  vec2 clip=(pos/res)*2.0-1.0; clip.y=-clip.y;','  gl_Position=vec4(clip,0.0,1.0);','}'
    ].join('\n');
    var FS=[
      'precision mediump float;','uniform sampler2D tex;','uniform vec4 sc;','uniform float sp;','uniform float gA;','varying vec2 v_uv; varying float v_lp;',
      'void main(){','  vec4 c=texture2D(tex,v_uv);','  vec4 shadow=vec4(sc.rgb*sc.a,sc.a)*c.a;','  vec4 col=mix(c,shadow,sp);','  float a=smoothstep(0.0,0.12,v_lp);','  gl_FragColor=col*a*gA;','}'
    ].join('\n');
    function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
    function ensure(){
      if(inited)return glOK;inited=true;
      try{
        canvas=document.createElement('canvas');canvas.id='genie-cv';canvas.setAttribute('aria-hidden','true');
        document.body.appendChild(canvas);
        gl=canvas.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:true})||canvas.getContext('experimental-webgl');
        if(!gl)return (glOK=false);
        var vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);
        prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
        if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return (glOK=false);
        aUV=gl.getAttribLocation(prog,'a_uv');
        ['R','I','res','perp','P','nearV','bendK','tex','off','sc','sp','spring','gA'].forEach(function(n){u[n]=gl.getUniformLocation(prog,n);});
        var COLS=30,ROWS=30,verts=[],idx=[],i,j;
        for(j=0;j<=ROWS;j++)for(i=0;i<=COLS;i++)verts.push(i/COLS,j/ROWS);
        for(j=0;j<ROWS;j++)for(i=0;i<COLS;i++){var a=j*(COLS+1)+i,b=a+1,cc=a+COLS+1,dd=cc+1;idx.push(a,cc,b,b,cc,dd);}
        idxCount=idx.length;
        vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);
        ibo=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx),gl.STATIC_DRAW);
        dpr=Math.min(window.devicePixelRatio||1,2);glOK=true;
      }catch(e){glOK=false;}
      return glOK;
    }
    var reduced=reducedMotion;
    var html2canvasPromise=null;
    function ensureHtml2Canvas(cb){
      if(typeof html2canvas!=='undefined'){cb(true);return;}
      if(!html2canvasPromise){
        html2canvasPromise=new Promise(function(resolve){
          var existing=document.getElementById('html2canvas-lib');
          if(existing){
            existing.addEventListener('load',function(){resolve(typeof html2canvas!=='undefined');},{once:true});
            existing.addEventListener('error',function(){resolve(false);},{once:true});
            return;
          }
          var script=document.createElement('script');
          script.id='html2canvas-lib';
          script.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.async=true;
          script.onload=function(){resolve(typeof html2canvas!=='undefined');};
          script.onerror=function(){resolve(false);};
          document.head.appendChild(script);
        });
      }
      html2canvasPromise.then(cb);
    }
    function preload(){
      if(!glOK||reduced())return;
      idle(function(){ensureHtml2Canvas(function(){});});
    }
    function canGenie(){return !reduced() && glOK;}
    // A stale texture is a screenshot of how the window used to look. Playing it
    // is what makes the genie 'glitch': the frame that flies in is not the frame
    // that lands. Staleness therefore counts as not ready.
    function ready(id){var t=texCache[id];return canGenie() && !!t && !t._stale;}
    function easeInCubic(x){return x*x*x;}
    function uploadTex(src){
      var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      return t;
    }
    // color-mix() computes to color(srgb r g b / a), which html2canvas 1.4.1 does
    // not understand: it stalls on the value and the capture resolves to nothing,
    // so the window silently loses its genie. Any rule can use color-mix, so
    // rather than banning it, the clone gets equivalent rgba() overrides.
    var COLOR_FN_PROPS=['background-image','background-color','border-top-color',
      'border-right-color','border-bottom-color','border-left-color','box-shadow',
      'color','outline-color','text-decoration-color','fill','stroke'];
    function srgbToRgba(v){
      return v.replace(/color\(srgb\s+([^)]*)\)/g,function(m,inner){
        var parts=inner.split('/');
        var rgb=parts[0].trim().split(/\s+/).map(parseFloat);
        var a=parts.length>1?parseFloat(parts[1]):1;
        function c(x){return Math.max(0,Math.min(255,Math.round((isNaN(x)?0:x)*255)));}
        return 'rgba('+c(rgb[0])+','+c(rgb[1])+','+c(rgb[2])+','+(isNaN(a)?1:a)+')';
      });
    }
    // Applied to the live nodes rather than the clone: html2canvas re-parents
    // pseudo-elements while cloning, so the two trees cannot be paired by index.
    // The substituted colours are the same pixels, so nothing flickers, and the
    // overrides come straight back off in deColorRevert.
    function deColorApply(root){
      var undo=[];
      try{
        var els=[root].concat(Array.prototype.slice.call(root.querySelectorAll('*')));
        for(var i=0;i<els.length;i++){
          var e=els[i],cs=getComputedStyle(e);
          for(var j=0;j<COLOR_FN_PROPS.length;j++){
            var p=COLOR_FN_PROPS[j],v=cs.getPropertyValue(p);
            if(v&&v.indexOf('color(')>-1){
              undo.push([e,p,e.style.getPropertyValue(p),e.style.getPropertyPriority(p)]);
              e.style.setProperty(p,srgbToRgba(v),'important');
            }
          }
        }
      }catch(err){}
      return undo;
    }
    function deColorRevert(undo){
      if(!undo)return;
      for(var i=0;i<undo.length;i++){
        var u=undo[i];
        if(u[2])u[0].style.setProperty(u[1],u[2],u[3]);
        else u[0].style.removeProperty(u[1]);
      }
    }
    function capture(win,cb){
      if(typeof html2canvas==='undefined'){
        ensureHtml2Canvas(function(ok){if(ok)capture(win,cb);else cb(null);});
        return;
      }
      function go(){
        var forced=false,forcedMax=false;
        if(!win.classList.contains('open')){
          win.style.display='flex';win.style.visibility='hidden';forced=true;
          // A closed window that fills the screen on open must be captured in that
          // maximized layout, otherwise the genie plays a texture of the smaller
          // window and the frame it lands on jumps. Capturing it here, while idle,
          // is also what keeps the click itself instant.
          if(window.innerWidth>767 && !NO_AUTO_MAX[win.id] && !win.classList.contains('maxed')){
            win.classList.add('maxed');forcedMax=true;
          }
        }
        var colorUndo=deColorApply(win);
        function cleanup(){
          deColorRevert(colorUndo);colorUndo=null;
          // The window can be opened by the user while this capture is still
          // running. It owns 'maxed' from that point on, so only take back the
          // class if the window is still closed and the state is still ours.
          if(forcedMax&&!win.classList.contains('open'))win.classList.remove('maxed');
          // Always cleared, even if the window was opened mid-capture: these are
          // scaffolding for the screenshot, and leaving visibility:hidden behind
          // strands the window open but invisible. Only 'maxed' above is state
          // the window can legitimately own once it is open.
          if(forced){win.style.display='';win.style.visibility='';}
        }
        var sbs=Array.prototype.map.call(win.querySelectorAll('.wbody'),function(b){
          return {sh:b.scrollHeight,ch:b.clientHeight,st:b.scrollTop,pr:parseFloat(getComputedStyle(b).paddingRight)||0,scroll:b.scrollHeight>b.clientHeight+1};
        });
        var btnC=(getComputedStyle(win).getPropertyValue('--btn')||'').trim()||'#f7dde4';
        var roseC=(getComputedStyle(win).getPropertyValue('--rose')||'').trim()||'#c44d72';
        try{
          // The texture is only ever shown mid-warp for about half a second, so a
          // full-DPR raster is wasted work — at 2x a maximized window is a
          // 2880x1800 canvas, which is most of what made the first open slow.
          html2canvas(win,{backgroundColor:null,scale:Math.min(dpr,1.25),logging:false,onclone:function(doc){
            var el=doc.getElementById(win.id);if(!el)return;
            el.classList.remove('genie-prep','inactive');
            el.style.display='flex';el.style.visibility='visible';el.style.opacity='1';el.style.animation='none';el.style.boxShadow='none';
            Array.prototype.forEach.call(el.querySelectorAll('.wbody'),function(b,i){
              var m=sbs[i];if(!m||!m.scroll)return;
              b.style.overflow='hidden';b.style.position='relative';b.style.paddingRight=(m.pr+13)+'px';
              if(m.st>0&&b.firstElementChild)b.firstElementChild.style.marginTop=(-m.st)+'px';
              var tr=doc.createElement('div');
              tr.style.cssText='position:absolute;top:0;right:0;width:13px;height:'+m.ch+'px;background:'+btnC;
              var th=doc.createElement('div');
              th.style.cssText='position:absolute;left:0;top:'+(m.ch*m.st/m.sh)+'px;width:13px;height:'+Math.max(20,m.ch*m.ch/m.sh)+'px;box-sizing:border-box;background:'+roseC+';border:3px solid '+btnC+';border-radius:8px';
              tr.appendChild(th);b.appendChild(tr);
            });
          }}).then(function(cv){cleanup();cb(cv);}).catch(function(){cleanup();cb(null);});
        }catch(e){cleanup();cb(null);}
      }
      try{if(document.fonts&&document.fonts.ready){document.fonts.ready.then(go,go);}else go();}catch(e){go();}
    }
    function warm(win){
      if(!glOK||reduced())return;
      var el=(typeof win==='string')?document.getElementById(win):win;if(!el)return;var id=el.id;
      if(pendingWarm[id])return;
      var hasTex = !!texCache[id];
      var isStale = hasTex && texCache[id]._stale;
      if(hasTex && !isStale)return;
      pendingWarm[id]=true;
      idle(function(){
        capture(el,function(cv){
          pendingWarm[id]=false;
          if(cv&&glOK){
            var oldTex = texCache[id];
            var newTex = uploadTex(cv);
            newTex._stale = false;
            texCache[id] = newTex;
            if(oldTex){try{gl.deleteTexture(oldTex);}catch(e){}}
          }
        });
      });
    }
    function prepare(win,done){
      if(!glOK||reduced()){if(done)done(false);return;}
      var el=(typeof win==='string')?document.getElementById(win):win;
      if(!el){if(done)done(false);return;}
      var id=el.id;
      capture(el,function(cv){
        if(cv&&glOK){
          var oldTex=texCache[id];
          var newTex=uploadTex(cv);
          newTex._stale=false;
          texCache[id]=newTex;
          if(oldTex){try{gl.deleteTexture(oldTex);}catch(e){}}
          if(done)done(true);
          return;
        }
        if(done)done(false);
      });
    }
    function invalidate(id){if(texCache[id]){texCache[id]._stale=true;}}
    function invalidateAll(){Object.keys(texCache).forEach(invalidate);}
    function warmAll(){if(!glOK||reduced())return;STATIC_IDS.forEach(function(id){warm(id);});}
    function warmOpen(){
      if(!glOK||reduced())return;
      Array.prototype.forEach.call(document.querySelectorAll('.window.open:not(.min)'),function(win){warm(win);});
    }
    function init(){ensure();}
    function sizeCanvas(){
      dpr=Math.min(window.devicePixelRatio||1,2);res.w=window.innerWidth;res.h=window.innerHeight;
      canvas.width=Math.floor(res.w*dpr);canvas.height=Math.floor(res.h*dpr);
      canvas.style.width=res.w+'px';canvas.style.height=res.h+'px';
    }
    function parseShadow(win){
      try{
        var s=getComputedStyle(win).boxShadow;if(!s||s==='none')return null;
        var m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;
        var p=m[1].split(',').map(parseFloat);
        var px=s.replace(m[0],'').match(/-?[\d.]+(?=px)/g)||[];
        return {r:p[0]/255,g:p[1]/255,b:p[2]/255,a:p.length>3?p[3]:1,x:parseFloat(px[0])||0,y:parseFloat(px[1])||0};
      }catch(e){return null;}
    }
    function bindOnce(){
      gl.useProgram(prog);gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.enableVertexAttribArray(aUV);
      gl.vertexAttribPointer(aUV,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
      gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
      gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(u.res,res.w,res.h);
      gl.uniform1f(u.bendK,0.22);gl.uniform1i(u.tex,0);
    }
    function drawFrame(tex,R,ic,perp,nearV,P,sh,alpha){
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u.gA,alpha==null?1.0:alpha);gl.uniform4f(u.R,R[0],R[1],R[2],R[3]);
      gl.uniform2f(u.I,ic.x,ic.y);gl.uniform2f(u.perp,perp[0],perp[1]);gl.uniform1f(u.P,P);gl.uniform1f(u.nearV,nearV);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
      if(sh){
        gl.uniform2f(u.off,sh.x,sh.y);gl.uniform4f(u.sc,sh.r,sh.g,sh.b,sh.a);gl.uniform1f(u.sp,1.0);
        gl.drawElements(gl.TRIANGLES,idxCount,gl.UNSIGNED_SHORT,0);
      }
      gl.uniform2f(u.off,0,0);gl.uniform1f(u.sp,0.0);
      gl.drawElements(gl.TRIANGLES,idxCount,gl.UNSIGNED_SHORT,0);
    }
    function finalizeCurrent(){if(current&&current.finish)current.finish();}
    function play(win,ic,dir,done,clickTs){
      // warm() no-ops when the texture is already fresh, so this also covers the
      // stale case that ready() now rejects.
      if(!ready(win.id)||!ic){warm(win);if(done)done();return false;}
      finalizeCurrent();
      var rect=win.getBoundingClientRect();
      if(rect.width<2||rect.height<2){if(done)done();return false;}
      if(dir==='in')win.classList.add('genie-prep');else win.style.pointerEvents='none';
      var sh=parseShadow(win);var tex=texCache[win.id];
      var R=[rect.left,rect.top,rect.width,rect.height];
      var cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
      var nearV=(Math.abs(ic.y-rect.top)<=Math.abs(ic.y-(rect.top+rect.height)))?0.0:1.0;
      var ax=cx-ic.x, ay=cy-ic.y, al=Math.sqrt(ax*ax+ay*ay)||1.0; ax/=al; ay/=al;
      var perp=[-ay,ax];
      sizeCanvas();canvas.classList.add('on');bindOnce();
      gl.uniform1f(u.spring,dir==='in'?1.0:0.0);
      // genie-prep keeps the real window at opacity 0 for the whole of dur, so this
      // number is exactly how long the click feels dead before anything appears.
      // 500ms was long enough to read as lag; 340ms still reads as a genie.
      var t0=performance.now(),dur=340,FADE=34,total=dur+FADE,self={},first=true;
      function step(now){
        if(first){first=false;if(clickTs!=null)lastC2F=now-clickTs;}
        var t=now-t0;
        if(dir==='in'){
          if(t<dur){drawFrame(tex,R,ic,perp,nearV,t/dur,sh,1.0);}
          else if(t<total){
            if(!self.fading){self.fading=true;win.classList.remove('genie-prep');}
            var f=Math.min((t-dur)/FADE,1);drawFrame(tex,R,ic,perp,nearV,1.0,null,1.0-f);
          }else{self.finish();return;}
        }else{
          if(t<FADE){var f0=Math.min(t/FADE,1);drawFrame(tex,R,ic,perp,nearV,1.0,null,f0);}
          else if(t<total){
            if(!self.flying){self.flying=true;win.classList.add('genie-prep');}
            drawFrame(tex,R,ic,perp,nearV,1.0-easeInCubic((t-FADE)/dur),sh,1.0);
          }else{self.finish();return;}
        }
        self.raf=requestAnimationFrame(step);
      }
      self.done2=false;
      self.finish=function(){
        if(self.done2)return;self.done2=true;
        if(self.guard){clearTimeout(self.guard);self.guard=null;}
        if(self.raf)cancelAnimationFrame(self.raf);
        if(done)done();win.style.pointerEvents='';
        gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);canvas.classList.remove('on');
        if(current===self)current=null;
      };
      // Wall-clock failsafe. Everything above is driven by requestAnimationFrame,
      // which stops in a background tab and can be throttled anywhere. Without
      // this, finish() never runs and the window is left invisible for good.
      self.guard=setTimeout(function(){self.finish();},total+400);
      current=self;self.raf=requestAnimationFrame(step);return true;
    }
    return {init:init, preload:preload, canGenie:canGenie, ready:ready, play:play, warm:warm, prepare:prepare, warmAll:warmAll, warmOpen:warmOpen, invalidate:invalidate, invalidateAll:invalidateAll, clickToFrame:function(){return lastC2F;}};
  })();
  // The welcome ResizeObserver reaches for window.Genie, so publish the module.
  window.Genie=Genie;

  // Shown in the strip under the preview. Values here are the ones already
  // stated elsewhere in the file (meta lines, tags, store links, and the
  // metadata blocks in caseStudies). Anything not recorded anywhere is left as
  // null and renders as a placeholder to be filled in rather than guessed.
  var PROJECT_SPECS = {
    "Vesti Mobile":        { role: "product designer",   timeline: "2022—2026",                    team: null,                        platform: "iOS, Android" },
    "WGC App":             { role: "pioneer designer",   timeline: "2021—2022",                    team: null,                        platform: "iOS, Android" },
    "VaxTrack Live":       { role: "product design",     timeline: null,                           team: null,                        platform: "web" },
    "Compass":             { role: "product designer",   timeline: "independent concept · ongoing", team: "solo product design",      platform: "mobile app, iOS" },
    "Baby Steps":          { role: "solo ux/ui designer", timeline: "2 weeks",                    team: "solo",                      platform: "mobile app" },
    "VaxTrack Case Study": { role: "product design",     timeline: null,                           team: null,                        platform: "web" },
    "Vesti AI":            { role: "product designer",   timeline: null,                           team: null,                        platform: null }
  };
  var SPEC_ORDER = [
    { key: "role",     label: "role" },
    { key: "timeline", label: "timeline" },
    { key: "team",     label: "team" },
    { key: "platform", label: "platform" }
  ];

  var PROJECT_DATA = {
    "Vesti Mobile": {
      title: "Vesti Mobile",
      kind: "live",
      tag: "mobile app · live",
      desc: "the mobile home for Vesti's migration and financial services, helping people manage wallets, payments and the practical steps involved in moving abroad.",
      meta: "product designer · 2022—2026",
      outcome: "designed clearer mobile journeys across Vesti's wider fintech and migration suite.",
      img: "images/optimized/vesti-ai-1200.webp",
      imgSmall: "images/optimized/vesti-ai-640.webp",
      actions: [
        { label: "play store ↗", url: "https://play.google.com/store/apps/details?id=com.vesti.app" }
      ]
    },
    "WGC App": {
      title: "WGC App",
      kind: "live",
      tag: "mobile app · live",
      desc: "short for white garment connect. a digital faith community for C&S and CCC members to connect, worship, share testimonies, discover churches and grow together.",
      meta: "pioneer designer · 2021—2022",
      outcome: "established the product's visual language and designed its core mobile experience.",
      img: "images/optimized/wgc-1200.webp",
      imgSmall: "images/optimized/wgc-640.webp",
      actions: [
        { label: "app store ↗", url: "https://apps.apple.com/ng/app/white-garment-connect/id6755446588" },
        { label: "play store ↗", url: "https://play.google.com/store/apps/details?id=com.wgc.white_garment_church" }
      ]
    },
    "VaxTrack Live": {
      title: "VaxTrack",
      kind: "live",
      tag: "web platform · live",
      desc: "a national vaccine operations dashboard for monitoring facilities, delivery performance, stock levels and coverage across the health system.",
      meta: "product design · web platform",
      outcome: "made national vaccine operations easier to monitor and act on.",
      img: "images/optimized/vaxtrack-1200.webp",
      imgSmall: "images/optimized/vaxtrack-640.webp",
      actions: [
        { label: "visit live site ↗", url: "https://vaxtrack.org" },
        { label: "play store ↗", url: "https://play.google.com/store/apps/details?id=org.vaxtrack" }
      ]
    },
    "Compass": {
      title: "Compass",
      kind: "case",
      status: "coming-soon",
      tag: "case study · coming soon",
      desc: "a campus super-app for nigerian universities. wallet, fees, grades and exeat requests in one place, with the guardian designed in as a full user instead of an afterthought.",
      meta: "product design · case study",
      outcome: "connected student, guardian and school workflows in one coherent product.",
      img: "images/optimized/compass-1200.webp",
      imgSmall: "images/optimized/compass-640.webp",
      caseKey: "Compass"
    },
    "Baby Steps": {
      title: "Baby Steps",
      kind: "case",
      tag: "case study",
      desc: "a pregnancy companion for tracking and managing a pregnancy from conception to due date, with antenatal booking, an in-app pharmacy and virtual therapy built in.",
      meta: "solo ux/ui design · case study",
      outcome: "turned seven survey pain points into five features that keep pregnant women out of avoidable trips.",
      img: "images/optimized/baby-steps-1200.webp",
      imgSmall: "images/optimized/baby-steps-640.webp",
      caseKey: "Baby Steps"
    },
    "VaxTrack Case Study": {
      title: "VaxTrack",
      kind: "case",
      status: "coming-soon",
      tag: "case study · coming soon",
      desc: "the design story behind a national vaccine operations dashboard. the full process, decisions and outcomes will be documented here soon.",
      meta: "product design · case study",
      outcome: "case study currently being prepared.",
      img: "images/optimized/vaxtrack-1200.webp",
      imgSmall: "images/optimized/vaxtrack-640.webp"
    },
    "Vesti AI": {
      title: "Vesti AI",
      kind: "case",
      status: "coming-soon",
      tag: "case study · coming soon",
      desc: "an ai-powered migration and financial-services experience designed to make complex relocation pathways easier to understand and navigate.",
      meta: "product designer · 2022—2026",
      outcome: "case study currently being prepared.",
      img: "images/optimized/vesti-ai-1200.webp",
      imgSmall: "images/optimized/vesti-ai-640.webp"
    }
  };
  // Order matches the work rail: Baby Steps leads the case studies now that it
  // is the published one.
  var PROJECT_NAMES = ["Vesti Mobile", "WGC App", "VaxTrack Live", "Baby Steps", "Compass", "VaxTrack Case Study", "Vesti AI"];
  var selectedProjectName = "Vesti Mobile";

  function projectDisplayName(name) {
    var data = PROJECT_DATA[name];
    return data && data.title ? data.title : name;
  }

  function configureProjectActionSet(primary, secondary, data) {
    if (!primary || !data) return;

    primary.hidden = false;
    primary.disabled = false;
    secondary.hidden = true;
    secondary.disabled = false;

    if (data.status === "coming-soon") {
      primary.textContent = "case study coming soon";
      primary.disabled = true;
      return;
    }

    if (data.kind === "case") {
      primary.textContent = "read case study →";
      return;
    }

    var actions = data.actions || [];
    if (!actions.length) {
      primary.textContent = "link unavailable";
      primary.disabled = true;
      return;
    }

    primary.textContent = actions[0].label;
    if (actions[1] && secondary) {
      secondary.textContent = actions[1].label;
      secondary.hidden = false;
    }
  }

  function syncSelectedProjectActions() {
    var data = PROJECT_DATA[selectedProjectName];
    if (!data) return;
    configureProjectActionSet(
      document.getElementById("previewOpenBtn"),
      document.getElementById("previewSecondaryBtn"),
      data
    );
  }

  function launchProjectAction(name, actionIndex, sourceEl) {
    var data = PROJECT_DATA[name];
    if (!data || data.status === "coming-soon") return;

    if (data.kind === "case") {
      openProject(data.caseKey || projectDisplayName(name), sourceEl);
      return;
    }

    var action = (data.actions || [])[actionIndex || 0];
    if (!action || !action.url) return;
    var externalWindow = window.open(action.url, "_blank", "noopener,noreferrer");
    if (externalWindow) externalWindow.opener = null;
  }

  function selectProject(name, animate) {
    var data = PROJECT_DATA[name];
    if (!data) return;
    selectedProjectName = name;

    var entries = document.querySelectorAll('#work .rail-entry[data-project]');
    entries.forEach(function(el) {
      if (el.getAttribute('data-project') === name) {
        el.classList.add('selected');
        el.setAttribute('aria-current', 'true');
      } else {
        el.classList.remove('selected');
        el.removeAttribute('aria-current');
      }
    });

    var titleEl = document.getElementById('previewTitle');
    var tagEl = document.getElementById('previewTag');
    var descEl = document.getElementById('previewDesc');
    var metaEl = document.getElementById('previewMeta');
    var outcomeEl = document.getElementById('previewOutcome');
    var placeholderTitleEl = document.getElementById('previewPlaceholderTitle');
    var imgEl = document.getElementById('previewScreenshot');

    var displayName = projectDisplayName(name);
    if (titleEl) titleEl.textContent = displayName;
    if (tagEl) tagEl.textContent = data.tag;
    if (descEl) descEl.textContent = data.desc;
    if (metaEl) metaEl.textContent = data.meta || '';
    if (outcomeEl) outcomeEl.textContent = data.outcome || '';
    if (placeholderTitleEl) placeholderTitleEl.textContent = displayName;

    if (imgEl) {
      imgEl.src = data.img;
      imgEl.srcset = data.imgSmall ? data.imgSmall + ' 640w, ' + data.img + ' 1200w' : '';
      imgEl.sizes = '(max-width: 767px) calc(100vw - 40px), min(72vw, 920px)';
      imgEl.alt = displayName + ' project preview';
      imgEl.style.display = 'block';
      var placeholder = imgEl.nextElementSibling;
      if (placeholder) {
        placeholder.style.display = 'none';
      }
    }

    var specsEl = document.getElementById('previewSpecs');
    if (specsEl) {
      var specs = PROJECT_SPECS[name] || {};
      specsEl.innerHTML = SPEC_ORDER.map(function (s) {
        var v = specs[s.key];
        return '<div class="spec-cell">' +
                 '<span class="spec-label">' + s.label + '</span>' +
                 '<span class="spec-value' + (v ? '' : ' empty') + '">' +
                   (v ? escapeBuildText(v) : '—') +
                 '</span>' +
               '</div>';
      }).join('');
    }

    var container = document.getElementById('previewScreenshotContainer');
    if (container) {
      container.classList.remove('preview-animate');
      if (animate && !reducedMotion()) {
        void container.offsetWidth;
        container.classList.add('preview-animate');
      }
    }
    syncSelectedProjectActions();

    var workWin = document.getElementById('work');
    if (workWin && Genie.invalidate) {

    }
  }

  function sizeWorkWindow() {
    var workWin = document.getElementById('work');
    if (!workWin) return;

    var w = Math.min(1200, window.innerWidth - 520);
    w = Math.max(480, w);

    var maxH = window.innerHeight - 80;
    var h = Math.round(window.innerHeight * 0.85);
    if (h > maxH) h = maxH;
    h = Math.max(320, h);

    workWin.style.width = w + 'px';
    workWin.style.height = h + 'px';
    workWin.style.left = '130px';
    workWin.style.top = '40px';


  }

  function sizeBuildsWindow() {
    var buildsWin = document.getElementById('builds');
    if (!buildsWin) return;

    var w = Math.min(1200, window.innerWidth - 520);
    w = Math.max(480, w);

    var maxH = window.innerHeight - 80;
    var h = Math.round(window.innerHeight * 0.85);
    if (h > maxH) h = maxH;
    h = Math.max(320, h);

    buildsWin.style.width = w + 'px';
    buildsWin.style.height = h + 'px';
    buildsWin.style.left = '130px';
    buildsWin.style.top = '40px';


  }

  function sizeAboutWindow() {
    var aboutWin = document.getElementById('about');
    if (!aboutWin) return;

    var w = Math.min(1200, window.innerWidth - 520);
    w = Math.max(480, w);

    var maxH = window.innerHeight - 80;
    var h = Math.round(window.innerHeight * 0.85);
    if (h > maxH) h = maxH;
    h = Math.max(320, h);

    aboutWin.style.width = w + 'px';
    aboutWin.style.height = h + 'px';
    aboutWin.style.left = '130px';
    aboutWin.style.top = '40px';


  }

  function sizeXpWindow() {
    var xpWin = document.getElementById('xp');
    if (!xpWin) return;

    var w = Math.min(1200, window.innerWidth - 520);
    w = Math.max(480, w);

    var maxH = window.innerHeight - 80;
    var h = Math.round(window.innerHeight * 0.85);
    if (h > maxH) h = maxH;
    h = Math.max(320, h);

    xpWin.style.width = w + 'px';
    xpWin.style.height = h + 'px';
    xpWin.style.left = '130px';
    xpWin.style.top = '40px';


  }

  function windows(){return Array.prototype.slice.call(document.querySelectorAll('.window'));}

  // Windows that keep their authored size instead of launching full screen
  var NO_AUTO_MAX={welcome:true,contact:true};

  // --- taskbar auto-hide while a window is maximized ---
  var taskbarEl=document.getElementById('taskbar');
  var tbPeek=document.getElementById('tbpeek');
  var peekTimer=null;
  function tbShow(){clearTimeout(peekTimer);document.body.classList.add('tb-peek');}
  function tbHide(){
    clearTimeout(peekTimer);
    peekTimer=setTimeout(function(){document.body.classList.remove('tb-peek');},280);
  }
  if(tbPeek)tbPeek.addEventListener('mouseenter',tbShow);
  if(taskbarEl){
    taskbarEl.addEventListener('mouseenter',tbShow);
    taskbarEl.addEventListener('mouseleave',tbHide);
  }
  function syncMaxed(){
    var any=windows().some(function(w){
      return w.classList.contains('maxed')&&w.classList.contains('open')&&!w.classList.contains('min');
    });
    document.body.classList.toggle('has-maxed',any);
    if(!any){clearTimeout(peekTimer);document.body.classList.remove('tb-peek');}
  }
  function setActive(win){
    windows().forEach(function(w){w.classList.add('inactive');});
    if(win){win.classList.remove('inactive');win.style.zIndex=++z;}
    updateTasks();
    syncMobileNavigation(win);
  }
  function isPhoneOS(){ return window.matchMedia('(max-width:767px)').matches; }
  var mobileTypeFloorObserver=null,mobileTypeFloorQueued=false;
  function mobileTextCandidates(scope){
    var candidates=[],seen=new Set();
    function add(el){
      if(!el||seen.has(el)||/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SVG|PATH|I)$/.test(el.tagName)||el.closest('svg'))return;
      seen.add(el);candidates.push(el);
    }
    var walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
    var node;
    while((node=walker.nextNode())){
      if(node.nodeValue.trim())add(node.parentElement);
    }
    Array.prototype.forEach.call(scope.querySelectorAll('input,textarea,select,option'),add);
    if(scope.matches&&scope.matches('input,textarea,select,option'))add(scope);
    return candidates;
  }
  function applyMobileTypeFloor(root){
    var scope=root&&root.nodeType===1?root:desktop;
    var existing=scope.querySelectorAll('.mobile-type-floor');
    Array.prototype.forEach.call(existing,function(el){el.classList.remove('mobile-type-floor');});
    if(!isPhoneOS())return;
    var candidates=mobileTextCandidates(scope);
    var needsFloor=[];
    candidates.forEach(function(el){
      var size=parseFloat(getComputedStyle(el).fontSize);
      if(isFinite(size)&&size<12)needsFloor.push(el);
    });
    needsFloor.forEach(function(el){el.classList.add('mobile-type-floor');});
  }
  function queueMobileTypeFloor(){
    if(mobileTypeFloorQueued)return;
    mobileTypeFloorQueued=true;
    requestAnimationFrame(function(){
      mobileTypeFloorQueued=false;
      applyMobileTypeFloor(desktop);
    });
  }
  function initMobileTypeFloor(){
    applyMobileTypeFloor(desktop);
    if(typeof MutationObserver!=='undefined'&&!mobileTypeFloorObserver){
      mobileTypeFloorObserver=new MutationObserver(function(records){
        if(!isPhoneOS())return;
        var hasNewContent=records.some(function(record){return record.addedNodes&&record.addedNodes.length;});
        if(hasNewContent)queueMobileTypeFloor();
      });
      mobileTypeFloorObserver.observe(desktop,{childList:true,subtree:true});
    }
    window.addEventListener('resize',queueMobileTypeFloor,{passive:true});
  }
  function mobileDestination(win){
    if(!win)return 'home';
    if(win.id==='viewer')return 'work';
    if(win.id==='work'||win.id==='builds'||win.id==='about')return win.id;
    return 'more';
  }
  function syncMobileNavigation(win){
    if(!mobileAppNav)return;
    var destination=mobileDestination(win);
    mobileAppNav.querySelectorAll('.mobile-nav-item').forEach(function(btn){
      var key=btn.hasAttribute('data-mobile-home')?'home':
        (btn.hasAttribute('data-mobile-more')?'more':btn.getAttribute('data-mobile-open'));
      if(key===destination)btn.setAttribute('aria-current','page');
      else btn.removeAttribute('aria-current');
    });
  }
  function currentPhoneWindow(){
    return windows().find(function(win){
      return win.classList.contains('open') &&
        !win.classList.contains('min') &&
        !win.classList.contains('inactive');
    }) || null;
  }
  function closeMobileMore(){
    if(mobileMoreSheet){mobileMoreSheet.classList.remove('open');mobileMoreSheet.setAttribute('aria-hidden','true');}
    if(mobileNavScrim)mobileNavScrim.classList.remove('open');
    var moreBtn=mobileAppNav&&mobileAppNav.querySelector('[data-mobile-more]');
    if(moreBtn)moreBtn.setAttribute('aria-expanded','false');
    if(isPhoneOS())syncMobileNavigation(currentPhoneWindow());
  }
  function openMobileMore(){
    if(!mobileMoreSheet||!mobileNavScrim)return;
    mobileMoreSheet.classList.add('open');mobileMoreSheet.setAttribute('aria-hidden','false');
    mobileNavScrim.classList.add('open');
    var moreBtn=mobileAppNav&&mobileAppNav.querySelector('[data-mobile-more]');
    if(moreBtn)moreBtn.setAttribute('aria-expanded','true');
    syncMobileNavigation({id:'more'});
  }
  function showMobileHome(){
    if(!isPhoneOS())return;
    mobileHistory.length=0;
    windows().forEach(function(win){
      if(win.classList.contains('open'))win.classList.add('min','inactive');
    });
    closeMobileMore();
    updateTasks();
    syncMobileNavigation(null);
  }
  function playPhoneWindow(win, entering, done){
    if(reducedMotion() || !win.animate){ if(done)done(); return; }
    var frames=entering
      ? [{transform:'translateY(18px) scale(.985)',opacity:0},{transform:'translateY(0) scale(1)',opacity:1}]
      : [{transform:'translateY(0) scale(1)',opacity:1},{transform:'translateY(14px) scale(.99)',opacity:0}];
    var anim=win.animate(frames,{
      duration:entering?320:190,
      easing:entering?'cubic-bezier(.3,1.1,.35,1)':'cubic-bezier(.25,.8,.3,1)',
      fill:'both'
    });
    anim.finished.then(function(){ anim.cancel(); if(done)done(); }).catch(function(){ if(done)done(); });
  }
  function openMobileRoot(id,srcEl){
    mobileHistory=['home'];
    mobileBackNavigating=true;
    openWin(id,srcEl);
    mobileBackNavigating=false;
  }
  function goMobileBack(win,srcEl){
    if(!isPhoneOS()){minWin(win);return;}
    SoundSystem.playClick();
    var target=mobileHistory.length?mobileHistory.pop():(win.id==='viewer'?'work':'home');
    playPhoneWindow(win,false,function(){
      win.classList.add('min','inactive');
      win.classList.remove('genie-prep');
      updateTasks();syncMaxed();
      if(!target||target==='home'||!document.getElementById(target)){
        showMobileHome();
        return;
      }
      mobileBackNavigating=true;
      openWin(target,srcEl);
      mobileBackNavigating=false;
    });
  }
  function syncMobileChrome(){
    var phone=isPhoneOS();
    windows().forEach(function(win){
      var btn=win.querySelector('.mn');
      if(!btn)return;
      var icon=btn.querySelector('i');
      btn.setAttribute('aria-label',phone?'Back to previous screen':'Minimize');
      btn.title=phone?'Back':'';
      if(icon)icon.className=phone?'ti ti-chevron-left':'ti ti-minus';
    });
  }
  function openWin(id,srcEl,noAnim){
    var win=document.getElementById(id);if(!win)return;
    if(isPhoneOS())applyMobileTypeFloor(win);
    var wasOpen = win.classList.contains('open') && !win.classList.contains('min');
    var phoneCurrent=isPhoneOS()?currentPhoneWindow():null;

    if(isPhoneOS()&&!mobileBackNavigating&&(!phoneCurrent||phoneCurrent.id!==id)){
      var mobileOrigin=phoneCurrent?phoneCurrent.id:'home';
      if(mobileHistory[mobileHistory.length-1]!==mobileOrigin)mobileHistory.push(mobileOrigin);
    }

    // Experience used to run html2canvas on the click itself so the genie texture
    // matched its full-screen layout, which cost a visible pause before anything
    // moved. Genie.capture() now warms every auto-maximizing window in its
    // maximized state while the browser is idle, so the click can play at once.

    // On mobile, only one window is visible at a time. Minimize others.
    if (window.innerWidth <= 767) {
      windows().forEach(function(w) {
        if (w.id !== id && w.classList.contains('open') && !w.classList.contains('min')) {
          w.classList.add('min','inactive');
          w.classList.remove('genie-prep');
        }
      });
      updateTasks();
    }

    if (!wasOpen && !mobileBackNavigating) {
      var isDesktopOrMenu = srcEl && (srcEl.classList.contains('pdi') || (startMenu && startMenu.contains(srcEl)));
      if (isDesktopOrMenu) {
        SoundSystem.playWinOpen();
      } else {
        SoundSystem.playOpen();
      }
    }

    // Launching an app fills the screen. Restoring from the taskbar keeps
    // whatever size the window already had, so this only fires on a fresh
    // open. Mobile is left alone: its own rules already size windows, and
    // a maxed window there would cover a taskbar you cannot hover to reveal.
    // 'welcome' (hi there) stays at its authored size on purpose.
    if(!wasOpen && window.innerWidth > 767 && !NO_AUTO_MAX[id] && !win.classList.contains('maxed')){
      win.classList.add('maxed');
      var mxIcon=win.querySelector('.mx i');
      if(mxIcon)mxIcon.className='ti ti-squares';
      // No invalidate here: the warm pass already captured this maximized layout.
    }

    var clickTs=performance.now();win.classList.remove('min');
    if(openOrder.indexOf(id)===-1)openOrder.push(id);
    var origin=srcEl||document.querySelector('.pdi[data-open="'+id+'"]');
    if(origin)win._origin=origin;
    if(isPhoneOS()){
      win.classList.add('open');
      setActive(win);syncMaxed();
      if(noAnim){ return; }
      playPhoneWindow(win,true);
      return;
    }
    if(noAnim){
      win.classList.add('open');fadeIn(win);setActive(win);syncMaxed();return;
    }
    if(!Genie.ready(id)){
      // Never hold a window back for its screenshot. html2canvas over a
      // maximized window costs seconds, and laying the window out invisibly for
      // the whole of it is why a click looked like nothing had happened. Show it
      // straight away and warm the texture in the background instead: the genie
      // then plays on the next open, and because the desktop icons warm on
      // hover that is usually the first open the visitor actually sees.
      win.classList.add('open');fadeIn(win);setActive(win);syncMaxed();
      Genie.warm(win);
      return;
    }
    win.classList.add('open');setActive(win);syncMaxed();
    Genie.play(win,anchorCenter(origin),'in',function(){win.classList.remove('genie-prep');},clickTs);
  }
  function closeWin(win){
    SoundSystem.playClick();
    function finish(){
      win.classList.remove('open','min','genie-prep');
      openOrder=openOrder.filter(function(x){return x!==win.id;});
      var last=openOrder[openOrder.length-1];setActive(last?document.getElementById(last):null);
      syncMaxed();
    }
    if(!win.classList.contains('open')){finish();return;}
    if(isPhoneOS()){playPhoneWindow(win,false,finish);return;}
    if(!Genie.ready(win.id)){finish();Genie.warm(win);return;}
    var origin=document.querySelector('.pdi[data-open="'+win.id+'"]')||win._origin;
    Genie.play(win,anchorCenter(origin),'out',finish);
  }
  function minWin(win){
    SoundSystem.playClick();
    function finish(){win.classList.add('min','inactive');win.classList.remove('genie-prep');updateTasks();syncMaxed();}
    if(isPhoneOS()){playPhoneWindow(win,false,finish);return;}
    if(!Genie.ready(win.id)){finish();Genie.warm(win);return;}
    var btn=tasks.querySelector('[data-win="'+win.id+'"]');
    Genie.play(win,anchorCenter(btn||win._origin),'out',finish);
  }
  function restoreWin(win,fromEl){
    SoundSystem.playOpen();
    if (window.innerWidth <= 767) {
      windows().forEach(function(w) {
        if (w.id !== win.id && w.classList.contains('open') && !w.classList.contains('min')) {
          w.classList.add('min','inactive');
        }
      });
      updateTasks();
    }
    var c=anchorCenter(fromEl);win.classList.remove('min');syncMaxed();
    if(isPhoneOS()){setActive(win);playPhoneWindow(win,true);return;}
    if(!Genie.ready(win.id)){setActive(win);Genie.warm(win);return;}
    setActive(win);Genie.play(win,c,'in',function(){win.classList.remove('genie-prep');});
  }
  function maxWin(win){
    SoundSystem.playClick();
    if(win.classList.contains('maxed')){
      win.classList.remove('maxed');win.querySelector('.mx i').className='ti ti-square';
    }else{
      win.classList.add('maxed');win.querySelector('.mx i').className='ti ti-squares';
    }
    syncMaxed();
    setActive(win);Genie.invalidate(win.id);Genie.warm(win);
  }

  function updateTasks(){
    tasks.innerHTML='';
    openOrder.forEach(function(id){
      var win=document.getElementById(id);if(!win||!win.classList.contains('open'))return;
      var tt=win.querySelector('.tt');var b=document.createElement('button');
      b.className='pt pout taskbtn'+((!win.classList.contains('inactive')&&!win.classList.contains('min'))?' on':'');b.dataset.win=id;
      b.innerHTML='<i class="'+tt.querySelector('.ti').className+'"></i><span class="lbl">'+tt.textContent.trim()+'</span>';
      b.addEventListener('click',function(){
        if(win.classList.contains('min')){restoreWin(win,b);}
        else if(!win.classList.contains('inactive')){minWin(win);}
        else{setActive(win);}
      });
      tasks.appendChild(b);
    });
  }

  document.querySelectorAll('[data-open]').forEach(function(el){
    // Warm the genie texture on hover. A visitor points at an icon well before
    // they click it, so the expensive html2canvas pass happens during that gap
    // rather than after the click. warm() is idle-scheduled and no-ops when the
    // texture is already fresh, so repeated hovers cost nothing. Only the window
    // actually being reached for is captured, which is what keeps the rest of
    // the portfolio's lazy media from being pulled down speculatively.
    var target=el.getAttribute('data-open');
    function preWarm(){
      if(window.innerWidth<=767)return;
      if(window.Genie&&Genie.warm)Genie.warm(target);
    }
    el.addEventListener('pointerenter',preWarm,{passive:true});
    el.addEventListener('focus',preWarm);
    el.addEventListener('click',function(){
      if(el.classList.contains('pdi')&&!reducedMotion()){
        el.classList.add('squish');setTimeout(function(){el.classList.remove('squish');},150);
      }
      openWin(el.getAttribute('data-open'),el);closeStart();
    });
  });

  if(mobileAppNav){
    mobileAppNav.querySelectorAll('[data-mobile-open]').forEach(function(btn){
      btn.addEventListener('click',function(){
        closeMobileMore();
        openMobileRoot(btn.getAttribute('data-mobile-open'),btn);
      });
    });
    var mobileHomeBtn=mobileAppNav.querySelector('[data-mobile-home]');
    var mobileMoreBtn=mobileAppNav.querySelector('[data-mobile-more]');
    if(mobileHomeBtn)mobileHomeBtn.addEventListener('click',showMobileHome);
    if(mobileMoreBtn)mobileMoreBtn.addEventListener('click',function(){
      if(mobileMoreSheet&&mobileMoreSheet.classList.contains('open'))closeMobileMore();
      else openMobileMore();
    });
  }
  if(mobileNavScrim)mobileNavScrim.addEventListener('click',closeMobileMore);
  var mobileMoreClose=document.querySelector('.mobile-more-close');
  if(mobileMoreClose)mobileMoreClose.addEventListener('click',closeMobileMore);
  if(mobileMoreSheet){
    mobileMoreSheet.querySelectorAll('[data-mobile-open]').forEach(function(btn){
      btn.addEventListener('click',function(){
        closeMobileMore();
        openWin(btn.getAttribute('data-mobile-open'),btn);
      });
    });
    var mobileTheme=mobileMoreSheet.querySelector('[data-mobile-theme]');
    if(mobileTheme)mobileTheme.addEventListener('click',function(){themeBtn.click();closeMobileMore();});
  }

  windows().forEach(function(win){
    win.addEventListener('mousedown',function(){setActive(win);},true);
    win.querySelector('.cl').addEventListener('click',function(e){e.stopPropagation();closeWin(win);});
    win.querySelector('.mn').addEventListener('click',function(e){e.stopPropagation();if(isPhoneOS())goMobileBack(win,e.currentTarget);else minWin(win);});
    win.querySelector('.mx').addEventListener('click',function(e){e.stopPropagation();maxWin(win);});
    win.querySelectorAll('.pf[data-project]').forEach(function(c){
      c.addEventListener('click',function(){openProject(c.getAttribute('data-project'),c);});
    });
    var lv=win.querySelector('.list-v'), gv=win.querySelector('.grid-v');
    if(lv&&gv){
      lv.addEventListener('click',function(){
        win.querySelectorAll('.vpanel').forEach(function(p){p.classList.remove('grid');});
        lv.classList.add('on');gv.classList.remove('on');Genie.invalidate(win.id);Genie.warm(win);
      });
      gv.addEventListener('click',function(){
        win.querySelectorAll('.vpanel').forEach(function(p){p.classList.add('grid');});
        gv.classList.add('on');lv.classList.remove('on');Genie.invalidate(win.id);Genie.warm(win);
      });
    }
    var wb=win.querySelector('.wbody');
    if(wb){var scT;wb.addEventListener('scroll',function(){clearTimeout(scT);scT=setTimeout(function(){Genie.invalidate(win.id);Genie.warm(win);},350);},{passive:true});}
    makeDraggable(win);
    makeResizable(win);
  });

  // Metric VALUES are intentionally left as [ ] placeholders — fill in your
  // real numbers. Everything else is drafted copy.
  var caseStudies = {
    'compass': {
      title: 'Compass',
      summary: 'A connected campus experience for students, guardians and lecturers, built around the real tasks that usually disappear into paper slips, phone calls and disconnected portals.',
      metadata: {
        role: 'product designer',
        timeline: 'independent concept · ongoing',
        team: 'solo product design',
        platform: 'mobile app, iOS'
      },
      heroImg: 'compass-hero-1400.webp',
      sections: [
        {
          type: 'hook',
          title: 'the hook',
          chapter: 'the setup',
          blocks: [
            { type: 'text', content: 'Campus life in Nigeria still runs on paper slips and phone calls, and both fail exactly when you need them.' }
          ]
        },
        {
          type: 'problem',
          title: 'the problem',
          chapter: 'the setup',
          statement: {
            band: true,
            label: 'the problem',
            text: 'Most school portals are built around administrative departments instead of the people using them.',
            sub: 'The information usually exists somewhere. Finding it, trusting it, or acting on it is the hard part.'
          },
          blocks: [
            { type: 'text', content: 'Ask any Nigerian student how they get an exeat and you will hear the same story. You fill a paper form, chase somebody for a signature, call home so your guardian can call the school, then hope the person who approves it is at their desk. Lose the slip and you are not getting back through the gate.' },
            { type: 'pull-quote', text: 'a guardian normally hears about a problem only after it has already become one' },
            {
              type: 'cards',
              items: [
                { label: 'student', title: 'too many disconnected places', text: 'Deadlines, fees, attendance and requests live in systems that do not talk to each other.' },
                { label: 'guardian', title: 'visibility arrives too late', text: 'There is no clear view of progress, money or approvals until something has already gone wrong.' },
                { label: 'lecturer', title: 'every delay blocks a student', text: 'Attendance, submissions and grading move through separate records and separate queues.' }
              ]
            },
            { type: 'note', label: 'the shared failure', content: 'Fees clear at a bank, receipts become proof, and a student who runs out mid-semester calls home and waits. The problem is not one broken tool — it is that these three people have never been inside one connected system.' },
            { type: 'note', label: 'research gap', content: 'This direction comes from my own time in a Nigerian university and from watching the people around me, not from formal research. Testing it with students, guardians and lecturers is the first step before development.' }
          ]
        },
        {
          type: 'goal',
          title: 'the goal',
          chapter: 'the setup',
          statement: {
            label: 'the goal',
            text: 'One coherent product, without pushing three very different people through the same generic dashboard.',
            sub: 'A Nigerian university runs on several gatekeepers, each with their own desk and their own queue. The design had to make that legible instead of pretending it is instant.'
          },
          blocks: [
            { type: 'text', content: 'The product needed to give each person a focused view shaped by what they are actually responsible for.' },
            { type: 'pull-stat', label: 'distinct approvals · guardian + school', value: '2', detail: 'Shown separately so the student always knows who is pending.' },
            {
              type: 'checklist',
              items: [
                'Urgent work appears before history or general navigation.',
                'Money, academics and administration live in one connected system.',
                'Every action names whether it is pending, done, rejected or waiting on someone else.',
                'Each role sees the same records through the decisions they need to make.'
              ]
            },
            { type: 'note', label: 'mobile-first constraint', content: 'The entire service had to work clearly on a phone, because that is what students actually have in their hands.' }
          ]
        },
        {
          type: 'approach',
          title: 'the approach',
          chapter: 'the design',
          statement: {
            label: 'the approach',
            text: 'Role before feature.',
            sub: 'Each interface starts from the decision that person needs to make, not from a menu of everything the platform can do.'
          },
          blocks: [
            { type: 'text', content: 'Students, guardians and lecturers touch many of the same records, but they do not carry the same responsibilities. So instead of organising every screen around the same feature list, I wrote down the one question each person opens the app to answer.' },
            { type: 'text', content: 'A student is asking what changed, what needs me, and what can I do next. A guardian is asking where does my ward need support, money or approval. A lecturer is asking which teaching task is most urgent and which students are waiting on me. That became the foundation for everything else.' },
            { type: 'text', content: 'The decision I made early is that the guardian gets a real app, not a read-only parent portal. She has her own home screen, her own navigation, and actions only she can take. She funds the wallet, she approves the exeat, she sees attendance before anybody has to call her about it.' },
            { type: 'decision', decision: 'gave the guardian a full app instead of a parent portal', tradeoff: 'two products to design and keep coherent, and a parent who stops phoning the school for updates' },
            { type: 'decision', decision: 'showed both approval steps as separate states instead of one status', tradeoff: 'a busier request card, and a student who knows exactly who they are waiting on' },
            { type: 'decision', decision: 'made the student ID card double as the debit card', tradeoff: 'freezing a lost card also freezes campus access, so freeze needed its own warning and a second confirmation' },
            { type: 'decision', decision: 'built one home screen pattern and fed each role different data', tradeoff: 'no role gets a bespoke dashboard, and adding a role became mostly a question of what its four numbers are' },
            { type: 'note', label: 'non-negotiable', content: 'A student should never reach a payment screen and be surprised by it. Every fee screen shows the wallet balance beside the amount before commitment, and a short balance becomes a clear next step instead of a late failure.' }
          ]
        },
        {
          type: 'work',
          title: 'the system',
          chapter: 'the design',
          statement: {
            label: 'the system',
            text: 'Three roles, one shared structure, three different front doors.',
            sub: 'A greeting, four numbers, anything needing action, what is coming, then what just happened. Only the contents change.'
          },
          blocks: [
            { type: 'text', content: 'Login starts with three doors. Rather than one form that infers your role from your credentials, you pick student, guardian or lecturer, and each option states plainly what it gets you. It reads as one extra tap and it removes a whole class of confusion for guardians who are not sure they even have an account.' },
            { type: 'image', file: 'compass-roles.png', caption: 'role selection, where each option states what it unlocks', tall: true },
            {
              type: 'cards',
              items: [
                { label: 'student home', title: 'what changed and what is next', text: 'Wallet balance, registered courses, attendance, upcoming work and campus identity.' },
                { label: 'guardian home', title: 'where support is needed', text: 'Their ward, available funds, attendance and requests waiting for approval.' },
                { label: 'lecturer home', title: 'what is blocking a student', text: 'Pending grades, attendance still to submit and the next classes to teach.' }
              ]
            },
            { type: 'image', file: 'compass-student-home.png', caption: 'student home', tall: true },
            { type: 'image', file: 'compass-guardian-home.png', caption: 'guardian home', tall: true },
            { type: 'image', file: 'compass-lecturer-home.png', caption: 'lecturer home', tall: true },
            { type: 'note', label: 'same shell, different priority', content: 'The lecturer experience is still in progress, but it uses the same home-screen pattern. Backlogs surface above general navigation so the lecturer immediately sees which unfinished task is blocking a student.' }
          ]
        },
        {
          type: 'payments',
          title: 'payments',
          chapter: 'the design',
          statement: {
            label: 'payments',
            text: 'A student should never reach a payment screen and be surprised by it.',
            sub: 'The wallet balance sits next to the amount before you commit, and an OTP confirms before anything leaves.'
          },
          blocks: [
            { type: 'text', content: 'School payments are high stakes, so the wallet had to be plain about amounts, available funds and where a transaction currently stands. It holds the balance, the transaction history and the card controls. Fees are broken into the components a Nigerian school actually bills for, so a guardian can see which part is outstanding instead of one total that tells them nothing.' },
            { type: 'image', file: 'compass-wallet.png', caption: 'wallet, balance and transaction history', tall: true },
            { type: 'image', file: 'compass-fees.png', caption: 'fee structure, billed the way schools bill it', tall: true },
            { type: 'text', content: 'The screen I care most about is the one where the money is not there. Rather than failing, it explains the shortfall and offers a route to request funds from the guardian. That turns a dead end into a next step, which matters when the alternative is a phone call and a wait.' },
            { type: 'image', file: 'compass-pay-fees.png', caption: 'insufficient balance, with a way out of it', tall: true },
            { type: 'image', file: 'compass-card.png', caption: 'card details, where freezing spells out its cost', tall: true },
            { type: 'text', content: 'The card screen is where identity and money meet. It carries one plain line saying the student ID card is also the debit card, because that is the kind of thing people need told once, clearly. Freezing it is more serious than freezing a normal bank card, so it asks twice and spells out that campus access goes with it.' }
          ]
        },
        {
          type: 'academics',
          title: 'academics',
          chapter: 'the design',
          statement: {
            label: 'academics',
            text: 'An empty state that lies is worse than one admitting it is empty.',
            sub: 'Not graded yet instead of a zero. N/A instead of a GPA nobody has earned.'
          },
          blocks: [
            { type: 'text', content: 'Each course carries attendance, credit units, the lecturer and how many materials are posted, so a student can move from a course into its materials or its assignments without losing where they were.' },
            {
              type: 'checklist',
              items: [
                'Courses keep attendance, credit units, lecturer and materials together.',
                'Assessment and examination scores stay visibly separate.',
                'Not graded yet never appears as a zero or failed result.',
                'The timetable is organised by day instead of one crowded weekly grid.'
              ]
            },
            { type: 'image', file: 'compass-academics.png', caption: 'gradebook, assessment and exam split', tall: true }
          ]
        },
        {
          type: 'exeat',
          title: 'exeat',
          chapter: 'the design',
          statement: {
            label: 'exeat',
            text: 'Submitting the form is only the beginning of an exeat request.',
            sub: 'Guardian approval and school approval are tracked separately, so nobody mistakes one for the other.'
          },
          blocks: [
            { type: 'text', content: 'This is the part I spent the most time on. A student submits a reason, dates, a destination and a contact, then tracks it through pending and past requests. The guardian gets the context they need to approve or reject it.' },
            { type: 'pull-quote', text: 'guardian approval is not school approval, and a student who confuses the two gets turned back at the gate' },
            {
              type: 'process',
              items: [
                { title: 'Submit', text: 'Reason, dates, destination and an emergency contact.' },
                { title: 'Guardian', text: 'Reviews the context and approves or rejects the trip.' },
                { title: 'School', text: 'Administration makes the separate campus decision.' },
                { title: 'Gate QR', text: 'The approved pass becomes proof at exit and return.' }
              ]
            },
            { type: 'note', label: 'state clarity', content: 'Every request carries guardian and school approval separately, so a student always knows who owns the next step while they wait.' },
            { type: 'image', file: 'compass-exeat.png', caption: 'the chain, explained once at the top then tracked per request', tall: true },
            { type: 'image', file: 'compass-guardian-exeat.png', caption: 'the guardian side of the same request', tall: true }
          ]
        },
        {
          type: 'states',
          title: 'system states',
          chapter: 'the thinking',
          statement: {
            label: 'system states',
            text: 'Most of campus life is spent waiting on somebody else.',
            sub: 'A payment is processing. An assignment is not graded. A request has the guardian but still needs the school.'
          },
          blocks: [
            { type: 'text', content: 'Because so much of this is waiting, the states needed one vocabulary instead of whatever each screen felt like saying. Pending, approved, rejected, paid, submitted, successful, not yet graded, action required. The same words in the same colours, sitting in the same place, wherever they show up.' },
            { type: 'text', content: 'Confirmation screens are for things that actually finished. Warnings explain what is blocked and what the next available step is. The point was to let somebody read the state of the system without having to interpret administrative language.' }
          ]
        },
        {
          type: 'principles',
          title: 'principles',
          chapter: 'the thinking',
          statement: {
            band: true,
            tone: 'rose',
            label: 'principles',
            text: 'Consequence before confirmation.',
            sub: 'Payments, card controls, approvals and rejections all show what the action does before you can complete it.'
          },
          blocks: [
            { type: 'text', content: 'Three rules held the whole interface together. Role before feature: each experience opens from what that person is responsible for, not from a menu of everything the platform can do. Action before archive: dashboards lead with unresolved work, warnings and requests, and put history underneath. Consequence before confirmation: nothing irreversible happens without first saying what it costs.' }
          ]
        },
        {
          type: 'outcome',
          title: 'the outcome',
          chapter: 'closing',
          statement: {
            band: true,
            label: 'the outcome',
            text: 'Compass is a design concept, so I am not attaching adoption or efficiency numbers to it.',
            sub: 'I would rather describe what it does than invent a metric for something that has not launched.'
          },
          blocks: [
            { type: 'image', file: 'compass-in-hand.png', caption: 'Compass in use on campus', bleed: true },
            { type: 'text', content: 'What exists is a high-fidelity system covering the student and guardian experiences end to end, with the lecturer role still in progress on the same pattern. It holds academic records and materials, assignments and grading, attendance and timetables, wallets and fee payments, guardian funding, exeat requests with multi-stage approval, and the profile and notification settings around all of it.' },
            { type: 'text', content: 'A student can pay fees, request funds from home, submit an exeat and check grades without leaving the app. A guardian can fund a wallet, approve an exeat and see attendance without calling anybody at the school.' }
          ]
        },
        {
          type: 'next',
          title: 'what i would validate',
          chapter: 'closing',
          statement: {
            label: 'what i would validate',
            text: 'The questions I would take into testing before anybody writes code.',
            sub: 'With students, guardians and lecturers, not with other designers.'
          },
          blocks: [
            { type: 'text', content: 'Can a student complete a fee payment, and recover from an insufficient balance, without help? Can people explain who owns the next step in an exeat request? Can a lecturer find their most urgent unfinished task quickly? Can a guardian find what they need without feeling buried? Does anybody confuse pending, partially approved and completed? And does the navigation hold up once more campus services get added to it?' },
            { type: 'text', content: 'The answers would change the terminology, the navigation, what gets priority on each home screen, and where the confirmation points sit. That work comes before development, not after it.' }
          ]
        },
        {
          type: 'reflection',
          title: 'the reflection',
          chapter: 'closing',
          blocks: [
            { type: 'text', content: 'The strongest part of Compass is the role-based model. Its biggest limitation is that the concept still rests on my own university experience rather than direct research with students, guardians and lecturers. Before development, I would test the language, approval chain and dashboard priorities with all three groups — especially the moments where one person is waiting on another.' }
          ]
        }
      ]
    },
    'terminal': {
      title: 'Terminal',
      metadata: {
        role: 'systems & visual designer',
        timeline: 'spring 2025',
        team: 'solo experiment',
        platform: 'macOS, web'
      },
      heroImg: 'terminal-hero-1400.webp',
      sections: [
        {
          type: 'hook',
          title: 'the hook',
          blocks: [
            { type: 'text', content: 'The command line assumes you already know what you are doing.' }
          ]
        },
        {
          type: 'problem',
          title: 'the problem',
          statement: {
            label: 'the problem',
            text: 'Both developers I sat with got stuck in exactly the same place, and it was never syntax.',
            sub: 'They could not tell where they were, or whether what they just ran had actually worked.'
          },
          blocks: [
            { type: 'text', content: 'I sat with two junior developers learning the terminal and both got stuck in the same place. Not on syntax. On not knowing where they were, what state anything was in, or what had just happened. The terminal answers your command and then tells you nothing else.' },
            { type: 'pull-quote', text: 'it gives you an answer with no context, so a beginner cannot tell a working command from a lucky one' }
          ]
        },
        {
          type: 'approach',
          title: 'the approach',
          blocks: [
            { type: 'text', content: 'I added structure without taking away the keyboard. Output gets grouped into readable panels and the state you are working in sits in a column you can glance at. Everything is still typed. Nothing needs a mouse, which was the line I would not cross.' }
          ]
        },
        {
          type: 'outcome',
          title: 'the outcome',
          stats: [
            { label: 'time to first working command', value: '[ ]' },
            { label: 'runs without checking docs', value: '[ ]' }
          ],
          blocks: [
            { type: 'text', content: 'I tested it with the same two developers and three others. The useful signal was that they stopped asking me whether a command had worked, because they could see that it had.' }
          ]
        },
        {
          type: 'reflection',
          title: 'the reflection',
          blocks: [
            { type: 'text', content: 'The hard part was restraint. Every visual affordance I added risked turning a fast tool into a slow one, and I cut about half of what I designed. I am still not sure the panels earn their space for someone who has lived in the terminal for ten years. I did not design this for them.' }
          ]
        }
      ]
    },
    // Authored from the Figma case study window (node 248:3974). Every string
    // here is the text in that file, not the earlier draft — the copy was
    // revised, and the screens are 3x exports living in case-studies/babysteps/.
    'baby steps': {
      title: 'BabySteps',
      summary: 'An app that helps pregnant women track and manage their pregnancies and health from conception till due date.',
      metadata: {
        role: 'Solo UX/UI Designer',
        timeline: '2 weeks',
        team: 'Concept project',
        platform: 'Mobile'
      },
      heroImg: 'baby-steps-story.jpg',
      sections: [
        {
          type: 'context',
          title: 'BabySteps',
          rail: 'Starting-point',
          statement: {
            label: 'BabySteps',
            text: 'Pregnancy comes with more than enough to keep track of.',
            sub: 'BabySteps is a mobile concept that brings pregnancy tracking, antenatal care, medication and wellbeing support into one place.'
          },
          blocks: [
            { type: 'screenrow', screens: [
              { file: 'babysteps/01-splash.png', alt: 'BabySteps splash screen' },
              { file: 'babysteps/11-home.png', alt: 'BabySteps home screen showing pregnancy progress and the next appointment' },
              { file: 'babysteps/12-clinic-hub.png', alt: 'BabySteps clinic screen with the upcoming appointment and booking options' },
              { file: 'babysteps/12a-antenatal-visit.png', alt: 'BabySteps antenatal care screen with upcoming appointments and nearby clinics' }
            ] }
          ]
        },
        {
          type: 'origin',
          title: 'It started with something I kept noticing',
          rail: 'What-I-noticed',
          statement: {
            label: 'the starting point',
            text: 'It started with something I kept noticing.'
          },
          blocks: [
            { type: 'text', content: 'During my personal visits to the hospital, I kept seeing heavily pregnant women moving between waiting areas, appointments and different parts of the hospital, often already tired.' },
            { type: 'text', content: 'It made me think about everything they still had to manage once they left: appointments, changes in the pregnancy, medication, work and their own wellbeing.' },
            { type: 'text', content: 'BabySteps started as an attempt to make some of that easier to manage from a phone.' },
            { type: 'image', file: 'baby-steps-problem.jpg', caption: 'Where the idea came from', wide: true }
          ]
        },
        {
          type: 'turn',
          title: 'The initial plan was for it to simply be a pregnancy tracker',
          rail: 'What-I-learned',
          statement: {
            label: 'the turning point',
            text: 'The initial plan was for it to simply be a pregnancy tracker.',
            sub: 'But the women I spoke to showed me that tracking was just one part of the problem.'
          },
          blocks: [
            { type: 'text', content: 'I spoke to some women at the hospital and also used a Google Form survey to hear from mothers and pregnant women about what had made pregnancy difficult to manage and what they wished had been easier.' },
            { type: 'text', content: 'Tracking definitely came up, but so did antenatal appointments, pregnancy-safe medication, fatigue, work and most especially mental wellbeing.' },
            { type: 'text', content: 'So the project was started to become less about tracking pregnancy and more about reducing the number of things women had to manage and think about separately.' },
            // The three research panels are exported from the design rather than
            // rebuilt: each is a composed layout of charts, quotes and personas.
            { type: 'image', file: 'babysteps/research-survey.png', wide: true },
            { type: 'image', file: 'babysteps/research-themes.png', wide: true },
            { type: 'panel', file: 'babysteps/research-personas.png', alt: 'Research personas' },
            { type: 'cardrow', items: [
              { icon: '✦', title: 'Keep up with dates', text: 'Pregnancy progress, baby development, due dates and appointments were all things women had to keep track of.' },
              { icon: '✦', title: 'Get accessible care', text: 'Booking antenatal appointments, finding suitable medication or getting access to a physician could require more effort when someone was already tired.' },
              { icon: '✦', title: 'Keep going mentally', text: 'Pregnancy was happening alongside work, everyday responsibilities and mental wellbeing.' }
            ] }
          ]
        },
        {
          type: 'model',
          title: 'BabySteps needed to do three things well',
          rail: 'Product-model',
          statement: {
            label: 'the product model',
            text: 'BabySteps needed to do three things well.',
            sub: 'Instead of treating every pain point as a separate feature, it was really important I grouped the experience around three things to enable understand better how to structure and move things around..'
          },
          blocks: []
        },
        {
          type: 'feature',
          title: 'Know what is happening without having to look for it',
          rail: 'Know',
          statement: {
            label: '01 know',
            text: 'Know what is happening without having to look for it.'
          },
          blocks: [
            { type: 'text', content: 'A lot of pregnancy information changes over time, so BabySteps gives the user one place to return to for a quick picture of where she is.' },
            { type: 'text', content: 'The due-date calculator helps establish the pregnancy timeline, while the home experience brings pregnancy progress and important information together.' },
            // The onboarding trio are wider stills than the phone screens, so
            // they keep their own labels the way the design does.
            { type: 'progression', stages: [
              { label: 'get started', file: 'baby-steps-onboarding.png', alt: 'BabySteps onboarding screen', phone: true },
              { label: 'create account', file: 'baby-steps-auth.png', alt: 'BabySteps account creation screen', phone: true },
              { label: 'due date', file: 'baby-steps-due-date.png', alt: 'BabySteps due date calculator', phone: true }
            ] },
            { type: 'cardrow', items: [
              { icon: '✦', title: 'Pregnancy progress', text: 'See where the pregnancy currently sits.' },
              { icon: '✦', title: 'Baby development', text: 'Keep growth information connected to the pregnancy timeline.' },
              { icon: '✦', title: 'What is coming next', text: 'Appointments and reminders stay within the same experience.' }
            ] }
          ]
        },
        {
          type: 'feature',
          title: 'Accessible care without having to step into the hospital',
          rail: 'Care',
          statement: {
            label: '02 care',
            text: 'Accessible care without having to step into the hospital.'
          },
          blocks: [
            { type: 'text', content: 'Some of the problems women raised were not all about information. They were about access.' },
            { type: 'text', content: 'Booking antenatal care or finding medication could mean another task outside the home when someone was already tired. BabySteps brings those first steps into the same experience.' },
            { type: 'screenrow', screens: [
              { file: 'babysteps/35-clinic-doctors.png', alt: 'Clinic with its physicians and their next available days' },
              { file: 'babysteps/14-booking-form.png', alt: 'BabySteps antenatal booking form' },
              { file: 'babysteps/15-review-sheet.png', alt: 'BabySteps booking review sheet' },
              { file: 'babysteps/16-confirmed.png', alt: 'BabySteps booking confirmation screen' }
            ] },
            { type: 'screenrow', screens: [
              { file: 'babysteps/37-pharmacy.png', alt: 'BabySteps in-app pharmacy' },
              { file: 'babysteps/38-drug-page.png', alt: 'BabySteps medication detail page with dose and price' }
            ] },
            { type: 'note', label: 'notes', content: 'Booking carries the physician you chose through to the date, the time and the confirmation, so the appointment returns to the same place it started.' }
          ]
        },
        {
          type: 'feature',
          title: 'Look after yourself too',
          rail: 'Support',
          statement: {
            label: '03 support',
            text: 'Look after yourself too.'
          },
          blocks: [
            { type: 'text', content: 'Pregnancy care is not only appointments and baby development. The research also raised fatigue, mental wellbeing and the difficulty of keeping everyday life moving at the same time.' },
            { type: 'text', content: 'BabySteps therefore explored ways for women to access some forms of support from home.' },
            { type: 'screenrow', screens: [
              { file: 'babysteps/25-prenatal-yoga.png', alt: 'BabySteps prenatal yoga sessions' },
              { file: 'babysteps/29a-talk-to-someone.png', alt: 'BabySteps talk to someone screen with midwives, doctors and counselling' },
              { file: 'babysteps/26-one-session.png', alt: 'A single BabySteps wellbeing session' }
            ] },
            { type: 'note', label: 'notes', content: 'Talk to someone sits on the same shelf as an antenatal visit, so booking a session is not a separate errand.' }
          ]
        },
        {
          type: 'craft',
          title: 'Working out how it all fits together',
          rail: 'Designing-it',
          statement: {
            label: 'structure',
            text: 'Working out how it all fits together.'
          },
          blocks: [
            { type: 'note', label: 'the challenge', content: 'Pregnancy tracking + clinics + pharmacy + therapy + wellbeing, without making BabySteps feel like five different apps.' },
            { type: 'text', content: 'Once BabySteps expanded beyond pregnancy tracking, the bigger challenge became connecting the different parts of the experience without making them feel like separate products.' },
            { type: 'text', content: 'I mapped how the main areas related to one another, then worked through the journeys in paper and low-fidelity wireframes before moving into the final interface.' },
            { type: 'image', file: 'baby-steps-problem.jpg', caption: 'How the main areas relate to one another', wide: true },
            { type: 'screenrow', screens: [
              { file: 'babysteps/07-set-up.png', alt: 'BabySteps set up screen' },
              { file: 'babysteps/08-calculator.png', alt: 'Due date calculator in place' },
              { file: 'babysteps/08b-conception-branch.png', alt: 'The conception date branch of the calculator' },
              { file: 'babysteps/09-ready.png', alt: 'BabySteps ready state with no dead end' }
            ] },
            { type: 'screenrow', screens: [
              { file: 'babysteps/02-track.png', alt: 'BabySteps tracking screen' },
              { file: 'babysteps/18-community.png', alt: 'BabySteps community screen' },
              { file: 'babysteps/20-tools.png', alt: 'BabySteps tools, ranked by week' },
              { file: 'babysteps/22-lists.png', alt: 'BabySteps lists, ordered by deadline' }
            ] },
            { type: 'panel', file: 'babysteps/paper.jpg', caption: 'From rough idea to interface. The paper and low-fidelity work covered the same ground as the final screens, though I did not keep a one-to-one record of which sketch became which screen, so these sit as a progression rather than a direct comparison.' }
          ]
        },
        {
          type: 'lookback',
          title: 'If I picked BabySteps up again today',
          rail: 'Looking-back',
          statement: {
            label: 'looking back',
            text: 'If I picked BabySteps up again today.'
          },
          blocks: [
            { type: 'text', content: 'BabySteps was a two-week concept project, and looking back at it now, there are parts I would take much further before treating the product as finished.' },
            { type: 'image', file: 'baby-steps-problem.jpg', wide: true },
            { type: 'cardrow', items: [
              { icon: '✦', title: 'Validate the main journeys again', text: 'I would run another round of usability testing, especially around appointment booking, pharmacy and therapy. These are some of the more sensitive and involved parts of the product, so I would want stronger validation before expanding them further.' },
              { icon: '✦', title: 'Think more carefully about who else belongs in the experience', text: 'One of my original next steps was to consider fathers and partners. Today, I would first investigate what they actually need and whether that belongs inside the same BabySteps experience or requires something different.' },
              { icon: '✦', title: 'Expand only where the research supports it', text: 'The original concept also left room for areas such as community and additional pregnancy tools. I would research those needs properly before adding more functionality. Pregnancy touches so many parts of life that BabySteps could easily become overwhelming if every possible problem became another feature.' }
            ] },
            // The design's own "next steps" panel, exported rather than rebuilt.
            { type: 'panel', file: 'babysteps/next-steps.png', alt: 'Next steps', narrow: true },
            { type: 'text', content: 'I started BabySteps with a fairly clear idea of what I thought I was going to design. Research pulled the project in a wider direction.' },
            { type: 'text', content: 'The biggest lesson was learning not to become too attached to the first version of an idea. What started as a pregnancy tracker became a broader attempt to make some of the everyday work around pregnancy easier to manage.' }
          ]
        }
      ]
    },
    'distresso': {
      title: 'Distresso',
      metadata: {
        role: 'creative director',
        timeline: 'winter 2024',
        team: 'solo experiment',
        platform: 'web, widget'
      },
      heroImg: 'distresso-hero.png',
      sections: [
        {
          type: 'problem',
          title: 'the problem',
          statement: {
            label: 'the problem',
            text: 'Every wellness app I tried started guilt-tripping me by about day four.',
            sub: 'Miss a day, the streak breaks, and the thing meant to help becomes one more thing you are failing at.'
          },
          blocks: [
            { type: 'text', content: 'Every wellness app I tried started guilt-tripping me by about day four. Miss a day, the streak breaks, and now the thing that was supposed to help is one more thing I am failing at. I wanted to find out whether a wellness tool could just be genuinely funny instead.' },
            { type: 'pull-quote', text: 'streaks turn a coping tool into an obligation, and obligation is the thing people are already drowning in' }
          ]
        },
        {
          type: 'details',
          title: 'the details',
          blocks: [
            { type: 'text', content: 'The whole thing runs on absurd analogue machinery. You rate your stress by dragging a caliper that squeaks, and it answers with something ridiculous. No breathing exercise, no affirmation. The interactions are the entire point, so most of the work went into making them feel mechanical and slightly silly.' },
            { type: 'image', file: 'distresso-details-1.png', caption: 'the relief widgets, built to be pulled and squeezed', wide: false },
            { type: 'image', file: 'distresso-details-2.png', caption: 'caliper dial mechanics, the core interaction', wide: false }
          ]
        },
        {
          type: 'outcome',
          title: 'the outcome',
          stats: [
            { label: 'returning with nothing to keep up', value: '[ ]' },
            { label: 'streaks shipped', value: '0' }
          ],
          blocks: [
            { type: 'text', content: 'It has no accounts and no notifications, and it does not remember whether you showed up yesterday. People still come back, which was the only thing I actually wanted to find out.' }
          ]
        }
      ]
    }
  };

  // Published case studies, in reading order. This is the single source of truth
  // for what the reader may be sent to next; `caseStudies` above also holds
  // drafts with no rail entry, and offering those is how Terminal kept turning
  // up as "next" after it was taken off the work rail. Publishing one is adding
  // its key here and dropping its coming-soon status in PROJECT_DATA.
  var PUBLISHED_CASE_STUDIES = ['baby steps'];

  var viewer=null;

  function renderCaseStudy(name) {
    if (!viewer) return;

    var normName = name.toLowerCase().trim();
    if (normName === 'baby steps' || normName === 'babysteps' || normName === 'baby-steps') {
      normName = 'baby steps';
    }

    var cs = caseStudies[normName];
    if (!cs) {
      cs = {
        title: name,
        metadata: {
          role: '[lead designer]',
          timeline: '[4 months]',
          team: '[product designer]',
          platform: '[web, API]'
        },
        heroImg: 'fallback-hero.png',
        sections: [
          {
            type: 'hook',
            title: 'the hook',
            blocks: [
              { type: 'text', content: '[hook line goes here, one sentence of tension]' }
            ]
          },
          {
            type: 'problem',
            title: 'the challenge',
            blocks: [
              { type: 'text', content: '[problem: what was broken, who it affected]' }
            ]
          },
          {
            type: 'approach',
            title: 'the strategy',
            blocks: [
              { type: 'text', content: '[approach: the vision, design exploration, and user flows]' }
            ]
          },
          {
            type: 'outcome',
            title: 'the results',
            stats: [
              { label: '[efficiency gain]', value: '[+40%]' },
              { label: '[satisfaction]', value: '[4.9/5]' }
            ],
            blocks: [
              { type: 'text', content: '[outcome: what was shipped, key validation metrics]' }
            ]
          }
        ]
      };
    }

    var slug = normName.replace(/\s+/g, '-');
    var isBabySteps = normName === 'baby steps';
    viewer.querySelector('.vname').textContent = slug + '.hlp ♡';
    viewer.querySelector('.hlp-doc-name').textContent = slug + '.hlp';

    var railList = viewer.querySelector('.hlp-rail-list');
    var readingContainer = viewer.querySelector('.reading-container');

    railList.innerHTML = '';
    readingContainer.innerHTML = '';
    readingContainer.classList.remove('case-baby-steps', 'case-compass', 'case-terminal', 'case-distresso');
    readingContainer.classList.add('case-' + slug);
    viewer.setAttribute('data-case-study', slug);

    // Update metadata strip
    viewer.querySelector('.meta-role').textContent = 'role: ' + cs.metadata.role;
    viewer.querySelector('.meta-timeline').textContent = 'timeline: ' + cs.metadata.timeline;
    viewer.querySelector('.meta-team').textContent = 'team: ' + cs.metadata.team;
    viewer.querySelector('.meta-platform').textContent = 'platform: ' + cs.metadata.platform;
    viewer.querySelector('.hlp-project-title').textContent = cs.title;
    viewer.querySelector('.hlp-project-platform').textContent = cs.metadata.platform + ' · ' + cs.sections.length + ' sections';

    var readingPane = viewer.querySelector('.hlp-reading-pane');
    readingPane.scrollTop = 0;

    // One frame treatment for every image in the reader: inset frame,
    // caption in the white space below it. Used by hero and all figures.
    function frameHTML(file, alt, isHero) {
      return '<div class="cs-frame' + (isHero ? ' hero' : '') + '">' +
          '<img referrerpolicy="no-referrer" loading="' + (isHero ? 'eager' : 'lazy') + '" decoding="async" ' +
            (isHero ? 'fetchpriority="high" ' : '') + 'src="images/case-studies/' + file + '" alt="' + alt + '" ' +
            'onerror="this.style.display=\'none\'; this.parentElement.classList.add(\'empty\'); this.nextElementSibling.style.display=\'flex\';" />' +
          '<div class="cs-frame-fallback">' +
            '<i class="ti ti-photo"></i>' +
            '<span class="fallback-kicker">cover preview</span>' +
            '<strong>' + alt + '</strong>' +
            '<small>final visual will replace this card</small>' +
          '</div>' +
        '</div>';
    }

    function figureHTML(b) {
      var mod = b.tall ? ' tall' : (b.bleed ? ' bleed' : '');
      return '<figure class="cs-figure' + (b.wide || b.bleed ? ' wide' : '') + '">' +
          '<div class="cs-frame' + mod + '">' +
            '<img referrerpolicy="no-referrer" loading="lazy" decoding="async" src="images/case-studies/' + b.file + '" alt="' + (b.caption || '') + '" ' +
              'onerror="this.style.display=\'none\'; this.parentElement.classList.add(\'empty\'); this.nextElementSibling.style.display=\'flex\';" />' +
            '<div class="cs-frame-fallback">' +
              '<i class="ti ti-device-mobile"></i>' +
              '<span class="fallback-kicker">screen preview</span>' +
              '<strong>' + (b.caption || 'Product screen') + '</strong>' +
              '<small>final visual will replace this card</small>' +
            '</div>' +
          '</div>' +
          (b.caption ? '<figcaption class="cs-caption">' + b.caption + '</figcaption>' : '') +
        '</figure>';
    }

    function statHTML(s) {
      var pending = /^\[\s*\]$/.test(String(s.value || ''));
      return '<div class="cs-stat' + (pending ? ' cs-stat--pending' : '') + '">' +
          '<div class="label">' + s.label + '</div>' +
          '<div class="value">' + (pending ? 'not measured' : s.value) + '</div>' +
          (s.detail ? '<div class="detail">' + s.detail + '</div>' : '') +
        '</div>';
    }

    function storyCardsHTML(b) {
      return '<div class="cs-story-grid wide">' +
        (b.items || []).map(function(item) {
          return '<article class="cs-story-card">' +
              '<div class="eyebrow">' + (item.label || 'insight') + '</div>' +
              '<strong>' + (item.title || '') + '</strong>' +
              (item.text ? '<p>' + item.text + '</p>' : '') +
            '</article>';
        }).join('') +
      '</div>';
    }

    function checklistHTML(b) {
      // numbered:true renders "01 →" instead of a check — for lists of problems.
      return '<div class="cs-checklist' + (b.numbered ? ' numbered' : '') + '">' +
        (b.items || []).map(function(item) {
          return '<div class="cs-check-item">' + item + '</div>';
        }).join('') +
      '</div>';
    }

    function noteHTML(b) {
      return '<aside class="cs-inline-note">' +
          '<span class="note-mark">✦</span>' +
          '<div>' +
            '<div class="note-label">' + (b.label || 'note') + '</div>' +
            '<p>' + (b.content || '') + '</p>' +
          '</div>' +
        '</aside>';
    }

    // A real comparison table. Cards lose the row-by-row comparison that makes
    // a competitive audit worth reading.
    // ---- Narrative block types -------------------------------------------
    // Added for the Baby Steps reconstruction, but all are generic: any case
    // study can use them. None of them assume Baby Steps content.

    function shotHTML(file, alt, cls) {
      return '<figure class="cs-shot' + (cls ? ' ' + cls : '') + '">' +
          '<img referrerpolicy="no-referrer" loading="lazy" decoding="async" src="images/case-studies/' + file + '" alt="' + (alt || '') + '" ' +
            'onerror="this.closest(\'.cs-shot\').classList.add(\'missing\')" />' +
        '</figure>';
    }

    // Three large editorial statements. Not a card grid: type on the page,
    // separated by rules, each one able to carry the point on its own.
    // A row of short cards, hairline-divided, each with a small round mark.
    // The case study's one "scan this" device: everything visible at once, no
    // clicking, no card doing more work than three lines.
    function cardRowHTML(b) {
      var items = b.items || [];
      return '<div class="bs-cards wide" data-count="' + items.length + '">' +
        items.map(function(it) {
          return '<article>' +
              '<i aria-hidden="true">' + (it.icon || '✦') + '</i>' +
              '<div><strong>' + (it.title || '') + '</strong>' +
                '<p>' + (it.text || '') + '</p></div>' +
            '</article>';
        }).join('') +
      '</div>';
    }

    // A numbered strip: the same hairline row as the cards, but ordinal rather
    // than iconic, for a sequence or a set of named parts.
    // One exported panel on its own row, at its natural proportions.
    //
    // Consecutive `image` blocks are buffered and laid out as a 2-up or 3-up
    // grid, which is right for the pair of research panels but wrong for the
    // wide ones that sit full-width in the design. This type is not buffered, so
    // it always gets its own row, and it keeps the panel's own aspect rather
    // than cropping it into the reader's 16/9 frame.
    function panelHTML(b) {
      return '<figure class="cs-panel wide' + (b.narrow ? ' cs-panel--narrow' : '') + '">' +
          '<img referrerpolicy="no-referrer" loading="lazy" decoding="async" ' +
            'src="images/case-studies/' + b.file + '" alt="' + (b.alt || '') + '" />' +
          (b.caption ? '<figcaption class="cs-caption">' + b.caption + '</figcaption>' : '') +
        '</figure>';
    }

    // A plain row of phone screens, evenly spaced, no captions — the device the
    // BabySteps design uses to show a flow at a glance. The existing blocks all
    // carry text alongside the screen (walkthrough steps, progression labels),
    // and the design deliberately does not.
    function screenRowHTML(b) {
      var shots = (b.screens || []).map(function(s) {
        return shotHTML(s.file, s.alt, 'phone');
      }).join('');
      return '<div class="cs-screenrow wide" data-count="' + (b.screens || []).length + '">' +
        shots + '</div>';
    }

    function stripHTML(b) {
      var items = b.items || [];
      return '<div class="bs-strip wide" data-count="' + items.length + '">' +
        items.map(function(it, i) {
          var n = (i + 1 < 10 ? '0' : '') + (i + 1);
          var list = (it.features || []).map(function(f) {
            return '<li>' + f + '</li>';
          }).join('');
          return '<div>' +
              '<span>' + n + '</span>' +
              '<strong>' + (it.name || it.title || '') + '</strong>' +
              (it.desc || it.text ? '<p>' + (it.desc || it.text) + '</p>' : '') +
              (list ? '<ul>' + list + '</ul>' : '') +
            '</div>';
        }).join('') +
      '</div>';
    }


    function statementsHTML(b) {
      return '<div class="cs-themes wide">' +
        (b.items || []).map(function(it) {
          return '<div class="cs-theme">' +
              '<div class="t-key">' + (it.key || '') + '</div>' +
              '<p>' + (it.text || '') + '</p>' +
            '</div>';
        }).join('') +
      '</div>';
    }

    // Numbered findings, larger and calmer than the checklist.
    function insightsHTML(b) {
      return '<div class="cs-insights wide">' +
        (b.items || []).map(function(it, i) {
          var n = (i + 1 < 10 ? '0' : '') + (i + 1);
          return '<div class="cs-insight">' +
              '<div class="i-num">' + n + '</div>' +
              '<div class="i-body"><strong>' + (it.title || '') + '</strong>' +
                '<p>' + (it.text || '') + '</p></div>' +
            '</div>';
        }).join('') +
      '</div>';
    }

    // Optional detail behind real tabs. Nothing is open until asked for, so
    // process evidence stays available without interrupting the story.
    var csPanelSeq = 0;
    function disclosureHTML(b) {
      var uid = 'csd' + (++csPanelSeq);
      var tabs = (b.items || []).map(function(it, i) {
        return '<button type="button" role="tab" class="cs-disc-tab" id="' + uid + '-t' + i + '" ' +
            'aria-controls="' + uid + '-p' + i + '" aria-selected="' + (i === 0 ? 'true' : 'false') + '" ' +
            'tabindex="' + (i === 0 ? '0' : '-1') + '">' + (it.label || '') + '</button>';
      }).join('');
      var panels = (b.items || []).map(function(it, i) {
        return '<div role="tabpanel" class="cs-disc-panel" id="' + uid + '-p' + i + '" ' +
            'aria-labelledby="' + uid + '-t' + i + '"' + (i === 0 ? '' : ' hidden') + '>' +
            (it.html || '') + '</div>';
      }).join('');
      return '<section class="cs-disclosure wide" data-disclosure>' +
          '<div class="cs-disc-head">' + (b.label || 'more detail') + '</div>' +
          '<div class="cs-disc-tabs" role="tablist" aria-label="' + (b.label || 'More detail') + '">' + tabs + '</div>' +
          panels +
        '</section>';
    }

    // The product model: a tab per job, each with its own screens beside it.
    function modelHTML(b) {
      var uid = 'csm' + (++csPanelSeq);
      var tabs = (b.items || []).map(function(it, i) {
        var n = (i + 1 < 10 ? '0' : '') + (i + 1);
        return '<button type="button" role="tab" class="cs-model-tab" id="' + uid + '-t' + i + '" ' +
            'aria-controls="' + uid + '-p' + i + '" aria-selected="' + (i === 0 ? 'true' : 'false') + '" ' +
            'tabindex="' + (i === 0 ? '0' : '-1') + '">' +
            '<span class="m-num">' + n + '</span><span class="m-name">' + (it.name || '') + '</span>' +
          '</button>';
      }).join('');
      var panels = (b.items || []).map(function(it, i) {
        var list = (it.features || []).map(function(f) { return '<li>' + f + '</li>'; }).join('');
        var shots = (it.shots || []).map(function(s) { return shotHTML(s.file, s.alt, 'phone'); }).join('');
        return '<div role="tabpanel" class="cs-model-panel" id="' + uid + '-p' + i + '" ' +
            'aria-labelledby="' + uid + '-t' + i + '"' + (i === 0 ? '' : ' hidden') + '>' +
            '<div class="m-copy"><p class="m-desc">' + (it.desc || '') + '</p>' +
              (list ? '<ul class="m-features">' + list + '</ul>' : '') + '</div>' +
            '<div class="m-shots">' + shots + '</div>' +
          '</div>';
      }).join('');
      return '<section class="cs-model wide" data-model>' +
          '<div class="cs-model-tabs" role="tablist" aria-label="Product model">' + tabs + '</div>' +
          panels +
        '</section>';
    }

    // One screen given real size, with short notes pointing at parts of it.
    function annotatedHTML(b) {
      var notes = (b.notes || []).map(function(n) {
        return '<li><strong>' + (n.title || '') + '</strong><span>' + (n.text || '') + '</span></li>';
      }).join('');
      return '<div class="cs-annotated wide">' +
          shotHTML(b.file, b.alt, isBabySteps ? 'phone hero-shot' : 'hero-shot') +
          (notes ? '<ul class="cs-annots">' + notes + '</ul>' : '') +
        '</div>';
    }

    // Sticky phone, steps advancing beside it. Falls back to a plain stacked
    // sequence when the viewport is short or motion is reduced.
    function walkthroughHTML(b) {
      var steps = (b.steps || []).map(function(s, i) {
        var n = (i + 1 < 10 ? '0' : '') + (i + 1);
        return '<li class="cs-step' + (i === 0 ? ' on' : '') + '" data-step="' + i + '">' +
            '<span class="s-num">' + n + '</span>' +
            '<strong>' + (s.title || '') + '</strong>' +
            '<p>' + (s.text || '') + '</p>' +
            shotHTML(s.file, s.alt, 'phone inline-shot') +
          '</li>';
      }).join('');
      var stack = (b.steps || []).map(function(s, i) {
        return '<div class="cs-walk-frame' + (i === 0 ? ' on' : '') + '" data-frame="' + i + '">' +
          shotHTML(s.file, s.alt, 'phone') + '</div>';
      }).join('');
      return '<div class="cs-walk wide" data-walk>' +
          '<div class="cs-walk-sticky"><div class="cs-walk-stage">' + stack + '</div></div>' +
          '<ol class="cs-walk-steps">' + steps + '</ol>' +
        '</div>';
    }

    // Two visual stories side by side, image-led.
    function duoHTML(b) {
      return '<div class="cs-duo wide">' +
        (b.items || []).map(function(it) {
          return '<div class="cs-duo-item">' +
              (it.file ? shotHTML(it.file, it.alt, 'phone') : '') +
              '<div class="d-copy"><strong>' + (it.title || '') + '</strong>' +
                '<p>' + (it.text || '') + '</p></div>' +
            '</div>';
        }).join('') +
      '</div>';
    }

    // Rough → resolved, as a labelled progression rather than a fake overlay.
    function progressionHTML(b) {
      return '<div class="cs-prog wide' + (b.layout === 'stack' ? ' stack' : '') + '">' +
          (b.caption ? '<div class="p-cap">' + b.caption + '</div>' : '') +
          '<div class="p-row">' +
            (b.stages || []).map(function(s, i) {
              return '<div class="p-stage">' +
                  '<div class="p-label">' + (s.label || '') + '</div>' +
                  shotHTML(s.file, s.alt, s.phone ? 'phone' : '') +
                '</div>' + (i < (b.stages || []).length - 1 ? '<div class="p-arrow" aria-hidden="true">→</div>' : '');
            }).join('') +
          '</div>' +
        '</div>';
    }

    // A single line, given the whole width, to end on.
    function biglineHTML(b) {
      return '<p class="cs-bigline wide">' + (b.text || '') + '</p>';
    }

    // Wide image the reader can open full size.
    function plateHTML(b) {
      return '<figure class="cs-plate wide">' +
          '<img referrerpolicy="no-referrer" loading="lazy" decoding="async" src="images/case-studies/' + b.file + '" alt="' + (b.alt || '') + '" />' +
          (b.caption ? '<figcaption>' + b.caption + '</figcaption>' : '') +
        '</figure>';
    }
    // ---- Wire up the narrative interactions -------------------------------

    // Called once per render. Everything degrades to plain content if these
    // never run: panels are visible, steps are stacked, images still load.
    function initStoryInteractions(root) {
      // Tabs, shared by the research disclosure and the product model.
      function wireTabs(scope, tabSel, panelSel) {
        var tabs = Array.prototype.slice.call(scope.querySelectorAll(tabSel));
        var panels = Array.prototype.slice.call(scope.querySelectorAll(panelSel));
        if (!tabs.length) return;
        function select(i, focus) {
          tabs.forEach(function(t, j) {
            var on = j === i;
            t.setAttribute('aria-selected', on ? 'true' : 'false');
            t.setAttribute('tabindex', on ? '0' : '-1');
            t.classList.toggle('on', on);
          });
          panels.forEach(function(p, j) { p.hidden = j !== i; });
          if (focus) tabs[i].focus();
        }
        tabs.forEach(function(t, i) {
          t.addEventListener('click', function() { select(i); });
          t.addEventListener('keydown', function(e) {
            var k = e.key, n = tabs.length, next = null;
            if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % n;
            else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + n) % n;
            else if (k === 'Home') next = 0;
            else if (k === 'End') next = n - 1;
            if (next !== null) { e.preventDefault(); select(next, true); }
          });
        });
      }

      Array.prototype.forEach.call(root.querySelectorAll('[data-disclosure]'), function(d) {
        wireTabs(d, '.cs-disc-tab', '.cs-disc-panel');
      });
      Array.prototype.forEach.call(root.querySelectorAll('[data-model]'), function(m) {
        wireTabs(m, '.cs-model-tab', '.cs-model-panel');
      });

      // The walkthrough is a plain numbered list of steps, each with its own
      // screen above it — the same treatment every other section gets. The
      // stacked inline shots are always in the markup, so this just marks the
      // block so the stylesheet uses them.
      Array.prototype.forEach.call(root.querySelectorAll('[data-walk]'), function(walk) {
        walk.classList.add('no-sticky');
      });
    }

    function tableHTML(b) {
      var head = (b.head || []).map(function(h) { return '<th>' + h + '</th>'; }).join('');
      var body = (b.rows || []).map(function(r) {
        return '<tr>' + r.map(function(c, ci) {
          return ci === 0 ? '<th scope="row">' + c + '</th>' : '<td>' + c + '</td>';
        }).join('') + '</tr>';
      }).join('');
      return '<div class="cs-tablewrap wide"><table class="cs-table">' +
          (head ? '<thead><tr>' + head + '</tr></thead>' : '') +
          '<tbody>' + body + '</tbody>' +
        '</table></div>';
    }

    // Persona card: portrait and facts on the left, bio, goals and frustrations
    // on the right, as one unit rather than three loose blocks.
    function personaHTML(b) {
      var facts = (b.facts || []).map(function(f) {
        return '<div class="p-fact"><span class="k">' + f[0] + '</span><span class="v">' + f[1] + '</span></div>';
      }).join('');
      var img = b.img
        ? '<div class="p-portrait"><img referrerpolicy="no-referrer" loading="lazy" decoding="async" src="images/case-studies/' + b.img +
          '" alt="' + (b.name || 'persona') + '" onerror="this.style.display=\'none\'" /></div>'
        : '';
      function part(label, text) {
        return text ? '<div class="p-part"><div class="p-label">' + label + '</div><p>' + text + '</p></div>' : '';
      }
      return '<div class="cs-persona wide">' +
          '<div class="p-left">' + img +
            '<div class="p-name">' + (b.name || '') + '</div>' +
            (facts ? '<div class="p-facts">' + facts + '</div>' : '') +
          '</div>' +
          '<div class="p-right">' +
            part('bio', b.bio) +
            part('goals', b.goals) +
            part('frustrations', b.frustrations) +
          '</div>' +
        '</div>';
    }

    function processHTML(b) {
      return '<div class="cs-process wide" aria-label="Process">' +
        (b.items || []).map(function(item, stepIndex) {
          var stepNum = (stepIndex + 1 < 10 ? '0' : '') + (stepIndex + 1);
          return '<div class="cs-process-step">' +
              '<span class="step-num">' + stepNum + '</span>' +
              '<strong>' + item.title + '</strong>' +
              '<small>' + item.text + '</small>' +
            '</div>';
        }).join('') +
      '</div>';
    }



    // --- 1. Cover: title block on the left, hero on the right ---
    var docHeader = document.createElement('div');
    docHeader.className = 'cs-cover';

    var heroFile = cs.heroImg || (slug + '-hero.png');
    var metaCells = ['role', 'platform', 'timeline', 'team'].filter(function(k) {
      return cs.metadata && cs.metadata[k];
    }).map(function(k) {
      return '<div><div class="k">' + k + '</div><div class="val">' + cs.metadata[k] + '</div></div>';
    }).join('');

    // Flat cover: title and standfirst on the page, hero beside them. The rose
    // panel is gone — it was the only saturated surface in an otherwise calm
    // document, and it made the opening read as a banner rather than a title.
    // Standfirst comes from the first prose block, never the statement — the
    // statement appears in full a screen below and repeating it reads as a bug.
    var standfirst = cs.summary || '';
    var firstSec = cs.sections[0];
    if (!standfirst && firstSec) {
      var fb = (firstSec.blocks || []).filter(function(b) { return b.type === 'text' && b.content; })[0];
      if (fb) standfirst = fb.content;
    }
    docHeader.innerHTML =
      '<div class="cs-cover-text">' +
        '<p class="cs-kicker">case study ✦ ' + cs.sections.length + ' sections</p>' +
        '<h1 class="cs-title">' + cs.title + '</h1>' +
        (standfirst ? '<p class="cs-standfirst">' + standfirst + '</p>' : '') +
      '</div>' +
      '<figure class="cs-figure">' + frameHTML(heroFile, cs.title + ' hero', true) + '</figure>';
    readingContainer.appendChild(docHeader);

    // Metadata as a full-width strip under the cover, divided by hairlines.
    if (metaCells) {
      var metaStrip = document.createElement('div');
      metaStrip.className = 'cs-metastrip';
      metaStrip.innerHTML = metaCells;
      readingContainer.appendChild(metaStrip);
    }


    // A compact story map gives recruiters the shape of the project before
    // they commit to the full read. It is derived from the authored study,
    // so each project stays accurate without maintaining duplicate copy.
    // The "at a glance" cards used to sit here. They restated the first paragraph
    // of two sections that follow immediately below, and the CSS clamped them
    // mid-sentence, so they read as broken duplicates. Removed.

    // --- 2. Generate Sections ---
    var lastChapter = null;
    var articleChapter = null;
    var articleAct = 0;
    cs.sections.forEach(function(section, idx) {
      // Add to contents rail
      var btn = document.createElement('button');
      btn.className = 'rail-section-item';
      var sectionNumber = idx + 1;
      var numStr = (sectionNumber < 10 ? '0' : '') + sectionNumber;
      // Sidebar reads as the project's files: 01_context, 02_approach, ...
      var railSlug = section.rail ? String(section.rail) : String(section.title || '')
        .toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      btn.innerHTML = '<span class="rn">' + numStr + '</span>' +
        '<span class="rf">' + numStr + '_' + railSlug + '</span>';
      btn.setAttribute('aria-label', numStr + ' ' + section.title);

      btn.addEventListener('click', function() {
        var targetBlock = readingContainer.querySelector('#cs-sec-' + idx);
        if (targetBlock) {
          // offsetTop is stable inside the reading document and does not drift
          // as lazy images or the horizontal mobile rail finish laying out.
          var top = Math.max(0, targetBlock.offsetTop - 10);
          viewer._csJumpActive = { rail: idx, section: idx + 1, top: top };
          readingPane.scrollTo({ top: top, behavior: reducedMotion() ? 'instant' : 'smooth' });

          railList.querySelectorAll('.rail-section-item').forEach(function(item) {
            item.classList.remove('active-rose');
          });
          btn.classList.add('active-rose');
          var cur = viewer.querySelector('.hlp-cur');
          if (cur) cur.textContent = '· ' + (idx === 0 ? 'overview' : section.title);

          // Keep the selected file visible in the compact horizontal rail.
          var railScroller = viewer.querySelector('.hlp-rail');
          if (railScroller && railScroller.scrollWidth > railScroller.clientWidth) {
            var left = btn.offsetLeft - (railScroller.clientWidth - btn.offsetWidth) / 2;
            railScroller.scrollTo({ left: Math.max(0, left), behavior: reducedMotion() ? 'instant' : 'smooth' });
          }
        }
      });

      // Group rail items under chapter headings when the study defines them,
      // so a 13-section contents list reads as four acts rather than a
      // flat wall. Reuses the my-work rail's grouping pattern.
      if (section.chapter && section.chapter !== lastChapter) {
        lastChapter = section.chapter;
        var chapHead = document.createElement('div');
        chapHead.className = 'rail-chapter';
        chapHead.textContent = section.chapter;
        railList.appendChild(chapHead);
      }

      railList.appendChild(btn);

      if (section.chapter && section.chapter !== articleChapter) {
        articleChapter = section.chapter;
        articleAct++;
        var chapterDivider = document.createElement('div');
        chapterDivider.className = 'cs-chapter-divider';
        chapterDivider.setAttribute('data-act', (articleAct < 10 ? '0' : '') + articleAct);
        chapterDivider.textContent = section.chapter;
        readingContainer.appendChild(chapterDivider);
      }

      // Add section container to reading pane
      var block = document.createElement('div');
      block.className = 'section-block cs-block cs-block--' + section.type +
        (section.statement && section.type !== 'hook' && section.type !== 'reflection' ? ' cs-block--split' : '');
      block.id = 'cs-sec-' + idx;

      var innerHTML = '';
      var blocks = section.blocks || [];

      // Section heading: number, title, dashed rule to the margin
      // Header reads like a file in the project: "01 / THE CONTEXT" with the
      // path beneath it, matching the sidebar's file list.
      var sectionSlug = String(section.title || '')
        .toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      // Most chapters name themselves with the same sentence that follows as
      // the claim. Marking the echo lets the stylesheet show it once; the
      // string itself is untouched, and the rail, the toolbar and screen
      // readers all still get it.
      var claimText = section.statement && section.statement.text ? section.statement.text : '';
      var claimLabel = section.statement && section.statement.label ? section.statement.label : '';
      var norm = function(s) {
        return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      };
      // A title echoes the claim beneath it when it is that sentence, leads
      // into it, or says the same thing in slightly different words — chapter
      // 06 is titled "Get care without another hospital trip" above a claim
      // reading "Get care without making the first step another hospital
      // trip". The loose test is deliberately narrow: it needs a title of at
      // least four words, near-total word overlap, AND the same opening
      // phrase. Compass's short section names ("the problem", "the goal") must
      // never be caught by it, because there the name is the only heading.
      var words = function(s) { return norm(s).split(' ').filter(Boolean); };
      var saysTheSame = function(title, claim) {
        var tw = words(title), cw = words(claim);
        if (tw.length < 4) return false;
        var shared = tw.filter(function(x) { return cw.indexOf(x) !== -1; }).length;
        return shared / tw.length >= 0.85 && tw[0] === cw[0] && tw[1] === cw[1];
      };
      var isEcho = !!norm(section.title) && (
        (claimText && (norm(claimText) === norm(section.title) ||
                       norm(claimText).indexOf(norm(section.title) + ' ') === 0 ||
                       saysTheSame(section.title, claimText))) ||
        (claimLabel && norm(claimLabel) === norm(section.title)));
      var headerHTML =
        '<h3 class="cs-head"' + (isEcho ? ' data-echo' : '') + '>' +
          '<span class="num">' + numStr + '</span>' +
          '<span class="cs-head-label">' + section.title + '</span>' +
          '<span class="cs-head-path">' + slug + '/' + sectionSlug + '.md</span>' +
          (idx === 0 ? '<span class="cs-head-stamp">case study <b>' +
            (cs.metadata && cs.metadata.timeline ? cs.metadata.timeline : '') + '</b> <i></i></span>' : '') +
        '</h3>';

      // A. The hook keeps the same numbered file heading as every other band.
      if (section.type === 'hook') {
        var hookText = section.content || (blocks[0] && blocks[0].content) || '';
        innerHTML += headerHTML;
        innerHTML +=
          '<div class="cs-hook wide">' +
            '<span class="lab">' + (section.label || section.title) + '</span>' +
            '<p>' + hookText + '</p>' +
          '</div>';

      // B. The reflection: upright cream note card, house bevel
      } else if (section.type === 'reflection') {
        // Every text block, not just the first: a reflection that runs to more
        // than one paragraph used to have the rest silently dropped.
        var reflectionText = section.content || blocks.filter(function(b) {
          return b.type === 'text' && b.content;
        }).map(function(b) {
          return '<p>' + b.content + '</p>';
        }).join('') || '';
        innerHTML += headerHTML;
        innerHTML +=
          '<div class="cs-note">' +
            '<span class="mark">♡</span>' +
            '<div class="body">' + reflectionText + '</div>' +
          '</div>';

      } else {
        innerHTML += headerHTML;

        // B2. A statement band leads the section: tiny label, one large
        //     claim, and an optional note offset right on a lower baseline.
        if (section.statement) {
          var st = section.statement;
          // Only sections that ask for it get the full panel. The rest lead
          // with the same claim as plain type, so the band keeps its force.
          var cls = st.band ? ('cs-statement wide' + (st.tone === 'rose' ? ' rose' : '')) : 'cs-lead';
          innerHTML +=
            '<div class="' + cls + '">' +
              '<span class="lab">' + (st.label || section.title) + '</span>' +
              '<div class="big">' + st.text + '</div>' +
              (st.sub ? '<div class="sub">' + st.sub + '</div>' : '') +
            '</div>';
        }

        // C. Pull-quote / pull-stat becomes an aside beside the prose.
        //    Any section may carry one, not just problem/context.
        var pQuote = section.pullQuote || '';
        var pStat = section.pullStat || null;
        blocks.forEach(function(b) {
          if (b.type === 'pull-quote') pQuote = b.text;
          if (b.type === 'pull-stat') pStat = b;
        });

        var asideHTML = '';
        if (pQuote) {
          asideHTML = '<aside class="cs-aside quote"><p>' + pQuote + '</p></aside>';
        } else if (pStat) {
          asideHTML = '<aside class="cs-aside">' + statHTML(pStat) + '</aside>';
        }

        // Walk the blocks in order so prose still introduces the figure
        // that follows it. Consecutive figures collapse into a 2-up grid
        // and consecutive decisions into a 2-up card grid, so a section
        // with several of either stops being a single tall stack.
        var parts = [];
        var figBuf = [];
        var decBuf = [];

        function flushFigs() {
          if (!figBuf.length) return;
          if (figBuf.length > 1) {
            parts.push('<div class="cs-figs wide">' + figBuf.map(figureHTML).join('') + '</div>');
          } else {
            parts.push(figureHTML(figBuf[0]));
          }
          figBuf = [];
        }
        function flushDecs() {
          if (!decBuf.length) return;
          var inner = decBuf.map(function(b, decisionIndex) {
            var decisionNum = (decisionIndex + 1 < 10 ? '0' : '') + (decisionIndex + 1);
            return '<div class="cs-decision">' +
                '<span class="tab">design decision</span>' +
                '<span class="decision-index">' + decisionNum + '</span>' +
                '<div class="what">' + b.decision + '</div>' +
                '<div class="trade"><b>trade-off</b>' + b.tradeoff + '</div>' +
              '</div>';
          }).join('');
          parts.push(decBuf.length > 1 ? '<div class="cs-decisions wide">' + inner + '</div>' : inner);
          decBuf = [];
        }

        if (blocks.length) {
          blocks.forEach(function(b) {
            // Phone and screen exports stay in compact visual rows even when an
            // older data entry marked one as wide. Only contextual bleed images
            // earn a full-width break in the document.
            if (b.type === 'image' && !b.bleed) { flushDecs(); figBuf.push(b); return; }
            if (b.type === 'decision') { flushFigs(); decBuf.push(b); return; }
            flushFigs(); flushDecs();
            if (b.type === 'text') {
              parts.push('<div class="cs-prose">' + b.content + '</div>');
            } else if (b.type === 'image') {
              parts.push(figureHTML(b));
            } else if (b.type === 'cards') {
              parts.push(storyCardsHTML(b));
            } else if (b.type === 'checklist') {
              parts.push(checklistHTML(b));
            } else if (b.type === 'note') {
              parts.push(noteHTML(b));
            } else if (b.type === 'screenrow') {
              parts.push(screenRowHTML(b));
            } else if (b.type === 'panel') {
              parts.push(panelHTML(b));
            } else if (b.type === 'cardrow') {              parts.push(cardRowHTML(b));            } else if (b.type === 'strip') {              parts.push(stripHTML(b));            } else if (b.type === 'statements') {              parts.push(statementsHTML(b));            } else if (b.type === 'insights') {              parts.push(insightsHTML(b));            } else if (b.type === 'disclosure') {              parts.push(disclosureHTML(b));            } else if (b.type === 'model') {              parts.push(modelHTML(b));            } else if (b.type === 'annotated') {              parts.push(annotatedHTML(b));            } else if (b.type === 'walkthrough') {              parts.push(walkthroughHTML(b));            } else if (b.type === 'duo') {              parts.push(duoHTML(b));            } else if (b.type === 'progression') {              parts.push(progressionHTML(b));            } else if (b.type === 'bigline') {              parts.push(biglineHTML(b));            } else if (b.type === 'plate') {              parts.push(plateHTML(b));            } else if (b.type === 'table') {              parts.push(tableHTML(b));            } else if (b.type === 'persona') {              parts.push(personaHTML(b));            } else if (b.type === 'process') {
              parts.push(processHTML(b));
            }
          });
        } else {
          // Legacy shape: bare content + images array
          if (section.content) parts.push('<div class="cs-prose">' + section.content + '</div>');
          (section.images || []).forEach(function(img) { figBuf.push(img); });
        }
        flushFigs(); flushDecs();

        // An aside pairs with the section's opening prose, and everything
        // else runs full width beneath it.
        if (asideHTML) {
          var lead = '';
          for (var pi = 0; pi < parts.length; pi++) {
            if (parts[pi].indexOf('<div class="cs-prose"') === 0) {
              lead = parts.splice(pi, 1)[0];
              break;
            }
          }
          innerHTML += '<div class="cs-row wide">' +
              '<div class="cs-col">' + lead + '</div>' +
              asideHTML +
            '</div>';
        }
        innerHTML += parts.join('');

        // D. Outcome stat row
        if (section.stats && section.stats.length > 0) {
          innerHTML += '<div class="cs-stats">' + section.stats.map(statHTML).join('') + '</div>';
        }
      }

      block.innerHTML = innerHTML;
      readingContainer.appendChild(block);
    });

    // Case study info card, pinned under the file list in the sidebar.
    var infoRows = [
      { k: 'role', v: cs.metadata && cs.metadata.role },
      { k: 'platform', v: cs.metadata && cs.metadata.platform },
      { k: 'team', v: cs.metadata && cs.metadata.team },
      { k: 'timeline', v: cs.metadata && cs.metadata.timeline }
    ].filter(function(r) { return r.v; });
    if (infoRows.length) {
      var infoCard = document.createElement('div');
      infoCard.className = 'cs-rail-info';
      infoCard.innerHTML =
        '<div class="cs-rail-info-title">case study info</div>' +
        infoRows.map(function(r) {
          return '<div class="cs-rail-info-row"><span class="k">' + r.k + '</span><span class="v">' + r.v + '</span></div>';
        }).join('');
      railList.appendChild(infoCard);
    }

    // Seed the toolbar indicator so it reads correctly before any scroll
    var curEl = viewer.querySelector('.hlp-cur');
    if (curEl) curEl.textContent = '· overview';

    initStoryInteractions(readingContainer);

    // Re-measure for the scroll spy: new document, new section offsets
    viewer._csTitles = ['overview'].concat(cs.sections.map(function(s) { return s.title; }));
    viewer._csLastIdx = -1;
    viewer._csLastRailIdx = -1;
    if (viewer._csCacheOffsets) requestAnimationFrame(function() {
      viewer._csCacheOffsets();
      if (viewer._csUpdateScrollState) viewer._csUpdateScrollState();
    });

    // Add next/back links
    var bottomRow = document.createElement('div');
    bottomRow.className = 'cs-footer';

    // Walk the published list in order rather than wrapping around every key in
    // `caseStudies`. The old version wrapped, so the last study pointed back at
    // the first and drafts were offered as though they were readable.
    var csOrder = PUBLISHED_CASE_STUDIES.filter(function(k){ return caseStudies[k]; });
    var currentIdx = csOrder.indexOf(normName);
    var nextKey = (currentIdx !== -1 && currentIdx + 1 < csOrder.length)
      ? csOrder[currentIdx + 1]
      : null;

    bottomRow.innerHTML =
      '<button class="back-work-btn cs-btn secondary">← back to my work</button>' +
      '<span class="cs-eof">you’ve reached the end of ' + slug + '.hlp</span>' +
      // No next means no button at all, rather than a link to nowhere.
      (nextKey
        ? '<button class="next-cs-btn cs-btn primary">next: ' + caseStudies[nextKey].title.toLowerCase() + ' →</button>'
        : '');

    var nextCsBtn = bottomRow.querySelector('.next-cs-btn');
    if (nextCsBtn) nextCsBtn.addEventListener('click', function() {
      readingPane.scrollTop = 0;
      renderCaseStudy(nextKey);
      Genie.invalidate('viewer');
      Genie.warm(viewer);
    });

    bottomRow.querySelector('.back-work-btn').addEventListener('click', function() {
      closeWin(viewer);
      openWin('work');
    });

    readingContainer.appendChild(bottomRow);
  }

  // A case study opens only when there is a written study behind it and it is
  // not being held back. This sits here rather than on the individual cards
  // because five separate places call openProject — the work rail, the desktop
  // icons, the phone carousel and the marquee twice — and a check on any one of
  // them would leave the others able to walk straight past it.
  //
  // It also closes a hole: renderCaseStudy falls back to its own template when a
  // name has no study, so the marquee was opening a viewer full of scaffolding —
  // "[hook line goes here]", "[lead designer]" — for every card without one.
  function caseStudyReady(name){
    var data = PROJECT_DATA[name];
    if (data && data.status === 'coming-soon') return false;
    var key = String(name || '').toLowerCase().trim();
    if (key === 'babysteps' || key === 'baby-steps') key = 'baby steps';
    return !!caseStudies[key];
  }

  function openProject(name,cardEl){
    if(!caseStudyReady(name)) return;
    if(!viewer){
      viewer=document.createElement('section');viewer.className='window pout';viewer.id='viewer';
      viewer.style.cssText='top:40px;left:130px;width:1100px;height:70vh;';
      viewer.innerHTML=
        '<div class="tbar"><span class="tt"><i class="ti ti-help-circle" aria-hidden="true"></i><span class="vname"></span></span>'+
        '<span class="tctl"><button class="pout mn" aria-label="Minimize"><i class="ti ti-minus"></i></button><button class="pout mx" aria-label="Maximize"><i class="ti ti-square"></i></button><button class="pout cl" aria-label="Close"><i class="ti ti-x"></i></button></span></div>'+
        '<div class="hlp-toolbar"><span style="display:flex;align-items:center;gap:8px;min-width:0;">'+
        '<span class="hlp-doc-name" style="font-weight:bold; color:var(--muted);"></span>'+
        '<span class="hlp-cur" style="color:var(--rose); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></span></span>'+
        '<div style="display:flex; align-items:center; gap:8px;"><span style="color:var(--muted); font-size:9.5px;">progress:</span>'+
        '<div style="width:100px; height:8px; background:var(--btn); border-radius:4px; overflow:hidden; display:inline-block;" class="pins"><div class="progress-bar" style="width:0%; height:100%; background:var(--rose); transition:width 0.12s ease;"></div></div></div></div>'+
        '<div class="wpad hlp-wbody" style="padding:0; display:flex; flex-direction:column; height:calc(100% - 57px); overflow:hidden; border-radius:0 0 5px 5px;">'+
        '<div class="hlp-layout">'+
        '  <div class="hlp-rail">'+
        '    <div>'+
        '      <div class="hlp-project-summary">'+
        '        <span class="overline">case study reader</span>'+
        '        <strong class="hlp-project-title"></strong>'+
        '        <small class="hlp-project-platform"></small>'+
        '      </div>'+
        '      <div class="hlp-rail-title">contents ✦</div>'+
        '      <div class="hlp-rail-list"></div>'+
        '    </div>'+
        '    <div class="hlp-metadata" style="display:none;">'+
        '      <div class="hlp-metadata-title">metadata ✿</div>'+
        '      <div class="meta-role"></div>'+
        '      <div class="meta-timeline"></div>'+
        '      <div class="meta-team"></div>'+
        '      <div class="meta-platform"></div>'+
        '    </div>'+
        '  </div>'+
        '  <div class="hlp-reading-pane" tabindex="0" style="flex:1; overflow-y:auto; outline:none; position:relative;">'+
        '    <div class="reading-container" style="display:flex; flex-direction:column; gap:var(--cs-gap); position:relative; width:100%;"></div>'+
        '  </div>'+
        '</div></div>';

      desktop.appendChild(viewer);
      viewer.addEventListener('mousedown',function(){setActive(viewer);},true);
      viewer.querySelector('.cl').addEventListener('click',function(e){e.stopPropagation();closeWin(viewer);});
      viewer.querySelector('.mn').addEventListener('click',function(e){e.stopPropagation();minWin(viewer);});
      viewer.querySelector('.mx').addEventListener('click',function(e){e.stopPropagation();maxWin(viewer);});

      var rp = viewer.querySelector('.hlp-reading-pane');
      var pb = viewer.querySelector('.progress-bar');

      // Scroll bookkeeping is rAF-throttled and reads cached offsets, so a
      // scroll event never triggers a layout-per-section. The Genie texture
      // re-capture is debounced the same 350ms every other window uses;
      // running it per event re-rasterised the whole document while scrolling.
      var scrollQueued = false, genieT = null;

      // Section offsets are measured once per render (and whenever the
      // content resizes, e.g. images finishing load) instead of per event.
      function cacheOffsets() {
        var container = viewer.querySelector('.reading-container');
        if (!container) return;
        var blocks = container.querySelectorAll('.cs-cover, .section-block');
        var offs = [];
        for (var i = 0; i < blocks.length; i++) offs.push(blocks[i].offsetTop);
        viewer._csOffsets = offs;
        viewer._csRailItems = viewer.querySelectorAll('.rail-section-item');
      }
      viewer._csCacheOffsets = cacheOffsets;

      if (window.ResizeObserver) {
        var ro = new ResizeObserver(function() { cacheOffsets(); });
        ro.observe(viewer.querySelector('.reading-container'));
      }

      function updateScrollState() {
        scrollQueued = false;
        var scrollTotal = rp.scrollHeight - rp.clientHeight;
        var progress = scrollTotal > 0 ? (rp.scrollTop / scrollTotal) * 100 : 0;
        pb.style.width = Math.min(100, Math.max(0, progress)) + '%';

        var offsets = viewer._csOffsets;
        if (!offsets || !offsets.length) return;

        var probe = rp.scrollTop + 120;
        var activeIdx = 0;
        for (var i = 0; i < offsets.length; i++) {
          if (offsets[i] <= probe) activeIdx = i; else break;
        }
        if (viewer._csJumpActive) {
          if (activeIdx === viewer._csJumpActive.section || Math.abs(rp.scrollTop - viewer._csJumpActive.top) < 4) {
            viewer._csJumpActive = null;
          } else {
            return;
          }
        }
        var railIdx = Math.max(0, activeIdx - 1);
        if (activeIdx === viewer._csLastIdx && railIdx === viewer._csLastRailIdx) return;
        viewer._csLastIdx = activeIdx;
        viewer._csLastRailIdx = railIdx;

        var railItems = viewer._csRailItems || viewer.querySelectorAll('.rail-section-item');
        for (var j = 0; j < railItems.length; j++) {
          railItems[j].classList.toggle('active-rose', j === railIdx);
        }
        var railScroller = viewer.querySelector('.hlp-rail');
        var activeRail = railItems[railIdx];
        if (railScroller && activeRail && railScroller.scrollWidth > railScroller.clientWidth) {
          var left = activeRail.offsetLeft - (railScroller.clientWidth - activeRail.offsetWidth) / 2;
          railScroller.scrollTo({ left: Math.max(0, left), behavior: reducedMotion() ? 'instant' : 'smooth' });
        }
        var cur = viewer.querySelector('.hlp-cur');
        if (cur && viewer._csTitles && viewer._csTitles[activeIdx]) {
          cur.textContent = '· ' + viewer._csTitles[activeIdx];
        }
      }
      viewer._csUpdateScrollState = updateScrollState;

      rp.addEventListener('scroll', function() {
        if (!scrollQueued) {
          scrollQueued = true;
          requestAnimationFrame(updateScrollState);
        }
        clearTimeout(genieT);
        genieT = setTimeout(function() {
          Genie.invalidate('viewer');
          Genie.warm(viewer);
        }, 350);
      }, {passive: true});

      makeDraggable(viewer);
      makeResizable(viewer);
    }

    // Match current sizing/position of #work window exactly
    var workWin = document.getElementById('work');
    if (workWin) {
      viewer.style.cssText = workWin.style.cssText;
      if (workWin.classList.contains('maxed')) {
        viewer.classList.add('maxed');
        viewer.querySelector('.mx i').className='ti ti-squares';
      } else {
        viewer.classList.remove('maxed');
        viewer.querySelector('.mx i').className='ti ti-square';
      }
    } else {
      viewer.classList.remove('maxed');
      viewer.style.cssText='top:40px;left:130px;width:1100px;height:70vh;';
      viewer.querySelector('.mx i').className='ti ti-square';
    }

    renderCaseStudy(name);
    if(isPhoneOS())applyMobileTypeFloor(viewer);

    Genie.invalidate('viewer');
    if(cardEl)viewer._origin=cardEl;
    viewer.classList.add('open');viewer.classList.remove('min');fadeIn(viewer);setActive(viewer);Genie.warm(viewer);
  }

  function makeDraggable(win){
    var bar=win.querySelector('.tbar');var dragging=false,ox=0,oy=0;
    bar.addEventListener('pointerdown',function(e){
      if(e.target.closest('.tctl'))return;if(win.classList.contains('maxed'))return;
      if(window.matchMedia('(max-width:767px)').matches)return;
      dragging=true;setActive(win);var r=win.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove',function(e){
      if(!dragging)return;
      var x=Math.max(0,Math.min(e.clientX-ox,window.innerWidth-90));
      var y=Math.max(0,Math.min(e.clientY-oy,window.innerHeight-80));
      win.style.left=x+'px';win.style.top=y+'px';
    });
    function end(e){if(dragging){dragging=false;try{bar.releasePointerCapture(e.pointerId);}catch(_){}}}
    bar.addEventListener('pointerup',end);bar.addEventListener('pointercancel',end);
  }

  function makeResizable(win){
    var handle=document.createElement('div');
    handle.className='win-resize-handle';
    win.appendChild(handle);
    var resizing=false,startW=0,startH=0,startX=0,startY=0;
    handle.addEventListener('pointerdown',function(e){
      if(win.classList.contains('maxed'))return;
      e.stopPropagation();e.preventDefault();
      resizing=true;setActive(win);
      var r=win.getBoundingClientRect();
      startW=r.width;startH=r.height;
      startX=e.clientX;startY=e.clientY;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove',function(e){
      if(!resizing)return;
      e.stopPropagation();e.preventDefault();
      var dw=e.clientX-startX,dh=e.clientY-startY;
      var w=Math.max(280,Math.min(startW+dw,window.innerWidth-32));
      var h=Math.max(180,Math.min(startH+dh,window.innerHeight-80));
      win.style.width=w+'px';win.style.height=h+'px';
    });
    function endResize(e){
      if(resizing){
        resizing=false;
        try{handle.releasePointerCapture(e.pointerId);}catch(_){}
        Genie.invalidate(win.id);Genie.warm(win);
      }
    }
    handle.addEventListener('pointerup',endResize);
    handle.addEventListener('pointercancel',endResize);
  }

  var Camera=(function(){
    var cam=document.getElementById('camera');var layer=document.getElementById('prints');if(!cam||!layer)return null;
    var eject=document.getElementById('eject');var SPRING='cubic-bezier(.34,1.56,.64,1)';var CAM_ROT=-5;
    var PROJECTS=[
      {img:'images/optimized/vesti-ai-640.webp',cap:'vesti ai',proj:'Vesti AI'},
      {img:'images/optimized/wgc-640.webp',cap:'wgc app',proj:'WGC App'},
      {img:'images/optimized/mintv-640.webp',cap:'mintvtvnews',proj:'MintvTVNews'},
      {img:'images/optimized/alora-640.webp',cap:'alora',proj:'Alora'}
    ];
    var next=0,deck=[],busy=false,waapi=('animate' in Element.prototype);
    function hiddenNow(){return getComputedStyle(cam).display==='none';}
    function taskbarTop(){return document.getElementById('taskbar').getBoundingClientRect().top;}
    function randAngle(){return (Math.random()<.5?-1:1)*(2+Math.random()*6);}
    function buildPrint(p){
      var el=document.createElement('div');el.className='print';el.setAttribute('role','button');el.tabIndex=0;
      el.setAttribute('aria-label','polaroid: '+p.cap+' — open project');el.dataset.proj=p.proj;
      var ph=document.createElement('div');ph.className='ph';var img=document.createElement('img');
      img.alt='';img.draggable=false;img.decoding='async';img.addEventListener('error',function(){img.remove();});img.src=p.img;
      ph.appendChild(img);var cap=document.createElement('span');cap.className='cap';cap.textContent=p.cap;
      el.appendChild(ph);el.appendChild(cap);interactive(el);return el;
    }
    function overlaps(a,b){return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;}
    function keepOut(){
      return ['icons','camera','taskbar'].map(function(id){
        var el=document.getElementById(id);if(!el)return null;var r=el.getBoundingClientRect();
        return {left:r.left-8,top:r.top-8,right:r.right+8,bottom:r.bottom+8};
      }).filter(Boolean);
    }
    function landingSpot(w,h){
      var cr=cam.getBoundingClientRect(),bad=keepOut(),tb=taskbarTop();var minX=20,ic=document.getElementById('icons');
      if(ic)minX=ic.getBoundingClientRect().right+14;
      for(var i=0;i<30;i++){
        var x=cr.left-w-14-Math.random()*Math.random()*280;var y=tb-h-10-Math.random()*Math.random()*170;
        x=Math.max(minX,Math.min(x,window.innerWidth-w-8));y=Math.max(70,Math.min(y,tb-h-10));
        var c={left:x,top:y,right:x+w,bottom:y+h};if(!bad.some(function(b){return overlaps(c,b);}))return {x:x,y:y};
      }
      return {x:Math.max(minX,cr.left-w-40),y:Math.max(70,tb-h-150)};
    }
    function adopt(el){while(deck.length>=4)evict();deck.push(el);}
    function evict(){
      var old=deck.shift();if(!old)return;old.style.pointerEvents='none';
      function gone(){if(old.parentNode)old.parentNode.removeChild(old);}
      if(!waapi){gone();return;}
      if(reducedMotion()){old.animate([{opacity:1},{opacity:0}],{duration:160,fill:'forwards'}).onfinish=gone;return;}
      var r=old.getBoundingClientRect(),ang=parseFloat(old.dataset.ang)||0;
      var toLeft=(r.left+r.width/2)<window.innerWidth/2;var dx=toLeft?-(r.right+60):(window.innerWidth-r.left+60);
      old.animate([{transform:'translate(0,0) rotate('+ang+'deg)'},{transform:'translate('+dx+'px,26px) rotate('+(ang+(toLeft?-14:14))+'deg)'}],{duration:480,easing:'cubic-bezier(.55,0,.8,.55)',fill:'forwards'}).onfinish=gone;
    }
    function place(p,fade){
      var el=buildPrint(p);el.style.visibility='hidden';layer.appendChild(el);
      var s=landingSpot(el.offsetWidth,el.offsetHeight),ang=randAngle();
      el.style.left=s.x+'px';el.style.top=s.y+'px';el.dataset.ang=ang;el.style.transform='rotate('+ang+'deg)';
      adopt(el);el.style.visibility='';
      if(fade){el.classList.add('fadein');el.addEventListener('animationend',function h(){el.classList.remove('fadein');el.removeEventListener('animationend',h);});}
      return el;
    }
    function motorKeyframes(h){
      var kf=[],N=26;
      for(var i=0;i<=N;i++){
        var t=i/N,p;if(t<.14)p=(t/.14)*.2;else p=.2+((t-.14)/.86)*.8;p+=-.018*Math.sin(t*30)*(1-t);p=Math.max(0,Math.min(1,p));
        kf.push({offset:t,transform:'translateY('+((1-p)*h).toFixed(1)+'px)',easing:'linear'});
      }
      kf[N].transform='translateY(0px)';return kf;
    }
    function ejectPrint(p){
      var el=buildPrint(p);eject.appendChild(el);var w=el.offsetWidth,h=el.offsetHeight;
      eject.style.width=(w+12)+'px';eject.style.height=(h+4)+'px';el.style.left='50%';el.style.marginLeft=(-w/2)+'px';el.style.bottom='0';el.style.transform='translateY('+(h+4)+'px)';
      var a=el.animate(motorKeyframes(h+4),{duration:1050,easing:'linear',fill:'forwards'});
      a.onfinish=function(){setTimeout(function(){drop(el);},320);};
    }
    function drop(el){
      var r=el.getBoundingClientRect();var cx=r.left+r.width/2,cy=r.top+r.height/2;var w=el.offsetWidth,h=el.offsetHeight;
      var s=landingSpot(w,h),ang=randAngle();layer.appendChild(el);
      el.style.left=s.x+'px';el.style.top=s.y+'px';el.style.bottom='';el.style.marginLeft='';el.dataset.ang=ang;el.style.transform='rotate('+ang+'deg)';
      adopt(el);var dx=cx-(s.x+w/2),dy=cy-(s.y+h/2);
      el.animate([{transform:'translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px) rotate('+CAM_ROT+'deg)',easing:'cubic-bezier(.5,.06,.65,.4)'},{transform:'translate('+(dx*.1).toFixed(1)+'px,'+(dy*.05+7).toFixed(1)+'px) rotate('+(ang+3.5)+'deg)',offset:.78,easing:SPRING},{transform:'translate(0,0) rotate('+ang+'deg)'}],{duration:640});
      busy=false;
    }
    function shoot(){
      if(busy||hiddenNow())return;var p=PROJECTS[next%PROJECTS.length];next++;
      if(reducedMotion()||!waapi){place(p,true);return;}
      busy=true;cam.classList.add('snap');setTimeout(function(){cam.classList.remove('snap');},520);setTimeout(function(){ejectPrint(p);},170);
    }
    function interactive(el){
      var down=false,moved=false,sx=0,sy=0,ox=0,oy=0;
      el.addEventListener('pointerdown',function(e){
        if(e.button)return;down=true;moved=false;sx=e.clientX;sy=e.clientY;
        var r=el.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;layer.appendChild(el);
        try{el.setPointerCapture(e.pointerId);}catch(_){}
      });
      el.addEventListener('pointermove',function(e){
        if(!down)return;
        if(!moved){if(Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)<5)return;moved=true;el.classList.add('lift');}
        var tb=taskbarTop();var x=Math.max(4,Math.min(e.clientX-ox,window.innerWidth-el.offsetWidth-4));
        var y=Math.max(4,Math.min(e.clientY-oy,tb-el.offsetHeight-4));el.style.left=x+'px';el.style.top=y+'px';
      });
      function up(e){
        if(!down)return;down=false;el.classList.remove('lift');try{el.releasePointerCapture(e.pointerId);}catch(_){}
        if(!moved)openProject(el.dataset.proj,el);
      }
      el.addEventListener('pointerup',up);el.addEventListener('pointercancel',function(){down=false;el.classList.remove('lift');});
      el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openProject(el.dataset.proj,el);}});
    }
    function idleWiggle(){
      setTimeout(function(){
        if(!reducedMotion()&&!busy&&!hiddenNow()&&!document.hidden){cam.classList.add('wiggle');setTimeout(function(){cam.classList.remove('wiggle');},760);}
        idleWiggle();
      },12000+Math.random()*8000);
    }
    function idleGlint(){
      setTimeout(function(){
        if(!reducedMotion()&&!busy&&!hiddenNow()&&!document.hidden){cam.classList.add('glint');setTimeout(function(){cam.classList.remove('glint');},960);}
        idleGlint();
      },35000+Math.random()*30000);
    }
    cam.addEventListener('click',shoot);
    var rzP;window.addEventListener('resize',function(){clearTimeout(rzP);rzP=setTimeout(function(){
      if(hiddenNow())return;var tb=taskbarTop();
      deck.forEach(function(el){
        var w=el.offsetWidth,h=el.offsetHeight;
        el.style.left=Math.max(4,Math.min(parseFloat(el.style.left)||0,window.innerWidth-w-4))+'px';
        el.style.top=Math.max(4,Math.min(parseFloat(el.style.top)||0,tb-h-4))+'px';
      });
    },220);});
    if(!hiddenNow()){place(PROJECTS[0],false);next=1;}
    idleWiggle();idleGlint();return {shoot:shoot};
  })();

  function openStart(){startMenu.classList.add('open');startBtn.classList.add('active');}
  function closeStart(){startMenu.classList.remove('open');startBtn.classList.remove('active');}
  startBtn.addEventListener('click',function(e){e.stopPropagation();startMenu.classList.contains('open')?closeStart():openStart();});
  startMenu.addEventListener('click',function(e){e.stopPropagation();});
  document.addEventListener('click',closeStart);
  document.getElementById('restart').addEventListener('click',function(){location.reload();});

  themeBtn.addEventListener('click',function(){
    var dark=!document.body.classList.contains('dark');applyTheme(dark);Genie.invalidateAll();Genie.warmOpen();
    try{localStorage.setItem('maryam-os-theme',dark?'dark':'light');}catch(_){}
  });

  if (soundBtn) {
    soundBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      var muted = !SoundSystem.getMute();
      SoundSystem.setMute(muted);
      if (!muted) {
        SoundSystem.playClick();
      }
    });
  }

  document.addEventListener('click', function(e) {
    var target = e.target;
    while (target && target !== document.body) {
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        (target.classList && (
          target.classList.contains('pdi') ||
          target.classList.contains('pf') ||
          target.classList.contains('channel-row') ||
          target.classList.contains('vbtn') ||
          target.classList.contains('clink')
        ))
      ) {
        if (
          target.hasAttribute('data-open') ||
          target.id === 'btnSeeAllWork' ||
          target.id === 'btnSayHi' ||
          target.id === 'widgetSayHi' ||
          target.classList.contains('taskbtn') ||
          target.classList.contains('mn') ||
          target.classList.contains('mx') ||
          target.classList.contains('cl') ||
          target.id === 'soundbtn'
        ) {
          break;
        }
        SoundSystem.playClick();
        break;
      }
      target = target.parentNode;
    }
  }, true);

  var rzT;window.addEventListener('resize',function(){clearTimeout(rzT);rzT=setTimeout(function(){
    syncMobileChrome();
    syncWorkMobileFilter();
    var workWin = document.getElementById('work'); if (workWin && workWin.classList.contains('open')) sizeWorkWindow();
    var buildsWin = document.getElementById('builds'); if (buildsWin && buildsWin.classList.contains('open')) sizeBuildsWindow();
    var aboutWin = document.getElementById('about'); if (aboutWin && aboutWin.classList.contains('open')) sizeAboutWindow();
    var xpWin = document.getElementById('xp'); if (xpWin && xpWin.classList.contains('open')) sizeXpWindow();
    Genie.invalidateAll();Genie.warmOpen();
  },250);});

  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;closeStart();
    var act=windows().filter(function(w){return w.classList.contains('open')&&!w.classList.contains('inactive')&&!w.classList.contains('min');})[0];
    if(act){if(isPhoneOS())goMobileBack(act,act.querySelector('.mn'));else closeWin(act);}
  });

  function fitIcons(){
    var icons=document.getElementById('icons');
    if(window.matchMedia('(max-width:767px)').matches){icons.style.removeProperty('--iscale');icons.style.removeProperty('--igap');return;}
    icons.style.setProperty('--iscale','1');icons.style.setProperty('--igap','12px');
    var kids=icons.querySelectorAll('.pdi');if(!kids.length)return;
    var last=kids[kids.length-1], gaps=kids.length-1;
    var limit=document.getElementById('taskbar').getBoundingClientRect().top-8;var over=last.getBoundingClientRect().bottom-limit;
    if(over<=0)return;
    var gap=Math.max(4,12-over/gaps);icons.style.setProperty('--igap',gap.toFixed(2)+'px');over=last.getBoundingClientRect().bottom-limit;
    if(over<=0)return;
    var top=icons.getBoundingClientRect().top;var content=last.getBoundingClientRect().bottom-top-gap*gaps;var s=Math.max(0.4,(limit-top-gap*gaps)/content);
    icons.style.setProperty('--iscale',s.toFixed(4));var guard=6;
    while(guard-->0 && s>0.4 && last.getBoundingClientRect().bottom>limit){s*=0.97;icons.style.setProperty('--iscale',s.toFixed(4));}
  }
  fitIcons();window.addEventListener('resize',fitIcons);

  function tick(){
    var n=new Date(),h=n.getHours(),m=n.getMinutes();var ap=h>=12?'PM':'AM';h=h%12||12;
    var clockText=h+':'+(m<10?'0':'')+m+' '+ap;
    document.getElementById('clock').textContent=clockText;
    var mobileClock=document.getElementById('mobile-home-clock');
    if(mobileClock){mobileClock.textContent=clockText;mobileClock.dateTime=n.toISOString();}
  }
  tick();setInterval(tick,15000);

  /* ---------- INTERACTIVE MARQUEE BELT SYSTEM ---------- */
  function initMarquee() {
    var viewport = document.getElementById('marqueeViewport');
    var track = document.getElementById('marqueeTrack');
    if (!viewport || !track) return;

    var cards = track.querySelectorAll('.marquee-card');
    var numCards = cards.length;
    if (numCards < 8) return;

    /* Phones use a native swipe carousel instead of the desktop belt. */
    if(isPhoneOS()){
      cards.forEach(function(card,index){
        if(index>=4){
          card.tabIndex=-1;
          card.setAttribute('aria-hidden','true');
          return;
        }
        card.tabIndex=0;
        card.addEventListener('click',function(){
          openProject(card.getAttribute('data-project'),card);
        });
        card.addEventListener('keydown',function(e){
          if(e.key==='Enter'||e.key===' '){
            e.preventDefault();openProject(card.getAttribute('data-project'),card);
          }
        });
      });
      var mobilePrev=document.getElementById('marqueePrev');
      var mobileNext=document.getElementById('marqueeNext');
      if(mobilePrev)mobilePrev.addEventListener('click',function(){viewport.scrollBy({left:-280,behavior:reducedMotion()?'auto':'smooth'});});
      if(mobileNext)mobileNext.addEventListener('click',function(){viewport.scrollBy({left:280,behavior:reducedMotion()?'auto':'smooth'});});
      return;
    }

    var setWidth = 0;
    var baseSpeedMs = 608 / 30000;
    function updateSetWidth() {
      if (cards[4]) {
        setWidth = cards[4].offsetLeft - cards[0].offsetLeft;
        if (setWidth > 0) {
          baseSpeedMs = setWidth / 30000;
        }
      }
    }
    updateSetWidth();
    window.addEventListener('resize', updateSetWidth);

    var welcomeWin = document.getElementById('welcome');
    if (welcomeWin && typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
          var rect = entries[i].contentRect;
          var w = rect.width;
          if (w > 0) {
            var cardW = window.innerWidth <= 767 ? Math.max(260, Math.round(w * 0.8)) : Math.max(160, Math.min(450, Math.round(w * 0.33)));
            requestAnimationFrame(function() {
              var newVal = cardW + 'px';
              if (welcomeWin.style.getPropertyValue('--marquee-card-width') !== newVal) {
                welcomeWin.style.setProperty('--marquee-card-width', newVal);
                updateSetWidth();
                if (window.Genie && Genie.invalidate) {
                  Genie.invalidate('welcome');
                  Genie.warm(welcomeWin);
                }
              }
            });
          }
        }
      });
      ro.observe(welcomeWin);
    }

    var offset = 0;
    var isHovered = false;
    var speedMultiplier = 1;
    var isDragging = false;
    var startX = 0;
    var startOffset = 0;
    var dragVelocity = 0;
    var lastX = 0;
    var lastTime = 0;
    var pointerId = null;
    var downX = 0, downY = 0;

    var lastFrameTime = performance.now();

    function animate(now) {
      var dt = now - lastFrameTime;
      if (dt > 100) dt = 16;
      lastFrameTime = now;

      if (setWidth === 0) {
        updateSetWidth();
        if (setWidth > 0) baseSpeedMs = setWidth / 30000;
      }

      if (reducedMotion()) {
        if (offset <= -setWidth) offset += setWidth;
        if (offset > 0) offset -= setWidth;
        track.style.transform = 'translateX(' + offset + 'px)';
        requestAnimationFrame(animate);
        return;
      }

      if (isDragging) {
        // Updated via pointer move
      } else if (Math.abs(dragVelocity) > 0.05) {
        offset += dragVelocity * (dt / 16);
        dragVelocity *= Math.pow(0.95, dt / 16);
        if (Math.abs(dragVelocity) <= 0.05) {
          dragVelocity = 0;
          speedMultiplier = 0;
        }
      } else {
        var targetMultiplier = isHovered ? 0 : 1;
        var lerpFactor = isHovered ? 0.08 : 0.04;
        speedMultiplier = speedMultiplier * (1 - lerpFactor) + targetMultiplier * lerpFactor;
        offset -= baseSpeedMs * dt * speedMultiplier;
      }

      if (setWidth > 0) {
        if (offset <= -setWidth) offset += setWidth;
        else if (offset > 0) offset -= setWidth;
      }

      track.style.transform = 'translateX(' + offset + 'px)';
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    viewport.addEventListener('mouseenter', function(e) { if(!e.pointerType || e.pointerType === 'mouse') isHovered = true; });
    viewport.addEventListener('mouseleave', function(e) { if(!e.pointerType || e.pointerType === 'mouse') isHovered = false; });

    viewport.addEventListener('pointerdown', function(e) {
      if (e.button !== 0) return;
      isDragging = true;pointerId = e.pointerId;
      try { viewport.setPointerCapture(pointerId); } catch(_) {}
      startX = e.clientX;startOffset = offset;lastX = e.clientX;lastTime = performance.now();
      dragVelocity = 0;downX = e.clientX;downY = e.clientY;
    });

    viewport.addEventListener('pointermove', function(e) {
      if (!isDragging || e.pointerId !== pointerId) return;
      var currentX = e.clientX, currentTime = performance.now();
      var dx = currentX - startX;
      offset = startOffset + dx;

      if (setWidth > 0) {
        if (offset <= -setWidth) { offset += setWidth; startOffset += setWidth; }
        else if (offset > 0) { offset -= setWidth; startOffset -= setWidth; }
      }

      var dt = currentTime - lastTime;
      if (dt > 0) dragVelocity = (currentX - lastX) / dt * 16;
      lastX = currentX;lastTime = currentTime;
    });

    function endDrag(e) {
      if (!isDragging || e.pointerId !== pointerId) return;
      isDragging = false;
      isHovered = false; // ensure pause is lifted

      try { viewport.releasePointerCapture(pointerId); } catch(_) {}
      var dist = Math.sqrt(Math.pow(e.clientX - downX, 2) + Math.pow(e.clientY - downY, 2));
      if (dist < 4) {
        var card = e.target.closest('.marquee-card');
        if (card) {
          var proj = card.getAttribute('data-project');
          if (proj) openProject(proj, card);
        }
        dragVelocity = 0;
      }
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    viewport.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (reducedMotion()) offset -= 40; else dragVelocity = -6;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (reducedMotion()) offset += 40; else dragVelocity = 6;
      }
    });

    cards.forEach(function(card) {
      card.tabIndex = 0;
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();openProject(card.getAttribute('data-project'), card);
        }
      });
    });

    var btnPrev = document.getElementById('marqueePrev');
    var btnNext = document.getElementById('marqueeNext');
    if (btnPrev && btnNext) {
      btnPrev.addEventListener('click', function() { offset += 120; });
      btnNext.addEventListener('click', function() { offset -= 120; });
    }
  }

  // Bind Welcome Action Buttons
  var btnSeeAllWork = document.getElementById('btnSeeAllWork');
  if (btnSeeAllWork) {
    btnSeeAllWork.addEventListener('click', function() { openWin('work', btnSeeAllWork); });
  }
  var btnSayHi = document.getElementById('btnSayHi');
  if (btnSayHi) {
    btnSayHi.addEventListener('click', function() { openWin('contact', btnSayHi); });
  }
  var widgetSayHi = document.getElementById('widgetSayHi');
  if (widgetSayHi) {
    widgetSayHi.addEventListener('click', function() { openWin('contact', widgetSayHi); });
  }

  // Bind split view rail entries
  document.querySelectorAll('.rail-entry[data-project]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      selectProject(el.getAttribute('data-project'), true);
    });
  });

  function renderMobileProjectFeed(){
    var feed=document.getElementById('workMobileFeed');
    if(!feed||feed.children.length)return;
    PROJECT_NAMES.forEach(function(name,index){
      var data=PROJECT_DATA[name];
      if(!data)return;
      var specs=PROJECT_SPECS[name]||{};
      var specMarkup=SPEC_ORDER.map(function(spec){
        var value=specs[spec.key]||'—';
        return '<div class="work-mobile-card-spec">'+
          '<span class="work-mobile-card-spec-label">'+escapeBuildText(spec.label)+'</span>'+
          '<span class="work-mobile-card-spec-value">'+escapeBuildText(value)+'</span>'+
        '</div>';
      }).join('');
      var article=document.createElement('article');
      article.className='work-mobile-project-card';
      article.setAttribute('data-kind',data.kind);
      article.setAttribute('data-project',name);
      article.innerHTML=
        '<div class="work-mobile-card-image">'+
          '<img src="'+escapeBuildText(data.imgSmall||data.img)+'" '+
            (data.imgSmall?'srcset="'+escapeBuildText(data.imgSmall)+' 640w, '+escapeBuildText(data.img)+' 1200w" sizes="calc(100vw - 42px)" ':'')+
            'alt="'+escapeBuildText(projectDisplayName(name))+' project preview" loading="lazy" decoding="async">'+
          '<div class="work-mobile-card-placeholder" hidden><i class="ti ti-photo-heart" aria-hidden="true"></i></div>'+
        '</div>'+
        '<div class="work-mobile-card-copy">'+
          '<p class="work-mobile-card-kicker">'+String(index+1).padStart(2,'0')+' / '+(data.kind==='case'?'case study':'live project')+'</p>'+
          '<div class="work-mobile-card-heading">'+
            '<h2 class="work-mobile-card-title">'+escapeBuildText(projectDisplayName(name))+'</h2>'+
            '<span class="work-mobile-card-tag">'+escapeBuildText(data.tag)+'</span>'+
          '</div>'+
          '<p class="work-mobile-card-desc">'+escapeBuildText(data.desc)+'</p>'+
          '<div class="work-mobile-card-context">'+
            '<span class="work-mobile-card-meta">'+escapeBuildText(data.meta||'')+'</span>'+
            '<span class="work-mobile-card-outcome">'+escapeBuildText(data.outcome||'')+'</span>'+
          '</div>'+
          '<div class="work-mobile-card-specs">'+specMarkup+'</div>'+
          '<div class="work-mobile-card-actions">'+
            '<button type="button" class="work-mobile-project-action"></button>'+
            '<button type="button" class="work-mobile-project-action secondary" hidden></button>'+
          '</div>'+
        '</div>';
      var img=article.querySelector('img');
      var placeholder=article.querySelector('.work-mobile-card-placeholder');
      if(img)img.addEventListener('error',function(){img.hidden=true;if(placeholder)placeholder.hidden=false;});
      var primary=article.querySelector('.work-mobile-project-action:not(.secondary)');
      var secondary=article.querySelector('.work-mobile-project-action.secondary');
      configureProjectActionSet(primary,secondary,data);
      if(primary)primary.addEventListener('click',function(){launchProjectAction(name,0,primary);});
      if(secondary)secondary.addEventListener('click',function(){launchProjectAction(name,1,secondary);});
      feed.appendChild(article);
    });
  }

  function setWorkMobileFilter(kind,selectFirst){
    if(!isPhoneOS())return;
    mobileWorkKind=kind;
    var filters=document.querySelectorAll('#work .work-mobile-filter');
    var groups=document.querySelectorAll('#work .work-index-group');
    filters.forEach(function(btn){
      var selected=btn.getAttribute('data-work-filter')===kind;
      btn.setAttribute('aria-selected',selected?'true':'false');
      btn.tabIndex=selected?0:-1;
    });
    groups.forEach(function(group){
      var active=group.id==='work-'+kind+'-group';
      group.classList.toggle('mobile-active',active);
      group.setAttribute('aria-hidden',active?'false':'true');
    });
    document.querySelectorAll('#work .work-mobile-project-card').forEach(function(card){
      var visible=card.getAttribute('data-kind')===kind;
      card.hidden=!visible;
      card.setAttribute('aria-hidden',visible?'false':'true');
    });
    var feed=document.getElementById('workMobileFeed');
    if(feed)feed.setAttribute('aria-label',kind==='case'?'Case studies':'Live projects');
    if(selectFirst){
      var browser=document.querySelector('#work .work-browser');
      if(browser)requestAnimationFrame(function(){browser.scrollTop=0;});
    }
  }
  function syncWorkMobileFilter(){
    if(!isPhoneOS()){
      document.querySelectorAll('#work .work-index-group').forEach(function(group){group.removeAttribute('aria-hidden');});
      return;
    }
    setWorkMobileFilter(mobileWorkKind,false);
  }
  document.querySelectorAll('#work .work-mobile-filter').forEach(function(btn){
    btn.addEventListener('click',function(){
      setWorkMobileFilter(btn.getAttribute('data-work-filter'),true);
    });
    btn.addEventListener('keydown',function(e){
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
      e.preventDefault();
      var filters=Array.prototype.slice.call(document.querySelectorAll('#work .work-mobile-filter'));
      var next=filters[(filters.indexOf(btn)+(e.key==='ArrowRight'?1:-1)+filters.length)%filters.length];
      if(next){next.focus();next.click();}
    });
  });

  var previewOpenBtn = document.getElementById('previewOpenBtn');
  if (previewOpenBtn) {
    previewOpenBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      launchProjectAction(selectedProjectName, 0, previewOpenBtn);
    });
  }
  var previewSecondaryBtn = document.getElementById('previewSecondaryBtn');
  if (previewSecondaryBtn) {
    previewSecondaryBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      launchProjectAction(selectedProjectName, 1, previewSecondaryBtn);
    });
  }
  /* ---------- COMPACT LAUNCHER & APP WINDOW INTERACTIVITY ---------- */
  var illustrations = [
    {
      svg: '<svg viewBox="0 0 100 100" class="w-20 h-20" style="width:80px; height:80px; color:var(--rose);" id="emptyStateSvg">' +
           '<path d="M30,60 a15,15 0 0,1 10,-22 a20,20 0 0,1 30,0 a15,15 0 0,1 10,22 z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
           '<circle cx="45" cy="52" r="1.5" fill="currentColor"/>' +
           '<circle cx="55" cy="52" r="1.5" fill="currentColor"/>' +
           '<path d="M48,56 q2,2 4,0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
           '<path d="M50,22 L50,15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
           '<path d="M48,15 L52,15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
           '</svg>',
      label: 'no entries found'
    },
    {
      svg: '<svg viewBox="0 0 100 100" class="w-20 h-20" style="width:80px; height:80px; color:var(--amber);" id="emptyStateSvg">' +
           '<path d="M40,70 L60,70 L56,85 L44,85 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>' +
           '<path d="M50,70 L50,45" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
           '<path d="M50,55 Q40,45 50,45 Q60,45 50,55" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
           '<path d="M50,40 Q45,32 50,28 Q55,32 50,40 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
           '</svg>',
      label: 'canvas is clean'
    },
    {
      svg: '<svg viewBox="0 0 100 100" class="w-20 h-20" style="width:80px; height:80px; color:var(--rose-dark);" id="emptyStateSvg">' +
           '<rect x="35" y="35" width="30" height="25" rx="3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>' +
           '<path d="M35,35 L50,48 L65,35" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
           '<path d="M50,60 L50,85" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
           '<circle cx="75" cy="25" r="2" fill="currentColor"/>' +
           '<circle cx="25" cy="30" r="1.5" fill="currentColor"/>' +
           '</svg>',
      label: 'inbox zero'
    }
  ];

  var buildsData = [
    { name: "silk loop", oneLiner: "a pattern game built as a focused, playful web experiment.", category: "game", icon: "ti-infinity", accent: "#6658c7", soft: "#eeeaff", image: "images/ai-builds/silk-loop.png", liveUrl: "https://silk-loop.vercel.app", sourceUrl: "https://github.com/maryam-ay/Silk-Loop", desc: "a TypeScript pattern game designed as a small, focused web experience." },
    { name: "capsule", oneLiner: "seal notes, photos, voice notes and links inside private time capsules.", category: "time capsule", icon: "ti-box", accent: "#b66d35", soft: "#fff0df", image: "images/ai-builds/capsule.png", liveUrl: "https://trycapsule.vercel.app", sourceUrl: "https://github.com/maryam-ay/Capsule", desc: "a personal time capsule app for sealing notes, photos, voice notes and links inside private memory boxes that open on a future date." },
    { name: "niche trivia", oneLiner: "a trivia game for the hyper-specific topics you choose yourself.", category: "trivia", icon: "ti-brain", accent: "#24776f", soft: "#e2f4f0", image: "images/ai-builds/niche-trivia.png", liveUrl: "https://niche-trivia.vercel.app", sourceUrl: "https://github.com/maryam-ay/Niche-TRivia", desc: "a trivia game that quizzes you on hyper-specific topics you pick yourself." },
    { name: "signal portrait", oneLiner: "a private weekly reflection on what you read, watched, heard and felt.", category: "reflection", icon: "ti-wave-sine", accent: "#8d4f79", soft: "#f6e8f1", image: "images/ai-builds/signal-portrait.png", liveUrl: "https://signal-portrait.vercel.app", sourceUrl: "https://github.com/maryam-ay/Signal-Portrait", desc: "a private weekly reflection app that reveals the emotional and cultural climate of everything you read, watched, heard and felt." },
    { name: "dropconvert", oneLiner: "a fast batch image-to-WebP converter with a deliberately simple flow.", category: "image utility", icon: "ti-photo-cog", accent: "#3e76a3", soft: "#e7f1f8", image: "images/ai-builds/dropconvert.png", liveUrl: "https://dropconvert.vercel.app", sourceUrl: "https://github.com/maryam-ay/Dropconvert", desc: "a fast, free image-to-WebP converter that makes batch image optimization feel simple." },
    { name: "digital scrapbook", oneLiner: "build journal pages with photos, text, doodles, stickers and polaroids.", category: "creative tool", icon: "ti-notebook", accent: "#b95f56", soft: "#fbe8e5", image: "images/ai-builds/digital-scrapbook.png", liveUrl: "https://digital-scrapbook-gamma.vercel.app", sourceUrl: "https://github.com/maryam-ay/Digital-Scrapbook", desc: "an interactive digital scrapbook for filling crafted journal pages with photos, handwritten-style text, doodles, stickers and polaroid camera snaps." },
    { name: "lattice", oneLiner: "an exploratory JavaScript build with its source available on GitHub.", category: "experiment", icon: "ti-layout-grid", accent: "#64794c", soft: "#edf3e7", image: "images/ai-builds/lattice.png", liveUrl: "https://playlattice.netlify.app", sourceUrl: "https://github.com/maryam-ay/lattice", desc: "an exploratory JavaScript project from my AI build archive. open the repository to explore the work." },
    { name: "penline", oneLiner: "a JavaScript build from my growing collection of AI-assisted experiments.", category: "experiment", icon: "ti-writing", accent: "#904a5d", soft: "#f7e8ec", image: "images/ai-builds/penline.png", liveUrl: "https://usepenline.netlify.app", sourceUrl: "https://github.com/maryam-ay/Penline", desc: "a JavaScript project from my AI build archive. open the repository to explore the work." },
    { name: "svg forge", oneLiner: "a browser tool for turning simple PNG graphics into editable SVGs.", category: "vector tool", icon: "ti-vector", accent: "#7853a1", soft: "#f0e8f8", image: "images/ai-builds/svg-forge.png", liveUrl: "https://svg-forge.netlify.app", sourceUrl: "https://github.com/maryam-ay/svg-forge", desc: "a browser-based tool for turning simple PNG graphics into editable SVGs. i built it for those annoying situations where the asset you need exists, but the original vector file does not." },
    { name: "nigerian brand logos", oneLiner: "a searchable library of 900+ Nigerian brand logos, free to download as SVG or PNG.", category: "asset library", icon: "ti-photo-search", accent: "#b56b2d", soft: "#f9ead9", image: "images/ai-builds/nigerian-brands-logos.png", liveUrl: "https://nigerianbrandlogos.netlify.app", sourceUrl: "https://github.com/maryam-ay/nigerian-brands-logos-plugin", desc: "a growing library of Nigerian brand logos, built to make local brand assets easier for designers and developers to find and use. search a brand, take the SVG or PNG you need, and get back to designing instead of hunting through Google Images." },
    { name: "skinpet", oneLiner: "a skincare companion where a little pet reacts to the routine you keep.", category: "companion app", icon: "ti-mood-smile", accent: "#c9587f", soft: "#fdeaf0", image: "images/ai-builds/skin-pet.png", liveUrl: "https://skin-pet.vercel.app", desc: "a skincare tracker built around Mochi, a small companion that responds to how consistently you look after your skin." },
    { name: "empty state generator", oneLiner: "describe an empty state and get a full illustration back.", category: "design tool", icon: "ti-sparkles", accent: "#5f6bab", soft: "#eaedf9", image: "images/ai-builds/empty-state-generator.png", liveUrl: "https://emptystategenerator.netlify.app", desc: "a tool for creating custom empty-state illustrations without starting from scratch. adjust the illustration, customise the details, and export the result as an SVG ready to use in a product." }
  ];

  var selectedBuildName = "silk loop";

  function getBuildByName(name) {
    for (var i = 0; i < buildsData.length; i++) {
      if (buildsData[i].name === name) return buildsData[i];
    }
    return null;
  }

  function escapeBuildText(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderBuildsGrid() {
    var programGrid = document.getElementById('buildsProgramGrid');
    if (!programGrid) return;

    programGrid.innerHTML = buildsData.map(function(build, index) {
      return renderBuildTileHTML(build, index);
    }).join('');

    var visibleCount = document.getElementById('buildsVisibleCount');
    if (visibleCount) visibleCount.textContent = String(buildsData.length).padStart(2, '0') + ' builds';

    // Kept in step with buildsData so adding a build never leaves a stale count.
    var libraryCount = document.getElementById('buildsLibraryCount');
    if (libraryCount) libraryCount.textContent = String(buildsData.length);

    document.querySelectorAll('#builds .build-tile[data-build]').forEach(function(tile) {
      tile.addEventListener('click', function(e) {
        e.stopPropagation();
        selectBuild(tile.getAttribute('data-build'), true);
      });
      tile.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        var build = getBuildByName(tile.getAttribute('data-build'));
        if (build) openBuildTarget(build, false);
      });
    });

    selectBuild(selectedBuildName, false);
  }

  function renderBuildsMobileFeed() {
    var feed = document.getElementById('buildsMobileFeed');
    if (!feed) return;
    feed.innerHTML = '';

    buildsData.forEach(function(build, index) {
      var article = document.createElement('article');
      var hasSource = !!build.sourceUrl;
      article.className = 'builds-mobile-card';
      article.setAttribute('data-build', build.name);
      article.innerHTML =
        '<div class="builds-mobile-card-bar">' +
          '<span><i class="ti ' + escapeBuildText(build.icon) + '" aria-hidden="true"></i>ai-build://' + escapeBuildText(build.name.replace(/\s+/g, '-')) + '</span>' +
          '<span class="builds-mobile-card-number">' + String(index + 1).padStart(2, '0') + ' / ' + String(buildsData.length).padStart(2, '0') + '</span>' +
        '</div>' +
        '<div class="builds-mobile-card-visual">' +
          '<img class="builds-mobile-card-image" src="' + escapeBuildText(build.image || '') + '" alt="' + escapeBuildText(build.name) + ' interface preview" loading="lazy" decoding="async">' +
          '<div class="builds-mobile-card-placeholder" hidden><i class="ti ' + escapeBuildText(build.icon) + '" aria-hidden="true"></i><span>' + escapeBuildText(build.name) + '</span></div>' +
        '</div>' +
        '<div class="builds-mobile-card-copy">' +
          '<div class="builds-mobile-card-meta">' +
            '<span class="builds-mobile-card-category">' + escapeBuildText(build.category) + '</span>' +
            '<span class="builds-mobile-card-status">' + (build.liveUrl ? 'live build' : 'source only') + '</span>' +
          '</div>' +
          '<h2 class="builds-mobile-card-title">' + escapeBuildText(build.name) + '</h2>' +
          '<p class="builds-mobile-card-desc">' + escapeBuildText(build.oneLiner || build.desc) + '</p>' +
          '<div class="builds-mobile-card-actions' + (hasSource ? '' : ' single') + '">' +
            '<button type="button" class="builds-mobile-action">' + (build.liveUrl ? 'open live build →' : 'view source →') + '</button>' +
            (hasSource ? '<button type="button" class="builds-mobile-action secondary">github ↗</button>' : '') +
          '</div>' +
        '</div>';

      var image = article.querySelector('.builds-mobile-card-image');
      var placeholder = article.querySelector('.builds-mobile-card-placeholder');
      if (image) {
        image.addEventListener('error', function() {
          image.hidden = true;
          if (placeholder) placeholder.hidden = false;
        });
      }

      var primary = article.querySelector('.builds-mobile-action:not(.secondary)');
      var source = article.querySelector('.builds-mobile-action.secondary');
      if (primary) {
        primary.addEventListener('click', function(e) {
          e.stopPropagation();
          openBuildTarget(build, false);
        });
      }
      if (source) {
        source.addEventListener('click', function(e) {
          e.stopPropagation();
          openBuildTarget(build, true);
        });
      }
      feed.appendChild(article);
    });
  }

  function renderBuildTileHTML(b, index) {
    var isSelected = (b.name === selectedBuildName) ? ' selected' : '';
    return '<button class="build-tile' + isSelected + '" data-build="' + escapeBuildText(b.name) +
           '" data-category="' + escapeBuildText(b.category) + '" type="button" aria-pressed="' +
           (isSelected ? 'true' : 'false') + '" style="--tile-accent:' + escapeBuildText(b.accent) +
           ';--tile-soft:' + escapeBuildText(b.soft) + ';">' +
           '  <span class="build-tile-number">' + String(index + 1).padStart(2, '0') + '</span>' +
           '  <span class="build-tile-icon"><i class="ti ' + escapeBuildText(b.icon) + '" aria-hidden="true"></i></span>' +
           '  <span class="build-tile-copy">' +
           '    <span class="build-tile-name">' + escapeBuildText(b.name) + '</span>' +
           '    <span class="build-tile-meta">' +
           '      <span class="build-tile-category">' + escapeBuildText(b.category) + '</span>' +
           '      <span class="build-tile-status' + (b.liveUrl ? '' : ' source') + '">' +
                    (b.liveUrl ? 'live' : 'source only') +
           '      </span>' +
           '    </span>' +
           '  </span>' +
           '</button>';
  }

  function selectBuild(name, animate) {
    var b = getBuildByName(name);
    if (!b) return;
    selectedBuildName = name;

    var tiles = document.querySelectorAll('#builds .build-tile[data-build]');
    tiles.forEach(function(tile) {
      if (tile.getAttribute('data-build') === name) {
        tile.classList.add('selected');
        tile.setAttribute('aria-pressed', 'true');
      } else {
        tile.classList.remove('selected');
        tile.setAttribute('aria-pressed', 'false');
      }
    });

    var titleEl = document.getElementById('buildsPreviewTitle');
    var tagEl = document.getElementById('buildsPreviewTag');
    var statusEl = document.getElementById('buildsPreviewStatus');
    var descEl = document.getElementById('buildsPreviewDesc');
    var iconEl = document.getElementById('buildsFeatureIcon');
    var artTitleEl = document.getElementById('buildsFeatureArtTitle');
    var artSubtitleEl = document.getElementById('buildsFeatureArtSubtitle');
    var addressEl = document.getElementById('buildsFeatureAddress');
    var indexEl = document.getElementById('buildsFeatureIndex');
    var visualEl = document.getElementById('buildsFeatureVisual');
    var imageEl = document.getElementById('buildsFeatureImage');
    var selectedBuildIndex = buildsData.indexOf(b);

    if (titleEl) titleEl.textContent = name;
    if (tagEl) tagEl.textContent = b.category;
    if (statusEl) {
      statusEl.textContent = b.liveUrl ? 'live' : 'source only';
      statusEl.classList.toggle('source', !b.liveUrl);
    }
    if (descEl) descEl.textContent = b.desc || b.oneLiner;
    if (iconEl) iconEl.innerHTML = '<i class="ti ' + escapeBuildText(b.icon) + '" aria-hidden="true"></i>';
    if (artTitleEl) artTitleEl.textContent = name;
    if (artSubtitleEl) artSubtitleEl.textContent = b.category + ' · ' + (b.liveUrl ? 'live' : 'source');
    if (addressEl) addressEl.textContent = 'ai-build://' + name.replace(/\s+/g, '-');
    if (indexEl) indexEl.textContent = String(selectedBuildIndex + 1).padStart(2, '0') + ' / ' + String(buildsData.length).padStart(2, '0');
    if (visualEl) {
      visualEl.style.setProperty('--build-accent', b.accent);
      visualEl.style.setProperty('--build-soft', b.soft);
      visualEl.classList.toggle('no-image', !b.image);
    }
    if (imageEl && b.image) {
      imageEl.src = b.image;
      imageEl.alt = name + ' interface preview';
    }

    var openBtn = document.getElementById('buildsPreviewOpenBtn');
    var sourceBtn = document.getElementById('buildsPreviewSourceBtn');
    if (openBtn) openBtn.textContent = b.liveUrl ? 'open live build →' : 'view source →';
    if (sourceBtn) sourceBtn.hidden = !b.liveUrl || !b.sourceUrl;

    var feature = document.querySelector('#builds .builds-feature');
    if (feature) {
      feature.classList.remove('preview-animate');
      if (animate && !reducedMotion()) {
        void feature.offsetWidth;
        feature.classList.add('preview-animate');
      }
    }

    var buildsWin = document.getElementById('builds');
    if (buildsWin && buildsWin.classList.contains('open') && typeof Genie !== 'undefined' && Genie.invalidate) {
      Genie.invalidate('builds');
      Genie.warm(buildsWin);
    }
  }

  function openBuildTarget(build, sourceOnly) {
    if (!build) return;
    var target = sourceOnly ? build.sourceUrl : (build.liveUrl || build.sourceUrl);
    if (!target) return;
    var opened = window.open(target, '_blank', 'noopener,noreferrer');
    if (opened) opened.opener = null;
  }

  function initAppInteractivity() {
    renderBuildsGrid();
    renderBuildsMobileFeed();

    document.querySelectorAll('.launcher-row[data-app]').forEach(function(row) {
      row.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = row.getAttribute('data-app');
        openWin(id, row);
      });
    });

    var buildsPreviewOpenBtn = document.getElementById('buildsPreviewOpenBtn');
    if (buildsPreviewOpenBtn) {
      buildsPreviewOpenBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var currentBuild = getBuildByName(selectedBuildName);
        if (currentBuild) openBuildTarget(currentBuild, false);
      });
    }

    var buildsPreviewSourceBtn = document.getElementById('buildsPreviewSourceBtn');
    if (buildsPreviewSourceBtn) {
      buildsPreviewSourceBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var currentBuild = getBuildByName(selectedBuildName);
        if (currentBuild) openBuildTarget(currentBuild, true);
      });
    }

    // Keydown handling for arrow navigation
    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        var workWin = document.getElementById('work');
        if (workWin && workWin.classList.contains('open') && !workWin.classList.contains('inactive') && !workWin.classList.contains('min')) {
          e.preventDefault();
          var visibleProjectNames = Array.prototype.map.call(
            workWin.querySelectorAll('.rail-entry[data-project]:not([hidden])'),
            function(entry) { return entry.getAttribute('data-project'); }
          );
          if (!visibleProjectNames.length) return;
          var currentIndex = visibleProjectNames.indexOf(selectedProjectName);
          if (currentIndex < 0) currentIndex = 0;
          if (e.key === 'ArrowUp') {
            currentIndex = (currentIndex - 1 + visibleProjectNames.length) % visibleProjectNames.length;
          } else {
            currentIndex = (currentIndex + 1) % visibleProjectNames.length;
          }
          selectProject(visibleProjectNames[currentIndex], true);

          var activeBtn = workWin.querySelector('.rail-entry.selected');
          if (activeBtn) {
            activeBtn.focus();
          }
        }

        var buildsWin = document.getElementById('builds');
        if (buildsWin && buildsWin.classList.contains('open') && !buildsWin.classList.contains('inactive') && !buildsWin.classList.contains('min')) {
          if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
          e.preventDefault();
          var buildNames = Array.prototype.map.call(
            buildsWin.querySelectorAll('.build-tile[data-build]:not([hidden])'),
            function(tile) { return tile.getAttribute('data-build'); }
          );
          if (!buildNames.length) return;
          var currentBuildIndex = buildNames.indexOf(selectedBuildName);
          if (currentBuildIndex < 0) currentBuildIndex = 0;
          if (e.key === 'ArrowUp') {
            currentBuildIndex = (currentBuildIndex - 1 + buildNames.length) % buildNames.length;
          } else {
            currentBuildIndex = (currentBuildIndex + 1) % buildNames.length;
          }
          selectBuild(buildNames[currentBuildIndex], true);

          var activeBuildBtn = buildsWin.querySelector('.build-tile.selected');
          if (activeBuildBtn) {
            activeBuildBtn.focus();
          }
        }
      }
    });

    var btnGenerate = document.getElementById('btnGenerateEmptyState');
    var container = document.getElementById('illustrationContainer');
    var currentIllustrationIndex = 0;
    if (btnGenerate && container) {
      btnGenerate.addEventListener('click', function(e) {
        e.stopPropagation();
        currentIllustrationIndex = (currentIllustrationIndex + 1) % illustrations.length;
        var item = illustrations[currentIllustrationIndex];

        if (reducedMotion()) {
          container.innerHTML = item.svg + '<span style="font-size:10px; font-weight:bold; color:var(--muted); text-transform:lowercase;" id="emptyStateLabel">' + item.label + '</span>';
        } else {
          container.classList.remove('spring-active');
          void container.offsetWidth; // force reflow
          container.innerHTML = item.svg + '<span style="font-size:10px; font-weight:bold; color:var(--muted); text-transform:lowercase;" id="emptyStateLabel">' + item.label + '</span>';
          container.classList.add('spring-active');
        }

        var win = document.getElementById('app-empty-state');
        if (win && typeof Genie !== 'undefined' && Genie.invalidate) {
          Genie.invalidate('app-empty-state');
          Genie.warm(win);
        }
      });
    }
  }

  function initPhotoViewer() {
    var photos = [
      { src: 'images/optimized/about-interest-painting-720.webp', cap: '[caption: me pretending i can paint]' },
      { src: 'images/optimized/about-interest-baking-720.webp', cap: '[caption: attempt #4 at macarons]' },
      { src: 'images/optimized/about-interest-cooking-720.webp', cap: '[caption: experiments in the kitchen]' },
      { src: 'images/optimized/about-interest-nollywood-720.webp', cap: '[caption: on set looking busy]' },
      { src: 'images/optimized/about-interest-scifi-720.webp', cap: '[caption: exploring infinite shapes and space]' },
      { src: 'images/optimized/about-interest-short-films-720.webp', cap: '[caption: storytelling behind the lens]' },
      { src: 'images/optimized/about-interest-comedy-720.webp', cap: '[caption: sunday morning laughs]' }
    ];
    var currentPhotoIndex = 0;

    function updatePhoto(index, bypassAbout) {
      currentPhotoIndex = index;
      var p = photos[index];
      var img = document.getElementById('viewer-img');
      var fallback = document.getElementById('viewer-fallback');
      var cap = document.getElementById('viewer-caption');
      var counter = document.getElementById('viewer-counter');

      if (img) {
        img.style.display = 'block';
        fallback.style.display = 'none';

        img.onerror = function() {
          img.style.display = 'none';
          fallback.style.display = 'flex';
        };

        img.src = p.src;
        cap.textContent = p.cap;
        counter.textContent = (index + 1) + ' / ' + photos.length;

        var pvWin = document.getElementById('picture-viewer');
        if (pvWin && pvWin.classList.contains('open') && typeof Genie !== 'undefined' && Genie.invalidate) {
          Genie.invalidate('picture-viewer');
          Genie.warm(pvWin);
        }
      }

      if (!bypassAbout) {
        updateAboutGallery(index, true);
      }
    }

    function updateAboutGallery(index, bypassPhoto) {
      currentPhotoIndex = index;
      var p = photos[index];
      var img = document.getElementById('about-gallery-img');
      var fallback = document.getElementById('about-gallery-fallback');
      var cap = document.getElementById('about-gallery-caption');
      if (img) {
        img.style.display = 'block';
        fallback.style.display = 'none';

        img.onerror = function() {
          img.style.display = 'none';
          fallback.style.display = 'flex';
        };

        img.src = p.src;
        cap.textContent = p.cap;

        var thumbBtns = document.querySelectorAll('.about-thumb-btn');
        thumbBtns.forEach(function(btn, idx) {
          if (idx === index) {
            btn.classList.add('selected');
            btn.setAttribute('aria-selected', 'true');
            if (typeof btn.scrollIntoView === 'function') {
              btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
          } else {
            btn.classList.remove('selected');
            btn.setAttribute('aria-selected', 'false');
          }
        });

        var aboutWin = document.getElementById('about');
        if (aboutWin && aboutWin.classList.contains('open') && typeof Genie !== 'undefined' && Genie.invalidate) {
          Genie.invalidate('about');
          Genie.warm(aboutWin);
        }
      }

      if (!bypassPhoto) {
        updatePhoto(index, true);
      }
    }

    var prevBtn = document.getElementById('viewer-prev');
    var nextBtn = document.getElementById('viewer-next');
    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = (currentPhotoIndex - 1 + photos.length) % photos.length;
        updatePhoto(idx);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = (currentPhotoIndex + 1) % photos.length;
        updatePhoto(idx);
      });
    }

    var thumbBtns = document.querySelectorAll('.about-thumb-btn');
    thumbBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-photo-idx'), 10);
        updateAboutGallery(idx);
      });
    });

    var aboutWin = document.getElementById('about');
    if (aboutWin) {
      aboutWin.addEventListener('keydown', function(e) {
        if (!aboutWin.classList.contains('inactive')) {
          if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            var idx = (currentPhotoIndex - 1 + photos.length) % photos.length;
            updateAboutGallery(idx);
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            var idx = (currentPhotoIndex + 1) % photos.length;
            updateAboutGallery(idx);
          }
        }
      });
    }

    updatePhoto(0);
  }

  // The boot screen used to hang off 'load', so it waited on every project
  // screenshot in the page before its timer even started. None of this setup
  // needs decoded images — window sizing is viewport-based and genie captures
  // are queued on idle — so it runs as soon as the markup is parsed instead.
  function startOS(){
    sizeWorkWindow();
    sizeBuildsWindow();
    sizeAboutWindow();
    sizeXpWindow();
    selectProject("Vesti Mobile", false);
    renderMobileProjectFeed();
    syncWorkMobileFilter();
    selectBuild("silk loop", false);

    initAppInteractivity();
    initMarquee();
    Genie.init();
    if(window.innerWidth>767)Genie.preload();



    initPhotoViewer();
    syncMobileChrome();
    initMobileTypeFloor();
    if(isPhoneOS()){
      if(startBtn)startBtn.setAttribute('aria-label','Open apps menu');
    }
    setTimeout(function(){
      var b=document.getElementById('boot');b.classList.add('done');
      setTimeout(function(){
        b.style.display='none';
        var wp = document.getElementById('widget-column');
        if (wp) wp.classList.add('show');
      },reducedMotion()?0:220);
      if(window.innerWidth>767)openWin('welcome',null,true);
    }, reducedMotion() ? 40 : 360);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',startOS);
  }else{
    startOS();
  }

  // Existing genie textures are marked stale once all initial media has settled.
  // Closed windows are intentionally not captured here: doing that would force
  // their lazy media to download before the user opens them.
  window.addEventListener('load',function(){
    Genie.invalidateAll();
    // Then warm them again straight away, while the browser is idle and the
    // page is already interactive. Nothing warmed at boot before, so the very
    // first window a visitor opened had no texture and fell back to a fade —
    // which is what made the genie look like it "kicks in later". Desktop only:
    // the phone layout uses playPhoneWindow and never touches a genie texture.
    if(window.innerWidth>767 && Genie.warmAll)Genie.warmAll();
  });

  // Wallpaper Picker Logic
  const swatches = document.querySelectorAll('.wall-swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      document.body.classList.remove('wall-pink', 'wall-rose', 'wall-cream', 'wall-mauve');
      document.body.classList.add('wall-' + swatch.dataset.wall);
      swatches.forEach(s => s.style.borderColor = 'transparent');
      swatch.style.borderColor = 'var(--rose)';
    });
  });

  // Match Game Logic
  const matchGrid = document.getElementById('match-grid');
  const matchScoreEl = document.getElementById('match-score');
  const matchOver = document.getElementById('match-over');
  const matchReset = document.getElementById('match-reset');
  const motifs = ['ti-heart', 'ti-star', 'ti-flower', 'ti-sparkles', 'ti-music', 'ti-moon'];
  let flipped = [];
  let matchedCount = 0;
  let moves = 0;
  let bestMoves = null;
  let isAnimating = false;

  function initMatchGame() {
    if(!matchGrid) return;
    matchGrid.innerHTML = '';
    matchOver.style.display = 'none';
    matchGrid.style.display = 'grid';
    flipped = [];
    matchedCount = 0;
    moves = 0;
    matchScoreEl.textContent = 'moves: 0' + (bestMoves ? ' (best: ' + bestMoves + ')' : '');

    let pairs = [...motifs, ...motifs];
    pairs.sort(() => Math.random() - 0.5);

    pairs.forEach((icon) => {
      let card = document.createElement('div');
      card.className = 'match-card';
      card.dataset.icon = icon;

      let front = document.createElement('div');
      front.className = 'front';
      front.innerHTML = '<i class="ti ' + icon + '"></i>';

      let back = document.createElement('div');
      back.className = 'back';

      card.appendChild(front);
      card.appendChild(back);

      card.addEventListener('click', () => onCardClick(card));
      matchGrid.appendChild(card);
    });
  }

  function onCardClick(card) {
    if (isAnimating || flipped.includes(card) || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    flipped.push(card);

    if (flipped.length === 2) {
      moves++;
      matchScoreEl.textContent = 'moves: ' + moves + (bestMoves ? ' (best: ' + bestMoves + ')' : '');
      isAnimating = true;

      if (flipped[0].dataset.icon === flipped[1].dataset.icon) {
        setTimeout(() => {
          flipped[0].classList.add('matched');
          flipped[1].classList.add('matched');
          flipped = [];
          matchedCount++;
          isAnimating = false;

          if (matchedCount === 6) {
            if (!bestMoves || moves < bestMoves) bestMoves = moves;
            matchScoreEl.textContent = 'moves: ' + moves + (bestMoves ? ' (best: ' + bestMoves + ')' : '');
            setTimeout(showWin, 400);
          }
        }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 400);
      } else {
        setTimeout(() => {
          flipped[0].classList.remove('flipped');
          flipped[1].classList.remove('flipped');
          flipped = [];
          isAnimating = false;
        }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800);
      }
    }
  }

  function showWin() {
    matchGrid.style.display = 'none';
    matchOver.style.display = 'block';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i=0; i<15; i++) {
      let h = document.createElement('div');
      h.textContent = '♡';
      h.style.position = 'absolute';
      h.style.color = 'var(--rose)';
      h.style.fontSize = (10 + Math.random()*10) + 'px';
      h.style.left = (20 + Math.random()*60) + '%';
      h.style.top = (20 + Math.random()*60) + '%';
      h.style.pointerEvents = 'none';
      h.style.transition = 'all 1s ease-out';
      h.style.transform = `translate(${(Math.random()-0.5)*50}px, ${(Math.random()-0.5)*50}px) scale(0)`;
      h.style.opacity = '1';
      h.style.zIndex = '10';
      matchOver.appendChild(h);

      setTimeout(() => {
        h.style.transform = `translate(${(Math.random()-0.5)*150}px, ${(Math.random()-0.5)*150}px) scale(1.5)`;
        h.style.opacity = '0';
      }, 50);
      setTimeout(() => h.remove(), 1050);
    }
  }

  if(matchReset) matchReset.addEventListener('click', initMatchGame);
  initMatchGame();

  // ===== Cassette Music Player (hidden YouTube backend) =====
  (function initCassette(){
    var widget  = document.getElementById('cassette-player');
    if (!widget) return;
    var songEl  = document.getElementById('cass-song');
    var artEl   = document.getElementById('cass-artist');
    var stripEl = document.getElementById('cass-strip');
    var countEl = document.getElementById('cass-count');
    var curEl   = document.getElementById('cass-cur');
    var durEl   = document.getElementById('cass-dur');
    var seek    = document.getElementById('cass-seek');
    var seekFill= document.getElementById('cass-seek-fill');
    var seekKnob= document.getElementById('cass-seek-knob');
    var playBtn = document.getElementById('cass-play');
    var playIcon= playBtn.querySelector('i');
    var prevBtn = document.getElementById('cass-prev');
    var nextBtn = document.getElementById('cass-next');
    var listEl  = document.getElementById('cass-list');

    // Paste whatever YouTube hands you — a watch URL, a youtu.be short link, an
    // embed URL, or the bare 11-character ID. Anything unrecognised returns ''
    // and the track is simply treated as empty rather than half-loading.
    function ytId(v){
      v = String(v || '').trim();
      if (!v) return '';
      if (/^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      var m = v.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      return m ? m[1] : '';
    }
    // --- Playlist. Paste the whole YouTube link into `yt` — watch URL, youtu.be
    //     short link, /shorts/, /embed/, or the bare 11-character ID all work.
    //     Set title and artist to the real song names; they are what visitors
    //     see, since the video itself never appears.
    //     'SpaceFuji' arrived as an album playlist link; that album holds this
    //     one track, so it is stored as the track itself rather than a list.
    var tracks = [
      { title: 'Dangerous',        artist: 'Ayra Starr',      yt: 'qYiKAV7SKjU' },
      { title: 'A Million Things', artist: 'taves',           yt: 'Jk4vaA85DAY' },
      { title: 'SpaceFuji',        artist: 'Bloody Civilian', yt: '685mVo_cWio' },
      { title: 'Earrings',         artist: 'Malcolm Todd',    yt: 'BI9HQCzpDgQ' },
      { title: 'Crack Baby',       artist: 'Mitski',          yt: 'edEO9Ldb_VQ' }
    ];

    var current = 0, seeking = false, dragPct = 0;
    var player = null, apiReady = false, poll = null, pendingPlay = false;

    function fmt(t){ if(!isFinite(t)||t<0) t=0; var m=Math.floor(t/60), s=Math.floor(t%60); return m+':'+(s<10?'0':'')+s; }
    function setSeekUI(pct){ pct = Math.max(0, Math.min(100, pct||0)); seekFill.style.width = pct + '%'; seekKnob.style.left = pct + '%'; seek.setAttribute('aria-valuenow', Math.round(pct)); }
    function hasTrack(){ return !!(tracks[current] && ytId(tracks[current].yt) && !tracks[current]._dead); }
    function dur(){ return (player && player.getDuration) ? (player.getDuration() || 0) : 0; }

    function renderList(){
      listEl.innerHTML = '';
      tracks.forEach(function(tr, i){
        var b = document.createElement('button');
        b.className = 'cass-track' + (i===current ? ' active' : '');
        b.setAttribute('role','option');
        b.setAttribute('aria-selected', i===current ? 'true' : 'false');
        b.innerHTML = '<span class="t-num">'+(i+1)+'</span><span class="t-name"></span>';
        b.querySelector('.t-name').textContent = tr.title;
        b.addEventListener('click', function(){ selectTrack(i, true); });
        listEl.appendChild(b);
      });
    }
    function updateMeta(){
      var tr = tracks[current];
      songEl.textContent = tr.title;
      artEl.textContent = tr.artist;
      countEl.textContent = (current+1) + ' / ' + tracks.length;
      [].forEach.call(listEl.children, function(el, i){
        el.classList.toggle('active', i===current);
        el.setAttribute('aria-selected', i===current ? 'true' : 'false');
      });
    }
    function setPlaying(p){
      playIcon.className = p ? 'ti ti-player-pause' : 'ti ti-player-play';
      playBtn.setAttribute('aria-label', p ? 'Pause' : 'Play');
      widget.classList.toggle('playing', p);
    }
    function stopPoll(){ if (poll){ clearInterval(poll); poll = null; } }
    function startPoll(){
      stopPoll();
      poll = setInterval(function(){
        if (!player || seeking) return;
        var d = dur(), t = player.getCurrentTime ? player.getCurrentTime() : 0;
        if (d){ durEl.textContent = fmt(d); curEl.textContent = fmt(t); setSeekUI((t/d)*100); }
      }, 250);
    }

    function selectTrack(i, autoplay){
      current = (i + tracks.length) % tracks.length;
      stripEl.textContent = 'maryam’s mixtape ♡';
      updateMeta();
      curEl.textContent = '0:00'; durEl.textContent = '0:00'; setSeekUI(0);
      var id = ytId(tracks[current].yt);
      if (!id){ stopPoll(); setPlaying(false); if (player && player.stopVideo) player.stopVideo(); return; }
      if (!apiReady || !player) return; // will start once the API is ready / a control is used
      if (autoplay) player.loadVideoById(id); else player.cueVideoById(id);
    }

    playBtn.addEventListener('click', function(){
      if (!hasTrack()) return;
      if (!apiReady || !player){ pendingPlay = true; loadAPI(); return; }
      var st = player.getPlayerState ? player.getPlayerState() : -1;
      var want = ytId(tracks[current].yt);
      var loaded = '';
      try { loaded = (player.getVideoData() || {}).video_id || ''; } catch(_){}
      if (st === 1) player.pauseVideo();                   // playing -> pause
      // Warming leaves the track cued, so the usual case is that the right video
      // is already here. Play it directly: loadVideoById would fetch it again and
      // only start once that returned, which is late enough that iOS stops
      // counting it as part of the tap that asked for it.
      else if (loaded && loaded === want) player.playVideo();
      else player.loadVideoById(want);                     // a different track
    });
    prevBtn.addEventListener('click', function(){
      if (player && player.getCurrentTime && player.getCurrentTime() > 3){ player.seekTo(0, true); return; }
      selectTrack(current-1, true);
    });
    nextBtn.addEventListener('click', function(){ selectTrack(current+1, true); });

    // Seek bar (drives the YouTube player)
    function pctFromX(x){ var r = seek.getBoundingClientRect(); var p = r.width ? ((x - r.left)/r.width)*100 : 0; return Math.max(0, Math.min(100, p)); }
    seek.addEventListener('pointerdown', function(e){
      if (!dur()) return;
      seeking = true; dragPct = pctFromX(e.clientX);
      try { seek.setPointerCapture(e.pointerId); } catch(_){}
      setSeekUI(dragPct); curEl.textContent = fmt(dur()*(dragPct/100)); e.preventDefault();
    });
    seek.addEventListener('pointermove', function(e){
      if (!seeking || !dur()) return;
      dragPct = pctFromX(e.clientX); setSeekUI(dragPct); curEl.textContent = fmt(dur()*(dragPct/100));
    });
    function endSeek(){ if (!seeking) return; if (dur() && player) player.seekTo(dur()*(dragPct/100), true); seeking = false; }
    seek.addEventListener('pointerup', endSeek);
    seek.addEventListener('pointercancel', function(){ seeking = false; });
    seek.addEventListener('keydown', function(e){
      if (!dur() || !player) return;
      var t = player.getCurrentTime();
      if (e.key === 'ArrowRight'){ player.seekTo(Math.min(dur(), t+5), true); e.preventDefault(); }
      else if (e.key === 'ArrowLeft'){ player.seekTo(Math.max(0, t-5), true); e.preventDefault(); }
    });

    // --- YouTube IFrame Player API (hidden, audio only) ---

    // Fill the buffer before anyone presses play.
    //
    // Cueing a track loads its metadata but no audio, so the first press spent a
    // second or two buffering and playback began long after the tap that asked
    // for it — measured at 1900ms. Desktop tolerates that gap. iOS does not: it
    // wants playback to start within the gesture, so it refused, and the site
    // needed two presses there. The second only worked because the first had
    // filled the buffer on its way to being rejected.
    //
    // Muted autoplay is the one form of unprompted playback every browser
    // allows, iOS included — it is how silent background video works. Playing
    // muted fills the buffer; the track is then paused, rewound and unmuted,
    // leaving it ready to start inside the press. Same measurement with this in
    // place: 71ms.
    var priming = false;
    function primeBuffer(id){
      if (!player || priming) return;
      priming = true;
      try { player.mute(); player.loadVideoById(id); }
      catch(e){ priming = false; return; }
      var tries = 0;
      var iv = setInterval(function(){
        tries++;
        var frac = 0;
        try { frac = player.getVideoLoadedFraction() || 0; } catch(_){}
        // Give up after roughly six seconds and leave it cued as before, rather
        // than holding a muted player open indefinitely on a bad connection.
        if (frac <= 0.01 && tries <= 24) return;
        clearInterval(iv);
        try { player.pauseVideo(); } catch(_){}
        setTimeout(function(){
          try { player.seekTo(0, true); player.unMute(); } catch(_){}
          setPlaying(false);
          curEl.textContent = '0:00'; setSeekUI(0);
          // Released a beat later so the pause and rewind above are not mistaken
          // for the visitor doing something.
          setTimeout(function(){ priming = false; }, 200);
        }, 150);
      }, 250);
    }

    function onState(e){
      // Priming drives the player itself. Those transitions are not the visitor
      // pressing anything, so the widget must not react to them.
      if (priming) return;
      if (e.data === 1){ setPlaying(true); startPoll(); }                         // playing
      else if (e.data === 2){ setPlaying(false); }                                // paused
      else if (e.data === 0){ setPlaying(false); stopPoll(); selectTrack(current+1, true); } // ended -> next
    }
    // A hardcoded playlist of YouTube IDs rots: videos get removed, region
    // locked, or have embedding switched off by the uploader. Without this the
    // player just sits there looking broken. Mark the track dead, say so, and
    // move on — but stop if every track has failed, rather than spinning.
    function onError(){
      var t = tracks[current];
      if (t) t._dead = true;
      stopPoll(); setPlaying(false);
      if (tracks.every(function(x){ return x._dead || !ytId(x.yt); })){
        stripEl.textContent = 'mixtape unavailable ♡';
        updateMeta();
        return;
      }
      stripEl.textContent = 'skipping unavailable track…';
      var next = current;
      for (var i = 1; i <= tracks.length; i++){
        var j = (current + i) % tracks.length;
        if (!tracks[j]._dead && ytId(tracks[j].yt)){ next = j; break; }
      }
      selectTrack(next, true);
    }
    function buildPlayer(){
      player = new YT.Player('cass-yt', {
        height: '200', width: '200',
        playerVars: { playsinline: 1, controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3 },
        events: {
          onReady: function(){
            apiReady = true;
            var id = ytId(tracks[current].yt);
            if (!id) return;
            if (pendingPlay){ pendingPlay = false; player.loadVideoById(id); }
            // Warming path: prime rather than merely cue, so the track is ready
            // to start the instant it is asked for. Only the opening track needs
            // this — once anything has played, the player counts as user-started
            // and later tracks begin promptly on their own.
            else primeBuffer(id);
          },
          onStateChange: onState,
          onError: onError
        }
      });
    }
    // Guarded because this is now called from several places. Without it a
    // second call would wrap onYouTubeIframeAPIReady a second time and build two
    // players over the same element.
    var apiRequested = false;
    function loadAPI(){
      if (apiRequested) return;
      apiRequested = true;
      if (window.YT && window.YT.Player){ buildPlayer(); return; }
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function(){ if (typeof prev === 'function') prev(); buildPlayer(); };
      if (!document.getElementById('yt-iframe-api')){
        var tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }

    // Have a player ready before anyone reaches for play.
    //
    // The press used to be what started the download, so the play call came from
    // onReady long afterwards — outside the click that caused it. A gesture only
    // authorises playback for a few seconds, and iOS is stricter still, wanting
    // the call in the same task as the tap. So the deferred call was refused and
    // the visitor pressed again, which worked only because the player existed by
    // then and the second call ran inside the tap.
    //
    // This deliberately does not wait for a first interaction. Measured on live,
    // the player needs about 2.6s from request to ready, while a tap's click
    // lands roughly 100ms after it begins. Someone whose first act is pressing
    // play — the widget sits on the home screen, so that is the obvious thing to
    // do — could never win that race. Warming has to finish before the first
    // tap, which means starting it without one.
    //
    // The cost is the YouTube player loading for every visitor, including those
    // who never play anything. It is deferred to idle time after the page has
    // settled so it competes with nothing, and only the player shell and the
    // cued track's metadata load here — no audio is fetched until a real press.
    (function warmPlayerOnLoad(){
      function warmWhenIdle(){
        if (window.requestIdleCallback) requestIdleCallback(function(){ loadAPI(); }, { timeout: 3000 });
        else setTimeout(loadAPI, 600);
      }
      if (document.readyState === 'complete') warmWhenIdle();
      else window.addEventListener('load', warmWhenIdle, { once: true });
      // A pointer arriving over the widget skips the idle queue, in case the
      // page is still busy when someone goes straight for the music.
      widget.addEventListener('pointerenter', function(){ loadAPI(); }, { passive: true });
    })();

    renderList();
    updateMeta();
  })();

  // ===== Widget column placement =====
  // The desktop floats the widgets in a rail on the right. A phone has no room
  // for a rail, so the same nodes move into the icon grid and become the last
  // row of the home screen, scrolling with the icons instead of covering them.
  // The nodes are moved rather than duplicated: every widget is wired up by
  // getElementById, so a second copy would render but be dead.
  (function initWidgetPlacement(){
    var col   = document.getElementById('widget-column');
    var icons = document.getElementById('icons');
    var desk  = document.getElementById('desktop');
    if(!col || !icons || !desk) return;

    // Reparent the YouTube iframe to the body first. Moving an iframe within
    // the DOM reloads it, so leaving it inside the column would cut the music
    // off every time the phone is rotated across the breakpoint. It is fixed
    // and offscreen, so the body is as good a home as any.
    var yt = document.getElementById('cass-yt-wrap');
    if(yt && yt.parentNode !== document.body) document.body.appendChild(yt);

    // On a phone the board is not shown on the home screen at all. A teaser card
    // takes its place and opens #game, and the board itself is moved in there.
    var match    = document.getElementById('match-widget');
    var gameBody = document.getElementById('game-body');
    var gameWin  = document.getElementById('game');

    // Where each node sits on the desktop, so both can be put back exactly.
    var deskAnchor  = col.nextSibling;
    var matchAnchor = match ? match.nextSibling : null;
    var onPhone = null;

    // Rotating a phone into landscape crosses 767px, which pulls the board back
    // into the rail. A game window left open would then be an empty frame, so it
    // is closed on the way past. closeWin is deliberately not used here: it
    // plays a click and runs a genie animation, and neither belongs in a layout
    // change the visitor did not ask for. This mirrors its bookkeeping instead.
    function closeGameSilently(){
      if(!gameWin || !gameWin.classList.contains('open')) return;
      gameWin.classList.remove('open','min','genie-prep');
      openOrder = openOrder.filter(function(x){ return x !== gameWin.id; });
      var last = openOrder[openOrder.length - 1];
      setActive(last ? document.getElementById(last) : null);
      syncMaxed();
    }

    // A media query listener, not a resize handler: it fires once when the
    // breakpoint is actually crossed rather than on every pixel of a drag, and
    // it reads the same 767px boundary the stylesheet uses, so the layout and
    // the DOM can never disagree about which mode is in effect.
    var phoneMQ = window.matchMedia('(max-width: 767px)');

    function place(){
      var phone = phoneMQ.matches;
      // Reparenting restarts the widgets' CSS transitions, so only move the
      // node when the side of the breakpoint has genuinely changed.
      if(phone === onPhone) return;
      onPhone = phone;
      if(phone){
        icons.appendChild(col);
        if(match && gameBody) gameBody.appendChild(match);
      }else{
        desk.insertBefore(col, deskAnchor);
        if(match && gameBody) col.insertBefore(match, matchAnchor);
        closeGameSilently();
      }
    }

    place();
    if(phoneMQ.addEventListener) phoneMQ.addEventListener('change', place);
    else if(phoneMQ.addListener) phoneMQ.addListener(place); // Safari < 14
    // Belt and braces. If either signal is missed the column is stranded in the
    // wrong parent and lands offscreen, and the guard above makes the duplicate
    // calls free, so it is worth listening to both.
    window.addEventListener('resize', place);
    window.addEventListener('orientationchange', place);
  })();

})();
