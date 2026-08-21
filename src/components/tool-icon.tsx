import {
  ArrowDownAZ, ArrowRightLeft, BadgeCheck, Binary, Braces, CalendarClock, CalendarDays,
  CaseSensitive, CircleCheck, Clock3, CodeXml, Contrast, FileCode2, FileType2, Fingerprint,
  Globe2, Hash, KeyRound, Languages, Link2, ListOrdered, Minimize2, Palette, Pipette, Quote,
  ScanText, ServerCog, Settings2, ShieldCheck, SwatchBook, Timer, Type
} from "lucide-react";
import type { ToolCategory } from "@/lib/tools/types";

export function ToolIcon({ category, slug }: { category: ToolCategory; slug?: string }) {
  const toolIcons: Record<string, React.ElementType> = {
    "json-formatter": Braces, "json-minify": Minimize2, "json-validator": BadgeCheck,
    "json-sort-keys": ArrowDownAZ, "json-escape": Quote, "json-unescape": Quote,
    "json-to-typescript": FileType2, "yaml-formatter": FileCode2, "yaml-validator": CircleCheck,
    "yaml-to-json": ArrowRightLeft, "json-to-yaml": ArrowRightLeft,
    "ini-conf-formatter": Settings2, "ini-conf-validator": CircleCheck,
    "nginx-conf-formatter": ServerCog, "base64-encode": Binary, "base64-decode": Binary,
    "url-encode": Link2, "url-decode": Link2, "html-entity-encode": CodeXml,
    "html-entity-decode": CodeXml, "unicode-escape": Languages, "unicode-unescape": Languages,
    "color-converter": Pipette, "contrast-checker": Contrast, "palette-generator": SwatchBook,
    "jwt-decoder": ScanText, "jwt-expiration-checker": Timer, "jwt-secret-generator": KeyRound,
    "hash-generator": Hash, "hmac-generator": KeyRound, "random-secret-generator": ShieldCheck,
    "unix-to-date": CalendarClock, "date-to-unix": Clock3, "iso-date-formatter": CalendarDays,
    "timezone-display": Globe2, "case-converter": CaseSensitive, "slug-generator": Link2,
    "word-character-counter": ListOrdered, "uuid-generator": Fingerprint,
    "code-formatter": FileCode2, "code-minifier": Minimize2
  };
  const categoryIcons: Record<ToolCategory, React.ElementType> = {
    json: Braces,
    "structured-data": FileCode2,
    encoding: Binary,
    color: Palette,
    jwt: KeyRound,
    hash: Fingerprint,
    datetime: Clock3,
    code: CodeXml,
    text: Type
  };
  const Icon = (slug && toolIcons[slug]) || categoryIcons[category];
  return <Icon />;
}
