import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip } from './components/common/Tooltip';
import { PostHarvestCard } from './components/cards/PostHarvestCard';
import { PreHarvestCard } from './components/cards/PreHarvestCard';
import { HoldingsTable } from './components/table/HoldingsTable';
import { useCapitalGains } from './hooks/useCapitalGains';
import { useHoldings } from './hooks/useHoldings';
import type { CapitalGains, Holding } from './types';
import { calculateCapitalGains, getGainSummary } from './utils/calculations';
import styles from './App.module.css';

type ThemeMode = 'light' | 'dark';

const EMPTY_CAPITAL_GAINS: CapitalGains = {
  stcg: { profits: 0, losses: 0 },
  ltcg: { profits: 0, losses: 0 },
};

const INITIAL_VISIBLE_COUNT = 5;
const LOAD_MORE_STEP = 5;

const HOW_IT_WORKS_TOOLTIP =
  'Select loss-making holdings to offset gains. After the first reveal, more rows load automatically as you scroll.';

const NOTES_ITEMS: Array<{ title: string; body: string }> = [
  {
    title: 'Price Source Disclaimer:',
    body: 'prices are representative mock values and can differ from live exchange prices.',
  },
  {
    title: 'Country-specific Availability:',
    body: 'tax loss harvesting rules vary across jurisdictions, so validate treatment with your advisor.',
  },
  {
    title: 'Utilization of Losses:',
    body: 'harvested losses generally offset gains first, but real tax treatment depends on your filing context.',
  },
];

const App = () => {
  const { fetchHoldings } = useHoldings();
  const { fetchCapitalGains } = useCapitalGains();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [capitalGains, setCapitalGains] = useState<CapitalGains>(EMPTY_CAPITAL_GAINS);
  const [selectedAssets, setSelectedAssets] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [notesOpen, setNotesOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [holdingsResponse, gainsResponse] = await Promise.all([fetchHoldings(), fetchCapitalGains()]);
      setHoldings(holdingsResponse);
      setCapitalGains(gainsResponse.capitalGains ?? EMPTY_CAPITAL_GAINS);
      setSelectedAssets([]);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      setAutoLoadEnabled(false);
    } catch {
      setError('Unable to fetch latest data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchCapitalGains, fetchHoldings]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedAssetIds = useMemo(() => new Set(selectedAssets.map((asset) => asset.id)), [selectedAssets]);
  const preHarvestSummary = useMemo(() => getGainSummary(capitalGains), [capitalGains]);

  const postHarvestCapitalGains = useMemo(() => {
    if (selectedAssets.length === 0) {
      return capitalGains;
    }

    return calculateCapitalGains(selectedAssets, capitalGains);
  }, [capitalGains, selectedAssets]);

  const postHarvestSummary = useMemo(() => getGainSummary(postHarvestCapitalGains), [postHarvestCapitalGains]);

  const savings = useMemo(
    () => Number((preHarvestSummary.realized - postHarvestSummary.realized).toFixed(2)),
    [postHarvestSummary.realized, preHarvestSummary.realized],
  );

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const filteredHoldings = useMemo(() => {
    if (!debouncedQuery) return holdings;
    const q = debouncedQuery.toLowerCase();
    return holdings.filter((h) => h.name.toLowerCase().includes(q) || h.symbol.toLowerCase().includes(q));
  }, [holdings, debouncedQuery]);

  useEffect(() => {
    // when searching reset pagination for clearer UX
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setAutoLoadEnabled(false);
  }, [debouncedQuery]);

  const visibleHoldings = useMemo(() => filteredHoldings.slice(0, visibleCount), [filteredHoldings, visibleCount]);

  const allVisibleSelected =
    visibleHoldings.length > 0 && visibleHoldings.every((holding) => selectedAssetIds.has(holding.id));

  const canLoadMore = visibleCount < filteredHoldings.length;

  useEffect(() => {
    if (!autoLoadEnabled || !canLoadMore || !loadMoreRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry?.isIntersecting) {
          setIsLoadingMore(true);
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, filteredHoldings.length));
          window.setTimeout(() => setIsLoadingMore(false), 600);
        }
      },
      {
        rootMargin: '160px 0px',
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [autoLoadEnabled, canLoadMore, filteredHoldings.length]);

  const onToggleAsset = (holding: Holding) => {
    setSelectedAssets((prev) => {
      const exists = prev.some((asset) => asset.id === holding.id);
      if (exists) {
        return prev.filter((asset) => asset.id !== holding.id);
      }

      return [...prev, holding];
    });
  };

  const onToggleVisible = (checked: boolean) => {
    setSelectedAssets((prev) => {
      if (checked) {
        const merged = new Map(prev.map((asset) => [asset.id, asset]));
        for (const asset of visibleHoldings) {
          merged.set(asset.id, asset);
        }
        return Array.from(merged.values());
      }

      const visibleIds = new Set(visibleHoldings.map((asset) => asset.id));
      return prev.filter((asset) => !visibleIds.has(asset.id));
    });
  };

  const handleSeeMore = () => {
    setIsLoadingMore(true);
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, filteredHoldings.length));
    setAutoLoadEnabled(true);
    window.setTimeout(() => setIsLoadingMore(false), 700);
  };

  return (
    <main className={`${styles.app} ${styles[theme]}`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.brandBlock}>
            <div className={styles.brandRow}>
              <h1 className={styles.title}>Tax Optimisation</h1>
              <Tooltip content={HOW_IT_WORKS_TOOLTIP}>
                <button className={styles.howItWorks} type="button">
                  How it works?
                </button>
              </Tooltip>
            </div>
            <p className={styles.subtitle}>
              Review realised gains, surface harvest candidates, and simulate post-harvest outcomes in one view.
            </p>
          </div>

          <div className={styles.headerActions}>
            <span className={styles.selectionCount}>{`${selectedAssets.length} selected assets`}</span>
            <button
              type="button"
              className={styles.themeButton}
              onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
            >
              {theme === 'dark' ? 'Light View' : 'Dark View'}
            </button>
          </div>
        </header>

        {error ? (
          <section className={styles.error}>
            <span>{error}</span>
            <button className={styles.retry} onClick={() => void loadData()} type="button">
              Reload
            </button>
          </section>
        ) : null}

        {isLoading ? (
          <>
            <div className={styles.notesSkeleton} />
            <section className={styles.cards}>
              <div className={`${styles.skeleton} ${styles.cardSkeleton}`} />
              <div className={`${styles.skeleton} ${styles.cardSkeleton}`} />
            </section>
            <div className={`${styles.skeleton} ${styles.tableSkeleton}`} />
          </>
        ) : (
          <>
            <section className={styles.notes}>
              <button
                type="button"
                className={styles.notesHeader}
                onClick={() => setNotesOpen((prev) => !prev)}
                aria-expanded={notesOpen}
              >
                <div className={styles.notesTitleWrap}>
                  <span className={styles.notesIcon}>i</span>
                  <h2 className={styles.notesTitle}>Important Notes And Disclaimers</h2>
                </div>
                <span className={styles.notesCaret}>{notesOpen ? '▲' : '▼'}</span>
              </button>

              <div className={`${styles.notesBody} ${notesOpen ? '' : styles.notesBodyClosed}`}>
                <ul className={styles.notesList}>
                  {NOTES_ITEMS.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}</strong> {item.body}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className={styles.cards}>
              <PreHarvestCard summary={preHarvestSummary} theme={theme} />
              <PostHarvestCard summary={postHarvestSummary} savings={savings} theme={theme} />
            </section>

            <section className={styles.holdingsSection}>
              <div className={styles.tableHeaderRow}>
                  <div>
                    <h2 className={styles.tableHeading}>Holdings</h2>
                    <p className={styles.selectionScope}>Select-all applies only to the currently visible holdings.</p>
                  </div>
                  <div className={styles.tableTools}>
                    <input
                      aria-label="Search holdings"
                      className={styles.searchInput}
                      placeholder="Search by name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className={styles.pageText}>{`Showing ${visibleHoldings.length} of ${filteredHoldings.length}`}</span>
                  </div>
              </div>

              <HoldingsTable
                theme={theme}
                holdings={visibleHoldings}
                selectedAssetIds={selectedAssetIds}
                allSelected={allVisibleSelected}
                onToggleAll={onToggleVisible}
                onToggleAsset={onToggleAsset}
              />

              <div className={styles.loadMoreArea}>
                {canLoadMore ? (
                  <button
                    type="button"
                    className={styles.pageButton}
                    onClick={handleSeeMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <span className={styles.spinner} aria-hidden="true" /> Loading more...
                      </>
                    ) : autoLoadEnabled ? (
                      'Load 5 More'
                    ) : (
                      'See More'
                    )}
                  </button>
                ) : (
                  <span className={styles.pageText}>All holdings loaded</span>
                )}
              </div>

              <div ref={loadMoreRef} className={styles.loadSentinel} aria-hidden="true" />
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default App;
