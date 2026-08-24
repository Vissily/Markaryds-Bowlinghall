export type Mix55Team = {
  id: string;
  name: string;
  player1: string;
  player2: string;
  sort_order: number;
};

export type Mix55Score = {
  id: string;
  team_id: string;
  round_number: number;
  pins: number;
  series: number;
};

export type StandingRow = {
  team: Mix55Team;
  matchesPlayed: number;
  roundPins: number | null;
  roundPoints: number | null;
  totalPins: number;
  totalSeries: number;
  average: number;
  totalPoints: number;
};

/**
 * Poäng per omgång: bästa slagning får `topPoints` poäng, näst bäst topPoints-1 osv.
 * Vid lika slagning delas summan av de aktuella placeringarnas poäng lika.
 */
export function calculateRoundPoints(
  scores: { team_id: string; pins: number }[],
  topPoints: number,
): Record<string, number> {
  const sorted = [...scores].sort((a, b) => b.pins - a.pins);
  const result: Record<string, number> = {};

  let index = 0;
  while (index < sorted.length) {
    let end = index;
    while (end + 1 < sorted.length && sorted[end + 1].pins === sorted[index].pins) end++;

    let sum = 0;
    for (let pos = index; pos <= end; pos++) {
      sum += Math.max(topPoints - pos, 0);
    }
    const shared = sum / (end - index + 1);
    for (let pos = index; pos <= end; pos++) {
      result[sorted[pos].team_id] = shared;
    }
    index = end + 1;
  }

  return result;
}

export function buildStandings(
  teams: Mix55Team[],
  scores: Mix55Score[],
  selectedRound: number | "total",
): StandingRow[] {
  const topPoints = Math.max(teams.length, 1);
  const rounds = Array.from(new Set(scores.map((s) => s.round_number))).sort((a, b) => a - b);

  const pointsByRound = new Map<number, Record<string, number>>();
  for (const round of rounds) {
    const roundScores = scores.filter((s) => s.round_number === round);
    pointsByRound.set(
      round,
      calculateRoundPoints(
        roundScores.map((s) => ({ team_id: s.team_id, pins: s.pins })),
        topPoints,
      ),
    );
  }

  const latestRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;
  const displayRound = selectedRound === "total" ? latestRound : selectedRound;

  const rows: StandingRow[] = teams.map((team) => {
    const teamScores = scores.filter((s) => s.team_id === team.id);
    const relevant =
      selectedRound === "total"
        ? teamScores
        : teamScores.filter((s) => s.round_number === selectedRound);

    const totalPins = relevant.reduce((sum, s) => sum + s.pins, 0);
    const totalSeries = relevant.length * SERIES_PER_ROUND;
    const totalPoints = relevant.reduce(
      (sum, s) => sum + (pointsByRound.get(s.round_number)?.[team.id] ?? 0),
      0,
    );

    const roundScore =
      displayRound != null ? teamScores.find((s) => s.round_number === displayRound) : undefined;

    return {
      team,
      matchesPlayed: relevant.length,
      roundPins: roundScore ? roundScore.pins : null,
      roundPoints: roundScore ? pointsByRound.get(displayRound as number)?.[team.id] ?? 0 : null,
      totalPins,
      totalSeries,
      average: totalSeries > 0 ? totalPins / totalSeries : 0,
      totalPoints,
    };
  });

  return rows.sort(
    (a, b) =>
      b.totalPoints - a.totalPoints ||
      b.totalPins - a.totalPins ||
      a.team.name.localeCompare(b.team.name, "sv"),
  );
}

export function formatPoints(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Varje omgång spelas alltid som 8 serier per lag. */
export const SERIES_PER_ROUND = 8;

export const LANE_COUNT = 8;
export const TEAMS_PER_SESSION = 7;

export type Mix55Settings = {
  id: string;
  start_date: string; // YYYY-MM-DD (en torsdag)
  rounds_count: number;
};

export type SessionInfo = {
  index: 0 | 1;
  label: string;
  startTime: string;
  endTime: string;
};

export const MIX55_SESSIONS: SessionInfo[] = [
  { index: 0, label: "Grupp 1 (lag 1–7)", startTime: "14:00", endTime: "15:30" },
  { index: 1, label: "Grupp 2 (lag 8–14)", startTime: "15:30", endTime: "17:00" },
];

export type LaneAssignment = {
  lane: number;
  teams: Mix55Team[];
};

export type SessionSchedule = {
  session: SessionInfo;
  lanes: LaneAssignment[];
};

export type ScheduledRound = {
  round_number: number;
  date: Date;
};

/** Varannan torsdag från startdatumet. */
export function buildRoundDates(startDate: string, roundsCount: number): ScheduledRound[] {
  if (!startDate || roundsCount < 1) return [];
  const [y, m, d] = startDate.split("-").map(Number);
  const rounds: ScheduledRound[] = [];
  for (let r = 1; r <= roundsCount; r++) {
    const date = new Date(y, (m ?? 1) - 1, d ?? 1);
    date.setDate(date.getDate() + 14 * (r - 1));
    rounds.push({ round_number: r, date });
  }
  return rounds;
}

export function isThursday(dateStr: string): boolean {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).getDay() === 4;
}

/**
 * Lag 1–7 spelar första passet, lag 8–14 andra passet (ordningen styrs i admin).
 * Varje lag har egen bana och flyttar en bana per omgång.
 */
export function buildSessionSchedule(teams: Mix55Team[], roundNumber: number): SessionSchedule[] {
  return MIX55_SESSIONS.map((session) => {
    const groupTeams = teams.slice(
      session.index * TEAMS_PER_SESSION,
      session.index * TEAMS_PER_SESSION + TEAMS_PER_SESSION,
    );
    const lanes: LaneAssignment[] = Array.from({ length: LANE_COUNT }, (_, i) => ({
      lane: i + 1,
      teams: [],
    }));
    groupTeams.forEach((team, index) => {
      const laneIndex = ((index + (roundNumber - 1)) % LANE_COUNT + LANE_COUNT) % LANE_COUNT;
      lanes[laneIndex].teams.push(team);
    });
    return { session, lanes };
  });
}

export function formatRoundDay(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
