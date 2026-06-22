import { z } from "zod";

/*
 Team formation service.
 - Exposes createTeams(players, options) to form teams based on skill-score balancing by default.
 - Uses Zod for runtime validation and TypeScript types for safety.
 - Pure functions to make unit testing and server-side extraction easy.
*/

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  skill: z.number().min(0).max(100).optional(),
  roles: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type Player = z.infer<typeof PlayerSchema>;

export const TeamSchema = z.object({
  id: z.string(),
  players: z.array(PlayerSchema),
});

export type Team = z.infer<typeof TeamSchema>;

export type FormationOptions = {
  teamSize: number;
  balancing?: "skill" | "roles" | "random";
  allowUneven?: boolean; // if true, last team may have fewer players
};

/* Helper: simple average skill of players in team */
function teamSkillScore(players: Player[]) {
  const values = players.map((p) => p.skill ?? 0);
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/* Primary algorithm: skill-score balancing
 Steps:
  - sort players by skill descending
  - distribute them into teams using a greedy round-robin to balance totals
*/
export function createTeams(playersInput: Player[], opts: FormationOptions) {
  const players = playersInput.map((p) => PlayerSchema.parse(p));
  const { teamSize, balancing = "skill", allowUneven = false } = opts;
  if (teamSize <= 0) throw new Error("teamSize must be > 0");

  // compute number of teams
  const teamCount = Math.max(1, Math.ceil(players.length / teamSize));

  // initialize empty teams
  const teams: Player[][] = Array.from({ length: teamCount }, () => []);

  if (balancing === "random") {
    // shuffle players and slice
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length; i++) {
      teams[i % teamCount].push(shuffled[i]);
    }
  } else if (balancing === "roles") {
    // simple roles diversity: try to spread players with the same primary role
    // For now, fallback to skill balancing when roles are sparse
    const playersByRole: Map<string, Player[]> = new Map();
    players.forEach((p) => {
      const primary = p.roles && p.roles.length ? p.roles[0] : "_none";
      if (!playersByRole.has(primary)) playersByRole.set(primary, []);
      playersByRole.get(primary)!.push(p);
    });
    // distribute per role
    let i = 0;
    playersByRole.forEach((group) => {
      group.forEach((p) => {
        teams[i % teamCount].push(p);
        i++;
      });
    });
  } else {
    // skill balancing
    const sorted = [...players].sort((a, b) => (b.skill ?? 0) - (a.skill ?? 0));
    // use greedy assignment: always insert next highest player into the team with lowest average
    for (const p of sorted) {
      // find team with lowest skill score or least players
      let bestIndex = 0;
      let bestScore = Infinity;
      for (let i = 0; i < teams.length; i++) {
        const t = teams[i];
        // if team already at desired size and uneven not allowed, deprioritize
        if (!allowUneven && t.length >= teamSize) continue;
        const score = teamSkillScore(t);
        if (t.length === 0) {
          // prefer empty teams first to ensure spread
          bestIndex = i;
          bestScore = -Infinity;
          break;
        }
        if (score < bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      }
      teams[bestIndex].push(p);
    }
  }

  // If uneven not allowed, enforce exact teamSize by moving players from the end
  if (!allowUneven) {
    // flatten and refold to ensure each team up to teamSize
    const flat = teams.flat();
    const result: Player[][] = Array.from({ length: teamCount }, () => []);
    for (let i = 0; i < flat.length; i++) {
      const tIndex = Math.floor(i / teamSize);
      if (tIndex < teamCount) result[tIndex].push(flat[i]);
    }
    // map to TeamSchema
    return result.map((players, idx) => ({ id: `team_${idx + 1}`, players }));
  }

  return teams.map((players, idx) => ({ id: `team_${idx + 1}`, players }));
}

export default { createTeams };
