# SportPulse

Ứng dụng "Sportainment" (thể thao + giải trí tương tác) xây bằng Expo SDK 57, TypeScript strict,
Expo Router. Dự án học tập — mỗi task trong `.agents/artifacts/sprint-001/sprint_plan@v2.yaml` đi
kèm một buổi học khái niệm (xem `.agents/artifacts/learning/knowledge_summary.md`).

## Chạy dự án

App dùng native module (expo-audio, expo-notifications) nên **không chạy được bằng Expo Go** —
phải dùng Dev Client:

```bash
npm install
npx expo prebuild --clean   # sinh lại ios/ và android/ từ app.json (không sửa tay 2 thư mục này)
npx expo run:ios            # build + cài Dev Client lên Simulator, tự mở app
```

Sau lần build đầu, những lần sau chỉ cần:

```bash
npx expo start --dev-client
```

rồi mở lại app đã cài trên Simulator (tự kết nối lại Metro).

### Khi nào cần lệnh nào

| Tình huống | Lệnh |
| --- | --- |
| Thêm/xoá thư viện JS thuần (vd. `@tanstack/react-query`, `@shopify/flash-list`) | `npm install` — KHÔNG cần prebuild/build lại |
| Thêm thư viện có code native, hoặc đổi `app.json` (scheme, permission, plugin) | `npx expo prebuild --clean` rồi `npx expo run:ios` |
| Lỗi "module không tồn tại"/"unable to resolve module" | Gần như luôn là thiếu `npm install`, không phải lỗi code |
| Metro báo lỗi lạ không rõ nguyên nhân | `npx expo start --dev-client --clear` (xoá cache Metro) trước khi nghi code |

**Luôn dùng `npm`, không dùng `yarn`** — dự án có `package-lock.json`; trộn 2 package manager dễ làm
lệch cây dependency giữa các máy/session khác nhau. Sửa `package.json` (kể cả do pull code người
khác) không tự động cài gói — phải chạy `npm install` sau đó.

### Scripts khác

| Lệnh                              | Việc gì                          |
| --------------------------------- | -------------------------------- |
| `npm run typecheck`               | `tsc --noEmit`                   |
| `npm run lint`                    | ESLint                           |
| `npm run format` / `format:check` | Prettier (ghi đè / chỉ kiểm tra) |

## Cấu trúc thư mục

```
app/                  # Expo Router — CẤU TRÚC FILE = ROUTE, không có bảng khai báo route tập trung
  _layout.tsx           Root Stack + auth guard placeholder
  (tabs)/                Route group — thư mục có, URL không có
    _layout.tsx            Tabs.Screen (name khớp tên file, không phải path)
    index.tsx, trivia.tsx, leaderboard.tsx
  match/[id].tsx         Dynamic route — id luôn là string
  recap/[matchId].tsx    Route NGOÀI (tabs) — cách đúng để ẩn tab bar, không phải ẩn bằng style
  modal/quiz-room.tsx    presentation: 'modal' — vuốt xuống đóng được
  +not-found.tsx         Fallback khi không route nào khớp cấu trúc URL

src/                  # Business logic, KHÔNG đặt trong app/ (route chỉ chứa UI + điều hướng)
  theme/                 Design token: colors (light/dark), spacing, radius, typography
  components/            Button, Card, Avatar, ScoreBadge, EmptyState, LoadingSkeleton
  lib/env.ts             Đọc + validate API_URL/WS_URL từ app.json > extra

.agents/artifacts/    # Scrum + nhật ký học tập (sprint_plan, dev_report, concept_log, knowledge_summary)
```

**Convention:** `app/` chỉ chứa route (UI + điều hướng), không chứa business logic hay fetch trực
tiếp — logic thật sự đặt ở `src/`. Không hardcode màu/spacing trong component — luôn đọc từ
`src/theme` qua `useThemeColors()`. Không hardcode URL/domain ngoài `app.json` và `src/lib/env.ts`.

## Vì sao một số quyết định trông "chưa xong"

Đây là dự án học tuần tự theo khái niệm — vài chỗ cố ý để nguyên chưa tối ưu, có ghi chú `TODO`
trong code hoặc trong `knowledge_summary.md`:

- `LoadingSkeleton` chưa có animation shimmer (cần Reanimated — Sprint 3).
- Auth guard ở `app/_layout.tsx` dùng stub luôn trả về "đã đăng nhập" (auth thật — Sprint 4).
- Vài màn hình còn hardcode màu (`#ccc`, `#000`) từ trước khi `src/theme` tồn tại — chưa dọn lại,
  chờ quyết định refactor.
- Chưa có network layer (API/WebSocket thật) — `src/lib/env.ts` mới dừng ở đọc + validate URL.

## Đọc thêm

- `.agents/artifacts/sprint-001/sprint_plan@v2.yaml` — kế hoạch sprint, chia theo khái niệm học.
- `.agents/artifacts/learning/knowledge_summary.md` — nội dung từng buổi học (mental model, bẫy,
  đối chiếu cũ→mới, câu hỏi phỏng vấn liên quan).
- `.agents/artifacts/learning/concept_log.yaml` — trạng thái gate + weak points từng buổi (dữ liệu
  theo dõi, không phải nội dung ôn tập).
