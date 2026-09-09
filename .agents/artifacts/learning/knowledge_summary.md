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

## Buổi 13 — TASK-13: `Tabs.Screen` — prop `name` trỏ tới TÊN FILE, không phải đường dẫn
**Ngày:** 2026-09-09

**Vấn đề:** `<Tabs />` để trần không tự có icon/label/thứ tự bạn muốn. Muốn tuỳ biến, phải khai báo
`<Tabs.Screen>` — và lúc đó phải nói đúng "config này áp cho route nào".

**Mental model:** `Tabs.Screen` **không tạo route** — file mới tạo route (Buổi 10). Nó chỉ là một
"nhãn cấu hình" gắn vào route đã tồn tại, khớp bằng cách so `name` với tên file (bỏ đuôi `.tsx`).
Dán nhãn sai tên hộp → nhãn không gắn vào đâu cả, hộp gốc vẫn còn nhưng không có nhãn.

**Đối chiếu cũ → mới:** React Navigation cũ: `<Tab.Screen name="Home" component={HomeScreen} />` —
`name` là ID tự đặt, gắn với biến JS import trực tiếp. Expo Router: không còn `import`/`component`,
route đã do FILE quyết định, nên `name` không còn tự do — nó **bắt buộc** khớp tên file để nói tab
này áp cho route nào. Giữ thói quen cũ (`name="Home"` cho file `index.tsx`) là bẫy.

**Bẫy:**
- `name` không khớp file → cấu hình (icon/label) bạn định set cho file đó không áp dụng được;
  còn file gốc (không có `Tabs.Screen` khớp) vẫn tự mọc tab mặc định (label = tên file, không icon).
- **Miss thật của buổi này:** tưởng phải khai báo `Tabs.Screen` thì tab mới "tồn tại". Sai —
  `<Tabs>` tự sinh tab cho MỌI file trong `(tabs)/` kể cả khi không khai báo gì. `Tabs.Screen` chỉ
  cần để TUỲ BIẾN (icon/label/order) hoặc ẨN hẳn (`options={{ href: null }}`), không phải điều kiện
  để tab xuất hiện.
- `name` không có đuôi `.tsx`, không có dấu `/`.

**Quyết định & vì sao:**
- `name="index"/"trivia"/"leaderboard"` trong `app/(tabs)/_layout.tsx` — **bắt buộc**, khớp tên file.
- `title` (label tiếng Việt) đặt trong `options`, tách biệt hoàn toàn khỏi `name` — tránh đúng bẫy
  nhầm hai khái niệm với nhau.
- Icon: `@expo/vector-icons` (Ionicons) — **lựa chọn của người học**, cân nhắc với `expo-symbols`
  (SF Symbols, chỉ iOS) và emoji tạm thời; chọn vector-icons vì quen thuộc, cross-platform, bộ icon
  rộng. Cài qua `npm install "@expo/vector-icons@^15.0.2" --legacy-peer-deps` vì cây dependency của
  SDK 57 có xung đột peer `react@19.2.3` vs `react-dom@19.2.8` từ `@expo/ui` (web tooling nội bộ của
  `expo-router`, không liên quan gói mới cài) — `--legacy-peer-deps` chỉ bỏ qua đúng peer conflict
  có sẵn đó, không ảnh hưởng resolve version của `@expo/vector-icons`.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — chủ đề "file-based tab config" hay gặp khi CV có
Expo Router):*

> **Q: Trong Expo Router, nếu bạn không khai báo `<Tabs.Screen>` cho một file trong `(tabs)/`, tab
> đó có xuất hiện không? `Tabs.Screen` dùng để làm gì?**
> A: Có, nó vẫn xuất hiện — Expo Router tự sinh tab cho mọi file tìm thấy trong thư mục `(tabs)/`,
> dùng tên file làm label mặc định, không cần khai báo gì thêm. `Tabs.Screen` không phải điều kiện
> để tab tồn tại, mà là công cụ TUỲ BIẾN: đặt icon, đổi label hiển thị (`title`), đổi thứ tự, hoặc
> ẩn hẳn tab đó khỏi thanh tab bằng `options={{ href: null }}` trong khi route vẫn truy cập được
> qua link.

## Buổi 14 — TASK-14: Dynamic route `[id].tsx` và `useLocalSearchParams`
**Ngày:** 2026-09-09

**Vấn đề:** Cần truyền `id` từ danh sách trận đấu sang màn chi tiết, nhưng Expo Router không có
`navigate(name, { params object bất kỳ })` như React Navigation cũ — điều hướng đi qua URL string.

**Mental model:** `[id].tsx` là segment khớp bất kỳ giá trị nào trong URL (như `/match/:id`).
`useLocalSearchParams()` đọc lại giá trị đó từ chuỗi URL đã parse, nên kiểu **luôn là `string`**
(hoặc `string[]` nếu segment lặp) — kể cả bạn "truyền" một số khi push.

**Đối chiếu cũ → mới:**
| | Cũ (React Navigation) | Mới (Expo Router) |
|---|---|---|
| Truyền dữ liệu | `navigate('Detail', { id: 123, obj: {...} })` — object JS bất kỳ, qua bộ nhớ | `router.push('/match/123')` — build một URL **string** |
| Nhận lại | Đúng kiểu gốc (number, object...) | Luôn `string`/`string[]`, phải tự parse/validate |
| Truyền object phức tạp | Nhét thẳng vào params | Không nhét được — chỉ truyền `id`, màn đích tự fetch lại dữ liệu theo `id` |

**Bẫy:**
- So sánh `id === 123` (number) trong khi `id` luôn là string `'123'` → luôn `false`, không throw
  lỗi gì, bug âm thầm.
- Nhầm `useLocalSearchParams` với `useGlobalSearchParams` — khác nhau ở phạm vi cập nhật khi nhiều
  màn lồng nhau cùng đọc chung một param.
- Đổi tên file `[id].tsx` → `[matchId].tsx` thì key trả về từ hook cũng đổi theo (`matchId`), không
  tự động giữ tên cũ — phải sửa cả 2 chỗ (tên file và destructure).

**Quyết định & vì sao:**
- `useLocalSearchParams<{ id: string }>()` thay vì `useGlobalSearchParams` — màn detail đơn không
  cần đồng bộ real-time với màn khác, tránh re-render thừa.
- Card mẫu ở `(tabs)/index.tsx` dùng `router.push('/match/123')` (string literal) — minh hoạ trực
  tiếp: dù gõ `123` trong code, nó bị nuốt vào URL string ngay lập tức, không có cách "push một số".
- Chưa parse `id` sang number hay validate — để dành khi có network layer thật (Sprint 2); sprint
  này chỉ cần verify điều hướng bằng hiển thị string trực tiếp.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — chủ đề "truyền dữ liệu qua navigation" hay gặp
khi so sánh Expo Router với React Navigation cổ điển):*

> **Q: Trong Expo Router, param đọc từ `useLocalSearchParams` luôn có kiểu gì, và vì sao không thể
> truyền thẳng một object phức tạp qua điều hướng như React Navigation cũ?**
> A: Luôn là `string` (hoặc `string[]` nếu segment lặp), vì Expo Router điều hướng bằng cách build
> một URL thật (`router.push('/match/123')`), và URL về bản chất chỉ có thể chứa text. Muốn truyền
> dữ liệu phức tạp (object, số đã tính toán), cách đúng là chỉ truyền `id` qua URL rồi để màn đích
> tự fetch lại dữ liệu đầy đủ theo `id` đó — không serialize nguyên object vào params như cách cũ.

**Phát hiện bổ sung (kiểm chứng thực nghiệm 2 vòng, không phải từ docs):**
- Vòng 1: push `/match/123` rồi `navigate('/match/456')` (href khác) → MOUNT lại, back 2 lần. Kết
  quả mong đợi, không bất ngờ.
- Vòng 2 (test thật sự): push `123` → push `456` → từ `456` gọi `navigate('/match/123')` — tức
  href **khớp CHÍNH XÁC** với một instance đã có sẵn (không phải đứng đầu stack). Kết quả: **vẫn
  MOUNT lại (instance thứ 3), back phải 3 lần** — nghĩa là `navigate` xử sự **y hệt `push` trong mọi
  trường hợp đã test với route dynamic**, kể cả khi href trùng khớp tuyệt đối. Giả thuyết "match theo
  href chính xác" ở vòng 1 đã bị bác bỏ.
- Kết luận thực dụng: hành vi "unwind to existing route" mà docs mô tả nhiều khả năng chỉ áp dụng
  cho route **singular** (tối đa 1 instance, kiểu tab/drawer) — route có dynamic segment trong Stack
  được thiết kế để cho phép nhiều instance song song, nên `navigate` không có "existing route" nào để
  nhảy về. Đây là suy luận cá nhân dựa trên thực nghiệm, KHÔNG có docs xác nhận trực tiếp — nếu cần
  chắc chắn 100%, phải đọc source code `expo-router`/`@react-navigation` thay vì đoán từ hành vi quan
  sát được.
- Với route dynamic (`[id].tsx`), `push` và `navigate` cho kết quả **giống nhau** trong dự án này —
  không có lý do thực dụng để phân biệt hai hàm này ở các task còn lại của module Router.

## Buổi 15 — TASK-15: Route ngoài tab & cách ẩn tab bar cho màn fullscreen
**Ngày:** 2026-09-09

**Vấn đề:** Màn recap cần chiếm toàn màn hình — không tab bar, không header. Phản xạ kiểu component
là "ẩn TabBar bằng style/điều kiện khi ở màn này".

**Mental model:** Cấu trúc thư mục = cấu trúc navigator lồng nhau. `(tabs)/` là Tab Navigator con
nằm trong Stack cha (`app/_layout.tsx`). Đặt `recap/[matchId].tsx` NGOÀI `(tabs)/` nghĩa là nó là
screen của Stack **cha**, chưa bao giờ đi qua `<Tabs>` — tab bar vốn dĩ không tồn tại ở tầng đó,
không cần "ẩn" gì.

**Đối chiếu cũ → mới:** React Navigation cũ: ẩn tab bar tạm thời bằng `tabBarStyle: { display: 'none' }`
set động theo route, hoặc check route name trong custom tab bar — sửa HÀNH VI component dựa trên
điều kiện. Expo Router: câu hỏi không phải "ẩn tab bar sao" mà "màn này có thuộc navigator có tab
bar không" — trả lời bằng VỊ TRÍ FILE, không phải logic điều kiện.

**Bẫy:**
- Đặt file trong `(tabs)/recap/[matchId].tsx` rồi ẩn tab bar bằng style/điều kiện: chạy được nhưng
  tab bar có thể giật/nháy lúc chuyển màn, và phải tự maintain logic "route nào thì ẩn".
- **Miss thật của buổi này:** nhầm ai chịu trách nhiệm ẩn HEADER cho route ngoài tab. Vì recap nằm
  ngoài `(tabs)`, `Tabs.Screen` ở `(tabs)/_layout.tsx` không liên quan gì tới nó — header do
  **Stack cha trực tiếp chứa route đó** quyết định (ở đây là root `app/_layout.tsx`), không phải
  Tab Navigator.
- Ẩn header và ẩn tab bar là HAI TẦNG khác nhau, dễ tưởng là một cơ chế vì cùng cho cảm giác "sạch":

| Cái gì | Ai chịu trách nhiệm |
|---|---|
| Tab bar hiện/ẩn | Route có nằm trong `(tabs)/` hay không — cấu trúc thư mục |
| Header hiện/ẩn | Navigator TRỰC TIẾP chứa route (`options.headerShown`) — với route ngoài tab, đó là Stack cha |

**Quyết định & vì sao:**
- `app/recap/[matchId].tsx` — param key `matchId` khớp tên file, dùng lại đúng pattern
  `useLocalSearchParams` của Buổi 14.
- `app/_layout.tsx` thêm `<Stack.Screen name="recap/[matchId]" options={{ headerShown: false }} />`
  — `name` phải là PATH ĐẦY ĐỦ tính từ `app/` (khác với trong `(tabs)`, vì không có route group nào
  rút gọn path).
- **Chưa** thêm `presentation: 'fullScreenModal'` — cố ý để dành TASK-16 (khái niệm presentation
  modes). Route hiện vẫn push mặc định, chỉ khác không header/không tab bar.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — chủ đề "ẩn tab bar/header theo route" hay gặp khi
so sánh Expo Router với React Navigation cổ điển):*

> **Q: Làm sao để một màn hình chạy fullscreen (không tab bar, không header) trong ứng dụng dùng
> Expo Router với cấu trúc `(tabs)`? Vì sao không nên ẩn tab bar bằng style?**
> A: Đặt file màn hình đó NGOÀI thư mục route group `(tabs)/` — ví dụ `app/recap/[matchId].tsx`
> thay vì `app/(tabs)/recap/[matchId].tsx`. Vì route nằm ngoài Tab Navigator nên tab bar vốn dĩ
> không tồn tại ở đó, không cần ẩn bằng style hay điều kiện (cách đó vẫn chạy nhưng dễ gây giật/nháy
> animation và phải tự maintain logic theo route). Header thì tách biệt: do Stack cha trực tiếp
> chứa route đó quyết định qua `options.headerShown`, không phải Tab Navigator.

## Buổi 16 — TASK-16: Presentation modes — `modal` vs `push` vs `fullScreenModal`
**Ngày:** 2026-09-09

**Vấn đề:** Màn "phòng chờ quiz" cần cảm giác tạm thời, ngắt quãng — mở lên làm gì đó rồi đóng lại,
không phải "đi sâu thêm" như push thường. Chỉ đổi animation mà giữ cơ chế push sẽ mất đúng thứ quan
trọng nhất: cử chỉ vuốt xuống để đóng.

**Mental model:** `presentation` không chỉnh animation đơn thuần — nó đổi LOẠI ROUTE trong ngăn xếp
native (iOS: `UIModalPresentationStyle` thật, không phải push lên `UINavigationController`). Modal
có ngăn xếp riêng, tách biệt khỏi Stack chứa nó — "nổi" lên trên toàn bộ (che cả tab bar dù mở từ
tab nào), có cử chỉ đóng riêng mà push thường không có.

**Đối chiếu cũ → mới:** React Navigation cũ: tự định nghĩa riêng một `ModalStack` hoặc `mode: 'modal'`
ở cấp `createStackNavigator`, tự viết logic ẩn tab bar khi vào modal. Expo Router: chỉ cần
`presentation: 'modal'` trong `options` của MỘT screen — Router tự lo phần thoát khỏi luồng push
thường, nổi lên trên, có cử chỉ đóng riêng, không cần khai báo navigator nào thêm.

**Bẫy:**
- Coi `fullScreenModal` và `modal` giống nhau chỉ khác animation — sai: `fullScreenModal` KHÔNG cho
  vuốt xuống đóng (phải bấm nút tường minh), `modal` mặc định cho vuốt xuống. Đây là lý do recap
  (TASK-15) dùng push thường + ẩn header (không cần vuốt đóng) còn quiz-room dùng `modal`.
- **Miss thật của buổi này:** tưởng có cơ chế tự động chặn vuốt-xuống-để-đóng và tự hỏi confirm.
  Không có gì tự động — muốn chặn phải tự lắng nghe sự kiện điều hướng (kiểu `beforeRemove`) và tự
  viết logic confirm. Việc này thuộc Sprint 3 (nối yêu cầu "confirm trước khi thoát quiz"), KHÔNG
  làm ở sprint này.
- Đóng modal (dismiss) và pop khỏi Stack (back) là hai khái niệm khác nhau dù cả hai đều gọi được
  qua `router.back()` — modal là một lớp tạm nổi lên, không phải một bước lịch sử tuyến tính.

**Quyết định & vì sao:**
- `presentation: 'modal'` (không phải `fullScreenModal`) — bắt buộc theo acceptance criteria: cần
  vuốt xuống đóng được.
- `title: 'Phòng chờ Quiz'` (có header) — lựa chọn UX, không bắt buộc; có thể `headerShown: false`
  nếu muốn modal trần hoàn toàn.
- Chưa viết logic chặn dismiss/confirm — để dành Sprint 3, đúng gate_focus của task.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — chủ đề "modal presentation" hay gặp khi so sánh
Expo Router với React Navigation cổ điển):*

> **Q: Trong Expo Router, `presentation: 'modal'` khác `presentation: 'fullScreenModal'` ở điểm
> nào? Và cả hai khác push thường ở cơ chế gì, không chỉ animation?**
> A: `modal` cho phép vuốt xuống để đóng mặc định; `fullScreenModal` thì không, phải có nút đóng
> tường minh. Cả hai đều khác push thường ở chỗ chúng dùng cơ chế trình bày (presentation) native
> riêng của hệ điều hành (trên iOS là `UIModalPresentationStyle`), không phải đẩy thêm một màn vào
> `UINavigationController` — do đó chúng "nổi" lên trên toàn bộ UI hiện có (kể cả tab bar), có ngăn
> xếp điều hướng tách biệt, và không có sự kiện tự động nào chặn việc đóng lại — muốn xác nhận trước
> khi thoát phải tự lắng nghe sự kiện điều hướng và tự viết logic confirm.

## Buổi 17 — TASK-17: Route đặc biệt `+not-found` và cú pháp catch-all `[...rest]`
**Ngày:** 2026-09-09

**Vấn đề:** Cần một màn "404" khi URL không khớp gì (deep link sai, route đổi tên quên cập nhật).
Nhưng cũng có dynamic route (`[id]`) khớp rất rộng — Router chọn route nào khi một URL khớp nhiều
pattern cùng lúc?

**Mental model:** Router xếp hạng độ CỤ THỂ của route theo thứ tự cố định, không theo thứ tự file
được tạo hay thứ tự khai báo JSX:

| Thứ tự ưu tiên | Loại route | Khớp gì |
|---|---|---|
| 1 (cao nhất) | Route tĩnh | Khớp chính xác (`/leaderboard`) |
| 2 | `[id]` (dynamic segment) | Đúng 1 segment, PHẢI có giá trị (không match rỗng/thiếu) |
| 3 | `[...rest]` (catch-all) | N segment (mặc định cũng yêu cầu ≥1) |
| 4 (thấp nhất, fallback) | `+not-found` | Chỉ khi KHÔNG route nào ở trên khớp |

Giống `switch` có các `case` cụ thể trước, `default` sau cùng — `+not-found` chính là `default`,
không "thi đấu" độ khớp với route khác.

**Đối chiếu cũ → mới:** React Navigation cũ: tự viết `NotFoundScreen`, thứ tự `<Stack.Screen>` khai
báo trong JSX quyết định ai thắng (khai báo trước ưu tiên trước, chạy tuần tự như switch-case thật).
Expo Router: KHÔNG có "khai báo trước sau" — quyết định dựa vào TÊN/CẤU TRÚC FILE (độ cụ thể của
segment). `+not-found.tsx` luôn là phương án cuối cùng bất kể tạo lúc nào, đặt Stack.Screen ở đâu,
hay thậm chí không khai báo Stack.Screen cho nó — dấu `+` là ký hiệu đặc biệt Router tự nhận diện.

**Bẫy:**
- Tưởng `[...rest]` "nuốt" luôn URL mà `[id]` lẽ ra khớp — sai, `[id]` (cụ thể hơn) luôn thắng
  `[...rest]` (rộng hơn) khi URL chỉ có đúng 1 segment ở vị trí đó.
- Nghĩ phải "điều hướng tay" tới `+not-found` bằng `router.push('/+not-found')` — sai, đây là
  fallback tự động của Router, không phải route bạn chủ động push tới.
- **Miss thật của buổi này:** tưởng URL thiếu segment (`/match`, không có gì sau) vẫn khớp
  `[id].tsx` — sai. Dynamic segment yêu cầu CHÍNH XÁC 1 segment TỒN TẠI (giá trị gì cũng được, nhưng
  phải có), không match được với segment rỗng/thiếu. `/match` không khớp `[id]`, không có
  `match/index.tsx` trong dự án → rơi thẳng vào `+not-found`.

**Quyết định & vì sao:**
- `app/+not-found.tsx` — không cần khai báo `Stack.Screen` trong `app/_layout.tsx`, đúng bản chất
  route reserved.
- `router.replace('/')` (không phải `push`) cho nút "Về trang chủ" — người dùng đang ở URL không
  hợp lệ, không nên giữ bước đó trong lịch sử back.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — chủ đề "route matching priority" hay gặp khi so
sánh Expo Router với các router file-based khác như Next.js):*

> **Q: Trong Expo Router, nếu một URL có thể khớp cả route tĩnh, dynamic segment, catch-all lẫn
> `+not-found`, route nào được chọn? Thứ tự này dựa vào đâu?**
> A: Router chọn theo độ CỤ THỂ giảm dần: route tĩnh khớp chính xác trước, rồi tới dynamic segment
> `[id]` (khớp đúng 1 segment có giá trị), rồi catch-all `[...rest]` (khớp N segment), cuối cùng mới
> tới `+not-found` — chỉ kích hoạt khi không route nào ở trên khớp. Thứ tự này KHÔNG phụ thuộc vào
> việc bạn tạo file lúc nào hay khai báo `Stack.Screen` theo thứ tự nào trong JSX — nó dựa hoàn toàn
> vào cấu trúc/tên file, đúng tinh thần "file quyết định route" xuyên suốt Expo Router.


