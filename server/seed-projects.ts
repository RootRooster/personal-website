import db from './db.js';

// Clear existing projects
db.exec('DELETE FROM projects');

const insertProject = db.prepare(`
  INSERT INTO projects (title, category, description, image, tags, link, featured, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const projects = [
  {
    title: 'Best Days',
    category: 'Web Application',
    description: 'A Next.js web application built for "Dnevi Znanosti" (Science Days) — an event showcase platform deployed on Vercel. Features a modern TypeScript stack with Tailwind CSS for responsive design and fast page loads.',
    image: '/uploads/proj-bestdays.jpg',
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'Vercel'],
    link: 'https://github.com/RootRooster/bestdays',
    featured: true,
    created_at: '2026-03-20T10:00:00.000Z',
  },
  {
    title: 'Bike Service Reservations',
    category: 'Full-Stack / Diploma',
    description: 'A Django web application for managing bicycle repair service bookings — built as a university diploma project. Features a complete reservation system with user accounts, service scheduling, and an admin dashboard.',
    image: '/uploads/proj-bike-service.jpg',
    tags: ['Python', 'Django', 'HTML', 'CSS'],
    link: 'https://github.com/RootRooster/diploma_spletna_aplikacija_za_rezervacijo_servisov_koles',
    featured: false,
    created_at: '2026-02-15T12:00:00.000Z',
  },
  {
    title: 'GooGoal',
    category: 'iOS Game',
    description: 'A Pong-inspired SpriteKit game for iOS written entirely in Swift. Features custom game assets, sound effects, music, and smooth physics-based gameplay built on Apple\'s native game framework.',
    image: '/uploads/proj-fri-goal.jpg',
    tags: ['Swift', 'SpriteKit', 'iOS', 'Game Dev'],
    link: 'https://github.com/RootRooster/fri_goal',
    featured: false,
    created_at: '2026-01-20T14:00:00.000Z',
  },
  {
    title: 'Dotfiles',
    category: 'Dev Environment',
    description: 'A portable development environment configuration managed with GNU Stow. Includes Neovim, Tmux, Kitty terminal, Zsh with Powerlevel10k, Aerospace window manager, and a curated set of CLI tools like zoxide, ripgrep, bat, and fzf.',
    image: '/uploads/proj-dotfiles.jpg',
    tags: ['Shell', 'Lua', 'Neovim', 'Tmux', 'Zsh'],
    link: 'https://github.com/RootRooster/dotfiles',
    featured: true,
    created_at: '2025-12-10T09:00:00.000Z',
  },
  {
    title: 'Aurora Corne Keyboard Firmware',
    category: 'Firmware / Hardware',
    description: 'Custom ZMK firmware configuration for the Aurora Corne split mechanical keyboard. Defines custom keymaps, layers, and macros for an optimized ergonomic typing experience compiled and flashed via GitHub Actions.',
    image: '/uploads/proj-corne.jpg',
    tags: ['ZMK', 'C', 'Firmware', 'Mechanical Keyboards'],
    link: 'https://github.com/RootRooster/zmk-config-aurora-corne',
    featured: false,
    created_at: '2025-11-05T11:00:00.000Z',
  },
  {
    title: 'HyperArch Dotfiles',
    category: 'Linux / Rice',
    description: 'A customized Arch Linux desktop configuration featuring Hyprland window manager, themed Zsh and Bash shells, GTK styling, and X11 tuning. A complete Linux rice from terminal colors to desktop compositor.',
    image: '/uploads/proj-hyperarch.jpg',
    tags: ['Shell', 'CSS', 'Hyprland', 'Arch Linux'],
    link: 'https://github.com/RootRooster/dotfiles-hyperarch',
    featured: false,
    created_at: '2025-10-01T08:00:00.000Z',
  },
  {
    title: 'Skin Cancer Image Classification',
    category: 'Machine Learning',
    description: 'A deep learning pipeline for classifying 7 types of skin lesions from the HAM10000 dataset (10,015 dermatoscopic images). Compares ResNet, EfficientNet, and Vision Transformer architectures with class-weighted loss functions and W&B experiment tracking.',
    image: '/uploads/proj-skin-cancer.jpg',
    tags: ['Python', 'PyTorch', 'ResNet', 'ViT', 'Medical AI'],
    link: 'https://github.com/RootRooster/Skin_Cancer_Image_Classification',
    featured: true,
    created_at: '2025-09-15T10:00:00.000Z',
  },
];

for (const p of projects) {
  insertProject.run(
    p.title, p.category, p.description, p.image,
    JSON.stringify(p.tags), p.link, p.featured ? 1 : 0, p.created_at
  );
  console.log(`  + "${p.title}" [${p.category}]`);
}

console.log(`\nDone — ${projects.length} projects imported.`);
