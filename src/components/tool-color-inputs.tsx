"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  ColorPicker, ColorPickerAlphaSlider, ColorPickerArea, ColorPickerContent, ColorPickerEyeDropper,
  ColorPickerFormatSelect, ColorPickerHueSlider, ColorPickerInput, ColorPickerSwatch, ColorPickerTrigger
} from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";

export function ColorInputs({ slug, value, onChange, hasError }: { slug: string; value: string; onChange: (value: string) => void; hasError: boolean }) {
  const t = useTranslations("workbench");
  const [foreground = "", background = ""] = value.split("\n");
  if (slug === "contrast-checker") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <ColorPickerField id="foreground-color" label={t("foregroundColor")} value={foreground} onChange={(next) => onChange(`${next}\n${background}`)} placeholder="#111827" hasError={hasError} />
        <ColorPickerField id="background-color" label={t("backgroundColor")} value={background} onChange={(next) => onChange(`${foreground}\n${next}`)} placeholder="#FFFFFF" hasError={hasError} />
      </div>
    );
  }
  return <ColorPickerField id="color-value" label={t("colorValue")} value={value} onChange={onChange} placeholder="#3B82F6" hasError={hasError} />;
}

function ColorPickerField({ id, label, value, onChange, placeholder, hasError }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder: string; hasError: boolean }) {
  const t = useTranslations("workbench");
  const pickerValue = /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim() : "#000000";
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium" htmlFor={id}>{label}</label>
      <div className="flex gap-2">
        <Input className="min-w-0 flex-1" id={id} aria-invalid={hasError} value={value} onInput={(event) => onChange(event.currentTarget.value)} placeholder={placeholder} />
        <ColorPicker key={pickerValue} defaultValue={pickerValue} onValueChange={onChange}>
          <ColorPickerTrigger aria-label={t("openColorPicker", { name: label })} render={<Button type="button" variant="outline" size="icon" />}>
            <ColorPickerSwatch />
          </ColorPickerTrigger>
          <ColorPickerContent align="end">
            <ColorPickerArea />
            <div className="flex items-center gap-2"><ColorPickerEyeDropper /><ColorPickerHueSlider className="flex-1" /></div>
            <ColorPickerAlphaSlider />
            <div className="flex gap-2"><ColorPickerFormatSelect /><ColorPickerInput /></div>
          </ColorPickerContent>
        </ColorPicker>
      </div>
    </div>
  );
}
