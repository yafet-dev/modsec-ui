"use client";

import { useState, useMemo } from "react";
import ReactCountryFlag from "react-country-flag";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useConfirmation } from "@/components/providers/ConfirmationProvider";

// Mock data - List of countries with their codes
const allCountries = [
  { code: "ET", name: "Ethiopia" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "GR", name: "Greece" },
  { code: "RO", name: "Romania" },
  { code: "HU", name: "Hungary" },
  { code: "BG", name: "Bulgaria" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "ZA", name: "South Africa" },
  { code: "EG", name: "Egypt" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "RU", name: "Russia" },
  { code: "TR", name: "Turkey" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
];

type FilterMode = "allow-all" | "allow-only" | "ban-specific";

interface GeoLocationAccessProps {
  domains: string[];
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

export function GeoLocationAccess({ domains }: GeoLocationAccessProps) {
  const { confirm } = useConfirmation();

  const [filterMode, setFilterMode] = useState<FilterMode>("allow-all");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return allCountries;
    const query = searchQuery.toLowerCase();
    return allCountries.filter(
      (c) => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleCountryToggle = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );
  };

  const handleSelectAll = () => {
    const filteredCodes = filteredCountries.map((c) => c.code);
    const allFilteredSelected = filteredCodes.every((c) => selectedCountries.includes(c));

    if (allFilteredSelected) {
      setSelectedCountries(selectedCountries.filter((c) => !filteredCodes.includes(c)));
    } else {
      const next = [
        ...selectedCountries.filter((c) => !filteredCodes.includes(c)),
        ...filteredCodes,
      ];
      setSelectedCountries(next);
    }
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

    console.log("Saving geo-location settings:", {
      filterMode,
      selectedCountries,
      selectedDomain,
    });

    toast.success("Geo-location settings saved successfully!");
  };

  const showCountries = filterMode === "allow-only" || filterMode === "ban-specific";

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
            onSelect={() => setFilterMode("allow-only")}
          />
          <RadioCard
            checked={filterMode === "ban-specific"}
            title="Ban Specific"
            subtitle="Allow everyone except the countries you ban."
            onSelect={() => setFilterMode("ban-specific")}
          />
        </div>
      </Section>

      {/* Countries */}
      {showCountries && (
        <Section
          title={filterMode === "allow-only" ? "Allowed Countries" : "Banned Countries"}
          description={getStatusText()}
          right={
            <Button onClick={handleSelectAll} variant="outline" size="sm">
              {filteredCountries
                .map((c) => c.code)
                .every((code) => selectedCountries.includes(code))
                ? "Deselect All"
                : "Select All"}
            </Button>
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
                  No countries found for “{searchQuery}”.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredCountries.map((country) => {
                  const selected = selectedCountries.includes(country.code);
                  return (
                    <Chip
                      key={country.code}
                      selected={selected}
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
                  );
                })}
              </div>
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
        <Button onClick={handleSave} variant="primary" size="md">
          Save Settings
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
