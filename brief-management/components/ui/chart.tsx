"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { localPoint } from "@visx/event"
import { Group } from "@visx/group"
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale"
import { Bar } from "@visx/shape"
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip"
import { Pie } from "@visx/shape"
import { GradientPinkBlue } from "@visx/gradient"
import { animated, useSpring } from "@react-spring/web"
import { curveCardinal, curveLinear, curveStep } from "@visx/curve"
import { LinePath } from "@visx/shape"
import { GridRows } from "@visx/grid"
import { scaleTime } from "@visx/scale"
import { extent } from "d3-array"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => config.theme || config.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center",
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]", {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          })}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center",
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config]
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle }

// Bar Chart
export function BarChart({ data, index, categories, colors = ["#3B82F6"], valueFormatter, className }) {
  const margin = { top: 20, right: 0, bottom: 40, left: 40 }
  const tooltipStyles = {
    ...defaultStyles,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    color: "white",
    border: "1px solid white",
    borderRadius: "4px",
  }

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  })

  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } = useTooltip()

  const getX = (d) => d[index]
  const getY = (d, category) => d[category]

  return (
    <div className={className} ref={containerRef}>
      <svg width="100%" height="100%" viewBox="0 0 500 300">
        <Group left={margin.left} top={margin.top}>
          <BarChartContent
            data={data}
            index={index}
            categories={categories}
            colors={colors}
            valueFormatter={valueFormatter}
            width={500 - margin.left - margin.right}
            height={300 - margin.top - margin.bottom}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            getX={getX}
            getY={getY}
          />
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div className="p-2">
            <strong>{tooltipData.x}</strong>
            <div>
              {tooltipData.category}: {valueFormatter ? valueFormatter(tooltipData.value) : tooltipData.value}
            </div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  )
}

function BarChartContent({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  width,
  height,
  showTooltip,
  hideTooltip,
  getX,
  getY,
}) {
  const xScale = React.useMemo(
    () =>
      scaleBand({
        range: [0, width],
        domain: data.map(getX),
        padding: 0.3,
      }),
    [data, width, getX],
  )

  const yScale = React.useMemo(() => {
    const maxValue = Math.max(...data.flatMap((d) => categories.map((c) => getY(d, c))))
    return scaleLinear({
      range: [height, 0],
      domain: [0, maxValue * 1.1], // Add 10% padding
      nice: true,
    })
  }, [data, height, categories, getY])

  const colorScale = React.useMemo(() => scaleOrdinal({ domain: categories, range: colors }), [categories, colors])

  return (
    <>
      <GridRows
        scale={yScale}
        width={width}
        height={height}
        stroke="#e0e0e0"
        strokeDasharray="2,2"
        strokeOpacity={0.5}
      />
      <AxisLeft
        scale={yScale}
        tickFormat={(value) => (valueFormatter ? valueFormatter(value) : value)}
        stroke="#888"
        tickStroke="#888"
        tickLabelProps={() => ({
          fill: "#888",
          fontSize: 10,
          textAnchor: "end",
          dy: "0.33em",
          dx: -4,
        })}
      />
      <AxisBottom
        top={height}
        scale={xScale}
        stroke="#888"
        tickStroke="#888"
        tickLabelProps={() => ({
          fill: "#888",
          fontSize: 10,
          textAnchor: "middle",
          dy: "0.33em",
        })}
      />
      {categories.map((category, i) => (
        <React.Fragment key={`bars-${category}`}>
          {data.map((d, j) => {
            const x = xScale(getX(d))
            const barWidth = xScale.bandwidth()
            const y = yScale(getY(d, category))
            const barHeight = height - y
            const color = colorScale(category)

            // Move useSpring outside the render logic
            const [barProps, setBarProps] = useSpring(() => ({
              from: { y: height, height: 0 },
              to: { y, height: barHeight },
              config: { tension: 300, friction: 20 },
            }))

            React.useEffect(() => {
              setBarProps({
                to: { y, height: barHeight },
                config: { tension: 300, friction: 20 },
              })
            }, [y, barHeight, setBarProps])

            return (
              <animated.g key={`bar-${category}-${j}`}>
                <Bar
                  x={x}
                  y={barProps.y}
                  width={barWidth}
                  height={barProps.height}
                  fill={color}
                  onMouseLeave={() => hideTooltip()}
                  onMouseMove={(event) => {
                    const point = localPoint(event)
                    showTooltip({
                      tooltipData: {
                        x: getX(d),
                        category,
                        value: getY(d, category),
                      },
                      tooltipTop: point.y,
                      tooltipLeft: point.x,
                    })
                  }}
                />
              </animated.g>
            )
          })}
        </React.Fragment>
      ))}
    </>
  )
}

// Line Chart
export function LineChart({
  data,
  index,
  categories,
  colors = ["#3B82F6"],
  valueFormatter,
  className,
  curve = "cardinal",
}) {
  const margin = { top: 20, right: 20, bottom: 40, left: 40 }
  const tooltipStyles = {
    ...defaultStyles,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    color: "white",
    border: "1px solid white",
    borderRadius: "4px",
  }

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  })

  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } = useTooltip()

  const getX = (d) => d[index]
  const getY = (d, category) => d[category]

  return (
    <div className={className} ref={containerRef}>
      <svg width="100%" height="100%" viewBox="0 0 500 300">
        <Group left={margin.left} top={margin.top}>
          <LineChartContent
            data={data}
            index={index}
            categories={categories}
            colors={colors}
            valueFormatter={valueFormatter}
            width={500 - margin.left - margin.right}
            height={300 - margin.top - margin.bottom}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            getX={getX}
            getY={getY}
            curve={curve}
          />
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div className="p-2">
            <strong>{tooltipData.x}</strong>
            {categories.map((category, i) => (
              <div key={`tooltip-${category}`} style={{ color: colors[i % colors.length] }}>
                {category}: {valueFormatter ? valueFormatter(tooltipData[category]) : tooltipData[category]}
              </div>
            ))}
          </div>
        </TooltipInPortal>
      )}
    </div>
  )
}

function LineChartContent({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  width,
  height,
  showTooltip,
  hideTooltip,
  getX,
  getY,
  curve,
}) {
  const xScale = React.useMemo(() => {
    if (typeof data[0][index] === "string") {
      return scaleBand({
        range: [0, width],
        domain: data.map(getX),
        padding: 0.3,
      })
    }
    return scaleTime({
      range: [0, width],
      domain: extent(data, getX),
    })
  }, [data, width, getX, index])

  const yScale = React.useMemo(() => {
    const maxValue = Math.max(...data.flatMap((d) => categories.map((c) => getY(d, c))))
    return scaleLinear({
      range: [height, 0],
      domain: [0, maxValue * 1.1], // Add 10% padding
      nice: true,
    })
  }, [data, height, categories, getY])

  const colorScale = React.useMemo(() => scaleOrdinal({ domain: categories, range: colors }), [categories, colors])

  const curveType = React.useMemo(() => {
    switch (curve) {
      case "linear":
        return curveLinear
      case "step":
        return curveStep
      case "cardinal":
      default:
        return curveCardinal
    }
  }, [curve])

  return (
    <>
      <GridRows
        scale={yScale}
        width={width}
        height={height}
        stroke="#e0e0e0"
        strokeDasharray="2,2"
        strokeOpacity={0.5}
      />
      <AxisLeft
        scale={yScale}
        tickFormat={(value) => (valueFormatter ? valueFormatter(value) : value)}
        stroke="#888"
        tickStroke="#888"
        tickLabelProps={() => ({
          fill: "#888",
          fontSize: 10,
          textAnchor: "end",
          dy: "0.33em",
          dx: -4,
        })}
      />
      <AxisBottom
        top={height}
        scale={xScale}
        stroke="#888"
        tickStroke="#888"
        tickLabelProps={() => ({
          fill: "#888",
          fontSize: 10,
          textAnchor: "middle",
          dy: "0.33em",
        })}
      />
      <rect
        width={width}
        height={height}
        fill="transparent"
        onMouseLeave={() => hideTooltip()}
        onMouseMove={(event) => {
          const point = localPoint(event)
          const x = xScale.invert ? xScale.invert(point.x) : null
          if (!x) return

          // Find the closest data point
          let closestPoint = data[0]
          let minDistance = Number.POSITIVE_INFINITY

          data.forEach((d) => {
            const dx = getX(d)
            const distance = Math.abs(dx - x)
            if (distance < minDistance) {
              minDistance = distance
              closestPoint = d
            }
          })

          const tooltipData = {
            x: getX(closestPoint),
            ...categories.reduce((acc, category) => {
              acc[category] = getY(closestPoint, category)
              return acc
            }, {}),
          }

          showTooltip({
            tooltipData,
            tooltipTop: point.y,
            tooltipLeft: point.x,
          })
        }}
      />
      {categories.map((category, i) => {
        const color = colorScale(category)
        const lineData = data.map((d) => ({
          x: xScale(getX(d)) + (xScale.bandwidth ? xScale.bandwidth() / 2 : 0),
          y: yScale(getY(d, category)),
        }))

        return (
          <LinePath
            key={`line-${category}`}
            data={lineData}
            x={(d) => d.x}
            y={(d) => d.y}
            stroke={color}
            strokeWidth={3}
            curve={curveType}
          />
        )
      })}
    </>
  )
}

// Pie Chart
export function PieChart({
  data,
  index,
  categories,
  colors = ["#3B82F6", "#F97316", "#8B5CF6", "#10B981"],
  valueFormatter,
  className,
}) {
  const margin = { top: 20, right: 20, bottom: 20, left: 20 }
  const tooltipStyles = {
    ...defaultStyles,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    color: "white",
    border: "1px solid white",
    borderRadius: "4px",
  }

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  })

  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } = useTooltip()

  return (
    <div className={className} ref={containerRef}>
      <svg width="100%" height="100%" viewBox="0 0 500 300">
        <Group top={150} left={250}>
          <PieChartContent
            data={data}
            index={index}
            categories={categories}
            colors={colors}
            valueFormatter={valueFormatter}
            width={500 - margin.left - margin.right}
            height={300 - margin.top - margin.bottom}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
          />
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div className="p-2">
            <strong>{tooltipData.name}</strong>
            <div>{valueFormatter ? valueFormatter(tooltipData.value) : tooltipData.value}</div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  )
}

function PieChartContent({ data, index, categories, colors, valueFormatter, width, height, showTooltip, hideTooltip }) {
  const category = categories[0]
  const radius = Math.min(width, height) / 2
  const innerRadius = radius * 0.6

  const colorScale = React.useMemo(
    () => scaleOrdinal({ domain: data.map((d) => d[index]), range: colors }),
    [data, index, colors],
  )

  const pieData = React.useMemo(() => {
    return data.map((d) => ({
      name: d[index],
      value: d[category],
    }))
  }, [data, index, category])

  return (
    <>
      <GradientPinkBlue id="pie-gradient" />
      <Pie
        data={pieData}
        pieValue={(d) => d.value}
        outerRadius={radius}
        innerRadius={innerRadius}
        cornerRadius={3}
        padAngle={0.005}
      >
        {(pie) => {
          return pie.arcs.map((arc, i) => {
            const [centroidX, centroidY] = pie.path.centroid(arc)
            const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1
            const arcPath = pie.path(arc)
            const arcFill = colorScale(arc.data.name)

            return (
              <g key={`arc-${i}`}>
                <path
                  d={arcPath}
                  fill={arcFill}
                  onMouseLeave={() => hideTooltip()}
                  onMouseMove={(event) => {
                    const point = localPoint(event)
                    showTooltip({
                      tooltipData: arc.data,
                      tooltipTop: point.y,
                      tooltipLeft: point.x,
                    })
                  }}
                />
                {hasSpaceForLabel && (
                  <text
                    x={centroidX}
                    y={centroidY}
                    dy=".33em"
                    fill="#ffffff"
                    fontSize={10}
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {arc.data.name}
                  </text>
                )}
              </g>
            )
          })
        }}
      </Pie>
    </>
  )
}
