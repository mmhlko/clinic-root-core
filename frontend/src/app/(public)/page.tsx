import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
} from "lucide-react";
import { AppointmentRequestForm } from "@/widgets/public/appointment-request-form";
import { publicServerApi } from "@/features/api/public-server-api";

export const dynamic = "force-dynamic";

export default function Home() {
  return <ClinicHome clinicSlug="demo" />;
}

export async function ClinicHome({ clinicSlug }: { clinicSlug: string }) {
  const [
    clinic,
    locations,
    directions,
    services,
    promotions,
    reviews,
    doctors,
    documents,
    faq,
  ] = await Promise.all([
    publicServerApi.clinic(clinicSlug),
    publicServerApi.locations(clinicSlug),
    publicServerApi.directions(clinicSlug),
    publicServerApi.services(clinicSlug),
    publicServerApi.promotions(clinicSlug),
    publicServerApi.reviews(clinicSlug),
    publicServerApi.doctors(clinicSlug),
    publicServerApi.documents(clinicSlug),
    publicServerApi.faq(clinicSlug),
  ]);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <div className="font-semibold">{clinic.name}</div>
            <div className="text-xs text-muted-foreground">{clinic.slogan}</div>
          </div>
          <nav className="hidden gap-5 text-sm md:flex">
            <a href="#services">Услуги</a>
            <a href="#doctors">Врачи</a>
            <a href="#reviews">Отзывы</a>
            <a href="#faq">FAQ</a>
            <a href="#contacts">Контакты</a>
          </nav>
          <a
            href="#appointment"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Записаться
          </a>
        </div>
      </header>
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_.8fr] lg:py-24">
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Клиника
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
              {clinic.slogan || clinic.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {clinic.shortDescription || clinic.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#appointment"
                className="rounded-md bg-foreground px-5 py-3 font-medium text-background"
              >
                Оставить заявку
              </a>
              {clinic.phone && (
                <a
                  href={`tel:${clinic.phone}`}
                  className="rounded-md border px-5 py-3 font-medium"
                >
                  {clinic.phone}
                </a>
              )}
            </div>
          </div>
          <div className="rounded-3xl border bg-muted/40 p-6">
            <p className="text-sm text-muted-foreground">О клинике</p>
            <p className="mt-3 leading-7">{clinic.description}</p>
            <div className="mt-6 grid gap-3">
              {locations.slice(0, 3).map((l) => (
                <div key={l.id} className="rounded-xl border bg-background p-4">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 size-5" />
                    <div>
                      <div className="font-medium">{l.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {l.address}
                      </div>
                      {l.phone && <div className="mt-1 text-sm">{l.phone}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="services" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle
          title="Услуги"
          text="Основные направления и услуги клиники"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article key={s.id} className="rounded-2xl border p-5">
              <div className="text-sm text-muted-foreground">
                {s.direction?.name}
              </div>
              <h3 className="mt-2 text-lg font-semibold">{s.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {s.description}
              </p>
              {s.price != null && (
                <p className="mt-4 font-semibold">
                  {s.isPriceFrom ? "от " : ""}
                  {s.price} ₽
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
      {promotions.length > 0 && (
        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <SectionTitle title="Акции" text="Актуальные предложения" />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {promotions.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl border bg-background p-5"
                >
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                  {p.newPrice != null && (
                    <p className="mt-4 text-lg font-semibold">{p.newPrice} ₽</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      <section id="doctors" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle title="Врачи" text="Специалисты клиники" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((d) => (
            <article key={d.id} className="rounded-2xl border p-5">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted font-semibold">
                {d.firstName?.[0]}
                {d.lastName?.[0]}
              </div>
              <h3 className="mt-4 font-semibold">
                {d.lastName} {d.firstName}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {d.specialization}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {d.experienceStartYear ? `Опыт с ${d.experienceStartYear}` : ""}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section id="reviews" className="bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionTitle title="Отзывы" text="Что говорят пациенты" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 6).map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border bg-background p-5"
              >
                <div className="font-medium">{r.authorName}</div>
                <div className="mt-1 text-sm">{"★".repeat(r.rating)}</div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {r.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <SectionTitle
          title="Частые вопросы"
          text="Ответы на основные вопросы"
        />
        <div className="mt-8 space-y-3">
          {faq.map((x) => (
            <details key={x.id} className="rounded-xl border p-4">
              <summary className="cursor-pointer font-medium">
                {x.question}
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {x.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
      <section id="appointment" className="bg-muted/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <SectionTitle
              title="Запись на приём"
              text="Оставьте заявку, и администратор свяжется с вами."
            />
            <div className="mt-8 space-y-4">
              {clinic.phone && (
                <a className="flex gap-3" href={`tel:${clinic.phone}`}>
                  <Phone className="size-5" />
                  {clinic.phone}
                </a>
              )}
              {locations[0] && (
                <div className="flex gap-3">
                  <MapPin className="size-5" />
                  {locations[0].address}
                </div>
              )}
            </div>
          </div>
          <AppointmentRequestForm services={services} doctors={doctors} clinicSlug={clinicSlug} />
        </div>
      </section>
      <section id="contacts" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle title="Контакты" text={clinic.email || ""} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {locations.map((l) => (
            <article key={l.id} className="rounded-2xl border p-5">
              <h3 className="font-semibold">{l.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{l.address}</p>
              {l.phone && (
                <a href={`tel:${l.phone}`} className="mt-3 block text-sm">
                  {l.phone}
                </a>
              )}
            </article>
          ))}
        </div>
        {documents.length > 0 && (
          <div className="mt-10">
            <h3 className="font-semibold">Документы</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {documents.map((d) => (
                <a
                  key={d.id}
                  href={d.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm"
                >
                  <FileText className="size-4" />
                  {d.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
          <span>{clinic.name}</span>
          <Link href={`/${clinicSlug}/admin/login`} className="hover:text-foreground">
            Администрация
          </Link>
        </div>
      </footer>
    </main>
  );
}
function SectionTitle({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      {text && <p className="mt-2 text-muted-foreground">{text}</p>}
    </div>
  );
}
