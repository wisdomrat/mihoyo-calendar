import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { resolveAffiliation } from '../data/affiliations.ts';
import type { Character } from '../types/index.ts';
import './Hero.css';

interface HeroProps {
  characters: Character[];  // 改成接收多个角色
  autoRotateMs?: number;     // 自动轮播间隔，默认 6000ms
}

// 立绘尺寸/位置（纯 px，分两阶段计算：先测立绘比例，再按 hero 实测尺寸计算）
interface PortraitBox {
  width: number;
  height: number;
  left: number;
  top: number;
}

// 文字区的宽度/位置全部写在 Hero.css 里（按视口比例），这里一律实测，
// 不再照抄常量——抄一份迟早和 CSS 对不上（MOBILE_TEXT_BOTTOM 已经栽过一次）。
interface BoxInput {
  ratio: number;      // naturalHeight / naturalWidth
  heroW: number;      // hero 实测内容宽（不含滚动条）
  heroH: number;      // hero 实测高
  mobile: boolean;
  naturalH: number;   // 原图高度，用于限制放大倍数
  textTop: number;    // 文字区顶部 y（相对 hero，竖屏用）
  textLeft: number;   // 文字区左边缘 x（相对 hero，桌面端用）
}

// 移动端断点（与 Hero.css 的 @media (max-width: 768px) 保持一致）
const MOBILE_MAX = 768;

// 立绘最多放大到原图的 1.5 倍。没有这个上限，128px 的占位头像会被拉成 831px 的马赛克。
const MAX_UPSCALE = 1.5;

/**
 * Hero 用图：只认真正的立绘/头像。
 * ui-avatars.com 是本项目给缺图角色生成的字母块占位图（见 utils/characterData.ts），
 * 放进影院级首屏就是一块纯色方块，宁可不显示。
 */
function heroImageUrl(character: Character): string {
  const usable = (url?: string) => Boolean(url) && !url!.includes('ui-avatars.com');
  if (usable(character.portrait)) return character.portrait!;
  if (usable(character.avatar)) return character.avatar!;
  return '';
}

// 竖屏文字区顶部由 JS 实测（见 updatePortraitBox），不在此处写死距底常量

function computePortraitBox({
  ratio, heroW, heroH, mobile, naturalH, textTop, textLeft,
}: BoxInput): PortraitBox {
  const maxH = naturalH * MAX_UPSCALE;

  if (mobile) {
    // 竖屏：在「不裁剪、不超出屏幕」前提下等比放到最大。
    // 先按满宽算，超高则改按满高，最后再受放大上限约束。
    let w = heroW;
    let h = w * ratio;
    if (h > heroH) {
      h = heroH;
      w = h / ratio;
    }
    if (h > maxH) {
      h = maxH;
      w = h / ratio;
    }
    // 高立绘（占满上方）贴顶，文字压在其下部；矮立绘（横图）在文字区上方居中
    const top = h >= textTop ? 0 : (textTop - h) / 2;
    return { width: Math.round(w), height: Math.round(h), left: Math.round((heroW - w) / 2), top: Math.round(top) };
  }

  // 目标高度先受「原图 × 放大上限」约束，小图不会被拉满全屏
  const capH = Math.min(heroH, maxH);

  // 桌面端可用带宽 = hero 左边缘 ↔ 文字左边缘（实测，随视口比例变化）
  const contentLeft = textLeft;

  // 统一先按「高度 = hero 高度」计算（受放大上限约束）
  let h = capH;
  let w = h / ratio;

  if (w > heroW) {
    // 规则：按 hero 高度算出的宽度超过 hero 宽度 → 改为宽度 = hero 宽度，高度等比。
    // 这类满幅铺底的横图，文字压在其上是设计允许的叠加。
    w = heroW;
    h = heroW * ratio;
    return { width: Math.round(w), height: Math.round(h), left: 0, top: Math.round((heroH - h) / 2) };
  }

  // 未满幅：立绘只能待在文字左侧的可用带宽内，并在带内居中。
  // 竖向立绘天然如此；横图在超宽屏（21:9）上按全高算出的宽度会切进文字区，
  // 若不收缩就会出现「图片边缘从文字中间穿过」的半吊子叠加，比满幅铺底难看得多。
  if (w > contentLeft) {
    w = contentLeft;
    h = w * ratio;
  }
  return {
    width: Math.round(w),
    height: Math.round(h),
    left: Math.round((contentLeft - w) / 2),
    top: Math.round((heroH - h) / 2),
  };
}

export function Hero({ characters, autoRotateMs = 6000 }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [portraitNatural, setPortraitNatural] = useState<{ w: number; h: number } | null>(null);
  const [portraitBox, setPortraitBox] = useState<PortraitBox | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches);

  const character = characters[Math.min(activeIndex, characters.length - 1)] || characters[0];
  const affiliation = resolveAffiliation(character);
  const imageUrl = heroImageUrl(character);

  // 检测立绘原始尺寸（比例 + 分辨率，后者用于限制放大倍数）
  useEffect(() => {
    if (!imageUrl) {
      setPortraitNatural(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setPortraitNatural({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      if (!cancelled) setPortraitNatural(null);
    };
    img.src = imageUrl;
    return () => { cancelled = true; };
  }, [imageUrl]);

  // 监听断点
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // 按 hero 实测尺寸 + 立绘比例计算立绘盒（paint 前完成，无闪烁；窗口缩放时重算）
  const updatePortraitBox = useCallback(() => {
    const hero = heroRef.current;
    if (!hero || !portraitNatural) {
      setPortraitBox(null);
      return;
    }
    const rect = hero.getBoundingClientRect();
    const ratio = portraitNatural.h / portraitNatural.w;
    // 文字块的宽度/位置由 CSS 按视口比例决定，这里实测它的实际边界：
    // textTop 决定竖屏立绘是贴顶铺满还是在其上方居中，textLeft 决定桌面端可用带宽。
    // 文字位置不依赖立绘尺寸，所以不会形成循环。
    const contentEl = hero.querySelector<HTMLElement>('.hero__content');
    const cRect = contentEl?.getBoundingClientRect();
    const textTop = cRect ? cRect.top - rect.top : rect.height;
    const textLeft = cRect ? cRect.left - rect.left : rect.width;
    setPortraitBox(computePortraitBox({
      ratio,
      heroW: rect.width,
      heroH: rect.height,
      mobile: isMobile,
      naturalH: portraitNatural.h,
      textTop,
      textLeft,
    }));
  }, [portraitNatural, isMobile]);

  useLayoutEffect(() => {
    updatePortraitBox();
  }, [updatePortraitBox]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const ro = new ResizeObserver(() => updatePortraitBox());
    ro.observe(hero);
    return () => ro.disconnect();
  }, [updatePortraitBox]);

  // 切换角色时重新触发入场动画
  useEffect(() => {
    setIsVisible(false);
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, [character.id]);

  // 自动轮播
  useEffect(() => {
    if (characters.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % characters.length);
    }, autoRotateMs);
    return () => clearInterval(timer);
  }, [characters.length, autoRotateMs]);

  // birthday 格式是 "MM-DD"，转成 "MM.DD"
  const monthDay = character.birthday ? character.birthday.replace('-', '.') : '';

  // 立绘规则（用户要求）：
  // 1. Hero 宽 = 屏幕宽，高 ≤ 屏幕高；先定 hero 分辨率，再定文字区，最后按立绘比例放立绘
  // 2. 竖向立绘：高度 = hero 高度，居中在「hero 左边缘 ↔ 文字左边缘」之间
  // 3. 横向立绘：先按高度 = hero 高度计算；若宽度超出 hero 宽度，则改为宽度 = hero 宽度
  // 全部用 hero 实测 clientWidth/clientHeight 计算（100vw 含滚动条，会多算 15px）
  const portraitStyle: React.CSSProperties | undefined = portraitBox
    ? {
        position: 'absolute',
        left: portraitBox.left,
        top: portraitBox.top,
        width: portraitBox.width,
        height: portraitBox.height,
      }
    : undefined;

  return (
    <div className="hero" ref={heroRef} data-affiliation={affiliation.id} data-visible={isVisible}>
      {/* L0: 立绘模糊铺底（纯氛围；无图时留空，靠归属渐变兜底） */}
      {imageUrl && <div className="hero__bg-portrait" style={{ backgroundImage: `url(${imageUrl})` }} />}

      {/* L1: 归属色双色调 mesh */}
      <div className="hero__mesh" />

      {/* L2: 暗角（中心最暗） */}
      <div className="hero__vignette" />

      {/* L3: 胶片颗粒 */}
      <svg className="hero__grain" aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend mode="multiply" in="SourceGraphic" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" opacity="0.05" />
      </svg>

      {/* L4: 清晰立绘（视觉锚点，位置尺寸由 JS 按 hero 实测尺寸计算；无真实立绘时整层不渲染） */}
      {imageUrl && (
        <div className="hero__portrait">
          <img src={imageUrl} alt="" loading="eager" decoding="sync" style={portraitStyle} />
        </div>
      )}

      {/* L5: 文字层 */}
      <div className="hero__content">
        <div className="hero__affiliation-badge">{affiliation.name}</div>
        <h1 className="hero__name">{character.name}</h1>
        <p className="hero__tagline">{affiliation.tagline}</p>
        {monthDay && <div className="hero__date">{monthDay}</div>}
        {character.element && (
          <div className="hero__meta">
            <span className="hero__element">{character.element}</span>
            {character.weapon && <span className="hero__weapon">{character.weapon}</span>}
          </div>
        )}
      </div>

      {/* 轮播指示器（多个角色时显示） */}
      {characters.length > 1 && (
        <div className="hero__indicators">
          {characters.map((_, idx) => (
            <button
              key={idx}
              className="hero__indicator"
              data-active={idx === activeIndex}
              onClick={() => setActiveIndex(idx)}
              aria-label={`查看第 ${idx + 1} 个角色`}
            />
          ))}
        </div>
      )}

      {/* 向下滚动提示 */}
      <div
        className="hero__scroll-hint"
        onClick={() => {
          const heroHeight = document.querySelector('.hero')?.clientHeight || 0;
          window.scrollTo({ top: heroHeight, behavior: 'smooth' });
        }}
      >
        <span className="hero__scroll-hint-text">Scroll</span>
        <div className="hero__scroll-hint-icon" />
      </div>
    </div>
  );
}
