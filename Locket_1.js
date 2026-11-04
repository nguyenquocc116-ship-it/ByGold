// ============================================================
// RevenueCat Locket Gold VIP (Mở khóa toàn bộ Entitlement & Video)
// Dùng cho: Shadowrocket / Surge / Loon / Quantumult X
// ============================================================

var ua = $request.headers["User-Agent"] || $request.headers["user-agent"] || "";
var obj = {};

try {
  obj = JSON.parse($response.body || "{}");
} catch (e) {
  obj = {};
}

obj.Attention = "Locket Gold VIP Unlocked by Nguyen Quoc Cuong";
obj.subscriber = obj.subscriber || {};
obj.subscriber.subscriptions = obj.subscriber.subscriptions || {};
obj.subscriber.entitlements = obj.subscriber.entitlements || {};

var subscriptionInfo = {
  auto_resume_date: null,
  display_name: "locket_1600_1y",
  is_sandbox: true,
  ownership_type: "PURCHASED",
  billing_issues_detected_at: null,
  management_url: "https://apps.apple.com/account/subscriptions",
  period_type: "normal",
  price: {
    amount: 399000.0,
    currency: "VND",
  },
  expires_date: "9999-01-09T10:10:14Z",
  grace_period_expires_date: null,
  refunded_at: null,
  unsubscribe_detected_at: null,
  original_purchase_date: "2020-01-01T00:00:00Z",
  purchase_date: "2020-01-01T00:00:00Z",
  store: "app_store",
  store_transaction_id: "2000001108724193",
};

var entitlementInfo = {
  grace_period_expires_date: null,
  purchase_date: "2020-01-01T00:00:00Z",
  product_identifier: "locket_1600_1y",
  expires_date: "9999-01-09T10:10:14Z",
};

// Đăng ký toàn bộ mã sản phẩm phổ biến của Locket
obj.subscriber.subscriptions["locket_1600_1y"] = subscriptionInfo;
obj.subscriber.subscriptions["locket_3600_1y"] = subscriptionInfo;
obj.subscriber.subscriptions["locket_gold_yearly"] = subscriptionInfo;

// Gán toàn bộ Entitlement để Locket nhận diện 100% Gold cho mọi tính năng (Video, Filters, Badges)
var entitlementsToUnlock = ["Gold", "gold", "Pro", "pro", "locket_gold", "premium", "all_features"];
for (var i = 0; i < entitlementsToUnlock.length; i++) {
  obj.subscriber.entitlements[entitlementsToUnlock[i]] = entitlementInfo;
}

$done({
  body: JSON.stringify(obj),
});

