import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

// Colors
const colors = {
  blue: ["#3b82f6", "#dbeafe"],
  green: ["#22c55e", "#dcfce7"],
  violet: ["#8b5cf6", "#ede9fe"],
  red: ["#ef4444", "#fee2e2"],
  amber: ["#f59e0b", "#fef3c7"],
  pink: ["#ec4899", "#fce7f3"],
  emerald: ["#10b981", "#d1fae5"],
  indigo: ["#6366f1", "#e0e7ff"],
  rose: ["#f43f5e", "#ffe4e6"],
  slate: ["#64748b", "#f1f5f9"],
};

type ColorKey = keyof typeof colors;

/**
 * BarChart Component
 */
type BarChartProps = {
  data: any[];
  index: string;
  categories: string[];
  colors?: ColorKey[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
  showLegend?: boolean;
  showYAxis?: boolean;
  showXAxis?: boolean;
  showTooltip?: boolean;
  className?: string;
};

export const BarChart = ({
  data,
  index,
  categories,
  colors: colorKeys = ["blue", "violet"],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 60,
  showLegend = true,
  showYAxis = true,
  showXAxis = true,
  showTooltip = true,
  className,
}: BarChartProps) => {
  const colorPalette = colorKeys.map((key) => colors[key][0]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-white p-2 shadow-md">
          <p className="font-medium text-gray-700">{label}</p>
          <div className="mt-1">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-${index}`} className="flex items-center">
                <div
                  className="mr-2 h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <p className="text-sm">
                  {entry.name}: {valueFormatter(entry.value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={350}>
        <RechartsBarChart data={data} barGap={8}>
          {showXAxis && (
            <XAxis
              dataKey={index}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              fontSize={12}
              minTickGap={8}
            />
          )}
          {showYAxis && (
            <YAxis
              width={yAxisWidth}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => valueFormatter(value)}
              fontSize={12}
              tickMargin={8}
            />
          )}
          {showTooltip && <Tooltip content={<CustomTooltip />} cursor={false} />}
          {showLegend && (
            <Legend
              verticalAlign="top"
              height={40}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          )}
          {categories.map((category, i) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colorPalette[i % colorPalette.length]}
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * BarList Component
 */
type BarListProps = {
  data: {
    name: string;
    value: number;
  }[];
  valueFormatter?: (value: number) => string;
  className?: string;
};

export const BarList = ({
  data,
  valueFormatter = (value: number) => value.toString(),
  className,
}: BarListProps) => {
  // Sort data by value (descending)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  // Calculate the max value for percentage calculation
  const maxValue = useMemo(() => {
    return Math.max(...data.map((item) => item.value), 1);
  }, [data]);

  return (
    <div className={cn("space-y-3", className)}>
      {sortedData.map((item, index) => (
        <div key={`${item.name}-${index}`} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">{item.name}</p>
            <p className="font-medium">{valueFormatter(item.value)}</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * PieChart Component
 */
type PieChartProps = {
  data: any[];
  index: string;
  category: string;
  valueFormatter?: (value: number) => string;
  showLabel?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
};

export const PieChart = ({
  data,
  index,
  category,
  valueFormatter = (value: number) => value.toString(),
  showLabel = false,
  showTooltip = true,
  showLegend = true,
  className,
}: PieChartProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Generate colors for pie slices
  const colorPalette = Object.values(colors).map((color) => color[0]);

  // Calculate total value
  const total = useMemo(() => {
    return data.reduce((sum, entry) => sum + entry[category], 0);
  }, [data, category]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentValue = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="rounded-lg border bg-white p-2 shadow-md">
          <div className="flex items-center">
            <div
              className="mr-2 h-3 w-3 rounded-full"
              style={{ backgroundColor: item.payload.fill }}
            />
            <p className="font-medium">{item.name}</p>
          </div>
          <div className="mt-1">
            <p className="text-sm">
              {valueFormatter(item.value)} ({percentValue}%)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom active shape for the pie sector
  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      name,
      value,
    } = props;

    const percentValue = ((value / total) * 100).toFixed(1);

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        {showLabel && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-sm font-medium fill-gray-900"
          >
            <tspan x={cx} y={cy - 10}>
              {name}
            </tspan>
            <tspan x={cx} y={cy + 10}>
              {percentValue}%
            </tspan>
          </text>
        )}
      </g>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={category}
            nameKey={index}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onClick={(_, index) => setActiveIndex(index)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colorPalette[index % colorPalette.length]}
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value, entry: any, index) => (
                <span
                  className={cn(
                    "inline-flex items-center text-sm",
                    activeIndex === index ? "font-medium" : "text-gray-600"
                  )}
                  onClick={() => setActiveIndex(index)}
                >
                  <div
                    className="mr-2 h-3 w-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {value}
                </span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
