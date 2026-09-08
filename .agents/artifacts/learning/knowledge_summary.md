# SportPulse — Nhật ký kiến thức

File này tổng hợp lại nội dung thật sự của mỗi buổi học (không phải dữ liệu theo dõi — xem
`concept_log.yaml` cho gate/weak_points). Đọc lại file này để ôn, không cần lục lại transcript.

---

## Buổi 1 — TASK-1: Continuous Native Generation (CNG)
**Ngày:** 2026-09-07

**Vấn đề:** RN cũ coi `ios/`/`android/` là source code, gây 4 nỗi đau kinh điển: upgrade RN phải
diff tay, cài lib native mỗi thư viện một kiểu, `project.pbxproj` không merge được, "máy tôi chạy
được".

**Mental model:** `app.json` (+ config plugin) là **INPUT**, `ios/`/`android/` là **OUTPUT** sinh ra
bởi `npx expo prebuild`. Giống XcodeGen/Tuist (`project.yml` → `.xcodeproj`), khác `node_modules`
(chỉ tải nguyên xi) ở chỗ CNG có bước **biến đổi** qua các "mod" — đây là chỗ config plugin cắm vào.

**Đối chiếu cũ → mới:**
| | Cũ | Mới (CNG) |
|---|---|---|
| Thêm key Info.plist | Mở Xcode, gõ tay | Khai báo trong `app.json` → mod ghi hộ |
| Upgrade SDK | Diff tay hàng trăm dòng | Đổi version → prebuild lại |
| `ios/` trong git | Có, là source | Không, là artifact |
| `expo eject` (khai tử) | Cửa một chiều | `expo prebuild` — chạy lại được bao nhiêu lần tuỳ thích |

**Ranh giới thật sự không phải** "có thư mục `ios/` hay không" (chỉ là trạng thái tạm) **mà là**
"bạn có sửa tay native hay không" (hành vi quyết định có quay lại CNG an toàn được không).

**Bẫy:** mở Xcode sửa tay (mất khi prebuild lại) · commit `ios/` (gây *silent drift* — đồng đội pull
`app.json` mới nhưng `ios/` cũ chưa đồng bộ, không ai báo lỗi) · tưởng "có `ios/`" = "đã eject".

**Quyết định:** Khởi tạo bằng `create-expo-app@latest` (SDK 57). Xác nhận `.gitignore` mặc định của
Expo đã tự loại `/ios`, `/android` — đúng bài học vừa dạy.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — không có nguyên văn trong JD gốc, nhưng đúng chủ
đề "quy trình dev/release" hay bị hỏi khi ứng viên có Expo trong CV):*

> **Q: Bạn cần thêm một quyền native (VD Bluetooth) vào app Expo. Bạn sửa ở đâu, và vì sao không
> mở Xcode/Android Studio sửa trực tiếp?**
> A: Khai báo trong `app.json` qua config plugin, rồi chạy `expo prebuild` để nó sinh lại
> `Info.plist`/`AndroidManifest.xml`. Không sửa tay vì `ios/`/`android/` là **artifact sinh ra**,
> không phải source — sửa tay sẽ mất ngay ở lần prebuild kế tiếp, và nếu commit các thư mục đó vào
> git thì tạo ra "silent drift": đồng đội pull `app.json` mới nhưng bản native cũ chưa đồng bộ,
> không ai báo lỗi cho tới khi tính năng đó fail lúc chạy thật.

---

## Buổi 2 — TASK-2: `app.json` là single source of truth
**Ngày:** 2026-09-07

**Vấn đề:** 5 trường cấu hình trông giống nhau (`name`, `slug`, `scheme`, `ios.bundleIdentifier`,
`android.package`) nhưng phục vụ 5 hệ thống khác nhau — nhầm lẫn lộ ra rất muộn (thường lúc đã
submit App Store).

**Mental model — ai đọc trường nào:**
| Trường | Ai đọc | Đổi sau có sao không |
|---|---|---|
| `name` | Home screen | An toàn |
| `slug` | Expo/EAS (dashboard nội bộ Expo, KHÔNG lên store) | An toàn, chỉ mất liên kết EAS project cũ |
| `scheme` | Hệ điều hành (deep link `sportpulse://`) | Link cũ đã phát tán sẽ chết |
| `ios.bundleIdentifier` | **Apple** — ID vĩnh viễn trên App Store | **Nguy hiểm nhất** |
| `android.package` | **Google** — ID vĩnh viễn trên Play Store | Tương tự |

**Đối chiếu cũ → mới:** Info.plist/AndroidManifest/Xcode Signing rải rác → gom về `app.json` (tĩnh,
JSON thuần, không đọc `process.env`). Cần multi-environment (dev/staging/prod đổi bundleIdentifier)
thì dùng `app.config.ts` (JS/TS, có logic) — Sprint 1 chưa cần, dùng `app.json` tĩnh là đủ.

**Bẫy:** đổi `bundleIdentifier` sau khi lên store = **tạo app hoàn toàn mới** trong mắt Apple/Google
(mất review, rating, user cũ không nhận update) — không phải "sửa app cũ". Nhầm `slug` (chỉ nội bộ
Expo) với `bundleIdentifier` (định danh trên store) vì cả hai đều "trông như ID dự án".

**Quyết định & vì sao:**
```json
"name": "SportPulse"                          // lựa chọn, đổi tự do
"slug": "sportpulse"                          // lựa chọn, rủi ro thấp
"scheme": "sportpulse"                        // lựa chọn nhưng đổi sau thì link chết
"ios.bundleIdentifier": "com.sportpulse.app"  // BẮT BUỘC đúng ngay từ đầu — vĩnh viễn
"android.package": "com.sportpulse.app"       // BẮT BUỘC đúng ngay từ đầu — vĩnh viễn
```

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — liên quan trực tiếp chủ đề "Release Store" trong
JD, dù không trích nguyên văn):*

> **Q: Team bạn lỡ đổi `bundleIdentifier` của một app đã lên App Store rồi build release lại. Điều
> gì xảy ra, và làm sao tránh lỗi này trong quy trình release?**
> A: Apple dùng `bundleIdentifier` làm khoá định danh **vĩnh viễn** — đổi nó không phải "cập nhật
> app cũ" mà tạo ra **một app hoàn toàn mới** trong hệ thống của Apple: mất sạch review, rating,
> lịch sử, và user đã cài bản cũ không nhận được bản update (vì App Store coi đây là hai app khác
> nhau). Để tránh: khoá field này ngay từ lần đầu tiên tạo project, không để nó nằm trong biến môi
> trường có thể đổi qua lại giữa các lần build release — nếu cần bundleIdentifier khác nhau giữa
> dev/staging/production thì dùng `app.config.ts` với logic rõ ràng, review kỹ trước khi build
> production, không sửa tay ngẫu hứng.

---

## Buổi 3 — TASK-3: New Architecture (JSI/Fabric/TurboModule/Codegen) vs Bridge cũ
**Ngày:** 2026-09-08

**Vấn đề Bridge cũ:** JS thread và Native thread tách biệt, chỉ nói chuyện qua hàng đợi bất đồng bộ:
serialize JSON → batch theo frame → gửi bất đồng bộ → deserialize. Hệ quả: không bao giờ đồng bộ
được, tốn chi phí serialize, độ trễ tối thiểu 1 frame do batch.

**Mental model:**
```
Cũ:  JS ⇄ [serialize JSON] ⇄ Bridge (async, batch theo frame) ⇄ [deserialize] ⇄ Native
Mới: JS ⇄ gọi hàm C++ trực tiếp qua JSI (đồng bộ, chia sẻ bộ nhớ) ⇄ Native
```

| Mảnh ghép | Thay thế cho | Vai trò | Ví dụ cụ thể |
|---|---|---|---|
| **TurboModule** | Native Module cũ | Gọi qua JSI (đồng bộ được), **lazy load** — chỉ khởi tạo khi JS gọi lần đầu | Cold start nhanh hơn vì không khởi tạo hết mọi module lúc mở app |
| **Fabric** | UIManager cũ | Shadow tree dùng chung C++, đo layout đồng bộ, render ngắt được (concurrent) | FlatList 10k item không giật vì không cần round-trip bridge để đo |
| **Codegen** | (không có ở Bridge cũ) | Chạy **build time**, sinh code C++/ObjC/Java từ spec TypeScript | Sai kiểu (String vs Int) lỗi ngay lúc build, không phải lặng lẽ crash runtime |

**Bẫy:** tưởng bật New Arch là mọi lib bên thứ 3 tự nhanh hơn ngay (sai — tác giả lib phải viết lại
theo spec TurboModule/Fabric) · tưởng Codegen chạy runtime (sai — chạy build time) · nhầm "Fabric"
với Fabric.js (thư viện canvas web, trùng tên ngẫu nhiên).

**⚠️ Phát hiện quan trọng (kiểm chứng qua docs.expo.dev/v57.0.0, không đoán):**
> SDK 55+ chạy New Architecture **vô điều kiện, không thể tắt**. Old Architecture bị *frozen* từ
> 6/2025. Field `newArchEnabled` bị bỏ qua hoàn toàn ở SDK 55+ — Expo khuyến nghị **xoá field này**
> nếu có, tránh gây hiểu nhầm.

Project dùng `expo ~57.0.20` → **TASK-3 không sửa file nào**. Lý thuyết JSI/Fabric/TurboModule/
Codegen vẫn đúng 100% — chỉ khung "flag bật/tắt hai kiến trúc song song" là lỗi thời với version
này. Bài học quy trình: luôn kiểm chứng version-specific fact bằng docs thật trước khi code, đừng
tin giả định viết từ trước (kể cả giả định của chính sprint plan).

**Câu hỏi phỏng vấn liên quan** *(TRÙNG NGUYÊN VĂN một câu trong JD — Section I):*

> **Q: Trình bày kiến trúc New Architecture của React Native (JSI, Fabric, TurboModules, Codegen).
> Điểm khác biệt cốt lõi về cơ chế giao tiếp so với Old Architecture (Bridge/JSON serialization) là
> gì?**
> A: Ở Bridge cũ, JS thread và Native thread tách biệt hoàn toàn, chỉ nói chuyện qua một hàng đợi
> **bất đồng bộ**: mọi lời gọi native đều bị **serialize thành JSON**, gom **batch theo frame**,
> gửi qua bridge, rồi native deserialize và thực thi — kết quả trả về cũng qua lại đúng một vòng
> như vậy. Hệ quả là không bao giờ gọi native đồng bộ được, và luôn có độ trễ tối thiểu một frame.
> New Architecture xây trên **JSI** — một lớp C++ cho phép JS engine giữ tham chiếu trực tiếp tới
> object native, gọi được **đồng bộ, chia sẻ bộ nhớ, không serialize**. Trên nền JSI đó:
> **TurboModule** thay Native Module cũ, thêm khả năng **lazy load** (chỉ khởi tạo khi JS gọi lần
> đầu, giúp cold start nhanh hơn); **Fabric** thay UIManager, dùng shadow tree C++ dùng chung giữa
> JS/native nên đo layout đồng bộ được, hỗ trợ render ngắt được (concurrent); **Codegen** chạy ở
> **build time**, sinh code C++/ObjC/Java từ spec TypeScript, bắt lỗi sai kiểu lúc biên dịch thay
> vì runtime. Tóm lại: khác biệt cốt lõi không phải "nhanh hơn" chung chung, mà là **bỏ hẳn bước
> serialize + hàng đợi bất đồng bộ, thay bằng lời gọi hàm trực tiếp qua JSI**.
