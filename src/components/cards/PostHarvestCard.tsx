import { Tooltip } from '../common/Tooltip';
import type { GainSummary } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import styles from './Cards.module.css';

interface PostHarvestCardProps {
  summary: GainSummary;
  savings: number;
  theme: 'light' | 'dark';
}

export const PostHarvestCard = ({ summary, savings, theme }: PostHarvestCardProps) => {
  const isDark = theme === 'dark';

  return (
    <article className={`${styles.card} ${styles.postCard} ${isDark ? styles.darkPostCard : ''}`}>
      <div className={styles.headingRow}>
        <h2 className={`${styles.heading} ${styles.postHeading}`}>After Harvesting</h2>
        <Tooltip content="Projected gains after adding selected assets into harvesting strategy.">
          <span className={`${styles.infoIcon} ${styles.postHeading}`}>i</span>
        </Tooltip>
      </div>

      <div className={styles.tableLike}>
        <div className={styles.headerRow}>
          <span className={`${styles.headerText} ${styles.postText}`}>Capital Gains</span>
          <span className={`${styles.headerText} ${styles.value} ${styles.postText}`}>Short-term</span>
          <span className={`${styles.headerText} ${styles.value} ${styles.postText}`}>Long-term</span>
        </div>

        <div className={styles.dataRow}>
          <span className={`${styles.label} ${styles.postText}`}>Profits</span>
          <span className={`${styles.value} ${styles.postValue}`}>{formatCurrency(summary.stcg.profits)}</span>
          <span className={`${styles.value} ${styles.postValue}`}>{formatCurrency(summary.ltcg.profits)}</span>
        </div>

        <div className={styles.dataRow}>
          <span className={`${styles.label} ${styles.postText}`}>Losses</span>
          <span className={`${styles.value} ${styles.postValue}`}>{formatCurrency(summary.stcg.losses)}</span>
          <span className={`${styles.value} ${styles.postValue}`}>{formatCurrency(summary.ltcg.losses)}</span>
        </div>

        <div className={styles.dataRow}>
          <span className={`${styles.label} ${styles.postText}`}>Net Capital Gains</span>
          <span className={`${styles.value} ${styles.postValue}`}>{formatCurrency(summary.stcg.net)}</span>
          <span className={`${styles.value} ${styles.postValue}`}>{formatCurrency(summary.ltcg.net)}</span>
        </div>
      </div>

      <hr className={`${styles.divider} ${styles.postDivider}`} />

      <div className={styles.realized}>
        <p className={`${styles.realizedLabel} ${styles.postRealizedLabel}`}>Realised Capital Gains</p>
        <p className={`${styles.realizedValue} ${styles.postRealizedValue}`}>{formatCurrency(summary.realized)}</p>
      </div>

      {savings > 0 ? <p className={styles.savings}>{`🎉 You're going to save ${formatCurrency(savings)}`}</p> : null}
    </article>
  );
};
