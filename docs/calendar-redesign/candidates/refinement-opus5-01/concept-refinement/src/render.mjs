// 生成三张概念图的 HTML（真实数据驱动）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { page, gridLines, WEEK, monthGrid, eventsFor, deskCell, mobCell, GAMES, esc, localAvatar, chars } from './build.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const byName = Object.fromEntries(chars.map((c) => [c.name, c]));
const avatarOf = (n) => localAvatar[n];

const TOPBAR = ({ sum, dot, on, badge }) => `
<div class="brand"><h1>米哈游角色生日日历</h1><p>角色生日 · 首次实装纪念日</p></div>
<div class="bar" style="right:72px">
  <div class="search"><span>⌕</span><span>搜索角色</span></div>
  <div class="seg"><b class="on">月</b><b>周</b></div>
  <div class="seg"><b class="on">生日</b><b>实装</b></div>
  <div class="filterpill">
    <div class="sum"><i style="background:${dot}"></i>${sum}</div>
    <div class="act${on ? ' on' : ''}">筛选 / 显示${badge ? `<span class="badge">${badge}</span>` : ''} <span style="opacity:.55">▾</span></div>
  </div>
  <div class="icobtn">⋯</div>
</div>`;

const weekRow = () => `<div class="wk">${WEEK.map((w) => `<i>${w}</i>`).join('')}</div>`;

// ============ 图 1：2026 年 4 月 · 中性月视图 ============
{
  const ev = eventsFor(null);
  const grid = monthGrid(2026, 4);
  const cells = grid.map((d, i) => {
    const list = d.inMonth ? ev[d.key] || [] : [];
    return deskCell(d, list, { x: (i % 7) * 103, y: Math.floor(i / 7) * 92, today: d.inMonth && d.key === '04-17' });
  }).join('');
  const days = Object.keys(ev).filter((k) => k.startsWith('04-'));
  const total = days.reduce((n, k) => n + ev[k].length, 0);

  const css = `
.bg{background:linear-gradient(135deg,#080b17 0%,#13172b 55%,#24203c 100%)}
.halo{position:absolute;inset:0;background:radial-gradient(65% 65% at 66% 28%,rgba(118,108,255,.30),rgba(118,108,255,0) 70%)}
.stage .scrim{background:linear-gradient(180deg,rgba(9,11,21,.58) 0%,rgba(9,11,21,.10) 17%,rgba(9,11,21,.22) 56%,rgba(9,11,21,.95) 100%)}`;

  const body = `
<div class="bg"></div><div class="halo"></div>
<i class="blob" style="width:380px;height:380px;left:1040px;top:-110px;background:#8c7cff;opacity:.13"></i>
<i class="blob" style="width:420px;height:420px;left:250px;top:610px;background:#45e7d0;opacity:.07"></i>
<div class="rule" style="top:108px"></div><div class="rule" style="top:872px"></div>
${TOPBAR({ sum: '全部游戏 · 288 位', dot: '#766cff', on: false, badge: 0 })}

<div class="stage">
  <img class="pt" src="assets/xiao-genshin-p.webp" style="width:1946px;left:-800px;top:-202px">
  <div class="scrim"></div>
  <div class="tag">今天 · 4 月 17 日</div>
  <div class="fav">★</div>
  <div class="info">
    <div class="big">17</div>
    <div class="sub">四月 · 星期五</div>
    <div class="who">魈 <span>/ 璃月 · 原神</span></div>
    <div class="also">
      <span class="av" style="--ring:#9d90ff;width:28px;height:28px"><img src="assets/${avatarOf('砂金')}"></span>
      <span class="av" style="--ring:#ff6b6b;width:28px;height:28px"><img src="assets/${avatarOf('苍角')}"></span>
      今天共 3 位 · 点击查看当天全部
    </div>
  </div>
</div>

<div class="work">
  <div class="wh"><div class="lbl">月视图 · 生日</div><div class="mon">4月 <span>2026</span></div></div>
  <div class="wcount"><div class="a">生日 + 首次实装</div><div class="b">${days.length} 天 · ${total} 位角色</div></div>
  <div class="nav"><div class="n">‹</div><div class="today">今天</div><div class="n">›</div></div>
  ${weekRow()}
  <div class="grid">${gridLines()}${cells}</div>
  <div class="dock">
    <span class="av" style="--ring:#4a90e2"><img src="assets/${avatarOf('魈')}"></span>
    <div class="t">4月17日 · 魈 <span>／ 今天 3 位角色</span></div>
    <div class="legend" style="margin-left:28px">
      <b><i class="mk birthday"></i>生日</b><b><i class="mk release"></i>首次实装</b><b>环色 = 所属游戏</b>
    </div>
    <div class="go">查看当天 →</div>
  </div>
</div>
<div class="foot">MIHOYO BIRTHDAY &amp; DEBUT CALENDAR</div>`;
  fs.writeFileSync(path.join(HERE, '01-desktop-neutral.html'), page('01 桌面端中性月视图', css, body));
}

// ============ 图 2：2026 年 10 月 · 原神（游戏级）+ 须弥（角色级地区上下文）+ 展开面板 ============
{
  const evG = eventsFor((c) => c.game === 'genshin');
  const grid = monthGrid(2026, 10);
  const SUM = '#6fba72', GEN = '#4a90e2';
  const cells = grid.map((d, i) => {
    const x = (i % 7) * 103, y = Math.floor(i / 7) * 92;
    const list = d.inMonth ? evG[d.key] || [] : [];
    const cls = ['cell']; if (!d.inMonth) cls.push('out');
    const sel = d.inMonth && d.key === '10-27';
    if (sel) cls.push('sel');
    let body = '';
    if (list.length) {
      const c = list[0];
      const ring = c.region === '须弥' ? SUM : GEN;
      body = `<span class="marks"><i class="mk birthday"></i></span>
        <div class="stack s1"><span class="av" style="--ring:${ring};width:48px;height:48px"><img src="assets/${avatarOf(c.name)}"></span></div>
        <div class="cap"${sel ? ' style="color:#bfe0bd"' : ''}>${esc(c.name)}</div>`;
    }
    return `<div class="${cls.join(' ')}" style="left:${x}px;top:${y}px"><span class="dnum">${d.d}</span>${body}</div>`;
  }).join('');

  const chip = (t, on) => `<b class="chip${on ? ' on' : ''}">${t}</b>`;
  const css = `
.bg{background:linear-gradient(135deg,#080b17 0%,#13172b 55%,#231f36 100%)}
/* 地区光只落在左侧舞台一侧，右侧工作区保持中性 */
.halo{position:absolute;inset:0;background:radial-gradient(48% 62% at 20% 34%,rgba(111,186,114,.30),rgba(111,186,114,0) 72%)}
.stage{border-color:rgba(140,214,142,.45)}
.stage .scrim{inset:0 0 372px 0;
  background:linear-gradient(180deg,rgba(8,18,14,.5) 0%,rgba(8,18,14,.08) 18%,rgba(8,18,14,.34) 62%,rgba(7,16,12,.93) 100%)}
.stage .info{bottom:392px}
.stage .big{font-size:44px;letter-spacing:-1px}
.cell.sel{border-color:rgba(140,214,142,.9)}
/* 展开面板：从舞台底部升起，右侧月历完全不被遮挡 */
.panel{position:absolute;left:0;right:0;bottom:0;height:372px;padding:18px 22px 16px;
  background:linear-gradient(180deg,rgba(10,24,19,.90) 0%,rgba(8,20,16,.96) 14%,rgba(7,18,14,.98) 100%);
  border-top:1px solid rgba(140,214,142,.32)}
.panel .ph{display:flex;align-items:center;margin-bottom:13px}
.panel .ph h3{font-size:14px;font-weight:600;letter-spacing:.5px}
.panel .ph .esc{margin-left:10px;font-size:10.5px;color:#8fb0a6;border:1px solid rgba(255,255,255,.16);
  border-radius:9px;padding:2px 7px}
.panel .ph .done{margin-left:auto;height:28px;padding:0 15px;border-radius:14px;background:#e6f3e7;color:#0d2118;
  font-size:12px;font-weight:600;display:flex;align-items:center}
.grp{margin-bottom:12px}
.grp .gl2{font-size:10.5px;letter-spacing:2px;color:#8fb0a6;margin-bottom:7px}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{height:26px;padding:0 11px;border-radius:13px;border:1px solid rgba(255,255,255,.15);
  font-size:11.5px;font-weight:400;color:#b6c8c2;display:flex;align-items:center}
.chip.on{background:${GEN};border-color:${GEN};color:#06121f;font-weight:600}
.chip.region.on{background:${SUM};border-color:${SUM};color:#08170f}
.pfoot{display:flex;align-items:center;margin-top:1px}
.pfoot .clr{font-size:11.5px;color:#9fb8b1;text-decoration:underline;text-underline-offset:3px}
.pfoot .cnt{margin-left:auto;font-size:11.5px;color:#8fb0a6}
.dock{background:rgba(111,186,114,.09);border-color:rgba(140,214,142,.26)}`;

  const body = `
<div class="bg"></div><div class="halo"></div>
<i class="blob" style="width:380px;height:380px;left:40px;top:-60px;background:#6fba72;opacity:.15"></i>
<i class="blob" style="width:420px;height:420px;left:1080px;top:560px;background:#8b76ff;opacity:.11"></i>
<div class="rule" style="top:108px"></div><div class="rule" style="top:872px"></div>
${TOPBAR({ sum: '原神 · 119 位', dot: GEN, on: true, badge: 1 })}

<div class="stage">
  <img class="pt" src="assets/nahida-genshin-p.webp" style="width:1270px;left:-396px;top:-124px">
  <div class="scrim"></div>
  <div class="tag" style="color:#d6f2d5">选中角色 · 地区上下文</div>
  <div class="fav">★</div>
  <div class="info">
    <div class="big">须弥</div>
    <div class="sub" style="color:#a9dba7">SUMERU · 智慧与雨林</div>
    <div class="who">纳西妲 <span>/ 10月27日 · 生日</span></div>
  </div>
  <div class="panel">
    <div class="ph"><h3>筛选 / 显示</h3><span class="esc">Esc 收起</span><span class="done">完成</span></div>
    <div class="grp"><div class="gl2">游戏（多选）</div><div class="chips">
      ${chip('原神', true)}${chip('星穹铁道')}${chip('绝区零')}${chip('崩坏3')}</div></div>
    <div class="grp"><div class="gl2">地区 · 原神</div><div class="chips">
      ${chip('蒙德')}${chip('璃月')}${chip('稻妻')}${chip('须弥')}${chip('枫丹')}${chip('纳塔')}${chip('至冬')}</div></div>
    <div class="grp"><div class="gl2">元素 · 稀有度 · 武器</div><div class="chips">
      ${chip('草')}${chip('水')}${chip('雷')}${chip('风')}${chip('五星')}${chip('四星')}${chip('法器')}${chip('更多 ▾')}</div></div>
    <div class="grp"><div class="gl2">显示</div><div class="chips">
      ${chip('舒适')}${chip('紧凑')}${chip('周一起始')}${chip('只看收藏')}${chip('信息不全的角色')}</div></div>
    <div class="pfoot"><span class="clr">清除全部筛选</span><span class="cnt">1 项生效 · 匹配 119 位</span></div>
  </div>
</div>

<div class="work">
  <div class="wh"><div class="lbl">月视图 · 生日 · 已筛选</div><div class="mon">10月 <span>2026</span></div></div>
  <div class="wcount"><div class="a">原神</div><div class="b">9 天 · 9 位角色</div></div>
  <div class="nav"><div class="n">‹</div><div class="today">今天</div><div class="n">›</div></div>
  ${weekRow()}
  <div class="grid">${gridLines()}${cells}</div>
  <div class="dock">
    <span class="av" style="--ring:${SUM}"><img src="assets/${avatarOf('纳西妲')}"></span>
    <div class="t">10月27日 · 纳西妲 <span>／ 草 · 法器 · 五星 · 须弥</span></div>
    <div class="legend" style="margin-left:26px">
      <b><i style="width:7px;height:7px;border-radius:50%;background:${GEN};display:block"></i>原神</b>
      <b><i style="width:7px;height:7px;border-radius:50%;background:${SUM};display:block"></i>须弥（选中角色的地区）</b>
    </div>
    <div class="go">查看角色详情 →</div>
  </div>
</div>
<div class="foot">MIHOYO BIRTHDAY &amp; DEBUT CALENDAR</div>`;
  fs.writeFileSync(path.join(HERE, '02-desktop-context-detail.html'), page('02 桌面端上下文 + 详情', css, body));
}

// ============ 图 3：移动端 390×844 · 2026 年 4 月 ============
{
  const ev = eventsFor(null);
  const grid = monthGrid(2026, 4);
  const cells = grid.map((d, i) => {
    const list = d.inMonth ? ev[d.key] || [] : [];
    return mobCell(d, list, { x: (i % 7) * 52, y: Math.floor(i / 7) * 58, today: d.inMonth && d.key === '04-17' });
  }).join('');

  const css = `
body{width:390px;height:844px}
.bg{background:linear-gradient(150deg,#080b17 0%,#181530 58%,#2a1b2e 100%)}
.halo{position:absolute;inset:0;background:radial-gradient(80% 60% at 70% 8%,rgba(140,120,255,.32),rgba(140,120,255,0) 70%)}
.mtop{position:absolute;left:13px;right:13px;top:16px;display:flex;align-items:center}
.mtop h1{font-size:14px;font-weight:600;letter-spacing:.3px}
.mtop .ic{width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.18);
  display:flex;align-items:center;justify-content:center;font-size:14px;color:#c3c6da;margin-left:8px}
.mhero{position:absolute;left:13px;top:52px;width:364px;height:244px;border-radius:22px;overflow:hidden;
  border:1px solid rgba(255,255,255,.2)}
.mhero img.pt{position:absolute}
.mhero .scrim{position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(11,13,24,.02) 0%,rgba(11,13,24,.22) 52%,rgba(11,13,24,.95) 100%)}
.mhero .tag{position:absolute;left:18px;top:16px;font-size:10px;letter-spacing:2px;color:#e6e3f5}
.mhero .info{position:absolute;left:18px;right:18px;bottom:16px}
.mhero .big{font-size:46px;line-height:.85;font-weight:300;letter-spacing:-2px}
.mhero .sub{font-size:11px;letter-spacing:2px;color:#cdc9e2;margin-top:9px}
.mhero .who{font-size:15px;margin-top:8px}
.mhero .who span{color:#9a9db5;font-size:12.5px}
.mhero .also{position:absolute;right:16px;bottom:18px;display:flex;align-items:center;gap:5px;
  font-size:10.5px;color:#cbc8dd}
.mrow{position:absolute;left:13px;right:13px;display:flex;align-items:center}
.mnav{display:flex;align-items:center;gap:10px}
.mnav .n{width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.18);
  display:flex;align-items:center;justify-content:center;font-size:13px;color:#c9ccdd}
.mnav .mon{font-size:19px;font-weight:500}
.mnav .mon span{color:#83869f;font-size:14px}
.mtoday{margin-left:auto;height:30px;padding:0 14px;border-radius:15px;background:#f1f0ea;color:#141526;
  font-size:12px;font-weight:600;display:flex;align-items:center}
.mseg{display:flex;height:30px;border:1px solid rgba(255,255,255,.16);border-radius:15px;overflow:hidden;margin-right:8px}
.mseg b{display:flex;align-items:center;padding:0 12px;font-size:11.5px;font-weight:400;color:#9296b0}
.mseg b.on{background:#f1f0ea;color:#141526;font-weight:600}
.mfilter{margin-left:auto;display:flex;align-items:center;gap:6px;height:30px;padding:0 13px;border-radius:15px;
  border:1px solid rgba(255,255,255,.2);font-size:11.5px;color:#e6e5f0}
.mwk{position:absolute;left:13px;top:396px;width:364px;display:flex}
.mwk i{width:52px;text-align:center;font-size:10px;color:#80839b;font-style:normal}
.mgrid{position:absolute;left:13px;top:418px;width:364px;height:348px}
.mgl{position:absolute;background:rgba(255,255,255,.07)}
.mcell{position:absolute;width:52px;height:58px;overflow:hidden}
.mcell .dnum{position:absolute;left:0;right:0;top:4px;text-align:center;font-size:11px;color:#dedce8}
.mcell.out{opacity:.3}
.mcell.today .dnum{color:#141526}
.mcell.today:before{content:"";position:absolute;left:50%;top:2px;margin-left:-11px;width:22px;height:16px;
  border-radius:8px;background:#f1f0ea}
.mstack{position:absolute;left:50%;transform:translateX(-50%);top:20px;height:32px}
.mstack .av b{font-size:11px}
.mmore{position:absolute;left:0;right:0;bottom:3px;text-align:center;font-size:8.5px;color:#b9bcd0;font-weight:600}
.mdock{position:absolute;left:13px;top:778px;width:364px;height:52px;border-radius:18px;
  background:rgba(17,19,36,.8);border:1px solid rgba(255,255,255,.13);display:flex;align-items:center;
  padding:0 8px 0 14px;gap:10px}
.mdock .t{font-size:12.5px}
.mdock .t i{display:block;font-size:9.5px;letter-spacing:1.2px;color:#8589a2;font-style:normal;margin-bottom:3px}
.mdock .t span{color:#8f92a9}
.mdock .go{margin-left:auto;width:32px;height:32px;border-radius:50%;background:#f1f0ea;color:#141526;
  display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600}`;

  let gl = '';
  for (let r = 0; r <= 6; r++) gl += `<i class="mgl" style="left:0;top:${r * 58}px;width:364px;height:1px"></i>`;
  for (let c = 0; c <= 7; c++) gl += `<i class="mgl" style="left:${c * 52}px;top:0;width:1px;height:348px"></i>`;

  const body = `
<div class="bg"></div><div class="halo"></div>
<i class="blob" style="width:240px;height:240px;left:230px;top:-20px;background:#ff6f5b;opacity:.14"></i>
<div class="mtop"><h1>米哈游角色生日日历</h1><div style="margin-left:auto;display:flex"><div class="ic">⌕</div><div class="ic">⋯</div></div></div>
<div class="mhero">
  <img class="pt" src="assets/xiao-genshin-p.webp" style="width:1420px;left:-576px;top:-118px">
  <div class="scrim"></div>
  <div class="tag">今天 · 4 月 17 日</div>
  <div class="info">
    <div class="big">17</div>
    <div class="sub">四月 · 星期五</div>
    <div class="who">魈 <span>/ 璃月 · 原神</span></div>
  </div>
  <div class="also">
    <span class="av" style="--ring:#9d90ff;width:24px;height:24px"><img src="assets/${avatarOf('砂金')}"></span>
    <span class="av" style="--ring:#ff6b6b;width:24px;height:24px"><img src="assets/${avatarOf('苍角')}"></span>
    今天 3 位
  </div>
</div>
<div class="mrow" style="top:308px;height:30px">
  <div class="mnav"><div class="n">‹</div><div class="mon">4月 <span>2026</span></div><div class="n">›</div></div>
  <div class="mtoday">今天</div>
</div>
<div class="mrow" style="top:352px;height:30px">
  <div class="mseg"><b class="on">月</b><b>周</b></div>
  <div class="mseg"><b class="on">生日</b><b>实装</b></div>
  <div class="mfilter">筛选 / 显示</div>
</div>
<div class="mwk">${WEEK.map((w) => `<i>${w}</i>`).join('')}</div>
<div class="mgrid">${gl}${cells}</div>
<div class="mdock">
  <span class="av" style="--ring:#9d90ff;width:34px;height:34px"><img src="assets/${avatarOf('三月七')}"></span>
  <div class="t"><i>下一个纪念日</i>4月26日 · 星穹铁道 <span>首次实装 20 位</span></div>
  <div class="go">→</div>
</div>`;
  fs.writeFileSync(path.join(HERE, '03-mobile.html'), page('03 移动端主视图', css, body, 390, 844));
}

console.log('generated 3 html');
