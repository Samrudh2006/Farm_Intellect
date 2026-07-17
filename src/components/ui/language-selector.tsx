import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage, Language, languageOptions } from "@/contexts/LanguageContext";

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Select value={language} onValueChange={(value: Language) => { void setLanguage(value); }}>
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <SelectValue placeholder={t('common.select_language')} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languageOptions.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-muted-foreground">({lang.name})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};