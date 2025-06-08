export default function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Page de test</h1>
      <p>Si vous voyez cette page, les routes fonctionnent correctement!</p>
      <ul>
        <li><a href="/fr/auth/login">Login</a></li>
        <li><a href="/fr/dashboard/telecom-dashboard">Dashboard</a></li>
        <li><a href="/fr/dashboard/sites">Sites</a></li>
      </ul>
    </div>
  )
} 
