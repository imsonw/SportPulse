import { Match } from './types';

// Dữ liệu giả lập 3 trận đấu đại diện cho 3 trạng thái chính của ứng dụng Thể thao
const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    homeTeam: {
      id: 't1',
      name: 'Arsenal',
      shortName: 'ARS',
      logoUrl: 'https://media.api-sports.io/football/teams/42.png',
    },
    awayTeam: {
      id: 't2',
      name: 'Chelsea',
      shortName: 'CHE',
      logoUrl: 'https://media.api-sports.io/football/teams/49.png',
    },
    homeScore: 2,
    awayScore: 1,
    status: 'LIVE',
    startTime: '2026-09-11T10:00:00Z',
    minute: 68,
    events: [
      {
        id: 'e1',
        matchId: 'm1',
        minute: 14,
        type: 'GOAL',
        teamId: 't1',
        scorer: 'B. Saka',
        assist: 'M. Ødegaard',
      },
      {
        id: 'e2',
        matchId: 'm1',
        minute: 32,
        type: 'CARD',
        teamId: 't2',
        player: 'M. Caicedo',
        cardColor: 'YELLOW',
      },
      {
        id: 'e3',
        matchId: 'm1',
        minute: 55,
        type: 'GOAL',
        teamId: 't2',
        scorer: 'N. Jackson',
      },
      {
        id: 'e4',
        matchId: 'm1',
        minute: 61,
        type: 'GOAL',
        teamId: 't1',
        scorer: 'K. Havertz',
        assist: 'D. Rice',
      },
    ],
  },
  {
    id: 'm2',
    homeTeam: {
      id: 't3',
      name: 'Real Madrid',
      shortName: 'RMA',
      logoUrl: 'https://media.api-sports.io/football/teams/541.png',
    },
    awayTeam: {
      id: 't4',
      name: 'Barcelona',
      shortName: 'BAR',
      logoUrl: 'https://media.api-sports.io/football/teams/529.png',
    },
    homeScore: 3,
    awayScore: 2,
    status: 'FINISHED',
    startTime: '2026-09-10T19:00:00Z',
    events: [
      {
        id: 'e5',
        matchId: 'm2',
        minute: 10,
        type: 'GOAL',
        teamId: 't4',
        scorer: 'R. Lewandowski',
      },
      {
        id: 'e6',
        matchId: 'm2',
        minute: 28,
        type: 'GOAL',
        teamId: 't3',
        scorer: 'Vini Jr.',
      },
      {
        id: 'e7',
        matchId: 'm2',
        minute: 89,
        type: 'GOAL',
        teamId: 't3',
        scorer: 'J. Bellingham',
      },
    ],
  },
  {
    id: 'm3',
    homeTeam: {
      id: 't5',
      name: 'Liverpool',
      shortName: 'LIV',
      logoUrl: 'https://media.api-sports.io/football/teams/40.png',
    },
    awayTeam: {
      id: 't6',
      name: 'Manchester City',
      shortName: 'MCI',
      logoUrl: 'https://media.api-sports.io/football/teams/50.png',
    },
    homeScore: 0,
    awayScore: 0,
    status: 'SCHEDULED',
    startTime: '2026-09-12T16:30:00Z',
    events: [],
  },
];

/**
 * Giả lập API fetch danh sách trận đấu bất đồng bộ.
 * 
 * WHY: Dùng `Promise` + `setTimeout` thay vì mảng JSON đồng bộ để ép tầng UI/TanStack Query
 * phải xử lý trạng thái Loading (Skeleton) và Async Lifecycle thực tế.
 */
export const fetchMatches = async (): Promise<Match[]> => {
  // Giả lập độ trễ mạng 600ms giúp UI có khoảng thời gian hiển thị Skeleton vừa đủ để quan sát
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_MATCHES;
};

/**
 * Giả lập API fetch chi tiết một trận đấu theo ID.
 * 
 * WHY: Giữ đúng Async Signature với throw error khi không tìm thấy match,
 * giúp TanStack Query bắt đúng trạng thái isError / error.
 */
export const fetchMatchById = async (id: string): Promise<Match> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const match = MOCK_MATCHES.find((m) => m.id === id);
  if (!match) {
    throw new Error(`Trận đấu với mã #${id} không tồn tại`);
  }
  return match;
};
