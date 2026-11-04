// ============================================================
// Locket API Rewrite (setClientData, User Profiles, Gold Badge, AI Filters)
// Endpoint: https://api.locketcamera.com/
// Dùng cho: Shadowrocket / Loon / Quantumult X / Surge
// ============================================================

const TIMEZONE = 'America/New_York';

function applyGoldBadge(node) {
  if (!node || typeof node !== 'object') return;
  Object.assign(node, {
    badge: 'locket_gold',
    show_badge: true,
    badge_visible: true,
    display_badge: true,
    has_badge: true,
    profile_badge: 'locket_gold',
    profile_banner: true,
    show_profile_banner: true,
    has_profile_banner: true,
    // Ảnh bìa / banner trang cá nhân
    banner_url: 'https://cdn.upanhlaylink.com/i/wt33vPYm.jpg',
    cover_url: 'https://cdn.upanhlaylink.com/i/wt33vPYm.jpg',
    cover_image_url: 'https://cdn.upanhlaylink.com/i/wt33vPYm.jpg',
    profile_banner_url: 'https://cdn.upanhlaylink.com/i/wt33vPYm.jpg',
    header_url: 'https://cdn.upanhlaylink.com/i/wt33vPYm.jpg',
    header_image_url: 'https://cdn.upanhlaylink.com/i/wt33vPYm.jpg',
    is_gold: true,
    has_gold: true,
    gold: true,
    gold_subscription: true,
    has_gold_subscription: true,
    tier: 'gold',
    subscription_status: 'active',
    // Mở khóa đăng video không giới hạn độ dài từ cuộn camera & quay video
    can_upload_video: true,
    can_upload_longer_videos: true,
    longer_videos_enabled: true,
    longer_camera_roll_videos_enabled: true,
    camera_roll_video_enabled: true,
    camera_roll_video_upload_enabled: true,
    camera_roll_max_duration: 99999,
    video_max_duration: 99999,
    gold_max_duration: 99999,
    max_duration: 99999,
  });
}

if (typeof $response === 'undefined') {
  // ------------------------------------------------------------
  // XỬ LÝ REQUEST: Fake Region US & Luôn gửi huy hiệu Gold lên server
  // ------------------------------------------------------------
  const headers = Object.assign({}, $request.headers || {});
  for (const key of Object.keys(headers)) {
    if (['if-none-match', 'if-modified-since', 'x-revenuecat-etag'].includes(key.toLowerCase())) {
      delete headers[key];
    }
  }
  headers['X-App-Region'] = 'US';
  headers['X-Country-Code'] = 'US';
  headers['X-Device-Country'] = 'US';
  headers['X-Timezone'] = TIMEZONE;

  const output = { headers: headers };

  if (($request.method || '').toUpperCase() === 'POST' && $request.body) {
    try {
      const body = typeof $request.body === 'string' ? JSON.parse($request.body) : $request.body;
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        body.country_code = 'us';
        body.time_zone = TIMEZONE;

        // Giữ huy hiệu Locket Gold khi client gửi cập nhật thông tin
        if (body.data && typeof body.data === 'object') {
          body.data.badge = 'locket_gold';
          body.data.show_badge = true;
        }
        if ('badge' in body) {
          body.badge = 'locket_gold';
        }

        output.body = JSON.stringify(body);
      }
    } catch (e) {}
  }
  $done(output);
} else {
  // ------------------------------------------------------------
  // XỬ LÝ RESPONSE: Giữ vĩnh viễn Huy hiệu Locket Gold & Gỡ mờ AI
  // ------------------------------------------------------------
  let body = $response.body;
  let status = $response.status || $response.statusCode || 200;

  if (typeof body === 'string' && body) {
    try {
      let obj = JSON.parse(body);

      // Nếu API trả về lỗi quyền hạn (400, 401, 403 hoặc obj.error), ép về 200 Success
      if ([400, 401, 403].includes(Number(status)) || (obj && obj.error)) {
        status = 200;
        if (obj && obj.error) {
          obj = {
            result: {
              status: 200,
              is_gold: true,
              is_locked: false,
              requires_gold: false,
              unlocked: true,
              data: obj.error.details || {},
            },
          };
        }
      }

      // Xử lý riêng cho endpoint cập nhật thông tin cá nhân / đổi huy hiệu
      const url = $request.url || '';
      if (url.includes('changeProfileInfo') || url.includes('setClientData') || url.includes('updateUser')) {
        status = 200;
        if (!obj || typeof obj !== 'object') obj = {};
        if (!obj.result) obj.result = { status: 200, data: {} };
        if (!obj.result.data) obj.result.data = {};
        applyGoldBadge(obj.result.data);
      }

      const visited = new WeakSet();

      function transformNode(node) {
        if (!node || typeof node !== 'object' || visited.has(node)) return;
        visited.add(node);

        if (Array.isArray(node)) {
          node.forEach(transformNode);
          return;
        }

        // 1. TỰ ĐỘNG GẮN HUY HIỆU GOLD VÀO MỌI USER OBJECT (tránh bị mất khi thoát app)
        const isUserNode =
          'badge' in node ||
          'username' in node ||
          'uid' in node ||
          'user_id' in node ||
          'first_name' in node ||
          'last_name' in node ||
          'profile_picture' in node ||
          'profile_picture_url' in node;

        if (isUserNode) {
          applyGoldBadge(node);
        }

        // 2. MỞ KHÓA TÍNH NĂNG VÀ BỘ LỌC AI
        const triggerKeys = [
          'email',
          'phone_number',
          'push_token',
          'fcm_token',
          'can_use_filters',
          'can_use_stickers',
          'filter_id',
          'item_type',
          'sticker_id',
          'result_url',
          'blurred_image_url',
          'blurred_url',
        ];

        if (triggerKeys.some((k) => k in node)) {
          applyGoldBadge(node);
          Object.assign(node, {
            can_use_filters: true,
            can_use_gold_features: true,
            can_generate_filtered_image: true,
            can_create_filtered_image: true,
            has_ai_access: true,
            filter_access: true,
            can_use_stickers: true,
            sticker_access: true,
            unlimited_stickers: true,
          });
        }

        // 3. TẮT CÁC CỜ KHÓA / BẮT BUỘC TRẢ TIỀN
        const lockKeysToDisable = [
          'is_locked',
          'requires_gold',
          'locked',
          'needs_gold',
          'gold_only',
          'is_gold_only',
          'paywall',
          'show_paywall',
          'show_upsell',
          'upsell',
          'require_gold',
          'is_blurred',
          'blurred',
        ];
        for (const k of lockKeysToDisable) {
          if (k in node) node[k] = false;
        }

        // 4. BẬT CÁC CỜ CHO PHÉP XEM & SỬ DỤNG
        const unlockKeysToEnable = [
          'can_view',
          'unlocked',
          'is_unlocked',
          'is_free',
          'free',
          'allowed',
          'can_use_filters',
          'can_use_stickers',
          'sticker_access',
          'is_available',
          'enabled',
          'active',
          'longer_videos_enabled',
          'longer_camera_roll_videos_enabled',
          'camera_roll_video_enabled',
          'camera_roll_video_upload_enabled',
        ];
        for (const k of unlockKeysToEnable) {
          if (k in node) node[k] = true;
        }

        // Bỏ giới hạn độ dài video nếu API trả về
        const durKeys = ['video_max_duration', 'gold_max_duration', 'max_duration', 'camera_roll_max_duration', 'trim_max_duration'];
        for (const dk of durKeys) {
          if (dk in node && typeof node[dk] === 'number') {
            node[dk] = 99999;
          }
        }

        if ('item_type' in node || 'sticker_id' in node || 'filter_id' in node) {
          Object.assign(node, {
            is_locked: false,
            requires_gold: false,
            unlocked: true,
            is_free: true,
          });
        }

        // 5. GỠ MỜ ẢNH AI / HIỆU ỨNG NGÀY LỄ
        const unblurredUrl =
          node.unblurred_image_url ||
          node.unlocked_url ||
          node.result_url ||
          node.transformed_image_url ||
          node.url ||
          node.image_url;

        if (typeof unblurredUrl === 'string' && /^https?:\/\//.test(unblurredUrl)) {
          if ('blurred_url' in node) node.blurred_url = unblurredUrl;
          if ('blurred_image_url' in node) node.blurred_image_url = unblurredUrl;
        }

        for (const val of Object.values(node)) {
          transformNode(val);
        }
      }

      transformNode(obj);
      body = JSON.stringify(obj);
    } catch (e) {}
  }

  $done({
    status: status,
    headers: Object.assign({}, $response.headers || {}, {
      'content-type': 'application/json',
    }),
    body: body,
  });
}
