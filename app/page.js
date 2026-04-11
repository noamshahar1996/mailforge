'use client'
import { useState } from 'react'

const FLOWS = [
  { type: 'welcome', icon: '👋', name: 'Welcome Flow', desc: '4 emails — discount delivery, education, founder story, urgency', emails: 4 },
  { type: 'post-purchase', icon: '📦', name: 'Post-Purchase Flow', desc: '4 emails — thank you, how to use, social proof, come back', emails: 4 },
  { type: 'abandoned-cart', icon: '🛒', name: 'Abandoned Cart Flow', desc: '3 emails — remind, build trust, push with urgency', emails: 3 },
  { type: 'browse-abandon', icon: '👀', name: 'Browse Abandon Flow', desc: '3 emails — soft reminder, build desire, final push', emails: 3 },
  { type: 'checkout-abandon', icon: '💳', name: 'Checkout Abandon Flow', desc: '3 emails — almost there, remove objections, last chance', emails: 3 },
  { type: 'subscription-onboarding', icon: '🔄', name: 'Subscription Onboarding Flow', desc: '4 emails — welcome, build habit, set expectations, loyalty', emails: 4 },
]

const SINGLE_TYPES = [
  { type: 'Welcome email', icon: '👋', desc: 'First impression for new subscribers' },
  { type: 'Abandoned cart', icon: '🛒', desc: 'Recover lost checkouts' },
  { type: 'Post-purchase', icon: '📦', desc: 'Thank you + upsell' },
  { type: 'Flash sale', icon: '⚡', desc: 'Limited-time promotional blast' },
  { type: 'Win-back', icon: '💌', desc: 'Re-engage inactive subscribers' },
  { type: 'Product launch', icon: '🚀', desc: 'Announce something new' },
]

const TONES = ['Luxury & refined', 'Bold & direct', 'Warm & friendly', 'Playful & fun', 'Scientific & trusted', 'Minimalist']

const s = {
  page: { minHeight: '100vh', background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 16px' },
  card: { background: '#fff', borderRadius: 14, border: '1px solid #e5e5e5', width: '100%', maxWidth: 680, overflow: 'hidden' },
  header: { padding: '18px 24px 0', borderBottom: '1px solid #f0f0f0' },
  headerTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  logo: { width: 30, height: 30, background: '#111', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#fff' },
  appName: { fontWeight: 700, fontSize: 15, color: '#111' },
  badge: { fontSize: 10, padding: '2px 8px', background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: 20, color: '#888' },
  steps: { display: 'flex' },
  body: { padding: '24px 24px 28px' },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 },
  input: { width: '100%', fontSize: 14, padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8, outline: 'none', fontFamily: 'inherit', color: '#111', background: '#fff', boxSizing: 'border-box' },
  textarea: { width: '100%', fontSize: 13, padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8, outline: 'none', fontFamily: 'inherit', color: '#111', background: '#fff', resize: 'none', height: 80, boxSizing: 'border-box' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 },
  btnPrimary: { fontSize: 13, padding: '10px 22px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, background: '#111', color: '#fff', border: 'none' },
  btnSecondary: { fontSize: 13, padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 500, background: 'transparent', color: '#666', border: '1px solid #e0e0e0' },
  btnAccent: { fontSize: 13, padding: '10px 22px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none' },
  errorBox: { background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#b91c1c', marginBottom: 14 },
  infoBox: { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0369a1', marginBottom: 14 },
  successBox: { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#166534', marginBottom: 14 },
  editPanel: { background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 10, padding: '16px', marginBottom: 16 },
  editLabel: { fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'block' },
}

function StepTab({ n, label, currentStep }) {
  const done = n < currentStep
  const active = n === currentStep
  return (
    <div style={{ fontSize: 12, padding: '8px 16px', color: active ? '#111' : done ? '#666' : '#aaa', borderBottom: active ? '2px solid #111' : '2px solid transparent', fontWeight: active ? 700 : 400, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 18, height: 18, borderRadius: '50%', fontSize: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? '#111' : done ? '#dcfce7' : 'transparent', border: active ? 'none' : done ? 'none' : '1px solid #ddd', color: active ? '#fff' : done ? '#16a34a' : '#aaa' }}>{done ? '✓' : n}</span>
      {label}
    </div>
  )
}

// ── EDIT PANEL ────────────────────────────────────────────────────────────────
// Shows after generation — lets user edit text and images, then re-applies
function EditPanel({ editedCopy, setEditedCopy, onApply, applying }) {
  const field = (key, label, multiline = false) => (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      {multiline
        ? <textarea style={s.textarea} value={editedCopy[key] || ''} onChange={e => setEditedCopy(p => ({ ...p, [key]: e.target.value }))} />
        : <input style={s.input} value={editedCopy[key] || ''} onChange={e => setEditedCopy(p => ({ ...p, [key]: e.target.value }))} />
      }
    </div>
  )

  return (
    <div style={s.editPanel}>
      <span style={s.editLabel}>✏️ Edit content</span>
      {field('hero_headline', 'Headline')}
      {field('story_p1', 'Body paragraph 1', true)}
      {field('story_p2', 'Body paragraph 2', true)}
      {field('cta_button', 'CTA button text')}
      {field('subject_line', 'Subject line')}
      <button
        style={{ ...s.btnAccent, width: '100%', marginTop: 4, opacity: applying ? 0.6 : 1 }}
        onClick={onApply}
        disabled={applying}
      >
        {applying ? 'Applying...' : 'Apply changes →'}
      </button>
    </div>
  )
}

export default function MailForge() {
  const [step, setStep] = useState(1)
  const [url, setUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [brand, setBrand] = useState(null)
  const [images, setImages] = useState([])
  const [heroImage, setHeroImage] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])

  // Step 3 state
  const [mode, setMode] = useState(null)
  const [flowType, setFlowType] = useState(null)
  const [emailType, setEmailType] = useState('Welcome email')
  const [offer, setOffer] = useState('')

  // Step 4 state
  const [generating, setGenerating] = useState(false)
  const [genStatus, setGenStatus] = useState('')
  const [genError, setGenError] = useState('')
  const [result, setResult] = useState(null)
  const [flowEmails, setFlowEmails] = useState([])
  const [activeEmailIndex, setActiveEmailIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('preview')
  const [copied, setCopied] = useState(false)

  // Edit panel state
  const [showEdit, setShowEdit] = useState(false)
  const [editedCopy, setEditedCopy] = useState({})
  const [applying, setApplying] = useState(false)

  async function analyzeUrl() {
    if (!url.trim()) return
    setAnalyzing(true)
    setAnalyzeError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setBrand(data.brandData)
      setImages(data.images || [])
      setHeroImage(data.heroImage || null)
      setStep(2)
    } catch (err) {
      setAnalyzeError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  async function generate(overrideCopy = null) {
    setStep(4)
    setGenerating(true)
    setGenError('')
    setResult(null)
    setFlowEmails([])
    setActiveEmailIndex(0)
    setShowEdit(false)

    try {
      if (mode === 'flow') {
        setGenStatus(`Generating ${FLOWS.find(f => f.type === flowType)?.emails || 4} emails in sequence...`)
      } else {
        setGenStatus('Writing copy and building email layout...')
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandData: brand,
          emailType: mode === 'single' ? emailType : null,
          offer,
          selectedImages,
          generatedImages: [],
          mode,
          flowType: mode === 'flow' ? flowType : null,
          overrideCopy,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      if (mode === 'flow') {
        setFlowEmails(data.emails || [])
        // Pre-populate edit fields from first email
        if (data.emails?.[0]?.copy) setEditedCopy(data.emails[0].copy)
      } else {
        setResult(data)
        if (data.copy) setEditedCopy(data.copy)
      }
      setActiveTab('preview')
    } catch (err) {
      setGenError(err.message)
    } finally {
      setGenerating(false)
      setGenStatus('')
    }
  }

  // Apply edits — re-generates only the current email with edited copy
  async function applyEdits() {
    setApplying(true)
    try {
      const currentEmailType = mode === 'flow'
        ? flowEmails[activeEmailIndex]?.role || emailType
        : emailType

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandData: brand,
          emailType: currentEmailType,
          offer,
          selectedImages,
          generatedImages: [],
          mode: 'single',
          flowType: null,
          overrideCopy: editedCopy,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to apply edits')

      if (mode === 'flow') {
        setFlowEmails(prev => prev.map((e, i) => i === activeEmailIndex ? { ...e, ...data } : e))
      } else {
        setResult(data)
      }
      setShowEdit(false)
    } catch (err) {
      setGenError(err.message)
    } finally {
      setApplying(false)
    }
  }

  // Handle hero image file upload — creates a local object URL for preview
  function handleHeroImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    setBrand(b => ({ ...b, uploadedHeroImage: localUrl }))
  }

  function setBrandField(key) { return (val) => setBrand(b => ({ ...b, [key]: val })) }

  function copyHtml(html) {
    if (!html) return
    navigator.clipboard.writeText(html).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600) })
  }

  function downloadHtml(html, filename) {
    if (!html) return
    const blob = new Blob([html], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
  }

  function reset() {
    setStep(1); setUrl(''); setBrand(null); setImages([]); setHeroImage(null)
    setSelectedImages([]); setResult(null); setFlowEmails([]); setGenError('')
    setAnalyzeError(''); setMode(null); setFlowType(null); setOffer('')
    setShowEdit(false); setEditedCopy({})
  }

  const currentEmail = mode === 'flow' ? flowEmails[activeEmailIndex] : result

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.headerTop}>
            <div style={s.logo}>✉</div>
            <span style={s.appName}>MailForge</span>
            <span style={s.badge}>beta</span>
          </div>
          <div style={s.steps}>
            {[['1','Website'],['2','Brand'],['3','Email type'],['4','Generate']].map(([n, label]) => (
              <StepTab key={n} n={parseInt(n)} label={label} currentStep={step} />
            ))}
          </div>
        </div>

        <div style={s.body}>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div>
              <div style={s.sectionLabel}>Enter your website</div>
              <div style={s.infoBox}>Paste your website URL and MailForge will automatically extract your brand identity and build a custom email.</div>
              {analyzeError && <div style={s.errorBox}>{analyzeError}</div>}
              <div style={s.field}>
                <label style={s.label}>Website URL</label>
                <input style={s.input} placeholder="https://yourbrand.com" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && !analyzing && analyzeUrl()} disabled={analyzing} />
              </div>
              {analyzing
                ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <div style={{ width: 36, height: 36, border: '2px solid #e5e5e5', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                    <div style={{ fontSize: 14, color: '#444' }}>Analyzing your website...</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>Extracting brand identity, products, and colors</div>
                  </div>
                )
                : <div style={{ ...s.actions, justifyContent: 'flex-end' }}><button style={{ ...s.btnPrimary, ...(!url.trim() ? { opacity: 0.4, cursor: 'not-allowed' } : {}) }} onClick={analyzeUrl} disabled={!url.trim()}>Analyze website →</button></div>
              }
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && brand && (
            <div>
              <div style={s.sectionLabel}>Review brand data</div>
              <div style={s.successBox}>Brand analyzed — confidence: <strong>{brand.confidence}</strong>. Review and edit anything below.</div>

              <div style={s.row2}>
                <div style={s.field}><label style={s.label}>Brand name</label><input style={s.input} value={brand.brandName || ''} onChange={e => setBrandField('brandName')(e.target.value)} /></div>
                <div style={s.field}><label style={s.label}>Niche</label><input style={s.input} value={brand.niche || ''} onChange={e => setBrandField('niche')(e.target.value)} /></div>
              </div>
              <div style={s.field}><label style={s.label}>Tagline</label><input style={s.input} value={brand.tagline || ''} onChange={e => setBrandField('tagline')(e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Product / what you sell</label><textarea style={s.textarea} value={brand.productType || ''} onChange={e => setBrandField('productType')(e.target.value)} /></div>
              <div style={s.row2}>
                <div style={s.field}><label style={s.label}>Target audience</label><input style={s.input} value={brand.targetAudience || ''} onChange={e => setBrandField('targetAudience')(e.target.value)} /></div>
                <div style={s.field}><label style={s.label}>Avg order value</label><input style={s.input} value={brand.avgOrderValue || ''} onChange={e => setBrandField('avgOrderValue')(e.target.value)} /></div>
              </div>
              <div style={s.field}><label style={s.label}>Key selling points</label><input style={s.input} value={(brand.keySellingPoints || []).join(', ')} onChange={e => setBrand(b => ({ ...b, keySellingPoints: e.target.value.split(',').map(x => x.trim()) }))} /></div>

              <div style={s.field}>
                <label style={s.label}>Brand tone</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                  {TONES.map(t => (
                    <div key={t} onClick={() => setBrandField('brandTone')(t)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: brand.brandTone === t ? '1.5px solid #111' : '1px solid #e0e0e0', background: brand.brandTone === t ? '#111' : 'transparent', color: brand.brandTone === t ? '#fff' : '#666' }}>{t}</div>
                  ))}
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Brand colors <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>(click to edit)</span></label>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 4 }}>
                  {[['primaryColor','Primary'],['accentColor','Accent'],['backgroundColor','Background']].map(([key, lbl]) => (
                    <label key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: brand[key] || '#ccc', border: '1px solid #e0e0e0', overflow: 'hidden', position: 'relative' }}>
                        <input type="color" value={brand[key] || '#ffffff'} onChange={e => setBrandField(key)(e.target.value)} style={{ position: 'absolute', top: -4, left: -4, width: 50, height: 50, border: 'none', cursor: 'pointer', opacity: 0 }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#aaa' }}>{lbl}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Logo URL <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                <input style={s.input} placeholder="https://yourbrand.com/logo.png" value={brand.logoUrl || ''} onChange={e => setBrandField('logoUrl')(e.target.value)} />
                {brand.logoUrl && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#f5f5f5', borderRadius: 6, display: 'inline-block' }}>
                    <img src={brand.logoUrl} alt="Logo preview" style={{ height: 40, width: 'auto', display: 'block' }} onError={e => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              {/* ── HERO IMAGE UPLOAD ── */}
              <div style={s.field}>
                <label style={s.label}>
                  Hero image
                  <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}> — used as the main photo in the email (recommended)</span>
                </label>
                <div style={{ background: '#f9f9f9', border: '1px dashed #d0d0d0', borderRadius: 8, padding: '14px', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
                    Upload a lifestyle or product photo that represents your brand. Workshop shots, product-in-use photos, or brand imagery work best.
                  </div>
                  {/* File upload */}
                  <label style={{ display: 'inline-block', padding: '8px 16px', background: '#111', color: '#fff', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
                    📁 Upload image
                    <input type="file" accept="image/*" onChange={handleHeroImageUpload} style={{ display: 'none' }} />
                  </label>
                  <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10 }}>or paste an image URL below</div>
                  <input
                    style={s.input}
                    placeholder="https://yourbrand.com/hero-photo.jpg"
                    value={brand.uploadedHeroImage && !brand.uploadedHeroImage.startsWith('blob:') ? brand.uploadedHeroImage : ''}
                    onChange={e => setBrand(b => ({ ...b, uploadedHeroImage: e.target.value || null }))}
                  />
                </div>
                {/* Preview */}
                {brand.uploadedHeroImage && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={brand.uploadedHeroImage}
                      alt="Hero preview"
                      style={{ height: 120, width: 'auto', maxWidth: '100%', borderRadius: 8, display: 'block', objectFit: 'cover', border: '1px solid #e0e0e0' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                    <button
                      onClick={() => setBrand(b => ({ ...b, uploadedHeroImage: null }))}
                      style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >✕</button>
                  </div>
                )}
              </div>

              {/* Product images */}
              {images.length > 0 && (
                <div style={s.field}>
                  <label style={s.label}>Product images <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>({selectedImages.length} selected — used in product sections)</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 4 }}>
                    {images.map((img, i) => {
                      const selected = selectedImages.find(x => x.src === img.src)
                      return (
                        <div key={i} onClick={() => setSelectedImages(prev => prev.find(x => x.src === img.src) ? prev.filter(x => x.src !== img.src) : [...prev, img])} style={{ borderRadius: 8, overflow: 'hidden', cursor: 'pointer', position: 'relative', border: selected ? '2px solid #111' : '2px solid transparent', background: '#f5f5f5', aspectRatio: '1' }}>
                          <img src={img.src} alt={img.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display = 'none'} />
                          {selected && <div style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: '#111', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={s.actions}>
                <button style={s.btnSecondary} onClick={() => setStep(1)}>← Back</button>
                <button style={s.btnPrimary} onClick={() => setStep(3)}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div>
              <div style={s.sectionLabel}>What do you want to generate?</div>

              {!mode && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div onClick={() => setMode('flow')} style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: '20px 16px', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>📧</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6 }}>Complete Flow</div>
                      <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>Generate a full email sequence — welcome, post-purchase, or abandoned cart</div>
                    </div>
                    <div onClick={() => setMode('single')} style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: '20px 16px', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>✉️</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6 }}>Single Email</div>
                      <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>Generate one email — welcome, flash sale, win-back, and more</div>
                    </div>
                  </div>
                  <div style={{ ...s.actions, justifyContent: 'flex-start' }}>
                    <button style={s.btnSecondary} onClick={() => setStep(2)}>← Back</button>
                  </div>
                </div>
              )}

              {mode === 'flow' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', padding: 0 }}>← Change</button>
                    <span style={{ fontSize: 13, color: '#888' }}>Complete Flow</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                    {FLOWS.map(f => (
                      <div key={f.type} onClick={() => setFlowType(f.type)} style={{ border: flowType === f.type ? '2px solid #111' : '1px solid #e5e5e5', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', background: flowType === f.type ? '#f9f9f9' : '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ fontSize: 24 }}>{f.icon}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 2 }}>{f.name}</div>
                          <div style={{ fontSize: 12, color: '#888' }}>{f.desc}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#aaa', background: '#f5f5f5', padding: '3px 8px', borderRadius: 10 }}>{f.emails} emails</div>
                      </div>
                    ))}
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Discount code <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                    <input style={s.input} placeholder="e.g. WELCOME20, SAVE15..." value={offer} onChange={e => setOffer(e.target.value)} />
                  </div>
                  <div style={s.actions}>
                    <button style={s.btnSecondary} onClick={() => setMode(null)}>← Back</button>
                    <button style={{ ...s.btnPrimary, ...(!flowType ? { opacity: 0.4, cursor: 'not-allowed' } : {}) }} onClick={() => generate()} disabled={!flowType}>Generate flow →</button>
                  </div>
                </div>
              )}

              {mode === 'single' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', padding: 0 }}>← Change</button>
                    <span style={{ fontSize: 13, color: '#888' }}>Single Email</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
                    {SINGLE_TYPES.map(({ type, icon, desc }) => (
                      <div key={type} onClick={() => setEmailType(type)} style={{ border: emailType === type ? '2px solid #111' : '1px solid #e5e5e5', borderRadius: 10, padding: '14px 12px', cursor: 'pointer', background: emailType === type ? '#f9f9f9' : '#fff' }}>
                        <div style={{ fontSize: 20, marginBottom: 7 }}>{icon}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 3 }}>{type}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Discount code <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                    <input style={s.input} placeholder="e.g. WELCOME20, SAVE15..." value={offer} onChange={e => setOffer(e.target.value)} />
                  </div>
                  <div style={s.actions}>
                    <button style={s.btnSecondary} onClick={() => setMode(null)}>← Back</button>
                    <button style={s.btnPrimary} onClick={() => generate()}>Generate email →</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <div>
              {generating && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  <div style={{ width: 36, height: 36, border: '2px solid #e5e5e5', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                  <div style={{ fontSize: 14, color: '#444', marginBottom: 5 }}>{genStatus || 'Generating...'}</div>
                  <div style={{ fontSize: 12, color: '#aaa' }}>
                    {mode === 'flow' ? 'This takes 60–90 seconds for a full flow' : 'This takes 15–30 seconds'}
                  </div>
                </div>
              )}

              {genError && !generating && (
                <div>
                  <div style={s.errorBox}>{genError}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={s.btnSecondary} onClick={() => setStep(3)}>← Back</button>
                    <button style={s.btnPrimary} onClick={() => generate()}>Retry</button>
                  </div>
                </div>
              )}

              {/* Flow result */}
              {!generating && flowEmails.length > 0 && (
                <div>
                  <div style={s.successBox}>✅ {flowEmails.length} emails generated successfully</div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {flowEmails.map((email, i) => (
                      <button key={i} onClick={() => { setActiveEmailIndex(i); setActiveTab('preview'); setShowEdit(false); if (email.copy) setEditedCopy(email.copy) }} style={{ fontSize: 11, padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontWeight: activeEmailIndex === i ? 700 : 400, background: activeEmailIndex === i ? '#111' : 'transparent', color: activeEmailIndex === i ? '#fff' : '#666', border: activeEmailIndex === i ? 'none' : '1px solid #e0e0e0' }}>
                        Email {i + 1} {email.isPlainText ? '(Plain text)' : ''}
                      </button>
                    ))}
                  </div>

                  {currentEmail && (
                    <div>
                      <div style={{ marginBottom: 12, padding: '10px 14px', background: '#f9f9f9', borderRadius: 8, border: '1px solid #e5e5e5' }}>
                        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>{flowEmails[activeEmailIndex]?.label}</div>
                        <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{flowEmails[activeEmailIndex]?.sendTime}</div>
                        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Subject line</div>
                        <div style={{ fontSize: 13, color: '#111', fontWeight: 600, marginBottom: 6 }}>{currentEmail.subject_line}</div>
                        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Preview text</div>
                        <div style={{ fontSize: 13, color: '#555' }}>{currentEmail.preview_text}</div>
                      </div>

                      <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: 14 }}>
                        {['preview', 'html'].map(t => (
                          <div key={t} onClick={() => setActiveTab(t)} style={{ fontSize: 12, padding: '7px 14px', cursor: 'pointer', color: activeTab === t ? '#111' : '#888', borderBottom: activeTab === t ? '2px solid #111' : '2px solid transparent', fontWeight: activeTab === t ? 700 : 400 }}>
                            {t === 'html' ? 'HTML source' : 'Preview'}
                          </div>
                        ))}
                      </div>

                      {/* Edit panel */}
                      {showEdit && (
                        <EditPanel
                          editedCopy={editedCopy}
                          setEditedCopy={setEditedCopy}
                          onApply={applyEdits}
                          applying={applying}
                        />
                      )}

                      {activeTab === 'preview' && (
                        <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <span style={{ fontSize: 12, color: '#888' }}>Email {activeEmailIndex + 1} — {brand?.brandName}</span>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <button style={{ ...s.btnSecondary, fontSize: 11, padding: '5px 10px', background: showEdit ? '#111' : 'transparent', color: showEdit ? '#fff' : '#666', border: showEdit ? 'none' : '1px solid #e0e0e0' }} onClick={() => setShowEdit(v => !v)}>
                                {showEdit ? '✕ Close edit' : '✏️ Edit'}
                              </button>
                              <button style={{ ...s.btnSecondary, fontSize: 11, padding: '5px 10px' }} onClick={() => copyHtml(currentEmail.html)}>{copied ? 'Copied!' : 'Copy HTML'}</button>
                              <button style={{ ...s.btnSecondary, fontSize: 11, padding: '5px 10px' }} onClick={() => downloadHtml(currentEmail.html, `${brand?.brandName}-email-${activeEmailIndex + 1}.html`)}>Download</button>
                            </div>
                          </div>
                          <iframe srcDoc={currentEmail.html} style={{ width: '100%', height: 600, border: 'none', background: '#fff', display: 'block' }} sandbox="allow-same-origin" />
                        </div>
                      )}

                      {activeTab === 'html' && (
                        <div>
                          <textarea readOnly value={currentEmail.html} style={{ ...s.textarea, height: 400, fontFamily: 'monospace', fontSize: 11, background: '#f9f9f9', color: '#444' }} />
                          <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                            <button style={s.btnSecondary} onClick={() => copyHtml(currentEmail.html)}>{copied ? 'Copied!' : 'Copy HTML'}</button>
                            <button style={s.btnPrimary} onClick={() => downloadHtml(currentEmail.html, `${brand?.brandName}-email-${activeEmailIndex + 1}.html`)}>Download</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
                    <button style={s.btnSecondary} onClick={() => setStep(3)}>← Back</button>
                    <button style={s.btnSecondary} onClick={() => generate()}>Regenerate</button>
                    <button style={s.btnSecondary} onClick={reset}>New brand</button>
                  </div>
                </div>
              )}

              {/* Single email result */}
              {!generating && result && mode === 'single' && (
                <div>
                  <div style={{ ...s.row2, marginBottom: 16 }}>
                    {[['Subject line', result.subject_line], ['Preview text', result.preview_text]].map(([lbl, val]) => (
                      <div key={lbl} style={{ background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>{lbl}</div>
                        <div style={{ fontSize: 13, color: '#111', fontWeight: 600 }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: 14 }}>
                    {['preview', 'html'].map(t => (
                      <div key={t} onClick={() => setActiveTab(t)} style={{ fontSize: 12, padding: '7px 14px', cursor: 'pointer', color: activeTab === t ? '#111' : '#888', borderBottom: activeTab === t ? '2px solid #111' : '2px solid transparent', fontWeight: activeTab === t ? 700 : 400 }}>
                        {t === 'html' ? 'HTML source' : 'Preview'}
                      </div>
                    ))}
                  </div>

                  {/* Edit panel */}
                  {showEdit && (
                    <EditPanel
                      editedCopy={editedCopy}
                      setEditedCopy={setEditedCopy}
                      onApply={applyEdits}
                      applying={applying}
                    />
                  )}

                  {activeTab === 'preview' && (
                    <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#888' }}>{emailType} — {brand?.brandName}</span>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button style={{ ...s.btnSecondary, fontSize: 11, padding: '5px 10px', background: showEdit ? '#111' : 'transparent', color: showEdit ? '#fff' : '#666', border: showEdit ? 'none' : '1px solid #e0e0e0' }} onClick={() => setShowEdit(v => !v)}>
                            {showEdit ? '✕ Close edit' : '✏️ Edit'}
                          </button>
                          <button style={{ ...s.btnSecondary, fontSize: 11, padding: '5px 10px' }} onClick={() => copyHtml(result.html)}>{copied ? 'Copied!' : 'Copy HTML'}</button>
                          <button style={{ ...s.btnSecondary, fontSize: 11, padding: '5px 10px' }} onClick={() => downloadHtml(result.html, `${brand?.brandName}-${emailType}.html`)}>Download .html</button>
                          <button style={{ ...s.btnSecondary, fontSize: 11, padding: '5px 10px' }} onClick={reset}>Start over</button>
                        </div>
                      </div>
                      <iframe srcDoc={result.html} style={{ width: '100%', height: 600, border: 'none', background: '#fff', display: 'block' }} sandbox="allow-same-origin" />
                    </div>
                  )}

                  {activeTab === 'html' && (
                    <div>
                      <textarea readOnly value={result.html} style={{ ...s.textarea, height: 400, fontFamily: 'monospace', fontSize: 11, background: '#f9f9f9', color: '#444' }} />
                      <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                        <button style={s.btnSecondary} onClick={() => copyHtml(result.html)}>{copied ? 'Copied!' : 'Copy HTML'}</button>
                        <button style={s.btnPrimary} onClick={() => downloadHtml(result.html, `${brand?.brandName}-${emailType}.html`)}>Download .html</button>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
                    <button style={s.btnSecondary} onClick={() => setStep(3)}>← Different type</button>
                    <button style={s.btnSecondary} onClick={() => { setResult(null); generate() }}>Regenerate</button>
                    <button style={s.btnSecondary} onClick={reset}>New brand</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
