export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
}

export interface BaseMatchEvent {
  id: string;
  matchId: string;
  minute: number;
}

export interface GoalEvent extends BaseMatchEvent {
  type: 'GOAL';
  teamId: string;
  scorer: string;
  assist?: string;
}

export interface CardEvent extends BaseMatchEvent {
  type: 'CARD';
  teamId: string;
  player: string;
  cardColor: 'YELLOW' | 'RED';
}

export interface StatusChangeEvent extends BaseMatchEvent {
  type: 'STATUS_CHANGE';
  newStatus: MatchStatus;
}

export type MatchEvent = GoalEvent | CardEvent | StatusChangeEvent;

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  startTime: string;
  minute?: number;
  events: MatchEvent[];
}
