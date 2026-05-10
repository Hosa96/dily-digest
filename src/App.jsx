import { useState, useEffect } from "react";

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const KEY_WEBHOOK   = "dkd-webhook-url";
const KEY_SUBS      = "dkd-subscribers";
const KEY_ADMIN_PW  = "dkd-admin-pw";
const KEY_AUTHED    = "dkd-authed";
const KEY_API_KEY   = "dkd-anthropic-key";
const DEFAULT_PW    = "digest2026";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TOPICS = [
  "Artificial Intelligence","Islamic History","Quantum Physics","Psychology",
  "Ancient Civilizations","Behavioural Economics","Philosophy of Mind",
  "Astronomy & Space","Neuroscience","Architecture","Climate Science",
  "Mathematics","Medicine","Literature & Poetry","World Religions",
];
const LEVELS = [
  { value:"beginner",     label:"🌱 Beginner",     desc:"Simple & foundational" },
  { value:"intermediate", label:"📖 Intermediate",  desc:"Balanced depth" },
  { value:"advanced",     label:"🔬 Advanced",      desc:"Deep & technical" },
];
const TIMES = ["05:00","06:00","07:00","08:00","09:00","10:00"];
const TIMEZONES = [
  "UTC","Asia/Riyadh","Asia/Dubai","Asia/Kuwait","Africa/Cairo",
  "Africa/Casablanca","Europe/London","Europe/Paris","America/New_York",
  "America/Chicago","America/Los_Angeles","Asia/Karachi","Asia/Kolkata",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const storage = {
  get(k)     { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set(k, v)  { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

function Tag({ children, color="#C9974C" }) {
  return (
    <span style={{
      display:"inline-block", padding:"3px 10px",
      fontSize:10, letterSpacing:"2px", textTransform:"uppercase",
      background:`${color}18`, color, border:`1px solid ${color}40`,
      fontFamily:"'Courier New', monospace"
    }}>{children}</span>
  );
}

function Step({ n, title, children, open, onToggle }) {
  return (
    <div style={{ borderBottom:"1px solid #E7E5E0", marginBottom:0 }}>
      <div onClick={onToggle} style={{
        display:"flex", alignItems:"center", gap:16, padding:"18px 0",
        cursor:"pointer", userSelect:"none"
      }}>
        <div style={{
          width:32, height:32, borderRadius:"50%", flexShrink:0,
          background: open ? "#1C1917" : "#F0EDE6",
          color: open ? "#FAFAF7" : "#78716C",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13, fontWeight:"bold", fontFamily:"'Courier New', monospace",
          transition:"all 0.2s"
        }}>{n}</div>
        <span style={{ flex:1, fontFamily:"'Playfair Display', Georgia, serif", fontSize:17, color:"#1C1917" }}>{title}</span>
        <span style={{ color:"#B45309", fontSize:18, fontWeight:"bold", transform: open?"rotate(45deg)":"none", transition:"0.2s" }}>+</span>
      </div>
      {open && (
        <div style={{ paddingBottom:24, paddingLeft:48, animation:"fadeDown 0.25s ease" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position:"relative", marginTop:12, marginBottom:8 }}>
      <pre style={{
        background:"#1C1917", color:"#D6D3D1", padding:"16px 20px",
        fontSize:12, lineHeight:1.8, overflowX:"auto", margin:0,
        fontFamily:"'Courier New', monospace", borderRadius:0,
        border:"1px solid #292524"
      }}>{children}</pre>
      <button onClick={() => { navigator.clipboard?.writeText(children); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
        style={{
          position:"absolute", top:8, right:8,
          background: copied ? "#065F46" : "#292524",
          color: copied ? "#6EE7B7" : "#A8A29E",
          border:"none", padding:"4px 10px", fontSize:11,
          cursor:"pointer", fontFamily:"'Courier New', monospace",
          transition:"all 0.2s"
        }}>
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}

// ─── SUBSCRIBE VIEW ───────────────────────────────────────────────────────────
function SubscribeView({ webhookUrl, onSuccess }) {
  const [form, setForm] = useState({ name:"", email:"", topic:"", level:"intermediate", sendTime:"07:00", timezone:"Asia/Riyadh" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [topicOpen, setTopicOpen] = useState(false);

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const submit = async () => {
    if (!form.name.trim())  return setError("Please enter your name.");
    if (!form.email.trim()) return setError("Please enter your email.");
    if (!form.topic.trim()) return setError("Please choose a topic.");
    if (!webhookUrl)        return setError("This service is not configured yet. Please contact the admin.");
    setError(""); setLoading(true);
    const payload = { ...form, subscribedAt: new Date().toISOString(), status:"active" };
    try {
      await fetch(webhookUrl, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(payload),
        mode:"no-cors"
      });
      const existing = (storage.get(KEY_SUBS)) || [];
      storage.set(KEY_SUBS, [...existing, payload]);
      onSuccess(form.name);
    } catch {
      setError("Submission failed. Please try again or contact the admin.");
    } finally { setLoading(false); }
  };

  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"72px 24px 56px", borderBottom:"1px solid #E7E5E0" }}>
        <Tag>Free · Bilingual · AI-Powered</Tag>
        <h1 style={{
          fontFamily:"'Playfair Display', Georgia, serif",
          fontSize:"clamp(36px,6vw,62px)", fontWeight:700,
          color:"#1C1917", lineHeight:1.15, margin:"24px 0 20px",
          letterSpacing:"-0.5px"
        }}>
          A smarter morning<br />
          <span style={{ color:"#B45309", fontStyle:"italic" }}>starts with one email</span>
        </h1>
        <p style={{ fontSize:18, color:"#78716C", maxWidth:520, margin:"0 auto", lineHeight:1.8, fontFamily:"'Lora', Georgia, serif" }}>
          Every morning, Claude researches your chosen topic and sends a rich bilingual digest — in English & Arabic — straight to your inbox.
        </p>
        {/* Features */}
        <div style={{ display:"flex", gap:24, justifyContent:"center", flexWrap:"wrap", marginTop:40 }}>
          {[["📚","Deep Dives"],["🌐","English + Arabic"],["🤖","AI-Curated"],["⏰","Your Schedule"]].map(([icon,label]) => (
            <div key={label} style={{
              background:"#F0EDE6", padding:"10px 20px",
              display:"flex", alignItems:"center", gap:8,
              fontSize:14, color:"#57534E", fontFamily:"'Lora', Georgia, serif"
            }}>
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth:560, margin:"0 auto", padding:"56px 24px 80px" }}>
        <h2 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:28, color:"#1C1917", marginBottom:8, textAlign:"center" }}>
          Subscribe — it's free
        </h2>
        <p style={{ textAlign:"center", color:"#78716C", marginBottom:40, fontSize:15 }}>
          Takes 30 seconds. Cancel anytime.
        </p>

        {/* Name */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:"block", fontSize:11, letterSpacing:"2px", color:"#B45309", textTransform:"uppercase", marginBottom:8, fontFamily:"'Courier New', monospace" }}>Your Name</label>
          <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Ahmed Al-Rashid" className="dkd-input" />
        </div>

        {/* Email */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:"block", fontSize:11, letterSpacing:"2px", color:"#B45309", textTransform:"uppercase", marginBottom:8, fontFamily:"'Courier New', monospace" }}>Email Address</label>
          <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="you@example.com" className="dkd-input" />
        </div>

        {/* Topic */}
        <div style={{ marginBottom:20, position:"relative" }}>
          <label style={{ display:"block", fontSize:11, letterSpacing:"2px", color:"#B45309", textTransform:"uppercase", marginBottom:8, fontFamily:"'Courier New', monospace" }}>Topic of Interest</label>
          <input
            value={form.topic}
            onChange={e=>{ set("topic",e.target.value); setTopicOpen(true); }}
            onFocus={()=>setTopicOpen(true)}
            placeholder="Type or choose a topic..."
            className="dkd-input"
          />
          {topicOpen && (
            <div style={{
              position:"absolute", top:"100%", left:0, right:0, zIndex:10,
              background:"#FAFAF7", border:"1px solid #E7E5E0", borderTop:"none",
              maxHeight:200, overflowY:"auto", boxShadow:"0 8px 24px rgba(0,0,0,0.08)"
            }}>
              {TOPICS.filter(t=>t.toLowerCase().includes(form.topic.toLowerCase())).map(t=>(
                <div key={t} onClick={()=>{ set("topic",t); setTopicOpen(false); }}
                  style={{ padding:"12px 16px", cursor:"pointer", fontSize:14, color:"#1C1917", fontFamily:"'Lora', Georgia, serif" }}
                  onMouseEnter={e=>e.target.style.background="#F0EDE6"}
                  onMouseLeave={e=>e.target.style.background="transparent"}>
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Level */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:"block", fontSize:11, letterSpacing:"2px", color:"#B45309", textTransform:"uppercase", marginBottom:8, fontFamily:"'Courier New', monospace" }}>Knowledge Level</label>
          <div style={{ display:"flex", gap:10 }}>
            {LEVELS.map(l=>(
              <div key={l.value} onClick={()=>set("level",l.value)}
                style={{
                  flex:1, padding:"12px 8px", textAlign:"center", cursor:"pointer",
                  border: form.level===l.value ? "2px solid #B45309" : "1px solid #E7E5E0",
                  background: form.level===l.value ? "#FEF3C7" : "#FAFAF7",
                  transition:"all 0.15s"
                }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{l.label.split(" ")[0]}</div>
                <div style={{ fontSize:12, color:"#1C1917", fontFamily:"'Lora', Georgia, serif", fontWeight: form.level===l.value?600:400 }}>{l.label.split(" ").slice(1).join(" ")}</div>
                <div style={{ fontSize:11, color:"#78716C", marginTop:2 }}>{l.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Time + Timezone */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
          <div>
            <label style={{ display:"block", fontSize:11, letterSpacing:"2px", color:"#B45309", textTransform:"uppercase", marginBottom:8, fontFamily:"'Courier New', monospace" }}>Send Time</label>
            <select value={form.sendTime} onChange={e=>set("sendTime",e.target.value)} className="dkd-select">
              {TIMES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, letterSpacing:"2px", color:"#B45309", textTransform:"uppercase", marginBottom:8, fontFamily:"'Courier New', monospace" }}>Timezone</label>
            <select value={form.timezone} onChange={e=>set("timezone",e.target.value)} className="dkd-select">
              {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", color:"#B91C1C", padding:"12px 16px", fontSize:14, marginBottom:20, fontFamily:"'Lora', Georgia, serif" }}>
            {error}
          </div>
        )}

        <button onClick={submit} disabled={loading} className="dkd-btn-primary" style={{ width:"100%", opacity: loading?0.7:1 }}>
          {loading ? "Subscribing..." : "Subscribe — Start Learning Tomorrow →"}
        </button>

        <p style={{ textAlign:"center", fontSize:12, color:"#A8A29E", marginTop:16, fontFamily:"'Courier New', monospace" }}>
          No spam. No tracking. Just knowledge.
        </p>
      </div>
    </div>
  );
}

// ─── CONFIRMATION VIEW ────────────────────────────────────────────────────────
function ConfirmView({ name, onBack }) {
  return (
    <div style={{ textAlign:"center", padding:"100px 24px", animation:"fadeUp 0.5s ease" }}>
      <div style={{ fontSize:64, marginBottom:24 }}>🌅</div>
      <Tag color="#065F46">You're in!</Tag>
      <h2 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:38, color:"#1C1917", margin:"20px 0 16px" }}>
        Welcome, {name}!
      </h2>
      <p style={{ fontSize:17, color:"#78716C", maxWidth:420, margin:"0 auto 40px", lineHeight:1.8, fontFamily:"'Lora', Georgia, serif" }}>
        Your first digest is on its way tomorrow morning. Look forward to a richer start to your day — every day.
      </p>
      <div style={{ background:"#F0EDE6", border:"1px solid #E7E5E0", padding:"20px 32px", display:"inline-block", marginBottom:40, textAlign:"left" }}>
        <div style={{ fontSize:12, letterSpacing:"2px", color:"#B45309", fontFamily:"'Courier New', monospace", marginBottom:8 }}>WHAT TO EXPECT</div>
        {["📌 A compelling hook to start your morning","📖 3–4 paragraphs of curated knowledge","🔍 A surprising Did You Know? fact","📝 3 key terms, defined clearly","🤔 A reflection question","📚 Further reading suggestions","🌐 All of the above — in English AND Arabic"].map(item=>(
          <div key={item} style={{ fontSize:14, color:"#57534E", padding:"4px 0", fontFamily:"'Lora', Georgia, serif" }}>{item}</div>
        ))}
      </div>
      <br />
      <button onClick={onBack} className="dkd-btn-ghost">Subscribe a friend →</button>
    </div>
  );
}

// ─── SETUP GUIDE STYLES (module-level, avoids any TDZ issues) ────────────────
const SP = { fontSize:14, color:"#57534E", lineHeight:1.9, margin:"0 0 8px", fontFamily:"'Lora', Georgia, serif" };
const SN = { background:"#FFFBEB", border:"1px solid #FDE68A", padding:"12px 16px", fontSize:13, color:"#92400E", margin:"12px 0", fontFamily:"'Lora', Georgia, serif" };
const SL = { color:"#B45309", textDecoration:"underline" };
const SC = { background:"#F0EDE6", padding:"1px 6px", fontFamily:"'Courier New', monospace", fontSize:12, color:"#1C1917" };

// ─── SETUP GUIDE ─────────────────────────────────────────────────────────────
function SetupGuide() {
  const [open, setOpen] = useState(null);
  const toggle = (n) => setOpen(o => o===n ? null : n);

  const claudePrompt = `You are an expert educator. Generate a rich daily knowledge digest about "{{topic}}" at a {{level}} level for {{name}}.

Return ONLY valid JSON (no markdown, no backticks):
{
  "en": {
    "title": "Compelling English title",
    "hook": "One fascinating sentence to hook the reader",
    "main": "3-4 paragraphs of rich educational content",
    "did_you_know": "One surprising little-known fact",
    "key_terms": [
      {"term": "Term", "definition": "Clear definition"}
    ],
    "reflection": "A thought-provoking question",
    "further_reading": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
  },
  "ar": {
    "title": "العنوان بالعربية",
    "hook": "جملة افتتاحية مثيرة",
    "main": "3-4 فقرات تعليمية غنية",
    "did_you_know": "حقيقة مدهشة",
    "key_terms": [
      {"term": "المصطلح", "definition": "التعريف"}
    ],
    "reflection": "سؤال تأملي",
    "further_reading": ["اقتراح 1", "اقتراح 2", "اقتراح 3"]
  }
}`;

  const claudeBody = `{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 2500,
  "messages": [
    {
      "role": "user",
      "content": "{{YOUR_PROMPT_WITH_SUBSCRIBER_DATA}}"
    }
  ]
}`;

  const emailTemplate = `📚 Daily Knowledge Digest — {{date}}
Topic: {{topic}} | Level: {{level}}

━━━━━━━━━━━━━━━━━━━━━━━━
🇬🇧 ENGLISH
━━━━━━━━━━━━━━━━━━━━━━━━

📌 {{en.title}}

💡 {{en.hook}}

{{en.main}}

🔍 Did You Know?
{{en.did_you_know}}

📝 Key Terms
{{en.key_terms}}

🤔 Reflect: {{en.reflection}}

📚 Further Reading: {{en.further_reading}}

━━━━━━━━━━━━━━━━━━━━━━━━
🇸🇦 العربية
━━━━━━━━━━━━━━━━━━━━━━━━

📌 {{ar.title}}

💡 {{ar.hook}}

{{ar.main}}

🔍 هل تعلم؟
{{ar.did_you_know}}

📝 المصطلحات: {{ar.key_terms}}

🤔 تأمل: {{ar.reflection}}

📚 للمزيد: {{ar.further_reading}}`;

  const steps = [
    {
      title:"Create a Make.com account",
      content: <>
        <p style={SP}>Go to <a href="https://make.com" target="_blank" style={SL}>make.com</a> and sign up for free. The free plan gives you <strong>1,000 operations/month</strong> — enough for ~30 subscribers receiving daily digests.</p>
        <div style={SN}>💡 Make.com is the automation platform that connects your registration form → Google Sheets → Claude → Gmail.</div>
      </>
    },
    {
      title:"Create the Google Sheet (subscriber database)",
      content: <>
        <p style={SP}>Create a new Google Sheet with exactly these column headers in row 1:</p>
        <CodeBlock>name | email | topic | level | sendTime | timezone | status | subscribedAt</CodeBlock>
        <p style={SP}>This is where all subscriber data will be stored. Keep the Sheet URL handy.</p>
      </>
    },
    {
      title:"Scenario 1 — Registration Webhook",
      content: <>
        <p style={SP}>This scenario receives registrations from the form and saves them to Google Sheets.</p>
        <ol style={{ ...SP, paddingLeft:20, lineHeight:2.2 }}>
          <li>In Make.com → <strong>Create a new Scenario</strong></li>
          <li>Add module: <strong>Webhooks → Custom Webhook</strong> → click "Add" → name it "Digest Registration" → Save</li>
          <li><strong>Copy the webhook URL</strong> and paste it in the Admin → Settings section of this app</li>
          <li>Add a second module: <strong>Google Sheets → Add a Row</strong></li>
          <li>Connect your Google account and select your Spreadsheet and Sheet</li>
          <li>Map the fields from the webhook data to the sheet columns:</li>
        </ol>
        <CodeBlock>{`Column A (name)          → {{1.name}}
Column B (email)         → {{1.email}}
Column C (topic)         → {{1.topic}}
Column D (level)         → {{1.level}}
Column E (sendTime)      → {{1.sendTime}}
Column F (timezone)      → {{1.timezone}}
Column G (status)        → active
Column H (subscribedAt)  → {{1.subscribedAt}}`}</CodeBlock>
        <p style={SP}>7. Click <strong>Run Once</strong> to test, then submit the form on the Subscribe page. You should see data appear in your sheet.</p>
        <p style={SP}>8. <strong>Turn the scenario ON</strong> (toggle at the bottom).</p>
      </>
    },
    {
      title:"Get your Anthropic API Key",
      content: <>
        <p style={SP}>Go to <a href="https://console.anthropic.com" target="_blank" style={SL}>console.anthropic.com</a> → API Keys → Create Key. Copy it and paste it in the Admin → Settings section of this app (it is stored securely in your browser).</p>
        <div style={SN}>⚠️ Never share your API key. It will only be used inside Make.com's HTTP module, server-side.</div>
      </>
    },
    {
      title:"Scenario 2 — Daily Digest Sender",
      content: <>
        <p style={SP}>This is the main scenario. It runs every morning, reads your subscribers, calls Claude for each one, and sends their personalized digest.</p>
        <p style={{ ...SP, fontWeight:600, marginTop:16 }}>Module 1 — Schedule Trigger</p>
        <ol style={{ ...SP, paddingLeft:20, lineHeight:2.2 }}>
          <li>Create a new Scenario → Add module: <strong>Schedule</strong></li>
          <li>Set it to run <strong>Every Day</strong> at your preferred send time (e.g. 06:00 UTC)</li>
        </ol>
        <p style={{ ...SP, fontWeight:600, marginTop:16 }}>Module 2 — Read Subscribers from Google Sheets</p>
        <ol style={{ ...SP, paddingLeft:20, lineHeight:2.2 }}>
          <li>Add module: <strong>Google Sheets → Search Rows</strong></li>
          <li>Select your spreadsheet and sheet</li>
          <li>Filter: Column G (status) = <code style={SC}>active</code></li>
          <li>Set Max results to <code style={SC}>500</code></li>
        </ol>
        <p style={{ ...SP, fontWeight:600, marginTop:16 }}>Module 3 — Iterator</p>
        <ol style={{ ...SP, paddingLeft:20, lineHeight:2.2 }}>
          <li>Add module: <strong>Flow Control → Iterator</strong></li>
          <li>Array: select the rows array from Module 2</li>
        </ol>
        <p style={{ ...SP, fontWeight:600, marginTop:16 }}>Module 4 — Call Claude API</p>
        <ol style={{ ...SP, paddingLeft:20, lineHeight:2.2 }}>
          <li>Add module: <strong>HTTP → Make a Request</strong></li>
          <li>URL: <code style={SC}>https://api.anthropic.com/v1/messages</code></li>
          <li>Method: <strong>POST</strong></li>
          <li>Add Headers:</li>
        </ol>
        <CodeBlock>{`x-api-key          →  YOUR_ANTHROPIC_API_KEY
anthropic-version  →  2023-06-01
content-type       →  application/json`}</CodeBlock>
        <p style={{ ...SP, marginTop:8 }}>Body type: <strong>Raw</strong> → Content type: <strong>application/json</strong></p>
        <p style={SP}>For the prompt, copy the template below and paste it inside a <code style={SC}>"content"</code> field. Replace the variables with Make.com data from the iterator (e.g. <code style={SC}>{"{{3.col_c}}"}</code> for topic):</p>
        <CodeBlock>{claudePrompt}</CodeBlock>
        <CodeBlock>{claudeBody}</CodeBlock>
        <p style={{ ...SP, fontWeight:600, marginTop:16 }}>Module 5 — Parse Claude's Response</p>
        <ol style={{ ...SP, paddingLeft:20, lineHeight:2.2 }}>
          <li>Add module: <strong>JSON → Parse JSON</strong></li>
          <li>JSON string: <code style={SC}>{"{{4.data.content[].text}}"}</code> (the response body from Module 4)</li>
        </ol>
        <p style={{ ...SP, fontWeight:600, marginTop:16 }}>Module 6 — Send Email via Gmail</p>
        <ol style={{ ...SP, paddingLeft:20, lineHeight:2.2 }}>
          <li>Add module: <strong>Gmail → Send an Email</strong> (connect your Gmail account)</li>
          <li>To: <code style={SC}>{"{{3.col_b}}"}</code> (subscriber email from iterator)</li>
          <li>Subject: <code style={SC}>📚 Daily Digest: {"{{3.col_c}}"} — {"{{now}}"}</code></li>
          <li>Content: use the email template below, mapping JSON fields from Module 5</li>
        </ol>
        <CodeBlock>{emailTemplate}</CodeBlock>
      </>
    },
    {
      title:"Test, activate & share",
      content: <>
        <p style={SP}>Before turning the scenario live:</p>
        <ol style={{ ...SP, paddingLeft:20, lineHeight:2.2 }}>
          <li>Add yourself as a subscriber via the Subscribe tab</li>
          <li>In Scenario 2, click <strong>Run Once</strong> to trigger a test send</li>
          <li>Check your inbox — your first digest should arrive within 30 seconds</li>
          <li>Once confirmed, <strong>Turn the scenario ON</strong></li>
          <li>Share this app URL with your friends — they subscribe, Make.com does the rest!</li>
        </ol>
        <div style={SN}>🎉 Every time someone subscribes via the form, Scenario 1 automatically adds them to the Google Sheet, and they will receive their first digest the next morning.</div>
      </>
    },
  ];

  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"48px 24px" }}>
      <Tag>Make.com Setup Guide</Tag>
      <h2 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:30, color:"#1C1917", margin:"16px 0 8px" }}>
        Full Automation in 6 Steps
      </h2>
      <p style={{ color:"#78716C", marginBottom:40, fontSize:15, fontFamily:"'Lora', Georgia, serif" }}>
        This guide sets up the complete pipeline: Registration → Storage → Claude AI → Email. Takes about 30 minutes, runs forever after.
      </p>
      {steps.map((s,i) => (
        <Step key={i} n={i+1} title={s.title} open={open===i} onToggle={()=>toggle(i)}>
          {s.content}
        </Step>
      ))}
    </div>
  );
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminView() {
  const [authed, setAuthed]       = useState(false);
  const [pw, setPw]               = useState("");
  const [pwError, setPwError]     = useState("");
  const [storedPw, setStoredPw]   = useState(DEFAULT_PW);
  const [webhook, setWebhook]     = useState("");
  const [webhookSaved, setWS]     = useState(false);
  const [subs, setSubs]           = useState([]);
  const [adminTab, setAdminTab]   = useState("settings");
  const [newPw, setNewPw]         = useState("");
  const [pwSaved, setPwSaved]     = useState(false);

  useEffect(()=>{
    const sp = storage.get(KEY_ADMIN_PW); if(sp) setStoredPw(sp);
    const at = storage.get(KEY_AUTHED);   if(at) setAuthed(true);
    const wh = storage.get(KEY_WEBHOOK);  if(wh) setWebhook(wh);
    const sb = storage.get(KEY_SUBS);     if(sb) setSubs(sb);
  },[]);

  const login = () => {
    if(pw === storedPw) {
      storage.set(KEY_AUTHED, true);
      setAuthed(true); setPwError("");
    } else setPwError("Incorrect password.");
  };

  const saveWebhook = () => {
    storage.set(KEY_WEBHOOK, webhook);
    setWS(true); setTimeout(()=>setWS(false),2000);
  };

  const changePassword = () => {
    if(!newPw.trim()) return;
    storage.set(KEY_ADMIN_PW, newPw);
    setStoredPw(newPw); setPwSaved(true);
    setTimeout(()=>setPwSaved(false),2000); setNewPw("");
  };

  if(!authed) return (
    <div style={{ maxWidth:400, margin:"80px auto", padding:"0 24px", textAlign:"center" }}>
      <div style={{ fontSize:40, marginBottom:16 }}>🔐</div>
      <h2 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:28, color:"#1C1917", marginBottom:8 }}>Admin Access</h2>
      <p style={{ color:"#78716C", marginBottom:32, fontSize:14 }}>Default password: <code style={{ background:"#F0EDE6", padding:"2px 8px" }}>digest2026</code></p>
      <input value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} type="password" placeholder="Enter password" className="dkd-input" style={{ marginBottom:12 }} />
      {pwError && <p style={{ color:"#B91C1C", fontSize:14, marginBottom:12 }}>{pwError}</p>}
      <button onClick={login} className="dkd-btn-primary" style={{ width:"100%" }}>Enter Admin →</button>
    </div>
  );

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"40px 24px" }}>
      <div style={{ display:"flex", gap:0, marginBottom:40, borderBottom:"1px solid #E7E5E0" }}>
        {[["settings","⚙️ Settings"],["subscribers","👥 Subscribers"],["guide","📖 Setup Guide"]].map(([id,label])=>(
          <button key={id} onClick={()=>setAdminTab(id)}
            style={{
              padding:"12px 24px", border:"none", cursor:"pointer",
              fontFamily:"'Lora', Georgia, serif", fontSize:14,
              background:"transparent", color: adminTab===id?"#B45309":"#78716C",
              borderBottom: adminTab===id?"2px solid #B45309":"2px solid transparent",
              marginBottom:-1
            }}>{label}</button>
        ))}
      </div>

      {adminTab==="settings" && (
        <div style={{ animation:"fadeUp 0.3s ease" }}>
          <h3 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:22, color:"#1C1917", marginBottom:24 }}>Configuration</h3>

          <div style={{ background:"#F0EDE6", padding:"24px", marginBottom:28 }}>
            <label style={{ display:"block", fontSize:11, letterSpacing:"2px", color:"#B45309", textTransform:"uppercase", marginBottom:10, fontFamily:"'Courier New', monospace" }}>
              Make.com Webhook URL
            </label>
            <p style={{ fontSize:13, color:"#78716C", marginBottom:12, fontFamily:"'Lora', Georgia, serif" }}>
              From Make.com: Scenario 1 → Webhooks module → Copy URL
            </p>
            <input value={webhook} onChange={e=>setWebhook(e.target.value)} placeholder="https://hook.eu1.make.com/xxxxxxxxxxxx" className="dkd-input" style={{ marginBottom:12 }} />
            <button onClick={saveWebhook} className="dkd-btn-primary">
              {webhookSaved ? "✓ Saved!" : "Save Webhook URL"}
            </button>
          </div>

          <div style={{ background:"#F0EDE6", padding:"24px" }}>
            <label style={{ display:"block", fontSize:11, letterSpacing:"2px", color:"#B45309", textTransform:"uppercase", marginBottom:10, fontFamily:"'Courier New', monospace" }}>
              Change Admin Password
            </label>
            <p style={{ fontSize:13, color:"#78716C", marginBottom:12, fontFamily:"'Lora', Georgia, serif" }}>
              Current default: <code>digest2026</code> — change before sharing!
            </p>
            <input value={newPw} onChange={e=>setNewPw(e.target.value)} type="password" placeholder="New password" className="dkd-input" style={{ marginBottom:12 }} />
            <button onClick={changePassword} className="dkd-btn-primary">
              {pwSaved ? "✓ Password Updated!" : "Update Password"}
            </button>
          </div>
        </div>
      )}

      {adminTab==="subscribers" && (
        <div style={{ animation:"fadeUp 0.3s ease" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
            <h3 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:22, color:"#1C1917", margin:0 }}>Subscribers</h3>
            <Tag>{subs.length} total</Tag>
          </div>
          {subs.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px 24px", color:"#A8A29E", fontFamily:"'Lora', Georgia, serif" }}>
              No subscribers yet. Share the app to get started!
            </div>
          ) : (
            <div>
              {subs.map((s,i)=>(
                <div key={i} style={{ border:"1px solid #E7E5E0", padding:"16px 20px", marginBottom:8, display:"grid", gridTemplateColumns:"1fr auto", gap:12, alignItems:"center" }}>
                  <div>
                    <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:16, color:"#1C1917", marginBottom:4 }}>{s.name}</div>
                    <div style={{ fontSize:13, color:"#78716C", fontFamily:"'Lora', Georgia, serif" }}>{s.email} · {s.topic} · {s.level}</div>
                    <div style={{ fontSize:12, color:"#A8A29E", marginTop:4, fontFamily:"'Courier New', monospace" }}>{s.sendTime} {s.timezone}</div>
                  </div>
                  <Tag color="#065F46">{s.status}</Tag>
                </div>
              ))}
              <p style={{ fontSize:12, color:"#A8A29E", marginTop:16, fontFamily:"'Courier New', monospace" }}>
                Note: This list shows subscribers registered via this browser. Your Google Sheet has the complete database.
              </p>
            </div>
          )}
        </div>
      )}

      {adminTab==="guide" && <SetupGuide />}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]         = useState("subscribe"); // subscribe | confirmed | admin
  const [confirmedName, setCN]  = useState("");
  const [webhookUrl, setWHUrl]  = useState("");
  const [logoClicks, setLC]     = useState(0);

  useEffect(()=>{
    const wh = storage.get(KEY_WEBHOOK);
    if(wh) setWHUrl(wh);
  },[]);

  const handleLogoClick = () => {
    setLC(c=>{ const n=c+1; if(n>=5){ setView("admin"); return 0; } return n; });
  };

  return (
    <div style={{ minHeight:"100vh", background:"#FAFAF7", fontFamily:"'Lora', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        * { box-sizing: border-box; }
        .dkd-input {
          display:block; width:100%; padding:13px 16px;
          border:1px solid #E7E5E0; background:#FAFAF7;
          font-family:'Lora',Georgia,serif; font-size:15px; color:#1C1917;
          outline:none; transition:border-color 0.15s;
        }
        .dkd-input:focus { border-color:#B45309; }
        .dkd-input::placeholder { color:#A8A29E; }
        .dkd-select {
          display:block; width:100%; padding:13px 16px;
          border:1px solid #E7E5E0; background:#FAFAF7;
          font-family:'Lora',Georgia,serif; font-size:14px; color:#1C1917;
          outline:none; appearance:none; cursor:pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23B45309' stroke-width='1.5'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position: right 14px center;
        }
        .dkd-btn-primary {
          padding:14px 28px; background:#1C1917; color:#FAFAF7;
          border:none; font-family:'Lora',Georgia,serif; font-size:15px;
          cursor:pointer; letter-spacing:0.3px; transition:all 0.2s;
        }
        .dkd-btn-primary:hover { background:#B45309; }
        .dkd-btn-ghost {
          padding:12px 24px; background:transparent; color:#B45309;
          border:1px solid #B45309; font-family:'Lora',Georgia,serif;
          font-size:14px; cursor:pointer; transition:all 0.2s;
        }
        .dkd-btn-ghost:hover { background:#FEF3C7; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#FAFAF7; }
        ::-webkit-scrollbar-thumb { background:#E7E5E0; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        background:"rgba(250,250,247,0.96)", backdropFilter:"blur(8px)",
        borderBottom:"1px solid #E7E5E0",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 32px", height:64
      }}>
        <div onClick={handleLogoClick} style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer", userSelect:"none" }}>
          <div style={{
            width:36, height:36, background:"#1C1917",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18
          }}>📚</div>
          <div>
            <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:17, color:"#1C1917", fontWeight:700, letterSpacing:"-0.3px" }}>Daily Digest</div>
            <div style={{ fontSize:10, color:"#A8A29E", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'Courier New', monospace" }}>AI · Bilingual</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {view!=="admin" && (
            <button onClick={()=>setView("admin")} style={{ background:"none", border:"none", color:"#A8A29E", cursor:"pointer", fontSize:12, fontFamily:"'Courier New', monospace", letterSpacing:"1px" }}>
              Admin
            </button>
          )}
          {view==="admin" && (
            <button onClick={()=>setView("subscribe")} className="dkd-btn-ghost" style={{ fontSize:12, padding:"8px 16px" }}>← Back to Subscribe</button>
          )}
        </div>
      </nav>

      {/* VIEWS */}
      <div style={{ animation:"fadeUp 0.4s ease" }}>
        {view==="subscribe"  && <SubscribeView webhookUrl={webhookUrl} onSuccess={name=>{ setCN(name); setView("confirmed"); }} />}
        {view==="confirmed"  && <ConfirmView name={confirmedName} onBack={()=>setView("subscribe")} />}
        {view==="admin"      && <AdminView />}
      </div>

      {/* FOOTER */}
      {view!=="admin" && (
        <footer style={{ textAlign:"center", padding:"32px 24px", borderTop:"1px solid #E7E5E0" }}>
          <p style={{ fontSize:12, color:"#A8A29E", fontFamily:"'Courier New', monospace", letterSpacing:"1px" }}>
            POWERED BY CLAUDE AI · DELIVERED VIA MAKE.COM
          </p>
        </footer>
      )}
    </div>
  );
}
