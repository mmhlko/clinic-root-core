import { notFound } from 'next/navigation';

export default function CatchAll() {
  notFound(); // Автоматически отобразит frontend/src/app/(admin)/admin/(dashboard)/not-found.tsx
}