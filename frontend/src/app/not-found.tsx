// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Страница не найдена</h1>
      <p>Извините, такой страницы не существует.</p>
      <Link href="/">Вернуться на главную</Link>
    </div>
  )
}