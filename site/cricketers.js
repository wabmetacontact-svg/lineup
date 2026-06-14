/* ===========================================================================
   LineUp — cartoon cricketer avatar generator
   Flat caricatures with PER-PLAYER variety (skin, hair, beard, headgear).
   window.LU_CRICKETER(initials, c1, c2, id) -> "data:image/svg+xml,..."
   Features are looked up by `initials` so every player looks distinct.
   =========================================================================== */
(function () {
  var SKIN = {
    l:  { s: '#F2CCA6', d: '#D9A878' },
    lm: { s: '#E4B083', d: '#C68B57' },
    m:  { s: '#C98A58', d: '#A66A3C' },
    md: { s: '#A4663C', d: '#7F4C28' },
    d:  { s: '#84572C', d: '#633E1B' }
  };

  /* per-player traits. hair = hair colour; beard = none|stubble|goatee|moustache|full;
     gear = cap|helmet|bare|bandana; hairstyle tweaks the visible hair shape. */
  var F = {
    VK:  { skin:'m',  hair:'#15100a', beard:'full',      gear:'cap'    },
    JB:  { skin:'md', hair:'#0e0a06', beard:'stubble',   gear:'cap'    },
    SKY: { skin:'m',  hair:'#161009', beard:'stubble',   gear:'bare', hairstyle:'spike' },
    GM:  { skin:'l',  hair:'#8a5a26', beard:'none',      gear:'cap'    },
    RK:  { skin:'lm', hair:'#d8b14e', beard:'goatee',    gear:'bare', hairstyle:'mop' },
    BA:  { skin:'m',  hair:'#1a1209', beard:'full',      gear:'cap'    },
    PC:  { skin:'l',  hair:'#6a4622', beard:'stubble',   gear:'cap'    },
    TH:  { skin:'l',  hair:'#c79a4c', beard:'full',      gear:'cap'    },
    RS:  { skin:'m',  hair:'#120c07', beard:'stubble',   gear:'cap'    },
    JR:  { skin:'l',  hair:'#7a5326', beard:'none',      gear:'helmet' },
    SA:  { skin:'lm', hair:'#0f0a06', beard:'none',      gear:'bare', hairstyle:'side' },
    BS:  { skin:'l',  hair:'#3a2a18', beard:'full',      gear:'bandana'},
    DEF: { skin:'m',  hair:'#15100a', beard:'stubble',   gear:'cap'    }
  };

  function esc(svg){ return 'data:image/svg+xml,' + encodeURIComponent(svg); }

  function cricketer(initials, c1, c2, id) {
    var f = F[initials] || F.DEF;
    var sk = SKIN[f.skin] || SKIN.m;
    var s = sk.s, sd = sk.d, hair = f.hair, gear = f.gear, beard = f.beard;
    var p = [];
    p.push("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 112 112' width='112' height='112'>");
    p.push("<defs>");
    p.push("<linearGradient id='b"+id+"' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#2a2156'/><stop offset='1' stop-color='#14102c'/></linearGradient>");
    p.push("<linearGradient id='k"+id+"' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='"+c1+"'/><stop offset='1' stop-color='"+c2+"'/></linearGradient>");
    p.push("</defs>");
    // bg + jersey shoulders
    p.push("<rect width='112' height='112' rx='30' fill='url(#b"+id+")'/>");
    p.push("<path d='M9 112 C9 86 31 78 56 78 C81 78 103 86 103 112 Z' fill='url(#k"+id+")'/>");
    p.push("<path d='M45 79 L56 90 L67 79' fill='none' stroke='#fff' stroke-width='3' stroke-linejoin='round' opacity='.85'/>");
    // neck
    p.push("<path d='M49 68 h14 v10 q-7 5 -14 0 Z' fill='"+sd+"'/>");

    // ---- hair BEHIND head (sides / nape / back) ----
    if (gear === 'bare') {
      if (f.hairstyle === 'spike') {
        p.push("<path d='M34 40 Q34 24 56 24 Q78 24 78 40 L78 44 Q72 33 68 42 Q64 31 59 41 Q56 30 53 41 Q48 31 44 42 Q40 33 34 44 Z' fill='"+hair+"'/>");
      } else if (f.hairstyle === 'mop') {
        p.push("<path d='M31 46 Q29 22 56 22 Q83 22 81 46 Q78 36 70 40 Q72 31 60 33 Q58 27 50 31 Q44 30 42 38 Q36 35 31 46 Z' fill='"+hair+"'/>");
      } else { // side parting
        p.push("<path d='M33 44 Q33 24 56 24 Q79 24 79 44 Q74 33 56 33 Q44 33 40 30 Q35 35 33 44 Z' fill='"+hair+"'/>");
      }
      p.push("<rect x='33' y='40' width='6' height='20' rx='3' fill='"+hair+"'/>");
      p.push("<rect x='73' y='40' width='6' height='20' rx='3' fill='"+hair+"'/>");
    } else {
      // tufts at the sides under a cap/helmet/band
      p.push("<rect x='33' y='42' width='6' height='17' rx='3' fill='"+hair+"'/>");
      p.push("<rect x='73' y='42' width='6' height='17' rx='3' fill='"+hair+"'/>");
    }

    // ears
    p.push("<circle cx='35' cy='56' r='5.5' fill='"+s+"'/><circle cx='77' cy='56' r='5.5' fill='"+s+"'/>");
    p.push("<circle cx='35' cy='56' r='2.2' fill='"+sd+"'/><circle cx='77' cy='56' r='2.2' fill='"+sd+"'/>");
    // head
    p.push("<rect x='36' y='32' width='40' height='44' rx='20' fill='"+s+"'/>");
    // cheeks
    p.push("<circle cx='44' cy='61' r='4.4' fill='"+sd+"' opacity='.28'/><circle cx='68' cy='61' r='4.4' fill='"+sd+"' opacity='.28'/>");

    // ---- beard ----
    if (beard === 'full') {
      p.push("<path d='M37 56 Q37 79 56 80 Q75 79 75 56 Q73 70 56 70 Q39 70 37 56 Z' fill='"+hair+"'/>");
      p.push("<path d='M48 64 Q56 61 64 64' stroke='"+hair+"' stroke-width='3' fill='none' stroke-linecap='round'/>");
    } else if (beard === 'stubble') {
      p.push("<path d='M38 57 Q38 78 56 79 Q74 78 74 57 Q72 69 56 69 Q40 69 38 57 Z' fill='"+hair+"' opacity='.34'/>");
    } else if (beard === 'goatee') {
      p.push("<path d='M49 67 Q56 76 63 67 Q60 73 56 73 Q52 73 49 67 Z' fill='"+hair+"'/>");
      p.push("<path d='M48 63 Q56 60 64 63' stroke='"+hair+"' stroke-width='3' fill='none' stroke-linecap='round'/>");
    } else if (beard === 'moustache') {
      p.push("<path d='M48 63 Q56 60 64 63' stroke='"+hair+"' stroke-width='3.4' fill='none' stroke-linecap='round'/>");
    }

    // eyebrows
    p.push("<path d='M43 51 q5.5 -3 11 -0.5' stroke='"+hair+"' stroke-width='2.4' fill='none' stroke-linecap='round'/>");
    p.push("<path d='M58 50.5 q5.5 -2.5 11 0.5' stroke='"+hair+"' stroke-width='2.4' fill='none' stroke-linecap='round'/>");
    // eyes
    p.push("<circle cx='48' cy='56' r='3' fill='#241c30'/><circle cx='64' cy='56' r='3' fill='#241c30'/>");
    p.push("<circle cx='49.1' cy='55' r='1' fill='#fff'/><circle cx='65.1' cy='55' r='1' fill='#fff'/>");
    // nose
    p.push("<path d='M56 58 l-2.4 6 q2.4 1.5 4.8 0' stroke='"+sd+"' stroke-width='1.7' fill='none' stroke-linecap='round' stroke-linejoin='round'/>");
    // smile (skip if full beard covers it)
    if (beard !== 'full') {
      p.push("<path d='M48 67 q8 6 16 0' stroke='"+sd+"' stroke-width='2.2' fill='none' stroke-linecap='round'/>");
    }

    // ---- headgear ON TOP ----
    if (gear === 'cap') {
      p.push("<path d='M30 46 Q56 40 82 46 Q80 52 56 51 Q32 52 30 46 Z' fill='"+c2+"'/>");
      p.push("<path d='M34 47 Q34 28 56 28 Q78 28 78 47 Q56 40 34 47 Z' fill='url(#k"+id+")'/>");
      p.push("<circle cx='56' cy='29' r='2.3' fill='"+c2+"'/>");
    } else if (gear === 'helmet') {
      p.push("<path d='M32 47 Q32 26 56 26 Q80 26 80 47 Q56 39 32 47 Z' fill='url(#k"+id+")'/>");
      p.push("<path d='M30 47 Q56 41 82 47 L82 50 Q56 44 30 50 Z' fill='"+c2+"'/>");
      // grille
      p.push("<rect x='37' y='52' width='38' height='3' rx='1.5' fill='#cdd2e8'/>");
      p.push("<rect x='40' y='59' width='32' height='3' rx='1.5' fill='#cdd2e8'/>");
      p.push("<rect x='44' y='50' width='3' height='16' rx='1.5' fill='#cdd2e8'/>");
      p.push("<rect x='65' y='50' width='3' height='16' rx='1.5' fill='#cdd2e8'/>");
    } else if (gear === 'bandana') {
      p.push("<path d='M33 44 Q56 33 79 44 L79 50 Q56 41 33 50 Z' fill='url(#k"+id+")'/>");
      p.push("<path d='M77 46 l9 -4 -3 8 Z' fill='"+c2+"'/>");
    }

    p.push("</svg>");
    return esc(p.join(''));
  }

  window.LU_CRICKETER = cricketer;
})();
