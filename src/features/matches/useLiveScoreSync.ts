import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { wsClient } from '@/lib/ws-client';
import { matchKeys } from './hooks';
import type { Match, MatchEvent } from './types';

// "Reducer tính state mới" của buổi này — hàm thuần, LUÔN trả object MỚI (immutable), không sửa
// thẳng vào `match` truyền vào. Dùng chung cho cả 2 lần setQueryData (list + detail) bên dưới.
function applyEventToMatch(match: Match, event: MatchEvent): Match {
  switch (event.type) {
    case 'GOAL': {
      const isHomeTeam = event.teamId === match.homeTeam.id;
      return {
        ...match,
        homeScore: isHomeTeam ? match.homeScore + 1 : match.homeScore,
        awayScore: isHomeTeam ? match.awayScore : match.awayScore + 1,
        events: [...match.events, event],
      };
    }
    case 'CARD':
      return { ...match, events: [...match.events, event] };
    case 'STATUS_CHANGE':
      return { ...match, status: event.newStatus, events: [...match.events, event] };
    default: {
      // Exhaustiveness check (đúng bẫy #3 đã học ở TASK-1): nếu MatchEvent có thêm biến thể mới mà
      // quên xử lý ở đây, dòng này báo lỗi TYPE ngay lúc code, không phải runtime.
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}

export function useLiveScoreSync(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = wsClient.subscribe<MatchEvent>((event) => {
      // (1) Cache DETAIL — key riêng, phải tự cập nhật, setQueryData ở list không lan sang đây.
      queryClient.setQueryData<Match>(matchKeys.detail(event.matchId), (oldMatch) => {
        if (!oldMatch) return oldMatch; // chưa từng mở màn detail này — không có gì để vá
        return applyEventToMatch(oldMatch, event);
      });

      // (2) Cache LIST — key riêng khác, phải tự cập nhật riêng, tìm đúng 1 phần tử trong mảng.
      queryClient.setQueryData<Match[]>(matchKeys.lists(), (oldMatches) => {
        if (!oldMatches) return oldMatches;
        return oldMatches.map((match) =>
          match.id === event.matchId ? applyEventToMatch(match, event) : match,
        );
      });
    });

    return unsubscribe;
  }, [queryClient]);
}
