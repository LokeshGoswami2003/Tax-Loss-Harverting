import { useMemo, useState } from 'react';
import { Tooltip } from '../common/Tooltip';
import type { Holding } from '../../types';
import { HoldingRow } from './HoldingRow';
import styles from './HoldingsTable.module.css';

interface HoldingsTableProps {
  holdings: Holding[];
  selectedAssetIds: Set<string>;
  allSelected: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleAsset: (holding: Holding) => void;
  theme: 'light' | 'dark';
}

export const HoldingsTable = ({
  holdings,
  selectedAssetIds,
  allSelected,
  onToggleAll,
  onToggleAsset,
  theme,
}: HoldingsTableProps) => {
  const [sortKey, setSortKey] = useState<'currentPrice' | 'stcg' | 'ltcg' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const isDark = theme === 'dark';

  const toggleSort = (key: 'currentPrice' | 'stcg' | 'ltcg') => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const onSortKeyDown = (key: 'currentPrice' | 'stcg' | 'ltcg') => (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSort(key);
    }
  };

  const sortedHoldings = useMemo(() => {
    if (!sortKey) return holdings;
    const copy = [...holdings];
    copy.sort((a, b) => {
      let av = 0;
      let bv = 0;
      if (sortKey === 'currentPrice') {
        av = a.currentPrice;
        bv = b.currentPrice;
      } else if (sortKey === 'stcg') {
        av = a.stcg.gain;
        bv = b.stcg.gain;
      } else if (sortKey === 'ltcg') {
        av = a.ltcg.gain;
        bv = b.ltcg.gain;
      }

      if (av === bv) return 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return copy;
  }, [holdings, sortKey, sortDir]);

  return (
    <section className={`${styles.tableShell} ${isDark ? styles.darkTableShell : ''}`}>
      <table className={styles.table}>
        <thead className={styles.head}>
          <tr className={styles.headerRow}>
            <th className={`${styles.headerCell} ${styles.checkboxCell} ${isDark ? styles.darkHeaderCell : ''}`}>
              <input
                aria-label="Select all visible assets"
                className={styles.checkbox}
                type="checkbox"
                checked={allSelected}
                onChange={(event) => onToggleAll(event.target.checked)}
              />
            </th>
            <th className={`${styles.headerCell} ${isDark ? styles.darkHeaderCell : ''}`}>Asset</th>
            <th className={`${styles.headerCell} ${styles.alignRight} ${isDark ? styles.darkHeaderCell : ''}`}>
              Holdings
            </th>
            <th
              className={`${styles.headerCell} ${styles.alignRight} ${isDark ? styles.darkHeaderCell : ''}`}
              onClick={() => toggleSort('currentPrice')}
              role="button"
              tabIndex={0}
              onKeyDown={onSortKeyDown('currentPrice')}
            >
              <span className={styles.sortHeader}>
                Current Price
                <span className={styles.sortIndicator}>
                  {sortKey === 'currentPrice' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                </span>
              </span>
            </th>
            <th
              className={`${styles.headerCell} ${styles.alignRight} ${isDark ? styles.darkHeaderCell : ''}`}
              onClick={() => toggleSort('stcg')}
              role="button"
              tabIndex={0}
              onKeyDown={onSortKeyDown('stcg')}
            >
              <Tooltip content="Short-term gain or loss bucket based on recent holding period.">
                <span className={styles.headerTooltip}>Short-term Gain</span>
              </Tooltip>
              <span className={styles.sortIndicator}>{sortKey === 'stcg' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
            </th>
            <th
              className={`${styles.headerCell} ${styles.alignRight} ${isDark ? styles.darkHeaderCell : ''}`}
              onClick={() => toggleSort('ltcg')}
              role="button"
              tabIndex={0}
              onKeyDown={onSortKeyDown('ltcg')}
            >
              <Tooltip content="Long-term gain or loss bucket based on older holdings.">
                <span className={styles.headerTooltip}>Long-term Gain</span>
              </Tooltip>
              <span className={styles.sortIndicator}>{sortKey === 'ltcg' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
            </th>
            <th className={`${styles.headerCell} ${styles.alignRight} ${isDark ? styles.darkHeaderCell : ''}`}>
              <Tooltip content="Selected rows assume the full holding amount is marked for sale.">
                <span className={styles.headerTooltip}>Amount to Sell</span>
              </Tooltip>
            </th>
          </tr>
        </thead>

        <tbody className={styles.body}>
          {sortedHoldings.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={7}>
                No holdings found.
              </td>
            </tr>
          ) : (
            sortedHoldings.map((holding) => (
              <HoldingRow
                key={holding.id}
                holding={holding}
                isSelected={selectedAssetIds.has(holding.id)}
                theme={theme}
                onToggle={onToggleAsset}
              />
            ))
          )}
        </tbody>
      </table>
    </section>
  );
};
