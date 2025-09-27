import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

interface SettingsPageProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  currentViewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  requestCount: number;
  firstRequestTime: number | null;
  onClearCache: () => void;
  onLogout: () => void;
}

const AVAILABLE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];

export default function SettingsPage({
  currentLanguage,
  onLanguageChange,
  currentViewMode,
  onViewModeChange,
  requestCount,
  firstRequestTime,
  onClearCache,
  onLogout,
}: SettingsPageProps) {
  const resetSeconds = useMemo(() => {
    if (!firstRequestTime) return null;
    const resetAt = firstRequestTime + 10 * 60 * 1000;
    const remainingMs = Math.max(0, resetAt - Date.now());
    return Math.ceil(remainingMs / 1000);
  }, [firstRequestTime]);

  const resetText = useMemo(() => {
    if (resetSeconds === null) return "Not rate limited";
    const mins = Math.floor(resetSeconds / 60);
    const secs = resetSeconds % 60;
    return `Resets in ${mins}m ${secs}s`;
  }, [resetSeconds]);

  return (
    <Card role="region" aria-label="Settings">
      <CardHeader>
        <CardTitle level={2} className="dominos-heading-lg">Settings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        <section aria-label="Language preferences" className="space-y-3">
          <h3 className="font-semibold text-gray-800">Language</h3>
          <p className="text-sm text-gray-600">
            Select your preferred language for store menu responses.
          </p>
          <div className="max-w-sm">
            <label htmlFor="language-select" className="sr-only">
              Select language
            </label>
            <select
              id="language-select"
              className={cn(
                "w-full h-11 rounded-md border border-gray-300 bg-white px-3 text-base shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-dominos-blue"
              )}
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              aria-label="Preferred language"
            >
              {AVAILABLE_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500">
            Note: Availability of languages depends on the store API.
          </p>
        </section>

        <section aria-label="Coupon view preferences" className="space-y-3">
          <h3 className="font-semibold text-gray-800">Coupon View Mode</h3>
          <p className="text-sm text-gray-600">
            Choose how coupons are displayed on the deals page.
          </p>
          <div className="flex gap-3">
            <Button
              variant={currentViewMode === "grid" ? "default" : "outline"}
              onClick={() => onViewModeChange("grid")}
              aria-pressed={currentViewMode === "grid"}
              className="h-10"
            >
              Grid
            </Button>
            <Button
              variant={currentViewMode === "list" ? "default" : "outline"}
              onClick={() => onViewModeChange("list")}
              aria-pressed={currentViewMode === "list"}
              className="h-10"
            >
              List
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Your preference is saved locally and used across sessions.
          </p>
        </section>

        <section aria-label="Rate limit status" className="space-y-3">
          <h3 className="font-semibold text-gray-800">Rate Limit</h3>
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Requests in current window: <span className="font-semibold">{requestCount}</span>
              </div>
              <div className="text-sm text-gray-700">
                {resetText}
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Local storage management" className="space-y-3">
          <h3 className="font-semibold text-gray-800">Local Data</h3>
          <p className="text-sm text-gray-600">
            Clear saved store, language, and view preferences from this device.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClearCache}
              className="h-10"
              aria-label="Clear local settings data"
            >
              Clear Local Settings
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            This does not delete your account data; it only clears local preferences.
          </p>
        </section>

        <section aria-label="Authentication" className="space-y-3">
          <h3 className="font-semibold text-gray-800">Authentication</h3>
          <p className="text-sm text-gray-600">
            End your session and return to the login screen.
          </p>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              onClick={onLogout}
              className="h-10"
              aria-label="Log out"
            >
              Log Out
            </Button>
          </div>
        </section>
      </CardContent>

      <CardFooter className="flex justify-end">
        <span className="text-xs text-gray-500">
          Version preferences are stored using your browser's storage.
        </span>
      </CardFooter>
    </Card>
  );
}