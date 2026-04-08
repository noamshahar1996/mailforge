export const metadata = {
  title: 'MailForge — AI Email Designer',
  description: 'Generate high-converting email designs for your brand in seconds.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f5f5f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
