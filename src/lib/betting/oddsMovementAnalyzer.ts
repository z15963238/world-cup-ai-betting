import type { OddsSignal, OddsSnapshot } from "@/lib/types/betting";

export function analyzeOddsMovement(snapshots: OddsSnapshot[]): OddsSignal[] {
  if (snapshots.length < 2) return [];
  const first = snapshots[0];
  const latest = snapshots[snapshots.length - 1];
  const signals: OddsSignal[] = [];
  const homePriceDown = latest.homeWin < first.homeWin - 0.08;
  const awayPriceDown = latest.awayWin < first.awayWin - 0.08;
  const volumeJump = latest.volumeIndex - first.volumeIndex > 30;
  const totalUp = latest.totalLine > first.totalLine || latest.over < first.over - 0.07;

  if (homePriceDown && volumeJump) {
    signals.push({
      label: "Sharp Money Possible",
      severity: "Medium",
      description: "主勝賠率下修且交易量放大，可能有較早的專業資金進場。"
    });
  }

  if (awayPriceDown && !volumeJump) {
    signals.push({
      label: "Public Favorite Risk",
      severity: "High",
      description: "客勝賠率下修但量能沒有同步，熱門方有追價風險。"
    });
  }

  if (Math.abs(latest.homeWin - first.homeWin) > 0.16 && latest.volumeIndex < 68) {
    signals.push({
      label: "Fake Move Risk",
      severity: "High",
      description: "價格移動幅度大但成交深度不足，避免只看賠率方向下注。"
    });
  }

  if (totalUp) {
    signals.push({
      label: "Over Trap Risk",
      severity: "Medium",
      description: "大小球升盤或大分降賠，需檢查先發與節奏是否真的支持。"
    });
  }

  if (latest.under < first.under - 0.05) {
    signals.push({
      label: "Under Support",
      severity: "Low",
      description: "小分價格獲得支撐，市場預期可能轉向更保守的比賽節奏。"
    });
  }

  if (latest.volumeIndex >= 85) {
    signals.push({
      label: "Late Market Shock",
      severity: "High",
      description: "臨場量能異常，需確認傷停、輪換或天候消息。"
    });
  }

  return signals;
}
