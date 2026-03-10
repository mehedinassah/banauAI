"use client";
import { useState, useRef, useEffect } from "react";

const EXAMPLE_PROMPTS = [
  "Create a portfolio website for a photographer",
  "Build a landing page for a SaaS startup",
  "Design a personal blog for a travel writer",
  "Make a restaurant website with menu and reservations",
  "Create an agency website for a branding studio",
];

const PLANS = [
  { name: "Free", price: "$0", features: ["3 websites/month", "Basic templates", "HTML export"], cta: "Get Started" },
  { name: "Pro", price: "$6.99", period: "/mo", features: ["Unlimited websites", "AI image generation", "Custom domains", "Priority support", "Code export"], cta: "Start Free Trial", highlight: true },
  { name: "Team", price: "$19", period: "/mo", features: ["Everything in Pro", "5 team members", "White-label export", "API access"], cta: "Contact Sales" },
];

function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%", background: "#e8ff47",
          animation: "pulse 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </span>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    setDisplayed("");
    setIdx(0);
  }, [text]);
  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => { setDisplayed(text.slice(0, idx + 1)); setIdx(i => i + 1); }, 8);
      return () => clearTimeout(t);
    }
  }, [idx, text]);
  return <span>{displayed}<span style={{ opacity: idx < text.length ? 1 : 0, transition: "opacity 0.2s" }}>▌</span></span>;
}

export default function AIWebsiteBuilder() {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState("home");
  const [generatedHTML, setGeneratedHTML] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedPrompt(i => (i + 1) % EXAMPLE_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const streamStatuses = [
    "Analyzing your vision...",
    "Crafting layout structure...",
    "Writing compelling copy...",
    "Styling with precision...",
    "Adding finishing touches...",
    "Polishing the details...",
  ];

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setPhase("generating");
    setError("");
    setGeneratedHTML("");

    let statusIdx = 0;
    setStatusMsg(streamStatuses[0]);
    const statusTimer = setInterval(() => {
      statusIdx = (statusIdx + 1) % streamStatuses.length;
      setStatusMsg(streamStatuses[statusIdx]);
    }, 2200);

    try {
      const systemPrompt = `You are an expert web designer and developer. When given a description, generate a complete, beautiful, single-page HTML website with:
- Full HTML5 structure with embedded CSS and vanilla JS
- Stunning visual design with gradients, animations, and modern UI patterns
- Realistic placeholder content (names, descriptions, copy) relevant to the request
- For images, use high-quality Unsplash URLs with relevant keywords (format: https://source.unsplash.com/800x600/?keyword,keyword2)
- Mobile-responsive layout using CSS Grid/Flexbox
- Smooth scroll animations and hover effects
- A hero section, about section, portfolio/services/features section, and contact/CTA section
- Professional color palette and typography using Google Fonts
- NO external JS libraries (pure HTML/CSS/JS only)
- The website should look like it was designed by a professional agency

Return ONLY the complete HTML code, starting with <!DOCTYPE html>, nothing else.`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt }),
      });

      clearInterval(statusTimer);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "API error");
      }

      const data = await response.json();
      setGeneratedHTML(data.html);
      setPhase("result");
    } catch (e: any) {
      clearInterval(statusTimer);
      setError(e.message || "Something went wrong. Please try again.");
      setPhase("home");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
  }

  function downloadHTML() {
    const blob = new Blob([generatedHTML], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "website.html";
    a.click();
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    body { font-family: 'Syne', sans-serif; background: #0a0a0a; color: #f0ede6; min-height: 100vh; overflow-x: hidden; }
    ::selection { background: #e8ff47; color: #0a0a0a; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  `;

  if (phase === "home") return (
    <div style={{ fontFamily: "'Syne', sans-serif", background: "#0a0a0a", color: "#f0ede6", minHeight: "100vh", overflow: "hidden" }}>
      <style>{css}</style>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #1a1a1a", position: "sticky", top: 0, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "#e8ff47", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#0a0a0a", fontSize: 14, fontWeight: 800 }}>B</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>banau<span style={{ color: "#e8ff47" }}>AI</span></span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setPhase("pricing")} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#888", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Pricing</button>
          <button style={{ background: "#e8ff47", border: "none", color: "#0a0a0a", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>Sign in</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 40px 60px", textAlign: "center", animation: "fadeUp 0.7s ease both" }}>

        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(42px, 7vw, 80px)", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 24 }}>
          Just Describe the Website.<br />
          <span style={{ color: "#e8ff47", fontStyle: "italic" }}>We will make it happen.</span>
        </h1>

        <p style={{ fontSize: 14, color: "#666", maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.6, fontFamily: "'IBM Plex Mono', monospace" }}>
          Type what you want. Get a full website with layout, copy, images, and clean HTML/CSS code — ready to deploy in seconds.
        </p>

        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 6, maxWidth: 720, margin: "0 auto", boxShadow: "0 0 60px rgba(232,255,71,0.04)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={EXAMPLE_PROMPTS[selectedPrompt]}
              rows={3}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none", color: "#f0ede6",
                fontSize: 15, padding: "12px 14px", resize: "none", fontFamily: "'Syne', sans-serif",
                lineHeight: 1.5, caretColor: "#e8ff47",
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              style={{
                background: prompt.trim() ? "#e8ff47" : "#1a1a1a", border: "none",
                color: prompt.trim() ? "#0a0a0a" : "#333",
                padding: "12px 22px", borderRadius: 12, cursor: prompt.trim() ? "pointer" : "default",
                fontSize: 13, fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap",
                transition: "all 0.2s", marginBottom: 2,
              }}
            >Generate →</button>
          </div>
        </div>

        {error && <p style={{ color: "#ff6b6b", marginTop: 16, fontSize: 13 }}>{error}</p>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 24 }}>
          {EXAMPLE_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => setPrompt(p)} style={{
              background: "#111", border: "1px solid #1e1e1e", color: "#555", padding: "6px 14px",
              borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "inherit",
            }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = "#f0ede6"; (e.target as HTMLButtonElement).style.borderColor = "#333"; }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = "#555"; (e.target as HTMLButtonElement).style.borderColor = "#1e1e1e"; }}
            >{p}</button>
          ))}
        </div>
      </div>

      <div style={{ overflow: "hidden", borderTop: "1px solid #111", borderBottom: "1px solid #111", padding: "12px 0", background: "#0d0d0d" }}>
        <div style={{ display: "flex", animation: "marquee 20s linear infinite", width: "max-content", gap: 40 }}>
          {[...Array(2)].map((_, j) =>
            ["Portfolio", "SaaS Landing", "Restaurant", "Agency", "Blog", "E-commerce", "Startup", "Freelancer", "Photography", "Consulting"].map((t, i) => (
              <span key={`${j}-${i}`} style={{ fontSize: 12, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {t} <span style={{ color: "#e8ff47", margin: "0 12px" }}>✦</span>
              </span>
            ))
          )}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "80px auto", padding: "0 40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        {[
          { icon: "⚡", title: "Instant Generation", desc: "Full websites in under 15 seconds. Complete HTML, CSS, and JavaScript." },
          { icon: "🎨", title: "AI-Crafted Design", desc: "Every layout is unique. Real images, real copy, real design thinking." },
          { icon: "📦", title: "Export & Deploy", desc: "Download clean HTML or deploy directly. No lock-in, ever." },
        ].map((f, i) => (
          <div key={i} style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: 16, padding: 28 }}>
            <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "40px 40px 80px" }}>
        <button onClick={() => setPhase("pricing")} style={{
          background: "transparent", border: "1px solid #2a2a2a", color: "#888",
          padding: "12px 28px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "inherit",
        }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = "#e8ff47"; (e.target as HTMLButtonElement).style.color = "#e8ff47"; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = "#2a2a2a"; (e.target as HTMLButtonElement).style.color = "#888"; }}
        >View Pricing Plans →</button>
      </div>
    </div>
  );

  if (phase === "generating") return (
    <div style={{ fontFamily: "'Syne', sans-serif", background: "#0a0a0a", color: "#f0ede6", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
      <style>{css}</style>
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <div style={{ position: "absolute", inset: 0, border: "2px solid #1a1a1a", borderRadius: "50%" }} />
        <div style={{ position: "absolute", inset: 0, border: "2px solid transparent", borderTopColor: "#e8ff47", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 8, border: "1px solid transparent", borderTopColor: "#e8ff47", borderRadius: "50%", animation: "spin 1.5s linear infinite reverse", opacity: 0.5 }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#e8ff47", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>
          <TypewriterText text={statusMsg} />
        </p>
        <p style={{ fontSize: 12, color: "#333", fontFamily: "'IBM Plex Mono', monospace" }}>{prompt}</p>
      </div>
    </div>
  );

  if (phase === "result") return (
    <div style={{ fontFamily: "'Syne', sans-serif", background: "#0a0a0a", color: "#f0ede6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{css + `pre { white-space: pre-wrap; word-break: break-all; font-size: 12px; line-height: 1.6; color: #a8e6a3; }`}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => { setPhase("home"); setGeneratedHTML(""); setPrompt(""); }} style={{
            background: "#111", border: "1px solid #222", color: "#888", padding: "6px 14px",
            borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "inherit",
          }}>← New</button>
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 8, padding: "5px 14px", fontSize: 12, color: "#555", maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prompt}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["preview", "code"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? "#e8ff47" : "#111",
              border: "1px solid " + (activeTab === tab ? "#e8ff47" : "#222"),
              color: activeTab === tab ? "#0a0a0a" : "#666",
              padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12,
              fontFamily: "inherit", fontWeight: activeTab === tab ? 700 : 400, textTransform: "capitalize",
            }}>{tab}</button>
          ))}
          <button onClick={downloadHTML} style={{
            background: "#111", border: "1px solid #2a2a2a", color: "#aaa",
            padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "inherit",
          }}>⬇ Download</button>
          <button onClick={() => setPhase("pricing")} style={{
            background: "#e8ff47", border: "none", color: "#0a0a0a",
            padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit",
          }}>Upgrade $6.99/mo</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {activeTab === "preview" ? (
          <iframe
            ref={iframeRef}
            srcDoc={generatedHTML}
            style={{ width: "100%", height: "calc(100vh - 56px)", border: "none", background: "#fff" }}
            title="Generated Website Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div style={{ height: "calc(100vh - 56px)", overflow: "auto", background: "#080808", padding: 24 }}>
            <pre style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{generatedHTML}</pre>
          </div>
        )}
      </div>
    </div>
  );

  if (phase === "pricing") return (
    <div style={{ fontFamily: "'Syne', sans-serif", background: "#0a0a0a", color: "#f0ede6", minHeight: "100vh", padding: "60px 40px" }}>
      <style>{css}</style>
      <button onClick={() => setPhase("home")} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: 13, fontFamily: "inherit", marginBottom: 48, display: "block" }}>← Back</button>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(36px, 5vw, 56px)", letterSpacing: "-0.03em", marginBottom: 12 }}>Simple, honest pricing</h2>
        <p style={{ color: "#555", fontSize: 15 }}>Build unlimited websites. Cancel anytime.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, maxWidth: 860, margin: "0 auto" }}>
        {PLANS.map((plan, i) => (
          <div key={i} style={{
            background: plan.highlight ? "#0f110a" : "#0d0d0d",
            border: `1px solid ${plan.highlight ? "#e8ff47" : "#1a1a1a"}`,
            borderRadius: 20, padding: 32,
            boxShadow: plan.highlight ? "0 0 40px rgba(232,255,71,0.08)" : "none",
            position: "relative",
          }}>
            {plan.highlight && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#e8ff47", color: "#0a0a0a", fontSize: 10, fontWeight: 800, padding: "3px 12px", borderRadius: 10, letterSpacing: "0.1em" }}>MOST POPULAR</div>}
            <h3 style={{ fontSize: 14, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>{plan.name}</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 28 }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 48, lineHeight: 1 }}>{plan.price}</span>
              {plan.period && <span style={{ color: "#555", fontSize: 14 }}>{plan.period}</span>}
            </div>
            <ul style={{ listStyle: "none", marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.features.map((f, j) => (
                <li key={j} style={{ fontSize: 13, color: "#888", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: plan.highlight ? "#e8ff47" : "#333", fontSize: 16 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => setPhase("home")} style={{
              width: "100%", background: plan.highlight ? "#e8ff47" : "#111",
              border: `1px solid ${plan.highlight ? "#e8ff47" : "#222"}`,
              color: plan.highlight ? "#0a0a0a" : "#666",
              padding: "12px", borderRadius: 10, cursor: "pointer", fontSize: 14,
              fontWeight: 700, fontFamily: "inherit",
            }}>{plan.cta}</button>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", marginTop: 40, fontSize: 12, color: "#333" }}>All plans include SSL, global CDN hosting, and 24/7 uptime monitoring</p>
    </div>
  );

  return null;
}