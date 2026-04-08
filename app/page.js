'use client'
import { useState } from 'react'

const EMAIL_TYPES = [
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
  errorBox: { background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#b91c1c', marginBottom: 14 },
  infoBox: { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0369a1', marginBottom: 14 },
  successBox: { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#166534', marginBottom: 14 },
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

function Spinner({ label, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 36, height: 36, border: '2px solid #e5e5e5', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      <div style={{ fontSize: 14, color: '#444', marginBottom: 5 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: '#aaa' }}>{sub}</div>}
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
  const [emailType, setEmailType] = useState('Welcome email')
  const [offer, setOffer] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genStatus, setGenStatus] = useState('')
  const [result, setResult] = useState(null)
  const [genError, setGenError] = useState('')
  const [activeTab, setActiveTab] = useState('preview')
  const [copied, setCopied] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])

  async function analyzeUrl() {
    if (!url.trim()) return
    setAnalyzing(true)
    setAnalyzeError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-T
