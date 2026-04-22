import type { Holding } from '../../types';
import { formatCurrency, formatHoldingsAmount, getGainType } from '../../utils/calculations';
import styles from './HoldingsTable.module.css';

interface HoldingRowProps {
  holding: Holding;
  isSelected: boolean;
  theme: 'light' | 'dark';
  onToggle: (holding: Holding) => void;
}

export const HoldingRow = ({
  holding,
  isSelected,
  theme,
  onToggle,
}: HoldingRowProps) => {
  const stcgType = getGainType(holding.stcg.gain);
  const ltcgType = getGainType(holding.ltcg.gain);
  const isDark = theme === 'dark';
  const isHarvestCandidate = holding.stcg.gain < 0 || holding.ltcg.gain < 0;

  return (
    <tr
      className={`${styles.row} ${isSelected ? styles.selectedRow : ''} ${isDark ? styles.darkRow : ''} ${
        isDark && isSelected ? styles.darkSelectedRow : ''
      } ${isHarvestCandidate ? styles.harvestBorder : ''}`}
    >
      <td className={`${styles.cell} ${styles.checkboxCell} ${isDark ? styles.darkCell : ''}`} data-label="Select">
        <input
          aria-label={`Select ${holding.name}`}
          className={styles.checkbox}
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(holding)}
        />
      </td>

      <td className={`${styles.cell} ${styles.assetCell} ${isDark ? styles.darkCell : ''}`} data-label="Asset">
        <div className={styles.asset}>
          <span className={styles.logo} style={{ backgroundColor: holding.logoColor }}>
            {holding.symbol[0]}
          </span>
          <div>
            <p className={styles.assetName}>{holding.name}</p>
            <p className={styles.assetSymbol}>{holding.symbol}</p>
          </div>
        </div>
      </td>

      <td className={`${styles.cell} ${isDark ? styles.darkCell : ''}`} data-label="Holdings">
        <p className={styles.metaPrimary}>{formatHoldingsAmount(holding.holdingsAmount)}</p>
        <p className={styles.metaSecondary}>{`Avg. Buy ${formatCurrency(holding.avgBuyPrice)}`}</p>
      </td>

      <td className={`${styles.cell} ${styles.alignRight} ${isDark ? styles.darkCell : ''}`} data-label="Current Price">
        <span className={styles.mobileValue}>{formatCurrency(holding.currentPrice)}</span>
      </td>

      <td className={`${styles.cell} ${isDark ? styles.darkCell : ''}`} data-label="Short-term Gain">
        <p className={`${styles.gainValue} ${styles[stcgType]}`}>{formatCurrency(holding.stcg.gain)}</p>
        <p className={`${styles.gainBalance} ${styles[stcgType]}`}>{`${holding.stcg.balance.toFixed(2)}%`}</p>
      </td>

      <td className={`${styles.cell} ${isDark ? styles.darkCell : ''}`} data-label="Long-term Gain">
        <p className={`${styles.gainValue} ${styles[ltcgType]}`}>{formatCurrency(holding.ltcg.gain)}</p>
        <p className={`${styles.gainBalance} ${styles[ltcgType]}`}>{`${holding.ltcg.balance.toFixed(2)}%`}</p>
      </td>

      <td className={`${styles.cell} ${styles.amountSell} ${isDark ? styles.darkCell : ''}`} data-label="Amount to Sell">
        <span className={styles.mobileValue}>{isSelected ? formatHoldingsAmount(holding.holdingsAmount) : '-'}</span>
      </td>
    </tr>
  );
};
