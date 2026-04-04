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

function AgentNode({ node, index }: { node: FlowNode; index: number }) {
  const isProfit = node.profitLoss >= 0;
  return (
    <div
      className="relative flex flex-col items-center gap-2 animate-fade-up"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div
        className={`
          relative px-5 py-4 rounded-xl border backdrop-blur-sm min-w-[100px] sm:min-w-[120px] text-center
          transition-all duration-300 hover:scale-[1.03]
          ${isProfit
            ? "border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_32px_rgba(16,185,129,0.2)]"
            : "border-red-500/40 bg-red-500/10 shadow-[0_0_32px_rgba(239,68,68,0.2)]"
          }
        `}
      >
        <div className="text-sm font-semibold text-foreground tracking-tight">
          {node.name}
        </div>
        <div className={`text-xs font-mono mt-1.5 ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
          {isProfit ? "+" : ""}${node.profitLoss.toFixed(2)}
        </div>
        {/* Glow ring */}
        <div
          className={`absolute inset-0 rounded-xl ${isProfit ? "bg-emerald-500/5" : "bg-red-500/5"} animate-pulse`}
          style={{ animationDuration: "3s" }}
        />
        {/* Gradient overlay on top edge */}
        <div
          className={`absolute inset-x-0 top-0 h-px rounded-t-xl ${isProfit ? "bg-emerald-400/40" : "bg-red-400/40"}`}
        />
      </div>
      <div className="flex gap-4 text-[10px] text-muted-foreground">
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
    <div
      className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[96px] animate-fade-up"
      style={{ animationDelay: `${index * 120 + 60}ms` }}
    >
      {/* Arrow line with animated dots and gradient glow */}
      <div className="relative w-full h-10 flex items-center">
        {/* Glow behind the arrow */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 blur-sm" />
        {/* Base line */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-emerald-500/40 via-sky-400/70 to-emerald-500/40" />
        {/* Animated flowing dots */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden h-[3px]">
          <div
            className="h-full w-full"
            style={{
              background: "repeating-linear-gradient(90deg, transparent, transparent 6px, #34d399 6px, #34d399 12px)",
              animation: "flow-slide 1.2s linear infinite",
            }}
          />
        </div>
        {/* Arrow head */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-emerald-400" />
      </div>
      {/* Amount label */}
      <div className="text-[11px] font-mono text-sky-300 mt-0.5 animate-flow-pulse">
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

  const orderedNodes = [...startNodes, ...middleNodes, ...endNodes, ...isolatedNodes];

  const flowPairs: { from: FlowNode; to: FlowNode; value: number }[] = [];
  for (const link of links) {
    const fromNode = nodes.find((n) => n.name === link.from);
    const toNode = nodes.find((n) => n.name === link.to);
    if (fromNode && toNode) {
      flowPairs.push({ from: fromNode, to: toNode, value: link.value });
    }
  }

  const uniqueDisplayed = new Set<string>();
  const displayElements: React.ReactNode[] = [];
  let nodeIdx = 0;

  if (flowPairs.length > 0) {
    let arrowIdx = 0;
    for (const pair of flowPairs) {
      if (!uniqueDisplayed.has(pair.from.name)) {
        uniqueDisplayed.add(pair.from.name);
        displayElements.push(
          <AgentNode key={`node-${pair.from.name}`} node={pair.from} index={nodeIdx} />
        );
        nodeIdx++;
      }
      displayElements.push(
        <FlowArrow key={`arrow-${arrowIdx}`} value={pair.value} index={arrowIdx} />
      );
      arrowIdx++;
      if (!uniqueDisplayed.has(pair.to.name)) {
        uniqueDisplayed.add(pair.to.name);
        displayElements.push(
          <AgentNode key={`node-${pair.to.name}`} node={pair.to} index={nodeIdx} />
        );
        nodeIdx++;
      }
    }
  }

  for (const node of isolatedNodes) {
    if (!uniqueDisplayed.has(node.name)) {
      displayElements.push(
        <AgentNode key={`node-${node.name}`} node={node} index={nodeIdx} />
      );
      nodeIdx++;
    }
  }

  return (
    <div className="relative">
      {/* Background radial gradient */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 50%, #34d399 0%, transparent 70%)",
        }}
      />
      {/* Background dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Pipeline background line connecting all nodes */}
      <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      {/* Flow container */}
      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2 py-8 overflow-x-auto">
        {displayElements}
      </div>
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
    </div>
  );
}
