// Simple script to create an admin account directly
const crypto = require('crypto')

const adminData = {
  name: 'Emmanuel',
  email: 'admin@qmenu.com',
  password: 'admin123'
}

// Hash the password using the same method as in lib/password.ts
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex')
  return `${salt}:${hash}`
}

const passwordHash = hashPassword(adminData.password)

console.log('Admin Account Creation')
console.log('======================')
console.log(`Name: ${adminData.name}`)
console.log(`Email: ${adminData.email}`)
console.log(`Password Hash: ${passwordHash}`)
console.log('')
console.log('SQL to insert manually into database:')
console.log(`INSERT INTO admin_accounts (email, "passwordHash", name) VALUES ('${adminData.email}', '${passwordHash}', '${adminData.name}');`)
