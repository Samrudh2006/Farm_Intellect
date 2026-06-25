import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePwaStatus } from "@/hooks/usePwaStatus";
import { PHASE1_STORAGE_EVENT, getPhase1Summary } from "@/lib/phase1-storage";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, Download, Globe2, History, Leaf, ShieldCheck, Wifi, WifiOff } from "lucide-react";

const phase1Subscribe = (onStoreChange: () => void) => {
  window.addEventListener(PHASE1_STORAGE_EVENT, onStoreChange);
  window.addEventListener("focus", onStoreChange);
  return () => {
    window.removeEventListener(PHASE1_STORAGE_EVENT, onStoreChange);
    window.removeEventListener("focus", onStoreChange);
  };
};

export const FarmerPhaseOneOverview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isOnline, isInstalled, canInstall, installApp } = usePwaStatus();
  const summary = useSyncExternalStore(phase1Subscribe, getPhase1Summary);

  const phaseCards = useMemo(
    () => [
      {
        title: t('phase1.offline_ready'),
        value: isOnline ? t('phase1.online') : t('phase1.offline'),
        description: isInstalled
          ? t('phase1.installed_desc')
          : canInstall
            ? t('phase1.can_install_desc')
            : t('phase1.sw_desc'),
        icon: isOnline ? Wifi : WifiOff,
      },
      {
        title: t('phase1.crop_plans'),
        value: `${summary.cropPlans}`,
        description: `${summary.openTasks} ${t('phase1.open_reminders')}`,
        icon: Leaf,
      },
      {
        title: t('phase1.field_history'),
        value: `${summary.fieldEvents}`,
        description: t('phase1.timeline_entries'),
        icon: History,
      },
      {
        title: t('phase1.scheme_matches'),
        value: `${summary.schemeMatches}`,
        description: summary.lastWizardRun
          ? `${t('phase1.wizard_updated')} ${new Date(summary.lastWizardRun).toLocaleDateString()}`
          : t('phase1.run_wizard'),
        icon: ShieldCheck,
      },
    ],
    [canInstall, isInstalled, isOnline, summary, t],
  );

  const handleInstall = async () => {
    const result = await installApp();

    if (result === "accepted") {
      toast({
        title: t('phase1.install'),
        description: t('phase1.installed_desc'),
      });
      return;
    }

    if (result === "dismissed") {
      toast({
        title: t('phase1.install'),
        description: t('phase1.can_install_desc'),
      });
      return;
    }

    toast({
      title: t('phase1.install'),
      description: t('phase1.sw_desc'),
    });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              {t('phase1.title')}
            </CardTitle>
            <CardDescription>
              {t('phase1.rollout_desc')}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? t('phase1.network_available') : t('phase1.working_offline')}
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary">
              <Globe2 className="mr-1 h-3.5 w-3.5" />
              {t('phase1.languages_badge')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {phaseCards.map((card) => (
            <div key={card.title} className="rounded-xl border bg-background/80 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <card.icon className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{card.value}</span>
              </div>
              <h3 className="font-semibold">{card.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/farmer/calendar")}>{t('phase1.open_planner')}</Button>
          <Button variant="outline" onClick={() => navigate("/farmer/field-map")}>{t('phase1.review_history')}</Button>
          <Button variant="outline" onClick={() => navigate("/farmer/schemes")}>{t('phase1.run_scheme')}</Button>
          <Button variant="outline" onClick={() => navigate("/farmer/features")}>{t('phase1.open_features')}</Button>
          {canInstall && !isInstalled && (
            <Button variant="secondary" onClick={handleInstall}>
              <Download className="mr-2 h-4 w-4" />
              {t('phase1.install')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
