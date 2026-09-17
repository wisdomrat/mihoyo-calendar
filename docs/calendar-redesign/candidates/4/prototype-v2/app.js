const characters = [
  {
    id: "amber-genshin",
    name: "安柏",
    nameEn: "Amber",
    game: "genshin",
    birthday: "08-10",
    releaseDate: "2020-09-15",
    avatar: "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Ambor.webp",
    portrait: "https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_Ambor.webp",
    rarity: 4,
    element: "火",
    weapon: "弓",
    region: "蒙德",
  },
  {
    id: "ningguang-genshin",
    name: "凝光",
    nameEn: "Ningguang",
    game: "genshin",
    birthday: "08-26",
    releaseDate: "2020-09-15",
    avatar: "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Ningguang.webp",
    portrait: "https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_Ningguang.webp",
    rarity: 4,
    element: "岩",
    weapon: "法器",
    region: "璃月",
  },
  {
    id: "mualani-genshin",
    name: "玛拉妮",
    nameEn: "Mualani",
    game: "genshin",
    birthday: "08-03",
    releaseDate: "2024-08-27",
    avatar: "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Mualani.webp",
    portrait: "https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_Mualani.webp",
    rarity: 5,
    element: "水",
    weapon: "法器",
    region: "纳塔",
  },
  {
    id: "mavuika-genshin",
    name: "玛薇卡",
    nameEn: "Mavuika",
    game: "genshin",
    birthday: "08-28",
    releaseDate: "2024-12-31",
    avatar: "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Mavuika.webp",
    portrait: "https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_Mavuika.webp",
    rarity: 5,
    element: "火",
    weapon: "双手剑",
    region: "纳塔",
  },
  {
    id: "faruzan-genshin",
    name: "珐露珊",
    nameEn: "Faruzan",
    game: "genshin",
    birthday: "08-20",
    releaseDate: "2022-12-06",
    avatar: "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Faruzan.webp",
    portrait: "https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_Faruzan.webp",
    rarity: 4,
    element: "风",
    weapon: "弓",
    region: "须弥",
  },
  {
    id: "arlecchino-genshin",
    name: "阿蕾奇诺",
    nameEn: "Arlecchino",
    game: "genshin",
    birthday: "08-22",
    releaseDate: "2024-04-23",
    avatar: "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Arlecchino.webp",
    portrait: "https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_Arlecchino.webp",
    rarity: 5,
    element: "火",
    weapon: "长柄武器",
    region: "枫丹",
  },
  {
    id: "emilie-genshin",
    name: "艾梅莉埃",
    nameEn: "Emilie",
    game: "genshin",
    birthday: "09-22",
    releaseDate: "2024-08-06",
    avatar: "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Emilie.webp",
    portrait: "https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_Emilie.webp",
    rarity: 5,
    element: "草",
    weapon: "长柄武器",
    region: "枫丹",
  },
  {
    id: "lyney-genshin",
    name: "林尼",
    nameEn: "Lyney",
    game: "genshin",
    birthday: "02-02",
    releaseDate: "2023-08-15",
    avatar: "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Liney.webp",
    portrait: "https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_Liney.webp",
    rarity: 5,
    element: "火",
    weapon: "弓",
    region: "枫丹",
  },
  {
    id: "lynette-genshin",
    name: "琳妮特",
    nameEn: "Lynette",
    game: "genshin",
    birthday: "02-02",
    releaseDate: "2023-08-15",
    avatar: "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Linette.webp",
    portrait: "https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_Linette.webp",
    rarity: 4,
    element: "风",
    weapon: "单手剑",
    region: "枫丹",
  },
  {
    id: "kachina-genshin",
    name: "卡齐娜",
    nameEn: "Kachina",
    game: "genshin",
    birthday: "04-22",
    releaseDate: "2024-08-27",
    avatar: "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Kachina.webp",
    portrait: "https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_Kachina.webp",
    rarity: 4,
    element: "岩",
    weapon: "长柄武器",
    region: "纳塔",
  },
  {
    id: "collei-genshin",
    name: "柯莱",
    nameEn: "Collei",
    game: "genshin",
    birthday: "05-08",
    releaseDate: "2022-08-24",
    avatar: "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Collei.webp",
    portrait: "https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_Collei.webp",
    rarity: 4,
    element: "草",
    weapon: "弓",
    region: "须弥",
  },
  {
    id: "bronya-hsr",
    name: "布洛妮娅",
    nameEn: "Bronya",
    game: "hsr",
    birthday: "08-18",
    releaseDate: "2023-04-26",
    avatar: "https://static.nanoka.cc/assets/hsr/avatarshopicon/1101.webp",
    portrait: "https://static.nanoka.cc/assets/hsr/avatardrawcard/1101.webp",
    rarity: 5,
    element: "风",
    weapon: "同谐",
    region: "",
  },
  {
    id: "jiaoqiu-hsr",
    name: "椒丘",
    nameEn: "Jiaoqiu",
    game: "hsr",
    birthday: "08-08",
    releaseDate: "2024-08-21",
    avatar: "https://static.nanoka.cc/assets/hsr/avatarshopicon/1218.webp",
    portrait: "https://static.nanoka.cc/assets/hsr/avatardrawcard/1218.webp",
    rarity: 5,
    element: "火",
    weapon: "虚无",
    region: "",
  },
  {
    id: "qingque-hsr",
    name: "青雀",
    nameEn: "Qingque",
    game: "hsr",
    birthday: "08-06",
    releaseDate: "2023-04-26",
    avatar: "https://static.nanoka.cc/assets/hsr/avatarshopicon/1201.webp",
    portrait: "https://static.nanoka.cc/assets/hsr/avatardrawcard/1201.webp",
    rarity: 4,
    element: "量子",
    weapon: "智识",
    region: "",
  },
  {
    id: "dan-heng--imbibitor-lunae-hsr",
    name: "丹恒·饮月",
    nameEn: "Dan Heng • Imbibitor Lunae",
    game: "hsr",
    birthday: "12-25",
    releaseDate: "2023-08-30",
    avatar: "https://static.nanoka.cc/assets/hsr/avatarshopicon/1213.webp",
    portrait: "https://static.nanoka.cc/assets/hsr/avatardrawcard/1213.webp",
    rarity: 5,
    element: "虚数",
    weapon: "毁灭",
    region: "",
  },
  {
    id: "bronya-zaychik-honkai3",
    name: "布洛妮娅·扎伊切克",
    nameEn: "Bronya Zaychik",
    game: "honkai3",
    birthday: "08-18",
    releaseDate: "",
    avatar: "https://ui-avatars.com/api/?name=%E5%B8%83%E6%B4%9B%E5%A6%AE%E5%A8%85%C2%B7%E6%89%8E%E4%BC%8A%E5%88%87%E5%85%8B&background=ff8cc8&color=fff&size=128&font-size=0.5&bold=true",
    portrait: "",
    rarity: 5,
    element: "冰",
    weapon: "重炮",
    region: "",
  },
  {
    id: "silverwing-n-ex-honkai3",
    name: "次生银翼",
    nameEn: "Silverwing N-EX",
    game: "honkai3",
    birthday: "08-18",
    releaseDate: "",
    avatar: "https://patchwiki.biligame.com/images/bh3/5/50/h0jtc550b2gl3wubk0pfbsbmtj05zke.png",
    portrait: "https://patchwiki.biligame.com/images/bh3/d/de/qichk68mn45utk5e0q39ogowt9flw5i.png",
    rarity: 5,
    element: "冰",
    weapon: "重炮",
    region: "",
  },
  {
    id: "herrscher-of-reason-honkai3",
    name: "理之律者",
    nameEn: "Herrscher of Reason",
    game: "honkai3",
    birthday: "08-18",
    releaseDate: "",
    avatar: "https://patchwiki.biligame.com/images/bh3/0/02/dvnqcmerbgyafnwip4qyr91l2pro2jp.png",
    portrait: "https://patchwiki.biligame.com/images/bh3/5/51/8pmk6cu7sefg0o1qxgmv6dsrg4rfhok.png",
    rarity: 5,
    element: "冰",
    weapon: "重炮",
    region: "",
  },
  {
    id: "herrscher-of-truth-honkai3",
    name: "真理之律者",
    nameEn: "Herrscher of Truth",
    game: "honkai3",
    birthday: "08-18",
    releaseDate: "",
    avatar: "https://patchwiki.biligame.com/images/bh3/9/98/qr1vl9d7i5tab0fuhi6dazocpy008n5.png",
    portrait: "https://patchwiki.biligame.com/images/bh3/e/e9/hkjmoo928j7cko3den8xlk88yvzjrgw.png",
    rarity: 5,
    element: "冰",
    weapon: "重炮",
    region: "",
  },
  {
    id: "ellen-zzz",
    name: "艾莲",
    nameEn: "Ellen",
    game: "zzz",
    birthday: "01-17",
    releaseDate: "2024-07-04",
    avatar: "https://static.nanoka.cc/assets/zzz/IconRoleCircle21.webp",
    portrait: "https://static.nanoka.cc/assets/zzz/IconRole21.webp",
    rarity: 5,
    element: "冰",
    weapon: "强攻",
    region: "维多利亚家政",
  },
  {
    id: "soldier-11-zzz",
    name: "11号",
    nameEn: "Soldier 11",
    game: "zzz",
    birthday: "08-15",
    releaseDate: "2024-07-04",
    avatar: "https://static.nanoka.cc/assets/zzz/IconRoleCircle05.webp",
    portrait: "https://static.nanoka.cc/assets/zzz/IconRole05.webp",
    rarity: 5,
    element: "火",
    weapon: "强攻",
    region: "防卫军·奥波勒斯小队",
  },
  {
    id: "lucy-zzz",
    name: "露西",
    nameEn: "Lucy",
    game: "zzz",
    birthday: "08-06",
    releaseDate: "2024-07-04",
    avatar: "https://static.nanoka.cc/assets/zzz/IconRoleCircle27.webp",
    portrait: "https://static.nanoka.cc/assets/zzz/IconRole27.webp",
    rarity: 4,
    element: "火",
    weapon: "支援",
    region: "卡吕冬之子",
  },
  {
    id: "piper-zzz",
    name: "派派",
    nameEn: "Piper",
    game: "zzz",
    birthday: "08-17",
    releaseDate: "2024-07-04",
    avatar: "https://static.nanoka.cc/assets/zzz/IconRoleCircle28.webp",
    portrait: "https://static.nanoka.cc/assets/zzz/IconRole28.webp",
    rarity: 4,
    element: "物理",
    weapon: "异常",
    region: "卡吕冬之子",
  },
  {
    id: "pan-yinhu-zzz",
    name: "潘引壶",
    nameEn: "Pan Yinhu",
    game: "zzz",
    birthday: "08-13",
    releaseDate: "2025-06-06",
    avatar: "https://static.nanoka.cc/assets/zzz/IconRoleCircle45.webp",
    portrait: "https://static.nanoka.cc/assets/zzz/IconRole45.webp",
    rarity: 4,
    element: "物理",
    weapon: "防护",
    region: "云岿山",
  },
  {
    id: "evelyn-zzz",
    name: "伊芙琳",
    nameEn: "Evelyn",
    game: "zzz",
    birthday: "08-24",
    releaseDate: "2025-02-12",
    avatar: "https://static.nanoka.cc/assets/zzz/IconRoleCircle37.webp",
    portrait: "https://static.nanoka.cc/assets/zzz/IconRole37.webp",
    rarity: 5,
    element: "火",
    weapon: "强攻",
    region: "天琴座",
  },
  {
    id: "alice-zzz",
    name: "爱丽丝",
    nameEn: "Alice Thymefield",
    game: "zzz",
    birthday: "08-30",
    releaseDate: "2025-08-06",
    avatar: "https://static.nanoka.cc/assets/zzz/IconRoleCircle46.webp",
    portrait: "https://static.nanoka.cc/assets/zzz/IconRole46.webp",
    rarity: 4,
    element: "物理",
    weapon: "异常",
    region: "怪啖屋",
  },
  {
    id: "qingyi-zzz",
    name: "青衣",
    nameEn: "Qingyi",
    game: "zzz",
    birthday: "03-21",
    releaseDate: "2024-08-14",
    avatar: "https://static.nanoka.cc/assets/zzz/IconRoleCircle29.webp",
    portrait: "https://static.nanoka.cc/assets/zzz/IconRole29.webp",
    rarity: 5,
    element: "电",
    weapon: "击破",
    region: "治安局·刑侦特勤组",
  },
];

const gameMeta = {
  genshin: { name: "原神", color: "#248977", short: "原神" },
  hsr: { name: "崩坏：星穹铁道", color: "#4d65c8", short: "星铁" },
  zzz: { name: "绝区零", color: "#d68a18", short: "绝区零" },
  honkai3: { name: "崩坏3", color: "#d55788", short: "崩坏3" },
};

const contexts = {
  neutral: {
    theme: "neutral",
    title: "八月，翻到有名字的日子",
    subtitle: "生日与首次实装纪念，落在同一张时间长卷上。",
    characterId: null,
    affiliation: "四个世界",
    affiliationEn: "ALL WORLDS",
    tagline: "角色日期索引",
    mark: "NEUTRAL INDEX",
    code: "AUG / 08",
    profile: "neutral",
  },
  mondstadt: {
    theme: "mondstadt",
    title: "安柏",
    subtitle: "原神 · 火 · 弓",
    characterId: "amber-genshin",
    affiliation: "蒙德",
    affiliationEn: "MONDSTADT",
    tagline: "自由与风之都",
    mark: "WIND CHAPTER",
    code: "GI / MD",
    profile: "genshin",
  },
  liyue: {
    theme: "liyue",
    title: "凝光",
    subtitle: "原神 · 岩 · 法器",
    characterId: "ningguang-genshin",
    affiliation: "璃月",
    affiliationEn: "LIYUE",
    tagline: "岩与契约之港",
    mark: "CONTRACT LEDGER",
    code: "GI / LY",
    profile: "genshin",
  },
  sumeru: {
    theme: "sumeru",
    title: "珐露珊",
    subtitle: "原神 · 风 · 弓",
    characterId: "faruzan-genshin",
    affiliation: "须弥",
    affiliationEn: "SUMERU",
    tagline: "智慧与雨林",
    mark: "KNOWLEDGE CHAPTER",
    code: "GI / SU",
    profile: "genshin-sumeru",
  },
  victoria: {
    theme: "victoria",
    title: "ELLEN / 艾莲",
    subtitle: "绝区零 · 冰 · 强攻",
    characterId: "ellen-zzz",
    affiliation: "维多利亚家政",
    affiliationEn: "VICTORIA HOUSEKEEPING CO.",
    tagline: "奢华管家服务",
    mark: "SERVICE DOCKET",
    code: "ZZZ / 03",
    profile: "zzz",
  },
  hsr: {
    theme: "hsr",
    title: "布洛妮娅",
    subtitle: "崩坏：星穹铁道 · 风 · 同谐",
    characterId: "bronya-hsr",
    affiliation: "星穹铁道",
    affiliationEn: "STAR RAIL",
    tagline: "开拓群星之海",
    mark: "GAME-LEVEL ROUTE",
    code: "HSR / ALL",
    profile: "hsr",
  },
};

const themeProfiles = {
  neutral: {
    baseStart: "#080b17", baseMid: "#15162b", baseEnd: "#24203c",
    haloPrimary: "#6b5bc6", haloSecondary: "#6dc2a9", stageDeep: "#080b17",
    stageBorder: "#8190dc", surface: "#111426", surfaceBorder: "#a6afd1",
    accent: "#d8c7ff", eventBirthday: "#ff897d", eventRelease: "#6dc2a9",
    contextStrength: "0.56", heroStrength: "0.86",
  },
  genshin: {
    baseStart: "#08151b", baseMid: "#112d35", baseEnd: "#19213c",
    haloPrimary: "#53b9bd", haloSecondary: "#83d7bc", stageDeep: "#07151a",
    stageBorder: "#6ed0bb", surface: "#102029", surfaceBorder: "#78c9bc",
    accent: "#8de0c8", eventBirthday: "#ff8b7f", eventRelease: "#7bd7c4",
    contextStrength: "0.5", heroStrength: "0.82",
  },
  "genshin-sumeru": {
    baseStart: "#071614", baseMid: "#0d302c", baseEnd: "#28203d",
    haloPrimary: "#55d4bd", haloSecondary: "#a3e8c5", stageDeep: "#071613",
    stageBorder: "#79e0bf", surface: "#102b2c", surfaceBorder: "#83d8c0",
    accent: "#a7edd0", eventBirthday: "#ff957f", eventRelease: "#78dfc1",
    contextStrength: "0.68", heroStrength: "0.9",
  },
  hsr: {
    baseStart: "#090d21", baseMid: "#151b3a", baseEnd: "#33224e",
    haloPrimary: "#667eea", haloSecondary: "#9bb7ff", stageDeep: "#090d20",
    stageBorder: "#9bb7ff", surface: "#121936", surfaceBorder: "#788bd8",
    accent: "#c4d3ff", eventBirthday: "#ff8b9a", eventRelease: "#91b7ff",
    contextStrength: "0.55", heroStrength: "0.88",
  },
  zzz: {
    baseStart: "#120b1d", baseMid: "#211530", baseEnd: "#401d3f",
    haloPrimary: "#bd74e8", haloSecondary: "#f4d03f", stageDeep: "#120b1b",
    stageBorder: "#f4d03f", surface: "#191127", surfaceBorder: "#c58ce8",
    accent: "#ffe97d", eventBirthday: "#ff7b8f", eventRelease: "#eab4ff",
    contextStrength: "0.62", heroStrength: "0.92",
  },
  honkai3: {
    baseStart: "#1a0b1b", baseMid: "#31172c", baseEnd: "#47203f",
    haloPrimary: "#e87bb0", haloSecondary: "#f4b8d4", stageDeep: "#190a19",
    stageBorder: "#f4b8d4", surface: "#271326", surfaceBorder: "#d789af",
    accent: "#ffd6e7", eventBirthday: "#ff9a8d", eventRelease: "#f5c1da",
    contextStrength: "0.58", heroStrength: "0.88",
  },
};

const facetsByGame = {
  genshin: [
    ["地区", "蒙德", "璃月", "须弥", "纳塔"],
    ["元素", "风", "岩", "雷", "草", "水", "火", "冰"],
    ["稀有度", "5 星", "4 星"],
  ],
  hsr: [
    ["属性", "物理", "火", "冰", "雷", "风", "量子", "虚数"],
    ["命途", "毁灭", "巡猎", "智识", "同谐", "虚无", "存护", "丰饶"],
    ["稀有度", "5 星", "4 星"],
  ],
  zzz: [
    ["属性", "物理", "火", "冰", "电", "以太"],
    ["特性", "强攻", "击破", "异常", "支援", "防护"],
    ["阵营", "维多利亚家政", "卡吕冬之子", "对空六课"],
  ],
  honkai3: [
    ["属性", "物理", "火", "冰", "雷"],
    ["类型", "生物", "异能", "机械", "量子"],
    ["组织", "天命", "逆熵", "世界蛇"],
  ],
};

const state = {
  year: 2026,
  month: 7,
  view: "month",
  density: "card",
  dateMode: "birthday",
  selectedGames: new Set(Object.keys(gameMeta)),
  facets: { genshin: null, hsr: null, zzz: null, honkai3: null },
  selectedCharacter: null,
  currentContext: "neutral",
  weekStart: 0,
  activeWeekStart: new Date(2026, 7, 16),
  searchIndex: 0,
  forceMissingImage: false,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const demoToday = new Date(2026, 7, 17);
const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const monthNamesZh = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const weekdays = ["周日 SUN", "周一 MON", "周二 TUE", "周三 WED", "周四 THU", "周五 FRI", "周六 SAT"];
const densityOrder = ["card", "avatar", "compact"];
const densityNames = { card: "卡片", avatar: "头像", compact: "紧凑" };

function pad(value) {
  return String(value).padStart(2, "0");
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateKey(date) {
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function eventKey(character) {
  if (character.game === "hsr") return character.releaseDate.slice(5);
  if (state.dateMode === "release" && character.releaseDate) return character.releaseDate.slice(5);
  return character.birthday;
}

function passesFilters(character) {
  if (!state.selectedGames.has(character.game)) return false;
  const facet = state.facets[character.game];
  if (!facet) return true;
  if (facet.endsWith(" 星")) return character.rarity === Number(facet[0]);
  return character.region === facet || character.element === facet || character.weapon === facet;
}

function eventsForDate(date) {
  const key = dateKey(date);
  return characters.filter((character) => passesFilters(character) && eventKey(character) === key);
}

function createTicket(character) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "event-ticket";
  button.style.setProperty("--game-color", gameMeta[character.game].color);
  button.setAttribute("aria-label", `${character.name}，${gameMeta[character.game].name}`);
  button.innerHTML = `
    <img src="${character.avatar}" alt="" />
    <span class="ticket-fallback">${character.name.slice(0, 1)}</span>
    <span class="ticket-copy"><strong>${character.name}</strong><small>${gameMeta[character.game].short} · ${character.element || "属性未知"}</small></span>
  `;
  const image = button.querySelector("img");
  image.addEventListener("error", () => image.classList.add("broken"));
  button.addEventListener("click", () => selectCharacter(character));
  return button;
}

function renderWeekdays() {
  const ordered = [...weekdays.slice(state.weekStart), ...weekdays.slice(0, state.weekStart)];
  $("#weekdayRow").innerHTML = ordered.map((day) => `<span role="columnheader">${day}</span>`).join("");
}

function renderMonth() {
  const grid = $("#calendarGrid");
  grid.innerHTML = "";
  const first = new Date(state.year, state.month, 1);
  const offset = (first.getDay() - state.weekStart + 7) % 7;
  const start = new Date(state.year, state.month, 1 - offset);
  let visibleEvents = 0;

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const events = eventsForDate(date);
    if (date.getMonth() === state.month) visibleEvents += events.length;
    const cell = document.createElement("div");
    cell.className = "day-cell";
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", `${date.getMonth() + 1} 月 ${date.getDate()} 日，${events.length} 个角色事件`);
    if (date.getMonth() !== state.month) cell.classList.add("outside");
    if (sameDay(date, demoToday)) cell.classList.add("today");
    if (events.length) cell.classList.add("has-events");
    if (events.length) {
      cell.tabIndex = 0;
      cell.addEventListener("click", (event) => {
        if (event.target === cell || event.target.classList.contains("day-number")) openDayThread(date, events);
      });
      cell.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDayThread(date, events);
        }
      });
    }
    if (state.selectedCharacter && events.some((event) => event.id === state.selectedCharacter.id)) cell.classList.add("selected-day");
    cell.innerHTML = `<span class="day-number">${pad(date.getDate())}</span><div class="event-stack"></div>`;
    const stack = cell.querySelector(".event-stack");
    const maxVisible = state.density === "compact" ? 4 : state.density === "avatar" ? 5 : 2;
    events.slice(0, maxVisible).forEach((character) => stack.append(createTicket(character)));
    if (events.length > maxVisible) {
      const overflow = document.createElement("button");
      overflow.type = "button";
      overflow.className = "overflow-button";
      overflow.textContent = `+${events.length - maxVisible} 查看当天全部`;
      overflow.addEventListener("click", () => openDayThread(date, events));
      stack.append(overflow);
    }
    grid.append(cell);
  }

  $("#visibleCount").textContent = visibleEvents;
  $("#emptyState").hidden = state.selectedGames.size > 0;
}

function startOfDisplayedWeek() {
  const candidate = new Date(state.activeWeekStart);
  const delta = (candidate.getDay() - state.weekStart + 7) % 7;
  candidate.setDate(candidate.getDate() - delta);
  return candidate;
}

function renderWeek() {
  const ribbon = $("#weekRibbon");
  ribbon.innerHTML = "";
  const start = startOfDisplayedWeek();
  let count = 0;
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const events = eventsForDate(date);
    count += events.length;
    const day = document.createElement("div");
    day.className = "week-day";
    day.innerHTML = `<time datetime="${state.year}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}">${pad(date.getDate())}</time><span>${date.getMonth() + 1} 月 · ${weekdays[date.getDay()].split(" ")[0]}</span>`;
    events.forEach((character) => day.append(createTicket(character)));
    ribbon.append(day);
  }
  $("#visibleCount").textContent = count;
  $("#emptyState").hidden = state.selectedGames.size > 0;
}

function updatePeriodLabels() {
  $("#spineMonth").textContent = pad(state.month + 1);
  $("#spineYear").textContent = state.year;
  $("#spineMonthEn").textContent = monthNames[state.month];
  if (state.currentContext === "neutral") {
    $("#stageTitle").textContent = `${monthNamesZh[state.month]}，翻到有名字的日子`;
    $("#markCode").textContent = `${monthNames[state.month]} / ${pad(state.month + 1)}`;
  }
}

function renderCalendar() {
  updatePeriodLabels();
  renderWeekdays();
  const isMonth = state.view === "month";
  $("#calendarGrid").hidden = !isMonth;
  $("#weekRibbon").hidden = isMonth;
  $("#weekdayRow").hidden = !isMonth;
  if (isMonth) renderMonth(); else renderWeek();
  $("#viewLabel").textContent = isMonth ? "月视图" : "周视图";
  $("#viewButton .dock-icon").textContent = isMonth ? "▦" : "▥";
  document.body.dataset.view = state.view;
  document.body.dataset.density = state.density;
  $("#densityLabel").textContent = densityNames[state.density];
  updateFilterSummary();
}

function changePeriod(delta) {
  if (state.view === "week") {
    state.activeWeekStart.setDate(state.activeWeekStart.getDate() + delta * 7);
    state.year = state.activeWeekStart.getFullYear();
    state.month = state.activeWeekStart.getMonth();
  } else {
    state.month += delta;
    if (state.month < 0) { state.month = 11; state.year -= 1; }
    if (state.month > 11) { state.month = 0; state.year += 1; }
  }
  renderCalendar();
}

function setImage(image, fallback, source, alt) {
  image.classList.remove("loaded");
  image.alt = alt || "";
  if (!source || state.forceMissingImage) {
    image.removeAttribute("src");
    fallback.hidden = false;
    return;
  }
  fallback.hidden = false;
  image.onload = () => {
    image.classList.add("loaded");
    fallback.hidden = true;
  };
  image.onerror = () => {
    image.classList.remove("loaded");
    fallback.hidden = false;
  };
  image.src = source;
}

function inferContext(character) {
  if (!character) return contexts.neutral;
  if (character.game === "genshin" && character.region === "蒙德") return { ...contexts.mondstadt, characterId: character.id };
  if (character.game === "genshin" && character.region === "璃月") return { ...contexts.liyue, characterId: character.id };
  if (character.game === "genshin" && character.region === "须弥") return { ...contexts.sumeru, characterId: character.id };
  if (character.game === "zzz" && character.region === "维多利亚家政") return { ...contexts.victoria, characterId: character.id };
  if (character.game === "hsr") return { ...contexts.hsr, characterId: character.id };
  return {
    ...contexts.neutral,
    characterId: character.id,
    title: character.name,
    subtitle: `${gameMeta[character.game].name} · ${character.element || "属性未知"} · ${character.weapon || "分类未知"}`,
    affiliation: character.region || gameMeta[character.game].name,
    affiliationEn: character.region ? "AFFILIATION" : "GAME-LEVEL FALLBACK",
    tagline: character.region || "归属待补充",
    mark: character.region ? "CHARACTER RECORD" : "NEUTRAL FALLBACK",
    code: gameMeta[character.game].short.toUpperCase(),
    profile: character.game,
  };
}

function applyThemeProfile(profileKey) {
  const profile = themeProfiles[profileKey] || themeProfiles.neutral;
  Object.entries(profile).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--profile-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, value);
  });
  document.documentElement.dataset.profile = profileKey;
}

function applyContext(context, character = null, contextKey = null) {
  state.currentContext = contextKey || context.theme;
  state.selectedCharacter = character;
  applyThemeProfile(context.profile || context.theme || "neutral");
  document.body.dataset.theme = context.theme;
  $("#stageTitle").textContent = context.title;
  $("#stageSubtitle").textContent = context.subtitle;
  $("#affiliationName").textContent = context.affiliation;
  $("#affiliationEn").textContent = context.affiliationEn;
  $("#affiliationTagline").textContent = context.tagline;
  $("#markName").textContent = context.mark;
  $("#markCode").textContent = context.code;
  $("#openSelectedDetail").hidden = !character;
  $$(".context-chip").forEach((chip) => chip.classList.toggle("active", chip.dataset.context === contextKey));
  setImage($("#contextPortrait"), $("#portraitFallback"), character?.portrait, character ? `${character.name}立绘` : "");
  renderCalendar();
}

function chooseContext(key) {
  const context = contexts[key] || contexts.neutral;
  const character = context.characterId ? characters.find((item) => item.id === context.characterId) : null;
  state.forceMissingImage = false;
  applyContext(context, character, key);
}

function selectCharacter(character) {
  const context = inferContext(character);
  state.forceMissingImage = false;
  applyContext(
    {
      ...context,
      title: context.theme === "victoria" ? `${character.nameEn.toUpperCase()} / ${character.name}` : character.name,
      subtitle: `${gameMeta[character.game].name} · ${character.element || "属性未知"} · ${character.weapon || "分类未知"}`,
      affiliation: character.region || context.affiliation,
    },
    character,
    Object.keys(contexts).find((key) => contexts[key].theme === context.theme && contexts[key].characterId === character.id) || null,
  );
  showToast(`已定位 ${character.name} 的日期与归属`);
}

function openDayThread(date, events) {
  $("#dayThreadTitle").textContent = `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  const list = $("#dayThreadList");
  list.innerHTML = "";
  events.forEach((character) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thread-person";
    button.innerHTML = `<img src="${character.avatar}" alt="" /><span><strong>${character.name}</strong><small>${gameMeta[character.game].name} · ${character.element || "属性未知"} · ${character.weapon || "分类未知"}</small></span><span>→</span>`;
    button.addEventListener("click", () => {
      closeDayThread();
      selectCharacter(character);
    });
    list.append(button);
  });
  $("#dayThread").classList.add("open");
  $("#dayThread").setAttribute("aria-hidden", "false");
  showScrim();
}

function closeDayThread() {
  $("#dayThread").classList.remove("open");
  $("#dayThread").setAttribute("aria-hidden", "true");
  hideScrimIfClear();
}

function openDetail(character = state.selectedCharacter) {
  if (!character) return;
  const context = inferContext(character);
  document.body.dataset.theme = context.theme;
  $("#detailGame").textContent = gameMeta[character.game].name;
  $("#detailName").textContent = character.name;
  $("#detailNameEn").textContent = character.nameEn;
  $("#detailAffiliation").textContent = character.region || context.affiliation;
  $("#detailAffiliationEn").textContent = context.affiliationEn;
  $("#detailRarity").textContent = character.rarity ? `${character.rarity} 星` : "未收录";
  $("#detailElement").textContent = character.element || "未收录";
  $("#detailWeapon").textContent = character.weapon || "未收录";
  $("#detailRegion").textContent = character.region || "游戏级归属";
  const usesRelease = character.game === "hsr" || (state.dateMode === "release" && character.releaseDate);
  $("#detailDateLabel").textContent = usesRelease ? "首次实装 / 周年" : "年度生日";
  const key = usesRelease ? character.releaseDate.slice(5) : character.birthday;
  $("#detailDate").textContent = key.replace("-", " / ");
  $("#detailFullDate").textContent = usesRelease ? character.releaseDate : "每年重复";
  $("#recordNote").textContent = character.game === "hsr"
    ? "星穹铁道使用首次实装日期。"
    : state.dateMode === "release" && !character.releaseDate
      ? "缺少完整实装数据，当前回落到生日。"
      : usesRelease ? "日历按月日展示周年，完整日期保留于详情。" : "生日按月日每年重复。";
  setImage($("#detailPortrait"), $("#detailFallback"), character.portrait, `${character.name}立绘`);
  $("#detailScene").classList.add("open");
  $("#detailScene").classList.remove("art-only");
  $("#detailScene").setAttribute("aria-hidden", "false");
  $("#detailCloseIcon").focus({ preventScroll: true });
}

function closeDetail() {
  $("#detailScene").classList.remove("open", "art-only");
  $("#detailScene").setAttribute("aria-hidden", "true");
  const context = inferContext(state.selectedCharacter);
  document.body.dataset.theme = context.theme;
}

function openSheet(sheet) {
  closeSheets();
  sheet.classList.add("open");
  sheet.setAttribute("aria-hidden", "false");
  showScrim();
  const focusTarget = sheet.querySelector("input:not([type=checkbox]), button");
  window.setTimeout(() => focusTarget?.focus({ preventScroll: true }), 80);
}

function closeSheets() {
  $$(".bottom-sheet.open").forEach((sheet) => {
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
  });
  hideScrimIfClear();
}

function showScrim() {
  $("#scrim").hidden = false;
}

function hideScrimIfClear() {
  if (!$(".bottom-sheet.open") && !$("#dayThread").classList.contains("open")) $("#scrim").hidden = true;
}

function updateFilterSummary() {
  const removedGames = Object.keys(gameMeta).length - state.selectedGames.size;
  const facetCount = Object.values(state.facets).filter(Boolean).length;
  const count = removedGames + facetCount;
  $("#filterCount").textContent = count;
  $("#scopeSummary").textContent = `${state.selectedGames.size} 个游戏 · ${facetCount ? `${facetCount} 个角色条件` : "全部角色"}`;
  $$("#gameOptions input").forEach((input) => { input.checked = state.selectedGames.has(input.value); });
}

function renderFacetLines(game) {
  const target = $("#facetLines");
  target.innerHTML = "";
  facetsByGame[game].forEach(([label, ...values]) => {
    const line = document.createElement("div");
    line.innerHTML = `<strong>${label}</strong>`;
    values.forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.facet = value;
      button.textContent = value;
      button.classList.toggle("active", state.facets[game] === value);
      button.addEventListener("click", () => {
        state.facets[game] = state.facets[game] === value ? null : value;
        renderFacetLines(game);
        updateFilterSummary();
      });
      line.append(button);
    });
    target.append(line);
  });
  const incomplete = document.createElement("div");
  incomplete.innerHTML = `<strong>数据</strong><label class="toggle-line"><input type="checkbox" checked />包含信息不全</label>`;
  target.append(incomplete);
}

function applyGamesFromSheet() {
  state.selectedGames = new Set($$("#gameOptions input:checked").map((input) => input.value));
}

function clearFilters() {
  state.selectedGames = new Set(Object.keys(gameMeta));
  Object.keys(state.facets).forEach((key) => { state.facets[key] = null; });
  updateFilterSummary();
  renderFacetLines($(".scope-tabs button.active").dataset.filterGame);
}

function renderSearch(query = "") {
  const normalized = query.trim().toLowerCase();
  const scored = characters
    .map((character) => {
      const nameHit = character.name.toLowerCase().includes(normalized) || character.nameEn.toLowerCase().includes(normalized);
      const haystack = [character.name, character.nameEn, gameMeta[character.game].name, character.birthday, character.releaseDate, character.element, character.weapon, character.region].join(" ").toLowerCase();
      return { character, score: nameHit ? 2 : haystack.includes(normalized) ? 1 : 0 };
    })
    .filter((item) => !normalized || item.score > 0)
    .sort((a, b) => b.score - a.score || a.character.name.localeCompare(b.character.name, "zh-CN"))
    .slice(0, 8);
  state.searchIndex = Math.min(state.searchIndex, Math.max(0, scored.length - 1));
  const target = $("#searchResults");
  target.innerHTML = "";
  scored.forEach(({ character }, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `search-result${index === state.searchIndex ? " active" : ""}`;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", index === state.searchIndex ? "true" : "false");
    const date = eventKey(character);
    button.innerHTML = `<img src="${character.avatar}" alt="" /><span><strong>${character.name} · ${character.nameEn}</strong><small>${gameMeta[character.game].name} · ${character.element || "属性未知"} · ${character.region || "游戏级归属"}</small></span><span>${date.replace("-", " / ")}</span>`;
    button.addEventListener("click", () => locateSearchResult(character));
    target.append(button);
  });
  return scored;
}

function locateSearchResult(character) {
  const key = eventKey(character);
  state.month = Number(key.slice(0, 2)) - 1;
  state.year = demoToday.getFullYear();
  state.view = "month";
  closeSheets();
  selectCharacter(character);
}

function showToolPreview(tool) {
  const preview = $("#toolPreview");
  preview.hidden = false;
  if (tool === "edit") {
    preview.innerHTML = `<div class="inline-form"><strong>添加 / 编辑角色</strong><input aria-label="中文名" placeholder="中文名" /><input aria-label="英文名" placeholder="英文名" /><input aria-label="生日" placeholder="MM-DD" /><input aria-label="头像 URL" placeholder="头像 URL" /><button type="button" data-preview-action="validate">校验表单</button></div>`;
  } else if (tool === "json") {
    preview.innerHTML = `<div class="inline-form"><strong>JSON 导入</strong><textarea aria-label="JSON 内容" rows="3" placeholder='单条对象或对象数组'></textarea><button type="button" data-preview-action="parse">验证 JSON</button></div>`;
  } else if (tool === "export") {
    preview.innerHTML = `<div class="inline-form"><strong>选择导出格式</strong><button type="button" data-preview-action="json">全部角色 JSON</button><button type="button" data-preview-action="ics">有效日期 ICS</button></div>`;
  } else if (tool === "sync") {
    preview.innerHTML = `<div class="sync-line"><span>同步中</span><progress max="100" value="38">38%</progress><strong>38%</strong></div>`;
    window.setTimeout(() => {
      if (preview.querySelector("progress")) preview.innerHTML = `<div class="sync-line success"><span>更新完成</span><strong>${characters.length} 条代表数据已校验</strong></div>`;
    }, 900);
  }
  preview.querySelectorAll("[data-preview-action]").forEach((button) => {
    button.addEventListener("click", () => handleToolAction(button.dataset.previewAction, preview));
  });
}

function handleToolAction(action, preview) {
  if (action === "parse") {
    const input = preview.querySelector("textarea").value;
    try {
      const parsed = JSON.parse(input);
      const count = Array.isArray(parsed) ? parsed.length : 1;
      showToast(`JSON 格式有效，共 ${count} 条；隔离原型未写入数据`);
    } catch {
      preview.insertAdjacentHTML("beforeend", `<p class="inline-error">JSON 无法解析，请检查括号与引号。</p>`);
    }
  } else if (action === "validate") {
    showToast("表单入口与校验路径已就绪；隔离原型未写入项目数据");
  } else {
    showToast(action === "ics" ? "已检查有效日期，导出入口可用" : "已生成代表数据 JSON 导出入口");
  }
}

let toastTimer = 0;
function showToast(message) {
  const toast = $("#toast");
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function toggleDateMode() {
  state.dateMode = state.dateMode === "birthday" ? "release" : "birthday";
  $("#dateModeLabel").textContent = state.dateMode === "birthday" ? "生日" : "实装纪念";
  renderCalendar();
  showToast(state.dateMode === "birthday" ? "已切换到生日语义" : "已切换到首次实装周年语义；星铁保持实装，崩坏3缺失时回落生日");
}

function initializeEvents() {
  $("#prevPeriod").addEventListener("click", () => changePeriod(-1));
  $("#nextPeriod").addEventListener("click", () => changePeriod(1));
  $("#todayButton").addEventListener("click", () => {
    state.year = demoToday.getFullYear();
    state.month = demoToday.getMonth();
    state.activeWeekStart = new Date(demoToday);
    renderCalendar();
  });
  $("#dateModeButton").addEventListener("click", toggleDateMode);
  $("#viewButton").addEventListener("click", () => {
    state.view = state.view === "month" ? "week" : "month";
    renderCalendar();
  });
  $("#densityButton").addEventListener("click", () => {
    state.density = densityOrder[(densityOrder.indexOf(state.density) + 1) % densityOrder.length];
    renderCalendar();
  });
  $$(".context-chip").forEach((chip) => chip.addEventListener("click", () => chooseContext(chip.dataset.context)));
  $("#openSelectedDetail").addEventListener("click", () => openDetail());
  $("#openFilters").addEventListener("click", () => openSheet($("#filterSheet")));
  $("#openSearch").addEventListener("click", () => {
    openSheet($("#searchSheet"));
    renderSearch($("#searchInput").value);
  });
  $("#openTools").addEventListener("click", () => openSheet($("#toolsSheet")));
  $$(".close-sheet").forEach((button) => button.addEventListener("click", closeSheets));
  $("#scrim").addEventListener("click", () => { closeSheets(); closeDayThread(); });
  $("#closeDayThread").addEventListener("click", closeDayThread);
  $("#closeDetail").addEventListener("click", closeDetail);
  $("#detailCloseIcon").addEventListener("click", closeDetail);
  $("#artOnlyButton").addEventListener("click", () => $("#detailScene").classList.add("art-only"));
  $("#artOnlyReturn").addEventListener("click", () => $("#detailScene").classList.remove("art-only"));
  $("#favoriteButton").addEventListener("click", (event) => {
    event.currentTarget.classList.toggle("active");
    event.currentTarget.textContent = event.currentTarget.classList.contains("active") ? "★ 已收藏" : "☆ 收藏";
  });
  $("#singleIcsButton").addEventListener("click", () => showToast("单角色 ICS 已准备；此隔离原型不触发下载"));
  $("#editButton").addEventListener("click", () => { closeDetail(); openSheet($("#toolsSheet")); showToolPreview("edit"); });

  $$("#gameOptions input").forEach((input) => input.addEventListener("change", () => {
    applyGamesFromSheet();
    updateFilterSummary();
  }));
  $$(".scope-tabs button").forEach((button) => button.addEventListener("click", () => {
    $$(".scope-tabs button").forEach((item) => item.classList.toggle("active", item === button));
    renderFacetLines(button.dataset.filterGame);
  }));
  $("#clearFilters").addEventListener("click", clearFilters);
  $("#applyFilters").addEventListener("click", () => { applyGamesFromSheet(); closeSheets(); renderCalendar(); });
  $("#restoreGames").addEventListener("click", () => { clearFilters(); renderCalendar(); });

  $("#searchInput").addEventListener("input", (event) => {
    state.searchIndex = 0;
    renderSearch(event.target.value);
  });
  $("#searchInput").addEventListener("keydown", (event) => {
    const results = renderSearch(event.currentTarget.value);
    if (event.key === "ArrowDown") state.searchIndex = Math.min(results.length - 1, state.searchIndex + 1);
    else if (event.key === "ArrowUp") state.searchIndex = Math.max(0, state.searchIndex - 1);
    else if (event.key === "Enter" && results[state.searchIndex]) locateSearchResult(results[state.searchIndex].character);
    else if (event.key === "Escape") closeSheets();
    else return;
    event.preventDefault();
    renderSearch(event.currentTarget.value);
  });

  $$(".tools-grid > button").forEach((button) => button.addEventListener("click", () => showToolPreview(button.dataset.tool)));
  $("#motionToggle").addEventListener("change", (event) => {
    document.body.dataset.motion = event.target.checked ? "on" : "off";
    showToast(event.target.checked ? "动态切换已开启" : "已使用静态切换");
  });
  $("#demoFallback").addEventListener("click", () => {
    closeSheets();
    state.forceMissingImage = true;
    const amber = characters.find((item) => item.id === "amber-genshin");
    applyContext({ ...contexts.mondstadt, title: "安柏", subtitle: "图片不可用 · 文本与归属仍保持完整" }, amber, null);
  });
  $("#demoFailure").addEventListener("click", () => {
    $("#toolPreview").hidden = false;
    $("#toolPreview").innerHTML = `<div class="sync-line failure"><span>导出失败</span><strong>没有可导出的有效日期</strong><button type="button">返回检查范围</button></div>`;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if ($("#detailScene").classList.contains("open")) closeDetail();
      else if ($("#dayThread").classList.contains("open")) closeDayThread();
      else closeSheets();
    }
  });
}

function applyQueryState() {
  const params = new URLSearchParams(window.location.search);
  const captureWidth = Number(params.get("capture"));
  if (captureWidth >= 320 && captureWidth <= 520) {
    document.body.classList.add("capture-viewport");
    document.body.style.setProperty("--capture-width", `${captureWidth}px`);
  }
  if (params.get("audit") === "1") document.documentElement.classList.add("structure-audit");
  if (params.get("density") && densityOrder.includes(params.get("density"))) state.density = params.get("density");
  if (params.get("view") === "week") state.view = "week";
  if (params.get("motion") === "off") {
    document.body.dataset.motion = "off";
    $("#motionToggle").checked = false;
  }
  const theme = params.get("theme");
  if (theme && contexts[theme]) chooseContext(theme);
  if (params.get("sheet") === "filter") openSheet($("#filterSheet"));
  if (params.get("sheet") === "search") openSheet($("#searchSheet"));
  const detail = params.get("detail");
  if (detail) {
    const character = characters.find((item) => item.id.includes(detail) || item.nameEn.toLowerCase() === detail.toLowerCase());
    if (character) { selectCharacter(character); openDetail(character); }
  }
}

initializeEvents();
renderFacetLines("genshin");
renderCalendar();
chooseContext("neutral");
applyQueryState();
