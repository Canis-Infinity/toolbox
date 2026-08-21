"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { TW, US } from "country-flag-icons/react/3x2";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguagePreference, type AppLocale } from "@/hooks/use-language-preference";

const languages: Array<{ value: AppLocale; label: string; Flag: typeof TW }> = [
  { value: "zh-TW", label: "繁中", Flag: TW },
  { value: "en", label: "English", Flag: US }
];

function LanguageSelect({ className }: { className?: string }) {
  const t = useTranslations("common");
  const { locale, setLocale } = useLanguagePreference();
  const current = languages.find((item) => item.value === locale) ?? languages[0];

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as AppLocale)}>
      <SelectTrigger aria-label={t("language")} size="sm" className={className}>
        <SelectValue>
          <current.Flag className="h-3.5 w-5 rounded-[2px]" />
          <span>{current.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>
        {languages.map(({ value, label, Flag }) => (
          <SelectItem key={value} value={value}>
            <Flag className="h-3.5 w-5 rounded-[2px]" />
            <span>{label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function useThemeOptions() {
  const t = useTranslations("common");
  const { theme, resolvedTheme, setTheme } = useTheme();
  const selectedTheme = theme === "light" || theme === "dark" ? theme : "system";
  const isDark = resolvedTheme === "dark";
  const options = [
    { value: "light", label: t("lightTheme"), detail: undefined, Icon: Sun },
    {
      value: "system",
      label: t("systemTheme"),
      detail: t(isDark ? "darkTheme" : "lightTheme"),
      Icon: Monitor
    },
    { value: "dark", label: t("darkTheme"), detail: undefined, Icon: Moon }
  ] as const;
  return { isDark, options, selectedTheme, setTheme };
}

export function DesktopPreferences() {
  const t = useTranslations("common");
  const { isDark, options, selectedTheme, setTheme } = useThemeOptions();
  const ThemeIcon = selectedTheme === "system" ? Monitor : isDark ? Moon : Sun;

  return (
    <div className="hidden items-center gap-2 md:flex">
      <LanguageSelect className="w-36" />
      <Popover>
        <PopoverTrigger render={<Button aria-label={t("theme")} size="icon-sm" variant="ghost" />}>
          <ThemeIcon />
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="w-52 gap-1 p-1">
          {options.map(({ value, label, detail, Icon }) => (
            <button
              key={value}
              type="button"
              className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setTheme(value)}
            >
              <Icon className="size-4" />
              <span>{label}{detail ? `（${detail}）` : ""}</span>
              {selectedTheme === value && <Check className="ml-auto size-4" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function MobileSidebarPreferences() {
  const t = useTranslations("common");
  const { options, selectedTheme, setTheme } = useThemeOptions();

  return (
    <div className="grid gap-3 px-2 py-1 md:hidden">
      <div className="grid gap-1.5">
        <span className="text-xs font-medium text-sidebar-foreground/70">{t("language")}</span>
        <LanguageSelect className="w-full bg-sidebar" />
      </div>
      <div className="grid gap-1.5">
        <span className="text-xs font-medium text-sidebar-foreground/70">{t("theme")}</span>
        <Tabs value={selectedTheme} onValueChange={setTheme}>
          <TabsList className="grid w-full grid-cols-3">
            {options.map(({ value, label, detail, Icon }) => (
              <TabsTrigger key={value} value={value} aria-label={detail ? `${label}（${detail}）` : label} className="min-w-0 gap-1 px-1 text-xs">
                <Icon className="size-3.5 shrink-0" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
