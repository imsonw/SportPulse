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

---

## Buổi 4 — TASK-4: Expo Dev Client vs Expo Go — vì sao Go không đủ cho dự án này
**Ngày:** 2026-09-08

**Vấn đề:** Ứng dụng Expo Go chỉ là một bản build ứng dụng chung cố định (Pre-compiled Binary) từ Expo team đăng tải lên App Store / Google Play. Khi dự án thêm các thư viện chứa mã Native custom (Swift/Kotlin/C++) hoặc config plugin đặc thù không nằm trong SDK cố định của Expo Go, Expo Go sẽ báo lỗi `Module not found` hoặc `Native module cannot be null`.

**Mental model:**
- **Expo Go**: App chung của Expo trên App Store + Metro JS loader. Không hỗ trợ mã Native custom ngoài danh sách có sẵn.
- **Expo Dev Client (`expo-dev-client`)**: Bản build ứng dụng **SportPulse** của chính bạn (`com.sportpulse.app`), chứa đầy đủ mã Native custom + Dev Menu UI (lắc máy, quét QR, đổi server Metro, xem log).
- **Production Build**: Bản build ứng dụng **SportPulse** chính thức phát hành trên App Store / TestFlight (đã gỡ bỏ Dev Menu UI để tối ưu dung lượng và bảo mật).

**Đối chiếu:**
| Tiêu chí | Expo Go | Expo Dev Client (Dev Build) | Production Build |
|---|---|---|---|
| **Bản chất** | App chung từ App Store | App **SportPulse** của chính bạn | App **SportPulse** chính thức |
| **Native Code** | Cố định (chỉ có sẵn Expo SDK) | **Không giới hạn** (Custom Swift/Kotlin/Plugins) | **Không giới hạn** |
| **Dev Tools** | Có (Metro loader, QR scanner) | Có (`expo-dev-client` nhúng trong app) | Không |

**Bẫy:**
- Nhầm tưởng Expo Dev Client là một ứng dụng bên thứ ba khác (Sai — nó chính là ứng dụng SportPulse của bạn trên Simulator/Thiết bị thật có nhúng thêm Dev Menu UI).
- Tưởng xóa cache hay restart Metro (`npx expo start --clear`) sẽ sửa được lỗi thiếu Native module trên Expo Go (Sai — Metro chỉ đóng gói JS Bundle, tầng Native binary của Expo Go chưa từng được biên dịch cùng mã native mới).
- Cố cài thư viện khác phiên bản tương thích với Expo SDK mà không dùng `npx expo install` (gây mismatch tên hàm Native ở tầng JSI/Bridge).

**Quyết định & Thực thi:**
Cài đặt `expo-dev-client` vào `package.json` qua `npx expo install expo-dev-client`. Đã xác nhận `package.json` bổ sung `"expo-dev-client": "~57.0.18"`.

**Câu hỏi phỏng vấn liên quan:**

> **Q: Khi nào dự án Expo của bạn buộc phải chuyển từ Expo Go sang Expo Dev Client (Development Build), và sự khác biệt về mặt kiến trúc giữa hai mô hình này là gì?**
> A: Dự án buộc phải chuyển sang Dev Client ngay khi xuất hiện các yêu cầu nằm ngoài tập thư viện cố định của Expo Go: cài các thư viện React Native của bên thứ 3 chứa native code custom (như Bluetooth BLE, WebRTC, Firebase Native SDK...), dùng custom Config Plugin đặc thù, hoặc tự viết module Swift/Kotlin riêng. Về mặt kiến trúc: Expo Go là một ứng dụng **Pre-compiled Binary** cố định do Expo team đăng lên App Store để làm "trình duyệt JS". Còn Expo Dev Client là bản build **dự án của chính bạn** (biên dịch đầy đủ mọi thư viện Native qua `expo prebuild` + Xcode) có nhúng thêm gói `expo-dev-client` để cung cấp giao diện Developer Tools (lắc máy, quét QR, hot reload JS) trực tiếp bên trong ứng dụng.

---

## Buổi 5 — TASK-5: Config Plugin — Khai báo quyền và cấu hình Native bằng JavaScript
**Ngày:** 2026-09-08

**Vấn đề:** Trong mô hình CNG, các thư mục `ios/` và `android/` chỉ là **ARTIFACT SINH RA**. Nếu lập trình viên sửa thủ công `Info.plist` trong Xcode hay `AndroidManifest.xml` trong Android Studio, các thay đổi đó sẽ bị **xóa sạch** ở lần prebuild kế tiếp.

**Mental model:**
- Config Plugin là các hàm JS/TS chạy ở **Build-time** (Node.js) khi thực hiện `npx expo prebuild`.
- Plugin đóng vai trò như các "con thoi/mod tự động" can thiệp vào AST để sửa file XML (`Info.plist` / `AndroidManifest.xml` / `Podfile`) một cách an toàn và nhất quán.

**Đối chiếu:**
| Tiêu chí | Config Plugin | Runtime Library |
|---|---|---|
| **Môi trường** | Máy lập trình viên (Node.js) | Điện thoại người dùng (JS Engine) |
| **Thời điểm** | Build-time (`npx expo prebuild`) | Runtime (khi app đang chạy) |
| **Khai báo** | `app.json` (mảng `"plugins"`) | Trong file `.tsx` (`import * as Haptics...`) |

**Bẫy:**
- Mở Xcode / Android Studio sửa tay permission description (sẽ mất sạch ở lần `expo prebuild --clean` kế tiếp).
- Viết thông điệp xin quyền mơ hồ (Apple sẽ Reject app theo Guideline 5.1.1).
- Trộn lẫn nhiệm vụ của Config Plugin (tạo cấu hình Native lúc build) với Runtime Library (thực thi hàm lúc app chạy).

**Quyết định & Thực thi:**
Cấu hình mảng `"plugins"` trong [app.json](file:///Users/sion-dev/Documents/my_project/SportPulse/app.json#L27-L36):
- `expo-audio` kèm `microphonePermission` giải thích bằng Tiếng Việt rõ ràng cho phòng Trivia/Quiz giọng nói.
- `expo-haptics`.
- `expo-notifications`.

**Câu hỏi phỏng vấn liên quan:**

> **Q: Trong ứng dụng Expo, làm thế nào để khai báo các quyền truy cập Native (như Microphone, Location, Push Notification) và câu giải thích lý do xin quyền mà không làm vi phạm nguyên tắc Continuous Native Generation (CNG)?**
> A: Khai báo các thư viện native dưới dạng **Config Plugins** trong mảng `"plugins"` của file `app.json` kèm theo đối tượng tùy chỉnh (options) chứa thông điệp xin quyền. Khi chạy `npx expo prebuild`, các hàm plugin này sẽ đóng vai trò như các mod chạy ở Build-time (Node.js) để can thiệp và tự động ghi các key tương ứng (như `NSMicrophoneUsageDescription`) vào file `Info.plist` hay `AndroidManifest.xml`. Cách làm này đảm bảo mã cấu hình native được lưu trữ ở duy nhất một nơi tĩnh (`app.json`), không bị mất đi khi prebuild lại và tuyệt đối tránh việc sửa tay trực tiếp trong Xcode/Android Studio.

---

## Buổi 6 — TASK-6: Vòng đời Prebuild & CNG Artifacts
**Ngày:** 2026-09-08

**Vấn đề:** 
Lập trình viên từ stack cũ quen commit mọi file trong `ios/` & `android/` vào Git. Khi có sự thay đổi về cấu hình native trong `app.json` hoặc nâng cấp SDK, các thư mục native trong Git sẽ bị lệch khỏi cấu hình nguồn (*silent drift*), dẫn đến lỗi xung đột code native không thể tháo gỡ hoặc app crash lúc chạy thật.

**Mental model:**
- Thư mục `ios/` & `android/` trong CNG **tương tự như thư mục `dist/` hoặc `build/`** trong dự án Web/TypeScript.
- `app.json` + Config Plugins + Dependencies = **Source Code gốc (Single Source of Truth)**.
- `npx expo prebuild --clean` là thao tác xoá sạch các thư mục native cũ và sinh lại từ đầu (Reproducible Pure Build Artifact).

**Đối chiếu cũ → mới:**
| Tiêu chí | Native iOS / Bare RN cũ | Expo CNG (Continuous Native Generation) |
|---|---|---|
| **Vai trò của `ios/`** | Source code chính chủ, **commit vào Git** | Build artifact sinh ra tự động, **nằm trong `.gitignore`** |
| **Sửa đổi Native** | Xcode (`Info.plist`, `Podfile`, `AppDelegate`) | `app.json` & Config Plugins JS |
| **Reset cấu hình Native** | Sửa tay từng dòng diff Xcode/Pods | `npx expo prebuild --clean` |

**Bẫy:**
1. Lầm tưởng `expo prebuild` là hành động "Eject" cố định không thể quay lại Managed Workflow (Sai — prebuild trong CNG là thao tác lặp lại được vô số lần).
2. Đưa các gói thuần Native Autolink (như `expo-haptics`) vào mảng `plugins` trong `app.json` khiến Config Plugin loader báo lỗi không tìm thấy `app.plugin.js`. Chỉ các gói có Config Plugin can thiệp `Info.plist`/`Manifest` (như `expo-audio`, `expo-notifications`) mới nằm trong mảng `plugins`.

**Quyết định & Thực thi:**
1. Cập nhật [`.gitignore`](file:///Users/sion-dev/Documents/my_project/SportPulse/.gitignore) bổ sung ghi chú rõ ràng về CNG Native Artifacts (`/ios`, `/android`).
2. Điều chỉnh [`app.json`](file:///Users/sion-dev/Documents/my_project/SportPulse/app.json) gỡ `"expo-haptics"` khỏi mảng `plugins` (vì `expo-haptics` tự autolink qua Expo Modules API mà không cần config plugin riêng).
3. Chạy thành công `npx expo prebuild --clean --no-install` xác nhận sinh thư mục native sạch sẽ từ `app.json`.

**Câu hỏi phỏng vấn liên quan:**

> **Q: Lập trình viên trong team lỡ commit thư mục `ios/` lên Git và tự ý mở Xcode sửa thủ công một key trong `Info.plist`. Hai hậu quả lớn nhất hệ thống CNG của Expo sẽ gặp phải ở các lần prebuild tiếp theo là gì?**
> A: **Thứ nhất**, bất kỳ chỉnh sửa thủ công nào trực tiếp trong Xcode đều sẽ bị **xoá sạch không báo trước** ngay khi ai đó trong team gõ lệnh `npx expo prebuild --clean`. **Thứ hai**, nếu lỡ commit `ios/` vào Git, khi các thành viên khác cập nhật `app.json` hoặc cài thêm Config Plugin mới và prebuild lại, Git sẽ xảy ra **silent drift** (lệch cấu hình native) và sinh ra hàng trăm diff xung đột không thể merge thủ công ở file `project.pbxproj` hay `Podfile`. Vì vậy trong CNG, `ios/` và `android/` bắt buộc phải nằm trong `.gitignore`.

---

## Buổi 7 — TASK-7: TypeScript Strict Mode & Lá chắn Runtime
**Ngày:** 2026-09-08

**Vấn đề:** 
Khi từ bỏ Redux-Saga để chuyển sang Zustand + TanStack Query, dữ liệu từ server đi trực tiếp vào các UI Hook. Trong quá trình fetch (`isLoading = true`), `data` trả về luôn là `undefined`. Nếu không có `strictNullChecks`, trình biên dịch sẽ không cảnh báo và ứng dụng sẽ crash lập tức khi render với lỗi `TypeError: Cannot read property 'X' of undefined`.

**Mental model:**
- `strict: true` trong TypeScript đóng vai trò tương tự hệ thống **Type Safety & Optionals của Swift Compiler**.
- Ép buộc xử lý mọi trường hợp `undefined` / `null` ngay tại thời điểm Compile-time thay vì để trôi ra Runtime.

**Đối chiếu cũ → mới:**
| Tiêu chí | Redux + Saga (Stack cũ) | TanStack Query + Zustand (Stack mới) |
|---|---|---|
| **Quản lý Nullable Data** | Reducer có initial state bọc sẵn, bọc qua Reselect | `useQuery` nhận trực tiếp từ Server, ban đầu luôn `undefined` |
| **Bảo vệ Runtime** | Trông chờ vào `try-catch` trong Saga | **`strictNullChecks` là tấm lá chắn duy nhất** |
| **Ép kiểu (`as any`, `!`)** | Lỗi runtime có thể bị nuốt trôi | **Là "hành vi tự sát"** làm vô hiệu hoá trình biên dịch |

**Bẫy:**
1. Dùng `!` (Non-null assertion) hoặc `as any` để "dập" cảnh báo của TypeScript mà không kiểm tra thực tế, làm app crash ở runtime khi data thực sự bị `undefined`.
2. Không phân biệt 2 cách xử lý: Safe Access (`?.` + `??`) thích hợp render inline UI nhỏ; còn Early Return / Type Guard thích hợp cho các màn hình chính để không render UI rỗng.

**Quyết định & Thực thi:**
1. Xác minh file [`tsconfig.json`](file:///Users/sion-dev/Documents/my_project/SportPulse/tsconfig.json) có cấu hình `"strict": true` kế thừa từ `expo/tsconfig.base`.
2. Thực thi `npx tsc --noEmit` xác nhận toàn bộ dự án sạch lỗi Typecheck.

**Câu hỏi phỏng vấn liên quan:**

> **Q: Khi chuyển đổi ứng dụng từ Redux-Saga sang TanStack Query + Zustand, tại sao cấu hình `strict: true` (đặc biệt là `strictNullChecks`) lại trở thành yếu tố bắt buộc chứ không còn là tuỳ chọn?**
> A: Ở kiến trúc Redux-Saga cũ, dữ liệu thường được bọc qua Initial State của Reducer hoặc Selector nên hiếm khi bị `undefined` đột ngột ở UI component. Nhưng với TanStack Query, dữ liệu từ server đi trực tiếp vào Hook — trong thời gian `isLoading`, `data` **luôn có giá trị là `undefined`**. Nếu không bật `strictNullChecks`, trình biên dịch sẽ không bắt buộc bạn kiểm tra giá trị `undefined`, dẫn đến việc UI cố truy cập thuộc tính con và crash ứng dụng lập tức với lỗi `Cannot read property 'x' of undefined`. `strictNullChecks` giúp chuyển toàn bộ các nguy cơ crash runtime này thành lỗi compile-time ngay khi gõ code.

---

## Buổi 8 — TASK-8: Module Resolution 2 Tầng (TypeScript vs Metro Bundler)
**Ngày:** 2026-09-08

**Vấn đề:** 
Đường dẫn tương đối `../../../../components/Button` dài và dễ gãy. Tuy nhiên, nếu chỉ khai báo Path Alias trong `tsconfig.json`, VSCode sẽ hết báo đỏ nhưng Metro Bundler (gói code chạy trên đĩa cứng) vẫn crash với lỗi `Unable to resolve module '@/components/Button'`.

**Mental model:**
- **TypeScript Compiler (`tsc` / VSCode Editor)**: Đọc `tsconfig.json` → Kiểm tra kiểu & gợi ý Intellisense ở thời điểm Dev.
- **Metro Bundler (Expo Metro)**: Đọc Babel/Metro resolution config → Đóng gói code gửi cho JS Engine trên điện thoại ở thời điểm Runtime.
- Cả 2 tầng phải đồng bộ cấu hình alias.

**Đối chiếu cũ → mới:**
| Tiêu chí | React Native CLI cũ | Expo SDK 57 (Hiện tại) |
|---|---|---|
| **Cấu hình Alias** | Khai báo 2 nơi thủ công (`tsconfig.json` + `babel.config.js` via `babel-plugin-module-resolver`) | Expo Router / Metro của SDK 57 **tự động đồng bộ `paths` từ `tsconfig.json`** cho Metro. |
| **Deprecation TS 6.0+** | Yêu cầu `baseUrl: "."` kèm `paths` | TS 5.4+ / TS 6.0+ **bỏ `baseUrl`**, `paths` dùng tương đối trực tiếp: `"@/*": ["./src/*"]`. |

**Bẫy:**
1. Khai báo `paths` trong `tsconfig.json` rồi không test thử với Metro Bundler thật.
2. Dùng `baseUrl: "."` trong TypeScript 6.0+ dẫn đến lỗi deprecation warning `TS5101`.

**Quyết định & Thực thi:**
1. Cập nhật [`tsconfig.json`](file:///Users/sion-dev/Documents/my_project/SportPulse/tsconfig.json) bổ sung cấu hình `"paths": { "@/*": ["./src/*"] }` chuẩn TypeScript 6.0 (không dùng `baseUrl`).
2. Chạy thành công `npx tsc --noEmit` và `npx expo config --type prebuild` xác nhận 2 tầng TSCompiler và Metro Bundler đều đồng bộ sạch sẽ.

**Câu hỏi phỏng vấn liên quan:**

> **Q: Bạn cấu hình Path Alias `@/` trong `tsconfig.json` thấy VSCode Intellisense gợi ý rất mượt và `npx tsc --noEmit` không báo lỗi, nhưng khi chạy app trên Simulator lại crash lỗi `Unable to resolve module`. Nguyên nhân do đâu và cách khắc phục là gì?**
> A: Nguyên nhân là do **Module Resolution 2 tầng** trong React Native. `tsconfig.json` chỉ phục vụ duy nhất cho **TypeScript Compiler / VSCode Editor** để kiểm tra kiểu tĩnh và gợi ý code, không có nhiệm vụ đóng gói code JS. Công cụ thực sự đi tìm file trên đĩa cứng để ship lên điện thoại là **Metro Bundler**. Nếu Metro Bundler chưa được cấu hình để hiểu `@/` (ví dụ thông qua `babel-plugin-module-resolver` ở RN CLI hoặc thông qua Expo Router automatic tsconfig resolution ở Expo SDK 57), Metro sẽ không tìm thấy module và báo lỗi. Khắc phục: Đảm bảo tầng Bundler (Metro/Babel) đã được cấu hình đồng bộ với `paths` trong `tsconfig.json`.

---

## Buổi 9 — TASK-9: ESLint vs Prettier & QA Gate Scripts
**Ngày:** 2026-09-08

**Vấn đề:** 
Trộn lẫn Linter và Formatter khiến CI pipeline và Git hook bị rối loạn: lập trình viên bị bối rối không biết CI fail là do lỗi formatting thẩm mỹ (như dấu ngoặc, thụt lề) hay do lỗi bug logic nghiêm trọng (như chưa cleanup `useEffect`, biến chưa dùng).

**Mental model:**
- **ESLint (Linter)**: "Bác sĩ chẩn đoán bệnh". Soi cấu hình AST để phát hiện bug logic, missing dependency array, unused variables, code smells.
- **Prettier (Formatter)**: "Thợ trang điểm". Quan tâm đến tính nhất quán thẩm mỹ (thụt lề, single quote, trailing comma). Không quan tâm code có bug hay không.

**Đối chiếu cũ → mới:**
| Tiêu chí | Cấu hình cũ (Trộn lẫn) | Cấu hình hiện đại (Tách bạch) |
|---|---|---|
| **Vận hành** | Nhúng Prettier vào ESLint (`eslint-plugin-prettier`) | Tách riêng: ESLint soi bug (`lint`), Prettier format thẩm mỹ (`format`) |
| **QA Gate** | CI báo đỏ ngợp màn hình vì lỗi thiếu dấu phẩy | 分 (Phân loại rõ): `npm run typecheck`, `npm run lint`, `npm run format:check` |

**Bẫy:**
1. Tưởng dùng Prettier là code đã sạch bug (Sai — Prettier không soi được bug logic).
2. Ép ESLint đi sửa thụt lề thay vì để Prettier tự động sửa hàng trăm file trong 1 giây.

**Quyết định & Thực thi:**
1. Cài đặt các gói `eslint-config-expo`, `prettier`, `eslint-config-prettier`.
2. Tạo file [`.prettierrc`](file:///Users/sion-dev/Documents/my_project/SportPulse/.prettierrc) và [`.eslintrc.js`](file:///Users/sion-dev/Documents/my_project/SportPulse/.eslintrc.js).
3. Tạo [`.prettierignore`](file:///Users/sion-dev/Documents/my_project/SportPulse/.prettierignore) loại trừ các thư mục artifacts/ và node_modules/.
4. Cập nhật [`package.json`](file:///Users/sion-dev/Documents/my_project/SportPulse/package.json) bổ sung bộ QA Scripts:
   - `"typecheck": "tsc --noEmit"`
   - `"lint": "expo lint"`
   - `"format": "prettier --write ."`
   - `"format:check": "prettier --check ."`
5. Chạy thành công `npm run typecheck && npm run format:check` xác nhận dự án đạt chuẩn QA Gate.

**Câu hỏi phỏng vấn liên quan:**

> **Q: Trong quy trình CI/CD cho dự án React Native, tại sao người ta khuyến nghị tách riêng bước `lint` (ESLint) và bước `format:check` (Prettier) thay vì tích hợp Prettier chạy trực tiếp bên trong ESLint plugin?**
> A: Tách riêng giúp phân loại chính xác **bản chất của lỗi** và tối ưu tốc độ CI. ESLint chuyên đóng vai trò "chẩn đoán lỗi logic" (như missing deps trong `useEffect`, unhandled promise, unused vars) — nếu bước `lint` fail, đó là **lỗi chất lượng code nghiêm trọng** bắt buộc dev phải sửa logic. Còn Prettier chỉ chuyên về "thẩm mỹ trình bày" — nếu bước `format:check` fail, dev chỉ cần chạy `npm run format` để công cụ tự tự động sửa trong 1 giây mà không phải sửa tay từng dấu ngoặc. Tách riêng cũng giúp ESLint chạy nhanh hơn gấp nhiều lần vì không phải gánh thêm phần tính toán layout/formatting.

---

## Buổi 10 — TASK-10: File-based routing — cấu trúc thư mục chính là bảng route
**Ngày:** 2026-09-08

**Vấn đề:** React Navigation kiểu cũ cần một file khai báo navigator tập trung (liệt kê từng
Screen bằng tay). Expo Router bỏ hẳn file đó — **cấu trúc thư mục trong `app/` chính là bảng route**.

**Mental model:** Tạo file = tạo route. Đổi tên file = đổi URL. `index.ts` không còn đăng ký
`App.tsx` trực tiếp nữa — nó trỏ vào `expo-router/entry`, để Expo Router tự quét `app/` và dựng
bảng route lúc khởi động.

**Đối chiếu cũ → mới:** `NavigationContainer` + `Stack.Navigator` khai báo tay từng `<Screen>` →
thay bằng cây thư mục vật lý. `router.push()` vs `router.navigate()` không tương đương: `push`
luôn thêm màn mới vào Stack (kể cả khi đã có sẵn), `navigate` nhảy về màn đã tồn tại trong Stack
nếu có, chỉ push mới khi chưa tồn tại — chọn sai gây tích luỹ Stack vô nghĩa.

**Bẫy:** viết đường dẫn thiếu dấu `/` ở đầu (VD `match/456` thay vì `/match/456`) — Expo Router
resolve theo route hiện tại nếu thiếu dấu `/`, dễ sai khi gọi từ màn đã nested sâu; nên luôn viết
route tuyệt đối từ gốc.

**Quyết định:** `index.ts` đổi sang `import 'expo-router/entry'`. `app/_layout.tsx` dựng Root Stack
tối thiểu.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — đúng chủ đề "cấu trúc app/navigation" hay bị hỏi
khi CV có Expo Router):*

> **Q: Expo Router khác React Navigation truyền thống ở điểm cốt lõi nào?**
> A: Không còn file khai báo navigator tập trung — cấu trúc thư mục trong `app/` **chính là** bảng
> route. Tạo file mới = tự động có route mới, không cần đăng ký thủ công. Điều này cũng đổi cách
> điều hướng: phải phân biệt `router.push()` (luôn thêm màn mới vào stack) và `router.navigate()`
> (quay lại màn đã có nếu tồn tại, tránh chồng stack vô nghĩa) — chọn nhầm cái nào cũng gây bug
> điều hướng tinh vi, khó thấy ngay lúc code.

---

## Buổi 11 — TASK-11: Layout lồng nhau — `_layout.tsx` là COMPONENT, không phải file cấu hình
**Ngày:** 2026-09-08

**Vấn đề:** Dễ nhầm `_layout.tsx` là một file khai báo (kiểu JSON/config) vì tên gọi nghe giống
vậy. Thực ra nó là **component React bình thường** — nghĩa là provider toàn cục (gesture handler,
safe area, theme...) phải được **render** ở đây, đúng vị trí, đúng thứ tự lồng nhau.

**Mental model:** Layout lồng nhau tạo cây provider tự nhiên theo đúng cấu trúc thư mục. Thứ tự
lồng quan trọng: `GestureHandlerRootView` phải ở **ngoài cùng** với `flex: 1` (thiếu `flex: 1` gây
lỗi âm thầm — view co về kích thước 0×0, gesture không bắt được gì mà không có thông báo lỗi rõ
ràng); `SafeAreaProvider` bọc quanh `Stack` để mọi màn con dùng `useSafeAreaInsets()` lấy đúng toạ
độ notch/status bar/dynamic island.

**Đối chiếu cũ → mới:** Kiểu cũ, các provider này thường được đặt một lần ở `App.tsx` gốc, chỉ có
một điểm vào. Với layout lồng nhau, phải chủ động nghĩ provider nào cần ở root, provider nào chỉ
cần trong một nhánh con cụ thể — đặt sai chỗ có thể làm provider bị unmount/remount ngoài ý muốn
khi điều hướng.

**Bẫy:** quên `flex: 1` trên `GestureHandlerRootView` → lỗi im lặng, không exception, chỉ là UI
biến mất hoặc gesture không hoạt động — rất khó debug nếu không biết nguyên nhân trước.

**Quyết định:** `app/_layout.tsx` bọc `GestureHandlerRootView` (có `flex: 1`) → `SafeAreaProvider`
→ `Stack`. Nhân tiện nâng cấp `eslint.config.js` sang Flat Config chuẩn ESLint 9 cho SDK 57.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ):*

> **Q: Bạn bọc `GestureHandlerRootView` nhưng cử chỉ vuốt trong app không hoạt động, không có lỗi
> nào hiện ra. Bạn nghi ngờ điều gì đầu tiên?**
> A: Khả năng cao thiếu `style={{ flex: 1 }}` trên `GestureHandlerRootView`. Không có flex, view
> này co về kích thước 0×0 theo mặc định của React Native — không throw lỗi, chỉ đơn giản là không
> có diện tích nào để bắt gesture. Đây là lỗi "âm thầm" kinh điển của thư viện này, luôn kiểm tra
> đầu tiên trước khi đào sâu vào logic gesture cụ thể.

---

## Buổi 12 — TASK-12: Route group `(tabs)` — thư mục có mà URL không có
**Ngày:** 2026-09-08

**Vấn đề:** 3 tab cần dùng chung một Tab Navigator (layout), nhưng nếu tạo thư mục thường
`app/tabs/`, URL sẽ có thêm một cấp thừa (`/tabs/index`) — không phải điều mong muốn.

**Mental model:** Thư mục trong **ngoặc tròn** `(tabs)` là **Route Group** — tồn tại vật lý để
chia sẻ `_layout.tsx` chung, nhưng **biến mất khỏi URL**. Ba loại cú pháp đặc biệt của Expo Router,
dễ lẫn nhất trong buổi này:

| Cú pháp | Tên gọi | Ảnh hưởng URL? |
|---|---|---|
| `(tabs)` | Route Group | **Không** — biến mất khỏi URL |
| `[id]` | Dynamic segment | **Có** — giá trị thật thay vào |
| `+not-found` | File đặc biệt (reserved) | Không phải segment thường, Expo Router tự nhận diện |

**Đối chiếu cũ → mới:** Tab Navigator không biến mất so với React Navigation cũ — nó chỉ **chuyển
chỗ ở**: từ một file khai báo `<Tab.Navigator><Tab.Screen .../></Tab.Navigator>` tập trung, sang
thành component `<Tabs />` **render** trong `app/(tabs)/_layout.tsx` (đúng bài Buổi 11: `_layout.tsx`
là COMPONENT). Mỗi file bên trong nhóm tự động thành một tab, không cần khai báo `<Tab.Screen>` thủ công.

**Bẫy:** hai route group khác nhau (`(tabs)` và `(auth)` chẳng hạn) có thể vô tình cùng resolve về
một URL (`/`) nếu cả hai đều có `index.tsx` — route group giấu tên thư mục nhưng không giấu được
xung đột URL.

**Quyết định:** `app/(tabs)/_layout.tsx` chỉ chứa `<Tabs />` trần, chưa có `<Tabs.Screen>` — việc
tuỳ chỉnh icon/label từng tab là khái niệm của TASK-13, cố ý chưa viết trước.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — đúng chủ đề "tổ chức route" hay gặp khi CV có
Expo Router):*

> **Q: Trong Expo Router, `(tabs)` và `[id]` đều dùng dấu ngoặc trong tên thư mục/file. Khác nhau
> ở đâu, và nếu nhầm lẫn sẽ gây hậu quả gì?**
> A: `[id]` (ngoặc vuông) là **dynamic segment** — giá trị thật sẽ thay vào URL (`/match/123`).
> `(tabs)` (ngoặc tròn) là **route group** — chỉ để tổ chức file dùng chung layout, hoàn toàn
> **biến mất khỏi URL**. Nhầm hai cái sẽ dẫn tới hai loại lỗi khác nhau: tưởng route group tạo
> thêm cấp URL (sai, nó không tạo), hoặc tưởng dynamic segment không ảnh hưởng URL (sai, giá trị
> luôn xuất hiện). Rủi ro thực tế: hai route group khác nhau nhưng cùng có file trùng tên (VD
> `index.tsx`) sẽ resolve về cùng một URL và gây lỗi route mơ hồ (ambiguous route) — vì "biến mất
> khỏi URL" không đồng nghĩa "không thể xung đột".


