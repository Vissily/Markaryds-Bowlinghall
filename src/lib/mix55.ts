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
    const totalSeries = relevant.reduce((sum, s) => sum + s.series, 0);
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

