#!/usr/bin/env node

/**
 * FoodLink Safety Admin Bootstrapping Script
 * 
 * Works with ANY email address you own (e.g. personal email, work email, or Google email).
 * 
 * Usage:
 *   node scripts/seed_admin.mjs <your_email> <path_to_serviceAccountKey.json> [optional_initial_password]
 * 
 * Examples:
 *   # Elevate an existing FoodLink user account (keeps existing password / Google login):
 *   node scripts/seed_admin.mjs myname@gmail.com ./serviceAccountKey.json
 * 
 *   # Or create a brand new admin account with a specified password:
 *   node scripts/seed_admin.mjs myname@gmail.com ./serviceAccountKey.json "MySecurePass123!"
 * 
 * What this script does:
 * 1. Connects to your live Firebase project using the service account key.
 * 2. Checks if an account for <your_email> already exists:
 *    - If YES: Elevates your existing account by granting the custom claim { admin: true }.
 *              Your existing password or Google sign-in credentials remain unchanged!
 *    - If NO:  Creates a new Firebase Auth account for <your_email>.
 *              If you provided a password argument, sets it; otherwise generates a secure
 *              one-time password setup link printed directly to your console.
 * 3. Updates Firestore /users/{uid} with role: 'admin' and verificationStatus: 'verified'.
 * 4. Reminds you to immediately delete the service account key from your computer.
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const email = process.argv[2] || process.env.ADMIN_EMAIL;
const keyPath = process.argv[3] || process.env.GOOGLE_APPLICATION_CREDENTIALS;
const initialPassword = process.argv[4] || null;

if (!email || !email.includes('@')) {
  console.error('\n\x1b[31mError: A valid email address is required.\x1b[0m');
  console.error('Usage: node scripts/seed_admin.mjs <your_email> <path_to_serviceAccountKey.json> [optional_password]\n');
  process.exit(1);
}

if (!keyPath || !fs.existsSync(keyPath)) {
  console.error(`\n\x1b[31mError: Service account key file not found at: ${keyPath || '(none provided)'}\x1b[0m`);
  console.error('Steps to obtain one:');
  console.error('1. Open Firebase Console -> Project Settings -> Service accounts tab');
  console.error('2. Click "Generate new private key" and download the JSON file');
  console.error('3. Run: node scripts/seed_admin.mjs ' + email + ' ./serviceAccountKey.json\n');
  process.exit(1);
}

// Initialize Firebase Admin SDK
try {
  const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(keyPath), 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log(`\n\x1b[32m✔ Authenticated with Firebase project: ${serviceAccount.project_id}\x1b[0m`);
} catch (err) {
  console.error('\x1b[31mFailed to parse service account JSON:\x1b[0m', err.message);
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

async function bootstrapAdmin() {
  console.log(`\nConfiguring Admin Privileges for: \x1b[36m${email}\x1b[0m...`);

  let userRecord;
  let isNewUser = false;

  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`\x1b[32m✔ Found existing user account with UID:\x1b[0m ${userRecord.uid}`);
    console.log('  (Your existing login password or Google Sign-In credentials will continue working)');
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      isNewUser = true;
      console.log(`Account does not exist yet. Creating new Firebase Auth account for: ${email}...`);

      const createPayload = {
        email,
        emailVerified: true,
        displayName: email.split('@')[0]
      };

      if (initialPassword) {
        createPayload.password = initialPassword;
      }

      userRecord = await auth.createUser(createPayload);
      console.log(`\x1b[32m✔ Created new Firebase Auth account with UID:\x1b[0m ${userRecord.uid}`);
    } else {
      throw err;
    }
  }

  // 1. Grant Firebase Auth Custom Claim: { admin: true }
  console.log('Granting Firebase Auth Custom Claim { admin: true }...');
  await auth.setCustomUserClaims(userRecord.uid, { admin: true });
  console.log('\x1b[32m✔ Custom claim { admin: true } granted.\x1b[0m');

  // 2. Set Firestore /users/{uid} document with role: 'admin' and verificationStatus: 'verified'
  console.log('Writing Firestore /users/' + userRecord.uid + ' profile...');
  const userRef = db.collection('users').doc(userRecord.uid);
  await userRef.set({
    uid: userRecord.uid,
    email: userRecord.email,
    displayName: userRecord.displayName || email.split('@')[0],
    role: 'admin',
    verificationStatus: 'verified',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  console.log('\x1b[32m✔ Firestore admin profile saved.\x1b[0m');

  // 3. Password handling for new accounts
  if (isNewUser) {
    if (initialPassword) {
      console.log(`\n\x1b[32mYour admin password was set to the provided password.\x1b[0m`);
    } else {
      try {
        const resetLink = await auth.generatePasswordResetLink(email);
        console.log('\n\x1b[33m[Set Your Admin Password]:\x1b[0m');
        console.log('Open this secure one-time link in your browser to choose your password:');
        console.log(`\x1b[36m${resetLink}\x1b[0m`);
      } catch (linkErr) {
        console.log('\n(You can use the "Forgot Password" link on the sign-in modal to set your password)');
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\x1b[32m🎉 Safety Admin account successfully bootstrapped!\x1b[0m');
  console.log('='.repeat(70));
  console.log(`Email:       ${email}`);
  console.log(`Role:        admin`);
  console.log(`Permissions: Approve / Reject recipient & donor verifications, review audit trail`);
  console.log('='.repeat(70));

  console.log('\n\x1b[31m⚠️  CRITICAL SECURITY STEP:\x1b[0m');
  console.log('Delete the downloaded serviceAccountKey.json immediately so it is never committed or leaked:');
  console.log(`  \x1b[33mRemove-Item "${keyPath}"\x1b[0m  (PowerShell)`);
  console.log(`  \x1b[33mrm "${keyPath}"\x1b[0m            (Bash/Mac/Linux)\n`);

  process.exit(0);
}

bootstrapAdmin().catch((err) => {
  console.error('\n\x1b[31m❌ Admin bootstrapping failed:\x1b[0m', err);
  process.exit(1);
});
