async function loop() {
  while (true) {
    try {
      await fetch("https://ecokit-admin.vercel.app/admin/login");
    } catch(e) {}
    await new Promise(r => setTimeout(r, 1000));
  }
}
loop();
