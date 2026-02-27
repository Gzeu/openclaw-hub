# 🎮 OpenClaw Hub

**The centralized discovery and management platform for OpenClaw AI agent projects**

OpenClaw Hub is your gateway to exploring, managing, and deploying projects built with the OpenClaw AI agent framework. Discover featured projects, browse by tags, and get started with the OpenClaw ecosystem.

## ✨ Features

- **📦 Project Discovery** - Browse all OpenClaw projects in one place
- **⭐ Featured Projects** - Highlighted showcase of exemplary implementations
- **📌 Pinned Projects** - Quick access to priority projects
- **🏷️ Tag-based Filtering** - Find projects by technology, category, or use case
- **🔍 Search** - Quick project search by name or description
- **🎨 Modern UI** - Clean, responsive design with dark mode
- **📊 Project Cards** - Rich metadata display with links and stats

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Gzeu/openclaw-hub.git
cd openclaw-hub

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Visit `http://localhost:3000` to see the hub in action.

## 📁 Project Structure

```
openclaw-hub/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main hub page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ProjectCard.tsx   # Project card component
│   ├── FilterBar.tsx     # Tag filtering
│   └── SearchBar.tsx     # Search functionality
├── lib/
│   └── projects.ts       # Project loading utilities
├── data/
│   └── projects/         # Project YAML files
│       ├── openclaw.yml
│       ├── agentpress.yml
│       └── ...
└── public/               # Static assets
```

## 📝 Adding Projects

Add new projects by creating YAML files in `data/projects/`:

```yaml
name: "My OpenClaw Project"
description: "Short project description"
repository: "https://github.com/username/project"
tags:
  - ai-agents
  - automation
featured: false
pinned: false
status: "active"
```

### Available Fields

- **name** (required) - Project name
- **description** (required) - Brief description
- **repository** (required) - GitHub repository URL
- **tags** (required) - Array of technology/category tags
- **homepage** (optional) - Live demo or documentation URL
- **npm** (optional) - NPM package URL
- **featured** (optional) - Show in featured section
- **pinned** (optional) - Pin to top of list
- **status** (optional) - `active`, `beta`, `archived`
- **version** (optional) - Current version
- **stars** (optional) - GitHub stars count
- **downloads** (optional) - NPM downloads

## 🏷️ Common Tags

- **Framework**: `ai-agents`, `automation`, `orchestration`
- **Technology**: `typescript`, `python`, `react`, `nextjs`
- **Category**: `web-apps`, `cli-tools`, `libraries`, `templates`
- **Use Case**: `content`, `data-analysis`, `blockchain`, `gaming`
- **Status**: `stable`, `beta`, `experimental`

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data**: YAML with gray-matter parsing
- **Deployment**: Vercel-ready

## 🤝 Contributing

Contributions are welcome! To add your OpenClaw project:

1. Fork this repository
2. Add your project YAML file to `data/projects/`
3. Submit a pull request

Ensure your project:
- Uses OpenClaw framework or integrates with the ecosystem
- Has clear documentation
- Follows the YAML structure above

## 📚 OpenClaw Ecosystem

- [OpenClaw](https://github.com/Gzeu/openclaw) - Core AI agent framework
- [AgentPress](https://github.com/Gzeu/agentpress) - Web platform for AI agents
- [OpenClaw CLI](https://github.com/Gzeu/openclaw-cli) - Command-line tools
- [OpenClaw Templates](https://github.com/Gzeu/openclaw-templates) - Project starters

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Gzeu/openclaw-hub)

### Manual Deployment

```bash
npm run build
npm start
```

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Repository**: [github.com/Gzeu/openclaw-hub](https://github.com/Gzeu/openclaw-hub)
- **Issues**: [Report a bug](https://github.com/Gzeu/openclaw-hub/issues)
- **Discussions**: [Join the community](https://github.com/Gzeu/openclaw-hub/discussions)

---

**Built with ❤️ for the OpenClaw community**
