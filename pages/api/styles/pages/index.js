import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const ANLASS = [
  {id:'gutenacht',   icon:'🌙', title:'Gute Nacht',       sub:'Klassisch zum Einschlafen'},
  {id:'krank',       icon:'🤒', title:'Krank im Bett',    sub:'Trost & Ablenkung'},
  {id:'geburtstag',  icon:'🎂', title:'Geburtstag',       sub:'Ein besonderer Tag'},
  {id:'schultag',    icon:'🎒', title:'Erster Schultag',  sub:'Mut & Aufregung'},
  {id:'zahnarzt',    icon:'🦷', title:'Zahnarzt',         sub:'Angst nehmen & Humor'},
  {id:'geschwister', icon:'👶', title:'Geschwisterchen',  sub:'Teilen & Liebe'},
  {id:'umzug',       icon:'📦', title:'Umzug',            sub:'Neues entdecken'},
  {id:'frei',        icon:'✨', title:'Freier Anlass',    sub:'Eigene Idee'},
];
const GENRES = [
  {id:'maerchen',  icon:'🏰', title:'Märchen',   sub:'Magisch & zeitlos'},
  {id:'abenteuer', icon:'🗺️', title:'Abenteuer', sub:'Mutige Helden'},
  {id:'tiere',     icon:'🦊', title:'Tiere',     sub:'Sprechende Freunde'},
  {id:'detektiv',  icon:'🔍', title:'Detektiv',  sub:'Rätsel lösen'},
  {id:'weltraum',  icon:'🚀', title:'Weltraum',  sub:'Sterne & Planeten'},
  {id:'piraten',   icon:'🏴‍☠️', title:'Piraten',  sub:'Meere & Schätze'},
  {id:'magie',     icon:'🔮', title:'Magie',     sub:'Zauber & Wunder'},
  {id:'natur',     icon:'🌿', title:'Natur',     sub:'Wälder & Flüsse'},
];
const SAISON = [
  {id:'keiner',      icon:'—',  title:'Keiner'},
  {id:'fruehling',   icon:'🌸', title:'Frühling'},
  {id:'sommer',      icon:'☀️', title:'Sommer'},
  {id:'herbst',      icon:'🍂', title:'Herbst'},
  {id:'winter',      icon:'❄️', title:'Winter'},
  {id:'ostern',      icon:'🐣', title:'Ostern'},
  {id:'halloween',   icon:'🎃', title:'Halloween'},
  {id:'weihnachten', icon:'🎄', title:'Weihnachten'},
  {id:'valentinstag',icon:'💝', title:'Valentinstag'},
];
const THEMEN = ['Mut','Freundschaft','Ehrlichkeit','Teilen','Anderssein ist ok','Fehler machen darf man','Neue Situationen meistern','Zusammenhalten','Kein Thema'];
const ORT_SUGG = ['Verzauberter Wald','Tiefsee','Weltraum','Altes Schloss','Bauernhof','Berge','Wüste','Insel'];
const CHAR_SUGG = ['Ein mutiger Löwe','Eine weise Eule','Ein neugieriger Fuchs','Eine freche Hexe','Ein schüchterner Drache','Ein kluges Mädchen'];
const LAENGEN = [
  {id:'kurz',   title:'Kurz',  sub:'~5 Minuten',  wort:'ca. 300 Wörter'},
  {id:'mittel', title:'Mittel',sub:'~10 Minuten', wort:'ca. 500 Wörter'},
  {id:'lang',   title:'Lang',  sub:'~15 Minuten', wort:'ca. 800 Wörter'},
];
const LAENGE_MAP = {kurz:'ca. 300 Wörter (5 Minuten)', mittel:'ca. 500 Wörter (10 Minuten)', lang:'ca. 800 Wörter (15 Minuten)'};
const TON_MAP = {
  kind: 'kindgerecht, warm und einfach. Eine kleine Lektion wird spürbar erlebt, nie gepredigt. Beruhigend, zum Einschlafen geeignet.',
};
const STEPS = 7;

const emptyState = () => ({
  step:1, anlass:null, genre:null, saison:null, ort:'', charaktere:'',
  thema:null, laenge:'mittel', serieAktiv:false, serieName:'', serieId:null,
});

export default function Home() {
  const [s, setS] = useState(emptyState());
  const [savedSeries, setSavedSeries] = useState([]);
  const [view, setView] = useState('form'); // form | loading | story
  const [story, setStory] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('tg_series') || '[]');
      setSavedSeries(data);
    } catch {}
  }, []);

  const saveSeriesToStorage = (data) => {
    setSavedSeries(data);
    localStorage.setItem('tg_series', JSON.stringify(data));
  };

  const pick = (field, val) => setS(prev => ({...prev, [field]: val}));

  const goBack = () => setS(prev => ({...prev, step: prev.step - 1}));

  const goNext = () => {
    const required = {1: s.anlass, 2: s.genre, 3: s.saison, 6: s.thema};
    const msgs = {1:'Bitte wähle einen Anlass.', 2:'Bitte wähle ein Genre.', 3:'Bitte wähle einen saisonalen Einfluss.', 6:'Bitte wähle ein Thema.'};
    if (required[s.step] === null || required[s.step] === undefined) {
      setError(msgs[s.step]); return;
    }
    setError('');
    if (s.step < STEPS) setS(prev => ({...prev, step: prev.step + 1}));
    else generate();
  };

  const loadSeries = (id) => {
    const found = savedSeries.find(x => x.id === id);
    if (!found) return;
    setS(prev => ({...prev, serieId: id, serieName: found.name, serieAktiv: true,
      charaktere: found.charaktere || '', genre: found.genre || null, anlass: 'gutenacht', step: 3}));
  };

  const generate = async () => {
    setView('loading');
    setError('');
    const anlassObj = ANLASS.find(a => a.id === s.anlass) || {};
    const genreObj  = GENRES.find(g => g.id === s.genre)  || {};
    const saisonObj = SAISON.find(x => x.id === s.saison) || {};
    const serie = savedSeries.find(x => x.id === s.serieId);
    const serieCtx = serie?.summary
      ? `\n\nDies ist Kapitel ${serie.kapitel + 1} einer laufenden Serie.\nBisherige Handlung: ${serie.summary}\nDieselben Charaktere erleben ein neues eigenständiges Abenteuer.`
      : '';

    const prompt = `Du bist ein meisterhafter Kinderbuch-Autor. Schreibe eine originelle Geschichte auf Deutsch.\n\nVORGABEN:\n- Anlass: ${anlassObj.title}\n- Genre: ${genreObj.title}\n${s.saison && s.saison !== 'keiner' ? `- Saison: ${saisonObj.title}\n` : ''}${s.ort ? `- Schauplatz: ${s.ort}\n` : ''}${s.charaktere ? `- Charaktere: ${s.charaktere}\n` : ''}- Thema: ${s.thema || 'frei'}\n- Länge: ${LAENGE_MAP[s.laenge]}${serieCtx}\n\nSTORYTELLING-REGELN:\n1. Klassischer Handlungsbogen: Exposition → Konflikt → Wendepunkt → Auflösung → ruhiger Schluss\n2. Thema wird spürbar erlebt, nie gepredigt\n3. Warmer ruhiger Abschluss\n4. KEINE Kopie von Grimm, Harry Potter, Narnia oder bekannten Werken\n5. Originelle Charakternamen und Orte erfinden\n${s.serieAktiv ? '6. Leichter Cliffhanger am Ende als Andeutung für das nächste Kapitel\n' : ''}\nAntworte NUR mit JSON (kein Markdown):\n{"title":"Titel","story":"Text, Absätze durch \\n\\n getrennt","summary":"2-Satz-Zusammenfassung"}`;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (s.serieAktiv && s.serieName) {
        const newSeries = [...savedSeries];
        const idx = newSeries.findIndex(x => x.id === s.serieId);
        if (idx >= 0) {
          newSeries[idx] = {...newSeries[idx], kapitel: newSeries[idx].kapitel + 1, summary: data.summary || ''};
          setS(prev => ({...prev, serieId: newSeries[idx].id}));
        } else {
          const newId = 'serie_' + Date.now();
          newSeries.push({id: newId, name: s.serieName, kapitel: 1, genre: s.genre, charaktere: s.charaktere, summary: data.summary || ''});
          setS(prev => ({...prev, serieId: newId}));
        }
        saveSeriesToStorage(newSeries);
      }

      setStory(data);
      setView('story');
      topRef.current?.scrollIntoView({behavior: 'smooth'});
    } catch (e) {
      setError(e.message || 'Fehler beim Generieren. Bitte versuche es noch einmal.');
      setView('form');
    }
  };

  const reset = () => { setS(emptyState()); setStory(null); setView('form'); setError(''); };
  const nextChapter = () => { setS(prev => ({...prev, step: 1})); setStory(null); setView('form'); };

  const copyStory = () => {
    if (!story) return;
    navigator.clipboard?.writeText(`${story.title}\n\n${story.story}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const serie = savedSeries.find(x => x.id === s.serieId);
  const anlassObj = ANLASS.find(a => a.id === s.anlass) || {};
  const genreObj  = GENRES.find(g => g.id === s.genre)  || {};
  const saisonObj = SAISON.find(x => x.id === s.saison) || {};

  return (
    <>
      <Head>
        <title>Traumgeschichten</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <div ref={topRef} style={styles.page}>
        <div style={styles.container}>

          {/* Header */}
          <div style={styles.header}>
            <div style={styles.logo}>🌙</div>
            <h1 style={styles.title}>Traumgeschichten</h1>
            <p style={styles.subtitle}>Für Eltern, die Magisches erschaffen</p>
          </div>

          {/* LOADING */}
          {view === 'loading' && (
            <div style={styles.loadingWrap}>
              <div style={styles.loadingMoon}>🌙</div>
              <div style={styles.spinner} />
              <p style={styles.loadingTitle}>Die Geschichte entsteht…</p>
              <p style={styles.loadingSubtitle}>Die Träume weben sich zusammen</p>
            </div>
          )}

          {/* STORY */}
          {view === 'story' && story && (
            <div>
              {s.serieAktiv && s.serieName && (
                <div style={styles.chapterBadge}>
                  📚 {s.serieName} · Kapitel {serie?.kapitel || 1}
                </div>
              )}
              <h2 style={styles.storyTitle}>{story.title}</h2>
              <div style={styles.tagRow}>
                {[anlassObj.title, genreObj.title,
                  s.saison && s.saison !== 'keiner' ? saisonObj.title : null,
                  s.thema && s.thema !== 'Kein Thema' ? s.thema : null
                ].filter(Boolean).map((t,i) => <span key={i} style={styles.tag}>{t}</span>)}
              </div>
              <div style={styles.divider} />
              <div style={styles.storyText}>
                {story.story.split('\n\n').map((p,i) => p.trim() ? <p key={i} style={{marginBottom:22}}>{p}</p> : null)}
              </div>
              <div style={styles.divider} />
              <div style={styles.actionRow}>
                <button style={styles.btnOutline} onClick={reset}>Neue Geschichte</button>
                <button style={styles.btnSolid} onClick={copyStory}>{copied ? 'Kopiert ✓' : 'Kopieren'}</button>
              </div>
              {s.serieAktiv && s.serieName && (
                <button style={{...styles.btnNext, ...styles.btnGreen, marginTop:10, width:'100%'}} onClick={nextChapter}>
                  📚 Nächstes Kapitel erschaffen
                </button>
              )}
            </div>
          )}

          {/* FORM */}
          {view === 'form' && (
            <div>
              {/* Progress */}
              <div style={styles.progressBar}>
                {Array.from({length: STEPS}, (_,i) => (
                  <div key={i} style={{
                    ...styles.progressStep,
                    background: i+1 < s.step ? '#1D9E75' : i+1 === s.step ? '#7ECDB4' : '#E8E4DE'
                  }} />
                ))}
              </div>

              {error && <div style={styles.errorBox}>{error}</div>}

              {/* STEP 1 – Anlass */}
              {s.step === 1 && (
                <div>
                  <span style={styles.stepLabel}>Schritt 1 von {STEPS} — Anlass</span>
                  <h2 style={styles.stepTitle}>Warum erzählen wir heute eine Geschichte?</h2>
                  {savedSeries.length > 0 && (
                    <div style={{marginBottom:20}}>
                      <span style={styles.sectionLabel}>Gespeicherte Serien fortsetzen</span>
                      {savedSeries.map(ser => (
                        <div key={ser.id} style={styles.seriesItem} onClick={() => loadSeries(ser.id)}>
                          <div>
                            <div style={styles.seriesItemName}>{ser.name}</div>
                            <div style={styles.seriesItemCount}>{ser.kapitel} Kapitel gespeichert</div>
                          </div>
                          <span style={{color:'#aaa',fontSize:20}}>›</span>
                        </div>
                      ))}
                      <div style={styles.divider} />
                    </div>
                  )}
                  <div style={styles.cardGrid2}>
                    {ANLASS.map(a => (
                      <button key={a.id} style={{...styles.selCard, ...(s.anlass===a.id ? styles.selCardActive : {})}} onClick={() => pick('anlass', a.id)}>
                        <div style={styles.cardIcon}>{a.icon}</div>
                        <div style={{...styles.cardTitle, ...(s.anlass===a.id ? {color:'#0F6E56'} : {})}}>{a.title}</div>
                        <div style={styles.cardSub}>{a.sub}</div>
                      </button>
                    ))}
                  </div>
                  <div style={styles.btnRow}>
                    <button style={styles.btnNext} onClick={goNext}>Weiter →</button>
                  </div>
                </div>
              )}

              {/* STEP 2 – Genre */}
              {s.step === 2 && (
                <div>
                  <span style={styles.stepLabel}>Schritt 2 von {STEPS} — Genre</span>
                  <h2 style={styles.stepTitle}>Welche Art Geschichte soll es sein?</h2>
                  <div style={styles.cardGrid2}>
                    {GENRES.map(g => (
                      <button key={g.id} style={{...styles.selCard, ...(s.genre===g.id ? styles.selCardActive : {})}} onClick={() => pick('genre', g.id)}>
                        <div style={styles.cardIcon}>{g.icon}</div>
                        <div style={{...styles.cardTitle, ...(s.genre===g.id ? {color:'#0F6E56'} : {})}}>{g.title}</div>
                        <div style={styles.cardSub}>{g.sub}</div>
                      </button>
                    ))}
                  </div>
                  <div style={styles.btnRow}>
                    <button style={styles.btnBack} onClick={goBack}>← Zurück</button>
                    <button style={styles.btnNext} onClick={goNext}>Weiter →</button>
                  </div>
                </div>
              )}

              {/* STEP 3 – Saison */}
              {s.step === 3 && (
                <div>
                  <span style={styles.stepLabel}>Schritt 3 von {STEPS} — Saison</span>
                  <h2 style={styles.stepTitle}>Gibt es einen saisonalen Einfluss?</h2>
                  <div style={styles.cardGrid3}>
                    {SAISON.map(x => (
                      <button key={x.id} style={{...styles.selCard, textAlign:'center', ...(s.saison===x.id ? styles.selCardActive : {})}} onClick={() => pick('saison', x.id)}>
                        <div style={{...styles.cardIcon, textAlign:'center'}}>{x.icon}</div>
                        <div style={{...styles.cardTitle, ...(s.saison===x.id ? {color:'#0F6E56'} : {})}}>{x.title}</div>
                      </button>
                    ))}
                  </div>
                  <div style={styles.btnRow}>
                    <button style={styles.btnBack} onClick={goBack}>← Zurück</button>
                    <button style={styles.btnNext} onClick={goNext}>Weiter →</button>
                  </div>
                </div>
              )}

              {/* STEP 4 – Ort */}
              {s.step === 4 && (
                <div>
                  <span style={styles.stepLabel}>Schritt 4 von {STEPS} — Schauplatz</span>
                  <h2 style={styles.stepTitle}>Wo findet die Geschichte statt?</h2>
                  <textarea rows={3} style={styles.textarea} placeholder="z.B. Ein tiefer Wald voller Glühwürmchen, eine alte Höhle am Meer…"
                    value={s.ort} onChange={e => pick('ort', e.target.value)} />
                  <div style={styles.suggestions}>
                    {ORT_SUGG.map(sg => (
                      <button key={sg} style={styles.sug} onClick={() => pick('ort', s.ort ? s.ort + ' · ' + sg : sg)}>{sg}</button>
                    ))}
                  </div>
                  <div style={styles.btnRow}>
                    <button style={styles.btnBack} onClick={goBack}>← Zurück</button>
                    <button style={styles.btnNext} onClick={goNext}>Weiter →</button>
                  </div>
                </div>
              )}

              {/* STEP 5 – Charaktere */}
              {s.step === 5 && (
                <div>
                  <span style={styles.stepLabel}>Schritt 5 von {STEPS} — Charaktere</span>
                  <h2 style={styles.stepTitle}>Wer spielt mit in der Geschichte?</h2>
                  <textarea rows={4} style={styles.textarea} placeholder="z.B. Emma, ein mutiges Mädchen mit Sommersprossen · Kira, eine kleine Eule mit großen Augen"
                    value={s.charaktere} onChange={e => pick('charaktere', e.target.value)} />
                  <div style={styles.suggestions}>
                    {CHAR_SUGG.map(sg => (
                      <button key={sg} style={styles.sug} onClick={() => pick('charaktere', s.charaktere ? s.charaktere + ' · ' + sg : sg)}>{sg}</button>
                    ))}
                  </div>
                  <div style={styles.seriesBox}>
                    <div style={styles.seriesToggle} onClick={() => pick('serieAktiv', !s.serieAktiv)}>
                      <span style={styles.seriesToggleLabel}>📚 Als Serie speichern</span>
                      <div style={{...styles.toggleTrack, ...(s.serieAktiv ? styles.toggleTrackOn : {})}}>
                        <div style={{...styles.toggleKnob, ...(s.serieAktiv ? styles.toggleKnobOn : {})}} />
                      </div>
                    </div>
                    {s.serieAktiv && (
                      <input type="text" style={{...styles.textarea, marginTop:12, resize:'none', padding:'10px 14px'}}
                        placeholder="Name der Serie, z.B. «Lenas Abenteuer»"
                        value={s.serieName} onChange={e => pick('serieName', e.target.value)} />
                    )}
                  </div>
                  <div style={styles.btnRow}>
                    <button style={styles.btnBack} onClick={goBack}>← Zurück</button>
                    <button style={styles.btnNext} onClick={goNext}>Weiter →</button>
                  </div>
                </div>
              )}

              {/* STEP 6 – Thema */}
              {s.step === 6 && (
                <div>
                  <span style={styles.stepLabel}>Schritt 6 von {STEPS} — Thema</span>
                  <h2 style={styles.stepTitle}>Was soll die Geschichte vermitteln?</h2>
                  <div style={styles.chipGrid}>
                    {THEMEN.map(t => (
                      <button key={t} style={{...styles.chip, ...(s.thema===t ? styles.chipActive : {})}} onClick={() => pick('thema', t)}>{t}</button>
                    ))}
                  </div>
                  <div style={styles.btnRow}>
                    <button style={styles.btnBack} onClick={goBack}>← Zurück</button>
                    <button style={styles.btnNext} onClick={goNext}>Weiter →</button>
                  </div>
                </div>
              )}

              {/* STEP 7 – Länge */}
              {s.step === 7 && (
                <div>
                  <span style={styles.stepLabel}>Schritt 7 von {STEPS} — Länge</span>
                  <h2 style={styles.stepTitle}>Wie lang soll die Geschichte sein?</h2>
                  <div style={styles.cardGrid3}>
                    {LAENGEN.map(l => (
                      <button key={l.id} style={{...styles.selCard, textAlign:'center', ...(s.laenge===l.id ? styles.selCardActive : {})}} onClick={() => pick('laenge', l.id)}>
                        <div style={{...styles.cardTitle, ...(s.laenge===l.id ? {color:'#0F6E56'} : {})}}>{l.title}</div>
                        <div style={styles.cardSub}>{l.sub}</div>
                        <div style={styles.cardSub}>{l.wort}</div>
                      </button>
                    ))}
                  </div>
                  <div style={styles.summaryBox}>
                    🌙 {anlassObj.title} · {genreObj.title}
                    {s.saison && s.saison !== 'keiner' && ` · ${saisonObj.title}`}<br/>
                    {s.thema && `💡 ${s.thema}`}<br/>
                    {s.ort && `📍 ${s.ort.substring(0,50)}${s.ort.length>50?'…':''}`}<br/>
                    {s.karaktere && `👤 ${s.charaktere.substring(0,50)}${s.charaktere.length>50?'…':''}`}
                    {s.serieAktiv && s.serieName && <><br/>📚 Serie: {s.serieName}</>}
                  </div>
                  <div style={styles.btnRow}>
                    <button style={styles.btnBack} onClick={goBack}>← Zurück</button>
                    <button style={{...styles.btnNext, ...styles.btnGreen}} onClick={goNext}>✨ Geschichte erschaffen</button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

const styles = {
  page: {background:'#F7F5F2', minHeight:'100vh', fontFamily:"'DM Sans', sans-serif", color:'#1A1A1A'},
  container: {maxWidth:600, margin:'0 auto', padding:'36px 24px 80px'},
  header: {textAlign:'center', marginBottom:36},
  logo: {fontSize:32, marginBottom:10},
  title: {fontFamily:"'Lora', serif", fontSize:30, fontWeight:400, color:'#1A1A1A', marginBottom:4},
  subtitle: {fontSize:14, color:'#888'},
  progressBar: {display:'flex', gap:6, marginBottom:28},
  progressStep: {flex:1, height:3, borderRadius:2},
  stepLabel: {display:'block', fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'#888', marginBottom:8},
  stepTitle: {fontFamily:"'Lora', serif", fontSize:22, fontWeight:400, color:'#1A1A1A', marginBottom:20},
  cardGrid2: {display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10},
  cardGrid3: {display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10},
  selCard: {padding:'14px 12px', borderRadius:12, border:'1.5px solid #E8E4DE', background:'#fff', cursor:'pointer', textAlign:'left', fontFamily:"'DM Sans', sans-serif", width:'100%', transition:'all 0.15s'},
  selCardActive: {borderColor:'#1D9E75', background:'#F0FBF7'},
  cardIcon: {fontSize:22, marginBottom:6},
  cardTitle: {fontSize:14, fontWeight:500, color:'#1A1A1A'},
  cardSub: {fontSize:12, color:'#888', marginTop:2},
  chipGrid: {display:'flex', flexWrap:'wrap', gap:8, marginBottom:8},
  chip: {padding:'9px 18px', borderRadius:40, border:'1.5px solid #E8E4DE', background:'transparent', color:'#888', fontSize:14, cursor:'pointer', fontFamily:"'DM Sans', sans-serif"},
  chipActive: {borderColor:'#1D9E75', background:'#F0FBF7', color:'#0F6E56'},
  textarea: {width:'100%', padding:'12px 14px', borderRadius:10, border:'1.5px solid #E8E4DE', background:'#fff', color:'#1A1A1A', fontSize:15, lineHeight:1.6, fontFamily:"'DM Sans', sans-serif", resize:'vertical', boxSizing:'border-box'},
  suggestions: {display:'flex', flexWrap:'wrap', gap:6, marginTop:10},
  sug: {padding:'5px 12px', borderRadius:20, border:'1px solid #E8E4DE', background:'#F7F5F2', color:'#888', fontSize:12, cursor:'pointer', fontFamily:"'DM Sans', sans-serif"},
  seriesBox: {borderRadius:12, border:'1.5px solid #E8E4DE', padding:16, background:'#F7F5F2', marginTop:20},
  seriesToggle: {display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer'},
  seriesToggleLabel: {fontSize:14, fontWeight:500, color:'#1A1A1A'},
  toggleTrack: {width:42, height:24, borderRadius:12, background:'#D0D0D0', position:'relative', cursor:'pointer', border:'none', padding:0, flexShrink:0},
  toggleTrackOn: {background:'#1D9E75'},
  toggleKnob: {width:20, height:20, borderRadius:'50%', background:'white', position:'absolute', top:2, left:2, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.15)'},
  toggleKnobOn: {left:20},
  summaryBox: {marginTop:20, padding:'14px 16px', borderRadius:10, background:'#F0FBF7', border:'1px solid #C5E8DC', fontSize:13, color:'#555', lineHeight:1.8},
  sectionLabel: {display:'block', fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'#888', marginBottom:10},
  seriesItem: {display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, border:'1.5px solid #E8E4DE', background:'#fff', marginBottom:8, cursor:'pointer'},
  seriesItemName: {fontSize:14, fontWeight:500, color:'#1A1A1A'},
  seriesItemCount: {fontSize:12, color:'#888', marginTop:2},
  divider: {height:1, background:'#E8E4DE', margin:'20px 0'},
  errorBox: {fontSize:13, color:'#A32D2D', background:'#FCEBEB', borderRadius:8, padding:'10px 14px', marginBottom:14},
  btnRow: {display:'flex', gap:10, marginTop:28},
  btnBack: {flexShrink:0, padding:'13px 20px', borderRadius:10, border:'1.5px solid #E8E4DE', background:'transparent', color:'#888', fontSize:14, cursor:'pointer', fontFamily:"'DM Sans', sans-serif"},
  btnNext: {flex:1, padding:14, borderRadius:10, border:'none', background:'#1A1A1A', color:'#fff', fontSize:15, fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans', sans-serif"},
  btnGreen: {background:'#1D9E75'},
  btnOutline: {flex:1, padding:13, borderRadius:10, border:'1.5px solid #E8E4DE', background:'transparent', color:'#888', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans', sans-serif"},
  btnSolid: {flex:1, padding:13, borderRadius:10, border:'none', background:'#1A1A1A', color:'#fff', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans', sans-serif"},
  actionRow: {display:'flex', gap:10},
  loadingWrap: {textAlign:'center', padding:'80px 0'},
  loadingMoon: {fontSize:42, marginBottom:16},
  spinner: {width:32, height:32, border:'3px solid #E8E4DE', borderTopColor:'#1D9E75', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 20px'},
  loadingTitle: {fontFamily:"'Lora', serif", fontSize:20, color:'#1A1A1A', marginBottom:6},
  loadingSubtitle: {fontSize:13, color:'#888'},
  chapterBadge: {display:'inline-flex', alignItems:'center', gap:6, background:'#E1F5EE', color:'#0F6E56', borderRadius:20, padding:'5px 14px', fontSize:12, fontWeight:500, marginBottom:14},
  storyTitle: {fontFamily:"'Lora', serif", fontSize:26, fontWeight:400, color:'#1A1A1A', marginBottom:12, lineHeight:1.3},
  tagRow: {display:'flex', flexWrap:'wrap', gap:8, marginBottom:20},
  tag: {fontSize:12, color:'#888', background:'#F7F5F2', border:'1px solid #E8E4DE', borderRadius:20, padding:'3px 12px'},
  storyText: {fontFamily:"'Lora', serif", fontSize:17, lineHeight:1.9, color:'#2A2A2A'},
};
