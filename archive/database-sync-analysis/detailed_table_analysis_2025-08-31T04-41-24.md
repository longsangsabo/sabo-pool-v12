# 🔍 SABO Pool V12 - Detailed Table Structure Analysis

**Generated:** 8/31/2025, 4:41:25 AM  
**Tables Analyzed:** 9  
**Total Columns:** 200

## 📊 Summary Statistics

- **Tables with Data:** 9/9
- **Average Columns per Table:** 22
- **Total Relationships Found:** 3

## 📋 Detailed Table Analysis

### 📊 Table: `profiles`

**Records:** 181  
**Columns:** 31  
**Status:** 🟢 Has Data

#### Column Structure
- **id**: string (identifier)
- **user_id**: string (identifier)
- **full_name**: string 
- **display_name**: string 
- **avatar_url**: string (url)
- **bio**: string 
- **verified_rank**: string 
- **elo**: number 
- **created_at**: string (timestamp)
- **updated_at**: string (timestamp)
- **is_admin**: boolean 
- **phone**: string 
- **skill_level**: string 
- **active_role**: string 
- **role**: string 
- **nickname**: unknown 
- **email**: string (email)
- **city**: string 
- **district**: unknown 
- **member_since**: string 
- **completion_percentage**: number 
- **is_demo_user**: boolean 
- **ban_status**: string 
- **ban_reason**: unknown 
- **banned_at**: unknown 
- **banned_by**: unknown 
- **cover_image_url**: string (url)
- **current_rank**: string 
- **spa_points**: number 
- **player_id**: string (identifier)
- **is_temp_player**: boolean 

#### Sample Data
```json
[
  {
    "id": "4b18f69b-d907-48d9-b27e-9b43431b48db",
    "user_id": "ed64fe18-5794-4cdb-bc62-17ce7697e83e",
    "full_name": null,
    "display_name": null,
    "avatar_url": null,
    "bio": null,
    "verified_rank": null,
    "elo": 1000,
    "created_at": "2025-08-23T11:28:23.024234+00:00",
    "updated_at": "2025-08-23T11:28:23.024234+00:00",
    "is_admin": false,
    "phone": null,
    "skill_level": "beginner",
    "active_role": "player",
    "role": "player",
    "nickname": null,
    "email": null,
    "city": null,
    "district": null,
    "member_since": "2025-08-23T11:28:23.024234+00:00",
    "completion_percentage": 0,
    "is_demo_user": false,
    "ban_status": "active",
    "ban_reason": null,
    "banned_at": null,
    "banned_by": null,
    "cover_image_url": null,
    "current_rank": "K",
    "spa_points": 0,
    "player_id": "ed64fe18-5794-4cdb-bc62-17ce7697e83e",
    "is_temp_player": false
  },
  {
    "id": "83e44683-074b-40c8-84bf-a38feaf620cc",
    "user_id": "18f6e853-b072-47fb-9c9a-e5d42a5446a5",
    "full_name": "Võ Long Sang ",
    "display_name": "SABO BILLIARDS",
    "avatar_url": "https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/avatars/18f6e853-b072-47fb-9c9a-e5d42a5446a5/avatar-18f6e853-b072-47fb-9c9a-e5d42a5446a5-1755875757751.jpeg",
    "bio": null,
    "verified_rank": "H+",
    "elo": 1500,
    "created_at": "2025-07-23T04:24:58.596488+00:00",
    "updated_at": "2025-08-24T01:04:32.508732+00:00",
    "is_admin": false,
    "phone": "0961167717",
    "skill_level": "intermediate",
    "active_role": "player",
    "role": "player",
    "nickname": null,
    "email": "jesse421996@gmail.com",
    "city": "Vũng Tàu",
    "district": null,
    "member_since": "2025-07-23T04:24:58.596488+00:00",
    "completion_percentage": 0,
    "is_demo_user": false,
    "ban_status": "active",
    "ban_reason": null,
    "banned_at": null,
    "banned_by": null,
    "cover_image_url": "https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/avatars/18f6e853-b072-47fb-9c9a-e5d42a5446a5/covers/1753269306333_c1zfvi.jpg",
    "current_rank": "H+",
    "spa_points": 298,
    "player_id": "18f6e853-b072-47fb-9c9a-e5d42a5446a5",
    "is_temp_player": false
  }
]
```

#### Insights
- ✅ Có dữ liệu đầy đủ để test
- ✅ Có cấu trúc chuẩn (id + created_at)
- 🔗 Có liên kết với user system
- 🎯 Ranking system columns present

#### Relationships
- No relationships found

---

### 📊 Table: `challenges`

**Records:** 10  
**Columns:** 36  
**Status:** 🟢 Has Data

#### Column Structure
- **id**: string (identifier)
- **challenger_id**: string (identifier)
- **opponent_id**: string (identifier)
- **status**: string 
- **challenge_message**: unknown 
- **response_message**: unknown 
- **created_at**: string (timestamp)
- **responded_at**: string 
- **completed_at**: string 
- **is_open_challenge**: boolean 
- **bet_points**: number 
- **race_to**: number 
- **handicap_1_rank**: string 
- **handicap_05_rank**: string 
- **message**: string 
- **expires_at**: string 
- **challenge_type**: string 
- **handicap_data**: object 
- **club_id**: string (identifier)
- **scheduled_time**: string 
- **challenger_score**: number 
- **opponent_score**: number 
- **winner_id**: string (identifier)
- **started_at**: string 
- **updated_at**: string (timestamp)
- **challenger_name**: string 
- **location**: string 
- **required_rank**: string 
- **is_sabo**: boolean 
- **club_confirmed**: boolean 
- **club_confirmed_at**: string 
- **club_confirmed_by**: unknown 
- **club_note**: string 
- **challenger_player_id**: string (identifier)
- **opponent_player_id**: string (identifier)
- **bet_amount**: number 

#### Sample Data
```json
[
  {
    "id": "c3e2d2c1-69d5-47a8-9d30-05f926498919",
    "challenger_id": "21c71eb2-3a42-4589-9089-24a9340a0e6a",
    "opponent_id": null,
    "status": "declined",
    "challenge_message": null,
    "response_message": null,
    "created_at": "2025-08-23T12:19:49.62875+00:00",
    "responded_at": null,
    "completed_at": null,
    "is_open_challenge": true,
    "bet_points": 100,
    "race_to": 8,
    "handicap_1_rank": "0",
    "handicap_05_rank": "0",
    "message": "",
    "expires_at": "2025-08-25T12:19:49.263+00:00",
    "challenge_type": "standard",
    "handicap_data": {},
    "club_id": "8d883f90-0c54-4757-adba-25f1d5c02174",
    "scheduled_time": null,
    "challenger_score": 0,
    "opponent_score": 0,
    "winner_id": null,
    "started_at": null,
    "updated_at": "2025-08-23T14:11:59.773972+00:00",
    "challenger_name": "Trần hải",
    "location": "SBO POOL ARENA",
    "required_rank": "I",
    "is_sabo": true,
    "club_confirmed": false,
    "club_confirmed_at": null,
    "club_confirmed_by": null,
    "club_note": null,
    "challenger_player_id": "21c71eb2-3a42-4589-9089-24a9340a0e6a",
    "opponent_player_id": null,
    "bet_amount": 100
  },
  {
    "id": "b73e120d-e693-4be8-aa67-7a9a13df0e9f",
    "challenger_id": "74f72a82-d447-4dfd-a5f8-36701963b5d1",
    "opponent_id": "18f6e853-b072-47fb-9c9a-e5d42a5446a5",
    "status": "expired",
    "challenge_message": null,
    "response_message": null,
    "created_at": "2025-08-23T23:35:34.097454+00:00",
    "responded_at": "2025-08-24T00:26:28.09604+00:00",
    "completed_at": null,
    "is_open_challenge": true,
    "bet_points": 100,
    "race_to": 8,
    "handicap_1_rank": "0",
    "handicap_05_rank": "0",
    "message": "",
    "expires_at": "2025-08-25T23:35:33.979+00:00",
    "challenge_type": "standard",
    "handicap_data": {},
    "club_id": "8d883f90-0c54-4757-adba-25f1d5c02174",
    "scheduled_time": "2025-08-23T23:40:00+00:00",
    "challenger_score": 0,
    "opponent_score": 0,
    "winner_id": null,
    "started_at": null,
    "updated_at": "2025-08-24T00:26:34.751587+00:00",
    "challenger_name": "Hoàng Anh",
    "location": "SBO POOL ARENA",
    "required_rank": "I",
    "is_sabo": true,
    "club_confirmed": false,
    "club_confirmed_at": null,
    "club_confirmed_by": null,
    "club_note": null,
    "challenger_player_id": "74f72a82-d447-4dfd-a5f8-36701963b5d1",
    "opponent_player_id": "18f6e853-b072-47fb-9c9a-e5d42a5446a5",
    "bet_amount": 100
  }
]
```

#### Insights
- ✅ Có dữ liệu đầy đủ để test
- ✅ Có cấu trúc chuẩn (id + created_at)

#### Relationships
- No relationships found

---

### 📊 Table: `tournaments`

**Records:** 2  
**Columns:** 56  
**Status:** 🟢 Has Data

#### Column Structure
- **id**: string (identifier)
- **name**: string 
- **description**: string 
- **tournament_type**: string 
- **game_format**: string 
- **tier_level**: number 
- **max_participants**: number 
- **current_participants**: number 
- **tournament_start**: string 
- **tournament_end**: string 
- **registration_start**: string 
- **registration_end**: string 
- **club_id**: string (identifier)
- **venue_address**: string 
- **entry_fee**: number 
- **prize_pool**: number 
- **first_prize**: number 
- **second_prize**: number 
- **third_prize**: number 
- **prize_distribution**: object 
- **status**: string 
- **management_status**: string 
- **rules**: unknown 
- **contact_info**: unknown 
- **banner_image**: unknown 
- **min_rank_requirement**: unknown 
- **max_rank_requirement**: unknown 
- **eligible_ranks**: object 
- **allow_all_ranks**: boolean 
- **requires_approval**: boolean 
- **is_public**: boolean 
- **has_third_place_match**: boolean 
- **created_by**: string 
- **created_at**: string (timestamp)
- **updated_at**: string (timestamp)
- **venue_name**: unknown 
- **start_date**: unknown 
- **end_date**: unknown 
- **registration_fee**: number 
- **is_visible**: boolean 
- **deleted_at**: unknown 
- **tier**: string 
- **elo_multiplier**: number 
- **live_stream_url**: unknown 
- **sponsor_info**: object 
- **spa_points_config**: object 
- **elo_points_config**: object 
- **comprehensive_rewards**: object 
- **special_rules**: object 
- **tournament_format_details**: object 
- **physical_prizes**: object 
- **winner_id**: unknown 
- **parent_tournament_id**: unknown 
- **tournament_format**: unknown 
- **group_number**: unknown 
- **group_assignment_method**: unknown 

#### Sample Data
```json
[
  {
    "id": "87b3025c-b668-4b37-876c-4eb186bc3564",
    "name": "TRIBUTE TO CHAMPIONSHIP ",
    "description": "SABO 9 BALL OPEN Season 1",
    "tournament_type": "double_elimination",
    "game_format": "9_ball",
    "tier_level": 1,
    "max_participants": 32,
    "current_participants": 0,
    "tournament_start": "2025-08-24T01:15:00+00:00",
    "tournament_end": "2025-08-24T12:30:00+00:00",
    "registration_start": "2025-08-22T09:46:29.732+00:00",
    "registration_end": "2025-08-24T00:00:00+00:00",
    "club_id": "8d883f90-0c54-4757-adba-25f1d5c02174",
    "venue_address": "601 A Nguyễn An Ninh",
    "entry_fee": 300000,
    "prize_pool": 10000000,
    "first_prize": 0,
    "second_prize": 0,
    "third_prize": 0,
    "prize_distribution": {},
    "status": "registration_open",
    "management_status": "draft",
    "rules": null,
    "contact_info": null,
    "banner_image": null,
    "min_rank_requirement": null,
    "max_rank_requirement": null,
    "eligible_ranks": [],
    "allow_all_ranks": true,
    "requires_approval": false,
    "is_public": true,
    "has_third_place_match": false,
    "created_by": "18f49e79-f402-46d1-90be-889006e9761c",
    "created_at": "2025-08-22T09:49:48.438668+00:00",
    "updated_at": "2025-08-22T09:52:34.836923+00:00",
    "venue_name": null,
    "start_date": null,
    "end_date": null,
    "registration_fee": 0,
    "is_visible": true,
    "deleted_at": null,
    "tier": "I",
    "elo_multiplier": 1,
    "live_stream_url": null,
    "sponsor_info": {},
    "spa_points_config": {},
    "elo_points_config": {},
    "comprehensive_rewards": {},
    "special_rules": {},
    "tournament_format_details": {},
    "physical_prizes": [],
    "winner_id": null,
    "parent_tournament_id": null,
    "tournament_format": null,
    "group_number": null,
    "group_assignment_method": null
  },
  {
    "id": "40c533ba-3a9b-4288-99e8-129488eeb8b8",
    "name": "TRIBUTE TO CHAMPIONSHIP  - Copy",
    "description": "SABO 9 BALL OPEN Season 1",
    "tournament_type": "double_elimination",
    "game_format": "9_ball",
    "tier_level": 1,
    "max_participants": 16,
    "current_participants": 0,
    "tournament_start": "2025-09-06T02:03:52.497+00:00",
    "tournament_end": "2025-09-07T02:03:52.497+00:00",
    "registration_start": "2025-08-30T02:03:52.497+00:00",
    "registration_end": "2025-08-30T14:04:17.374+00:00",
    "club_id": "8d883f90-0c54-4757-adba-25f1d5c02174",
    "venue_address": "601A NAN",
    "entry_fee": 300000,
    "prize_pool": 10000000,
    "first_prize": 0,
    "second_prize": 0,
    "third_prize": 0,
    "prize_distribution": {},
    "status": "registration_open",
    "management_status": "draft",
    "rules": null,
    "contact_info": null,
    "banner_image": null,
    "min_rank_requirement": null,
    "max_rank_requirement": null,
    "eligible_ranks": [],
    "allow_all_ranks": true,
    "requires_approval": false,
    "is_public": true,
    "has_third_place_match": false,
    "created_by": "18f49e79-f402-46d1-90be-889006e9761c",
    "created_at": "2025-08-30T02:04:17.850274+00:00",
    "updated_at": "2025-08-30T02:04:17.850274+00:00",
    "venue_name": null,
    "start_date": null,
    "end_date": null,
    "registration_fee": 0,
    "is_visible": true,
    "deleted_at": null,
    "tier": "I",
    "elo_multiplier": 1,
    "live_stream_url": null,
    "sponsor_info": {},
    "spa_points_config": {},
    "elo_points_config": {},
    "comprehensive_rewards": {},
    "special_rules": {},
    "tournament_format_details": {},
    "physical_prizes": [],
    "winner_id": null,
    "parent_tournament_id": null,
    "tournament_format": null,
    "group_number": null,
    "group_assignment_method": null
  }
]
```

#### Insights
- 🟡 Ít dữ liệu - có thể cần thêm demo data
- ✅ Có cấu trúc chuẩn (id + created_at)

#### Relationships
- No relationships found

---

### 📊 Table: `wallets`

**Records:** 186  
**Columns:** 9  
**Status:** 🟢 Has Data

#### Column Structure
- **id**: string (identifier)
- **user_id**: string (identifier)
- **points_balance**: number 
- **total_earned**: number 
- **total_spent**: number 
- **created_at**: string (timestamp)
- **updated_at**: string (timestamp)
- **balance**: number 
- **status**: string 

#### Sample Data
```json
[
  {
    "id": "c8a9f961-15f1-412c-8961-b53958e85d86",
    "user_id": "519cf7c9-e112-40b2-9e4d-0cd44783ec9e",
    "points_balance": 0,
    "total_earned": 0,
    "total_spent": 0,
    "created_at": "2025-07-22T00:38:30.132097+00:00",
    "updated_at": "2025-07-23T03:23:34.814432+00:00",
    "balance": 0,
    "status": "active"
  },
  {
    "id": "b1f275dd-f0bf-40d5-8720-e3d6b131f5dc",
    "user_id": "4bedc2fd-a85d-483d-80e5-c9541d6ecdc2",
    "points_balance": 0,
    "total_earned": 0,
    "total_spent": 0,
    "created_at": "2025-07-22T00:38:31.525942+00:00",
    "updated_at": "2025-07-23T03:23:34.814432+00:00",
    "balance": 0,
    "status": "active"
  }
]
```

#### Insights
- ✅ Có dữ liệu đầy đủ để test
- ✅ Có cấu trúc chuẩn (id + created_at)
- 🔗 Có liên kết với user system
- 💰 Wallet balance tracking enabled

#### Relationships
- No relationships found

---

### 📊 Table: `user_roles`

**Records:** 97  
**Columns:** 5  
**Status:** 🟢 Has Data

#### Column Structure
- **id**: string (identifier)
- **user_id**: string (identifier)
- **role**: string 
- **created_at**: string (timestamp)
- **created_by**: unknown 

#### Sample Data
```json
[
  {
    "id": "62669536-104d-4306-95e9-70bc823fc317",
    "user_id": "18f6e853-b072-47fb-9c9a-e5d42a5446a5",
    "role": "user",
    "created_at": "2025-08-22T03:07:16.42139+00:00",
    "created_by": null
  },
  {
    "id": "b47db11d-71c8-4103-a2b3-e17523402b82",
    "user_id": "f4bf9554-f2a7-4aee-8ba3-7c38b89771ca",
    "role": "user",
    "created_at": "2025-08-22T03:07:16.42139+00:00",
    "created_by": null
  }
]
```

#### Insights
- ✅ Có dữ liệu đầy đủ để test
- ✅ Có cấu trúc chuẩn (id + created_at)
- 🔗 Có liên kết với user system

#### Relationships
- No relationships found

---

### 📊 Table: `notifications`

**Records:** 692  
**Columns:** 23  
**Status:** 🟢 Has Data

#### Column Structure
- **id**: string (identifier)
- **user_id**: string (identifier)
- **title**: string 
- **message**: string 
- **type**: string 
- **is_read**: boolean 
- **action_url**: string (url)
- **created_at**: string (timestamp)
- **updated_at**: string (timestamp)
- **deleted_at**: unknown 
- **auto_popup**: boolean 
- **priority**: string 
- **metadata**: object 
- **club_id**: unknown 
- **category**: string 
- **challenge_id**: unknown 
- **tournament_id**: unknown 
- **match_id**: unknown 
- **icon**: string 
- **action_text**: unknown 
- **scheduled_for**: unknown 
- **expires_at**: unknown 
- **is_archived**: boolean 

#### Sample Data
```json
[
  {
    "id": "ecc6c1c1-c8e9-4061-b754-385666040101",
    "user_id": "18f49e79-f402-46d1-90be-889006e9761c",
    "title": "Yêu cầu xác thực hạng mới",
    "message": "Có yêu cầu xác thực hạng K+ từ Sang tại CLB SBO POOL ARENA",
    "type": "rank_request",
    "is_read": false,
    "action_url": "/club-dashboard?tab=rank-verification",
    "created_at": "2025-08-18T03:21:36.462148+00:00",
    "updated_at": "2025-08-18T03:21:36.462148+00:00",
    "deleted_at": null,
    "auto_popup": true,
    "priority": "high",
    "metadata": {},
    "club_id": null,
    "category": "general",
    "challenge_id": null,
    "tournament_id": null,
    "match_id": null,
    "icon": "bell",
    "action_text": null,
    "scheduled_for": null,
    "expires_at": null,
    "is_archived": false
  },
  {
    "id": "2304d28f-9d4e-4d76-91f2-70ac5086ffca",
    "user_id": "18f49e79-f402-46d1-90be-889006e9761c",
    "title": "Yêu cầu xác thực hạng mới",
    "message": "Có yêu cầu xác thực hạng H từ Võ Long Sang  tại CLB SBO POOL ARENA",
    "type": "rank_request",
    "is_read": false,
    "action_url": "/club-dashboard?tab=rank-verification",
    "created_at": "2025-08-21T04:07:54.87225+00:00",
    "updated_at": "2025-08-21T04:07:54.87225+00:00",
    "deleted_at": null,
    "auto_popup": true,
    "priority": "high",
    "metadata": {},
    "club_id": null,
    "category": "general",
    "challenge_id": null,
    "tournament_id": null,
    "match_id": null,
    "icon": "bell",
    "action_text": null,
    "scheduled_for": null,
    "expires_at": null,
    "is_archived": false
  }
]
```

#### Insights
- ✅ Có dữ liệu đầy đủ để test
- ✅ Có cấu trúc chuẩn (id + created_at)
- 🔗 Có liên kết với user system

#### Relationships
- `challenge_id` → `challenges` (foreign_key)
- `tournament_id` → `tournaments` (foreign_key)

---

### 📊 Table: `tournament_registrations`

**Records:** 284  
**Columns:** 11  
**Status:** 🟢 Has Data

#### Column Structure
- **id**: string (identifier)
- **tournament_id**: string (identifier)
- **user_id**: string (identifier)
- **registration_status**: string 
- **payment_status**: string 
- **registration_date**: string 
- **payment_date**: string 
- **notes**: string 
- **created_at**: string (timestamp)
- **updated_at**: string (timestamp)
- **player_id**: string (identifier)

#### Sample Data
```json
[
  {
    "id": "fce564e3-ac69-42cc-a312-8bf2f67da9e3",
    "tournament_id": "7aba5a78-5c2b-4884-937d-99274220b019",
    "user_id": "74f72a82-d447-4dfd-a5f8-36701963b5d1",
    "registration_status": "confirmed",
    "payment_status": "paid",
    "registration_date": "2025-08-23T02:02:29.093+00:00",
    "payment_date": "2025-08-23T02:02:29.093+00:00",
    "notes": "Added by admin via quick add",
    "created_at": "2025-08-23T02:02:30.202072+00:00",
    "updated_at": "2025-08-23T02:02:30.202072+00:00",
    "player_id": "74f72a82-d447-4dfd-a5f8-36701963b5d1"
  },
  {
    "id": "c3b740ed-be36-4e5a-99a1-91c4718c99c0",
    "tournament_id": "7aba5a78-5c2b-4884-937d-99274220b019",
    "user_id": "18f6e853-b072-47fb-9c9a-e5d42a5446a5",
    "registration_status": "confirmed",
    "payment_status": "paid",
    "registration_date": "2025-08-23T02:02:29.093+00:00",
    "payment_date": "2025-08-23T02:02:29.093+00:00",
    "notes": "Added by admin via quick add",
    "created_at": "2025-08-23T02:02:30.202072+00:00",
    "updated_at": "2025-08-23T02:02:30.202072+00:00",
    "player_id": "18f6e853-b072-47fb-9c9a-e5d42a5446a5"
  }
]
```

#### Insights
- ✅ Có dữ liệu đầy đủ để test
- ✅ Có cấu trúc chuẩn (id + created_at)
- 🔗 Có liên kết với user system

#### Relationships
- `tournament_id` → `tournaments` (foreign_key)

---

### 📊 Table: `club_members`

**Records:** 10  
**Columns:** 19  
**Status:** 🟢 Has Data

#### Column Structure
- **id**: string (identifier)
- **club_id**: string (identifier)
- **user_id**: string (identifier)
- **membership_type**: string 
- **membership_number**: string 
- **join_date**: string 
- **status**: string 
- **expiry_date**: unknown 
- **total_visits**: number 
- **last_visit**: unknown 
- **total_hours_played**: number 
- **preferred_table_types**: unknown 
- **preferred_time_slots**: unknown 
- **notification_preferences**: object 
- **membership_fee**: number 
- **outstanding_balance**: number 
- **created_at**: string (timestamp)
- **updated_at**: string (timestamp)
- **role**: string 

#### Sample Data
```json
[
  {
    "id": "858f87d5-055d-4ab9-af63-9ea13d43ca23",
    "club_id": "8d883f90-0c54-4757-adba-25f1d5c02174",
    "user_id": "74f72a82-d447-4dfd-a5f8-36701963b5d1",
    "membership_type": "regular",
    "membership_number": "CLBC021746868",
    "join_date": "2025-08-22T09:31:23.810402+00:00",
    "status": "active",
    "expiry_date": null,
    "total_visits": 0,
    "last_visit": null,
    "total_hours_played": 0,
    "preferred_table_types": null,
    "preferred_time_slots": null,
    "notification_preferences": {},
    "membership_fee": 0,
    "outstanding_balance": 0,
    "created_at": "2025-08-22T13:59:46.917509+00:00",
    "updated_at": "2025-08-22T13:59:46.917509+00:00",
    "role": "member"
  },
  {
    "id": "ece7d2fd-111f-4ee5-bada-d8034f98ed19",
    "club_id": "8d883f90-0c54-4757-adba-25f1d5c02174",
    "user_id": "bc5545c5-0bb9-488f-b2ba-16fa373e1f5e",
    "membership_type": "regular",
    "membership_number": "CLBC021746993",
    "join_date": "2025-08-22T12:23:31.99393+00:00",
    "status": "active",
    "expiry_date": null,
    "total_visits": 0,
    "last_visit": null,
    "total_hours_played": 0,
    "preferred_table_types": null,
    "preferred_time_slots": null,
    "notification_preferences": {},
    "membership_fee": 0,
    "outstanding_balance": 0,
    "created_at": "2025-08-22T13:59:47.02985+00:00",
    "updated_at": "2025-08-22T13:59:47.02985+00:00",
    "role": "member"
  }
]
```

#### Insights
- ✅ Có dữ liệu đầy đủ để test
- ✅ Có cấu trúc chuẩn (id + created_at)
- 🔗 Có liên kết với user system

#### Relationships
- No relationships found

---

### 📊 Table: `ranks`

**Records:** 12  
**Columns:** 10  
**Status:** 🟢 Has Data

#### Column Structure
- **id**: string (identifier)
- **code**: string 
- **rank_name**: string 
- **rank_order**: number 
- **elo_requirement**: number 
- **rank_color**: string 
- **description**: string 
- **created_at**: string (timestamp)
- **updated_at**: string (timestamp)
- **level**: number 

#### Sample Data
```json
[
  {
    "id": "8cd47209-05e6-42c7-b8b4-2e59b2cb64e1",
    "code": "K",
    "rank_name": "Hạng K",
    "rank_order": 1,
    "elo_requirement": 1000,
    "rank_color": "text-slate-600",
    "description": "Hạng thấp nhất",
    "created_at": "2025-07-21T08:42:52.480869+00:00",
    "updated_at": "2025-08-03T02:15:27.454384+00:00",
    "level": 1
  },
  {
    "id": "f82ebe2f-e317-4a92-9915-3377cc37fb8e",
    "code": "K+",
    "rank_name": "Hạng K+",
    "rank_order": 2,
    "elo_requirement": 1100,
    "rank_color": "text-slate-500",
    "description": "Hạng K cải tiến",
    "created_at": "2025-07-21T08:42:52.480869+00:00",
    "updated_at": "2025-08-03T02:15:27.454384+00:00",
    "level": 2
  }
]
```

#### Insights
- ✅ Có dữ liệu đầy đủ để test
- ✅ Có cấu trúc chuẩn (id + created_at)

#### Relationships
- No relationships found

---

## 🔗 Relationship Map

```
profiles: (no relationships)

challenges: (no relationships)

tournaments: (no relationships)

wallets: (no relationships)

user_roles: (no relationships)

notifications:
  └─ challenge_id → challenges
  └─ tournament_id → tournaments

tournament_registrations:
  └─ tournament_id → tournaments

club_members: (no relationships)

ranks: (no relationships)
```

## 🎯 Key Findings

### ✅ Well-Structured Tables
- profiles
- challenges
- tournaments
- wallets
- notifications
- tournament_registrations
- club_members
- ranks

### ⚠️ Tables Needing Attention


## 🔧 Next Actions

1. **Populate Empty Tables**: Add demo data to empty tables
2. **Validate Relationships**: Ensure foreign keys are properly linked
3. **Data Consistency**: Check for orphaned records
4. **Index Optimization**: Review indexes for performance

---

**Analysis completed at:** 8/31/2025, 4:41:25 AM
