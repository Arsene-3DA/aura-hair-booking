import { Languages, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "react-i18next"
import { useCanadianLocalization } from "@/hooks/useCanadianLocalization"
import { useEffect } from "react"

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const { detectedProvince, suggestedLanguage, isLoading } = useCanadianLocalization()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }

  // Afficher la province détectée si disponible
  const getLocationInfo = () => {
    if (isLoading) return "Détection..."
    if (detectedProvince) {
      const provinceNames: Record<string, string> = {
        'QC': 'Québec',
        'ON': 'Ontario',
        'BC': 'C.-B.',
        'AB': 'Alberta',
        'SK': 'Saskatchewan',
        'MB': 'Manitoba',
        'NB': 'N.-B.',
        'NS': 'N.-É.',
        'PE': 'Î.-P.-É.',
        'NL': 'T.-N.-L.'
      }
      return provinceNames[detectedProvince] || detectedProvince
    }
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          aria-label="Changer la langue"
        >
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Changer la langue</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background min-w-[200px]">
        {getLocationInfo() && (
          <div className="px-2 py-1 text-xs text-muted-foreground border-b mb-1 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {getLocationInfo()}
          </div>
        )}
        <DropdownMenuItem 
          onClick={() => changeLanguage('fr')}
          className={i18n.language === 'fr' ? 'bg-accent' : ''}
        >
          🇫🇷 Français
          {suggestedLanguage === 'fr' && detectedProvince && (
            <span className="ml-2 text-xs text-muted-foreground">(suggéré)</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={i18n.language === 'en' ? 'bg-accent' : ''}
        >
          🇬🇧 English
          {suggestedLanguage === 'en' && detectedProvince && (
            <span className="ml-2 text-xs text-muted-foreground">(suggested)</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}