import db from './db.js';
import { hashPassword } from './auth.js';

const [,, action, username, password] = process.argv;
const flags = process.argv.slice(2);
const isAdmin = flags.includes('--admin');

if (!action || (action !== 'list' && !username)) {
  console.log(`Usage:
  npx tsx server/manage-user.ts create <username> <password> [--admin]
  npx tsx server/manage-user.ts reset  <username> <password>
  npx tsx server/manage-user.ts promote <username>
  npx tsx server/manage-user.ts delete <username>
  npx tsx server/manage-user.ts list`);
  process.exit(1);
}

switch (action) {
  case 'create': {
    if (!password) { console.error('Password required'); process.exit(1); }
    const hash = hashPassword(password);
    try {
      db.prepare('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)').run(username, hash, isAdmin ? 1 : 0);
      console.log(`User "${username}" created${isAdmin ? ' (admin)' : ''}.`);
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.error(`User "${username}" already exists. Use "reset" to change the password.`);
      } else throw err;
    }
    break;
  }
  case 'reset': {
    if (!password) { console.error('Password required'); process.exit(1); }
    const hash = hashPassword(password);
    const result = db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hash, username);
    if (result.changes === 0) console.error(`User "${username}" not found.`);
    else console.log(`Password for "${username}" updated.`);
    break;
  }
  case 'promote': {
    const result = db.prepare('UPDATE users SET is_admin = 1 WHERE username = ?').run(username);
    if (result.changes === 0) console.error(`User "${username}" not found.`);
    else console.log(`"${username}" is now an admin.`);
    break;
  }
  case 'delete': {
    const result = db.prepare('DELETE FROM users WHERE username = ?').run(username);
    if (result.changes === 0) console.error(`User "${username}" not found.`);
    else console.log(`User "${username}" deleted.`);
    break;
  }
  case 'list': {
    const users = db.prepare('SELECT id, username, is_admin, created_at FROM users').all();
    if (users.length === 0) console.log('No users found.');
    else console.table(users);
    break;
  }
  default:
    console.error(`Unknown action: ${action}`);
    process.exit(1);
}
