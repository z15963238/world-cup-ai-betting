import type { OddsProvider } from "@/lib/types/betting";

export const oddsProviders: OddsProvider[] = [
  { id: "global", name: "Global Consensus", region: "Global", isSharp: false },
  { id: "bet365", name: "Bet365", region: "UK", isSharp: false },
  { id: "pinnacle", name: "Pinnacle", region: "Global", isSharp: true },
  { id: "betfair", name: "Betfair", region: "Exchange", isSharp: true },
  { id: "william-hill", name: "William Hill", region: "UK", isSharp: false },
  { id: "unibet", name: "Unibet", region: "EU", isSharp: false },
  { id: "1xbet", name: "1xBet", region: "Global", isSharp: false },
  { id: "draftkings", name: "DraftKings", region: "US", isSharp: false },
  { id: "fanduel", name: "FanDuel", region: "US", isSharp: false },
  { id: "caesars", name: "Caesars", region: "US", isSharp: false },
  { id: "betmgm", name: "BetMGM", region: "US", isSharp: false },
  { id: "bwin", name: "Bwin", region: "EU", isSharp: false },
  { id: "ladbrokes", name: "Ladbrokes", region: "UK", isSharp: false },
  { id: "coral", name: "Coral", region: "UK", isSharp: false },
  { id: "betway", name: "Betway", region: "Global", isSharp: false },
  { id: "stake", name: "Stake", region: "Global", isSharp: false },
  { id: "888sport", name: "888sport", region: "EU", isSharp: false },
  { id: "marathonbet", name: "Marathonbet", region: "EU", isSharp: false },
  { id: "sbobet", name: "SBOBET", region: "Asia", isSharp: true },
  { id: "10bet", name: "10Bet", region: "Global", isSharp: false },
  { id: "sportsbetio", name: "Sportsbet.io", region: "Global", isSharp: false }
];
