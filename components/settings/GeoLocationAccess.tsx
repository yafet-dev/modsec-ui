"use client";

import { useState, useMemo, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useConfirmation } from "@/components/providers/ConfirmationProvider";
import { ALL_COUNTRIES } from "@/lib/constants/countries";
import { useGeoAccess, useSaveGeoAccess } from "@/lib/api/hooks/useGeoAccess";

type FilterMode = "allow-all" | "allow-only" | "ban-specific";

interface GeoLocationAccessProps {
  domains: string[];
  organizationId: string | null;
}

function Section({
  title,
  description,
  right,
  children,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-black/5 dark:border-white/10">
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          ) : null}
        </div>
        {right ? <div className="pt-0.5">{right}</div> : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

function RadioCard({
  checked,
  title,
  subtitle,
  onSelect,
}: {
  checked: boolean;
  title: string;
  subtitle: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full text-left rounded-2xl border transition-all",
        "px-4 py-4 flex items-start gap-4",
        "bg-white/70 dark:bg-white/5 backdrop-blur",
        checked
          ? "border-zinc-900/20 dark:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
          : "border-black/5 dark:border-white/10 hover:border-zinc-900/15 dark:hover:border-white/15",
      ].join(" ")}
    >
      <span
        className={[
          "mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
          checked
            ? "border-zinc-900 dark:border-zinc-100"
            : "border-zinc-300 dark:border-zinc-600",
        ].join(" ")}
        aria-hidden="true"
      >
        <span
          className={[
            "h-2.5 w-2.5 rounded-full transition-opacity",
            checked ? "bg-zinc-900 dark:bg-zinc-100 opacity-100" : "opacity-0",
          ].join(" ")}
        />
      </span>

      <span className="flex-1">
        <span className="block text-[14px] font-semibold tracking-[-0.01em] text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
        <span className="block mt-1 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </span>
      </span>
    </button>
  );
}

function Chip({
  selected,
  label,
  left,
  onToggle,
}: {
  selected: boolean;
  label: string;
  left?: React.ReactNode;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "group w-full rounded-2xl border px-3 py-3 transition-all",
        "flex items-center gap-3",
        selected
          ? "bg-white/70 dark:bg-white/10 backdrop-blur"
          : "bg-white/70 dark:bg-white/5 backdrop-blur",
        selected
          ? "border-zinc-900/20 dark:border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
          : "border-black/5 dark:border-white/10 hover:border-zinc-900/15 dark:hover:border-white/15",
      ].join(" ")}
    >
      <span
        className={[
          "h-5 w-5 rounded-md border flex items-center justify-center",
          selected
            ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100"
            : "border-zinc-300 dark:border-zinc-600 bg-transparent",
        ].join(" ")}
        aria-hidden="true"
      >
        <svg
          className={[
            "h-3.5 w-3.5",
            selected ? "text-white dark:text-zinc-900" : "text-transparent",
          ].join(" ")}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 010 1.42l-7.4 7.4a1 1 0 01-1.42 0l-3.3-3.3a1 1 0 011.42-1.42l2.59 2.59 6.69-6.69a1 1 0 011.42 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>

      {left ? <span className="shrink-0">{left}</span> : null}

      <span className={[
        "text-[13px] font-medium",
        selected 
          ? "text-zinc-900 dark:text-zinc-50" 
          : "text-zinc-900 dark:text-zinc-100"
      ].join(" ")}>
        {label}
      </span>
    </button>
  );
}

export function GeoLocationAccess({ domains, organizationId }: GeoLocationAccessProps) {
  const { confirm } = useConfirmation();
  const { data: geoAccessData, isLoading: isLoadingSettings } = useGeoAccess(organizationId);
  const saveMutation = useSaveGeoAccess();

  const [filterMode, setFilterMode] = useState<FilterMode>("allow-all");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayCount, setDisplayCount] = useState<number>(40);

  // Selected countries only (for the top section)
  const selectedCountryEntries = useMemo(() => {
    if (!ALL_COUNTRIES?.length || selectedCountries.length === 0) return [];
    const codeToCountry = new Map(ALL_COUNTRIES.map((c) => [c.code, c]));
    return selectedCountries
      .map((code) => codeToCountry.get(code))
      .filter((c): c is { code: string; name: string } => !!c)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCountries]);

  // Main list: only countries that are NOT selected (so selected live only in the top section)
  const filteredCountries = useMemo(() => {
    if (!ALL_COUNTRIES || ALL_COUNTRIES.length === 0) {
      console.warn("ALL_COUNTRIES is empty or not loaded");
      return [];
    }
    const selectedSet = new Set(selectedCountries);
    let countries = ALL_COUNTRIES.filter((c) => !selectedSet.has(c.code));
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      countries = countries.filter(
        (c) => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)
      );
    }
    return countries.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedCountries]);

  const displayedCountries = filteredCountries.slice(0, displayCount);
  const hasMore = filteredCountries.length > displayCount;

  // Reset display count when search query changes
  useEffect(() => {
    setDisplayCount(40);
  }, [searchQuery]);

  // Clear selected countries when switching to allow-all mode
  useEffect(() => {
    if (filterMode === "allow-all") {
      setSelectedCountries([]);
    }
  }, [filterMode]);

  // Load existing settings when domain changes or settings are loaded
  useEffect(() => {
    // Wait for data to be loaded
    if (isLoadingSettings || !organizationId) {
      return;
    }

    // If we have data, load settings
    if (geoAccessData && geoAccessData.settings) {
      const normalizedDomain = selectedDomain === "All" ? "*" : selectedDomain.toLowerCase().trim();
      
      console.log("🔍 Looking for settings:", {
        selectedDomain,
        normalizedDomain,
        allSettings: geoAccessData.settings,
        settingsCount: geoAccessData.settings.length
      });

      // Try exact match first
      let existingSetting = geoAccessData.settings.find(
        (s) => s.domain === normalizedDomain
      );

      // If not found, try case-insensitive match
      if (!existingSetting) {
        existingSetting = geoAccessData.settings.find(
          (s) => s.domain.toLowerCase().trim() === normalizedDomain
        );
      }

      if (existingSetting) {
        console.log("✅ Loading existing settings:", {
          domain: existingSetting.domain,
          mode: existingSetting.mode,
          allowed: existingSetting.allowedCountries,
          denied: existingSetting.deniedCountries
        });
        setFilterMode(existingSetting.mode);
        if (existingSetting.mode === "allow-only") {
          setSelectedCountries([...existingSetting.allowedCountries]);
        } else if (existingSetting.mode === "ban-specific") {
          setSelectedCountries([...existingSetting.deniedCountries]);
        } else {
          setSelectedCountries([]);
        }
      } else {
        // No existing settings for this domain
        console.log("❌ No existing settings found for domain:", normalizedDomain, "Available domains:", geoAccessData.settings.map(s => s.domain));
        setFilterMode("allow-all");
        setSelectedCountries([]);
      }
    } else {
      // No data yet - use defaults
      console.log("⏳ No geo access data yet, using defaults");
      setFilterMode("allow-all");
      setSelectedCountries([]);
    }
  }, [selectedDomain, geoAccessData, organizationId, isLoadingSettings]);

  const handleCountryToggle = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );
  };

  const handleSelectAll = () => {
    const filteredCodes = filteredCountries.map((c) => c.code);
    if (filteredCodes.length === 0) return;
    setSelectedCountries((prev) => [...new Set([...prev, ...filteredCodes])]);
  };


  const getStatusText = () => {
    if (filterMode === "allow-all") return "All countries are allowed";
    if (filterMode === "allow-only") {
      return `Only ${selectedCountries.length} countr${
        selectedCountries.length === 1 ? "y is" : "ies are"
      } allowed`;
    }
    return `${selectedCountries.length} countr${
      selectedCountries.length === 1 ? "y is" : "ies are"
    } banned`;
  };

  const handleSave = async () => {
    if (
      (filterMode === "allow-only" || filterMode === "ban-specific") &&
      selectedCountries.length === 0
    ) {
      toast.error(
        `Please select at least one country to ${
          filterMode === "allow-only" ? "allow" : "ban"
        }`
      );
      return;
    }

    const confirmed = await confirm({
      title: "Save Geo-Location Settings",
      message:
        filterMode === "allow-all"
          ? "This will allow all countries to access your domains. Continue?"
          : filterMode === "allow-only"
          ? `This will allow only ${selectedCountries.length} selected countr${
              selectedCountries.length === 1 ? "y" : "ies"
            } to access your domains. All other countries will be blocked. Continue?`
          : `This will ban ${selectedCountries.length} selected countr${
              selectedCountries.length === 1 ? "y" : "ies"
            } from accessing your domains. Continue?`,
      confirmText: "Save",
      cancelText: "Cancel",
      variant: "info",
    });

    if (!confirmed) return;

    if (!organizationId) {
      toast.error("Organization ID is required");
      return;
    }

    // Prepare data according to mode: ensure no intersections
    let allowedCountries: string[] = [];
    let deniedCountries: string[] = [];

    if (filterMode === "allow-only") {
      allowedCountries = selectedCountries;
      deniedCountries = [];
    } else if (filterMode === "ban-specific") {
      allowedCountries = [];
      deniedCountries = selectedCountries;
    } else {
      // allow-all: both empty
      allowedCountries = [];
      deniedCountries = [];
    }

    // Call API to save settings
    saveMutation.mutate({
      organizationId,
      data: {
        domain: selectedDomain,
        mode: filterMode,
        allowedCountries,
        deniedCountries,
      },
    });
  };

  const showCountries = filterMode === "allow-only" || filterMode === "ban-specific";
  const isSaving = saveMutation.isPending;

  // Debug: Log current state
  useEffect(() => {
    if (geoAccessData) {
      console.log("📊 Current Geo Access State:", {
        filterMode,
        selectedCountries,
        selectedDomain,
        geoAccessData: geoAccessData.settings
      });
    }
  }, [filterMode, selectedCountries, selectedDomain, geoAccessData]);

  // Show loading state
  if (isLoadingSettings) {
    return (
      <div className="space-y-7">
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-900/20 border-t-zinc-900 dark:border-white/20 dark:border-t-white" />
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Loading geo access settings...
          </p>
        </div>
      </div>
    );
  }

  // Show error if no organization
  if (!organizationId) {
    return (
      <div className="space-y-7">
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-10 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No organization found. Please ensure you are a member of an organization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Page Header (Apple-ish) */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-100">
            Geo Location Access
          </h2>
          <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
            Control access to your domains by visitor region.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <div className="rounded-full border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1.5 text-[12px] text-zinc-600 dark:text-zinc-300">
            {selectedDomain === "All" ? "All Domains" : selectedDomain}
          </div>
          <div className="rounded-full border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1.5 text-[12px] text-zinc-600 dark:text-zinc-300">
            {getStatusText()}
          </div>
        </div>
      </div>

      {/* Domain */}
      <Section
        title="Apply to Domain"
        description="Choose which domain these geo rules apply to."
      >
        <div className="max-w-md">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className={[
              "w-full rounded-2xl px-4 py-3 text-[14px]",
              "border border-black/5 dark:border-white/10",
              "bg-white/70 dark:bg-zinc-800 backdrop-blur-xl",
              "text-zinc-900 dark:text-zinc-100",
              "outline-none focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-white/15",
              "transition-shadow",
            ].join(" ")}
          >
            <option value="All">All Domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </Section>

      {/* Filter Mode */}
      <Section
        title="Filter Mode"
        description="Pick how geo rules should behave."
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <RadioCard
            checked={filterMode === "allow-all"}
            title="Allow All Countries"
            subtitle="No geographic restrictions."
            onSelect={() => {
              setFilterMode("allow-all");
              setSelectedCountries([]);
              setSearchQuery("");
            }}
          />
          <RadioCard
            checked={filterMode === "allow-only"}
            title="Allow Only Selected"
            subtitle="Block everyone except the countries you choose."
            onSelect={() => {
              setFilterMode("allow-only");
              setSelectedCountries([]);
              setSearchQuery("");
            }}
          />
          <RadioCard
            checked={filterMode === "ban-specific"}
            title="Ban Specific"
            subtitle="Allow everyone except the countries you ban."
            onSelect={() => {
              setFilterMode("ban-specific");
              setSelectedCountries([]);
              setSearchQuery("");
            }}
          />
        </div>
      </Section>

      {/* Selected countries (top section – only selected go here) */}
      {showCountries && selectedCountryEntries.length > 0 && (
        <Section
          title={filterMode === "allow-only" ? "Selected allowed countries" : "Selected banned countries"}
          description={
            filterMode === "allow-only"
              ? "Only these countries are allowed. Click to remove."
              : "These countries are banned. Click to remove."
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {selectedCountryEntries.map((country) => (
              <Chip
                key={country.code}
                selected={true}
                label={country.name}
                left={
                  <ReactCountryFlag
                    countryCode={country.code}
                    svg
                    style={{ width: "22px", height: "22px", borderRadius: 6 }}
                    title={country.name}
                  />
                }
                onToggle={() => handleCountryToggle(country.code)}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Add countries (main list – only non-selected; selecting moves them to the section above) */}
      {showCountries && (
        <Section
          title={filterMode === "allow-only" ? "Add allowed countries" : "Add banned countries"}
          description={
            filterMode === "allow-only"
              ? "Search and select countries to allow. Selected countries appear above."
              : "Search and select countries to ban. Selected countries appear above."
          }
          right={
            filteredCountries.length > 0 ? (
              <Button onClick={handleSelectAll} variant="outline" size="sm">
                Select All ({filteredCountries.length})
              </Button>
            ) : null
          }
        >
          <div className="space-y-4">
            <div className="max-w-xl">
              <Input
                type="text"
                placeholder="Search by name or code…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={[
                  "w-full rounded-2xl",
                  "bg-white/70 dark:bg-white/5 backdrop-blur-xl",
                  "border border-black/5 dark:border-white/10",
                  "focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-white/15",
                ].join(" ")}
              />
            </div>

            {filteredCountries.length === 0 ? (
              <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-6">
                <p className="text-[13px] text-zinc-600 dark:text-zinc-300">
                  {selectedCountries.length > 0
                    ? searchQuery.trim()
                      ? `No more countries match "${searchQuery}".`
                      : "All countries are already selected. Remove some above to add others here."
                    : `No countries found for "${searchQuery}".`}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {displayedCountries.map((country) => (
                    <Chip
                      key={country.code}
                      selected={false}
                      label={country.name}
                      left={
                        <ReactCountryFlag
                          countryCode={country.code}
                          svg
                          style={{ width: "22px", height: "22px", borderRadius: 6 }}
                          title={country.name}
                        />
                      }
                      onToggle={() => handleCountryToggle(country.code)}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={() => setDisplayCount((prev) => Math.min(prev + 40, filteredCountries.length))}
                      variant="outline"
                      size="md"
                    >
                      Load More ({filteredCountries.length - displayCount} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Section>
      )}

      {/* Status / Info */}
      {filterMode === "allow-all" ? (
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-9 w-9 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur flex items-center justify-center">
              <svg
                className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div>
              <div className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
                All Countries Allowed
              </div>
              <div className="mt-1 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">
                No geographic restrictions are currently applied.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-9 w-9 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur flex items-center justify-center">
              <svg
                className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
                Review before saving
              </div>
              <div className="mt-1 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">
                You are applying <span className="font-medium">{getStatusText()}</span> to{" "}
                <span className="font-medium">
                  {selectedDomain === "All" ? "All Domains" : selectedDomain}
                </span>
                .
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        <Button 
          onClick={handleSave} 
          variant="primary" 
          size="md"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Footer tip */}
      <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5">
        <p className="text-[12px] leading-5 text-zinc-500 dark:text-zinc-400">
          Geo rules control access based on visitor location. You can allow all, allow only specific
          regions, or block specific regions while allowing the rest.
        </p>
      </div>
    </div>
  );
}
