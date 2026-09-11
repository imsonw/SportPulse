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

## Buổi 18 — TASK-18: Deep Linking — vì sao Expo Router tự sinh linking config
**Ngày:** 2026-09-09

**Vấn đề:** Deep link cần một "bảng tra cứu" map URL (`sportpulse://match/123`) ra đúng màn hình +
param. Ở React Navigation cũ, đây là object cấu hình tự viết tay, tự đồng bộ tay mỗi khi thêm/xoá
màn — quên cập nhật là deep link im lặng không hoạt động.

**Mental model:** Expo Router generate linking config TỰ ĐỘNG từ chính cây thư mục `app/` — URL
pattern và route pattern vốn dĩ là MỘT. `scheme` trong `app.json` chỉ định tiền tố, phần sau khớp
bằng đúng cơ chế đã học Buổi 10→17 (không phải hệ thống song song).

**Đối chiếu cũ → mới:** React Navigation cũ: viết object `linking = { prefixes, config: { screens }}`
truyền vào `NavigationContainer`, mỗi màn mới phải thêm dòng, dễ quên, không cảnh báo nếu thiếu.
Expo Router: không có file/object linking để tự viết — suy ra lúc build từ cấu trúc file, thêm file
mới = deep link route đó tự động hoạt động.

**Bẫy — đã kiểm chứng THỰC NGHIỆM trên Simulator (không chỉ lý thuyết):**
- Cold start (app bị kill hẳn) vs warm start (app đang chạy) là hai luồng khác nhau. Test bằng
  `xcrun simctl openurl`:

| Kịch bản | Kết quả thực tế |
|---|---|
| Warm, app đã ổn định ở foreground | ✅ Vào đúng `match/123` ngay |
| Warm, gọi `openurl` NGAY SÁT lúc app vừa được đưa lên foreground (sau `simctl launch`) | ❌ Bị lỡ hoàn toàn — app vẫn ở Home, deep link không chạy |
| Cold start thật (terminate hẳn → mở lại bằng link, đợi đủ JS load ~4s) | ✅ Vào thẳng `match/999`, không qua Home |

- **Phát hiện quan trọng nhất buổi này:** race condition ở dòng 2 là CÓ THẬT, không chỉ là lý thuyết
  phòng hờ — gọi URL quá sớm ngay sau khi app được đánh thức (trước khi Linking listener/Router kịp
  sẵn sàng) khiến URL bị mất hẳn, không có hàng đợi/retry nào tự động xử lý lại.
- Chỉ khai `scheme` trong `app.json` là chưa đủ — phải `expo prebuild` để ghi vào `Info.plist` thật
  (đã xác nhận bằng `plutil`: build hiện tại có đúng `CFBundleURLSchemes: ["sportpulse", "com.sportpulse.app"]`).
- Test deep link bằng `xcrun simctl openurl` hoàn toàn local, không cần server/publish gì — tương
  đương việc gõ URL vào Safari trên Simulator.

**Quyết định & vì sao:** Không sửa code gì trong buổi này — deliverable là XÁC MINH, không phải viết
file. Phát hiện race condition (dòng 2 bảng trên) là input quan trọng cho TASK-19 (auth guard): nếu
guard làm chậm quá trình khởi tạo, nguy cơ tương tự (mất/trễ xử lý URL ban đầu) có thể lặp lại ở tầng
khác.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — chủ đề "deep linking cold/warm start" hay gặp khi
CV có kinh nghiệm Expo Router hoặc React Navigation):*

> **Q: Sự khác biệt giữa xử lý deep link ở cold start và warm start là gì? Có rủi ro thực tế nào cần
> lưu ý không?**
> A: Warm start: app đang chạy nền, hệ điều hành gọi thẳng vào scene đang có sẵn, Router điều hướng
> gần như ngay lập tức. Cold start: toàn bộ app phải khởi tạo lại (mount root layout, providers...)
> trước khi Router có thể xử lý URL ban đầu. Rủi ro thực tế (đã tự kiểm chứng, không chỉ lý thuyết):
> nếu URL đến quá sớm — ngay lúc app vừa được đánh thức nhưng Linking listener/Router chưa kịp sẵn
> sàng — URL đó có thể bị mất hoàn toàn, không có cơ chế hàng đợi/retry mặc định nào cứu lại. Đây là
> lý do code khởi tạo (auth check, splash) cần được viết cẩn thận, không chặn hoặc trì hoãn quá trình
> Router tiêu thụ initial URL.

## Buổi 19 — TASK-19: Auth guard — `<Redirect>` vs `useEffect` + navigate (race condition)
**Ngày:** 2026-09-09

**Vấn đề:** Cần chặn vào `(tabs)` khi chưa đăng nhập. Phản xạ quen thuộc: đọc session trong
`useEffect`, chưa đăng nhập thì `router.push('/login')`. Cách này gây một cú nháy màn hình thấy
được — `(tabs)` render ra TRƯỚC (dù chỉ 1 frame) rồi mới bị đẩy sang login.

**Mental model:** `useEffect` chạy SAU khi render đã commit vào native tree (render → commit → effect).
Nghĩa là `(tabs)` đã kịp VẼ THẬT SỰ lên màn hình trước khi effect kịp gọi `push`. `<Redirect>` là một
COMPONENT — return nó ra ngay trong lượt render báo cho Router "đừng render nhánh này, render nhánh
kia" — không có khoảnh khắc nào `(tabs)` thật sự xuất hiện rồi mới bị thay thế.

**Đối chiếu cũ → mới:** React Navigation cũ: guard viết bằng
`useEffect(() => { if (!user) navigation.replace('Login') }, [user])` — pattern phổ biến, coi là
bình thường vì không có API "điều hướng qua render" dễ dùng. Expo Router: `<Redirect href="..." />`
sinh ra riêng để giải quyết đúng lỗi nháy này.

**Bẫy:**
- **Miss dễ gặp nhất:** session đọc bất đồng bộ (SecureStore/AsyncStorage) có 3 trạng thái
  `loading`/`authenticated`/`unauthenticated`, không phải 2. Nếu guard coi `loading` giống hệt
  `unauthenticated`, mỗi lần mở app (kể cả đã đăng nhập từ trước) đều nháy về login rồi nháy lại vào
  Home khi session load xong.
- `<Redirect>` đặt trong `useEffect` hoặc callback (`onPress`) — mất tác dụng, vì phép màu "chặn
  render" chỉ có khi nó được RETURN ra như JSX trong lượt render, không phải gọi như hàm imperative.
- Nối với Buổi 18: nếu guard làm chậm quyết định render nhánh nào (query mạng chậm), initial URL từ
  deep link có nguy cơ bị ảnh hưởng bởi race condition tương tự đã tự kiểm chứng.

**Quyết định & vì sao:**
- `useAuthStub()` giữ type 3 nhánh (`loading`/`authenticated`/`unauthenticated`) dù stub luôn trả
  `authenticated` — để cấu trúc guard không phải sửa lại khi thay bằng auth thật ở Sprint 4/F-016.
- `loading` → `return null` (không render `<Stack>`) — tối giản, tránh đúng lỗi nháy; có thể thay
  bằng splash/skeleton thật là quyết định UI riêng (TASK-20/21), không bắt buộc cho khái niệm này.
- `unauthenticated` → `<Redirect href="/login" />` — route `/login` chưa tồn tại (Sprint 4), nhánh
  này thực tế chưa bao giờ chạy trong sprint này.
- Định nghĩa `useAuthStub` ngay trong `_layout.tsx`, KHÔNG tạo `src/lib/` mới — vì `src/` chưa tồn
  tại (bắt đầu TASK-20), tránh quyết định kiến trúc "lụi" ngoài phạm vi buổi học.
- Đã verify trên Simulator: app vẫn boot bình thường vào tab Trực tiếp (stub trả `authenticated`
  nên nhánh `<Stack>` chạy như cũ, không có regression).

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — chủ đề "auth guard flicker" hay gặp khi so sánh
Expo Router với React Navigation cổ điển):*

> **Q: Vì sao dùng `<Redirect>` trong Expo Router để làm auth guard tốt hơn `useEffect` +
> `router.push`? Bẫy phổ biến nhất khi implement guard này là gì?**
> A: `useEffect` chạy sau khi component đã render và commit xong, nên màn được bảo vệ (ví dụ
> `(tabs)`) có thể đã kịp hiển thị trong một khoảnh khắc trước khi bị điều hướng đi — gây nháy màn
> hình thấy được. `<Redirect>` là component, return ra ngay trong lượt render hiện tại nên không có
> khoảnh khắc đó. Bẫy phổ biến nhất: session thường đọc bất đồng bộ, có trạng thái "đang tải" ở
> giữa — nếu guard không phân biệt "đang tải" với "chưa đăng nhập", app sẽ nháy về màn login mỗi lần
> mở dù người dùng đã đăng nhập từ trước, vì lúc mới mở app luôn ở trạng thái "đang tải" trước khi
> biết kết quả thật.

## Buổi 20 — TASK-20: Design token & dark mode — vì sao không hardcode màu
**Ngày:** 2026-09-09

**Vấn đề:** Đã tự tay hardcode `borderColor: '#ccc'`, `backgroundColor: '#000'` ở vài màn placeholder
trước đó. Cứ tiếp tục vậy: đổi 1 màu chủ đạo phải grep khắp codebase; dark mode phải sửa từng
component, dễ sót/lệch (chỗ `#ccc`, chỗ `#cccccc`, chỗ `lightgray`).

**Mental model:** Token là lớp GIÁN TIẾP — component hỏi "màu VAI TRÒ gì" (`colors.border`) thay vì
"màu là gì", giá trị thật nằm ở MỘT nơi. Đổi giao diện = đổi giá trị ở nguồn, mọi nơi dùng token tự
cập nhật. Dark mode chỉ là "một bộ giá trị khác cho cùng bộ vai trò" — free nếu đã dùng token, đắt
nếu hardcode (phải viết lại if/else màu ở từng component).

**Đối chiếu cũ → mới:** UIKit cũ có sẵn semantic color (`UIColor.systemBackground`, `.label`) tự đổi
theo light/dark — đây chính là token, do hệ điều hành cung cấp miễn phí. React Native thuần KHÔNG có
cơ chế này sẵn — token là thứ BẠN phải tự thiết kế, không có sẵn như UIKit.

**Bẫy:**
- Tạo token xong nhưng vẫn lỡ hardcode 1 chỗ khác — bản thân việc có file token không tự xoá
  hardcode cũ, phải tự đi sửa lại (refactor Button/Card ở buổi sau).
- `useColorScheme()` trả về `'light' | 'dark' | null` — quên nhánh `null` (chưa xác định được, hay
  gặp lúc khởi động rất sớm) dễ gây bug nếu logic phức tạp hơn một fallback đơn giản.
- Đặt tên token theo GIÁ TRỊ (`blue500`) thay vì VAI TRÒ (`primary`) — mất hết ý nghĩa lớp gián
  tiếp, đổi màu chủ đạo sang đỏ thì biến tên `blue500` giờ chứa giá trị đỏ, đọc code rất khó hiểu.
- **Lỗi thật tự vấp phải khi viết:** định nghĩa `lightColors` bằng `as const` rồi lấy
  `type ThemeColors = typeof lightColors` — mỗi field bị narrow thành literal type riêng của LIGHT
  (`background: "#ffffff"` chứ không phải `string`), khiến `darkColors: ThemeColors = {...}` báo lỗi
  vì `'#111111'` không gán được vào type `"#ffffff"`. Sửa bằng cách khai `interface ThemeColors` với
  các field kiểu `string` tường minh, không dùng `as const`/`typeof` cho trường hợp có nhiều biến
  thể (light/dark) cần cùng shape nhưng khác giá trị.

**Quyết định & vì sao:**
- `src/theme/colors.ts`: `interface ThemeColors` tường minh — thiếu/thừa key ở `darkColors` báo lỗi
  TypeScript ngay lúc code, không phải runtime khi user bật dark mode mới lộ ra thiếu màu.
- `useThemeColors()` hook: `scheme === 'dark' ? darkColors : lightColors` — gộp `'light'` và `null`
  vào chung 1 nhánh fallback, tường minh thay vì tình cờ đúng.
- `spacing.ts`/`radius.ts`/`typography.ts`: dùng `as const` (khác `colors.ts`) vì không cần nhiều
  biến thể khớp shape — `as const` còn bắt buộc cho `typography.weight` vì RN yêu cầu `fontWeight`
  là literal union (`'400'|'600'`...), không phải `string` chung chung.
- `index.ts` gom export để dùng `from '@/theme'` gọn, tận dụng path alias đã cấu hình TASK-8.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — chủ đề "design token/theming" hay gặp khi CV có
React Native, đối chiếu với UIKit semantic color):*

> **Q: Design token là gì, và vì sao có token thì hỗ trợ dark mode gần như miễn phí?**
> A: Token là một lớp gián tiếp — thay vì hardcode giá trị màu/số trực tiếp trong component, bạn
> tham chiếu tới một VAI TRÒ (`colors.background`, `spacing.md`), còn giá trị thật của vai trò đó
> được định nghĩa tập trung ở một nơi. Dark mode chỉ là việc cung cấp một bộ giá trị KHÁC cho đúng
> bộ vai trò đó (`darkColors` thay vì `lightColors`) — component không cần biết hay quan tâm đang ở
> theme nào, nó luôn hỏi đúng một câu "màu border là gì" và nhận lại giá trị phù hợp. Nếu không có
> token, mỗi component phải tự viết logic if/else theo theme, dễ sót và không nhất quán.

## Buổi 21 — TASK-21: Chiến lược styling & variant API cho component
**Ngày:** 2026-09-09

**Vấn đề:** Nhiều cách viết style trong RN (`StyleSheet.create`, inline, NativeWind), mỗi cách
trade-off khác nhau về performance/DX. Chọn sai từ đầu càng về sau càng tốn công đổi lại.

**Mental model — 3 hướng:**
| Cách | Ưu | Nhược |
|---|---|---|
| `StyleSheet.create` | Tách style khỏi JSX, dễ đọc, bắt lỗi type sớm | Lợi ích performance so với object thường đã giảm nhiều ở New Architecture |
| Inline object | Viết nhanh, style ngay cạnh JSX | Object mới mỗi lần render — chỉ là vấn đề nếu phá vỡ `memo` |
| NativeWind | Viết nhanh nhất, style ngay trong `className` | Cần babel plugin + build step riêng; token màu ở `tailwind.config.js` — nguồn riêng, phải tự đồng bộ với `src/theme/` |

**Đối chiếu cũ → mới:** UIKit cũ: style qua code hoặc Storyboard, không có khái niệm class name kiểu
CSS. RN thời Bridge cũ: `StyleSheet.create` gần như bắt buộc vì có tối ưu thật (style serialize 1
lần, gửi qua Bridge bằng ID). New Architecture (JSI): lợi ích performance đó giảm đáng kể (không còn
serialize qua Bridge) — nhưng `StyleSheet.create` vẫn có giá trị tổ chức code.

**Bẫy:**
- Tin "phải dùng `StyleSheet.create` vì luôn nhanh hơn" — đúng thời Bridge cũ, không còn tuyệt đối ở
  New Architecture; vẫn có ích nhưng vì lý do khác (tổ chức code), không phải performance thuần.
- Trộn cả 3 cách trong 1 dự án không nguyên tắc — khó đọc, khó tìm-thay.
- **Miss thật của buổi này (2 câu bị đảo ngược):** tưởng tạo object style mới mỗi render LUÔN là vấn
  đề — sai, object literal rất rẻ. Nó chỉ là vấn đề khi phá vỡ so sánh THAM CHIẾU của
  `React.memo`/`useMemo`/`useCallback` (memo so `===`, object mới mỗi render → memo tưởng prop đổi
  → không skip re-render được, dù nội dung giống hệt).
- **Phụ lục — trade-off của chính `memo`/`useMemo`/`useCallback`** (giảng thêm vì người học chưa biết
  3 API này): bản thân việc so sánh (shallow compare props, hay dependency array) KHÔNG miễn phí —
  với component/tính toán rẻ, chi phí so sánh có khi đắt hơn re-render thẳng. Chỉ nên dùng khi: (1)
  component con tốn kém để render, (2) nằm trong list dài (`FlatList` nhiều item — trường hợp kinh
  điển nhất), (3) tính toán nặng thật sự trong `useMemo`, (4) hàm là dependency của `useEffect` khác
  hoặc truyền cho con đã `memo`. KHÔNG nên memo mặc định mọi nơi — thêm phức tạp (bug kiểu stale
  closure nếu sai dependency array) mà chưa chắc nhanh hơn.

**Quyết định & vì sao (người học tự chọn, không phải Claude quyết định thay):**
- Chọn `StyleSheet.create` cho phần TĨNH (radius, spacing, opacity) — lý do chọn: tách style khỏi
  JSX, không cần cài thêm gì, khớp thẳng với `src/theme` đã có (không phải đồng bộ 2 nguồn token như
  NativeWind).
- Màu (`backgroundColor`, `borderColor`, phụ thuộc theme) **bắt buộc** ghép bằng mảng style động,
  không đặt được trong `StyleSheet.create` tĩnh — vì đối tượng đó chạy 1 lần lúc module load, còn
  màu chỉ biết được SAU KHI gọi hook `useThemeColors()` bên trong component.
- Bổ sung token `onPrimary` vào `colors.ts` (thiếu vai trò màu chữ trên nền `primary`) — tránh phải
  hardcode `'#ffffff'` ngay trong `Button`, đúng nguyên tắc Buổi 20.
- `Button` KHÔNG dùng `React.memo` — component đơn giản, không nằm trong list dài, đúng kết luận
  trade-off vừa bàn (memo ở đây tốn hơn lợi).
- `disabled` gộp cả `disabled` VÀ `loading` prop — tránh gọi `onPress` chồng khi đang loading (bug
  hành vi, không chỉ hiển thị).

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — chủ đề "React.memo/useMemo trade-off" hay gặp khi
CV có React/React Native, đặc biệt khi so New Architecture với Bridge cũ):*

> **Q: Object style/hàm bị tạo mới mỗi lần render có phải lúc nào cũng là vấn đề performance không?
> Khi nào nó thực sự thành vấn đề?**
> A: Không — tạo object/hàm mới mỗi lần render vốn dĩ rất rẻ về mặt tính toán (JS tạo object nhanh).
> Nó chỉ trở thành vấn đề khi component đó được truyền cho một nơi đang dựa vào SO SÁNH THAM CHIẾU
> để tối ưu — cụ thể là `React.memo` (so sánh props), hoặc dependency array của `useMemo`/`useEffect`/
> `useCallback`. Reference mới mỗi lần khiến các cơ chế đó luôn thấy "đã đổi" dù giá trị y hệt, làm
> vô hiệu hoá chính sự tối ưu mà bạn định dùng. Nếu component không nằm trong ngữ cảnh nào dùng memo,
> việc tạo object mới hoàn toàn vô hại.

## Buổi 22 — TASK-22: Lặp pattern (Card, Avatar, ScoreBadge, EmptyState, LoadingSkeleton)
**Ngày:** 2026-09-09

Không có khái niệm mới — 5 component viết đúng pattern đã học ở `Button` (Buổi 21): màu qua
`useThemeColors()`, layout tĩnh qua `StyleSheet.create`, không `React.memo`. `LoadingSkeleton` cố ý
chưa có shimmer (cần Reanimated, Sprint 3).

**Ghi chú thực nghiệm đáng nhớ (không phải lý thuyết, gặp thật khi verify):** wiring nhiều component
mới cùng lúc vào 1 màn hình rồi chờ Fast Refresh tự cập nhật có thể gặp lỗi
`[Refresh] Expected to find the updated module` — Fast Refresh đôi khi không theo kịp khi nhiều
file/import mới xuất hiện cùng lúc. Cách xử lý: `xcrun simctl terminate` rồi `launch` lại (reload đầy
đủ) thay vì chờ hoặc bấm reload thường. Không phải bug của code, chỉ là giới hạn của Fast Refresh khi
thay đổi quá nhiều trong 1 lần.

## Buổi 23 — TASK-23: Cấu hình môi trường & KHÔNG có secret nào an toàn trong app client
**Ngày:** 2026-09-09

**Vấn đề:** Backend cần biết gọi API/WebSocket ở đâu, khác nhau dev/staging/production. Hardcode URL
rải rác trong code là tệ nhất — đổi môi trường phải grep sửa từng file.

**Mental model:** App client (kể cả native build) là FILE NHỊ PHÂN nằm trên máy người dùng, không
phải server bạn kiểm soát runtime. Bất cứ gì nhúng lúc build (bundle JS, `Info.plist`) đều giải nén
đọc lại được bởi bất kỳ ai có file `.ipa`/`.apk`. `app.json > extra` không phải "biến môi trường bí
mật" — nó là cấu hình CÔNG KHAI đóng gói cùng app, tương đương in ra một file text đi kèm.

**Đối chiếu cũ → mới:** Native iOS cũ hay nghĩ "Keychain giữ bí mật" hoặc "binary Swift khó đọc hơn
JS" — cả hai sai cho việc giấu API key: Keychain bảo vệ dữ liệu NGƯỜI DÙNG nhập runtime (session
token cá nhân), không phải hằng số tự nhúng lúc build; binary Swift vẫn decompile/strings-extract
được. Bài học chung mọi nền tảng: secret thật (API key trả phí, private key ký request) không bao
giờ nhúng vào client, phải nằm ở backend.

**Bẫy:**
- Tin "obfuscate JS là đủ an toàn" — obfuscate làm code khó ĐỌC hơn, không khó TRÍCH XUẤT hơn (string
  constant vẫn nằm nguyên trong bundle).
- Nhầm `EXPO_PUBLIC_*` là biến server-side — tiền tố `PUBLIC` đã cảnh báo đúng bản chất: công khai
  trong bundle.
- Bỏ qua validate lúc khởi động — thiếu `API_URL` sẽ crash mơ hồ ở `fetch(undefined)` sâu trong code,
  khó debug hơn nhiều so với 1 lỗi rõ ràng ngay lúc mở app.

**Quyết định & vì sao:**
- `src/lib/env.ts`: validate + `throw` ngay ở top-level module (chạy lúc import/khởi động), không
  đợi tới lúc gọi API mới lộ ra `undefined`.
- `interface AppConfigExtra` với field optional — phản ánh đúng thực tế `Constants.expoConfig?.extra`
  không được kiểm tra kiểu tại runtime, TypeScript không tự biết `app.json` đúng field hay không.
- Không dùng zod — chỉ 2 field string đơn giản, `if (!value) throw` là đủ; cân nhắc zod nếu `extra`
  phình to sau này.

**Phát hiện phụ (ngoài concept buổi này, đáng ghi vì ảnh hưởng buổi trước):** `app.json` có
`userInterfaceStyle: "light"` — khoá app luôn sáng, khiến công sức dark mode ở Buổi 20 không thực sự
phát huy (hệ thống không bao giờ báo `'dark'` cho app). Đã báo cho người học, người học tự sửa thành
`"automatic"` ngay trong buổi này.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — chủ đề "secret management trong mobile app" hay
gặp khi CV có kinh nghiệm React Native/mobile security):*

> **Q: Có nên lưu API key/secret trong `app.json` hoặc biến môi trường nhúng vào bundle của app
> mobile không? Vì sao?**
> A: Không — bất kỳ thứ gì nhúng vào bundle lúc build (kể cả qua `app.json > extra`, hay biến
> `EXPO_PUBLIC_*`) đều nằm trong file `.ipa`/`.apk` cuối cùng, và ai cũng có thể giải nén để đọc lại,
> không cần hack server hay có quyền đặc biệt gì. Điều này đúng cho mọi nền tảng, kể cả code native
> biên dịch (Swift/Kotlin) — decompile/strings-extract vẫn lấy được string constant. Secret thật sự
> (API key trả phí, private key ký request) phải nằm ở backend; client chỉ gọi qua backend đó, backend
> mới là nơi giữ và dùng secret.

## Buổi 24 — TASK-24: Safe area & edge-to-edge — insets khác padding cố định
**Ngày:** 2026-09-09

**Vấn đề:** iPhone có notch/Dynamic Island (trên) và home indicator (dưới), khác nhau từng dòng máy.
Hardcode `paddingTop: 44` chỉ đúng cho ĐÚNG 1 dòng máy, sai hết các máy khác.

**Mental model:** Safe area insets là 4 con số (`top/bottom/left/right`) hệ điều hành tính THEO TỪNG
MÁY, báo "vùng này bị che, đừng đặt nội dung quan trọng ở đó" — là DỮ LIỆU RUNTIME phải hỏi hệ điều
hành, không phải padding thẩm mỹ tự chọn. `SafeAreaProvider` (đã có ở root từ Buổi 11) cung cấp dữ
liệu; `SafeAreaView`/`useSafeAreaInsets` là 2 cách TIÊU THỤ khác nhau.

**Đối chiếu cũ → mới:** UIKit cũ: `safeAreaLayoutGuide` tự động có sẵn trên mọi `UIViewController`,
constraint vào đó gần như miễn phí. RN: KHÔNG tự động cho mọi view — phải chủ động dùng
`react-native-safe-area-context` (thư viện, không built-in) và áp đúng chỗ; quên áp dụng không có
cảnh báo gì, chỉ lặng lẽ đè lên notch.

**Bẫy:**
- `SafeAreaView` áp padding CẢ 4 CẠNH mặc định — tiện khi cần bảo vệ toàn màn, nhưng thừa padding
  nếu chỉ cần 1 cạnh (ví dụ top đã có header lo rồi) → `useSafeAreaInsets()` linh hoạt hơn, áp đúng
  cạnh cần vào style đã có, không thêm 1 lớp View bọc ngoài.
- **Miss thật của buổi này — đánh giá NGƯỢC mức độ rủi ro:** tưởng "fullscreen" (không header, không
  tab bar) là AN TOÀN HƠN nên khỏi cần lo — sai hoàn toàn, đó chính là màn RỦI RO CAO NHẤT vì không
  có gì tự động chừa chỗ. Quy tắc đúng: **càng ít "chrome" tự động (header/tab bar), càng phải tự lo
  nhiều cạnh hơn**, không phải ngược lại.
- Nhầm cạnh cần bảo vệ: modal CÓ header thì TOP đã được lo tự động (header luôn tính safe area top),
  cạnh thật sự thiếu là BOTTOM (không tab bar, modal không tự full-bleed dưới home indicator).
- Bọc `SafeAreaView` lồng nhau nhiều lớp (cả layout cha và từng màn con) — cộng dồn padding sai.

**Quyết định & vì sao:**
- `app/recap/[matchId].tsx`: `useSafeAreaInsets()`, áp `paddingTop` + `paddingBottom` — không header,
  không tab bar, rủi ro cả 2 cạnh.
- `app/modal/quiz-room.tsx`: `useSafeAreaInsets()`, chỉ `paddingBottom` — header đã tự lo top.
- KHÔNG sửa `(tabs)/*` (header+tab bar mặc định của Tabs tự lo cả 2 cạnh), `+not-found.tsx` và
  `match/[id].tsx` (Stack screen bình thường có header mặc định lo top, nội dung căn giữa không chạm
  cạnh bottom) — tránh áp safe area tràn lan khi không cần, đúng tinh thần "chỉ sửa đúng chỗ có
  rủi ro thật".

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — chủ đề "safe area/edge-to-edge" hay gặp khi CV có
React Native, đối chiếu UIKit `safeAreaLayoutGuide`):*

> **Q: `SafeAreaView` và `useSafeAreaInsets` khác nhau ở đâu? Khi nào chỉ cần bảo vệ MỘT cạnh thay
> vì cả bốn?**
> A: `SafeAreaView` tự động thêm padding cho cả 4 cạnh và tạo thêm một View bọc ngoài — tiện cho màn
> hình hoàn toàn không có chrome nào khác bảo vệ. `useSafeAreaInsets()` trả về 4 con số insets, để tự
> quyết định áp cạnh nào vào style đã có — linh hoạt hơn khi một số cạnh đã được bảo vệ sẵn (ví dụ
> header luôn tự tính an toàn cho cạnh top, nên chỉ cần tự thêm `paddingBottom` cho phần còn thiếu,
> tránh cộng dồn padding thừa nếu dùng `SafeAreaView` cho cả 4 cạnh trong trường hợp đó).

## Buổi 25 — TASK-25: Tổng kết Sprint 1
**Ngày:** 2026-09-10

Không phải buổi học — không gate. Sprint 1 hoàn thành 25/25 task DEV, 24 buổi học qua gate (xem
`concept_log.yaml` cho chi tiết từng buổi, phần lớn qua ngay lần đầu, một số retried).

**Người học tự viết (Module 1):**
- "app.json là source of truth mọi config về native sẽ được sinh ra từ đây"
- "turbomodule và Fabric gọi qua JSI"

**Claude bổ sung:** ranh giới CNG là HÀNH VI (có sửa tay native hay không), không phải trạng thái
filesystem (có `ios/` hay không); phát hiện thực tế ở TASK-3 rằng New Architecture chạy vô điều kiện
từ SDK 55+ (sprint_plan mô tả sai khung "flag bật/tắt"); Dev Client vs Expo Go; Config Plugin; vòng
đời prebuild. Module 2-4 người học chọn không tự viết thêm ở buổi này.

**Bàn giao sprint** (chi tiết xem `README.md` và `dev_report@v2.yaml`): project Expo SDK 57 +
TypeScript strict chạy qua Dev Client; toàn bộ cây route Sportainment hoạt động; design system tối
thiểu (token, 6 component, env config, safe area). Nợ kỹ thuật cố ý để lại: `LoadingSkeleton` chưa
animation, auth guard là stub, vài màu hardcode cũ chưa dọn, chưa có network layer thật.

**3 phát hiện thực nghiệm đáng nhớ nhất của sprint** (không phải lý thuyết — tự kiểm chứng được):
1. Deep link race condition có thật (TASK-18): gọi URL ngay sau khi app vừa lên foreground khiến
   URL bị lỡ hoàn toàn.
2. `router.navigate()` với route dynamic không "unwind" về instance cũ dù href khớp chính xác —
   hành xử y hệt `push` (TASK-21), khác suy đoán ban đầu từ docs.
3. `userInterfaceStyle: "light"` trong `app.json` âm thầm vô hiệu hoá công sức dark mode — phát hiện
   nhờ đọc kỹ file cấu hình ở TASK-23, không phải nhờ test riêng cho dark mode.

Sprint 2 sẽ chuyển sang network layer (TanStack Query), Zustand, và dữ liệu thật thay placeholder.

---

## Buổi 26 — TASK-1: Discriminated Union trong TypeScript

- **Vấn đề**: Khi một entity có nhiều loại hình thể khác nhau (như sự kiện trận đấu: Bàn thắng, Thẻ phạt, Thay người), nếu gom tất cả thuộc tính vào một Interface dùng `optional (?)`, thuộc tính thừa sẽ luôn bị `undefined` ở runtime, gây khó khăn cho autocomplete và dễ phát sinh lỗi crash.
- **Mental model**: Mỗi loại sự kiện được định nghĩa riêng biệt và sở hữu chung 1 trường phân biệt (**Discriminant Property** `type`). Cơ chế **Control Flow Analysis** của TypeScript sẽ **Type Narrowing** chính xác trong khối `if/switch`.
- **Đối chiếu cũ → mới**: 
  - **Cũ (Any/Optional Interface)**: Khai báo 1 interface khổng lồ với nhiều optional fields, truy cập chỗ nào cũng phải ép kiểu `as` hoặc dùng `?.` không an toàn.
  - **Mới (Discriminated Union)**: Định nghĩa `type MatchEvent = GoalEvent | CardEvent | StatusChangeEvent;` với `type: 'GOAL' | 'CARD' | 'STATUS_CHANGE'`.
- **Bẫy**: Truy cập trực tiếp thuộc tính riêng (như `event.cardColor`) khi chưa check `event.type === 'CARD'` sẽ bị TypeScript chặn biên dịch (`Property does not exist on type GoalEvent`).
- **Quyết định & Vì sao**: Tạo file `src/features/matches/types.ts` làm Single Source of Truth cho toàn bộ kiểu dữ liệu Domain của tính năng Matches.
- **Câu hỏi phỏng vấn liên quan**:
  > **Q: Discriminated Union trong TypeScript là gì và nó giúp giải quyết vấn đề gì khi xử lý State / Event phức tạp trong React Native?**  
  > A: Discriminated Union là kỹ thuật kết hợp các Member Types lại bằng phép hợp (`|`), trong đó mỗi Member Type đều có chung một thuộc tính phân biệt dạng Literal (Discriminant Property, thường là `type` hoặc `kind`). Nó giải quyết triệt để rủi ro `undefined` runtime error của Interface optional tràn lan, giúp compiler tự động thu hẹp kiểu (Type Narrowing) dựa trên phân tích luồng lệnh (`if/switch`) và cung cấp Autocomplete chính xác 100%.

---

## Buổi 27 — TASK-2: Chiến lược Mock API (Async Contract Isolation)

- **Vấn đề**: Khi chưa có Backend thật, nếu import mảng JSON đồng bộ trực tiếp ở UI, code chạy ngay 0ms → không bao giờ kiểm thử được các kịch bản bất đồng bộ như Loading (Skeleton), Error State hay Latency. Đến khi nối API thật sẽ phải sửa nát code UI.
- **Mental model**: Tầng API đóng vai trò như một **Black Box Contract**. UI và TanStack Query chỉ tiêu thụ chữ ký hàm trả về `Promise<T>`. UI hoàn toàn không quan tâm bên trong hàm đang gọi `fetch()` thật hay giả lập `setTimeout`.
- **Đối chiếu cũ → mới**:
  - **Cũ (Redux-Saga/State thủ công)**: Thường dispatch action giả hoặc gọi mock ngầm bên trong Saga worker, trộn lẫn logic mock và logic quản lý state.
  - **Mới (TanStack Query / Async Layer)**: Tầng API tách rời hoàn toàn thành file `src/features/matches/api.ts`. Hàm API trả về `Promise`, TanStack Query tự quản lý lifecycle.
- **Bẫy**: Import mảng JSON trực tiếp khiến code chạy 0ms đồng bộ; hoặc hardcode dữ liệu giả nằm rải rác bên trong UI component thay vì gom về file API layer riêng.
- **Quyết định & Vì sao**: Chọn phương án tự viết hàm async (`Promise` + `setTimeout`) trong `src/features/matches/api.ts` thay vì cài đặt MSW. Lý do: Đơn giản, zero-dependency, phù hợp với dự án MVP/học tập mà vẫn đảm bảo 100% Async Interface chuẩn.
- **Câu hỏi phỏng vấn liên quan**:
  > **Q: Khi xây dựng ứng dụng Frontend/Mobile mà chưa có Backend API thật, bạn chọn chiến lược Mock dữ liệu như thế nào để khi tích hợp API thật không phải refactor code UI?**  
  > A: Tách biệt hoàn toàn tầng API (Data Access Layer) khỏi UI và State Management layer bằng cách tuân thủ Async Contract (`Promise<T>`). Bằng cách gom các hàm như `fetchMatches(): Promise<Match[]>` vào một module API riêng và giả lập độ trễ bằng `setTimeout`, toàn bộ các Hook (TanStack Query) và Component UI chỉ tiêu thụ chữ ký hàm bất đồng bộ đó. Khi Backend thật sẵn sàng, ta chỉ việc cập nhật nội dung hàm API mà giữ nguyên 100% logic ở UI và Hook.

---

## Buổi 28 — TASK-3: QueryClient & Server-State Cache Setup

- **Vấn đề**: Việc lưu dữ liệu lấy từ Server vào Redux Store hay React State thủ công gây tốn công sức tạo Reducer/Action/Saga cồng kềnh, dễ dẫn đến rủi ro dữ liệu không đồng bộ giữa các màn hình và dư thừa request API trùng lặp.
- **Mental model**: `QueryClient` là một **In-memory Key-Value Cache toàn cục** nằm HOÀN TOÀN NGOÀI cây React Component. Các component gọi `useQuery` thực chất là đang "Subscribe" vào một chìa khoá `queryKey` trong Cache Map này.
- **Đối chiếu cũ → mới**:
  - **Cũ (Redux / Redux-Saga)**: Client-state manager. Phải tự lưu mảng `matches` vào reducer, tự quản lý `isLoading`, dispatch action để saga fetch data rồi put success action.
  - **Mới (TanStack Query)**: Server-state cache manager. Không có Reducer hay Action. Màn A fetch xong sẽ ghi vào `QueryClient` cache dưới key `['matches']`, Màn B gọi `useQuery(['matches'])` lập tức lấy được dữ liệu từ cache mà không cần Redux.
- **Bẫy**: Khai báo `const queryClient = new QueryClient()` bên trong hàm Component (như `RootLayout`) ➔ Mỗi lần component re-render sẽ tạo instance mới và xoá sạch cache.
- **Quyết định & Vì sao**:
  - Khai báo `queryClient` dưới dạng Singleton ở ngoài cùng file `app/_layout.tsx`.
  - Cấu hình `staleTime: 1000 * 30` (30 giây) để giữ dữ liệu fresh, tránh refetch dồn dập mỗi khi component re-mount.
  - Bọc `<QueryClientProvider client={queryClient}>` bên trong `<SafeAreaProvider>` và bọc ngoài `<Stack>`.
- **Câu hỏi phỏng vấn liên quan**:
  > **Q: Sự khác biệt cơ bản về mặt tư duy kiến trúc giữa Redux Store và TanStack Query khi quản lý dữ liệu từ Backend trong ứng dụng React Native là gì?**  
  > A: Redux Store là Client-State Manager — nó coi dữ liệu từ Server như State nội bộ của app và bắt dev phải tự viết boilerplate (reducer, action, async middleware như Saga) để đồng bộ. Ngược lại, TanStack Query coi dữ liệu Server là một Cache toàn cục tạm thời — dữ liệu thuộc về Server chứ không thuộc về Client. TanStack Query tự động quản lý Lifecycle của Cache (fetch, cache, deduplicate, stale-checking, refetch ngầm, invalidate) mà không cần dev phải tự tạo Reducer hay Redux Store.

---

## Buổi 29 — TASK-4: Query Key Factory & staleTime vs gcTime

- **Vấn đề**: Việc hardcode chuỗi Query Key rải rác dẫn đến rủi ro sai lỗi chính tả và không thể làm mới/xoá cache theo phân cấp (Hierarchical Invalidating). Ngoài ra, nhầm lẫn giữa `staleTime` và `gcTime` khiến app refetch liên tục hoặc tràn RAM.
- **Mental model**:
  - **`staleTime`**: Thời gian dữ liệu được coi là Tươi (Fresh). Khi quá thời hạn này, dữ liệu trở thành Cũ (Stale).
  - **`Stale-While-Revalidate`**: Khi dữ liệu đã Stale, người dùng mở lại màn hình ➔ UI **render ngay lập tức dữ liệu cũ từ Cache (0ms delay)**, đồng thời **âm thầm refetch ngầm ở background** để cập nhật dữ liệu mới mượt mà.
  - **`gcTime` (Garbage Collection Time)**: Thời gian đếm ngược sau khi 0 component nào subscribe. Hết giờ ➔ Xóa sạch dữ liệu khỏi bộ nhớ RAM.
- **Đối chiếu cũ → mới**:
  - **Cũ (Hardcode String Key)**: `useQuery(['matches', id])` rải rác ở từng component.
  - **Mới (Query Key Factory)**: Định nghĩa `matchKeys` tập trung với kiểu `as const`, hỗ trợ phân cấp `matchKeys.all`, `matchKeys.lists()`, `matchKeys.detail(id)`.
- **Bẫy**: Nhầm tưởng `staleTime: 0` làm app không cache ➔ Bản chất nó vẫn hiển thị dữ liệu cache cũ trước rồi mới refetch ngầm ở background.
- **Quyết định & Vì sao**:
  - Tạo `src/features/matches/hooks.ts` chứa `useMatches` và `useMatchDetail`.
  - Dùng `enabled: !!id` trong `useMatchDetail` để ngắt query rác khi route parameter chưa sẵn sàng.
- **Câu hỏi phỏng vấn liên quan**:
  > **Q: Phân biệt `staleTime` và `gcTime` (trước đây là `cacheTime`) trong TanStack Query? Cơ chế Stale-While-Revalidate giúp cải thiện UX ứng dụng Mobile thế nào?**  
  > A: `staleTime` quyết định bao lâu thì dữ liệu bị xem là "cũ" và cần refetch ngầm. Trong khi đó `gcTime` quyết định bao lâu thì dữ liệu không còn component nào subscribe sẽ bị xóa hẳn khỏi RAM. Cơ chế Stale-While-Revalidate khi dữ liệu bị Stale sẽ ưu tiên render ngay dữ liệu cache lên màn hình mà không bắt user nhìn thấy Skeleton/Loading, sau đó âm thầm fetch ngầm ở background để cập nhật UI mượt mà mà không bị gián đoạn trải nghiệm người dùng.

---

## Buổi 30 — TASK-5: FlashList & View Recycling Performance

- **Vấn đề**: `ScrollView + map` tạo tất cả View cùng lúc làm tràn RAM trên danh sách dài. `FlatList` ảo hóa nhưng liên tục hủy bỏ (unmount) và khởi tạo lại (mount) View khi cuộn nhanh ➔ gây giật lag (dropped frames) và hiển thị khoảng trắng (blank space).
- **Mental model**: `FlashList` áp dụng nguyên lý **View Recycling**: Duy trì một số lượng Native View vừa đủ trên RAM. Khi 1 item cuộn ra khỏi màn hình, FlashList giữ nguyên Native View đó đẩy sang vị trí mới và chỉ re-bind dữ liệu (`item` mới) vào Component.
- **Đối chiếu cũ → mới**:
  - **Cũ (Native iOS UIKit)**: `UITableView` dùng `dequeueReusableCell(withIdentifier:for:)` để lấy cell cũ từ pool và gọi `cell.configure(with: item)`.
  - **Mới (React Native FlashList)**: FlashList hoạt động hệt như `UITableView`! Nó tái sử dụng các React Component / Native Views đã mount sẵn thay vì unmount như `FlatList`.
- **Bẫy**:
  - Khai báo sai `estimatedItemSize` (hoặc tính sai lệch quá nhiều ở phiên bản cũ): Làm FlashList tính sai tổng chiều cao và scroll offset ➔ Thanh cuộn bị nhảy và cuộn giật giật (scroll jank).
  - *Phát hiện thực nghiệm ở Expo SDK 57 / FlashList v2 (New Architecture)*: Trên New Architecture (Fabric), FlashList tự động tính toán kích thước chiều cao ở tầng Native nên không bắt buộc truyền `estimatedItemSize`.
- **Quyết định & Vì sao**:
  - Cài đặt `@shopify/flash-list`.
  - Cập nhật `app/(tabs)/index.tsx` sử dụng `<FlashList>` kết hợp với hook `useMatches()`.
- **Câu hỏi phỏng vấn liên quan**:
  > **Q: Vì sao FlashList lại đạt được hiệu năng 60fps tốt hơn nhiều so với FlatList mặc định của React Native khi hiển thị danh sách dài?**  
  > A: FlatList ảo hóa theo cơ chế Mount/Unmount (khi item cuộn khỏi màn hình sẽ bị unmount hoàn toàn, và khi item mới sắp xuất hiện sẽ mount component mới từ đầu), gây tốn chi phí khởi tạo JS Component và Native Views dẫn đến giật khựng khung hình. Trong khi đó, FlashList áp dụng cơ chế View Recycling (tương tự `UITableView` trong iOS UIKit hay `RecyclerView` trong Android): giữ nguyên một số lượng Component/Native View cố định và chỉ re-bind prop `item` mới khi cuộn, loại bỏ hoàn toàn chi phí mount/unmount component.

---

## Buổi 31 — TASK-6: Trạng thái tải (isPending vs isFetching vs isRefetching)

- **Vấn đề**: Dùng chung một biến `isLoading` duy nhất để quyết định hiện Skeleton khiến thao tác Pull-to-refresh làm toàn bộ danh sách trận đấu biến mất và bị che bởi màn hình Skeleton chớp giật.
- **Mental model**:
  - **`isPending` (isLoading)**: Chưa có dữ liệu nào trong Cache Map ➔ **Dùng duy nhất cho LoadingSkeleton lần đầu**.
  - **`isFetching`**: Đang có request API diễn ra ngầm (dữ liệu cũ vẫn hiển thị bình thường).
  - **`isRefetching`**: Đang refetch ngầm do người dùng vuốt tay Pull-to-refresh ➔ **Dùng cho `refreshing` của RefreshControl**.
- **Đối chiếu cũ → mới**:
  - **Cũ (Redux-Saga)**: Tự tạo và tự chuyển đổi 2 biến boolean `isInitialLoading` và `isRefreshing` trong Reducer thủ công qua từng Action.
  - **Mới (TanStack Query)**: TanStack Query cấp sẵn `isPending`, `isRefetching` và hàm `refetch()`.
- **Bẫy**: Dùng `isFetching` để render Skeleton ➔ Khi app refetch ngầm ở background hoặc khi user kéo Pull-to-refresh, toàn bộ UI lập tức biến thành Skeleton.
- **Quyết định & Vì sao**:
  - Cập nhật `app/(tabs)/index.tsx`: Chỉ render `<LoadingSkeleton />` khi `isPending === true`.
  - Truyền `refreshing={isRefetching}` và `onRefresh={refetch}` vào `<FlashList>` để hiển thị Native RefreshControl mượt mà.
- **Câu hỏi phỏng vấn liên quan**:
  > **Q: Khi tích hợp tính năng Pull-to-Refresh kết hợp với TanStack Query trong React Native, bạn quản lý các cờ trạng thái `isPending`, `isFetching`, `isRefetching` như thế nào để đảm bảo trải nghiệm UX không bị chớp giật màn hình?**  
  > A: Ta chỉ dùng cờ `isPending` (khi chưa có dữ liệu nào trong cache) để hiển thị Skeleton hoặc Fullscreen Loading Spinner trong lần mở ứng dụng đầu tiên. Đối với tính năng Pull-to-Refresh, ta giữ nguyên danh sách dữ liệu cũ đang render trên UI và chỉ truyền cờ `isRefetching` vào prop `refreshing` cùng hàm `refetch()` vào `onRefresh` của `FlashList` (hoặc `RefreshControl`). Cách làm này giúp spinner kéo thả của hệ thống hiển thị mượt mà phía trên danh sách cũ mà không làm biến mất UI hay gây chớp giật màn hình.

---

## Buổi 32 — TASK-7: WebSocket Reconnect & Exponential Backoff

- **Vấn đề**: API `WebSocket` tiêu chuẩn của W3C không tự động reconnect khi mất kết nối. Nếu thử kết nối lại liên tục mỗi 1s không dừng, ứng dụng sẽ bị ngốn pin, làm nóng máy và có nguy cơ làm sập server (Thundering Herd Problem) khi hệ thống vừa khôi phục.
- **Mental model**: **Exponential Backoff**: Lùi thời gian chờ retry theo công thức lũy thừa \( delay = \text{initialDelay} \times 2^{\text{retryCount}} \) (1s ➔ 2s ➔ 4s ➔ 8s ➔ 16s... max 30s).
- **Đối chiếu cũ → mới**:
  - **Cũ (Redux-Saga `eventChannel`)**: Thường viết logic reconnect lặp lại ngay bên trong Saga worker.
  - **Mới (Standalone Class / Event Emitter)**: Tách riêng module `WSClient` thành một class/object độc lập với React tree và Redux, tự quản lý lifecycle kết nối ngầm và cấp pattern Pub-Sub.
- **Bẫy**:
  - Quên reset `retryCount = 0` khi `ws.onopen` (kết nối thành công) ➔ Làm lần mất mạng sau này bị lùi delay quá lâu.
  - Nhầm lẫn rằng `WebSocket` tự có tính năng auto-reconnect ➔ Thực tế chỉ các thư viện tầng trên như Socket.io mới có.
- **Quyết định & Vì sao**:
  - Tạo `src/lib/ws-client.ts` chứa class `WSClient` với `initialRetryDelay: 1000`, `maxRetryDelay: 30000`.
  - Hỗ trợ `emitMockEvent()` cho phép tự bắn event giả lập trong môi trường Dev/Test mà không cần dựng WS server thật.
- **Câu hỏi phỏng vấn liên quan**:
  > **Q: Thuật toán Exponential Backoff giải quyết vấn đề gì khi thiết kế cơ chế Reconnect cho WebSocket trên ứng dụng Mobile?**  
  > A: API `WebSocket` tiêu chuẩn không có cơ chế tự động kết nối lại khi đứt mạng. Nếu client thử lại với chu kỳ ngắn cố định (ví dụ mỗi 1s), thiết bị sẽ bị ngốn pin nhanh và khi server vừa khôi phục sẽ bị hàng ngàn client đồng thời xả request gây ngỏm server lần 2 (Thundering Herd). Exponential Backoff giải quyết điều này bằng cách lùi thời gian chờ thử lại theo cấp số nhân (1s ➔ 2s ➔ 4s... max 30s), giúp giảm 80% số lần kết nối rác, bảo vệ pin thiết bị và cho server khoảng thở để hồi phục.

## Buổi 33 — TASK-8: AppState — vì sao kết nối realtime phải dọn dẹp khi app xuống nền
**Ngày:** 2026-09-11

**Vấn đề:** `ws-client.ts` (Buổi 32) chỉ biết tự reconnect khi mạng đứt, không biết gì về app đang
foreground hay background. Để app chạy nền không dọn kết nối = tốn pin vô ích cho việc không ai nhìn
thấy UI cập nhật.

**Mental model:** `AppState` báo 3 trạng thái vòng đời: `active` (foreground), `background` (đã rời
app), `inactive` (chuyển tiếp ngắn, chủ yếu iOS). Chủ động gọi `disconnect()` khi vào `background`,
`connect()` lại khi về `active` — không phải OS tự lo, phải code tường minh.

**Đối chiếu cũ → mới:** Chính xác là cặp `applicationDidEnterBackground`/`willEnterForeground` (hoặc
`UIApplication.willResignActiveNotification`/`didBecomeActiveNotification`) trong native iOS —
`AppState` của RN là lớp bọc JS cho đúng cơ chế đó, không phải khái niệm mới.

**Bẫy:**
- Dùng `inactive` như `background` — `inactive` xảy ra cả lúc ngắn ngủi (kéo Control Center), disconnect
  ở đó chỉ gây reconnect thừa, không lợi ích thật.
- Quên cleanup listener của chính `AppState.addEventListener` khi unmount — memory leak kiểu khác
  (nối lại bài `useEffect` cleanup Buổi 11 Sprint 1).
- Gọi `connect()` mỗi lần `active` không kiểm tra đã kết nối chưa — an toàn NHỜ guard đã viết sẵn ở
  `ws-client.ts` (Buổi 32), không phải nhờ `AppState` tự khôn.
- App chạy nền nhiều giờ: OS có xu hướng ngắt/suspend socket ở tầng hệ thống, nhưng state JS
  (`this.socket`) không tự biết — dẫn tới trạng thái "tưởng đang kết nối" nhưng thực ra đã chết, lỗi
  âm thầm khó phát hiện nếu không chủ động disconnect trước.

**Quyết định & vì sao:**
- `src/lib/useAppStateSync.ts` — hook riêng, đặt ở `src/lib/` (không phải `src/features/matches/`)
  vì `ws-client` vốn generic, không thuộc riêng feature nào.
- Gọi ở `app/_layout.tsx`, ngay sau `useAuthStub()`, TRƯỚC mọi early return — bắt buộc theo rule of
  hooks, không được gọi hook có điều kiện. Hệ quả: WS mở cả khi `status === 'unauthenticated'`, chưa
  gate theo auth ở sprint này (để dành Sprint 4/F-016).
- Tiện tay sửa nốt `ws-client.ts`: URL hardcode `'wss://api.sportpulse.com/live'` → đọc từ `WS_URL`
  (env.ts) — nợ kỹ thuật phát hiện đầu buổi, không phải concept hôm nay nhưng thuần cơ học nên sửa
  luôn thay vì để lại.

**Sự cố ngoài buổi học (đã xử lý trước khi vào gate):** chạy `npx expo prebuild` + `yarn ios` báo
thiếu thư viện. Nguyên nhân: `package.json` đã khai `@tanstack/react-query` + `@shopify/flash-list`
từ session khác, nhưng chưa từng `npm install` trên máy này — sửa `package.json` không tự cài gói.
Đã `npm install` (dùng npm, không yarn — dự án có `package-lock.json`), restart Metro `--clear`,
verify app boot lại đúng với dữ liệu mock. Đã ghi thành bảng "Khi nào cần lệnh nào" vào README.md.

**Câu hỏi phỏng vấn liên quan** *(câu hỏi khả dĩ — chủ đề "quản lý kết nối realtime theo vòng đời
app" hay gặp khi CV có WebSocket/real-time feature):*

> **Q: Vì sao cần lắng nghe `AppState` để đóng/mở lại kết nối WebSocket, thay vì cứ giữ nguyên kết
> nối xuyên suốt vòng đời app?**
> A: Duy trì kết nối khi app ở background vừa tốn pin (giữ radio/network active) vừa vô nghĩa (không
> UI nào hiển thị cập nhật). Ngoài ra, hệ điều hành có xu hướng suspend/ngắt socket ở tầng hệ thống
> khi app ở nền đủ lâu, nhưng state phía JS không tự biết điều đó — nếu không chủ động disconnect
> trước, app có thể rơi vào trạng thái "tưởng đang kết nối" nhưng socket đã chết, gây lỗi âm thầm khi
> mở lại. Chủ động đóng khi `background`, mở lại khi `active` giải quyết cả hai vấn đề.








