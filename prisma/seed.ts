// Dữ liệu mẫu tiếng Việt cho môi trường phát triển.
// Chạy: npm run db:seed. XÓA toàn bộ dữ liệu nội dung (trừ AdminUser) rồi nạp lại.
// Tên quán, địa chỉ là dữ liệu bịa; link affiliate trỏ về trang chủ của sàn.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, type Segment } from "../lib/generated/prisma/client";
import { slugify, toSearchText } from "../lib/slug";
import { discountPercent } from "../lib/format";

if (process.env.NODE_ENV === "production" && process.env.SEED_FORCE !== "1") {
  console.error("Từ chối chạy seed trên production (sẽ xóa dữ liệu). Đặt SEED_FORCE=1 nếu thật sự muốn.");
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const daysFromNow = (d: number) => new Date(now + d * DAY);

async function resetContent() {
  // Thứ tự xóa theo khóa ngoại; bảng nối nhiều-nhiều tự xóa theo.
  await db.click.deleteMany();
  await db.voucherClaim.deleteMany();
  await db.voucher.deleteMany();
  await db.place.deleteMany();
  await db.priceHistory.deleteMany();
  await db.post.deleteMany();
  await db.deal.deleteMany();
  await db.coupon.deleteMany();
  await db.category.updateMany({ data: { parentId: null } });
  await db.category.deleteMany();
  await db.platform.deleteMany();
  await db.saleEvent.deleteMany();
  await db.partnerLead.deleteMany();
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    console.log("Bỏ qua tạo admin: cần SEED_ADMIN_EMAIL và SEED_ADMIN_PASSWORD (>= 8 ký tự) trong .env");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role: "admin", name: "Quản trị" },
  });
  console.log(`Tài khoản admin: ${email}`);
}

async function seedPlatforms() {
  const list = [
    { name: "Shopee", website: "https://shopee.vn", network: "shopee" },
    { name: "Lazada", website: "https://www.lazada.vn", network: "accesstrade" },
    { name: "TikTok Shop", website: "https://www.tiktok.com/shop", network: "tiktok" },
    { name: "Tiki", website: "https://tiki.vn", network: "accesstrade" },
    { name: "Klook", website: "https://www.klook.com/vi", network: "klook" },
    { name: "Agoda", website: "https://www.agoda.com/vi-vn", network: "accesstrade" },
    { name: "ITSO", website: "https://itso.vn", network: "direct" },
  ];
  const map: Record<string, number> = {};
  for (const [i, p] of list.entries()) {
    const row = await db.platform.create({ data: { ...p, slug: slugify(p.name), sortOrder: i } });
    map[row.slug] = row.id;
  }
  return map;
}

async function seedCategories() {
  const tree: { name: string; segment: Segment; children: string[] }[] = [
    { name: "Đồ công nghệ", segment: "product", children: ["Ổ cứng & SSD", "Chuột & bàn phím", "Tai nghe & loa", "Phụ kiện điện thoại", "Thiết bị mạng"] },
    { name: "Phần mềm & bản quyền", segment: "digital", children: ["Microsoft Office", "Windows", "Diệt virus", "VPN & bảo mật"] },
    { name: "Du lịch", segment: "travel", children: ["Khách sạn", "Tour & vé tham quan", "Vé máy bay"] },
    { name: "Ăn uống & Spa", segment: "local", children: ["Buffet", "Quán ăn", "Cà phê", "Spa & massage"] },
    { name: "Thời trang & làm đẹp", segment: "product", children: [] },
    { name: "Nhà cửa & đời sống", segment: "product", children: [] },
  ];
  const map: Record<string, number> = {};
  let order = 0;
  for (const root of tree) {
    const parent = await db.category.create({
      data: { name: root.name, slug: slugify(root.name), segment: root.segment, sortOrder: order++ },
    });
    map[parent.slug] = parent.id;
    for (const [i, child] of root.children.entries()) {
      const row = await db.category.create({
        data: { name: child, slug: slugify(child), segment: root.segment, parentId: parent.id, sortOrder: i },
      });
      map[row.slug] = row.id;
    }
  }
  return map;
}

type DealSeed = {
  type: Segment;
  title: string;
  platform: string;
  category: string;
  price: number;
  oldPrice: number;
  summary: string;
  pros: string[];
  cons: string[];
  verdict: string;
  featured?: boolean;
  expiresInDays?: number;
  destination?: string;
};

const DEALS: DealSeed[] = [
  {
    type: "product", title: "SSD NVMe 512GB PCIe Gen4 tốc độ đọc 5000MB/s", platform: "shopee", category: "o-cung-ssd",
    price: 899000, oldPrice: 1290000, summary: "SSD Gen4 giá dưới 1 triệu, hợp nâng cấp laptop và PC văn phòng.",
    pros: ["Tốc độ đọc/ghi cao trong tầm giá", "Bảo hành 5 năm chính hãng", "Có tản nhiệt mỏng đi kèm"],
    cons: ["Laptop đời cũ chỉ hỗ trợ Gen3 sẽ không đạt tốc độ tối đa", "Nên kiểm tra khe M.2 2280 trước khi mua"],
    verdict: "Đáng mua để nâng cấp máy chạy HDD hoặc SSD SATA cũ.", featured: true, expiresInDays: 5,
  },
  {
    type: "product", title: "Chuột không dây Bluetooth 2 chế độ, pin sạc", platform: "lazada", category: "chuot-ban-phim",
    price: 189000, oldPrice: 350000, summary: "Chuột văn phòng kết nối được 2 máy, sạc USB-C.",
    pros: ["Chuyển nhanh giữa laptop và máy tính bảng", "Bấm êm, ít tiếng ồn"],
    cons: ["Không hợp chơi game cần độ nhạy cao"],
    verdict: "Lựa chọn tốt cho dân văn phòng hay di chuyển.", expiresInDays: 10,
  },
  {
    type: "product", title: "Tai nghe True Wireless chống ồn ANC, pin 30 giờ", platform: "tiktok-shop", category: "tai-nghe-loa",
    price: 590000, oldPrice: 990000, summary: "Tai nghe chống ồn chủ động trong tầm giá dưới 600 nghìn.",
    pros: ["Chống ồn ổn khi đi xe buýt, văn phòng", "Có ứng dụng chỉnh EQ"],
    cons: ["Micro đàm thoại ở nơi ồn chỉ ở mức khá", "Hàng livestream, nên xem kỹ shop bán"],
    verdict: "Đáng thử nếu cần chống ồn mà ngân sách hạn chế.", featured: true, expiresInDays: 3,
  },
  {
    type: "product", title: "Router WiFi 6 AX3000 băng tần kép", platform: "shopee", category: "thiet-bi-mang",
    price: 1150000, oldPrice: 1690000, summary: "Router WiFi 6 cho nhà 2–3 tầng, hỗ trợ Mesh.",
    pros: ["Phủ sóng tốt, nhiều thiết bị cùng lúc", "Hỗ trợ ghép Mesh khi cần mở rộng"],
    cons: ["Cần cấu hình lại nếu thay router nhà mạng"],
    verdict: "Nâng cấp đáng giá nếu nhà dùng nhiều thiết bị.", expiresInDays: 14,
  },
  {
    type: "product", title: "Sạc nhanh GaN 65W 3 cổng USB-C/USB-A", platform: "tiki", category: "phu-kien-dien-thoai",
    price: 399000, oldPrice: 650000, summary: "Một cục sạc cho laptop, điện thoại và tai nghe.",
    pros: ["Nhỏ gọn, sạc được laptop USB-C", "Có chứng nhận an toàn"],
    cons: ["Cắm cả 3 cổng thì công suất chia nhỏ"],
    verdict: "Rất tiện khi đi công tác, đỡ mang nhiều cục sạc.", expiresInDays: 7,
  },
  {
    type: "product", title: "Bàn phím cơ không dây 75% hot-swap", platform: "shopee", category: "chuot-ban-phim",
    price: 749000, oldPrice: 1090000, summary: "Bàn phím cơ layout gọn, thay switch không cần hàn.",
    pros: ["Kết nối 3 chế độ: dây, Bluetooth, 2.4GHz", "Gõ êm nhờ lớp tiêu âm"],
    cons: ["Keycap đi kèm chỉ ở mức cơ bản"],
    verdict: "Hợp người mới chơi phím cơ.", expiresInDays: 12,
  },
  {
    type: "digital", title: "Microsoft 365 Family 12 tháng – 6 người dùng, có hóa đơn", platform: "itso", category: "microsoft-office",
    price: 1290000, oldPrice: 1890000, summary: "Bản quyền chính hãng, ITSO xuất hóa đơn VAT cho doanh nghiệp.",
    pros: ["1TB OneDrive cho mỗi người", "Có hóa đơn VAT, hỗ trợ cài đặt"],
    cons: ["Cần tài khoản Microsoft cho từng người dùng"],
    verdict: "Tiết kiệm nhất khi chia cho gia đình hoặc nhóm nhỏ.", featured: true, expiresInDays: 30,
  },
  {
    type: "digital", title: "Windows 11 Pro bản quyền vĩnh viễn – key điện tử", platform: "itso", category: "windows",
    price: 990000, oldPrice: 4990000, summary: "Key kích hoạt online, kèm hướng dẫn và hỗ trợ từ ITSO.",
    pros: ["Kích hoạt vĩnh viễn, gắn với tài khoản Microsoft", "Có hóa đơn"],
    cons: ["Chỉ dùng cho 1 máy"],
    verdict: "Phù hợp khi build PC mới hoặc nâng cấp từ bản Home.", expiresInDays: 30,
  },
  {
    type: "digital", title: "Phần mềm diệt virus 1 năm cho 3 thiết bị", platform: "tiki", category: "diet-virus",
    price: 249000, oldPrice: 450000, summary: "Bảo vệ máy tính và điện thoại, có chống lừa đảo trực tuyến.",
    pros: ["Nhẹ máy", "Dùng được trên Windows, macOS, Android"],
    cons: ["Windows đã có Defender, chỉ cần nếu muốn thêm tính năng"],
    verdict: "Cân nhắc cho máy của người lớn tuổi hay bấm nhầm link lạ.", expiresInDays: 20,
  },
  {
    type: "travel", title: "Vé VinWonders Nha Trang – vào cửa trọn gói", platform: "klook", category: "tour-ve-tham-quan",
    price: 750000, oldPrice: 950000, summary: "Vé điện tử, quét mã vào cổng, đổi lịch linh hoạt.",
    pros: ["Rẻ hơn mua tại quầy", "Nhận vé ngay qua email"],
    cons: ["Không hoàn tiền sau khi đã chọn ngày"],
    verdict: "Nên mua trước nếu đi cuối tuần, đỡ xếp hàng.", destination: "Nha Trang", expiresInDays: 25,
  },
  {
    type: "travel", title: "Khách sạn 4 sao trung tâm Đà Lạt – giảm 35% đặt sớm", platform: "agoda", category: "khach-san",
    price: 820000, oldPrice: 1260000, summary: "Giá mỗi đêm cho phòng đôi, gồm bữa sáng.",
    pros: ["Gần chợ Đà Lạt, đi bộ ra hồ Xuân Hương", "Miễn phí hủy trước 3 ngày"],
    cons: ["Giá cuối tuần và lễ có thể cao hơn"],
    verdict: "Giá tốt cho vị trí trung tâm.", destination: "Đà Lạt", expiresInDays: 15,
  },
  {
    type: "travel", title: "Tour 4 đảo Phú Quốc bằng cano – trọn ngày", platform: "klook", category: "tour-ve-tham-quan",
    price: 590000, oldPrice: 850000, summary: "Gồm đưa đón khách sạn, ăn trưa, dụng cụ lặn ngắm san hô.",
    pros: ["Đầy đủ dịch vụ, không phát sinh", "Đánh giá cao trên Klook"],
    cons: ["Có thể hủy khi thời tiết xấu (được hoàn tiền)"],
    verdict: "Lựa chọn tiện nhất cho lần đầu đến Phú Quốc.", destination: "Phú Quốc", featured: true, expiresInDays: 40,
  },
];

async function seedDeals(platforms: Record<string, number>, categories: Record<string, number>) {
  const ids: number[] = [];
  for (const [i, d] of DEALS.entries()) {
    const deal = await db.deal.create({
      data: {
        type: d.type,
        title: d.title,
        slug: slugify(d.title),
        titleSearch: toSearchText(d.title),
        summary: d.summary,
        images: [],
        price: d.price,
        oldPrice: d.oldPrice,
        discountPercent: discountPercent(d.price, d.oldPrice),
        affiliateUrl: platformHome(d.platform),
        destination: d.destination ?? null,
        techPros: d.pros,
        techCons: d.cons,
        techVerdict: d.verdict,
        status: "published",
        featured: d.featured ?? false,
        expiresAt: d.expiresInDays ? daysFromNow(d.expiresInDays) : null,
        publishedAt: new Date(now - i * 3 * 60 * 60 * 1000),
        platformId: platforms[d.platform],
        categoryId: categories[d.category],
      },
    });
    ids.push(deal.id);

    // Lịch sử giá 30 ngày: dao động quanh giá cũ, ngày cuối bằng giá hiện tại.
    const history = Array.from({ length: 30 }, (_, k) => {
      const day = 29 - k;
      const wave = Math.round((Math.sin((k + i) / 3) * 0.08 + 0.92) * d.oldPrice / 1000) * 1000;
      return { dealId: deal.id, price: day === 0 ? d.price : wave, recordedAt: daysFromNow(-day) };
    });
    await db.priceHistory.createMany({ data: history });
  }
  return ids;
}

const HOMES: Record<string, string> = {
  shopee: "https://shopee.vn",
  lazada: "https://www.lazada.vn",
  "tiktok-shop": "https://www.tiktok.com/shop",
  tiki: "https://tiki.vn",
  klook: "https://www.klook.com/vi",
  agoda: "https://www.agoda.com/vi-vn",
  itso: "https://itso.vn",
};
const platformHome = (slug: string) => HOMES[slug];

async function seedCoupons(platforms: Record<string, number>, categories: Record<string, number>) {
  const list = [
    { platform: "shopee", code: "SPCUCRE50", title: "Giảm 50.000đ cho đơn từ 300.000đ", minOrder: 300000, maxDiscount: 50000, usedPercent: 62, days: 2, category: "do-cong-nghe", featured: true },
    { platform: "shopee", code: null, title: "Freeship Xtra – miễn phí vận chuyển đơn từ 0đ", minOrder: 0, maxDiscount: 30000, usedPercent: 35, days: 6, category: null },
    { platform: "lazada", code: "LZDTECH12", title: "Giảm 12% tối đa 120.000đ ngành điện tử", minOrder: 500000, maxDiscount: 120000, usedPercent: 48, days: 4, category: "do-cong-nghe", featured: true },
    { platform: "lazada", code: "LZDNEW30", title: "Giảm 30.000đ cho khách hàng mới", minOrder: 99000, maxDiscount: 30000, usedPercent: 20, days: 15, category: null },
    { platform: "tiktok-shop", code: "TTSALE25", title: "Giảm 25% tối đa 80.000đ khi xem livestream", minOrder: 200000, maxDiscount: 80000, usedPercent: 77, days: 1, category: "thoi-trang-lam-dep" },
    { platform: "tiki", code: "TIKIHOME40", title: "Giảm 40.000đ ngành nhà cửa đời sống", minOrder: 350000, maxDiscount: 40000, usedPercent: 15, days: 9, category: "nha-cua-doi-song" },
    { platform: "klook", code: "KLOOKVN8", title: "Giảm 8% vé tham quan và tour trong nước", minOrder: 500000, maxDiscount: 200000, usedPercent: 30, days: 20, category: "du-lich" },
    { platform: "agoda", code: null, title: "Giảm đến 25% khách sạn đặt qua ứng dụng", minOrder: null, maxDiscount: null, usedPercent: 0, days: 12, category: "khach-san" },
  ];
  const ids: number[] = [];
  for (const c of list) {
    const row = await db.coupon.create({
      data: {
        code: c.code,
        title: c.title,
        titleSearch: toSearchText(c.title),
        conditions: c.minOrder ? `Áp dụng cho đơn từ ${c.minOrder.toLocaleString("vi-VN")}đ. Số lượng có hạn.` : "Áp dụng theo điều kiện của sàn.",
        minOrder: c.minOrder,
        maxDiscount: c.maxDiscount,
        usedPercent: c.usedPercent,
        url: platformHome(c.platform),
        status: "published",
        featured: c.featured ?? false,
        startsAt: daysFromNow(-1),
        expiresAt: daysFromNow(c.days),
        platformId: platforms[c.platform],
        categoryId: c.category ? categories[c.category] : null,
      },
    });
    ids.push(row.id);
  }
  return ids;
}

async function seedPlaces() {
  const list = [
    {
      name: "Buffet Lẩu Nướng Khói Xanh", type: "buffet" as const, district: "Bình Tân", ward: "Bình Trị Đông",
      address: "123 Tên Lửa, Bình Trị Đông B", lat: 10.7496, lng: 106.6110, hours: "10:00 – 22:00", commission: 10,
      voucher: { title: "Buffet lẩu nướng 2 người", price: 398000, oldPrice: 538000, quantity: 100 },
    },
    {
      name: "Cà Phê Sân Thượng Mây", type: "cafe" as const, district: "Quận 3", ward: "Võ Thị Sáu",
      address: "45 Trần Quốc Thảo", lat: 10.7835, lng: 106.6869, hours: "07:00 – 23:00", commission: 8,
      voucher: { title: "Combo 2 nước + bánh ngọt", price: 89000, oldPrice: 125000, quantity: 200 },
    },
    {
      name: "Spa Thảo Mộc An Nhiên", type: "spa" as const, district: "Phú Nhuận", ward: "Phường 9",
      address: "78 Phan Xích Long", lat: 10.7997, lng: 106.6862, hours: "09:00 – 21:00", commission: 15,
      voucher: { title: "Gội đầu dưỡng sinh 60 phút", price: 149000, oldPrice: 250000, quantity: 80 },
    },
    {
      name: "Quán Bún Bò Huế Cô Ba", type: "restaurant" as const, district: "Tân Bình", ward: "Phường 13",
      address: "210 Cộng Hòa", lat: 10.8017, lng: 106.6439, hours: "06:00 – 14:00", commission: 7,
      voucher: { title: "Giảm 20% hóa đơn từ 150.000đ", price: 0, oldPrice: null, quantity: null },
    },
  ];
  for (const p of list) {
    await db.place.create({
      data: {
        name: p.name,
        slug: slugify(`${p.name} ${p.district}`),
        nameSearch: toSearchText(p.name),
        type: p.type,
        description: "Dữ liệu mẫu – thay bằng thông tin quán thật qua trang quản trị.",
        address: p.address,
        district: p.district,
        districtSlug: slugify(p.district),
        ward: p.ward,
        lat: p.lat,
        lng: p.lng,
        openingHours: p.hours,
        images: [],
        commissionPercent: p.commission,
        status: "published",
        vouchers: {
          create: {
            title: p.voucher.title,
            price: p.voucher.price,
            oldPrice: p.voucher.oldPrice,
            quantity: p.voucher.quantity,
            conditions: "Áp dụng tất cả các ngày trong tuần. Xuất trình mã khi thanh toán. Không áp dụng cùng ưu đãi khác.",
            status: "published",
            startsAt: daysFromNow(-1),
            expiresAt: daysFromNow(30),
          },
        },
      },
    });
  }
}

async function seedContent(dealIds: number[], couponIds: number[]) {
  // Mã dùng kèm: SSD + chuột + bàn phím với mã Shopee/Lazada ngành công nghệ
  await db.deal.update({ where: { id: dealIds[0] }, data: { coupons: { connect: [{ id: couponIds[0] }, { id: couponIds[1] }] } } });
  await db.deal.update({ where: { id: dealIds[1] }, data: { coupons: { connect: [{ id: couponIds[2] }] } } });
  await db.deal.update({ where: { id: dealIds[5] }, data: { coupons: { connect: [{ id: couponIds[0] }] } } });

  const title = "Nên mua SSD nào để nâng cấp laptop văn phòng năm 2026?";
  await db.post.create({
    data: {
      title,
      slug: slugify(title),
      titleSearch: toSearchText(title),
      category: "Nên mua gì",
      excerpt: "Cách kiểm tra laptop hỗ trợ chuẩn SSD nào và 3 mẫu đáng tiền dưới 1,5 triệu.",
      content: [
        "Nâng cấp SSD là cách rẻ nhất để laptop văn phòng chạy nhanh hơn rõ rệt. Bài này giúp bạn chọn đúng loại trong 5 phút.",
        "",
        "## Kiểm tra laptop trước khi mua",
        "Mở nắp đáy hoặc tra mã máy để biết khe **M.2** hỗ trợ NVMe Gen3 hay Gen4, và độ dài thanh (thường là 2280).",
        "",
        "- Máy đời 2019 trở về trước: thường chỉ Gen3",
        "- Máy có ổ HDD 2.5 inch: có thể dùng SSD SATA",
        "",
        "## Gen3 hay Gen4?",
        "Với nhu cầu văn phòng, khác biệt thực tế không lớn. Ưu tiên **bảo hành** và độ bền (TBW).",
        "",
        "### Khi nào nên chọn Gen4?",
        "Khi máy hỗ trợ và chênh lệch giá dưới 15%.",
        "",
        "## Gợi ý của kỹ thuật viên",
        "Mẫu đang giảm giá tốt, kỹ thuật viên đã kiểm tra:",
        "",
        `{{deal:${slugify("SSD NVMe 512GB PCIe Gen4 tốc độ đọc 5000MB/s")}}}`,
        "",
        "> Mẹo: dùng kèm mã giảm giá ngành điện tử để được giá tốt hơn.",
      ].join("\n"),
      status: "published",
      publishedAt: daysFromNow(-2),
      relatedDeals: { connect: [{ id: dealIds[1] }, { id: dealIds[5] }] },
    },
  });

  const year = new Date().getFullYear();
  await db.saleEvent.createMany({
    data: [
      { name: "Sale 12.12", slug: `sale-12-12-${year}`, startsAt: new Date(`${year}-12-12T00:00:00+07:00`), endsAt: new Date(`${year}-12-12T23:59:59+07:00`), description: "Siêu sale cuối năm trên Shopee, Lazada, TikTok Shop." },
      { name: "Sale lương cuối tháng", slug: `sale-luong-12-${year}`, startsAt: new Date(`${year}-12-25T00:00:00+07:00`), endsAt: new Date(`${year}-12-27T23:59:59+07:00`), description: "Mã giảm giá thêm từ ngày 25 đến 27." },
    ],
  });
}

async function main() {
  await resetContent();
  await seedAdmin();
  const platforms = await seedPlatforms();
  const categories = await seedCategories();
  const dealIds = await seedDeals(platforms, categories);
  const couponIds = await seedCoupons(platforms, categories);
  await seedPlaces();
  await seedContent(dealIds, couponIds);
  console.log(`Đã nạp: ${Object.keys(platforms).length} sàn, ${Object.keys(categories).length} danh mục, ${dealIds.length} deal, ${couponIds.length} coupon, 4 quán.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
