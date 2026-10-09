const { spawn } = require('child_process');

async function addEnv(name, value) {
  return new Promise((resolve, reject) => {
    const child = spawn('npx.cmd', ['vercel', 'env', 'add', name, 'production'], { shell: true });
    
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    child.stdin.write(value);
    child.stdin.end();
    
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Failed to add ${name}`));
    });
  });
}

async function run() {
  await addEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'AIzaSyCOe55g904w1NlbU8MZhHCTHcB3y8uFEmc');
  await addEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'ecok-ce349.firebaseapp.com');
  await addEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'ecok-ce349');
  await addEnv('NEXT_PUBLIC_FIREBASE_APP_ID', '1:401682953181:web:ffb13b7e96a6907c39bc34');
  await addEnv('FIREBASE_STORAGE_BUCKET', 'ecok-ce349.firebasestorage.app');
  console.log("Done");
}

run();
