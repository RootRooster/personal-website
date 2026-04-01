import db from './db.js';

// Clear existing data
db.exec('DELETE FROM projects; DELETE FROM blogs; DELETE FROM images;');

// ─── SEED PROJECTS ───────────────────────────────────────

const insertProject = db.prepare(`
  INSERT INTO projects (title, category, description, image, tags, link, featured, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const projects = [
  {
    title: 'Neural Canvas',
    category: 'AI / Creative Tools',
    description: 'An AI-powered generative art platform that turns natural language prompts into high-resolution digital artwork. Built with a custom diffusion pipeline and a sleek React frontend for real-time previewing and iteration.',
    image: 'https://images.unsplash.com/photo-1547954575-855750c57bd3?w=800',
    tags: ['Python', 'React', 'Stable Diffusion', 'WebSockets'],
    link: 'https://github.com',
    featured: true,
    created_at: '2026-03-15T10:00:00.000Z',
  },
  {
    title: 'Pulse Analytics',
    category: 'Data Engineering',
    description: 'Real-time analytics dashboard for monitoring application performance metrics. Ingests millions of events per minute through a Kafka pipeline and visualizes latency, throughput, and error rates.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    tags: ['TypeScript', 'Kafka', 'ClickHouse', 'D3.js'],
    link: 'https://github.com',
    featured: false,
    created_at: '2026-02-20T14:30:00.000Z',
  },
  {
    title: 'Vaultkey',
    category: 'Security / DevOps',
    description: 'A zero-knowledge secrets manager for development teams. Secrets are encrypted client-side before storage and can be shared across environments with granular RBAC policies.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    tags: ['Go', 'SQLite', 'AES-256', 'CLI'],
    link: 'https://github.com',
    featured: false,
    created_at: '2026-01-10T09:15:00.000Z',
  },
  {
    title: 'Terraform Autopilot',
    category: 'Infrastructure',
    description: 'An intelligent IaC assistant that reviews Terraform plans, detects drift, and suggests cost-optimized resource configurations using LLM-powered analysis of cloud provider pricing APIs.',
    image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fc9?w=800',
    tags: ['Terraform', 'Python', 'AWS', 'LLM'],
    link: null,
    featured: true,
    created_at: '2025-12-05T16:00:00.000Z',
  },
  {
    title: 'Refrakt UI',
    category: 'Design Systems',
    description: 'A glassmorphism-first React component library with 40+ accessible components, theme tokens inspired by Material Design 3, and built-in dark/light mode support.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    tags: ['React', 'TypeScript', 'Tailwind', 'Storybook'],
    link: 'https://github.com',
    featured: false,
    created_at: '2025-11-18T11:00:00.000Z',
  },
  {
    title: 'Synapse Mesh',
    category: 'Distributed Systems',
    description: 'A peer-to-peer service mesh for edge computing nodes. Provides automatic service discovery, load balancing, and encrypted inter-node communication without a central control plane.',
    image: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=800',
    tags: ['Rust', 'gRPC', 'mTLS', 'WASM'],
    link: null,
    featured: false,
    created_at: '2025-10-02T08:45:00.000Z',
  },
];

for (const p of projects) {
  insertProject.run(
    p.title, p.category, p.description, p.image,
    JSON.stringify(p.tags), p.link, p.featured ? 1 : 0, p.created_at
  );
}

// ─── SEED BLOGS ──────────────────────────────────────────

const insertBlog = db.prepare(`
  INSERT INTO blogs (title, excerpt, content, date, read_time, category, image_url, featured, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const blogs = [
  {
    title: 'The Architecture of Modern AI Agents',
    excerpt: 'Exploring how autonomous AI agents are designed — from memory systems and tool use to planning loops and self-correction.',
    content: `# The Architecture of Modern AI Agents

The rise of AI agents marks a shift from passive language models to systems that can **plan, act, and learn** in real time.

![A neural network visualization representing AI agent cognition](https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800)
*The inner workings of an AI agent resemble a feedback loop more than a simple pipeline.*

## What Makes an Agent?

An AI agent is fundamentally a loop:

1. **Perceive** — ingest context from the environment
2. **Plan** — decide what to do next
3. **Act** — execute a tool call or generate output
4. **Reflect** — evaluate the result and adjust

![Diagram of a cyclic process representing the agent loop](https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800)
*The perceive-plan-act-reflect cycle that drives every modern AI agent.*

## Memory Systems

Modern agents employ multiple memory layers:

- **Working memory**: the current conversation context
- **Episodic memory**: summaries of past interactions
- **Semantic memory**: structured knowledge graphs

## Tool Use

The ability to call external tools — search engines, code interpreters, APIs — transforms a language model from a text generator into a capable assistant.

\`\`\`python
def agent_loop(task):
    while not task.is_complete():
        observation = perceive(task)
        plan = think(observation)
        result = act(plan)
        task.update(result)
\`\`\`

![A developer working with multiple monitors and terminal windows](https://images.unsplash.com/photo-1607799279861-4dd421887fc9?w=800)
*Agents leverage the same tools developers use — terminals, APIs, and search engines.*

## The Road Ahead

We are still in the early innings. As planning becomes more robust and tools become more composable, agents will handle increasingly complex workflows — from code reviews to infrastructure management.

The key challenge remains **reliability**: an agent that works 95% of the time is fundamentally different from one that works 99.9% of the time.`,
    date: '2026-03-28T08:00:00.000Z',
    read_time: '7 MIN read',
    category: ['AI', 'Architecture'],
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    featured: true,
    created_at: '2026-03-28T08:00:00.000Z',
  },
  {
    title: 'Why SQLite Is the Most Deployed Database in the World',
    excerpt: 'SQLite powers everything from your phone to your browser. Here is why its simplicity is its greatest strength.',
    content: `# Why SQLite Is the Most Deployed Database in the World

There are over **one trillion** SQLite databases in active use today. It ships in every smartphone, every browser, and countless embedded devices.

![Close-up of a hard drive platter representing data storage](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800)
*SQLite stores your entire database in a single, portable file on disk.*

## The Philosophy

SQLite's creator, D. Richard Hipp, designed it with a radical premise: **a database should be as easy to use as fopen()**.

No server. No configuration. No DBA. Just a single file on disk.

## When to Use SQLite

- **Embedded applications** — mobile apps, desktop apps, IoT
- **Development & prototyping** — zero setup, instant feedback
- **Read-heavy workloads** — blazing fast reads with WAL mode
- **Edge computing** — databases that travel with the application

![A smartphone and tablet on a desk representing embedded devices](https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800)
*Every smartphone in your pocket runs dozens of SQLite databases right now.*

## When NOT to Use SQLite

- High write concurrency (thousands of concurrent writers)
- Multi-server deployments needing replication
- Datasets exceeding ~200GB (though it technically supports 281TB)

## Performance Tips

\`\`\`sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;  -- 64MB cache
\`\`\`

These three pragmas alone can improve write performance by 10-50x.

## The Future

Projects like **Litestream** (continuous replication), **LiteFS** (distributed SQLite), and **Turso** (edge SQLite) are pushing SQLite into territory once reserved for Postgres and MySQL.

![A server rack with glowing lights representing modern infrastructure](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800)
*SQLite is expanding from embedded use into edge and distributed computing.*

SQLite isn't a toy database. It's the most battle-tested database engine ever written.`,
    date: '2026-03-14T12:00:00.000Z',
    read_time: '5 MIN read',
    category: ['Databases', 'Backend'],
    image_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
    featured: false,
    created_at: '2026-03-14T12:00:00.000Z',
  },
  {
    title: 'Building a Design System from Scratch',
    excerpt: 'Lessons learned creating a production design system with React, Tailwind, and Storybook — including the mistakes that taught us the most.',
    content: `# Building a Design System from Scratch

After maintaining a sprawling CSS codebase across 6 products, we decided to build a unified design system. Here's what we learned.

![A palette of color swatches arranged in a grid](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800)
*Design tokens are the foundation — get the colors, spacing, and typography right first.*

## Start with Tokens, Not Components

The temptation is to jump straight into building a Button component. Resist it.

Design tokens — colors, spacing, typography scales, radii — are the **DNA** of your system. Get these right and components almost build themselves.

\`\`\`css
:root {
  --color-primary: #adc6ff;
  --color-surface: #1f1f1f;
  --radius-lg: 1.5rem;
  --space-4: 1rem;
}
\`\`\`

## The Component API Contract

Every component should answer:

1. **What props does it accept?**
2. **What variants does it support?**
3. **How does it compose with other components?**
4. **What accessibility requirements does it meet?**

![A wireframe sketch on paper next to a laptop showing the final UI](https://images.unsplash.com/photo-1581291518633-83b4eef1d2fa?w=800)
*Every component starts as a contract between designers and developers.*

## Lessons Learned

- **Don't abstract too early.** Build the same component three times before extracting a pattern.
- **Accessibility is not optional.** Bake ARIA roles, keyboard navigation, and focus management in from day one.
- **Document with real examples.** Storybook stories should show real use cases, not contrived demos.
- **Version ruthlessly.** Breaking changes need a migration guide, not just a changelog entry.

![A Storybook interface showing component documentation](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800)
*Storybook became our single source of truth for component documentation.*

## Results

After 6 months:
- 40+ components shipped
- 3 products migrated
- CSS bundle size reduced by 62%
- Designer-developer handoff time cut in half`,
    date: '2026-02-18T10:00:00.000Z',
    read_time: '6 MIN read',
    category: ['Design', 'Frontend'],
    image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    featured: false,
    created_at: '2026-02-18T10:00:00.000Z',
  },
  {
    title: 'Zero-Downtime Deployments with Blue-Green and Canary Strategies',
    excerpt: 'A practical guide to deploying without fear — covering blue-green, canary, and rolling deployments with real configuration examples.',
    content: `# Zero-Downtime Deployments

Nothing kills user trust faster than downtime. Here's how to deploy confidently.

![A control room with monitoring dashboards](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800)
*Modern deployment strategies are all about maintaining uptime while shipping fast.*

## Blue-Green Deployments

Maintain two identical environments:

- **Blue** — the current live environment
- **Green** — the new version being deployed

Once Green passes health checks, swap the load balancer. Rollback is instant: just swap back.

![Two parallel server environments illustrated side by side](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800)
*Blue-green: two identical environments, one live, one staged for the next release.*

## Canary Deployments

Route a small percentage of traffic to the new version:

\`\`\`yaml
# Kubernetes canary with Istio
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
spec:
  http:
  - route:
    - destination:
        host: my-app
        subset: stable
      weight: 95
    - destination:
        host: my-app
        subset: canary
      weight: 5
\`\`\`

Monitor error rates and latency. If the canary looks healthy, gradually increase traffic.

## Rolling Deployments

Replace instances one at a time. Simple but slower. Best for stateless services.

## Key Metrics to Watch

- **Error rate** — any spike after deploy is a red flag
- **P99 latency** — catches tail latency regressions
- **CPU/Memory** — new code might have different resource profiles

![A Grafana-style metrics dashboard showing latency and error rates](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800)
*If your dashboard looks like this after a deploy, something went wrong.*

## The Golden Rule

If you can't deploy on a Friday afternoon without anxiety, your deployment pipeline needs work.`,
    date: '2026-01-25T14:00:00.000Z',
    read_time: '8 MIN read',
    category: ['DevOps', 'Infrastructure'],
    image_url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
    featured: false,
    created_at: '2026-01-25T14:00:00.000Z',
  },
  {
    title: 'Rust for TypeScript Developers: A Practical Introduction',
    excerpt: 'Coming from TypeScript? Here is how Rust concepts map to what you already know — and where they diverge in powerful ways.',
    content: `# Rust for TypeScript Developers

If you're a TypeScript developer curious about Rust, you're in good company. Many of the concepts translate directly.

![The Rust programming language logo on a dark background](https://images.unsplash.com/photo-1623479322729-28b25c16b011?w=800)
*Rust: where the compiler is your strictest code reviewer.*

## Types You Already Know

| TypeScript | Rust |
|-----------|------|
| \`string\` | \`String\` / \`&str\` |
| \`number\` | \`i32\`, \`f64\`, etc. |
| \`boolean\` | \`bool\` |
| \`T | null\` | \`Option<T>\` |
| \`T | Error\` | \`Result<T, E>\` |

## The Ownership Model

This is where Rust diverges. Every value has exactly **one owner**:

\`\`\`rust
let name = String::from("hello");
let greeting = name; // ownership moves to greeting
// println!("{}", name); // ERROR: name is no longer valid
\`\`\`

Think of it like TypeScript's \`const\` but enforced at compile time for memory safety.

![A diagram showing memory allocation and deallocation](https://images.unsplash.com/photo-1545987796-200677ee1011?w=800)
*Ownership in Rust guarantees memory safety without a garbage collector.*

## Error Handling

No \`try/catch\`. Instead, Rust uses \`Result<T, E>\`:

\`\`\`rust
fn read_file(path: &str) -> Result<String, io::Error> {
    fs::read_to_string(path)
}

match read_file("config.toml") {
    Ok(content) => println!("{}", content),
    Err(e) => eprintln!("Failed: {}", e),
}
\`\`\`

## When to Choose Rust

- **Performance-critical paths** — CLIs, parsers, WASM modules
- **Systems programming** — when you need control over memory
- **Reliability** — if it compiles, it probably works

![A terminal window showing a successful cargo build output](https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800)
*That satisfying moment when \`cargo build\` compiles with zero warnings.*

The learning curve is real, but the payoff is code that is simultaneously fast, safe, and correct.`,
    date: '2025-12-10T09:00:00.000Z',
    read_time: '6 MIN read',
    category: ['Rust', 'Programming'],
    image_url: 'https://images.unsplash.com/photo-1623479322729-28b25c16b011?w=800',
    featured: false,
    created_at: '2025-12-10T09:00:00.000Z',
  },
];

for (const b of blogs) {
  insertBlog.run(
    b.title, b.excerpt, b.content, b.date, b.read_time,
    JSON.stringify(b.category), b.image_url, b.featured ? 1 : 0, b.created_at
  );
}

// ─── SEED IMAGES ─────────────────────────────────────────

const insertImage = db.prepare(`
  INSERT INTO images (url, name, created_at) VALUES (?, ?, ?)
`);

const images = [
  { url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', name: 'ai-agents-hero.jpg', created_at: '2026-03-28T08:00:00.000Z' },
  { url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800', name: 'sqlite-databases.jpg', created_at: '2026-03-14T12:00:00.000Z' },
  { url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800', name: 'design-system.jpg', created_at: '2026-02-18T10:00:00.000Z' },
  { url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800', name: 'deployments.jpg', created_at: '2026-01-25T14:00:00.000Z' },
  { url: 'https://images.unsplash.com/photo-1623479322729-28b25c16b011?w=800', name: 'rust-code.jpg', created_at: '2025-12-10T09:00:00.000Z' },
];

for (const img of images) {
  insertImage.run(img.url, img.name, img.created_at);
}

console.log('Database seeded successfully!');
console.log(`  - ${projects.length} projects`);
console.log(`  - ${blogs.length} blog posts`);
console.log(`  - ${images.length} images`);
