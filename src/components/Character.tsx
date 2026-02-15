import { CHARACTER_LEVEL_NAMES } from '../types';

type CharacterProps = {
  level: number;
  /** 差し替え用: レベルごとの画像パス。未指定時はプレースホルダー表示 */
  imageSrcByLevel?: Record<number, string>;
};

/** レベルごとのプレースホルダー色（後でイラストに差し替え可能） */
const PLACEHOLDER_COLORS: Record<number, string> = {
  1: 'from-amber-200 to-amber-300',
  2: 'from-amber-100 to-amber-200',
  3: 'from-stone-200 to-stone-300',
  4: 'from-slate-200 to-slate-300',
  5: 'from-green-200 to-green-300',
  6: 'from-emerald-200 to-emerald-300',
  7: 'from-pink-200 to-pink-300',
  8: 'from-cyan-200 to-cyan-300',
  9: 'from-yellow-200 to-yellow-300',
  10: 'from-amber-300 via-yellow-200 to-amber-200'
};

export default function Character({ level, imageSrcByLevel }: CharacterProps) {
  const clampedLevel = Math.min(10, Math.max(1, level));
  const name = CHARACTER_LEVEL_NAMES[clampedLevel] ?? 'ほろ酔い';
  const imageSrc = imageSrcByLevel?.[clampedLevel];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-24 h-24 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center ${
          imageSrc ? 'bg-gradient-to-br from-amber-100 to-amber-200' : `bg-gradient-to-br ${PLACEHOLDER_COLORS[clampedLevel] ?? PLACEHOLDER_COLORS[1]}`
        }`}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`Lv.${clampedLevel} ${name}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-5xl" aria-hidden>🐹</span>
        )}
      </div>
      <div className="text-center">
        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
          Lv.{clampedLevel}
        </span>
        <p className="text-sm font-medium text-gray-700 mt-1">{name}</p>
      </div>
    </div>
  );
}
