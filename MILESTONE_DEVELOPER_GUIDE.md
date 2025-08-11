# Tài liệu Phát Triển Hệ Thống Milestone

Tài liệu này dành cho developer tiếp nhận và mở rộng hệ thống Milestone (thành tích / tiến trình / lặp lại) đã được triển khai. Nó bổ sung góc nhìn kiến trúc, quy ước mở rộng và quy trình kiểm thử ngoài nội dung triển khai trong `CONFIGURATION.md`.

> Đọc kèm: `CONFIGURATION.md` (triển khai & cấu hình), các migration trong `supabase/migrations/`, các edge function trong `supabase/functions/`.

---
## 1. Mục Tiêu & Phạm Vi
- Theo dõi tiến trình người chơi đối với các mốc (milestones) đa loại: progress, achievement, social, repeatable.
- Tự động ghi nhận sự kiện từ database triggers (matches, challenges, tournaments, profiles, rank_requests) ➜ Edge Functions ➜ cập nhật bảng tiến trình & ghi log thưởng.
- Ghi nhận lịch sử trao thưởng (audit) để hiển thị UI (Recent Awards) + truy vết lỗi.
- Hỗ trợ milestone lặp lại (daily / weekly / streak) với logic hạn chế theo ngày.

### Không nằm trong phạm vi hiện tại
- Dedupe tuyệt đối mọi sự kiện (mới chỉ có cột `dedupe_key` dự phòng).
- Batching nhiều completion trong một lần vượt nhiều bậc requirement.
- Realtime notifications / WebSocket push.
- Queue retry khi edge function lỗi tạm thời.

---
## 2. Tổng Quan Kiến Trúc
```
Postgres Triggers  -->  call_milestone_triggers (http_post)  --> Edge Function milestone-triggers
   (tf_*)                 (GUC + http ext)                         | (lặp từng event)
                                                               Edge Function milestone-event
                                                               - Tính toán tiến trình
                                                               - Ghi player_milestones
                                                               - Gọi award_spa_points
                                                               - Ghi milestone_awards (success/error)

Các tác nhân phụ trợ:
  daily-checkin  (login streak, weekly counters) -> milestone-event
  weekly-reset   (reset progress weekly_*)
UI:
  MilestonePage + RecentMilestoneAwards RPC (recent_milestone_awards)
```

---
## 3. Mô Hình Dữ Liệu (Tóm tắt)
| Bảng | Chức năng chính | Ghi chú |
|------|-----------------|---------|
| `milestones` | Danh mục milestone | `milestone_type` là khóa logic chính (không unique tuyệt đối vì có thể có biến thể requirement_value khác) |
| `player_milestones` | Tiến trình từng người chơi | Trạng thái cho non-repeatable & đếm `times_completed` cho repeatable |
| `player_daily_progress` | Đếm/bool theo ngày | Hỗ trợ login streak & daily patterns |
| `player_login_streaks` | Chuỗi login + weekly bucket | Tách để truy vấn nhanh |
| `milestone_events` | Audit sự kiện gốc đã bắn | Lưu 1 hàng / event batched |
| `milestone_awards` | Lịch sử trao thưởng SPA + trạng thái | Có `status` & `error_message` |

### Các cột quan trọng (player_milestones)
- `current_progress`: Tiến trình hiện tại (reset theo logic lặp lại tuỳ loại).
- `is_completed`: Chỉ meaningful cho non-repeatable.
- `times_completed`: Số lần đã hoàn thành (repeatable tăng dần).
- `last_daily_completion`: Dùng khóa chống trao thưởng >1 lần/ngày khi `daily_limit=1`.

### Repeatable vs Non-Repeatable
- Non-repeatable: Một lần đạt ngưỡng => `is_completed=true`, thưởng 1 lần.
- Repeatable daily_limit=1: Chỉ thưởng 1 lần mỗi ngày; vẫn cộng dồn progress đến requirement rồi reset/carry.
- Repeatable không daily_limit: Mỗi lần đủ requirement ➜ trao thưởng, giảm `requirement_value` (carry remainder) & tăng `times_completed`.

---
## 4. Dòng Chảy Sự Kiện
1. UPDATE/INSERT domain table (matches/challenges/tournaments/profiles/rank_requests).
2. Trigger `tf_*` build JSON batch `{events:[...]}`.
3. `call_milestone_triggers` dùng `http_post` -> `/functions/v1/milestone-triggers`.
4. `milestone-triggers` lặp từng event -> POST tiếp `/functions/v1/milestone-event`.
5. `milestone-event` cập nhật `player_milestones`, tính completion, gọi RPC `award_spa_points`, ghi `milestone_awards`.
6. UI / RPC truy vấn hiển thị.

Fallback (nếu http ext bị tắt): chuyển sang queue table (ví dụ `milestone_queue`) + worker edge function chạy cron.

---
## 5. Edge Functions (Hợp đồng API)
### milestone-event
Payload: `{ player_id? | user_id?, event_type: string, value?: number, metadata?: any }`
Response: `{ success: true, updated: <số milestones xử lý> }` hoặc lỗi 4xx/5xx.

### milestone-triggers
Payload: `{ events: [ { player_id? | user_id?, event_type, value? } ] }`
Response: `{ forwarded: n, results: [ { ok, ... } ] }`.

### daily-checkin
Payload: `{ player_id? | user_id? }`
Logic: cập nhật streak + bắn events: `daily_login`, `login_streak`, `weekly_login` (giai đoạn).

### weekly-reset
Scheduled (cron): reset các milestone có `milestone_type LIKE 'weekly_%'` về progress=0.

---
## 6. Trigger Functions (DB)
| Function | Bảng nguồn | Điều kiện | Event(s) | Ghi chú |
|----------|------------|-----------|----------|---------|
| `tf_match_completed` | `matches` | status -> completed | `match_count`, (winner) `challenge_win` | Có thể mở rộng thêm win_streak, win_rate (hiện chưa tính trực tiếp) |
| `tf_challenge_completed` | `challenges` | status -> completed | `challenge_send` | Placeholder cơ bản |
| `tf_tournament_join` | `tournament_participants` | insert | `tournament_join` | Idempotent theo insert |
| `tf_tournament_completed` | `tournaments` | status -> completed & winner | `tournament_win` | Thêm streak tương lai |
| `tf_profile_created` | `profiles` | insert | `account_creation` | Kickstart |
| `tf_rank_request_approved` | `rank_requests` | status -> approved | `rank_registration` | Migration sau thêm |

Mở rộng: tạo `tf_<domain>_<phase>` theo mẫu, dùng JSON batch để giảm round trip.

---
## 7. RPC & UI
`recent_milestone_awards(p_limit INT)` trả về danh sách thưởng mới nhất theo người dùng (auth.uid()).
Frontend component: `RecentMilestoneAwards.tsx` dùng React Query gọi RPC.

---
## 8. Bảo Mật & RLS
- Bảng tiến trình & awards: user chỉ đọc hàng của chính họ (`player_id = auth.uid()`).
- Ghi/Update bên trong edge functions dùng service role key (bỏ qua RLS mặc định).
- RPC security definer: đảm bảo cấp EXECUTE cho role `authenticated`.
- Không commit service role key vào repo; thiết lập env cho functions.

---
## 9. Quy Trình Thêm Milestone Mới
1. Xác định `milestone_type` (snake_case, danh từ/verb-ngắn, nhóm theo prefix nếu weekly/daily: `weekly_`, `daily_`).
2. Chọn category: `progress | achievement | social | repeatable`.
3. Xác định repeatable? daily_limit? requirement_value? reward?
4. Thêm hàng vào migration mới hoặc script seed idempotent (không sửa migration cũ đã chạy production).
5. Nếu cần event mới: cập nhật triggers hoặc logic app/edge đẩy event.
6. Viết test (smoke hoặc integration) kiểm tra hiển thị & award.
7. Chạy migrations & triển khai.

Ví dụ migration snippet:
```sql
INSERT INTO public.milestones (name, description, category, milestone_type, requirement_value, spa_reward, is_repeatable, daily_limit, sort_order)
SELECT 'Tên', 'Mô tả', 'progress', 'new_feature_usage', 10, 100, false, NULL, 99
WHERE NOT EXISTS (
  SELECT 1 FROM public.milestones WHERE milestone_type='new_feature_usage' AND requirement_value=10
);
```

---
## 10. Thêm Event Type Mới
1. Đặt tên event_type = milestone_type (ưu tiên đồng bộ). Nếu khác (một event cập nhật nhiều milestone) thì mapping ở `milestone-event` bằng truy vấn milestone_type.
2. Thêm trigger DB hoặc emit từ edge function khác / backend khi hành vi xảy ra.
3. Nếu source là DB: tạo `tf_<table>_<action>` -> xây `v_events` -> `PERFORM call_milestone_triggers(...)`.
4. Nếu source là app logic: gọi trực tiếp HTTP `milestone-triggers` (batch) hoặc `milestone-event` (single) kèm bearer service key (chỉ backend).

---
## 11. Logic Xử Lý Trong milestone-event (Chi Tiết)
Pseudo:
```
fetch milestones by event_type => loop:
  tính increment = value || 1
  if !is_repeatable:
     cập nhật progress; nếu đạt ngưỡng => mark completed + award (1 lần)
  else:
     nếu daily_limit=1 & last_daily_completion=today => chỉ cập nhật progress (nếu chưa full)
     cộng progress, nếu >= requirement_value => awardCount=1, carry remainder
     cập nhật times_completed, last_daily_completion nếu daily gate
  award: rpc award_spa_points -> insert milestone_awards (status success/error)
```

Edge case chính:
- Mất kết nối RPC award: award_points fail => status='error' (không cộng SPA?). Cần retry thủ công hoặc logic bù.
- Nhiều milestone share cùng event_type: vòng lặp xử lý độc lập.

---
## 12. Award Logging & Truy Vết Lỗi
- Mỗi award ghi 1 dòng với status.
- Truy vấn nhanh: `SELECT * FROM milestone_awards WHERE status='error' ORDER BY awarded_at DESC;`
- Gợi ý tương lai: cột `retry_count`, job retry.

---
## 13. Testing Chiến Lược
| Cấp | Nội dung | Công cụ |
|-----|----------|--------|
| Smoke UI | Đếm & render milestone list | Jest + React Testing Library (đã có) |
| Unit Edge (tùy chọn) | Tách logic processEvent thành module thuần JS để test | Jest |
| Integration DB | Chạy migrations + gọi trigger (sử dụng Supabase local) | Supabase CLI + Jest script |
| Regression | So sánh số lượng milestone & sort_order | Snapshot |

Checklist test khi thêm milestone mới:
1. Migrations chạy sạch (`supabase db push` hoặc diff apply local).
2. Milestone hiển thị trong UI category đúng.
3. Event test (INSERT/UPDATE) làm tăng progress hoặc tạo award line.
4. Không duplicate awards trong cùng ngày (daily_limit=1).

---
## 14. Quy Trình Triển Khai Chuẩn (Tóm tắt)
1. Tạo migration mới (không sửa file cũ đã chạy production).
2. Chạy test local.
3. `git push` -> CI (nếu có) -> apply migrations staging.
4. Deploy edge functions thay đổi.
5. Chạy script validation (xem `CONFIGURATION.md`).
6. Giám sát log awards 24h đầu.

---
## 15. Quan Sát & Debug
- Đếm tần suất award theo milestone: `SELECT milestone_id, COUNT(*) FROM milestone_awards GROUP BY 1 ORDER BY 2 DESC;`
- Phân tích thời gian gần: `SELECT * FROM milestone_events ORDER BY created_at DESC LIMIT 50;`
- Kiểm tra chậm: add INDEX nếu truy vấn nhiều trên `event_type` / `player_id`.

---
## 16. Vấn Đề Hiệu Năng & Mở Rộng
| Chủ đề | Hiện tại | Nâng cấp đề xuất |
|--------|----------|------------------|
| Batching HTTP | Gửi từng event từ milestone-triggers | Gom theo loại vào 1 POST cải tiến milestone-event nhận mảng |
| Idempotency | Dựa vào `dedupe_key` (chưa dùng rộng) | Buộc đặt khi trigger có nguy cơ lặp / tạo unique index đầy đủ |
| Retry award | Không retry tự động | Hàng đợi (table + cron) hoặc job queue external |
| Multi-award per large increment | Cắt 1 lần | Vòng while nếu `value` lớn (carry nhiều lần) |
| Monitoring | Thủ công truy vấn | Dashboards (SQL + Grafana / pg_stat_statements) |

---
## 17. Lộ Trình Mở Rộng Gợi Ý
1. Realtime notification (channel broadcast khi award mới). 
2. Admin dashboard điều chỉnh milestone & xem thống kê.
3. Batch process events để giảm round trips.
4. Dedup chính thức (bảng events riêng + unique hash). 
5. Retry & dead-letter queue cho awards lỗi.
6. A/B test reward (cột variant / weighting). 

---
## 18. Quy Ước Đặt Tên & Chuẩn
- `milestone_type`: snake_case, nhóm logic: `daily_`, `weekly_`, `checkin_streak_`, v.v.
- Trigger: `tf_<table>_<action>`; trigger name: `trg_<domain>_<action>`.
- Migration file: `YYYYMMDDHHMMSS_<short_description>.sql`.
- Event payload: luôn có `event_type` + 1 trong `player_id|user_id`.

---
## 19. Checklist Code Review Khi Thay Đổi
[] Migrations idempotent (dùng IF EXISTS / WHERE NOT EXISTS)
[] Không phá hủy dữ liệu production vô tình
[] RLS vẫn bảo đảm quyền đọc phù hợp
[] Edge function không log secret (service role key)
[] Performance: tránh N+1 truy vấn (hiện fetch milestones 1 query + vòng lặp per milestone chấp nhận được do số milestone loại nhỏ)
[] Test smoke cập nhật nếu thay đổi count/sort_order
[] Document thay đổi trong README / guide

---
## 20. Phụ Lục: Trạng Thái & Trường Chính
| Trường | Mô tả | Ghi chú |
|--------|-------|---------|
| `milestones.is_repeatable` | true nếu lặp | Phân nhánh logic award |
| `milestones.daily_limit` | =1 giới hạn 1 award/ngày | Null => không giới hạn theo ngày |
| `player_milestones.times_completed` | Số lần hoàn thành repeatable | Non-repeatable giữ 0 hoặc 1 |
| `milestone_awards.status` | success/error | error => không cộng SPA |
| `milestone_awards.occurrence` | Số completion “gói” trong award | Hiện chỉ 1 |

---
## 21. Câu Hỏi Thường Gặp (FAQ)
Q: Tại sao RPC recent_milestone_awards không thấy?
> Chưa apply migration tương ứng hoặc quyền EXECUTE thiếu.

Q: Muốn reset milestone của 1 user để test?
> Xóa hàng trong `player_milestones` và `milestone_awards` cho user test (không làm production thực tế), rồi phát lại sự kiện.

Q: Thêm milestone thay đổi sort_order có ảnh hưởng gì?
> UI chỉ dùng sort_order để sắp; thay đổi không phá tiến trình.

---
## 22. Ghi Chú Bảo Trì
- Giữ các edge function phiên bản library Supabase đồng bộ (update major cần test regressions logic auth).
- Trước khi tối ưu lớn (batch, queue), tạo benchmark baseline (số ms trung bình per event).

---
## 23. Liên Quan Khác
- `CONFIGURATION.md`: chi tiết biến môi trường, GUC, validation script.
- Test file: `src/__tests__/smoke/milestones.smoke.test.tsx` – ví dụ mock Supabase client.

---
**Kết thúc tài liệu.**
