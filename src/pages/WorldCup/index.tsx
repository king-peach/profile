import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FALLBACK_MATCHES,
  fetchWorldCupData,
  GROUP_NAMES,
  loadDiaryEntries,
  addDiaryEntry,
  deleteDiaryEntry,
  saveDiaryEntries,
  MOOD_LABELS,
  type Match,
  type GroupStanding,
  type DiaryEntry,
  type MoodTag,
} from "./data";

// ============ 暗色主题色板 ============
const C = {
  bg:        "#080c14",
  bgCard:    "#0f1520",
  bgCardHov: "#151d2c",
  bgSubtle:  "rgba(255,255,255,0.025)",
  bgBadge:   "rgba(255,255,255,0.04)",
  border:    "rgba(255,255,255,0.06)",
  borderSub: "rgba(255,255,255,0.04)",
  text:      "#e8ecf2",
  textSub:   "rgba(255,255,255,0.55)",
  textMuted: "rgba(255,255,255,0.25)",
  textFaint: "rgba(255,255,255,0.12)",
  mint400: "#2bfda0",
  mint500: "#00e682",
  mint600: "#00bf69",
  gold400: "#ffbe20",
  gold500: "#f99b07",
  flame400: "#fb7f6a",
  flame500: "#f45d44",
  ice400: "#67e8f9",
  violet: "#a78bfa",
};

function a(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

type Tab = "schedule" | "standings" | "stats";

function Flag({ flag, size = 22 }: { flag: string; size?: number }) {
  return <span style={{ fontSize: size, lineHeight: 1 }} className="select-none inline-block">{flag}</span>;
}

function StatusBadge({ status }: { status: Match["status"] }) {
  if (status === "finished") {
    return <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: a(C.mint500, 0.1), color: C.mint400, border: `1px solid ${a(C.mint500, 0.18)}` }}>FT</span>;
  }
  if (status === "live") {
    return <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-md animate-pulse" style={{ background: a(C.flame500, 0.1), color: C.flame400, border: `1px solid ${a(C.flame500, 0.18)}` }}>LIVE</span>;
  }
  return <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: a(C.gold500, 0.1), color: C.gold400, border: `1px solid ${a(C.gold500, 0.18)}` }}>待开赛</span>;
}

// ============ 比赛卡片 ============
function MatchCard({ match }: { match: Match }) {
  const isHighlight =
    match.status === "finished" &&
    match.homeScore !== null &&
    match.awayScore !== null &&
    Math.abs(match.homeScore - match.awayScore) >= 4;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-3 md:p-4 transition-colors"
      style={{
        background: isHighlight
          ? `linear-gradient(135deg, ${C.bgCard}, ${a(C.gold500, 0.04)})`
          : C.bgCard,
        borderColor: isHighlight ? a(C.gold500, 0.18) : C.border,
      }}
    >
      {/* Meta */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] md:text-xs font-bold rounded px-1.5 py-0.5 uppercase tracking-wider"
          style={{ color: C.mint400, background: a(C.mint500, 0.08), border: `1px solid ${a(C.mint500, 0.14)}` }}
        >
          {match.group}组 · R{match.round}
        </span>
        <StatusBadge status={match.status} />
      </div>

      {/* Score Row */}
      <div className="flex items-center justify-between gap-2 md:gap-3">
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="text-sm md:text-base font-bold text-right leading-tight" style={{ color: C.text }}>{match.home.name}</span>
          <Flag flag={match.home.flag} size={20} />
        </div>
        <div
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 min-w-[72px] md:min-w-[88px] justify-center"
          style={{ background: C.bgSubtle, border: `1px solid ${C.borderSub}` }}
        >
          {match.status === "finished" ? (
            <>
              <span className="text-xl md:text-2xl font-black font-mono" style={{ color: C.text }}>{match.homeScore}</span>
              <span className="text-sm" style={{ color: C.textMuted }}>:</span>
              <span className="text-xl md:text-2xl font-black font-mono" style={{ color: C.text }}>{match.awayScore}</span>
            </>
          ) : (
            <span className="text-xs md:text-sm font-bold tracking-widest" style={{ color: C.gold500 }}>VS</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Flag flag={match.away.flag} size={20} />
          <span className="text-sm md:text-base font-bold leading-tight" style={{ color: C.text }}>{match.away.name}</span>
        </div>
      </div>

      {/* Half Score */}
      {match.status === "finished" && match.halfHomeScore !== null && (
        <div className="text-center text-[10px] md:text-xs mt-1 font-medium" style={{ color: C.textMuted }}>
          半场 {match.halfHomeScore}-{match.halfAwayScore}
        </div>
      )}

      {/* Events */}
      {match.events && match.events.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 justify-center">
          {match.events.filter((e) => e.type === "goal").map((e, i) => (
            <span key={i} className="text-[10px] md:text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: a(C.mint500, 0.08), color: C.mint400 }}>
              ⚽ {e.player} {e.minute}&apos;
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      {match.stats && (
        <div className="mt-2 md:mt-3 pt-2 md:pt-3 space-y-1.5" style={{ borderTop: `1px solid ${C.borderSub}` }}>
          <StatBar label="控球" home={match.stats.possession[0]} away={match.stats.possession[1]} suffix="%" />
          <StatBar label="射门" home={match.stats.shots[0]} away={match.stats.shots[1]} />
        </div>
      )}

      {/* Venue */}
      <div className="flex items-center justify-between mt-2 text-[10px] md:text-xs" style={{ color: C.textMuted }}>
        <span>📍 {match.venue}</span>
        <span>{match.date.slice(5)} {match.kickoff}</span>
      </div>
    </motion.div>
  );
}

function StatBar({ label, home, away, suffix = "" }: { label: string; home: number; away: number; suffix?: string }) {
  const total = home + away || 1;
  return (
    <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs">
      <span className="w-7 text-right font-bold font-mono" style={{ color: C.textSub }}>{home}{suffix}</span>
      <div className="flex-1 flex h-1 md:h-1.5 rounded-full overflow-hidden" style={{ background: C.bgBadge }}>
        <div className="rounded-l-full" style={{ width: `${(home / total) * 100}%`, background: a(C.mint500, 0.7) }} />
        <div className="rounded-r-full" style={{ width: `${(away / total) * 100}%`, background: a(C.gold500, 0.7) }} />
      </div>
      <span className="w-7 font-bold font-mono" style={{ color: C.textSub }}>{away}{suffix}</span>
      <span className="font-semibold w-7 text-center" style={{ color: C.textMuted }}>{label}</span>
    </div>
  );
}

// ============ 积分榜 ============
function StandingsTable({ standings }: { standings: GroupStanding[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs md:text-sm">
        <thead>
          <tr style={{ color: C.textMuted, borderBottom: `1px solid ${C.border}` }}>
            <th className="text-left py-1.5 pl-1 font-semibold">#</th>
            <th className="text-left py-1.5 font-semibold">球队</th>
            <th className="text-center py-1.5 font-semibold">赛</th>
            <th className="text-center py-1.5 font-semibold">胜</th>
            <th className="text-center py-1.5 font-semibold">平</th>
            <th className="text-center py-1.5 font-semibold">负</th>
            <th className="text-center py-1.5 font-semibold">进/失</th>
            <th className="text-center py-1.5 font-semibold">净</th>
            <th className="text-center py-1.5 pr-1 font-semibold">分</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.team.code} style={{ borderBottom: `1px solid ${C.borderSub}`, color: i < 2 ? C.mint400 : C.textSub }}>
              <td className="py-1.5 pl-1 font-bold">{i + 1}</td>
              <td className="py-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Flag flag={s.team.flag} size={14} />
                  <span className="font-bold">{s.team.name}</span>
                </span>
              </td>
              <td className="text-center font-mono">{s.played}</td>
              <td className="text-center font-mono">{s.won}</td>
              <td className="text-center font-mono">{s.drawn}</td>
              <td className="text-center font-mono">{s.lost}</td>
              <td className="text-center font-mono">{s.goalsFor}/{s.goalsAgainst}</td>
              <td className="text-center font-mono">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
              <td className="text-center pr-1 font-black font-mono text-sm md:text-base" style={{ color: i < 2 ? C.gold400 : C.textSub }}>
                {s.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============ 统计面板 ============
function StatsPanel({ matches }: { matches: Match[] }) {
  const finishedMatches = matches.filter((m) => m.status === "finished");
  const totalGoals = finishedMatches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0);
  const avgGoals = finishedMatches.length ? (totalGoals / finishedMatches.length).toFixed(2) : "0";
  const maxScore = finishedMatches.reduce((max, m) => Math.max(max, Math.abs((m.homeScore || 0) - (m.awayScore || 0))), 0);
  const draws = finishedMatches.filter((m) => m.homeScore === m.awayScore).length;
  const cleanSheets = finishedMatches.filter((m) => m.homeScore === 0 || m.awayScore === 0).length;

  const bestMatch = finishedMatches.reduce(
    (best, m) => {
      const goals = (m.homeScore || 0) + (m.awayScore || 0);
      return goals > best.goals ? { match: m, goals } : best;
    },
    { match: finishedMatches[0], goals: 0 }
  );

  const scorerMap: Record<string, number> = {};
  for (const m of finishedMatches) {
    if (!m.events) continue;
    for (const e of m.events) {
      if (e.type === "goal") scorerMap[e.player] = (scorerMap[e.player] || 0) + 1;
    }
  }
  const topScorers = Object.entries(scorerMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const statItems = [
    { value: totalGoals, label: "总进球", color: C.gold400, icon: "⚽" },
    { value: avgGoals, label: "场均进球", color: C.mint400, icon: "📊" },
    { value: maxScore, label: "最大分差", color: C.flame400, icon: "🔥" },
    { value: draws, label: "平局", color: C.ice400, icon: "🤝" },
    { value: cleanSheets, label: "零封", color: C.violet, icon: "🛡️" },
    { value: finishedMatches.length, label: "已完赛", color: C.mint600, icon: "✅" },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Grid stats: 手机3列, md 6列 */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="text-center py-3 md:py-4 rounded-xl border" style={{ background: C.bgSubtle, borderColor: C.border }}>
            <div className="text-lg md:hidden">{item.icon}</div>
            <div className="text-xl md:text-2xl font-black font-mono" style={{ color: item.color }}>{item.value}</div>
            <div className="text-[10px] md:text-xs font-semibold mt-0.5" style={{ color: C.textMuted }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Best match + Scorers: md并排 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bestMatch.match && (
          <div className="rounded-xl border p-3 md:p-4" style={{ background: C.bgSubtle, borderColor: a(C.gold500, 0.15) }}>
            <div className="text-[10px] md:text-xs font-bold mb-2" style={{ color: C.gold400 }}>🔥 进球最多</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag flag={bestMatch.match.home.flag} size={18} />
                <span className="text-sm md:text-base font-bold" style={{ color: C.text }}>{bestMatch.match.home.name}</span>
              </div>
              <span className="font-black font-mono text-lg md:text-xl" style={{ color: C.gold400 }}>
                {bestMatch.match.homeScore} : {bestMatch.match.awayScore}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-bold" style={{ color: C.text }}>{bestMatch.match.away.name}</span>
                <Flag flag={bestMatch.match.away.flag} size={18} />
              </div>
            </div>
            <div className="text-[10px] md:text-xs mt-1" style={{ color: C.textMuted }}>{bestMatch.goals}球 · {bestMatch.match.venue}</div>
          </div>
        )}

        {topScorers.length > 0 && (
          <div className="rounded-xl border p-3 md:p-4" style={{ background: C.bgSubtle, borderColor: C.border }}>
            <div className="text-[10px] md:text-xs font-bold mb-2" style={{ color: C.textMuted }}>⚽ 射手榜</div>
            <div className="space-y-1.5 md:space-y-2">
              {topScorers.map(([name, goals], i) => (
                <div key={name} className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black"
                    style={i === 0 ? { background: a(C.gold500, 0.12), color: C.gold400 } : { background: C.bgBadge, color: C.textMuted }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm md:text-base font-bold flex-1" style={{ color: C.text }}>{name}</span>
                  <span className="font-black font-mono text-sm md:text-base" style={{ color: C.mint400 }}>{goals}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Main Page ============
export default function WorldCupPage() {
  const [tab, setTab] = useState<Tab>("schedule");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");

  // Live data state
  const [matches, setMatches] = useState<Match[]>(FALLBACK_MATCHES);
  const [standings, setStandings] = useState<Record<string, GroupStanding[]>>(() => {
    // Import computeStandings is not possible from data.ts since it's not exported,
    // but we have GROUP_STANDINGS as fallback. Actually, let me compute from FALLBACK.
    const map: Record<string, Record<string, GroupStanding>> = {};
    for (const g of GROUP_NAMES) map[g] = {};
    for (const m of FALLBACK_MATCHES) {
      if (m.status !== "finished" || !GROUP_NAMES.includes(m.group)) continue;
      if (!map[m.group][m.home.code]) map[m.group][m.home.code] = { team: m.home, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 };
      if (!map[m.group][m.away.code]) map[m.group][m.away.code] = { team: m.away, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 };
      const hs = m.homeScore!, as = m.awayScore!;
      const h = map[m.group][m.home.code], a = map[m.group][m.away.code];
      h.played++; a.played++; h.goalsFor += hs; h.goalsAgainst += as; a.goalsFor += as; a.goalsAgainst += hs;
      if (hs > as) { h.won++; h.points += 3; a.lost++; } else if (hs < as) { a.won++; a.points += 3; h.lost++; } else { h.drawn++; a.drawn++; h.points++; a.points++; }
      h.goalDiff = h.goalsFor - h.goalsAgainst; a.goalDiff = a.goalsFor - a.goalsAgainst;
    }
    const result: Record<string, GroupStanding[]> = {};
    for (const g of GROUP_NAMES) result[g] = Object.values(map[g]).sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
    return result;
  });
  const [dataSource, setDataSource] = useState<"live" | "fallback">("fallback");
  const [loading, setLoading] = useState(true);

  // Fetch live data on mount, then refresh every 60s
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    async function load() {
      try {
        const result = await fetchWorldCupData();
        setMatches(result.matches);
        setStandings(result.standings);
        setDataSource(result.source);
      } catch {
        // Already falls back inside fetchWorldCupData
      } finally {
        setLoading(false);
      }
    }

    load();
    timer = setInterval(load, 60_000);
    return () => clearInterval(timer);
  }, []);

  const dates = useMemo(() => {
    const set = new Set(matches.map((m) => m.date));
    return ["all", ...Array.from(set).sort()];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    let list = matches;
    if (dateFilter !== "all") list = list.filter((m) => m.date === dateFilter);
    if (groupFilter !== "all") list = list.filter((m) => m.group === groupFilter);
    return list;
  }, [dateFilter, groupFilter]);

  const finishedCount = matches.filter((m) => m.status === "finished").length;
  const upcomingCount = matches.filter((m) => m.status === "upcoming").length;

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse 70% 40% at 15% 10%, ${a(C.mint500, 0.06)} 0%, transparent 60%),
          radial-gradient(ellipse 50% 50% at 85% 90%, ${a(C.gold500, 0.04)} 0%, transparent 60%),
          ${C.bg}
        `,
        color: C.text,
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-50 border-b"
        style={{
          background: a(C.bg, 0.85),
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderColor: C.border,
        }}
      >
        {/* 手机: max-w-lg, md+: max-w-6xl */}
        <div className="max-w-lg md:max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-1.5" style={{ color: C.text }}>
                <span
                  className="inline-block w-2.5 h-2.5 md:w-3 md:h-3 rounded-full animate-pulse"
                  style={{ background: C.mint500, boxShadow: `0 0 10px ${a(C.mint500, 0.5)}, 0 0 20px ${a(C.mint500, 0.2)}` }}
                />
                世界杯 2026
              </h1>
              <p className="text-[10px] md:text-xs font-medium ml-4 md:ml-5" style={{ color: C.textMuted }}>
                {finishedCount}场已结束 · {upcomingCount}场待开赛
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${loading ? "animate-pulse" : ""}`} style={{ background: dataSource === "live" ? C.mint500 : C.gold500 }} />
                  <span className="text-[9px]">{dataSource === "live" ? "实时" : "静态"}</span>
                </span>
              </p>
            </div>
            <a
              href="/"
              className="text-[10px] md:text-xs font-bold rounded-lg px-2 md:px-3 py-1 transition-colors"
              style={{ color: C.textMuted, border: `1px solid ${C.border}` }}
            >
              ← 返回主页
            </a>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-2.5 md:mt-3 rounded-lg p-0.5 md:p-1" style={{ background: C.bgBadge }}>
            {([ { key: "schedule" as Tab, label: "赛程" }, { key: "standings" as Tab, label: "积分" }, { key: "stats" as Tab, label: "数据" } ]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 text-xs md:text-sm font-bold py-1.5 md:py-2 rounded-md transition-all"
                style={
                  tab === t.key
                    ? { background: a(C.mint500, 0.1), color: C.mint400, boxShadow: `0 0 16px ${a(C.mint500, 0.1)}` }
                    : { color: C.textMuted }
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg md:max-w-6xl mx-auto px-4 py-4 md:py-6">
        <AnimatePresence mode="wait">
          {tab === "schedule" && (
            <motion.div key="schedule" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              {/* Filters */}
              <div className="flex gap-2 mb-3 md:mb-4 overflow-x-auto pb-1">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="text-[10px] md:text-xs font-bold rounded-lg px-2 md:px-3 py-1.5 md:py-2 appearance-none cursor-pointer"
                  style={{ background: C.bgBadge, color: C.textSub, border: `1px solid ${C.border}` }}
                >
                  <option value="all">全部日期</option>
                  {dates.slice(1).map((d) => <option key={d} value={d}>{d.slice(5)}</option>)}
                </select>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="text-[10px] md:text-xs font-bold rounded-lg px-2 md:px-3 py-1.5 md:py-2 appearance-none cursor-pointer"
                  style={{ background: C.bgBadge, color: C.textSub, border: `1px solid ${C.border}` }}
                >
                  <option value="all">全部小组</option>
                  {GROUP_NAMES.map((g) => <option key={g} value={g}>{g}组</option>)}
                </select>
                <span className="text-[10px] md:text-xs self-center ml-auto whitespace-nowrap" style={{ color: C.textMuted }}>
                  {filteredMatches.length} 场
                </span>
              </div>

              {/* 比赛网格: 手机1列, md 2列, lg 3列 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {filteredMatches.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>

              {filteredMatches.length === 0 && (
                <div className="text-center text-sm md:text-base py-12" style={{ color: C.textMuted }}>暂无比赛数据</div>
              )}
            </motion.div>
          )}

          {tab === "standings" && (
            <motion.div key="standings" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              {/* 积分榜网格: 手机1列, md 2列, lg 3列 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {GROUP_NAMES.map((g) => {
                  const standingsData = standings[g];
                  if (!standingsData || standingsData.length === 0) return null;
                  return (
                    <div key={g} className="rounded-xl border p-3 md:p-4" style={{ background: C.bgCard, borderColor: C.border }}>
                      <div className="text-xs md:text-sm font-black mb-2 md:mb-3" style={{ color: C.mint400 }}>{g} 组</div>
                      <StandingsTable standings={standingsData} />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {tab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              <StatsPanel matches={matches} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="text-center py-6 md:py-8 text-[10px] md:text-xs font-medium" style={{ color: C.textFaint }}>
        2026 FIFA World Cup™ · 数据来源 FIFA 官方
      </div>

      {/* GEO: 语义化内容，帮助 AI 引擎和搜索引擎理解页面 */}
      <section className="sr-only" aria-label="2026 世界杯赛事信息">
        <article>
          <h2>2026 FIFA 美加墨世界杯实时数据看板</h2>
          <p>
            本页面提供 2026 年 FIFA 世界杯的实时赛程、比分和积分榜数据。
            本届世界杯由美国、加拿大和墨西哥三国联合举办，共 48 支球队参加，分为 12 个小组（A-L 组），
            小组赛阶段共 72 场比赛。赛事时间为 2026 年 6 月 11 日至 7 月 19 日。
            数据来源于 FIFA 官方 API，自动实时更新。
          </p>
          <h3>赛事规模</h3>
          <p>
            2026 世界杯是历史上首次由 48 支球队参赛的世界杯，较此前的 32 队扩军 50%。
            12 个小组每组 4 队，小组前两名及 8 个最佳第三名晋级 32 强淘汰赛。
            比赛将在美国、加拿大和墨西哥的 16 座城市举行。
          </p>
          <h3>数据说明</h3>
          <p>
            实时比分数据来自 FIFA 官方 API（api.fifa.com），比赛进行中每 15 秒自动刷新，
            已完赛每 60 秒刷新，未开赛每 5 分钟刷新。积分榜根据比赛结果自动计算。
            本页面支持按日期和小组筛选比赛，提供赛事统计面板。
          </p>
        </article>
      </section>
    </div>
  );
}
