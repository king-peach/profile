// 2026 FIFA World Cup Data Layer
// Uses FIFA's official public API (api.fifa.com/api/v3) — free, no auth required
// API proxy: /api/worldcup/* → https://api.fifa.com/api/v3/* (nginx in prod, vite in dev)

export interface Team {
  code: string; // FIFA country code (ARG, GER, etc.)
  name: string; // 中文名
  nameEn: string; // English name
  flag: string; // emoji flag
}

export interface Match {
  id: string;
  group: string; // A-L (2026 has 12 groups)
  round: number; // 1=group, 2=R32, 3=R16, 4=QF, 5=SF, 6=3rd, 7=final
  home: Team;
  away: Team;
  homeScore: number | null;
  awayScore: number | null;
  halfHomeScore: number | null;
  halfAwayScore: number | null;
  status: "finished" | "upcoming" | "live";
  kickoff: string; // Beijing time HH:mm
  date: string; // YYYY-MM-DD
  venue: string;
  events?: MatchEvent[];
  stats?: MatchStats;
}

export interface MatchEvent {
  type: "goal" | "yellow" | "red" | "sub";
  team: "home" | "away";
  player: string;
  minute: number;
  assist?: string;
}

export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
}

export interface GroupStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

// ============ FIFA Country Code → Team (with Chinese names) ============
const TEAMS: Record<string, Team> = {
  // Group A
  MEX: { code: "MEX", name: "墨西哥", nameEn: "Mexico", flag: "🇲🇽" },
  KOR: { code: "KOR", name: "韩国", nameEn: "Korea Republic", flag: "🇰🇷" },
  CZE: { code: "CZE", name: "捷克", nameEn: "Czechia", flag: "🇨🇿" },
  RSA: { code: "RSA", name: "南非", nameEn: "South Africa", flag: "🇿🇦" },
  // Group B
  SUI: { code: "SUI", name: "瑞士", nameEn: "Switzerland", flag: "🇨🇭" },
  CAN: { code: "CAN", name: "加拿大", nameEn: "Canada", flag: "🇨🇦" },
  QAT: { code: "QAT", name: "卡塔尔", nameEn: "Qatar", flag: "🇶🇦" },
  BIH: { code: "BIH", name: "波黑", nameEn: "Bosnia and Herzegovina", flag: "🇧🇦" },
  // Group C
  BRA: { code: "BRA", name: "巴西", nameEn: "Brazil", flag: "🇧🇷" },
  MAR: { code: "MAR", name: "摩洛哥", nameEn: "Morocco", flag: "🇲🇦" },
  HAI: { code: "HAI", name: "海地", nameEn: "Haiti", flag: "🇭🇹" },
  SCO: { code: "SCO", name: "苏格兰", nameEn: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  // Group D
  USA: { code: "USA", name: "美国", nameEn: "USA", flag: "🇺🇸" },
  PAR: { code: "PAR", name: "巴拉圭", nameEn: "Paraguay", flag: "🇵🇾" },
  AUS: { code: "AUS", name: "澳大利亚", nameEn: "Australia", flag: "🇦🇺" },
  TUR: { code: "TUR", name: "土耳其", nameEn: "Türkiye", flag: "🇹🇷" },
  // Group E
  GER: { code: "GER", name: "德国", nameEn: "Germany", flag: "🇩🇪" },
  CIV: { code: "CIV", name: "科特迪瓦", nameEn: "Côte d'Ivoire", flag: "🇨🇮" },
  ECU: { code: "ECU", name: "厄瓜多尔", nameEn: "Ecuador", flag: "🇪🇨" },
  CUW: { code: "CUW", name: "库拉索", nameEn: "Curaçao", flag: "🇨🇼" },
  // Group F
  SWE: { code: "SWE", name: "瑞典", nameEn: "Sweden", flag: "🇸🇪" },
  NED: { code: "NED", name: "荷兰", nameEn: "Netherlands", flag: "🇳🇱" },
  JPN: { code: "JPN", name: "日本", nameEn: "Japan", flag: "🇯🇵" },
  TUN: { code: "TUN", name: "突尼斯", nameEn: "Tunisia", flag: "🇹🇳" },
  // Group G
  BEL: { code: "BEL", name: "比利时", nameEn: "Belgium", flag: "🇧🇪" },
  EGY: { code: "EGY", name: "埃及", nameEn: "Egypt", flag: "🇪🇬" },
  IRN: { code: "IRN", name: "伊朗", nameEn: "IR Iran", flag: "🇮🇷" },
  NZL: { code: "NZL", name: "新西兰", nameEn: "New Zealand", flag: "🇳🇿" },
  // Group H
  ESP: { code: "ESP", name: "西班牙", nameEn: "Spain", flag: "🇪🇸" },
  CPV: { code: "CPV", name: "佛得角", nameEn: "Cabo Verde", flag: "🇨🇻" },
  KSA: { code: "KSA", name: "沙特", nameEn: "Saudi Arabia", flag: "🇸🇦" },
  URU: { code: "URU", name: "乌拉圭", nameEn: "Uruguay", flag: "🇺🇾" },
  // Group I
  FRA: { code: "FRA", name: "法国", nameEn: "France", flag: "🇫🇷" },
  SEN: { code: "SEN", name: "塞内加尔", nameEn: "Senegal", flag: "🇸🇳" },
  IRQ: { code: "IRQ", name: "伊拉克", nameEn: "Iraq", flag: "🇮🇶" },
  NOR: { code: "NOR", name: "挪威", nameEn: "Norway", flag: "🇳🇴" },
  // Group J
  ARG: { code: "ARG", name: "阿根廷", nameEn: "Argentina", flag: "🇦🇷" },
  ALG: { code: "ALG", name: "阿尔及利亚", nameEn: "Algeria", flag: "🇩🇿" },
  AUT: { code: "AUT", name: "奥地利", nameEn: "Austria", flag: "🇦🇹" },
  JOR: { code: "JOR", name: "约旦", nameEn: "Jordan", flag: "🇯🇴" },
  // Group K
  POR: { code: "POR", name: "葡萄牙", nameEn: "Portugal", flag: "🇵🇹" },
  COL: { code: "COL", name: "哥伦比亚", nameEn: "Colombia", flag: "🇨🇴" },
  COD: { code: "COD", name: "刚果(金)", nameEn: "Congo DR", flag: "🇨🇩" },
  UZB: { code: "UZB", name: "乌兹别克斯坦", nameEn: "Uzbekistan", flag: "🇺🇿" },
  // Group L
  ENG: { code: "ENG", name: "英格兰", nameEn: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  CRO: { code: "CRO", name: "克罗地亚", nameEn: "Croatia", flag: "🇭🇷" },
  GHA: { code: "GHA", name: "加纳", nameEn: "Ghana", flag: "🇬🇭" },
  PAN: { code: "PAN", name: "巴拿马", nameEn: "Panama", flag: "🇵🇦" },
};

// FIFA API may return country codes we don't have — dynamic fallback
function resolveTeam(codeOrName: string): Team {
  if (TEAMS[codeOrName]) return TEAMS[codeOrName];
  // Try matching by name
  const found = Object.values(TEAMS).find(
    (t) => t.nameEn === codeOrName || t.name === codeOrName
  );
  return found || { code: codeOrName, name: codeOrName, nameEn: codeOrName, flag: "🏳️" };
}

// ============ FIFA API Response Types ============
interface FifaStanding {
  IdCompetition: string;
  IdSeason: string;
  IdStage: string;
  IdGroup: string;
  IdTeam: string;
  Group: { Locale: string; Description: string }[];
  Won: number;
  Lost: number;
  Drawn: number;
  Played: number;
  Against: number;
  For: number;
  GoalsDiference: number;
  Points: number;
  Position: number;
  IsLive: boolean;
  Team: {
    IdTeam: string;
    IdCountry: string;
    Abbreviation: string;
    Name: { Locale: string; Description: string }[];
    DisplayName: { Locale: string; Description: string }[];
    PictureUrl: string;
  };
  MatchResults: FifaMatchResult[];
}

interface FifaMatchResult {
  IdMatch: string;
  StartTime: string; // ISO 8601 UTC
  Result: number; // 3=upcoming, 4=finished, etc.
  IdGroup: string;
  IdStage: string;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  HomeTeamPenaltyScore: number | null;
  AwayTeamPenaltyScore: number | null;
  HomeTeamId: string;
  AwayTeamId: string;
}

// Team ID → code mapping (built dynamically from standings)
let teamIdToCode: Record<string, string> = {};

// ============ Map FIFA Standing → our Match[] + GroupStanding[] ============
function mapFifaData(standings: FifaStanding[]): {
  matches: Match[];
  standingsByGroup: Record<string, GroupStanding[]>;
} {
  const matchesMap = new Map<string, Match>(); // dedup by match id
  const standingsByGroup: Record<string, GroupStanding[]> = {};

  // Pass 1: build teamIdToCode mapping first (so all teams are known before resolving matches)
  const localTeamMap: Record<string, string> = {};
  for (const s of standings) {
    const teamCode = s.Team.Abbreviation || s.Team.IdCountry;
    localTeamMap[s.IdTeam] = teamCode;
  }
  // Merge into the module-level map for future use
  Object.assign(teamIdToCode, localTeamMap);

  // Pass 2: build standings + matches
  for (const s of standings) {
    const groupLetter = s.Group[0]?.Description?.replace("Group ", "") || "?";
    const teamCode = s.Team.Abbreviation || s.Team.IdCountry;

    // Build standings
    if (!standingsByGroup[groupLetter]) standingsByGroup[groupLetter] = [];
    standingsByGroup[groupLetter].push({
      team: resolveTeam(teamCode),
      played: s.Played,
      won: s.Won,
      drawn: s.Drawn,
      lost: s.Lost,
      goalsFor: s.For,
      goalsAgainst: s.Against,
      goalDiff: s.GoalsDiference,
      points: s.Points,
    });

    // Build matches from MatchResults
    for (const mr of s.MatchResults) {
      if (matchesMap.has(mr.IdMatch)) continue;

      const homeCode = teamIdToCode[mr.HomeTeamId] || mr.HomeTeamId;
      const awayCode = teamIdToCode[mr.AwayTeamId] || mr.AwayTeamId;

      // Convert UTC to Beijing time
      let kickoff = "";
      let date = "";
      try {
        const d = new Date(mr.StartTime);
        const bjDate = new Date(d.getTime() + 8 * 3600 * 1000);
        kickoff = `${String(bjDate.getUTCHours()).padStart(2, "0")}:${String(bjDate.getUTCMinutes()).padStart(2, "0")}`;
        date = bjDate.toISOString().slice(0, 10);
      } catch {
        kickoff = "--:--";
        date = mr.StartTime?.slice(0, 10) || "";
      }

      // Map status: Result 3=upcoming, 4=finished
      let status: Match["status"] = "upcoming";
      if (mr.Result === 4) status = "finished";
      else if (s.IsLive) status = "live";

      matchesMap.set(mr.IdMatch, {
        id: mr.IdMatch,
        group: groupLetter,
        round: 1, // group stage
        home: resolveTeam(homeCode),
        away: resolveTeam(awayCode),
        homeScore: mr.HomeTeamScore,
        awayScore: mr.AwayTeamScore,
        halfHomeScore: null,
        halfAwayScore: null,
        status,
        kickoff,
        date,
        venue: "",
      });
    }
  }

  // Sort standings by points/goalDiff/goalsFor
  for (const g of Object.keys(standingsByGroup)) {
    standingsByGroup[g].sort(
      (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor
    );
  }

  // Sort matches by date
  const matches = Array.from(matchesMap.values()).sort(
    (a, b) => a.date.localeCompare(b.date) || a.kickoff.localeCompare(b.kickoff)
  );

  return { matches, standingsByGroup };
}

// ============ Live Data Fetch ============
// FIFA API supports CORS — in production call it directly, no proxy needed.
// In dev, Vite proxy handles /api/worldcup/* → api.fifa.com/api/v3/*
const API_BASE = import.meta.env.DEV
  ? "/api/worldcup"
  : "https://api.fifa.com/api/v3";

// FIFA API IDs for World Cup 2026
const FIFA_COMPETITION = "17";
const FIFA_SEASON = "285023";
const FIFA_STAGE = "289273";

// Cache
let cachedMatches: Match[] | null = null;
let cachedStandings: Record<string, GroupStanding[]> | null = null;
let cacheTimestamp = 0;
let cacheTTL = 60_000;

function getCacheTTL(matches: Match[]): number {
  if (matches.some((m) => m.status === "live")) return 15_000;
  if (matches.some((m) => m.status === "finished")) return 60_000;
  return 300_000;
}

export async function fetchWorldCupData(): Promise<{
  matches: Match[];
  standings: Record<string, GroupStanding[]>;
  source: "live" | "fallback";
}> {
  // Return cache if still fresh
  if (cachedMatches && cachedStandings && Date.now() - cacheTimestamp < cacheTTL) {
    return { matches: cachedMatches, standings: cachedStandings, source: "live" };
  }

  try {
    const url = `${API_BASE}/calendar/${FIFA_COMPETITION}/${FIFA_SEASON}/${FIFA_STAGE}/standing?language=en&count=200`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`FIFA API ${res.status}`);

    const data = await res.json();
    const fifaStandings: FifaStanding[] = data.Results || [];
    if (!fifaStandings.length) throw new Error("Empty FIFA data");

    const { matches, standingsByGroup } = mapFifaData(fifaStandings);

    cachedMatches = matches;
    cachedStandings = standingsByGroup;
    cacheTimestamp = Date.now();
    cacheTTL = getCacheTTL(matches);

    return { matches, standings: standingsByGroup, source: "live" };
  } catch (err) {
    console.warn("[WorldCup] FIFA API failed, using fallback:", err);
    const matches = FALLBACK_MATCHES;
    const standings = computeStandingsFromMatches(matches);
    return { matches, standings, source: "fallback" };
  }
}

// ============ Fallback: compute standings from matches ============
const GROUP_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function computeStandingsFromMatches(matches: Match[]): Record<string, GroupStanding[]> {
  const map: Record<string, Record<string, GroupStanding>> = {};
  for (const g of GROUP_NAMES) map[g] = {};

  for (const m of matches) {
    if (m.status !== "finished" || !GROUP_NAMES.includes(m.group)) continue;
    if (!map[m.group][m.home.code])
      map[m.group][m.home.code] = {
        team: m.home, played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
      };
    if (!map[m.group][m.away.code])
      map[m.group][m.away.code] = {
        team: m.away, played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
      };

    const hs = m.homeScore!, as = m.awayScore!;
    const h = map[m.group][m.home.code];
    const a = map[m.group][m.away.code];

    h.played++;
    a.played++;
    h.goalsFor += hs;
    h.goalsAgainst += as;
    a.goalsFor += as;
    a.goalsAgainst += hs;

    if (hs > as) {
      h.won++;
      h.points += 3;
      a.lost++;
    } else if (hs < as) {
      a.won++;
      a.points += 3;
      h.lost++;
    } else {
      h.drawn++;
      a.drawn++;
      h.points++;
      a.points++;
    }

    h.goalDiff = h.goalsFor - h.goalsAgainst;
    a.goalDiff = a.goalsFor - a.goalsAgainst;
  }

  const result: Record<string, GroupStanding[]> = {};
  for (const g of GROUP_NAMES) {
    result[g] = Object.values(map[g]).sort(
      (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor
    );
  }
  return result;
}

// ============ Static Fallback Data ============
export const FALLBACK_MATCHES: Match[] = [
  // Group A - June 11
  { id: "m1", group: "A", round: 1, home: TEAMS.MEX, away: TEAMS.RSA, homeScore: 2, awayScore: 0, halfHomeScore: 1, halfAwayScore: 0, status: "finished", kickoff: "00:00", date: "2026-06-11", venue: "墨西哥城" },
  { id: "m2", group: "A", round: 1, home: TEAMS.KOR, away: TEAMS.CZE, homeScore: 2, awayScore: 1, halfHomeScore: 1, halfAwayScore: 0, status: "finished", kickoff: "00:00", date: "2026-06-11", venue: "瓜达拉哈拉" },
  // Group B - June 12
  { id: "m3", group: "B", round: 1, home: TEAMS.CAN, away: TEAMS.BIH, homeScore: 1, awayScore: 1, halfHomeScore: 0, halfAwayScore: 0, status: "finished", kickoff: "01:00", date: "2026-06-12", venue: "多伦多" },
  { id: "m4", group: "D", round: 1, home: TEAMS.USA, away: TEAMS.PAR, homeScore: 4, awayScore: 1, halfHomeScore: 2, halfAwayScore: 0, status: "finished", kickoff: "04:00", date: "2026-06-12", venue: "洛杉矶" },
  // Group B - June 13
  { id: "m5", group: "B", round: 1, home: TEAMS.QAT, away: TEAMS.SUI, homeScore: 1, awayScore: 1, halfHomeScore: 0, halfAwayScore: 1, status: "finished", kickoff: "03:00", date: "2026-06-13", venue: "旧金山" },
  // Group C - June 13
  { id: "m6", group: "C", round: 1, home: TEAMS.BRA, away: TEAMS.MAR, homeScore: 1, awayScore: 1, halfHomeScore: 0, halfAwayScore: 0, status: "finished", kickoff: "06:00", date: "2026-06-13", venue: "纽约" },
  { id: "m7", group: "C", round: 1, home: TEAMS.HAI, away: TEAMS.SCO, homeScore: 0, awayScore: 1, halfHomeScore: 0, halfAwayScore: 1, status: "finished", kickoff: "09:00", date: "2026-06-13", venue: "波士顿" },
  { id: "m8", group: "D", round: 1, home: TEAMS.AUS, away: TEAMS.TUR, homeScore: 2, awayScore: 0, halfHomeScore: 1, halfAwayScore: 0, status: "finished", kickoff: "12:00", date: "2026-06-13", venue: "温哥华" },
  // Group E - June 14
  { id: "m9", group: "E", round: 1, home: TEAMS.GER, away: TEAMS.CUW, homeScore: 7, awayScore: 1, halfHomeScore: 4, halfAwayScore: 0, status: "finished", kickoff: "01:00", date: "2026-06-14", venue: "休斯顿" },
  { id: "m10", group: "F", round: 1, home: TEAMS.NED, away: TEAMS.JPN, homeScore: 2, awayScore: 2, halfHomeScore: 1, halfAwayScore: 1, status: "finished", kickoff: "04:00", date: "2026-06-14", venue: "阿灵顿" },
  { id: "m11", group: "E", round: 1, home: TEAMS.CIV, away: TEAMS.ECU, homeScore: 0, awayScore: 0, halfHomeScore: 0, halfAwayScore: 0, status: "finished", kickoff: "07:00", date: "2026-06-14", venue: "费城" },
  { id: "m12", group: "F", round: 1, home: TEAMS.SWE, away: TEAMS.TUN, homeScore: 0, awayScore: 0, halfHomeScore: 0, halfAwayScore: 0, status: "finished", kickoff: "10:00", date: "2026-06-14", venue: "蒙特雷" },
  // Group H - June 15
  { id: "m13", group: "H", round: 1, home: TEAMS.ESP, away: TEAMS.CPV, homeScore: null, awayScore: null, halfHomeScore: null, halfAwayScore: null, status: "upcoming", kickoff: "00:00", date: "2026-06-15", venue: "亚特兰大" },
  { id: "m14", group: "G", round: 1, home: TEAMS.BEL, away: TEAMS.EGY, homeScore: null, awayScore: null, halfHomeScore: null, halfAwayScore: null, status: "upcoming", kickoff: "03:00", date: "2026-06-15", venue: "西雅图" },
  { id: "m15", group: "H", round: 1, home: TEAMS.KSA, away: TEAMS.URU, homeScore: null, awayScore: null, halfHomeScore: null, halfAwayScore: null, status: "upcoming", kickoff: "06:00", date: "2026-06-15", venue: "迈阿密" },
  { id: "m16", group: "G", round: 1, home: TEAMS.IRN, away: TEAMS.NZL, homeScore: null, awayScore: null, halfHomeScore: null, halfAwayScore: null, status: "upcoming", kickoff: "09:00", date: "2026-06-15", venue: "洛杉矶" },
  // Group I - June 16
  { id: "m17", group: "I", round: 1, home: TEAMS.FRA, away: TEAMS.SEN, homeScore: null, awayScore: null, halfHomeScore: null, halfAwayScore: null, status: "upcoming", kickoff: "03:00", date: "2026-06-16", venue: "新泽西" },
  { id: "m18", group: "I", round: 1, home: TEAMS.IRQ, away: TEAMS.NOR, homeScore: null, awayScore: null, halfHomeScore: null, halfAwayScore: null, status: "upcoming", kickoff: "06:00", date: "2026-06-16", venue: "波士顿" },
];

// ============ 看球日记 ============
export interface DiaryEntry {
  id: string;
  date: string;         // YYYY-MM-DD
  matchId?: string;     // 关联比赛 ID
  mood: MoodTag;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export type MoodTag = "🔥" | "😭" | "😍" | "😤" | "😴" | "🤯" | "🎉" | "💔";

export const MOOD_LABELS: Record<MoodTag, string> = {
  "🔥": "热血沸腾",
  "😭": "泪目感动",
  "😍": "赏心悦目",
  "😤": "意难平",
  "😴": "昏昏欲睡",
  "🤯": "不可思议",
  "🎉": "狂欢庆祝",
  "💔": "心碎出局",
};

const DIARY_STORAGE_KEY = "wc2026_diary";

export function loadDiaryEntries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(DIARY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DiaryEntry[];
  } catch {
    return [];
  }
}

export function saveDiaryEntries(entries: DiaryEntry[]): void {
  try {
    localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // silently fail
  }
}

export function addDiaryEntry(entry: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt">): DiaryEntry {
  const now = Date.now();
  const newEntry: DiaryEntry = { ...entry, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  const entries = loadDiaryEntries();
  entries.unshift(newEntry);
  saveDiaryEntries(entries);
  return newEntry;
}

export function deleteDiaryEntry(id: string): boolean {
  const entries = loadDiaryEntries();
  const len = entries.length;
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length === len) return false;
  saveDiaryEntries(filtered);
  return true;
}

// Legacy exports
export const MATCHES = FALLBACK_MATCHES;
export const GROUP_STANDINGS = computeStandingsFromMatches(FALLBACK_MATCHES);
export { GROUP_NAMES, TEAMS };
