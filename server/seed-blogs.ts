import fs from 'fs';
import path from 'path';
import db from './db.js';

// Clear existing blogs
db.exec('DELETE FROM blogs');

const insertBlog = db.prepare(`
  INSERT INTO blogs (title, excerpt, content, date, read_time, category, image_url, featured, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

function readTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  return `${Math.ceil(words / 200)} MIN read`;
}

import os from 'os';
const downloadsDir = path.join(os.homedir(), 'Downloads');

const blogs = [
  {
    file: 'Apple_Development_Deep_Dive.md',
    title: 'The Complete Guide to Apple App Development',
    excerpt: 'From zero to senior engineer — architecture, execution, and the rendering pipeline. Understanding every layer from SwiftUI down to Apple Silicon GPU.',
    category: ['Apple', 'iOS', 'Swift'],
    image_url: '/uploads/blog-apple-dev.jpg',
    featured: true,
    date: '2026-03-25T10:00:00.000Z',
  },
  {
    file: 'Apple_Framework_History.md',
    title: 'The Complete History of Apple\'s Developer Frameworks',
    excerpt: 'From NeXT to visionOS — every major framework introduction, what it fixed, and why it existed. The full lineage from Objective-C in 1988 to Swift 6 concurrency.',
    category: ['Apple', 'History', 'Frameworks'],
    image_url: '/uploads/blog-apple-history.jpg',
    featured: false,
    date: '2026-03-18T14:00:00.000Z',
  },
  {
    file: 'Unix_LowLevel_Deep_Dive.md',
    title: 'The Complete Guide to Unix & Low-Level Computer Science',
    excerpt: 'Processes, threads, memory, buffers, and everything underneath. From transistors and binary up to the Unix abstractions that power every modern operating system.',
    category: ['Unix', 'Systems', 'Low-Level'],
    image_url: '/uploads/blog-unix.jpg',
    featured: false,
    date: '2026-03-10T09:00:00.000Z',
  },
];

for (const blog of blogs) {
  const filePath = path.join(downloadsDir, blog.file);
  const content = fs.readFileSync(filePath, 'utf-8');

  insertBlog.run(
    blog.title,
    blog.excerpt,
    content,
    blog.date,
    readTime(content),
    JSON.stringify(blog.category),
    blog.image_url,
    blog.featured ? 1 : 0,
    blog.date,
  );

  console.log(`  + "${blog.title}" (${readTime(content)})`);
}

console.log(`\nDone — ${blogs.length} blog posts imported.`);
