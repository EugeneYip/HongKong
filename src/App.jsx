import React, { useLayoutEffect, useRef } from "react";

/* React/Vite host adapter only. This is intentionally separate from HK_CSS,
   which remains a byte-for-byte copy of the original <style> block. */
const HOST_RESET_CSS = String.raw`
:where(html){
  color-scheme:normal;
  font-synthesis:auto;
  text-rendering:auto;
}
body{display:block;place-items:normal;min-width:0;min-height:0}
:where(#root,#root *){all:revert}
:where(#root *::before,#root *::after){all:revert}
`;

const HK_CSS = String.raw`
/* ===========================================================================
   Hong Kong Reference Atlas

   Palette from the brand guidelines. Parchment #FCFAF2 is the ground.
   Slate teal carries text and figures, deep plum carries headings, sumire
   violet is the interactive accent. Map layers borrow from the extended
   Nippon palette: 縹 for water, 鳶色 for relief, 常盤 for protected land.

   Two things govern the layout. First, nothing is fixed in pixels: type and
   spacing are fluid across 360px to 2560px. Second, map lettering is sized in
   screen pixels rather than map units, so it stays legible at every zoom.

   Tokens, grounds, controls and map ink follow the United States and Taiwan
   sheets exactly; only what the territory itself requires is added at the end.
   =========================================================================== */
:root{
  --parchment:#FCFAF2; --slate:#2E5C6E; --plum:#622954; --red:#C00000;
  --ruri:#005CAF; --sumire:#66327C; --charcoal:#2D3748;
  --rikyu:#707C74; --ama:#C4A882; --tobi:#724938; --hanada:#2B618F;
  --seiji:#6A8F8D; --tokiwa:#007B43; --haizakura:#E8D3C7; --budou:#522F60;

  --serif:"Source Serif 4","Noto Serif TC","Noto Serif JP",Georgia,"Times New Roman",serif;
  --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;

  --fs:clamp(13px,0.20vw + 12.3px,15px);
  --sp:clamp(0.75rem,1.1vw,1.5rem);
  --r:10px; --r-sm:7px; --r-pill:999px;
  --shadow:0 1px 2px rgba(46,92,110,.05),0 8px 24px -12px rgba(46,92,110,.16);
  --shadow-lg:0 2px 6px rgba(46,92,110,.07),0 22px 48px -20px rgba(46,92,110,.28);
}
:root[data-ground="paper"]{
  --bg:#FCFAF2; --surf:#FFFDF7; --surf2:#F4F0E5; --surf3:#EAE4D6;
  --ink:#2E5C6E; --ink2:#5F7379; --ink3:#8D9894; --head:#622954;
  --line:rgba(112,124,116,.20); --line2:rgba(112,124,116,.38); --accent:#66327C;
  --bd:#5E8593; --coast:#2E5C6E;
  --sea:#C7DBE0; --sea2:#A9C6CE; --land:#FDFCF5; --selfill:#EEDCE8;
}
:root[data-ground="dusk"]{
  --bg:#EFEADC; --surf:#F7F2E5; --surf2:#E6E0D0; --surf3:#DAD3C1;
  --ink:#28505E; --ink2:#586B71; --ink3:#7C867F; --head:#5A2549;
  --line:rgba(88,99,92,.24); --line2:rgba(88,99,92,.44); --accent:#5A2549;
  --bd:#587F8C; --coast:#28525F;
  --sea:#BCCFD2; --sea2:#9FB8BD; --land:#F9F5EA; --selfill:#E4D0DE;
}
:root[data-ground="night"]{
  --bg:#1D242E; --surf:#252E3A; --surf2:#2E3844; --surf3:#3A4552;
  --ink:#DBE5E7; --ink2:#9FB0B5; --ink3:#7A868B; --head:#CE9CC0;
  --line:rgba(219,229,231,.14); --line2:rgba(219,229,231,.26); --accent:#CE9CC0;
  --bd:#84999F; --coast:#B6CBD3;
  --sea:#101720; --sea2:#1F3140; --land:#404C5A; --selfill:#553055;
  --shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px -12px rgba(0,0,0,.5);
  --shadow-lg:0 2px 6px rgba(0,0,0,.35),0 22px 48px -20px rgba(0,0,0,.6);
}
:root[data-density="tight"]{--fs:clamp(12.2px,0.16vw + 11.7px,14px);--sp:clamp(.6rem,.8vw,1.05rem)}

*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--serif);
  font-size:var(--fs);line-height:1.55;font-weight:400;
  -webkit-font-smoothing:antialiased;
  transition:background-color .25s ease,color .25s ease;
  padding:clamp(.7rem,1.6vw,1.9rem) clamp(.7rem,2.2vw,2.4rem) clamp(2rem,4vw,4rem)}
.app{max-width:1720px;margin:0 auto}
h1,h2,h3{margin:0;font-weight:500;line-height:1.2;color:var(--head);letter-spacing:-.008em}
p{margin:0}
button,input,select{font:inherit;color:inherit;font-family:var(--serif)}
button{background:none;border:0;cursor:pointer;padding:0}
:focus-visible{outline:2px solid var(--sumire);outline-offset:2px;border-radius:4px}
.mono{font-family:var(--mono);font-variant-numeric:tabular-nums;font-weight:400;letter-spacing:-.02em}
.tag{font-size:.66em;letter-spacing:.13em;text-transform:uppercase;color:var(--ink3);
  font-weight:500;font-family:var(--serif)}
html[lang^="zh"] .tag,html[lang^="ja"] .tag{letter-spacing:.05em;text-transform:none;font-size:.72em}

/* ---------------- line breaking in Chinese and Japanese ----------------
   Neither language uses spaces, so a browser is free to break a line between
   any two characters. That splits proper nouns down the middle: 西班牙 comes
   out as 西班 / 牙, 中華民國 as 中華 / 民國. keep-all suppresses the implicit
   break between ideographs, leaving punctuation as the break opportunity,
   which is where a reader expects a line to end. overflow-wrap is the safety
   valve for any run genuinely too long for its line, and line-break:strict
   applies the kinsoku rules that keep closing punctuation off a line's head.

   The measure is set separately for these languages. A ch is the width of the
   digit zero, about half a Chinese character, so a measure written in ch comes
   out half as long as intended and the text stops well short of the column.
   One em is one character, so the measures below are stated in em. */
html[lang^="zh"],html[lang^="ja"]{
  word-break:keep-all;overflow-wrap:break-word;line-break:strict}
html[lang^="zh"] .nathist .prose,html[lang^="ja"] .nathist .prose{max-width:42em}
html[lang^="zh"] .natcol .prose,html[lang^="ja"] .natcol .prose{max-width:30em}
html[lang^="zh"] .eranote,html[lang^="ja"] .eranote{max-width:42em}
html[lang^="zh"] .eracaveat,html[lang^="ja"] .eracaveat{max-width:42em}
html[lang^="zh"] details.notes p,html[lang^="ja"] details.notes p{max-width:42em}
html[lang^="zh"] .hint p,html[lang^="ja"] .hint p{max-width:38em}
/* Two containers are narrower than their longest unbreakable run once breaks
   between ideographs are suppressed. Widening them for these languages keeps
   the safety valve from having to fire, which is what would reintroduce an
   arbitrary break mid-phrase. */
html[lang^="zh"] .rd-b,html[lang^="ja"] .rd-b{columns:clamp(21rem,23vw,23rem)}
html[lang^="zh"] .succ,html[lang^="ja"] .succ{
  grid-template-columns:repeat(auto-fill,minmax(min(24rem,100%),1fr))}
html[lang^="zh"] section>header p,html[lang^="ja"] section>header p{max-width:42em}
/* Balance the last line where the browser supports it, so a paragraph does not
   end on a single stranded character. */
.prose,.eranote,.eracaveat,.hint p,details.notes p{text-wrap:pretty}
::selection{background:color-mix(in srgb,var(--sumire) 26%,transparent);color:inherit}
::-moz-selection{background:color-mix(in srgb,var(--sumire) 26%,transparent);color:inherit}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* ---------------- header ---------------- */
.hd{display:flex;align-items:center;gap:clamp(.5rem,1.4vw,1.2rem);
  padding-bottom:clamp(.5rem,.9vw,.85rem);flex-wrap:nowrap}
.hd h1{font-size:clamp(1.02rem,1.5vw + .48rem,1.85rem);font-weight:600;
  min-width:0;overflow-wrap:anywhere;text-wrap:balance}
@media(max-width:560px){
  .pill > span:not(.dot){display:none}
  .pill{padding:.42rem}
  .hd{align-items:center}
}
.hd-r{margin-left:auto;display:flex;align-items:center;gap:.45rem;flex:0 0 auto}
.pill{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .7rem;
  border:1px solid var(--line2);border-radius:var(--r-pill);background:var(--surf);
  font-size:.78em;color:var(--ink2);white-space:nowrap;box-shadow:var(--shadow)}
.pill.act{border-color:var(--tokiwa);color:var(--tokiwa)}
.pill.warn{border-color:var(--red);color:var(--red)}
.dot{width:.42rem;height:.42rem;border-radius:50%;background:currentColor;flex:0 0 auto}
.iconbtn{width:2.15rem;height:2.15rem;border:1px solid var(--line2);border-radius:var(--r-pill);
  background:var(--surf);display:grid;place-items:center;color:var(--ink2);
  box-shadow:var(--shadow);transition:color .15s,border-color .15s}
.iconbtn:hover{color:var(--head);border-color:var(--line2)}
.iconbtn svg{width:1.05rem;height:1.05rem;fill:none;stroke:currentColor;stroke-width:1.5;
  stroke-linecap:round;stroke-linejoin:round}

/* settings popover */
.pop{position:absolute;top:calc(100% + .5rem);right:0;z-index:60;width:min(20rem,calc(100vw - 2rem));
  background:var(--surf);border:1px solid var(--line2);border-radius:var(--r);
  box-shadow:var(--shadow-lg);padding:.9rem;display:none}
.pop.open{display:block}
.pop .grp{padding:.5rem 0}
.pop .grp + .grp{border-top:1px solid var(--line)}
.pop .tag{display:block;margin-bottom:.45rem}
.seg{display:flex;gap:.25rem;background:var(--surf2);padding:.22rem;border-radius:var(--r-pill)}
.seg button{flex:1;padding:.34rem .3rem;border-radius:var(--r-pill);font-size:.84em;
  color:var(--ink2);white-space:nowrap;transition:background .15s,color .15s}
.seg button[aria-pressed="true"]{background:var(--surf);color:var(--head);font-weight:500;
  box-shadow:0 1px 3px rgba(46,92,110,.14)}
.groundwhy{margin:.45rem 0 0;font-size:.74em;line-height:1.5;color:var(--ink3)}
.groundwhy b{color:var(--ink2);font-weight:500}
.rowsw{display:flex;align-items:center;justify-content:space-between;gap:.6rem;padding:.32rem 0;
  font-size:.9em;color:var(--ink2);width:100%;text-align:left}
.knob{width:2.1rem;height:1.15rem;border-radius:var(--r-pill);background:var(--surf3);
  position:relative;flex:0 0 auto;transition:background .18s}
.knob::after{content:"";position:absolute;inset:.16rem auto .16rem .17rem;width:.83rem;
  border-radius:50%;background:var(--surf);transition:transform .18s;
  box-shadow:0 1px 2px rgba(0,0,0,.2)}
[aria-pressed="true"] > .knob{background:var(--sumire)}
[aria-pressed="true"] > .knob::after{transform:translateX(.95rem)}

/* ---------------- metadata strip ---------------- */
.strip{display:flex;gap:clamp(.9rem,2.4vw,2.6rem);align-items:baseline;
  border-top:1px solid var(--line);border-bottom:1px solid var(--line);
  padding:.5rem 0;margin-bottom:var(--sp);overflow-x:auto;scrollbar-width:none}
.strip::-webkit-scrollbar{display:none}
@media(max-width:760px){
  .strip{mask-image:linear-gradient(90deg,#000 88%,transparent);
    -webkit-mask-image:linear-gradient(90deg,#000 88%,transparent)}
  .rh .c{display:none}
}
.strip > div{flex:0 0 auto;min-width:0}
.strip .tag{display:block;margin-bottom:.05rem}
.strip .v{font-family:var(--mono);font-size:.82em;white-space:nowrap;color:var(--ink)}
.strip .v b{color:var(--ruri);font-weight:500}

/* ---------------- main grid ---------------- */
.main{display:block}

/* ---------------- map stage ---------------- */
.stage{position:relative;background:var(--sea);border:1px solid var(--line);
  border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow);
  aspect-ratio:1000/720;max-width:min(100%,calc(86vh * 1.3889));margin-inline:auto}
@media(max-width:1179px){.stage{aspect-ratio:1000/760}}
@media(max-width:700px){.stage{aspect-ratio:1/0.98;max-width:100%}}
#map{position:absolute;inset:0;width:100%;height:100%;display:block;
  touch-action:none;cursor:grab;-webkit-tap-highlight-color:transparent}
#map.dragging{cursor:grabbing}
/* An outline on an SVG element is drawn around its bounding box, so a focus
   ring on a division becomes a large rectangle in the system accent colour
   sitting over the map. Outlines are therefore suppressed throughout the sheet
   and focus is shown with a stroke, which follows the actual shape. Selection
   is suppressed as well: dragging across the map otherwise sweeps a selection
   through the labels and paints a filled block across each one. */
#map,#map *{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;
  user-select:none;-webkit-tap-highlight-color:transparent;
  -webkit-touch-callout:none}
#map:focus,#map *:focus{outline:none}
#map:focus-visible{outline:2px solid var(--sumire);outline-offset:-3px}
/* map overlay chrome, restored verbatim from the reference sheet */
.ov{position:absolute;z-index:5;display:flex;gap:.4rem}
.ov-tl{top:.6rem;left:.6rem;right:.6rem;flex-wrap:wrap}
.ov-tr{top:.6rem;right:.6rem;flex-direction:column}
.ov-bl{bottom:.6rem;left:.6rem;align-items:flex-end;flex-wrap:wrap;max-width:calc(100% - 1.2rem)}
.glass{background:color-mix(in srgb,var(--surf) 93%,transparent);
  border:1px solid var(--line2);border-radius:var(--r-pill);box-shadow:var(--shadow);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.search{display:flex;align-items:center;gap:.4rem;padding:.05rem .3rem .05rem .7rem;
  max-width:min(17rem,60vw)}
.search input{border:0;background:none;padding:.42rem 0;width:100%;min-width:0;font-size:.88em}
.search input:focus{outline:none}
.search svg{width:.92rem;height:.92rem;fill:none;stroke:var(--ink3);stroke-width:1.6;flex:0 0 auto}
.search button{width:1.5rem;height:1.5rem;border-radius:50%;color:var(--ink3);flex:0 0 auto;
  display:grid;place-items:center;font-size:1rem;line-height:1}
.res{position:absolute;top:calc(100% + .35rem);left:0;width:min(20rem,80vw);max-height:15rem;
  overflow:auto;background:var(--surf);border:1px solid var(--line2);border-radius:var(--r);
  box-shadow:var(--shadow-lg);padding:.3rem;display:none;z-index:20}
.res.open{display:block}
.res button{display:block;width:100%;text-align:left;padding:.34rem .5rem;border-radius:var(--r-sm);
  font-size:.86em;line-height:1.3}
.res button:hover,.res button.on{background:var(--surf2)}
.res .k{display:block;font-family:var(--mono);font-size:.62rem;color:var(--ink3);
  letter-spacing:.04em}
.zoomstack{flex-direction:column;overflow:hidden;border-radius:var(--r);padding:0}
.zoomstack button{width:2rem;height:2rem;display:grid;place-items:center;color:var(--ink2)}
.zoomstack button + button{border-top:1px solid var(--line)}
.zoomstack button:hover{background:var(--surf2);color:var(--head)}
.zoomstack svg{width:.9rem;height:.9rem;fill:none;stroke:currentColor;stroke-width:1.7;
  stroke-linecap:round}
.zlevel{font-family:var(--mono);font-size:.58rem;color:var(--ink3);text-align:center;
  padding:.2rem 0;border-top:1px solid var(--line)}
.chipbtn{padding:.36rem .8rem;font-size:.8em;color:var(--ink2);display:inline-flex;
  align-items:center;gap:.35rem}
.chipbtn:hover{color:var(--head)}
.chipbtn svg{width:.85rem;height:.85rem;fill:none;stroke:currentColor;stroke-width:1.6}
.scalebox{padding:.3rem .6rem .25rem;display:flex;align-items:center;gap:.5rem}
.scalebox svg{display:block}

/* layer panel */
.lpanel{position:absolute;bottom:3rem;left:.6rem;z-index:25;width:min(16rem,calc(100% - 1.2rem));
  background:var(--surf);border:1px solid var(--line2);border-radius:var(--r);
  box-shadow:var(--shadow-lg);padding:.8rem;display:none;max-height:calc(100% - 4rem);
  overflow:auto}
.lpanel.open{display:block}
.lpanel .tag{display:block;margin:.1rem 0 .4rem}
.lpanel .grp + .grp{margin-top:.7rem;padding-top:.7rem;border-top:1px solid var(--line)}
.lsw{display:flex;align-items:center;gap:.5rem;width:100%;text-align:left;padding:.24rem 0;
  font-size:.86em;color:var(--ink3)}
.lsw::before{content:"";width:.95rem;height:.95rem;flex:0 0 auto;border-radius:4px;
  border:1.5px solid var(--line2);transition:background .15s,border-color .15s}
.lsw[aria-pressed="true"]{color:var(--ink)}
.lsw[aria-pressed="true"]::before{background:var(--sumire);border-color:var(--sumire);
  box-shadow:inset 0 0 0 2.5px var(--surf)}
.lsw i{margin-left:auto;width:1rem;height:0;border-top:2px solid currentColor;
  border-radius:2px;flex:0 0 auto}
select.sel{width:100%;padding:.4rem .55rem;border:1px solid var(--line2);border-radius:var(--r-sm);
  background:var(--surf2);font-size:.86em;appearance:none;
  background-image:linear-gradient(45deg,transparent 50%,var(--ink3) 50%),
                   linear-gradient(135deg,var(--ink3) 50%,transparent 50%);
  background-position:calc(100% - 15px) center,calc(100% - 10px) center;
  background-size:5px 5px,5px 5px;background-repeat:no-repeat}
.keybar{display:flex;height:.42rem;border-radius:3px;overflow:hidden;margin-top:.45rem}
.keycap{display:flex;justify-content:space-between;font-family:var(--mono);font-size:.6rem;
  color:var(--ink3);margin-top:.25rem;gap:.4rem}

/* tooltip */
.tip{position:absolute;z-index:40;pointer-events:none;background:var(--charcoal);
  color:#F2EFE6;padding:.28rem .55rem;border-radius:var(--r-sm);font-size:.78em;
  white-space:nowrap;opacity:0;transition:opacity .12s;
  transform:translate(-50%,calc(-100% - .55rem));box-shadow:var(--shadow-lg)}
.tip b{font-weight:500;color:#EFD9E8}
.tip span{display:block;font-family:var(--mono);font-size:.62rem;color:#A6BCB6;margin-top:.05rem}

/* ---------------- map ink ---------------- */

.coast{fill:none;stroke:var(--coast);stroke-width:calc(var(--u)*1.5px);
  stroke-linejoin:round;stroke-linecap:round;pointer-events:none}
.st{fill:var(--land);stroke:var(--bd);stroke-width:calc(var(--u)*1.15px);
  stroke-linejoin:round;cursor:pointer;transition:fill .12s}
.st:hover{fill:var(--haizakura)}
.st.sel{fill:var(--selfill);stroke:var(--sumire);stroke-width:calc(var(--u)*1.9px)}
.st:focus-visible{stroke:var(--sumire);stroke-width:calc(var(--u)*2.6px);
  stroke-dasharray:calc(var(--u)*5px) calc(var(--u)*3px)}
.cnty{fill:none;stroke:var(--bd);stroke-width:calc(var(--u)*.6px);opacity:.6;pointer-events:none}
.lake{fill:var(--sea2);stroke:var(--hanada);stroke-width:calc(var(--u)*.7px);opacity:.72}
.riv{fill:none;stroke:var(--hanada);stroke-linecap:round;stroke-linejoin:round;opacity:.85}
.rng{fill:none;stroke:var(--tobi);stroke-width:calc(var(--u)*2.6px);stroke-linecap:round;opacity:.24}
.grat{fill:none;stroke:var(--rikyu);stroke-width:calc(var(--u)*.4px);opacity:.28}
.ibox{fill:none;stroke:var(--rikyu);stroke-width:calc(var(--u)*.7px);opacity:.4;
  stroke-dasharray:calc(var(--u)*4px) calc(var(--u)*3px)}
text{pointer-events:none;paint-order:stroke}
/* Markers are counter-scaled so a dot stays a dot at every zoom level. */
.mk{transform:scale(var(--u));transform-origin:0 0;transform-box:view-box}
/* Inside .mk the group already carries the counter-scale, so type is plain px. */
.mk text{stroke-width:2.3px}
.mk .ctl{font-size:9.8px}
.mk .pkl{font-size:9.4px}
.tl{font-family:var(--serif);font-weight:600;font-size:calc(var(--u)*11.5px);fill:var(--ink);
  text-anchor:middle;stroke:var(--land);stroke-width:calc(var(--u)*2.6px);stroke-linejoin:round}
.tw{font-family:var(--serif);font-style:italic;font-size:calc(var(--u)*9.4px);fill:var(--hanada);
  stroke:var(--sea);stroke-width:calc(var(--u)*2.2px)}
.twl{stroke:var(--land)}
.tg{font-family:var(--serif);font-size:calc(var(--u)*8.4px);font-weight:500;fill:var(--tobi);
  letter-spacing:calc(var(--u)*1.5px);stroke:var(--land);stroke-width:calc(var(--u)*2.2px);
  opacity:.85}
.tp{font-family:var(--serif);font-size:calc(var(--u)*9px);fill:var(--tobi);opacity:.5;
  letter-spacing:calc(var(--u)*2.2px);text-anchor:middle;stroke:var(--land);
  stroke-width:calc(var(--u)*2.4px)}
.pk{fill:var(--tokiwa);stroke:var(--land);stroke-width:calc(var(--u)*.7px)}
.pkl{font-family:var(--serif);font-size:calc(var(--u)*9px);fill:var(--tokiwa);
  stroke:var(--land);stroke-width:calc(var(--u)*2.2px)}
.ct{fill:var(--ink)}
.ctc{fill:var(--land);stroke:var(--ink);stroke-width:calc(var(--u)*1.1px)}
.mk .ctc{stroke-width:1.1px}
.ctl{font-family:var(--serif);font-size:calc(var(--u)*9.4px);fill:var(--ink);
  stroke:var(--land);stroke-width:calc(var(--u)*2.2px)}
.ctl.cap{font-weight:600}
.il{font-family:var(--serif);font-size:calc(var(--u)*9.6px);font-weight:500;fill:var(--ink3);
  letter-spacing:calc(var(--u)*1.6px);text-anchor:middle}
[data-off="1"]{display:none}
text[data-hid="1"]{visibility:hidden}

/* ---------------- record ---------------- */
.rec{background:var(--surf);border:1px solid var(--line);border-radius:var(--r);
  box-shadow:var(--shadow);overflow:hidden;margin-top:var(--sp);scroll-margin-top:.6rem}
.rd-h{padding:.85rem 1.1rem .7rem;border-bottom:1px solid var(--line);display:flex;
  gap:.7rem;align-items:flex-start}
.rd-h h2{font-size:clamp(1.25rem,1.3vw + .85rem,1.85rem);font-weight:600}
.rd-h .nick{font-style:italic;color:var(--ink2);font-size:.88em;margin-top:.1rem}
.rd-x{width:1.8rem;height:1.8rem;border-radius:50%;border:1px solid var(--line2);
  display:grid;place-items:center;color:var(--ink3);flex:0 0 auto;font-size:1.05rem;
  line-height:1;margin-left:auto}
.rd-x:hover{color:var(--head);border-color:var(--head)}
.rd-b{padding:.2rem 1.1rem 1.1rem;columns:clamp(17rem,21vw,21rem);column-gap:clamp(1.4rem,3vw,3rem)}
.blk{padding:.7rem 0;border-bottom:1px solid var(--line);break-inside:avoid-column}
.blk:last-child{border-bottom:0}
.blk > .tag{display:block;margin-bottom:.4rem}
.figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(6.1rem,1fr));gap:.6rem .8rem}
.figs .v{font-family:var(--mono);font-size:1em;letter-spacing:-.035em;line-height:1.2;
  white-space:nowrap}
.figs .r{font-family:var(--mono);font-size:.62rem;color:var(--accent)}
.kv{display:grid;grid-template-columns:minmax(4.6rem,auto) 1fr;gap:.28rem .7rem;margin:0;font-size:.88em}
.kv dt{color:var(--ink3);font-size:.72em;letter-spacing:.09em;text-transform:uppercase;padding-top:.25em}
html[lang^="zh"] .kv dt,html[lang^="ja"] .kv dt{text-transform:none;letter-spacing:.03em;font-size:.8em}
.kv dd{margin:0;overflow-wrap:anywhere}
.prose{font-size:.9em;line-height:1.62;color:var(--ink)}
.chips{display:flex;flex-wrap:wrap;gap:.28rem}
.chip{font-size:.78em;border:1px solid var(--line2);padding:.1rem .48rem;border-radius:var(--r-pill);
  background:var(--bg);color:var(--ink2);overflow-wrap:anywhere}
.chip.w{font-style:italic;color:var(--hanada);border-color:color-mix(in srgb,var(--hanada) 30%,transparent)}
.chip.r{color:var(--tobi);border-color:color-mix(in srgb,var(--tobi) 30%,transparent)}
.chip.p{color:var(--tokiwa);border-color:color-mix(in srgb,var(--tokiwa) 30%,transparent)}
.relief{display:grid;grid-template-columns:1fr 1fr;gap:.5rem .8rem;font-size:.88em}
.relief > div:last-child{text-align:right}
.relief .tag{display:block}
.track{height:.34rem;background:var(--surf3);border-radius:3px;position:relative;margin-top:.5rem;
  overflow:hidden}
.track > span{position:absolute;inset:0 auto 0 0;background:var(--tobi);opacity:.75;border-radius:3px}
.mini{display:flex;justify-content:space-between;font-family:var(--mono);font-size:.6rem;
  color:var(--ink3);margin-top:.25rem;gap:.4rem}
.hint{padding:1rem 1.1rem 1.2rem}
.hint p{font-size:.88em;color:var(--ink2);line-height:1.6;margin-top:.4rem;max-width:70ch}
.natg{display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:.8rem 1rem;margin-top:.9rem}
.natg .v{font-family:var(--mono);font-size:1.02em;letter-spacing:-.03em}

.natsec .refbody{padding:0}
.natfacts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(9.5rem,100%),1fr));
  gap:.7rem clamp(1rem,2.4vw,2.4rem);margin:0;padding:.9rem 1.1rem;
  border-bottom:1px solid var(--line)}
.natfacts > div{min-width:0;display:flex;flex-direction:column;gap:.12rem}
.natfacts dt{margin:0}
.natfacts dd{margin:0;font-family:var(--mono);font-size:.84em;overflow-wrap:anywhere;
  margin-top:auto}
.natgrid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(22rem,100%),1fr));
  gap:0;border-bottom:1px solid var(--line)}
.natcol{padding:.9rem 1.1rem 1.1rem;border-right:1px solid var(--line);min-width:0}
.natcol:last-child{border-right:0}
@media(max-width:1000px){.natcol{border-right:0;border-bottom:1px solid var(--line)}
  .natcol:last-child{border-bottom:0}}
.natcol > .tag{display:block;margin-bottom:.6rem}
.natcol .prose{max-width:52ch}
.natcol .kv{max-width:23rem}
.nathist{padding:.9rem 1.1rem 1.1rem}
.nathist > .tag{display:block;margin-bottom:.5rem}
.nathist .prose{max-width:78ch;margin-bottom:.7rem}
.flagbox{border:1px solid var(--line2);border-radius:var(--r-sm);overflow:hidden;
  line-height:0;background:var(--bg);max-width:23rem}
#flag{display:block;width:100%;height:auto}
.anthemT{font-size:1.05em;font-weight:600;color:var(--head)}
.anthemSub{font-size:.78em;color:var(--ink3);font-family:var(--mono);margin:.15rem 0 .6rem}
.verse{font-size:.86em;line-height:1.72;font-style:italic;color:var(--ink);
  padding-left:.75rem;border-left:2px solid var(--line2);margin:0 0 .6rem}

.natfoot{padding:.7rem 1.1rem .9rem;border-top:1px solid var(--line);
  display:flex;gap:.6rem 1.4rem;align-items:baseline;flex-wrap:wrap}
.links{list-style:none;display:flex;gap:.4rem 1.4rem;margin:0;padding:0;flex-wrap:wrap;
  font-size:.84em}
.links a{font-family:var(--mono);color:var(--ruri);text-decoration:none}
.links a:hover{text-decoration:underline}
.links span{color:var(--ink3);margin-left:.35rem}

/* ---------------- reference ---------------- */
details.ref{margin-top:var(--sp);border:1px solid var(--line);border-radius:var(--r);
  background:var(--surf);overflow:hidden;box-shadow:var(--shadow)}
details.ref > summary{list-style:none;cursor:pointer;padding:.7rem 1.1rem;display:flex;
  align-items:baseline;gap:.5rem .9rem;flex-wrap:wrap;transition:background .15s}
details.ref > summary::-webkit-details-marker{display:none}
details.ref > summary:hover{background:var(--surf2)}
details.ref > summary:focus-visible{outline:2px solid var(--sumire);outline-offset:-2px}
details.ref > summary h2{font-size:clamp(1rem,.7vw + .8rem,1.28rem);font-weight:600}
details.ref > summary .c{font-family:var(--mono);font-size:.7rem;color:var(--ink3)}
details.ref > summary::after{content:"";margin-left:auto;width:.46rem;height:.46rem;
  border-right:1.6px solid var(--ink3);border-bottom:1.6px solid var(--ink3);
  transform:rotate(45deg) translate(-.12rem,-.12rem);transition:transform .2s;
  flex:0 0 auto;align-self:center}
details.ref[open] > summary::after{transform:rotate(-135deg)}
details.ref[open] > summary{border-bottom:1px solid var(--line)}
.refbody{padding:.9rem 1.1rem 1.1rem}
.refbody > .tw-wrap{border-radius:var(--r-sm)}
.notes .refbody{padding-top:.2rem}
.tw-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:var(--r);background:var(--surf)}
table{width:100%;border-collapse:collapse;font-size:.82em}
th{font-size:.7em;letter-spacing:.08em;text-transform:uppercase;color:var(--head);text-align:left;
  padding:.5rem .6rem;background:var(--surf2);border-bottom:1px solid var(--line2);
  white-space:nowrap;cursor:pointer;position:sticky;top:0;z-index:1;font-weight:500}
html[lang^="zh"] th,html[lang^="ja"] th{text-transform:none;letter-spacing:.02em;font-size:.78em}
th:hover{color:var(--accent)}
th.n,td.n{text-align:right}
th[aria-sort]::after{content:"";display:inline-block;margin-left:.3em;
  border:.26em solid transparent}
th[aria-sort="ascending"]::after{border-bottom-color:var(--accent);margin-bottom:.24em}
th[aria-sort="descending"]::after{border-top-color:var(--accent);margin-top:.24em}
td{padding:.38rem .6rem;border-bottom:1px solid var(--line);white-space:nowrap}
td.wrap{white-space:normal;min-width:14rem}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover{background:var(--surf2)}
td.nm button{color:var(--ruri);font-weight:500;text-align:left}
td.nm button:hover{text-decoration:underline}
@media(max-width:960px){[data-opt="1"]{display:none}}
@media(max-width:620px){[data-opt="2"]{display:none}}
.facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(15rem,100%),1fr));
  gap:0 clamp(1rem,2.4vw,2.4rem)}
.fact{padding:.42rem 0;border-bottom:1px solid var(--line)}
.fact .l{font-size:.7em;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}
html[lang^="zh"] .fact .l,html[lang^="ja"] .fact .l{text-transform:none;letter-spacing:.02em;font-size:.78em}
.fact .v{font-size:.9em;overflow-wrap:anywhere}
.fact .v b{font-weight:600;color:var(--ruri)}
.fact .v .mono{font-size:.86em;color:var(--ink2)}

details.notes h3{font-size:.72em;letter-spacing:.11em;text-transform:uppercase;color:var(--head);
  margin:1rem 0 .3rem;font-weight:500}
html[lang^="zh"] footer h3,html[lang^="ja"] details.notes h3{text-transform:none;letter-spacing:.03em;font-size:.82em}
details.notes p{font-size:.86em;line-height:1.65;color:var(--ink2);max-width:80ch}
details.notes .warn{border-left:2px solid var(--red);padding-left:.85rem}
details.notes .src{font-family:var(--mono);font-size:.72rem;line-height:1.9;color:var(--ink3);
  overflow-wrap:anywhere}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}

/* ---------------- additions for this sheet ---------------- */
/* Hong Kong has no tier below the district, so the second boundary layer runs
   the other way: it draws the three areas the districts are grouped into,
   Hong Kong Island, Kowloon and the New Territories, at a heavier weight. The
   gazetted layer is the Home Affairs Department's district limits, which run
   out to sea and are therefore drawn as a dashed line over the water rather
   than substituted for the land outline. */
.area{fill:none;stroke:var(--plum);stroke-width:calc(var(--u)*2.2px);opacity:.55;
  stroke-linejoin:round;pointer-events:none}
.gaz{fill:none;stroke:var(--rikyu);stroke-width:calc(var(--u)*.8px);opacity:.7;
  stroke-dasharray:calc(var(--u)*4px) calc(var(--u)*3px);pointer-events:none}

.histsplit{margin-top:1.1rem;padding-top:.9rem;border-top:1px solid var(--line)}
.histsplit > .tag{display:block;margin-bottom:.5rem}
.hintline{font-size:.74em;color:var(--ink3);margin:.42rem 0 0;line-height:1.45}

/* succession of authority: flag chips beside each regime */
.succ{list-style:none;margin:.6rem 0 0;padding:0;display:grid;
  grid-template-columns:repeat(auto-fill,minmax(min(17rem,100%),1fr));
  gap:.1rem clamp(1rem,2.4vw,2.4rem)}
.succ li{display:grid;grid-template-columns:2.5rem minmax(0,1fr);gap:.6rem;
  padding:.42rem 0;border-bottom:1px solid var(--line);align-items:start}
.succ li > span:last-child{min-width:0}
.succ .fl{width:2.5rem;height:1.67rem;border:1px solid var(--line2);
  border-radius:2px;overflow:hidden;background:var(--bg)}
.succ .fl svg{display:block;width:100%;height:100%}
.succ .fl.none{border-style:dashed;opacity:.55}
.succ .y{font-family:var(--mono);font-size:.72em;color:var(--accent);
  display:block;overflow-wrap:anywhere}
.succ .n{font-size:.9em;font-weight:500;display:block;overflow-wrap:anywhere}
.succ .d{font-size:.8em;color:var(--ink3);line-height:1.5;display:block;
  margin-top:.1rem;overflow-wrap:anywhere}

/* Historical eras.

   Names are never set inside the bands. A linear time axis puts the Qin at
   0.37% of its width, so any lettering placed there is bound to clip, overlap
   its neighbour or be covered; the Japan sheet solves this by leaving the bands
   as colour alone, and this follows it. Every name is then given in full in a
   legend that wraps, so nothing is ever truncated at any viewport width. */
.eras{margin-top:.7rem}
.erapre{display:flex;align-items:center;gap:.5rem;font-family:var(--mono);
  font-size:.6rem;color:var(--ink3);margin-bottom:.2rem}
.erapre i{flex:1 1 auto;height:.3rem;border-radius:2px;
  background:repeating-linear-gradient(90deg,var(--ama) 0 6px,transparent 6px 11px)}
.eraband{display:flex;width:100%;height:1.55rem;border:1px solid var(--line2);
  border-radius:var(--r-sm);overflow:hidden;margin:.15rem 0 .2rem}
.eraband button{flex:0 0 auto;min-width:3px;border-right:1px solid var(--surf);
  transition:filter .15s;position:relative;padding:0}
.eraband button:last-child{border-right:0}
.eraband button:hover{filter:brightness(1.15)}
.eraband button[aria-pressed="true"]{box-shadow:inset 0 0 0 2px var(--red)}
.erascale{position:relative;height:1rem;font-family:var(--mono);font-size:.6rem;
  color:var(--ink3);margin-bottom:.6rem}
.erascale span{position:absolute;top:.22rem;white-space:nowrap}
.erascale span::before{content:"";position:absolute;left:0;top:-.24rem;width:1px;
  height:.2rem;background:var(--line2)}
.erascale span.last::before{left:auto;right:0}
.erachips{display:flex;flex-wrap:wrap;gap:.3rem}
.erachips button{display:inline-flex;align-items:center;gap:.35rem;
  padding:.16rem .5rem .16rem .34rem;border:1px solid var(--line2);
  border-radius:var(--r-pill);background:var(--bg);font-size:.76em;
  color:var(--ink2);line-height:1.35;transition:border-color .15s,color .15s}
.erachips button:hover{color:var(--head);border-color:var(--ink3)}
.erachips button[aria-pressed="true"]{border-color:var(--sumire);
  color:var(--head);font-weight:500}
.erachips i{width:.62rem;height:.62rem;border-radius:2px;flex:0 0 auto}
.erachips .y{font-family:var(--mono);font-size:.86em;color:var(--ink3)}
/* Milestones, to the revised United States specification: a column-flowing list
   with the year in its own track, so a long run of dates reads down the page
   rather than stretching one entry per line across the full width. */
.tline{list-style:none;margin:.5rem 0 0;padding:0;font-size:.84em;
  columns:clamp(16rem,23vw,23rem);column-gap:clamp(1.2rem,2.6vw,2.6rem)}
.tline li{display:grid;grid-template-columns:3.1rem 1fr;gap:.55rem;
  padding:.3rem 0;border-top:1px solid var(--line);break-inside:avoid-column}
.tline li:first-child{border-top:0}
.tline .y{font-family:var(--mono);color:var(--accent);font-size:.92em;
  padding-top:.1em}
.tline .w{overflow-wrap:anywhere}
.tline .a{display:block;font-family:var(--mono);font-size:.78em;color:var(--ink3)}
.tline li.mapchg .y{color:var(--tokiwa)}
.tline li.sel{background:var(--surf2)}
.tline li.sel .y{color:var(--sumire)}
.eracaveat{margin-top:.7rem;font-size:.78em;line-height:1.6;color:var(--ink3);
  max-width:80ch}
/* The note reads as a heading line and then a sentence, exactly as on the
   United States sheet: name, span, length, a hard break, then the account.
   The class names here and in the script must agree; when they did not, none
   of this spacing applied and the note ran together as a single string. */
.eranote{margin-top:.6rem;font-size:.87em;line-height:1.62;color:var(--ink2);
  min-height:4.2em;max-width:80ch}
.eranote b{color:var(--head);font-weight:600}
.eranote .yr{font-family:var(--mono);color:var(--ink3);font-size:.86em;
  margin-left:.5rem}
.eranote .st{display:block;margin-top:.3rem;font-family:var(--mono);
  font-size:.82em;color:var(--tokiwa)}

`;

export default function HongKongReferenceAtlas() {
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Recreate the original document-head resources from hk.html.
    document.title = "Hong Kong Reference Atlas";

    let charset = document.head.querySelector("meta[charset]");
    if (!charset) {
      charset = document.createElement("meta");
      document.head.prepend(charset);
    }
    charset.setAttribute("charset", "utf-8");

    let viewport = document.head.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.setAttribute("name", "viewport");
      document.head.appendChild(viewport);
    }
    viewport.setAttribute("content", "width=device-width,initial-scale=1,viewport-fit=cover");

    let description = document.head.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.setAttribute("name", "description");
      document.head.appendChild(description);
    }
    description.setAttribute("content", "An interactive reference atlas of the Hong Kong Special Administrative Region: the eighteen districts, relief, water, conservation and the succession of authority over the ground, in English, Chinese and Japanese.");

    const ensureLink = (rel, href, crossOrigin) => {
      let node = Array.from(document.head.querySelectorAll("link")).find(
        (link) => link.getAttribute("rel") === rel && link.getAttribute("href") === href
      );
      if (!node) {
        node = document.createElement("link");
        node.setAttribute("rel", rel);
        node.setAttribute("href", href);
        if (crossOrigin) node.setAttribute("crossorigin", "");
        document.head.appendChild(node);
      }
      return node;
    };
    ensureLink("preconnect", "https://fonts.googleapis.com", false);
    ensureLink("preconnect", "https://fonts.gstatic.com", true);
    ensureLink("stylesheet", "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..600&family=Noto+Serif+TC:wght@300..700&family=Noto+Serif+JP:wght@300..700&family=JetBrains+Mono:wght@300..600&display=swap", false);

    const hostResetStyle = document.createElement("style");
    hostResetStyle.textContent = HOST_RESET_CSS;
    document.head.appendChild(hostResetStyle);

    const originalStyle = document.createElement("style");
    originalStyle.textContent = HK_CSS;
    document.head.appendChild(originalStyle);

    document.documentElement.lang = "en";
    document.documentElement.setAttribute("data-ground", "paper");
    document.documentElement.setAttribute("data-density", "normal");

/* ==========================================================================
   GEOMETRY

   Traced from a raster outline of Hong Kong, georeferenced by fitting it to
   the previous hand-built geometry and then adopted in its place. Every land
   pixel carries exactly one district; contours are taken per district and
   quantised onto a common lattice of about a hundred metres, so two
   neighbours write the same vertices along a shared boundary. Provenance and
   the limits of the source are set out in the method note.
   ========================================================================== */
const DIST={
 CW:[
[
 114.1425,22.2616, 114.1416,22.2619, 114.1415,22.2625, 114.1408,22.2627,
 114.1405,22.2641, 114.1388,22.2665, 114.1383,22.2687, 114.1378,22.2688,
 114.1377,22.2694, 114.1370,22.2696, 114.1366,22.2712, 114.1359,22.2714,
 114.1358,22.2720, 114.1351,22.2722, 114.1348,22.2735, 114.1340,22.2742,
 114.1337,22.2755, 114.1330,22.2758, 114.1326,22.2764, 114.1314,22.2765,
 114.1310,22.2772, 114.1302,22.2775, 114.1297,22.2781, 114.1285,22.2782,
 114.1282,22.2787, 114.1264,22.2791, 114.1234,22.2787, 114.1231,22.2782,
 114.1219,22.2781, 114.1215,22.2777, 114.1177,22.2770, 114.1176,22.2766,
 114.1168,22.2763, 114.1167,22.2758, 114.1158,22.2758, 114.1157,22.2763,
 114.1149,22.2766, 114.1148,22.2772, 114.1139,22.2775, 114.1138,22.2780,
 114.1133,22.2782, 114.1129,22.2814, 114.1133,22.2834, 114.1138,22.2837,
 114.1140,22.2850, 114.1148,22.2853, 114.1148,22.2857, 114.1171,22.2860,
 114.1180,22.2868, 114.1192,22.2869, 114.1199,22.2877, 114.1214,22.2880,
 114.1216,22.2891, 114.1237,22.2903, 114.1250,22.2904, 114.1253,22.2909,
 114.1280,22.2915, 114.1285,22.2928, 114.1297,22.2930, 114.1301,22.2932,
 114.1301,22.2934, 114.1303,22.2936, 114.1306,22.2937, 114.1312,22.2938,
 114.1330,22.2938, 114.1330,22.2938, 114.1331,22.2938, 114.1333,22.2938,
 114.1337,22.2938, 114.1342,22.2938, 114.1345,22.2938, 114.1348,22.2939,
 114.1349,22.2941, 114.1349,22.2943, 114.1385,22.2946, 114.1444,22.2943,
 114.1445,22.2939, 114.1453,22.2936, 114.1454,22.2931, 114.1463,22.2931,
 114.1465,22.2939, 114.1476,22.2946, 114.1491,22.2945, 114.1493,22.2939,
 114.1501,22.2936, 114.1502,22.2931, 114.1511,22.2927, 114.1512,22.2922,
 114.1517,22.2920, 114.1521,22.2926, 114.1557,22.2929, 114.1567,22.2926,
 114.1574,22.2919, 114.1579,22.2887, 114.1585,22.2877, 114.1594,22.2877,
 114.1603,22.2869, 114.1626,22.2865, 114.1626,22.2861, 114.1632,22.2860,
 114.1636,22.2832, 114.1644,22.2819, 114.1643,22.2793, 114.1636,22.2787,
 114.1635,22.2777, 114.1626,22.2770, 114.1625,22.2759, 114.1620,22.2756,
 114.1613,22.2669, 114.1607,22.2666, 114.1606,22.2655, 114.1591,22.2652,
 114.1582,22.2644, 114.1559,22.2640, 114.1558,22.2636, 114.1543,22.2635,
 114.1536,22.2643, 114.1524,22.2644, 114.1520,22.2650, 114.1505,22.2652,
 114.1498,22.2644, 114.1484,22.2640, 114.1481,22.2627, 114.1474,22.2625,
 114.1469,22.2618, 114.1457,22.2617, 114.1448,22.2609, 114.1427,22.2610],
[
 114.1085,22.2851, 114.1082,22.2858, 114.1083,22.2884, 114.1090,22.2887,
 114.1091,22.2891, 114.1115,22.2894, 114.1127,22.2891, 114.1131,22.2878,
 114.1138,22.2876, 114.1133,22.2863, 114.1091,22.2857, 114.1090,22.2853]],
 E:[
[
 114.2467,22.2524, 114.2466,22.2529, 114.2458,22.2529, 114.2456,22.2524,
 114.2448,22.2524, 114.2447,22.2529, 114.2438,22.2533, 114.2420,22.2559,
 114.2417,22.2573, 114.2410,22.2576, 114.2406,22.2582, 114.2392,22.2584,
 114.2362,22.2602, 114.2358,22.2608, 114.2346,22.2609, 114.2342,22.2614,
 114.2318,22.2617, 114.2304,22.2614, 114.2301,22.2609, 114.2289,22.2608,
 114.2285,22.2603, 114.2261,22.2600, 114.2247,22.2603, 114.2243,22.2608,
 114.2231,22.2609, 114.2228,22.2614, 114.2170,22.2621, 114.2163,22.2626,
 114.2132,22.2629, 114.2129,22.2634, 114.2117,22.2635, 114.2109,22.2643,
 114.2098,22.2644, 114.2094,22.2649, 114.2072,22.2652, 114.2037,22.2649,
 114.2033,22.2644, 114.2021,22.2643, 114.2016,22.2636, 114.2002,22.2635,
 114.1995,22.2643, 114.1980,22.2642, 114.1979,22.2638, 114.1955,22.2635,
 114.1948,22.2638, 114.1941,22.2654, 114.1945,22.2687, 114.1950,22.2690,
 114.1952,22.2703, 114.1960,22.2706, 114.1964,22.2712, 114.1976,22.2713,
 114.1980,22.2720, 114.1988,22.2723, 114.1989,22.2728, 114.1998,22.2732,
 114.1999,22.2737, 114.2006,22.2740, 114.2010,22.2755, 114.2016,22.2756,
 114.2017,22.2763, 114.2009,22.2766, 114.2006,22.2774, 114.1998,22.2789,
 114.1976,22.2799, 114.1961,22.2798, 114.1960,22.2794, 114.1930,22.2791,
 114.1912,22.2794, 114.1912,22.2798, 114.1905,22.2800, 114.1901,22.2817,
 114.1893,22.2832, 114.1886,22.2835, 114.1883,22.2848, 114.1865,22.2854,
 114.1864,22.2858, 114.1859,22.2860, 114.1850,22.2852, 114.1828,22.2853,
 114.1826,22.2857, 114.1788,22.2863, 114.1788,22.2867, 114.1779,22.2870,
 114.1778,22.2876, 114.1771,22.2878, 114.1769,22.2888, 114.1774,22.2893,
 114.1798,22.2898, 114.1798,22.2901, 114.1807,22.2905, 114.1808,22.2910,
 114.1816,22.2910, 114.1817,22.2905, 114.1823,22.2903, 114.1828,22.2917,
 114.1842,22.2921, 114.1849,22.2929, 114.1863,22.2932, 114.1866,22.2945,
 114.1874,22.2948, 114.1875,22.2953, 114.1883,22.2957, 114.1884,22.2960,
 114.1922,22.2967, 114.1923,22.2971, 114.1931,22.2974, 114.1932,22.2978,
 114.1960,22.2981, 114.2008,22.2978, 114.2012,22.2973, 114.2026,22.2974,
 114.2028,22.2979, 114.2036,22.2979, 114.2043,22.2967, 114.2084,22.2960,
 114.2085,22.2957, 114.2102,22.2948, 114.2112,22.2945, 114.2113,22.2941,
 114.2136,22.2937, 114.2147,22.2930, 114.2170,22.2926, 114.2179,22.2913,
 114.2189,22.2910, 114.2189,22.2906, 114.2205,22.2901, 114.2212,22.2877,
 114.2218,22.2876, 114.2220,22.2870, 114.2242,22.2869, 114.2259,22.2877,
 114.2272,22.2878, 114.2281,22.2885, 114.2302,22.2883, 114.2306,22.2870,
 114.2313,22.2867, 114.2317,22.2860, 114.2329,22.2859, 114.2333,22.2853,
 114.2342,22.2850, 114.2343,22.2844, 114.2353,22.2841, 114.2361,22.2831,
 114.2362,22.2820, 114.2370,22.2812, 114.2375,22.2791, 114.2380,22.2789,
 114.2384,22.2782, 114.2398,22.2779, 114.2401,22.2766, 114.2409,22.2763,
 114.2410,22.2758, 114.2418,22.2754, 114.2419,22.2749, 114.2428,22.2746,
 114.2429,22.2740, 114.2437,22.2737, 114.2438,22.2732, 114.2447,22.2728,
 114.2447,22.2725, 114.2465,22.2718, 114.2468,22.2705, 114.2475,22.2702,
 114.2477,22.2697, 114.2485,22.2694, 114.2489,22.2687, 114.2501,22.2686,
 114.2505,22.2680, 114.2512,22.2676, 114.2514,22.2657, 114.2508,22.2652,
 114.2505,22.2626, 114.2508,22.2583, 114.2512,22.2582, 114.2512,22.2567,
 114.2505,22.2564, 114.2504,22.2559, 114.2497,22.2556, 114.2493,22.2541,
 114.2486,22.2538, 114.2485,22.2533, 114.2477,22.2529, 114.2475,22.2524]],
 IS:[
[
 113.8502,22.2023, 113.8501,22.2027, 113.8494,22.2030, 113.8490,22.2045,
 113.8483,22.2048, 113.8484,22.2054, 113.8492,22.2056, 113.8496,22.2063,
 113.8508,22.2066, 113.8511,22.2080, 113.8508,22.2107, 113.8502,22.2110,
 113.8501,22.2121, 113.8483,22.2127, 113.8482,22.2131, 113.8474,22.2134,
 113.8473,22.2140, 113.8467,22.2141, 113.8460,22.2176, 113.8455,22.2178,
 113.8456,22.2184, 113.8462,22.2186, 113.8464,22.2199, 113.8473,22.2205,
 113.8475,22.2218, 113.8482,22.2221, 113.8481,22.2227, 113.8474,22.2230,
 113.8470,22.2236, 113.8458,22.2237, 113.8453,22.2244, 113.8448,22.2245,
 113.8441,22.2315, 113.8436,22.2321, 113.8437,22.2347, 113.8444,22.2351,
 113.8445,22.2356, 113.8450,22.2358, 113.8455,22.2386, 113.8463,22.2397,
 113.8465,22.2414, 113.8469,22.2417, 113.8487,22.2419, 113.8496,22.2427,
 113.8510,22.2425, 113.8512,22.2420, 113.8520,22.2417, 113.8521,22.2411,
 113.8530,22.2408, 113.8531,22.2403, 113.8539,22.2399, 113.8541,22.2394,
 113.8549,22.2391, 113.8550,22.2385, 113.8556,22.2384, 113.8561,22.2400,
 113.8568,22.2403, 113.8563,22.2415, 113.8556,22.2462, 113.8550,22.2465,
 113.8551,22.2478, 113.8556,22.2479, 113.8563,22.2503, 113.8596,22.2513,
 113.8636,22.2517, 113.8639,22.2522, 113.8651,22.2523, 113.8655,22.2529,
 113.8661,22.2531, 113.8664,22.2553, 113.8661,22.2563, 113.8642,22.2569,
 113.8634,22.2581, 113.8620,22.2582, 113.8610,22.2569, 113.8583,22.2566,
 113.8571,22.2569, 113.8568,22.2580, 113.8560,22.2589, 113.8561,22.2615,
 113.8568,22.2619, 113.8569,22.2625, 113.8578,22.2628, 113.8579,22.2633,
 113.8586,22.2636, 113.8588,22.2646, 113.8593,22.2651, 113.8616,22.2655,
 113.8617,22.2659, 113.8625,22.2662, 113.8626,22.2666, 113.8640,22.2669,
 113.8668,22.2666, 113.8677,22.2643, 113.8683,22.2645, 113.8684,22.2650,
 113.8692,22.2654, 113.8693,22.2660, 113.8711,22.2673, 113.8713,22.2683,
 113.8721,22.2690, 113.8722,22.2701, 113.8730,22.2709, 113.8735,22.2728,
 113.8747,22.2731, 113.8750,22.2735, 113.8807,22.2742, 113.8808,22.2746,
 113.8816,22.2749, 113.8817,22.2753, 113.8846,22.2759, 113.8848,22.2766,
 113.8858,22.2773, 113.8875,22.2772, 113.8893,22.2761, 113.8894,22.2751,
 113.8899,22.2747, 113.8902,22.2751, 113.8901,22.2764, 113.8894,22.2766,
 113.8885,22.2786, 113.8886,22.2806, 113.8893,22.2811, 113.8895,22.2822,
 113.8910,22.2826, 113.8931,22.2835, 113.8935,22.2842, 113.8948,22.2843,
 113.8959,22.2850, 113.8961,22.2858, 113.8969,22.2861, 113.8968,22.2868,
 113.8961,22.2870, 113.8962,22.2877, 113.8966,22.2877, 113.8973,22.2920,
 113.8979,22.2922, 113.8980,22.2927, 113.8987,22.2930, 113.8991,22.2945,
 113.8998,22.2948, 113.8999,22.2952, 113.8983,22.2956, 113.8978,22.2962,
 113.8964,22.2963, 113.8957,22.2956, 113.8948,22.2955, 113.8942,22.2960,
 113.8941,22.2971, 113.8945,22.2979, 113.8960,22.2984, 113.8961,22.2988,
 113.8969,22.2991, 113.8971,22.2997, 113.8978,22.2999, 113.8981,22.3015,
 113.8988,22.3017, 113.8990,22.3023, 113.8998,22.3026, 113.8999,22.3031,
 113.9005,22.3033, 113.9014,22.3028, 113.9080,22.3024, 113.9100,22.3019,
 113.9344,22.3015, 113.9400,22.3009, 113.9400,22.3002, 113.9409,22.2995,
 113.9411,22.2982, 113.9418,22.2979, 113.9420,22.2974, 113.9425,22.2972,
 113.9434,22.2980, 113.9455,22.2979, 113.9458,22.2974, 113.9466,22.2971,
 113.9470,22.2964, 113.9485,22.2967, 113.9486,22.2975, 113.9497,22.2980,
 113.9547,22.2984, 113.9556,22.2989, 113.9568,22.2990, 113.9575,22.2998,
 113.9587,22.2999, 113.9591,22.3005, 113.9600,22.3009, 113.9600,22.3012,
 113.9667,22.3019, 113.9671,22.3024, 113.9683,22.3025, 113.9686,22.3030,
 113.9725,22.3036, 113.9725,22.3040, 113.9734,22.3043, 113.9738,22.3050,
 113.9750,22.3051, 113.9754,22.3057, 113.9771,22.3066, 113.9781,22.3069,
 113.9783,22.3075, 113.9791,22.3078, 113.9792,22.3083, 113.9799,22.3086,
 113.9802,22.3099, 113.9812,22.3104, 113.9824,22.3119, 113.9836,22.3120,
 113.9843,22.3128, 113.9855,22.3129, 113.9864,22.3136, 113.9882,22.3137,
 113.9894,22.3145, 113.9925,22.3149, 113.9926,22.3152, 113.9934,22.3156,
 113.9935,22.3161, 113.9944,22.3164, 113.9945,22.3170, 113.9953,22.3173,
 113.9955,22.3178, 113.9963,22.3182, 113.9964,22.3187, 113.9971,22.3190,
 113.9974,22.3203, 113.9982,22.3209, 113.9984,22.3222, 113.9992,22.3225,
 113.9992,22.3229, 114.0023,22.3233, 114.0036,22.3240, 114.0059,22.3244,
 114.0060,22.3248, 114.0077,22.3256, 114.0087,22.3260, 114.0088,22.3263,
 114.0103,22.3268, 114.0110,22.3291, 114.0126,22.3296, 114.0126,22.3300,
 114.0135,22.3303, 114.0135,22.3307, 114.0166,22.3311, 114.0174,22.3316,
 114.0174,22.3324, 114.0183,22.3330, 114.0185,22.3341, 114.0194,22.3345,
 114.0210,22.3341, 114.0214,22.3330, 114.0221,22.3340, 114.0220,22.3360,
 114.0212,22.3365, 114.0214,22.3376, 114.0223,22.3379, 114.0241,22.3376,
 114.0249,22.3363, 114.0258,22.3360, 114.0259,22.3340, 114.0249,22.3320,
 114.0241,22.3317, 114.0240,22.3312, 114.0233,22.3309, 114.0230,22.3295,
 114.0224,22.3286, 114.0237,22.3284, 114.0241,22.3291, 114.0249,22.3294,
 114.0251,22.3300, 114.0258,22.3302, 114.0261,22.3316, 114.0272,22.3329,
 114.0279,22.3333, 114.0285,22.3330, 114.0288,22.3208, 114.0281,22.3130,
 114.0260,22.3118, 114.0260,22.3114, 114.0242,22.3111, 114.0212,22.3114,
 114.0211,22.3118, 114.0196,22.3119, 114.0192,22.3112, 114.0187,22.3111,
 114.0183,22.3090, 114.0174,22.3082, 114.0174,22.3074, 114.0177,22.3069,
 114.0190,22.3067, 114.0196,22.3064, 114.0199,22.3062, 114.0201,22.3059,
 114.0202,22.3055, 114.0202,22.3049, 114.0202,22.3043, 114.0202,22.3038,
 114.0202,22.3035, 114.0202,22.3033, 114.0202,22.3033, 114.0202,22.3028,
 114.0201,22.3025, 114.0193,22.3023, 114.0193,22.3019, 114.0169,22.3015,
 114.0164,22.3009, 114.0168,22.2998, 114.0173,22.3000, 114.0174,22.3005,
 114.0180,22.3007, 114.0189,22.3002, 114.0193,22.2984, 114.0202,22.2976,
 114.0204,22.2959, 114.0217,22.2940, 114.0218,22.2934, 114.0206,22.2929,
 114.0202,22.2902, 114.0208,22.2888, 114.0231,22.2883, 114.0232,22.2879,
 114.0237,22.2877, 114.0241,22.2855, 114.0237,22.2843, 114.0233,22.2842,
 114.0232,22.2835, 114.0237,22.2834, 114.0241,22.2818, 114.0237,22.2810,
 114.0225,22.2807, 114.0221,22.2801, 114.0223,22.2792, 114.0230,22.2789,
 114.0232,22.2784, 114.0239,22.2781, 114.0241,22.2771, 114.0221,22.2744,
 114.0222,22.2740, 114.0229,22.2738, 114.0229,22.2722, 114.0225,22.2721,
 114.0220,22.2700, 114.0214,22.2695, 114.0206,22.2696, 114.0199,22.2704,
 114.0193,22.2702, 114.0192,22.2697, 114.0184,22.2694, 114.0183,22.2690,
 114.0165,22.2687, 114.0135,22.2690, 114.0130,22.2695, 114.0107,22.2699,
 114.0106,22.2702, 114.0099,22.2705, 114.0097,22.2715, 114.0092,22.2720,
 114.0069,22.2725, 114.0068,22.2728, 114.0060,22.2732, 114.0058,22.2737,
 114.0050,22.2740, 114.0049,22.2746, 114.0041,22.2749, 114.0039,22.2754,
 114.0024,22.2755, 114.0020,22.2749, 114.0012,22.2746, 114.0011,22.2740,
 114.0003,22.2738, 114.0003,22.2722, 114.0011,22.2720, 114.0015,22.2713,
 114.0027,22.2712, 114.0031,22.2706, 114.0036,22.2704, 114.0042,22.2683,
 114.0063,22.2677, 114.0069,22.2672, 114.0070,22.2662, 114.0078,22.2659,
 114.0079,22.2654, 114.0086,22.2651, 114.0088,22.2638, 114.0097,22.2632,
 114.0098,22.2621, 114.0106,22.2614, 114.0108,22.2603, 114.0122,22.2598,
 114.0126,22.2579, 114.0122,22.2568, 114.0110,22.2565, 114.0103,22.2557,
 114.0089,22.2554, 114.0086,22.2543, 114.0072,22.2539, 114.0069,22.2534,
 114.0030,22.2530, 114.0021,22.2524, 114.0020,22.2517, 114.0012,22.2510,
 114.0010,22.2500, 113.9996,22.2496, 113.9989,22.2488, 113.9977,22.2487,
 113.9969,22.2480, 113.9954,22.2476, 113.9958,22.2471, 113.9969,22.2470,
 113.9974,22.2463, 113.9979,22.2462, 113.9986,22.2470, 114.0001,22.2469,
 114.0010,22.2455, 114.0020,22.2451, 114.0021,22.2446, 114.0030,22.2443,
 114.0038,22.2428, 114.0042,22.2411, 114.0049,22.2408, 114.0049,22.2404,
 114.0051,22.2403, 114.0053,22.2402, 114.0057,22.2401, 114.0069,22.2401,
 114.0069,22.2401, 114.0069,22.2401, 114.0070,22.2401, 114.0072,22.2401,
 114.0075,22.2401, 114.0076,22.2402, 114.0078,22.2403, 114.0079,22.2408,
 114.0087,22.2411, 114.0091,22.2418, 114.0106,22.2417, 114.0107,22.2411,
 114.0116,22.2408, 114.0117,22.2403, 114.0125,22.2399, 114.0126,22.2396,
 114.0164,22.2389, 114.0165,22.2385, 114.0173,22.2385, 114.0174,22.2391,
 114.0180,22.2392, 114.0184,22.2378, 114.0199,22.2374, 114.0202,22.2369,
 114.0201,22.2359, 114.0193,22.2356, 114.0192,22.2351, 114.0186,22.2349,
 114.0192,22.2333, 114.0185,22.2331, 114.0182,22.2318, 114.0168,22.2314,
 114.0161,22.2306, 114.0149,22.2305, 114.0141,22.2298, 114.0128,22.2296,
 114.0119,22.2291, 114.0107,22.2277, 114.0107,22.2273, 114.0116,22.2270,
 114.0115,22.2263, 114.0107,22.2261, 114.0107,22.2257, 114.0076,22.2253,
 114.0069,22.2247, 114.0068,22.2240, 114.0060,22.2233, 114.0057,22.2220,
 114.0050,22.2218, 114.0049,22.2214, 114.0035,22.2211, 114.0011,22.2214,
 114.0011,22.2218, 114.0003,22.2220, 114.0001,22.2233, 113.9983,22.2240,
 113.9982,22.2244, 113.9974,22.2244, 113.9972,22.2238, 113.9962,22.2235,
 113.9953,22.2221, 113.9945,22.2218, 113.9944,22.2214, 113.9943,22.2212,
 113.9941,22.2211, 113.9937,22.2211, 113.9932,22.2211, 113.9929,22.2211,
 113.9926,22.2211, 113.9925,22.2211, 113.9925,22.2211, 113.9919,22.2211,
 113.9916,22.2194, 113.9907,22.2186, 113.9886,22.2185, 113.9871,22.2191,
 113.9866,22.2216, 113.9855,22.2211, 113.9840,22.2212, 113.9837,22.2219,
 113.9829,22.2221, 113.9820,22.2235, 113.9812,22.2238, 113.9811,22.2247,
 113.9814,22.2256, 113.9826,22.2269, 113.9830,22.2278, 113.9839,22.2285,
 113.9837,22.2304, 113.9830,22.2308, 113.9829,22.2313, 113.9821,22.2316,
 113.9820,22.2322, 113.9811,22.2325, 113.9810,22.2330, 113.9802,22.2333,
 113.9801,22.2337, 113.9786,22.2342, 113.9782,22.2350, 113.9783,22.2362,
 113.9791,22.2373, 113.9795,22.2401, 113.9800,22.2403, 113.9802,22.2408,
 113.9812,22.2411, 113.9820,22.2419, 113.9818,22.2427, 113.9811,22.2429,
 113.9810,22.2434, 113.9802,22.2437, 113.9801,22.2441, 113.9778,22.2445,
 113.9771,22.2451, 113.9749,22.2452, 113.9738,22.2445, 113.9717,22.2441,
 113.9712,22.2428, 113.9700,22.2427, 113.9695,22.2420, 113.9685,22.2417,
 113.9678,22.2411, 113.9673,22.2410, 113.9671,22.2410, 113.9669,22.2410,
 113.9668,22.2410, 113.9667,22.2410, 113.9667,22.2410, 113.9655,22.2410,
 113.9649,22.2406, 113.9648,22.2403, 113.9648,22.2399, 113.9648,22.2396,
 113.9648,22.2394, 113.9648,22.2392, 113.9648,22.2392, 113.9648,22.2387,
 113.9646,22.2383, 113.9642,22.2378, 113.9610,22.2372, 113.9609,22.2368,
 113.9601,22.2365, 113.9600,22.2359, 113.9591,22.2359, 113.9590,22.2365,
 113.9572,22.2378, 113.9572,22.2386, 113.9550,22.2392, 113.9514,22.2389,
 113.9511,22.2384, 113.9499,22.2383, 113.9495,22.2378, 113.9457,22.2372,
 113.9457,22.2368, 113.9448,22.2365, 113.9447,22.2359, 113.9439,22.2356,
 113.9434,22.2350, 113.9423,22.2349, 113.9419,22.2344, 113.9388,22.2339,
 113.9381,22.2334, 113.9379,22.2324, 113.9372,22.2322, 113.9371,22.2316,
 113.9362,22.2313, 113.9362,22.2309, 113.9338,22.2305, 113.9329,22.2298,
 113.9315,22.2296, 113.9313,22.2291, 113.9289,22.2298, 113.9284,22.2311,
 113.9270,22.2314, 113.9265,22.2308, 113.9258,22.2305, 113.9255,22.2288,
 113.9247,22.2275, 113.9229,22.2268, 113.9228,22.2260, 113.9242,22.2254,
 113.9266,22.2257, 113.9270,22.2262, 113.9282,22.2263, 113.9289,22.2271,
 113.9303,22.2268, 113.9304,22.2260, 113.9311,22.2255, 113.9328,22.2254,
 113.9335,22.2250, 113.9340,22.2241, 113.9344,22.2198, 113.9350,22.2185,
 113.9360,22.2181, 113.9362,22.2174, 113.9353,22.2168, 113.9314,22.2164,
 113.9308,22.2159, 113.9291,22.2158, 113.9282,22.2151, 113.9270,22.2150,
 113.9262,22.2142, 113.9246,22.2140, 113.9238,22.2135, 113.9237,22.2140,
 113.9228,22.2143, 113.9227,22.2148, 113.9219,22.2152, 113.9218,22.2157,
 113.9209,22.2160, 113.9208,22.2166, 113.9201,22.2168, 113.9198,22.2181,
 113.9187,22.2185, 113.9181,22.2180, 113.9179,22.2164, 113.9171,22.2154,
 113.9167,22.2134, 113.9151,22.2130, 113.9151,22.2126, 113.9142,22.2126,
 113.9141,22.2131, 113.9133,22.2134, 113.9129,22.2141, 113.9117,22.2142,
 113.9110,22.2150, 113.9098,22.2151, 113.9088,22.2164, 113.9061,22.2168,
 113.9056,22.2174, 113.9055,22.2181, 113.9047,22.2188, 113.9046,22.2196,
 113.9041,22.2201, 113.9018,22.2205, 113.9010,22.2219, 113.9008,22.2233,
 113.8999,22.2243, 113.9000,22.2269, 113.9008,22.2273, 113.9008,22.2277,
 113.8990,22.2280, 113.8981,22.2277, 113.8979,22.2266, 113.8973,22.2263,
 113.8968,22.2285, 113.8961,22.2277, 113.8959,22.2266, 113.8945,22.2262,
 113.8940,22.2256, 113.8926,22.2254, 113.8922,22.2261, 113.8913,22.2264,
 113.8909,22.2271, 113.8895,22.2270, 113.8893,22.2264, 113.8885,22.2261,
 113.8883,22.2256, 113.8873,22.2252, 113.8864,22.2238, 113.8857,22.2236,
 113.8853,22.2220, 113.8846,22.2218, 113.8845,22.2212, 113.8837,22.2209,
 113.8844,22.2194, 113.8844,22.2177, 113.8831,22.2168, 113.8809,22.2169,
 113.8804,22.2176, 113.8790,22.2174, 113.8785,22.2168, 113.8770,22.2164,
 113.8767,22.2151, 113.8760,22.2148, 113.8759,22.2143, 113.8752,22.2140,
 113.8748,22.2125, 113.8741,22.2122, 113.8740,22.2117, 113.8733,22.2114,
 113.8729,22.2099, 113.8722,22.2097, 113.8721,22.2091, 113.8720,22.2090,
 113.8718,22.2089, 113.8716,22.2089, 113.8714,22.2089, 113.8713,22.2089,
 113.8712,22.2089, 113.8712,22.2089, 113.8700,22.2089, 113.8692,22.2088,
 113.8677,22.2081, 113.8673,22.2102, 113.8667,22.2107, 113.8658,22.2106,
 113.8649,22.2099, 113.8631,22.2098, 113.8621,22.2090, 113.8602,22.2089,
 113.8594,22.2086, 113.8591,22.2084, 113.8588,22.2081, 113.8588,22.2081,
 113.8588,22.2081, 113.8588,22.2075, 113.8590,22.2073, 113.8594,22.2072,
 113.8597,22.2056, 113.8594,22.2048, 113.8579,22.2043, 113.8575,22.2029,
 113.8569,22.2031, 113.8568,22.2036, 113.8547,22.2046, 113.8538,22.2046,
 113.8532,22.2041, 113.8529,22.2025, 113.8520,22.2020],
[
 114.1345,22.1856, 114.1331,22.1863, 114.1321,22.1866, 114.1319,22.1871,
 114.1311,22.1875, 114.1310,22.1880, 114.1302,22.1883, 114.1300,22.1889,
 114.1293,22.1892, 114.1288,22.1908, 114.1282,22.1906, 114.1281,22.1901,
 114.1273,22.1897, 114.1272,22.1892, 114.1266,22.1890, 114.1259,22.1866,
 114.1247,22.1864, 114.1242,22.1857, 114.1228,22.1856, 114.1219,22.1861,
 114.1214,22.1879, 114.1207,22.1889, 114.1199,22.1890, 114.1194,22.1876,
 114.1182,22.1873, 114.1158,22.1876, 114.1157,22.1880, 114.1149,22.1883,
 114.1145,22.1890, 114.1133,22.1891, 114.1128,22.1897, 114.1113,22.1904,
 114.1108,22.1924, 114.1101,22.1927, 114.1111,22.1956, 114.1119,22.1963,
 114.1119,22.1970, 114.1125,22.1976, 114.1146,22.1980, 114.1149,22.1991,
 114.1160,22.1994, 114.1166,22.2004, 114.1171,22.2046, 114.1173,22.2046,
 114.1175,22.2051, 114.1176,22.2059, 114.1177,22.2072, 114.1177,22.2115,
 114.1177,22.2115, 114.1177,22.2116, 114.1177,22.2117, 114.1177,22.2119,
 114.1177,22.2121, 114.1176,22.2122, 114.1175,22.2124, 114.1168,22.2126,
 114.1167,22.2131, 114.1159,22.2134, 114.1159,22.2149, 114.1167,22.2152,
 114.1168,22.2157, 114.1173,22.2159, 114.1177,22.2172, 114.1176,22.2187,
 114.1173,22.2197, 114.1170,22.2201, 114.1174,22.2210, 114.1168,22.2222,
 114.1167,22.2233, 114.1158,22.2240, 114.1156,22.2251, 114.1142,22.2254,
 114.1135,22.2262, 114.1127,22.2263, 114.1121,22.2258, 114.1119,22.2242,
 114.1111,22.2233, 114.1110,22.2226, 114.1071,22.2219, 114.1005,22.2223,
 114.1004,22.2226, 114.0997,22.2230, 114.0996,22.2250, 114.1005,22.2270,
 114.1013,22.2272, 114.1016,22.2287, 114.1023,22.2290, 114.1032,22.2304,
 114.1042,22.2308, 114.1044,22.2313, 114.1051,22.2315, 114.1053,22.2318,
 114.1053,22.2323, 114.1053,22.2323, 114.1053,22.2325, 114.1053,22.2330,
 114.1053,22.2336, 114.1053,22.2345, 114.1053,22.2351, 114.1054,22.2356,
 114.1056,22.2358, 114.1060,22.2358, 114.1062,22.2361, 114.1062,22.2366,
 114.1062,22.2366, 114.1062,22.2367, 114.1062,22.2368, 114.1062,22.2370,
 114.1062,22.2372, 114.1057,22.2375, 114.1039,22.2376, 114.1033,22.2382,
 114.1033,22.2389, 114.1025,22.2396, 114.1024,22.2403, 114.1029,22.2409,
 114.1053,22.2413, 114.1053,22.2417, 114.1062,22.2420, 114.1063,22.2425,
 114.1071,22.2429, 114.1072,22.2432, 114.1095,22.2436, 114.1104,22.2444,
 114.1116,22.2445, 114.1123,22.2452, 114.1135,22.2455, 114.1140,22.2474,
 114.1146,22.2479, 114.1154,22.2478, 114.1158,22.2472, 114.1167,22.2469,
 114.1167,22.2465, 114.1191,22.2461, 114.1196,22.2455, 114.1196,22.2448,
 114.1207,22.2443, 114.1214,22.2433, 114.1213,22.2419, 114.1209,22.2418,
 114.1202,22.2394, 114.1186,22.2389, 114.1186,22.2385, 114.1179,22.2383,
 114.1185,22.2376, 114.1188,22.2359, 114.1195,22.2356, 114.1199,22.2350,
 114.1211,22.2349, 114.1216,22.2342, 114.1231,22.2335, 114.1238,22.2297,
 114.1243,22.2296, 114.1244,22.2290, 114.1251,22.2287, 114.1255,22.2275,
 114.1264,22.2271, 114.1282,22.2275, 114.1282,22.2278, 114.1293,22.2282,
 114.1299,22.2288, 114.1292,22.2290, 114.1291,22.2296, 114.1282,22.2299,
 114.1284,22.2305, 114.1290,22.2307, 114.1293,22.2322, 114.1300,22.2325,
 114.1302,22.2330, 114.1310,22.2333, 114.1311,22.2337, 114.1328,22.2341,
 114.1334,22.2338, 114.1339,22.2324, 114.1336,22.2297, 114.1330,22.2296,
 114.1329,22.2290, 114.1322,22.2288, 114.1330,22.2273, 114.1345,22.2266,
 114.1348,22.2257, 114.1347,22.2230, 114.1340,22.2226, 114.1339,22.2221,
 114.1331,22.2218, 114.1330,22.2209, 114.1322,22.2203, 114.1291,22.2199,
 114.1291,22.2195, 114.1282,22.2192, 114.1281,22.2186, 114.1273,22.2183,
 114.1272,22.2178, 114.1263,22.2174, 114.1262,22.2169, 114.1257,22.2167,
 114.1250,22.2141, 114.1244,22.2140, 114.1245,22.2133, 114.1253,22.2131,
 114.1254,22.2126, 114.1262,22.2122, 114.1263,22.2117, 114.1269,22.2115,
 114.1276,22.2145, 114.1285,22.2150, 114.1297,22.2151, 114.1302,22.2157,
 114.1310,22.2160, 114.1311,22.2164, 114.1349,22.2171, 114.1351,22.2174,
 114.1372,22.2176, 114.1377,22.2171, 114.1407,22.2167, 114.1422,22.2172,
 114.1429,22.2192, 114.1441,22.2194, 114.1444,22.2199, 114.1474,22.2202,
 114.1489,22.2199, 114.1492,22.2191, 114.1505,22.2186, 114.1559,22.2181,
 114.1578,22.2155, 114.1577,22.2152, 114.1570,22.2149, 114.1567,22.2134,
 114.1560,22.2131, 114.1558,22.2126, 114.1550,22.2122, 114.1549,22.2117,
 114.1540,22.2114, 114.1540,22.2110, 114.1525,22.2107, 114.1502,22.2110,
 114.1501,22.2114, 114.1493,22.2117, 114.1491,22.2122, 114.1483,22.2126,
 114.1482,22.2131, 114.1477,22.2133, 114.1472,22.2119, 114.1464,22.2112,
 114.1462,22.2101, 114.1444,22.2095, 114.1444,22.2091, 114.1437,22.2088,
 114.1433,22.2073, 114.1426,22.2071, 114.1425,22.2067, 114.1407,22.2060,
 114.1402,22.2046, 114.1397,22.2048, 114.1393,22.2054, 114.1379,22.2053,
 114.1377,22.2049, 114.1402,22.2041, 114.1410,22.2003, 114.1415,22.2001,
 114.1416,22.1996, 114.1423,22.1993, 114.1426,22.1980, 114.1434,22.1974,
 114.1435,22.1963, 114.1444,22.1956, 114.1446,22.1943, 114.1453,22.1941,
 114.1454,22.1935, 114.1460,22.1934, 114.1463,22.1907, 114.1460,22.1893,
 114.1448,22.1891, 114.1444,22.1897, 114.1435,22.1901, 114.1434,22.1906,
 114.1426,22.1909, 114.1422,22.1916, 114.1408,22.1917, 114.1391,22.1931,
 114.1387,22.1939, 114.1369,22.1946, 114.1367,22.1956, 114.1349,22.1963,
 114.1348,22.1967, 114.1340,22.1970, 114.1339,22.1975, 114.1333,22.1977,
 114.1330,22.1967, 114.1333,22.1951, 114.1339,22.1949, 114.1345,22.1937,
 114.1349,22.1885],
[
 113.9311,22.3042, 113.9247,22.3047, 113.9024,22.3053, 113.9015,22.3058,
 113.9002,22.3059, 113.8993,22.3064, 113.8987,22.3084, 113.8980,22.3086,
 113.8979,22.3090, 113.8965,22.3094, 113.8941,22.3090, 113.8938,22.3085,
 113.8932,22.3086, 113.8931,22.3092, 113.8924,22.3095, 113.8923,22.3108,
 113.8926,22.3114, 113.8935,22.3119, 113.8948,22.3120, 113.8959,22.3127,
 113.8961,22.3135, 113.8969,22.3138, 113.8970,22.3142, 113.8994,22.3146,
 113.9013,22.3154, 113.9031,22.3155, 113.9040,22.3162, 113.9052,22.3163,
 113.9061,22.3171, 113.9080,22.3172, 113.9097,22.3180, 113.9110,22.3181,
 113.9119,22.3188, 113.9137,22.3189, 113.9145,22.3197, 113.9157,22.3198,
 113.9161,22.3203, 113.9209,22.3209, 113.9209,22.3213, 113.9218,22.3216,
 113.9218,22.3220, 113.9242,22.3224, 113.9251,22.3231, 113.9262,22.3233,
 113.9266,22.3237, 113.9304,22.3244, 113.9308,22.3249, 113.9320,22.3250,
 113.9323,22.3255, 113.9359,22.3258, 113.9419,22.3255, 113.9420,22.3251,
 113.9428,22.3248, 113.9432,22.3241, 113.9446,22.3242, 113.9448,22.3248,
 113.9451,22.3249, 113.9457,22.3249, 113.9457,22.3249, 113.9458,22.3249,
 113.9459,22.3249, 113.9461,22.3249, 113.9463,22.3249, 113.9465,22.3250,
 113.9466,22.3251, 113.9468,22.3256, 113.9483,22.3257, 113.9494,22.3249,
 113.9495,22.3221, 113.9485,22.3199, 113.9480,22.3197, 113.9473,22.3171,
 113.9467,22.3170, 113.9466,22.3164, 113.9459,22.3162, 113.9455,22.3147,
 113.9448,22.3144, 113.9447,22.3138, 113.9440,22.3136, 113.9436,22.3121,
 113.9429,22.3118, 113.9428,22.3112, 113.9423,22.3111, 113.9419,22.3098,
 113.9420,22.3082, 113.9428,22.3065, 113.9427,22.3051, 113.9420,22.3049,
 113.9419,22.3045],
[
 114.2485,22.1655, 114.2478,22.1657, 114.2477,22.1664, 114.2485,22.1667,
 114.2486,22.1672, 114.2493,22.1675, 114.2497,22.1690, 114.2504,22.1693,
 114.2505,22.1697, 114.2475,22.1700, 114.2433,22.1691, 114.2419,22.1698,
 114.2422,22.1712, 114.2444,22.1718, 114.2447,22.1724, 114.2446,22.1734,
 114.2438,22.1736, 114.2437,22.1742, 114.2430,22.1745, 114.2429,22.1764,
 114.2437,22.1772, 114.2438,22.1783, 114.2447,22.1790, 114.2448,22.1801,
 114.2456,22.1807, 114.2459,22.1820, 114.2466,22.1823, 114.2467,22.1828,
 114.2475,22.1831, 114.2477,22.1837, 114.2485,22.1840, 114.2486,22.1846,
 114.2495,22.1849, 114.2499,22.1855, 114.2511,22.1856, 114.2520,22.1864,
 114.2538,22.1865, 114.2547,22.1873, 114.2561,22.1876, 114.2564,22.1889,
 114.2571,22.1892, 114.2575,22.1899, 114.2587,22.1900, 114.2591,22.1906,
 114.2600,22.1906, 114.2601,22.1901, 114.2608,22.1898, 114.2612,22.1883,
 114.2619,22.1880, 114.2619,22.1876, 114.2648,22.1870, 114.2649,22.1866,
 114.2654,22.1864, 114.2658,22.1843, 114.2664,22.1838, 114.2671,22.1769,
 114.2676,22.1768, 114.2677,22.1762, 114.2683,22.1761, 114.2686,22.1734,
 114.2679,22.1720, 114.2648,22.1714, 114.2647,22.1710, 114.2642,22.1709,
 114.2638,22.1714, 114.2591,22.1721, 114.2587,22.1726, 114.2582,22.1724,
 114.2581,22.1719, 114.2572,22.1716, 114.2571,22.1710, 114.2563,22.1707,
 114.2561,22.1702, 114.2556,22.1700, 114.2549,22.1674, 114.2544,22.1672,
 114.2542,22.1667, 114.2534,22.1664, 114.2530,22.1657, 114.2518,22.1656,
 114.2509,22.1649, 114.2487,22.1650],
[
 114.0202,22.2041, 114.0199,22.2046, 114.0184,22.2049, 114.0181,22.2062,
 114.0174,22.2065, 114.0173,22.2071, 114.0168,22.2072, 114.0164,22.2088,
 114.0173,22.2097, 114.0203,22.2099, 114.0212,22.2105, 114.0212,22.2112,
 114.0221,22.2120, 114.0221,22.2132, 114.0229,22.2140, 114.0260,22.2145,
 114.0260,22.2148, 114.0267,22.2151, 114.0261,22.2158, 114.0260,22.2170,
 114.0252,22.2175, 114.0229,22.2177, 114.0221,22.2183, 114.0221,22.2191,
 114.0212,22.2205, 114.0212,22.2213, 114.0217,22.2218, 114.0235,22.2220,
 114.0241,22.2226, 114.0242,22.2236, 114.0248,22.2237, 114.0249,22.2244,
 114.0241,22.2250, 114.0242,22.2270, 114.0249,22.2273, 114.0251,22.2278,
 114.0259,22.2282, 114.0260,22.2287, 114.0269,22.2290, 114.0269,22.2294,
 114.0317,22.2300, 114.0321,22.2305, 114.0332,22.2306, 114.0340,22.2314,
 114.0354,22.2311, 114.0356,22.2300, 114.0363,22.2296, 114.0364,22.2276,
 114.0356,22.2256, 114.0361,22.2254, 114.0365,22.2238, 114.0361,22.2230,
 114.0349,22.2227, 114.0346,22.2223, 114.0307,22.2216, 114.0307,22.2212,
 114.0300,22.2209, 114.0298,22.2190, 114.0307,22.2183, 114.0308,22.2178,
 114.0316,22.2174, 114.0318,22.2169, 114.0326,22.2166, 114.0327,22.2160,
 114.0335,22.2157, 114.0337,22.2152, 114.0347,22.2152, 114.0355,22.2164,
 114.0361,22.2167, 114.0382,22.2166, 114.0384,22.2160, 114.0392,22.2158,
 114.0395,22.2143, 114.0401,22.2141, 114.0402,22.2140, 114.0403,22.2138,
 114.0403,22.2136, 114.0403,22.2134, 114.0403,22.2133, 114.0403,22.2133,
 114.0403,22.2133, 114.0403,22.2127, 114.0401,22.2125, 114.0397,22.2124,
 114.0390,22.2100, 114.0378,22.2098, 114.0374,22.2091, 114.0368,22.2089,
 114.0361,22.2064, 114.0356,22.2065, 114.0355,22.2071, 114.0346,22.2074,
 114.0345,22.2079, 114.0337,22.2082, 114.0334,22.2091, 114.0327,22.2096,
 114.0327,22.2093, 114.0298,22.2086, 114.0297,22.2082, 114.0290,22.2080,
 114.0287,22.2065, 114.0279,22.2062, 114.0279,22.2058, 114.0261,22.2052,
 114.0256,22.2041, 114.0238,22.2038],
[
 114.0413,22.2465, 114.0412,22.2469, 114.0404,22.2472, 114.0402,22.2477,
 114.0395,22.2480, 114.0393,22.2493, 114.0384,22.2500, 114.0383,22.2510,
 114.0375,22.2518, 114.0371,22.2543, 114.0360,22.2548, 114.0341,22.2549,
 114.0336,22.2555, 114.0335,22.2562, 114.0327,22.2569, 114.0327,22.2576,
 114.0316,22.2582, 114.0269,22.2586, 114.0269,22.2590, 114.0263,22.2592,
 114.0256,22.2617, 114.0251,22.2619, 114.0250,22.2623, 114.0268,22.2629,
 114.0272,22.2640, 114.0284,22.2643, 114.0307,22.2640, 114.0308,22.2636,
 114.0313,22.2635, 114.0319,22.2642, 114.0340,22.2643, 114.0346,22.2638,
 114.0441,22.2632, 114.0442,22.2628, 114.0447,22.2626, 114.0454,22.2548,
 114.0460,22.2545, 114.0461,22.2534, 114.0466,22.2531, 114.0470,22.2498,
 114.0466,22.2479, 114.0461,22.2477, 114.0460,22.2472, 114.0451,22.2469,
 114.0451,22.2465, 114.0436,22.2462],
[
 113.9052,22.1665, 113.9040,22.1666, 113.9036,22.1672, 113.9028,22.1676,
 113.9027,22.1681, 113.9021,22.1683, 113.9018,22.1710, 113.9021,22.1723,
 113.9033,22.1727, 113.9040,22.1734, 113.9052,22.1735, 113.9056,22.1738,
 113.9056,22.1740, 113.9058,22.1742, 113.9063,22.1743, 113.9070,22.1743,
 113.9094,22.1743, 113.9094,22.1743, 113.9095,22.1744, 113.9098,22.1747,
 113.9100,22.1749, 113.9102,22.1750, 113.9105,22.1750, 113.9113,22.1745,
 113.9113,22.1747, 113.9113,22.1752, 113.9113,22.1752, 113.9113,22.1755,
 113.9113,22.1762, 113.9113,22.1771, 113.9113,22.1784, 113.9114,22.1794,
 113.9117,22.1801, 113.9120,22.1804, 113.9129,22.1804, 113.9138,22.1812,
 113.9159,22.1809, 113.9163,22.1798, 113.9190,22.1792, 113.9193,22.1787,
 113.9205,22.1785, 113.9209,22.1780, 113.9208,22.1772, 113.9200,22.1766,
 113.9199,22.1758, 113.9194,22.1753, 113.9176,22.1751, 113.9171,22.1745,
 113.9172,22.1738, 113.9186,22.1733, 113.9190,22.1713, 113.9199,22.1693,
 113.9190,22.1690, 113.9189,22.1684, 113.9184,22.1683, 113.9179,22.1690,
 113.9165,22.1691, 113.9159,22.1682, 113.9148,22.1675, 113.9134,22.1676,
 113.9132,22.1681, 113.9126,22.1683, 113.9117,22.1675, 113.9099,22.1673,
 113.9091,22.1666, 113.9079,22.1665, 113.9074,22.1658, 113.9059,22.1657],
[
 113.9897,22.1961, 113.9896,22.1967, 113.9888,22.1970, 113.9886,22.1975,
 113.9878,22.1979, 113.9874,22.1985, 113.9862,22.1986, 113.9855,22.1994,
 113.9843,22.1995, 113.9839,22.2001, 113.9830,22.2005, 113.9820,22.2023,
 113.9821,22.2027, 113.9826,22.2029, 113.9830,22.2057, 113.9839,22.2067,
 113.9840,22.2078, 113.9858,22.2091, 113.9859,22.2097, 113.9874,22.2104,
 113.9901,22.2107, 113.9916,22.2104, 113.9916,22.2100, 113.9925,22.2097,
 113.9926,22.2091, 113.9931,22.2089, 113.9938,22.2055, 113.9944,22.2053,
 113.9948,22.2047, 113.9960,22.2043, 113.9963,22.2027, 113.9960,22.1991,
 113.9950,22.1978, 113.9938,22.1976, 113.9934,22.1970, 113.9926,22.1967,
 113.9925,22.1961, 113.9916,22.1958, 113.9915,22.1953],
[
 114.2379,22.1889, 114.2372,22.1892, 114.2370,22.1897, 114.2363,22.1900,
 114.2362,22.1914, 114.2370,22.1929, 114.2369,22.1949, 114.2362,22.1956,
 114.2361,22.1967, 114.2374,22.1975, 114.2428,22.1980, 114.2476,22.1989,
 114.2480,22.1994, 114.2494,22.1993, 114.2504,22.1979, 114.2511,22.1977,
 114.2514,22.1954, 114.2511,22.1913, 114.2496,22.1904, 114.2494,22.1894,
 114.2480,22.1890, 114.2472,22.1882, 114.2461,22.1881, 114.2453,22.1873,
 114.2448,22.1875, 114.2447,22.1880, 114.2438,22.1883, 114.2438,22.1887,
 114.2414,22.1890, 114.2402,22.1887, 114.2398,22.1876, 114.2392,22.1873,
 114.2382,22.1876],
[
 114.0382,22.2833, 114.0375,22.2835, 114.0374,22.2841, 114.0365,22.2844,
 114.0364,22.2850, 114.0359,22.2851, 114.0355,22.2879, 114.0346,22.2891,
 114.0345,22.2907, 114.0337,22.2915, 114.0338,22.2928, 114.0345,22.2931,
 114.0349,22.2937, 114.0361,22.2938, 114.0365,22.2943, 114.0396,22.2947,
 114.0415,22.2954, 114.0428,22.2956, 114.0432,22.2962, 114.0438,22.2964,
 114.0442,22.2950, 114.0450,22.2942, 114.0449,22.2922, 114.0442,22.2919,
 114.0441,22.2915, 114.0457,22.2911, 114.0461,22.2905, 114.0466,22.2903,
 114.0470,22.2884, 114.0466,22.2851, 114.0461,22.2850, 114.0460,22.2844,
 114.0453,22.2841, 114.0451,22.2832, 114.0442,22.2826, 114.0403,22.2822,
 114.0399,22.2817, 114.0385,22.2820],
[
 113.9284,22.1856, 113.9266,22.1859, 113.9265,22.1863, 113.9257,22.1866,
 113.9255,22.1874, 113.9249,22.1879, 113.9245,22.1868, 113.9236,22.1864,
 113.9218,22.1868, 113.9218,22.1871, 113.9212,22.1873, 113.9203,22.1857,
 113.9191,22.1856, 113.9182,22.1859, 113.9178,22.1870, 113.9153,22.1878,
 113.9150,22.1894, 113.9144,22.1899, 113.9134,22.1896, 113.9131,22.1885,
 113.9114,22.1879, 113.9111,22.1867, 113.9104,22.1871, 113.9080,22.1875,
 113.9075,22.1886, 113.9079,22.1908, 113.9083,22.1908, 113.9084,22.1915,
 113.9076,22.1921, 113.9077,22.1941, 113.9084,22.1947, 113.9088,22.1968,
 113.9110,22.1977, 113.9119,22.1961, 113.9137,22.1959, 113.9142,22.1953,
 113.9142,22.1946, 113.9151,22.1939, 113.9155,22.1925, 113.9160,22.1927,
 113.9166,22.1933, 113.9188,22.1932, 113.9190,22.1927, 113.9199,22.1923,
 113.9200,22.1918, 113.9205,22.1916, 113.9212,22.1925, 113.9227,22.1923,
 113.9228,22.1918, 113.9237,22.1915, 113.9238,22.1909, 113.9246,22.1906,
 113.9247,22.1902, 113.9276,22.1896, 113.9276,22.1892, 113.9285,22.1889,
 113.9286,22.1883, 113.9293,22.1881, 113.9294,22.1880, 113.9295,22.1879,
 113.9295,22.1876, 113.9295,22.1875, 113.9295,22.1874, 113.9295,22.1873,
 113.9295,22.1873, 113.9295,22.1862, 113.9293,22.1859],
[
 114.0484,22.2617, 114.0460,22.2621, 114.0460,22.2625, 114.0454,22.2626,
 114.0451,22.2633, 114.0453,22.2659, 114.0460,22.2664, 114.0461,22.2675,
 114.0479,22.2681, 114.0485,22.2692, 114.0527,22.2699, 114.0528,22.2702,
 114.0538,22.2702, 114.0547,22.2688, 114.0557,22.2685, 114.0565,22.2677,
 114.0564,22.2670, 114.0559,22.2669, 114.0552,22.2643, 114.0547,22.2642,
 114.0546,22.2636, 114.0534,22.2632, 114.0521,22.2621, 114.0509,22.2616,
 114.0507,22.2610, 114.0493,22.2609],
[
 114.2763,22.1894, 114.2754,22.1914, 114.2750,22.1942, 114.2744,22.1944,
 114.2745,22.1950, 114.2753,22.1953, 114.2753,22.1956, 114.2780,22.1965,
 114.2785,22.1984, 114.2801,22.1989, 114.2801,22.1993, 114.2810,22.1993,
 114.2811,22.1987, 114.2816,22.1986, 114.2824,22.1994, 114.2838,22.1991,
 114.2841,22.1978, 114.2848,22.1975, 114.2847,22.1969, 114.2841,22.1967,
 114.2830,22.1935, 114.2826,22.1899, 114.2821,22.1897, 114.2820,22.1894,
 114.2784,22.1890],
[
 114.0746,22.2843, 114.0731,22.2846, 114.0727,22.2857, 114.0719,22.2865,
 114.0720,22.2884, 114.0727,22.2887, 114.0728,22.2891, 114.0751,22.2895,
 114.0760,22.2903, 114.0772,22.2904, 114.0776,22.2910, 114.0782,22.2912,
 114.0785,22.2889, 114.0782,22.2851, 114.0776,22.2850, 114.0776,22.2846],
[
 113.8919,22.3448, 113.8913,22.3452, 113.8911,22.3462, 113.8897,22.3467,
 113.8893,22.3472, 113.8895,22.3482, 113.8902,22.3485, 113.8904,22.3489,
 113.8912,22.3485, 113.8928,22.3482, 113.8932,22.3476, 113.8938,22.3474,
 113.8945,22.3482, 113.8957,22.3481, 113.8960,22.3470, 113.8957,22.3448,
 113.8953,22.3448, 113.8951,22.3441, 113.8959,22.3439, 113.8959,22.3423,
 113.8951,22.3421, 113.8951,22.3417, 113.8933,22.3414, 113.8924,22.3420],
[
 114.2940,22.1893, 114.2935,22.1903, 114.2938,22.1923, 114.2953,22.1928,
 114.2954,22.1939, 114.2960,22.1942, 114.2965,22.1970, 114.2970,22.1977,
 114.2988,22.1982, 114.2991,22.1936, 114.2988,22.1925, 114.2983,22.1923,
 114.2982,22.1918, 114.2975,22.1915, 114.2971,22.1900, 114.2958,22.1891],
[
 113.9654,22.3296, 113.9651,22.3301, 113.9654,22.3301, 113.9659,22.3337,
 113.9665,22.3351, 113.9683,22.3362, 113.9690,22.3337, 113.9712,22.3330,
 113.9714,22.3325, 113.9713,22.3311, 113.9706,22.3307, 113.9703,22.3296,
 113.9688,22.3293],
[
 113.9010,22.1797, 113.9008,22.1802, 113.9000,22.1805, 113.8999,22.1815,
 113.9006,22.1820, 113.9037,22.1824, 113.9037,22.1828, 113.9046,22.1831,
 113.9047,22.1837, 113.9055,22.1837, 113.9056,22.1831, 113.9062,22.1830,
 113.9067,22.1846, 113.9074,22.1849, 113.9079,22.1855, 113.9087,22.1856,
 113.9093,22.1851, 113.9098,22.1830, 113.9103,22.1828, 113.9102,22.1822,
 113.9095,22.1820, 113.9093,22.1814, 113.9079,22.1813, 113.9071,22.1821,
 113.9066,22.1820, 113.9065,22.1814, 113.9056,22.1811, 113.9052,22.1804,
 113.9040,22.1803, 113.9031,22.1796],
[
 113.8416,22.2204, 113.8415,22.2209, 113.8408,22.2212, 113.8405,22.2225,
 113.8391,22.2229, 113.8387,22.2234, 113.8389,22.2244, 113.8396,22.2247,
 113.8397,22.2251, 113.8427,22.2254, 113.8441,22.2247, 113.8444,22.2241,
 113.8441,22.2219, 113.8436,22.2218, 113.8434,22.2212, 113.8426,22.2209,
 113.8425,22.2204],
[
 114.0565,22.2898, 114.0557,22.2910, 114.0547,22.2913, 114.0546,22.2919,
 114.0537,22.2922, 114.0537,22.2926, 114.0560,22.2930, 114.0569,22.2937,
 114.0583,22.2936, 114.0586,22.2930, 114.0595,22.2927, 114.0603,22.2918,
 114.0602,22.2904, 114.0595,22.2901, 114.0594,22.2898, 114.0576,22.2894],
[
 113.9251,22.1631, 113.9246,22.1638, 113.9241,22.1639, 113.9238,22.1644,
 113.9239,22.1664, 113.9246,22.1667, 113.9253,22.1679, 113.9268,22.1683,
 113.9272,22.1681, 113.9274,22.1676, 113.9276,22.1670, 113.9276,22.1661,
 113.9276,22.1655, 113.9276,22.1650, 113.9276,22.1648, 113.9276,22.1648,
 113.9276,22.1643, 113.9274,22.1640, 113.9267,22.1638, 113.9265,22.1632]],
 KC:[
[
 114.1804,22.3042, 114.1798,22.3043, 114.1790,22.3058, 114.1786,22.3075,
 114.1779,22.3078, 114.1778,22.3083, 114.1771,22.3086, 114.1767,22.3101,
 114.1760,22.3104, 114.1759,22.3109, 114.1752,22.3112, 114.1748,22.3127,
 114.1741,22.3130, 114.1740,22.3135, 114.1731,22.3138, 114.1727,22.3148,
 114.1713,22.3167, 114.1711,22.3184, 114.1703,22.3192, 114.1702,22.3203,
 114.1696,22.3206, 114.1693,22.3238, 114.1696,22.3293, 114.1702,22.3294,
 114.1703,22.3300, 114.1708,22.3301, 114.1712,22.3322, 114.1718,22.3327,
 114.1721,22.3347, 114.1718,22.3379, 114.1712,22.3384, 114.1708,22.3405,
 114.1703,22.3407, 114.1702,22.3412, 114.1694,22.3415, 114.1692,22.3428,
 114.1684,22.3434, 114.1685,22.3447, 114.1692,22.3452, 114.1691,22.3465,
 114.1686,22.3466, 114.1693,22.3480, 114.1740,22.3483, 114.1764,22.3478,
 114.1769,22.3473, 114.1773,22.3457, 114.1778,22.3455, 114.1779,22.3450,
 114.1786,22.3447, 114.1789,22.3434, 114.1797,22.3426, 114.1798,22.3410,
 114.1807,22.3400, 114.1808,22.3384, 114.1816,22.3376, 114.1817,22.3365,
 114.1826,22.3359, 114.1826,22.3351, 114.1837,22.3346, 114.1908,22.3336,
 114.1922,22.3339, 114.1926,22.3344, 114.1937,22.3345, 114.1942,22.3352,
 114.1950,22.3355, 114.1951,22.3359, 114.1982,22.3361, 114.1995,22.3356,
 114.1998,22.3294, 114.1995,22.3258, 114.1989,22.3255, 114.1991,22.3242,
 114.1998,22.3239, 114.2002,22.3229, 114.2014,22.3217, 114.2018,22.3208,
 114.2028,22.3204, 114.2036,22.3195, 114.2037,22.3183, 114.2046,22.3175,
 114.2047,22.3159, 114.2055,22.3151, 114.2058,22.3138, 114.2065,22.3135,
 114.2065,22.3131, 114.2094,22.3125, 114.2095,22.3121, 114.2103,22.3118,
 114.2102,22.3111, 114.2098,22.3111, 114.2090,22.3059, 114.2088,22.3059,
 114.2086,22.3059, 114.2085,22.3059, 114.2084,22.3059, 114.2084,22.3059,
 114.2078,22.3059, 114.2075,22.3061, 114.2074,22.3066, 114.2066,22.3069,
 114.2065,22.3075, 114.2056,22.3078, 114.2055,22.3083, 114.2048,22.3086,
 114.2045,22.3099, 114.2027,22.3105, 114.2026,22.3109, 114.2018,22.3112,
 114.2017,22.3118, 114.2007,22.3121, 114.1998,22.3135, 114.1989,22.3138,
 114.1988,22.3144, 114.1980,22.3147, 114.1979,22.3152, 114.1970,22.3156,
 114.1969,22.3161, 114.1961,22.3164, 114.1960,22.3170, 114.1951,22.3173,
 114.1950,22.3178, 114.1942,22.3182, 114.1940,22.3187, 114.1932,22.3190,
 114.1931,22.3196, 114.1923,22.3199, 114.1918,22.3205, 114.1910,22.3206,
 114.1904,22.3201, 114.1902,22.3184, 114.1893,22.3164, 114.1886,22.3161,
 114.1884,22.3142, 114.1893,22.3134, 114.1894,22.3123, 114.1899,22.3119,
 114.1903,22.3103, 114.1899,22.3076, 114.1894,22.3070, 114.1890,22.3042,
 114.1884,22.3040, 114.1883,22.3035, 114.1873,22.3031, 114.1856,22.3023,
 114.1855,22.3019, 114.1825,22.3016, 114.1810,22.3020]],
 KT:[
[
 114.2348,22.2878, 114.2339,22.2885, 114.2327,22.2886, 114.2320,22.2894,
 114.2311,22.2894, 114.2305,22.2901, 114.2301,22.2929, 114.2295,22.2931,
 114.2294,22.2936, 114.2286,22.2939, 114.2284,22.2945, 114.2276,22.2948,
 114.2275,22.2953, 114.2266,22.2957, 114.2265,22.2962, 114.2257,22.2965,
 114.2256,22.2971, 114.2249,22.2973, 114.2245,22.2989, 114.2238,22.2991,
 114.2235,22.2999, 114.2224,22.3015, 114.2212,22.3016, 114.2208,22.3023,
 114.2200,22.3026, 114.2198,22.3031, 114.2190,22.3035, 114.2189,22.3040,
 114.2181,22.3043, 114.2179,22.3049, 114.2171,22.3052, 114.2170,22.3057,
 114.2161,22.3061, 114.2159,22.3069, 114.2151,22.3083, 114.2141,22.3086,
 114.2132,22.3099, 114.2117,22.3104, 114.2109,22.3128, 114.2104,22.3130,
 114.2103,22.3134, 114.2065,22.3138, 114.2056,22.3143, 114.2055,22.3151,
 114.2047,22.3159, 114.2046,22.3175, 114.2037,22.3183, 114.2036,22.3195,
 114.2028,22.3204, 114.2018,22.3208, 114.2014,22.3217, 114.2002,22.3229,
 114.1998,22.3239, 114.1991,22.3242, 114.1991,22.3257, 114.1995,22.3258,
 114.2002,22.3335, 114.2009,22.3347, 114.2020,22.3353, 114.2046,22.3353,
 114.2070,22.3345, 114.2089,22.3344, 114.2094,22.3339, 114.2118,22.3336,
 114.2139,22.3344, 114.2170,22.3348, 114.2171,22.3352, 114.2176,22.3353,
 114.2180,22.3348, 114.2228,22.3341, 114.2228,22.3337, 114.2237,22.3334,
 114.2238,22.3329, 114.2245,22.3326, 114.2247,22.3313, 114.2256,22.3307,
 114.2257,22.3296, 114.2265,22.3286, 114.2269,22.3258, 114.2275,22.3256,
 114.2276,22.3251, 114.2284,22.3248, 114.2289,22.3241, 114.2301,22.3240,
 114.2305,22.3234, 114.2313,22.3230, 114.2314,22.3227, 114.2337,22.3223,
 114.2346,22.3215, 114.2354,22.3215, 114.2360,22.3207, 114.2365,22.3171,
 114.2370,22.3170, 114.2372,22.3164, 114.2379,22.3161, 114.2380,22.3142,
 114.2372,22.3135, 114.2370,22.3130, 114.2363,22.3127, 114.2360,22.3112,
 114.2352,22.3109, 114.2351,22.3104, 114.2344,22.3101, 114.2343,22.3081,
 114.2346,22.3073, 114.2361,22.3064, 114.2363,22.3051, 114.2370,22.3049,
 114.2372,22.3043, 114.2377,22.3042, 114.2381,22.3022, 114.2377,22.2986,
 114.2365,22.2981, 114.2361,22.2927, 114.2365,22.2894, 114.2370,22.2891,
 114.2369,22.2880],
[
 114.2084,22.3053, 114.2085,22.3057, 114.2090,22.3059, 114.2098,22.3111,
 114.2103,22.3109, 114.2104,22.3104, 114.2111,22.3101, 114.2114,22.3088,
 114.2122,22.3078, 114.2120,22.3057, 114.2108,22.3050]],
 KWT:[
[
 114.1271,22.3171, 114.1253,22.3175, 114.1253,22.3178, 114.1244,22.3182,
 114.1240,22.3188, 114.1228,22.3189, 114.1224,22.3196, 114.1216,22.3199,
 114.1211,22.3205, 114.1199,22.3207, 114.1188,22.3222, 114.1177,22.3227,
 114.1179,22.3240, 114.1186,22.3244, 114.1188,22.3257, 114.1195,22.3260,
 114.1196,22.3263, 114.1197,22.3265, 114.1199,22.3266, 114.1203,22.3267,
 114.1215,22.3267, 114.1215,22.3267, 114.1216,22.3267, 114.1219,22.3267,
 114.1222,22.3267, 114.1227,22.3267, 114.1231,22.3267, 114.1235,22.3268,
 114.1238,22.3270, 114.1240,22.3272, 114.1248,22.3275, 114.1267,22.3276,
 114.1276,22.3283, 114.1288,22.3284, 114.1291,22.3289, 114.1286,22.3292,
 114.1265,22.3291, 114.1261,22.3286, 114.1239,22.3284, 114.1231,22.3292,
 114.1222,22.3293, 114.1216,22.3302, 114.1211,22.3345, 114.1206,22.3349,
 114.1205,22.3366, 114.1196,22.3377, 114.1195,22.3399, 114.1186,22.3421,
 114.1180,22.3422, 114.1176,22.3444, 114.1168,22.3452, 114.1167,22.3459,
 114.1160,22.3465, 114.1129,22.3469, 114.1128,22.3473, 114.1120,22.3476,
 114.1119,22.3481, 114.1111,22.3481, 114.1109,22.3476, 114.1104,22.3474,
 114.1100,22.3447, 114.1104,22.3434, 114.1112,22.3431, 114.1118,22.3423,
 114.1123,22.3385, 114.1128,22.3372, 114.1123,22.3370, 114.1118,22.3335,
 114.1112,22.3327, 114.1108,22.3327, 114.1102,22.3321, 114.1097,22.3295,
 114.1082,22.3289, 114.1081,22.3279, 114.1072,22.3272, 114.1069,22.3261,
 114.1057,22.3258, 114.1041,22.3259, 114.1033,22.3264, 114.1032,22.3274,
 114.1025,22.3277, 114.1023,22.3282, 114.1008,22.3283, 114.1005,22.3279,
 114.0981,22.3275, 114.0967,22.3279, 114.0961,22.3289, 114.0945,22.3293,
 114.0938,22.3289, 114.0939,22.3286, 114.0946,22.3283, 114.0946,22.3268,
 114.0939,22.3265, 114.0938,22.3261, 114.0924,22.3258, 114.0896,22.3261,
 114.0890,22.3274, 114.0881,22.3277, 114.0880,22.3282, 114.0873,22.3285,
 114.0870,22.3298, 114.0862,22.3308, 114.0863,22.3334, 114.0870,22.3342,
 114.0869,22.3368, 114.0865,22.3370, 114.0859,22.3420, 114.0847,22.3431,
 114.0830,22.3432, 114.0823,22.3438, 114.0823,22.3445, 114.0814,22.3452,
 114.0813,22.3462, 114.0798,22.3467, 114.0794,22.3487, 114.0786,22.3498,
 114.0787,22.3524, 114.0794,22.3530, 114.0793,22.3543, 114.0786,22.3547,
 114.0784,22.3558, 114.0779,22.3561, 114.0776,22.3583, 114.0779,22.3593,
 114.0791,22.3596, 114.0798,22.3604, 114.0810,22.3605, 114.0817,22.3612,
 114.0829,22.3613, 114.0833,22.3620, 114.0844,22.3623, 114.0853,22.3637,
 114.0861,22.3640, 114.0862,22.3646, 114.0885,22.3656, 114.0904,22.3657,
 114.0913,22.3664, 114.0925,22.3665, 114.0945,22.3673, 114.0976,22.3677,
 114.0977,22.3680, 114.0985,22.3684, 114.0989,22.3690, 114.1001,22.3691,
 114.1008,22.3699, 114.1023,22.3698, 114.1024,22.3694, 114.1053,22.3687,
 114.1053,22.3684, 114.1060,22.3681, 114.1064,22.3666, 114.1071,22.3663,
 114.1072,22.3658, 114.1081,22.3654, 114.1102,22.3623, 114.1124,22.3622,
 114.1148,22.3632, 114.1152,22.3638, 114.1164,22.3639, 114.1168,22.3646,
 114.1176,22.3649, 114.1177,22.3654, 114.1185,22.3657, 114.1188,22.3672,
 114.1195,22.3675, 114.1204,22.3689, 114.1214,22.3692, 114.1216,22.3698,
 114.1224,22.3701, 114.1225,22.3705, 114.1311,22.3711, 114.1311,22.3715,
 114.1319,22.3718, 114.1321,22.3724, 114.1326,22.3725, 114.1333,22.3803,
 114.1339,22.3805, 114.1343,22.3811, 114.1355,22.3812, 114.1373,22.3820,
 114.1395,22.3819, 114.1397,22.3814, 114.1402,22.3812, 114.1410,22.3783,
 114.1420,22.3778, 114.1439,22.3776, 114.1444,22.3768, 114.1441,22.3751,
 114.1435,22.3750, 114.1434,22.3744, 114.1426,22.3741, 114.1416,22.3722,
 114.1416,22.3718, 114.1423,22.3715, 114.1425,22.3707, 114.1425,22.3696,
 114.1416,22.3687, 114.1415,22.3677, 114.1407,22.3669, 114.1408,22.3649,
 114.1414,22.3646, 114.1415,22.3626, 114.1407,22.3618, 114.1404,22.3605,
 114.1397,22.3603, 114.1396,22.3597, 114.1389,22.3594, 114.1386,22.3581,
 114.1378,22.3567, 114.1379,22.3552, 114.1386,22.3536, 114.1391,22.3500,
 114.1396,22.3499, 114.1397,22.3493, 114.1405,22.3490, 114.1407,22.3485,
 114.1414,22.3482, 114.1417,22.3467, 114.1425,22.3464, 114.1426,22.3459,
 114.1427,22.3458, 114.1433,22.3456, 114.1434,22.3455, 114.1435,22.3454,
 114.1435,22.3452, 114.1435,22.3450, 114.1435,22.3449, 114.1435,22.3448,
 114.1435,22.3448, 114.1435,22.3438, 114.1433,22.3432, 114.1426,22.3429,
 114.1419,22.3417, 114.1374,22.3414, 114.1349,22.3417, 114.1343,22.3422,
 114.1322,22.3421, 114.1317,22.3414, 114.1305,22.3413, 114.1302,22.3411,
 114.1301,22.3407, 114.1301,22.3403, 114.1301,22.3400, 114.1301,22.3398,
 114.1301,22.3396, 114.1301,22.3396, 114.1301,22.3391, 114.1303,22.3388,
 114.1310,22.3386, 114.1311,22.3381, 114.1319,22.3378, 114.1321,22.3372,
 114.1328,22.3369, 114.1331,22.3354, 114.1339,22.3352, 114.1343,22.3345,
 114.1355,22.3344, 114.1359,22.3337, 114.1364,22.3336, 114.1368,22.3320,
 114.1364,22.3293, 114.1359,22.3291, 114.1358,22.3286, 114.1349,22.3282,
 114.1348,22.3277, 114.1338,22.3274, 114.1326,22.3259, 114.1314,22.3257,
 114.1302,22.3242, 114.1295,22.3241, 114.1291,22.3221, 114.1295,22.3189,
 114.1298,22.3188, 114.1284,22.3175]],
 N:[
[
 114.1196,22.4603, 114.1192,22.4608, 114.1180,22.4609, 114.1176,22.4615,
 114.1168,22.4618, 114.1164,22.4625, 114.1152,22.4626, 114.1148,22.4633,
 114.1139,22.4636, 114.1135,22.4642, 114.1123,22.4643, 114.1118,22.4650,
 114.1104,22.4651, 114.1095,22.4643, 114.1076,22.4642, 114.1052,22.4635,
 114.1005,22.4631, 114.1001,22.4626, 114.0989,22.4625, 114.0982,22.4617,
 114.0970,22.4616, 114.0967,22.4611, 114.0913,22.4608, 114.0881,22.4615,
 114.0880,22.4622, 114.0875,22.4626, 114.0871,22.4701, 114.0875,22.4747,
 114.0880,22.4750, 114.0881,22.4761, 114.0890,22.4769, 114.0894,22.4790,
 114.0899,22.4792, 114.0906,22.4804, 114.0909,22.4834, 114.0906,22.4851,
 114.0900,22.4854, 114.0899,22.4865, 114.0894,22.4868, 114.0887,22.4980,
 114.0881,22.4984, 114.0882,22.4997, 114.0890,22.5001, 114.0891,22.5012,
 114.0899,22.5020, 114.0898,22.5039, 114.0894,22.5041, 114.0887,22.5111,
 114.0881,22.5122, 114.0872,22.5128, 114.0842,22.5131, 114.0842,22.5135,
 114.0835,22.5137, 114.0833,22.5143, 114.0841,22.5146, 114.0841,22.5161,
 114.0833,22.5164, 114.0832,22.5169, 114.0824,22.5172, 114.0823,22.5178,
 114.0814,22.5181, 114.0810,22.5188, 114.0798,22.5189, 114.0794,22.5195,
 114.0787,22.5198, 114.0786,22.5218, 114.0795,22.5228, 114.0819,22.5232,
 114.0836,22.5239, 114.0848,22.5241, 114.0853,22.5247, 114.0861,22.5250,
 114.0862,22.5256, 114.0870,22.5259, 114.0872,22.5264, 114.0880,22.5268,
 114.0881,22.5273, 114.0890,22.5276, 114.0890,22.5280, 114.0914,22.5283,
 114.0928,22.5280, 114.0929,22.5276, 114.0937,22.5273, 114.0942,22.5267,
 114.0953,22.5265, 114.0962,22.5258, 114.0984,22.5259, 114.0991,22.5265,
 114.1013,22.5263, 114.1016,22.5250, 114.1023,22.5247, 114.1024,22.5243,
 114.1062,22.5268, 114.1063,22.5273, 114.1071,22.5276, 114.1072,22.5282,
 114.1078,22.5283, 114.1085,22.5231, 114.1090,22.5230, 114.1091,22.5224,
 114.1100,22.5221, 114.1100,22.5217, 114.1118,22.5214, 114.1127,22.5217,
 114.1130,22.5228, 114.1138,22.5236, 114.1139,22.5248, 114.1146,22.5256,
 114.1180,22.5261, 114.1187,22.5273, 114.1194,22.5276, 114.1198,22.5291,
 114.1205,22.5294, 114.1209,22.5300, 114.1221,22.5301, 114.1225,22.5308,
 114.1234,22.5311, 114.1235,22.5316, 114.1240,22.5318, 114.1257,22.5309,
 114.1262,22.5311, 114.1263,22.5316, 114.1272,22.5320, 114.1276,22.5326,
 114.1288,22.5327, 114.1297,22.5332, 114.1368,22.5338, 114.1368,22.5342,
 114.1377,22.5346, 114.1378,22.5351, 114.1386,22.5351, 114.1388,22.5346,
 114.1396,22.5342, 114.1400,22.5336, 114.1412,22.5335, 114.1417,22.5328,
 114.1440,22.5327, 114.1448,22.5330, 114.1451,22.5336, 114.1447,22.5343,
 114.1448,22.5347, 114.1463,22.5354, 114.1464,22.5360, 114.1472,22.5363,
 114.1473,22.5367, 114.1492,22.5373, 114.1491,22.5377, 114.1483,22.5380,
 114.1479,22.5387, 114.1467,22.5388, 114.1463,22.5394, 114.1464,22.5401,
 114.1479,22.5410, 114.1484,22.5441, 114.1488,22.5446, 114.1511,22.5451,
 114.1512,22.5455, 114.1520,22.5455, 114.1521,22.5449, 114.1530,22.5449,
 114.1531,22.5455, 114.1536,22.5456, 114.1543,22.5491, 114.1549,22.5493,
 114.1550,22.5498, 114.1558,22.5501, 114.1560,22.5507, 114.1577,22.5515,
 114.1606,22.5505, 114.1610,22.5491, 114.1616,22.5493, 114.1622,22.5505,
 114.1656,22.5508, 114.1688,22.5500, 114.1715,22.5503, 114.1725,22.5508,
 114.1730,22.5507, 114.1731,22.5501, 114.1740,22.5498, 114.1741,22.5493,
 114.1746,22.5491, 114.1754,22.5465, 114.1759,22.5463, 114.1760,22.5460,
 114.1855,22.5453, 114.1856,22.5449, 114.1871,22.5448, 114.1874,22.5453,
 114.1905,22.5457, 114.1918,22.5465, 114.1936,22.5466, 114.1941,22.5470,
 114.1965,22.5474, 114.1979,22.5470, 114.1979,22.5468, 114.1980,22.5467,
 114.1983,22.5466, 114.1986,22.5465, 114.1998,22.5465, 114.1998,22.5465,
 114.2001,22.5465, 114.2006,22.5465, 114.2013,22.5465, 114.2022,22.5465,
 114.2029,22.5465, 114.2034,22.5463, 114.2037,22.5462, 114.2037,22.5460,
 114.2123,22.5453, 114.2123,22.5449, 114.2132,22.5446, 114.2136,22.5440,
 114.2148,22.5439, 114.2152,22.5432, 114.2160,22.5429, 114.2161,22.5423,
 114.2170,22.5420, 114.2170,22.5416, 114.2199,22.5410, 114.2200,22.5406,
 114.2208,22.5403, 114.2209,22.5397, 114.2218,22.5394, 114.2219,22.5389,
 114.2227,22.5386, 114.2228,22.5380, 114.2237,22.5377, 114.2235,22.5370,
 114.2229,22.5369, 114.2227,22.5356, 114.2222,22.5353, 114.2217,22.5324,
 114.2211,22.5318, 114.2199,22.5315, 114.2200,22.5311, 114.2208,22.5308,
 114.2209,22.5302, 114.2218,22.5299, 114.2219,22.5294, 114.2227,22.5290,
 114.2226,22.5284, 114.2220,22.5282, 114.2216,22.5267, 114.2209,22.5264,
 114.2208,22.5259, 114.2200,22.5256, 114.2194,22.5249, 114.2172,22.5250,
 114.2151,22.5281, 114.2153,22.5289, 114.2180,22.5295, 114.2181,22.5299,
 114.2188,22.5302, 114.2188,22.5317, 114.2181,22.5320, 114.2179,22.5325,
 114.2164,22.5326, 114.2155,22.5318, 114.2132,22.5315, 114.2124,22.5302,
 114.2117,22.5301, 114.2109,22.5266, 114.2104,22.5264, 114.2103,22.5259,
 114.2096,22.5256, 114.2092,22.5241, 114.2085,22.5238, 114.2084,22.5235,
 114.2046,22.5228, 114.2055,22.5218, 114.2054,22.5198, 114.2047,22.5195,
 114.2046,22.5190, 114.2037,22.5186, 114.2038,22.5180, 114.2046,22.5178,
 114.2046,22.5174, 114.2070,22.5171, 114.2084,22.5174, 114.2085,22.5178,
 114.2093,22.5181, 114.2095,22.5186, 114.2109,22.5188, 114.2114,22.5181,
 114.2121,22.5178, 114.2124,22.5165, 114.2129,22.5168, 114.2134,22.5187,
 114.2141,22.5190, 114.2142,22.5195, 114.2149,22.5198, 114.2154,22.5211,
 114.2166,22.5214, 114.2189,22.5211, 114.2190,22.5207, 114.2195,22.5205,
 114.2203,22.5214, 114.2215,22.5215, 114.2219,22.5221, 114.2224,22.5223,
 114.2229,22.5244, 114.2238,22.5249, 114.2256,22.5245, 114.2257,22.5242,
 114.2265,22.5238, 114.2269,22.5232, 114.2284,22.5233, 114.2305,22.5264,
 114.2310,22.5266, 114.2317,22.5309, 114.2323,22.5313, 114.2325,22.5326,
 114.2332,22.5328, 114.2333,22.5334, 114.2339,22.5335, 114.2346,22.5370,
 114.2351,22.5373, 114.2355,22.5390, 114.2364,22.5395, 114.2381,22.5397,
 114.2389,22.5402, 114.2390,22.5399, 114.2413,22.5393, 114.2417,22.5388,
 114.2422,22.5353, 114.2427,22.5353, 114.2428,22.5356, 114.2428,22.5361,
 114.2428,22.5361, 114.2428,22.5362, 114.2428,22.5364, 114.2428,22.5368,
 114.2428,22.5372, 114.2431,22.5375, 114.2443,22.5379, 114.2467,22.5375,
 114.2467,22.5371, 114.2472,22.5370, 114.2478,22.5391, 114.2490,22.5396,
 114.2514,22.5393, 114.2521,22.5388, 114.2553,22.5384, 114.2545,22.5371,
 114.2549,22.5364, 114.2572,22.5358, 114.2571,22.5354, 114.2563,22.5351,
 114.2561,22.5346, 114.2553,22.5342, 114.2553,22.5338, 114.2537,22.5334,
 114.2530,22.5309, 114.2524,22.5308, 114.2523,22.5302, 114.2515,22.5299,
 114.2514,22.5294, 114.2505,22.5290, 114.2507,22.5284, 114.2514,22.5285,
 114.2515,22.5290, 114.2523,22.5294, 114.2524,22.5299, 114.2533,22.5302,
 114.2533,22.5306, 114.2539,22.5309, 114.2560,22.5308, 114.2563,22.5302,
 114.2571,22.5299, 114.2572,22.5294, 114.2581,22.5290, 114.2579,22.5284,
 114.2572,22.5282, 114.2572,22.5278, 114.2603,22.5274, 114.2610,22.5268,
 114.2610,22.5260, 114.2617,22.5250, 114.2610,22.5229, 114.2604,22.5224,
 114.2581,22.5219, 114.2581,22.5216, 114.2575,22.5214, 114.2572,22.5182,
 114.2575,22.5162, 114.2582,22.5164, 114.2591,22.5176, 114.2605,22.5179,
 114.2629,22.5176, 114.2631,22.5172, 114.2652,22.5171, 114.2658,22.5174,
 114.2658,22.5179, 114.2658,22.5179, 114.2658,22.5181, 114.2658,22.5183,
 114.2658,22.5186, 114.2658,22.5190, 114.2658,22.5194, 114.2659,22.5197,
 114.2665,22.5204, 114.2668,22.5212, 114.2676,22.5212, 114.2677,22.5207,
 114.2686,22.5204, 114.2686,22.5200, 114.2722,22.5197, 114.2744,22.5200,
 114.2744,22.5204, 114.2750,22.5205, 114.2753,22.5200, 114.2745,22.5189,
 114.2742,22.5172, 114.2735,22.5169, 114.2733,22.5164, 114.2726,22.5161,
 114.2724,22.5151, 114.2728,22.5146, 114.2736,22.5145, 114.2742,22.5148,
 114.2745,22.5159, 114.2759,22.5163, 114.2764,22.5169, 114.2786,22.5170,
 114.2799,22.5161, 114.2800,22.5141, 114.2793,22.5136, 114.2792,22.5129,
 114.2800,22.5126, 114.2801,22.5122, 114.2816,22.5117, 114.2820,22.5103,
 114.2817,22.5098, 114.2802,22.5093, 114.2781,22.5094, 114.2772,22.5099,
 114.2769,22.5110, 114.2763,22.5109, 114.2762,22.5103, 114.2755,22.5100,
 114.2752,22.5087, 114.2738,22.5083, 114.2733,22.5063, 114.2725,22.5055,
 114.2724,22.5047, 114.2719,22.5042, 114.2707,22.5041, 114.2698,22.5044,
 114.2695,22.5055, 114.2690,22.5058, 114.2686,22.5037, 114.2691,22.5030,
 114.2715,22.5024, 114.2763,22.5027, 114.2766,22.5032, 114.2775,22.5032,
 114.2781,22.5027, 114.2782,22.5016, 114.2796,22.5008, 114.2858,22.5003,
 114.2859,22.4999, 114.2866,22.4997, 114.2870,22.4981, 114.2877,22.4979,
 114.2878,22.4973, 114.2886,22.4973, 114.2885,22.4980, 114.2878,22.4982,
 114.2879,22.4988, 114.2885,22.4990, 114.2887,22.4996, 114.2887,22.5006,
 114.2887,22.5006, 114.2887,22.5007, 114.2887,22.5008, 114.2887,22.5010,
 114.2887,22.5012, 114.2886,22.5013, 114.2885,22.5014, 114.2881,22.5015,
 114.2874,22.5018, 114.2859,22.5033, 114.2858,22.5038, 114.2916,22.5044,
 114.2921,22.5049, 114.2942,22.5048, 114.2945,22.5043, 114.2953,22.5039,
 114.2954,22.5034, 114.2960,22.5032, 114.2965,22.5049, 114.2972,22.5051,
 114.2973,22.5055, 114.2988,22.5060, 114.2996,22.5084, 114.3001,22.5086,
 114.3002,22.5091, 114.3009,22.5094, 114.3010,22.5107, 114.3002,22.5115,
 114.3003,22.5135, 114.3009,22.5137, 114.3010,22.5143, 114.3002,22.5146,
 114.3001,22.5152, 114.2993,22.5155, 114.2994,22.5162, 114.3000,22.5163,
 114.3005,22.5179, 114.3010,22.5178, 114.3015,22.5171, 114.3027,22.5170,
 114.3031,22.5164, 114.3039,22.5164, 114.3038,22.5170, 114.3031,22.5172,
 114.3030,22.5176, 114.2996,22.5185, 114.2992,22.5221, 114.2996,22.5243,
 114.3009,22.5249, 114.3012,22.5256, 114.3027,22.5257, 114.3034,22.5249,
 114.3048,22.5245, 114.3051,22.5232, 114.3058,22.5230, 114.3059,22.5224,
 114.3067,22.5222, 114.3070,22.5209, 114.3080,22.5205, 114.3086,22.5218,
 114.3091,22.5275, 114.3096,22.5276, 114.3097,22.5280, 114.3115,22.5283,
 114.3124,22.5280, 114.3126,22.5269, 114.3135,22.5263, 114.3136,22.5251,
 114.3144,22.5236, 114.3143,22.5216, 114.3129,22.5209, 114.3126,22.5184,
 114.3129,22.5171, 114.3135,22.5169, 114.3145,22.5150, 114.3144,22.5146,
 114.3134,22.5143, 114.3126,22.5131, 114.3108,22.5128, 114.3099,22.5131,
 114.3096,22.5142, 114.3091,22.5145, 114.3088,22.5142, 114.3089,22.5129,
 114.3096,22.5124, 114.3098,22.5113, 114.3116,22.5107, 114.3117,22.5103,
 114.3125,22.5100, 114.3126,22.5095, 114.3132,22.5093, 114.3135,22.5071,
 114.3132,22.5060, 114.3116,22.5055, 114.3116,22.5051, 114.3107,22.5048,
 114.3106,22.5043, 114.3098,22.5039, 114.3096,22.5034, 114.3088,22.5031,
 114.3088,22.5027, 114.3059,22.5020, 114.3058,22.5017, 114.3046,22.5012,
 114.3030,22.4992, 114.3025,22.4990, 114.3012,22.4989, 114.3003,22.4991,
 114.3002,22.4992, 114.3001,22.4996, 114.3000,22.4997, 114.2998,22.4998,
 114.2996,22.4998, 114.2994,22.4998, 114.2993,22.4998, 114.2992,22.4998,
 114.2992,22.4998, 114.2980,22.4998, 114.2974,22.4994, 114.2971,22.4981,
 114.2964,22.4979, 114.2963,22.4975, 114.2935,22.4968, 114.2934,22.4965,
 114.2927,22.4963, 114.2926,22.4961, 114.2925,22.4960, 114.2925,22.4958,
 114.2925,22.4956, 114.2925,22.4955, 114.2925,22.4954, 114.2925,22.4954,
 114.2926,22.4954, 114.2929,22.4951, 114.2931,22.4949, 114.2933,22.4947,
 114.2934,22.4945, 114.2935,22.4943, 114.2935,22.4940, 114.2935,22.4939,
 114.2936,22.4938, 114.2945,22.4935, 114.2954,22.4921, 114.2965,22.4921,
 114.2976,22.4937, 114.2988,22.4938, 114.2993,22.4944, 114.3001,22.4947,
 114.3002,22.4951, 114.3049,22.4960, 114.3107,22.4966, 114.3112,22.4971,
 114.3130,22.4972, 114.3148,22.4980, 114.3160,22.4981, 114.3168,22.4988,
 114.3179,22.4990, 114.3184,22.4996, 114.3192,22.4999, 114.3193,22.5005,
 114.3202,22.5008, 114.3206,22.5014, 114.3218,22.5016, 114.3225,22.5023,
 114.3237,22.5024, 114.3244,22.5032, 114.3258,22.5031, 114.3263,22.5024,
 114.3275,22.5023, 114.3279,22.5017, 114.3286,22.5013, 114.3288,22.4993,
 114.3275,22.4972, 114.3263,22.4971, 114.3251,22.4956, 114.3241,22.4953,
 114.3240,22.4947, 114.3231,22.4944, 114.3230,22.4939, 114.3215,22.4938,
 114.3211,22.4944, 114.3203,22.4947, 114.3202,22.4953, 114.3196,22.4954,
 114.3178,22.4946, 114.3160,22.4945, 114.3149,22.4938, 114.3126,22.4934,
 114.3125,22.4930, 114.3117,22.4927, 114.3113,22.4920, 114.3101,22.4919,
 114.3096,22.4913, 114.3088,22.4910, 114.3087,22.4904, 114.3079,22.4901,
 114.3077,22.4895, 114.3069,22.4892, 114.3068,22.4887, 114.3050,22.4878,
 114.3040,22.4875, 114.3040,22.4871, 114.3036,22.4868, 114.3024,22.4867,
 114.3020,22.4861, 114.3012,22.4858, 114.3007,22.4851, 114.2996,22.4850,
 114.2991,22.4844, 114.2983,22.4840, 114.2979,22.4834, 114.2967,22.4833,
 114.2963,22.4826, 114.2941,22.4816, 114.2935,22.4818, 114.2931,22.4824,
 114.2919,22.4825, 114.2910,22.4833, 114.2892,22.4834, 114.2868,22.4844,
 114.2864,22.4850, 114.2852,22.4851, 114.2848,22.4858, 114.2840,22.4861,
 114.2836,22.4867, 114.2824,22.4868, 114.2816,22.4876, 114.2804,22.4877,
 114.2797,22.4885, 114.2785,22.4886, 114.2778,22.4893, 114.2766,22.4894,
 114.2763,22.4899, 114.2745,22.4902, 114.2711,22.4899, 114.2696,22.4892,
 114.2696,22.4888, 114.2619,22.4882, 114.2619,22.4878, 114.2610,22.4875,
 114.2606,22.4868, 114.2594,22.4867, 114.2591,22.4862, 114.2507,22.4859,
 114.2457,22.4862, 114.2453,22.4867, 114.2441,22.4868, 114.2437,22.4875,
 114.2429,22.4878, 114.2428,22.4884, 114.2421,22.4886, 114.2417,22.4901,
 114.2410,22.4904, 114.2409,22.4910, 114.2400,22.4913, 114.2399,22.4918,
 114.2391,22.4921, 114.2389,22.4927, 114.2381,22.4930, 114.2380,22.4935,
 114.2372,22.4939, 114.2370,22.4944, 114.2362,22.4947, 114.2360,22.4953,
 114.2346,22.4954, 114.2342,22.4947, 114.2333,22.4944, 114.2332,22.4939,
 114.2325,22.4936, 114.2322,22.4923, 114.2308,22.4919, 114.2301,22.4912,
 114.2289,22.4911, 114.2284,22.4904, 114.2274,22.4901, 114.2265,22.4887,
 114.2257,22.4884, 114.2256,22.4878, 114.2249,22.4875, 114.2245,22.4860,
 114.2238,22.4858, 114.2234,22.4851, 114.2222,22.4850, 114.2218,22.4844,
 114.2209,22.4840, 114.2208,22.4835, 114.2200,22.4832, 114.2198,22.4826,
 114.2190,22.4823, 114.2189,22.4819, 114.2172,22.4816, 114.2142,22.4819,
 114.2136,22.4824, 114.2118,22.4825, 114.2113,22.4830, 114.1998,22.4836,
 114.1995,22.4841, 114.1983,22.4842, 114.1979,22.4847, 114.1928,22.4854,
 114.1913,22.4861, 114.1912,22.4865, 114.1855,22.4871, 114.1852,22.4876,
 114.1840,22.4877, 114.1836,22.4882, 114.1800,22.4885, 114.1779,22.4882,
 114.1775,22.4877, 114.1763,22.4876, 114.1756,22.4868, 114.1743,22.4867,
 114.1733,22.4860, 114.1731,22.4854, 114.1713,22.4847, 114.1710,22.4834,
 114.1703,22.4832, 114.1702,22.4826, 114.1696,22.4825, 114.1689,22.4799,
 114.1684,22.4797, 114.1683,22.4792, 114.1674,22.4788, 114.1670,22.4782,
 114.1656,22.4783, 114.1651,22.4789, 114.1639,22.4791, 114.1635,22.4795,
 114.1608,22.4802, 114.1603,22.4815, 114.1591,22.4816, 114.1586,22.4823,
 114.1572,22.4824, 114.1568,22.4819, 114.1492,22.4813, 114.1491,22.4809,
 114.1484,22.4806, 114.1483,22.4786, 114.1491,22.4778, 114.1493,22.4767,
 114.1501,22.4761, 114.1500,22.4748, 114.1476,22.4733, 114.1464,22.4728,
 114.1463,22.4722, 114.1454,22.4719, 114.1453,22.4714, 114.1446,22.4711,
 114.1443,22.4698, 114.1425,22.4692, 114.1425,22.4688, 114.1416,22.4684,
 114.1416,22.4681, 114.1387,22.4674, 114.1386,22.4670, 114.1378,22.4667,
 114.1374,22.4661, 114.1362,22.4660, 114.1358,22.4653, 114.1349,22.4650,
 114.1348,22.4644, 114.1312,22.4627, 114.1272,22.4622, 114.1272,22.4618,
 114.1263,22.4615, 114.1259,22.4609, 114.1247,22.4608, 114.1244,22.4603,
 114.1226,22.4600],
[
 114.2914,22.5242, 114.2908,22.5249, 114.2900,22.5248, 114.2896,22.5242,
 114.2887,22.5238, 114.2887,22.5235, 114.2810,22.5228, 114.2809,22.5224,
 114.2787,22.5223, 114.2774,22.5232, 114.2772,22.5242, 114.2779,22.5255,
 114.2788,22.5263, 114.2790,22.5265, 114.2791,22.5266, 114.2791,22.5266,
 114.2791,22.5267, 114.2791,22.5268, 114.2791,22.5269, 114.2791,22.5271,
 114.2792,22.5273, 114.2793,22.5274, 114.2799,22.5276, 114.2802,22.5289,
 114.2849,22.5304, 114.2848,22.5308, 114.2840,22.5311, 114.2839,22.5315,
 114.2821,22.5321, 114.2818,22.5334, 114.2811,22.5337, 114.2810,22.5342,
 114.2801,22.5346, 114.2801,22.5349, 114.2785,22.5354, 114.2782,22.5369,
 114.2787,22.5377, 114.2810,22.5382, 114.2810,22.5386, 114.2804,22.5387,
 114.2801,22.5420, 114.2804,22.5436, 114.2816,22.5440, 114.2820,22.5445,
 114.2850,22.5448, 114.2868,22.5445, 114.2868,22.5441, 114.2876,22.5439,
 114.2877,22.5432, 114.2870,22.5429, 114.2868,22.5420, 114.2871,22.5414,
 114.2883,22.5413, 114.2887,22.5408, 114.2916,22.5404, 114.2967,22.5408,
 114.2978,22.5413, 114.3000,22.5412, 114.3002,22.5408, 114.3071,22.5403,
 114.3088,22.5398, 114.3087,22.5390, 114.3069,22.5377, 114.3068,22.5371,
 114.3059,22.5368, 114.3058,22.5363, 114.3050,22.5360, 114.3048,22.5354,
 114.3034,22.5353, 114.3027,22.5361, 114.3012,22.5360, 114.3011,22.5356,
 114.2982,22.5349, 114.2982,22.5346, 114.2973,22.5342, 114.2967,22.5336,
 114.2946,22.5337, 114.2944,22.5342, 114.2935,22.5346, 114.2934,22.5351,
 114.2924,22.5354, 114.2916,22.5367, 114.2892,22.5370, 114.2880,22.5363,
 114.2879,22.5342, 114.2884,22.5335, 114.2893,22.5335, 114.2897,22.5328,
 114.2904,22.5326, 114.2907,22.5313, 114.2915,22.5306, 114.2917,22.5293,
 114.2924,22.5290, 114.2929,22.5284, 114.2941,22.5283, 114.2945,22.5276,
 114.2948,22.5275, 114.2954,22.5275, 114.2954,22.5275, 114.2954,22.5275,
 114.2956,22.5275, 114.2957,22.5275, 114.2960,22.5275, 114.2963,22.5281,
 114.2964,22.5303, 114.2967,22.5309, 114.2972,22.5311, 114.2973,22.5316,
 114.2995,22.5326, 114.3010,22.5325, 114.3013,22.5318, 114.3022,22.5316,
 114.3030,22.5307, 114.3028,22.5291, 114.3022,22.5285, 114.3012,22.5282,
 114.3010,22.5276, 114.3002,22.5273, 114.3001,22.5268, 114.2994,22.5265,
 114.2991,22.5252, 114.2983,22.5245, 114.2982,22.5235, 114.2973,22.5228,
 114.2973,22.5221, 114.2962,22.5215, 114.2937,22.5214, 114.2919,22.5221],
[
 114.3206,22.5289, 114.3202,22.5313, 114.3195,22.5318, 114.3199,22.5323,
 114.3209,22.5327, 114.3221,22.5327, 114.3221,22.5327, 114.3222,22.5327,
 114.3223,22.5327, 114.3225,22.5327, 114.3227,22.5327, 114.3229,22.5326,
 114.3230,22.5325, 114.3231,22.5320, 114.3240,22.5313, 114.3239,22.5294,
 114.3231,22.5290, 114.3230,22.5285, 114.3215,22.5284]],
 S:[
[
 114.2086,22.2012, 114.2077,22.2015, 114.2071,22.2029, 114.2059,22.2034,
 114.2056,22.2124, 114.2059,22.2176, 114.2065,22.2178, 114.2066,22.2183,
 114.2074,22.2186, 114.2075,22.2192, 114.2083,22.2195, 114.2084,22.2214,
 114.2075,22.2221, 114.2066,22.2235, 114.2056,22.2235, 114.2056,22.2231,
 114.2038,22.2225, 114.2035,22.2212, 114.2028,22.2209, 114.2026,22.2204,
 114.2019,22.2201, 114.2018,22.2191, 114.2009,22.2186, 114.1966,22.2181,
 114.1960,22.2171, 114.1930,22.2167, 114.1915,22.2172, 114.1912,22.2188,
 114.1905,22.2194, 114.1911,22.2201, 114.1913,22.2216, 114.1921,22.2223,
 114.1923,22.2233, 114.1937,22.2237, 114.1945,22.2245, 114.1957,22.2246,
 114.1960,22.2252, 114.1958,22.2262, 114.1951,22.2264, 114.1951,22.2268,
 114.1912,22.2275, 114.1912,22.2278, 114.1903,22.2282, 114.1902,22.2287,
 114.1887,22.2294, 114.1884,22.2313, 114.1887,22.2323, 114.1902,22.2316,
 114.1912,22.2313, 114.1913,22.2308, 114.1920,22.2313, 114.1921,22.2322,
 114.1914,22.2324, 114.1912,22.2337, 114.1903,22.2344, 114.1905,22.2357,
 114.1918,22.2363, 114.1922,22.2394, 114.1918,22.2410, 114.1913,22.2411,
 114.1912,22.2417, 114.1903,22.2420, 114.1902,22.2425, 114.1894,22.2425,
 114.1893,22.2420, 114.1884,22.2417, 114.1884,22.2413, 114.1860,22.2409,
 114.1855,22.2403, 114.1853,22.2394, 114.1846,22.2391, 114.1845,22.2385,
 114.1837,22.2382, 114.1835,22.2377, 114.1827,22.2377, 114.1826,22.2382,
 114.1820,22.2384, 114.1817,22.2378, 114.1803,22.2375, 114.1779,22.2378,
 114.1778,22.2382, 114.1773,22.2384, 114.1769,22.2411, 114.1778,22.2424,
 114.1817,22.2430, 114.1817,22.2434, 114.1824,22.2436, 114.1816,22.2451,
 114.1809,22.2455, 114.1808,22.2474, 114.1811,22.2479, 114.1816,22.2481,
 114.1817,22.2486, 114.1826,22.2489, 114.1826,22.2493, 114.1801,22.2496,
 114.1756,22.2493, 114.1751,22.2485, 114.1749,22.2473, 114.1742,22.2463,
 114.1731,22.2460, 114.1729,22.2452, 114.1721,22.2437, 114.1715,22.2436,
 114.1708,22.2384, 114.1703,22.2382, 114.1702,22.2377, 114.1694,22.2374,
 114.1692,22.2361, 114.1689,22.2358, 114.1675,22.2351, 114.1655,22.2359,
 114.1651,22.2366, 114.1639,22.2367, 114.1635,22.2373, 114.1620,22.2381,
 114.1616,22.2405, 114.1607,22.2415, 114.1606,22.2431, 114.1598,22.2442,
 114.1596,22.2464, 114.1590,22.2470, 114.1581,22.2469, 114.1586,22.2461,
 114.1586,22.2429, 114.1580,22.2425, 114.1579,22.2399, 114.1587,22.2388,
 114.1588,22.2371, 114.1597,22.2362, 114.1595,22.2345, 114.1586,22.2341,
 114.1565,22.2344, 114.1558,22.2356, 114.1551,22.2359, 114.1549,22.2372,
 114.1540,22.2378, 114.1539,22.2389, 114.1521,22.2396, 114.1520,22.2399,
 114.1512,22.2403, 114.1511,22.2406, 114.1493,22.2413, 114.1491,22.2424,
 114.1488,22.2427, 114.1486,22.2427, 114.1484,22.2427, 114.1483,22.2427,
 114.1483,22.2427, 114.1483,22.2427, 114.1465,22.2427, 114.1459,22.2428,
 114.1456,22.2429, 114.1454,22.2430, 114.1453,22.2434, 114.1443,22.2437,
 114.1435,22.2447, 114.1434,22.2458, 114.1426,22.2465, 114.1425,22.2476,
 114.1407,22.2489, 114.1408,22.2496, 114.1415,22.2498, 114.1416,22.2503,
 114.1423,22.2505, 114.1425,22.2508, 114.1425,22.2514, 114.1425,22.2514,
 114.1425,22.2514, 114.1425,22.2515, 114.1425,22.2517, 114.1425,22.2519,
 114.1377,22.2526, 114.1376,22.2529, 114.1362,22.2530, 114.1357,22.2524,
 114.1335,22.2523, 114.1326,22.2530, 114.1314,22.2533, 114.1307,22.2557,
 114.1302,22.2559, 114.1297,22.2565, 114.1283,22.2569, 114.1281,22.2580,
 114.1273,22.2589, 114.1269,22.2617, 114.1262,22.2619, 114.1253,22.2633,
 114.1245,22.2636, 114.1242,22.2653, 114.1234,22.2668, 114.1225,22.2671,
 114.1224,22.2676, 114.1217,22.2679, 114.1213,22.2696, 114.1205,22.2711,
 114.1199,22.2713, 114.1192,22.2739, 114.1169,22.2748, 114.1167,22.2751,
 114.1167,22.2756, 114.1167,22.2756, 114.1167,22.2756, 114.1167,22.2758,
 114.1167,22.2759, 114.1167,22.2761, 114.1168,22.2763, 114.1169,22.2764,
 114.1176,22.2766, 114.1177,22.2770, 114.1215,22.2777, 114.1219,22.2781,
 114.1231,22.2782, 114.1234,22.2787, 114.1252,22.2791, 114.1282,22.2787,
 114.1285,22.2782, 114.1297,22.2781, 114.1302,22.2775, 114.1310,22.2772,
 114.1314,22.2765, 114.1326,22.2764, 114.1330,22.2758, 114.1337,22.2755,
 114.1340,22.2742, 114.1348,22.2735, 114.1351,22.2722, 114.1358,22.2720,
 114.1359,22.2714, 114.1366,22.2712, 114.1370,22.2696, 114.1377,22.2694,
 114.1378,22.2688, 114.1383,22.2687, 114.1388,22.2665, 114.1405,22.2641,
 114.1408,22.2627, 114.1415,22.2625, 114.1416,22.2619, 114.1425,22.2616,
 114.1427,22.2610, 114.1448,22.2609, 114.1457,22.2617, 114.1469,22.2618,
 114.1474,22.2625, 114.1481,22.2627, 114.1484,22.2640, 114.1498,22.2644,
 114.1505,22.2652, 114.1520,22.2650, 114.1524,22.2644, 114.1536,22.2643,
 114.1543,22.2635, 114.1558,22.2636, 114.1559,22.2640, 114.1582,22.2644,
 114.1589,22.2650, 114.1611,22.2652, 114.1625,22.2642, 114.1629,22.2635,
 114.1641,22.2634, 114.1646,22.2628, 114.1660,22.2621, 114.1769,22.2614,
 114.1773,22.2609, 114.1785,22.2608, 114.1788,22.2603, 114.1806,22.2600,
 114.1836,22.2603, 114.1840,22.2608, 114.1852,22.2609, 114.1855,22.2614,
 114.1893,22.2621, 114.1897,22.2626, 114.1909,22.2627, 114.1912,22.2632,
 114.1979,22.2638, 114.1980,22.2642, 114.1995,22.2643, 114.2002,22.2635,
 114.2016,22.2636, 114.2021,22.2643, 114.2033,22.2644, 114.2037,22.2649,
 114.2058,22.2652, 114.2094,22.2649, 114.2098,22.2644, 114.2109,22.2643,
 114.2117,22.2635, 114.2129,22.2634, 114.2132,22.2629, 114.2163,22.2626,
 114.2181,22.2618, 114.2228,22.2614, 114.2231,22.2609, 114.2243,22.2608,
 114.2247,22.2603, 114.2261,22.2600, 114.2285,22.2603, 114.2289,22.2608,
 114.2301,22.2609, 114.2304,22.2614, 114.2328,22.2617, 114.2342,22.2614,
 114.2346,22.2609, 114.2358,22.2608, 114.2362,22.2602, 114.2392,22.2584,
 114.2406,22.2582, 114.2410,22.2576, 114.2417,22.2573, 114.2420,22.2559,
 114.2438,22.2533, 114.2446,22.2530, 114.2446,22.2515, 114.2438,22.2512,
 114.2434,22.2505, 114.2419,22.2502, 114.2419,22.2498, 114.2428,22.2495,
 114.2429,22.2489, 114.2437,22.2486, 114.2441,22.2480, 114.2450,22.2479,
 114.2456,22.2472, 114.2461,22.2444, 114.2466,22.2443, 114.2467,22.2437,
 114.2475,22.2434, 114.2477,22.2429, 114.2484,22.2426, 114.2485,22.2413,
 114.2478,22.2408, 114.2477,22.2388, 114.2482,22.2378, 114.2510,22.2375,
 114.2524,22.2378, 114.2524,22.2382, 114.2530,22.2384, 114.2552,22.2372,
 114.2551,22.2359, 114.2544,22.2356, 114.2542,22.2351, 114.2534,22.2348,
 114.2530,22.2341, 114.2515,22.2342, 114.2514,22.2348, 114.2508,22.2349,
 114.2505,22.2344, 114.2528,22.2338, 114.2532,22.2334, 114.2533,22.2319,
 114.2531,22.2312, 114.2519,22.2306, 114.2495,22.2309, 114.2495,22.2313,
 114.2487,22.2316, 114.2487,22.2331, 114.2495,22.2333, 114.2495,22.2337,
 114.2471,22.2341, 114.2457,22.2334, 114.2459,22.2324, 114.2466,22.2322,
 114.2467,22.2316, 114.2475,22.2313, 114.2477,22.2308, 114.2484,22.2305,
 114.2486,22.2292, 114.2492,22.2289, 114.2499,22.2185, 114.2504,22.2186,
 114.2505,22.2190, 114.2523,22.2193, 114.2532,22.2190, 114.2535,22.2177,
 114.2542,22.2174, 114.2544,22.2169, 114.2549,22.2167, 114.2553,22.2148,
 114.2549,22.2115, 114.2544,22.2114, 114.2542,22.2108, 114.2527,22.2107,
 114.2523,22.2114, 114.2518,22.2115, 114.2513,22.2137, 114.2507,22.2141,
 114.2499,22.2141, 114.2495,22.2136, 114.2481,22.2133, 114.2457,22.2136,
 114.2453,22.2141, 114.2448,22.2140, 114.2447,22.2136, 114.2422,22.2133,
 114.2381,22.2136, 114.2380,22.2140, 114.2372,22.2143, 114.2371,22.2147,
 114.2353,22.2153, 114.2351,22.2164, 114.2343,22.2171, 114.2344,22.2184,
 114.2351,22.2186, 114.2352,22.2192, 114.2360,22.2194, 114.2361,22.2207,
 114.2352,22.2214, 114.2350,22.2227, 114.2343,22.2230, 114.2339,22.2236,
 114.2327,22.2237, 114.2323,22.2244, 114.2314,22.2247, 114.2313,22.2252,
 114.2306,22.2255, 114.2302,22.2270, 114.2295,22.2273, 114.2294,22.2278,
 114.2289,22.2280, 114.2286,22.2286, 114.2287,22.2312, 114.2294,22.2318,
 114.2293,22.2331, 114.2289,22.2332, 114.2281,22.2401, 114.2276,22.2403,
 114.2275,22.2408, 114.2266,22.2411, 114.2274,22.2427, 114.2274,22.2443,
 114.2266,22.2446, 114.2265,22.2451, 114.2257,22.2455, 114.2256,22.2458,
 114.2242,22.2462, 114.2218,22.2458, 114.2219,22.2455, 114.2227,22.2451,
 114.2228,22.2446, 114.2243,22.2439, 114.2247,22.2382, 114.2240,22.2355,
 114.2232,22.2349, 114.2209,22.2346, 114.2208,22.2342, 114.2203,22.2341,
 114.2198,22.2355, 114.2190,22.2361, 114.2186,22.2375, 114.2181,22.2373,
 114.2179,22.2368, 114.2172,22.2365, 114.2169,22.2352, 114.2136,22.2341,
 114.2129,22.2315, 114.2123,22.2313, 114.2122,22.2308, 114.2114,22.2304,
 114.2112,22.2299, 114.2105,22.2296, 114.2104,22.2276, 114.2112,22.2270,
 114.2114,22.2264, 114.2122,22.2261, 114.2126,22.2254, 114.2138,22.2253,
 114.2142,22.2251, 114.2142,22.2247, 114.2152,22.2244, 114.2170,22.2235,
 114.2171,22.2230, 114.2176,22.2228, 114.2180,22.2201, 114.2176,22.2187,
 114.2164,22.2184, 114.2160,22.2178, 114.2152,22.2174, 114.2151,22.2169,
 114.2143,22.2167, 114.2142,22.2160, 114.2149,22.2158, 114.2153,22.2141,
 114.2161,22.2126, 114.2167,22.2124, 114.2174,22.2098, 114.2179,22.2097,
 114.2181,22.2091, 114.2188,22.2088, 114.2190,22.2075, 114.2197,22.2071,
 114.2198,22.2058, 114.2190,22.2050, 114.2189,22.2039, 114.2182,22.2031,
 114.2151,22.2026, 114.2150,22.2022, 114.2135,22.2021, 114.2121,22.2027,
 114.2104,22.2019, 114.2103,22.2015],
[
 114.1811,22.2193, 114.1804,22.2201, 114.1795,22.2202, 114.1789,22.2209,
 114.1785,22.2237, 114.1779,22.2240, 114.1781,22.2251, 114.1793,22.2254,
 114.1817,22.2251, 114.1817,22.2247, 114.1826,22.2244, 114.1827,22.2238,
 114.1842,22.2231, 114.1846,22.2212, 114.1840,22.2204, 114.1817,22.2199,
 114.1816,22.2195]],
 SK:[
[
 114.2791,22.2434, 114.2784,22.2437, 114.2784,22.2454, 114.2791,22.2467,
 114.2768,22.2471, 114.2759,22.2478, 114.2747,22.2480, 114.2735,22.2495,
 114.2728,22.2496, 114.2726,22.2500, 114.2725,22.2506, 114.2724,22.2516,
 114.2724,22.2548, 114.2724,22.2548, 114.2724,22.2549, 114.2724,22.2550,
 114.2724,22.2551, 114.2724,22.2554, 114.2725,22.2555, 114.2726,22.2556,
 114.2733,22.2559, 114.2735,22.2564, 114.2742,22.2567, 114.2745,22.2582,
 114.2753,22.2584, 114.2754,22.2590, 114.2762,22.2593, 114.2763,22.2597,
 114.2801,22.2603, 114.2804,22.2608, 114.2816,22.2609, 114.2821,22.2616,
 114.2829,22.2619, 114.2830,22.2625, 114.2853,22.2634, 114.2877,22.2638,
 114.2878,22.2642, 114.2885,22.2644, 114.2887,22.2647, 114.2887,22.2652,
 114.2887,22.2652, 114.2887,22.2653, 114.2887,22.2654, 114.2887,22.2655,
 114.2887,22.2658, 114.2886,22.2659, 114.2885,22.2660, 114.2881,22.2661,
 114.2874,22.2687, 114.2855,22.2695, 114.2843,22.2696, 114.2839,22.2702,
 114.2824,22.2709, 114.2819,22.2727, 114.2804,22.2731, 114.2801,22.2735,
 114.2777,22.2739, 114.2765,22.2735, 114.2761,22.2725, 114.2747,22.2721,
 114.2743,22.2714, 114.2738,22.2713, 114.2735,22.2706, 114.2733,22.2685,
 114.2730,22.2678, 114.2728,22.2678, 114.2726,22.2678, 114.2725,22.2678,
 114.2724,22.2678, 114.2724,22.2678, 114.2718,22.2678, 114.2716,22.2676,
 114.2714,22.2671, 114.2707,22.2668, 114.2704,22.2655, 114.2698,22.2652,
 114.2690,22.2653, 114.2686,22.2655, 114.2686,22.2659, 114.2684,22.2660,
 114.2683,22.2661, 114.2680,22.2661, 114.2678,22.2661, 114.2677,22.2661,
 114.2677,22.2661, 114.2677,22.2661, 114.2659,22.2661, 114.2650,22.2667,
 114.2644,22.2695, 114.2639,22.2697, 114.2637,22.2705, 114.2628,22.2720,
 114.2618,22.2723, 114.2610,22.2731, 114.2612,22.2738, 114.2619,22.2740,
 114.2620,22.2746, 114.2628,22.2749, 114.2630,22.2754, 114.2638,22.2758,
 114.2639,22.2763, 114.2647,22.2766, 114.2648,22.2770, 114.2643,22.2773,
 114.2621,22.2772, 114.2619,22.2766, 114.2613,22.2765, 114.2610,22.2770,
 114.2575,22.2779, 114.2572,22.2809, 114.2575,22.2825, 114.2587,22.2831,
 114.2594,22.2877, 114.2600,22.2880, 114.2601,22.2891, 114.2606,22.2894,
 114.2610,22.2911, 114.2606,22.2941, 114.2591,22.2948, 114.2590,22.2953,
 114.2582,22.2957, 114.2583,22.2963, 114.2589,22.2965, 114.2589,22.2980,
 114.2582,22.2983, 114.2581,22.2988, 114.2573,22.2991, 114.2571,22.3004,
 114.2563,22.3010, 114.2560,22.3023, 114.2553,22.3026, 114.2553,22.3030,
 114.2538,22.3033, 114.2514,22.3030, 114.2514,22.3026, 114.2507,22.3023,
 114.2503,22.3008, 114.2496,22.3005, 114.2492,22.2999, 114.2480,22.2998,
 114.2475,22.2991, 114.2467,22.2988, 114.2466,22.2983, 114.2459,22.2980,
 114.2455,22.2965, 114.2448,22.2962, 114.2447,22.2957, 114.2438,22.2953,
 114.2437,22.2948, 114.2422,22.2941, 114.2417,22.2922, 114.2408,22.2911,
 114.2381,22.2893, 114.2379,22.2885, 114.2373,22.2880, 114.2370,22.2891,
 114.2365,22.2894, 114.2361,22.2927, 114.2365,22.2981, 114.2377,22.2986,
 114.2381,22.3022, 114.2377,22.3042, 114.2372,22.3043, 114.2370,22.3049,
 114.2363,22.3051, 114.2361,22.3064, 114.2346,22.3073, 114.2343,22.3081,
 114.2344,22.3101, 114.2351,22.3104, 114.2352,22.3109, 114.2360,22.3112,
 114.2363,22.3127, 114.2370,22.3130, 114.2372,22.3135, 114.2380,22.3142,
 114.2379,22.3161, 114.2372,22.3164, 114.2370,22.3170, 114.2365,22.3171,
 114.2360,22.3207, 114.2354,22.3215, 114.2346,22.3215, 114.2337,22.3223,
 114.2314,22.3227, 114.2313,22.3230, 114.2305,22.3234, 114.2301,22.3240,
 114.2289,22.3241, 114.2284,22.3248, 114.2276,22.3251, 114.2275,22.3256,
 114.2269,22.3258, 114.2265,22.3286, 114.2257,22.3296, 114.2256,22.3307,
 114.2247,22.3313, 114.2245,22.3326, 114.2238,22.3329, 114.2237,22.3334,
 114.2228,22.3337, 114.2228,22.3341, 114.2180,22.3348, 114.2179,22.3352,
 114.2171,22.3355, 114.2172,22.3361, 114.2176,22.3362, 114.2179,22.3368,
 114.2178,22.3394, 114.2174,22.3396, 114.2167,22.3466, 114.2161,22.3474,
 114.2160,22.3501, 114.2155,22.3509, 114.2151,22.3536, 114.2155,22.3552,
 114.2160,22.3559, 114.2161,22.3581, 114.2170,22.3605, 114.2174,22.3647,
 114.2179,22.3649, 114.2181,22.3654, 114.2188,22.3657, 114.2190,22.3670,
 114.2198,22.3677, 114.2201,22.3690, 114.2208,22.3692, 114.2209,22.3698,
 114.2218,22.3701, 114.2218,22.3705, 114.2266,22.3711, 114.2269,22.3716,
 114.2281,22.3717, 114.2289,22.3725, 114.2301,22.3726, 114.2308,22.3733,
 114.2320,22.3735, 114.2324,22.3741, 114.2332,22.3744, 114.2333,22.3750,
 114.2342,22.3753, 114.2343,22.3758, 114.2350,22.3761, 114.2354,22.3776,
 114.2361,22.3779, 114.2362,22.3784, 114.2370,22.3788, 114.2372,22.3793,
 114.2380,22.3796, 114.2381,22.3802, 114.2389,22.3805, 114.2391,22.3810,
 114.2396,22.3812, 114.2403,22.3838, 114.2409,22.3839, 114.2413,22.3846,
 114.2425,22.3847, 114.2434,22.3855, 114.2446,22.3855, 114.2455,22.3868,
 114.2461,22.3928, 114.2470,22.3933, 114.2482,22.3934, 114.2486,22.3940,
 114.2495,22.3943, 114.2495,22.3947, 114.2518,22.3951, 114.2524,22.3956,
 114.2648,22.3962, 114.2652,22.3967, 114.2664,22.3968, 114.2668,22.3975,
 114.2676,22.3978, 114.2677,22.3983, 114.2686,22.3987, 114.2690,22.3993,
 114.2702,22.3994, 114.2705,22.3999, 114.2744,22.4006, 114.2744,22.4009,
 114.2753,22.4013, 114.2754,22.4018, 114.2761,22.4021, 114.2763,22.4034,
 114.2781,22.4047, 114.2782,22.4053, 114.2790,22.4055, 114.2792,22.4068,
 114.2797,22.4072, 114.2804,22.4106, 114.2810,22.4108, 114.2811,22.4113,
 114.2819,22.4116, 114.2820,22.4120, 114.2967,22.4127, 114.2972,22.4135,
 114.2973,22.4147, 114.2982,22.4161, 114.2983,22.4172, 114.2988,22.4175,
 114.2996,22.4222, 114.3010,22.4229, 114.3013,22.4234, 114.3022,22.4236,
 114.3034,22.4235, 114.3040,22.4231, 114.3097,22.4224, 114.3098,22.4220,
 114.3106,22.4217, 114.3110,22.4211, 114.3122,22.4210, 114.3126,22.4203,
 114.3135,22.4200, 114.3136,22.4194, 114.3141,22.4193, 114.3145,22.4165,
 114.3154,22.4155, 114.3156,22.4142, 114.3163,22.4139, 114.3168,22.4133,
 114.3179,22.4132, 114.3187,22.4124, 114.3199,22.4123, 114.3206,22.4115,
 114.3218,22.4114, 114.3222,22.4108, 114.3227,22.4106, 114.3239,22.4113,
 114.3249,22.4116, 114.3250,22.4120, 114.3253,22.4123, 114.3265,22.4124,
 114.3270,22.4131, 114.3278,22.4134, 114.3280,22.4139, 114.3302,22.4140,
 114.3307,22.4138, 114.3308,22.4134, 114.3316,22.4131, 114.3317,22.4125,
 114.3326,22.4122, 114.3327,22.4116, 114.3335,22.4113, 114.3336,22.4108,
 114.3344,22.4105, 114.3347,22.4090, 114.3354,22.4087, 114.3359,22.4081,
 114.3371,22.4080, 114.3379,22.4072, 114.3399,22.4070, 114.3426,22.4050,
 114.3431,22.4040, 114.3449,22.4037, 114.3479,22.4040, 114.3480,22.4044,
 114.3488,22.4047, 114.3489,22.4053, 114.3500,22.4056, 114.3508,22.4070,
 114.3517,22.4073, 114.3518,22.4079, 114.3525,22.4081, 114.3529,22.4096,
 114.3536,22.4099, 114.3537,22.4105, 114.3545,22.4108, 114.3547,22.4113,
 114.3555,22.4116, 114.3556,22.4122, 114.3562,22.4124, 114.3566,22.4152,
 114.3574,22.4161, 114.3575,22.4173, 114.3582,22.4185, 114.3584,22.4213,
 114.3574,22.4234, 114.3569,22.4236, 114.3562,22.4288, 114.3556,22.4290,
 114.3546,22.4309, 114.3547,22.4312, 114.3552,22.4314, 114.3559,22.4366,
 114.3565,22.4367, 114.3569,22.4374, 114.3581,22.4375, 114.3585,22.4382,
 114.3590,22.4383, 114.3594,22.4369, 114.3603,22.4361, 114.3607,22.4340,
 114.3612,22.4338, 114.3614,22.4333, 114.3619,22.4331, 114.3622,22.4333,
 114.3623,22.4337, 114.3624,22.4338, 114.3626,22.4339, 114.3630,22.4340,
 114.3642,22.4340, 114.3642,22.4340, 114.3642,22.4340, 114.3643,22.4340,
 114.3645,22.4340, 114.3648,22.4340, 114.3649,22.4340, 114.3651,22.4342,
 114.3651,22.4345, 114.3669,22.4349, 114.3678,22.4345, 114.3683,22.4334,
 114.3698,22.4331, 114.3728,22.4334, 114.3728,22.4338, 114.3743,22.4345,
 114.3794,22.4352, 114.3795,22.4356, 114.3803,22.4359, 114.3805,22.4364,
 114.3813,22.4367, 114.3814,22.4373, 114.3823,22.4376, 114.3824,22.4381,
 114.3829,22.4378, 114.3832,22.4369, 114.3831,22.4342, 114.3824,22.4338,
 114.3825,22.4332, 114.3832,22.4333, 114.3833,22.4338, 114.3842,22.4342,
 114.3843,22.4347, 114.3848,22.4349, 114.3852,22.4334, 114.3861,22.4328,
 114.3861,22.4320, 114.3867,22.4315, 114.3879,22.4314, 114.3888,22.4317,
 114.3894,22.4331, 114.3899,22.4330, 114.3903,22.4323, 114.3915,22.4322,
 114.3919,22.4316, 114.3928,22.4312, 114.3926,22.4306, 114.3919,22.4304,
 114.3918,22.4298, 114.3910,22.4295, 114.3909,22.4291, 114.3894,22.4286,
 114.3889,22.4267, 114.3881,22.4259, 114.3879,22.4246, 114.3873,22.4244,
 114.3871,22.4237, 114.3879,22.4229, 114.3888,22.4226, 114.3889,22.4206,
 114.3882,22.4201, 114.3881,22.4194, 114.3889,22.4186, 114.3899,22.4182,
 114.3903,22.4176, 114.3915,22.4175, 114.3922,22.4167, 114.3934,22.4165,
 114.3938,22.4146, 114.3947,22.4136, 114.3948,22.4120, 114.3955,22.4113,
 114.3956,22.4094, 114.3948,22.4087, 114.3947,22.4082, 114.3938,22.4079,
 114.3938,22.4075, 114.3896,22.4072, 114.3875,22.4076, 114.3867,22.4096,
 114.3855,22.4098, 114.3848,22.4106, 114.3840,22.4106, 114.3834,22.4113,
 114.3829,22.4141, 114.3824,22.4142, 114.3823,22.4148, 114.3821,22.4149,
 114.3820,22.4149, 114.3817,22.4149, 114.3815,22.4149, 114.3814,22.4149,
 114.3814,22.4149, 114.3814,22.4149, 114.3784,22.4149, 114.3775,22.4150,
 114.3769,22.4151, 114.3766,22.4153, 114.3762,22.4158, 114.3748,22.4155,
 114.3746,22.4144, 114.3738,22.4138, 114.3737,22.4130, 114.3730,22.4125,
 114.3706,22.4122, 114.3699,22.4117, 114.3698,22.4109, 114.3691,22.4105,
 114.3690,22.4092, 114.3695,22.4089, 114.3699,22.4067, 114.3694,22.4056,
 114.3676,22.4055, 114.3664,22.4063, 114.3657,22.3985, 114.3650,22.3983,
 114.3642,22.3971, 114.3613,22.3964, 114.3614,22.3961, 114.3622,22.3957,
 114.3626,22.3951, 114.3640,22.3952, 114.3642,22.3957, 114.3651,22.3961,
 114.3651,22.3964, 114.3669,22.3968, 114.3678,22.3964, 114.3682,22.3951,
 114.3689,22.3949, 114.3689,22.3945, 114.3716,22.3937, 114.3719,22.3921,
 114.3727,22.3913, 114.3729,22.3902, 114.3746,22.3895, 114.3750,22.3881,
 114.3756,22.3883, 114.3757,22.3888, 114.3765,22.3891, 114.3766,22.3897,
 114.3772,22.3898, 114.3777,22.3884, 114.3791,22.3881, 114.3798,22.3873,
 114.3806,22.3872, 114.3812,22.3856, 114.3817,22.3783, 114.3823,22.3775,
 114.3825,22.3761, 114.3832,22.3758, 114.3831,22.3752, 114.3824,22.3750,
 114.3823,22.3746, 114.3800,22.3741, 114.3794,22.3733, 114.3798,22.3717,
 114.3803,22.3715, 114.3805,22.3710, 114.3813,22.3706, 114.3823,22.3686,
 114.3821,22.3666, 114.3814,22.3660, 114.3814,22.3649, 114.3810,22.3644,
 114.3792,22.3639, 114.3756,22.3642, 114.3748,22.3656, 114.3746,22.3670,
 114.3738,22.3677, 114.3737,22.3687, 114.3728,22.3694, 114.3726,22.3707,
 114.3719,22.3710, 114.3718,22.3713, 114.3717,22.3715, 114.3714,22.3716,
 114.3711,22.3717, 114.3706,22.3717, 114.3703,22.3717, 114.3700,22.3717,
 114.3699,22.3717, 114.3699,22.3717, 114.3687,22.3717, 114.3683,22.3717,
 114.3681,22.3718, 114.3680,22.3720, 114.3680,22.3722, 114.3676,22.3725,
 114.3668,22.3725, 114.3662,22.3722, 114.3661,22.3711, 114.3670,22.3705,
 114.3672,22.3692, 114.3679,22.3689, 114.3683,22.3683, 114.3695,22.3682,
 114.3700,22.3675, 114.3714,22.3668, 114.3718,22.3638, 114.3714,22.3621,
 114.3709,22.3620, 114.3708,22.3616, 114.3676,22.3610, 114.3671,22.3597,
 114.3679,22.3594, 114.3683,22.3587, 114.3695,22.3586, 114.3698,22.3584,
 114.3699,22.3580, 114.3699,22.3576, 114.3699,22.3573, 114.3699,22.3571,
 114.3699,22.3570, 114.3699,22.3570, 114.3699,22.3564, 114.3668,22.3560,
 114.3661,22.3554, 114.3660,22.3547, 114.3652,22.3539, 114.3649,22.3522,
 114.3623,22.3514, 114.3621,22.3511, 114.3607,22.3510, 114.3600,22.3517,
 114.3588,22.3518, 114.3576,22.3533, 114.3566,22.3533, 114.3567,22.3527,
 114.3574,22.3525, 114.3575,22.3519, 114.3584,22.3516, 114.3585,22.3511,
 114.3593,22.3507, 114.3592,22.3501, 114.3586,22.3499, 114.3583,22.3486,
 114.3565,22.3480, 114.3565,22.3476, 114.3559,22.3474, 114.3552,22.3482,
 114.3540,22.3484, 114.3536,22.3490, 114.3528,22.3493, 114.3526,22.3499,
 114.3521,22.3500, 114.3514,22.3457, 114.3510,22.3456, 114.3516,22.3450,
 114.3523,22.3448, 114.3527,22.3421, 114.3523,22.3408, 114.3511,22.3405,
 114.3508,22.3400, 114.3513,22.3397, 114.3535,22.3398, 114.3537,22.3403,
 114.3540,22.3405, 114.3546,22.3405, 114.3546,22.3405, 114.3548,22.3405,
 114.3553,22.3405, 114.3560,22.3405, 114.3570,22.3405, 114.3577,22.3405,
 114.3582,22.3403, 114.3584,22.3402, 114.3585,22.3398, 114.3590,22.3396,
 114.3595,22.3368, 114.3601,22.3362, 114.3609,22.3361, 114.3614,22.3355,
 114.3622,22.3352, 114.3623,22.3346, 114.3633,22.3343, 114.3642,22.3329,
 114.3652,22.3326, 114.3661,22.3313, 114.3689,22.3307, 114.3690,22.3303,
 114.3697,22.3301, 114.3698,22.3294, 114.3691,22.3292, 114.3689,22.3282,
 114.3668,22.3275, 114.3632,22.3279, 114.3631,22.3282, 114.3607,22.3293,
 114.3602,22.3319, 114.3596,22.3328, 114.3601,22.3337, 114.3594,22.3347,
 114.3592,22.3359, 114.3586,22.3354, 114.3584,22.3346, 114.3577,22.3343,
 114.3577,22.3328, 114.3582,22.3326, 114.3584,22.3306, 114.3577,22.3300,
 114.3575,22.3287, 114.3578,22.3284, 114.3584,22.3286, 114.3585,22.3291,
 114.3590,22.3293, 114.3600,22.3287, 114.3605,22.3268, 114.3612,22.3265,
 114.3613,22.3261, 114.3591,22.3258, 114.3556,22.3261, 114.3556,22.3265,
 114.3562,22.3267, 114.3565,22.3283, 114.3562,22.3291, 114.3550,22.3293,
 114.3546,22.3298, 114.3507,22.3302, 114.3498,22.3308, 114.3499,22.3315,
 114.3504,22.3319, 114.3508,22.3346, 114.3504,22.3359, 114.3501,22.3362,
 114.3492,22.3361, 114.3489,22.3359, 114.3489,22.3356, 114.3488,22.3355,
 114.3485,22.3354, 114.3482,22.3353, 114.3477,22.3353, 114.3473,22.3353,
 114.3471,22.3353, 114.3470,22.3353, 114.3470,22.3353, 114.3464,22.3353,
 114.3461,22.3355, 114.3459,22.3360, 114.3452,22.3363, 114.3450,22.3376,
 114.3447,22.3379, 114.3445,22.3379, 114.3443,22.3381, 114.3442,22.3386,
 114.3441,22.3392, 114.3441,22.3414, 114.3441,22.3414, 114.3440,22.3414,
 114.3437,22.3417, 114.3435,22.3419, 114.3432,22.3427, 114.3431,22.3444,
 114.3422,22.3452, 114.3421,22.3462, 114.3413,22.3469, 114.3414,22.3482,
 114.3419,22.3484, 114.3419,22.3485, 114.3418,22.3486, 114.3416,22.3488,
 114.3413,22.3491, 114.3412,22.3492, 114.3412,22.3492, 114.3406,22.3492,
 114.3403,22.3490, 114.3402,22.3485, 114.3387,22.3484, 114.3383,22.3490,
 114.3378,22.3492, 114.3372,22.3475, 114.3365,22.3473, 114.3364,22.3467,
 114.3356,22.3464, 114.3351,22.3458, 114.3337,22.3459, 114.3335,22.3464,
 114.3327,22.3467, 114.3326,22.3473, 114.3319,22.3475, 114.3315,22.3491,
 114.3308,22.3493, 114.3307,22.3499, 114.3301,22.3500, 114.3294,22.3526,
 114.3289,22.3528, 114.3288,22.3533, 114.3280,22.3536, 114.3279,22.3546,
 114.3282,22.3551, 114.3298,22.3555, 114.3297,22.3559, 114.3289,22.3563,
 114.3288,22.3568, 114.3279,22.3571, 114.3279,22.3575, 114.3250,22.3581,
 114.3249,22.3585, 114.3241,22.3588, 114.3240,22.3594, 114.3231,22.3597,
 114.3230,22.3603, 114.3225,22.3604, 114.3222,22.3611, 114.3223,22.3637,
 114.3230,22.3645, 114.3231,22.3667, 114.3240,22.3677, 114.3241,22.3687,
 114.3249,22.3694, 114.3248,22.3707, 114.3241,22.3711, 114.3242,22.3724,
 114.3248,22.3726, 114.3249,22.3739, 114.3246,22.3743, 114.3241,22.3741,
 114.3240,22.3736, 114.3231,22.3736, 114.3230,22.3741, 114.3222,22.3744,
 114.3218,22.3751, 114.3206,22.3752, 114.3197,22.3759, 114.3170,22.3763,
 114.3160,22.3777, 114.3148,22.3778, 114.3144,22.3784, 114.3136,22.3788,
 114.3130,22.3794, 114.3108,22.3793, 114.3106,22.3788, 114.3098,22.3788,
 114.3096,22.3793, 114.3089,22.3796, 114.3086,22.3809, 114.3072,22.3812,
 114.3065,22.3820, 114.3049,22.3824, 114.3050,22.3828, 114.3057,22.3830,
 114.3059,22.3843, 114.3068,22.3850, 114.3070,22.3863, 114.3077,22.3865,
 114.3079,22.3871, 114.3084,22.3872, 114.3088,22.3889, 114.3085,22.3894,
 114.3070,22.3898, 114.3036,22.3895, 114.3031,22.3885, 114.3027,22.3864,
 114.3021,22.3862, 114.3020,22.3857, 114.3013,22.3855, 114.3019,22.3848,
 114.3027,22.3847, 114.3030,22.3830, 114.3021,22.3822, 114.2982,22.3817,
 114.2977,22.3812, 114.2956,22.3814, 114.2953,22.3819, 114.2938,22.3820,
 114.2935,22.3815, 114.2911,22.3812, 114.2899,22.3820, 114.2895,22.3847,
 114.2889,22.3855, 114.2881,22.3855, 114.2874,22.3847, 114.2859,22.3848,
 114.2858,22.3852, 114.2830,22.3858, 114.2829,22.3862, 114.2822,22.3865,
 114.2818,22.3880, 114.2811,22.3883, 114.2810,22.3888, 114.2804,22.3890,
 114.2799,22.3911, 114.2787,22.3916, 114.2770,22.3915, 114.2763,22.3909,
 114.2760,22.3902, 114.2748,22.3898, 114.2724,22.3902, 114.2724,22.3905,
 114.2716,22.3905, 114.2714,22.3900, 114.2709,22.3898, 114.2705,22.3872,
 114.2709,22.3829, 114.2714,22.3828, 114.2713,22.3821, 114.2706,22.3819,
 114.2705,22.3814, 114.2696,22.3810, 114.2695,22.3805, 114.2687,22.3802,
 114.2686,22.3796, 114.2678,22.3794, 114.2677,22.3791, 114.2677,22.3788,
 114.2677,22.3784, 114.2677,22.3781, 114.2677,22.3778, 114.2677,22.3777,
 114.2677,22.3777, 114.2677,22.3766, 114.2678,22.3761, 114.2683,22.3760,
 114.2686,22.3753, 114.2684,22.3728, 114.2677,22.3722, 114.2676,22.3711,
 114.2668,22.3697, 114.2665,22.3683, 114.2659,22.3682, 114.2658,22.3675,
 114.2664,22.3673, 114.2671,22.3644, 114.2686,22.3636, 114.2688,22.3623,
 114.2695,22.3620, 114.2696,22.3614, 114.2705,22.3611, 114.2705,22.3607,
 114.2721,22.3602, 114.2724,22.3591, 114.2724,22.3576, 114.2716,22.3563,
 114.2711,22.3535, 114.2706,22.3533, 114.2705,22.3528, 114.2699,22.3526,
 114.2693,22.3505, 114.2681,22.3500, 114.2658,22.3504, 114.2657,22.3507,
 114.2652,22.3509, 114.2646,22.3530, 114.2621,22.3538, 114.2619,22.3546,
 114.2610,22.3551, 114.2581,22.3554, 114.2572,22.3565, 114.2575,22.3587,
 114.2581,22.3590, 114.2581,22.3598, 114.2587,22.3603, 114.2604,22.3605,
 114.2610,22.3611, 114.2610,22.3618, 114.2619,22.3626, 114.2619,22.3638,
 114.2616,22.3646, 114.2604,22.3647, 114.2599,22.3642, 114.2588,22.3650,
 114.2581,22.3663, 114.2583,22.3674, 114.2588,22.3682, 114.2583,22.3682,
 114.2581,22.3675, 114.2573,22.3672, 114.2570,22.3659, 114.2556,22.3654,
 114.2552,22.3635, 114.2544,22.3627, 114.2545,22.3614, 114.2552,22.3611,
 114.2553,22.3607, 114.2514,22.3601, 114.2518,22.3596, 114.2530,22.3594,
 114.2537,22.3570, 114.2542,22.3568, 114.2544,22.3563, 114.2552,22.3559,
 114.2556,22.3553, 114.2568,22.3552, 114.2572,22.3545, 114.2581,22.3542,
 114.2582,22.3537, 114.2590,22.3533, 114.2591,22.3528, 114.2600,22.3525,
 114.2600,22.3521, 114.2624,22.3515, 114.2629,22.3505, 114.2625,22.3483,
 114.2620,22.3481, 114.2619,22.3476, 114.2612,22.3473, 114.2608,22.3456,
 114.2603,22.3449, 114.2606,22.3448, 114.2611,22.3406, 114.2617,22.3396,
 114.2625,22.3396, 114.2630,22.3389, 114.2637,22.3387, 114.2639,22.3374,
 114.2644,22.3370, 114.2652,22.3319, 114.2657,22.3317, 114.2658,22.3312,
 114.2664,22.3310, 114.2667,22.3303, 114.2665,22.3277, 114.2659,22.3274,
 114.2658,22.3254, 114.2667,22.3244, 114.2705,22.3237, 114.2711,22.3227,
 114.2720,22.3224, 114.2742,22.3225, 114.2744,22.3230, 114.2753,22.3234,
 114.2753,22.3237, 114.2777,22.3241, 114.2789,22.3237, 114.2795,22.3223,
 114.2800,22.3225, 114.2801,22.3230, 114.2810,22.3234, 114.2811,22.3239,
 114.2819,22.3239, 114.2821,22.3234, 114.2826,22.3232, 114.2830,22.3211,
 114.2839,22.3198, 114.2843,22.3163, 114.2848,22.3161, 114.2849,22.3156,
 114.2855,22.3154, 114.2858,22.3138, 114.2855,22.3111, 114.2849,22.3109,
 114.2850,22.3103, 114.2855,22.3102, 114.2859,22.3081, 114.2864,22.3076,
 114.2871,22.3102, 114.2877,22.3104, 114.2878,22.3109, 114.2886,22.3112,
 114.2887,22.3118, 114.2896,22.3121, 114.2897,22.3127, 114.2905,22.3127,
 114.2907,22.3121, 114.2912,22.3119, 114.2919,22.3128, 114.2931,22.3129,
 114.2936,22.3135, 114.2958,22.3136, 114.2969,22.3128, 114.2976,22.3102,
 114.2982,22.3101, 114.2983,22.3095, 114.2991,22.3092, 114.2993,22.3086,
 114.3001,22.3083, 114.3002,22.3078, 114.3010,22.3075, 114.3012,22.3069,
 114.3020,22.3066, 114.3021,22.3061, 114.3028,22.3058, 114.3031,22.3045,
 114.3046,22.3039, 114.3049,22.3025, 114.3046,22.2998, 114.3040,22.2990,
 114.3036,22.2955, 114.3031,22.2953, 114.3030,22.2948, 114.3021,22.2945,
 114.3021,22.2941, 114.2997,22.2937, 114.2979,22.2930, 114.2967,22.2929,
 114.2963,22.2922, 114.2957,22.2920, 114.2954,22.2904, 114.2950,22.2899,
 114.2929,22.2894, 114.2887,22.2898, 114.2883,22.2903, 114.2871,22.2904,
 114.2864,22.2911, 114.2849,22.2915, 114.2849,22.2919, 114.2858,22.2922,
 114.2858,22.2926, 114.2853,22.2929, 114.2831,22.2927, 114.2829,22.2922,
 114.2822,22.2919, 114.2820,22.2910, 114.2824,22.2904, 114.2836,22.2901,
 114.2839,22.2881, 114.2836,22.2871, 114.2824,22.2867, 114.2820,22.2852,
 114.2833,22.2844, 114.2887,22.2839, 114.2887,22.2835, 114.2890,22.2834,
 114.2896,22.2834, 114.2896,22.2834, 114.2897,22.2834, 114.2898,22.2834,
 114.2900,22.2834, 114.2902,22.2834, 114.2904,22.2834, 114.2905,22.2835,
 114.2906,22.2839, 114.2942,22.2843, 114.2963,22.2836, 114.2962,22.2826,
 114.2954,22.2824, 114.2950,22.2817, 114.2938,22.2815, 114.2935,22.2810,
 114.2936,22.2800, 114.2944,22.2798, 114.2945,22.2792, 114.2950,22.2791,
 114.2955,22.2762, 114.2961,22.2756, 114.2969,22.2755, 114.2973,22.2749,
 114.2982,22.2746, 114.2986,22.2739, 114.3005,22.2735, 114.3009,22.2729,
 114.3002,22.2719, 114.3001,22.2707, 114.2993,22.2701, 114.2991,22.2690,
 114.2970,22.2679, 114.2955,22.2680, 114.2952,22.2686, 114.2935,22.2693,
 114.2935,22.2688, 114.2942,22.2685, 114.2944,22.2666, 114.2935,22.2658,
 114.2935,22.2650, 114.2927,22.2645, 114.2904,22.2642, 114.2896,22.2634,
 114.2900,22.2619, 114.2912,22.2616, 114.2916,22.2611, 114.2915,22.2603,
 114.2912,22.2600, 114.2910,22.2600, 114.2908,22.2599, 114.2907,22.2597,
 114.2906,22.2594, 114.2906,22.2589, 114.2906,22.2586, 114.2906,22.2584,
 114.2906,22.2583, 114.2906,22.2583, 114.2906,22.2572, 114.2908,22.2567,
 114.2912,22.2566, 114.2916,22.2549, 114.2912,22.2522, 114.2907,22.2521,
 114.2905,22.2515, 114.2900,22.2514, 114.2893,22.2467, 114.2879,22.2462,
 114.2848,22.2460, 114.2839,22.2452, 114.2836,22.2437, 114.2824,22.2435,
 114.2815,22.2428, 114.2793,22.2429],
[
 114.3169,22.3259, 114.3162,22.3265, 114.3141,22.3266, 114.3132,22.3258,
 114.3126,22.3260, 114.3122,22.3266, 114.3108,22.3270, 114.3106,22.3281,
 114.3098,22.3295, 114.3096,22.3307, 114.3088,22.3321, 114.3087,22.3333,
 114.3079,22.3341, 114.3077,22.3358, 114.3069,22.3376, 114.3070,22.3403,
 114.3076,22.3407, 114.3077,22.3426, 114.3069,22.3434, 114.3068,22.3445,
 114.3062,22.3448, 114.3058,22.3434, 114.3043,22.3431, 114.3036,22.3422,
 114.3031,22.3424, 114.3030,22.3429, 114.3021,22.3433, 114.3020,22.3438,
 114.3012,22.3441, 114.3011,22.3445, 114.2988,22.3449, 114.2982,22.3455,
 114.2981,22.3465, 114.2973,22.3467, 114.2972,22.3473, 114.2965,22.3475,
 114.2963,22.3488, 114.2954,22.3495, 114.2953,22.3506, 114.2945,22.3520,
 114.2946,22.3534, 114.2953,22.3538, 114.2954,22.3549, 114.2969,22.3558,
 114.2972,22.3565, 114.2971,22.3585, 114.2964,22.3590, 114.2965,22.3603,
 114.2972,22.3609, 114.2973,22.3620, 114.2971,22.3629, 114.2964,22.3632,
 114.2955,22.3646, 114.2945,22.3649, 114.2941,22.3656, 114.2929,22.3657,
 114.2924,22.3663, 114.2916,22.3666, 114.2917,22.3673, 114.2922,22.3673,
 114.2924,22.3680, 114.2923,22.3706, 114.2919,22.3708, 114.2916,22.3762,
 114.2919,22.3778, 114.2926,22.3789, 114.2937,22.3795, 114.2973,22.3791,
 114.2976,22.3786, 114.2992,22.3789, 114.2991,22.3793, 114.2983,22.3796,
 114.2984,22.3803, 114.2991,22.3802, 114.2996,22.3795, 114.3007,22.3794,
 114.3012,22.3788, 114.3017,22.3786, 114.3021,22.3791, 114.3035,22.3795,
 114.3062,22.3791, 114.3068,22.3781, 114.3097,22.3774, 114.3098,22.3770,
 114.3103,22.3769, 114.3107,22.3752, 114.3103,22.3725, 114.3099,22.3724,
 114.3099,22.3709, 114.3106,22.3706, 114.3115,22.3692, 114.3122,22.3691,
 114.3127,22.3620, 114.3133,22.3604, 114.3141,22.3604, 114.3148,22.3596,
 114.3160,22.3595, 114.3165,22.3588, 114.3173,22.3585, 114.3174,22.3580,
 114.3182,22.3577, 114.3183,22.3573, 114.3199,22.3568, 114.3202,22.3560,
 114.3202,22.3548, 114.3193,22.3535, 114.3192,22.3508, 114.3184,22.3494,
 114.3182,22.3472, 114.3174,22.3461, 114.3173,22.3445, 114.3165,22.3436,
 114.3164,22.3429, 114.3168,22.3423, 114.3182,22.3419, 114.3184,22.3408,
 114.3192,22.3402, 114.3194,22.3389, 114.3202,22.3386, 114.3203,22.3381,
 114.3210,22.3378, 114.3215,22.3362, 114.3221,22.3362, 114.3221,22.3362,
 114.3222,22.3362, 114.3223,22.3362, 114.3225,22.3362, 114.3227,22.3362,
 114.3229,22.3362, 114.3230,22.3363, 114.3231,22.3369, 114.3239,22.3372,
 114.3242,22.3385, 114.3256,22.3387, 114.3260,22.3381, 114.3268,22.3378,
 114.3270,22.3372, 114.3277,22.3369, 114.3278,22.3349, 114.3275,22.3345,
 114.3264,22.3336, 114.3242,22.3337, 114.3240,22.3343, 114.3234,22.3345,
 114.3227,22.3293, 114.3222,22.3289, 114.3220,22.3279, 114.3202,22.3272,
 114.3202,22.3268, 114.3193,22.3265, 114.3191,22.3260],
[
 114.2868,22.3531, 114.2871,22.3552, 114.2877,22.3554, 114.2877,22.3558,
 114.2843,22.3563, 114.2848,22.3572, 114.2847,22.3586, 114.2843,22.3587,
 114.2838,22.3615, 114.2832,22.3621, 114.2824,22.3622, 114.2819,22.3629,
 114.2811,22.3632, 114.2810,22.3637, 114.2804,22.3639, 114.2800,22.3611,
 114.2794,22.3604, 114.2782,22.3607, 114.2772,22.3625, 114.2773,22.3629,
 114.2781,22.3632, 114.2782,22.3636, 114.2800,22.3642, 114.2801,22.3650,
 114.2797,22.3655, 114.2785,22.3657, 114.2782,22.3662, 114.2797,22.3665,
 114.2801,22.3672, 114.2810,22.3675, 114.2811,22.3680, 114.2816,22.3682,
 114.2824,22.3717, 114.2829,22.3718, 114.2830,22.3724, 114.2839,22.3727,
 114.2845,22.3739, 114.2853,22.3742, 114.2876,22.3741, 114.2881,22.3735,
 114.2893,22.3732, 114.2896,22.3718, 114.2891,22.3710, 114.2871,22.3706,
 114.2881,22.3673, 114.2893,22.3668, 114.2894,22.3664, 114.2890,22.3658,
 114.2902,22.3654, 114.2906,22.3643, 114.2905,22.3628, 114.2899,22.3621,
 114.2887,22.3618, 114.2887,22.3614, 114.2893,22.3613, 114.2900,22.3561,
 114.2904,22.3559, 114.2905,22.3539, 114.2896,22.3521, 114.2891,22.3518,
 114.2873,22.3520],
[
 114.3581,22.3076, 114.3575,22.3078, 114.3575,22.3082, 114.3537,22.3088,
 114.3537,22.3092, 114.3542,22.3094, 114.3546,22.3115, 114.3542,22.3126,
 114.3527,22.3131, 114.3526,22.3135, 114.3519,22.3138, 114.3517,22.3151,
 114.3511,22.3154, 114.3508,22.3197, 114.3513,22.3219, 114.3519,22.3223,
 114.3540,22.3227, 114.3546,22.3237, 114.3564,22.3241, 114.3573,22.3236,
 114.3578,22.3215, 114.3584,22.3213, 114.3585,22.3208, 114.3593,22.3204,
 114.3594,22.3199, 114.3600,22.3197, 114.3607,22.3154, 114.3612,22.3152,
 114.3617,22.3146, 114.3632,22.3142, 114.3631,22.3138, 114.3624,22.3136,
 114.3621,22.3121, 114.3614,22.3118, 114.3613,22.3114, 114.3597,22.3109,
 114.3590,22.3082],
[
 114.3374,22.3140, 114.3366,22.3154, 114.3365,22.3161, 114.3365,22.3171,
 114.3365,22.3171, 114.3364,22.3172, 114.3363,22.3173, 114.3359,22.3177,
 114.3357,22.3178, 114.3357,22.3180, 114.3363,22.3181, 114.3365,22.3183,
 114.3365,22.3189, 114.3365,22.3189, 114.3365,22.3189, 114.3365,22.3190,
 114.3365,22.3192, 114.3365,22.3194, 114.3365,22.3196, 114.3366,22.3197,
 114.3371,22.3197, 114.3375,22.3226, 114.3384,22.3248, 114.3393,22.3251,
 114.3394,22.3256, 114.3402,22.3260, 114.3405,22.3265, 114.3427,22.3266,
 114.3440,22.3260, 114.3442,22.3265, 114.3450,22.3268, 114.3451,22.3272,
 114.3474,22.3275, 114.3486,22.3272, 114.3488,22.3261, 114.3480,22.3255,
 114.3477,22.3242, 114.3470,22.3239, 114.3469,22.3234, 114.3461,22.3230,
 114.3459,22.3225, 114.3454,22.3223, 114.3447,22.3177, 114.3432,22.3170,
 114.3431,22.3166, 114.3405,22.3158, 114.3401,22.3142, 114.3392,22.3137],
[
 114.2906,22.3227, 114.2901,22.3231, 114.2877,22.3235, 114.2877,22.3239,
 114.2867,22.3242, 114.2858,22.3256, 114.2852,22.3258, 114.2848,22.3279,
 114.2840,22.3287, 114.2841,22.3300, 114.2845,22.3301, 114.2852,22.3326,
 114.2877,22.3334, 114.2878,22.3329, 114.2890,22.3324, 114.2903,22.3313,
 114.2915,22.3308, 114.2924,22.3294, 114.2934,22.3291, 114.2935,22.3286,
 114.2944,22.3282, 114.2945,22.3277, 114.2950,22.3275, 114.2954,22.3259,
 114.2950,22.3229, 114.2938,22.3224],
[
 114.3182,22.3644, 114.3174,22.3652, 114.3173,22.3669, 114.3165,22.3677,
 114.3160,22.3691, 114.3156,22.3690, 114.3151,22.3687, 114.3147,22.3684,
 114.3145,22.3683, 114.3145,22.3682, 114.3145,22.3682, 114.3144,22.3683,
 114.3141,22.3685, 114.3139,22.3687, 114.3137,22.3690, 114.3136,22.3692,
 114.3135,22.3694, 114.3135,22.3696, 114.3135,22.3698, 114.3133,22.3699,
 114.3126,22.3701, 114.3122,22.3708, 114.3107,22.3711, 114.3107,22.3715,
 114.3113,22.3717, 114.3119,22.3752, 114.3130,22.3760, 114.3154,22.3757,
 114.3160,22.3752, 114.3183,22.3748, 114.3184,22.3744, 114.3192,22.3741,
 114.3193,22.3736, 114.3202,22.3732, 114.3202,22.3729, 114.3218,22.3723,
 114.3221,22.3709, 114.3220,22.3690, 114.3214,22.3682, 114.3205,22.3680,
 114.3210,22.3673, 114.3210,22.3649, 114.3203,22.3646, 114.3202,22.3640,
 114.3185,22.3633],
[
 114.3387,22.2566, 114.3380,22.2574, 114.3368,22.2575, 114.3364,22.2581,
 114.3359,22.2583, 114.3355,22.2604, 114.3359,22.2615, 114.3374,22.2621,
 114.3380,22.2632, 114.3407,22.2636, 114.3411,22.2640, 114.3416,22.2661,
 114.3421,22.2662, 114.3425,22.2669, 114.3434,22.2669, 114.3440,22.2663,
 114.3442,22.2641, 114.3447,22.2635, 114.3451,22.2619, 114.3447,22.2588,
 114.3434,22.2583, 114.3403,22.2580, 114.3402,22.2576, 114.3394,22.2573,
 114.3393,22.2567],
[
 114.3349,22.2673, 114.3354,22.2681, 114.3356,22.2693, 114.3364,22.2707,
 114.3366,22.2720, 114.3374,22.2723, 114.3375,22.2728, 114.3383,22.2732,
 114.3384,22.2737, 114.3391,22.2740, 114.3394,22.2753, 114.3415,22.2764,
 114.3428,22.2762, 114.3431,22.2748, 114.3428,22.2721, 114.3422,22.2720,
 114.3421,22.2714, 114.3416,22.2713, 114.3409,22.2678, 114.3403,22.2676,
 114.3403,22.2673, 114.3392,22.2670],
[
 114.3048,22.2779, 114.3034,22.2784, 114.3030,22.2792, 114.3034,22.2808,
 114.3039,22.2810, 114.3043,22.2816, 114.3055,22.2817, 114.3059,22.2824,
 114.3068,22.2824, 114.3077,22.2810, 114.3084,22.2808, 114.3087,22.2801,
 114.3086,22.2775, 114.3079,22.2772, 114.3078,22.2768, 114.3060,22.2765,
 114.3051,22.2768],
[
 114.2752,22.3760, 114.2730,22.3763, 114.2724,22.3776, 114.2717,22.3778,
 114.2713,22.3794, 114.2706,22.3796, 114.2705,22.3800, 114.2733,22.3810,
 114.2735,22.3805, 114.2743,22.3802, 114.2747,22.3795, 114.2756,22.3795,
 114.2761,22.3788, 114.2763,22.3773, 114.2757,22.3762],
[
 114.3747,22.3974, 114.3746,22.3982, 114.3738,22.3990, 114.3737,22.4001,
 114.3741,22.4009, 114.3753,22.4012, 114.3757,22.4018, 114.3762,22.4020,
 114.3766,22.3999, 114.3775,22.3989, 114.3774,22.3973, 114.3765,22.3968,
 114.3752,22.3969],
[
 114.2782,22.3710, 114.2782,22.3713, 114.2766,22.3718, 114.2763,22.3733,
 114.2766,22.3741, 114.2782,22.3746, 114.2782,22.3750, 114.2791,22.3753,
 114.2792,22.3758, 114.2797,22.3760, 114.2801,22.3744, 114.2797,22.3717,
 114.2792,22.3715, 114.2791,22.3710],
[
 114.3607,22.2670, 114.3603,22.2676, 114.3594,22.2680, 114.3593,22.2685,
 114.3588,22.2687, 114.3584,22.2703, 114.3588,22.2711, 114.3591,22.2713,
 114.3603,22.2713, 114.3603,22.2713, 114.3605,22.2712, 114.3607,22.2709,
 114.3615,22.2702, 114.3621,22.2692, 114.3623,22.2679, 114.3619,22.2671],
[
 114.2826,22.3751, 114.2821,22.3753, 114.2816,22.3759, 114.2804,22.3761,
 114.2800,22.3767, 114.2792,22.3770, 114.2791,22.3774, 114.2804,22.3794,
 114.2819,22.3793, 114.2821,22.3788, 114.2828,22.3784, 114.2829,22.3758],
[
 114.4179,22.4574, 114.4163,22.4577, 114.4157,22.4589, 114.4152,22.4591,
 114.4148,22.4607, 114.4152,22.4617, 114.4157,22.4615, 114.4161,22.4609,
 114.4175,22.4605, 114.4177,22.4594, 114.4186,22.4588, 114.4185,22.4577]],
 SSP:[
[
 114.1390,22.3163, 114.1368,22.3175, 114.1368,22.3182, 114.1354,22.3188,
 114.1306,22.3192, 114.1296,22.3198, 114.1291,22.3208, 114.1295,22.3241,
 114.1302,22.3242, 114.1314,22.3257, 114.1326,22.3259, 114.1338,22.3274,
 114.1348,22.3277, 114.1349,22.3282, 114.1358,22.3286, 114.1359,22.3291,
 114.1364,22.3293, 114.1368,22.3320, 114.1364,22.3336, 114.1359,22.3337,
 114.1355,22.3344, 114.1343,22.3345, 114.1339,22.3352, 114.1331,22.3354,
 114.1328,22.3369, 114.1321,22.3372, 114.1319,22.3378, 114.1311,22.3381,
 114.1310,22.3386, 114.1303,22.3388, 114.1301,22.3391, 114.1301,22.3396,
 114.1301,22.3396, 114.1301,22.3398, 114.1301,22.3400, 114.1301,22.3403,
 114.1301,22.3407, 114.1302,22.3411, 114.1305,22.3413, 114.1317,22.3414,
 114.1322,22.3421, 114.1343,22.3422, 114.1349,22.3417, 114.1374,22.3414,
 114.1419,22.3417, 114.1426,22.3429, 114.1433,22.3432, 114.1437,22.3447,
 114.1444,22.3450, 114.1448,22.3456, 114.1460,22.3458, 114.1463,22.3462,
 114.1559,22.3469, 114.1563,22.3474, 114.1574,22.3475, 114.1582,22.3482,
 114.1596,22.3481, 114.1601,22.3475, 114.1613,22.3474, 114.1616,22.3469,
 114.1678,22.3465, 114.1693,22.3459, 114.1692,22.3452, 114.1684,22.3445,
 114.1685,22.3432, 114.1692,22.3428, 114.1694,22.3415, 114.1702,22.3412,
 114.1703,22.3407, 114.1708,22.3405, 114.1712,22.3384, 114.1718,22.3379,
 114.1721,22.3360, 114.1718,22.3327, 114.1712,22.3322, 114.1708,22.3301,
 114.1703,22.3300, 114.1702,22.3294, 114.1693,22.3291, 114.1692,22.3286,
 114.1687,22.3289, 114.1629,22.3293, 114.1597,22.3289, 114.1594,22.3284,
 114.1582,22.3283, 114.1577,22.3277, 114.1569,22.3274, 114.1568,22.3268,
 114.1560,22.3265, 114.1559,22.3261, 114.1497,22.3257, 114.1483,22.3251,
 114.1481,22.3244, 114.1475,22.3241, 114.1463,22.3244, 114.1455,22.3256,
 114.1445,22.3260, 114.1444,22.3265, 114.1435,22.3268, 114.1434,22.3274,
 114.1419,22.3275, 114.1408,22.3268, 114.1406,22.3261, 114.1422,22.3257,
 114.1444,22.3229, 114.1444,22.3225, 114.1435,22.3222, 114.1434,22.3216,
 114.1426,22.3213, 114.1425,22.3208, 114.1416,22.3204, 114.1415,22.3199,
 114.1408,22.3197, 114.1415,22.3182, 114.1408,22.3179, 114.1405,22.3166]],
 ST:[
[
 114.1441,22.3448, 114.1435,22.3450, 114.1434,22.3455, 114.1426,22.3459,
 114.1425,22.3464, 114.1417,22.3467, 114.1414,22.3482, 114.1407,22.3485,
 114.1405,22.3490, 114.1397,22.3493, 114.1396,22.3499, 114.1391,22.3500,
 114.1386,22.3536, 114.1378,22.3555, 114.1379,22.3570, 114.1386,22.3581,
 114.1389,22.3594, 114.1396,22.3597, 114.1397,22.3603, 114.1404,22.3605,
 114.1407,22.3618, 114.1415,22.3626, 114.1414,22.3646, 114.1408,22.3649,
 114.1407,22.3669, 114.1415,22.3677, 114.1416,22.3687, 114.1425,22.3696,
 114.1423,22.3715, 114.1416,22.3718, 114.1416,22.3722, 114.1423,22.3733,
 114.1426,22.3741, 114.1434,22.3744, 114.1435,22.3750, 114.1441,22.3751,
 114.1448,22.3777, 114.1453,22.3779, 114.1454,22.3784, 114.1463,22.3788,
 114.1464,22.3793, 114.1472,22.3796, 114.1474,22.3802, 114.1482,22.3805,
 114.1483,22.3809, 114.1507,22.3813, 114.1539,22.3832, 114.1541,22.3843,
 114.1559,22.3850, 114.1567,22.3862, 114.1577,22.3867, 114.1580,22.3880,
 114.1587,22.3883, 114.1588,22.3888, 114.1597,22.3891, 114.1598,22.3897,
 114.1608,22.3900, 114.1617,22.3914, 114.1622,22.3916, 114.1626,22.3959,
 114.1635,22.3989, 114.1635,22.4020, 114.1632,22.4046, 114.1626,22.4047,
 114.1617,22.4067, 114.1616,22.4079, 114.1625,22.4087, 114.1664,22.4092,
 114.1668,22.4097, 114.1680,22.4098, 114.1687,22.4106, 114.1699,22.4107,
 114.1702,22.4112, 114.1788,22.4118, 114.1792,22.4123, 114.1804,22.4124,
 114.1808,22.4131, 114.1816,22.4134, 114.1817,22.4138, 114.1922,22.4144,
 114.1923,22.4148, 114.1931,22.4151, 114.1932,22.4156, 114.1937,22.4158,
 114.1945,22.4193, 114.1950,22.4194, 114.1951,22.4200, 114.1975,22.4210,
 114.1993,22.4211, 114.2002,22.4218, 114.2014,22.4219, 114.2021,22.4227,
 114.2035,22.4229, 114.2037,22.4234, 114.2055,22.4226, 114.2064,22.4212,
 114.2074,22.4208, 114.2075,22.4205, 114.2113,22.4198, 114.2112,22.4194,
 114.2107,22.4193, 114.2100,22.4115, 114.2096,22.4113, 114.2095,22.4086,
 114.2098,22.4077, 114.2112,22.4070, 114.2123,22.4049, 114.2141,22.4046,
 114.2149,22.4049, 114.2149,22.4062, 114.2142,22.4065, 114.2143,22.4071,
 114.2148,22.4072, 114.2152,22.4100, 114.2160,22.4109, 114.2161,22.4120,
 114.2167,22.4124, 114.2174,22.4184, 114.2179,22.4186, 114.2181,22.4191,
 114.2186,22.4193, 114.2193,22.4219, 114.2198,22.4220, 114.2200,22.4226,
 114.2208,22.4229, 114.2209,22.4234, 114.2218,22.4238, 114.2218,22.4241,
 114.2275,22.4248, 114.2279,22.4253, 114.2291,22.4254, 114.2298,22.4261,
 114.2310,22.4263, 114.2314,22.4269, 114.2321,22.4272, 114.2323,22.4285,
 114.2315,22.4295, 114.2308,22.4297, 114.2304,22.4313, 114.2309,22.4321,
 114.2327,22.4323, 114.2333,22.4328, 114.2363,22.4331, 114.2378,22.4328,
 114.2382,22.4317, 114.2388,22.4314, 114.2398,22.4316, 114.2400,22.4320,
 114.2428,22.4311, 114.2428,22.4307, 114.2419,22.4304, 114.2419,22.4300,
 114.2400,22.4293, 114.2400,22.4290, 114.2409,22.4286, 114.2410,22.4281,
 114.2415,22.4279, 114.2422,22.4227, 114.2425,22.4227, 114.2428,22.4189,
 114.2425,22.4167, 114.2422,22.4167, 114.2419,22.4144, 114.2422,22.4106,
 114.2428,22.4105, 114.2429,22.4099, 114.2436,22.4096, 114.2438,22.4083,
 114.2447,22.4074, 114.2448,22.4052, 114.2456,22.4041, 114.2458,22.4025,
 114.2463,22.4020, 114.2467,22.3987, 114.2463,22.3968, 114.2458,22.3961,
 114.2459,22.3935, 114.2464,22.3933, 114.2461,22.3928, 114.2455,22.3868,
 114.2446,22.3855, 114.2434,22.3855, 114.2425,22.3847, 114.2413,22.3846,
 114.2409,22.3839, 114.2403,22.3838, 114.2396,22.3812, 114.2391,22.3810,
 114.2389,22.3805, 114.2381,22.3802, 114.2380,22.3796, 114.2372,22.3793,
 114.2370,22.3788, 114.2362,22.3784, 114.2361,22.3779, 114.2354,22.3776,
 114.2350,22.3761, 114.2343,22.3758, 114.2342,22.3753, 114.2333,22.3750,
 114.2332,22.3744, 114.2324,22.3741, 114.2320,22.3735, 114.2308,22.3733,
 114.2301,22.3726, 114.2289,22.3725, 114.2281,22.3717, 114.2269,22.3716,
 114.2266,22.3711, 114.2218,22.3705, 114.2218,22.3701, 114.2209,22.3698,
 114.2208,22.3692, 114.2201,22.3690, 114.2198,22.3677, 114.2190,22.3670,
 114.2188,22.3657, 114.2181,22.3654, 114.2179,22.3649, 114.2174,22.3647,
 114.2167,22.3592, 114.2152,22.3587, 114.2113,22.3584, 114.2109,22.3579,
 114.2098,22.3578, 114.2090,22.3570, 114.2078,22.3569, 114.2071,22.3561,
 114.2059,22.3560, 114.2056,22.3555, 114.1951,22.3549, 114.1950,22.3545,
 114.1940,22.3542, 114.1923,22.3533, 114.1920,22.3528, 114.1911,22.3526,
 114.1899,22.3527, 114.1890,22.3535, 114.1884,22.3533, 114.1884,22.3530,
 114.1866,22.3523, 114.1863,22.3512, 114.1849,22.3508, 114.1846,22.3504,
 114.1790,22.3499, 114.1748,22.3484, 114.1693,22.3480, 114.1687,22.3469,
 114.1641,22.3466, 114.1616,22.3469, 114.1613,22.3474, 114.1601,22.3475,
 114.1596,22.3481, 114.1582,22.3482, 114.1574,22.3475, 114.1563,22.3474,
 114.1559,22.3469, 114.1463,22.3462, 114.1460,22.3458, 114.1448,22.3456]],
 TM:[
[
 113.9572,22.3540, 113.9534,22.3547, 113.9533,22.3551, 113.9521,22.3555,
 113.9508,22.3566, 113.9501,22.3570, 113.9499,22.3570, 113.9497,22.3570,
 113.9496,22.3570, 113.9495,22.3570, 113.9495,22.3570, 113.9483,22.3570,
 113.9480,22.3570, 113.9477,22.3571, 113.9476,22.3573, 113.9476,22.3577,
 113.9468,22.3585, 113.9458,22.3588, 113.9454,22.3595, 113.9442,22.3596,
 113.9437,22.3603, 113.9429,22.3606, 113.9428,22.3611, 113.9421,22.3613,
 113.9427,22.3621, 113.9427,22.3638, 113.9420,22.3640, 113.9418,22.3646,
 113.9410,22.3649, 113.9409,22.3654, 113.9403,22.3656, 113.9399,22.3634,
 113.9391,22.3619, 113.9388,22.3605, 113.9381,22.3603, 113.9377,22.3596,
 113.9363,22.3597, 113.9361,22.3603, 113.9356,22.3604, 113.9353,22.3611,
 113.9354,22.3637, 113.9361,22.3644, 113.9362,22.3655, 113.9358,22.3663,
 113.9346,22.3664, 113.9337,22.3657, 113.9314,22.3653, 113.9313,22.3649,
 113.9291,22.3639, 113.9286,22.3640, 113.9282,22.3647, 113.9270,22.3648,
 113.9262,22.3656, 113.9251,22.3657, 113.9246,22.3663, 113.9238,22.3666,
 113.9237,22.3672, 113.9231,22.3673, 113.9224,22.3708, 113.9219,22.3706,
 113.9218,22.3701, 113.9209,22.3698, 113.9208,22.3692, 113.9200,22.3692,
 113.9199,22.3698, 113.9191,22.3700, 113.9188,22.3717, 113.9179,22.3732,
 113.9174,22.3734, 113.9171,22.3756, 113.9174,22.3766, 113.9186,22.3769,
 113.9193,22.3777, 113.9205,22.3778, 113.9209,22.3784, 113.9215,22.3786,
 113.9219,22.3807, 113.9224,22.3812, 113.9228,22.3850, 113.9224,22.3869,
 113.9221,22.3872, 113.9212,22.3873, 113.9205,22.3881, 113.9193,22.3882,
 113.9186,22.3889, 113.9178,22.3890, 113.9172,22.3896, 113.9170,22.3918,
 113.9162,22.3929, 113.9163,22.3949, 113.9167,22.3950, 113.9171,22.3972,
 113.9163,22.3983, 113.9132,22.3988, 113.9132,22.3992, 113.9123,22.3995,
 113.9123,22.3999, 113.9065,22.4006, 113.9065,22.4009, 113.9055,22.4013,
 113.9046,22.4027, 113.9037,22.4030, 113.9037,22.4034, 113.9039,22.4036,
 113.9046,22.4039, 113.9047,22.4044, 113.9055,22.4047, 113.9056,22.4053,
 113.9064,22.4055, 113.9067,22.4070, 113.9074,22.4073, 113.9079,22.4083,
 113.9094,22.4103, 113.9112,22.4109, 113.9114,22.4120, 113.9132,22.4127,
 113.9133,22.4131, 113.9141,22.4134, 113.9142,22.4139, 113.9151,22.4142,
 113.9152,22.4148, 113.9157,22.4149, 113.9165,22.4175, 113.9170,22.4177,
 113.9171,22.4181, 113.9194,22.4185, 113.9205,22.4192, 113.9222,22.4193,
 113.9231,22.4201, 113.9243,22.4202, 113.9249,22.4208, 113.9270,22.4210,
 113.9283,22.4202, 113.9314,22.4205, 113.9319,22.4210, 113.9343,22.4213,
 113.9343,22.4217, 113.9351,22.4220, 113.9352,22.4224, 113.9382,22.4227,
 113.9400,22.4224, 113.9400,22.4220, 113.9408,22.4218, 113.9408,22.4202,
 113.9402,22.4201, 113.9400,22.4194, 113.9408,22.4192, 113.9411,22.4179,
 113.9425,22.4176, 113.9429,22.4182, 113.9437,22.4186, 113.9439,22.4191,
 113.9447,22.4194, 113.9448,22.4200, 113.9457,22.4203, 113.9458,22.4208,
 113.9465,22.4211, 113.9467,22.4224, 113.9476,22.4231, 113.9477,22.4241,
 113.9485,22.4248, 113.9486,22.4259, 113.9495,22.4265, 113.9496,22.4276,
 113.9511,22.4285, 113.9622,22.4288, 113.9686,22.4285, 113.9692,22.4280,
 113.9710,22.4279, 113.9719,22.4271, 113.9731,22.4270, 113.9734,22.4265,
 113.9836,22.4262, 113.9897,22.4265, 113.9900,22.4270, 113.9912,22.4271,
 113.9921,22.4279, 113.9943,22.4278, 113.9953,22.4266, 113.9952,22.4246,
 113.9945,22.4241, 113.9946,22.4228, 113.9950,22.4227, 113.9958,22.4203,
 113.9969,22.4201, 113.9973,22.4196, 114.0040,22.4189, 114.0041,22.4186,
 114.0061,22.4173, 114.0067,22.4161, 114.0072,22.4132, 114.0078,22.4131,
 114.0082,22.4124, 114.0094,22.4123, 114.0098,22.4116, 114.0105,22.4114,
 114.0107,22.4101, 114.0113,22.4098, 114.0120,22.4046, 114.0125,22.4042,
 114.0126,22.4035, 114.0258,22.4028, 114.0479,22.4032, 114.0480,22.4035,
 114.0488,22.4039, 114.0490,22.4044, 114.0498,22.4047, 114.0498,22.4051,
 114.0546,22.4054, 114.0575,22.4048, 114.0573,22.4036, 114.0565,22.4021,
 114.0558,22.4019, 114.0555,22.4006, 114.0547,22.3996, 114.0548,22.3970,
 114.0555,22.3966, 114.0556,22.3961, 114.0565,22.3957, 114.0565,22.3954,
 114.0623,22.3947, 114.0623,22.3943, 114.0629,22.3942, 114.0636,22.3907,
 114.0640,22.3906, 114.0640,22.3891, 114.0633,22.3888, 114.0632,22.3883,
 114.0626,22.3881, 114.0619,22.3852, 114.0604,22.3845, 114.0604,22.3841,
 114.0510,22.3829, 114.0489,22.3832, 114.0488,22.3836, 114.0473,22.3837,
 114.0454,22.3829, 114.0447,22.3795, 114.0442,22.3793, 114.0439,22.3788,
 114.0418,22.3786, 114.0413,22.3791, 114.0395,22.3795, 114.0365,22.3791,
 114.0364,22.3788, 114.0356,22.3784, 114.0355,22.3779, 114.0333,22.3769,
 114.0321,22.3768, 114.0316,22.3762, 114.0309,22.3758, 114.0308,22.3739,
 114.0316,22.3731, 114.0319,22.3718, 114.0326,22.3715, 114.0327,22.3710,
 114.0334,22.3707, 114.0336,22.3697, 114.0341,22.3692, 114.0365,22.3687,
 114.0365,22.3684, 114.0372,22.3681, 114.0372,22.3666, 114.0365,22.3663,
 114.0365,22.3659, 114.0336,22.3653, 114.0335,22.3649, 114.0327,22.3646,
 114.0326,22.3640, 114.0318,22.3637, 114.0298,22.3607, 114.0280,22.3601,
 114.0277,22.3588, 114.0270,22.3585, 114.0269,22.3580, 114.0263,22.3578,
 114.0256,22.3535, 114.0251,22.3537, 114.0250,22.3540, 114.0202,22.3547,
 114.0199,22.3552, 114.0187,22.3553, 114.0175,22.3569, 114.0172,22.3586,
 114.0165,22.3588, 114.0164,22.3594, 114.0155,22.3597, 114.0154,22.3603,
 114.0146,22.3606, 114.0144,22.3611, 114.0139,22.3613, 114.0135,22.3607,
 114.0118,22.3604, 114.0109,22.3607, 114.0105,22.3620, 114.0098,22.3623,
 114.0094,22.3630, 114.0079,22.3629, 114.0075,22.3622, 114.0062,22.3621,
 114.0051,22.3614, 114.0049,22.3607, 114.0028,22.3604, 113.9992,22.3607,
 113.9992,22.3611, 113.9983,22.3614, 113.9979,22.3621, 113.9967,22.3622,
 113.9958,22.3630, 113.9931,22.3633, 113.9925,22.3646, 113.9916,22.3649,
 113.9912,22.3656, 113.9904,22.3656, 113.9898,22.3653, 113.9895,22.3640,
 113.9888,22.3637, 113.9886,22.3632, 113.9878,22.3629, 113.9878,22.3625,
 113.9839,22.3618, 113.9836,22.3613, 113.9824,22.3611, 113.9818,22.3592,
 113.9806,22.3587, 113.9782,22.3590, 113.9781,22.3594, 113.9776,22.3596,
 113.9769,22.3630, 113.9763,22.3632, 113.9762,22.3637, 113.9754,22.3640,
 113.9753,22.3644, 113.9725,22.3651, 113.9724,22.3654, 113.9716,22.3658,
 113.9714,22.3663, 113.9709,22.3665, 113.9704,22.3630, 113.9695,22.3621,
 113.9682,22.3621, 113.9668,22.3613, 113.9629,22.3610, 113.9630,22.3606,
 113.9640,22.3603, 113.9649,22.3588, 113.9656,22.3586, 113.9656,22.3571,
 113.9649,22.3566, 113.9646,22.3555, 113.9637,22.3552, 113.9625,22.3553,
 113.9620,22.3559, 113.9618,22.3568, 113.9611,22.3571, 113.9606,22.3578,
 113.9594,22.3577, 113.9591,22.3568, 113.9594,22.3552, 113.9599,22.3552,
 113.9600,22.3545, 113.9591,22.3542, 113.9590,22.3537, 113.9575,22.3535],
[
 113.8845,22.3680, 113.8840,22.3682, 113.8837,22.3689, 113.8838,22.3715,
 113.8842,22.3717, 113.8846,22.3744, 113.8842,22.3757, 113.8830,22.3761,
 113.8823,22.3768, 113.8815,22.3769, 113.8809,22.3777, 113.8807,22.3796,
 113.8815,22.3809, 113.8822,22.3812, 113.8846,22.3809, 113.8846,22.3805,
 113.8855,22.3802, 113.8855,22.3798, 113.8893,22.3791, 113.8894,22.3788,
 113.8902,22.3781, 113.8901,22.3762, 113.8888,22.3755, 113.8885,22.3747,
 113.8886,22.3727, 113.8892,22.3724, 113.8893,22.3711, 113.8885,22.3703,
 113.8880,22.3682, 113.8869,22.3674, 113.8848,22.3675],
[
 113.9811,22.3355, 113.9814,22.3388, 113.9820,22.3393, 113.9821,22.3409,
 113.9829,22.3417, 113.9833,22.3431, 113.9839,22.3428, 113.9840,22.3417,
 113.9848,22.3411, 113.9851,22.3398, 113.9858,22.3395, 113.9857,22.3388,
 113.9849,22.3386, 113.9848,22.3381, 113.9843,22.3379, 113.9836,22.3353,
 113.9830,22.3352, 113.9829,22.3346, 113.9821,22.3343, 113.9820,22.3337,
 113.9814,22.3336],
[
 113.8893,22.3519, 113.8897,22.3532, 113.8913,22.3538, 113.8913,22.3542,
 113.8922,22.3542, 113.8923,22.3537, 113.8930,22.3534, 113.8931,22.3532,
 113.8932,22.3528, 113.8932,22.3524, 113.8932,22.3521, 113.8932,22.3519,
 113.8932,22.3518, 113.8932,22.3518, 113.8932,22.3512, 113.8930,22.3510,
 113.8923,22.3507, 113.8919,22.3501, 113.8907,22.3500, 113.8902,22.3493,
 113.8897,22.3492]],
 TP:[
[
 114.1524,22.4081, 114.1521,22.4086, 114.1431,22.4092, 114.1425,22.4105,
 114.1416,22.4108, 114.1415,22.4113, 114.1407,22.4116, 114.1406,22.4120,
 114.1251,22.4126, 114.1227,22.4132, 114.1215,22.4140, 114.1211,22.4167,
 114.1206,22.4168, 114.1205,22.4174, 114.1198,22.4177, 114.1194,22.4192,
 114.1187,22.4194, 114.1186,22.4200, 114.1177,22.4203, 114.1176,22.4208,
 114.1169,22.4211, 114.1165,22.4226, 114.1158,22.4229, 114.1157,22.4234,
 114.1149,22.4238, 114.1148,22.4243, 114.1142,22.4245, 114.1135,22.4297,
 114.1130,22.4300, 114.1128,22.4311, 114.1120,22.4317, 114.1118,22.4330,
 114.1111,22.4333, 114.1109,22.4338, 114.1104,22.4340, 114.1100,22.4368,
 114.1091,22.4378, 114.1093,22.4391, 114.1100,22.4397, 114.1104,22.4418,
 114.1109,22.4419, 114.1111,22.4425, 114.1119,22.4428, 114.1120,22.4433,
 114.1127,22.4436, 114.1131,22.4451, 114.1138,22.4454, 114.1139,22.4459,
 114.1148,22.4463, 114.1149,22.4468, 114.1156,22.4471, 114.1158,22.4484,
 114.1176,22.4497, 114.1177,22.4503, 114.1185,22.4505, 114.1188,22.4521,
 114.1195,22.4523, 114.1196,22.4529, 114.1214,22.4542, 114.1217,22.4555,
 114.1224,22.4558, 114.1225,22.4563, 114.1231,22.4565, 114.1238,22.4600,
 114.1243,22.4601, 114.1247,22.4608, 114.1259,22.4609, 114.1263,22.4615,
 114.1272,22.4618, 114.1272,22.4622, 114.1312,22.4627, 114.1348,22.4644,
 114.1349,22.4650, 114.1358,22.4653, 114.1362,22.4660, 114.1374,22.4661,
 114.1378,22.4667, 114.1386,22.4670, 114.1387,22.4674, 114.1416,22.4681,
 114.1416,22.4684, 114.1425,22.4688, 114.1425,22.4692, 114.1443,22.4698,
 114.1446,22.4711, 114.1453,22.4714, 114.1454,22.4719, 114.1463,22.4722,
 114.1464,22.4728, 114.1476,22.4733, 114.1501,22.4750, 114.1500,22.4763,
 114.1493,22.4767, 114.1491,22.4778, 114.1483,22.4786, 114.1484,22.4806,
 114.1491,22.4809, 114.1492,22.4813, 114.1568,22.4819, 114.1572,22.4824,
 114.1586,22.4823, 114.1591,22.4816, 114.1603,22.4815, 114.1608,22.4802,
 114.1635,22.4795, 114.1639,22.4791, 114.1651,22.4789, 114.1658,22.4782,
 114.1672,22.4783, 114.1674,22.4788, 114.1683,22.4792, 114.1684,22.4797,
 114.1689,22.4799, 114.1696,22.4825, 114.1702,22.4826, 114.1703,22.4832,
 114.1710,22.4834, 114.1713,22.4847, 114.1731,22.4854, 114.1733,22.4860,
 114.1743,22.4867, 114.1756,22.4868, 114.1763,22.4876, 114.1775,22.4877,
 114.1779,22.4882, 114.1800,22.4885, 114.1836,22.4882, 114.1840,22.4877,
 114.1852,22.4876, 114.1855,22.4871, 114.1912,22.4865, 114.1913,22.4861,
 114.1928,22.4854, 114.1979,22.4847, 114.1983,22.4842, 114.1995,22.4841,
 114.1998,22.4836, 114.2113,22.4830, 114.2118,22.4825, 114.2136,22.4824,
 114.2142,22.4819, 114.2160,22.4816, 114.2189,22.4819, 114.2190,22.4823,
 114.2198,22.4826, 114.2200,22.4832, 114.2208,22.4835, 114.2209,22.4840,
 114.2218,22.4844, 114.2222,22.4850, 114.2234,22.4851, 114.2238,22.4858,
 114.2245,22.4860, 114.2249,22.4875, 114.2256,22.4878, 114.2257,22.4884,
 114.2265,22.4887, 114.2274,22.4901, 114.2284,22.4904, 114.2289,22.4911,
 114.2301,22.4912, 114.2308,22.4919, 114.2322,22.4923, 114.2325,22.4936,
 114.2332,22.4939, 114.2333,22.4944, 114.2342,22.4947, 114.2346,22.4954,
 114.2360,22.4953, 114.2362,22.4947, 114.2370,22.4944, 114.2372,22.4939,
 114.2380,22.4935, 114.2381,22.4930, 114.2389,22.4927, 114.2391,22.4921,
 114.2399,22.4918, 114.2400,22.4913, 114.2409,22.4910, 114.2410,22.4904,
 114.2417,22.4901, 114.2421,22.4886, 114.2428,22.4884, 114.2429,22.4878,
 114.2437,22.4875, 114.2441,22.4868, 114.2453,22.4867, 114.2457,22.4862,
 114.2507,22.4859, 114.2591,22.4862, 114.2594,22.4867, 114.2606,22.4868,
 114.2610,22.4875, 114.2619,22.4878, 114.2619,22.4882, 114.2696,22.4888,
 114.2696,22.4892, 114.2711,22.4899, 114.2745,22.4902, 114.2763,22.4899,
 114.2766,22.4894, 114.2778,22.4893, 114.2785,22.4886, 114.2797,22.4885,
 114.2804,22.4877, 114.2816,22.4876, 114.2824,22.4868, 114.2836,22.4867,
 114.2840,22.4861, 114.2848,22.4858, 114.2852,22.4851, 114.2864,22.4850,
 114.2868,22.4844, 114.2892,22.4834, 114.2910,22.4833, 114.2919,22.4825,
 114.2931,22.4824, 114.2935,22.4818, 114.2941,22.4816, 114.2963,22.4826,
 114.2967,22.4833, 114.2979,22.4834, 114.2983,22.4840, 114.2991,22.4844,
 114.2996,22.4850, 114.3007,22.4851, 114.3012,22.4858, 114.3020,22.4861,
 114.3024,22.4867, 114.3036,22.4868, 114.3040,22.4871, 114.3040,22.4875,
 114.3050,22.4878, 114.3068,22.4887, 114.3069,22.4892, 114.3077,22.4895,
 114.3079,22.4901, 114.3087,22.4904, 114.3088,22.4910, 114.3096,22.4913,
 114.3101,22.4919, 114.3113,22.4920, 114.3117,22.4927, 114.3125,22.4930,
 114.3126,22.4934, 114.3149,22.4938, 114.3160,22.4945, 114.3178,22.4946,
 114.3196,22.4954, 114.3202,22.4953, 114.3203,22.4947, 114.3210,22.4945,
 114.3211,22.4944, 114.3212,22.4943, 114.3212,22.4940, 114.3212,22.4939,
 114.3212,22.4938, 114.3212,22.4937, 114.3212,22.4937, 114.3212,22.4932,
 114.3210,22.4929, 114.3203,22.4927, 114.3202,22.4921, 114.3193,22.4918,
 114.3189,22.4912, 114.3177,22.4911, 114.3173,22.4904, 114.3166,22.4901,
 114.3163,22.4888, 114.3126,22.4865, 114.3124,22.4852, 114.3117,22.4849,
 114.3116,22.4844, 114.3107,22.4840, 114.3106,22.4835, 114.3096,22.4832,
 114.3087,22.4818, 114.3079,22.4814, 114.3077,22.4809, 114.3069,22.4806,
 114.3068,22.4802, 114.3011,22.4795, 114.3012,22.4792, 114.3019,22.4788,
 114.3020,22.4769, 114.3012,22.4762, 114.3010,22.4757, 114.3002,22.4754,
 114.3002,22.4750, 114.2963,22.4743, 114.2963,22.4740, 114.2954,22.4736,
 114.2950,22.4730, 114.2938,22.4729, 114.2934,22.4722, 114.2926,22.4719,
 114.2925,22.4715, 114.2886,22.4711, 114.2877,22.4706, 114.2876,22.4696,
 114.2868,22.4693, 114.2867,22.4688, 114.2859,22.4684, 114.2858,22.4681,
 114.2830,22.4674, 114.2829,22.4670, 114.2806,22.4661, 114.2782,22.4657,
 114.2781,22.4653, 114.2773,22.4650, 114.2772,22.4646, 114.2744,22.4640,
 114.2743,22.4636, 114.2735,22.4633, 114.2733,22.4627, 114.2728,22.4626,
 114.2721,22.4634, 114.2708,22.4635, 114.2692,22.4643, 114.2687,22.4641,
 114.2686,22.4637, 114.2667,22.4631, 114.2668,22.4627, 114.2676,22.4627,
 114.2677,22.4633, 114.2683,22.4634, 114.2686,22.4628, 114.2684,22.4618,
 114.2677,22.4615, 114.2668,22.4601, 114.2658,22.4598, 114.2658,22.4594,
 114.2629,22.4588, 114.2628,22.4584, 114.2620,22.4581, 114.2616,22.4574,
 114.2604,22.4572, 114.2598,22.4560, 114.2572,22.4553, 114.2571,22.4549,
 114.2563,22.4546, 114.2561,22.4541, 114.2554,22.4538, 114.2551,22.4523,
 114.2544,22.4520, 114.2542,22.4515, 114.2535,22.4512, 114.2532,22.4497,
 114.2524,22.4494, 114.2523,22.4489, 114.2515,22.4485, 114.2511,22.4479,
 114.2499,22.4478, 114.2495,22.4471, 114.2486,22.4468, 114.2485,22.4463,
 114.2477,22.4463, 114.2472,22.4469, 114.2458,22.4468, 114.2453,22.4462,
 114.2441,22.4461, 114.2434,22.4453, 114.2420,22.4449, 114.2418,22.4438,
 114.2407,22.4435, 114.2401,22.4446, 114.2396,22.4499, 114.2381,22.4506,
 114.2372,22.4520, 114.2362,22.4523, 114.2361,22.4529, 114.2343,22.4542,
 114.2342,22.4553, 114.2324,22.4566, 114.2323,22.4572, 114.2312,22.4575,
 114.2304,22.4589, 114.2293,22.4593, 114.2285,22.4605, 114.2262,22.4610,
 114.2254,22.4636, 114.2242,22.4643, 114.2218,22.4640, 114.2218,22.4636,
 114.2209,22.4633, 114.2208,22.4627, 114.2198,22.4624, 114.2189,22.4611,
 114.2150,22.4608, 114.2131,22.4602, 114.2114,22.4611, 114.2112,22.4622,
 114.2104,22.4629, 114.2102,22.4640, 114.2092,22.4643, 114.2086,22.4640,
 114.2083,22.4629, 114.2069,22.4625, 114.2065,22.4618, 114.2059,22.4617,
 114.2052,22.4565, 114.2048,22.4563, 114.2047,22.4544, 114.2056,22.4534,
 114.2087,22.4530, 114.2110,22.4522, 114.2142,22.4518, 114.2142,22.4515,
 114.2151,22.4511, 114.2152,22.4506, 114.2160,22.4503, 114.2161,22.4499,
 114.2184,22.4495, 114.2189,22.4489, 114.2193,22.4475, 114.2198,22.4472,
 114.2200,22.4477, 114.2205,22.4478, 114.2210,22.4506, 114.2216,22.4513,
 114.2224,22.4514, 114.2228,22.4520, 114.2237,22.4523, 114.2238,22.4529,
 114.2246,22.4532, 114.2249,22.4537, 114.2270,22.4538, 114.2275,22.4536,
 114.2276,22.4532, 114.2283,22.4529, 114.2286,22.4516, 114.2294,22.4510,
 114.2293,22.4497, 114.2286,22.4492, 114.2283,22.4479, 114.2276,22.4477,
 114.2275,22.4471, 114.2268,22.4469, 114.2265,22.4456, 114.2244,22.4444,
 114.2231,22.4443, 114.2224,22.4436, 114.2212,22.4435, 114.2205,22.4427,
 114.2191,22.4428, 114.2186,22.4435, 114.2172,22.4433, 114.2170,22.4428,
 114.2161,22.4425, 114.2160,22.4419, 114.2155,22.4418, 114.2150,22.4425,
 114.2136,22.4426, 114.2132,22.4419, 114.2123,22.4416, 114.2119,22.4410,
 114.2105,22.4411, 114.2103,22.4416, 114.2095,22.4419, 114.2094,22.4423,
 114.2046,22.4430, 114.2046,22.4433, 114.2038,22.4436, 114.2038,22.4451,
 114.2053,22.4459, 114.2040,22.4461, 114.2037,22.4456, 114.2013,22.4452,
 114.2001,22.4462, 114.1997,22.4495, 114.1991,22.4504, 114.1983,22.4505,
 114.1979,22.4511, 114.1970,22.4515, 114.1969,22.4520, 114.1961,22.4520,
 114.1960,22.4515, 114.1952,22.4512, 114.1951,22.4511, 114.1951,22.4510,
 114.1951,22.4508, 114.1951,22.4506, 114.1951,22.4505, 114.1951,22.4504,
 114.1951,22.4504, 114.1951,22.4488, 114.1950,22.4483, 114.1949,22.4480,
 114.1947,22.4478, 114.1942,22.4477, 114.1940,22.4471, 114.1932,22.4468,
 114.1931,22.4463, 114.1923,22.4459, 114.1922,22.4456, 114.1899,22.4452,
 114.1890,22.4444, 114.1875,22.4445, 114.1874,22.4449, 114.1826,22.4456,
 114.1809,22.4461, 114.1779,22.4458, 114.1778,22.4454, 114.1771,22.4451,
 114.1768,22.4438, 114.1754,22.4433, 114.1750,22.4422, 114.1754,22.4400,
 114.1759,22.4399, 114.1760,22.4393, 114.1769,22.4390, 114.1769,22.4386,
 114.1800,22.4382, 114.1807,22.4377, 114.1809,22.4367, 114.1816,22.4364,
 114.1819,22.4359, 114.1841,22.4358, 114.1865,22.4365, 114.1912,22.4363,
 114.1913,22.4359, 114.1921,22.4356, 114.1923,22.4350, 114.1930,22.4347,
 114.1932,22.4338, 114.1937,22.4332, 114.1955,22.4331, 114.1964,22.4323,
 114.1976,22.4322, 114.1980,22.4316, 114.1985,22.4314, 114.1987,22.4312,
 114.1988,22.4307, 114.1989,22.4301, 114.1989,22.4292, 114.1989,22.4286,
 114.1989,22.4281, 114.1989,22.4279, 114.1989,22.4279, 114.1989,22.4279,
 114.1992,22.4276, 114.1995,22.4274, 114.1998,22.4268, 114.1999,22.4256,
 114.2004,22.4248, 114.2031,22.4244, 114.2037,22.4238, 114.2035,22.4231,
 114.2021,22.4227, 114.2014,22.4219, 114.2002,22.4218, 114.1993,22.4211,
 114.1975,22.4210, 114.1951,22.4200, 114.1950,22.4194, 114.1945,22.4193,
 114.1937,22.4158, 114.1932,22.4156, 114.1931,22.4151, 114.1923,22.4148,
 114.1922,22.4144, 114.1817,22.4138, 114.1816,22.4134, 114.1808,22.4131,
 114.1804,22.4124, 114.1792,22.4123, 114.1788,22.4118, 114.1702,22.4112,
 114.1699,22.4107, 114.1687,22.4106, 114.1680,22.4098, 114.1668,22.4097,
 114.1664,22.4092, 114.1540,22.4086, 114.1539,22.4082],
[
 114.2457,22.3946, 114.2458,22.3961, 114.2463,22.3968, 114.2467,22.3987,
 114.2463,22.4020, 114.2458,22.4025, 114.2456,22.4041, 114.2448,22.4052,
 114.2447,22.4074, 114.2438,22.4083, 114.2436,22.4096, 114.2429,22.4099,
 114.2428,22.4105, 114.2422,22.4106, 114.2419,22.4144, 114.2422,22.4167,
 114.2425,22.4167, 114.2428,22.4189, 114.2425,22.4227, 114.2422,22.4227,
 114.2415,22.4279, 114.2410,22.4281, 114.2409,22.4285, 114.2438,22.4291,
 114.2438,22.4295, 114.2447,22.4298, 114.2451,22.4305, 114.2463,22.4306,
 114.2467,22.4312, 114.2475,22.4312, 114.2477,22.4307, 114.2485,22.4304,
 114.2486,22.4298, 114.2493,22.4296, 114.2499,22.4279, 114.2521,22.4287,
 114.2545,22.4288, 114.2553,22.4293, 114.2599,22.4298, 114.2610,22.4306,
 114.2613,22.4323, 114.2619,22.4321, 114.2628,22.4301, 114.2633,22.4279,
 114.2644,22.4274, 114.2648,22.4211, 114.2644,22.4175, 114.2639,22.4174,
 114.2638,22.4168, 114.2631,22.4166, 114.2630,22.4160, 114.2637,22.4157,
 114.2640,22.4142, 114.2647,22.4139, 114.2654,22.4127, 114.2670,22.4124,
 114.2676,22.4128, 114.2677,22.4145, 114.2686,22.4153, 114.2688,22.4166,
 114.2695,22.4168, 114.2696,22.4172, 114.2719,22.4176, 114.2728,22.4184,
 114.2740,22.4185, 114.2744,22.4191, 114.2753,22.4194, 114.2754,22.4200,
 114.2762,22.4203, 114.2763,22.4208, 114.2772,22.4212, 114.2773,22.4217,
 114.2781,22.4220, 114.2782,22.4226, 114.2791,22.4229, 114.2790,22.4235,
 114.2773,22.4230, 114.2766,22.4233, 114.2763,22.4239, 114.2764,22.4252,
 114.2772,22.4255, 114.2770,22.4261, 114.2763,22.4264, 114.2762,22.4269,
 114.2757,22.4271, 114.2753,22.4292, 114.2743,22.4312, 114.2736,22.4315,
 114.2733,22.4329, 114.2725,22.4343, 114.2726,22.4356, 114.2733,22.4359,
 114.2735,22.4364, 114.2743,22.4367, 114.2744,22.4371, 114.2733,22.4375,
 114.2715,22.4371, 114.2714,22.4367, 114.2706,22.4367, 114.2705,22.4373,
 114.2696,22.4376, 114.2695,22.4382, 114.2690,22.4383, 114.2686,22.4399,
 114.2690,22.4408, 114.2708,22.4412, 114.2723,22.4429, 114.2726,22.4443,
 114.2733,22.4445, 114.2735,22.4451, 114.2743,22.4454, 114.2744,22.4459,
 114.2753,22.4463, 114.2757,22.4469, 114.2769,22.4470, 114.2773,22.4477,
 114.2781,22.4480, 114.2784,22.4485, 114.2806,22.4486, 114.2814,22.4484,
 114.2821,22.4471, 114.2826,22.4470, 114.2833,22.4525, 114.2843,22.4538,
 114.2857,22.4537, 114.2859,22.4532, 114.2867,22.4529, 114.2868,22.4523,
 114.2877,22.4520, 114.2877,22.4516, 114.2916,22.4512, 114.2925,22.4506,
 114.2929,22.4496, 114.2934,22.4497, 114.2935,22.4503, 114.2941,22.4504,
 114.2944,22.4532, 114.2935,22.4545, 114.2935,22.4561, 114.2938,22.4571,
 114.2950,22.4574, 114.2954,22.4581, 114.2960,22.4582, 114.2964,22.4603,
 114.2972,22.4611, 114.2975,22.4624, 114.2982,22.4627, 114.2983,22.4633,
 114.2990,22.4635, 114.2994,22.4650, 114.3001,22.4653, 114.3002,22.4657,
 114.3025,22.4661, 114.3034,22.4668, 114.3048,22.4672, 114.3051,22.4685,
 114.3058,22.4688, 114.3059,22.4693, 114.3068,22.4696, 114.3069,22.4702,
 114.3077,22.4705, 114.3078,22.4709, 114.3109,22.4713, 114.3116,22.4719,
 114.3118,22.4728, 114.3125,22.4731, 114.3129,22.4737, 114.3144,22.4736,
 114.3145,22.4731, 114.3153,22.4728, 114.3156,22.4713, 114.3163,22.4710,
 114.3165,22.4705, 114.3173,22.4702, 114.3172,22.4695, 114.3168,22.4695,
 114.3164,22.4673, 114.3169,22.4662, 114.3187,22.4661, 114.3202,22.4670,
 114.3204,22.4676, 114.3226,22.4677, 114.3237,22.4672, 114.3240,22.4642,
 114.3237,22.4626, 114.3231,22.4627, 114.3230,22.4633, 114.3222,22.4633,
 114.3221,22.4627, 114.3215,22.4626, 114.3211,22.4597, 114.3202,22.4571,
 114.3206,22.4565, 114.3211,22.4567, 114.3212,22.4572, 114.3219,22.4575,
 114.3222,22.4588, 114.3228,22.4591, 114.3237,22.4590, 114.3240,22.4588,
 114.3240,22.4585, 114.3242,22.4584, 114.3244,22.4583, 114.3248,22.4582,
 114.3259,22.4582, 114.3259,22.4582, 114.3260,22.4582, 114.3261,22.4582,
 114.3263,22.4582, 114.3265,22.4582, 114.3267,22.4583, 114.3268,22.4584,
 114.3269,22.4588, 114.3267,22.4590, 114.3261,22.4591, 114.3260,22.4598,
 114.3268,22.4607, 114.3278,22.4610, 114.3279,22.4615, 114.3286,22.4618,
 114.3289,22.4631, 114.3297,22.4639, 114.3296,22.4659, 114.3287,22.4662,
 114.3279,22.4671, 114.3279,22.4680, 114.3282,22.4685, 114.3294,22.4688,
 114.3301,22.4712, 114.3307,22.4714, 114.3308,22.4719, 114.3316,22.4722,
 114.3320,22.4729, 114.3335,22.4728, 114.3336,22.4722, 114.3345,22.4719,
 114.3346,22.4714, 114.3351,22.4712, 114.3356,22.4684, 114.3361,22.4677,
 114.3368,22.4626, 114.3374,22.4621, 114.3378,22.4600, 114.3383,22.4598,
 114.3393,22.4578, 114.3391,22.4558, 114.3384,22.4555, 114.3383,22.4549,
 114.3375,22.4546, 114.3374,22.4542, 114.3356,22.4539, 114.3326,22.4542,
 114.3326,22.4546, 114.3317,22.4549, 114.3316,22.4555, 114.3311,22.4556,
 114.3307,22.4528, 114.3301,22.4522, 114.3298,22.4479, 114.3307,22.4463,
 114.3311,22.4435, 114.3316,22.4433, 114.3320,22.4427, 114.3332,22.4424,
 114.3336,22.4410, 114.3332,22.4383, 114.3327,22.4380, 114.3326,22.4369,
 114.3317,22.4363, 114.3317,22.4355, 114.3308,22.4350, 114.3265,22.4345,
 114.3262,22.4340, 114.3268,22.4338, 114.3270,22.4333, 114.3278,22.4330,
 114.3279,22.4324, 114.3288,22.4321, 114.3289,22.4316, 114.3294,22.4314,
 114.3299,22.4286, 114.3305,22.4279, 114.3310,22.4279, 114.3316,22.4286,
 114.3320,22.4314, 114.3332,22.4319, 114.3338,22.4339, 114.3345,22.4342,
 114.3345,22.4345, 114.3360,22.4349, 114.3384,22.4345, 114.3384,22.4342,
 114.3390,22.4340, 114.3397,22.4297, 114.3402,22.4295, 114.3403,22.4290,
 114.3409,22.4288, 114.3413,22.4260, 114.3418,22.4253, 114.3422,22.4226,
 114.3417,22.4213, 114.3393,22.4207, 114.3399,22.4196, 114.3421,22.4193,
 114.3430,22.4198, 114.3435,22.4219, 114.3440,22.4220, 114.3435,22.4233,
 114.3431,22.4268, 114.3435,22.4288, 114.3437,22.4288, 114.3441,22.4315,
 114.3437,22.4331, 114.3432,22.4334, 114.3431,22.4345, 114.3422,22.4355,
 114.3424,22.4381, 114.3428,22.4383, 114.3431,22.4410, 114.3428,22.4426,
 114.3422,22.4431, 114.3422,22.4443, 114.3425,22.4451, 114.3437,22.4453,
 114.3442,22.4459, 114.3457,22.4461, 114.3461,22.4454, 114.3466,22.4452,
 114.3470,22.4466, 114.3492,22.4478, 114.3504,22.4479, 114.3508,22.4485,
 114.3506,22.4495, 114.3499,22.4497, 114.3508,22.4516, 114.3499,22.4527,
 114.3500,22.4546, 114.3507,22.4549, 114.3508,22.4553, 114.3513,22.4556,
 114.3535,22.4555, 114.3537,22.4549, 114.3545,22.4546, 114.3546,22.4542,
 114.3577,22.4537, 114.3584,22.4529, 114.3588,22.4513, 114.3593,22.4511,
 114.3597,22.4505, 114.3609,22.4504, 114.3614,22.4497, 114.3621,22.4495,
 114.3622,22.4481, 114.3614,22.4465, 114.3612,22.4449, 114.3604,22.4441,
 114.3602,22.4428, 114.3594,22.4425, 114.3593,22.4419, 114.3586,22.4417,
 114.3586,22.4402, 114.3592,22.4399, 114.3592,22.4384, 114.3585,22.4382,
 114.3581,22.4375, 114.3569,22.4374, 114.3565,22.4367, 114.3559,22.4366,
 114.3552,22.4314, 114.3547,22.4312, 114.3546,22.4309, 114.3556,22.4290,
 114.3562,22.4288, 114.3569,22.4236, 114.3574,22.4234, 114.3582,22.4218,
 114.3584,22.4190, 114.3575,22.4173, 114.3574,22.4161, 114.3566,22.4152,
 114.3562,22.4124, 114.3556,22.4122, 114.3555,22.4116, 114.3547,22.4113,
 114.3545,22.4108, 114.3537,22.4105, 114.3536,22.4099, 114.3529,22.4096,
 114.3525,22.4081, 114.3518,22.4079, 114.3517,22.4073, 114.3508,22.4070,
 114.3500,22.4056, 114.3489,22.4053, 114.3488,22.4047, 114.3480,22.4044,
 114.3479,22.4040, 114.3461,22.4037, 114.3431,22.4040, 114.3426,22.4050,
 114.3399,22.4070, 114.3379,22.4072, 114.3371,22.4080, 114.3359,22.4081,
 114.3354,22.4087, 114.3347,22.4090, 114.3344,22.4105, 114.3336,22.4108,
 114.3335,22.4113, 114.3327,22.4116, 114.3326,22.4122, 114.3317,22.4125,
 114.3316,22.4131, 114.3308,22.4134, 114.3307,22.4138, 114.3302,22.4140,
 114.3280,22.4139, 114.3278,22.4134, 114.3270,22.4131, 114.3265,22.4124,
 114.3253,22.4123, 114.3249,22.4116, 114.3227,22.4106, 114.3222,22.4108,
 114.3218,22.4114, 114.3206,22.4115, 114.3199,22.4123, 114.3187,22.4124,
 114.3179,22.4132, 114.3168,22.4133, 114.3163,22.4139, 114.3156,22.4142,
 114.3154,22.4155, 114.3145,22.4165, 114.3141,22.4193, 114.3136,22.4194,
 114.3135,22.4200, 114.3126,22.4203, 114.3122,22.4210, 114.3110,22.4211,
 114.3106,22.4217, 114.3098,22.4220, 114.3097,22.4224, 114.3040,22.4231,
 114.3034,22.4235, 114.3022,22.4236, 114.3013,22.4234, 114.3010,22.4229,
 114.2996,22.4222, 114.2988,22.4175, 114.2983,22.4172, 114.2982,22.4161,
 114.2973,22.4147, 114.2972,22.4135, 114.2967,22.4127, 114.2820,22.4120,
 114.2819,22.4116, 114.2811,22.4113, 114.2810,22.4108, 114.2804,22.4106,
 114.2800,22.4078, 114.2792,22.4068, 114.2790,22.4055, 114.2782,22.4053,
 114.2781,22.4047, 114.2763,22.4034, 114.2761,22.4021, 114.2754,22.4018,
 114.2753,22.4013, 114.2744,22.4009, 114.2744,22.4006, 114.2705,22.3999,
 114.2702,22.3994, 114.2690,22.3993, 114.2686,22.3987, 114.2677,22.3983,
 114.2676,22.3978, 114.2668,22.3975, 114.2664,22.3968, 114.2652,22.3967,
 114.2648,22.3962, 114.2524,22.3956, 114.2518,22.3951, 114.2495,22.3947,
 114.2495,22.3943, 114.2480,22.3934, 114.2462,22.3935],
[
 114.3523,22.4574, 114.3518,22.4575, 114.3517,22.4579, 114.3489,22.4585,
 114.3480,22.4596, 114.3481,22.4615, 114.3488,22.4622, 114.3489,22.4633,
 114.3485,22.4641, 114.3473,22.4644, 114.3470,22.4653, 114.3473,22.4669,
 114.3479,22.4670, 114.3479,22.4674, 114.3456,22.4679, 114.3451,22.4684,
 114.3450,22.4692, 114.3442,22.4698, 114.3440,22.4709, 114.3435,22.4712,
 114.3431,22.4734, 114.3435,22.4745, 114.3449,22.4750, 114.3452,22.4761,
 114.3468,22.4767, 114.3470,22.4778, 114.3497,22.4795, 114.3522,22.4798,
 114.3531,22.4791, 114.3542,22.4789, 114.3547,22.4783, 114.3554,22.4780,
 114.3556,22.4767, 114.3563,22.4762, 114.3565,22.4743, 114.3557,22.4737,
 114.3557,22.4722, 114.3565,22.4719, 114.3566,22.4714, 114.3574,22.4710,
 114.3575,22.4705, 114.3582,22.4702, 114.3586,22.4687, 114.3592,22.4686,
 114.3593,22.4679, 114.3588,22.4677, 114.3581,22.4651, 114.3575,22.4650,
 114.3571,22.4643, 114.3552,22.4640, 114.3548,22.4635, 114.3554,22.4634,
 114.3555,22.4633, 114.3556,22.4631, 114.3556,22.4629, 114.3556,22.4627,
 114.3556,22.4626, 114.3556,22.4626, 114.3556,22.4626, 114.3556,22.4615,
 114.3554,22.4608, 114.3547,22.4601, 114.3537,22.4598, 114.3536,22.4593,
 114.3529,22.4590],
[
 114.4215,22.5272, 114.4214,22.5280, 114.4199,22.5284, 114.4192,22.5291,
 114.4180,22.5293, 114.4176,22.5299, 114.4171,22.5301, 114.4158,22.5294,
 114.4157,22.5299, 114.4149,22.5302, 114.4147,22.5308, 114.4140,22.5310,
 114.4138,22.5324, 114.4129,22.5340, 114.4128,22.5356, 114.4121,22.5363,
 114.4120,22.5382, 114.4123,22.5387, 114.4135,22.5393, 114.4140,22.5412,
 114.4147,22.5415, 114.4148,22.5419, 114.4186,22.5425, 114.4187,22.5429,
 114.4192,22.5430, 114.4197,22.5367, 114.4203,22.5353, 114.4211,22.5352,
 114.4215,22.5346, 114.4224,22.5342, 114.4225,22.5337, 114.4233,22.5334,
 114.4235,22.5328, 114.4243,22.5325, 114.4244,22.5320, 114.4249,22.5318,
 114.4254,22.5325, 114.4269,22.5326, 114.4278,22.5318, 114.4295,22.5316,
 114.4301,22.5308, 114.4297,22.5292, 114.4292,22.5290, 114.4291,22.5285,
 114.4283,22.5282, 114.4282,22.5272, 114.4269,22.5267, 114.4240,22.5266],
[
 114.3494,22.4868, 114.3479,22.4871, 114.3479,22.4875, 114.3471,22.4878,
 114.3468,22.4892, 114.3451,22.4918, 114.3452,22.4927, 114.3458,22.4929,
 114.3460,22.4932, 114.3460,22.4937, 114.3460,22.4937, 114.3460,22.4939,
 114.3460,22.4942, 114.3460,22.4947, 114.3460,22.4953, 114.3462,22.4958,
 114.3465,22.4961, 114.3483,22.4964, 114.3496,22.4971, 114.3527,22.4968,
 114.3528,22.4965, 114.3533,22.4963, 114.3537,22.4968, 114.3554,22.4972,
 114.3563,22.4967, 114.3565,22.4951, 114.3552,22.4938, 114.3538,22.4934,
 114.3536,22.4923, 114.3531,22.4920, 114.3523,22.4877, 114.3518,22.4875,
 114.3517,22.4871],
[
 114.2172,22.4539, 114.2142,22.4542, 114.2141,22.4546, 114.2134,22.4549,
 114.2134,22.4564, 114.2141,22.4567, 114.2145,22.4573, 114.2157,22.4574,
 114.2161,22.4581, 114.2170,22.4581, 114.2171,22.4575, 114.2179,22.4572,
 114.2181,22.4567, 114.2186,22.4565, 114.2189,22.4549, 114.2186,22.4544],
[
 114.3215,22.4686, 114.3212,22.4706, 114.3215,22.4738, 114.3221,22.4740,
 114.3222,22.4745, 114.3227,22.4747, 114.3237,22.4741, 114.3240,22.4711,
 114.3237,22.4697, 114.3225,22.4694, 114.3221,22.4688],
[
 114.2158,22.4323, 114.2152,22.4331, 114.2151,22.4350, 114.2158,22.4363,
 114.2166,22.4366, 114.2189,22.4363, 114.2189,22.4359, 114.2181,22.4356,
 114.2182,22.4349, 114.2188,22.4347, 114.2189,22.4338, 114.2186,22.4332,
 114.2174,22.4331, 114.2167,22.4323],
[
 114.3603,22.4750, 114.3603,22.4754, 114.3596,22.4756, 114.3596,22.4769,
 114.3618,22.4772, 114.3638,22.4764, 114.3641,22.4761, 114.3642,22.4753,
 114.3639,22.4750, 114.3627,22.4747]],
 TW:[
[
 114.0279,22.3538, 114.0278,22.3541, 114.0263,22.3535, 114.0260,22.3551,
 114.0263,22.3578, 114.0269,22.3580, 114.0270,22.3585, 114.0277,22.3588,
 114.0280,22.3601, 114.0298,22.3607, 114.0318,22.3637, 114.0326,22.3640,
 114.0327,22.3646, 114.0335,22.3649, 114.0336,22.3653, 114.0365,22.3659,
 114.0365,22.3663, 114.0372,22.3666, 114.0372,22.3681, 114.0365,22.3684,
 114.0365,22.3687, 114.0341,22.3692, 114.0336,22.3697, 114.0334,22.3707,
 114.0327,22.3710, 114.0326,22.3715, 114.0319,22.3718, 114.0316,22.3731,
 114.0308,22.3739, 114.0309,22.3758, 114.0316,22.3762, 114.0321,22.3768,
 114.0333,22.3769, 114.0355,22.3779, 114.0356,22.3784, 114.0364,22.3788,
 114.0365,22.3791, 114.0383,22.3795, 114.0413,22.3791, 114.0418,22.3786,
 114.0439,22.3788, 114.0442,22.3793, 114.0447,22.3795, 114.0454,22.3829,
 114.0473,22.3837, 114.0488,22.3836, 114.0489,22.3832, 114.0525,22.3829,
 114.0604,22.3841, 114.0604,22.3845, 114.0619,22.3852, 114.0626,22.3881,
 114.0632,22.3883, 114.0633,22.3888, 114.0641,22.3891, 114.0645,22.3898,
 114.0657,22.3899, 114.0664,22.3907, 114.0676,22.3908, 114.0685,22.3915,
 114.0709,22.3919, 114.0709,22.3923, 114.0718,22.3926, 114.0719,22.3931,
 114.0740,22.3941, 114.0753,22.3942, 114.0762,22.3950, 114.0785,22.3954,
 114.0786,22.3957, 114.0794,22.3961, 114.0795,22.3966, 114.0804,22.3969,
 114.0805,22.3975, 114.0813,22.3978, 114.0817,22.3984, 114.0829,22.3986,
 114.0836,22.3993, 114.0851,22.3992, 114.0852,22.3988, 114.0875,22.3984,
 114.0884,22.3977, 114.0899,22.3978, 114.0903,22.3984, 114.0916,22.3986,
 114.0927,22.3993, 114.0932,22.4002, 114.0944,22.4003, 114.0970,22.4036,
 114.0982,22.4037, 114.0987,22.4044, 114.1002,22.4045, 114.1011,22.4040,
 114.1062,22.4037, 114.1091,22.4040, 114.1091,22.4044, 114.1100,22.4047,
 114.1101,22.4053, 114.1109,22.4056, 114.1111,22.4061, 114.1119,22.4065,
 114.1119,22.4068, 114.1177,22.4075, 114.1180,22.4080, 114.1195,22.4083,
 114.1198,22.4096, 114.1205,22.4099, 114.1206,22.4105, 114.1213,22.4107,
 114.1215,22.4117, 114.1287,22.4124, 114.1406,22.4120, 114.1407,22.4116,
 114.1415,22.4113, 114.1416,22.4108, 114.1425,22.4105, 114.1431,22.4092,
 114.1521,22.4086, 114.1524,22.4081, 114.1539,22.4082, 114.1540,22.4086,
 114.1588,22.4089, 114.1611,22.4084, 114.1616,22.4079, 114.1617,22.4067,
 114.1626,22.4047, 114.1632,22.4046, 114.1635,22.4020, 114.1635,22.3989,
 114.1626,22.3959, 114.1622,22.3916, 114.1617,22.3914, 114.1608,22.3900,
 114.1598,22.3897, 114.1597,22.3891, 114.1588,22.3888, 114.1587,22.3883,
 114.1580,22.3880, 114.1577,22.3867, 114.1567,22.3862, 114.1559,22.3850,
 114.1541,22.3843, 114.1539,22.3832, 114.1507,22.3813, 114.1483,22.3809,
 114.1482,22.3805, 114.1474,22.3802, 114.1472,22.3796, 114.1464,22.3793,
 114.1463,22.3788, 114.1454,22.3784, 114.1454,22.3781, 114.1440,22.3777,
 114.1412,22.3781, 114.1407,22.3790, 114.1402,22.3812, 114.1397,22.3814,
 114.1395,22.3819, 114.1373,22.3820, 114.1355,22.3812, 114.1343,22.3811,
 114.1339,22.3805, 114.1333,22.3803, 114.1326,22.3725, 114.1321,22.3724,
 114.1319,22.3718, 114.1311,22.3715, 114.1311,22.3711, 114.1225,22.3705,
 114.1224,22.3701, 114.1216,22.3698, 114.1214,22.3692, 114.1204,22.3689,
 114.1195,22.3675, 114.1188,22.3672, 114.1185,22.3657, 114.1177,22.3654,
 114.1176,22.3649, 114.1168,22.3646, 114.1164,22.3639, 114.1152,22.3638,
 114.1148,22.3632, 114.1124,22.3622, 114.1102,22.3623, 114.1081,22.3654,
 114.1072,22.3658, 114.1071,22.3663, 114.1064,22.3666, 114.1060,22.3681,
 114.1053,22.3684, 114.1053,22.3687, 114.1024,22.3694, 114.1023,22.3698,
 114.1008,22.3699, 114.1001,22.3691, 114.0989,22.3690, 114.0985,22.3684,
 114.0977,22.3680, 114.0976,22.3677, 114.0945,22.3673, 114.0925,22.3665,
 114.0913,22.3664, 114.0904,22.3657, 114.0885,22.3656, 114.0862,22.3646,
 114.0861,22.3640, 114.0853,22.3640, 114.0848,22.3647, 114.0836,22.3648,
 114.0829,22.3656, 114.0817,22.3657, 114.0810,22.3664, 114.0798,22.3665,
 114.0789,22.3673, 114.0764,22.3670, 114.0744,22.3657, 114.0731,22.3656,
 114.0727,22.3649, 114.0719,22.3646, 114.0718,22.3640, 114.0710,22.3638,
 114.0707,22.3625, 114.0675,22.3613, 114.0653,22.3614, 114.0651,22.3618,
 114.0624,22.3625, 114.0619,22.3636, 114.0601,22.3639, 114.0565,22.3636,
 114.0562,22.3631, 114.0550,22.3630, 114.0546,22.3623, 114.0537,22.3620,
 114.0536,22.3614, 114.0528,22.3611, 114.0527,22.3607, 114.0498,22.3601,
 114.0498,22.3597, 114.0490,22.3594, 114.0489,22.3590, 114.0413,22.3584,
 114.0412,22.3580, 114.0404,22.3577, 114.0402,22.3571, 114.0395,22.3568,
 114.0393,22.3559, 114.0383,22.3553, 114.0336,22.3549, 114.0332,22.3544,
 114.0321,22.3543, 114.0317,22.3538, 114.0293,22.3535],
[
 114.0323,22.3105, 114.0316,22.3118, 114.0309,22.3121, 114.0306,22.3134,
 114.0295,22.3137, 114.0289,22.3172, 114.0285,22.3330, 114.0279,22.3343,
 114.0288,22.3346, 114.0289,22.3352, 114.0297,22.3355, 114.0301,22.3361,
 114.0313,22.3362, 114.0319,22.3372, 114.0330,22.3379, 114.0343,22.3380,
 114.0353,22.3387, 114.0355,22.3393, 114.0378,22.3398, 114.0384,22.3403,
 114.0384,22.3411, 114.0393,22.3417, 114.0395,22.3428, 114.0409,22.3432,
 114.0416,22.3439, 114.0424,22.3440, 114.0430,22.3446, 114.0435,22.3478,
 114.0441,22.3481, 114.0442,22.3476, 114.0457,22.3474, 114.0460,22.3469,
 114.0508,22.3462, 114.0509,22.3459, 114.0517,22.3455, 114.0518,22.3450,
 114.0527,22.3447, 114.0528,22.3441, 114.0536,22.3438, 114.0537,22.3433,
 114.0543,22.3431, 114.0547,22.3409, 114.0556,22.3389, 114.0564,22.3387,
 114.0567,22.3372, 114.0574,22.3369, 114.0576,22.3363, 114.0584,22.3360,
 114.0584,22.3356, 114.0569,22.3353, 114.0562,22.3345, 114.0550,22.3343,
 114.0546,22.3335, 114.0550,22.3320, 114.0562,22.3316, 114.0565,22.3306,
 114.0562,22.3284, 114.0556,22.3282, 114.0555,22.3277, 114.0550,22.3275,
 114.0543,22.3249, 114.0537,22.3248, 114.0537,22.3244, 114.0552,22.3238,
 114.0556,22.3228, 114.0554,22.3210, 114.0543,22.3214, 114.0528,22.3213,
 114.0525,22.3207, 114.0516,22.3204, 114.0508,22.3192, 114.0470,22.3185,
 114.0464,22.3175, 114.0436,22.3171, 114.0422,22.3175, 114.0421,22.3178,
 114.0414,22.3181, 114.0409,22.3201, 114.0397,22.3206, 114.0390,22.3232,
 114.0384,22.3234, 114.0382,22.3242, 114.0374,22.3255, 114.0362,22.3258,
 114.0359,22.3255, 114.0355,22.3238, 114.0359,22.3206, 114.0364,22.3204,
 114.0365,22.3199, 114.0371,22.3197, 114.0374,22.3168, 114.0371,22.3119,
 114.0338,22.3102],
[
 114.0578,22.3414, 114.0574,22.3428, 114.0566,22.3434, 114.0564,22.3445,
 114.0547,22.3452, 114.0544,22.3465, 114.0537,22.3467, 114.0536,22.3473,
 114.0531,22.3474, 114.0527,22.3491, 114.0533,22.3499, 114.0550,22.3502,
 114.0556,22.3510, 114.0552,22.3525, 114.0537,22.3530, 114.0537,22.3533,
 114.0543,22.3535, 114.0550,22.3559, 114.0562,22.3561, 114.0565,22.3566,
 114.0589,22.3570, 114.0601,22.3566, 114.0607,22.3552, 114.0613,22.3554,
 114.0615,22.3559, 114.0637,22.3560, 114.0649,22.3553, 114.0644,22.3551,
 114.0641,22.3538, 114.0633,22.3530, 114.0629,22.3509, 114.0623,22.3507,
 114.0624,22.3501, 114.0633,22.3499, 114.0642,22.3485, 114.0650,22.3482,
 114.0652,22.3469, 114.0660,22.3462, 114.0661,22.3455, 114.0657,22.3449,
 114.0645,22.3448, 114.0638,22.3440, 114.0626,22.3439, 114.0619,22.3432,
 114.0607,22.3431, 114.0600,22.3423, 114.0588,22.3422, 114.0584,22.3415],
[
 114.0263,22.2930, 114.0260,22.2934, 114.0227,22.2939, 114.0214,22.2944,
 114.0204,22.2959, 114.0202,22.2976, 114.0193,22.2986, 114.0195,22.3005,
 114.0202,22.3009, 114.0202,22.3012, 114.0226,22.3016, 114.0244,22.3024,
 114.0249,22.3023, 114.0259,22.3003, 114.0263,22.2981, 114.0269,22.2979,
 114.0270,22.2974, 114.0275,22.2972, 114.0279,22.2945, 114.0275,22.2932]],
 WC:[
[
 114.1788,22.2603, 114.1785,22.2608, 114.1773,22.2609, 114.1769,22.2614,
 114.1660,22.2621, 114.1646,22.2628, 114.1641,22.2634, 114.1629,22.2635,
 114.1625,22.2642, 114.1617,22.2645, 114.1616,22.2650, 114.1608,22.2653,
 114.1608,22.2668, 114.1613,22.2669, 114.1620,22.2756, 114.1625,22.2759,
 114.1626,22.2770, 114.1635,22.2777, 114.1636,22.2787, 114.1643,22.2793,
 114.1644,22.2819, 114.1636,22.2832, 114.1635,22.2847, 114.1641,22.2858,
 114.1662,22.2865, 114.1668,22.2886, 114.1673,22.2887, 114.1674,22.2891,
 114.1697,22.2894, 114.1709,22.2890, 114.1713,22.2873, 114.1719,22.2868,
 114.1730,22.2872, 114.1733,22.2883, 114.1745,22.2886, 114.1769,22.2883,
 114.1770,22.2879, 114.1778,22.2876, 114.1779,22.2870, 114.1788,22.2867,
 114.1788,22.2863, 114.1819,22.2859, 114.1832,22.2852, 114.1853,22.2853,
 114.1856,22.2858, 114.1861,22.2860, 114.1868,22.2852, 114.1883,22.2848,
 114.1886,22.2835, 114.1893,22.2832, 114.1901,22.2817, 114.1905,22.2800,
 114.1912,22.2798, 114.1912,22.2794, 114.1930,22.2791, 114.1960,22.2794,
 114.1961,22.2798, 114.1976,22.2799, 114.1998,22.2789, 114.2000,22.2781,
 114.2009,22.2766, 114.2017,22.2763, 114.2018,22.2759, 114.2016,22.2756,
 114.2010,22.2755, 114.2006,22.2740, 114.1999,22.2737, 114.1998,22.2732,
 114.1989,22.2728, 114.1988,22.2723, 114.1980,22.2720, 114.1976,22.2713,
 114.1964,22.2712, 114.1960,22.2706, 114.1952,22.2703, 114.1950,22.2690,
 114.1945,22.2687, 114.1939,22.2645, 114.1930,22.2635, 114.1918,22.2634,
 114.1909,22.2627, 114.1897,22.2626, 114.1893,22.2621, 114.1855,22.2614,
 114.1852,22.2609, 114.1840,22.2608, 114.1836,22.2603, 114.1818,22.2600]],
 WTS:[
[
 114.1837,22.3346, 114.1826,22.3351, 114.1826,22.3359, 114.1817,22.3365,
 114.1816,22.3376, 114.1808,22.3384, 114.1807,22.3400, 114.1798,22.3410,
 114.1797,22.3426, 114.1789,22.3434, 114.1786,22.3447, 114.1779,22.3450,
 114.1778,22.3455, 114.1773,22.3457, 114.1769,22.3478, 114.1763,22.3484,
 114.1771,22.3494, 114.1790,22.3499, 114.1846,22.3504, 114.1849,22.3508,
 114.1863,22.3512, 114.1866,22.3523, 114.1884,22.3530, 114.1884,22.3533,
 114.1890,22.3535, 114.1899,22.3527, 114.1911,22.3526, 114.1920,22.3528,
 114.1923,22.3533, 114.1940,22.3542, 114.1950,22.3545, 114.1951,22.3549,
 114.2056,22.3555, 114.2059,22.3560, 114.2071,22.3561, 114.2078,22.3569,
 114.2090,22.3570, 114.2098,22.3578, 114.2109,22.3579, 114.2113,22.3584,
 114.2143,22.3587, 114.2158,22.3580, 114.2161,22.3574, 114.2160,22.3559,
 114.2155,22.3552, 114.2151,22.3536, 114.2155,22.3509, 114.2160,22.3501,
 114.2161,22.3474, 114.2167,22.3466, 114.2174,22.3396, 114.2178,22.3394,
 114.2179,22.3368, 114.2171,22.3359, 114.2170,22.3351, 114.2163,22.3346,
 114.2132,22.3341, 114.2118,22.3336, 114.2094,22.3339, 114.2089,22.3344,
 114.2070,22.3345, 114.2046,22.3353, 114.2009,22.3354, 114.1982,22.3361,
 114.1951,22.3359, 114.1950,22.3355, 114.1942,22.3352, 114.1937,22.3345,
 114.1926,22.3344, 114.1922,22.3339, 114.1908,22.3336]],
 YL:[
[
 114.0641,22.3905, 114.0636,22.3907, 114.0629,22.3942, 114.0623,22.3943,
 114.0623,22.3947, 114.0565,22.3954, 114.0565,22.3957, 114.0556,22.3961,
 114.0555,22.3966, 114.0550,22.3968, 114.0546,22.3981, 114.0550,22.4002,
 114.0555,22.4006, 114.0558,22.4019, 114.0565,22.4021, 114.0573,22.4036,
 114.0575,22.4048, 114.0546,22.4054, 114.0498,22.4051, 114.0498,22.4047,
 114.0490,22.4044, 114.0488,22.4039, 114.0480,22.4035, 114.0479,22.4032,
 114.0258,22.4028, 114.0126,22.4035, 114.0125,22.4042, 114.0120,22.4046,
 114.0113,22.4098, 114.0107,22.4101, 114.0105,22.4114, 114.0098,22.4116,
 114.0094,22.4123, 114.0082,22.4124, 114.0078,22.4131, 114.0072,22.4132,
 114.0067,22.4161, 114.0061,22.4173, 114.0041,22.4186, 114.0040,22.4189,
 113.9973,22.4196, 113.9969,22.4201, 113.9958,22.4203, 113.9950,22.4227,
 113.9946,22.4228, 113.9945,22.4241, 113.9952,22.4246, 113.9953,22.4266,
 113.9944,22.4276, 113.9939,22.4279, 113.9918,22.4278, 113.9912,22.4271,
 113.9900,22.4270, 113.9897,22.4265, 113.9836,22.4262, 113.9734,22.4265,
 113.9731,22.4270, 113.9719,22.4271, 113.9710,22.4279, 113.9692,22.4280,
 113.9686,22.4285, 113.9622,22.4288, 113.9511,22.4285, 113.9496,22.4276,
 113.9495,22.4265, 113.9486,22.4259, 113.9485,22.4248, 113.9477,22.4241,
 113.9476,22.4231, 113.9467,22.4224, 113.9465,22.4211, 113.9458,22.4208,
 113.9457,22.4203, 113.9448,22.4200, 113.9447,22.4194, 113.9439,22.4191,
 113.9437,22.4186, 113.9429,22.4182, 113.9425,22.4176, 113.9411,22.4179,
 113.9408,22.4192, 113.9400,22.4194, 113.9402,22.4201, 113.9408,22.4202,
 113.9408,22.4218, 113.9400,22.4222, 113.9402,22.4235, 113.9409,22.4238,
 113.9413,22.4244, 113.9425,22.4245, 113.9429,22.4252, 113.9437,22.4255,
 113.9442,22.4261, 113.9454,22.4263, 113.9458,22.4269, 113.9466,22.4272,
 113.9467,22.4278, 113.9473,22.4279, 113.9480,22.4331, 113.9485,22.4333,
 113.9486,22.4338, 113.9494,22.4341, 113.9497,22.4356, 113.9504,22.4359,
 113.9506,22.4364, 113.9514,22.4367, 113.9515,22.4373, 113.9523,22.4376,
 113.9528,22.4383, 113.9536,22.4383, 113.9542,22.4390, 113.9547,22.4418,
 113.9552,22.4421, 113.9554,22.4434, 113.9562,22.4437, 113.9562,22.4441,
 113.9600,22.4447, 113.9604,22.4452, 113.9616,22.4453, 113.9620,22.4459,
 113.9629,22.4463, 113.9630,22.4468, 113.9651,22.4481, 113.9667,22.4486,
 113.9715,22.4490, 113.9716,22.4494, 113.9724,22.4497, 113.9725,22.4501,
 113.9753,22.4508, 113.9754,22.4511, 113.9762,22.4515, 113.9763,22.4520,
 113.9774,22.4523, 113.9783,22.4537, 113.9790,22.4540, 113.9792,22.4553,
 113.9797,22.4556, 113.9805,22.4600, 113.9810,22.4601, 113.9811,22.4607,
 113.9818,22.4609, 113.9822,22.4624, 113.9829,22.4627, 113.9830,22.4633,
 113.9839,22.4636, 113.9840,22.4641, 113.9850,22.4644, 113.9859,22.4659,
 113.9867,22.4662, 113.9869,22.4667, 113.9877,22.4670, 113.9878,22.4676,
 113.9888,22.4679, 113.9900,22.4694, 113.9912,22.4695, 113.9926,22.4719,
 113.9933,22.4722, 113.9937,22.4739, 113.9945,22.4754, 113.9950,22.4755,
 113.9955,22.4791, 113.9961,22.4799, 113.9969,22.4799, 113.9974,22.4806,
 113.9982,22.4809, 113.9983,22.4814, 113.9990,22.4817, 113.9992,22.4827,
 114.0014,22.4833, 114.0049,22.4830, 114.0050,22.4826, 114.0058,22.4823,
 114.0063,22.4816, 114.0075,22.4815, 114.0083,22.4808, 114.0101,22.4807,
 114.0110,22.4799, 114.0119,22.4799, 114.0125,22.4782, 114.0126,22.4745,
 114.0121,22.4717, 114.0115,22.4712, 114.0097,22.4709, 114.0103,22.4704,
 114.0126,22.4700, 114.0126,22.4696, 114.0132,22.4695, 114.0141,22.4700,
 114.0146,22.4718, 114.0153,22.4728, 114.0164,22.4731, 114.0168,22.4737,
 114.0180,22.4739, 114.0189,22.4746, 114.0212,22.4750, 114.0212,22.4754,
 114.0221,22.4757, 114.0225,22.4763, 114.0233,22.4764, 114.0239,22.4774,
 114.0244,22.4816, 114.0256,22.4821, 114.0263,22.4862, 114.0278,22.4871,
 114.0279,22.4882, 114.0297,22.4895, 114.0298,22.4901, 114.0307,22.4904,
 114.0308,22.4910, 114.0325,22.4918, 114.0335,22.4921, 114.0337,22.4927,
 114.0345,22.4930, 114.0346,22.4935, 114.0355,22.4939, 114.0356,22.4945,
 114.0374,22.4958, 114.0375,22.4968, 114.0381,22.4972, 114.0393,22.4972,
 114.0393,22.4972, 114.0394,22.4972, 114.0395,22.4972, 114.0397,22.4972,
 114.0399,22.4972, 114.0404,22.4973, 114.0415,22.4980, 114.0430,22.4979,
 114.0432,22.4975, 114.0463,22.4971, 114.0470,22.4966, 114.0494,22.4963,
 114.0515,22.4971, 114.0546,22.4975, 114.0547,22.4979, 114.0555,22.4982,
 114.0556,22.4987, 114.0562,22.4989, 114.0569,22.5032, 114.0574,22.5036,
 114.0577,22.5049, 114.0584,22.5051, 114.0585,22.5057, 114.0593,22.5060,
 114.0595,22.5065, 114.0603,22.5069, 114.0604,22.5074, 114.0614,22.5077,
 114.0623,22.5090, 114.0654,22.5093, 114.0666,22.5101, 114.0684,22.5102,
 114.0697,22.5110, 114.0728,22.5107, 114.0728,22.5103, 114.0737,22.5100,
 114.0741,22.5093, 114.0753,22.5092, 114.0760,22.5085, 114.0774,22.5086,
 114.0779,22.5092, 114.0791,22.5093, 114.0795,22.5100, 114.0804,22.5103,
 114.0808,22.5110, 114.0820,22.5111, 114.0824,22.5117, 114.0831,22.5120,
 114.0836,22.5136, 114.0842,22.5135, 114.0842,22.5131, 114.0872,22.5128,
 114.0881,22.5122, 114.0887,22.5111, 114.0894,22.5041, 114.0898,22.5039,
 114.0899,22.5020, 114.0891,22.5012, 114.0890,22.5001, 114.0882,22.4997,
 114.0881,22.4984, 114.0887,22.4980, 114.0894,22.4868, 114.0899,22.4865,
 114.0900,22.4854, 114.0906,22.4851, 114.0909,22.4834, 114.0906,22.4804,
 114.0899,22.4792, 114.0894,22.4790, 114.0890,22.4769, 114.0881,22.4761,
 114.0880,22.4750, 114.0875,22.4747, 114.0871,22.4701, 114.0875,22.4626,
 114.0880,22.4622, 114.0881,22.4615, 114.0913,22.4608, 114.0967,22.4611,
 114.0970,22.4616, 114.0982,22.4617, 114.0989,22.4625, 114.1001,22.4626,
 114.1005,22.4631, 114.1052,22.4635, 114.1076,22.4642, 114.1095,22.4643,
 114.1104,22.4651, 114.1118,22.4650, 114.1123,22.4643, 114.1135,22.4642,
 114.1139,22.4636, 114.1148,22.4633, 114.1152,22.4626, 114.1164,22.4625,
 114.1168,22.4618, 114.1176,22.4615, 114.1180,22.4609, 114.1192,22.4608,
 114.1196,22.4603, 114.1227,22.4597, 114.1234,22.4587, 114.1231,22.4565,
 114.1225,22.4563, 114.1224,22.4558, 114.1217,22.4555, 114.1214,22.4542,
 114.1196,22.4529, 114.1195,22.4523, 114.1188,22.4521, 114.1185,22.4505,
 114.1177,22.4503, 114.1176,22.4497, 114.1158,22.4484, 114.1156,22.4471,
 114.1149,22.4468, 114.1148,22.4463, 114.1139,22.4459, 114.1138,22.4454,
 114.1131,22.4451, 114.1127,22.4436, 114.1120,22.4433, 114.1119,22.4428,
 114.1111,22.4425, 114.1109,22.4419, 114.1104,22.4418, 114.1100,22.4397,
 114.1093,22.4391, 114.1091,22.4378, 114.1100,22.4368, 114.1104,22.4340,
 114.1109,22.4338, 114.1111,22.4333, 114.1118,22.4330, 114.1120,22.4317,
 114.1128,22.4311, 114.1130,22.4300, 114.1135,22.4297, 114.1142,22.4245,
 114.1148,22.4243, 114.1149,22.4238, 114.1157,22.4234, 114.1158,22.4229,
 114.1165,22.4226, 114.1169,22.4211, 114.1176,22.4208, 114.1177,22.4203,
 114.1186,22.4200, 114.1187,22.4194, 114.1194,22.4192, 114.1198,22.4177,
 114.1205,22.4174, 114.1206,22.4168, 114.1211,22.4167, 114.1215,22.4144,
 114.1211,22.4106, 114.1206,22.4105, 114.1205,22.4099, 114.1198,22.4096,
 114.1195,22.4083, 114.1180,22.4080, 114.1177,22.4075, 114.1119,22.4068,
 114.1119,22.4065, 114.1111,22.4061, 114.1109,22.4056, 114.1101,22.4053,
 114.1100,22.4047, 114.1091,22.4044, 114.1091,22.4040, 114.1062,22.4037,
 114.1011,22.4040, 114.1002,22.4045, 114.0987,22.4044, 114.0982,22.4037,
 114.0970,22.4036, 114.0951,22.4014, 114.0944,22.4003, 114.0932,22.4002,
 114.0927,22.3993, 114.0916,22.3986, 114.0903,22.3984, 114.0899,22.3978,
 114.0884,22.3977, 114.0875,22.3984, 114.0852,22.3988, 114.0851,22.3992,
 114.0836,22.3993, 114.0829,22.3986, 114.0817,22.3984, 114.0813,22.3978,
 114.0805,22.3975, 114.0804,22.3969, 114.0795,22.3966, 114.0794,22.3961,
 114.0786,22.3957, 114.0785,22.3954, 114.0762,22.3950, 114.0753,22.3942,
 114.0740,22.3941, 114.0719,22.3931, 114.0718,22.3926, 114.0709,22.3923,
 114.0709,22.3919, 114.0685,22.3915, 114.0676,22.3908, 114.0664,22.3907,
 114.0660,22.3900, 114.0645,22.3899]],
 YTM:[
[
 114.1635,22.2950, 114.1627,22.2962, 114.1617,22.2965, 114.1616,22.2971,
 114.1607,22.2974, 114.1607,22.2978, 114.1626,22.2984, 114.1622,22.2989,
 114.1610,22.2992, 114.1607,22.3006, 114.1610,22.3033, 114.1614,22.3035,
 114.1616,22.3054, 114.1613,22.3059, 114.1607,22.3057, 114.1606,22.3052,
 114.1598,22.3049, 114.1594,22.3042, 114.1582,22.3041, 114.1574,22.3033,
 114.1563,22.3032, 114.1555,22.3025, 114.1543,22.3024, 114.1540,22.3021,
 114.1540,22.3019, 114.1539,22.3017, 114.1536,22.3016, 114.1533,22.3016,
 114.1528,22.3016, 114.1524,22.3016, 114.1522,22.3016, 114.1521,22.3016,
 114.1521,22.3016, 114.1515,22.3016, 114.1511,22.3035, 114.1515,22.3068,
 114.1519,22.3068, 114.1520,22.3075, 114.1515,22.3076, 114.1511,22.3098,
 114.1505,22.3108, 114.1502,22.3149, 114.1507,22.3168, 114.1512,22.3171,
 114.1525,22.3172, 114.1530,22.3178, 114.1530,22.3185, 114.1521,22.3192,
 114.1519,22.3205, 114.1512,22.3208, 114.1511,22.3213, 114.1502,22.3216,
 114.1501,22.3222, 114.1493,22.3225, 114.1491,22.3230, 114.1484,22.3233,
 114.1483,22.3235, 114.1483,22.3241, 114.1483,22.3241, 114.1483,22.3242,
 114.1483,22.3244, 114.1483,22.3247, 114.1483,22.3251, 114.1497,22.3257,
 114.1559,22.3261, 114.1560,22.3265, 114.1568,22.3268, 114.1569,22.3274,
 114.1577,22.3277, 114.1582,22.3283, 114.1594,22.3284, 114.1597,22.3289,
 114.1668,22.3292, 114.1689,22.3287, 114.1696,22.3206, 114.1702,22.3203,
 114.1703,22.3192, 114.1711,22.3184, 114.1713,22.3167, 114.1727,22.3148,
 114.1731,22.3138, 114.1740,22.3135, 114.1741,22.3130, 114.1748,22.3127,
 114.1752,22.3112, 114.1759,22.3109, 114.1760,22.3104, 114.1767,22.3101,
 114.1771,22.3086, 114.1778,22.3083, 114.1779,22.3078, 114.1786,22.3075,
 114.1790,22.3058, 114.1798,22.3043, 114.1804,22.3042, 114.1808,22.3020,
 114.1815,22.3015, 114.1815,22.2999, 114.1808,22.2997, 114.1806,22.2989,
 114.1795,22.2982, 114.1780,22.2983, 114.1778,22.2988, 114.1770,22.2991,
 114.1766,22.2998, 114.1751,22.2997, 114.1749,22.2991, 114.1741,22.2988,
 114.1740,22.2983, 114.1733,22.2980, 114.1729,22.2965, 114.1722,22.2962,
 114.1721,22.2957, 114.1712,22.2953, 114.1712,22.2950, 114.1683,22.2946]]
};
/* [id, zh, en, ja, district, lon, lat, tier] */
const ISLPT=[
['LANTAU','大嶼山','Lantau Island','大嶼山','IS',113.9650,22.2580,1],
['HKISL','香港島','Hong Kong Island','香港島','S',114.2260,22.2470,2],
['CLK','赤鱲角','Chek Lap Kok','赤鱲角','IS',113.9247,22.3167,1],
['LAM','南丫島','Lamma Island','南丫島','IS',114.1258,22.2160,1],
['CC','長洲','Cheung Chau','長洲','IS',114.0300,22.2161,1],
['PC','坪洲','Peng Chau','坪洲','IS',114.0407,22.2891,2],
['HLC','喜靈洲','Hei Ling Chau','喜霊洲','IS',114.0369,22.2557,3],
['KYC','交椅洲','Kau Yi Chau','交椅洲','IS',114.0572,22.2916,3],
['SKC','石鼓洲','Shek Kwu Chau','石鼓洲','IS',113.9894,22.2024,3],
['SOK','索罟群島','Soko Islands','索罟群島','IS',113.9057,22.1824,3],
['TAC','大鴉洲','Tai A Chau','大鴉洲','IS',113.9057,22.1824,3],
['CKI','周公島','Sunshine Island','周公島','IS',114.0369,22.2557,3],
['PT','蒲台島','Po Toi Island','蒲台島','IS',114.2540,22.1769,2],
['LOC','螺洲','Beaufort Island','螺洲','IS',114.2431,22.1918,4],
['WGL','橫瀾島','Waglan Island','橫瀾島','IS',114.2966,22.1929,4],
['TY','青衣島','Tsing Yi','青衣島','KWT',114.1178,22.3455,1],
['MW','馬灣','Ma Wan','馬湾','TW',114.0595,22.3493,2],
['TMT','大磨刀','Tai Mo To','大磨刀','IS',113.9834,22.3383,4],
['LKC','龍鼓洲','Lung Kwu Chau','龍鼓洲','TM',113.8893,22.4098,4],
['ALC','鴨脷洲','Ap Lei Chau','鴨脷洲','S',114.1528,22.2413,2],
['GI','青洲','Green Island','青洲','CW',114.1105,22.2874,3],
['TLC','東龍洲','Tung Lung Chau','東龍洲','SK',114.2886,22.2538,2],
['KSC','滘西洲','Kau Sai Chau','滘西洲','SK',114.2846,22.3637,3],
['KTC','橋咀洲','Kiu Tsui Chau','橋咀洲','SK',114.2813,22.3771,3],
['TC','吊鐘洲','Jin Island','吊鐘洲','SK',114.3087,22.3494,3],
['BLC','火石洲','Basalt Island','火石洲','SK',114.3405,22.3209,3],
['STK','沙塘口山','Bluff Island','沙塘口山','SK',114.3405,22.3209,3],
['NP','果洲群島','Ninepin Group','果洲群島','SK',114.3603,22.2695,3],
['TM_I','塔門','Grass Island','塔門','TP',114.3620,22.4758,2],
['NGM','娥眉洲','Crescent Island','娥眉洲','TP',114.3225,22.4718,3],
['TPC','東平洲','Tung Ping Chau','東平洲','TP',114.4205,22.5331,2],
['DBI','往灣洲','Double Island','往湾洲','N',114.2912,22.5322,3],
['CI','吉澳','Crooked Island','吉澳','N',114.2912,22.5322,2],
['AC','鴨洲','Ap Chau','鴨洲','N',114.2912,22.5322,3],
['SAC','小鴉洲','Siu A Chau','小鴉洲','IS',113.9057,22.1824,4],
['SMT','小磨刀','Siu Mo To','小磨刀','IS',113.9834,22.3383,4],
['SHC','沙洲','Sha Chau','沙洲','TM',113.8920,22.3520,4],
['MDI','熨波洲','Middle Island','熨波洲','S',114.1939,22.2410,4],
['ALP','鴨脷排','Ap Lei Pai','鴨脷排','S',114.1258,22.2160,4],
['NMC','牛尾洲','Ngau Mei Chau','牛尾洲','SK',114.2896,22.3277,4],
['YTT','鹽田仔','Yim Tin Tsai','塩田仔','SK',114.2813,22.3771,4],
['CHC','赤洲','Port Island','赤洲','TP',114.3225,22.4718,3],
['PLC','白腊洲','Pak Lap Chau','白腊洲','SK',114.3602,22.3486,4],
['WCU','橫洲','Wang Chau','横洲','SK',114.3570,22.3154,4],
['TWC','塔門仔','Tap Mun Tsai','塔門仔','TP',114.3523,22.4678,4],
['KLW','高流灣','Ko Lau Wan Islet','高流湾','TP',114.3523,22.4678,4]
];
/* ==========================================================================
   THE EIGHTEEN DISTRICTS

   Population, age structure and median age are the 2021 Population Census
   (Census and Statistics Department), which is the last complete enumeration.
   den is the density published with that census, in persons per square
   kilometre. area is derived as pop/den and is therefore on the census basis:
   it excludes the major inland water bodies, which is why the eighteen sum to
   about 1,089 km² against the roughly 1,114 km² of land usually quoted.

   hi is the highest ground in the district. Summits that stand on a boundary
   are entered under one district only; the choice is stated in the notes.
   ========================================================================== */
const DIV=[
{id:'CW',zh:'中西區',en:'Central and Western',rom:'Zhongxi',reg:'hki',
 seat:'中環',seatEn:'Central',pop:235953,den:18808,area:12.55,
 med:44.8,a0:10.3,a1:70.4,a2:19.3,hiZh:'太平山',hiEn:'Victoria Peak',hiM:552,
 nZh:'英軍於道光二十一年正月二十六日（1841年1月26日）在水坑口登陸，香港開埠自此地始。維多利亞城四環九約之核心，政府山、中區警署與大會堂皆在其內。今為特區政府總部以外之金融與司法重心，終審法院、香港交易所俱設於此。',
 nEn:'British forces landed at Possession Point on 26 January 1841, and the settlement of Hong Kong began here. This was the core of the City of Victoria; Government Hill, the Central Police Station and the City Hall all stand within it. It remains the judicial and financial centre, holding the Court of Final Appeal and the Stock Exchange.',
 hZh:['水坑口街，1841年登陸處','終審法院、香港交易所','太平山為港島最高點（552公尺）','山頂纜車1888年通車，為亞洲最早'],
 hEn:['Possession Street, the landing place of 1841','Court of Final Appeal and the Stock Exchange','Victoria Peak, the highest ground on the island at 552 m','The Peak Tram, opened 1888, the earliest funicular in Asia']},

{id:'WC',zh:'灣仔區',en:'Wan Chai',rom:'Wanzai',reg:'hki',
 seat:'灣仔',seatEn:'Wan Chai',pop:166695,den:15791,area:10.56,
 med:46.0,a0:10.1,a1:68.6,a2:21.2,hiZh:'聶高信山',hiEn:'Mount Nicholson',hiM:430,
 nZh:'原為維多利亞城下環，「灣仔」意為小海灣。歷經四次填海，海岸線自皇后大道東北移逾半公里。金鐘一帶為駐港英軍域多利兵房舊址，1979年撤營後改建為太古廣場與香港公園。區內人口最少，而中位年齡偏高。',
 nEn:'Formerly the lower ring of the City of Victoria; the name means "little bay". Four rounds of reclamation have carried the shoreline more than half a kilometre north of Queen\'s Road East. Admiralty stands on the site of the Victoria Barracks, given up in 1979 and rebuilt as Pacific Place and Hong Kong Park. The least populous district, with an older-than-average population.',
 hZh:['香港會議展覽中心，1997年主權轉移儀式場地','跑馬地馬場，1846年首次賽馬','藍屋、和昌大押等戰前唐樓','區內人口為十八區之末'],
 hEn:['The Convention and Exhibition Centre, where the transfer ceremony was held in 1997','Happy Valley Racecourse, first raced in 1846','Pre-war tenements at the Blue House and Woo Cheong Pawn Shop','The smallest district by population']},

{id:'E',zh:'東區',en:'Eastern',rom:'Dong',reg:'hki',
 seat:'筲箕灣',seatEn:'Shau Kei Wan',pop:529603,den:29440,area:17.99,
 med:49.0,a0:9.7,a1:66.9,a2:23.4,hiZh:'柏架山',hiEn:'Mount Parker',hiM:532,
 nZh:'自銅鑼灣東緣伸至小西灣。北角於1950年前後聚居大量上海移民，有「小上海」之稱；其後福建籍移民繼至。太古糖廠與太古船塢舊址於1970年代改建為太古城，為早期大型私人屋苑之一。中位年齡四十九歲，居十八區之次高。',
 nEn:'Runs from the eastern edge of Causeway Bay to Siu Sai Wan. North Point drew so many Shanghainese after 1950 that it was known as Little Shanghai; Fujianese settlement followed. The Taikoo Sugar Refinery and Taikoo Dockyard were redeveloped in the 1970s as Taikoo Shing, among the first of the large private estates. Its median age of forty-nine is the second highest of the eighteen.',
 hZh:['鰂魚涌太古船塢舊址','筲箕灣譚公廟與避風塘','柴灣羅屋為客家村屋遺存','港島東走廊，1980年代填海所築'],
 hEn:['The former Taikoo Dockyard at Quarry Bay','Tam Kung Temple and the typhoon shelter at Shau Kei Wan','Law Uk, a surviving Hakka village house at Chai Wan','The Island Eastern Corridor, built out on reclamation in the 1980s']},

{id:'S',zh:'南區',en:'Southern',rom:'Nan',reg:'hki',
 seat:'香港仔',seatEn:'Aberdeen',pop:263278,den:6779,area:38.84,
 med:48.1,a0:10.4,a1:68.1,a2:21.6,hiZh:'奇力山',hiEn:'Mount Kellett',hiM:501,
 nZh:'港島面積最大而人口密度最低之區，兼有薄扶林、香港仔、深水灣、淺水灣、赤柱、石澳與鴨脷洲。「香港」之名或出自香港仔一帶轉運莞香之港口。1841年英人所遇之「阿群帶路」傳說亦繫於此。區內郊野公園與水塘佔地甚廣。',
 nEn:'The largest and least dense district on the island, taking in Pok Fu Lam, Aberdeen, Deep Water Bay, Repulse Bay, Stanley, Shek O and Ap Lei Chau. The name Hong Kong is often traced to the incense-shipping harbour at Aberdeen. Country parks and reservoirs cover a large part of its area.',
 hZh:['香港仔避風塘與水上人聚落','赤柱為戰前警署與二戰拘留營所在','薄扶林水塘，1863年香港首座水塘','海洋公園，1977年開幕'],
 hEn:['The Aberdeen typhoon shelter and its boat-dwelling community','Stanley, with its pre-war police station and wartime internment camp','Pok Fu Lam Reservoir, the territory\'s first, of 1863','Ocean Park, opened 1977']},

{id:'YTM',zh:'油尖旺區',en:'Yau Tsim Mong',rom:'Youjianwang',reg:'kln',
 seat:'旺角',seatEn:'Mong Kok',pop:310647,den:44458,area:6.99,
 med:44.0,a0:11.6,a1:70.5,a2:17.9,hiZh:'京士柏',hiEn:'King\'s Park',hiM:65,
 nZh:'1994年由油尖區與旺角區合併。面積為十八區最小。尖沙咀為1860年《北京條約》割讓九龍之南端，九廣鐵路舊總站鐘樓仍在。旺角一帶街道密度極高，1990年代曾錄得世界最高人口密度之街區。',
 nEn:'Formed in 1994 by merging the Yau Tsim and Mong Kok districts; the smallest of the eighteen by area. Tsim Sha Tsui is the southern tip of the Kowloon peninsula ceded by the Convention of Peking in 1860, and the clock tower of the old Kowloon terminus still stands. The street grid at Mong Kok is exceptionally close, and in the 1990s recorded some of the highest population densities measured anywhere.',
 hZh:['前九廣鐵路鐘樓，1915年建','天星小輪尖沙咀碼頭，1888年開航','油麻地果欄與天后廟','西九文化區，2010年代填海地'],
 hEn:['The clock tower of the former Kowloon–Canton Railway terminus, built 1915','The Star Ferry pier at Tsim Sha Tsui; the service began in 1888','The Yau Ma Tei fruit market and Tin Hau temple','The West Kowloon Cultural District, on reclamation of the 2010s']},

{id:'SSP',zh:'深水埗區',en:'Sham Shui Po',rom:'Shenshuibu',reg:'kln',
 seat:'長沙灣',seatEn:'Cheung Sha Wan',pop:431090,den:46067,area:9.36,
 med:46.2,a0:11.4,a1:68.2,a2:20.4,hiZh:'筆架山',hiEn:'Beacon Hill',hiM:457,
 nZh:'1953年12月25日石硤尾木屋區大火，五萬餘人一夜無家可歸，港府翌年興建徙置大廈，公共房屋制度自此發端。李鄭屋漢墓1955年出土，證東漢時已有聚落。今仍為家庭收入中位數最低之區之一。',
 nEn:'The Shek Kip Mei squatter fire of 25 December 1953 left more than fifty thousand people homeless overnight; the resettlement blocks put up the following year began the public housing programme. The Lei Cheng Uk tomb, uncovered in 1955, shows settlement here in the Eastern Han. It remains among the districts of lowest median household income.',
 hZh:['石硤尾邨美荷樓，1954年首批徙置大廈','李鄭屋漢墓，約東漢（25–220）','深水埗軍營二戰戰俘營舊址','鴨寮街電子舊貨市集'],
 hEn:['Mei Ho House at Shek Kip Mei, one of the first resettlement blocks of 1954','The Lei Cheng Uk Han tomb, Eastern Han, 25–220','The former Sham Shui Po Barracks, a prisoner-of-war camp in the Second World War','The electronics and second-hand market on Apliu Street']},

{id:'KC',zh:'九龍城區',en:'Kowloon City',rom:'Jiulongcheng',reg:'kln',
 seat:'土瓜灣',seatEn:'To Kwa Wan',pop:410634,den:40994,area:10.02,
 med:45.4,a0:12.3,a1:67.7,a2:20.1,hiZh:'獅子山',hiEn:'Lion Rock',hiM:495,
 nZh:'九龍寨城為1898年《展拓香港界址專條》所留之清朝飛地，中英兩方長期爭議，1987年議定拆卸，1994年清空，1995年闢為寨城公園。啟德機場自1925年至1998年在此運作，跑道伸入九龍灣，降落航道貼近民居，為世界知名之進場。',
 nEn:'Kowloon Walled City was the Qing enclave left standing by the Convention of 1898; long disputed between the two governments, its clearance was agreed in 1987, completed in 1994, and the site opened as a park in 1995. Kai Tak airport operated here from 1925 to 1998, its runway thrust into Kowloon Bay and its approach passing close over the rooftops.',
 hZh:['九龍寨城公園，1995年開放','啟德機場舊址，1925–1998','宋王臺石刻，記1277年宋帝南遷','九龍城「小泰國」泰裔聚居'],
 hEn:['Kowloon Walled City Park, opened 1995','The site of Kai Tak airport, 1925 to 1998','The Sung Wong Toi inscription, recalling the Song court\'s flight of 1277','The Thai community at Kowloon City, known as Little Thailand']},

{id:'WTS',zh:'黃大仙區',en:'Wong Tai Sin',rom:'Huangdaxian',reg:'kln',
 seat:'黃大仙',seatEn:'Wong Tai Sin',pop:406802,den:43730,area:9.30,
 med:50.1,a0:8.9,a1:68.1,a2:23.0,hiZh:'大老山',hiEn:'Tate’s Cairn',hiM:577,
 nZh:'十八區中唯一不臨海者。以嗇色園黃大仙祠得名，該祠1921年由西樵普慶壇移建。公營房屋比例為全港最高，逾七成居民住於公屋或資助房屋。中位年齡五十點一歲，為十八區之首。',
 nEn:'The only landlocked district. It takes its name from the Wong Tai Sin temple, moved here from Sai Chiu in 1921. It has the highest proportion of public housing in the territory, with more than seven in ten residents in public rental or subsidised flats. Its median age of 50.1 is the highest of the eighteen.',
 hZh:['嗇色園黃大仙祠，1921年建','慈雲山、樂富、橫頭磡等大型公共屋邨','獅子山為香港精神象徵','為唯一不臨海之區'],
 hEn:['The Sik Sik Yuen Wong Tai Sin Temple, built 1921','The large public estates at Tsz Wan Shan, Lok Fu and Wang Tau Hom','Lion Rock, taken as an emblem of the Hong Kong temperament','The only district without a coastline']},

{id:'KT',zh:'觀塘區',en:'Kwun Tong',rom:'Guantang',reg:'kln',
 seat:'觀塘',seatEn:'Kwun Tong',pop:673166,den:59704,area:11.28,
 med:48.0,a0:10.4,a1:67.6,a2:21.9,hiZh:'大上托',hiEn:'Tai Sheung Tok',hiM:399,
 nZh:'人口密度為全港之冠，每平方公里近六萬人。宋代此地為官富場鹽田，「官塘」之名由是而來。1950年代闢為衛星城市，設香港首個工業區，紡織、塑膠、電子廠林立；1990年代以後工業北移，觀塘商貿區為現行更新計畫。',
 nEn:'The densest district in the territory, at close to sixty thousand people to the square kilometre. In the Song this was the salt field of Kwun Fu Cheung, from which the name descends. Laid out as a satellite town in the 1950s with the territory\'s first industrial estate, it filled with textile, plastics and electronics works; after industry moved north in the 1990s the area entered a long programme of renewal.',
 hZh:['人口密度全港最高','宋代官富場鹽田舊地','1957年香港首個衛星市鎮','鯉魚門為維多利亞港東面海口'],
 hEn:['The highest population density in the territory','The site of the Song dynasty Kwun Fu Cheung salt field','Laid out in 1957 as the first satellite town','Lei Yue Mun, the eastern gate of Victoria Harbour']},

{id:'KWT',zh:'葵青區',en:'Kwai Tsing',rom:'Kuiqing',reg:'nt',
 seat:'葵涌',seatEn:'Kwai Chung',pop:495798,den:21246,area:23.33,
 med:48.0,a0:10.0,a1:68.0,a2:22.1,hiZh:'金山',hiEn:'Golden Hill',hiM:369,
 nZh:'1985年自荃灣區分出。葵青貨櫃碼頭共九個泊位，1987年至2004年間香港曾多年為世界吞吐量第一之貨櫃港，其作業集中於此。青衣島原為漁村與船廠所在，今設油庫、船塢與發電設施。',
 nEn:'Separated from Tsuen Wan District in 1985. The Kwai Tsing container terminals have nine berths, and it was on them that Hong Kong\'s standing as the world\'s busiest container port, held for much of the period from 1987 to 2004, rested. Tsing Yi, once fishing villages and shipyards, now carries oil terminals, dockyards and power plant.',
 hZh:['葵青貨櫃碼頭，九個貨櫃泊位','青馬大橋，1997年通車','青衣島於1970年代填海擴地','1985年由荃灣區分出'],
 hEn:['The Kwai Tsing container terminals, with nine berths','Tsing Ma Bridge, opened 1997','Tsing Yi, much enlarged by reclamation in the 1970s','Separated from Tsuen Wan District in 1985']},

{id:'TW',zh:'荃灣區',en:'Tsuen Wan',rom:'Quanwan',reg:'nt',
 seat:'荃灣',seatEn:'Tsuen Wan',pop:320094,den:5168,area:61.94,
 med:45.4,a0:11.8,a1:70.0,a2:18.1,hiZh:'大帽山',hiEn:'Tai Mo Shan',hiM:957,
 nZh:'1961年闢為香港首個新市鎮。轄域自荃灣市區沿青山公路西展至深井、青龍頭，北括大帽山主峰，另跨海管有馬灣及大嶼山東北之竹篙灣、欣澳一帶。全港最高峰大帽山（957公尺）在其境內。',
 nEn:'Designated in 1961 as the territory\'s first new town. The district runs west along Castle Peak Road to Sham Tseng and Tsing Lung Tau, reaches north to the summit of Tai Mo Shan, and takes in Ma Wan across the water together with Penny\'s Bay and Sunny Bay on the north-east of Lantau. Tai Mo Shan, at 957 m the highest ground in Hong Kong, stands within it.',
 hZh:['大帽山957公尺，全港最高','香港首個新市鎮，1961年','三棟屋博物館，客家圍村舊址','轄有馬灣及大嶼山東北一隅'],
 hEn:['Tai Mo Shan, 957 m, the highest point in Hong Kong','The first new town, designated 1961','Sam Tung Uk Museum, a former Hakka walled village','Administers Ma Wan and a corner of north-east Lantau']},

{id:'TM',zh:'屯門區',en:'Tuen Mun',rom:'Tunmen',reg:'nt',
 seat:'屯門',seatEn:'Tuen Mun',pop:506879,den:5908,area:85.80,
 med:46.1,a0:10.7,a1:70.0,a2:19.3,hiZh:'青山',hiEn:'Castle Peak',hiM:583,
 nZh:'唐開元二十四年（736）設屯門鎮，駐兵二千，為嶺南海防要衝，見於《新唐書》。青山禪院相傳始於劉宋，為香港三大古剎之一。1970年代闢為新市鎮，原名青山，1973年正名屯門。',
 nEn:'A garrison of two thousand was posted at Tuen Mun in 736, guarding the sea approach to Guangdong; the New Book of Tang records it. Tsing Shan Monastery is by tradition the oldest of the territory\'s three great temples, its foundation put in the Liu Song. Developed as a new town in the 1970s, first as Castle Peak and from 1973 under its present name.',
 hZh:['唐開元二十四年（736）設屯門鎮','青山禪院，香港三大古剎之一','龍鼓灘與稔灣，全港最西之陸岸','1970年代新市鎮，1973年正名'],
 hEn:['A Tang garrison established here in 736','Tsing Shan Monastery, one of the three great temples of Hong Kong','Lung Kwu Tan and Nim Wan, the westernmost mainland shore','Developed as a new town in the 1970s, renamed in 1973']},

{id:'YL',zh:'元朗區',en:'Yuen Long',rom:'Yuanlang',reg:'nt',
 seat:'元朗',seatEn:'Yuen Long',pop:668080,den:4825,area:138.46,
 med:43.7,a0:11.6,a1:73.4,a2:15.0,hiZh:'雞公嶺',hiEn:'Kai Kung Leng',hiM:585,
 nZh:'新界西北沖積平原，歷來為稻米與基圍蝦產區。錦田、屏山、廈村為鄧氏聚居之地，屏山鄧氏聚星樓為香港僅存古塔。米埔后海灣濕地1995年列為《拉姆薩公約》國際重要濕地，面積1,500公頃，為東亞候鳥遷徙要站。中位年齡四十三點七歲，為十八區之次低。',
 nEn:'The alluvial plain of the north-west New Territories, long given to rice and to shrimp ponds. Kam Tin, Ping Shan and Ha Tsuen are Tang clan country; the Tsui Sing Lau pagoda at Ping Shan is the only ancient pagoda left in Hong Kong. The Mai Po and Inner Deep Bay wetland, 1,500 hectares, was listed under the Ramsar Convention in 1995 and is a principal staging ground on the East Asian flyway.',
 hZh:['米埔拉姆薩濕地，1995年列冊，1,500公頃','屏山聚星樓，香港僅存古塔','錦田吉慶圍，鄧氏圍村','人口居十八區之次，僅次於沙田'],
 hEn:['The Mai Po Ramsar site, listed 1995, of 1,500 hectares','Tsui Sing Lau, the only ancient pagoda in Hong Kong','Kat Hing Wai at Kam Tin, a Tang walled village','The second most populous district, after Sha Tin']},

{id:'N',zh:'北區',en:'North',rom:'Bei',reg:'nt',
 seat:'上水',seatEn:'Sheung Shui',pop:309631,den:2269,area:136.46,
 med:46.3,a0:10.8,a1:71.2,a2:17.9,hiZh:'黃嶺',hiEn:'Wong Leng',hiM:639,
 nZh:'北界深圳河，設羅湖、文錦渡、沙頭角、落馬洲及蓮麻坑五處陸路口岸。沙頭角中英街以界碑分屬兩地，為1898年勘界所遺。上水廖氏、粉嶺彭氏、河上鄉侯氏皆為新界大族。邊境禁區自1951年設立，2012年起分階段解禁。',
 nEn:'Bounded to the north by the Sham Chun River, with five land crossings at Lo Wu, Man Kam To, Sha Tau Kok, Lok Ma Chau and Lin Ma Hang. Chung Ying Street at Sha Tau Kok is divided by boundary stones set at the demarcation of 1898. The Liu of Sheung Shui, the Pang of Fanling and the Hau of Ho Sheung Heung are all great clans of the New Territories. The Frontier Closed Area, established in 1951, has been opened in stages since 2012.',
 hZh:['沙頭角中英街，1898年勘界所遺','八仙嶺，黃嶺639公尺','上水廖氏、粉嶺彭氏聚居','人口密度為十八區最低'],
 hEn:['Chung Ying Street at Sha Tau Kok, a survival of the 1898 demarcation','The Pat Sin Leng range, rising to Wong Leng at 639 m','Seat of the Liu of Sheung Shui and the Pang of Fanling','The lowest population density of the eighteen']},

{id:'TP',zh:'大埔區',en:'Tai Po',rom:'Dabu',reg:'nt',
 seat:'大埔',seatEn:'Tai Po',pop:316470,den:2325,area:136.12,
 med:45.7,a0:10.9,a1:70.7,a2:18.5,hiZh:'四方山',hiEn:'Sze Fong Shan',hiM:785,
 nZh:'吐露港昔稱大步海，五代南漢曾置媚川都採珠，役民數千。1899年英人接管新界，鄉民於大埔墟抗拒，「新界六日戰」由此發端。船灣淡水湖1968年建成，為世界首座於海中築堤而成之水庫。本區由大埔本部與西貢北兩片組成，後者為西貢半島北部，隔吐露港與赤門海峽與主體相望，陸路不相連，為全港唯一之飛地。西貢北含塔門、東平洲、赤徑、深涌及十四鄉諸村，全區面積約14,800公頃，居十八區之次。',
 nEn:'Tolo Harbour was the old Tai Pou Hoi, where the Southern Han kept a pearl-fishing corps in the tenth century, working thousands of men. When the British took over the New Territories in 1899 the villagers resisted at Tai Po Market, opening the Six-Day War. Plover Cove Reservoir, completed in 1968, was the first reservoir in the world made by damming an arm of the sea. The district is made up of two pieces: Tai Po proper and Sai Kung North, the northern half of the Sai Kung Peninsula, which faces it across Tolo Harbour and the Tolo Channel and touches it nowhere by land. Sai Kung North takes in Tap Mun, Tung Ping Chau, Chek Keng, Sham Chung and the villages of Shap Sze Heung; at some 14,800 hectares the district is the second largest of the eighteen.',
 hZh:['船灣淡水湖，1968年，世界首座海中水庫','1899年新界六日戰起於大埔','南漢媚川都採珠舊地','西貢北為全港唯一飛地，含蚺蛇尖468公尺'],
 hEn:['Plover Cove Reservoir, 1968, the first reservoir dammed from the sea','The Six-Day War of 1899 began at Tai Po','The pearl fishery of the Southern Han','Sai Kung North, the only exclave in Hong Kong, reaching Sharp Peak at 468 m']},

{id:'ST',zh:'沙田區',en:'Sha Tin',rom:'Shatian',reg:'nt',
 seat:'沙田',seatEn:'Sha Tin',pop:692806,den:10082,area:68.72,
 med:46.2,a0:11.4,a1:68.6,a2:20.0,hiZh:'馬鞍山',hiEn:'Ma On Shan',hiM:702,
 nZh:'人口居十八區之首。原為沙田海淺灘，1970年代大規模填海闢為新市鎮，海灣縮為城門河道。香港中文大學1963年創校於馬料水。沙田馬場1978年啟用，為第二座馬場。馬鞍山昔有鐵礦，1906年至1976年開採。',
 nEn:'The most populous district. The shallows of Sha Tin Hoi were reclaimed on a great scale in the 1970s to build the new town, the inlet reduced to the Shing Mun River channel. The Chinese University of Hong Kong was founded at Ma Liu Shui in 1963. Sha Tin Racecourse, the second in the territory, opened in 1978. Iron was mined at Ma On Shan from 1906 until 1976.',
 hZh:['人口居十八區之首','香港中文大學，1963年創校','馬鞍山鐵礦，1906–1976','萬佛寺、曾大屋、車公廟'],
 hEn:['The most populous of the eighteen districts','The Chinese University of Hong Kong, founded 1963','The Ma On Shan iron mine, 1906 to 1976','The Ten Thousand Buddhas Monastery, Tsang Tai Uk and the Che Kung Temple']},

{id:'SK',zh:'西貢區',en:'Sai Kung',rom:'Xigong',reg:'nt',
 seat:'西貢',seatEn:'Sai Kung',pop:489037,den:3771,area:129.68,
 med:44.7,a0:11.5,a1:72.7,a2:15.8,hiZh:'飛鵝山',hiEn:'Kowloon Peak',hiM:602,
 nZh:'轄西貢半島南部、清水灣半島與將軍澳新市鎮，人口逾九成集中於後者。半島北部（西貢北）自1980年代起隸屬大埔區，故本區之界止於北潭凹一線。萬宜水庫東壩之六角形火山岩柱，為一億四千萬年前流紋質火山灰所結，2011年隨香港世界地質公園列入教科文組織名錄。',
 nEn:'Takes in the southern Sai Kung Peninsula, the Clear Water Bay peninsula and the new town at Tseung Kwan O, where more than nine tenths of the population live. The northern half of the peninsula, Sai Kung North, is administered from Tai Po, so this district stops at the line through Pak Tam Au. The hexagonal columns at the East Dam of High Island, formed in rhyolitic ash some 140 million years ago, were listed with the Hong Kong Global Geopark by UNESCO in 2011.',
 hZh:['萬宜水庫六角形火山岩柱，約1.4億年','糧船灣洲以東西兩壩接連本土','將軍澳新市鎮，1980年代闢建','西貢北屬大埔區，本區止於北潭凹'],
 hEn:['The hexagonal volcanic columns at High Island, some 140 million years old','High Island joined to the mainland by the East and West dams','The new town at Tseung Kwan O, laid out in the 1980s','Sai Kung North is administered from Tai Po; this district stops at Pak Tam Au']},

{id:'IS',zh:'離島區',en:'Islands',rom:'Lidao',reg:'nt',
 seat:'東涌',seatEn:'Tung Chung',pop:185282,den:1021,area:181.47,
 med:42.7,a0:12.8,a1:72.4,a2:14.7,hiZh:'鳳凰山',hiEn:'Lantau Peak',hiM:934,
 nZh:'面積為十八區之最，人口密度為最低。轄大嶼山大部、長洲、坪洲、南丫島、蒲台群島及赤鱲角。1898年前東涌炮台、汛房為清軍所守。香港國際機場1998年7月6日於赤鱲角啟用，陸地大半為填海所得。中位年齡四十二點七歲，為十八區之最低。',
 nEn:'The largest district by area and the least dense. It holds most of Lantau together with Cheung Chau, Peng Chau, Lamma, the Po Toi group and Chek Lap Kok. Before 1898 the Qing kept a fort and guard posts at Tung Chung. Hong Kong International Airport opened at Chek Lap Kok on 6 July 1998, most of its ground reclaimed from the sea. Its median age of 42.7 is the lowest of the eighteen.',
 hZh:['香港國際機場，1998年7月6日啟用','鳳凰山934公尺，全港第二高','東涌炮台，清嘉慶年間所築','面積最大而人口密度最低'],
 hEn:['Hong Kong International Airport, opened 6 July 1998','Lantau Peak at 934 m, the second highest summit','Tung Chung Fort, built in the Jiaqing reign','The largest in area and the least dense in population']}
];

/* Japanese renderings of the district notes, where the character-substitution
   rule is not sufficient. */
const NJA={};
const HJA={};

/* ==========================================================================
   MAP CONTENT

   PLACE   [zh, en, ja, lon, lat, tier]   tier 1 shows first, 4 last
   PEAKPT  [zh, en, lon, lat, metres]
   WATERB  [zh, en, lon, lat, rx, ry]     reservoirs, as ellipses in degrees
   SPINE   [zh, en, weight, [lon, lat, elev, ...]]
   COURSE  [zh, en, [lon, lat, ...]]
   PARKP   [zh, en, [lon, lat, ...]]
   ========================================================================== */

const PLACE=[
['中環','Central','中環',114.1580,22.2810,1],
['尖沙咀','Tsim Sha Tsui','尖沙咀',114.1720,22.2970,1],
['旺角','Mong Kok','旺角',114.1700,22.3190,1],
['銅鑼灣','Causeway Bay','銅鑼湾',114.1850,22.2800,1],
['觀塘','Kwun Tong','観塘',114.2250,22.3120,1],
['沙田','Sha Tin','沙田',114.1880,22.3820,1],
['荃灣','Tsuen Wan','荃湾',114.1170,22.3710,1],
['元朗','Yuen Long','元朗',114.0320,22.4450,1],
['屯門','Tuen Mun','屯門',113.9730,22.3920,1],
['上水','Sheung Shui','上水',114.1280,22.5010,1],
['大埔','Tai Po','大埔',114.1700,22.4500,1],
['將軍澳','Tseung Kwan O','将軍澳',114.2600,22.3080,1],
['東涌','Tung Chung','東涌',113.9420,22.2890,1],
['西貢','Sai Kung','西貢',114.2740,22.3830,1],
['上環','Sheung Wan','上環',114.1500,22.2860,2],
['金鐘','Admiralty','金鐘',114.1650,22.2790,2],
['灣仔','Wan Chai','湾仔',114.1730,22.2775,2],
['北角','North Point','北角',114.1920,22.2910,2],
['鰂魚涌','Quarry Bay','鰂魚涌',114.2100,22.2880,2],
['筲箕灣','Shau Kei Wan','筲箕湾',114.2290,22.2790,2],
['柴灣','Chai Wan','柴湾',114.2370,22.2650,2],
['香港仔','Aberdeen','香港仔',114.1540,22.2480,2],
['赤柱','Stanley','赤柱',114.2160,22.2180,2],
['淺水灣','Repulse Bay','浅水湾',114.1950,22.2360,2],
['薄扶林','Pok Fu Lam','薄扶林',114.1310,22.2620,2],
['油麻地','Yau Ma Tei','油麻地',114.1710,22.3110,2],
['深水埗','Sham Shui Po','深水埗',114.1620,22.3300,2],
['長沙灣','Cheung Sha Wan','長沙湾',114.1520,22.3360,2],
['九龍城','Kowloon City','九龍城',114.1900,22.3300,2],
['紅磡','Hung Hom','紅磡',114.1830,22.3050,2],
['黃大仙','Wong Tai Sin','黄大仙',114.1940,22.3420,2],
['牛頭角','Ngau Tau Kok','牛頭角',114.2190,22.3230,2],
['藍田','Lam Tin','藍田',114.2360,22.3090,2],
['葵涌','Kwai Chung','葵涌',114.1290,22.3600,2],
['青衣','Tsing Yi','青衣',114.1050,22.3480,2],
['大圍','Tai Wai','大囲',114.1780,22.3730,2],
['馬鞍山','Ma On Shan','馬鞍山',114.2320,22.4250,2],
['粉嶺','Fanling','粉嶺',114.1390,22.4920,2],
['天水圍','Tin Shui Wai','天水囲',114.0040,22.4580,2],
['錦田','Kam Tin','錦田',114.0680,22.4430,2],
['大澳','Tai O','大澳',113.8640,22.2540,2],
['梅窩','Mui Wo','梅窩',114.0000,22.2650,2],
['長洲','Cheung Chau','長洲',114.0290,22.2100,2],
['榕樹灣','Yung Shue Wan','榕樹湾',114.1120,22.2280,2],
['清水灣','Clear Water Bay','清水湾',114.2900,22.2830,2],
['堅尼地城','Kennedy Town','堅尼地城',114.1270,22.2820,3],
['鴨脷洲','Ap Lei Chau','鴨脷洲',114.1540,22.2410,3],
['石澳','Shek O','石澳',114.2520,22.2290,3],
['大潭','Tai Tam','大潭',114.2140,22.2460,3],
['土瓜灣','To Kwa Wan','土瓜湾',114.1880,22.3160,3],
['何文田','Ho Man Tin','何文田',114.1830,22.3140,3],
['太子','Prince Edward','太子',114.1680,22.3250,3],
['石硤尾','Shek Kip Mei','石硤尾',114.1680,22.3320,3],
['美孚','Mei Foo','美孚',114.1380,22.3380,3],
['荔枝角','Lai Chi Kok','茘枝角',114.1480,22.3370,3],
['啟德','Kai Tak','啓徳',114.1990,22.3080,3],
['九龍灣','Kowloon Bay','九龍湾',114.2130,22.3230,3],
['鑽石山','Diamond Hill','鑽石山',114.2010,22.3400,3],
['慈雲山','Tsz Wan Shan','慈雲山',114.2020,22.3480,3],
['秀茂坪','Sau Mau Ping','秀茂坪',114.2320,22.3170,3],
['油塘','Yau Tong','油塘',114.2370,22.2960,3],
['鯉魚門','Lei Yue Mun','鯉魚門',114.2380,22.2930,3],
['調景嶺','Tiu Keng Leng','調景嶺',114.2530,22.3060,3],
['坑口','Hang Hau','坑口',114.2680,22.3160,3],
['蠔涌','Ho Chung','蠔涌',114.2500,22.3620,3],
['白沙灣','Pak Sha Wan','白沙湾',114.2680,22.3680,3],
['烏溪沙','Wu Kai Sha','烏渓沙',114.2360,22.4290,3],
['汀九','Ting Kau','汀九',114.0930,22.3690,3],
['深井','Sham Tseng','深井',114.0640,22.3690,3],
['青龍頭','Tsing Lung Tau','青龍頭',114.0520,22.3660,3],
['掃管笏','So Kwun Wat','掃管笏',114.0100,22.3720,3],
['藍地','Lam Tei','藍地',113.9840,22.4090,3],
['洪水橋','Hung Shui Kiu','洪水橋',113.9960,22.4300,3],
['屏山','Ping Shan','屏山',114.0060,22.4470,3],
['廈村','Ha Tsuen','厦村',113.9990,22.4390,3],
['流浮山','Lau Fau Shan','流浮山',113.9880,22.4700,3],
['米埔','Mai Po','米埔',114.0350,22.4900,3],
['落馬洲','Lok Ma Chau','落馬洲',114.0670,22.5100,3],
['新田','San Tin','新田',114.0630,22.5030,3],
['八鄉','Pat Heung','八郷',114.0800,22.4340,3],
['石崗','Shek Kong','石崗',114.0850,22.4370,3],
['林村','Lam Tsuen','林村',114.1400,22.4560,3],
['泰亨','Tai Hang','泰亨',114.1660,22.4670,3],
['龍躍頭','Lung Yeuk Tau','龍躍頭',114.1500,22.5050,3],
['打鼓嶺','Ta Kwu Ling','打鼓嶺',114.1490,22.5390,3],
['沙頭角','Sha Tau Kok','沙頭角',114.2160,22.5410,3],
['北潭涌','Pak Tam Chung','北潭涌',114.3230,22.3980,3],
['黃石','Wong Shek','黄石',114.3400,22.4290,3],
['大浪灣','Tai Long Wan','大浪湾',114.3630,22.4110,3],
['坪洲','Peng Chau','坪洲',114.0410,22.2860,3],
['愉景灣','Discovery Bay','愉景湾',114.0180,22.2960,3],
['欣澳','Sunny Bay','欣澳',114.0290,22.3080,3],
['馬灣','Ma Wan','馬湾',114.0680,22.3520,3],
['昂坪','Ngong Ping','昂坪',113.9060,22.2560,3],
['貝澳','Pui O','貝澳',113.9660,22.2380,3],
['索罟灣','Sok Kwu Wan','索罟湾',114.1310,22.2050,3],
['龍鼓灘','Lung Kwu Tan','龍鼓灘',113.8940,22.3800,3],
['白泥','Pak Nai','白泥',113.9410,22.4350,3],
['摩星嶺','Mount Davis','摩星嶺',114.1210,22.2760,4],
['深水灣','Deep Water Bay','深水湾',114.1830,22.2410,4],
['黃泥涌','Wong Nai Chung','黄泥涌',114.1860,22.2680,4],
['跑馬地','Happy Valley','跑馬地',114.1820,22.2700,4],
['小西灣','Siu Sai Wan','小西湾',114.2510,22.2620,4],
['杏花邨','Heng Fa Chuen','杏花邨',114.2400,22.2770,4],
['大坑','Tai Hang','大坑',114.1900,22.2740,4],
['西環','Sai Wan','西環',114.1350,22.2860,4],
['佐敦','Jordan','佐敦',114.1720,22.3050,4],
['大角咀','Tai Kok Tsui','大角咀',114.1600,22.3200,4],
['九龍塘','Kowloon Tong','九龍塘',114.1760,22.3370,4],
['樂富','Lok Fu','楽富',114.1870,22.3380,4],
['彩虹','Choi Hung','彩虹',114.2090,22.3350,4],
['牛池灣','Ngau Chi Wan','牛池湾',114.2130,22.3350,4],
['茶果嶺','Cha Kwo Ling','茶果嶺',114.2330,22.3040,4],
['荔景','Lai King','茘景',114.1260,22.3480,4],
['大窩口','Tai Wo Hau','大窩口',114.1250,22.3710,4],
['城門','Shing Mun','城門',114.1490,22.3860,4],
['火炭','Fo Tan','火炭',114.1980,22.3960,4],
['馬料水','Ma Liu Shui','馬料水',114.2100,22.4180,4],
['大埔滘','Tai Po Kau','大埔滘',114.1830,22.4310,4],
['太和','Tai Wo','太和',114.1620,22.4510,4],
['粉錦公路','Fan Kam Road','粉錦公路',114.1000,22.4630,4],
['羅湖','Lo Wu','羅湖',114.1130,22.5280,4],
['文錦渡','Man Kam To','文錦渡',114.1290,22.5310,4],
['蓮麻坑','Lin Ma Hang','蓮麻坑',114.1720,22.5470,4],
['鹿頸','Luk Keng','鹿頸',114.2130,22.5140,4],
['烏蛟騰','Wu Kau Tang','烏蛟騰',114.2190,22.4890,4],
['船灣','Shuen Wan','船湾',114.1980,22.4620,4],
['西沙','Sai Sha','西沙',114.2620,22.4180,4],
['北港','Pak Kong','北港',114.2550,22.3720,4],
['大網仔','Tai Mong Tsai','大網仔',114.2970,22.3900,4],
['糧船灣','Leung Shuen Wan','糧船湾',114.3610,22.3550,4],
['布袋澳','Po Toi O','布袋澳',114.2960,22.2790,4],
['銀礦灣','Silver Mine Bay','銀鉱湾',114.0040,22.2660,4],
['塘福','Tong Fuk','塘福',113.9350,22.2320,4],
['石壁','Shek Pik','石壁',113.8930,22.2280,4],
['大蠔','Tai Ho','大蠔',113.9760,22.2960,4],
['小蠔灣','Siu Ho Wan','小蠔湾',113.9950,22.3050,4],
['竹篙灣','Penny\u2019s Bay','竹篙湾',114.0350,22.3130,4],
['稔灣','Nim Wan','稔湾',113.9200,22.4090,4],
['大棠','Tai Tong','大棠',114.0250,22.4150,4],
['大欖','Tai Lam','大欖',114.0350,22.3800,4],
['蒲台','Po Toi','蒲台',114.2560,22.1720,4],
['東平洲','Tung Ping Chau','東平洲',114.4290,22.5390,4],
['塔門','Tap Mun','塔門',114.3620,22.4720,4],
['吉澳','Crooked Island','吉澳',114.2880,22.5320,4],
['東龍洲','Tung Lung Chau','東龍洲',114.2900,22.2480,4],
['分流','Fan Lau','分流',113.8600,22.2000,4],
['二澳','Yi O','二澳',113.8520,22.2470,4],
['深屈','Sham Wat','深屈',113.9140,22.2880,4],
['沙螺灣','Sha Lo Wan','沙螺湾',113.9260,22.2930,4],
['散石灣','San Shek Wan','散石湾',113.9980,22.2640,4],
['芝麻灣','Chi Ma Wan','芝麻湾',113.9880,22.2470,4],
['長沙','Cheung Sha','長沙',113.9600,22.2340,4],
['水口','Shui Hau','水口',113.9260,22.2260,4],
['二東','Nam Shan','南山',113.9930,22.2640,4],
['模達','Mo Tat','模達',114.1330,22.2000,4],
['東灣','Tung Wan','東湾',114.0320,22.2100,4],
['大石口','Tai Shek Hau','大石口',114.0240,22.2060,4],
['坪洲碼頭','Peng Chau Pier','坪洲埠頭',114.0400,22.2860,4],
['大鵬灣','Mirs Bay','大鵬湾',114.3400,22.5100,4],
['印洲塘','Double Haven','印洲塘',114.2600,22.5000,4],
['海下','Hoi Ha','海下',114.3280,22.4680,4],
['白沙澳','Pak Sha O','白沙澳',114.3180,22.4520,4],
['深涌','Sham Chung','深涌',114.3130,22.4300,4],
['荔枝莊','Lai Chi Chong','茘枝荘',114.3020,22.4240,4],
['土瓜坪','To Kwa Peng','土瓜坪',114.3250,22.4280,4],
['赤徑','Chek Keng','赤徑',114.3460,22.4270,4],
['大灘','Tai Tan','大灘',114.3320,22.4270,4],
['高流灣','Ko Lau Wan','高流湾',114.3640,22.4470,4],
['蛋家灣','Tan Ka Wan','蛋家湾',114.3540,22.4560,4],
['西灣','Sai Wan','西湾',114.3570,22.4040,4],
['鹹田灣','Ham Tin Wan','鹹田湾',114.3660,22.4180,4],
['東壩','East Dam','東壩',114.3724,22.3908,4],
['西壩','West Dam','西壩',114.3164,22.3618,4],
['白腊','Pak Lap','白腊',114.3560,22.3560,4],
['糧船灣洲','Leung Shuen Wan Chau','糧船湾洲',114.3400,22.3620,4],
['鹽田仔','Yim Tin Tsai','塩田仔',114.2970,22.3750,4],
['滘西','Kau Sai','滘西',114.2960,22.3600,4],
['大坳門','Tai Au Mun','大坳門',114.2760,22.2960,4],
['銀線灣','Silverstrand','銀線湾',114.2620,22.3200,4],
['日出康城','Lohas Park','ロハスパーク',114.2690,22.2960,4],
['寶琳','Po Lam','宝琳',114.2570,22.3230,4],
['西灣河','Sai Wan Ho','西湾河',114.2220,22.2820,4],
['太古','Tai Koo','太古',114.2160,22.2860,4],
['天后','Tin Hau','天后',114.1920,22.2820,4],
['數碼港','Cyberport','サイバーポート',114.1300,22.2600,4],
['華富','Wah Fu','華富',114.1360,22.2540,4],
['黃竹坑','Wong Chuk Hang','黄竹坑',114.1700,22.2480,4],
['舂坎角','Chung Hom Kok','舂坎角',114.2100,22.2100,4],
['大浪灣（港島）','Big Wave Bay','大浪湾（島）',114.2500,22.2480,4],
['鶴咀','Cape D\u2019Aguilar','鶴咀',114.2530,22.2120,4],
['大埔仔','Tai Po Tsai','大埔仔',114.2660,22.3300,4],
['白石角','Pak Shek Kok','白石角',114.2060,22.4250,4],
['汀角','Ting Kok','汀角',114.2240,22.4650,4],
['大尾篤','Tai Mei Tuk','大尾篤',114.2380,22.4690,4],
['南涌','Nam Chung','南涌',114.2130,22.5110,4],
['谷埔','Kuk Po','谷埔',114.2280,22.5090,4],
['荔枝窩','Lai Chi Wo','茘枝窩',114.2540,22.4970,4],
['鎖羅盆','So Lo Pun','鎖羅盆',114.2680,22.4960,4],
['三椏村','Sam A Tsuen','三椏村',114.2620,22.4880,4],
['九擔租','Kau Tam Tso','九擔租',114.2320,22.4830,4],
['橫山腳','Wang Shan Keuk','横山脚',114.2180,22.4720,4],
['八仙嶺','Pat Sin Leng','八仙嶺',114.1900,22.4790,4],
['流水響','Lau Shui Heung','流水響',114.1620,22.4880,4],
['鶴藪','Hok Tau','鶴藪',114.1540,22.4900,4],
['沙螺洞','Sha Lo Tung','沙螺洞',114.1720,22.4700,4],
['九龍坑','Kau Lung Hang','九龍坑',114.1560,22.4620,4],
['大埔頭','Tai Po Tau','大埔頭',114.1640,22.4560,4],
['樟樹灘','Cheung Shue Tan','樟樹灘',114.1900,22.4340,4],
['馬鞍山村','Ma On Shan Tsuen','馬鞍山村',114.2400,22.4110,4],
['企嶺下','Kei Ling Ha','企嶺下',114.2650,22.4140,4],
['泥涌','Nai Chung','泥涌',114.2540,22.4250,4],
['井頭','Tseng Tau','井頭',114.2740,22.4180,4],
['西徑','Sai Keng','西徑',114.2670,22.4190,4],
['榕樹澳','Yung Shue O','榕樹澳',114.2850,22.4200,4],
['嶂上','Cheung Sheung','嶂上',114.3120,22.4070,4],
['北潭凹','Pak Tam Au','北潭凹',114.3325,22.4200,4],
['井欄樹','Tseng Lan Shue','井欄樹',114.2380,22.3320,4],
['將軍澳村','Tseung Kwan O Tsuen','将軍澳村',114.2560,22.3220,4],
['坪石','Ping Shek','坪石',114.2140,22.3300,4],
['新蒲崗','San Po Kong','新蒲崗',114.1970,22.3340,4],
['九龍仔','Kowloon Tsai','九龍仔',114.1840,22.3320,4],
['筲箕灣避風塘','Shau Kei Wan Typhoon Shelter','筲箕湾避風塘',114.2300,22.2830,4],
['三聖','Sam Shing','三聖',113.9820,22.3850,4],
['小欖','Siu Lam','小欖',114.0480,22.3670,4],
['馬灣涌','Ma Wan Chung','馬湾涌',113.9380,22.2880,4],
['石門','Shek Mun','石門',114.2080,22.3900,4],
['小瀝源','Siu Lek Yuen','小瀝源',114.2050,22.3800,4],
['圓洲角','Yuen Chau Kok','圓洲角',114.2040,22.3860,4],
['隆亨','Lung Hang','隆亨',114.1750,22.3760,4],
['錦英','Kam Ying','錦英',114.2320,22.4190,4],
['雞公嶺','Kai Kung Leng','鶏公嶺',114.0730,22.4590,4],
['大生圍','Tai Sang Wai','大生囲',114.0250,22.4700,4],
['甩洲','Lut Chau','甩洲',114.0150,22.4830,4],
['南生圍','Nam Sang Wai','南生囲',114.0350,22.4620,4],
['牛潭尾','Ngau Tam Mei','牛潭尾',114.0530,22.4620,4],
['古洞','Kwu Tung','古洞',114.1030,22.5060,4],
['坪輋','Ping Che','坪輋',114.1580,22.5220,4],
['沙嶺','Sandy Ridge','沙嶺',114.1210,22.5320,4],
['馬草壟','Ma Tso Lung','馬草壟',114.0810,22.5040,4],
['大生村','Tai Sang Tsuen','大生村',114.0600,22.4830,4],
['錦上路','Kam Sheung Road','錦上路',114.0640,22.4340,4],
['丹桂村','Tan Kwai Tsuen','丹桂村',113.9990,22.4180,4],
['爛角咀','Lan Kok Tsui','爛角咀',113.8880,22.3860,4],
['望后石','Pillar Point','望后石',113.9280,22.3720,4]
];

/* -------------------------------------------------------------- summits --- */
const PEAKPT=[
['大帽山','Tai Mo Shan',114.1245,22.4106,957],
['鳳凰山','Lantau Peak',113.9068,22.2447,934],
['大東山','Sunset Peak',113.9540,22.2575,869],
['四方山','Sze Fong Shan',114.1430,22.4030,785],
['蓮花山','Lin Fa Shan',114.0930,22.3860,766],
['彌勒山','Nei Lak Shan',113.9000,22.2620,751],
['二東山','Yi Tung Shan',113.9640,22.2600,749],
['馬鞍山','Ma On Shan',114.2470,22.4029,702],
['草山','Grassy Hill',114.1600,22.4020,647],
['黃嶺','Wong Leng',114.1898,22.4790,639],
['飛鵝山','Kowloon Peak',114.2273,22.3389,602],
['純陽峰','Shun Yeung Fung',114.1990,22.4760,590],
['雞公嶺','Kai Kung Leng',114.0730,22.4590,585],
['青山','Castle Peak',113.9573,22.3861,583],
['大老山','Tate\u2019s Cairn',114.2140,22.3560,577],
['大刀屻','Tai To Yan',114.1090,22.4600,566],
['太平山','Victoria Peak',114.1455,22.2759,552],
['柏架山','Mount Parker',114.2170,22.2700,532],
['九徑山','Kau Keng Shan',113.9930,22.3860,507],
['奇力山','Mount Kellett',114.1420,22.2650,501],
['獅子山','Lion Rock',114.1861,22.3527,495],
['石屋山','Shek Uk Shan',114.3110,22.4130,481],
['蚺蛇尖','Sharp Peak',114.3690,22.4270,468],
['筆架山','Beacon Hill',114.1720,22.3510,457],
['大上托','Tai Sheung Tok',114.2230,22.3300,399],
['金山','Golden Hill',114.1490,22.3640,369],
['三支香','Tsing Yi Peak',114.0980,22.3510,334],
['魔鬼山','Devil\u2019s Peak',114.2430,22.2960,222]
];

/* ------------------------------------------------------------ reservoirs -- */
const WATERB=[
/* The three large impoundments are given outlines; the rest are ellipses
   sized to their surface. Neither is a surveyed shoreline. */
['船灣淡水湖','Plover Cove Reservoir',114.2400,22.4790,0,0,[
 114.2192,22.4736, 114.2226,22.4766, 114.2262,22.4790, 114.2300,22.4808,
 114.2340,22.4822, 114.2382,22.4834, 114.2424,22.4844, 114.2466,22.4850,
 114.2500,22.4842, 114.2510,22.4812, 114.2486,22.4780, 114.2462,22.4748,
 114.2438,22.4716, 114.2412,22.4694, 114.2380,22.4700, 114.2344,22.4710,
 114.2306,22.4714, 114.2268,22.4712, 114.2230,22.4712, 114.2200,22.4720]],
['萬宜水庫','High Island Reservoir',114.3440,22.3720,0,0,[
 114.3160,22.3634, 114.3196,22.3656, 114.3236,22.3672, 114.3278,22.3686,
 114.3320,22.3700, 114.3362,22.3716, 114.3404,22.3734, 114.3444,22.3756,
 114.3482,22.3782, 114.3518,22.3812, 114.3552,22.3846, 114.3580,22.3878,
 114.3600,22.3900, 114.3620,22.3878, 114.3616,22.3846, 114.3596,22.3812,
 114.3568,22.3782, 114.3534,22.3756, 114.3496,22.3732, 114.3456,22.3712,
 114.3414,22.3694, 114.3372,22.3678, 114.3330,22.3662, 114.3288,22.3646,
 114.3246,22.3630, 114.3204,22.3616, 114.3176,22.3618]],
['大欖涌水庫','Tai Lam Chung Reservoir',114.0330,22.3910,0,0,[
 114.0216,22.3866, 114.0244,22.3888, 114.0276,22.3902, 114.0310,22.3910,
 114.0344,22.3918, 114.0378,22.3930, 114.0408,22.3948, 114.0432,22.3970,
 114.0446,22.3946, 114.0440,22.3918, 114.0420,22.3894, 114.0392,22.3876,
 114.0360,22.3862, 114.0326,22.3852, 114.0292,22.3846, 114.0258,22.3844,
 114.0228,22.3848]],
['城門水庫','Shing Mun Reservoir',114.1478,22.3872,0.0068,0.0028],
['石壁水庫','Shek Pik Reservoir',113.9036,22.2282,0.0072,0.0040],
['下城門水庫','Lower Shing Mun Reservoir',114.1596,22.3742,0.0044,0.0018],
['九龍水塘','Kowloon Reservoir',114.1524,22.3566,0.0040,0.0022],
['大潭水塘','Tai Tam Reservoirs',114.2136,22.2508,0.0024,0.0072],
['香港仔水塘','Aberdeen Reservoirs',114.1628,22.2596,0.0020,0.0028],
['薄扶林水塘','Pok Fu Lam Reservoir',114.1402,22.2672,0.0016,0.0016],
['黃泥涌水塘','Wong Nai Chung Reservoir',114.1876,22.2608,0.0012,0.0010]
];

/* ------------------------------------------------------------ watercourses */
const COURSE=[
['深圳河','Sham Chun River',[
 114.0680,22.5085, 114.0830,22.5105, 114.0960,22.5150, 114.1090,22.5210,
 114.1200,22.5265, 114.1310,22.5300, 114.1420,22.5320, 114.1530,22.5340,
 114.1640,22.5375, 114.1750,22.5420, 114.1860,22.5460, 114.1960,22.5480,
 114.2060,22.5470, 114.2160,22.5410]],
['梧桐河','Ng Tung River',[
 114.1700,22.4980, 114.1640,22.5010, 114.1570,22.5045, 114.1500,22.5075,
 114.1430,22.5105, 114.1360,22.5140, 114.1290,22.5180, 114.1225,22.5225,
 114.1180,22.5270]],
['雙魚河','Sheung Yue River',[
 114.0900,22.4740, 114.0960,22.4790, 114.1020,22.4845, 114.1080,22.4900,
 114.1140,22.4950, 114.1190,22.5000, 114.1230,22.5060, 114.1250,22.5120,
 114.1250,22.5180]],
['錦田河','Kam Tin River',[
 114.0900,22.4390, 114.0810,22.4400, 114.0720,22.4415, 114.0630,22.4430,
 114.0540,22.4448, 114.0450,22.4470, 114.0360,22.4495, 114.0270,22.4520,
 114.0180,22.4545, 114.0100,22.4570]],
['山貝河','Shan Pui River',[
 114.0430,22.4290, 114.0390,22.4350, 114.0350,22.4410, 114.0310,22.4470,
 114.0270,22.4530, 114.0230,22.4590, 114.0180,22.4650, 114.0130,22.4700,
 114.0090,22.4750]],
['林村河','Lam Tsuen River',[
 114.1290,22.4460, 114.1370,22.4480, 114.1450,22.4500, 114.1530,22.4515,
 114.1610,22.4530, 114.1690,22.4545, 114.1770,22.4560, 114.1840,22.4570]],
['城門河','Shing Mun River',[
 114.1720,22.3720, 114.1780,22.3760, 114.1830,22.3805, 114.1880,22.3855,
 114.1930,22.3905, 114.1980,22.3955, 114.2000,22.4010, 114.2020,22.4070]],
['屯門河','Tuen Mun River',[
 113.9820,22.4020, 113.9800,22.3970, 113.9780,22.3920, 113.9750,22.3870,
 113.9720,22.3820, 113.9700,22.3775]]
];

/* ---------------------------------------------------------------- ridges -- */
const SPINE=[
['大帽山系','Tai Mo Shan massif',2.4,[
 114.0930,22.3860,766, 114.1050,22.3930,700, 114.1160,22.4020,850,
 114.1245,22.4106,957, 114.1350,22.4070,860, 114.1430,22.4030,785,
 114.1520,22.4020,720, 114.1600,22.4020,647, 114.1680,22.3990,560]],
['八仙嶺','Pat Sin Leng',2.0,[
 114.1730,22.4720,520, 114.1810,22.4750,560, 114.1898,22.4790,639,
 114.1990,22.4760,590, 114.2080,22.4740,540, 114.2170,22.4720,500,
 114.2260,22.4700,460]],
['九龍群山','Kowloon Hills',1.9,[
 114.1490,22.3640,369, 114.1600,22.3600,420, 114.1720,22.3510,457,
 114.1861,22.3527,495, 114.1990,22.3520,510, 114.2140,22.3560,577,
 114.2273,22.3389,602, 114.2230,22.3300,399]],
['馬鞍山脈','Ma On Shan Range',1.9,[
 114.2340,22.4200,480, 114.2410,22.4120,600, 114.2470,22.4029,702,
 114.2540,22.3960,620, 114.2610,22.3900,520, 114.2680,22.3840,430]],
['港島山脊','Hong Kong Island Ridge',1.7,[
 114.1210,22.2760,269, 114.1330,22.2740,494, 114.1455,22.2759,552,
 114.1600,22.2720,430, 114.1750,22.2690,400, 114.1900,22.2680,430,
 114.2050,22.2690,470, 114.2170,22.2700,532, 114.2300,22.2650,420]],
['大嶼山脊','Lantau Ridge',2.2,[
 113.8850,22.2600,400, 113.8940,22.2610,650, 113.9000,22.2620,751,
 113.9068,22.2447,934, 113.9250,22.2500,700, 113.9400,22.2540,780,
 113.9540,22.2575,869, 113.9640,22.2600,749, 113.9760,22.2660,600,
 113.9880,22.2720,450]],
['青山山脈','Castle Peak Range',1.7,[
 113.9440,22.3960,300, 113.9510,22.3910,480, 113.9573,22.3861,583,
 113.9700,22.3860,520, 113.9820,22.3860,480, 113.9930,22.3860,507,
 114.0040,22.3880,420]],
['西貢半島脊','Sai Kung Peninsula Ridge',1.6,[
 114.2960,22.4100,400, 114.3040,22.4120,440, 114.3110,22.4130,481,
 114.3230,22.4160,420, 114.3350,22.4200,400, 114.3480,22.4240,430,
 114.3690,22.4270,468]]
];

/* ------------------------------------------------------- country parks ---- */
/* Approximate outlines for the map layer only. The gazetted areas are given
   exactly in the conservation table. */
const PARKP=[
['大帽山郊野公園','Tai Mo Shan',[
 114.0880,22.3846, 114.0946,22.3822, 114.1016,22.3812, 114.1086,22.3818,
 114.1152,22.3838, 114.1214,22.3870, 114.1268,22.3912, 114.1312,22.3962,
 114.1342,22.4018, 114.1352,22.4076, 114.1336,22.4130, 114.1298,22.4172,
 114.1244,22.4198, 114.1182,22.4206, 114.1120,22.4194, 114.1062,22.4166,
 114.1010,22.4126, 114.0966,22.4076, 114.0928,22.4022, 114.0898,22.3964,
 114.0878,22.3904]],
['城門郊野公園','Shing Mun',[
 114.1288,22.3742, 114.1340,22.3722, 114.1396,22.3716, 114.1452,22.3722,
 114.1504,22.3742, 114.1548,22.3774, 114.1580,22.3816, 114.1596,22.3864,
 114.1590,22.3912, 114.1564,22.3952, 114.1522,22.3978, 114.1472,22.3986,
 114.1422,22.3976, 114.1378,22.3950, 114.1342,22.3914, 114.1312,22.3872,
 114.1292,22.3826, 114.1282,22.3782]],
['金山郊野公園','Kam Shan',[
 114.1382,22.3520, 114.1428,22.3502, 114.1476,22.3498, 114.1522,22.3508,
 114.1562,22.3532, 114.1592,22.3566, 114.1608,22.3606, 114.1606,22.3648,
 114.1586,22.3684, 114.1552,22.3708, 114.1510,22.3716, 114.1468,22.3708,
 114.1432,22.3686, 114.1404,22.3654, 114.1386,22.3616, 114.1378,22.3568]],
['獅子山郊野公園','Lion Rock',[
 114.1650,22.3466, 114.1704,22.3446, 114.1762,22.3438, 114.1820,22.3440,
 114.1878,22.3452, 114.1932,22.3474, 114.1980,22.3504, 114.2020,22.3542,
 114.2046,22.3586, 114.2050,22.3630, 114.2028,22.3664, 114.1986,22.3682,
 114.1934,22.3684, 114.1880,22.3670, 114.1828,22.3646, 114.1780,22.3614,
 114.1736,22.3578, 114.1696,22.3540, 114.1664,22.3502]],
['馬鞍山郊野公園','Ma On Shan',[
 114.2178,22.3766, 114.2232,22.3742, 114.2290,22.3732, 114.2348,22.3736,
 114.2404,22.3756, 114.2454,22.3790, 114.2496,22.3834, 114.2528,22.3886,
 114.2546,22.3942, 114.2548,22.3998, 114.2532,22.4050, 114.2498,22.4090,
 114.2450,22.4114, 114.2396,22.4118, 114.2344,22.4102, 114.2298,22.4070,
 114.2258,22.4028, 114.2224,22.3980, 114.2196,22.3928, 114.2178,22.3872,
 114.2170,22.3818]],
['八仙嶺郊野公園','Pat Sin Leng',[
 114.1560,22.4664, 114.1620,22.4634, 114.1686,22.4618, 114.1754,22.4614,
 114.1822,22.4620, 114.1890,22.4634, 114.1956,22.4654, 114.2020,22.4678,
 114.2080,22.4706, 114.2134,22.4740, 114.2176,22.4780, 114.2196,22.4826,
 114.2186,22.4870, 114.2148,22.4898, 114.2094,22.4906, 114.2032,22.4900,
 114.1968,22.4884, 114.1904,22.4862, 114.1842,22.4836, 114.1784,22.4806,
 114.1730,22.4774, 114.1680,22.4740, 114.1634,22.4706, 114.1594,22.4686]],
['船灣郊野公園','Plover Cove',[
 114.2306,22.4550, 114.2370,22.4530, 114.2438,22.4522, 114.2506,22.4526,
 114.2572,22.4544, 114.2634,22.4574, 114.2688,22.4614, 114.2732,22.4662,
 114.2760,22.4716, 114.2770,22.4772, 114.2758,22.4826, 114.2724,22.4870,
 114.2670,22.4896, 114.2606,22.4902, 114.2540,22.4890, 114.2478,22.4862,
 114.2422,22.4822, 114.2374,22.4774, 114.2334,22.4720, 114.2306,22.4662,
 114.2292,22.4602]],
['西貢東郊野公園','Sai Kung East',[
 114.3060,22.3846, 114.3124,22.3822, 114.3192,22.3812, 114.3260,22.3818,
 114.3326,22.3840, 114.3388,22.3876, 114.3442,22.3924, 114.3486,22.3980,
 114.3518,22.4042, 114.3538,22.4108, 114.3542,22.4176, 114.3528,22.4240,
 114.3496,22.4292, 114.3444,22.4324, 114.3382,22.4332, 114.3318,22.4318,
 114.3256,22.4288, 114.3200,22.4246, 114.3152,22.4196, 114.3112,22.4140,
 114.3082,22.4080, 114.3062,22.4016, 114.3054,22.3950, 114.3054,22.3890]],
['西貢西郊野公園','Sai Kung West',[
 114.2718,22.3878, 114.2772,22.3856, 114.2830,22.3848, 114.2888,22.3854,
 114.2942,22.3874, 114.2988,22.3906, 114.3024,22.3948, 114.3046,22.3998,
 114.3050,22.4050, 114.3036,22.4098, 114.3004,22.4136, 114.2958,22.4160,
 114.2904,22.4166, 114.2850,22.4156, 114.2800,22.4132, 114.2756,22.4096,
 114.2722,22.4052, 114.2700,22.4002, 114.2692,22.3948, 114.2700,22.3906]],
['大欖郊野公園','Tai Lam',[
 113.9970,22.3790, 114.0032,22.3762, 114.0100,22.3748, 114.0170,22.3746,
 114.0240,22.3756, 114.0308,22.3778, 114.0370,22.3812, 114.0424,22.3856,
 114.0466,22.3908, 114.0492,22.3966, 114.0498,22.4026, 114.0482,22.4080,
 114.0446,22.4120, 114.0394,22.4142, 114.0334,22.4146, 114.0272,22.4134,
 114.0212,22.4108, 114.0156,22.4072, 114.0106,22.4028, 114.0064,22.3978,
 114.0030,22.3924, 114.0002,22.3866, 113.9982,22.3822]],
['南大嶼郊野公園','Lantau South',[
 113.8560,22.2410, 113.8632,22.2372, 113.8712,22.2344, 113.8798,22.2324,
 113.8888,22.2312, 113.8980,22.2308, 113.9072,22.2312, 113.9162,22.2322,
 113.9250,22.2340, 113.9334,22.2364, 113.9412,22.2394, 113.9482,22.2430,
 113.9540,22.2472, 113.9580,22.2518, 113.9596,22.2568, 113.9580,22.2616,
 113.9530,22.2652, 113.9456,22.2674, 113.9366,22.2684, 113.9268,22.2686,
 113.9170,22.2680, 113.9074,22.2666, 113.8984,22.2644, 113.8900,22.2614,
 113.8826,22.2576, 113.8764,22.2532, 113.8716,22.2482, 113.8682,22.2428,
 113.8664,22.2374, 113.8608,22.2382]],
['北大嶼郊野公園','Lantau North',[
 113.8790,22.2686, 113.8874,22.2712, 113.8962,22.2734, 113.9054,22.2752,
 113.9148,22.2768, 113.9242,22.2782, 113.9336,22.2794, 113.9430,22.2804,
 113.9522,22.2814, 113.9612,22.2826, 113.9698,22.2842, 113.9776,22.2864,
 113.9840,22.2892, 113.9880,22.2926, 113.9884,22.2956, 113.9840,22.2966,
 113.9764,22.2962, 113.9670,22.2948, 113.9566,22.2930, 113.9458,22.2910,
 113.9350,22.2886, 113.9244,22.2858, 113.9144,22.2826, 113.9052,22.2790,
 113.8968,22.2750, 113.8896,22.2708, 113.8836,22.2664]],
['林村郊野公園','Lam Tsuen',[
 114.1190,22.4268, 114.1250,22.4244, 114.1314,22.4234, 114.1378,22.4238,
 114.1440,22.4256, 114.1496,22.4286, 114.1544,22.4326, 114.1576,22.4374,
 114.1588,22.4424, 114.1574,22.4468, 114.1536,22.4498, 114.1482,22.4510,
 114.1422,22.4506, 114.1360,22.4488, 114.1302,22.4458, 114.1250,22.4420,
 114.1208,22.4376, 114.1180,22.4326]],
['大潭郊野公園','Tai Tam',[
 114.1878,22.2416, 114.1928,22.2394, 114.1982,22.2384, 114.2036,22.2388,
 114.2086,22.2406, 114.2130,22.2436, 114.2164,22.2476, 114.2186,22.2522,
 114.2192,22.2570, 114.2180,22.2614, 114.2150,22.2648, 114.2108,22.2668,
 114.2060,22.2670, 114.2012,22.2656, 114.1968,22.2628, 114.1932,22.2590,
 114.1904,22.2546, 114.1884,22.2498, 114.1874,22.2452]],
['石澳郊野公園','Shek O',[
 114.2270,22.2298, 114.2318,22.2274, 114.2370,22.2264, 114.2422,22.2270,
 114.2470,22.2292, 114.2508,22.2326, 114.2534,22.2368, 114.2544,22.2414,
 114.2536,22.2458, 114.2510,22.2492, 114.2470,22.2510, 114.2424,22.2510,
 114.2378,22.2494, 114.2336,22.2466, 114.2300,22.2428, 114.2274,22.2384,
 114.2262,22.2338]],
['薄扶林郊野公園','Pok Fu Lam',[
 114.1268,22.2612, 114.1306,22.2592, 114.1348,22.2586, 114.1390,22.2594,
 114.1426,22.2616, 114.1452,22.2650, 114.1464,22.2690, 114.1460,22.2730,
 114.1440,22.2762, 114.1406,22.2780, 114.1368,22.2778, 114.1332,22.2760,
 114.1302,22.2730, 114.1280,22.2694, 114.1268,22.2652]],
['清水灣郊野公園','Clear Water Bay',[
 114.2740,22.2716, 114.2784,22.2694, 114.2832,22.2688, 114.2878,22.2700,
 114.2916,22.2728, 114.2942,22.2768, 114.2954,22.2814, 114.2952,22.2862,
 114.2934,22.2904, 114.2902,22.2934, 114.2860,22.2946, 114.2818,22.2938,
 114.2780,22.2914, 114.2752,22.2878, 114.2734,22.2836, 114.2728,22.2790,
 114.2730,22.2748]],
['龍虎山郊野公園','Lung Fu Shan',[
 114.1288,22.2760, 114.1316,22.2748, 114.1346,22.2748, 114.1372,22.2762,
 114.1386,22.2784, 114.1384,22.2808, 114.1366,22.2824, 114.1338,22.2828,
 114.1310,22.2818, 114.1292,22.2796]]
];

/* ==========================================================================
   REFERENCE TABLES
   ========================================================================== */

/* [zh, en, metres, district, note] */
const PEAKLIST=[
['大帽山','Tai Mo Shan',957,'荃灣','全港最高；山頂設氣象雷達，屬禁區'],
['鳳凰山','Lantau Peak',934,'離島','大嶼山主峰；昂坪東南，觀日出之地'],
['大東山','Sunset Peak',869,'離島','山脊爛頭營石屋建於1920年代'],
['四方山','Sze Fong Shan',785,'大埔·荃灣','大帽山東肩，麥理浩徑第八段'],
['蓮花山','Lin Fa Shan',766,'荃灣','大帽山西翼'],
['彌勒山','Nei Lak Shan',751,'離島','昂坪西北，纜車經其北坡'],
['二東山','Yi Tung Shan',749,'離島','大東山西鄰'],
['馬鞍山','Ma On Shan',702,'沙田·西貢','雙峰狀如馬鞍；1906至1976年採鐵'],
['草山','Grassy Hill',647,'大埔·荃灣','大帽山東南；金山郊遊徑北端'],
['黃嶺','Wong Leng',639,'北區','八仙嶺山系最高'],
['飛鵝山','Kowloon Peak',602,'黃大仙·西貢','九龍群山之最高'],
['純陽峰','Shun Yeung Fung',590,'北區','八仙嶺八峰之首'],
['雞公嶺','Kai Kung Leng',585,'元朗','又稱桂角山，新界西北'],
['青山','Castle Peak',583,'屯門','舊稱杯渡山；青山禪院在其東麓'],
['大老山','Tate\u2019s Cairn',577,'黃大仙·沙田','設氣象站與隧道通風樓'],
['大刀屻','Tai To Yan',566,'元朗·北區','山脊狹窄如刀'],
['太平山','Victoria Peak',552,'中西區','港島最高；1888年山頂纜車通車'],
['柏架山','Mount Parker',532,'東區','舊有大風坳吊車，1892至1932年'],
['九徑山','Kau Keng Shan',507,'屯門','青山東北'],
['奇力山','Mount Kellett',501,'南區·中西區','港島南坡'],
['獅子山','Lion Rock',495,'九龍城·沙田','形如伏獅；1967年隧道貫通'],
['石屋山','Shek Uk Shan',481,'大埔（西貢北）','西貢半島最高，屬大埔區西貢北'],
['蚺蛇尖','Sharp Peak',468,'大埔（西貢北）','錐狀峰，俯瞰大浪四灣；「香港三尖」之首'],
['筆架山','Beacon Hill',457,'深水埗·沙田','舊稱煙墩山；九廣鐵路舊隧道所經'],
['大上托','Tai Sheung Tok',399,'觀塘·西貢','又稱五桂山'],
['金山','Golden Hill',369,'葵青·沙田','獼猴群集之地'],
['三支香','Tsing Yi Peak',334,'葵青','青衣島脊'],
['魔鬼山','Devil\u2019s Peak',222,'觀塘','1900年代英軍炮台，扼守鯉魚門']
];

/* [zh, en, kind, measure, date, note] */
const WATERS=[
['萬宜水庫','High Island Reservoir','res','281.124','1978','容量最大；於糧船灣海築東西兩壩圍海而成'],
['船灣淡水湖','Plover Cove Reservoir','res','229.729','1968','世界首座於海中築堤而成之水庫；1973年加高'],
['石壁水庫','Shek Pik Reservoir','res','24.461','1963','大嶼山南；供水經海底管道輸往港島'],
['大欖涌水庫','Tai Lam Chung Reservoir','res','20.490','1957','戰後首座新建水塘；「千島湖」之稱'],
['城門水庫','Shing Mun Reservoir','res','13.279','1937','原名銀禧水塘，紀念喬治五世登基二十五年'],
['大潭水塘群','Tai Tam Group','res','8.987','1888–1917','四塘相連；大潭篤水塘石橋為法定古蹟'],
['下城門水庫','Lower Shing Mun Reservoir','res','4.299','1965','城門水庫下游'],
['九龍水塘群','Kowloon Group','res','2.873','1910–1931','九龍、九龍副、九龍接收與石梨貝四塘'],
['香港仔水塘','Aberdeen Reservoirs','res','1.259','1890·1931','上、下兩塘'],
['薄扶林水塘','Pok Fu Lam Reservoir','res','0.233','1863','香港首座水塘；1877年擴建'],
['黃泥涌水塘','Wong Nai Chung Reservoir','res','0.173','1899','1986年改作划艇公園'],
['深圳河','Sham Chun River','riv','37','—','界河；1995年起裁彎取直，河道經數度改移'],
['錦田河','Kam Tin River','riv','約12','—','元朗平原主流，注入后海灣'],
['山貝河','Shan Pui River','riv','約11','—','又稱元朗河，下游為南生圍濕地'],
['城門河','Shing Mun River','riv','約7','—','沙田新市鎮填海後所留之人工河道'],
['梧桐河','Ng Tung River','riv','約12','—','北區主流，匯入深圳河'],
['雙魚河','Sheung Yue River','riv','約10','—','上水平原，匯梧桐河'],
['林村河','Lam Tsuen River','riv','約10','—','源出大帽山北坡，注入吐露港'],
['屯門河','Tuen Mun River','riv','約4','—','屯門新市鎮人工渠道']
];

/* [zh, en, gazetted, gazettedEn, hectares, note] */
const PARKS=[
['城門郊野公園','Shing Mun','1977年6月24日','24 Jun 1977',1400,'首批三座之一；水塘四周白千層林'],
['金山郊野公園','Kam Shan','1977年6月24日','24 Jun 1977',339,'首批三座之一；獼猴群集'],
['獅子山郊野公園','Lion Rock','1977年6月24日','24 Jun 1977',557,'首批三座之一；俯瞰九龍'],
['香港仔郊野公園','Aberdeen','1977年10月28日','28 Oct 1977',423,'港島首座；上下水塘'],
['大潭郊野公園','Tai Tam','1977年10月28日','28 Oct 1977',1315,'港島面積最大；水塘群為法定古蹟'],
['西貢東郊野公園','Sai Kung East','1978年2月3日','3 Feb 1978',4477,'含萬宜水庫、大浪四灣與蚺蛇尖'],
['西貢西郊野公園','Sai Kung West','1978年2月3日','3 Feb 1978',3000,'含北潭涌、鯽魚湖'],
['船灣郊野公園','Plover Cove','1978年4月7日','7 Apr 1978',4594,'環船灣淡水湖'],
['南大嶼郊野公園','Lantau South','1978年4月20日','20 Apr 1978',5640,'面積最大；含鳳凰山、大東山'],
['北大嶼郊野公園','Lantau North','1978年8月18日','18 Aug 1978',2200,'東涌以南山地'],
['八仙嶺郊野公園','Pat Sin Leng','1978年8月18日','18 Aug 1978',3125,'八峰並列，各以八仙為名'],
['大欖郊野公園','Tai Lam','1979年2月23日','23 Feb 1979',5412,'新界西面積最大；大欖涌水庫'],
['大帽山郊野公園','Tai Mo Shan','1979年2月23日','23 Feb 1979',1440,'含全港最高峰'],
['林村郊野公園','Lam Tsuen','1979年2月23日','23 Feb 1979',1520,'大帽山東北坡'],
['馬鞍山郊野公園','Ma On Shan','1979年4月27日','27 Apr 1979',2880,'含昂平高原與舊鐵礦區'],
['橋咀郊野公園','Kiu Tsui','1979年6月1日','1 Jun 1979',100,'面積最小之離島郊野公園；連島沙洲'],
['船灣（擴建部分）郊野公園','Plover Cove (Extension)','1979年6月1日','1 Jun 1979',630,'東北離島部分'],
['石澳郊野公園','Shek O','1979年9月21日','21 Sep 1979',701,'港島東南；龍脊步道'],
['薄扶林郊野公園','Pok Fu Lam','1979年9月21日','21 Sep 1979',270,'含香港首座水塘'],
['大潭（鰂魚涌擴建部分）郊野公園','Tai Tam (Quarry Bay Extension)','1979年9月21日','21 Sep 1979',270,'柏架山北坡'],
['清水灣郊野公園','Clear Water Bay','1979年9月28日','28 Sep 1979',615,'釣魚翁山脊'],
['西貢西（灣仔擴建部分）郊野公園','Sai Kung West (Wan Tsai Extension)','1996年6月1日','1 Jun 1996',123,'半島狀營地'],
['龍虎山郊野公園','Lung Fu Shan','1998年12月18日','18 Dec 1998',47,'面積最小；緊鄰市區'],
['北大嶼（擴建部分）郊野公園','Lantau North (Extension)','2008年11月7日','7 Nov 2008',2360,'最晚劃定者']
];

/* [zh, en, km2, note] */
const ISLANDS=[
['大嶼山','Lantau Island',147.16,'離島區·荃灣區','面積為香港島之兩倍；鳳凰山934公尺'],
['香港島','Hong Kong Island',78.59,'中西·灣仔·東·南四區','面積因填海逐年增加'],
['南丫島','Lamma Island',13.55,'離島區','發電廠；榕樹灣、索罟灣兩村'],
['赤鱲角','Chek Lap Kok',12.48,'離島區','原島約3.0平方公里，餘為填海；香港國際機場'],
['青衣島','Tsing Yi',10.69,'葵青區','1970年代以後大幅填海；青馬大橋西端'],
['蒲台島','Po Toi Island',3.69,'離島區','全港最南有人島；石刻為法定古蹟'],
['長洲','Cheung Chau',2.46,'離島區','啞鈴形連島沙洲；太平清醮'],
['東龍洲','Tung Lung Chau',2.42,'西貢區','東龍洲炮台為法定古蹟'],
['吉澳','Crooked Island',2.35,'北區','舊屬邊境禁區，2012年起分階段開放'],
['滘西洲','Kau Sai Chau',2.20,'西貢區','公眾高爾夫球場；洪聖古廟'],
['塔門','Grass Island',1.69,'大埔區','草坡與海蝕地形；屬西貢北'],
['鴨脷洲','Ap Lei Chau',1.32,'南區','人口密度曾居世界前列'],
['石鼓洲','Shek Kwu Chau',1.24,'離島區','戒毒治療中心所在'],
['東平洲','Tung Ping Chau',1.16,'大埔區','頁岩層理；全港最東，屬西貢北'],
['坪洲','Peng Chau',0.99,'離島區','舊有火柴廠與灰窰'],
['馬灣','Ma Wan',0.97,'荃灣區','青馬大橋與汲水門大橋之間'],
['喜靈洲','Hei Ling Chau',1.00,'離島區','懲教設施所在'],
['橋咀洲','Kiu Tsui Chau',0.98,'西貢區','連島沙洲；橋咀郊野公園'],
['往灣洲','Double Island',0.95,'北區','印洲塘海岸公園範圍'],
['大鴉洲','Tai A Chau',0.92,'離島區','索罟群島最大者；曾為越南船民營'],
['火石洲','Basalt Island',0.78,'西貢區','甕缸群島；六角形岩柱與海蝕洞'],
['吊鐘洲','Jin Island',0.72,'西貢區','吊鐘拱門海蝕地貌'],
['赤洲','Port Island',0.66,'大埔區','紅色角礫岩；屬西貢北'],
['沙塘口山','Bluff Island',0.62,'西貢區','甕缸群島之一'],
['周公島','Sunshine Island',0.62,'離島區','舊稱大衾島'],
['果洲群島','Ninepin Group',0.58,'西貢區','東、南、北果洲；柱狀節理'],
['娥眉洲','Crescent Island',0.42,'大埔區','新月形；印洲塘海岸公園'],
['小鴉洲','Siu A Chau',0.40,'離島區','索罟群島之一'],
['鴨洲','Ap Chau',0.38,'北區','角礫岩；全港最小有人島之一'],
['牛尾洲','Ngau Mei Chau','0.32','西貢區','牛尾海中央'],
['交椅洲','Kau Yi Chau',0.15,'離島區','中部水域人工島研究範圍'],
['熨波洲','Middle Island',0.14,'南區','深水灣遊艇會'],
['鹽田仔','Yim Tin Tsai',0.13,'西貢區','客家鹽田村落，2005年獲聯合國文化遺產獎'],
['青洲','Green Island',0.12,'中西區','青洲燈塔為法定古蹟'],
['大磨刀','Tai Mo To',0.11,'離島區','大小磨刀海岸公園'],
['鴨脷排','Ap Lei Pai',0.10,'南區','鴨脷洲南端，連以石灘'],
['沙洲','Sha Chau',0.10,'屯門區','沙洲及龍鼓洲海岸公園；中華白海豚棲地'],
['龍鼓洲','Lung Kwu Chau',0.09,'屯門區','同上'],
['白腊洲','Pak Lap Chau',0.08,'西貢區','糧船灣東南'],
['橫瀾島','Waglan Island',0.07,'離島區','橫瀾燈塔，1893年建'],
['小磨刀','Siu Mo To',0.06,'離島區','大小磨刀海岸公園'],
['螺洲','Beaufort Island',0.06,'離島區','蒲台群島之一']
];

/* [zh, en, base, baseEn, settled, note] */
const CLANS=[
['鄧氏','Tang','錦田·屏山·廈村·龍躍頭·大埔頭','Kam Tin, Ping Shan, Ha Tsuen, Lung Yeuk Tau, Tai Po Tau','北宋 · c. 1069',
 '五族中最早且最盛。屏山聚星樓為香港僅存古塔；錦田吉慶圍鐵門1899年為英軍所奪，1925年歸還。'],
['侯氏','Hau','上水河上鄉·金錢·丙崗·燕崗','Ho Sheung Heung, Kam Tsin, Ping Kong, Yin Kong','北宋末 · late Northern Song',
 '定居雙魚河兩岸。河上鄉居石侯公祠為法定古蹟。'],
['彭氏','Pang','粉嶺圍·粉嶺樓','Fanling Wai, Fanling Lau','北宋 · c. 1120',
 '先居龍山，後遷粉嶺。粉嶺圍存有清代圍牆、炮樓與護城河遺跡。'],
['廖氏','Liu','上水圍','Sheung Shui Wai','元末 · c. 1350',
 '自福建遷來。廖萬石堂建於1751年，為法定古蹟。'],
['文氏','Man','新田·大埔泰亨','San Tin, Tai Hang in Tai Po','南宋末 · late Southern Song',
 '與文天祥同宗。新田麻笏圍、大夫第皆為法定古蹟。']
];

const EXTREMES=[
 {kZh:'極北',kEn:'Northernmost',nZh:'蓮麻坑至打鼓嶺一帶',nEn:'Lin Ma Hang to Ta Kwu Ling',
  loc:'北區',co:'約北緯 22°33′'},
 {kZh:'極南',kEn:'Southernmost',nZh:'蒲台群島南端',nEn:'Southern Po Toi group',
  loc:'離島區',co:'約北緯 22°08′'},
 {kZh:'極東',kEn:'Easternmost',nZh:'東平洲',nEn:'Tung Ping Chau',
  loc:'大埔區',co:'約東經 114°26′'},
 {kZh:'極西',kEn:'Westernmost',nZh:'大嶼山雞翼角',nEn:'Kai Yet Kok, Lantau',
  loc:'離島區',co:'約東經 113°50′'},
 {kZh:'最高點',kEn:'Highest ground',nZh:'大帽山',nEn:'Tai Mo Shan',
  loc:'荃灣區',co:'海拔 957 公尺'},
 {kZh:'最大島',kEn:'Largest island',nZh:'大嶼山',nEn:'Lantau Island',
  loc:'離島區·荃灣區',co:'147.16 平方公里'},
 {kZh:'島嶼數',kEn:'Islands',nZh:'面積500平方公尺以上者',nEn:'Of 500 m² and above',
  loc:'全境',co:'263'},
 {kZh:'南北距',kEn:'North to south',nZh:'約 46 公里',nEn:'c. 46 km',
  loc:'—',co:'東西約 55 公里'}
];

const CLIMATE=[
 ['氣候分區','Climatic division','柯本分類 Cwa，副熱帶季風氣候。冬季受大陸冷氣團影響，夏季受南海與西太平洋暖濕氣流支配。'],
 ['年均溫','Mean annual temperature','天文台總部 1991–2020 正常值為 23.5°C。最冷之一月平均約 16.5°C，最暖之七月平均約 29.0°C。'],
 ['年雨量','Mean annual rainfall','天文台總部 1991–2020 正常值為 2,431.2 公釐。八成集中於五月至九月。'],
 ['極端最高氣溫','Highest recorded','36.6°C，2017年8月22日，天文台總部。'],
 ['極端最低氣溫','Lowest recorded','0.0°C，1893年1月18日，天文台總部；同日錄得結霜。'],
 ['東北季候風','Northeast monsoon','十月至翌年三月。冷鋒過境時氣溫可於一日內驟降十度。'],
 ['回南天','Spring humidity','二月至四月，暖濕氣流遇冷面凝結，相對濕度常達百分之九十五以上。'],
 ['颱風','Tropical cyclones','五月至十一月，以七至九月為盛。八號或以上信號平均每年約一至二次。'],
 ['雷暴','Thunderstorms','四月至九月為主，年均雷暴日約三十四日。'],
 ['熱帶氣旋警告','Warning system','一、三、八、九、十號信號，沿用自1917年之制，1973年改為現行編號。']
];

const SOURCES=[
 ['政府統計處','Census and Statistics Department',
  '《2021年人口普查》主要統計數字及分區簡要報告；人口、年齡結構、中位年齡與人口密度俱本於此。'],
 ['民政事務總署','Home Affairs Department',
  '十八區行政界線（WGS84 經緯度）。本頁「測繪界線」之法定界線層即取自此，經空間數據共享平台之 ArcGIS REST 介面取得，另以 DATA.GOV.HK 靜態檔為後備。'],
 ['空間數據共享平台（地政總署）','CSDI Portal, Lands Department',
  'portal.csdi.gov.hk。政府空間數據平台，2022年12月啟用，提供 OGC WFS、OGC WMS 及 ArcGIS REST 介面。'],
 ['讀者提供之輪廓圖','Raster outline supplied by a reader',
  '標有行政區劃之香港輪廓點陣圖。本圖陸地與十八區界線即描摹自此，配準與限制詳見附註。'],
 ['地政總署測繪處','Survey and Mapping Office, Lands Department',
  '《香港地理資料》；土地面積、島嶼面積、極點與海岸線量度。'],
 ['漁農自然護理署','Agriculture, Fisheries and Conservation Department',
  '郊野公園及特別地區憲報刊登日期與面積；海岸公園與海岸保護區。'],
 ['水務署','Water Supplies Department',
  '各水塘容量與落成年份。'],
 ['香港天文台','Hong Kong Observatory',
  '1991–2020 氣候正常值；極端氣溫紀錄；熱帶氣旋警告制度沿革。'],
 ['古物古蹟辦事處','Antiquities and Monuments Office',
  '法定古蹟名錄；圍村、祠堂與炮台之年代。'],
 ['地政總署地理資訊地圖','GeoInfo Map, Lands Department',
  '分區界線與鄉村範圍之核對；郊野公園界線示意。'],
 ['geoBoundaries（威廉瑪麗學院）','geoBoundaries, William & Mary',
  'gbOpen HKG ADM1，CC BY 4.0。本頁「測繪界線」之陸界即取自此，經該計畫 API 解析路徑。']
];

/* ==========================================================================
   THE TERRITORY'S OWN AXIS

   The dynastic axis above is the sequence of Chinese states, given on its own
   terms. This one is the succession of authority over this particular ground,
   which is a different question and gets its own strip.

   [start, end, zh, en, ja, colour, noteZh, noteEn, noteJa, structure]
   The last field is the administrative structure standing at the close of the
   era. Contiguous bands only; the county administration that continued in name
   after 1841 is left to the list below rather than forced onto the strip.
   ========================================================================== */
const HKERA=[
[1573,1841,'新安縣','Xin\u2019an County','新安県','#8F77B5',
 '明萬曆元年析東莞縣置新安縣，縣治南頭，今香港全境屬之。清順治十八年頒遷界令，沿海居民內徙五十里，八年後復界，客家人陸續遷入。',
 'Xin\u2019an County was split off from Dongguan in the first year of the Wanli reign, seated at Nantou; the whole of what is now Hong Kong lay within it. The coastal evacuation order of 1661 moved the inhabitants fifty li inland; the ground was reopened eight years later, and Hakka settlers came in.',
 '明の万暦元年に東莞県から新安県が分置され、県治は南頭に置かれた。今の香港全域がこれに属した。1661年の遷界令で沿海の住民は内陸へ移され、八年後に復界し、客家が移り住んだ。',
 '廣州府新安縣'],
[1841,1941,'英屬香港','British Hong Kong','英領香港','#2B618F',
 '道光二十一年英軍登陸水坑口，翌年《南京條約》割香港島，1860年《北京條約》再割九龍，1898年《展拓香港界址專條》租借新界九十九年。1841年全境約七千四百人，至1941年逾一百六十萬。',
 'British forces landed at Possession Point in 1841; the Treaty of Nanking ceded Hong Kong Island the following year, the Convention of Peking added Kowloon in 1860, and the Convention of 1898 leased the New Territories for ninety-nine years. The population stood at some 7,400 in 1841 and passed 1,600,000 by 1941.',
 '1841年に英軍が水坑口に上陸し、翌年の南京条約で香港島が、1860年の北京条約で九龍が割譲され、1898年の展拓香港界址専条で新界が九十九年租借された。人口は1841年の約七千四百人から1941年には百六十万を超えた。',
 '香港島 · 九龍 · 新界租借地'],
[1941,1945,'日本佔領','Japanese occupation','日本占領','#707C74',
 '1941年12月8日日軍越深圳河南下，25日港督楊慕琦於半島酒店簽降，是為「黑色聖誕」。設香港佔領地總督部，行軍票、配給與歸鄉政策，人口自一百六十萬減至約六十萬。1945年8月30日英軍重臨。',
 'Japanese forces crossed the Sham Chun River on 8 December 1941; Governor Sir Mark Young surrendered at the Peninsula Hotel on the 25th, the Black Christmas. A Governor\u2019s Office was set up over the occupied territory, issuing military scrip and enforcing rationing and repatriation; the population fell from 1,600,000 to about 600,000. British forces returned on 30 August 1945.',
 '1941年12月8日、日本軍が深圳河を越えて南下し、25日にヤング総督がペニンシュラ・ホテルで降伏した。香港占領地総督部が置かれ、軍票と配給、帰郷政策が行われ、人口は百六十万から約六十万へ減った。1945年8月30日に英軍が戻った。',
 '三區二十八區'],
[1945,1997,'英屬香港（重光後）','British Hong Kong, post-war','英領香港（戦後）','#2E5C6E',
 '1945年8月30日重光。內戰與其後之移民使人口急增，1953年石硤尾大火催生公共房屋。1970年代四大新市鎮同時興建，工業轉出而金融興起。1984年所謂《中英聯合聲明》議定前途，1990年《基本法》頒布。',
 'Liberation came on 30 August 1945. Migration during and after the civil war pushed the population up sharply, and the Shek Kip Mei fire of 1953 brought public housing into being. Four new towns were built at once in the 1970s as manufacturing moved out and finance came in. The so-called Joint Declaration of 1984 settled the future, and the Basic Law was promulgated in 1990.',
 '1945年8月30日に光復した。内戦とその後の移民で人口が急増し、1953年の石硤尾大火が公営住宅を生んだ。1970年代には四つの新市鎮が同時に建設され、工業が域外へ移り金融が興った。1984年のいわゆる中英共同声明が前途を定め、1990年に基本法が公布された。',
 '十九區（1982年設區議會）'],
[1997,2026,'香港特別行政區','Special Administrative Region','香港特別行政区','#C00000',
 '1997年7月1日主權轉移至中共當局，依所謂《憲法》第三十一條及《基本法》設特別行政區，實行所謂「一國兩制」，原有法律除牴觸《基本法》者外予以保留，五十年不變。',
 'Sovereignty passed to the Chinese Communist authorities on 1 July 1997. The Region was established under what they call article 31 of the Constitution and under the Basic Law, on the principle they call one country, two systems. The laws previously in force were retained except where they contravene the Basic Law, for fifty years.',
 '1997年7月1日、主権は中国共産党当局へ移転した。いわゆる憲法第三十一条と基本法により特別行政区が置かれ、いわゆる一国二制度が実施された。従前の法律は基本法に抵触するものを除いて維持され、五十年は変えないとされた。',
 '十八區']];

/* Detailed succession list. [start, end, zh, en, ja, flagKind, dZh, dEn, dJa] */
const REGIME=[
[-214,331,'秦漢 · 南海郡番禺縣','Qin and Han, Panyu County','秦漢・南海郡番禺県','none',
 '秦始皇三十三年（前214）平百越，置南海郡，今香港地屬番禺縣。李鄭屋漢墓為東漢遺存。',
 'The Qin subdued the Hundred Yue in 214 BC and set up Nanhai Commandery; this ground fell within Panyu County. The Lei Cheng Uk tomb survives from the Eastern Han.',
 '秦の始皇帝三十三年（前214）に百越を平定して南海郡を置き、この地は番禺県に属した。李鄭屋漢墓は東漢の遺構である。'],
[331,757,'東晉至唐 · 寶安縣','Eastern Jin to Tang, Bao\u2019an County','東晋から唐・宝安県','none',
 '東晉咸和六年（331）分番禺置寶安縣，縣治南頭。唐開元二十四年（736）設屯門鎮，駐兵二千。',
 'Bao\u2019an County was split from Panyu in 331 and seated at Nantou. In 736 the Tang posted a garrison of two thousand at Tuen Mun.',
 '東晋の咸和六年（331）に番禺から宝安県が分置され、県治は南頭に置かれた。唐の開元二十四年（736）には屯門鎮に二千の兵が置かれた。'],
[757,1573,'唐宋元明 · 東莞縣','Tang to Ming, Dongguan County','唐から明・東莞県','none',
 '唐至德二年（757）寶安改稱東莞。宋設官富場煎鹽，南漢置媚川都採珠。1277年宋帝昺南遷，駐蹕官富場。',
 'Bao\u2019an was renamed Dongguan in 757. The Song ran the Kwun Fu salt field here and the Southern Han a pearl-fishing corps. In 1277 the fleeing Song court halted at Kwun Fu Cheung.',
 '757年に宝安は東莞と改称された。宋は官富場で製塩し、南漢は媚川都を置いて採珠した。1277年、南遷した宋の朝廷が官富場に留まった。'],
[1573,1841,'明清 · 新安縣','Ming and Qing, Xin\u2019an County','明清・新安県','qing',
 '明萬曆元年（1573）析東莞置新安縣。清順治十八年（1661）遷界，康熙八年（1669）復界。',
 'Xin\u2019an County was split from Dongguan in 1573. The coast was evacuated in 1661 and reopened in 1669.',
 '明の万暦元年（1573）に東莞から新安県が分置された。清の順治十八年（1661）に遷界し、康熙八年（1669）に復界した。'],
[1841,1898,'英屬香港 · 港島與九龍','British Hong Kong, island and Kowloon','英領香港・島と九龍','uk',
 '1841年1月26日佔領港島，1842年《南京條約》割讓；1860年《北京條約》割讓九龍司地方一區，界至界限街。',
 'The island was occupied on 26 January 1841 and ceded by the Treaty of Nanking in 1842; the Convention of Peking ceded Kowloon south of Boundary Street in 1860.',
 '1841年1月26日に香港島を占領し、1842年の南京条約で割譲された。1860年の北京条約で界限街以南の九龍が割譲された。'],
[1898,1941,'英屬香港 · 連新界租借地','British Hong Kong with the New Territories','英領香港・新界租借地を含む','uk',
 '1898年6月9日《展拓香港界址專條》租借深圳河以南土地及二百餘島嶼九十九年，7月1日生效。九龍寨城主權條款懸而未決。',
 'The Convention of 1898, signed 9 June and effective 1 July, leased the land south of the Sham Chun River and more than two hundred islands for ninety-nine years. The clause reserving the Walled City was never settled.',
 '1898年6月9日調印、7月1日発効の展拓香港界址専条により、深圳河以南の土地と二百余の島嶼が九十九年租借された。九龍寨城に関する条項は未解決のまま残った。'],
[1941,1945,'日本佔領','Japanese occupation','日本占領','jp',
 '1941年12月25日至1945年8月30日，凡三年八個月，港人稱「三年零八個月」。設香港佔領地總督部。',
 'From 25 December 1941 to 30 August 1945, three years and eight months, the period Hong Kong people still call by that name. Administered through a Governor\u2019s Office over the occupied territory.',
 '1941年12月25日から1945年8月30日まで、三年八か月。香港占領地総督部が置かれた。'],
[1945,1997,'英屬香港 · 重光後','British Hong Kong, post-war','英領香港・戦後','uk',
 '1945年8月30日英軍重臨，翌年5月恢復文治。1972年中共當局要求聯合國將香港自殖民地名單剔除。1984年所謂《中英聯合聲明》。',
 'British forces returned on 30 August 1945 and civil government was restored in May 1946. In 1972 the Chinese Communist authorities asked the United Nations to remove Hong Kong from the list of colonial territories. The so-called Joint Declaration followed in 1984.',
 '1945年8月30日に英軍が戻り、翌年5月に文民統治が回復した。1972年、中国共産党当局は国連に香港を植民地リストから削除するよう求めた。1984年にいわゆる中英共同声明が結ばれた。'],
[1997,2026,'香港特別行政區','Special Administrative Region','香港特別行政区','hksar',
 '1997年7月1日成立。行政長官為首長，設行政會議、立法會與獨立之司法機構，終審權在香港終審法院。',
 'Established on 1 July 1997. The Chief Executive is its head, with an Executive Council, a Legislative Council and an independent judiciary; final adjudication rests with the Court of Final Appeal.',
 '1997年7月1日に成立。行政長官を首長とし、行政会議、立法会および独立した司法機構を置き、終審権は終審法院にある。']];

/* Milestones for the list beneath the dynastic axis.
   [year, changedTheMap, [en, zh, ja], anchor] */
const HIST=[
 [-214,1,['The Qin subdue the Hundred Yue and set up Nanhai Commandery',
   '秦平百越，置南海郡，今香港地屬番禺縣','秦が百越を平定し南海郡を置く'],'番禺縣'],
 [331,1,['Bao\u2019an County is split from Panyu, seated at Nantou',
   '東晉分番禺置寶安縣，縣治南頭','東晋が番禺から宝安県を分置する'],'寶安縣'],
 [736,0,['The Tang post a garrison of two thousand at Tuen Mun',
   '唐開元二十四年設屯門鎮，駐兵二千','唐が屯門鎮に二千の兵を置く'],'屯門'],
 [757,1,['Bao\u2019an is renamed Dongguan County',
   '唐至德二年寶安改稱東莞縣','宝安が東莞県と改称される'],'東莞縣'],
 [963,0,['The Southern Han raise a pearl-fishing corps at Tolo Harbour',
   '南漢於大步海置媚川都採珠','南漢が大歩海に媚川都を置き採珠する'],'大埔'],
 [1197,0,['Salt makers on Lantau rise against the Song monopoly',
   '大嶼山鹽民反抗宋室鹽禁，事敗被鎮','大嶼山の塩民が宋の塩専売に反抗する'],'大嶼山'],
 [1277,0,['The fleeing Song court halts at the Kwun Fu salt field',
   '宋帝昺南遷，駐蹕官富場，宋王臺石刻記其事','南遷した宋の朝廷が官富場に留まる'],'九龍城'],
 [1394,0,['The Ming build the Tai Pang garrison fort',
   '明洪武二十七年築大鵬所城，設守禦千戶所','明が大鵬所城を築く'],'大鵬'],
 [1573,1,['Xin\u2019an County is split from Dongguan, seated at Nantou',
   '明萬曆元年析東莞置新安縣，縣治南頭','明が東莞から新安県を分置する'],'新安縣'],
 [1661,1,['The coastal evacuation order moves the inhabitants fifty li inland',
   '清順治十八年頒遷界令，沿海居民內徙五十里','遷界令により沿海の住民が内陸へ移される'],'新安縣'],
 [1669,1,['The coast is reopened; Hakka settlers begin to arrive',
   '康熙八年復界，客家人陸續遷入','復界し、客家が移り住み始める'],'新安縣'],
 [1839,0,['The Battle of Kowloon opens hostilities in the First Opium War',
   '九龍海戰，第一次鴉片戰爭啟釁','九龍海戦により第一次アヘン戦争が始まる'],'九龍'],
 [1841,1,['British forces land at Possession Point on 26 January',
   '1月26日英軍於水坑口登陸，香港開埠','1月26日、英軍が水坑口に上陸する'],'中西區'],
 [1842,1,['The Treaty of Nanking cedes Hong Kong Island, 29 August',
   '8月29日《南京條約》割讓香港島','8月29日、南京条約で香港島が割譲される'],'香港島'],
 [1860,1,['The Convention of Peking cedes Kowloon south of Boundary Street, 24 October',
   '10月24日《北京條約》割讓九龍，界至界限街','10月24日、北京条約で九龍が割譲される'],'九龍'],
 [1888,0,['The Peak Tram opens, the first funicular railway in Asia',
   '山頂纜車通車，為亞洲最早之纜索鐵路','山頂ケーブルカーが開通する'],'太平山'],
 [1898,1,['The Convention of 1898 leases the New Territories for ninety-nine years',
   '6月9日《展拓香港界址專條》租借新界九十九年','6月9日、展拓香港界址専条で新界が九十九年租借される'],'新界'],
 [1899,0,['Villagers resist the takeover of the New Territories in the Six-Day War',
   '新界六日戰，鄉民抗拒接管，事起大埔','新界六日戦が起こる'],'大埔'],
 [1911,0,['The Kowloon–Canton Railway opens through to Canton',
   '九廣鐵路全線通車','九広鉄道が全線開通する'],'尖沙咀'],
 [1941,1,['Hong Kong surrenders on 25 December, the Black Christmas',
   '12月25日香港淪陷，是為「黑色聖誕」','12月25日、香港が陥落する'],'尖沙咀'],
 [1945,1,['British forces return on 30 August; the occupation ends',
   '8月30日英軍重臨，日佔結束，是為重光','8月30日、英軍が戻り占領が終わる'],'中西區'],
 [1953,0,['The Shek Kip Mei fire leaves fifty thousand homeless; public housing begins',
   '石硤尾大火，五萬餘人無家可歸，公共房屋制度自此發端','石硤尾の大火により公営住宅が始まる'],'深水埗'],
 [1967,0,['Disturbances run from May to December, the longest civil unrest of the period',
   '六七暴動，自五月至十二月','六七暴動が五月から十二月まで続く'],'九龍'],
 [1972,0,['The first cross-harbour tunnel opens, joining the island to Kowloon',
   '紅磡海底隧道通車，港島與九龍首次陸路相連','紅磡海底トンネルが開通する'],'紅磡'],
 [1973,0,['The Country Parks Ordinance is enacted',
   '《郊野公園條例》制定，四年後首批公園劃定','郊野公園条例が制定される'],'大帽山'],
 [1979,0,['The Mass Transit Railway opens its first section',
   '地下鐵路首段通車','地下鉄の最初の区間が開業する'],'觀塘'],
 [1984,1,['The so-called Sino-British Joint Declaration is signed on 19 December',
   '12月19日所謂《中英聯合聲明》簽署','12月19日、いわゆる中英共同声明が調印される'],'北京'],
 [1990,0,['The Basic Law is passed on 4 April by the body the Chinese Communist authorities call the National People\u2019s Congress',
   '4月4日中共當局所謂全國人民代表大會通過《基本法》','4月4日、中国共産党当局のいわゆる全国人民代表大会が基本法を可決する'],'北京'],
 [1994,1,['The Walled City is cleared; the site opens as a park in 1995',
   '九龍寨城清拆完成，翌年闢為寨城公園','九龍城砦が撤去される'],'九龍城'],
 [1997,1,['Sovereignty is transferred on 1 July and the Region is established',
   '7月1日主權轉移，香港特別行政區成立','7月1日、主権が移転し特別行政区が成立する'],'灣仔'],
 [1998,1,['Hong Kong International Airport opens at Chek Lap Kok on 6 July',
   '7月6日香港國際機場於赤鱲角啟用，啟德關閉','7月6日、香港国際空港が赤鱲角に開港する'],'赤鱲角'],
 [2003,0,['SARS claims 299 lives; the so-called Closer Economic Partnership Arrangement is signed with the mainland',
   '沙士疫症，二百九十九人病歿；同年簽署所謂《內地與香港更緊密經貿關係安排》','SARSにより二百九十九人が死亡し、同年いわゆる内地・香港経済貿易緊密化取決めが調印される'],'全境'],
 [2011,0,['The Hong Kong Global Geopark is admitted to the UNESCO network',
   '香港世界地質公園加入教科文組織地質公園網絡','香港世界ジオパークがユネスコの網絡に加わる'],'西貢'],
 [2018,0,['The high-speed rail link and the Hong Kong–Zhuhai–Macao Bridge open',
   '廣深港高速鐵路香港段及港珠澳大橋先後通車','高速鉄道と港珠澳大橋が相次いで開通する'],'西九龍'],
 [2020,1,['The so-called National Security Law is promulgated on 30 June',
   '6月30日所謂《香港特別行政區維護國家安全法》公布實施','6月30日、いわゆる国家安全維持法が公布施行される'],'全境'],
 [2021,1,['The electoral system is amended by the body the Chinese Communist authorities call the National People\u2019s Congress',
   '中共當局所謂全國人民代表大會決定完善選舉制度','中国共産党当局のいわゆる全国人民代表大会が選挙制度を改める'],'全境'],
 [2024,1,['The so-called Safeguarding National Security Ordinance is enacted on 23 March',
   '3月23日所謂《維護國家安全條例》生效，履行《基本法》第二十三條','3月23日、いわゆる国家安全維持条例が施行される'],'全境']
];

/* ==========================================================================
   STRINGS

   English, 正體中文 and 日本語. Chinese prose follows Taiwan orthography and
   usage; Hong Kong proper nouns keep their own gazetted forms, which is stated
   in the notes.
   ========================================================================== */
var STR={
en:{htmlLang:'en',
title:'Hong Kong Reference Atlas', settings:'Settings',
sLang:'Language', sGround:'Ground', gPaper:'Paper', gDusk:'Dusk', gNight:'Night',
gAuto:'Auto', g_paper:'Paper', g_dusk:'Dusk', g_night:'Night',
gWhyLight:'Light system,', gWhyDark:'Dark system,', gWhyDay:'daytime',
gWhyNight:'after dark', gWhyPinned:'Held at',
sDense:'Tighter type', sSurvey:'Surveyed boundaries', sArea:'Area divisions',
fidNow:'Boundaries currently in use:',
fidLocal:'Traced outline, built in', fidLoading:'Fetching surveyed boundaries',
fidSurvey:'Surveyed land polygons',
fidGaz:'Surveyed land, gazetted limits over',
fidFail:'Offline: traced outline',
layers:'Layers', theme:'Thematic tint',
qph:'Search districts, places, summits',
mapHint:'Drag to pan, scroll or pinch to zoom, tap a district for its record. Names appear as the sheet is enlarged and any that would overprint a more important one is withheld.',
lyDiv:'District outlines', lyArea:'Area divisions', lyGaz:'Gazetted limits',
lyWater:'Reservoirs', lyRivers:'Watercourses', lyRanges:'Ridges',
lyParks:'Country parks', lyCities:'Places', lyNames:'Names', lyGrat:'Graticule',
thNone:'None', thPop:'Population', thDen:'Persons per km²', thArea:'Area',
thMed:'Median age', thAged:'Aged 65 and over', thYoung:'Aged under 15',
thSextile:'sextiles',
mEdition:'Edition', mProjection:'Projection', mPopulation:'Population',
mArea:'Land area', mOnSheet:'Districts · islands · places',
promptH:'Select a district',
promptP:'Tap any district on the sheet, or any row in the register below, to open its record. The search box takes district names, places and summits in all three languages.',
nPop:'Population', nArea:'Area km²', nDiv:'Districts', nHi:'Highest m',
nParks:'Country parks', nIsl:'Island outlines', nRes:'Reservoirs',
rHki:'Hong Kong Island', rKln:'Kowloon', rNt:'New Territories',
fPop:'Population', fArea:'Area km²', fDen:'Per km²', fMed:'Median age',
fHigh:'Highest m', rank:'rank',
kSeat:'District office', kReg:'Area', kHigh:'Highest ground',
kShare:'Share of total', kAges:'Age structure',
bIsl:'Islands', bAbout:'Account', bNote:'Of note', none:'none',
t0:'Overview', t1:'Register', t1h:'The eighteen districts', sortHint:'any column sorts',
t2:'Relief', t2h:'Principal summits',
t3:'Superlatives', t3h:'Extremities and climate',
t4:'Notes', t4h:'Method and sources',
t5:'Islands', t5h:'Islands of Hong Kong',
t6:'Water', t6h:'Reservoirs and watercourses',
t7:'Conservation', t7h:'Country parks',
t8:'Gazetteer', t8h:'Places on the sheet',
t9:'Clans', t9h:'The great clans of the New Territories',   
nfSucc:'Succession of authority', nfHistory:'Milestones',
nfOfficial:'Official sources', nfSuccList:'Regimes in detail',
nfSuccP:'Who has held the ground this sheet draws, on its own axis and its own span, beginning at the founding of Xin\u2019an County in 1573. What came before is set out in the list below, which reaches back to the Qin.',
nfHistoryP:'Dates that changed the map are marked.',
lkGov:'government portal', lkCsd:'Census and Statistics Department', lkAfcd:'country parks and conservation',  
fCurrency:'Currency', fCodes:'Codes', fZone:'Time zone', fLangs:'Languages used',
fLargest:'Most populous district', fDivs:'Districts', fPopTotal:'Population',      
eraYears:'years', 
islStruct:'Administration at the close',
islCaveat:'The axis begins in 1573 with the founding of Xin\u2019an County, the first administration seated on ground that included the whole of what is now Hong Kong. Earlier arrangements governed it from further off and are given in the list below.',
eraPre:'Linear in years', eraPrompt:'Select an era on the axis or in the list below.',
present:'present',
cDiv:'District', cReg:'Area', cSeat:'District office', cPop:'Population',
cArea:'Area km²', cDen:'Per km²', cMed:'Median age', cHigh:'Highest m',
cSummit:'Summit', cHeight:'Height m', cWhere:'Where', cNote:'Note',
cName:'Name', cKind:'Kind', cMeasure:'Capacity or length', cDate:'Completed',
cRes:'Reservoir', cRiv:'Watercourse', cCap:'million m³', cLen:'km',
cPark:'Country park', cDesig:'Gazetted', cArea2:'Hectares',
cIsland:'Island', cPlace:'Place', cLon:'Longitude', cLat:'Latitude', cTier:'Shown from',
cClan:'Clan', cBase:'Seats', cSettled:'Settled',
xMostPop:'Most populous', xLeastPop:'Least populous', xLargest:'Largest by area',
xSmallest:'Smallest by area', xDensest:'Densest', xSparsest:'Least dense',
xOldest:'Oldest population', xYoungest:'Youngest population',
n1h:'Boundaries',
n1:'The land on this sheet is traced. A reader supplied a raster outline of Hong Kong with the district divisions marked; it was thresholded, its land separated from its sea, its interior cells assigned to districts by comparison with the hand-built outline this sheet previously used, and the labels grown across the drawn strokes so that every land pixel carries exactly one district. The result was georeferenced by fitting it to that earlier geometry, which gives about a hundred metres to the source pixel. Contours were then taken per district, quantised onto a common lattice, twice corner-cut and thinned. Every one of those steps reads only a single edge or a run of three consecutive points, so two neighbours write the same vertices along the boundary they share and no seam can open between them; the coastline and the two area outlines are recovered from that property at load time rather than stored twice. The eighteen rings enclose about 1,115 km\u00b2 against a census land area of about 1,089 km\u00b2, 2.4 per cent over, and every district is within about a seventh of its published area. Two things follow from the source. Its cartographic authority is unknown: it is an illustration, not a survey, and nothing on it should be measured. Several of the north-western district boundaries are drawn in it as long right-angled runs, which survive here; they are visible at high magnification and are not an artefact of the tracing. And it joins Chek Lap Kok to Lantau, which are separate; the channel between them has been cut back in by hand and is the one piece of this outline that is not the source\u2019s.',
n2h:'Population',
n2:'Population, age structure, median age and density are the 2021 Population Census. The eighteen districts sum to 7,411,945 against a published territory total of 7,413,070; the difference of 1,125 is the marine population, which is not allocated to a district. District areas are derived as population divided by the published density and are therefore on the census basis, which excludes the major inland water bodies; they sum to about 1,089 km² against the roughly 1,114 km² of land usually quoted. The resident population was about 7,498,100 at mid-2024.',
n3h:'The districts',
n3:'The eighteen districts are the districts of the District Councils Ordinance. They are administrative areas, not a tier of government with its own territory: the District Councils advise, and the Home Affairs Department administers through District Officers. The three areas shown by the second boundary switch, Hong Kong Island, Kowloon and the New Territories, carry no administrative weight today but follow the three acquisitions of 1842, 1860 and 1898 and are still the ordinary way of speaking about the ground. Two irregularities are drawn because they are real. Tai Po District is made of two pieces that touch nowhere by land: Tai Po proper, and Sai Kung North, the northern half of the Sai Kung Peninsula, which reaches from Three Fathoms Cove past Pak Tam Au to Sharp Peak and includes Tap Mun and Tung Ping Chau. It is the only exclave among the eighteen. Tsuen Wan District likewise holds Ma Wan together with Penny\u2019s Bay and Sunny Bay on north-east Lantau. Where a summit stands on a boundary it is entered under one district only, and the register says which.',
n5h:'What is not drawn',
n5:'Only twenty-four of the several hundred islands are given outlines; the rest appear in the island table or not at all. Relief is shown as ridges and summits, not as a computed surface, and the ridge lines are schematic. Country park outlines on the map are approximate and are there to show extent, not boundary; the gazetted areas are given exactly in the conservation table. Reservoirs are drawn as ellipses sized to their surface, not as surveyed shorelines. Reclamation has moved the shoreline continuously since 1841 and continues to; the outline is drawn at the present day and no historical shoreline is shown.',
srcH:'Sources'},
zh:{htmlLang:'zh-Hant-HK',
title:'香港參考輿圖', settings:'設定',
sLang:'語言', sGround:'底色', gPaper:'紙', gDusk:'暮', gNight:'夜',
gAuto:'自動', g_paper:'紙', g_dusk:'暮', g_night:'夜',
gWhyLight:'系統為淺色，', gWhyDark:'系統為深色，', gWhyDay:'日間',
gWhyNight:'入夜', gWhyPinned:'固定為',
sDense:'緊排', sSurvey:'測繪界線', sArea:'區域界',
fidNow:'現用界線：',
fidLocal:'內建描摹輪廓', fidLoading:'正在取得測繪界線',
fidSurvey:'測繪陸界',
fidGaz:'測繪陸界，另疊法定界線',
fidFail:'離線：內建描摹輪廓',
layers:'圖層', theme:'主題著色',
qph:'搜尋分區、地名、山峰',
mapHint:'拖曳平移，滾動或雙指縮放，點選分區可展開該區記錄。地名隨放大而逐級出現，若與更重要者相疊則略去。',
lyDiv:'分區界', lyArea:'區域界', lyGaz:'法定界線',
lyWater:'水塘', lyRivers:'河道', lyRanges:'山脊',
lyParks:'郊野公園', lyCities:'地名點', lyNames:'注記', lyGrat:'經緯網',
thNone:'無', thPop:'人口', thDen:'每平方公里人口', thArea:'面積',
thMed:'中位年齡', thAged:'六十五歲及以上', thYoung:'十五歲以下',
thSextile:'六分位',
mEdition:'版次', mProjection:'投影', mPopulation:'人口',
mArea:'土地面積', mOnSheet:'分區 · 島嶼 · 地名',
promptH:'請選擇分區',
promptP:'點選圖上任一分區，或下方名錄任一列，即可展開該區記錄。搜尋欄可輸入分區、地名或山峰，三種語文皆可。',
nPop:'人口', nArea:'面積（平方公里）', nDiv:'分區', nHi:'最高（公尺）',
nParks:'郊野公園', nIsl:'島嶼輪廓', nRes:'水塘',
rHki:'香港島', rKln:'九龍', rNt:'新界',
fPop:'人口', fArea:'面積（平方公里）', fDen:'每平方公里', fMed:'中位年齡',
fHigh:'最高（公尺）', rank:'位次',
kSeat:'民政事務處', kReg:'所屬區域', kHigh:'區內最高',
kShare:'佔全境比例', kAges:'年齡結構',
bIsl:'轄下島嶼', bAbout:'概述', bNote:'要目', none:'無',
t0:'總覽', t1:'名錄', t1h:'十八區', sortHint:'各欄可排序',
t2:'地勢', t2h:'主要山峰',
t3:'極值', t3h:'極點與氣候',
t4:'附註', t4h:'方法與資料來源',
t5:'島嶼', t5h:'香港島嶼',
t6:'水', t6h:'水塘與河道',
t7:'保育', t7h:'郊野公園',
t8:'地名', t8h:'圖上地名',
t9:'宗族', t9h:'新界五大族',   
nfSucc:'政權遞嬗', nfHistory:'大事',
nfOfficial:'官方來源', nfSuccList:'各政權詳目',
nfSuccP:'本圖所繪之地，歷來由誰所轄，另立橫軸，自明萬曆元年（一五七三）設新安縣起。此前之建置隸於遠處，見於下方詳目，上溯至秦。',
nfHistoryP:'凡改動疆界者標記之。',
lkGov:'政府入口網站', lkCsd:'政府統計處', lkAfcd:'郊野公園與自然護理',  
fCurrency:'貨幣', fCodes:'代碼', fZone:'時區', fLangs:'使用語言',
fLargest:'人口最多之區', fDivs:'分區', fPopTotal:'人口',      
eraYears:'年', 
islStruct:'期末建置',
islCaveat:'本軸自一五七三年設新安縣起。此為首個縣治所在而轄境全涵今香港者；此前各代由更遠之郡縣統轄，見下方詳目。',
eraPre:'依年數等比', eraPrompt:'請於橫軸或下方名目中選擇一段。',
present:'今',
cDiv:'分區', cReg:'區域', cSeat:'民政事務處', cPop:'人口',
cArea:'面積（平方公里）', cDen:'每平方公里', cMed:'中位年齡', cHigh:'最高（公尺）',
cSummit:'山峰', cHeight:'高程（公尺）', cWhere:'所在', cNote:'記',
cName:'名稱', cKind:'類', cMeasure:'容量或長度', cDate:'落成',
cRes:'水塘', cRiv:'河道', cCap:'百萬立方公尺', cLen:'公里',
cPark:'郊野公園', cDesig:'憲報刊登', cArea2:'公頃',
cIsland:'島嶼', cPlace:'地名', cLon:'東經', cLat:'北緯', cTier:'顯示層級',
cClan:'宗族', cBase:'聚居地', cSettled:'定居',
xMostPop:'人口最多', xLeastPop:'人口最少', xLargest:'面積最大',
xSmallest:'面積最小', xDensest:'密度最高', xSparsest:'密度最低',
xOldest:'中位年齡最高', xYoungest:'中位年齡最低',
n1h:'界線',
n1:'本圖陸地為描摹所得。讀者提供一幅標有行政區劃之香港輪廓點陣圖，經二值化、分離陸海、以本圖原用之手繪輪廓比對而將各內部區塊歸屬各區，再將標記越過筆劃生長，使每一陸地像素恰屬一區。其地理配準係以最小二乘擬合舊幾何而得，源圖每像素約當百公尺。其後逐區取輪廓，量化於同一格網，再兩度切角並抽稀。此數步所讀者，或僅一邊，或僅連續三點，故相鄰兩區於共界處所書頂點全同，接縫不可能開裂；海岸線與兩條區域界線則於載入時由此性質推得，不另存一份。十八環所圍約 1,115 平方公里，而普查所載陸地面積約 1,089 平方公里，超出百分之 2.4，各區與其公布面積之差皆在七分之一以內。源圖有二事須言明：其製圖權威不明，乃插畫而非測繪成果，圖上任何長度面積皆不得據以量算；又其西北數處區界原繪為長直角折線，此處一仍其舊，放大後可見，非描摹所生之瑕。再者，原圖將赤鱲角與大嶼山連為一體，二者實不相連，其間水道係手工補鑿，為本輪廓中唯一不出於源圖者。',
n2h:'人口',
n2:'人口、年齡結構、中位年齡與人口密度俱本於《二○二一年人口普查》。十八區合計七百四十一萬一千九百四十五人，而全境公布數為七百四十一萬三千零七十人，相差一千一百二十五人，為未編入任何一區之水上人口。各區面積係以人口除以公布密度而得，故其基準與普查同，不含主要內陸水體，合計約一千零八十九平方公里，而通行所稱陸地面積約一千一百一十四平方公里。二○二四年年中居港人口約七百四十九萬八千一百人。',
n3h:'分區',
n3:'十八區者，《區議會條例》所定之區也。此為行政區劃而非一級政權：區議會司諮詢，民政事務總署以民政事務專員治之。第二層界線所示之香港島、九龍、新界三大區域，今無行政效力，然其分即一八四二、一八六○、一八九八三次取得之疆，至今仍為民間稱述此地之常法。圖上另繪兩處異例，蓋其為實。大埔區由兩片組成，陸路互不相連：一為大埔本部，一為西貢北，即西貢半島北半，自企嶺下海東越北潭凹而至蚺蛇尖，並轄塔門、東平洲；此為十八區中唯一之飛地。荃灣區亦轄馬灣及大嶼山東北之竹篙灣、欣澳一帶。凡山峰跨界者，只入一區，名錄中著明其屬。',
n5h:'未繪之事',
n5:'數百島嶼之中，僅二十四島繪有輪廓，餘者或見於島嶼表，或全然不錄。地勢以山脊與峰點示之，非以曲面演算，脊線為示意。圖上郊野公園輪廓為近似，用以示其範圍而非其界，法定面積詳見保育表。水塘以橢圓示其水面大小，非測繪之岸線。一八四一年以來填海不斷，海岸線屢易，本圖所繪為今日之形，不示歷代岸線。',
srcH:'資料來源'},
ja:{htmlLang:'ja',
title:'香港地図帳', settings:'設定',
sLang:'言語', sGround:'地色', gPaper:'紙', gDusk:'薄暮', gNight:'夜',
gAuto:'自動', g_paper:'紙', g_dusk:'薄暮', g_night:'夜',
gWhyLight:'システムは明色、', gWhyDark:'システムは暗色、', gWhyDay:'昼間',
gWhyNight:'日没後', gWhyPinned:'固定：',
sDense:'字詰めを詰める', sSurvey:'測量境界', sArea:'地域区分',
fidNow:'現在の境界：',
fidLocal:'内蔵の描き取り輪郭', fidLoading:'測量境界を取得中',
fidSurvey:'測量による陸地ポリゴン',
fidGaz:'測量陸地に法定境界を重ねる',
fidFail:'オフライン：内蔵の描き取り輪郭',
layers:'レイヤ', theme:'主題着色',
qph:'区・地名・山を検索',
mapHint:'ドラッグで移動、スクロールまたはピンチで拡大縮小、区をタップすると記録が開きます。地名は拡大に応じて段階的に現れ、より重要な名と重なるものは省かれます。',
lyDiv:'区界', lyArea:'地域区分', lyGaz:'法定境界',
lyWater:'貯水池', lyRivers:'河川', lyRanges:'尾根',
lyParks:'郊野公園', lyCities:'地名', lyNames:'注記', lyGrat:'経緯線',
thNone:'なし', thPop:'人口', thDen:'1km²あたり人口', thArea:'面積',
thMed:'年齢中央値', thAged:'65歳以上', thYoung:'15歳未満',
thSextile:'六分位',
mEdition:'版', mProjection:'投影', mPopulation:'人口',
mArea:'陸地面積', mOnSheet:'区・島・地名',
promptH:'区を選んでください',
promptP:'図上の区、または下の名簿の行をタップすると記録が開きます。検索欄では区名・地名・山名を三か国語で受け付けます。',
nPop:'人口', nArea:'面積 km²', nDiv:'区', nHi:'最高 m',
nParks:'郊野公園', nIsl:'島の輪郭', nRes:'貯水池',
rHki:'香港島', rKln:'九龍', rNt:'新界',
fPop:'人口', fArea:'面積 km²', fDen:'1km²あたり', fMed:'年齢中央値',
fHigh:'最高 m', rank:'順位',
kSeat:'民政事務処', kReg:'地域', kHigh:'区内最高地点',
kShare:'全体に占める割合', kAges:'年齢構成',
bIsl:'所属の島', bAbout:'概説', bNote:'要目', none:'なし',
t0:'概観', t1:'名簿', t1h:'十八区', sortHint:'各列で並べ替え',
t2:'地勢', t2h:'主要な山',
t3:'極値', t3h:'極点と気候',
t4:'注記', t4h:'方法と出典',
t5:'島', t5h:'香港の島',
t6:'水', t6h:'貯水池と河川',
t7:'保全', t7h:'郊野公園',
t8:'地名', t8h:'図上の地名',
t9:'宗族', t9h:'新界の五大族',   
nfSucc:'統治の変遷', nfHistory:'できごと',
nfOfficial:'公式の出典', nfSuccList:'各政権の詳細',
nfSuccP:'この図が描く土地を誰が治めてきたかを、独自の軸と期間で示す。起点は1573年の新安県設置。それ以前の建置は遠方から統轄したもので、下の一覧に秦まで遡って掲げる。',
nfHistoryP:'地図を変えた年を印で示す。',
lkGov:'政府ポータル', lkCsd:'政府統計処', lkAfcd:'郊野公園と自然保護',  
fCurrency:'通貨', fCodes:'コード', fZone:'標準時', fLangs:'使用言語',
fLargest:'人口最多の区', fDivs:'区', fPopTotal:'人口',      
eraYears:'年', 
islStruct:'末期の行政区画',
islCaveat:'軸は1573年の新安県設置から始まる。今の香港全域を含む土地に県治が置かれた最初であり、それ以前はより遠い郡県が統轄した。詳細は下の一覧に掲げる。',
eraPre:'年数に比例', eraPrompt:'軸または下の一覧から一つ選んでください。',
present:'現在',
cDiv:'区', cReg:'地域', cSeat:'民政事務処', cPop:'人口',
cArea:'面積 km²', cDen:'1km²あたり', cMed:'年齢中央値', cHigh:'最高 m',
cSummit:'山', cHeight:'標高 m', cWhere:'所在', cNote:'備考',
cName:'名称', cKind:'種別', cMeasure:'容量または延長', cDate:'完成',
cRes:'貯水池', cRiv:'河川', cCap:'百万m³', cLen:'km',
cPark:'郊野公園', cDesig:'官報告示', cArea2:'ヘクタール',
cIsland:'島', cPlace:'地名', cLon:'東経', cLat:'北緯', cTier:'表示段階',
cClan:'宗族', cBase:'居住地', cSettled:'定着',
xMostPop:'人口最多', xLeastPop:'人口最少', xLargest:'面積最大',
xSmallest:'面積最小', xDensest:'密度最高', xSparsest:'密度最低',
xOldest:'年齢中央値が最も高い', xYoungest:'年齢中央値が最も低い',
n1h:'境界',
n1:'この図の陸地は描き取ったものである。読者から、行政区分の入った香港の輪郭のラスター画像が提供された。二値化して陸と海を分け、内部の区画を従来の手作りの輪郭と照合して各区に割り当て、描線を越えてラベルを広げ、陸のすべての画素がちょうど一つの区に属するようにした。地理座標への当てはめは従来の幾何との最小二乗によっており、原画の一画素は約百メートルに当たる。次に区ごとに輪郭を取り、共通の格子に量子化し、二度角を落として間引いた。いずれの手順も一本の辺か連続する三点しか見ないので、隣り合う二区は共有する境界に同じ頂点を書き、継ぎ目が開くことはない。海岸線と二つの地域界は、この性質から読み込み時に復元し、二重には持たない。十八の環が囲む面積は約 1,115 km²、国勢調査の陸地面積約 1,089 km² に対して 2.4% 多く、各区はいずれも公表面積の七分の一以内に収まる。原画については二点を明記する。その地図としての典拠は不明であり、測量成果ではなく挿画であるから、図上で長さや面積を測ってはならない。また北西部のいくつかの区界は原画で長い直角の折れ線として描かれており、ここでもそのまま残る。拡大すると見えるが、描き取りによる瑕ではない。さらに原画は赤鱲角と大嶼山をつないで描いているが、両者は別の島である。その間の水道は手作業で彫り直しており、この輪郭のうち原画に由来しない唯一の箇所である。',
n2h:'人口',
n2:'人口・年齢構成・年齢中央値・人口密度はいずれも2021年人口普查による。十八区の合計は7,411,945人で、公表された全域の7,413,070人との差1,125人は、どの区にも配分されない水上人口である。各区の面積は人口を公表密度で割って求めたもので、国勢調査と同じ基準にあり、主要な内陸水域を含まない。合計は約1,089km²で、通常いわれる陸地面積約1,114km²とは異なる。2024年年央の居住人口は約7,498,100人である。',
n3h:'区について',
n3:'十八区は区議会条例の定める区である。行政上の区画であって独自の領域をもつ政府の一段ではない。区議会は諮問にあたり、民政事務総署が民政事務専員を通じて行政を担う。第二の境界が示す香港島・九龍・新界の三地域は今日行政上の効力をもたないが、1842年・1860年・1898年の三度の取得に対応し、今もこの土地を語る通常の枠組みである。図には実際にある二つの例外も描いた。大埔区は陸で接しない二つの部分からなる。大埔本体と、西貢半島の北半である西貢北で、企嶺下海から北潭凹を越えて蚺蛇尖に達し、塔門と東平洲を含む。十八区で唯一の飛地である。荃灣区も馬灣と大嶼山北東の竹篙灣・欣澳一帯を管する。境界上に立つ山は一つの区にのみ載せ、名簿にどちらかを示した。',
n5h:'描いていないもの',
n5:'数百の島のうち輪郭を描いたのは二十四島にとどまり、残りは島の表に載るか、載らない。地勢は尾根と山頂で示し、曲面計算によるものではなく、尾根線は模式である。図上の郊野公園の輪郭は近似で、範囲を示すためのものであって境界ではない。法定の面積は保全の表に正確に掲げた。貯水池は水面の広がりに合わせた楕円で、測量された汀線ではない。1841年以来の埋立てで海岸線は動き続けており、輪郭は現在のものである。歴代の汀線は示していない。',
srcH:'出典'}
};

/* ==========================================================================
   Hong Kong Reference Atlas — application

   The same machinery as the United States, Japan and Taiwan sheets. The map is
   one SVG; zoom rewrites the viewBox and publishes 1/scale as --u, so every
   stroke and every letter is specified in screen pixels and stays the same size
   at any magnification. Markers sit in a counter-scaled group so a dot stays a
   dot. Labels are tiered by zoom and then decluttered in screen space.

   Geometry differs from the other sheets in one respect. There is no public
   redistribution of Hong Kong's surveyed district boundaries as land polygons;
   what the Home Affairs Department publishes is the gazetted administrative
   limit, which runs out to sea. Substituting it for the land outline would fill
   the frame with district colour, so it is drawn as a dashed overlay above the
   water instead, and the land is always the built-in outline. The badge in the
   method note says whether the overlay is live.
   ========================================================================== */
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
var NS='http://www.w3.org/2000/svg';
function el(t,a){var n=document.createElementNS(NS,t);if(a)for(var k in a)n.setAttribute(k,a[k]);return n;}
function fmt(n){return Number(n).toLocaleString('en-US');}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var cur='en';
function T(k){var d=STR[cur];return (d&&d[k]!==undefined)?d[k]:STR.en[k];}
var LI=function(){return cur==='zh'?1:cur==='ja'?2:0;};

/* ---------------------------------------------------------------- data --- */
var CODES=DIV.map(function(d){return d.id;});
var BY={}; DIV.forEach(function(d){BY[d.id]=d;});
var TOTP=0,TOTA=0;
DIV.forEach(function(d){TOTP+=d.pop;TOTA+=d.area;});
(function(){
  var byP=DIV.slice().sort(function(a,b){return b.pop-a.pop;});
  var byA=DIV.slice().sort(function(a,b){return b.area-a.area;});
  var byD=DIV.slice().sort(function(a,b){return b.den-a.den;});
  byP.forEach(function(d,i){d.pr=i+1;});
  byA.forEach(function(d,i){d.ar=i+1;});
  byD.forEach(function(d,i){d.dr=i+1;});
})();
var REGK={hki:'rHki',kln:'rKln',nt:'rNt'};
/* Japanese uses the shinjitai forms of a few characters that appear in these
   names; everything else is written the same in both scripts. */
var JAMAP={'區':'区','灣':'湾','龍':'龍','東':'東','嶼':'嶼','葵':'葵','觀':'観',
           '荃':'荃','門':'門','鄉':'郷','衝':'衝','啟':'啓','舊':'旧','樂':'楽',
           '荔':'茘','圍':'囲','澤':'沢','總':'総','鐵':'鉄'};
function toJa(s){return String(s).replace(/[區灣觀啟樂荔圍澤總鐵]/g,function(c){return JAMAP[c]||c;});}
function dN(d){return cur==='zh'?d.zh:cur==='ja'?toJa(d.zh):d.en;}
function dAlt(d){return cur==='en'?d.zh:d.en;}
function dSeat(d){return cur==='zh'?d.seat:cur==='ja'?toJa(d.seat):d.seatEn;}
function dHiN(d){return cur==='en'?d.hiEn:d.hiZh;}
function dNote(d){return cur==='zh'?d.nZh:cur==='ja'?(NJA[d.id]||d.nEn):d.nEn;}
function dHigh(d){return cur==='zh'?d.hZh:cur==='ja'?(HJA[d.id]||d.hEn):d.hEn;}

/* ---------------------------------------------------------- projection --- */
/* Albers equal area conic, standard parallels 22.2N and 22.5N, origin 114.15E.
   The same family as the other sheets in the series. Over a span of sixty
   kilometres the distortion is far below the precision of the outline. */
var RAD=Math.PI/180;
var ALB=(function(){
  var p0=22.2*RAD,p1=22.5*RAD,lat0=22.35*RAD,lon0=114.15*RAD;
  var n=(Math.sin(p0)+Math.sin(p1))/2;
  var C=Math.cos(p0)*Math.cos(p0)+2*n*Math.sin(p0);
  var r0=Math.sqrt(C-2*n*Math.sin(lat0))/n;
  return function(lon,lat){
    var t=n*(lon*RAD-lon0), r=Math.sqrt(C-2*n*Math.sin(lat*RAD))/n;
    /* y is negated on the way out: the conic formula increases northward,
       the SVG coordinate system increases downward. */
    return [r*Math.sin(t), -(r0-r*Math.cos(t))];
  };
})();
var SHEET=[0,0,1000,720], PJ=null, HOMEV=null;
function f2p(a){var o=[];for(var i=0;i<a.length;i+=2)o.push([a[i],a[i+1]]);return o;}
function fitProjection(){
  var pts=[];
  Object.keys(DIST).forEach(function(k){
    DIST[k].forEach(function(a){
      for(var i=0;i<a.length;i+=2) pts.push(ALB(a[i],a[i+1]));});
  });
  var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  pts.forEach(function(p){
    if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0];
    if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1];});
  var pad=30, W=SHEET[2]-pad*2, H=SHEET[3]-pad*2;
  var k=Math.min(W/(x1-x0), H/(y1-y0));
  var ox=pad+(W-(x1-x0)*k)/2 - x0*k, oy=pad+(H-(y1-y0)*k)/2 - y0*k;
  PJ=function(lon,lat){var p=ALB(lon,lat);return [p[0]*k+ox, p[1]*k+oy];};
  PJ.k=k;
  /* The whole territory fits the frame, so the opening view is the whole
     territory with a small margin. */
  var m=10, aw=SHEET[2]/SHEET[3];
  var q0=PJ(0,0);
  var ix0=1e9,iy0=1e9,ix1=-1e9,iy1=-1e9;
  pts.forEach(function(p){
    var x=p[0]*k+ox, y=p[1]*k+oy;
    if(x<ix0)ix0=x; if(x>ix1)ix1=x;
    if(y<iy0)iy0=y; if(y>iy1)iy1=y;});
  var w=(ix1-ix0)+m*2, h=(iy1-iy0)+m*2;
  if(w/h<aw) w=h*aw; else h=w/aw;
  HOMEV=[(ix0+ix1)/2-w/2,(iy0+iy1)/2-h/2,w,h];
}
fitProjection();
function projRing(r){return r.map(function(p){return PJ(p[0],p[1]);});}
function dOf(pts,close){
  if(!pts.length) return '';
  var d='M'+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1);
  for(var i=1;i<pts.length;i++) d+='L'+pts[i][0].toFixed(1)+' '+pts[i][1].toFixed(1);
  return d+(close?'Z':'');
}
function ringsToPath(rs,lonlat){
  var d='';
  for(var i=0;i<rs.length;i++){
    var r=rs[i]; if(r.length<3) continue;
    if(lonlat) r=projRing(r);
    d+=dOf(r,true);
  }
  return d;
}

/* ------------------------------------------------------ built-in geometry --
   The eighteen districts arrive as finished rings. Every interior boundary is
   written by both neighbours with the same vertices, which is what the
   quantisation in the tracing step guarantees, so an edge that appears once
   over a set of rings is a coast and an edge that appears twice is a seam.
   The coastline and the two area outlines are recovered from that property
   rather than stored a second time. */
var LOCAL={};
Object.keys(DIST).forEach(function(k){
  LOCAL[k]=DIST[k].map(f2p);
});
function ekey(a,b){
  var x=a[0].toFixed(4)+' '+a[1].toFixed(4), y=b[0].toFixed(4)+' '+b[1].toFixed(4);
  return x<y?x+'|'+y:y+'|'+x;
}
/* Unshared edges, chained into the longest polylines they will form. */
function outline(rings){
  var cnt={}, i, j, r, a, b, k;
  for(i=0;i<rings.length;i++){
    r=rings[i];
    for(j=0;j<r.length;j++){
      a=r[j]; b=r[(j+1)%r.length]; k=ekey(a,b);
      cnt[k]=(cnt[k]||0)+1;
    }
  }
  var adj={}, pts={};
  function pk(p){return p[0].toFixed(4)+' '+p[1].toFixed(4);}
  for(i=0;i<rings.length;i++){
    r=rings[i];
    for(j=0;j<r.length;j++){
      a=r[j]; b=r[(j+1)%r.length];
      if(cnt[ekey(a,b)]!==1) continue;
      var ka=pk(a), kb=pk(b);
      pts[ka]=a; pts[kb]=b;
      (adj[ka]=adj[ka]||[]).push(kb);
      (adj[kb]=adj[kb]||[]).push(ka);
    }
  }
  var used={}, out=[];
  Object.keys(adj).forEach(function(start){
    adj[start].forEach(function(nxt){
      var e=start<nxt?start+'|'+nxt:nxt+'|'+start;
      if(used[e]) return;
      used[e]=1;
      var line=[pts[start],pts[nxt]], cur=nxt, prev=start;
      for(;;){
        var nb=adj[cur]||[], step=null;
        for(var m=0;m<nb.length;m++){
          var ee=cur<nb[m]?cur+'|'+nb[m]:nb[m]+'|'+cur;
          if(!used[ee]){step=nb[m];used[ee]=1;break;}
        }
        if(step===null) break;
        line.push(pts[step]); prev=cur; cur=step;
        if(cur===start) break;
      }
      if(line.length>2) out.push(line);
    });
  });
  return out;
}
var ALLRINGS=[];
Object.keys(LOCAL).forEach(function(k){ALLRINGS.push.apply(ALLRINGS,LOCAL[k]);});
var COASTS=outline(ALLRINGS);
var HKI_SET=['CW','WC','E','S'], KLN_SET=['YTM','SSP','KC','WTS','KT'];
function groupRings(list){
  var out=[]; list.forEach(function(k){out.push.apply(out,LOCAL[k]||[]);});
  return out;
}
/* Island names, districts and display tiers stay with the gazetteer; the
   outlines they label now come from the trace. */
var ISLBY={};
ISLPT.forEach(function(r){
  (ISLBY[r[4]]=ISLBY[r[4]]||[]).push({id:r[0],zh:r[1],en:r[2],ja:r[3],
                                      lon:r[5],lat:r[6],tier:r[7]});
});
var GEOM=LOCAL, FID='local';

/* Anchors for the district names. Centroids fall outside several of these
   shapes, so the anchors are placed by hand. */
var ANCH={CW:[114.140,22.283],WC:[114.176,22.271],E:[114.221,22.277],S:[114.190,22.243],
 YTM:[114.170,22.310],SSP:[114.156,22.334],KC:[114.192,22.324],WTS:[114.201,22.345],
 KT:[114.226,22.316],KWT:[114.124,22.356],TW:[114.108,22.384],TM:[113.990,22.396],
 YL:[114.040,22.446],N:[114.140,22.500],TP:[114.180,22.456],ST:[114.196,22.390],
 SK:[114.278,22.318],IS:[113.884,22.2470]};

/* ------------------------------------------------------------- svg tree -- */
var svg=$('#map'), stage=$('#stage'), tip=$('#tip'), reader=$('#reader');
var L={}, paths={};
function layer(k){var g=el('g',{'data-layer':k});L[k]=g;svg.appendChild(g);return g;}
['grat','districts','areas','gaz','coast','water','rivers','ranges','parks',
 'hit','names','cities'].forEach(layer);
/* One counter-scaled group per marker, nested inside its translate. A single
   group around everything would scale the translates too, so every marker's
   position would be multiplied by 1/zoom. The translate must stay in map units
   and the scale must reach only the marker's own geometry. */
function marker(x,y){
  var g=el('g',{'transform':'translate('+x.toFixed(1)+' '+y.toFixed(1)+')'});
  var inner=el('g',{'class':'mk'});
  g.appendChild(inner);
  return {g:g,mk:inner};
}
var lblDiv=[], lblCity=[], lblPeak=[], lblWater=[], lblRange=[], lblIsl=[];

function drawGeometry(){
  L.districts.textContent=''; L.hit.textContent=''; L.coast.textContent='';
  paths={};
  CODES.forEach(function(c){
    var rs=GEOM[c]; if(!rs||!rs.length) return;
    var p=el('path',{'class':'st','d':ringsToPath(rs,true),'data-c':c});
    L.districts.appendChild(p); paths[c]=p;
  });
  var cd='';
  COASTS.forEach(function(r){cd+=dOf(projRing(r),false);});
  L.coast.appendChild(el('path',{'class':'coast','d':cd}));
}
function drawAreas(){
  L.areas.textContent='';
  var d='';
  outline(groupRings(HKI_SET)).forEach(function(r){d+=dOf(projRing(r),false);});
  outline(groupRings(KLN_SET)).forEach(function(r){d+=dOf(projRing(r),false);});
  L.areas.appendChild(el('path',{'class':'area','d':d}));
}
function drawGaz(d){
  L.gaz.textContent='';
  if(!d) return;
  L.gaz.appendChild(el('path',{'class':'gaz','d':d}));
}

function drawStatic(){
  /* graticule at a tenth of a degree */
  var g='';
  for(var lo=113.8;lo<=114.5;lo+=0.1){
    var a=PJ(lo,22.10), b=PJ(lo,22.60); g+='M'+a[0].toFixed(1)+' '+a[1].toFixed(1)
      +'L'+b[0].toFixed(1)+' '+b[1].toFixed(1);}
  for(var la=22.1;la<=22.6;la+=0.1){
    var c=PJ(113.78,la), d2=PJ(114.52,la); g+='M'+c[0].toFixed(1)+' '+c[1].toFixed(1)
      +'L'+d2[0].toFixed(1)+' '+d2[1].toFixed(1);}
  L.grat.appendChild(el('path',{'class':'grat','d':g,'data-lbl':'g1'}));

  /* Reservoirs. The radii are given in degrees, so they are converted by
     projecting an offset point rather than by multiplying the fit scale:
     PJ.k scales projection units, not degrees. */
  WATERB.forEach(function(w){
    var p=PJ(w[2],w[3]), rx;
    if(w[6]&&w[6].length>=8){
      L.water.appendChild(el('path',{'class':'lake','d':ringsToPath([f2p(w[6])],true)}));
      var xs=[]; for(var q=0;q<w[6].length;q+=2) xs.push(PJ(w[6][q],w[6][q+1])[0]);
      rx=Math.max.apply(null,xs)-p[0];
    }else{
      rx=Math.max(1.6,Math.abs(PJ(w[2]+w[4],w[3])[0]-p[0]));
      var ry=Math.max(1.2,Math.abs(PJ(w[2],w[3]+w[5])[1]-p[1]));
      L.water.appendChild(el('ellipse',{'class':'lake','cx':p[0].toFixed(1),
        'cy':p[1].toFixed(1),'rx':rx.toFixed(1),'ry':ry.toFixed(1)}));
    }
    var tx=el('text',{'class':'tw twl','x':(p[0]+rx+3).toFixed(1),
      'y':(p[1]+3).toFixed(1),'data-lbl':'w2'});
    tx.dataset.zh=w[0]; tx.dataset.en=w[1];
    L.names.appendChild(tx); lblWater.push(tx);
  });
  /* watercourses */
  var ALLCOAST=[]; COASTS.forEach(function(r){ALLCOAST.push.apply(ALLCOAST,r);});
  function snapToCoast(p){
    var bi=0,bd=1e9;
    for(var i=0;i<ALLCOAST.length;i++){
      var q=ALLCOAST[i];
      var dd=Math.hypot((q[0]-p[0])*0.925,q[1]-p[1]);
      if(dd<bd){bd=dd;bi=i;}
    }
    return bd<0.035?ALLCOAST[bi].slice():p;
  }
  COURSE.forEach(function(c){
    var pts=f2p(c[2]);
    pts[pts.length-1]=snapToCoast(pts[pts.length-1]);
    var pr=projRing(pts);
    var id='rv'+lblRange.length;
    L.rivers.appendChild(el('path',{'class':'riv','d':dOf(pr,false),'id':id,
      'stroke-width':'calc(var(--u)*1.5px)'}));
    var tp=el('textPath',{'href':'#'+id,'startOffset':'46%'});
    var tx=el('text',{'class':'tw','data-lbl':'w1'});
    tx.dataset.zh=c[0]; tx.dataset.en=c[1];
    tx.setAttribute('text-anchor','middle');
    tx.appendChild(tp); L.names.appendChild(tx);
    lblRange.push({t:tx,tp:tp,id:id,kind:'r'});
  });
  /* ridges */
  SPINE.forEach(function(s){
    var pts=[]; for(var i=0;i<s[3].length;i+=3) pts.push([s[3][i],s[3][i+1]]);
    if(pts.length<2) return;
    var id='rg'+lblRange.length;
    L.ranges.appendChild(el('path',{'class':'rng','d':dOf(projRing(pts),false),'id':id}));
    var tp=el('textPath',{'href':'#'+id,'startOffset':'50%'});
    var tx=el('text',{'class':'tg','data-lbl':'w1'});
    tx.dataset.zh=s[0]; tx.dataset.en=s[1];
    tx.setAttribute('text-anchor','middle');
    tx.appendChild(tp); L.names.appendChild(tx);
    lblRange.push({t:tx,tp:tp,id:id,kind:'g'});
  });
  /* country parks */
  PARKP.forEach(function(p){
    if(!p[2]||p[2].length<8) return;
    L.parks.appendChild(el('path',{'class':'prk','d':ringsToPath([f2p(p[2])],true),
      'fill':'color-mix(in srgb,var(--tokiwa) 11%,transparent)','stroke':'none'}));
  });
  /* summits */
  PEAKPT.forEach(function(k){
    var p=PJ(k[2],k[3]), m=marker(p[0],p[1]);
    m.mk.appendChild(el('path',{'class':'pk','data-pk':k[0],
      'd':'M0 -4l3.6 6.2h-7.2Z'}));
    var tx=el('text',{'class':'pkl','x':5,'y':3.4,'data-lbl':'p1'});
    tx.dataset.zh=k[0]; tx.dataset.en=k[1]; tx.dataset.h=k[4];
    m.mk.appendChild(tx); L.cities.appendChild(m.g); lblPeak.push(tx);
  });
  /* island names */
  ISLPT.forEach(function(r){
    var p=PJ(r[5],r[6]);
    var tx=el('text',{'class':'il','x':p[0].toFixed(1),'y':(p[1]-5).toFixed(1),
      'data-lbl':'c'+Math.max(0,(r[7]||3)-1)});
    tx.dataset.zh=r[1]; tx.dataset.en=r[2]; tx.dataset.ja=r[3];
    L.names.appendChild(tx); lblIsl.push(tx);
  });
  /* places */
  PLACE.forEach(function(pl){
    var p=PJ(pl[3],pl[4]), tier=pl[5]-1;
    var m=marker(p[0],p[1]);
    m.g.setAttribute('data-tier',tier);
    m.mk.appendChild(el('circle',{'class':'ct','cx':0,'cy':0,
      'r':tier===0?2.6:tier===1?2.2:1.8,'data-cty':pl[0]}));
    var tx=el('text',{'class':'ctl','x':4.6,'y':3.2,'data-lbl':'c'+tier});
    tx.dataset.zh=pl[0]; tx.dataset.en=pl[1]; tx.dataset.ja=pl[2];
    m.mk.appendChild(tx); L.cities.appendChild(m.g); lblCity.push(tx);
  });
  /* district names */
  DIV.forEach(function(d){
    var a=ANCH[d.id]; if(!a) return;
    var p=PJ(a[0],a[1]);
    var tx=el('text',{'class':'tl','x':p[0].toFixed(1),'y':p[1].toFixed(1),
      'data-lbl':'s1','data-c':d.id});
    tx.textContent=dN(d);
    L.names.appendChild(tx); lblDiv.push(tx);
  });
}

/* ------------------------------------------------------------- tooltip --- */
function showTip(html,cx,cy){
  tip.innerHTML=html;
  var r=stage.getBoundingClientRect();
  tip.style.left=(cx-r.left)+'px'; tip.style.top=(cy-r.top)+'px';
  tip.style.opacity='1';
}
function hideTip(){tip.style.opacity='0';}

/* ---------------------------------------------------------- zoom / pan --- */
var FULL=SHEET.slice();
var V0=HOMEV.slice(), V=V0.slice(), MINW=V0[2]/40, anim=null, lastKey='';
function syncU(){
  var r=svg.getBoundingClientRect();
  if(r.width<=0||r.height<=0) return;
  var sc=Math.min(r.width/V[2],r.height/V[3]);
  if(sc>0) svg.style.setProperty('--u',(1/sc).toFixed(5));
}
function applyVB(){
  svg.setAttribute('viewBox',V[0].toFixed(2)+' '+V[1].toFixed(2)+' '
    +V[2].toFixed(2)+' '+V[3].toFixed(2));
  syncU(); detail();
}
function clampV(){
  V[2]=Math.max(MINW,Math.min(FULL[2],V[2])); V[3]=V[2]*(V0[3]/V0[2]);
  var mx=V[2]*0.30, my=V[3]*0.30;
  V[0]=Math.max(FULL[0]-mx,Math.min(V[0],FULL[0]+FULL[2]-V[2]+mx));
  V[1]=Math.max(FULL[1]-my,Math.min(V[1],FULL[1]+FULL[3]-V[3]+my));
}
function setView(x,y,w,instant){
  var tw=Math.max(MINW,Math.min(FULL[2],w));
  var target=[x,y,tw,tw*(V0[3]/V0[2])];
  if(anim){cancelAnimationFrame(anim);anim=null;}
  if(instant||window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    V=target; clampV(); applyVB(); return;
  }
  var from=V.slice(), t0=performance.now(), dur=340;
  (function step(now){
    var k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3);
    V=[from[0]+(target[0]-from[0])*e, from[1]+(target[1]-from[1])*e,
       from[2]+(target[2]-from[2])*e, from[3]+(target[3]-from[3])*e];
    clampV(); applyVB();
    if(k<1) anim=requestAnimationFrame(step); else anim=null;
  })(t0);
}
function zoomAbout(f,cx,cy,instant){
  var nw=Math.max(MINW,Math.min(FULL[2],V[2]*f)), nh=nw*(V0[3]/V0[2]);
  setView(cx-(cx-V[0])*(nw/V[2]), cy-(cy-V[1])*(nh/V[3]), nw, instant);
}
function toMap(clientX,clientY){
  var r=svg.getBoundingClientRect();
  var sc=Math.min(r.width/V[2],r.height/V[3]);
  var ox=(r.width-V[2]*sc)/2, oy=(r.height-V[3]*sc)/2;
  return [V[0]+(clientX-r.left-ox)/sc, V[1]+(clientY-r.top-oy)/sc];
}
function boundsOf(c){
  var rs=GEOM[c]; if(!rs||!rs.length) return null;
  var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  rs.forEach(function(r){r.forEach(function(q){
    var p=PJ(q[0],q[1]);
    if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0];
    if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1];});});
  return [x0,y0,x1,y1];
}
function flyTo(c){
  var b=boundsOf(c); if(!b) return;
  var w=Math.max((b[2]-b[0])*1.8,(b[3]-b[1])*1.8*(V0[2]/V0[3]),V0[2]/26);
  setView((b[0]+b[2])/2-w/2,(b[1]+b[3])/2-w*(V0[3]/V0[2])/2,w);
}

/* ------------------------------------------------------- level of detail -- */
function detail(){
  var z=V0[2]/V[2];
  $('#zlevel').textContent=(z<10?z.toFixed(1):Math.round(z))+'\u00D7';
  var maxTier = z>=6.0?3 : z>=3.4?2 : z>=1.8?1 : 0;
  var key=[maxTier, z>=1.3, z>=2.0, z>=2.8, z>=3.0, z>=3.4, z>=4.5,
           z>=5.5, z>=6.0].join('|');
  if(key===lastKey) return;
  lastKey=key;
  for(var t=0;t<=3;t++){
    var on=t<=maxTier;
    $$('[data-lbl="c'+t+'"]',svg).forEach(function(n){n.style.display=on?'':'none';});
    $$('[data-tier="'+t+'"]',svg).forEach(function(n){
      n.style.display=(t<=maxTier+1)?'':'none';});
  }
  $$('[data-lbl="w2"]',svg).forEach(function(n){n.style.display=z>=2.0?'':'none';});
  $$('[data-lbl="p1"]',svg).forEach(function(n){n.style.display=z>=1.3?'':'none';});
  $$('[data-lbl="g1"]',svg).forEach(function(n){n.style.display=z<6?'':'none';});
  L.ranges.style.opacity=z<3.4?'1':z<5.5?'0.45':'0';
  L.parks.style.opacity=z<3.0?'1':z<4.5?'0.5':'0';
  L.grat.style.opacity=z<4?'1':'0.35';
  requestAnimationFrame(function(){fitPathLabels();declutter();});
}
function fitPathLabels(){
  lblRange.forEach(function(o){
    var pe=document.getElementById(o.id); if(!pe) return;
    var pl=0,tw=0;
    try{pl=pe.getTotalLength();tw=o.t.getComputedTextLength();}catch(e){return;}
    o.t.style.display=(tw>0&&tw<pl*0.92)?'':'none';
  });
}
function declutter(){
  var placed=[], vis=svg.getBoundingClientRect();
  $$('text[data-lbl]',svg).forEach(function(t){t.removeAttribute('data-hid');});
  ['s1','c0','w1','c1','p1','c2','w2','c3'].forEach(function(g){
    $$('text[data-lbl="'+g+'"]',svg).forEach(function(t){
      if(t.style.display==='none'||!t.textContent) return;
      var b=t.getBoundingClientRect();
      if(!b.width||!b.height) return;
      if(b.right<vis.left-40||b.left>vis.right+40||
         b.bottom<vis.top-40||b.top>vis.bottom+40) return;
      var pad=1.5, r=[b.left-pad,b.top-pad,b.right+pad,b.bottom+pad];
      for(var i=0;i<placed.length;i++){
        var q=placed[i];
        if(r[0]<q[2]&&r[2]>q[0]&&r[1]<q[3]&&r[3]>q[1]){t.setAttribute('data-hid','1');return;}
      }
      placed.push(r);
    });
  });
}
function drawScale(){
  var s=$('#sbar'); if(!s) return;
  var r=svg.getBoundingClientRect(); if(!r.width) return;
  var a=PJ(114.0,22.3), b=PJ(114.1,22.3);
  var unitsPerKm=Math.hypot(a[0]-b[0],a[1]-b[1])/(0.1*111.32*Math.cos(22.3*RAD));
  var sc=Math.min(r.width/V[2],r.height/V[3]);
  var pxPerKm=unitsPerKm*sc, best=10, len=0;
  [0.5,1,2,5,10,20,25,50].forEach(function(t){
    var L2=t*pxPerKm; if(L2<=96){best=t;len=L2;}});
  if(!len){best=0.5;len=pxPerKm*0.5;}
  s.textContent='';
  var g=el('g'), seg=4, sw=len/seg;
  for(var i=0;i<seg;i++) g.appendChild(el('rect',{x:(i*sw).toFixed(1),y:3,
    width:sw.toFixed(1),height:4,fill:i%2?'var(--surf)':'var(--ink)',
    stroke:'var(--ink)','stroke-width':'.5'}));
  var t1=el('text',{x:0,y:15,'font-family':'var(--mono)','font-size':'8',fill:'var(--ink2)'});
  t1.textContent='0';
  var t2=el('text',{x:len.toFixed(1),y:15,'font-family':'var(--mono)','font-size':'8',
    fill:'var(--ink2)','text-anchor':'end'});
  t2.textContent=(best<1?best:fmt(best))+' km';
  g.appendChild(t1); g.appendChild(t2); s.appendChild(g);
  s.setAttribute('width',Math.max(70,len+6));
}

/* ------------------------------------------------------------ pointers --- */
svg.addEventListener('wheel',function(e){
  e.preventDefault();
  var m=toMap(e.clientX,e.clientY);
  var d=e.deltaMode===1?e.deltaY*16:e.deltaY;
  zoomAbout(Math.exp(Math.max(-0.6,Math.min(0.6,d*0.0016))),m[0],m[1],true);
},{passive:false});
var ptrs={}, pinch=null, down=null, moved=0;
/* Pointer capture routes later events to the svg, so a click never reaches the
   district path. Taps are detected here instead: press and release within a few
   pixels selects whatever lies underneath. */
function hitAt(cx,cy){
  function pick(x,y){
    var e=document.elementFromPoint(x,y);
    if(!e||!e.closest||!svg.contains(e)) return null;
    return {st:e.closest('[data-c]'), mk:e.closest('[data-pk],[data-cty]')};
  }
  var at=pick(cx,cy);
  if(at){ if(at.st) return at.st; if(at.mk) return at.mk; }
  var ring=[[0,-6],[6,0],[0,6],[-6,0],[4,-4],[-4,4],[4,4],[-4,-4],
            [0,-12],[12,0],[0,12],[-12,0]];
  for(var i=0;i<ring.length;i++){
    var q=pick(cx+ring[i][0],cy+ring[i][1]);
    if(!q) continue;
    if(q.st) return q.st;
    if(q.mk) return q.mk;
  }
  return null;
}
function handleTap(cx,cy){
  var n=hitAt(cx,cy);
  if(!n){ closeReader(); return; }
  if(n.hasAttribute('data-c')) openDiv(n.getAttribute('data-c'));
  else if(n.hasAttribute('data-pk')) flashPeak(n.getAttribute('data-pk'));
  else if(n.hasAttribute('data-cty')) flashCity(n.getAttribute('data-cty'));
}
svg.addEventListener('pointerdown',function(e){
  svg.setPointerCapture(e.pointerId);
  ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
  var n=Object.keys(ptrs).length;
  if(n===1){down={x:e.clientX,y:e.clientY,V:V.slice()};moved=0;svg.classList.add('dragging');}
  else if(n===2){
    var k=Object.keys(ptrs), a=ptrs[k[0]], b=ptrs[k[1]];
    pinch={d:Math.hypot(a.x-b.x,a.y-b.y),V:V.slice(),
      m:toMap((a.x+b.x)/2,(a.y+b.y)/2)};
    down=null;
  }
});
svg.addEventListener('pointermove',function(e){
  if(!ptrs[e.pointerId]) {
    var n2=hitAt(e.clientX,e.clientY);
    if(n2&&n2.hasAttribute('data-c')){
      var d=BY[n2.getAttribute('data-c')];
      if(d) showTip('<b>'+esc(dN(d))+'</b><span>'+fmt(d.pop)+' \u00B7 '+
        d.area.toFixed(1)+' km\u00B2</span>',e.clientX,e.clientY);
    } else hideTip();
    return;
  }
  ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
  var keys=Object.keys(ptrs);
  if(keys.length>=2&&pinch){
    var a=ptrs[keys[0]], b=ptrs[keys[1]];
    var nd=Math.hypot(a.x-b.x,a.y-b.y);
    if(nd>8&&pinch.d>8){
      var f=pinch.d/nd;
      var nw=Math.max(MINW,Math.min(FULL[2],pinch.V[2]*f));
      var nh=nw*(V0[3]/V0[2]);
      V=[pinch.m[0]-(pinch.m[0]-pinch.V[0])*(nw/pinch.V[2]),
         pinch.m[1]-(pinch.m[1]-pinch.V[1])*(nh/pinch.V[3]),nw,nh];
      clampV(); applyVB();
    }
    return;
  }
  if(!down) return;
  var r=svg.getBoundingClientRect();
  var sc=Math.min(r.width/down.V[2],r.height/down.V[3]);
  var dx=(e.clientX-down.x)/sc, dy=(e.clientY-down.y)/sc;
  moved=Math.max(moved,Math.abs(e.clientX-down.x)+Math.abs(e.clientY-down.y));
  V[0]=down.V[0]-dx; V[1]=down.V[1]-dy; clampV(); applyVB();
});
function endPointer(e){
  var had=!!ptrs[e.pointerId];
  delete ptrs[e.pointerId];
  if(Object.keys(ptrs).length<2) pinch=null;
  if(Object.keys(ptrs).length===0){
    svg.classList.remove('dragging');
    if(had&&down&&moved<6) handleTap(e.clientX,e.clientY);
    down=null;
  }
}
svg.addEventListener('pointerup',endPointer);
svg.addEventListener('pointercancel',endPointer);
svg.addEventListener('pointerleave',function(){hideTip();});
svg.addEventListener('keydown',function(e){
  var st=V[2]*0.16;
  if(e.key==='ArrowLeft'){V[0]-=st;clampV();applyVB();}
  else if(e.key==='ArrowRight'){V[0]+=st;clampV();applyVB();}
  else if(e.key==='ArrowUp'){V[1]-=st;clampV();applyVB();}
  else if(e.key==='ArrowDown'){V[1]+=st;clampV();applyVB();}
  else if(e.key==='+'||e.key==='='){zoomAbout(1/1.6,V[0]+V[2]/2,V[1]+V[3]/2);}
  else if(e.key==='-'||e.key==='_'){zoomAbout(1.6,V[0]+V[2]/2,V[1]+V[3]/2);}
  else if(e.key==='0'){setView(V0[0],V0[1],V0[2]);}
  else return;
  e.preventDefault();
});
$('#zin').addEventListener('click',function(){zoomAbout(1/1.6,V[0]+V[2]/2,V[1]+V[3]/2);});
$('#zout').addEventListener('click',function(){zoomAbout(1.6,V[0]+V[2]/2,V[1]+V[3]/2);});
$('#zfit').addEventListener('click',function(){closeReader();setView(V0[0],V0[1],V0[2]);});

function flashPeak(zh){
  var k=null; PEAKPT.forEach(function(p){if(p[0]===zh)k=p;});
  if(!k) return;
  showTipAt(PJ(k[2],k[3]),'<b>'+esc(cur==='en'?k[1]:k[0])+'</b><span>'+fmt(k[4])+' m</span>');
}
function flashCity(zh){
  var k=null; PLACE.forEach(function(p){if(p[0]===zh)k=p;});
  if(!k) return;
  showTipAt(PJ(k[3],k[4]),'<b>'+esc(cur==='zh'?k[0]:cur==='ja'?k[2]:k[1])+'</b>');
}
function showTipAt(p,html){
  var r=svg.getBoundingClientRect();
  var sc=Math.min(r.width/V[2],r.height/V[3]);
  var ox=(r.width-V[2]*sc)/2, oy=(r.height-V[3]*sc)/2;
  showTip(html, r.left+ox+(p[0]-V[0])*sc, r.top+oy+(p[1]-V[1])*sc);
  setTimeout(hideTip,2200);
}

/* -------------------------------------------------------------- layers --- */
var LAYERS=[['districts','lyDiv',1,''],['areas','lyArea',0,'var(--plum)'],
 ['gaz','lyGaz',1,'var(--rikyu)'],
 ['water','lyWater',1,'var(--hanada)'],['rivers','lyRivers',1,'var(--hanada)'],
 ['ranges','lyRanges',1,'var(--tobi)'],['parks','lyParks',1,'var(--tokiwa)'],
 ['cities','lyCities',1,'var(--ink)'],['names','lyNames',1,''],
 ['grat','lyGrat',1,'var(--rikyu)']];
LAYERS.forEach(function(a){
  var b=document.createElement('button');
  b.className='lsw'; b.setAttribute('aria-pressed',a[2]?'true':'false'); b.dataset.layer=a[0];
  b.innerHTML='<span data-t="'+a[1]+'"></span>'+(a[3]?'<i style="color:'+a[3]+'"></i>':'');
  b.addEventListener('click',function(){
    var on=b.getAttribute('aria-pressed')!=='true';
    b.setAttribute('aria-pressed',String(on));
    L[a[0]].setAttribute('data-off',on?'0':'1');
    if(a[0]==='districts'){L.coast.setAttribute('data-off',on?'0':'1');}
    if(a[0]==='areas'){
      var s=$('#swArea'); if(s) s.setAttribute('aria-pressed',String(on));}
  });
  $('#layers').appendChild(b);
  if(!a[2]) L[a[0]].setAttribute('data-off','1');
});
$('#lbtn').addEventListener('click',function(){
  var p=$('#lpanel'), on=!p.classList.contains('open');
  p.classList.toggle('open',on); $('#lbtn').setAttribute('aria-expanded',String(on));
});

var RAMPS={
  paper:['#F4EDE4','#E7D8D8','#D3B8C6','#B694AE','#94658F','#622954'],
  dusk :['#EFE6DA','#E0CFCF','#CBAFBE','#AE8CA6','#8C5D87','#5A2549'],
  night:['#2A333F','#36304A','#443456','#553963','#6B4172','#874E85']
};
function RAMP(){var g=document.documentElement.getAttribute('data-ground');
  return RAMPS[g]||RAMPS.paper;}
var THEMES=[['','thNone'],['pop','thPop'],['den','thDen'],['area','thArea'],
 ['med','thMed'],['a2','thAged'],['a0','thYoung']];
function buildThemes(){
  var s=$('#theme'), keep=s.value; s.textContent='';
  THEMES.forEach(function(t){
    var o=document.createElement('option'); o.value=t[0]; o.textContent=T(t[1]); s.appendChild(o);});
  s.value=keep||'';
}
var curTheme='';
function applyTheme(k){
  curTheme=k;
  var key=$('#key');
  if(!k){CODES.forEach(function(c){if(paths[c])paths[c].style.removeProperty('fill');});
    key.textContent=''; return;}
  var vals=[];
  CODES.forEach(function(c){var v=BY[c][k]; if(isFinite(v)&&v>0) vals.push(v);});
  vals.sort(function(a,b){return a-b;});
  var R=RAMP(), n=R.length, brk=[];
  for(var i=1;i<n;i++) brk.push(vals[Math.floor(i*vals.length/n)]);
  CODES.forEach(function(c){
    var v=BY[c][k], p=paths[c]; if(!p) return;
    if(!isFinite(v)||v<=0){p.style.fill='var(--surf3)';return;}
    var i2=0; while(i2<brk.length&&v>=brk[i2]) i2++;
    p.style.fill=R[i2];
  });
  var lo=vals[0], hi=vals[vals.length-1];
  var f=function(v){return v<100?v.toFixed(1):fmt(Math.round(v));};
  key.innerHTML='<div class="keybar">'+R.map(function(c){
      return '<span style="flex:1;background:'+c+'"></span>';}).join('')+'</div>'
    +'<div class="keycap"><span>'+f(lo)+'</span><span>'+T('thSextile')
    +'</span><span>'+f(hi)+'</span></div>';
}
$('#theme').addEventListener('change',function(e){applyTheme(e.target.value);});

/* -------------------------------------------------------------- search --- */
var IDX=[];
function buildIndex(){
  var out=[],seen={};
  function add(t,sub,c,kind,lo,la){
    if(!t) return; var key=t+'|'+c+'|'+kind; if(seen[key])return; seen[key]=1;
    out.push({t:t,sub:sub,c:c,kind:kind,lo:lo,la:la});
  }
  DIV.forEach(function(d){
    add(d.en,d.zh,d.id,'div'); add(d.zh,d.en,d.id,'div');
    add(toJa(d.zh),d.en,d.id,'div'); add(d.rom,d.en,d.id,'div');
    add(d.seatEn,dN(d),d.id,'seat'); add(d.seat,dN(d),d.id,'seat');
  });
  PLACE.forEach(function(p){
    add(p[1],p[0],null,'place',p[3],p[4]); add(p[0],p[1],null,'place',p[3],p[4]);
    add(p[2],p[1],null,'place',p[3],p[4]);
  });
  PEAKPT.forEach(function(p){
    add(p[1],p[0]+' \u00B7 '+fmt(p[4])+' m',null,'peak',p[2],p[3]);
    add(p[0],p[1]+' \u00B7 '+fmt(p[4])+' m',null,'peak',p[2],p[3]);
  });
  WATERB.forEach(function(w){
    add(w[1],w[0],null,'water',w[2],w[3]); add(w[0],w[1],null,'water',w[2],w[3]);
  });
  ISLPT.forEach(function(r){
    add(r[2],r[1],r[4],'isl',r[5],r[6]); add(r[1],r[2],r[4],'isl',r[5],r[6]);
    add(r[3],r[2],r[4],'isl',r[5],r[6]);
  });
  IDX=out;
}
var qEl=$('#q'), resEl=$('#res');
function runSearch(){
  var v=(qEl.value||'').trim().toLowerCase();
  $('#qx').hidden=!v;
  if(!v){resEl.classList.remove('open');resEl.textContent='';return;}
  var hits=IDX.filter(function(o){return o.t.toLowerCase().indexOf(v)===0;})
    .concat(IDX.filter(function(o){return o.t.toLowerCase().indexOf(v)>0;}))
    .slice(0,12);
  if(!hits.length){resEl.classList.remove('open');return;}
  resEl.innerHTML=hits.map(function(o,i){
    return '<button data-i="'+i+'">'+esc(o.t)+'<span class="k">'+esc(o.sub||'')+'</span></button>';
  }).join('');
  resEl.classList.add('open');
  $$('button',resEl).forEach(function(b,i){
    b.addEventListener('click',function(){pickHit(hits[i]);});
  });
}
function pickHit(o){
  resEl.classList.remove('open'); qEl.value='';  $('#qx').hidden=true;
  if(o.c){ openDiv(o.c); flyTo(o.c); }
  if(o.lo!=null){
    var p=PJ(o.lo,o.la), w=V0[2]/10;
    setView(p[0]-w/2,p[1]-w*(V0[3]/V0[2])/2,w);
  }
}
qEl.addEventListener('input',runSearch);
$('#qx').addEventListener('click',function(){qEl.value='';runSearch();qEl.focus();});
document.addEventListener('click',function(e){
  if(!resEl.contains(e.target)&&e.target!==qEl) resEl.classList.remove('open');
});

/* -------------------------------------------------------------- reader --- */
var sel=null;
function clearSel(){Object.keys(paths).forEach(function(k){paths[k].classList.remove('sel');});}
function revealRecord(){
  var r=reader.getBoundingClientRect(), want=window.innerHeight-150;
  if(r.top>want+8){
    var dy=r.top-want;
    if(window.scrollBy) window.scrollBy({top:dy,left:0,behavior:'smooth'});
    else window.scrollTo(0,window.pageYOffset+dy);
  } else if(r.bottom<80) reader.scrollIntoView({behavior:'smooth',block:'center'});
}
function chips(a,cls){
  if(!a||!a.length) return '<span style="color:var(--ink3);font-style:italic">'+T('none')+'</span>';
  return '<div class="chips">'+a.map(function(x){
    return '<span class="chip '+cls+'">'+esc(x)+'</span>';}).join('')+'</div>';
}
function cell(v,l){return '<div><div class="v">'+v+'</div><div class="tag">'+l+'</div></div>';}
function showHint(){
  sel=null; clearSel();
  reader.innerHTML='<div class="hint"><span class="tag">'+T('promptH')+'</span>'
   +'<p>'+T('promptP')+'</p><div class="natg">'
   +cell(fmt(TOTP),T('nPop'))+cell(fmt(Math.round(TOTA)),T('nArea'))
   +cell('18',T('nDiv'))+cell('957',T('nHi'))
   +cell(String(PARKS.length),T('nParks'))+cell(String(ISLPT.length),T('nIsl'))
   +cell(String(WATERB.length),T('nRes'))+cell(String(PLACE.length),T('cPlace'))
   +'</div></div>';
}
function openDiv(c){
  var d=BY[c]; if(!d) return;
  clearSel(); if(paths[c]) paths[c].classList.add('sel');
  sel=c; hideTip();
  var isl=(ISLBY[c]||[]).map(function(o){
    return cur==='zh'?o.zh:cur==='ja'?o.ja:o.en;});
  reader.innerHTML=
   '<div class="rd-h"><div style="min-width:0"><span class="tag">'
   +esc(T(REGK[d.reg]))+'</span>'
   +'<h2>'+esc(dN(d))+'</h2><div class="nick">'+esc(dAlt(d))+' \u00B7 '+esc(d.rom)+'</div></div>'
   +'<button class="rd-x" id="rdX" aria-label="Close">&times;</button></div>'
   +'<div class="rd-b">'
   +'<div class="blk"><div class="figs">'
   +'<div><div class="v">'+fmt(d.pop)+'</div><div class="tag">'+T('fPop')+'</div>'
     +'<div class="r">'+T('rank')+' '+d.pr+'</div></div>'
   +'<div><div class="v">'+d.area.toFixed(1)+'</div><div class="tag">'+T('fArea')+'</div>'
     +'<div class="r">'+T('rank')+' '+d.ar+'</div></div>'
   +'<div><div class="v">'+fmt(d.den)+'</div><div class="tag">'+T('fDen')+'</div>'
     +'<div class="r">'+T('rank')+' '+d.dr+'</div></div>'
   +'<div><div class="v">'+d.med.toFixed(1)+'</div><div class="tag">'+T('fMed')+'</div></div>'
   +'<div><div class="v">'+fmt(d.hiM)+'</div><div class="tag">'+T('fHigh')+'</div></div>'
   +'<div><div class="v">'+(d.pop/TOTP*100).toFixed(2)+'%</div><div class="tag">'+T('kShare')+'</div></div>'
   +'</div></div>'
   +'<div class="blk"><dl class="kv">'
   +'<dt>'+T('kSeat')+'</dt><dd>'+esc(dSeat(d))+'</dd>'
   +'<dt>'+T('kReg')+'</dt><dd>'+esc(T(REGK[d.reg]))+'</dd>'
   +'<dt>'+T('kHigh')+'</dt><dd>'+esc(dHiN(d))+' \u00B7 '+fmt(d.hiM)+' m</dd>'
   +'<dt>'+T('kAges')+'</dt><dd class="mono">'+d.a0.toFixed(1)+' / '+d.a1.toFixed(1)
     +' / '+d.a2.toFixed(1)+' %</dd>'
   +'</dl></div>'
   +(isl.length?'<div class="blk"><span class="tag">'+T('bIsl')+'</span>'
      +chips(isl,'')+'</div>':'')
   +'<div class="blk"><span class="tag">'+T('bAbout')+'</span>'
     +'<p class="prose">'+esc(dNote(d))+'</p></div>'
   +'<div class="blk"><span class="tag">'+T('bNote')+'</span>'
     +chips(dHigh(d),'')+'</div>'
   +'</div>';
  $('#rdX').addEventListener('click',closeReader);
  revealRecord();
}
function closeReader(){clearSel();showHint();}

/* --------------------------------------------------- national section ---- */
function pol(cx,cy,r,adeg){var a=adeg*RAD;return [cx+r*Math.cos(a),cy+r*Math.sin(a)];}
function pt(p){return p[0].toFixed(2)+' '+p[1].toFixed(2);}
function starPath(cx,cy,r,rot){
  var p=[];
  for(var i=0;i<5;i++){
    p.push(pol(cx,cy,r,rot+i*72));
    p.push(pol(cx,cy,r*0.382,rot+i*72+36));
  }
  return 'M'+p.map(pt).join('L')+'Z';
}
/* The flower is built from the specification in schedule 1 to the Regional Flag
   and Regional Emblem Ordinance: a white five-petal bauhinia in swaying motion,
   the diameter of its circumscribing circle three fifths of the height of the
   flag, the petals evenly spread about the centre and turning clockwise, each
   bearing a red five-pointed star and a red style. The curve of the petal is a
   reconstruction: the statute describes the flower and fixes the circle, but it
   does not give the outline as a formula, so this will not match the gazetted
   artwork exactly. That is stated in the method note. */
function petalPath(cx,cy,R,a0){
  var N=26, left=[], right=[], i, t, r, a, w, p, pa;
  for(i=0;i<=N;i++){
    t=i/N; r=(0.10+0.90*t)*R; a=a0+27-40*t;
    w=0.33*R*Math.sin(Math.PI*Math.pow(t,1.45));
    p=pol(cx,cy,r,a); pa=(a+90)*RAD;
    left.push([p[0]+w*Math.cos(pa), p[1]+w*Math.sin(pa)]);
    right.push([p[0]-w*Math.cos(pa), p[1]-w*Math.sin(pa)]);
  }
  var d='M'+pt(left[0]);
  for(i=1;i<=N;i++) d+='L'+pt(left[i]);
  for(i=N;i>=0;i--) d+='L'+pt(right[i]);
  return d+'Z';
}
function bauhinia(host,cx,cy,R,red){
  for(var i=0;i<5;i++)
    host.appendChild(el('path',{d:petalPath(cx,cy,R,-90+i*72),fill:'#FFFFFF'}));
  for(var j=0;j<5;j++){
    var b=-90+j*72, ca=b+27-40*0.63, s=pol(cx,cy,0.63*R,ca);
    host.appendChild(el('path',{d:starPath(s[0],s[1],0.135*R,ca),fill:red}));
    var q0=pol(cx,cy,0.20*R,b+20), q1=pol(cx,cy,0.44*R,b+11);
    host.appendChild(el('line',{x1:q0[0].toFixed(2),y1:q0[1].toFixed(2),
      x2:q1[0].toFixed(2),y2:q1[1].toFixed(2),stroke:red,
      'stroke-width':(0.05*R).toFixed(2),'stroke-linecap':'round'}));
  }
}
var HK_RED='#DE2910';
function chipSvg(kind){
  var o='<svg viewBox="0 0 60 40" aria-hidden="true">';
  if(kind==='qing') return o+'<rect width="60" height="40" fill="#FFDE00"/></svg>';
  if(kind==='jp') return o+'<rect width="60" height="40" fill="#fff"/>'
    +'<circle cx="30" cy="20" r="12" fill="#BC002D"/></svg>';
  if(kind==='uk') return o+'<rect width="60" height="40" fill="#012169"/>'
    +'<path d="M0 0L60 40M60 0L0 40" stroke="#fff" stroke-width="8"/>'
    +'<path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" stroke-width="4"/>'
    +'<path d="M30 0V40M0 20H60" stroke="#fff" stroke-width="13"/>'
    +'<path d="M30 0V40M0 20H60" stroke="#C8102E" stroke-width="8"/></svg>';
  if(kind==='hksar'){
    var g=document.createElementNS(NS,'svg');
    g.setAttribute('viewBox','0 0 60 40');
    g.appendChild(el('rect',{width:60,height:40,fill:HK_RED}));
    bauhinia(g,30,20,40*0.30,HK_RED);
    return g.outerHTML;
  }
  return '';
}
function paintSuccession(){
  var li=LI();
  $('#succ').innerHTML=REGIME.map(function(r){
    var yr=yrLab(r[0])+(r[1]>=2026?'\u2013'+T('present'):'\u2013'+yrLab(r[1]));
    var fl=chipSvg(r[5]);
    return '<li><span class="fl'+(fl?'':' none')+'">'+fl+'</span>'
      +'<span><span class="y">'+yr+'</span>'
      +'<span class="n">'+esc(li===0?r[3]:li===1?r[2]:r[4])+'</span>'
      +'<span class="d">'+esc(li===0?r[7]:li===1?r[6]:r[8])+'</span></span></li>';
  }).join('');
}
var islSel=-1;
/* Both axes are drawn by the same routine. Nothing is lettered inside a band:
   on a linear axis the Qin is a fraction of one per cent of the width, so any
   lettering there is bound to clip. Every name is given in full in a legend
   that wraps, so nothing is truncated at any window width.

   Selecting a band changes the note and nothing else. It does not move the map:
   the axis is a reading device. */
function yrLab(v){
  if(v<0) return (-v)+' '+(cur==='en'?'BC':'前');
  return String(v);
}
function eraSpanOf(e,last){
  return yrLab(e[0])+(cur==='en'?' to ':'\u2013')
    +(e[1]>=last?T('present'):yrLab(e[1]));
}
function nameOf(e){var li=LI();return li===0?e[3]:li===1?e[2]:e[4];}
function noteOf(e){var li=LI();return li===0?e[7]:li===1?e[6]:e[8];}
function drawAxis(data,ids,sel,pick){
  var T0=data[0][0], T1=data[data.length-1][1], SPAN=T1-T0;
  $('#'+ids.band).innerHTML=data.map(function(e,i){
    var lab=nameOf(e)+' '+eraSpanOf(e,T1);
    return '<button type="button" data-i="'+i+'" aria-pressed="'+(sel===i)+'"'
      +' style="width:'+((e[1]-e[0])/SPAN*100).toFixed(3)+'%;background:'+e[5]+'"'
      +' aria-label="'+esc(lab)+'" title="'+esc(lab)+'"></button>';
  }).join('');
  var bw=0;
  try{ bw=$('#'+ids.band).getBoundingClientRect().width||0; }catch(err){}
  if(!bw) bw=600;
  var all=ids.ticks||[T0,T0+Math.round(SPAN*0.25),T0+Math.round(SPAN*0.5),
                      T0+Math.round(SPAN*0.75),T1];
  var ticks = bw>=620 ? all
            : bw>=380 ? [all[0],all[Math.floor(all.length/2)],all[all.length-1]]
            :           [all[0],all[all.length-1]];
  $('#'+ids.scale).innerHTML=ticks.map(function(y,i){
    if(i===0) return '<span style="left:0">'+yrLab(y)+'</span>';
    if(i===ticks.length-1)
      return '<span class="last" style="right:0">'+yrLab(y)+'</span>';
    var pos=(y-T0)/SPAN*100;
    return '<span style="left:'+pos.toFixed(2)+'%;transform:translateX(-50%)">'
      +yrLab(y)+'</span>';
  }).join('');
  $('#'+ids.chips).innerHTML=data.map(function(e,i){
    return '<button type="button" data-i="'+i+'" aria-pressed="'+(sel===i)+'">'
      +'<i style="background:'+e[5]+'"></i>'+esc(nameOf(e))
      +'<span class="y">'+esc(eraSpanOf(e,T1))+'</span></button>';
  }).join('');
  $$('#'+ids.band+' button').concat($$('#'+ids.chips+' button'))
    .forEach(function(b){b.addEventListener('click',function(){pick(+b.dataset.i);});});
}
function axisNote(data,ids,sel){
  var n=$('#'+ids.note);
  if(sel<0){ n.innerHTML='<span style="color:var(--ink3)">'+esc(T('eraPrompt'))
    +'</span>'; markTimeline(); return; }
  var e=data[sel], T1=data[data.length-1][1];
  n.innerHTML='<b>'+esc(nameOf(e))+'</b>'
    +'<span class="yr">'+esc(eraSpanOf(e,T1))+' \u00B7 '+(e[1]-e[0])+' '
    +esc(T('eraYears'))+'</span><br>'
    +esc(noteOf(e))
    +(e[9]?'<span class="st">'+esc(T(ids.stKey))+' \u00B7 '+esc(e[9])+'</span>':'');
  markTimeline();
}
function markTimeline(){
  var r=(islSel>=0)?[HKERA[islSel][0],HKERA[islSel][1]]:null;
  $$('#tline li').forEach(function(li){
    var y=+li.dataset.y;
    li.classList.toggle('sel', !!r && y>=r[0] && y<=r[1]);
  });
}
function markAxis(ids,sel){
  $$('#'+ids.band+' button').concat($$('#'+ids.chips+' button')).forEach(function(n){
    n.setAttribute('aria-pressed',String(+n.dataset.i===sel));});
}
var ISLIDS={band:'islband',scale:'islscale',chips:'islchips',note:'islnote',
            ticks:[1573,1700,1800,1900,2026],stKey:'islStruct'};
function paintEras(){
  drawAxis(HKERA,ISLIDS,islSel,pickIsl);
  $('#islPreLbl').textContent=T('eraPre');
  $('#islcaveat').textContent=T('islCaveat');
  showIsl();
}
function pickIsl(i){
  islSel=(islSel===i)?-1:i;
  markAxis(ISLIDS,islSel); showIsl();
}
function showIsl(){ axisNote(HKERA,ISLIDS,islSel); }
function paintNational(){
  var li=LI();
  $('#natName').textContent=['Hong Kong','香港','香港'][li];
  paintSuccession(); paintEras();
  $('#natfacts').innerHTML=
    '<div><dt class="tag">'+T('fDivs')+'</dt><dd>18</dd></div>'
   +'<div><dt class="tag">'+T('fPopTotal')+'</dt><dd>7,413,070 <span class="mono">\u00B7 2021</span></dd></div>'
   +'<div><dt class="tag">'+T('fLargest')+'</dt><dd>'
      +esc(['Sha Tin','沙田區','沙田区'][li])+'</dd></div>'
   +'<div><dt class="tag">'+T('fArea')+'</dt><dd class="mono">'
      +fmt(Math.round(TOTA))+' km\u00B2</dd></div>'
   +'<div><dt class="tag">'+T('fLangs')+'</dt><dd>'
      +esc(['Cantonese, English, Mandarin','粵語、英語、普通話','広東語・英語・普通話'][li])+'</dd></div>'
   +'<div><dt class="tag">'+T('fCurrency')+'</dt><dd>HKD HK$</dd></div>'
   +'<div><dt class="tag">'+T('fZone')+'</dt><dd class="mono">UTC+8</dd></div>'
   +'<div><dt class="tag">'+T('fCodes')+'</dt><dd class="mono">HK \u00B7 HKG \u00B7 344</dd></div>';
  $('#tline').innerHTML=HIST.map(function(a){
    return '<li data-y="'+a[0]+'"'+(a[1]?' class="mapchg"':'')
      +'><span class="y">'+yrLab(a[0])+'</span>'
      +'<span class="w">'+esc(a[2][li])+'<span class="a">'+esc(a[3])+'</span></span></li>';
  }).join('');
  markTimeline();
}

/* -------------------------------------------------------------- tables --- */
function sortable(tblId,cols,rows,render){
  var t=$('#'+tblId), head=$('thead tr',t), body=$('tbody',t);
  var sk=null, sd=1;
  function paint(){
    head.innerHTML=cols.map(function(c,i){
      var a=(sk===i)?(sd>0?'ascending':'descending'):null;
      return '<th'+(c.n?' class="n"':'')+(c.opt?' data-opt="'+c.opt+'"':'')
        +(a?' aria-sort="'+a+'"':'')+' data-i="'+i+'">'+esc(T(c.t))+'</th>';
    }).join('');
    var rs=rows.slice();
    if(sk!==null) rs.sort(function(a,b){
      var x=cols[sk].v(a), y=cols[sk].v(b);
      if(typeof x==='number'&&typeof y==='number') return (x-y)*sd;
      return String(x).localeCompare(String(y))*sd;});
    body.innerHTML=rs.map(render).join('');
    $$('th',head).forEach(function(th){
      th.addEventListener('click',function(){
        var i=+th.dataset.i;
        if(sk===i) sd=-sd; else {sk=i;sd=cols[i].n?-1:1;}
        paint();});
    });
    $$('td.nm button',body).forEach(function(b){
      b.addEventListener('click',function(){openDiv(b.dataset.c);flyTo(b.dataset.c);});
    });
  }
  paint();
  return paint;
}
var repaintTables=[];
function buildTables(){
  repaintTables=[];
  repaintTables.push(sortable('tDv',[
    {t:'cDiv',v:function(d){return dN(d);}},
    {t:'cReg',v:function(d){return T(REGK[d.reg]);},opt:2},
    {t:'cSeat',v:function(d){return dSeat(d);},opt:1},
    {t:'cPop',v:function(d){return d.pop;},n:1},
    {t:'cArea',v:function(d){return d.area;},n:1},
    {t:'cDen',v:function(d){return d.den;},n:1},
    {t:'cMed',v:function(d){return d.med;},n:1,opt:1},
    {t:'cHigh',v:function(d){return d.hiM;},n:1,opt:2}
  ],DIV,function(d){
    return '<tr><td class="nm"><button data-c="'+d.id+'">'+esc(dN(d))+'</button></td>'
      +'<td data-opt="2">'+esc(T(REGK[d.reg]))+'</td>'
      +'<td data-opt="1">'+esc(dSeat(d))+'</td>'
      +'<td class="n">'+fmt(d.pop)+'</td>'
      +'<td class="n">'+d.area.toFixed(2)+'</td>'
      +'<td class="n">'+fmt(d.den)+'</td>'
      +'<td class="n" data-opt="1">'+d.med.toFixed(1)+'</td>'
      +'<td class="n" data-opt="2">'+fmt(d.hiM)+'</td></tr>';
  }));
  repaintTables.push(sortable('tPk',[
    {t:'cSummit',v:function(r){return cur==='en'?r[1]:r[0];}},
    {t:'cHeight',v:function(r){return r[2];},n:1},
    {t:'cWhere',v:function(r){return r[3];},opt:1},
    {t:'cNote',v:function(r){return r[4];},opt:2}
  ],PEAKLIST,function(r){
    return '<tr><td>'+esc(r[0])+' <span class="mono" style="color:var(--ink3)">'
      +esc(r[1])+'</span></td><td class="n">'+fmt(r[2])+'</td>'
      +'<td data-opt="1">'+esc(r[3])+'</td>'
      +'<td class="wrap" data-opt="2">'+esc(r[4])+'</td></tr>';
  }));
  repaintTables.push(sortable('tRv',[
    {t:'cName',v:function(r){return cur==='en'?r[1]:r[0];}},
    {t:'cKind',v:function(r){return T(r[2]==='res'?'cRes':'cRiv');},opt:2},
    {t:'cMeasure',v:function(r){return parseFloat(String(r[3]).replace(/[^\d.]/g,''))||0;},n:1},
    {t:'cDate',v:function(r){return r[4];},opt:1},
    {t:'cNote',v:function(r){return r[5];},opt:2}
  ],WATERS,function(r){
    return '<tr><td>'+esc(r[0])+' <span class="mono" style="color:var(--ink3)">'
      +esc(r[1])+'</span></td>'
      +'<td data-opt="2">'+esc(T(r[2]==='res'?'cRes':'cRiv'))+'</td>'
      +'<td class="n">'+esc(r[3])+' <span class="mono" style="color:var(--ink3)">'
      +esc(T(r[2]==='res'?'cCap':'cLen'))+'</span></td>'
      +'<td data-opt="1">'+esc(r[4])+'</td>'
      +'<td class="wrap" data-opt="2">'+esc(r[5])+'</td></tr>';
  }));
  repaintTables.push(sortable('tPr',[
    {t:'cPark',v:function(r){return cur==='en'?r[1]:r[0];}},
    {t:'cDesig',v:function(r){return r[3];}},
    {t:'cArea2',v:function(r){return r[4];},n:1},
    {t:'cNote',v:function(r){return r[5];},opt:2}
  ],PARKS,function(r){
    return '<tr><td>'+esc(r[0])+' <span class="mono" style="color:var(--ink3)">'
      +esc(r[1])+'</span></td><td>'+esc(cur==='en'?r[3]:r[2])+'</td>'
      +'<td class="n">'+fmt(r[4])+'</td>'
      +'<td class="wrap" data-opt="2">'+esc(r[5])+'</td></tr>';
  }));
  repaintTables.push(sortable('tIs',[
    {t:'cIsland',v:function(r){return cur==='en'?r[1]:r[0];}},
    {t:'cArea',v:function(r){return Number(r[2]);},n:1},
    {t:'cDiv',v:function(r){return r[3];},opt:1},
    {t:'cNote',v:function(r){return r[4];},opt:2}
  ],ISLANDS,function(r){
    return '<tr><td>'+esc(r[0])+' <span class="mono" style="color:var(--ink3)">'
      +esc(r[1])+'</span></td><td class="n">'+Number(r[2]).toFixed(2)+'</td>'
      +'<td data-opt="1">'+esc(r[3])+'</td>'
      +'<td class="wrap" data-opt="2">'+esc(r[4])+'</td></tr>';
  }));
  repaintTables.push(sortable('tPl',[
    {t:'cPlace',v:function(p){return cur==='zh'?p[0]:cur==='ja'?p[2]:p[1];}},
    {t:'cLon',v:function(p){return p[3];},n:1,opt:1},
    {t:'cLat',v:function(p){return p[4];},n:1,opt:1},
    {t:'cTier',v:function(p){return p[5];},n:1}
  ],PLACE,function(p){
    return '<tr><td>'+esc(cur==='zh'?p[0]:cur==='ja'?p[2]:p[1])
      +' <span class="mono" style="color:var(--ink3)">'+esc(cur==='en'?p[0]:p[1])+'</span></td>'
      +'<td class="n" data-opt="1">'+p[3].toFixed(3)+'</td>'
      +'<td class="n" data-opt="1">'+p[4].toFixed(3)+'</td>'
      +'<td class="n">'+p[5]+'</td></tr>';
  }));
  repaintTables.push(sortable('tPp',[
    {t:'cClan',v:function(r){return cur==='en'?r[1]:r[0];}},
    {t:'cBase',v:function(r){return r[2];},opt:1},
    {t:'cSettled',v:function(r){return r[4];}},
    {t:'cNote',v:function(r){return r[5];},opt:2}
  ],CLANS,function(r){
    return '<tr><td>'+esc(r[0])+' <span class="mono" style="color:var(--ink3)">'
      +esc(r[1])+'</span></td>'
      +'<td class="wrap" data-opt="1">'+esc(cur==='en'?r[3]:r[2])+'</td>'
      +'<td>'+esc(r[4])+'</td>'
      +'<td class="wrap" data-opt="2">'+esc(r[5])+'</td></tr>';
  }));
  $('#pkc').textContent=PEAKLIST.length+' \u00B7 957 m';
  $('#rvc').textContent=WATERS.length;
  $('#prc').textContent=PARKS.length+' \u00B7 44,300 ha';
  $('#isc').textContent=ISLANDS.length+' \u00B7 263';
  $('#plc').textContent=PLACE.length;
  $('#ppc').textContent=CLANS.length;
}
function buildFacts(){
  var li=LI();
  var top=DIV.slice().sort(function(a,b){return b.pop-a.pop;});
  var big=DIV.slice().sort(function(a,b){return b.area-a.area;});
  var den=DIV.slice().sort(function(a,b){return b.den-a.den;});
  var age=DIV.slice().sort(function(a,b){return b.med-a.med;});
  var rows=[
   [T('xMostPop'),dN(top[0])+' <span class="mono">'+fmt(top[0].pop)+'</span>'],
   [T('xLeastPop'),dN(top[top.length-1])+' <span class="mono">'+fmt(top[top.length-1].pop)+'</span>'],
   [T('xLargest'),dN(big[0])+' <span class="mono">'+big[0].area.toFixed(1)+' km²</span>'],
   [T('xSmallest'),dN(big[big.length-1])+' <span class="mono">'+big[big.length-1].area.toFixed(1)+' km²</span>'],
   [T('xDensest'),dN(den[0])+' <span class="mono">'+fmt(den[0].den)+' /km²</span>'],
   [T('xSparsest'),dN(den[den.length-1])+' <span class="mono">'+fmt(den[den.length-1].den)+' /km²</span>'],
   [T('xOldest'),dN(age[0])+' <span class="mono">'+age[0].med.toFixed(1)+'</span>'],
   [T('xYoungest'),dN(age[age.length-1])+' <span class="mono">'+age[age.length-1].med.toFixed(1)+'</span>']
  ];
  EXTREMES.forEach(function(e){
    rows.push([li===0?e.kEn:e.kZh,(li===0?e.nEn:e.nZh)+' <span class="mono">'+esc(e.co)+'</span>']);
  });
  CLIMATE.forEach(function(c){rows.push([li===0?c[1]:c[0],c[2]]);});
  $('#facts').innerHTML=rows.map(function(r){
    return '<div class="fact"><div class="l">'+esc(r[0])+'</div><div class="v">'+r[1]+'</div></div>';
  }).join('');
  $('#srcBox').innerHTML=SOURCES.map(function(s){
    return '<p><b>'+esc(li===0?s[1]:s[0])+'</b> '+esc(s[2])+'</p>';}).join('');
}

/* ---------------------------------------------------- surveyed tier ------ */
/* The other sheets in this series carry two tiers of geometry and say which is
   live. Hong Kong has no equivalent of us-atlas or taiwan-atlas, so the tier is
   assembled from two public sources at run time:

     land polygons   geoBoundaries gbOpen HKG ADM1, CC BY 4.0, resolved through
                     the project's API so the path is never guessed
     gazetted limits the Home Affairs Department's district boundary file on
                     DATA.GOV.HK, which is the administrative limit and runs out
                     to sea, so it is drawn as a dashed overlay above the water

   Either may fail, and the badge in the method note says what happened. The
   built-in outline stands whenever the land polygons cannot be had. */
function setFid(state){
  FID=state;
  var n=$('#fidNote');
  if(n) n.textContent=T(state==='local'?'fidLocal':state==='loading'?'fidLoading'
    :state==='survey'?'fidSurvey':state==='gaz'?'fidGaz':'fidFail');
  paintStrip();
}
var GB_API='https://www.geoboundaries.org/api/current/gbOpen/HKG/ADM1/';
/* The Common Spatial Data Infrastructure Portal is the Government's spatial
   data platform, run by the Lands Department and built for web clients. The
   dataset is the Home Affairs Department's District Boundary, served through
   the portal's ArcGIS REST interface as GeoJSON in WGS84. It is tried first;
   the static DATA.GOV.HK copy of the same file is the fallback, though that
   one sends no Access-Control-Allow-Origin header. */
var CSDI_URL='https://portal.csdi.gov.hk/server/rest/services/common/'
  +'had_rcd_1634523272907_75218/FeatureServer/0/query'
  +'?f=geojson&where=1%3D1&outFields=*&returnGeometry=true&outSR=4326';
var GAZ_URL='https://www.had.gov.hk/psi/hong-kong-administrative-boundaries/hksar_18_district_boundary.json';
/* AbortController cannot be structured-cloned in proxied fetch environments, so
   the timeout is a plain timer and the request is left to expire on its own. */
function getJSON(url,ms){
  return new Promise(function(res,rej){
    var done=false, timer=setTimeout(function(){
      if(!done){done=true;rej(new Error('timeout'));}},ms||16000);
    function ok(j){if(!done){done=true;clearTimeout(timer);res(j);}}
    function bad(e){if(!done){done=true;clearTimeout(timer);rej(e);}}
    if(typeof fetch==='function'){
      fetch(url).then(function(r){
        if(!r.ok) throw new Error('http '+r.status); return r.json();
      }).then(ok,function(){xhr();});
    } else xhr();
    function xhr(){
      try{
        var x=new XMLHttpRequest(); x.open('GET',url,true);
        x.onload=function(){try{ok(JSON.parse(x.responseText));}catch(e){bad(e);}};
        x.onerror=function(){bad(new Error('xhr'));};
        x.send();
      }catch(e){bad(e);}
    }
  });
}
function geoRings(g){
  var out=[];
  function poly(p){p.forEach(function(r){out.push(r);});}
  if(!g) return out;
  if(g.type==='Polygon') poly(g.coordinates||[]);
  else if(g.type==='MultiPolygon')(g.coordinates||[]).forEach(poly);
  else if(g.type==='GeometryCollection')(g.geometries||[]).forEach(function(x){
    out.push.apply(out,geoRings(x));});
  return out;
}
function looksLonLat(rings){
  var n=0, ok=0;
  for(var i=0;i<rings.length&&n<600;i++){
    var r=rings[i], step=Math.max(1,Math.floor(r.length/8));
    for(var k=0;k<r.length&&n<600;k+=step){
      n++;
      if(r[k][0]>=113.5&&r[k][0]<=114.9&&r[k][1]>=21.9&&r[k][1]<=22.9) ok++;
    }
  }
  return n>0&&ok/n>0.9;
}
/* Names arrive spelled several ways, so they are folded to letters only. */
var NAMEKEY={};
DIV.forEach(function(d){
  function put(v){ if(v) NAMEKEY[String(v).toLowerCase().replace(/[^a-z]/g,'')]=d.id; }
  put(d.en); put(d.rom); put(d.en+' District'); put(d.seatEn);
});
['yautsimmong:YTM','shamshuipo:SSP','kowlooncity:KC','wongtaisin:WTS',
 'kwuntong:KT','kwaitsing:KWT','tsuenwan:TW','tuenmun:TM','yuenlong:YL',
 'north:N','taipo:TP','shatin:ST','saikung:SK','islands:IS','eastern:E',
 'southern:S','wanchai:WC','centralwestern:CW','centralandwestern:CW',
 'saitin:ST','shatinshatin:ST'].forEach(function(pair){
  var a=pair.split(':'); NAMEKEY[a[0]]=a[1];
});
function loadSurveyed(){
  setFid('loading');
  var landOK=false;
  return getJSON(GB_API,16000).then(function(meta){
    var m=(meta&&meta.length)?meta[0]:meta;
    var url=m&&(m.gjDownloadURL||m.simplifiedGeometryGeoJSON);
    if(!url) throw new Error('no download url');
    return getJSON(url,22000);
  }).then(function(gj){
    var feats=gj.features||[];
    var found={}, all=[];
    feats.forEach(function(f){
      var pr=f.properties||{};
      var nm=pr.shapeName||pr.NAME||pr.name||'';
      var id=NAMEKEY[String(nm).toLowerCase().replace(/[^a-z]/g,'')];
      var rs=geoRings(f.geometry);
      all.push.apply(all,rs);
      if(!id) return;
      (found[id]=found[id]||[]).push.apply(found[id],rs);
    });
    var hit=Object.keys(found).length;
    if(hit<18) throw new Error('only '+hit+' districts matched');
    if(!looksLonLat(all)) throw new Error('not lon/lat');
    GEOM=found; landOK=true;
    drawGeometry(); applyTheme(curTheme);
    if(sel&&paths[sel]) paths[sel].classList.add('sel');
  }).catch(function(){
    GEOM=LOCAL; drawGeometry(); applyTheme(curTheme);
    if(sel&&paths[sel]) paths[sel].classList.add('sel');
  }).then(function(){
    function paintGaz(j){
      var feats=j.features||(j.type==='Feature'?[j]:[]);
      var rings=[];
      feats.forEach(function(f){rings.push.apply(rings,geoRings(f.geometry||f));});
      if(!rings.length||!looksLonLat(rings)) throw new Error('bad');
      var d='';
      rings.forEach(function(r){
        if(r.length<3) return;
        d+=dOf(r.map(function(q){return PJ(q[0],q[1]);}),true);
      });
      drawGaz(d);
      setFid(landOK?'gaz':'fail');
    }
    return getJSON(CSDI_URL,20000).then(paintGaz,function(){
      return getJSON(GAZ_URL,16000).then(paintGaz);
    }).catch(function(){
      drawGaz('');
      setFid(landOK?'survey':'fail');
    });
  });
}
function revertLocal(){
  GEOM=LOCAL; drawGaz(''); setFid('local');
  drawGeometry(); applyTheme(curTheme);
  if(sel&&paths[sel]) paths[sel].classList.add('sel');
}

/* -------------------------------------------------------------- chrome --- */
function paintStrip(){
  var ed=cur==='en'?'August 2026':cur==='zh'?'2026年8月':'2026年8月';
  $('#strip').innerHTML=
   '<div><span class="tag">'+T('mEdition')+'</span><span class="v">'+ed+'</span></div>'
  +'<div><span class="tag">'+T('mProjection')+'</span><span class="v">Albers Equal Area Conic</span></div>'
  +'<div><span class="tag">'+T('mPopulation')+'</span><span class="v"><b>'+fmt(TOTP)+'</b></span></div>'
  +'<div><span class="tag">'+T('mArea')+'</span><span class="v">'+fmt(Math.round(TOTA))+' km\u00B2</span></div>'
  +'<div><span class="tag">'+T('mOnSheet')+'</span><span class="v">18 \u00B7 '
    +ISLPT.length+' \u00B7 '+PLACE.length+'</span></div>';
}
function paint(){
  document.documentElement.setAttribute('lang',T('htmlLang'));
  $$('[data-t]').forEach(function(n){n.textContent=T(n.getAttribute('data-t'));});
  qEl.setAttribute('placeholder',T('qph'));
  qEl.setAttribute('aria-label',T('qph'));
  lblDiv.forEach(function(t){t.textContent=dN(BY[t.dataset.c]);});
  lblCity.forEach(function(t){
    t.textContent=cur==='zh'?t.dataset.zh:cur==='ja'?t.dataset.ja:t.dataset.en;});
  lblPeak.forEach(function(t){
    t.textContent=(cur==='en'?t.dataset.en:t.dataset.zh)+' '+fmt(t.dataset.h);});
  lblWater.forEach(function(t){t.textContent=cur==='en'?t.dataset.en:t.dataset.zh;});
  lblIsl.forEach(function(t){
    t.textContent=cur==='zh'?t.dataset.zh:cur==='ja'?t.dataset.ja:t.dataset.en;});
  lblRange.forEach(function(o){
    o.tp.textContent=cur==='en'?o.t.dataset.en:o.t.dataset.zh;});
  paintStrip(); buildThemes(); applyTheme(curTheme); buildIndex();
  buildTables(); buildFacts(); paintNational();
  setFid(FID);
  if(sel) openDiv(sel); else showHint();
  drawScale(); lastKey=''; detail();
}
$('#setBtn').addEventListener('click',function(e){
  e.stopPropagation();
  var p=$('#setPop'), on=!p.classList.contains('open');
  p.classList.toggle('open',on); $('#setBtn').setAttribute('aria-expanded',String(on));
});
document.addEventListener('click',function(e){
  var p=$('#setPop');
  if(p.classList.contains('open')&&!p.contains(e.target)&&e.target!==$('#setBtn')){
    p.classList.remove('open'); $('#setBtn').setAttribute('aria-expanded','false');}
});
$$('#segLang button').forEach(function(b){
  b.addEventListener('click',function(){
    cur=b.dataset.lang;
    $$('#segLang button').forEach(function(x){
      x.setAttribute('aria-pressed',String(x===b));});
    paint();
  });
});
/* Ground.

   Dusk is the crossover: warm enough to read like paper, dim enough not to
   glare. That gives it a definite place in the automatic rule, which reads both
   the system's colour scheme and the hour:

       light system, daytime  -> paper
       light system, night    -> dusk
       dark  system, daytime  -> dusk
       dark  system, night    -> night

   Choosing a ground by hand pins it and stops the automatic rule. */
var groundMode='auto';
function prefersDark(){
  try{ return window.matchMedia('(prefers-color-scheme: dark)').matches; }
  catch(e){ return false; }
}
function isNightHour(){ var h=new Date().getHours(); return h<6||h>=19; }
var GROUNDS=['paper','dusk','night'];
function resolveGround(){
  if(groundMode!=='auto') return groundMode;
  return GROUNDS[Math.min(2,(prefersDark()?1:0)+(isNightHour()?1:0))];
}
function applyGround(){
  var g=resolveGround();
  if(document.documentElement.getAttribute('data-ground')!==g){
    document.documentElement.setAttribute('data-ground',g);
    applyTheme(curTheme);
  }
  var why;
  if(groundMode==='auto'){
    why=T(prefersDark()?'gWhyDark':'gWhyLight')+' '
      +T(isNightHour()?'gWhyNight':'gWhyDay')+' \u2192 '+T('g_'+g);
  } else why=T('gWhyPinned')+' '+T('g_'+g);
  var w=$('#groundWhy'); if(w) w.innerHTML=why;
  $$('#segGround button').forEach(function(x){
    x.setAttribute('aria-pressed',String(x.dataset.ground===groundMode));});
}
$$('#segGround button').forEach(function(b){
  b.addEventListener('click',function(){
    groundMode=b.dataset.ground;
    applyGround();
  });
});
(function watchGround(){
  try{
    var mq=window.matchMedia('(prefers-color-scheme: dark)');
    if(mq.addEventListener) mq.addEventListener('change',applyGround);
    else if(mq.addListener) mq.addListener(applyGround);
  }catch(e){}
  setInterval(function(){ if(groundMode==='auto') applyGround(); },5*60*1000);
  document.addEventListener('visibilitychange',function(){
    if(groundMode==='auto') applyGround();});
})();
$('#swDense').addEventListener('click',function(){
  var on=this.getAttribute('aria-pressed')!=='true';
  this.setAttribute('aria-pressed',String(on));
  document.documentElement.setAttribute('data-density',on?'tight':'normal');
  setTimeout(function(){syncU();drawScale();detail();},60);
});
$('#swSurvey').addEventListener('click',function(){
  var on=this.getAttribute('aria-pressed')!=='true';
  this.setAttribute('aria-pressed',String(on));
  if(on) loadSurveyed();
  else revertLocal();
});
$('#swArea').addEventListener('click',function(){
  var on=this.getAttribute('aria-pressed')!=='true';
  this.setAttribute('aria-pressed',String(on));
  L.areas.setAttribute('data-off',on?'0':'1');
  var b=$('#layers button[data-layer="areas"]');
  if(b) b.setAttribute('aria-pressed',String(on));
});
window.addEventListener('resize',function(){syncU();drawScale();
  requestAnimationFrame(function(){declutter();});});

/* ---------------------------------------------------------------- boot --- */
drawGeometry(); drawAreas(); drawStatic();
paint(); applyGround(); applyVB(); drawScale();
/* The gazetted overlay is not fetched on load. The Home Affairs Department's
   endpoint sends no Access-Control-Allow-Origin header, so a browser will
   refuse the response and the only result would be an error in the console.
   The switch is left for readers whose environment can reach it. */


  }, []);

  return (
    <>
<div className="app">

<header className="hd">
  <h1 data-t="title"></h1>
  <div className="hd-r" style={{ position: "relative" }}>
    <button className="iconbtn" id="setBtn" aria-haspopup="true" aria-expanded="false">
      <span className="sr" data-t="settings"></span>
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.11A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.11A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9.1A1.7 1.7 0 0 0 10.13 3V3a2 2 0 1 1 4 0v.11a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.11a1.7 1.7 0 0 0-1.49 1.03z"/></svg>
    </button>
    <div className="pop" id="setPop" role="dialog">
      <div className="grp"><span className="tag" data-t="sLang"></span>
        <div className="seg" id="segLang">
          <button data-lang="en" aria-pressed="true">English</button>
          <button data-lang="zh" aria-pressed="false">中文</button>
          <button data-lang="ja" aria-pressed="false">日本語</button>
        </div>
      </div>
      <div className="grp"><span className="tag" data-t="sGround"></span>
        <div className="seg" id="segGround">
          <button data-ground="auto" aria-pressed="true" data-t="gAuto"></button>
          <button data-ground="paper" aria-pressed="false" data-t="gPaper"></button>
          <button data-ground="dusk" aria-pressed="false" data-t="gDusk"></button>
          <button data-ground="night" aria-pressed="false" data-t="gNight"></button>
        </div>
        <p className="groundwhy" id="groundWhy"></p>
      </div>
      <div className="grp">
        <button className="rowsw" id="swDense" aria-pressed="false">
          <span data-t="sDense"></span><span className="knob"></span></button>
        <button className="rowsw" id="swSurvey" aria-pressed="false">
          <span data-t="sSurvey"></span><span className="knob"></span></button>
        <button className="rowsw" id="swArea" aria-pressed="false">
          <span data-t="sArea"></span><span className="knob"></span></button>
      </div>
    </div>
  </div>
</header>

<div className="strip" id="strip"></div>

<div className="main">
  <div>
    <div className="stage" id="stage">
      <svg id="map" viewBox="0 0 1000 720" preserveAspectRatio="xMidYMid meet"
           role="application" aria-label="Map of the Hong Kong Special Administrative Region" tabIndex="0"></svg>

      <div className="ov ov-tl">
        <div style={{ position: "relative" }}>
          <div className="glass search">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/></svg>
            <input id="q" type="search" autoComplete="off" spellCheck="false" />
            <button id="qx" hidden aria-label="Clear">&times;</button>
          </div>
          <div className="res" id="res" role="listbox"></div>
        </div>
      </div>

      <div className="ov ov-tr">
        <div className="glass zoomstack">
          <button id="zin"><span className="sr">Zoom in</span>
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
          <button id="zout"><span className="sr">Zoom out</span>
            <svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button>
          <button id="zfit"><span className="sr">Reset view</span>
            <svg viewBox="0 0 24 24"><path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5"/></svg></button>
          <div className="zlevel" id="zlevel">1.0&times;</div>
        </div>
      </div>

      <div className="ov ov-bl">
        <button className="glass chipbtn" id="lbtn" aria-expanded="false">
          <svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5M3 13l9 5 9-5M3 17l9 5 9-5"/></svg>
          <span data-t="layers"></span></button>
        <div className="glass scalebox">
          <svg width="112" height="18" id="sbar"></svg>
          <svg width="16" height="20" viewBox="0 0 16 20" aria-hidden="true" style={{ flex: "0 0 auto" }}>
            <line x1="8" y1="19" x2="8" y2="5" stroke="currentColor" strokeWidth=".9"/>
            <path d="M8 1.5 L10.4 7 L5.6 7 Z" fill="currentColor"/></svg>
        </div>
      </div>

      <div className="lpanel" id="lpanel">
        <div className="grp"><span className="tag" data-t="layers"></span><div id="layers"></div></div>
        <div className="grp"><span className="tag" data-t="theme"></span>
          <select className="sel" id="theme"></select>
          <div id="key"></div>
        </div>
      </div>

      <div className="tip" id="tip" aria-hidden="true"></div>
    </div>
    <p style={{ marginTop: ".5rem", color: "var(--ink3)", fontSize: ".8em", lineHeight: "1.5" }} data-t="mapHint"></p>
  </div>

</div>

<section className="rec" id="reader" aria-live="polite"></section>

<details className="ref natsec" id="nat">
  <summary><span className="tag" data-t="t0"></span><h2 id="natName"></h2></summary>
  <div className="refbody">
    <dl className="natfacts" id="natfacts"></dl>
    {/* The territory's own axis, then the milestones and the detailed
         regime list beneath it, in the arrangement the other sheets use. */}
    <div className="nathist">
      <span className="tag" data-t="nfSucc"></span>
      <p className="prose" data-t="nfSuccP"></p>
      <div className="eras">
        <div className="erapre"><span id="islPreLbl"></span><i></i></div>
        <div className="eraband" id="islband" role="group"></div>
        <div className="erascale" id="islscale"></div>
        <div className="erachips" id="islchips" role="group"></div>
        <div className="eranote" id="islnote"></div>
        <p className="eracaveat" id="islcaveat"></p>
      </div>
      <div className="histsplit">
        <span className="tag" data-t="nfHistory"></span>
        <p className="prose" data-t="nfHistoryP"></p>
        <ol className="tline" id="tline"></ol>
      </div>
      <div className="histsplit">
        <span className="tag" data-t="nfSuccList"></span>
        <ul className="succ" id="succ"></ul>
      </div>
    </div>
    <div className="natfoot">
      <span className="tag" data-t="nfOfficial"></span>
      <ul className="links">
        <li><a href="https://www.gov.hk/" target="_blank" rel="noopener">gov.hk</a>
          <span data-t="lkGov"></span></li>
        <li><a href="https://www.censtatd.gov.hk/" target="_blank" rel="noopener">censtatd.gov.hk</a>
          <span data-t="lkCsd"></span></li>
        <li><a href="https://www.afcd.gov.hk/" target="_blank" rel="noopener">afcd.gov.hk</a>
          <span data-t="lkAfcd"></span></li>
      </ul>
    </div>
  </div>
</details>

<details className="ref"><summary><span className="tag" data-t="t1"></span><h2 data-t="t1h"></h2>
    <span className="c" data-t="sortHint"></span></summary>
  <div className="refbody"><div className="tw-wrap"><table id="tDv"><thead><tr></tr></thead><tbody></tbody></table></div></div>
</details>

<details className="ref"><summary><span className="tag" data-t="t2"></span><h2 data-t="t2h"></h2>
    <span className="c" id="pkc"></span></summary>
  <div className="refbody"><div className="tw-wrap"><table id="tPk"><thead><tr></tr></thead><tbody></tbody></table></div></div>
</details>

<details className="ref"><summary><span className="tag" data-t="t6"></span><h2 data-t="t6h"></h2>
    <span className="c" id="rvc"></span></summary>
  <div className="refbody"><div className="tw-wrap"><table id="tRv"><thead><tr></tr></thead><tbody></tbody></table></div></div>
</details>

<details className="ref"><summary><span className="tag" data-t="t7"></span><h2 data-t="t7h"></h2>
    <span className="c" id="prc"></span></summary>
  <div className="refbody"><div className="tw-wrap"><table id="tPr"><thead><tr></tr></thead><tbody></tbody></table></div></div>
</details>

<details className="ref"><summary><span className="tag" data-t="t5"></span><h2 data-t="t5h"></h2>
    <span className="c" id="isc"></span></summary>
  <div className="refbody"><div className="tw-wrap"><table id="tIs"><thead><tr></tr></thead><tbody></tbody></table></div></div>
</details>

<details className="ref"><summary><span className="tag" data-t="t8"></span><h2 data-t="t8h"></h2>
    <span className="c" id="plc"></span></summary>
  <div className="refbody"><div className="tw-wrap"><table id="tPl"><thead><tr></tr></thead><tbody></tbody></table></div></div>
</details>

<details className="ref"><summary><span className="tag" data-t="t9"></span><h2 data-t="t9h"></h2>
    <span className="c" id="ppc"></span></summary>
  <div className="refbody"><div className="tw-wrap"><table id="tPp"><thead><tr></tr></thead><tbody></tbody></table></div></div>
</details>

<details className="ref"><summary><span className="tag" data-t="t3"></span><h2 data-t="t3h"></h2></summary>
  <div className="refbody"><div className="facts" id="facts"></div></div>
</details>

<details className="ref notes"><summary><span className="tag" data-t="t4"></span><h2 data-t="t4h"></h2></summary>
  <div className="refbody">
  <h3 data-t="n1h"></h3><p className="warn" data-t="n1"></p>
  <p style={{ fontFamily: "var(--mono)", fontSize: ".74rem", color: "var(--ink3)", marginTop: ".4rem" }}>
    <span data-t="fidNow"></span> <span id="fidNote"></span></p>
  <h3 data-t="n2h"></h3><p data-t="n2"></p>
  <h3 data-t="n3h"></h3><p data-t="n3"></p>
  <h3 data-t="n5h"></h3><p data-t="n5"></p>
  <h3 data-t="srcH"></h3>
  <div className="src" id="srcBox"></div>
  </div>
</details>
</div>
    </>
  );
}
