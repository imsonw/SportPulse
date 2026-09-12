import { useQuery } from '@tanstack/react-query';
import { fetchMatchById, fetchMatches } from './api';

/**
 * Single Source of Truth cho tất cả Query Keys của feature Matches.
 *
 * WHY: Dùng Query Key Factory (object chứa các hàm/mảng key) giúp tránh hardcode
 * string rải rác trong dự án, đảm bảo tự động khớp phân cấp (hierarchical matching)
 * khi invalidateQueries hoặc setQueryData sau này.
 */
export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
};

/**
 * Custom Hook fetch danh sách tất cả các trận đấu.
 *
 * WHY:
 * 1. Bọc useQuery vào Custom Hook để UI Component không phải import trực tiếp API hay nhớ QueryKey.
 * 2. staleTime: 30s — Trong 30s dữ liệu được coi là Fresh, không refetch ngầm khi chuyển màn.
 */
export function useMatches() {
  return useQuery({
    queryKey: matchKeys.lists(),
    queryFn: fetchMatches,
    staleTime: 1000 * 30,
  });
}

/**
 * Custom Hook fetch chi tiết một trận đấu theo ID.
 *
 * WHY:
 * enabled: !!id — Chỉ thực thi query khi ID hợp lệ (không phải undefined/chuỗi rỗng),
 * tránh gửi request rác khi route chưa đọc xong param.
 */
export function useMatchDetail(id: string) {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: () => fetchMatchById(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  });
}
