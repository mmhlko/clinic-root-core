"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ClinicFeature,
  ClinicLocation,
  ClinicSocialLink,
  ClinicStatistic,
} from "@/features/content/types/content.types";
import { contentClientApi } from "@/features/content/api/content-client-api";
import {
  CollectionTextArea,
  CollectionTextField,
  SettingsCollectionManager,
} from "./settings-collection-manager";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const socialPlatforms = [
  { value: "vk", label: "ВКонтакте" },
  { value: "telegram", label: "Telegram" },
  { value: "max", label: "MAX" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "youtube", label: "YouTube" },
  { value: "rutube", label: "Rutube" },
];

export function BranchesSettings({ locations, canManage }: {
  locations: ClinicLocation[];
  canManage: boolean;
}) {
  if (!canManage) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardContent className="space-y-1 py-4">
              <h3 className="font-medium">{location.name}</h3>
              <p className="text-sm text-muted-foreground">{location.address}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <SettingsCollectionManager<ClinicLocation>
      title="Филиалы"
      description="Управляйте адресами и контактами клиники."
      emptyMessage="Филиалы еще не добавлены."
      items={locations}
      getSearchText={(item) =>
        `${item.name} ${item.address} ${item.phone ?? ""} ${item.email ?? ""}`
      }
      createItem={(sortOrder) => ({
        id: `new-${crypto.randomUUID()}`,
        name: "",
        address: "",
        phone: null,
        email: null,
        workingHours: null,
        mapUrl: null,
        description: null,
        sortOrder,
        isActive: true,
      })}
      renderSummary={(item) => (
        <>
          <h4 className="font-medium">{item.name}</h4>
          <p className="text-sm text-muted-foreground">{item.address}</p>
          {item.phone && (
            <p className="text-sm text-muted-foreground">{item.phone}</p>
          )}
        </>
      )}
      renderFields={(item, update) => (
        <>
          <CollectionTextField
            label="Название"
            value={item.name}
            required
            onChange={(name) => update({ name })}
          />
          <CollectionTextField
            label="Адрес"
            value={item.address}
            required
            onChange={(address) => update({ address })}
          />
          <CollectionTextField
            label="Телефон"
            type="tel"
            value={item.phone ?? ""}
            onChange={(phone) => update({ phone: phone || null })}
          />
          <CollectionTextField
            label="Email"
            type="email"
            value={item.email ?? ""}
            onChange={(email) => update({ email: email || null })}
          />
          <CollectionTextField
            label="Ссылка на карту"
            type="url"
            value={item.mapUrl ?? ""}
            onChange={(mapUrl) => update({ mapUrl: mapUrl || null })}
          />
          <CollectionTextArea
            label="Описание"
            value={item.description ?? ""}
            onChange={(description) =>
              update({ description: description || null })
            }
          />
        </>
      )}
      saveItem={async (current, item) => {
        if (item.id.startsWith("new-")) {
          const body: Omit<ClinicLocation, "id"> = {
            name: item.name,
            address: item.address,
            phone: item.phone,
            email: item.email,
            workingHours: item.workingHours,
            mapUrl: item.mapUrl,
            description: item.description,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
          };
          const created = await contentClientApi.createLocation(body);
          return [...current, created];
        }
        const { id, ...body } = item;
        const updated = await contentClientApi.updateLocation(id, body);
        return current.map((location) =>
          location.id === updated.id ? updated : location,
        );
      }}
      setActive={async (current, item, isActive) => {
        const updated = await contentClientApi.setLocationActive(
          item.id,
          isActive,
        );
        return current.map((location) =>
          location.id === updated.id ? updated : location,
        );
      }}
      deleteItem={async (current, item) => {
        await contentClientApi.deleteLocation(item.id);
        return current.filter((location) => location.id !== item.id);
      }}
      reorderItems={async (ordered) => {
        const result = await contentClientApi.reorderLocations(
          ordered.map((item) => item.id),
        );
        if (!result.success) throw new Error("Не удалось сохранить порядок филиалов.");
      }}
    />
  );
}

export function BenefitsSettings({ features }: { features: ClinicFeature[] }) {
  const persist = async (items: ClinicFeature[]) => {
    const payload = items.map(({ id, ...item }) => ({
      ...item,
      ...(id.startsWith("new-") ? {} : { id }),
    }));
    return contentClientApi.saveFeatures(payload);
  };

  return (
    <SettingsCollectionManager<ClinicFeature>
      title="Преимущества"
      description="Добавляйте преимущества и управляйте их отображением на сайте."
      emptyMessage="Преимущества еще не добавлены."
      items={features}
      getSearchText={(item) =>
        `${item.title} ${item.description ?? ""}`
      }
      createItem={(sortOrder) => ({
        id: `new-${crypto.randomUUID()}`,
        title: "",
        description: null,
        imageUrl: null,
        icon: null,
        sortOrder,
        isActive: true,
      })}
      renderSummary={(item) => (
        <>
          <h4 className="font-medium">{item.title}</h4>
          {item.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
        </>
      )}
      renderFields={(item, update) => (
        <>
          <CollectionTextField
            label="Название"
            value={item.title}
            required
            onChange={(title) => update({ title })}
          />
          <CollectionTextArea
            label="Описание"
            value={item.description ?? ""}
            onChange={(description) =>
              update({ description: description || null })
            }
          />
          {/* <CollectionTextField
            label="Ссылка на изображение"
            type="url"
            value={item.imageUrl ?? ""}
            onChange={(imageUrl) =>
              update({ imageUrl: imageUrl || null })
            }
          /> */}
          {/* <CollectionTextField
            label="Иконка"
            value={item.icon ?? ""}
            onChange={(icon) => update({ icon: icon || null })}
          /> */}
        </>
      )}
      saveItem={async (current, item) =>
        persist(
          item.id.startsWith("new-")
            ? [...current, item]
            : current.map((feature) =>
                feature.id === item.id ? item : feature,
              ),
        )
      }
      setActive={(current, item, isActive) =>
        persist(
          current.map((feature) =>
            feature.id === item.id ? { ...feature, isActive } : feature,
          ),
        )
      }
      deleteItem={(current, item) =>
        persist(current.filter((feature) => feature.id !== item.id))
      }
      reorderItems={async (ordered) => {
        await persist(ordered);
      }}
    />
  );
}

export function SocialsSettings({ socialLinks }: {
  socialLinks: ClinicSocialLink[];
}) {
  const persist = async (items: ClinicSocialLink[]) => {
    const payload = items.map(({ id, ...item }) => ({
      ...item,
      ...(id.startsWith("new-") ? {} : { id }),
    }));
    return contentClientApi.saveSocialLinks(payload);
  };

  return (
    <SettingsCollectionManager<ClinicSocialLink>
      title="Социальные сети"
      description="Управляйте ссылками и их отображением на сайте."
      emptyMessage="Ссылки на социальные сети еще не добавлены."
      items={socialLinks}
      getSearchText={(item) =>
        `${socialPlatforms.find((platform) => platform.value === item.platform)?.label ?? item.platform} ${item.url}`
      }
      createItem={(sortOrder) => ({
        id: `new-${crypto.randomUUID()}`,
        platform: "vk",
        url: "",
        sortOrder,
        isActive: true,
      })}
      renderSummary={(item) => (
        <>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h4 className="font-medium">
              {socialPlatforms.find(
                (platform) => platform.value === item.platform,
              )?.label ?? item.platform}
            </h4>
            <Badge variant={"link"}>
              <Link href={item.url} target="_blank" className="block ">
                {item.url}
              </Link>
            </Badge>
          </div>
        </>
      )}
      renderFields={(item, update) => (
        <>
          <div className="space-y-2">
            <Label htmlFor="social-platform">Платформа</Label>
            <Select<string>
              value={item.platform}
              onValueChange={(platform) => {
                if (platform) update({ platform });
              }}
              items={socialPlatforms}
            >
              <SelectTrigger id="social-platform" className="w-full">
                <SelectValue placeholder="Выберите платформу" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Социальная сеть</SelectLabel>
                  {socialPlatforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <CollectionTextField
            label="Ссылка"
            type="url"
            value={item.url}
            required
            onChange={(url) => update({ url })}
          />
        </>
      )}
      saveItem={(current, item) =>
        persist(
          item.id.startsWith("new-")
            ? [...current, item]
            : current.map((social) => (social.id === item.id ? item : social)),
        )
      }
      setActive={(current, item, isActive) =>
        persist(
          current.map((social) =>
            social.id === item.id ? { ...social, isActive } : social,
          ),
        )
      }
      deleteItem={(current, item) =>
        persist(current.filter((social) => social.id !== item.id))
      }
      reorderItems={async (ordered) => {
        await persist(ordered);
      }}
    />
  );
}

export function StatisticsSettings({ statistics }: {
  statistics: ClinicStatistic[];
}) {
  const persist = async (items: ClinicStatistic[]) => {
    const payload = items.map(({ id, ...item }) => ({
      ...item,
      ...(id.startsWith("new-") ? {} : { id }),
    }));
    return contentClientApi.saveStatistics(payload);
  };

  return (
    <SettingsCollectionManager<ClinicStatistic>
      title="Статистика"
      description="Управляйте показателями, отображаемыми на сайте."
      emptyMessage="Показатели статистики еще не добавлены."
      items={statistics}
      getSearchText={(item) => `${item.value} ${item.label}`}
      createItem={(sortOrder) => ({
        id: `new-${crypto.randomUUID()}`,
        value: "",
        label: "",
        sortOrder,
        isActive: true,
      })}
      renderSummary={(item) => (
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-lg font-semibold">{item.value}</span>
          <span className="text-sm text-muted-foreground">{item.label}</span>
        </div>
      )}
      renderFields={(item, update) => (
        <>
          <CollectionTextField
            label="Значение"
            value={item.value}
            required
            onChange={(value) => update({ value })}
          />
          <CollectionTextField
            label="Подпись"
            value={item.label}
            required
            onChange={(label) => update({ label })}
          />
        </>
      )}
      saveItem={(current, item) =>
        persist(
          item.id.startsWith("new-")
            ? [...current, item]
            : current.map((statistic) =>
                statistic.id === item.id ? item : statistic,
              ),
        )
      }
      setActive={(current, item, isActive) =>
        persist(
          current.map((statistic) =>
            statistic.id === item.id ? { ...statistic, isActive } : statistic,
          ),
        )
      }
      deleteItem={(current, item) =>
        persist(current.filter((statistic) => statistic.id !== item.id))
      }
      reorderItems={async (ordered) => {
        await persist(ordered);
      }}
    />
  );
}
