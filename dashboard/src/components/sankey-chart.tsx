"use client";

interface FlowNode {
  name: string;
  revenue: number;
  spending: number;
  profitLoss: number;
}

interface FlowLink {
  from: string;
  to: string;
  value: number;
}

function AgentNode({ node }: { node: FlowNode }) {
  const isProfit = node.profitLoss >= 0;
  return (
    <div className="relative flex flex-col items-center gap-1.5 animate-fade-up">
      <div
        className={`
          relative px-4 py-3 rounded-xl border backdrop-blur-sm
          ${isProfit
            ? "border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.15)]"
            : "border-red-500/30 bg-red-500/10 shadow-[0_0_24px_rgba(239,68,68,0.15)]"
          }
        `}
      >
        <div className="text-sm font-semibold text-foreground tracking-tight">
          {node.name}
        </div>
        <div className={`text-xs font-mono mt-1 ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
          {isProfit ? "+" : ""}${node.profitLoss.toFixed(2)}
        </div>
        {/* Glow ring */}
        <div
          className={`absolute inset-0 rounded-xl ${isProfit ? "bg-emerald-500/5" : "bg-red-500/5"} animate-pulse`}
          style={{ animationDuration: "3s" }}
        />
      </div>
      <div className="flex gap-3 text-[10px] text-muted-foreground">
        <span>
          In: <span className="text-emerald-400">${node.revenue.toFixed(2)}</span>
        </span>
        <span>
          Out: <span className="text-red-400">${node.spending.toFixed(2)}</span>
        </span>
      </div>
    </div>
  );
}

function FlowArrow({ value, index }: { value: number; index: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-w-[80px] animate-fade-up" style={{ animationDelay: `${index * 100 + 200}ms` }}>
      {/* Arrow line with animated dots */}
      <div className="relative w-full h-8 flex items-center">
        {/* Base line */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-emerald-500/60 via-sky-400/60 to-emerald-500/60" />
        {/* Animated flowing dots */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden h-[3px]">
          <div
            className="h-full w-full"
            style={{
              background: "repeating-linear-gradient(90deg, transparent, transparent 8px, #34d399 8px, #34d399 16px)",
              animation: "flow-slide 1.5s linear infinite",
            }}
          />
        </div>
        {/* Arrow head */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-emerald-400/80" />
      </div>
      {/* Amount label */}
      <div className="text-[11px] font-mono text-sky-300 mt-1 animate-flow-pulse">
        ${value.toFixed(2)}
      </div>
    </div>
  );
}

export function MoneyFlow({
  nodes,
  links,
}: {
  nodes: FlowNode[];
  links: FlowLink[];
}) {
  if (nodes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-12 text-center">
        No agent economy activity yet. Run the demo to see money flow between agents.
      </div>
    );
  }

  // Build a linear flow ordering using links
  // Find nodes that are only sources (start) vs only targets (end) vs both (middle)
  const sourceNodes = new Set(links.map((l) => l.from));
  const targetNodes = new Set(links.map((l) => l.to));

  const startNodes = nodes.filter(
    (n) => sourceNodes.has(n.name) && !targetNodes.has(n.name)
  );
  const middleNodes = nodes.filter(
    (n) => sourceNodes.has(n.name) && targetNodes.has(n.name)
  );
  const endNodes = nodes.filter(
    (n) => !sourceNodes.has(n.name) && targetNodes.has(n.name)
  );
  const isolatedNodes = nodes.filter(
    (n) => !sourceNodes.has(n.name) && !targetNodes.has(n.name)
  );

  // Build display order
  const orderedNodes = [...startNodes, ...middleNodes, ...endNodes, ...isolatedNodes];

  // For each consecutive pair in ordered nodes, find the connecting link
  const flowPairs: { from: FlowNode; to: FlowNode; value: number }[] = [];
  for (const link of links) {
    const fromNode = nodes.find((n) => n.name === link.from);
    const toNode = nodes.find((n) => n.name === link.to);
    if (fromNode && toNode) {
      flowPairs.push({ from: fromNode, to: toNode, value: link.value });
    }
  }

  // Group links by source for rendering
  const uniqueDisplayed = new Set<string>();
  const displayElements: React.ReactNode[] = [];

  if (flowPairs.length > 0) {
    // Render as a flow chain
    let idx = 0;
    for (const pair of flowPairs) {
      if (!uniqueDisplayed.has(pair.from.name)) {
        uniqueDisplayed.add(pair.from.name);
        displayElements.push(<AgentNode key={`node-${pair.from.name}`} node={pair.from} />);
      }
      displayElements.push(
        <FlowArrow key={`arrow-${idx}`} value={pair.value} index={idx} />
      );
      idx++;
      if (!uniqueDisplayed.has(pair.to.name)) {
        uniqueDisplayed.add(pair.to.name);
        displayElements.push(<AgentNode key={`node-${pair.to.name}`} node={pair.to} />);
      }
    }
  }

  // Add any isolated nodes (agents with no links)
  for (const node of isolatedNodes) {
    if (!uniqueDisplayed.has(node.name)) {
      displayElements.push(<AgentNode key={`node-${node.name}`} node={node} />);
    }
  }

  return (
    <div className="relative">
      {/* Background grid effect */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Flow container */}
      <div className="relative flex items-center justify-center gap-2 py-6 overflow-x-auto">
        {displayElements}
      </div>
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
    </div>
  );
}
