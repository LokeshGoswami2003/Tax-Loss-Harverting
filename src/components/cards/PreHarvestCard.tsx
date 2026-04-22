import { useState } from 'react';
import { Tooltip } from '../common/Tooltip';
import type { GainSummary } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import styles from './Cards.module.css';

interface PreHarvestCardProps {
  summary: GainSummary;
  theme: 'light' | 'dark';
}

export const PreHarvestCard = ({ summary, theme }: PreHarvestCardProps) => {
  const isDark = theme === 'dark';
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <article
      className={`${styles.card} ${styles.preCard} ${isDark ? styles.darkPreCard : ''} ${
        expanded ? styles.expandedCard : ''
      }`}
    >
      <div className={styles.headingRow} onClick={() => setExpanded((s) => !s)} style={{ cursor: 'pointer' }}>
        <h2 className={`${styles.heading} ${isDark ? styles.darkHeading : ''}`}>Pre Harvesting</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tooltip content="Current realized gains before selecting assets to harvest.">
            <span className={`${styles.infoIcon} ${isDark ? styles.darkInfoIcon : ''}`}>i</span>
          </Tooltip>
          <span className={styles.expandCaret} aria-hidden>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      <div className={`${styles.tableLike} ${expanded ? styles.collapsibleOpen : styles.collapsibleClosed}`}>
        <div className={styles.headerRow}>
          <span className={`${styles.headerText} ${isDark ? styles.darkText : ''}`}>Capital Gains</span>
          <span className={`${styles.headerText} ${styles.value} ${isDark ? styles.darkText : ''}`}>Short-term</span>
          <span className={`${styles.headerText} ${styles.value} ${isDark ? styles.darkText : ''}`}>Long-term</span>
        </div>

        <div className={styles.dataRow}>
          <span className={`${styles.label} ${isDark ? styles.darkText : ''}`}>Profits</span>
          <span className={`${styles.value} ${isDark ? styles.darkValue : ''}`}>{formatCurrency(summary.stcg.profits)}</span>
          <span className={`${styles.value} ${isDark ? styles.darkValue : ''}`}>{formatCurrency(summary.ltcg.profits)}</span>
        </div>

        <div className={styles.dataRow}>
          <span className={`${styles.label} ${isDark ? styles.darkText : ''}`}>Losses</span>
          <span className={`${styles.value} ${isDark ? styles.darkValue : ''}`}>{formatCurrency(summary.stcg.losses)}</span>
          <span className={`${styles.value} ${isDark ? styles.darkValue : ''}`}>{formatCurrency(summary.ltcg.losses)}</span>
        </div>

        <div className={styles.dataRow}>
          <span className={`${styles.label} ${isDark ? styles.darkText : ''}`}>Net Capital Gains</span>
          <span className={`${styles.value} ${isDark ? styles.darkValue : ''}`}>{formatCurrency(summary.stcg.net)}</span>
          <span className={`${styles.value} ${isDark ? styles.darkValue : ''}`}>{formatCurrency(summary.ltcg.net)}</span>
        </div>
      </div>

      <hr className={`${styles.divider} ${isDark ? styles.darkDivider : ''}`} />

      <div className={styles.realized}>
        <p className={`${styles.realizedLabel} ${isDark ? styles.darkRealized : ''}`}>Realised Capital Gains</p>
        <p className={`${styles.realizedValue} ${isDark ? styles.darkRealized : ''}`}>{formatCurrency(summary.realized)}</p>
      </div>
    </article>
  );
};
