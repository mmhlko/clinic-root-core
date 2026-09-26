import Link from "next/link";
import {
  ArrowRight,
  BriefcaseMedical,
  CalendarClock,
  FileText,
  HelpCircle,
  MessageCircleWarning,
  MessageSquareText,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DashboardOverview,
  DashboardPromotion,
  DashboardRecentRequest,
  DashboardRequestCounts,
  DashboardRequestTrend,
} from "../types/dashboard.types";
import { RequestTrendChart } from "./request-trend-chart";

type DashboardViewProps = {
  overview: DashboardOverview;
  requests: DashboardRequestCounts;
  pendingReviews: number;
  recentRequests: DashboardRecentRequest[];
  promotions: DashboardPromotion[];
  requestTrend: DashboardRequestTrend[];
};

const statusLabels = {
  new: "Новая",
  in_progress: "В работе",
  completed: "Завершена",
  cancelled: "Отменена",
} satisfies Record<DashboardRecentRequest["status"], string>;

const contentItems = [
  { label: "Врачи", key: "doctors", href: "/admin/doctors", icon: Stethoscope },
  { label: "Услуги", key: "services", href: "/admin/services", icon: BriefcaseMedical },
  { label: "Направления", key: "directions", href: "/admin/directions", icon: Sparkles },
  { label: "Акции", key: "promotions", href: "/admin/promotions", icon: MessageSquareText },
  { label: "Отзывы", key: "reviews", href: "/admin/reviews", icon: MessageSquareText },
  { label: "Документы", key: "documents", href: "/admin/documents", icon: FileText },
  { label: "FAQ", key: "faqs", href: "/admin/faq", icon: HelpCircle },
] as const;

function getExpiringPromotionCount(promotions: DashboardPromotion[]) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  return promotions.filter((promotion) => {
    if (!promotion.isActive || !promotion.validTo) {
      return false;
    }

    const validTo = new Date(promotion.validTo);
    return validTo >= start && validTo <= end;
  }).length;
}

function AttentionCard({
  href,
  title,
  count,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  count: number;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full transition-colors group-hover:border-foreground/20 group-hover:bg-muted/50">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        </CardHeader>
        <CardContent className="flex items-end justify-between gap-4">
          <div>
            <div className="text-3xl font-semibold tabular-nums">{count}</div>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="mb-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  );
}

function RequestStatusSummary({ requests }: { requests: DashboardRequestCounts }) {
  const statuses = [
    { label: "Всего", count: requests.total, tone: "text-foreground" },
    { label: "Новые", count: requests.new, tone: "text-sky-700" },
    { label: "В работе", count: requests.inProgress, tone: "text-amber-700" },
    { label: "Завершены", count: requests.completed, tone: "text-emerald-700" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {statuses.map((status) => (
        <Card key={status.label} size="sm" className="flex-row items-center gap-3 px-4 py-3">
          <span className="size-2 shrink-0 rounded-full bg-current opacity-70" />
          <div className="min-w-0">
            <div className={`text-xl font-semibold tabular-nums ${status.tone}`}>{status.count}</div>
            <div className="truncate text-xs text-muted-foreground">{status.label}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function RecentRequests({ requests }: { requests: DashboardRecentRequest[] }) {
  const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Последние заявки</CardTitle>
        <Link href="/admin/requests" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          К списку <span aria-hidden="true">→</span>
        </Link>
      </CardHeader>
      {requests.length === 0 ? (
        <CardContent className="py-8 text-center">
          <p className="font-medium">Заявок пока нет</p>
          <p className="mt-1 text-sm text-muted-foreground">Новые обращения появятся здесь.</p>
        </CardContent>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-y bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Пациент</th>
                  <th className="px-5 py-3 font-medium">Услуга</th>
                  <th className="px-5 py-3 font-medium">Врач</th>
                  <th className="px-5 py-3 font-medium">Статус</th>
                  <th className="px-5 py-3 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-5 py-3">
                      <div className="font-medium">{request.name}</div>
                      <div className="text-xs text-muted-foreground">{request.phone}</div>
                    </td>
                    <td className="px-5 py-3">{request.service?.name ?? "Не указана"}</td>
                    <td className="px-5 py-3">
                      {request.doctor ? `${request.doctor.firstName} ${request.doctor.lastName}` : "Не выбран"}
                    </td>
                    <td className="px-5 py-3">{statusLabels[request.status]}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {dateFormatter.format(new Date(request.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y md:hidden">
            {requests.map((request) => (
              <article key={request.id} className="space-y-2 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{request.name}</h3>
                    <p className="text-sm text-muted-foreground">{request.phone}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium">
                    {statusLabels[request.status]}
                  </span>
                </div>
                <p className="text-sm">{request.service?.name ?? "Услуга не указана"}</p>
                <p className="text-xs text-muted-foreground">
                  {dateFormatter.format(new Date(request.createdAt))}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

export function DashboardView({
  overview,
  requests,
  pendingReviews,
  recentRequests,
  promotions,
  requestTrend,
}: DashboardViewProps) {
  const expiringPromotions = getExpiringPromotionCount(promotions);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <section aria-labelledby="attention-heading" className="space-y-4">
        <div>
          <h2 id="attention-heading" className="text-xl font-semibold">Требует внимания</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ключевые задачи клиники на сегодня</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AttentionCard
            href="/admin/requests"
            title="Новые заявки"
            count={requests.new}
            description="Новые заявки пациентов"
            icon={MessageCircleWarning}
          />
          <AttentionCard
            href="/admin/reviews"
            title="Отзывы на модерации"
            count={pendingReviews}
            description="Ожидают проверки"
            icon={MessageCircleWarning}
          />
          <AttentionCard
            href="/admin/promotions"
            title="Акции"
            count={expiringPromotions}
            description="Заканчиваются в ближайшие 7 дней"
            icon={CalendarClock}
          />
        </div>
      </section>

      <section aria-labelledby="requests-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="requests-heading" className="text-lg font-semibold">Заявки</h2>
          <Link href="/admin/requests" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Все заявки <span aria-hidden="true">→</span>
          </Link>
        </div>
        <RequestStatusSummary requests={requests} />
        <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <RequestTrendChart data={requestTrend} />
          <RecentRequests requests={recentRequests} />
        </div>
      </section>

      <section aria-labelledby="content-heading" className="space-y-4">
        <div>
          <h2 id="content-heading" className="text-lg font-semibold">Состояние контента</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          {contentItems.map(({ icon: Icon, ...item }) => (
            <Link key={item.key} href={item.href} className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Card className="h-full min-h-20 flex-row items-center justify-between gap-3 px-3 py-3 transition-colors group-hover:border-foreground/20 group-hover:bg-muted/50">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs text-muted-foreground">{item.label}</div>
                  <div className="mt-1 font-semibold tabular-nums">{overview[item.key]}</div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
