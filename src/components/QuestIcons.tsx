import React from 'react';
import { MarkerIconType, QuestPlace } from '../data/italyPlaces';

interface QuestCategoryIconProps {
  type: MarkerIconType;
  className?: string;
}

/**
 * Custom cartographic SVG icons by category:
 * - temple (museum): Columned classical temple
 * - dome (church): Renaissance dome with lantern
 * - cypress (park / garden / viewpoint): Tuscan cypress tree
 * - canvas (exhibition / library): Framed canvas on easel
 * - train (station): Vintage locomotive train
 * - obelisk (square / monument / fountain): Roman obelisk on pedestal
 * - lodging (home base): Glowing house / flag banner
 */
export const QuestCategoryIcon: React.FC<QuestCategoryIconProps> = ({ type, className = 'w-5 h-5' }) => {
  switch (type) {
    case 'temple':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 9.5L12 4l9 5.5" />
          <path d="M4 9.5h16" />
          <path d="M6 9.5v8.5" />
          <path d="M10 9.5v8.5" />
          <path d="M14 9.5v8.5" />
          <path d="M18 9.5v8.5" />
          <path d="M3 18h18" />
          <path d="M2 20.5h20" />
        </svg>
      );
    case 'dome':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 2.5v3" />
          <path d="M10.5 4h3" />
          <path d="M10 8V5.5h4V8" />
          <path d="M5 16c0-4.5 3.1-8 7-8s7 3.5 7 8" />
          <path d="M4 16h16v4.5H4z" />
          <path d="M9 20.5v-2.5M15 20.5v-2.5" />
        </svg>
      );
    case 'cypress':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 2.5C9.2 6.5 8 11 8.5 15.5c.3 2.2 1.8 3 3.5 3s3.2-.8 3.5-3C16 11 14.8 6.5 12 2.5z" />
          <path d="M12 18.5V22" />
          <path d="M8.5 22h7" />
          <path d="M10.5 10.5l1.5 1.5 1.5-1.5" />
          <path d="M10.2 14l1.8 1.5 1.8-1.5" />
        </svg>
      );
    case 'canvas':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3.5" y="4.5" width="17" height="13" rx="1.5" />
          <rect x="6" y="7" width="12" height="8" rx="0.5" />
          <circle cx="9.5" cy="9.8" r="1" fill="currentColor" />
          <path d="M7 14l3.2-2.8 2.4 2 2.4-2.2 2 3" />
          <path d="M8 17.5L6.5 21M16 17.5L17.5 21M12 17.5V21" />
        </svg>
      );
    case 'train':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="5" y="3.5" width="14" height="14" rx="2.5" />
          <path d="M5 9.5h14" />
          <path d="M9 6.5h6" />
          <circle cx="8.5" cy="14" r="1.2" fill="currentColor" />
          <circle cx="15.5" cy="14" r="1.2" fill="currentColor" />
          <path d="M8 17.5L6 21M16 17.5L18 21" />
          <path d="M7 19.5h10" />
        </svg>
      );
    case 'obelisk':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 2.5L9.5 6.5l-1 11h7l-1-11L12 2.5z" />
          <path d="M9.5 6.5h5" />
          <path d="M7 17.5h10v2.5H7z" />
          <path d="M5.5 20h13v1.5h-13z" />
        </svg>
      );
    case 'lodging':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 11.5L12 4l9 7.5" />
          <path d="M5.5 10v10h13V10" />
          <path d="M10 20v-5.5h4V20" />
          <path d="M12 4V1.5l3.5 1.2L12 4" fill="currentColor" />
        </svg>
      );
  }
};

export const categoryLabelMap: Record<MarkerIconType, string> = {
  temple: 'Classical Temple · Museum',
  dome: 'Cupola · Church',
  cypress: 'Cypress · Park & Viewpoint',
  canvas: 'Framed Canvas · Exhibition & Library',
  train: 'Ferrovia · Station & Transit',
  obelisk: 'Obelisk · Piazza & Monument',
  lodging: 'Home Base · Lodging Sanctuary',
};

export const PassportStampEmblem: React.FC<{
  city: string;
  dateLabel: string;
  name: string;
  className?: string;
}> = ({ city, dateLabel, name, className = 'w-28 h-28' }) => {
  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center rounded-full border-2 border-dashed border-[#5A1A24] bg-[#F6F1E7]/95 text-[#5A1A24] p-2 shadow-inner select-none ${className}`}
    >
      <div className="absolute inset-1 rounded-full border border-[#5A1A24]/40 pointer-events-none" />
      <span className="text-[8px] font-mono uppercase tracking-[0.18em] text-[#5A1A24]/80">
        {city.toUpperCase()}
      </span>
      <span className="font-serif font-bold text-xs leading-tight text-center line-clamp-2 px-1 my-0.5">
        {name.split('(')[0].trim()}
      </span>
      <span className="text-[9px] font-mono font-semibold tracking-wider text-[#846024] border-t border-[#5A1A24]/30 pt-0.5">
        ✓ {dateLabel}
      </span>
    </div>
  );
};

/**
 * Woodcut / Engraved Ink Illustration Scene for the Illuminated Passaporto Gallery.
 * Renders a detailed architectural or landscape engraving tailored to the quest's landmark or archetype.
 */
export const EngravedMonumentIllustration: React.FC<{
  place: QuestPlace;
  className?: string;
}> = ({ place, className = 'w-full h-28' }) => {
  // Special landmark-specific woodcut scenes for signature monuments
  if (place.isBoss || place.id === 'rome-galleria-borghese') {
    // Galleria Borghese Boss Crest: Baroque Casino Nobile facade with twin balustrades, Apollo & Daphne laurel wreath, and radiant sunburst
    return (
      <svg viewBox="0 0 160 110" fill="none" stroke="currentColor" className={className}>
        {/* Sunburst rays */}
        <g strokeWidth="0.8" strokeDasharray="2 2" opacity="0.55">
          <line x1="80" y1="10" x2="80" y2="2" />
          <line x1="60" y1="14" x2="48" y2="5" />
          <line x1="100" y1="14" x2="112" y2="5" />
          <line x1="42" y1="26" x2="26" y2="18" />
          <line x1="118" y1="26" x2="134" y2="18" />
        </g>
        {/* Star & Laurel Crown */}
        <path d="M80 12l2.2 4.5 5 .7-3.6 3.5.9 4.9-4.5-2.4-4.5 2.4.9-4.9-3.6-3.5 5-.7L80 12z" fill="currentColor" stroke="none" />
        {/* Twin Baroque Towers & Central Loggia of Villa Borghese */}
        <rect x="28" y="34" width="24" height="54" strokeWidth="1.6" />
        <rect x="108" y="34" width="24" height="54" strokeWidth="1.6" />
        <path d="M25 34h30l-4-6H29l-4 6zM105 34h30l-4-6h-22l-4 6z" strokeWidth="1.3" />
        {/* Central Portico & Balustrade */}
        <rect x="52" y="46" width="56" height="42" strokeWidth="1.6" />
        <line x1="52" y1="42" x2="108" y2="42" strokeWidth="1.2" />
        {/* Arched Loggia Bays */}
        <path d="M58 88V64a6 6 0 0 1 12 0v24" strokeWidth="1.4" />
        <path d="M74 88V62a6 6 0 0 1 12 0v26" strokeWidth="1.5" />
        <path d="M90 88V64a6 6 0 0 1 12 0v24" strokeWidth="1.4" />
        {/* Windows & Pediments */}
        <rect x="36" y="44" width="8" height="12" strokeWidth="1.2" />
        <rect x="116" y="44" width="8" height="12" strokeWidth="1.2" />
        <rect x="36" y="64" width="8" height="12" strokeWidth="1.2" />
        <rect x="116" y="64" width="8" height="12" strokeWidth="1.2" />
        {/* Double Staircase Base */}
        <path d="M18 88h124M14 93h132M22 98h116" strokeWidth="1.4" />
      </svg>
    );
  }

  if (place.id === 'florence-colosso-appennino') {
    // Giambologna's Colosso dell'Appennino crouching over the grotto pond
    return (
      <svg viewBox="0 0 160 110" fill="none" stroke="currentColor" className={className}>
        {/* Mountain crags & stalactite beard */}
        <path d="M38 82L54 34l14-14 14-4 16 10 12 24 12 32" strokeWidth="1.7" />
        <path d="M68 20c-4 8-3 16 2 22s12 6 16-2" strokeWidth="1.4" />
        <path d="M72 36v26M78 38v28M84 36v24" strokeWidth="1.2" strokeDasharray="3 2" />
        {/* Crouching shoulders & bent knee */}
        <path d="M52 52c8-6 18-6 26 2l14 28" strokeWidth="1.5" />
        <path d="M92 50c10 4 16 14 16 32" strokeWidth="1.5" />
        {/* Grotto arch & reflection waves */}
        <path d="M62 82a18 14 0 0 1 36 0" strokeWidth="1.4" />
        <line x1="20" y1="82" x2="140" y2="82" strokeWidth="1.6" />
        <path d="M30 89c12-3 24 3 36 0s24-3 36 0 24 3 28 0" strokeWidth="1.2" />
        <path d="M40 96c12-2 24 2 36 0s24-2 44 0" strokeWidth="1" opacity="0.7" />
      </svg>
    );
  }

  if (place.id === 'rome-pantheon') {
    // Pantheon Rotunda, Coffered Dome & Octastyle Portico
    return (
      <svg viewBox="0 0 160 110" fill="none" stroke="currentColor" className={className}>
        {/* Stepped Saucer Dome & Oculus ring */}
        <path d="M30 50c6-22 26-34 50-34s44 12 50 34" strokeWidth="1.6" />
        <line x1="68" y1="16" x2="92" y2="16" strokeWidth="2" />
        {/* Rotunda drum */}
        <rect x="26" y="50" width="108" height="38" strokeWidth="1.4" />
        {/* Triangular Pediment */}
        <polygon points="36,54 80,32 124,54" fill="currentColor" fillOpacity="0.08" strokeWidth="1.7" />
        <polygon points="44,51 80,36 116,51" strokeWidth="1" />
        {/* 8 Corinthian Columns */}
        {[42, 53, 64, 75, 85, 96, 107, 118].map((x) => (
          <line key={x} x1={x} y1="54" x2={x} y2="88" strokeWidth="1.8" />
        ))}
        <line x1="20" y1="88" x2="140" y2="88" strokeWidth="1.6" />
        <line x1="16" y1="93" x2="144" y2="93" strokeWidth="1.2" />
      </svg>
    );
  }

  // Category-based engraved woodcut plates
  switch (place.iconType) {
    case 'temple':
      return (
        <svg viewBox="0 0 160 110" fill="none" stroke="currentColor" className={className}>
          {/* Classical Museum Facade with Pediment & Fluted Columns */}
          <polygon points="28,42 80,16 132,42" strokeWidth="1.7" />
          <polygon points="40,39 80,21 120,39" strokeWidth="1" opacity="0.65" />
          <circle cx="80" cy="31" r="4.5" strokeWidth="1.2" />
          <rect x="32" y="42" width="96" height="5" strokeWidth="1.3" />
          {[38, 54, 70, 90, 106, 122].map((x) => (
            <g key={x}>
              <rect x={x - 3} y="47" width="6" height="39" strokeWidth="1.4" />
              <line x1={x} y1="49" x2={x} y2="84" strokeWidth="0.7" opacity="0.5" />
            </g>
          ))}
          <path d="M73 86V64a7 7 0 0 1 14 0v22" strokeWidth="1.3" />
          <line x1="24" y1="86" x2="136" y2="86" strokeWidth="1.6" />
          <line x1="18" y1="91" x2="142" y2="91" strokeWidth="1.4" />
          <line x1="14" y1="96" x2="146" y2="96" strokeWidth="1" />
        </svg>
      );

    case 'dome':
      return (
        <svg viewBox="0 0 160 110" fill="none" stroke="currentColor" className={className}>
          {/* Renaissance Basilica Cupola, Lantern & Geometric Facade */}
          <line x1="80" y1="8" x2="80" y2="16" strokeWidth="1.5" />
          <line x1="76" y1="11" x2="84" y2="11" strokeWidth="1.4" />
          <rect x="75" y="16" width="10" height="9" strokeWidth="1.3" />
          {/* Ribbed Octagonal Dome */}
          <path d="M46 56c0-20 15-31 34-31s34 11 34 31" strokeWidth="1.7" />
          <path d="M62 56c0-18 8-31 18-31s18 13 18 31" strokeWidth="1.1" opacity="0.75" />
          <line x1="80" y1="25" x2="80" y2="56" strokeWidth="1" opacity="0.65" />
          {/* Drum & Alberti Scrolls */}
          <rect x="42" y="56" width="76" height="32" strokeWidth="1.5" />
          <circle cx="80" cy="44" r="5" strokeWidth="1.2" />
          <path d="M30 88c0-10 6-16 12-16M130 88c0-10-6-16-12-16" strokeWidth="1.4" />
          <path d="M72 88V69a8 8 0 0 1 16 0v19" strokeWidth="1.5" />
          <path d="M52 88V73a5 5 0 0 1 10 0v15M98 88V73a5 5 0 0 1 10 0v15" strokeWidth="1.2" />
          <line x1="22" y1="88" x2="138" y2="88" strokeWidth="1.6" />
          <line x1="18" y1="93" x2="142" y2="93" strokeWidth="1.1" />
        </svg>
      );

    case 'cypress':
      return (
        <svg viewBox="0 0 160 110" fill="none" stroke="currentColor" className={className}>
          {/* Tuscan Cypresses, Villa Balustrade & Rolling Hills */}
          <path d="M16 78c22-10 46-8 66 2s40 8 62-4" strokeWidth="1.3" />
          <path d="M16 86c28-6 54-4 80 2s32 2 48-2" strokeWidth="1.2" opacity="0.75" />
          {/* Three Cypress Trees */}
          {[48, 80, 112].map((cx, idx) => {
            const topY = idx === 1 ? 14 : 22;
            return (
              <g key={cx}>
                <path
                  d={`M${cx} ${topY} C${cx - 9} ${topY + 18} ${cx - 10} 54 ${cx - 6} 66 c1.5 4 4 5 6 5s4.5-1 6-5c4-12 3-30-6-52z`}
                  strokeWidth="1.6"
                  fill="currentColor"
                  fillOpacity="0.07"
                />
                <line x1={cx} y1="71" x2={cx} y2="84" strokeWidth="1.8" />
                <path d={`M${cx - 4} 42l4 4 4-4M${cx - 5} 54l5 4 5-4`} strokeWidth="1" opacity="0.65" />
              </g>
            );
          })}
          <line x1="20" y1="90" x2="140" y2="90" strokeWidth="1.5" />
        </svg>
      );

    case 'canvas':
      return (
        <svg viewBox="0 0 160 110" fill="none" stroke="currentColor" className={className}>
          {/* Ornate Renaissance Exhibition Frame & Classical Portrait Motif */}
          <rect x="34" y="18" width="92" height="66" rx="3" strokeWidth="1.8" />
          <rect x="41" y="25" width="78" height="52" strokeWidth="1.2" />
          {/* Corner Rosettes */}
          <circle cx="38" cy="22" r="2" fill="currentColor" />
          <circle cx="122" cy="22" r="2" fill="currentColor" />
          <circle cx="38" cy="80" r="2" fill="currentColor" />
          <circle cx="122" cy="80" r="2" fill="currentColor" />
          {/* Perspective Arch & Sun inside Canvas */}
          <circle cx="64" cy="40" r="6" strokeWidth="1.3" />
          <path d="M44 74l22-20 16 14 16-18 18 24" strokeWidth="1.5" />
          <line x1="56" y1="84" x2="48" y2="96" strokeWidth="1.6" />
          <line x1="104" y1="84" x2="112" y2="96" strokeWidth="1.6" />
          <line x1="80" y1="84" x2="80" y2="96" strokeWidth="1.6" />
        </svg>
      );

    case 'train':
      return (
        <svg viewBox="0 0 160 110" fill="none" stroke="currentColor" className={className}>
          {/* Grand Tour Station Arch & Express Locomotive */}
          <path d="M22 86V48c0-18 26-30 58-30s58 12 58 30v38" strokeWidth="1.4" strokeDasharray="4 2" opacity="0.6" />
          <rect x="52" y="28" width="56" height="48" rx="6" strokeWidth="1.7" />
          <line x1="52" y1="48" x2="108" y2="48" strokeWidth="1.4" />
          <rect x="60" y="34" width="16" height="10" rx="1" strokeWidth="1.2" />
          <rect x="84" y="34" width="16" height="10" rx="1" strokeWidth="1.2" />
          <circle cx="66" cy="64" r="4.5" strokeWidth="1.5" />
          <circle cx="94" cy="64" r="4.5" strokeWidth="1.5" />
          <line x1="60" y1="76" x2="46" y2="94" strokeWidth="1.7" />
          <line x1="100" y1="76" x2="114" y2="94" strokeWidth="1.7" />
          <line x1="52" y1="84" x2="108" y2="84" strokeWidth="1.3" />
          <line x1="47" y1="90" x2="113" y2="90" strokeWidth="1.3" />
        </svg>
      );

    case 'lodging':
      return (
        <svg viewBox="0 0 160 110" fill="none" stroke="currentColor" className={className}>
          {/* Palazzo Sanctuary with Heraldic Pennant Flag & Rusticated Arch */}
          <line x1="80" y1="10" x2="80" y2="28" strokeWidth="1.6" />
          <path d="M80 10l20 5-20 6" fill="currentColor" fillOpacity="0.2" strokeWidth="1.4" />
          <polygon points="34,42 80,24 126,42" strokeWidth="1.7" />
          <rect x="40" y="42" width="80" height="46" strokeWidth="1.6" />
          {/* Palazzo Windows */}
          {[52, 76, 100].map((x) => (
            <rect key={x} x={x} y="50" width="8" height="12" rx="4" strokeWidth="1.3" />
          ))}
          {/* Rusticated Entrance Portal */}
          <path d="M72 88V71a8 8 0 0 1 16 0v17" strokeWidth="1.6" />
          <line x1="24" y1="88" x2="136" y2="88" strokeWidth="1.6" />
          <line x1="30" y1="93" x2="130" y2="93" strokeWidth="1.2" />
        </svg>
      );

    case 'obelisk':
    default:
      return (
        <svg viewBox="0 0 160 110" fill="none" stroke="currentColor" className={className}>
          {/* Piazza Obelisk with Fountain Basin & Twin Arcade */}
          <polygon points="80,12 73,24 70,66 90,66 87,24" strokeWidth="1.7" fill="currentColor" fillOpacity="0.06" />
          <line x1="73" y1="24" x2="87" y2="24" strokeWidth="1.3" />
          {/* Hieroglyph-inspired hash marks on shaft */}
          <line x1="80" y1="30" x2="80" y2="60" strokeWidth="1" strokeDasharray="3 3" />
          {/* Pedestal & Fountain Lions/Basin */}
          <rect x="64" y="66" width="32" height="14" strokeWidth="1.6" />
          <path d="M42 80h76l-6 8H48l-6-8z" strokeWidth="1.5" />
          {/* Water arcs */}
          <path d="M64 72c-10-4-16 2-18 8M96 72c10-4 16 2 18 8" strokeWidth="1.2" />
          <line x1="22" y1="88" x2="138" y2="88" strokeWidth="1.6" />
          <line x1="30" y1="93" x2="130" y2="93" strokeWidth="1.2" />
        </svg>
      );
  }
};

/**
 * Decorative Illuminated Stamp Plate for the Passaporto Gallery.
 * Supports both collected (richly inked burgundy/gold woodcut with postmark cancellation waves)
 * and uncollected (faint blind-embossed parchment impression) states.
 */
export const IlluminatedStampPlate: React.FC<{
  place: QuestPlace;
  isVisited: boolean;
  stampDate?: string;
  onClick: () => void;
}> = ({ place, isVisited, stampDate, onClick }) => {
  // Deterministic slight organic stamp angle (-1.8deg to +1.8deg) based on orderIndex
  const angles = [-1.4, 1.1, -0.8, 1.5, -1.1, 0.9, -1.6, 1.2];
  const tilt = isVisited ? angles[place.orderIndex % angles.length] : 0;

  const isGoldInk = place.isBoss || place.isLodging;
  const inkBorder = isVisited
    ? isGoldInk
      ? 'border-[#846024]'
      : 'border-[#5A1A24]'
    : 'border-[#D5C7AD] border-dashed';

  const inkText = isVisited
    ? isGoldInk
      ? 'text-[#704E18]'
      : 'text-[#5A1A24]'
    : 'text-[#B8A483]';

  const cleanTitle = place.name.split('(')[0].trim();
  const subtitle = place.name.includes('(')
    ? place.name.slice(place.name.indexOf('(') + 1, place.name.lastIndexOf(')'))
    : place.category;

  return (
    <button
      onClick={onClick}
      style={{ transform: `rotate(${tilt}deg)` }}
      className={`group relative w-full text-left rounded-xl p-3 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
        isVisited
          ? 'bg-[#FBF8F3] border-2 shadow-md hover:shadow-xl hover:scale-[1.02]'
          : 'bg-[#F6F1E7]/55 border hover:bg-[#FBF8F3]/80 hover:border-[#B8A483]'
      } ${inkBorder}`}
      title={
        isVisited
          ? `${place.name} · Stamped (${stampDate || place.date}) — Click to fly to location`
          : `${place.name} · Unvisited (${place.date}) — Click to inspect quest`
      }
    >
      {/* Inner Ornamental Hairline Frame */}
      <div
        className={`pointer-events-none absolute inset-1.5 rounded-lg border ${
          isVisited
            ? isGoldInk
              ? 'border-[#C89D54]/60'
              : 'border-[#5A1A24]/30'
            : 'border-[#D5C7AD]/40'
        }`}
      />

      {/* Corner Foliate Dots */}
      {isVisited && (
        <>
          <span className="pointer-events-none absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-current opacity-40" />
          <span className="pointer-events-none absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-current opacity-40" />
          <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-current opacity-40" />
          <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-current opacity-40" />
        </>
      )}

      {/* Top Folio Header: Roman/Number Index & City Postmark */}
      <div className={`relative z-10 flex items-center justify-between gap-1 px-1 text-[10px] font-mono ${inkText}`}>
        <span className="font-bold tracking-wider uppercase">
          № {String(place.orderIndex).padStart(2, '0')} · {place.city}
        </span>
        <span className="tabular-nums opacity-80">
          {isVisited ? `✓ ${stampDate || 'MMXXVI'}` : 'UNSTAMPED'}
        </span>
      </div>

      {/* Central Engraved Woodcut Illustration */}
      <div
        className={`relative z-10 my-1.5 flex items-center justify-center rounded-lg py-1 transition-opacity ${inkText} ${
          isVisited ? 'opacity-95 bg-[#EFE7D6]/45' : 'opacity-35 grayscale'
        }`}
      >
        <EngravedMonumentIllustration place={place} className="w-full h-24 sm:h-28" />

        {/* Circular Ink Postmark Seal Overlay on Stamped Plates */}
        {isVisited && (
          <div
            className={`pointer-events-none absolute -right-1 -bottom-1 px-2 py-0.5 rounded-full border border-dashed text-[8px] font-mono font-bold uppercase tracking-widest rotate-[-10deg] shadow-2xs ${
              place.isBoss
                ? 'bg-[#5A1A24] text-[#EBD197] border-[#C89D54]'
                : 'bg-[#F6F1E7]/95 text-[#5A1A24] border-[#5A1A24]'
            }`}
          >
            {place.isBoss ? '★ BOSS CONQUERED' : 'VISTO · ITALIA'}
          </div>
        )}
      </div>

      {/* Bottom Illuminated Caption & Postmark Waves */}
      <div className="relative z-10 px-1 pt-1 border-t border-current/15">
        <div
          className={`font-serif font-bold text-sm leading-tight line-clamp-1 ${
            isVisited ? 'text-[#5A1A24]' : 'text-[#6E5A4F]'
          }`}
        >
          {cleanTitle}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5 text-[10px] text-[#6E5A4F]">
          <span className="truncate italic font-serif">{subtitle}</span>
          <span className="font-mono text-[9px] shrink-0 tabular-nums">{place.date.split(';')[0]}</span>
        </div>
      </div>
    </button>
  );
};
