import { useEffect, useState } from "react";

type Custom3DBarProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  index: number;
  name?: string;
};

export function Custom3DBar(props: Custom3DBarProps) {
  const { x, y, width, height, fill, index } = props;
  const depth = 8;
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const animatedHeight = isAnimated ? height : 0;
  const animatedY = isAnimated ? y : y + height;

  const getBaseColor = (fillValue: string) => {
    if (fillValue.includes("Commits")) return "#10b981";
    if (fillValue.includes("PRs")) return "#3b82f6";
    if (fillValue.includes("Reviews")) return "#8b5cf6";
    return "#10b981";
  };

  const baseColor = fill.includes("url") ? getBaseColor(props.name ?? "") : fill;

  const darkerShade = (color: string, amount: number) => {
    const hex = color.replace("#", "");
    const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - amount);
    const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - amount);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <g
      style={{
        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: isAnimated ? "translateY(0)" : "translateY(20px)",
        opacity: isAnimated ? 1 : 0,
      }}
    >
      <path
        d={`
          M ${x + width} ${animatedY}
          L ${x + width + depth} ${animatedY - depth}
          L ${x + width + depth} ${animatedY + animatedHeight - depth}
          L ${x + width} ${animatedY + animatedHeight}
          Z
        `}
        fill={darkerShade(baseColor, 40)}
        style={{
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
      <path
        d={`
          M ${x} ${animatedY}
          L ${x + depth} ${animatedY - depth}
          L ${x + width + depth} ${animatedY - depth}
          L ${x + width} ${animatedY}
          Z
        `}
        fill={darkerShade(baseColor, 20)}
        style={{
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
      <rect
        x={x}
        y={animatedY}
        width={width}
        height={animatedHeight}
        fill={`url(#${fill.replace("url(#", "").replace(")", "")})`}
        rx={4}
        ry={4}
        style={{
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
        }}
      />
      <rect
        x={x + 2}
        y={animatedY + 2}
        width={width - 4}
        height={Math.min(animatedHeight * 0.3, 20)}
        fill="rgba(255, 255, 255, 0.2)"
        rx={3}
        ry={3}
        style={{
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
    </g>
  );
}
