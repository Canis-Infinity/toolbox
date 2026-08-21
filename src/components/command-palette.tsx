"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { TW, US } from "country-flag-icons/react/3x2";
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem,
  CommandList, CommandSeparator, CommandShortcut
} from "@/components/ui/command";
import { ToolIcon } from "@/components/tool-icon";
import { categories, tools } from "@/lib/tools/registry";
import type { ToolCategory } from "@/lib/tools/types";
import { useLanguagePreference, type AppLocale } from "@/hooks/use-language-preference";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const t = useTranslations("common");
  const tc = useTranslations("category");
  const tn = useTranslations("toolName");
  const { locale, setLocale } = useLanguagePreference();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const selectedTheme = theme === "light" || theme === "dark" ? theme : "system";
  const themeOptions = [
    { value: "light", label: t("lightTheme"), Icon: Sun },
    {
      value: "system",
      label: t("systemThemeCurrent", { theme: t(resolvedTheme === "dark" ? "darkTheme" : "lightTheme") }),
      Icon: Monitor
    },
    { value: "dark", label: t("darkTheme"), Icon: Moon }
  ] as const;
  const languageOptions: Array<{ value: AppLocale; label: string; Flag: typeof TW }> = [
    { value: "zh-TW", label: "繁中", Flag: TW },
    { value: "en", label: "English", Flag: US }
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Command Palette" description="搜尋工具並快速開啟。">
      <Command>
        <CommandInput placeholder={t("searchPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("noSearchResults")}</CommandEmpty>
          <CommandGroup heading={t("language")}>
            {languageOptions.map(({ value, label, Flag }) => (
              <CommandItem
                key={value}
                value={`${t("language")} ${label}`}
                data-checked={locale === value}
                onSelect={() => {
                  setLocale(value);
                  onOpenChange(false);
                }}
              >
                <Flag className="h-3.5 w-5 rounded-[2px]" />
                <span>{label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t("theme")}>
            {themeOptions.map(({ value, label, Icon }) => (
              <CommandItem
                key={value}
                value={`${t("theme")} ${label}`}
                data-checked={selectedTheme === value}
                onSelect={() => {
                  setTheme(value);
                  onOpenChange(false);
                }}
              >
                <Icon />
                <span>{label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          {(Object.keys(categories) as ToolCategory[]).map((category, index) => (
            <div key={category}>
              {index > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={tc(`${category}.name`)}>
                {tools.filter((tool) => tool.category === category).map((tool) => (
                  <CommandItem
                    key={tool.slug}
                    value={`${tool.name} ${tool.aliases.join(" ")} ${tool.description}`}
                    onSelect={() => {
                      router.push(`/tools/${tool.slug}`);
                      onOpenChange(false);
                    }}
                  >
                    <ToolIcon category={tool.category} slug={tool.slug} />
                    <span>{tn(tool.slug)}</span>
                    <CommandShortcut>{tool.actions[0]}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
